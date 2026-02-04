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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [storedPasscode, setStoredPasscode] = useState<string | null>(localStorage.getItem('cloudstock_passcode'));
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  
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
    
    // If no passcode is set, we consider the user authorized to set one
    if (!localStorage.getItem('cloudstock_passcode')) {
      setIsAuthorized(false);
    }
  }, []);

  // Save data to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('cloudstock_data', JSON.stringify(data));
  }, [data]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storedPasscode) {
      // Setup phase
      if (passcodeInput.length >= 4) {
        localStorage.setItem('cloudstock_passcode', passcodeInput);
        setStoredPasscode(passcodeInput);
        setIsAuthorized(true);
      }
    } else {
      // Login phase
      if (passcodeInput === storedPasscode) {
        setIsAuthorized(true);
        setPasscodeError(false);
      } else {
        setPasscodeError(true);
        setPasscodeInput('');
      }
    }
  };

  const updateData = (updater: (prev: AppData) => AppData) => {
    setData(prev => updater(prev));
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {storedPasscode ? 'Restricted Access' : 'Create Your Passcode'}
            </h1>
            <p className="text-slate-500 text-sm">
              {storedPasscode 
                ? 'Enter your private code to view records' 
                : 'Set a 4-6 digit code to secure your data'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                className={`w-full text-center text-3xl tracking-[1em] font-bold py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                  passcodeError ? 'border-red-500 shake' : 'border-slate-200 focus:border-blue-500'
                }`}
                placeholder="••••"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
              />
              {passcodeError && (
                <p className="text-center text-xs font-bold text-red-500">Incorrect Passcode</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-100"
            >
              {storedPasscode ? 'Unlock System' : 'Set Passcode'}
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Data encrypted locally on this device
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button 
            onClick={() => setIsAuthorized(false)}
            className="w-full flex items-center text-xs font-bold text-slate-400 hover:text-red-500 p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            LOCK SYSTEM
          </button>
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
        <button 
          onClick={() => setIsAuthorized(false)}
          className="text-slate-400 p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>
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
