package com.erp.dto.response;

import com.erp.model.enums.PurchaseOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    
    private Long id;
    private Long supplierId;
    private String supplierName;
    private String supplierEmail;
    private LocalDate expectedDeliveryDate;
    private PurchaseOrderStatus status;
    private BigDecimal totalAmount;
    private List<PurchaseOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
