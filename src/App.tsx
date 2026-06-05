/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Expense, Income, Budget, Category, RecurringExpense, SavingsGoal, Notification, UserActivityLog, PaymentMode, ManualIncome, ManualSavings, RecurrentFrequency
} from './types';
import { 
  DEFAULT_CATEGORIES, INITIAL_INCOMES, INITIAL_EXPENSES, INITIAL_BUDGETS, INITIAL_RECURRING, INITIAL_SAVINGS_GOALS, INITIAL_NOTIFICATIONS, INITIAL_LOGS,
  INITIAL_MANUAL_INCOMES, INITIAL_MANUAL_SAVINGS,
  calculateProductPriceHistory, getSavedState, saveState 
} from './utils/dataStore';
import { 
  CategoryPieChart, MonthlyTrendLineChart, IncomeExpenseBarChart, SpendingHeatmap, ProductPriceTracking
} from './components/SVGCharts';
import { 
  Wallet, TrendingUp, Calendar, AlertTriangle, User as UserIcon, PlusCircle, Search, Trash2, Edit, 
  Settings, LogIn, LogOut, Mic, Crop, MessageSquare, Download, CheckCircle, RefreshCw, 
  HelpCircle, Eye, ShieldAlert, Check, Plus, Minus, DollarSign
} from 'lucide-react';

// Unified Premium Theme Constants
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Beverages': '#f59e0b',
  'Transportation': '#3b82f6',
  'Household': '#10b981',
  'Shopping': '#ec4899',
  'Healthcare': '#ef4444',
  'Entertainment': '#8b5cf6',
};

