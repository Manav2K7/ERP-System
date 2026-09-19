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
public class GrnRequest {
    
    @NotNull(message = "Purchase Order ID is required")
    private Long purchaseOrderId;
    
    @NotNull(message = "Received date is required")
    private LocalDate receivedDate;
    
    private String remarks;
    
    @NotEmpty(message = "GRN items are required")
    @Valid
    private List<GrnItemRequest> items;
}
