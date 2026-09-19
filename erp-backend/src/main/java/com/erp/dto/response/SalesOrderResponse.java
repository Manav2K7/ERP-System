package com.erp.dto.response;

import com.erp.model.enums.SalesOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderResponse {
    
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private LocalDateTime orderDate;
    private SalesOrderStatus status;
    private BigDecimal totalAmount;
    private List<SalesOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
