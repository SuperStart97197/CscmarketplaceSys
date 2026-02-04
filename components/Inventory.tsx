
import React, { useState } from 'react';
import { AppData, InventoryItem } from '../types';

interface InventoryProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const Inventory: React.FC<InventoryProps> = ({ data, updateData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    item_name: '',
    qty_received: 1,
    unit_price: 0,
    shipping_charge: 0,
    date_purchase: new Date().toISOString().split('T')[0]
  });

  const filteredItems = data.inventory.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fix: Added generic type parameter to reduce to ensure groupedItems entries are correctly typed
  const groupedItems = filteredItems.reduce<Record<string, { total: number, items: InventoryItem[] }>>((acc, item) => {
    if (!acc[item.item_name]) acc[item.item_name] = { total: 0, items: [] };
    acc[item.item_name].total += item.current_qty;
    acc[item.item_name].items.push(item);
    return acc;
  }, {});

  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      date_purchase: formData.date_purchase || '',
      item_name: formData.item_name || '',
      qty_received: Number(formData.qty_received),
      unit_price: Number(formData.unit_price),
      shipping_charge: Number(formData.shipping_charge),
      total_unit_cost: Number(formData.unit_price) + Number(formData.shipping_charge),
      current_qty: Number(formData.qty_received),
      status: 'Onhand'
    };

    updateData(prev => ({
      ...prev,
      inventory: [newItem, ...prev.inventory]
    }));
    setShowAddForm(false);
    setFormData({ item_name: '', qty_received: 1, unit_price: 0, shipping_charge: 0, date_purchase: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-slate-500">Track and manage stock levels</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Restock Items
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      {/* Grouped Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(groupedItems).map(([name, group]) => (
          <div key={name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-800 text-lg truncate pr-2">{name}</h3>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${group.total < 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                {group.total} in stock
              </span>
            </div>
            
            <div className="space-y-3 flex-1">
              {group.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-slate-500 text-xs">{item.date_purchase}</p>
                    <p className="font-medium text-slate-700">{item.current_qty} units @ RM {item.total_unit_cost.toFixed(2)}</p>
                  </div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">ID: {item.id.slice(0, 4)}</span>
                </div>
              ))}
              {group.items.length > 3 && (
                <p className="text-center text-xs text-blue-500 font-medium cursor-pointer hover:underline">
                  + {group.items.length - 3} more batches
                </p>
              )}
            </div>

            <button className="mt-6 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold transition-colors">
              Adjust Levels
            </button>
          </div>
        ))}
      </div>

      {/* Add Inventory Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Restock Inventory</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddInventory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Qty Received</label>
                  <input required type="number" min="1" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.qty_received} onChange={e => setFormData({...formData, qty_received: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
                  <input required type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.date_purchase} onChange={e => setFormData({...formData, date_purchase: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (RM)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shipping (RM)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.shipping_charge} onChange={e => setFormData({...formData, shipping_charge: Number(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                  Save Inventory Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
