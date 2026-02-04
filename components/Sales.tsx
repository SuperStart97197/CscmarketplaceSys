
import React, { useState, useMemo } from 'react';
import { AppData, Sale } from '../types';
import { PLATFORMS, Icons } from '../constants';

interface SalesProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const Sales: React.FC<SalesProps> = ({ data, updateData }) => {
  const [filterPlatform, setFilterPlatform] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = useMemo(() => {
    return data.sales.filter(s => 
      (filterPlatform === 'All' || s.platform === filterPlatform) &&
      (s.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       s.tracking_num.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.username_buyer.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => b.sale_date.localeCompare(a.sale_date));
  }, [data.sales, filterPlatform, searchTerm]);

  const handleRefund = (saleId: string, returnToStock: boolean) => {
    const sale = data.sales.find(s => s.id === saleId);
    if (!sale) return;

    updateData(prev => {
      const newSales = prev.sales.map(s => {
        if (s.id === saleId) {
          return {
            ...s,
            status: returnToStock ? 'Returned' : 'Refunded',
            selling_price: 0,
            platform_fee: 0,
            selling_earn: 0,
            cogs: returnToStock ? 0 : s.cogs,
            margin_earn: returnToStock ? 0 : -s.cogs
          } as Sale;
        }
        return s;
      });

      let newInventory = [...prev.inventory];
      if (returnToStock) {
        newInventory = prev.inventory.map(inv => {
          if (inv.id === sale.inventory_id) {
            return { ...inv, current_qty: inv.current_qty + 1 };
          }
          return inv;
        });
      }

      return { ...prev, sales: newSales, inventory: newInventory };
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales History</h2>
          <p className="text-slate-500">Track orders and manage refunds</p>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {['All', ...PLATFORMS].map(p => (
            <button
              key={p}
              onClick={() => setFilterPlatform(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                filterPlatform === p ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Search buyer, item, or tracking..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date / Item</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Platform / Buyer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Price / Earn</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-xs text-slate-400 font-medium mb-1">{sale.sale_date}</p>
                    <p className="font-bold text-slate-800 text-sm max-w-[200px] truncate">{sale.item_name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Ref: {sale.tracking_num || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sale.platform === 'Shopee' ? 'bg-orange-100 text-orange-600' :
                        sale.platform === 'Lazada' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {sale.platform}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-600">{sale.username_buyer}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className="text-sm font-bold text-slate-800">RM {sale.selling_price.toFixed(2)}</p>
                    <p className={`text-xs font-semibold ${sale.margin_earn > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {sale.margin_earn > 0 ? '+' : ''}RM {sale.margin_earn.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      sale.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRefund(sale.id, true)}
                      className="text-red-600 hover:text-red-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-all"
                    >
                      Refund
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <Icons.Sales className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">No sales found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
