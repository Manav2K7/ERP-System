package com.erp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    
    // Sales Summary
    private BigDecimal totalSalesThisMonth;
    private BigDecimal totalSalesThisYear;
    private Long totalSalesOrdersThisMonth;
    
    // Purchase Summary
    private BigDecimal totalPurchasesThisMonth;
    private BigDecimal totalPurchasesThisYear;
    private Long totalPurchaseOrdersThisMonth;
    
    // Inventory Summary
    private Long totalProducts;
    private Long lowStockProducts;
    private Long outOfStockProducts;
    
    // Invoice Summary
    private Long totalInvoices;
    private Long pendingInvoices;
    private BigDecimal pendingInvoiceAmount;
    private BigDecimal collectedInvoiceAmount;
    
    // Top Products
    private List<TopProductResponse> topSellingProducts;
    
    // Recent Activity
    private List<RecentOrderResponse> recentSalesOrders;
    private List<RecentOrderResponse> recentPurchaseOrders;
}
