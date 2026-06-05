/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Expense, Income, Budget, Category, RecurringExpense, SavingsGoal, Notification, UserActivityLog, ProductPriceTracker, ManualIncome, ManualSavings } from '../types';

// Built-in starter categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Food & Beverages', isCustom: false, color: '#f59e0b', limit: 5000 },
  { id: 'cat-2', name: 'Transportation', isCustom: false, color: '#3b82f6', limit: 3000 },
  { id: 'cat-3', name: 'Household', isCustom: false, color: '#10b981', limit: 8000 },
  { id: 'cat-4', name: 'Shopping', isCustom: false, color: '#ec4899', limit: 4000 },
  { id: 'cat-5', name: 'Healthcare', isCustom: false, color: '#ef4444', limit: 2000 },
  { id: 'cat-6', name: 'Entertainment', isCustom: false, color: '#8b5cf6', limit: 2500 }
];

export const INITIAL_INCOMES: Income[] = [
  { id: 'inc-1', source: 'Salary Credit', amount: 45000, date: '2026-06-01', notes: 'Monthly steady job pay', userId: 'user-001', isDeleted: false },
  { id: 'inc-2', source: 'Freelancing Project', amount: 12000, date: '2026-06-03', notes: 'UI Design landing page', userId: 'user-001', isDeleted: false },
  { id: 'inc-3', source: 'Stock Dividends', amount: 1500, date: '2026-06-04', notes: 'Quarterly payouts', userId: 'user-001', isDeleted: false }
];

// Seed expenses over the last 5 days to demonstrate price history trackers, category distributions, and heatmap matrices
export const INITIAL_EXPENSES: Expense[] = [
  // Tea price history tracking
  { id: 'exp-1', name: 'Tea', amount: 10, quantity: 1, unitPrice: 10, date: '2026-06-01', time: '08:30', notes: 'Local tapri tea', paymentMode: 'Cash', category: 'Food & Beverages', userId: 'user-001', isDeleted: false },
  { id: 'exp-2', name: 'Tea', amount: 12, quantity: 1, unitPrice: 12, date: '2026-06-03', time: '09:00', notes: 'Tea joint stall', paymentMode: 'UPI', category: 'Food & Beverages', userId: 'user-001', isDeleted: false },
  { id: 'exp-3', name: 'Tea', amount: 15, quantity: 1, unitPrice: 15, date: '2026-06-05', time: '08:15', notes: 'Tapri morning hike', paymentMode: 'Cash', category: 'Food & Beverages', userId: 'user-001', isDeleted: false },

  // Petrol price tracking
  { id: 'exp-4', name: 'Petrol', amount: 200, quantity: 2, unitPrice: 100, date: '2026-06-01', time: '18:30', notes: 'Refueling scooter', paymentMode: 'UPI', category: 'Transportation', userId: 'user-001', isDeleted: false },
  { id: 'exp-5', name: 'Petrol', amount: 210, quantity: 2, unitPrice: 105, date: '2026-06-03', time: '17:40', notes: 'HP Station fuel', paymentMode: 'Credit Card', category: 'Transportation', userId: 'user-001', isDeleted: false },
  { id: 'exp-6', name: 'Petrol', amount: 220, quantity: 2, unitPrice: 110, date: '2026-06-05', time: '10:00', notes: 'Shell Premium fuel cost spike', paymentMode: 'UPI', category: 'Transportation', userId: 'user-001', isDeleted: false },

  // Sundry daily expenses
  { id: 'exp-7', name: 'Biscuit packet', amount: 5, quantity: 1, unitPrice: 5, date: '2026-06-01', time: '16:00', notes: 'Parle-G with tea', paymentMode: 'Cash', category: 'Food & Beverages', userId: 'user-001', isDeleted: false },
  { id: 'exp-8', name: 'Bus Ticket', amount: 20, quantity: 1, unitPrice: 20, date: '2026-06-02', time: '09:15', notes: 'Office commute ticket', paymentMode: 'Cash', category: 'Transportation', userId: 'user-001', isDeleted: false },
  { id: 'exp-9', name: 'Water Bottle', amount: 20, quantity: 1, unitPrice: 20, date: '2026-06-02', time: '13:00', notes: 'Kinley bottled water', paymentMode: 'Cash', category: 'Food & Beverages', userId: 'user-001', isDeleted: false },
  { id: 'exp-10', name: 'Groceries store bill', amount: 1450, quantity: 1, unitPrice: 1450, date: '2026-06-02', time: '20:15', notes: 'Vegies and dairy restock', paymentMode: 'UPI', category: 'Food & Beverages', userId: 'user-001', isDeleted: false },
  { id: 'exp-11', name: 'Netflix Premium subscription', amount: 649, quantity: 1, unitPrice: 649, date: '2026-06-01', time: '00:05', notes: 'Autodeduct monthly billing', paymentMode: 'Credit Card', category: 'Entertainment', userId: 'user-001', isDeleted: false },
  { id: 'exp-12', name: 'Electricity Bill', amount: 3200, quantity: 1, unitPrice: 3200, date: '2026-06-02', time: '10:30', notes: 'Summer AC usage bill', paymentMode: 'Bank Transfer', category: 'Household', userId: 'user-001', isDeleted: false },
  { id: 'exp-13', name: 'Medicine prescription', amount: 430, quantity: 1, unitPrice: 430, date: '2026-06-03', time: '14:20', notes: 'Allergy refills', paymentMode: 'Debit Card', category: 'Healthcare', userId: 'user-001', isDeleted: false },
  { id: 'exp-14', name: 'Summer Linen Shirt', amount: 1800, quantity: 1, unitPrice: 1800, date: '2026-06-04', time: '19:40', notes: 'Weekend shopping trip', paymentMode: 'Credit Card', category: 'Shopping', userId: 'user-001', isDeleted: false },
  { id: 'exp-15', name: 'Cinema ticket', amount: 350, quantity: 2, unitPrice: 175, date: '2026-06-04', time: '21:00', notes: 'Action movie release', paymentMode: 'UPI', category: 'Entertainment', userId: 'user-001', isDeleted: false },
  
  // Historical month expense matches for Manual Entry summary reports
  { id: 'exp-jan-rent', name: 'Rent & Groceries Package', amount: 32000, quantity: 1, unitPrice: 32000, date: '2026-01-15', time: '10:00', notes: 'Historical Rent plus groceries', paymentMode: 'Bank Transfer', category: 'Household', userId: 'user-001', isDeleted: false },
  { id: 'exp-feb-rent', name: 'Rent & Commute Package', amount: 34000, quantity: 1, unitPrice: 34000, date: '2026-02-15', time: '10:00', notes: 'Historical rent plus transit', paymentMode: 'Bank Transfer', category: 'Household', userId: 'user-001', isDeleted: false }
];

