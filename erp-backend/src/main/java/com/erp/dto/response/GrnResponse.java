package com.erp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrnResponse {
    
    private Long id;
    private Long purchaseOrderId;
    private String supplierName;
    private LocalDate receivedDate;
    private String remarks;
    private List<GrnItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
