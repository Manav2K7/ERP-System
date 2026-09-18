package com.erp.service;

import com.erp.dto.request.PurchaseOrderRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PurchaseOrderResponse;
import com.erp.model.enums.PurchaseOrderStatus;

public interface PurchaseOrderService {
    
    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request);
    
    PurchaseOrderResponse getPurchaseOrderById(Long id);
    
    PagedResponse<PurchaseOrderResponse> getAllPurchaseOrders(int page, int size, String keyword);
    
    PagedResponse<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrderStatus status, int page, int size);
    
    PurchaseOrderResponse updatePurchaseOrderStatus(Long id, PurchaseOrderStatus newStatus);
}
