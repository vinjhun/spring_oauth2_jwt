package com.example.cms.resource.points;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    Page<PointTransaction> findByMemberIdOrderByCreatedAtDesc(String memberId, Pageable pageable);

    @Query("select coalesce(sum(t.delta), 0) from PointTransaction t where t.memberId = :memberId")
    long balanceForMember(@Param("memberId") String memberId);
}