export const INITIAL_MANUAL_INCOMES: ManualIncome[] = [
  { id: 'minc-01', userId: 'user-001', month: 'Jan', year: 2026, salary: 50000, freelance: 5000, business: 0, other: 2000, total: 57000 },
  { id: 'minc-02', userId: 'user-001', month: 'Feb', year: 2026, salary: 58000, freelance: 0, business: 0, other: 0, total: 58000 },
  { id: 'minc-03', userId: 'user-001', month: 'Jun', year: 2026, salary: 60000, freelance: 8000, business: 0, other: 2000, total: 70000 }
];

export const INITIAL_MANUAL_SAVINGS: ManualSavings[] = [
  { id: 'msav-01', userId: 'user-001', month: 'Jan', year: 2026, targetSavings: 10000, actualSavings: 8500, investment: 3000, emergencyFund: 0, notes: 'Saved slightly less due to winter shopping & parties.' },
  { id: 'msav-02', userId: 'user-001', month: 'Feb', year: 2026, targetSavings: 12000, actualSavings: 10000, investment: 4000, emergencyFund: 0, notes: 'On track with investment portfolio additions.' },
  { id: 'msav-03', userId: 'user-001', month: 'Jun', year: 2026, targetSavings: 15000, actualSavings: 12000, investment: 5000, emergencyFund: 2000, notes: 'June monsoon planning budget entries.' }
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'bdg-1', name: 'Daily Refreshments Limit', targetAmount: 5000, categoryId: 'cat-1', userId: 'user-001', isDeleted: false },
  { id: 'bdg-2', name: 'Commute & Travel Budget', targetAmount: 3000, categoryId: 'cat-2', userId: 'user-001', isDeleted: false },
  { id: 'bdg-3', name: 'Shopping Wardrobe Budget', targetAmount: 4000, categoryId: 'cat-4', userId: 'user-001', isDeleted: false },
  { id: 'bdg-4', name: 'Utilities & AC Bill Cap', targetAmount: 8500, categoryId: 'cat-3', userId: 'user-001', isDeleted: false }
];

