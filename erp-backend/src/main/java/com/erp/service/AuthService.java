package com.erp.service;

import com.erp.dto.request.ChangePasswordRequest;
import com.erp.dto.request.LoginRequest;
import com.erp.dto.request.RegisterRequest;
import com.erp.dto.response.AuthResponse;

public interface AuthService {
    
    AuthResponse register(RegisterRequest request);
    
    AuthResponse login(LoginRequest request);
    
    void changePassword(String email, ChangePasswordRequest request);
}
