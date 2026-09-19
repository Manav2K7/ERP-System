package com.erp.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {
    
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;
    
    @NotNull(message = "Expected delivery date is required")
    private LocalDate expectedDeliveryDate;
    
    @NotEmpty(message = "Order items are required")
    @Valid
    private List<PurchaseOrderItemRequest> items;
}
