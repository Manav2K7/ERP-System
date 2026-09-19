package com.erp.controller;

import com.erp.dto.response.*;
import com.erp.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard and reporting endpoints")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    @Operation(summary = "Get dashboard summary with key metrics")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        DashboardSummaryResponse response = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sales-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EXECUTIVE', 'ACCOUNTANT')")
    @Operation(summary = "Get sales summary with date range filtering")
    public ResponseEntity<SalesSummaryResponse> getSalesSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        SalesSummaryResponse response = dashboardService.getSalesSummary(startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/purchase-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASE_MANAGER', 'ACCOUNTANT')")
    @Operation(summary = "Get purchase summary with date range filtering")
    public ResponseEntity<PurchaseSummaryResponse> getPurchaseSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        PurchaseSummaryResponse response = dashboardService.getPurchaseSummary(startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stock-alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get low stock alerts")
    public ResponseEntity<List<StockAlertResponse>> getStockAlerts() {
        List<StockAlertResponse> response = dashboardService.getStockAlerts();
        return ResponseEntity.ok(response);
    }
}
