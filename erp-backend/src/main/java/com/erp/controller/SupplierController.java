package com.erp.controller;

import com.erp.dto.request.PartyRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PartyResponse;
import com.erp.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Supplier management endpoints")
public class SupplierController {
    
    private final SupplierService supplierService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER')")
    @Operation(summary = "Create a new supplier")
    public ResponseEntity<PartyResponse> createSupplier(@Valid @RequestBody PartyRequest request) {
        PartyResponse response = supplierService.createSupplier(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<PartyResponse> getSupplierById(@PathVariable Long id) {
        PartyResponse response = supplierService.getSupplierById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get all suppliers with pagination and search")
    public ResponseEntity<PagedResponse<PartyResponse>> getAllSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        PagedResponse<PartyResponse> response = supplierService.getAllSuppliers(page, size, keyword);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER')")
    @Operation(summary = "Update a supplier")
    public ResponseEntity<PartyResponse> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody PartyRequest request) {
        PartyResponse response = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a supplier (soft delete)")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
