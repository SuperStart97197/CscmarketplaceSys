
import React, { useState } from 'react';
import { AppData, Sale } from '../types';
import { Icons } from '../constants';

interface ImportDataProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const ImportData: React.FC<ImportDataProps> = ({ data, updateData }) => {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState('');

  const handleManualImport = async (type: 'Shopee' | 'Lazada' | 'Master') => {
    setImporting(true);
    setStatus(`Processing ${type} import...`);
    
    setTimeout(() => {
      const mockInventoryId = data.inventory[0]?.id || crypto.randomUUID();
      const newSale: Sale = {
        id: crypto.randomUUID(),
        inventory_id: mockInventoryId,
        item_name: "Mock Imported Item " + Math.floor(Math.random() * 100),
        sale_date: new Date().toISOString().split('T')[0],
        selling_price: 150 + Math.random() * 50,
        cogs: 80,
        platform_fee: 15,
        selling_earn: 135,
        margin_earn: 55,
        tracking_num: "MY" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        username_buyer: "buyer_" + Math.random().toString(36).substring(2, 6),
        sku_ref_no: "SKU-999",
        platform: type === 'Master' ? 'Offline' : type,
        status: 'Delivered'
      };

      updateData(prev => ({
        ...prev,
        sales: [newSale, ...prev.sales]
      }));

      setImporting(false);
      setStatus(`Successfully imported 1 record from ${type}.`);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Platform Import</h2>
        <p className="text-slate-500">Import your orders directly from Shopee, Lazada, or TikTok.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImportCard 
          title="Shopee" 
          desc="Order My Income Report" 
          onImport={() => handleManualImport('Shopee')}
          disabled={importing}
        />
        <ImportCard 
          title="Lazada" 
          desc="Transaction History" 
          onImport={() => handleManualImport('Lazada')}
          disabled={importing}
        />
        <ImportCard 
          title="Master Spreadsheet" 
          desc="Bulk Inventory Sync" 
          onImport={() => handleManualImport('Master')}
          disabled={importing}
        />
      </div>

      {status && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl text-sm font-bold animate-in fade-in duration-300">
          {status}
        </div>
      )}

      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start space-x-4">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
          <Icons.Dashboard className="w-6 h-6" />
        </div>
        <div className="text-sm text-amber-800 leading-relaxed">
          <h4 className="font-bold mb-1">Import Mapping</h4>
          <p className="opacity-80">
            For cross-device syncing, please visit the **Privacy & Sync** tab in the sidebar. This page is only for platform order imports.
          </p>
        </div>
      </div>
    </div>
  );
};

const ImportCard: React.FC<{ title: string; desc: string; onImport: () => void; disabled: boolean }> = ({ title, desc, onImport, disabled }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-blue-200 transition-all">
    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
      <Icons.Import className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-xs text-slate-500 mb-6">{desc}</p>
    <button 
      onClick={onImport}
      disabled={disabled}
      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-sm transition-colors border border-slate-200"
    >
      Upload File
    </button>
  </div>
);

export default ImportData;
