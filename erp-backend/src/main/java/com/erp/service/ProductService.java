package com.erp.service;

import com.erp.dto.request.ProductRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.ProductResponse;

public interface ProductService {
    
    ProductResponse createProduct(ProductRequest request);
    
    ProductResponse getProductById(Long id);
    
    ProductResponse getProductBySku(String sku);
    
    PagedResponse<ProductResponse> getAllProducts(int page, int size, String keyword);
    
    PagedResponse<ProductResponse> getLowStockProducts(int page, int size);
    
    ProductResponse updateProduct(Long id, ProductRequest request);
    
    void deleteProduct(Long id);
}
