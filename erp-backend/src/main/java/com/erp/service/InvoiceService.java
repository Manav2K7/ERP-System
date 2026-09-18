package com.erp.service;

import com.erp.dto.response.InvoiceResponse;
import com.erp.dto.response.PagedResponse;
import com.erp.model.enums.InvoiceStatus;

public interface InvoiceService {
    
    InvoiceResponse generateInvoiceFromSalesOrder(Long salesOrderId);
    
    InvoiceResponse getInvoiceById(Long id);
    
    InvoiceResponse getInvoiceBySalesOrderId(Long salesOrderId);
    
    PagedResponse<InvoiceResponse> getAllInvoices(int page, int size, String keyword);
    
    PagedResponse<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status, int page, int size);
    
    InvoiceResponse updateInvoiceStatus(Long id, InvoiceStatus newStatus);
    
    byte[] downloadInvoicePdf(Long id);
}
