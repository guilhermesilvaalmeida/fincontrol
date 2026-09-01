package com.fincontrol.reports;

import com.fincontrol.reports.dto.ReportsResponse;
import com.fincontrol.security.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping
    public ResponseEntity<ReportsResponse> get(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(reportsService.build(currentUser.id()));
    }
}
