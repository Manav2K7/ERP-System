package com.erp.service.impl;

import com.erp.dto.response.*;
import com.erp.model.Product;
import com.erp.model.SalesOrder;
import com.erp.model.SalesOrderItem;
import com.erp.model.enums.SalesOrderStatus;
import com.erp.repository.*;
import com.erp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    
    private final ProductRepository productRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;
    
    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth currentYear = YearMonth.of(LocalDate.now().getYear(), 1);
        
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(LocalTime.MAX);
        LocalDateTime yearStart = currentYear.atDay(1).atStartOfDay();
        
        // Sales Summary
        BigDecimal totalSalesThisMonth = salesOrderRepository.sumTotalAmountByDateRange(monthStart, monthEnd);
        BigDecimal totalSalesThisYear = salesOrderRepository.sumTotalAmountByDateRange(yearStart, monthEnd);
        Long totalSalesOrdersThisMonth = salesOrderRepository.findByStatus(SalesOrderStatus.PENDING, PageRequest.of(0, 1)).getTotalElements();
        
        // Purchase Summary
        BigDecimal totalPurchasesThisMonth = purchaseOrderRepository.sumTotalAmountByDateRange(monthStart, monthEnd);
        BigDecimal totalPurchasesThisYear = purchaseOrderRepository.sumTotalAmountByDateRange(yearStart, monthEnd);
        
        // Inventory Summary
        Long totalProducts = productRepository.count();
        List<Product> allProducts = productRepository.findAll();
        Long lowStockProducts = allProducts.stream()
                .filter(p -> p.getCurrentStock() <= p.getReorderLevel() && p.getCurrentStock() > 0)
                .count();
        Long outOfStockProducts = allProducts.stream()
                .filter(p -> p.getCurrentStock() == 0)
                .count();
        
        // Invoice Summary
        Long totalInvoices = invoiceRepository.count();
        Long pendingInvoices = invoiceRepository.countPendingInvoices();
        BigDecimal pendingInvoiceAmount = invoiceRepository.sumTotalPayableByDateRange(yearStart, monthEnd);
        
        // Top Selling Products
        List<TopProductResponse> topProducts = getTopSellingProducts(5);
        
        // Recent Orders
        List<RecentOrderResponse> recentSalesOrders = getRecentSalesOrders(5);
        List<RecentOrderResponse> recentPurchaseOrders = getRecentPurchaseOrders(5);
        
        return DashboardSummaryResponse.builder()
                .totalSalesThisMonth(totalSalesThisMonth != null ? totalSalesThisMonth : BigDecimal.ZERO)
                .totalSalesThisYear(totalSalesThisYear != null ? totalSalesThisYear : BigDecimal.ZERO)
                .totalSalesOrdersThisMonth(totalSalesOrdersThisMonth)
                .totalPurchasesThisMonth(totalPurchasesThisMonth != null ? totalPurchasesThisMonth : BigDecimal.ZERO)
                .totalPurchasesThisYear(totalPurchasesThisYear != null ? totalPurchasesThisYear : BigDecimal.ZERO)
                .totalPurchaseOrdersThisMonth(0L)
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .totalInvoices(totalInvoices)
                .pendingInvoices(pendingInvoices != null ? pendingInvoices : 0L)
                .pendingInvoiceAmount(pendingInvoiceAmount != null ? pendingInvoiceAmount : BigDecimal.ZERO)
                .collectedInvoiceAmount(BigDecimal.ZERO)
                .topSellingProducts(topProducts)
                .recentSalesOrders(recentSalesOrders)
                .recentPurchaseOrders(recentPurchaseOrders)
                .build();
    }
    
    @Override
    public SalesSummaryResponse getSalesSummary(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        BigDecimal totalSales = salesOrderRepository.sumTotalAmountByDateRange(start, end);
        
        // Generate daily sales data
        List<SalesSummaryResponse.DailySalesData> dailySales = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            LocalDateTime dayStart = currentDate.atStartOfDay();
            LocalDateTime dayEnd = currentDate.atTime(LocalTime.MAX);
            
            BigDecimal daySales = salesOrderRepository.sumTotalAmountByDateRange(dayStart, dayEnd);
            
            dailySales.add(SalesSummaryResponse.DailySalesData.builder()
                    .date(currentDate)
                    .salesAmount(daySales != null ? daySales : BigDecimal.ZERO)
                    .orderCount(0L)
                    .build());
            
            currentDate = currentDate.plusDays(1);
        }
        
        return SalesSummaryResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalSales(totalSales != null ? totalSales : BigDecimal.ZERO)
                .totalOrders(0L)
                .averageOrderValue(BigDecimal.ZERO)
                .dailySales(dailySales)
                .build();
    }
    
    @Override
    public PurchaseSummaryResponse getPurchaseSummary(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        BigDecimal totalPurchases = purchaseOrderRepository.sumTotalAmountByDateRange(start, end);
        
        // Generate daily purchase data
        List<PurchaseSummaryResponse.DailyPurchaseData> dailyPurchases = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            LocalDateTime dayStart = currentDate.atStartOfDay();
            LocalDateTime dayEnd = currentDate.atTime(LocalTime.MAX);
            
            BigDecimal dayPurchases = purchaseOrderRepository.sumTotalAmountByDateRange(dayStart, dayEnd);
            
            dailyPurchases.add(PurchaseSummaryResponse.DailyPurchaseData.builder()
                    .date(currentDate)
                    .purchaseAmount(dayPurchases != null ? dayPurchases : BigDecimal.ZERO)
                    .orderCount(0L)
                    .build());
            
            currentDate = currentDate.plusDays(1);
        }
        
        return PurchaseSummaryResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalPurchases(totalPurchases != null ? totalPurchases : BigDecimal.ZERO)
                .totalOrders(0L)
                .averageOrderValue(BigDecimal.ZERO)
                .dailyPurchases(dailyPurchases)
                .build();
    }
    
    @Override
    public List<StockAlertResponse> getStockAlerts() {
        List<Product> products = productRepository.findAll();
        
        return products.stream()
                .filter(p -> p.getCurrentStock() <= p.getReorderLevel() || p.getCurrentStock() == 0)
                .map(this::mapToStockAlert)
                .sorted(Comparator.comparing(StockAlertResponse::getCurrentStock))
                .toList();
    }
    
    private List<TopProductResponse> getTopSellingProducts(int limit) {
        // This is a simplified version - in production, you'd query aggregated data
        List<Product> products = productRepository.findAll(PageRequest.of(0, limit)).getContent();
        
        return products.stream()
                .map(p -> TopProductResponse.builder()
                        .productId(p.getId())
                        .productName(p.getName())
                        .productSku(p.getSku())
                        .quantitySold(0L)
                        .revenue(BigDecimal.ZERO)
                        .build())
                .toList();
    }
    
    private List<RecentOrderResponse> getRecentSalesOrders(int limit) {
        // Simplified - would query actual recent orders
        return new ArrayList<>();
    }
    
    private List<RecentOrderResponse> getRecentPurchaseOrders(int limit) {
        // Simplified - would query actual recent orders
        return new ArrayList<>();
    }
    
    private StockAlertResponse mapToStockAlert(Product product) {
        String alertLevel;
        if (product.getCurrentStock() == 0) {
            alertLevel = "OUT_OF_STOCK";
        } else if (product.getCurrentStock() <= product.getReorderLevel() / 2) {
            alertLevel = "CRITICAL";
        } else {
            alertLevel = "LOW";
        }
        
        return StockAlertResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getSku())
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .alertLevel(alertLevel)
                .build();
    }
}
