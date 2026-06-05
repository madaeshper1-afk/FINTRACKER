/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'admin' | 'user';
  createdAt: string;
  password?: string;
}

export type PaymentMode = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes: string;
  paymentMode: PaymentMode;
  category: string;
  userId: string;
  isDeleted: boolean;
  addedByVoice?: boolean;
  parsedByOcr?: boolean;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes: string;
  userId: string;
  isDeleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  isCustom: boolean;
  color: string; // Hex or tailwind class color name
  limit?: number; // Monthly budget limit if applicable
  userId?: string;
}

export interface ProductPriceHistory {
  date: string;
  price: number;
}

export interface ProductPriceTracker {
  name: string;
  history: ProductPriceHistory[];
  averageCost: number;
  priceIncreasePercent: number; // calculated from oldest to newest price
}

export interface Budget {
  id: string;
  name: string; // e.g. "Food Budget", "Travel Budget"
  targetAmount: number;
  categoryId: string; // Or category name string
  userId: string;
  isDeleted: boolean;
}

export type RecurrentFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: RecurrentFrequency;
  nextDueDate: string; // YYYY-MM-DD
  isActive: boolean;
  notes: string;
  userId: string;
  isDeleted: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  notes: string;
  userId: string;
  isDeleted: boolean;
}

export interface Notification {
  id: string;
  type: 'budget_exceeded' | 'unusual_spending' | 'upcoming_emi' | 'recurring_due' | 'system';
  message: string;
  date: string; // YYYY-MM-DD
  read: boolean;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  timestamp: string;
  actionDescription: string;
  category: string;
}

export interface ManualIncome {
  id: string;
  userId: string;
  month: string; // "Jan", "Feb", etc.
  year: number; // e.g. 2026
  salary: number;
  freelance: number;
  business: number;
  other: number;
  total: number;
}

export interface ManualSavings {
  id: string;
  userId: string;
  month: string; // "Jan", "Feb", etc.
  year: number; // e.g. 2026
  targetSavings: number;
  actualSavings: number;
  investment: number;
  emergencyFund: number;
  notes: string;
}
