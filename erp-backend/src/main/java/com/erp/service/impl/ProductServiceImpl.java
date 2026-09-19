package com.erp.service.impl;

import com.erp.dto.request.ProductRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.ProductResponse;
import com.erp.exception.DuplicateResourceException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Product;
import com.erp.repository.ProductRepository;
import com.erp.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    
    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product", "SKU", request.getSku());
        }
        
        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .unitPrice(request.getUnitPrice())
                .currentStock(request.getCurrentStock())
                .reorderLevel(request.getReorderLevel())
                .active(true)
                .build();
        
        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }
    
    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToResponse(product);
    }
    
    @Override
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "SKU", sku));
        return mapToResponse(product);
    }
    
    @Override
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        
        Page<Product> productPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            productPage = productRepository.search(keyword, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }
        
        return mapToPagedResponse(productPage);
    }
    
    @Override
    public PagedResponse<ProductResponse> getLowStockProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("currentStock").ascending());
        Page<Product> productPage = productRepository.findLowStockProducts(pageable);
        return mapToPagedResponse(productPage);
    }
    
    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product", "SKU", request.getSku());
        }
        
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setCategory(request.getCategory());
        product.setUnitPrice(request.getUnitPrice());
        product.setCurrentStock(request.getCurrentStock());
        product.setReorderLevel(request.getReorderLevel());
        
        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }
    
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(false);
        productRepository.save(product);
    }
    
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .unitPrice(product.getUnitPrice())
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .active(product.isActive())
                .lowStock(product.getCurrentStock() <= product.getReorderLevel())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
    
    private PagedResponse<ProductResponse> mapToPagedResponse(Page<Product> page) {
        return PagedResponse.<ProductResponse>builder()
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
