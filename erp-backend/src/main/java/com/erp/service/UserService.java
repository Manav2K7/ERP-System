package com.erp.service;

import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.UserResponse;
import com.erp.model.enums.Role;

public interface UserService {
    
    PagedResponse<UserResponse> getAllUsers(int page, int size, String keyword);
    
    UserResponse getUserById(Long id);
    
    PagedResponse<UserResponse> getUsersByRole(Role role, int page, int size);
    
    UserResponse updateUserRole(Long id, Role newRole);
    
    UserResponse toggleUserStatus(Long id);
    
    void deleteUser(Long id);
}
