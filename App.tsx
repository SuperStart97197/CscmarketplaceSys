
import React, { useState, useEffect } from 'react';
import { Page, AppData } from './types';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import LHDNReport from './components/LHDNReport';
import ImportData from './components/ImportData';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [data, setData] = useState<AppData>({
    inventory: [],
    sales: [],
    expenses: [],
    skuMappings: []
  });

  // Load data from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cloudstock_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local data", e);
      }
    }
  }, []);

  // Save data to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('cloudstock_data', JSON.stringify(data));
  }, [data]);

  const updateData = (updater: (prev: AppData) => AppData) => {
    setData(prev => updater(prev));
  };

  const navItems = [
    { id: 'Dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
    { id: 'Inventory', icon: Icons.Inventory, label: 'Inventory' },
    { id: 'Sales', icon: Icons.Sales, label: 'Sales' },
    { id: 'Expenses', icon: Icons.Expenses, label: 'Expenses' },
    { id: 'LHDN', icon: Icons.Tax, label: 'Tax Reports' },
    { id: 'Import', icon: Icons.Import, label: 'Import' },
    { id: 'Settings', icon: Icons.Settings, label: 'Privacy & Sync' },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard': return <Dashboard data={data} />;
      case 'Inventory': return <Inventory data={data} updateData={updateData} />;
      case 'Sales': return <Sales data={data} updateData={updateData} />;
      case 'Expenses': return <Expenses data={data} updateData={updateData} />;
      case 'LHDN': return <LHDNReport data={data} />;
      case 'Import': return <ImportData data={data} updateData={updateData} />;
      case 'Settings': return <Settings data={data} updateData={updateData} />;
      default: return <Dashboard data={data} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CloudStock Pro
          </h1>
          <p className="text-xs text-slate-500 font-medium">Serverless Inventory</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                currentPage === item.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-3"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Privacy Mode</p>
              <p className="text-xs font-semibold text-slate-600">Local Storage Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          CloudStock
        </h1>
        <div className="flex items-center space-x-2">
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase">Local</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderContent()}
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav className="lg:hidden flex items-center justify-around bg-white border-t border-slate-200 px-2 py-3 sticky bottom-0 z-50 shadow-2xl">
          {navItems.filter(i => ['Dashboard', 'Inventory', 'Sales', 'LHDN', 'Settings'].includes(i.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
              className={`flex flex-col items-center flex-1 transition-colors ${
                currentPage === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
