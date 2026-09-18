package com.erp.service;

import com.erp.dto.request.SalesOrderRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.SalesOrderResponse;
import com.erp.model.enums.SalesOrderStatus;

public interface SalesOrderService {
    
    SalesOrderResponse createSalesOrder(SalesOrderRequest request);
    
    SalesOrderResponse getSalesOrderById(Long id);
    
    PagedResponse<SalesOrderResponse> getAllSalesOrders(int page, int size, String keyword);
    
    PagedResponse<SalesOrderResponse> getSalesOrdersByStatus(SalesOrderStatus status, int page, int size);
    
    SalesOrderResponse updateSalesOrderStatus(Long id, SalesOrderStatus newStatus);
}
