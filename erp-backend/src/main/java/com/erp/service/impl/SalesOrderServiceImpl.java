package com.erp.service.impl;

import com.erp.dto.request.SalesOrderItemRequest;
import com.erp.dto.request.SalesOrderRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.SalesOrderItemResponse;
import com.erp.dto.response.SalesOrderResponse;
import com.erp.exception.InvalidStatusTransitionException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Customer;
import com.erp.model.Product;
import com.erp.model.SalesOrder;
import com.erp.model.SalesOrderItem;
import com.erp.model.enums.SalesOrderStatus;
import com.erp.repository.CustomerRepository;
import com.erp.repository.ProductRepository;
import com.erp.repository.SalesOrderRepository;
import com.erp.service.SalesOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalesOrderServiceImpl implements SalesOrderService {
    
    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    
    // Define valid status transitions
    private static final Map<SalesOrderStatus, List<SalesOrderStatus>> VALID_TRANSITIONS = Map.of(
            SalesOrderStatus.PENDING, Arrays.asList(SalesOrderStatus.APPROVED, SalesOrderStatus.CANCELLED),
            SalesOrderStatus.APPROVED, Arrays.asList(SalesOrderStatus.DISPATCHED, SalesOrderStatus.CANCELLED),
            SalesOrderStatus.DISPATCHED, List.of(),
            SalesOrderStatus.CANCELLED, List.of()
    );
    
    @Override
    @Transactional
    public SalesOrderResponse createSalesOrder(SalesOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
        
        SalesOrder salesOrder = SalesOrder.builder()
                .customer(customer)
                .orderDate(LocalDateTime.now())
                .status(SalesOrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();
        
        // Add items and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (SalesOrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));
            
            SalesOrderItem item = SalesOrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPriceAtOrder(product.getUnitPrice())
                    .build();
            
            salesOrder.addItem(item);
            totalAmount = totalAmount.add(product.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }
        
        salesOrder.setTotalAmount(totalAmount);
        
        SalesOrder savedOrder = salesOrderRepository.save(salesOrder);
        return mapToResponse(savedOrder);
    }
    
    @Override
    public SalesOrderResponse getSalesOrderById(Long id) {
        SalesOrder salesOrder = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", id));
        return mapToResponse(salesOrder);
    }
    
    @Override
    public PagedResponse<SalesOrderResponse> getAllSalesOrders(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<SalesOrder> orderPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            orderPage = salesOrderRepository.search(keyword, pageable);
        } else {
            orderPage = salesOrderRepository.findAll(pageable);
        }
        
        return mapToPagedResponse(orderPage);
    }
    
    @Override
    public PagedResponse<SalesOrderResponse> getSalesOrdersByStatus(SalesOrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SalesOrder> orderPage = salesOrderRepository.findByStatus(status, pageable);
        return mapToPagedResponse(orderPage);
    }
    
    @Override
    @Transactional
    public SalesOrderResponse updateSalesOrderStatus(Long id, SalesOrderStatus newStatus) {
        SalesOrder salesOrder = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", id));
        
        SalesOrderStatus currentStatus = salesOrder.getStatus();
        
        // Validate status transition
        List<SalesOrderStatus> allowedTransitions = VALID_TRANSITIONS.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new InvalidStatusTransitionException("Sales Order", currentStatus.name(), newStatus.name());
        }
        
        salesOrder.setStatus(newStatus);
        SalesOrder updatedOrder = salesOrderRepository.save(salesOrder);
        return mapToResponse(updatedOrder);
    }
    
    private SalesOrderResponse mapToResponse(SalesOrder salesOrder) {
        List<SalesOrderItemResponse> itemResponses = salesOrder.getItems().stream()
                .map(this::mapItemToResponse)
                .toList();
        
        return SalesOrderResponse.builder()
                .id(salesOrder.getId())
                .customerId(salesOrder.getCustomer().getId())
                .customerName(salesOrder.getCustomer().getName())
                .customerEmail(salesOrder.getCustomer().getEmail())
                .orderDate(salesOrder.getOrderDate())
                .status(salesOrder.getStatus())
                .totalAmount(salesOrder.getTotalAmount())
                .items(itemResponses)
                .createdAt(salesOrder.getCreatedAt())
                .updatedAt(salesOrder.getUpdatedAt())
                .build();
    }
    
    private SalesOrderItemResponse mapItemToResponse(SalesOrderItem item) {
        return SalesOrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPriceAtOrder(item.getUnitPriceAtOrder())
                .lineTotal(item.getUnitPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
    
    private PagedResponse<SalesOrderResponse> mapToPagedResponse(Page<SalesOrder> page) {
        return PagedResponse.<SalesOrderResponse>builder()
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
