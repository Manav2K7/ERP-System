package com.erp.controller;

import com.erp.dto.request.GrnRequest;
import com.erp.dto.response.GrnResponse;
import com.erp.dto.response.PagedResponse;
import com.erp.service.GrnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grns")
@RequiredArgsConstructor
@Tag(name = "GRN", description = "Goods Receipt Note endpoints")
public class GrnController {
    
    private final GrnService grnService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'INVENTORY_MANAGER')")
    @Operation(summary = "Create a new GRN (updates stock)")
    public ResponseEntity<GrnResponse> createGrn(@Valid @RequestBody GrnRequest request) {
        GrnResponse response = grnService.createGrn(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get GRN by ID")
    public ResponseEntity<GrnResponse> getGrnById(@PathVariable Long id) {
        GrnResponse response = grnService.getGrnById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get all GRNs with pagination and search")
    public ResponseEntity<PagedResponse<GrnResponse>> getAllGrns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PagedResponse<GrnResponse> response = grnService.getAllGrns(page, size, keyword);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/purchase-order/{purchaseOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get GRNs by purchase order ID")
    public ResponseEntity<PagedResponse<GrnResponse>> getGrnsByPurchaseOrderId(
            @PathVariable Long purchaseOrderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<GrnResponse> response = grnService.getGrnsByPurchaseOrderId(purchaseOrderId, page, size);
        return ResponseEntity.ok(response);
    }
}
