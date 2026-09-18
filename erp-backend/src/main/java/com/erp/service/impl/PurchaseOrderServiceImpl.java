package com.erp.service.impl;

import com.erp.dto.request.PurchaseOrderItemRequest;
import com.erp.dto.request.PurchaseOrderRequest;
import com.erp.dto.response.PagedResponse;
import com.erp.dto.response.PurchaseOrderItemResponse;
import com.erp.dto.response.PurchaseOrderResponse;
import com.erp.exception.InvalidStatusTransitionException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Product;
import com.erp.model.PurchaseOrder;
import com.erp.model.PurchaseOrderItem;
import com.erp.model.Supplier;
import com.erp.model.enums.PurchaseOrderStatus;
import com.erp.repository.ProductRepository;
import com.erp.repository.PurchaseOrderRepository;
import com.erp.repository.SupplierRepository;
import com.erp.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {
    
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    
    // Define valid status transitions
    private static final Map<PurchaseOrderStatus, List<PurchaseOrderStatus>> VALID_TRANSITIONS = Map.of(
            PurchaseOrderStatus.ORDERED, Arrays.asList(PurchaseOrderStatus.PARTIALLY_RECEIVED, PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED),
            PurchaseOrderStatus.PARTIALLY_RECEIVED, Arrays.asList(PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.CANCELLED),
            PurchaseOrderStatus.RECEIVED, List.of(),
            PurchaseOrderStatus.CANCELLED, List.of()
    );
    
    @Override
    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
        
        PurchaseOrder purchaseOrder = PurchaseOrder.builder()
                .supplier(supplier)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .status(PurchaseOrderStatus.ORDERED)
                .build();
        
        // Add items and calculate total
        for (PurchaseOrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));
            
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .build();
            
            purchaseOrder.addItem(item);
        }
        
        PurchaseOrder savedOrder = purchaseOrderRepository.save(purchaseOrder);
        return mapToResponse(savedOrder);
    }
    
    @Override
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "id", id));
        return mapToResponse(purchaseOrder);
    }
    
    @Override
    public PagedResponse<PurchaseOrderResponse> getAllPurchaseOrders(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<PurchaseOrder> orderPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            orderPage = purchaseOrderRepository.search(keyword, pageable);
        } else {
            orderPage = purchaseOrderRepository.findAll(pageable);
        }
        
        return mapToPagedResponse(orderPage);
    }
    
    @Override
    public PagedResponse<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseOrder> orderPage = purchaseOrderRepository.findByStatus(status, pageable);
        return mapToPagedResponse(orderPage);
    }
    
    @Override
    @Transactional
    public PurchaseOrderResponse updatePurchaseOrderStatus(Long id, PurchaseOrderStatus newStatus) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "id", id));
        
        PurchaseOrderStatus currentStatus = purchaseOrder.getStatus();
        
        // Validate status transition
        List<PurchaseOrderStatus> allowedTransitions = VALID_TRANSITIONS.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new InvalidStatusTransitionException("Purchase Order", currentStatus.name(), newStatus.name());
        }
        
        purchaseOrder.setStatus(newStatus);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(purchaseOrder);
        return mapToResponse(updatedOrder);
    }
    
    private PurchaseOrderResponse mapToResponse(PurchaseOrder purchaseOrder) {
        List<PurchaseOrderItemResponse> itemResponses = purchaseOrder.getItems().stream()
                .map(this::mapItemToResponse)
                .toList();
        
        BigDecimal totalAmount = purchaseOrder.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return PurchaseOrderResponse.builder()
                .id(purchaseOrder.getId())
                .supplierId(purchaseOrder.getSupplier().getId())
                .supplierName(purchaseOrder.getSupplier().getName())
                .supplierEmail(purchaseOrder.getSupplier().getEmail())
                .expectedDeliveryDate(purchaseOrder.getExpectedDeliveryDate())
                .status(purchaseOrder.getStatus())
                .totalAmount(totalAmount)
                .items(itemResponses)
                .createdAt(purchaseOrder.getCreatedAt())
                .updatedAt(purchaseOrder.getUpdatedAt())
                .build();
    }
    
    private PurchaseOrderItemResponse mapItemToResponse(PurchaseOrderItem item) {
        return PurchaseOrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
    
    private PagedResponse<PurchaseOrderResponse> mapToPagedResponse(Page<PurchaseOrder> page) {
        return PagedResponse.<PurchaseOrderResponse>builder()
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
