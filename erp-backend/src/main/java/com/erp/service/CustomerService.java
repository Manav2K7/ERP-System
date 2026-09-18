package com.erp.service;

import com.erp.dto.request.PartyRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PartyResponse;

public interface CustomerService {
    
    PartyResponse createCustomer(PartyRequest request);
    
    PartyResponse getCustomerById(Long id);
    
    PagedResponse<PartyResponse> getAllCustomers(int page, int size, String keyword);
    
    PartyResponse updateCustomer(Long id, PartyRequest request);
    
    void deleteCustomer(Long id);
}
