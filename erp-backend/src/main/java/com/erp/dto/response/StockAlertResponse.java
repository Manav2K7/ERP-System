package com.erp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAlertResponse {
    
    private Long productId;
    private String productName;
    private String productSku;
    private Integer currentStock;
    private Integer reorderLevel;
    private String alertLevel; // LOW, CRITICAL, OUT_OF_STOCK
}
