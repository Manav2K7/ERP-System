package com.erp.service.impl;

import com.erp.dto.request.PartyRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PartyResponse;
import com.erp.exception.DuplicateResourceException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Supplier;
import com.erp.repository.SupplierRepository;
import com.erp.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {
    
    private final SupplierRepository supplierRepository;
    
    @Override
    @Transactional
    public PartyResponse createSupplier(PartyRequest request) {
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Supplier", "email", request.getEmail());
        }
        
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .gstin(request.getGstin())
                .active(true)
                .build();
        
        Supplier savedSupplier = supplierRepository.save(supplier);
        return mapToResponse(savedSupplier);
    }
    
    @Override
    public PartyResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return mapToResponse(supplier);
    }
    
    @Override
    public PagedResponse<PartyResponse> getAllSuppliers(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Page<Supplier> supplierPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            supplierPage = supplierRepository.search(keyword, pageable);
        } else {
            supplierPage = supplierRepository.findAll(pageable);
        }
        
        return mapToPagedResponse(supplierPage);
    }
    
    @Override
    @Transactional
    public PartyResponse updateSupplier(Long id, PartyRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        
        if (!supplier.getEmail().equals(request.getEmail()) && supplierRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Supplier", "email", request.getEmail());
        }
        
        supplier.setName(request.getName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setGstin(request.getGstin());
        
        Supplier updatedSupplier = supplierRepository.save(supplier);
        return mapToResponse(updatedSupplier);
    }
    
    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
    
    private PartyResponse mapToResponse(Supplier supplier) {
        return PartyResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .gstin(supplier.getGstin())
                .active(supplier.isActive())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
    
    private PagedResponse<PartyResponse> mapToPagedResponse(Page<Supplier> page) {
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
