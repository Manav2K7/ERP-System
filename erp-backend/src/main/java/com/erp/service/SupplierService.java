package com.erp.service;

import com.erp.dto.request.PartyRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PartyResponse;

public interface SupplierService {
    
    PartyResponse createSupplier(PartyRequest request);
    
    PartyResponse getSupplierById(Long id);
    
    PagedResponse<PartyResponse> getAllSuppliers(int page, int size, String keyword);
    
    PartyResponse updateSupplier(Long id, PartyRequest request);
    
    void deleteSupplier(Long id);
}
