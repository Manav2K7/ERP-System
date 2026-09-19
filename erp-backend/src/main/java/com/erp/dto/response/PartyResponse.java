package com.erp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyResponse {
    
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String gstin;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
