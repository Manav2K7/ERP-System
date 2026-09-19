package com.erp.controller;

import com.erp.dto.response.UserResponse;
import com.erp.model.User;
import com.erp.repository.UserRepository;
import com.erp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Current user profile endpoints")
public class UserProfileController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get current user profile", description = "Returns profile of authenticated user")
    public ResponseEntity<UserResponse> getCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.erp.exception.ResourceNotFoundException(
                        "User", "email", userDetails.getUsername()));

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
        return ResponseEntity.ok(response);
    }
}