export default function App() {
  // --- Standard Local State Syncs ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const val = getSavedState<User | null>('tracker_user', null);
    if (val) {
      if (!val.password) val.password = 'password123';
      return val;
    }
    return {
      id: 'user-001',
      name: 'Madaesh Per',
      email: 'madaeshper1@gmail.com',
      mobile: '+91 98765 43210',
      role: 'user',
      createdAt: '2026-06-01',
      password: 'password123'
    };
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => getSavedState<Expense[]>('tracker_expenses', INITIAL_EXPENSES));
  const [incomes, setIncomes] = useState<Income[]>(() => getSavedState<Income[]>('tracker_incomes', INITIAL_INCOMES));
  const [categories, setCategories] = useState<Category[]>(() => getSavedState<Category[]>('tracker_categories', DEFAULT_CATEGORIES));
  const [budgets, setBudgets] = useState<Budget[]>(() => getSavedState<Budget[]>('tracker_budgets', INITIAL_BUDGETS));
  const [recurrings, setRecurrings] = useState<RecurringExpense[]>(() => getSavedState<RecurringExpense[]>('tracker_recurrings', INITIAL_RECURRING));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => getSavedState<SavingsGoal[]>('tracker_goals', INITIAL_SAVINGS_GOALS));
  const [notifications, setNotifications] = useState<Notification[]>(() => getSavedState<Notification[]>('tracker_notifications', INITIAL_NOTIFICATIONS));
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>(() => getSavedState<UserActivityLog[]>('tracker_logs', INITIAL_LOGS));

  // --- Manual monthly income & savings module states ---
  const [manualIncomes, setManualIncomes] = useState<ManualIncome[]>(() => getSavedState<ManualIncome[]>('tracker_manual_incomes', INITIAL_MANUAL_INCOMES));
  const [manualSavings, setManualSavings] = useState<ManualSavings[]>(() => getSavedState<ManualSavings[]>('tracker_manual_savings', INITIAL_MANUAL_SAVINGS));
  const [budgetMonth, setBudgetMonth] = useState<string>('Jun');
  const [budgetYear, setBudgetYear] = useState<number>(2026);

  // Form edit states for manual budgeting
  const [isEditingIncome, setIsEditingIncome] = useState<boolean>(false);
  const [isEditingSavings, setIsEditingSavings] = useState<boolean>(false);

  const [formSalary, setFormSalary] = useState<string>('');
  const [formFreelance, setFormFreelance] = useState<string>('');
  const [formBusiness, setFormBusiness] = useState<string>('');
  const [formOther, setFormOther] = useState<string>('');

  const [formTargetSavings, setFormTargetSavings] = useState<string>('');
  const [formActualSavings, setFormActualSavings] = useState<string>('');
  const [formInvestment, setFormInvestment] = useState<string>('');
  const [formEmergencyFund, setFormEmergencyFund] = useState<string>('');
  const [formSavingsNotes, setFormSavingsNotes] = useState<string>('');

  // Simulated Global Users List for Admin panel
  const [usersList, setUsersList] = useState<User[]>(() => {
    const list = getSavedState<User[]>('tracker_global_users', [
      { id: 'user-001', name: 'Madaesh Per', email: 'madaeshper1@gmail.com', mobile: '+91 98765 43210', role: 'user', createdAt: '2026-06-01', password: 'password123' },
      { id: 'admin-001', name: 'System Root', email: 'admin@finance.gov', mobile: '+91 00000 00000', role: 'admin', createdAt: '2026-05-01', password: 'password123' },
      { id: 'user-002', name: 'Raj Patel', email: 'raj@outlook.com', mobile: '+91 98980 12345', role: 'user', createdAt: '2026-06-02', password: 'password123' }
    ]);
    return list.map(u => {
      if (!u.password) u.password = 'password123';
      return u;
    });
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'analytics' | 'budgets' | 'goals' | 'admin' | 'profile' | 'manual-budgeting'>('dashboard');
  
  // Custom alerts triggers
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Auto clear toasts helper
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Save all offline changes to localStorage whenever they are updated
  useEffect(() => {
    saveState('tracker_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveState('tracker_expenses', expenses);
    checkBudgetLimits();
  }, [expenses]);

  useEffect(() => {
    saveState('tracker_incomes', incomes);
  }, [incomes]);

  useEffect(() => {
    saveState('tracker_categories', categories);
  }, [categories]);

  useEffect(() => {
    saveState('tracker_budgets', budgets);
  }, [budgets]);

  useEffect(() => {
    saveState('tracker_recurrings', recurrings);
  }, [recurrings]);

  useEffect(() => {
    saveState('tracker_goals', savingsGoals);
  }, [savingsGoals]);

  useEffect(() => {
    saveState('tracker_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveState('tracker_logs', activityLogs);
  }, [activityLogs]);

  useEffect(() => {
    saveState('tracker_global_users', usersList);
  }, [usersList]);

  useEffect(() => {
    saveState('tracker_manual_incomes', manualIncomes);
  }, [manualIncomes]);

  useEffect(() => {
    saveState('tracker_manual_savings', manualSavings);
  }, [manualSavings]);

  // --- Universal Record Editor Module States ---
  const [editingType, setEditingType] = useState<'expense' | 'income' | 'savingsGoal' | 'budget' | 'category' | 'productPrice' | 'recurringExpense' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<any>({});

  const handleStartEdit = (type: 'expense' | 'income' | 'savingsGoal' | 'budget' | 'category' | 'productPrice' | 'recurringExpense', id: string) => {
    setEditingType(type);
    setEditingId(id);
    
    if (type === 'expense') {
      const found = expenses.find(e => e.id === id);
      if (found) {
        setEditFields({
          name: found.name,
          amount: found.amount.toString(),
          quantity: found.quantity.toString(),
          unitPrice: (found.unitPrice || found.amount / (found.quantity || 1)).toString(),
          paymentMode: found.paymentMode,
          date: found.date,
          category: found.category,
          notes: found.notes || ''
        });
      }
    } else if (type === 'income') {
      const found = incomes.find(i => i.id === id);
      if (found) {
        setEditFields({
          source: found.source,
          amount: found.amount.toString(),
          date: found.date,
          notes: found.notes || ''
        });
      }
    } else if (type === 'savingsGoal') {
      const found = savingsGoals.find(g => g.id === id);
      if (found) {
        setEditFields({
          name: found.name,
          targetAmount: found.targetAmount.toString(),
          savedAmount: found.savedAmount.toString(),
          targetDate: found.targetDate,
          notes: found.notes || ''
        });
      }
    } else if (type === 'budget') {
      const found = budgets.find(b => b.id === id);
      if (found) {
        setEditFields({
          name: found.name,
          targetAmount: found.targetAmount.toString(),
          categoryId: found.categoryId
        });
      }
    } else if (type === 'category') {
      const found = categories.find(c => c.id === id);
      if (found) {
        setEditFields({
          name: found.name,
          color: found.color
        });
      }
    } else if (type === 'productPrice') {
      const trackers = calculateProductPriceHistory(expenses);
      const tracker = trackers.find(t => t.name.trim().toLowerCase() === id.trim().toLowerCase());
      if (tracker) {
        setEditFields({
          name: tracker.name,
          unitPrice: tracker.history[tracker.history.length - 1]?.price.toString() || '0'
        });
      } else {
        setEditFields({
          name: id,
          unitPrice: '0'
        });
      }
    } else if (type === 'recurringExpense') {
      const found = recurrings.find(r => r.id === id);
      if (found) {
        setEditFields({
          name: found.name,
          amount: found.amount.toString(),
          category: found.category,
          frequency: found.frequency,
          nextDueDate: found.nextDueDate,
          isActive: found.isActive,
          notes: found.notes || ''
        });
      }
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType || !editingId) return;

    if (editingType === 'expense') {
      const amt = parseFloat(editFields.amount);
      const qty = parseInt(editFields.quantity) || 1;
      const unitP = parseFloat(editFields.unitPrice) || 0;
      const finalAmt = isNaN(amt) ? (unitP * qty) : amt;

      if (!editFields.name || !editFields.name.trim()) {
        setErrorToast('Expense product name cannot be blank.');
        return;
      }
      if (isNaN(finalAmt) || finalAmt < 0) {
        setErrorToast('Amount sum must be positive.');
        return;
      }

      setExpenses(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: editFields.name.trim(),
            amount: finalAmt,
            quantity: qty,
            unitPrice: unitP,
            paymentMode: editFields.paymentMode,
            date: editFields.date,
            category: editFields.category,
            notes: editFields.notes
          };
        }
        return item;
      }));
      setSuccessToast('Record updated successfully.');
      logActivity(`Updated expense transaction details: "${editFields.name.trim()}"`, 'Expense');

    } else if (editingType === 'income') {
      const amt = parseFloat(editFields.amount);
      if (!editFields.source || !editFields.source.trim()) {
        setErrorToast('Income resource source cannot be blank.');
        return;
      }
      if (isNaN(amt) || amt < 0) {
        setErrorToast('Amount must be positive.');
        return;
      }

      setIncomes(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            source: editFields.source.trim(),
            amount: amt,
            date: editFields.date,
            notes: editFields.notes
          };
        }
        return item;
      }));
      setSuccessToast('Record updated successfully.');
      logActivity(`Updated deposit income source details: "${editFields.source.trim()}"`, 'Income');

    } else if (editingType === 'savingsGoal') {
      const target = parseFloat(editFields.targetAmount);
      const saved = parseFloat(editFields.savedAmount);
      if (!editFields.name || !editFields.name.trim()) {
        setErrorToast('Savings goal name cannot be blank.');
        return;
      }
      if (isNaN(target) || target <= 0) {
        setErrorToast('Target goal budget must be positive.');
        return;
      }
      if (isNaN(saved) || saved < 0) {
        setErrorToast('Saved progress cannot be negative.');
        return;
      }

      setSavingsGoals(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: editFields.name.trim(),
            targetAmount: target,
            savedAmount: saved,
            targetDate: editFields.targetDate,
            notes: editFields.notes
          };
        }
        return item;
      }));
      setSuccessToast('Record updated successfully.');
      logActivity(`Updated savings milestone goal config: "${editFields.name.trim()}"`, 'Savings');

    } else if (editingType === 'budget') {
      const target = parseFloat(editFields.targetAmount);
      if (!editFields.name || !editFields.name.trim()) {
        setErrorToast('Budget tag label cannot be blank.');
        return;
      }
      if (isNaN(target) || target <= 0) {
        setErrorToast('Target limit amount must be positive.');
        return;
      }

      setBudgets(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: editFields.name.trim(),
            targetAmount: target,
            categoryId: editFields.categoryId
          };
        }
        return item;
      }));
      setSuccessToast('Record updated successfully.');
      logActivity(`Updated planned budget capacity limits: "${editFields.name.trim()}"`, 'Budget');

    } else if (editingType === 'category') {
      if (!editFields.name || !editFields.name.trim()) {
        setErrorToast('Category catalog tag cannot be blank.');
        return;
      }

      const prevName = categories.find(c => c.id === editingId)?.name || '';
      const newName = editFields.name.trim();

      setCategories(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: newName,
            color: editFields.color
          };
        }
        return item;
      }));

      if (prevName && prevName !== newName) {
        setExpenses(prev => prev.map(exp => exp.category === prevName ? { ...exp, category: newName } : exp));
        setRecurrings(prev => prev.map(rec => rec.category === prevName ? { ...rec, category: newName } : rec));
        if (CATEGORY_COLORS[prevName]) {
          CATEGORY_COLORS[newName] = editFields.color;
        }
      }

      setSuccessToast('Record updated successfully.');
      logActivity(`Updated catalog categories: "${newName}"`, 'Category');

    } else if (editingType === 'productPrice') {
      const price = parseFloat(editFields.unitPrice);
      if (isNaN(price) || price < 0) {
        setErrorToast('Price must be a valid positive amount.');
        return;
      }

      const targetProdName = editingId.trim().toLowerCase();
      setExpenses(prev => prev.map(exp => {
        if (exp.name.trim().toLowerCase() === targetProdName) {
          const qty = exp.quantity || 1;
          const newAmt = price * qty;
          return {
            ...exp,
            unitPrice: price,
            amount: newAmt
          };
        }
        return exp;
      }));

      setSuccessToast('Record updated successfully.');
      logActivity(`Bulk adjusted price updates for tracked product "${editingId}" to ₹${price}`, 'Product Price');

    } else if (editingType === 'recurringExpense') {
      const amt = parseFloat(editFields.amount);
      if (!editFields.name || !editFields.name.trim()) {
        setErrorToast('Recurring item name cannot be blank.');
        return;
      }
      if (isNaN(amt) || amt <= 0) {
        setErrorToast('Billing rate must be positive.');
        return;
      }

      setRecurrings(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: editFields.name.trim(),
            amount: amt,
            category: editFields.category,
            frequency: editFields.frequency,
            nextDueDate: editFields.nextDueDate,
            isActive: editFields.isActive,
            notes: editFields.notes
          };
        }
        return item;
      }));
      setSuccessToast('Record updated successfully.');
      logActivity(`Updated recurring auto billing rules: "${editFields.name.trim()}"`, 'Recurring Scheduler');
    }

    setEditingType(null);
    setEditingId(null);
  };

  const handleDeleteIncome = (id: string, name: string) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, isDeleted: true } : i));
    setSuccessToast(`Deleted deposit income entry: "${name}"`);
    logActivity(`Deleted daily income deposit record: "${name}"`, 'Income');
  };

  const handleDeleteSavingsGoal = (id: string, name: string) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, isDeleted: true } : g));
    setSuccessToast(`Deleted savings financial milestone: "${name}"`);
    logActivity(`Deleted savings milestone target: "${name}"`, 'Savings');
  };

  const handleDeleteBudget = (id: string, name: string) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, isDeleted: true } : b));
    setSuccessToast(`Deleted budget limit plan: "${name}"`);
    logActivity(`Deleted planned budget limit cap: "${name}"`, 'Budget');
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setSuccessToast(`Removed category catalog option: "${name}"`);
    logActivity(`Removed category index from system dictionary: "${name}"`, 'Category');
  };

  // Log user activity Helper
  const logActivity = (action: string, category: string) => {
    const newLog: UserActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      timestamp: new Date().toISOString(),
      actionDescription: action,
      category,
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Process and triggers all budget thresholds check on active categories
  const checkBudgetLimits = () => {
    const activeExps = expenses.filter(e => !e.isDeleted);
    budgets.forEach(budget => {
      // Find category
      const categoryObj = categories.find(c => c.id === budget.categoryId);
      if (!categoryObj) return;

      const spent = activeExps
        .filter(e => e.category === categoryObj.name)
        .reduce((sum, e) => sum + e.amount, 0);

      if (spent >= budget.targetAmount) {
        // Trigger alert if not already logged
        const alertMsg = `⚠️ Critical: Your ${categoryObj.name} spending (₹${spent}) has exceeded the configured budget cap of ₹${budget.targetAmount}!`;
        const exists = notifications.some(n => n.message === alertMsg);
        if (!exists) {
          const newAlert: Notification = {
            id: `nt-${Date.now()}`,
            type: 'budget_exceeded',
            message: alertMsg,
            date: new Date().toISOString().split('T')[0],
            read: false,
          };
          setNotifications(prev => [newAlert, ...prev]);
        }
      }
    });
  };

  // --- Auth Simulation ---
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMobile, setAuthMobile] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // --- User Profile Management States & Handlers ---
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileMobile, setProfileMobile] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Synchronize profile views from currentUser
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfileMobile(currentUser.mobile || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!profileName.trim() || profileName.trim().length < 2) {
      setErrorToast('Please enter a valid display name (at least 2 letters).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(profileEmail)) {
      setErrorToast('Please enter a valid email address layout.');
      return;
    }

    // Verify unique email
    const otherWithEmail = usersList.find(u => u.id !== currentUser.id && u.email.toLowerCase() === profileEmail.toLowerCase());
    if (otherWithEmail) {
      setErrorToast('This email is already linked to another active account.');
      return;
    }

    const cleanMobile = profileMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorToast('Please enter a valid mobile number with at least 10 digits.');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      name: profileName.trim(),
      email: profileEmail.toLowerCase().trim(),
      mobile: profileMobile.trim(),
    };

    // Update state & persist
    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    setSuccessToast('Personal profiles updated! Changes successfully synchronized.');
    logActivity(`Manually altered display name ("${profileName.trim()}") & email ("${profileEmail.trim()}")`, 'Profile Manager');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!currentPassword) {
      setErrorToast('Please provide your Current Access Password.');
      return;
    }

    if (currentUser.password && currentUser.password !== currentPassword) {
      setErrorToast('Verification failed: Current Access Password is incorrect.');
      return;
    }

    if (newPassword.length < 5) {
      setErrorToast('Strategic safety rule: New Password must be at least 5 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorToast('Verification failed: New Password does not match Password Confirmation.');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      password: newPassword,
    };

    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    setSuccessToast('🎉 Auth credentials changed! New Access Password established successfully.');
    logActivity('Executed secure profile passcode update credentials check successfully', 'Profile Manager');

    // Clear fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setErrorToast('Please enter both Email and Password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(authEmail)) {
      setErrorToast('Please enter a valid email address.');
      return;
    }

    if (authPassword.length < 5) {
      setErrorToast('Access Password must be at least 5 characters.');
      return;
    }

    // Simple user query matching
    const matched = usersList.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
    
    if (matched) {
      // Validate password
      if (matched.password && matched.password !== authPassword) {
        setErrorToast('Invalid password credentials. Please verify your Password.');
        logActivity(`Failed login attempt for email: ${authEmail}`, 'Authentication');
        return;
      }
      
      setCurrentUser(matched);
      setSuccessToast(`Welcome back, ${matched.name}!`);
      logActivity(`Logged in successfully via email: ${matched.email}`, 'Authentication');
    } else {
      if (isRegistering) {
        if (!authName || authName.trim().length < 2) {
          setErrorToast('Please enter a valid display name (at least 2 characters).');
          return;
        }
        
        const cleanMobile = authMobile.replace(/\D/g, '');
        if (cleanMobile.length < 10) {
          setErrorToast('Please enter a valid contact number with at least 10 digits.');
          return;
        }
      }

      // Create new account
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: authName.trim() || authEmail.split('@')[0],
        email: authEmail.toLowerCase().trim(),
        mobile: authMobile || '+91 99999 99999',
        role: 'user',
        createdAt: new Date().toISOString().split('T')[0],
        password: authPassword,
      };
      setUsersList(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setSuccessToast(`Account created successfully for ${newUser.name}!`);
      logActivity(`Registered user profile ${newUser.email}`, 'Authentication');
    }
  };

  const executeBypass = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      const adminAcc = usersList.find(u => u.role === 'admin') || {
        id: 'admin-001',
        name: 'System Root',
        email: 'admin@finance.gov',
        mobile: '+91 00000 00000',
        role: 'admin' as const,
        createdAt: '2026-05-01'
      };
      setCurrentUser(adminAcc);
      setSuccessToast('Switched Session: Administrator privileges loaded.');
      logActivity('Bypassed session to System Admin context', 'Authentication');
    } else {
      const userAcc = usersList.find(u => u.role === 'user') || {
        id: 'user-001',
        name: 'Madaesh Per',
        email: 'madaeshper1@gmail.com',
        mobile: '+91 98765 43210',
        role: 'user' as const,
        createdAt: '2026-06-01'
      };
      setCurrentUser(userAcc);
      setSuccessToast('Switched Session: Standard User loaded.');
      logActivity('Bypassed session to Standard User context', 'Authentication');
    }
  };

  const handleLogout = () => {
    logActivity(`Session logged out for ${currentUser?.email}`, 'Authentication');
    setCurrentUser(null);
    setSuccessToast('Logged out of workspace.');
  };

  // --- Manual monthly income & savings event handlers ---
  const initIncomeForm = (m: string, y: number) => {
    const found = manualIncomes.find(i => i.month === m && i.year === y && i.userId === (currentUser?.id || 'guest'));
    if (found) {
      setFormSalary(found.salary.toString());
      setFormFreelance(found.freelance.toString());
      setFormBusiness(found.business.toString());
      setFormOther(found.other.toString());
    } else {
      setFormSalary('0');
      setFormFreelance('0');
      setFormBusiness('0');
      setFormOther('0');
    }
  };

  const initSavingsForm = (m: string, y: number) => {
    const found = manualSavings.find(s => s.month === m && s.year === y && s.userId === (currentUser?.id || 'guest'));
    if (found) {
      setFormTargetSavings(found.targetSavings.toString());
      setFormActualSavings(found.actualSavings.toString());
      setFormInvestment(found.investment.toString());
      setFormEmergencyFund(found.emergencyFund.toString());
      setFormSavingsNotes(found.notes);
    } else {
      setFormTargetSavings('0');
      setFormActualSavings('0');
      setFormInvestment('0');
      setFormEmergencyFund('0');
      setFormSavingsNotes('');
    }
  };

  useEffect(() => {
    initIncomeForm(budgetMonth, budgetYear);
    initSavingsForm(budgetMonth, budgetYear);
  }, [budgetMonth, budgetYear, manualIncomes, manualSavings]);

  const handleSaveManualIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const sal = parseFloat(formSalary) || 0;
    const freel = parseFloat(formFreelance) || 0;
    const bus = parseFloat(formBusiness) || 0;
    const oth = parseFloat(formOther) || 0;
    const sumTotal = sal + freel + bus + oth;

    setManualIncomes(prev => {
      const idx = prev.findIndex(i => i.month === budgetMonth && i.year === budgetYear && i.userId === (currentUser?.id || 'guest'));
      if (idx !== -1) {
        const list = [...prev];
        list[idx] = {
          ...list[idx],
          salary: sal,
          freelance: freel,
          business: bus,
          other: oth,
          total: sumTotal
        };
        return list;
      } else {
        const record: ManualIncome = {
          id: `minc-${Date.now()}`,
          userId: currentUser?.id || 'guest',
          month: budgetMonth,
          year: budgetYear,
          salary: sal,
          freelance: freel,
          business: bus,
          other: oth,
          total: sumTotal
        };
        return [record, ...prev];
      }
    });

    setIsEditingIncome(false);
    setSuccessToast(`Income saved successfully for ${budgetMonth} ${budgetYear}!`);
    logActivity(`Manually entered/updated income for ${budgetMonth} ${budgetYear} (Total: ₹${sumTotal})`, 'Monthly Budgeting');
  };

  const handleSaveManualSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(formTargetSavings) || 0;
    const actual = parseFloat(formActualSavings) || 0;
    const invest = parseFloat(formInvestment) || 0;
    const emerg = parseFloat(formEmergencyFund) || 0;

    setManualSavings(prev => {
      const idx = prev.findIndex(s => s.month === budgetMonth && s.year === budgetYear && s.userId === (currentUser?.id || 'guest'));
      if (idx !== -1) {
        const list = [...prev];
        list[idx] = {
          ...list[idx],
          targetSavings: target,
          actualSavings: actual,
          investment: invest,
          emergencyFund: emerg,
          notes: formSavingsNotes
        };
        return list;
      } else {
        const record: ManualSavings = {
          id: `msav-${Date.now()}`,
          userId: currentUser?.id || 'guest',
          month: budgetMonth,
          year: budgetYear,
          targetSavings: target,
          actualSavings: actual,
          investment: invest,
          emergencyFund: emerg,
          notes: formSavingsNotes
        };
        return [record, ...prev];
      }
    });

    setIsEditingSavings(false);
    setSuccessToast(`Savings saved successfully for ${budgetMonth} ${budgetYear}!`);
    logActivity(`Manually entered/updated savings for ${budgetMonth} ${budgetYear} (Saved actual: ₹${actual})`, 'Monthly Budgeting');
  };

  // --- Background Hands-Off Auto Recurring Expenses Processor ---
  const [hasProcessedRecurring, setHasProcessedRecurring] = useState(false);

  useEffect(() => {
    if (!currentUser || hasProcessedRecurring || recurrings.length === 0) return;

    const currentTodayStr = new Date().toISOString().split('T')[0];
    let updatedRecurrings = [...recurrings];
    let createdExpenses: Expense[] = [];
    let stateChanged = false;

    updatedRecurrings = updatedRecurrings.map(rec => {
      // Process only active, non-deleted items whose scheduled due date has passed or is today
      if (rec.isActive && !rec.isDeleted && rec.nextDueDate <= currentTodayStr) {
        stateChanged = true;
        let runningDueDate = rec.nextDueDate;
        
        while (runningDueDate <= currentTodayStr) {
          // Unique deterministic ID to prevent redundant auto-logging on multiple renders
          const autoId = `exp-auto-${rec.id}-${runningDueDate}`;
          const isDuplicate = expenses.some(e => e.id === autoId || (e.name === `Recurring: ${rec.name}` && e.date === runningDueDate && !e.isDeleted));

          if (!isDuplicate) {
            const autoExp: Expense = {
              id: autoId,
              name: `Recurring: ${rec.name}`,
              amount: rec.amount,
              quantity: 1,
              unitPrice: rec.amount,
              date: runningDueDate,
              time: "09:00",
              notes: `Automatically executed standing billing charge. Frequency: ${rec.frequency}. Details: ${rec.notes || ''}`,
              paymentMode: 'Bank Transfer',
              category: rec.category,
              userId: currentUser.id,
              isDeleted: false
            };
            createdExpenses.push(autoExp);
          }

          // Advance next due date forward based on frequency
          const nextDate = new Date(runningDueDate);
          if (rec.frequency === 'Daily') nextDate.setDate(nextDate.getDate() + 1);
          else if (rec.frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
          else if (rec.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (rec.frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
          else nextDate.setMonth(nextDate.getMonth() + 1); // fallback Monthly

          runningDueDate = nextDate.toISOString().split('T')[0];
        }

        return { ...rec, nextDueDate: runningDueDate };
      }
      return rec;
    });

    if (stateChanged) {
      if (createdExpenses.length > 0) {
        setExpenses(prev => [...createdExpenses, ...prev]);
        
        // Push actual alerts/notifications for these charges automatically
        const newNotifications: Notification[] = createdExpenses.map((exp, idx) => ({
          id: `nt-auto-${Date.now()}-${idx}`,
          type: 'recurring_due',
          message: `🔄 Scheduled billing auto-executed: "${exp.name}" of ₹${exp.amount} cleared today for date ${exp.date}.`,
          date: currentTodayStr,
          read: false
        }));
        
        setNotifications(prev => [...newNotifications, ...prev]);
        setSuccessToast(`Auto-cleared ${createdExpenses.length} recurring billing charges!`);
        logActivity(`Automated scheduler processed & logged ${createdExpenses.length} due transactions`, 'Recurring Scheduler');
      }
      setRecurrings(updatedRecurrings);
    }
    setHasProcessedRecurring(true);
  }, [currentUser, recurrings, expenses, hasProcessedRecurring]);

  // --- Financial Summary calculations ---
  const activeExps = expenses.filter(e => !e.isDeleted);
  const activeIncs = incomes.filter(i => !i.isDeleted);

  // Today indicators
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = activeExps.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
  const todayIncomes = activeIncs.filter(i => i.date === todayStr).reduce((sum, i) => sum + i.amount, 0);

  // Month cumulative trackers
  const thisMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const monthExpenses = activeExps.filter(e => e.date.startsWith(thisMonthStr)).reduce((sum, e) => sum + e.amount, 0);
  const monthIncomes = activeIncs.filter(i => i.date.startsWith(thisMonthStr)).reduce((sum, i) => sum + i.amount, 0);
  const monthSavings = Math.max(0, monthIncomes - monthExpenses);
  const remainingTotalBalance = Math.max(0, activeIncs.reduce((sum, i) => sum + i.amount, 0) - activeExps.reduce((sum, e) => sum + e.amount, 0));

  // --- Manual Monthly Budgeting Calculations ---
  const activeManualIncomeObj = manualIncomes.find(
    i => i.month === budgetMonth && i.year === budgetYear && i.userId === (currentUser?.id || 'guest')
  );
  const activeManualIncomeVal = activeManualIncomeObj ? activeManualIncomeObj.total : 0;

  const activeManualSavingsObj = manualSavings.find(
    s => s.month === budgetMonth && s.year === budgetYear && s.userId === (currentUser?.id || 'guest')
  );
  const activeManualSavingsVal = activeManualSavingsObj ? activeManualSavingsObj.actualSavings : 0;
  const activeTargetSavingsVal = activeManualSavingsObj ? activeManualSavingsObj.targetSavings : 0;

  const monthNameToNumMap: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  const activeMonthNum = monthNameToNumMap[budgetMonth] || '06';
  const activeMonthYearStr = `${budgetYear}-${activeMonthNum}`;

  const trackedMonthExpenses = activeExps
    .filter(e => e.date.startsWith(activeMonthYearStr))
    .reduce((sum, e) => sum + e.amount, 0);

  // Remaining Balance = Income - Expenses - Manual Savings
  const manualRemainingBalance = activeManualIncomeVal - trackedMonthExpenses - activeManualSavingsVal;

  // Budget summaries
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.targetAmount, 0);
  const percentageBudgetUsed = totalBudgeted > 0 ? (monthExpenses / totalBudgeted) * 100 : 0;

  // --- Quick Add Handler ---
  const handleQuickAdd = (productName: string, amount: number, category: string) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      name: productName,
      amount,
      quantity: 1,
      unitPrice: amount,
      date: todayStr,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      notes: 'Quick logged via swift button shortcut',
      paymentMode: 'UPI',
      category,
      userId: currentUser?.id || 'guest',
      isDeleted: false,
    };
    setExpenses(prev => [newExp, ...prev]);
    setSuccessToast(`Quickly logged ₹${amount} on "${productName}"!`);
    logActivity(`Added quick expense of ₹${amount} for ${productName}`, 'Expense');
  };

  // --- Manual Add Forms ---
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Food & Beverages');
  const [expQty, setExpQty] = useState('1');
  const [expNotes, setExpNotes] = useState('');
  const [expPayment, setExpPayment] = useState<PaymentMode>('UPI');
  const [expDate, setExpDate] = useState(todayStr);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    const qty = parseInt(expQty) || 1;
    if (!expName || isNaN(amt) || amt <= 0) {
      setErrorToast('Please enter an Expense Name and positive Amount.');
      return;
    }

    const calculatedUnitPrice = amt / qty;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      name: expName,
      amount: amt,
      quantity: qty,
      unitPrice: Number(calculatedUnitPrice.toFixed(2)),
      date: expDate,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      notes: expNotes || 'Logged on web dash',
      paymentMode: expPayment,
      category: expCategory,
      userId: currentUser?.id || 'guest',
      isDeleted: false,
    };

    setExpenses(prev => [newExp, ...prev]);
    setSuccessToast(`Successfully added expense entry for "${expName}"!`);
    logActivity(`Created ledger transaction for "${expName}" value ₹${amt}`, 'Expense');

    // Reset Form fields
    setExpName('');
    setExpAmount('');
    setExpQty('1');
    setExpNotes('');
  };

  const [incSource, setIncSource] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDate, setIncDate] = useState(todayStr);
  const [incNotes, setIncNotes] = useState('');

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incAmount);
    if (!incSource || isNaN(amt) || amt <= 0) {
      setErrorToast('Please complete Source and value parameters for Income.');
      return;
    }

    const newInc: Income = {
      id: `inc-${Date.now()}`,
      source: incSource,
      amount: amt,
      date: incDate,
      notes: incNotes || 'Direct credit deposit entry',
      userId: currentUser?.id || 'guest',
      isDeleted: false,
    };

    setIncomes(prev => [newInc, ...prev]);
    setSuccessToast(`Income resource logged: ₹${amt} from ${incSource}`);
    logActivity(`Recorded income source deposit for "${incSource}" of ₹${amt}`, 'Income');

    setIncSource('');
    setIncAmount('');
    setIncNotes('');
  };

  // --- Search & Filters on ledger ---
  const [filterQuery, setFilterQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');

  const filteredExpenses = expenses.filter(e => {
    if (e.isDeleted) return false;
    
    // Search query matches product name or notes
    const matchesQuery = e.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
                         e.notes.toLowerCase().includes(filterQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || e.category === filterCategory;
    const matchesPayment = filterPayment === 'All' || e.paymentMode === filterPayment;
    
    const matchesStart = !filterDateStart || e.date >= filterDateStart;
    const matchesEnd = !filterDateEnd || e.date <= filterDateEnd;
    
    const minAmt = parseFloat(filterAmountMin);
    const maxAmt = parseFloat(filterAmountMax);
    const matchesMin = isNaN(minAmt) || e.amount >= minAmt;
    const matchesMax = isNaN(maxAmt) || e.amount <= maxAmt;

    return matchesQuery && matchesCategory && matchesPayment && matchesStart && matchesEnd && matchesMin && matchesMax;
  });

  const handleDeleteExpense = (id: string, name: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e));
    setSuccessToast(`Soft-deleted expense "${name}" from storage register.`);
    logActivity(`Flagged deletion toggle on transaction: "${name}"`, 'Expense');
  };

  // --- Recurring Expense Creation ---
  const [recName, setRecName] = useState('');
  const [recAmount, setRecAmount] = useState('');
  const [recCategory, setRecCategory] = useState('Food & Beverages');
  const [recFrequency, setRecFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [recStartDate, setRecStartDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(recAmount);
    if (!recName.trim() || recName.trim().length < 2) {
      setErrorToast('Please enter a valid expense name (at least 2 characters).');
      return;
    }
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setErrorToast('Please enter a positive transaction amount.');
      return;
    }
    if (!recStartDate) {
      setErrorToast('Please select a valid start date.');
      return;
    }

    const newRec: RecurringExpense = {
      id: `rec-${Date.now()}`,
      name: recName.trim(),
      amount: parsedAmt,
      category: recCategory,
      frequency: recFrequency,
      nextDueDate: recStartDate,
      isActive: true,
      notes: `Defined recurring auto-debit expense. Frequency: ${recFrequency}`,
      userId: currentUser?.id || 'guest',
      isDeleted: false,
    };

    setRecurrings(prev => [newRec, ...prev]);
    setSuccessToast(`Successfully scheduled automated recurring bill: "${recName.trim()}" at ₹${parsedAmt}!`);
    logActivity(`Registered recurring schedule for "${recName.trim()}" recurring ${recFrequency}`, 'Recurring Scheduler');

    // Reset inputs
    setRecName('');
    setRecAmount('');
    setRecCategory('Food & Beverages');
    setRecFrequency('Monthly');
    setRecStartDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteRecurring = (id: string, name: string) => {
    setRecurrings(prev => prev.map(rec => rec.id === id ? { ...rec, isDeleted: true } : rec));
    setSuccessToast(`Deleted recurring scheduler for "${name}".`);
    logActivity(`Deactivated and deleted recurring schedule key: "${name}"`, 'Recurring Scheduler');
  };

  const handleToggleRecurringActive = (id: string, name: string, currentState: boolean) => {
    setRecurrings(prev => prev.map(rec => rec.id === id ? { ...rec, isActive: !currentState } : rec));
    setSuccessToast(`${currentState ? 'Suspended' : 'Resumed'} recurring scheduler for "${name}".`);
    logActivity(`${currentState ? 'Suspended' : 'Resumed'} recurring transaction schedule: "${name}"`, 'Recurring Scheduler');
  };

  // --- Budgets Creation ---
  const [newBdgName, setNewBdgName] = useState('');
  const [newBdgCap, setNewBdgCap] = useState('');
  const [newBdgCatId, setNewBdgCatId] = useState('cat-1');

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(newBdgCap);
    if (!newBdgName || isNaN(cap) || cap <= 0) {
      setErrorToast('Please enter an explicit budget tag and target limit.');
      return;
    }

    const newBdg: Budget = {
      id: `bdg-${Date.now()}`,
      name: newBdgName,
      targetAmount: cap,
      categoryId: newBdgCatId,
      userId: currentUser?.id || 'guest',
      isDeleted: false,
    };

    setBudgets(prev => [...prev, newBdg]);
    setSuccessToast(`Created budget: ${newBdgName} with ₹${cap} Limit!`);
    logActivity(`Added budget planning item for ${newBdgName}`, 'Budget');

    setNewBdgName('');
    setNewBdgCap('');
  };

  // --- Savings Progress Increments ---
  const [savingAddAmt, setSavingAddAmt] = useState<Record<string, string>>({});

  const handleAddSavingProg = (goalId: string, amountStr: string) => {
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) {
      setErrorToast('Please enter a valid monetary slice to deposit.');
      return;
    }

    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedAmt = Math.min(g.targetAmount, g.savedAmount + val);
        if (updatedAmt >= g.targetAmount) {
          setSuccessToast(`🎉 Incredible! You reached your savings goal: "${g.name}"!`);
        } else {
          setSuccessToast(`Deposited ₹${val} into "${g.name}" goals fund!`);
        }
        return { ...g, savedAmount: updatedAmt };
      }
      return g;
    }));

    logActivity(`Added savings chunk of ₹${val} to goal tracker`, 'Savings');
    // Clear field
    setSavingAddAmt(prev => ({ ...prev, [goalId]: '' }));
  };

  // --- Category Addition ---
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#ec4899');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) {
      setErrorToast('Category catalog name is mandatory.');
      return;
    }

    const key = newCatName.trim();
    if (categories.some(c => c.name.toLowerCase() === key.toLowerCase())) {
      setErrorToast('Category tag already exists in index.');
      return;
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: key,
      isCustom: true,
      color: newCatColor,
    };

    setCategories(prev => [...prev, newCat]);
    setSuccessToast(`Category indexed: "${key}"`);
    logActivity(`Created Custom category index group: "${key}"`, 'Category');
    setNewCatName('');
  };

  // --- Admin actions ---
  const handleResetWorkspaceData = () => {
    if (window.confirm("Danger: Are you sure you want to restore all ledger entries, budgets, and trackers back to initial default seed values? This wipes any offline data!")) {
      setExpenses(INITIAL_EXPENSES);
      setIncomes(INITIAL_INCOMES);
      setCategories(DEFAULT_CATEGORIES);
      setBudgets(INITIAL_BUDGETS);
      setRecurrings(INITIAL_RECURRING);
      setSavingsGoals(INITIAL_SAVINGS_GOALS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setActivityLogs(INITIAL_LOGS);
      setSuccessToast("Finance system database reset has occurred.");
      logActivity("Full storage memory database reset triggered by Administrator.", "Admin System");
    }
  };

  // --- Export Reports ---
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Name/Source,Amount,Category,PaymentMode,Date,Notes\r\n';

    // Append active expenses
    expenses.filter(e => !e.isDeleted).forEach(e => {
      csvContent += `Expense,"${e.name}",${e.amount},"${e.category}","${e.paymentMode}",${e.date},"${e.notes}"\r\n`;
    });

    // Append active incomes
    incomes.filter(i => !i.isDeleted).forEach(i => {
      csvContent += `Income,"${i.source}",${i.amount},"Income Source","N/A",${i.date},"${i.notes}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const stamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Finance_Report_${stamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessToast("Ledger CSV list generated and downloaded successfully!");
    logActivity("Exported financial records tabular CSV spreadsheet.", "Reporting");
  };

  const triggerPDFPrint = () => {
    window.print();
    logActivity("Triggered desktop print workflow utility.", "Reporting");
  };

  // --- Gemini API endpoints proxies ---

  // 1. OCR File Scanner Image parsing
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setSuccessToast("Uploading receipt image to Gemini AI multi-modal OCR parser...");

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const resultString = reader.result as string;
        const base64Data = resultString.split(',')[1];
        const mimeType = file.type;

        const response = await fetch('/api/ai/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image: base64Data, mimeType })
        });

        const data = await response.json();
        if (data.parsed) {
          const parsed = data.parsed;
          // Hydrate forms
          setExpName(parsed.name || 'OCR Receipt Invoice');
          setExpAmount(parsed.amount ? String(parsed.amount) : '100');
          setExpQty(parsed.quantity ? String(parsed.quantity) : '1');
          setExpNotes(parsed.notes || 'Parsed automatically by Google Gemini AI Vision OCR.');
          if (parsed.category && categories.some(c => c.name === parsed.category)) {
            setExpCategory(parsed.category);
          }
          setSuccessToast("🎉 OCR Scanned! Form pre-filled from your physical slip receipt!");
          logActivity(`Scanned digital invoice slip through server-side OCR matching: "${parsed.name}"`, 'AI OCR');
        } else {
          setErrorToast(data.error || "Could not resolve bill content.");
        }
        setOcrLoading(false);
      };
      
      reader.onerror = (err) => {
        console.error("Reader error: ", err);
        setErrorToast("Image file read failure.");
        setOcrLoading(false);
      };
    } catch (err: any) {
      console.error(err);
      setErrorToast("Server OCR call failed: " + err.message);
      setOcrLoading(false);
    }
  };

  // 2. Voice Input Processing (Using Web Speech transcript or Gemini AI Translation)
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTextResult, setVoiceTextResult] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);

  const handleVoiceTrigger = () => {
    // Check Speech Recognition capability
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Simulate/Prompt manual typed text parse if browser blocks microphone
      const typed = window.prompt("Speech recognition API is unavailable or blocked in frame. Type custom vocal sentence to simulate, e.g:\n'Add Coffee 40 rupees with biscuits'\n- or -\n'Spent 500 on Petrol today'");
      if (typed) {
         processVoiceInstruction(typed);
      }
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsRecording(true);
        setVoiceTextResult('Listening to you... Describe product & amount (e.g., "Tea 15 rupees")');
      };

      rec.onerror = (e: any) => {
        console.error("Microphone error", e);
        setIsRecording(false);
        setErrorToast("Failed to lock microphone stream.");
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTextResult(transcript);
        processVoiceInstruction(transcript);
      };

      rec.start();
    } catch (e) {
      console.error(e);
      setErrorToast("Mic access rejected.");
    }
  };

  const processVoiceInstruction = async (text: string) => {
    setVoiceLoading(true);
    setSuccessToast(`Sending transcript "${text}" to AI parser...`);

    try {
      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceText: text })
      });
      const data = await response.json();
      if (data.parsed) {
        const parsed = data.parsed;

        // Auto commit to ledger
        const newExp: Expense = {
          id: `exp-${Date.now()}`,
          name: parsed.name || 'Voice Logged',
          amount: parsed.amount || 20,
          quantity: parsed.quantity || 1,
          unitPrice: parsed.unitPrice || parsed.amount || 20,
          date: todayStr,
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          notes: parsed.notes || `Transcribed text: "${text}"`,
          paymentMode: 'Cash',
          category: categories.some(c => c.name === parsed.category) ? parsed.category : 'Food & Beverages',
          userId: currentUser?.id || 'guest',
          isDeleted: false,
          addedByVoice: true,
        };

        setExpenses(prev => [newExp, ...prev]);
        setSuccessToast(`🎉 Voice Added! Created ${newExp.name} of ₹${newExp.amount}!`);
        logActivity(`Spoken entry converted to active expense: "${newExp.name}" of ₹${newExp.amount}`, 'AI Voice');
      } else {
        setErrorToast("Could not map transcript variables.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorToast("Voice service failed: " + err.message);
    } finally {
      setVoiceLoading(false);
    }
  };

  // 3. WhatsApp-style Multiline block Parser
  const [waText, setWaText] = useState('');
  const [waLoading, setWaLoading] = useState(false);

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waText.trim()) {
      setErrorToast("Input item block is empty.");
      return;
    }

    setWaLoading(true);
    setSuccessToast("AI is parsing your WhatsApp logs chunk...");

    try {
      const response = await fetch('/api/ai/whatsapp-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockText: waText })
      });
      const data = await response.json();
      if (data.expenses && Array.isArray(data.expenses)) {
        const newItems: Expense[] = data.expenses.map((ex: any, idx: number) => ({
          id: `exp-wa-${idx}-${Date.now()}`,
          name: ex.name || 'Fast entry item',
          amount: ex.amount || 10,
          quantity: ex.quantity || 1,
          unitPrice: ex.unitPrice || ex.amount || 10,
          date: todayStr,
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          notes: ex.notes || 'Instant WhatsApp block tag log',
          paymentMode: 'UPI',
          category: categories.some(c => c.name === ex.category) ? ex.category : 'Food & Beverages',
          userId: currentUser?.id || 'guest',
          isDeleted: false,
        }));

        setExpenses(prev => [...newItems, ...prev]);
        setSuccessToast(`🎉 Bulk Recorded! Instantly saved ${newItems.length} expenses into ledger!`);
        logActivity(`Parsed multi-line WhatsApp message block into ${newItems.length} records.`, 'AI Fast Add');
        setWaText('');
      } else {
        setErrorToast("No transactions were recognized.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorToast("WhatsApp block parser failed: " + err.message);
    } finally {
      setWaLoading(false);
    }
  };

  // 4. Monthly Spendings Insight analysis
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const queryAiInsights = async () => {
    setInsightsLoading(true);
    setSuccessToast("Consulting Gemini AI fiscal advisor...");

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses: expenses,
          budgets: budgets,
          incomes: incomes,
          categories: categories,
        })
      });
      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
        setSuccessToast("🎉 Updated! 5 new custom AI finance tips generated!");
        logActivity("Refreshed Gemini advisor spending projections panel.", "AI Advisor");
      }
    } catch (err: any) {
      console.error(err);
      setErrorToast("Failed to compile financial statistics tips.");
    } finally {
      setInsightsLoading(false);
    }
  };

  // Run on start layout
  useEffect(() => {
    if (currentUser) {
      queryAiInsights();
    }
  }, [currentUser]);

  // Handle auto recurrent increments
  const handleProcessUpcomingRecuring = (rec: RecurringExpense) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      name: `Recurring: ${rec.name}`,
      amount: rec.amount,
      quantity: 1,
      unitPrice: rec.amount,
      date: todayStr,
      time: "09:00",
      notes: `Scheduled frequency payment of ${rec.frequency}. Notes: ${rec.notes}`,
      paymentMode: 'Bank Transfer',
      category: rec.category,
      userId: currentUser?.id || 'guest',
      isDeleted: false,
    };

    setExpenses(prev => [newExp, ...prev]);

    // Push next target date forward depending on pattern
    const nextDate = new Date(rec.nextDueDate);
    if (rec.frequency === 'Daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (rec.frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (rec.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (rec.frequency === 'Quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
    else if (rec.frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

    setRecurrings(prev => prev.map(item => {
      if (item.id === rec.id) {
        return { ...item, nextDueDate: nextDate.toISOString().split('T')[0] };
      }
      return item;
    }));

    setSuccessToast(`Approved and processed ₹${rec.amount} payment for ${rec.name}!`);
    logActivity(`Manually approved scheduler payment: "${rec.name}" value ₹${rec.amount}`, 'Recurring Scheduler');
  };

  // --- Login Card Layout ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">

        <div className="max-w-md w-full space-y-8 relative z-10 animate-float-subtle">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-200 shadow-lg shadow-indigo-500/10 mb-4">
              <Wallet className="w-9 h-9" />
            </div>
            <h1 className="text-4xl font-black tracking-tight font-display text-slate-900">
              Wealth<span className="text-indigo-600">Engine</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-semibold tracking-wide uppercase">
              Advanced Expense Management, Smart OCR, & Gemini Pro Insights
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
            <h3 className="text-lg font-bold text-slate-850 mb-6 text-center">
              {isRegistering ? 'Create Wealth Management Account' : 'Authenticate Dashboard Access'}
            </h3>

            <form onSubmit={handleLogin} className="space-y-5">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Display Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Madaesh Per" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Contact Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="+91 98765 43210" 
                      value={authMobile}
                      onChange={(e) => setAuthMobile(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="madaeshper1@gmail.com" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Access Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 px-4 font-semibold hover:opacity-95 transition-opacity pointer-events-auto"
              >
                {isRegistering ? 'Register & Log In' : 'Enter Workspace'}
              </button>
            </form>

            <div className="mt-6 flex justify-between items-center text-xs">
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-400 hover:underline"
              >
                {isRegistering ? 'Already have an account? Log In' : 'Need active credentials? Quick Sign-up'}
              </button>
            </div>
          </div>

          {/* Quick Sandbox Bypass Pill Selector */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest block mb-3">Developer Quick-entry Sessions</span>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => executeBypass('user')}
                className="bg-blue-600 hover:bg-blue-700 text-[11px] text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-lg"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Madaesh Per (User)
              </button>
              <button 
                onClick={() => executeBypass('admin')}
                className="bg-purple-600 hover:bg-purple-700 text-[11px] text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-lg"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Root Administrator
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Bypasses registration flow to quickly inspect high-fidelity dashboard metrics.</p>
          </div>

        </div>
      </div>
    );
  }

  // --- Logged-in Core App Layout ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans leading-relaxed">

      {/* SUCCESS TOAST MESSAGE */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 border-l-4 border-emerald-500 rounded-r-xl p-4 shadow-2xl flex items-start gap-3 animate-float">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-slate-400 block font-mono">SYSTEM NOTICE</span>
            <span className="text-sm font-semibold text-white">{successToast}</span>
          </div>
        </div>
      )}

      {/* ERROR TOAST MESSAGE */}
      {errorToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 border-l-4 border-rose-500 rounded-r-xl p-4 shadow-2xl flex items-start gap-3 animate-float">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-slate-400 block font-mono">ERROR MESSAGE</span>
            <span className="text-sm font-semibold text-white">{errorToast}</span>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
              W
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-slate-900 uppercase leading-none">Wealth<span className="text-indigo-600">Engine</span></h1>
              <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">PERSONAL FISCAL INTELLIGENCE</span>
            </div>
          </div>

          {/* Quick Switch Switch Account Pill */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-250 py-1 px-3 rounded-full text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Logged: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
              </span>
              <button 
                onClick={() => executeBypass(currentUser.role === 'admin' ? 'user' : 'admin')}
                className="text-indigo-600 hover:text-indigo-500 font-bold ml-1.5 focus:outline-none cursor-pointer"
                title="Swap between user and system admin dashboard"
              >
                (Switch)
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-rose-50 text-slate-705 hover:text-rose-600 p-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
        
        {/* LEFT PROFILE & TABS PANEL */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          
          <div className="bg-[#1e293b] text-slate-300 rounded-2xl p-5 border border-slate-800 shadow-md">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Navigations</h4>
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Wallet className="w-4 h-4" />
                Today's Overview
              </button>

              <button 
                onClick={() => setActiveTab('ledger')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'ledger' ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Search className="w-4 h-4" />
                Ledger Entries
              </button>

              <button 
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'analytics' ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <TrendingUp className="w-4 h-4" />
                Analytics & Fluctuation
              </button>

              <button 
                onClick={() => setActiveTab('budgets')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'budgets' ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Calendar className="w-4 h-4" />
                Planning & Recurrent
              </button>

              <button 
                onClick={() => setActiveTab('goals')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'goals' ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <CheckCircle className="w-4 h-4" />
                Savings Milestones
              </button>

              <button 
                onClick={() => setActiveTab('manual-budgeting')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'manual-budgeting' ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <DollarSign className="w-4 h-4" />
                Monthly Budgeting
              </button>

              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-indigo-600/20 text-indigo-400 border-r-4 border-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <UserIcon className="w-4 h-4" />
                My Profile
              </button>

              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border border-purple-500/10 cursor-pointer ${activeTab === 'admin' ? 'bg-purple-600/20 text-purple-400 border-r-4 border-purple-400' : 'text-purple-300 hover:bg-purple-900/10 hover:text-white'}`}
                >
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  Admin Controls
                </button>
              )}
            </nav>
          </div>

          {/* BUDGET BAR METRIC IN RAIL */}
          <div className="bg-[#1e293b] text-slate-300 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Monthly Limit Utilization</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-lg font-bold text-white">₹{monthExpenses.toLocaleString()}</span>
              <span className="text-xs text-slate-400">of ₹{totalBudgeted.toLocaleString()} limit</span>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div 
                className={`h-full transition-all duration-1000 ${percentageBudgetUsed >= 100 ? 'bg-rose-500' : percentageBudgetUsed > 80 ? 'bg-amber-400' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, percentageBudgetUsed)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block text-right mt-1">{percentageBudgetUsed.toFixed(1)}% Allocated</span>
          </div>

          {/* Quick System Alerts Block */}
          {notifications.length > 0 && (
            <div className="bg-[#1e293b] text-slate-300 rounded-2xl p-5 border border-slate-800 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Workspace Alerts</span>
                <button 
                  onClick={() => setNotifications([])}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {notifications.slice(0, 4).map(n => (
                  <div key={n.id} className="text-xs bg-slate-800 p-2.5 rounded-lg border border-slate-750 flex gap-2">
                    <span className="text-rose-450">⚠️</span>
                    <p className="text-slate-300 leading-tight">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* MAIN BODY AREA */}
        <main className="lg:col-span-9 flex flex-col gap-6">

          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              
              {/* Dashboard Month Selector / Manual mode toggle */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 bg-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                    Manually Entered Income & Savings Dashboard
                  </h3>
                  <p className="text-xs text-slate-400">
                    Showing manual budgets and live auto-tracked transaction aggregates.
                  </p>
                </div>
                
                {/* Month/Year Selector */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-1 font-mono">Month:</span>
                    <select
                      value={budgetMonth}
                      onChange={(e) => setBudgetMonth(e.target.value)}
                      className="text-xs font-bold bg-transparent text-white focus:outline-none focus:bg-slate-900 border-none px-1"
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={budgetYear}
                      onChange={(e) => setBudgetYear(parseInt(e.target.value))}
                      className="text-xs font-bold bg-transparent text-white focus:outline-none focus:bg-slate-900 border-none px-1"
                    >
                      {[2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('manual-budgeting')}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-2.5 py-1.5 cursor-pointer pointer-events-auto transition-colors"
                  >
                    Adjust Entry Fields ✏️
                  </button>
                </div>
              </div>

              {/* Financial Dashboard Bento Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Income */}
                <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-2 right-2 p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Income (Manual)</span>
                  <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">₹{activeManualIncomeVal.toLocaleString()}</p>
                  <div className="text-[10px] text-slate-400 mt-1 flex gap-1.5">
                    <span>Sal: ₹{(activeManualIncomeObj?.salary || 0).toLocaleString()}</span>
                    <span>Freelance: ₹{(activeManualIncomeObj?.freelance || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Total Expenses */}
                <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-2 right-2 p-1.5 bg-rose-500/10 text-rose-450 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Expenses (Auto)</span>
                  <p className="text-2xl font-black text-rose-455 mt-2 font-mono">₹{trackedMonthExpenses.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-405 mt-1">Aggregated from daily expense tracker</p>
                </div>

                {/* Manual Savings */}
                <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-2 right-2 p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Manual Savings</span>
                  <p className="text-2xl font-black text-amber-400 mt-2 font-mono">₹{activeManualSavingsVal.toLocaleString()}</p>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>Goal: ₹{activeTargetSavingsVal.toLocaleString()}</span>
                    <span>Invest: ₹{(activeManualSavingsObj?.investment || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Remaining Balance */}
                <div className="glass-card rounded-2xl p-5 border border-indigo-505/20 bg-indigo-950/20 relative overflow-hidden">
                  <div className="absolute top-2 right-2 p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-indigo-300 uppercase tracking-wider block font-bold">Remaining Balance</span>
                  <p className="text-2xl font-black text-white mt-2 font-mono">₹{manualRemainingBalance.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">Income - Expenses - Savings</p>
                </div>

              </div>

              {/* QUICK PRESSED ADD EXPENSE BUTTONS */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Swift Quick-Add Registry</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    { name: 'Tea', cost: 12, cat: 'Food & Beverages' },
                    { name: 'Coffee', cost: 20, cat: 'Food & Beverages' },
                    { name: 'Snacks', cost: 30, cat: 'Food & Beverages' },
                    { name: 'Petrol', cost: 200, cat: 'Transportation' },
                    { name: 'Food', cost: 120, cat: 'Food & Beverages' },
                    { name: 'Travel', cost: 40, cat: 'Transportation' },
                    { name: 'Shopping', cost: 1500, cat: 'Shopping' },
                    { name: 'Medicine', cost: 180, cat: 'Healthcare' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleQuickAdd(preset.name, preset.cost, preset.cat)}
                      className="bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-200 border border-white/10 rounded-xl p-3 text-center cursor-pointer pointer-events-auto"
                    >
                      <span className="text-xs block text-slate-400 leading-none mb-1.5">{preset.name}</span>
                      <strong className="text-sm block">₹{preset.cost}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {/* DUAL PREMIUM ENTRY TOOLS: OCR FILE + VOICE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SECTION A: DIGITAL BILL OCR & CHAT LOG */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block mb-1">PRO FEATURES</span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Crop className="w-5 h-5 text-blue-400" />
                      Multimodal Invoice OCR Scanner
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-5">
                      Upload physical bills or grocery slips, and our server proxy utilizes Gemini Vision to automatically pull amounts, tax categories, and dates.
                    </p>

                    <div className="bg-slate-900/50 outline-dashed outline-2 outline-white/10 hover:outline-blue-500/50 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer relative transition-all"
                      onClick={() => fileInputRef.current?.click()}>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden" 
                        onChange={handleOcrUpload}
                      />
                      {ocrLoading ? (
                        <div className="flex flex-col items-center py-2 h-max">
                          <RefreshCw className="w-7 h-7 text-blue-400 animate-spin mb-2" />
                          <span className="text-xs text-slate-300 font-semibold animate-pulse">Gemini parsing invoice metadata...</span>
                        </div>
                      ) : (
                        <div className="py-2">
                          <PlusCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <span className="text-xs font-semibold text-slate-200 block">Click to Upload Receipt Slip</span>
                          <span className="text-[10px] text-slate-400 block mt-1">Supports JPEG, PNG, or base64 attachments</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 italic mt-4 block">Note: If API Key is missing, beautiful simulation runs instantly.</span>
                </div>

                {/* SECTION B: TRANSLATE VOICE INSTRUCTIONS */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">VOICE INTEGRATION</span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Mic className="w-5 h-5 text-purple-400" />
                      Speak to Record
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 mb-5">
                      Directly dictate your transaction. Example: "Spent 150 on double cheese burger dinner" or "Tea 12 rupees".
                    </p>

                    <div className="flex flex-col items-center gap-3">
                      <button 
                        onClick={handleVoiceTrigger}
                        disabled={voiceLoading}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xl shadow-purple-500/10 hover:scale-105 transition-transform pointer-events-auto cursor-pointer ${isRecording ? 'bg-rose-600 border-rose-500 text-white animate-pulse' : 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white'}`}
                      >
                        <Mic className="w-8 h-8" />
                      </button>
                      <span className="text-xs font-bold text-slate-300">
                        {isRecording ? 'Active Listening...' : voiceLoading ? 'Transcribing...' : 'Tap Mic to Dictate'}
                      </span>
                      {voiceTextResult && (
                        <span className="text-[11px] text-slate-400 text-center bg-slate-900/60 p-2 rounded-lg border border-white/5 max-w-full truncate">
                          "{voiceTextResult}"
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 italic block mt-4">Calculates quantity multipliers ("3 bottles of tea ₹36") automatically.</span>
                </div>

              </div>

              {/* WHATSAPP-STYLE RAW CHAT COMMAND BOX */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest block mb-1">FAST ACCELERATED COMMITS</span>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-5 h-5 text-pink-400" />
                  WhatsApp Block Expense Entry
                </h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Have multiple daily costs to map quickly? Copy and paste your multiline notes list directly here. Click record and Gemini parses them to separate ledger rows instantaneously.
                </p>

                <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                  <textarea 
                    value={waText}
                    onChange={(e) => setWaText(e.target.value)}
                    placeholder="Tea 15&#10;Petrol 300&#10;Biscuit 5&#10;Dinner lunch bill 450" 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Prefix strings with quantities if needed</span>
                    <button 
                      type="submit"
                      disabled={waLoading}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white font-bold text-xs py-2 px-4 rounded-lg pointer-events-auto cursor-pointer"
                    >
                      {waLoading ? 'AI Parsing Block...' : 'Instant Multi-Save'}
                    </button>
                  </div>
                </form>
              </div>

              {/* GEMINI PERSONAL AI VISOR PROJECTIONS COLUMN */}
              <div className="bg-indigo-600 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-indigo-500/20">
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-200 uppercase tracking-widest block">Google Gemini 3.5 Assistant</span>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      🧠 Smart AI Wealth Projections
                    </h3>
                  </div>
                  <button 
                    onClick={queryAiInsights}
                    disabled={insightsLoading}
                    className="bg-white/15 hover:bg-white/20 p-2 rounded-full text-white cursor-pointer pointer-events-auto"
                    title="Force refresh predictions"
                  >
                    <RefreshCw className={`w-4 h-4 ${insightsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {insightsLoading ? (
                  <div className="flex flex-col items-center py-6">
                    <RefreshCw className="w-6 h-6 text-white animate-spin mb-2" />
                    <span className="text-xs text-indigo-200 animate-pulse font-mono">Simulating mathematical wealth models...</span>
                  </div>
                ) : aiInsights.length === 0 ? (
                  <p className="text-xs text-indigo-100">Click refresh to load your personal financial forecasts advice.</p>
                ) : (
                  <div className="flex flex-col gap-3 relative z-10">
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-xs text-white leading-relaxed flex gap-2">
                        <span className="text-indigo-200 font-bold block pt-0.5">•</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT EXPENSES QUICK LEDGER */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Recent Ledger Activity
                  </h3>
                  <button 
                    onClick={() => setActiveTab('ledger')}
                    className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View Full Statement <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-slate-400">
                        <th className="pb-2.5">Product / Source</th>
                        <th className="pb-2.5">Category</th>
                        <th className="pb-2.5">Payment</th>
                        <th className="pb-2.5">Date</th>
                        <th className="pb-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                      {activeExps.slice(0, 5).map(exp => (
                        <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-2.5">
                            <span className="font-semibold text-white block">{exp.name}</span>
                            {exp.notes && (
                              <span className="text-[10px] text-slate-400 block truncate max-w-xs">{exp.notes}</span>
                            )}
                          </td>
                          <td className="py-2.5 font-medium" style={{ color: categories.find(c => c.name === exp.category)?.color || CATEGORY_COLORS[exp.category] || '#94a3b8' }}>
                            {exp.category}
                          </td>
                          <td className="py-2.5 font-mono text-slate-300">{exp.paymentMode}</td>
                          <td className="py-2.5 text-slate-400">{exp.date}</td>
                          <td className="py-2.5 text-right font-bold text-white">₹{exp.amount}</td>
                        </tr>
                      ))}
                      {activeExps.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">No transactions stored. Use Swift Add shortcuts to seed!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 2. LEDGER MODULE TABS (Add Forms + Full search filters) */}
          {activeTab === 'ledger' && (
            <div className="flex flex-col gap-6">
              
              {/* LEDGER TRANSACTION GENERATOR MODULE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Manual expense generator */}
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
                    <Plus className="w-5 h-5 text-blue-400" />
                    Record New Purchase
                  </h3>
                  <form onSubmit={handleCreateExpense} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Product Name</label>
                        <input 
                          type="text" 
                          required
                          value={expName}
                          onChange={(e) => setExpName(e.target.value)}
                          placeholder="Petrol, Bus Ticket, Tea..." 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Amount (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          placeholder="300"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Quantity</label>
                        <input 
                          type="number" 
                          value={expQty}
                          onChange={(e) => setExpQty(e.target.value)}
                          placeholder="1"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Payment Mode</label>
                        <select 
                          value={expPayment}
                          onChange={(e) => setExpPayment(e.target.value as PaymentMode)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:bg-slate-900"
                        >
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Date</label>
                        <input 
                          type="date" 
                          required
                          value={expDate}
                          onChange={(e) => setExpDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-white text-[10px] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category Group</label>
                      <select 
                        value={expCategory}
                        onChange={(e) => setExpCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:bg-slate-900"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Additional Notes</label>
                      <input 
                        type="text" 
                        value={expNotes}
                        onChange={(e) => setExpNotes(e.target.value)}
                        placeholder="Location description, GST invoice, etc." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl pointer-events-auto cursor-pointer"
                    >
                      Record Transaction Entry
                    </button>
                  </form>
                </div>

                {/* Record new income source */}
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
                    <Plus className="w-5 h-5 text-emerald-400" />
                    Record Income Deposit
                  </h3>
                  <form onSubmit={handleCreateIncome} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Income Resource Source</label>
                      <input 
                        type="text" 
                        required
                        value={incSource}
                        onChange={(e) => setIncSource(e.target.value)}
                        placeholder="Salary, Freelance pay, Dividends..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Deposit Amount (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={incAmount}
                          onChange={(e) => setIncAmount(e.target.value)}
                          placeholder="25000" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Deposit Date</label>
                        <input 
                          type="date" 
                          required
                          value={incDate}
                          onChange={(e) => setIncDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-white text-[10px] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Recipient Memo Notes</label>
                      <input 
                        type="text" 
                        value={incNotes}
                        onChange={(e) => setIncNotes(e.target.value)}
                        placeholder="Check reference, monthly credit stamp..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl pointer-events-auto cursor-pointer"
                    >
                      Process Capital Entry
                    </button>
                  </form>
                </div>

              </div>

              {/* SEARCH FILTERS & LEDGER EXCEL EXPORTS CONTAINER */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Full Transaction Audit Statement</h3>
                    <p className="text-xs text-slate-400">Search and filter active entries offline.</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={exportToCSV}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 text-xs text-slate-200 flex items-center gap-1.5 focus:outline-none cursor-pointer pointer-events-auto"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Excel/CSV
                    </button>
                    <button 
                      onClick={triggerPDFPrint}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 text-xs text-slate-200 flex items-center gap-1.5 focus:outline-none cursor-pointer pointer-events-auto"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF Statement / Print
                    </button>
                  </div>
                </div>

                {/* ADVANCED MULTI FILTER BOX */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Search Keywords</label>
                      <input 
                        type="text" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Search Tea, fuel, notes..." 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Category Filter</label>
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="All">All Categories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Payment Channel</label>
                      <select 
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="All">All Channels</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Start Date</label>
                      <input 
                        type="date" 
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">End Date</label>
                      <input 
                        type="date" 
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Min Amount (₹)</label>
                      <input 
                        type="number" 
                        value={filterAmountMin}
                        onChange={(e) => setFilterAmountMin(e.target.value)}
                        placeholder="0" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Max Amount (₹)</label>
                      <input 
                        type="number" 
                        value={filterAmountMax}
                        onChange={(e) => setFilterAmountMax(e.target.value)}
                        placeholder="10000" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-slate-400 font-mono">
                        <th className="pb-3 text-[10px] uppercase">Record Detail</th>
                        <th className="pb-3 text-[10px] uppercase">Category Group</th>
                        <th className="pb-3 text-[10px] uppercase">Channel</th>
                        <th className="pb-3 text-[10px] uppercase">Price & Unit</th>
                        <th className="pb-3 text-[10px] uppercase">Date Stamp</th>
                        <th className="pb-3 text-right text-[10px] uppercase">Value sum</th>
                        <th className="pb-3 text-center text-[10px] uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {filteredExpenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white">{exp.name}</span>
                              {exp.addedByVoice && (
                                <span className="bg-purple-950/80 text-purple-300 border border-purple-500/20 text-[9px] px-1 rounded">Voice</span>
                              )}
                              {exp.parsedByOcr && (
                                <span className="bg-blue-950/80 text-blue-300 border border-blue-500/20 text-[9px] px-1 rounded">OCR</span>
                              )}
                            </div>
                            {exp.notes && (
                              <span className="text-[10px] text-slate-400 block max-w-xs truncate">{exp.notes}</span>
                            )}
                          </td>
                          <td className="py-3 font-semibold text-slate-200">
                            <span 
                              style={{ 
                                backgroundColor: (categories.find(c => c.name === exp.category)?.color || CATEGORY_COLORS[exp.category] || '#94a3b8') + '20', 
                                color: categories.find(c => c.name === exp.category)?.color || CATEGORY_COLORS[exp.category] || '#94a3b8' 
                              }}
                              className="px-2 py-0.5 rounded text-[10px]"
                            >
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300 font-mono">{exp.paymentMode}</td>
                          <td className="py-3 text-slate-300">
                            {exp.quantity > 1 ? `₹${exp.unitPrice} × ${exp.quantity}` : `₹${exp.amount}`}
                          </td>
                          <td className="py-3 text-slate-400 font-mono">{exp.date}</td>
                          <td className="py-3 text-right font-bold text-white">₹{exp.amount}</td>
                          <td className="py-3 text-center">
                            <button 
                              onClick={() => handleDeleteExpense(exp.id, exp.name)}
                              className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition-colors pointer-events-auto cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">No transactions match your currently configured search criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 3. ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pie category */}
              <div className="md:col-span-2">
                <CategoryPieChart expenses={expenses} categories={categories} />
              </div>

              {/* Trend wave */}
              <div className="md:col-span-1">
                <MonthlyTrendLineChart expenses={expenses} />
              </div>

              {/* Cashflow columns */}
              <div className="md:col-span-1">
                <IncomeExpenseBarChart expenses={expenses} incomes={incomes} />
              </div>

              {/* Spending Heatmap Calendar */}
              <div className="col-span-1 md:col-span-1">
                <SpendingHeatmap expenses={expenses} />
              </div>

              {/* Special fluctuation price tracker line */}
              <div className="col-span-1 md:col-span-1">
                <ProductPriceTracking 
                  expenses={expenses} 
                  onEditProductPrice={(prodName) => handleStartEdit('productPrice', prodName)} 
                />
              </div>

            </div>
          )}

          {/* 4. BUDGETS & RECURRINGS MODULE */}
          {activeTab === 'budgets' && (
            <div className="flex flex-col gap-6">
              
              {/* Active list budgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Creating budget */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 h-max">
                  <h3 className="text-base font-bold text-white mb-4">Create Category Budget Limit</h3>
                  <form onSubmit={handleAddBudget} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Budget Label Tag</label>
                      <input 
                        type="text" 
                        required
                        value={newBdgName}
                        onChange={(e) => setNewBdgName(e.target.value)}
                        placeholder="Food Budget, Auto Fuel cap..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Target Limit (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={newBdgCap}
                          onChange={(e) => setNewBdgCap(e.target.value)}
                          placeholder="5000"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category Group</label>
                        <select 
                          value={newBdgCatId}
                          onChange={(e) => setNewBdgCatId(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:bg-slate-900"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl pointer-events-auto cursor-pointer"
                    >
                      Establish Budget Planning Cap
                    </button>
                  </form>
                </div>

                {/* Listing budgets */}
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-4">Configured Budgets Progress</h3>
                  <div className="flex flex-col gap-5">
                    {budgets.map(b => {
                      const cat = categories.find(c => c.id === b.categoryId);
                      if (!cat) return null;

                      // Calculate spent
                      const spent = activeExps
                        .filter(e => e.category === cat.name)
                        .reduce((sum, e) => sum + e.amount, 0);

                      const pct = b.targetAmount > 0 ? (spent / b.targetAmount) * 100 : 0;
                      const isExceeded = spent > b.targetAmount;

                      return (
                        <div key={b.id} className="space-y-1.5 p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-white">{b.name}</span>
                            <span className="text-slate-400">{cat.name}</span>
                          </div>
                          
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                            <div 
                              className={`h-full ${isExceeded ? 'bg-rose-500' : pct > 80 ? 'bg-amber-400' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between items-center text-[10px]">
                            <span className={isExceeded ? 'text-rose-400 font-bold' : pct > 80 ? 'text-amber-400 font-bold' : 'text-blue-400'}>
                              Spent: ₹{spent} ({pct.toFixed(0)}%)
                            </span>
                            <span className="text-slate-400">Limit: ₹{b.targetAmount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RECURRING EXPENSE BILL AUTO SCHEDULER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Add Recurring Scheduler Form Card */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 lg:col-span-1 h-max bg-[#1e293b]/50">
                  <h3 className="text-base font-bold text-white mb-2">Register Custom Recurring Payments</h3>
                  <p className="text-xs text-slate-400 mb-4">Set up direct EMIs, rental bills, subscriptions, or fuel schedules that will automatically post on their due dates.</p>
                  
                  <form onSubmit={handleAddRecurring} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Expense Item Name</label>
                      <input 
                        type="text" 
                        required
                        value={recName}
                        onChange={(e) => setRecName(e.target.value)}
                        placeholder="Netflix, House Rent, Car EMI..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Billing Rate (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={recAmount}
                          onChange={(e) => setRecAmount(e.target.value)}
                          placeholder="649"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category Group</label>
                        <select 
                          value={recCategory}
                          onChange={(e) => setRecCategory(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:bg-slate-900"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Frequency Rule</label>
                        <select 
                          value={recFrequency}
                          onChange={(e) => setRecFrequency(e.target.value as any)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:bg-slate-900"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly font-mono">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">First Scheduled Due Date</label>
                        <input 
                          type="date" 
                          required
                          value={recStartDate}
                          onChange={(e) => setRecStartDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:bg-slate-900"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer pointer-events-auto transition-colors"
                    >
                      Establish Automated Billing Schedule
                    </button>
                  </form>
                </div>

                {/* 2. List or Grid of active Schedulers */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 lg:col-span-2 bg-[#1e293b]/30">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                    <div>
                      <h3 className="text-base font-bold text-white">Configured Schedulers Logs</h3>
                      <p className="text-xs text-slate-400">Manage real-time execution frequencies and suspend schedules safely.</p>
                    </div>
                    <HelpCircle className="w-5 h-5 text-slate-400" title="Automated schedules run silently behind the scenes" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                    {recurrings.filter(rec => !rec.isDeleted).length === 0 ? (
                      <div className="col-span-2 text-center py-10 text-xs text-slate-500">
                        No automated bills registered. Set up a scheduler or billing rule on the left.
                      </div>
                    ) : (
                      recurrings.filter(rec => !rec.isDeleted).map(rec => {
                        const isPassed = new Date(rec.nextDueDate) <= new Date();
                        return (
                          <div key={rec.id} className={`p-4 bg-slate-900/60 rounded-xl border border-white/5 flex flex-col justify-between gap-3 relative overflow-hidden ${!rec.isActive ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-400 font-bold font-mono uppercase">
                                  {rec.frequency}
                                </span>
                                <h4 className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
                                  {rec.name}
                                  {!rec.isActive && (
                                    <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 rounded font-black">SUSPENDED</span>
                                  )}
                                </h4>
                                <span className="text-xs text-slate-400 block mt-0.5">{rec.category}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-black text-rose-450 block">₹{rec.amount.toLocaleString()}</span>
                                <span className="text-[9px] text-slate-450 block mt-1">Due: {rec.nextDueDate}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                              {/* Left control button: Toggle active/pause */}
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => handleToggleRecurringActive(rec.id, rec.name, !!rec.isActive)}
                                  className={`px-2 py-1 text-[10px] rounded border font-semibold cursor-pointer pointer-events-auto transition-colors ${rec.isActive ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border-amber-500/30' : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-500/30'}`}
                                >
                                  {rec.isActive ? 'Pause' : 'Resume'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteRecurring(rec.id, rec.name)}
                                  className="px-2 py-1 text-[10px] bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 rounded font-semibold cursor-pointer pointer-events-auto transition-colors"
                                >
                                  Delete
                                </button>
                              </div>

                              {/* Right control button: Execute manually / Pay now */}
                              {rec.isActive && (
                                <div>
                                  {isPassed ? (
                                    <button 
                                      onClick={() => handleProcessUpcomingRecuring(rec)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer pointer-events-auto animate-pulse"
                                    >
                                      Pay Now
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleProcessUpcomingRecuring(rec)}
                                      className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer pointer-events-auto"
                                    >
                                      Pay Early
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 5B. MANUAL BUDGETING: INCOME & SAVINGS MODULE */}
          {activeTab === 'manual-budgeting' && (
            <div className="flex flex-col gap-6">
              
              {/* MONTH / YEAR SELECTOR & GENERAL STATS */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-[#1e293b]/60">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">PRO BUDGET PLANNER</span>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-indigo-400" />
                      Manually Managed Income & Savings
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter and track monthly budgets manually. Auto-sum is performed over different income streams and compared against tracked card debits.
                    </p>
                  </div>

                  {/* DROP DOWN MONTH AND YEAR SELECTOR */}
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-white/5 self-stretch sm:self-auto justify-between">
                    <span className="text-xs text-slate-400 font-semibold px-2">Active Month:</span>
                    <div className="flex gap-1.5">
                      <select 
                        value={budgetMonth}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBudgetMonth(val);
                          setIsEditingIncome(false);
                          setIsEditingSavings(false);
                        }}
                        className="text-xs font-bold bg-white/5 border border-white/10 text-white rounded-lg p-1.5 focus:outline-none focus:bg-slate-900"
                      >
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      <select 
                        value={budgetYear}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setBudgetYear(val);
                          setIsEditingIncome(false);
                          setIsEditingSavings(false);
                        }}
                        className="text-xs font-bold bg-white/5 border border-white/10 text-white rounded-lg p-1.5 focus:outline-none focus:bg-slate-900"
                      >
                        {[2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* VISUAL DASHBOARD SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {/* Monthly Income Total */}
                  <div className="bg-slate-900/40 p-4.5 rounded-xl border border-white/5 relative">
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Total Monthly Income</span>
                    <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">₹{activeManualIncomeVal.toLocaleString()}</p>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Salary: ₹{(activeManualIncomeObj?.salary || 0).toLocaleString()}</span>
                      <span>Freelance: ₹{(activeManualIncomeObj?.freelance || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Tracked Month Expenses */}
                  <div className="bg-slate-900/40 p-4.5 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Tracked Expenses</span>
                    <p className="text-2xl font-black text-rose-455 mt-2 font-mono">₹{trackedMonthExpenses.toLocaleString()}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">Automatically aggregated debits</span>
                  </div>

                  {/* Manual Savings Block */}
                  <div className="bg-slate-900/40 p-4.5 rounded-xl border border-white/5 relative">
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Manual Savings (Actual)</span>
                    <p className="text-2xl font-black text-amber-400 mt-2 font-mono">₹{activeManualSavingsVal.toLocaleString()}</p>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>Target: ₹{activeTargetSavingsVal.toLocaleString()}</span>
                      <span>Invest: ₹{(activeManualSavingsObj?.investment || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Remaining Balance Card */}
                  <div className="bg-indigo-950/20 p-4.5 rounded-xl border border-indigo-500/20">
                    <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider block font-bold">Remaining Balance</span>
                    <p className="text-2xl font-black text-white mt-2 font-mono font-sans font-sans">₹{manualRemainingBalance.toLocaleString()}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">Income - Expenses - Savings</span>
                  </div>
                </div>

                {/* ACTION TRIGGER BUTTONS FOR INCOME & SAVINGS */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
                  <button
                    onClick={() => {
                      setIsEditingIncome(true);
                      setIsEditingSavings(false);
                      initIncomeForm(budgetMonth, budgetYear);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 pointer-events-auto cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Enter / Edit Income
                  </button>

                  <button
                    onClick={() => {
                      setIsEditingSavings(true);
                      setIsEditingIncome(false);
                      initSavingsForm(budgetMonth, budgetYear);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 pointer-events-auto cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Enter / Edit Savings
                  </button>
                </div>
              </div>

              {/* FORMS INTERACTIVE ZONE */}
              {(isEditingIncome || isEditingSavings) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* INCOME MANUAL FORM */}
                  {isEditingIncome && (
                    <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-[#1e293b]/80">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-6 bg-emerald-500 rounded"></span>
                          Manual Income Entry: {budgetMonth} {budgetYear}
                        </h3>
                        <button 
                          onClick={() => setIsEditingIncome(false)}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleSaveManualIncome} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Salary Income (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formSalary}
                              onChange={(e) => setFormSalary(e.target.value)}
                              placeholder="50000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Freelance Income (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formFreelance}
                              onChange={(e) => setFormFreelance(e.target.value)}
                              placeholder="5000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Business Income (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formBusiness}
                              onChange={(e) => setFormBusiness(e.target.value)}
                              placeholder="0"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider block mb-1">Other Income (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formOther}
                              onChange={(e) => setFormOther(e.target.value)}
                              placeholder="2000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between p-3 bg-slate-900/60 rounded-xl">
                          <span className="text-xs text-slate-400 font-semibold uppercase">Total Monthly Income (Auto Sum)</span>
                          <strong className="text-lg text-emerald-400 font-mono">
                            ₹{((parseFloat(formSalary) || 0) + (parseFloat(formFreelance) || 0) + (parseFloat(formBusiness) || 0) + (parseFloat(formOther) || 0)).toLocaleString()}
                          </strong>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl pointer-events-auto cursor-pointer transition-colors"
                        >
                          Confirm & Save Monthly Income
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SAVINGS MANUAL FORM */}
                  {isEditingSavings && (
                    <div className="glass-card rounded-2xl p-6 border border-amber-500/30 bg-[#1e293b]/80">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-6 bg-amber-500 rounded"></span>
                          Manual Savings Entry: {budgetMonth} {budgetYear}
                        </h3>
                        <button 
                          onClick={() => setIsEditingSavings(false)}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleSaveManualSavings} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider block mb-1">Target Savings (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formTargetSavings}
                              onChange={(e) => setFormTargetSavings(e.target.value)}
                              placeholder="10000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider block mb-1">Actual Savings (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formActualSavings}
                              onChange={(e) => setFormActualSavings(e.target.value)}
                              placeholder="8500"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider block mb-1">Investment Amount (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formInvestment}
                              onChange={(e) => setFormInvestment(e.target.value)}
                              placeholder="3000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider block mb-1">Emergency Fund Contribution (₹)</label>
                            <input 
                              type="number"
                              required
                              value={formEmergencyFund}
                              onChange={(e) => setFormEmergencyFund(e.target.value)}
                              placeholder="1000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-455 uppercase tracking-wider block mb-1 font-sans">Notes</label>
                          <input 
                            type="text"
                            value={formSavingsNotes}
                            onChange={(e) => setFormSavingsNotes(e.target.value)}
                            placeholder="Reason for deviation, winter shopping logs..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl pointer-events-auto cursor-pointer transition-colors"
                        >
                          Confirm & Save Monthly Savings
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* MONTHLY SUMMARY REPORT (ACCUMULATED GRID SUMMARY COMPONENT) */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-[#1e293b]/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <Settings className="w-5 h-5 text-indigo-400" />
                      All Editable Monthly Records Summary
                    </h3>
                    <p className="text-xs text-slate-400">View previous entries, perform historical checks, and monitor balance metrics.</p>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 uppercase font-black">
                    Live Compare Enabled
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-slate-400 font-mono">
                        <th className="pb-3 text-[10px] uppercase">Month / Year</th>
                        <th className="pb-3 text-[10px] uppercase">Total Income (Manual)</th>
                        <th className="pb-3 text-[10px] uppercase">Expenses (Tracked)</th>
                        <th className="pb-3 text-[10px] uppercase font-bold text-amber-400">Manual Savings (Actual)</th>
                        <th className="pb-3 text-[10px] uppercase font-bold text-indigo-400">Remaining Balance</th>
                        <th className="pb-3 text-[10px] uppercase">Notes / Status</th>
                        <th className="pb-3 text-center text-[10px] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {(() => {
                        const allKeysMap = new Map<string, { month: string; year: number }>();
                        
                        manualIncomes.forEach(inc => {
                          allKeysMap.set(`${inc.year}-${inc.month}`, { month: inc.month, year: inc.year });
                        });
                        manualSavings.forEach(sav => {
                          allKeysMap.set(`${sav.year}-${sav.month}`, { month: sav.month, year: sav.year });
                        });

                        const monthMapIdx: Record<string, number> = {
                          Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
                          Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
                        };

                        const sortedKeys = Array.from(allKeysMap.values()).sort((a,b) => {
                          if (a.year !== b.year) return b.year - a.year;
                          return (monthMapIdx[b.month] || 0) - (monthMapIdx[a.month] || 0);
                        });

                        return sortedKeys.map(({ month, year }) => {
                          const inc = manualIncomes.find(i => i.month === month && i.year === year && i.userId === (currentUser?.id || 'guest'));
                          const sav = manualSavings.find(s => s.month === month && s.year === year && s.userId === (currentUser?.id || 'guest'));
                          const numMonth = monthNameToNumMap[month] || '06';
                          const expSum = activeExps
                            .filter(e => e.date.startsWith(`${year}-${numMonth}`))
                            .reduce((sum, e) => sum + e.amount, 0);

                          const incTotal = inc ? inc.total : 0;
                          const savActual = sav ? sav.actualSavings : 0;
                          const remBalance = incTotal - expSum - savActual;

                          return (
                            <tr key={`${year}-${month}`} className="hover:bg-white/5 transition-colors group">
                              <td className="py-3 font-bold text-white font-mono">
                                {month} {year}
                              </td>
                              <td className="py-3 font-semibold text-emerald-400">
                                ₹{incTotal.toLocaleString()}
                              </td>
                              <td className="py-3 text-slate-300">
                                ₹{expSum.toLocaleString()}
                              </td>
                              <td className="py-3 font-bold font-mono text-amber-400">
                                ₹{savActual.toLocaleString()}
                              </td>
                              <td className="py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${remBalance >= 0 ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-505/20' : 'bg-rose-950/40 text-rose-450 border border-rose-500/20'}`}>
                                  ₹{remBalance.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 text-slate-400 font-medium max-w-xs truncate">
                                {sav?.notes || inc?.salary ? (sav?.notes || 'Values recorded.') : 'No savings fields entered.'}
                              </td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => {
                                    setBudgetMonth(month);
                                    setBudgetYear(year);
                                    setIsEditingIncome(true);
                                    setIsEditingSavings(false);
                                    initIncomeForm(month, year);
                                  }}
                                  className="text-xs font-semibold hover:bg-white/5 text-blue-400 border border-blue-500/20 rounded-lg px-2 py-1 pointer-events-auto cursor-pointer hover:text-white"
                                >
                                  Edit Monthly
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                      {Array.from(manualIncomes).length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-405">No historical manual monthly summaries available. Please use the entry buttons.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 5. SAVINGS MILESTONES GOALS VIEW */}
          {activeTab === 'goals' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {savingsGoals.map(goal => {
                const pct = (goal.savedAmount / goal.targetAmount) * 100;
                const isCompleted = goal.savedAmount >= goal.targetAmount;

                return (
                  <div key={goal.id} className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                    {isCompleted && (
                      <span className="absolute top-2 right-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase">
                        Achieved 🎉
                      </span>
                    )}
                    
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">FINANCIAL MILESTONE TARGET</span>
                      <h4 className="text-base font-bold text-white mt-1 mb-2">{goal.name}</h4>
                      {goal.notes && (
                        <p className="text-xs text-slate-400 leading-tight mb-4">{goal.notes}</p>
                      )}

                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-emerald-400 font-bold font-mono">₹{goal.savedAmount.toLocaleString()}</span>
                          <span className="text-slate-400">Target ₹{goal.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 block text-right mt-1">{pct.toFixed(0)}% Completed</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Inflow savings top-up contribution (₹)</span>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="5000" 
                          value={savingAddAmt[goal.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSavingAddAmt(prev => ({ ...prev, [goal.id]: val }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                        <button 
                          onClick={() => handleAddSavingProg(goal.id, savingAddAmt[goal.id] || '')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 rounded-lg pointer-events-auto cursor-pointer"
                        >
                          Credit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* 6. ADMIN PRIVATE MODULE */}
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <div className="flex flex-col gap-6">
              
              {/* ADMIN bento statistics aggregates */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                  <span className="text-xs text-slate-400 block font-mono">TOTAL REGISTERED USER PROFILES</span>
                  <p className="text-3xl font-black text-white mt-1">{usersList.length}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                  <span className="text-xs text-slate-400 block font-mono">TOTAL ACCUMULATED DEBITS</span>
                  <p className="text-3xl font-black text-rose-400 mt-1">₹{expenses.reduce((s,e) => s+e.amount, 0).toLocaleString()}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                  <span className="text-xs text-slate-400 block font-mono">TOTAL INCOME BALANCES</span>
                  <p className="text-3xl font-black text-emerald-400 mt-1">₹{incomes.reduce((s,i) => s+i.amount, 0).toLocaleString()}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                  <span className="text-xs text-slate-400 block font-mono">COMMUNICATIONS AUDIT STATUS</span>
                  <p className="text-3xl font-black text-blue-400 mt-1">ONLINE</p>
                </div>
              </div>

              {/* USER REGISTRY AND PREFERENCES OVERRIDES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Users Directory list */}
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-4">Users Accounts Directory</h3>
                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {usersList.map(u => (
                      <div key={u.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{u.email}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-extrabold border uppercase px-1.5 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple-950/80 text-purple-300 border-purple-500/20' : 'bg-blue-950/80 text-blue-300 border-blue-500/20'}`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Custom Category catalog modifier */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-3">Custom System Catalog Modifiers</h3>
                    <p className="text-xs text-slate-400 mb-4">Add new item category catalogs directly across the system.</p>
                    
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Catalog Name</label>
                        <input 
                          type="text" 
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. Subscriptions, Travel tax"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-bold">Pick Dashboard Vector Color Accent</label>
                        <div className="flex gap-2 flex-wrap items-center mt-1.5">
                          {['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#06b6d4'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewCatColor(color)}
                              className={`w-6 h-6 rounded-full border cursor-pointer pointer-events-auto ${newCatColor === color ? 'border-white scale-120' : 'border-black/50 hover:scale-110'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-xl pointer-events-auto cursor-pointer"
                      >
                        Publish Catalog Category
                      </button>
                    </form>
                  </div>
                </div>

              </div>

              {/* SECURITY TIMELINE AUDIT & TIMESTAMPS OVERFLOW */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Security Logs & Audit Trail Timestamps</h3>
                    <p className="text-xs text-slate-400">Chronological, unmodifiable timeline of core ledger modifications.</p>
                  </div>
                  <button 
                    onClick={handleResetWorkspaceData}
                    className="bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 rounded px-2.5 py-1 text-[10px] text-rose-300 pointer-events-auto cursor-pointer"
                  >
                    Clear Database Cache
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {activityLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-900/40 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between text-xs gap-1">
                      <div className="flex items-start gap-2.5">
                        <span className="text-purple-400 font-bold font-mono">[{log.category.toUpperCase()}]</span>
                        <p className="text-slate-300 font-semibold">{log.actionDescription}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono self-end sm:self-center">
                        {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 7. PERSONAL PROFILE CONTROLS VIEW */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6 animate-fade-in text-slate-100">
              
              {/* Profile Card Hero Banner */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20 ring-4 ring-white/10">
                    {profileName ? profileName.split(' ')[0].substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full inline-block self-center">
                        {currentUser.role} Account
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{currentUser.email} • {currentUser.mobile}</p>
                    <p className="text-[10px] text-slate-500 mt-2">Member since {currentUser.createdAt || '2026-06-01'}</p>
                  </div>
                </div>
              </div>

              {/* Bento Grid panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Panel 1: Profile Settings */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between bg-[#1e293b]/70 shadow-lg">
                  <div>
                    <div className="flex items-center gap-2.5 mb-5 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-sans">Identity Details</h3>
                        <p className="text-[11px] text-slate-400">Manage your general account display labels & coordinates.</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Display Username Name</label>
                        <input 
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Madaesh Per"
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-opacity-40"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Email Address (Login ID)</label>
                        <input 
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          placeholder="madaeshper1@gmail.com"
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-opacity-40"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Contact Mobile phone</label>
                        <input 
                          type="text"
                          required
                          value={profileMobile}
                          onChange={(e) => setProfileMobile(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-opacity-40"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer pointer-events-auto transition-all"
                      >
                        Save Profile Changes
                      </button>
                    </form>
                  </div>
                </div>

                {/* Panel 2: Secure Access Gate / Password */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between bg-[#1e293b]/70 shadow-lg">
                  <div>
                    <div className="flex items-center gap-2.5 mb-5 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-sans">Security & Passcode</h3>
                        <p className="text-[11px] text-slate-400">Adjust your authentication key codes recursively.</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Current Password</label>
                        <input 
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-opacity-40"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">New Passcode</label>
                        <input 
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-opacity-40"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Confirm New Passcode</label>
                        <input 
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-opacity-40"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer pointer-events-auto transition-all"
                      >
                        Update Password Credentials
                      </button>
                    </form>
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* ========================================================= */}
          {/* UNIVERSAL RECORD EDITOR MODAL OVERLAY                     */}
          {/* ========================================================= */}
          {editingType && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-5 bg-pink-500 rounded"></span>
                    {editingType === 'expense' && 'Edit Purchase Entry'}
                    {editingType === 'income' && 'Edit Deposit Income'}
                    {editingType === 'savingsGoal' && 'Edit Savings Milestone Goal'}
                    {editingType === 'budget' && 'Edit Planned Budget Limit'}
                    {editingType === 'category' && 'Edit Category Catalog'}
                    {editingType === 'productPrice' && 'Bulk Adjust Product Unit Price'}
                    {editingType === 'recurringExpense' && 'Edit Recurring Payment Rules'}
                  </h4>
                  <button 
                    type="button"
                    onClick={() => { setEditingType(null); setEditingId(null); }}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer pointer-events-auto"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  {/* EXPENSE FIELD TARGETS */}
                  {editingType === 'expense' && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Product Name</label>
                        <input 
                          type="text" 
                          required
                          value={editFields.name || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Value (₹)</label>
                          <input 
                            type="number" 
                            required
                            value={editFields.amount || ''}
                            onChange={(e) => {
                              const amt = e.target.value;
                              const qty = parseInt(editFields.quantity) || 1;
                              const uPrice = parseFloat(amt) / qty || 0;
                              setEditFields(prev => ({ 
                                ...prev, 
                                amount: amt,
                                unitPrice: uPrice.toFixed(2)
                              }));
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none justify-self-stretch"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Quantity</label>
                          <input 
                            type="number" 
                            required
                            min="1"
                            value={editFields.quantity || '1'}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              const amt = parseFloat(editFields.amount) || 0;
                              const uPrice = amt / qty || 0;
                              setEditFields(prev => ({ 
                                ...prev, 
                                quantity: qty.toString(),
                                unitPrice: uPrice.toFixed(2)
                              }));
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 block mb-1 font-mono">CALCULATED UNIT PRICE: ₹{editFields.unitPrice || '0'}</label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Channel Mode</label>
                          <select 
                            value={editFields.paymentMode || 'UPI'}
                            onChange={(e) => setEditFields(prev => ({ ...prev, paymentMode: e.target.value as PaymentMode }))}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none shadow-sm font-semibold"
                          >
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Date Stamp</label>
                          <input 
                            type="date" 
                            required
                            value={editFields.date || ''}
                            onChange={(e) => setEditFields(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category Catalogs</label>
                        <select 
                          value={editFields.category || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none shadow-sm font-semibold"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Memo Notes</label>
                        <textarea 
                          value={editFields.notes || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none h-16 resize-none"
                          placeholder="e.g. store location details"
                        />
                      </div>
                    </>
                  )}

                  {/* INCOME FIELD TARGETS */}
                  {editingType === 'income' && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Income Resource Source</label>
                        <input 
                          type="text" 
                          required
                          value={editFields.source || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, source: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Amount (₹)</label>
                          <input 
                            type="number" 
                            required
                            value={editFields.amount || ''}
                            onChange={(e) => setEditFields(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Deposit Date</label>
                          <input 
                            type="date" 
                            required
                            value={editFields.date || ''}
                            onChange={(e) => setEditFields(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Memo Notes</label>
                        <textarea 
                          value={editFields.notes || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none h-16 resize-none"
                          placeholder="Salary slip key log, dividends..."
                        />
                      </div>
                    </>
                  )}

                  {/* SAVINGS GOALS FIELD TARGETS */}
                  {editingType === 'savingsGoal' && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Milestone Name</label>
                        <input 
                          type="text" 
                          required
                          value={editFields.name || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Target Amount (₹)</label>
                          <input 
                            type="number" 
                            required
                            value={editFields.targetAmount || ''}
                            onChange={(e) => setEditFields(prev => ({ ...prev, targetAmount: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Saved Amount (₹)</label>
                          <input 
                            type="number" 
                            required
                            value={editFields.savedAmount || ''}
                            onChange={(e) => setEditFields(prev => ({ ...prev, savedAmount: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Target Year/Month Date Limit</label>
                        <input 
                          type="date" 
                          required
                          value={editFields.targetDate || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, targetDate: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Dream Memo Notes</label>
                        <textarea 
                          value={editFields.notes || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none h-16 resize-none"
                          placeholder="Model specifications, brand notes..."
                        />
                      </div>
                    </>
                  )}

                  {/* BUDGET FIELD TARGETS */}
                  {editingType === 'budget' && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Budget Title Tag</label>
                        <input 
                          type="text" 
                          required
                          value={editFields.name || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Target Limit Cap (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={editFields.targetAmount || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, targetAmount: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Mapped Category Index</label>
                        <select 
                          value={editFields.categoryId || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-semibold shadow-sm"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* CATEGORIES FIELD TARGETS */}
                  {editingType === 'category' && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category Label</label>
                        <input 
                          type="text" 
                          required
                          value={editFields.name || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Vector Color Picker Theme</label>
                        <div className="flex gap-2 flex-wrap items-center mt-1.5 bg-slate-900/40 p-3 rounded-xl border border-white/5 justify-center">
                          {['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#06b6d4'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setEditFields(prev => ({ ...prev, color: color }))}
                              className={`w-6 h-6 rounded-full border cursor-pointer pointer-events-auto ${editFields.color === color ? 'border-white scale-125 shadow-sm' : 'border-black/50 hover:scale-110'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* PRODUCT PRICES BULK EDITOR */}
                  {editingType === 'productPrice' && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 font-mono">PRODUCT IDENTIFIER</label>
                        <input 
                          type="text" 
                          disabled
                          value={editFields.name || ''}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-400 text-xs focus:outline-none font-semibold cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Updated Base Unit Price (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={editFields.unitPrice || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, unitPrice: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                        <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                          ⚠️ Saving this bulk-adjusts the unit cost across **ALL** stored historical acquisitions named "{editFields.name}". The system automatically adjusts final expense totals reactively.
                        </p>
                      </div>
                    </>
                  )}

                  {/* RECURRING EXPENSE BILL Schedulings */}
                  {editingType === 'recurringExpense' && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Billing Schedule Item</label>
                        <input 
                          type="text" 
                          required
                          value={editFields.name || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Rate Charge (₹)</label>
                          <input 
                            type="number" 
                            required
                            value={editFields.amount || ''}
                            onChange={(e) => setEditFields(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Frequency</label>
                          <select 
                            value={editFields.frequency || 'Monthly'}
                            onChange={(e) => setEditFields(prev => ({ ...prev, frequency: e.target.value as RecurrentFrequency }))}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none shadow-sm font-semibold"
                          >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Next Processing Date</label>
                          <input 
                            type="date" 
                            required
                            value={editFields.nextDueDate || ''}
                            onChange={(e) => setEditFields(prev => ({ ...prev, nextDueDate: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-white text-[10px] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Schedule Activity Status</label>
                          <label className="inline-flex items-center gap-2 cursor-pointer pointer-events-auto">
                            <input 
                              type="checkbox" 
                              checked={!!editFields.isActive}
                              onChange={(e) => setEditFields(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="accent-pink-500 rounded border-white/10 bg-white/5 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs text-white uppercase font-bold tracking-wider">{editFields.isActive ? 'ACTIVE' : 'PAUSED'}</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Categories Catalog</label>
                        <select 
                          value={editFields.category || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-semibold shadow-sm"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Memo Notes</label>
                        <textarea 
                          value={editFields.notes || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none h-16 resize-none"
                          placeholder="Rental owner details, EMI auto debits..."
                        />
                      </div>
                    </>
                  )}

                  {/* ACTION CONTROLS */}
                  <div className="pt-4 flex gap-2 justify-end border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => { setEditingType(null); setEditingId(null); }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all pointer-events-auto cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all pointer-events-auto cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
