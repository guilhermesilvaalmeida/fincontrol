export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "USER" | "ADMIN";
  active: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  transactionsCount: number;
  accountsCount: number;
  creditCardsCount: number;
  goalsCount: number;
  budgetsCount: number;
}

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalTransactions: number;
  totalCreditCards: number;
  totalAccounts: number;
  recentUsers: AdminUser[];
}
