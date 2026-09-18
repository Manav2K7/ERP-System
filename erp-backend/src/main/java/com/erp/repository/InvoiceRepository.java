package com.erp.repository;

import com.erp.model.Invoice;
import com.erp.model.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Optional<Invoice> findBySalesOrderId(Long salesOrderId);
    
    boolean existsBySalesOrderId(Long salesOrderId);
    
    Page<Invoice> findByCustomerId(Long customerId, Pageable pageable);
    
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);
    
    @Query("SELECT i FROM Invoice i WHERE " +
           "LOWER(i.customer.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "CAST(i.id AS string) LIKE CONCAT('%', :keyword, '%')")
    Page<Invoice> search(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(i.totalPayable), 0) FROM Invoice i WHERE i.status != 'CANCELLED' " +
           "AND i.invoiceDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalPayableByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'PENDING'")
    Long countPendingInvoices();
}
