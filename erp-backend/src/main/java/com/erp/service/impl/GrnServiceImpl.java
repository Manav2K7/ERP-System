package com.erp.service.impl;

import com.erp.dto.request.GrnItemRequest;
import com.erp.dto.request.GrnRequest;
import com.erp.dto.response.GrnItemResponse;
import com.erp.dto.response.GrnResponse;
import com.erp.dto.response.PagedResponse;
import com.erp.exception.InvalidStatusTransitionException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Grn;
import com.erp.model.GrnItem;
import com.erp.model.Product;
import com.erp.model.PurchaseOrder;
import com.erp.model.enums.PurchaseOrderStatus;
import com.erp.repository.GrnRepository;
import com.erp.repository.ProductRepository;
import com.erp.repository.PurchaseOrderRepository;
import com.erp.service.GrnService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GrnServiceImpl implements GrnService {
    
    private final GrnRepository grnRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    
    @Override
    @Transactional
    public GrnResponse createGrn(GrnRequest request) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", "id", request.getPurchaseOrderId()));
        
        // Validate purchase order status
        if (purchaseOrder.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new InvalidStatusTransitionException("GRN", "CANCELLED", "Cannot create GRN for cancelled order");
        }
        
        if (purchaseOrder.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new InvalidStatusTransitionException("GRN", "RECEIVED", "Cannot create GRN for fully received order");
        }
        
        Grn grn = Grn.builder()
                .purchaseOrder(purchaseOrder)
                .receivedDate(request.getReceivedDate())
                .remarks(request.getRemarks())
                .build();
        
        // Add items and update stock
        for (GrnItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));
            
            GrnItem item = GrnItem.builder()
                    .product(product)
                    .quantityReceived(itemRequest.getQuantityReceived())
                    .build();
            
            grn.addItem(item);
            
            // Update product stock (transactional - atomic with GRN save)
            product.setCurrentStock(product.getCurrentStock() + itemRequest.getQuantityReceived());
            productRepository.save(product);
        }
        
        // Determine PO status by comparing total received quantity (this + all previous GRNs)
        // against the PO's ordered quantity per product. Partial coverage => PARTIALLY_RECEIVED.
        java.util.Map<Long, Integer> orderedByProduct = new java.util.HashMap<>();
        for (com.erp.model.PurchaseOrderItem poi : purchaseOrder.getItems()) {
            orderedByProduct.merge(poi.getProduct().getId(), poi.getQuantity(), Integer::sum);
        }
        
        java.util.Map<Long, Integer> receivedByProduct = new java.util.HashMap<>();
        for (com.erp.model.Grn previousGrn : grnRepository.findByPurchaseOrderId(purchaseOrder.getId(), Pageable.unpaged())) {
            for (com.erp.model.GrnItem gi : previousGrn.getItems()) {
                receivedByProduct.merge(gi.getProduct().getId(), gi.getQuantityReceived(), Integer::sum);
            }
        }
        // The current GRN is not persisted yet at this point - include its items too.
        for (com.erp.model.GrnItem gi : grn.getItems()) {
            receivedByProduct.merge(gi.getProduct().getId(), gi.getQuantityReceived(), Integer::sum);
        }
        
        boolean fullyReceived = !orderedByProduct.isEmpty();
        for (java.util.Map.Entry<Long, Integer> entry : orderedByProduct.entrySet()) {
            int received = receivedByProduct.getOrDefault(entry.getKey(), 0);
            if (received < entry.getValue()) {
                fullyReceived = false;
                break;
            }
        }
        
        purchaseOrder.setStatus(fullyReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED);
        purchaseOrderRepository.save(purchaseOrder);
        
        Grn savedGrn = grnRepository.save(grn);
        return mapToResponse(savedGrn);
    }
    
    @Override
    public GrnResponse getGrnById(Long id) {
        Grn grn = grnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GRN", "id", id));
        return mapToResponse(grn);
    }
    
    @Override
    public PagedResponse<GrnResponse> getAllGrns(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Grn> grnPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            grnPage = grnRepository.search(keyword, pageable);
        } else {
            grnPage = grnRepository.findAll(pageable);
        }
        
        return mapToPagedResponse(grnPage);
    }
    
    @Override
    public PagedResponse<GrnResponse> getGrnsByPurchaseOrderId(Long purchaseOrderId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Grn> grnPage = grnRepository.findByPurchaseOrderId(purchaseOrderId, pageable);
        return mapToPagedResponse(grnPage);
    }
    
    private GrnResponse mapToResponse(Grn grn) {
        java.util.List<GrnItemResponse> itemResponses = grn.getItems().stream()
                .map(this::mapItemToResponse)
                .toList();
        
        return GrnResponse.builder()
                .id(grn.getId())
                .purchaseOrderId(grn.getPurchaseOrder().getId())
                .supplierName(grn.getPurchaseOrder().getSupplier().getName())
                .receivedDate(grn.getReceivedDate())
                .remarks(grn.getRemarks())
                .items(itemResponses)
                .createdAt(grn.getCreatedAt())
                .updatedAt(grn.getUpdatedAt())
                .build();
    }
    
    private GrnItemResponse mapItemToResponse(GrnItem item) {
        return GrnItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .quantityReceived(item.getQuantityReceived())
                .build();
    }
    
    private PagedResponse<GrnResponse> mapToPagedResponse(Page<Grn> page) {
        return PagedResponse.<GrnResponse>builder()
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
