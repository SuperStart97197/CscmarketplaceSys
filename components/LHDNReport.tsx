
import React, { useMemo, useState } from 'react';
import { AppData } from '../types';

interface LHDNReportProps {
  data: AppData;
}

const LHDNReport: React.FC<LHDNReportProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const report = useMemo(() => {
    const yearStr = selectedYear.toString();
    
    const yearSales = data.sales.filter(s => s.sale_date.startsWith(yearStr));
    const yearExpenses = data.expenses.filter(e => e.date_spent.startsWith(yearStr));

    const totalSales = yearSales.reduce((sum, s) => sum + s.selling_price, 0);
    const totalCOGS = yearSales.reduce((sum, s) => sum + s.cogs, 0);
    const totalFees = yearSales.reduce((sum, s) => sum + s.platform_fee, 0);
    
    // Fix: Added generic type parameter to reduce to ensure correct typing for expenseBreakdown
    const expenseBreakdown = yearExpenses.reduce<Record<string, number>>((acc, e) => {
      if (e.type === 'Operating') {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
      }
      return acc;
    }, {});

    // Fix: Using number typed initial value and ensuring input values are treated as numbers for the totalOpExp calculation
    const totalOpExp = Object.values(expenseBreakdown).reduce((a, b) => a + b, 0);
    const grossProfit = totalSales - totalCOGS;
    const netProfit = grossProfit - totalFees - totalOpExp;

    return { totalSales, totalCOGS, totalFees, expenseBreakdown, grossProfit, netProfit, totalOpExp };
  }, [data, selectedYear]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🇲🇾 LHDN Tax Reports</h2>
          <p className="text-slate-500">Annual financial statement for tax submission</p>
        </div>
        <select 
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-semibold text-slate-700 outline-none"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl print:shadow-none print:border-0">
        <div className="text-center mb-10 border-b border-slate-100 pb-8">
          <h3 className="text-xl font-bold text-slate-900 uppercase">Statement of Profit and Loss</h3>
          <p className="text-slate-500 font-medium">For the year ended 31 December {selectedYear}</p>
        </div>

        <div className="space-y-6">
          <SectionRow label="Revenue (Total Sales)" value={report.totalSales} />
          <SectionRow label="Less: Cost of Goods Sold (COGS)" value={-report.totalCOGS} />
          <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg">
            <span>Gross Profit</span>
            <span>RM {report.grossProfit.toFixed(2)}</span>
          </div>

          <div className="pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Expenses</h4>
            <div className="space-y-3">
              <ExpenseRow label="Platform Commission & Fees" value={report.totalFees} />
              {Object.entries(report.expenseBreakdown).map(([cat, val]) => (
                <ExpenseRow key={cat} label={cat} value={val} />
              ))}
            </div>
          </div>

          <div className="border-t-2 border-slate-900 pt-4 flex justify-between font-bold text-xl text-blue-900">
            <span>Net Profit / (Loss)</span>
            <span>RM {report.netProfit.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-12 p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 leading-relaxed italic">
          Disclaimer: This report is generated based on user-provided data for internal reference and preparation of Form B/BE/P for LHDN submission. Please consult a professional tax accountant for official audit.
        </div>
      </div>

      <button 
        onClick={() => window.print()}
        className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center print:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.844l.845-3.413a2.25 2.25 0 011.353-1.502l4.494-1.815a2.25 2.25 0 012.455.34l3.18 2.651m-12.327 3.739l-.822 3.138a2.25 2.25 0 00.11 1.586l1.497 3.146A2.25 2.25 0 004.951 24H19.05a2.25 2.25 0 002.014-1.24l1.497-3.146a2.25 2.25 0 00.11-1.586l-.822-3.138m-12.327 3.739a2.25 2.25 0 01-1.977-1.122L2.057 12.75A2.25 2.25 0 014.034 9.42l1.638-.506" />
        </svg>
        Print / Save as PDF
      </button>
    </div>
  );
};

const SectionRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-slate-800">
    <span className="font-medium">{label}</span>
    <span className="font-bold">RM {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
  </div>
);

const ExpenseRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-slate-600 pl-4">
    <span className="text-sm">(-) {label}</span>
    <span className="text-sm font-semibold">RM {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
  </div>
);

export default LHDNReport;
