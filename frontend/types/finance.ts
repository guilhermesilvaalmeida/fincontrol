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
  creditCard: { id: string; name: string } | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
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

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number;
  spent: number;
  available: number;
  percentUsed: number;
  status: "ok" | "attention" | "near_limit" | "exceeded";
}

export interface BudgetPayload {
  categoryId: string;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentComplete: number;
  targetDate: string | null;
  monthlyAmountNeeded: number | null;
  completed: boolean;
}

export interface GoalPayload {
  name: string;
  targetAmount: number;
  initialAmount?: number;
  targetDate?: string;
  description?: string;
}

export interface ReportsResponse {
  monthlyEvolution: { month: string; income: number; expense: number }[];
  categoryComparison: {
    categoryId: string;
    name: string;
    icon: string | null;
    currentAmount: number;
    previousAmount: number;
    percentChange: number;
  }[];
  topExpenses: {
    id: string;
    description: string;
    amount: number;
    occurredOn: string;
    categoryName: string;
    categoryIcon: string | null;
  }[];
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthSavingsRate: number;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string | null;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  committedAmount: number;
  availableLimit: number;
}

export interface CreditCardPayload {
  name: string;
  bank?: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
}

export interface InstallmentItem {
  number: number;
  amount: number;
  dueOn: string;
}

export interface InstallmentPurchase {
  id: string;
  description: string;
  totalAmount: number;
  installmentsCount: number;
  installmentAmount: number;
  purchaseDate: string;
  creditCardId: string;
  creditCardName: string | null;
  installments: InstallmentItem[];
}

export interface InstallmentPurchasePayload {
  description: string;
  totalAmount: number;
  installmentsCount: number;
  creditCardId: string;
  categoryId: string;
  purchaseDate: string;
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
