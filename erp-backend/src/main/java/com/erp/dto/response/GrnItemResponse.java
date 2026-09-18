package com.erp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrnItemResponse {
    
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantityReceived;
}
