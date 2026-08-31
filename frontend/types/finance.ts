export type AccountType = "CHECKING" | "SAVINGS" | "WALLET" | "CASH" | "INVESTMENT" | "OTHER";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string | null;
  initialBalance: number;
  currentBalance: number;
}

export interface AccountPayload {
  name: string;
  type: AccountType;
  institution?: string;
  initialBalance: number;
}

export interface Category {
  id: string;
  name: string;
  groupName: string | null;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
  account: { id: string; name: string } | null;
  paymentMethod: string | null;
  occurredOn: string;
  notes: string | null;
}

export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string;
  paymentMethod?: string;
  occurredOn: string;
  notes?: string;
}

export interface DashboardResponse {
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  expensesByCategory: {
    categoryId: string;
    name: string;
    icon: string | null;
    color: string | null;
    total: number;
  }[];
  recentTransactions: {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    categoryIcon: string | null;
    occurredOn: string;
  }[];
}
