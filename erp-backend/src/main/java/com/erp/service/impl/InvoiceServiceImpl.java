package com.erp.service.impl;

import com.erp.dto.response.InvoiceItemResponse;
import com.erp.dto.response.InvoiceResponse;
import com.erp.dto.response.PagedResponse;
import com.erp.exception.DuplicateResourceException;
import com.erp.exception.InvalidStatusTransitionException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.model.Invoice;
import com.erp.model.SalesOrder;
import com.erp.model.SalesOrderItem;
import com.erp.model.enums.InvoiceStatus;
import com.erp.model.enums.SalesOrderStatus;
import com.erp.repository.InvoiceRepository;
import com.erp.repository.SalesOrderRepository;
import com.erp.service.InvoiceService;
import com.erp.util.PdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {
    
    private final InvoiceRepository invoiceRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PdfGenerator pdfGenerator;
    
    // GST rate (can be made configurable)
    private static final BigDecimal GST_RATE = new BigDecimal("0.18"); // 18%
    
    // Define valid status transitions
    private static final Map<InvoiceStatus, List<InvoiceStatus>> VALID_TRANSITIONS = Map.of(
            InvoiceStatus.PENDING, Arrays.asList(InvoiceStatus.PAID, InvoiceStatus.CANCELLED),
            InvoiceStatus.PAID, List.of(),
            InvoiceStatus.CANCELLED, List.of()
    );
    
    @Override
    @Transactional
    public InvoiceResponse generateInvoiceFromSalesOrder(Long salesOrderId) {
        SalesOrder salesOrder = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales Order", "id", salesOrderId));
        
        // Validate sales order status
        if (salesOrder.getStatus() != SalesOrderStatus.APPROVED && 
            salesOrder.getStatus() != SalesOrderStatus.DISPATCHED) {
            throw new InvalidStatusTransitionException("Invoice", salesOrder.getStatus().name(), "Only APPROVED or DISPATCHED orders can generate invoices");
        }
        
        // Check if invoice already exists
        if (invoiceRepository.existsBySalesOrderId(salesOrderId)) {
            throw new DuplicateResourceException("Invoice", "Sales Order ID", String.valueOf(salesOrderId));
        }
        
        // Calculate subtotal from line items (server-side, never trust client)
        BigDecimal subtotal = BigDecimal.ZERO;
        for (SalesOrderItem item : salesOrder.getItems()) {
            subtotal = subtotal.add(item.getUnitPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        
        // Calculate tax (GST)
        BigDecimal taxAmount = subtotal.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        
        // Calculate total payable
        BigDecimal totalPayable = subtotal.add(taxAmount);
        
        // Create invoice
        Invoice invoice = Invoice.builder()
                .customer(salesOrder.getCustomer())
                .salesOrder(salesOrder)
                .taxAmount(taxAmount)
                .totalPayable(totalPayable)
                .status(InvoiceStatus.PENDING)
                .invoiceDate(LocalDateTime.now())
                .build();
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }
    
    @Override
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
        return mapToResponse(invoice);
    }
    
    @Override
    public InvoiceResponse getInvoiceBySalesOrderId(Long salesOrderId) {
        Invoice invoice = invoiceRepository.findBySalesOrderId(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "Sales Order ID", salesOrderId));
        return mapToResponse(invoice);
    }
    
    @Override
    public PagedResponse<InvoiceResponse> getAllInvoices(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Invoice> invoicePage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            invoicePage = invoiceRepository.search(keyword, pageable);
        } else {
            invoicePage = invoiceRepository.findAll(pageable);
        }
        
        return mapToPagedResponse(invoicePage);
    }
    
    @Override
    public PagedResponse<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Invoice> invoicePage = invoiceRepository.findByStatus(status, pageable);
        return mapToPagedResponse(invoicePage);
    }
    
    @Override
    @Transactional
    public InvoiceResponse updateInvoiceStatus(Long id, InvoiceStatus newStatus) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
        
        InvoiceStatus currentStatus = invoice.getStatus();
        
        // Validate status transition
        List<InvoiceStatus> allowedTransitions = VALID_TRANSITIONS.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new InvalidStatusTransitionException("Invoice", currentStatus.name(), newStatus.name());
        }
        
        invoice.setStatus(newStatus);
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(updatedInvoice);
    }
    
    @Override
    public byte[] downloadInvoicePdf(Long id) {
        InvoiceResponse invoiceResponse = getInvoiceById(id);
        return pdfGenerator.generateInvoicePdf(invoiceResponse);
    }
    
    private InvoiceResponse mapToResponse(Invoice invoice) {
        List<InvoiceItemResponse> itemResponses = invoice.getSalesOrder().getItems().stream()
                .map(this::mapItemToResponse)
                .toList();
        
        // Calculate subtotal from items
        BigDecimal subtotal = itemResponses.stream()
                .map(InvoiceItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .customerId(invoice.getCustomer().getId())
                .customerName(invoice.getCustomer().getName())
                .customerEmail(invoice.getCustomer().getEmail())
                .customerGstin(invoice.getCustomer().getGstin())
                .salesOrderId(invoice.getSalesOrder().getId())
                .subtotal(subtotal)
                .taxAmount(invoice.getTaxAmount())
                .totalPayable(invoice.getTotalPayable())
                .status(invoice.getStatus())
                .invoiceDate(invoice.getInvoiceDate())
                .items(itemResponses)
                .createdAt(invoice.getCreatedAt())
                .build();
    }
    
    private InvoiceItemResponse mapItemToResponse(SalesOrderItem item) {
        return InvoiceItemResponse.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPriceAtOrder())
                .lineTotal(item.getUnitPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
    
    private PagedResponse<InvoiceResponse> mapToPagedResponse(Page<Invoice> page) {
        return PagedResponse.<InvoiceResponse>builder()
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
