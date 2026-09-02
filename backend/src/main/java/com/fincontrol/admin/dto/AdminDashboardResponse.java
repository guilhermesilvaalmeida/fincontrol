package com.fincontrol.admin.dto;

import java.util.List;

public record AdminDashboardResponse(
        long totalUsers,
        long activeUsers,
        long inactiveUsers,
        long totalTransactions,
        long totalCreditCards,
        long totalAccounts,
        List<AdminUserResponse> recentUsers
) {
}
