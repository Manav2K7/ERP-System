package com.erp.service;

import com.erp.dto.request.ProductRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.ProductResponse;
import com.erp.exception.DuplicateResourceException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Product;
import com.erp.repository.ProductRepository;
import com.erp.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private ProductServiceImpl productService;
    
    private ProductRequest productRequest;
    private Product product;
    
    @BeforeEach
    void setUp() {
        productRequest = ProductRequest.builder()
                .name("Test Product")
                .sku("TEST-001")
                .category("Electronics")
                .unitPrice(new BigDecimal("99.99"))
                .currentStock(100)
                .reorderLevel(10)
                .build();
        
        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .sku("TEST-001")
                .category("Electronics")
                .unitPrice(new BigDecimal("99.99"))
                .currentStock(100)
                .reorderLevel(10)
                .active(true)
                .build();
    }
    
    @Test
    void createProduct_Success() {
        when(productRepository.existsBySku(anyString())).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        ProductResponse response = productService.createProduct(productRequest);
        
        assertNotNull(response);
        assertEquals("Test Product", response.getName());
        assertEquals("TEST-001", response.getSku());
        verify(productRepository, times(1)).save(any(Product.class));
    }
    
    @Test
    void createProduct_DuplicateSku_ThrowsException() {
        when(productRepository.existsBySku(anyString())).thenReturn(true);
        
        assertThrows(DuplicateResourceException.class, () -> {
            productService.createProduct(productRequest);
        });
        
        verify(productRepository, never()).save(any(Product.class));
    }
    
    @Test
    void getProductById_Success() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(product));
        
        ProductResponse response = productService.getProductById(1L);
        
        assertNotNull(response);
        assertEquals("Test Product", response.getName());
    }
    
    @Test
    void getProductById_NotFound_ThrowsException() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductById(1L);
        });
    }
    
    @Test
    void getAllProducts_Success() {
        Page<Product> productPage = new PageImpl<>(Collections.singletonList(product));
        when(productRepository.findAll(any(Pageable.class))).thenReturn(productPage);
        
        PagedResponse<ProductResponse> response = productService.getAllProducts(0, 10, null);
        
        assertNotNull(response);
        assertEquals(1, response.getContent().size());
    }
    
    @Test
    void updateProduct_Success() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        ProductResponse response = productService.updateProduct(1L, productRequest);
        
        assertNotNull(response);
        assertEquals("Test Product", response.getName());
    }
    
    @Test
    void deleteProduct_Success() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        assertDoesNotThrow(() -> productService.deleteProduct(1L));
        
        verify(productRepository, times(1)).save(any(Product.class));
    }
}