export const INITIAL_RECURRING: RecurringExpense[] = [
  { id: 'rec-1', name: 'House Rental Fee', amount: 15000, category: 'Household', frequency: 'Monthly', nextDueDate: '2026-06-10', isActive: true, notes: 'Direct landlord transfer', userId: 'user-001', isDeleted: false },
  { id: 'rec-2', name: 'Car Loan EMI', amount: 8200, category: 'Transportation', frequency: 'Monthly', nextDueDate: '2026-06-15', isActive: true, notes: 'Auto-debit mandate HDFC', userId: 'user-001', isDeleted: false },
  { id: 'rec-3', name: 'Netflix Premium Auto', amount: 649, category: 'Entertainment', frequency: 'Monthly', nextDueDate: '2026-07-01', isActive: true, notes: 'Card transaction online', userId: 'user-001', isDeleted: false },
  { id: 'rec-4', name: 'Annual Server Rent', amount: 4500, category: 'Household', frequency: 'Yearly', nextDueDate: '2026-12-24', isActive: true, notes: 'Cloud hosting bill', userId: 'user-001', isDeleted: false },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'sv-1', name: 'Ather Electric Scooter', targetAmount: 150000, savedAmount: 45000, targetDate: '2026-12-31', notes: 'Eco-friendly urban commute ride', userId: 'user-001', isDeleted: false },
  { id: 'sv-2', name: 'Apple MacBook Pro M4', targetAmount: 80000, savedAmount: 35000, targetDate: '2026-09-30', notes: 'For high power development', userId: 'user-001', isDeleted: false },
  { id: 'sv-3', name: 'Emergency Safety Fund', targetAmount: 500000, savedAmount: 180000, targetDate: '2027-06-01', notes: '6 months of total security living', userId: 'user-001', isDeleted: false },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'nt-1', type: 'budget_exceeded', message: "🚨 Wardrobe Shopping exceeded 80% mark of monthly budget!", date: '2026-06-04', read: false },
  { id: 'nt-2', type: 'upcoming_emi', message: "⏱️ House rent bill (₹15,000) is scheduled to trigger on 2026-06-10", date: '2026-06-05', read: false },
  { id: 'nt-3', type: 'unusual_spending', message: "💡 Spent ₹540 total on tea and biscuits this week—up 18% from last week's average.", date: '2026-06-05', read: false }
];

export const INITIAL_LOGS: UserActivityLog[] = [
  { id: 'log-1', userId: 'user-001', timestamp: '2026-06-05T01:00:00Z', actionDescription: "Created new 'Linen Shirt' purchase entry under Shopping category.", category: 'Expense' },
  { id: 'log-2', userId: 'user-001', timestamp: '2026-06-05T02:00:00Z', actionDescription: "Configured target budget limit for Transportation group up to ₹3,000.", category: 'Budget' },
];

// Helper to calculate product price history from expense history in real-time
export function calculateProductPriceHistory(expenses: Expense[]): ProductPriceTracker[] {
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  
  // Group by item name lowercase
  const grouped: Record<string, { originalName: string, points: { date: string, price: number }[] }> = {};
  
  activeExpenses.forEach(exp => {
    const key = exp.name.trim().toLowerCase();
    if (!key) return;
    
    // Calculate unit price as amount divided by quantity
    const price = exp.unitPrice || (exp.amount / (exp.quantity || 1));
    
    if (!grouped[key]) {
      grouped[key] = {
        originalName: exp.name,
        points: []
      };
    }
    grouped[key].points.push({
      date: exp.date,
      price: price
    });
  });
  
  return Object.keys(grouped).map(key => {
    const { originalName, points } = grouped[key];
    
    // Sort points chronologically
    const sortedPoints = [...points].sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate unique prices chronologically
    const uniqueHistoryPoints: { date: string, price: number }[] = [];
    const datePriceSeen: Record<string, number> = {};
    
    sortedPoints.forEach(p => {
      datePriceSeen[p.date] = p.price; // Keep the latest price recorded on that date
    });
    
    Object.keys(datePriceSeen).sort().forEach(d => {
      uniqueHistoryPoints.push({
        date: d,
        price: datePriceSeen[d]
      });
    });

    const prices = uniqueHistoryPoints.map(p => p.price);
    const sum = prices.reduce((acc, p) => acc + p, 0);
    const averageCost = prices.length ? sum / prices.length : 0;
    
    let priceIncreasePercent = 0;
    if (prices.length > 1) {
      const oldest = prices[0];
      const newest = prices[prices.length - 1];
      if (oldest > 0) {
        priceIncreasePercent = ((newest - oldest) / oldest) * 100;
      }
    }
    
    return {
      name: originalName,
      history: uniqueHistoryPoints,
      averageCost: Number(averageCost.toFixed(2)),
      priceIncreasePercent: Number(priceIncreasePercent.toFixed(1))
    };
  }).filter(p => p.history.length > 0);
}

// Initialise storage helper
export function getSavedState<T>(key: string, defaultData: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
  } catch (error) {
    console.error('Storage parse failed for key: ' + key, error);
    return defaultData;
  }
}

export function saveState<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Storage write failed for key: ' + key, error);
  }
}
