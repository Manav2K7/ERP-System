package com.erp.repository;

import com.erp.model.Grn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrnRepository extends JpaRepository<Grn, Long> {
    
    Page<Grn> findByPurchaseOrderId(Long purchaseOrderId, Pageable pageable);
    
    @Query("SELECT g FROM Grn g WHERE " +
           "CAST(g.id AS string) LIKE CONCAT('%', :keyword, '%') OR " +
           "LOWER(g.purchaseOrder.supplier.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Grn> search(@Param("keyword") String keyword, Pageable pageable);
}
