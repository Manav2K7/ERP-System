package com.erp.service.impl;

import com.erp.dto.request.PartyRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PartyResponse;
import com.erp.exception.DuplicateResourceException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Customer;
import com.erp.repository.CustomerRepository;
import com.erp.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    
    private final CustomerRepository customerRepository;
    
    @Override
    @Transactional
    public PartyResponse createCustomer(PartyRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer", "email", request.getEmail());
        }
        
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .gstin(request.getGstin())
                .active(true)
                .build();
        
        Customer savedCustomer = customerRepository.save(customer);
        return mapToResponse(savedCustomer);
    }
    
    @Override
    public PartyResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToResponse(customer);
    }
    
    @Override
    public PagedResponse<PartyResponse> getAllCustomers(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Page<Customer> customerPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            customerPage = customerRepository.search(keyword, pageable);
        } else {
            customerPage = customerRepository.findAll(pageable);
        }
        
        return mapToPagedResponse(customerPage);
    }
    
    @Override
    @Transactional
    public PartyResponse updateCustomer(Long id, PartyRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        
        if (!customer.getEmail().equals(request.getEmail()) && customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer", "email", request.getEmail());
        }
        
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setGstin(request.getGstin());
        
        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponse(updatedCustomer);
    }
    
    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customer.setActive(false);
        customerRepository.save(customer);
    }
    
    private PartyResponse mapToResponse(Customer customer) {
        return PartyResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .gstin(customer.getGstin())
                .active(customer.isActive())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
    
    private PagedResponse<PartyResponse> mapToPagedResponse(Page<Customer> page) {
        return PagedResponse.<PartyResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
