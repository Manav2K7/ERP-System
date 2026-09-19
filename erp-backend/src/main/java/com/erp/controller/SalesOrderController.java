package com.erp.controller;

import com.erp.dto.request.SalesOrderRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.SalesOrderResponse;
import com.erp.model.enums.SalesOrderStatus;
import com.erp.service.SalesOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales-orders")
@RequiredArgsConstructor
@Tag(name = "Sales Orders", description = "Sales order management endpoints")
public class SalesOrderController {
    
    private final SalesOrderService salesOrderService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE')")
    @Operation(summary = "Create a new sales order")
    public ResponseEntity<SalesOrderResponse> createSalesOrder(@Valid @RequestBody SalesOrderRequest request) {
        SalesOrderResponse response = salesOrderService.createSalesOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get sales order by ID")
    public ResponseEntity<SalesOrderResponse> getSalesOrderById(@PathVariable Long id) {
        SalesOrderResponse response = salesOrderService.getSalesOrderById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get all sales orders with pagination and search")
    public ResponseEntity<PagedResponse<SalesOrderResponse>> getAllSalesOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PagedResponse<SalesOrderResponse> response = salesOrderService.getAllSalesOrders(page, size, keyword);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get sales orders by status")
    public ResponseEntity<PagedResponse<SalesOrderResponse>> getSalesOrdersByStatus(
            @PathVariable SalesOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<SalesOrderResponse> response = salesOrderService.getSalesOrdersByStatus(status, page, size);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE')")
    @Operation(summary = "Update sales order status")
    public ResponseEntity<SalesOrderResponse> updateSalesOrderStatus(
            @PathVariable Long id,
            @RequestParam SalesOrderStatus status) {
        SalesOrderResponse response = salesOrderService.updateSalesOrderStatus(id, status);
        return ResponseEntity.ok(response);
    }
}
