package com.erp.service;

import com.erp.dto.response.*;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {
    
    DashboardSummaryResponse getDashboardSummary();
    
    SalesSummaryResponse getSalesSummary(LocalDate startDate, LocalDate endDate);
    
    PurchaseSummaryResponse getPurchaseSummary(LocalDate startDate, LocalDate endDate);
    
    List<StockAlertResponse> getStockAlerts();
}
