/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Expense, Category, Income, ProductPriceTracker } from '../types';
import { calculateProductPriceHistory } from '../utils/dataStore';
import { TrendingUp, Award, Activity, Calendar, Edit } from 'lucide-react';

interface ChartsProps {
  expenses: Expense[];
  categories: Category[];
  incomes: Income[];
}

/**
 * 1. Category Pie Chart (Durable SVG Donut Segment implementation)
 */
export const CategoryPieChart: React.FC<{ expenses: Expense[]; categories: Category[] }> = ({ expenses, categories }) => {
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  const total = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group amounts by category
  const groupedData = categories.map(cat => {
    const amount = activeExpenses
      .filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat.name,
      amount,
      color: cat.color,
      percentage: total > 0 ? (amount / total) * 100 : 0
    };
  }).filter(d => d.amount > 0);

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159
  let currentAccumulator = 0;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          Expense by Category
        </h3>
        <p className="text-xs text-slate-500 mb-4">Percentage allocation of total spending (₹{total.toLocaleString()})</p>
        
        {groupedData.length === 0 ? (
          <div className="text-sm font-medium text-slate-500 py-10 text-center">No expenses recorded for categories.</div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {groupedData.map((g, idx) => (
              <div 
                key={g.name}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${hoveredIdx === idx ? 'bg-slate-100' : 'hover:bg-slate-105'}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }}></span>
                  <span className="text-sm text-slate-700 font-medium">{g.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-900 font-semibold">₹{g.amount.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 block">{g.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {groupedData.length > 0 && (
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
            
            {groupedData.map((g, idx) => {
              const strokeOffset = circumference - (g.percentage / 100) * circumference;
              const rotationAngle = (currentAccumulator / 100) * 360;
              currentAccumulator += g.percentage;

              return (
                <circle
                  key={g.name}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={g.color}
                  strokeWidth={hoveredIdx === idx ? "16" : "12"}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    transformOrigin: '60px 60px',
                    transform: `rotate(${rotationAngle}deg)`,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 font-medium font-sans">Total</span>
            <span className="text-lg font-bold text-slate-900">₹{total > 100000 ? `${(total/1000).toFixed(1)}k` : total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 2. Monthly Expense Trend (Sleek line chart mapping dates)
 */
export const MonthlyTrendLineChart: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  
  // Group by date of the last 7 calendar days
  const chartPoints: { dateLabel: string; amount: number }[] = [];
  const daysToShow = 7;
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const totalOnDate = activeExpenses
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
    
    // label e.g. "01 Jun"
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    chartPoints.push({ dateLabel: label, amount: totalOnDate });
  }

  const amounts = chartPoints.map(p => p.amount);
  const maxAmount = Math.max(...amounts, 100);
  
  // Generate points for SVG path
  const width = 500;
  const height = 150;
  const padding = 30;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Generate coordinate array
  const points = chartPoints.map((p, idx) => {
    const x = padding + (idx / (daysToShow - 1)) * graphWidth;
    // Y starts from the top, so we reverse it
    const y = height - padding - (p.amount / maxAmount) * graphHeight;
    return { x, y, value: p.amount, label: p.dateLabel };
  });

  // Polyline coordinates
  const pathD = points.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  // Curve fill path coordinates
  const fillD = pathD ? pathD + `L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` : '';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-500" />
        Weekly Spending Trend
      </h3>
      <p className="text-xs text-slate-500 mb-4">Daily expenditure tracking across the last 7 days</p>

      <div className="relative w-full overflow-hidden">
        <svg className="w-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const hY = padding + ratio * graphHeight;
            const gridVal = Math.round(maxAmount * (1 - ratio));
            return (
              <g key={idx} className="opacity-60">
                <line x1={padding} y1={hY} x2={width - padding} y2={hY} stroke="#e2e8f0" strokeDasharray="3,3" />
                <text x={padding - 5} y={hY + 4} fill="#cbd5e1" fontSize="9" textAnchor="end">₹{gridVal}</text>
              </g>
            );
          })}

          <path d={fillD} fill="url(#indigo-gradient)" className="opacity-20" />
          <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover Dots / Value Labels */}
          {points.map((p, idx) => (
            <g key={idx} className="group">
              <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" className="cursor-pointer transition-all hover:r-7" />
              {/* Highlight background text tooltip on hover */}
              <text x={p.x} y={p.y - 12} fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                ₹{p.value}
              </text>
              {/* Vertical dotted guide line */}
              <line x1={p.x} y1={p.y} x2={p.x} y2={height - padding} stroke="#4f46e5" strokeWidth="1" strokeDasharray="2,2" className="opacity-0 group-hover:opacity-50 pointer-events-none" />
              {/* Date axis label */}
              <text x={p.x} y={height - 8} fill="#64748b" fontSize="9" textAnchor="middle">{p.label}</text>
            </g>
          ))}

          {/* Define gradients */}
          <defs>
            <linearGradient id="indigo-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

/**
 * 3. Income vs Expense (Side-by-side or stacked comparative bar chart)
 */
export const IncomeExpenseBarChart: React.FC<ChartsProps> = ({ expenses, incomes }) => {
  const activeExpenses = expenses.filter(e => !e.isDeleted);
  const activeIncomes = incomes.filter(i => !i.isDeleted);

  const totalExpense = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = activeIncomes.reduce((sum, i) => sum + i.amount, 0);
  const savings = Math.max(0, totalIncome - totalExpense);

  const maxVal = Math.max(totalIncome, totalExpense, 1000);
  const scale = (val: number) => (val / maxVal) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
        <Award className="w-5 h-5 text-emerald-500" />
        Income vs Expense Balance
      </h3>
      <p className="text-xs text-slate-500 mb-6">Visual cashflow comparative analysis</p>

      <div className="flex flex-col gap-6">
        {/* Income Bar Segment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Total Income
            </span>
            <span className="text-base font-bold text-slate-900">₹{totalIncome.toLocaleString()}</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" 
              style={{ width: `${scale(totalIncome)}%` }}
            ></div>
          </div>
        </div>

        {/* Expense Bar Segment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-rose-600 flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Total Expenses
            </span>
            <span className="text-base font-bold text-slate-900">₹{totalExpense.toLocaleString()}</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000" 
              style={{ width: `${scale(totalExpense)}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Saving Ratio Indicator */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Net Savings Ratio</span>
            <span className="text-lg font-bold text-emerald-600">₹{savings.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block font-semibold">Savings Ratio</span>
            <span className="text-sm font-semibold text-slate-800 font-sans">
              {totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 4. Daily Spending Matrix Heatmap
 * Maps spending amount index across standard week rows (Last Month view)
 */
export const SpendingHeatmap: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  const activeExpenses = expenses.filter(e => !e.isDeleted);

  // We want to generate last 28 days mapped into a 7 (days of week) x 4 (weeks) grid schema.
  const daysCount = 28;
  const blocks: { dateStr: string; amount: number; intensity: number }[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const totalOnDate = activeExpenses
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate arbitrary intensity factor from 0 to 4
    let intensity = 0;
    if (totalOnDate > 0 && totalOnDate <= 50) intensity = 1;
    else if (totalOnDate > 50 && totalOnDate <= 200) intensity = 2;
    else if (totalOnDate > 200 && totalOnDate <= 700) intensity = 3;
    else if (totalOnDate > 700) intensity = 4;

    blocks.push({
      dateStr,
      amount: totalOnDate,
      intensity
    });
  }

  const intensityColors = [
    'bg-slate-50 border-slate-100 text-slate-400', // 0
    'bg-emerald-50 border-emerald-100 text-emerald-600', // 1: <50
    'bg-emerald-100 border-emerald-200 text-emerald-700', // 2: <200
    'bg-emerald-200 border-emerald-300 text-emerald-800', // 3: <700
    'bg-emerald-500 border-emerald-600 text-white font-semibold' // 4: >700
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-500" />
        Daily Spending Heatmap
      </h3>
      <p className="text-xs text-slate-500 mb-6">Index of absolute spending events over the last 4 weeks</p>

      <div className="grid grid-cols-7 gap-2.5 max-w-sm mx-auto">
        {blocks.map((b, idx) => {
          const dateObj = new Date(b.dateStr);
          const dayLabel = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          return (
            <div 
              key={idx}
              className={`aspect-square rounded flex flex-col items-center justify-center border transition-all hover:scale-110 cursor-help ${intensityColors[b.intensity]}`}
              title={`${dayLabel}: ₹${b.amount.toLocaleString()}`}
            >
              <span className="text-[10px] opacity-70">{dateObj.getDate()}</span>
              {b.amount > 0 && (
                <span className="text-[8px] font-bold block truncate max-w-full">
                  ₹{b.amount > 999 ? `${(b.amount/1000).toFixed(0)}k` : b.amount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-6 text-xs text-slate-500 font-sans">
        <span>Less active</span>
        <div className="flex gap-1">
          <span className="w-3 h-3 rounded bg-slate-50 border border-slate-100"></span>
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-100"></span>
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></span>
          <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300"></span>
          <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600"></span>
        </div>
        <span>High budget load</span>
      </div>
    </div>
  );
};

/**
 * 5. Smart Product Price Tracking Chart (Curved trend of specific item over time)
 */
export const ProductPriceTracking: React.FC<{ expenses: Expense[]; onEditProductPrice?: (productName: string) => void }> = ({ expenses, onEditProductPrice }) => {
  const trackers = calculateProductPriceHistory(expenses);
  
  // Choose selected product to map
  const [selectedProduct, setSelectedProduct] = useState<string>(trackers[0]?.name || '');

  const dataObj = trackers.find(t => t.name === selectedProduct);

  if (trackers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center py-12">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Smart Product Price Tracker</h3>
        <p className="text-sm text-slate-500">Input repetitive items like "Tea" or "Petrol" with different unit prices over the calendar, and the system auto-calculates increase metrics!</p>
      </div>
    );
  }

  // Fallback to first if selected goes missing
  const activeTracker = dataObj || trackers[0];

  // Map coordinates
  const width = 450;
  const height = 140;
  const padding = 25;
  const maxPrice = Math.max(...activeTracker.history.map(h => h.price), 10);
  const minPrice = Math.min(...activeTracker.history.map(h => h.price), 0);
  const delta = maxPrice - minPrice > 0 ? maxPrice - minPrice : 10;

  const points = activeTracker.history.map((h, idx) => {
    const x = padding + (idx / Math.max(activeTracker.history.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((h.price - minPrice) / delta) * (height - padding * 2);
    return { x, y, price: h.price, date: h.date };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            Smart Product Price Tracking
          </h3>
          <p className="text-xs text-slate-500">Tracks price inflation records computed directly from purchases</p>
        </div>
        
        <div className="flex items-center gap-1.5">
          <select 
            className="text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 rounded-lg p-1.5 focus:outline-none cursor-pointer"
            value={activeTracker.name}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            {trackers.map(t => (
              <option key={t.name} value={t.name} className="bg-white text-slate-800 font-semibold">{t.name}</option>
            ))}
          </select>
          {onEditProductPrice && (
            <button
              type="button"
              onClick={() => onEditProductPrice(activeTracker.name)}
              className="p-1.5 bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-500 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors"
              title="Edit latest product unit price"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="text-center border-r border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Average Cost</span>
          <span className="text-sm font-bold text-slate-800 font-mono">₹{activeTracker.averageCost}</span>
        </div>
        <div className="text-center border-r border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Price</span>
          <span className="text-sm font-bold text-slate-900 font-mono">
            ₹{activeTracker.history[activeTracker.history.length - 1]?.price || 0}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Increase Metric</span>
          <span className={`text-sm font-bold block font-mono ${activeTracker.priceIncreasePercent > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {activeTracker.priceIncreasePercent > 0 ? `+${activeTracker.priceIncreasePercent}%` : `${activeTracker.priceIncreasePercent}%`}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        {activeTracker.history.length < 2 ? (
          <div className="text-xs text-slate-400 py-6 text-center">Need at least 2 logs with different dates to plot price fluctuation. Added automatically on repeat items like Tea!</div>
        ) : (
          <svg className="w-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid helper */}
            <g className="opacity-10">
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#000000" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#000000" />
            </g>

            <path d={pathD} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points and Dates helper */}
            {points.map((p, idx) => {
              const parseDate = new Date(p.date);
              const label = parseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
              return (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={p.x} y={p.y - 10} fill="#ec4899" fontSize="9" fontWeight="bold" textAnchor="middle">₹{p.price}</text>
                  <text x={p.x} y={height - 6} fill="#64748b" fontSize="8" textAnchor="middle">{label}</text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
