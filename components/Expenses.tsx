
import React, { useState } from 'react';
import { AppData, Expense } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface ExpensesProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ data, updateData }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    date_spent: new Date().toISOString().split('T')[0],
    category: EXPENSE_CATEGORIES[0],
    amount: 0,
    description: '',
    type: 'Operating'
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: crypto.randomUUID(),
      date_spent: formData.date_spent!,
      category: formData.category!,
      description: formData.description || '',
      amount: Number(formData.amount),
      type: formData.type as any
    };

    updateData(prev => ({ ...prev, expenses: [newExp, ...prev.expenses] }));
    setShowAdd(false);
    setFormData({ 
      date_spent: new Date().toISOString().split('T')[0], 
      category: EXPENSE_CATEGORIES[0], 
      amount: 0, 
      description: '', 
      type: 'Operating' 
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Expense Tracking</h2>
          <p className="text-slate-500">Manage operational costs and capital</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold shadow-xl transition-all flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Record Expense
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Op. Expenses (MTD)</h3>
          <p className="text-3xl font-bold text-slate-900">
            RM {data.expenses.filter(e => e.type === 'Operating').reduce((s, e) => s + e.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Drawings</h3>
          <p className="text-3xl font-bold text-slate-900">
            RM {data.expenses.filter(e => e.type === 'Drawing').reduce((s, e) => s + e.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Capital Injection</h3>
          <p className="text-3xl font-bold text-slate-900">
            RM {data.expenses.filter(e => e.type === 'Capital').reduce((s, e) => s + e.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{exp.date_spent}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                    {exp.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{exp.description || '-'}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">RM {exp.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">New Expense Entry</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input required type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.date_spent} onChange={e => setFormData({...formData, date_spent: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="Operating">Operating</option>
                    <option value="Drawing">Owner Drawing</option>
                    <option value="Capital">Capital Injection</option>
                    <option value="Income">Miscellaneous Income</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (RM)</label>
                <input required type="number" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all">
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
