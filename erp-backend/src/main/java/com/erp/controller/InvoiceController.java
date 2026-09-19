package com.erp.controller;

import com.erp.dto.response.InvoiceResponse;
import com.erp.dto.response.PagedResponse;
import com.erp.model.enums.InvoiceStatus;
import com.erp.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice management and PDF generation endpoints")
public class InvoiceController {
    
    private final InvoiceService invoiceService;
    
    @PostMapping("/generate/{salesOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Generate invoice from approved sales order")
    public ResponseEntity<InvoiceResponse> generateInvoice(@PathVariable Long salesOrderId) {
        InvoiceResponse response = invoiceService.generateInvoiceFromSalesOrder(salesOrderId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sales-order/{salesOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get invoice by sales order ID")
    public ResponseEntity<InvoiceResponse> getInvoiceBySalesOrderId(@PathVariable Long salesOrderId) {
        InvoiceResponse response = invoiceService.getInvoiceBySalesOrderId(salesOrderId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get all invoices with pagination and search")
    public ResponseEntity<PagedResponse<InvoiceResponse>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PagedResponse<InvoiceResponse> response = invoiceService.getAllInvoices(page, size, keyword);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get invoices by status")
    public ResponseEntity<PagedResponse<InvoiceResponse>> getInvoicesByStatus(
            @PathVariable InvoiceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<InvoiceResponse> response = invoiceService.getInvoicesByStatus(status, page, size);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    @Operation(summary = "Update invoice status")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam InvoiceStatus status) {
        InvoiceResponse response = invoiceService.updateInvoiceStatus(id, status);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Download invoice PDF")
    public ResponseEntity<ByteArrayResource> downloadInvoicePdf(@PathVariable Long id) {
        byte[] pdfBytes = invoiceService.downloadInvoicePdf(id);
        
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }
}
