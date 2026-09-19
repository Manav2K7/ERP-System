package com.erp.controller;

import com.erp.dto.request.PurchaseOrderRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PurchaseOrderResponse;
import com.erp.model.enums.PurchaseOrderStatus;
import com.erp.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Purchase order management endpoints")
public class PurchaseOrderController {
    
    private final PurchaseOrderService purchaseOrderService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER')")
    @Operation(summary = "Create a new purchase order")
    public ResponseEntity<PurchaseOrderResponse> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.createPurchaseOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get purchase order by ID")
    public ResponseEntity<PurchaseOrderResponse> getPurchaseOrderById(@PathVariable Long id) {
        PurchaseOrderResponse response = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get all purchase orders with pagination and search")
    public ResponseEntity<PagedResponse<PurchaseOrderResponse>> getAllPurchaseOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PagedResponse<PurchaseOrderResponse> response = purchaseOrderService.getAllPurchaseOrders(page, size, keyword);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get purchase orders by status")
    public ResponseEntity<PagedResponse<PurchaseOrderResponse>> getPurchaseOrdersByStatus(
            @PathVariable PurchaseOrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PurchaseOrderResponse> response = purchaseOrderService.getPurchaseOrdersByStatus(status, page, size);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER')")
    @Operation(summary = "Update purchase order status")
    public ResponseEntity<PurchaseOrderResponse> updatePurchaseOrderStatus(
            @PathVariable Long id,
            @RequestParam PurchaseOrderStatus status) {
        PurchaseOrderResponse response = purchaseOrderService.updatePurchaseOrderStatus(id, status);
        return ResponseEntity.ok(response);
    }
}
