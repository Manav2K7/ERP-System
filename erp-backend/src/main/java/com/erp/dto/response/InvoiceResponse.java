package com.erp.dto.response;

import com.erp.model.enums.InvoiceStatus;
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
public class InvoiceResponse {
    
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerGstin;
    private Long salesOrderId;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalPayable;
    private InvoiceStatus status;
    private LocalDateTime invoiceDate;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;
}
