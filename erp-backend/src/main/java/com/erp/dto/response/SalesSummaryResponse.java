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
public class SalesSummaryResponse {
    
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalSales;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private List<DailySalesData> dailySales;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySalesData {
        private LocalDate date;
        private BigDecimal salesAmount;
        private Long orderCount;
    }
}
