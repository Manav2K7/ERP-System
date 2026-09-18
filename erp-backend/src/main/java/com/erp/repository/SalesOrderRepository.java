package com.erp.repository;

import com.erp.model.SalesOrder;
import com.erp.model.enums.SalesOrderStatus;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    
    Page<SalesOrder> findByCustomerId(Long customerId, Pageable pageable);
    
    Page<SalesOrder> findByStatus(SalesOrderStatus status, Pageable pageable);
    
    @Query("SELECT so FROM SalesOrder so WHERE " +
           "LOWER(so.customer.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "CAST(so.id AS string) LIKE CONCAT('%', :keyword, '%')")
    Page<SalesOrder> search(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(so.totalAmount), 0) FROM SalesOrder so WHERE so.status != 'CANCELLED' " +
           "AND so.orderDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalAmountByDateRange(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);
}
