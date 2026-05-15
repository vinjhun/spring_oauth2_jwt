package com.example.cms.resource.points;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PointController {

    private final PointTransactionRepository repository;

    public PointController(PointTransactionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/me/points")
    public PointBalanceResponse myBalance(@AuthenticationPrincipal Jwt jwt) {
        String memberId = jwt.getClaimAsString("userId");
        return new PointBalanceResponse(memberId, repository.balanceForMember(memberId));
    }

    @GetMapping("/me/point-transactions")
    public Page<PointTransaction> myTransactions(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        String memberId = jwt.getClaimAsString("userId");
        return repository.findByMemberIdOrderByCreatedAtDesc(memberId, PageRequest.of(page, size));
    }

    @GetMapping("/admin/members/{memberId}/points")
    @PreAuthorize("hasRole('ADMIN')")
    public PointBalanceResponse memberBalance(@PathVariable(name = "memberId") String memberId) {
        return new PointBalanceResponse(memberId, repository.balanceForMember(memberId));
    }

    @PostMapping("/admin/members/{memberId}/point-transactions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public PointTransaction adjustPoints(
            @PathVariable(name = "memberId") String memberId,
            @Valid @RequestBody PointAdjustmentRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        PointTransaction transaction = new PointTransaction();
        transaction.setMemberId(memberId);
        transaction.setDelta(request.delta());
        transaction.setReason(request.reason());
        transaction.setCreatedBy(jwt.getClaimAsString("email"));
        return repository.save(transaction);
    }
}
