package com.erp.service;

import com.erp.dto.request.SalesOrderItemRequest;
import com.erp.dto.request.SalesOrderRequest;
import com.erp.dto.response.SalesOrderResponse;
import com.erp.exception.InvalidStatusTransitionException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.*;
import com.erp.model.enums.SalesOrderStatus;
import com.erp.repository.CustomerRepository;
import com.erp.repository.ProductRepository;
import com.erp.repository.SalesOrderRepository;
import com.erp.service.impl.SalesOrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalesOrderServiceTest {
    
    @Mock
    private SalesOrderRepository salesOrderRepository;
    
    @Mock
    private CustomerRepository customerRepository;
    
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private SalesOrderServiceImpl salesOrderService;
    
    private Customer customer;
    private Product product;
    private SalesOrder salesOrder;
    private SalesOrderRequest salesOrderRequest;
    
    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .name("Test Customer")
                .email("customer@test.com")
                .build();
        
        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .sku("TEST-001")
                .unitPrice(new BigDecimal("100.00"))
                .currentStock(50)
                .build();
        
        salesOrder = SalesOrder.builder()
                .id(1L)
                .customer(customer)
                .status(SalesOrderStatus.PENDING)
                .totalAmount(new BigDecimal("200.00"))
                .items(List.of(
                    SalesOrderItem.builder()
                        .product(product)
                        .quantity(2)
                        .unitPriceAtOrder(new BigDecimal("100.00"))
                        .build()
                ))
                .build();
        
        salesOrderRequest = SalesOrderRequest.builder()
                .customerId(1L)
                .items(List.of(
                    SalesOrderItemRequest.builder()
                        .productId(1L)
                        .quantity(2)
                        .build()
                ))
                .build();
    }
    
    @Test
    void createSalesOrder_Success() {
        when(customerRepository.findById(anyLong())).thenReturn(Optional.of(customer));
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(product));
        when(salesOrderRepository.save(any(SalesOrder.class))).thenReturn(salesOrder);
        
        SalesOrderResponse response = salesOrderService.createSalesOrder(salesOrderRequest);
        
        assertNotNull(response);
        assertEquals(SalesOrderStatus.PENDING, response.getStatus());
        verify(salesOrderRepository, times(1)).save(any(SalesOrder.class));
    }
    
    @Test
    void createSalesOrder_CustomerNotFound_ThrowsException() {
        when(customerRepository.findById(anyLong())).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            salesOrderService.createSalesOrder(salesOrderRequest);
        });
    }
    
    @Test
    void getSalesOrderById_Success() {
        when(salesOrderRepository.findById(anyLong())).thenReturn(Optional.of(salesOrder));
        
        SalesOrderResponse response = salesOrderService.getSalesOrderById(1L);
        
        assertNotNull(response);
        assertEquals(SalesOrderStatus.PENDING, response.getStatus());
    }
    
    @Test
    void getSalesOrderById_NotFound_ThrowsException() {
        when(salesOrderRepository.findById(anyLong())).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            salesOrderService.getSalesOrderById(1L);
        });
    }
    
    @Test
    void updateSalesOrderStatus_ValidTransition_Success() {
        when(salesOrderRepository.findById(anyLong())).thenReturn(Optional.of(salesOrder));
        when(salesOrderRepository.save(any(SalesOrder.class))).thenReturn(salesOrder);
        
        SalesOrderResponse response = salesOrderService.updateSalesOrderStatus(1L, SalesOrderStatus.APPROVED);
        
        assertNotNull(response);
        verify(salesOrderRepository, times(1)).save(any(SalesOrder.class));
    }
    
    @Test
    void updateSalesOrderStatus_InvalidTransition_ThrowsException() {
        salesOrder.setStatus(SalesOrderStatus.DISPATCHED);
        when(salesOrderRepository.findById(anyLong())).thenReturn(Optional.of(salesOrder));
        
        assertThrows(InvalidStatusTransitionException.class, () -> {
            salesOrderService.updateSalesOrderStatus(1L, SalesOrderStatus.PENDING);
        });
        
        verify(salesOrderRepository, never()).save(any(SalesOrder.class));
    }
}
