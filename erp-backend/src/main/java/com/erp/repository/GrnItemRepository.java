package com.erp.repository;

import com.erp.model.GrnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrnItemRepository extends JpaRepository<GrnItem, Long> {
    
    List<GrnItem> findByGrnId(Long grnId);
}
