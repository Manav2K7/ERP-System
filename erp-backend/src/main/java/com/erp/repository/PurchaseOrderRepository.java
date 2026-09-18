package com.erp.repository;

import com.erp.model.PurchaseOrder;
import com.erp.model.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    
    Page<PurchaseOrder> findBySupplierId(Long supplierId, Pageable pageable);
    
    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "LOWER(po.supplier.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "CAST(po.id AS string) LIKE CONCAT('%', :keyword, '%')")
    Page<PurchaseOrder> search(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(poItem.quantity * poItem.unitPrice), 0) FROM PurchaseOrderItem poItem " +
           "WHERE poItem.purchaseOrder.status != 'CANCELLED' " +
           "AND poItem.purchaseOrder.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalAmountByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
