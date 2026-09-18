package com.erp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseSummaryResponse {
    
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPurchases;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private List<DailyPurchaseData> dailyPurchases;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPurchaseData {
        private LocalDate date;
        private BigDecimal purchaseAmount;
        private Long orderCount;
    }
}
