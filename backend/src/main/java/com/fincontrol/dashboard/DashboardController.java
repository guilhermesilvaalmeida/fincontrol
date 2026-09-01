package com.fincontrol.dashboard;

import com.fincontrol.dashboard.dto.DashboardResponse;
import com.fincontrol.security.CurrentUser;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> get(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam(required = false, defaultValue = "MONTH") DashboardPeriod period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate anchor = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(dashboardService.getDashboard(currentUser.id(), period, anchor));
    }
}
