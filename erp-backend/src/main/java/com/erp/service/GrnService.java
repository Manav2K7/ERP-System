package com.erp.service;

import com.erp.dto.request.GrnRequest;
import com.erp.dto.response.GrnResponse;
import com.erp.dto.response.PagedResponse;

public interface GrnService {
    
    GrnResponse createGrn(GrnRequest request);
    
    GrnResponse getGrnById(Long id);
    
    PagedResponse<GrnResponse> getAllGrns(int page, int size, String keyword);
    
    PagedResponse<GrnResponse> getGrnsByPurchaseOrderId(Long purchaseOrderId, int page, int size);
}
