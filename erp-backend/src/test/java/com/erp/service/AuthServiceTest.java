package com.erp.service;

import com.erp.dto.request.LoginRequest;
import com.erp.dto.request.RegisterRequest;
import com.erp.dto.response.AuthResponse;
import com.erp.exception.DuplicateResourceException;
import com.erp.model.User;
import com.erp.model.enums.Role;
import com.erp.repository.UserRepository;
import com.erp.security.JwtUtil;
import com.erp.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtUtil jwtUtil;
    
    @Mock
    private AuthenticationManager authenticationManager;
    
    @InjectMocks
    private AuthServiceImpl authService;
    
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;
    
    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .fullName("Test User")
                .email("test@example.com")
                .password("password123")
                .role(Role.ROLE_ADMIN)
                .build();
        
        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
        
        user = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
    }
    
    @Test
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");
        
        AuthResponse response = authService.register(registerRequest);
        
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("jwt-token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }
    
    @Test
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);
        
        assertThrows(DuplicateResourceException.class, () -> {
            authService.register(registerRequest);
        });
        
        verify(userRepository, never()).save(any(User.class));
    }
    
    @Test
    void login_Success() {
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");
        
        AuthResponse response = authService.login(loginRequest);
        
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("jwt-token", response.getToken());
    }
    
    @Test
    void login_InvalidCredentials_ThrowsException() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid"));
        
        assertThrows(org.springframework.security.authentication.BadCredentialsException.class, () -> {
            authService.login(loginRequest);
        });
    }
}
