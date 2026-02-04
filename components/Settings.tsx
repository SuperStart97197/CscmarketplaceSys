
import React, { useState, useRef } from 'react';
import { AppData } from '../types';

interface SettingsProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

const Settings: React.FC<SettingsProps> = ({ data, updateData }) => {
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cloudstock_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setStatus('✅ Backup downloaded! Send this file to your phone/iPad.');
    setTimeout(() => setStatus(''), 5000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importedData = JSON.parse(result) as AppData;
        
        if (Array.isArray(importedData.inventory) && Array.isArray(importedData.sales)) {
          if (confirm('Warning: This will replace all existing data on this device with the backup file. Continue?')) {
            updateData(() => importedData);
            setStatus('🚀 Data restored successfully!');
          }
        } else {
          setStatus('❌ Error: Invalid backup file.');
        }
      } catch (err) {
        setStatus('❌ Error: Could not read file.');
      }
      setTimeout(() => setStatus(''), 5000);
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Privacy & Cross-Device Sync</h2>
        <p className="text-slate-500 font-medium">Your data stays on your device. Use these tools to move it.</p>
      </header>

      {status && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl text-center font-bold animate-bounce">
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync Card */}
        <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm flex flex-col">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Move Data to Phone/iPad</h3>
          </div>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            1. Click **Export Backup** on this computer.<br/>
            2. Send the file to your phone (via WhatsApp/Email).<br/>
            3. Open this app on your phone and use **Load from Backup**.
          </p>
          <div className="mt-auto space-y-3">
            <button 
              onClick={handleExportData}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
            >
              Export Backup File
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold transition-all"
            >
              Load from Backup
            </button>
          </div>
        </div>

        {/* Privacy Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.621 3.474 10.331 8.388 12.23a11.956 11.956 0 008.388-12.23c0-1.311-.209-2.571-.598-3.751A11.956 11.956 0 0112 2.714z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">100% Data Privacy</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <h4 className="text-sm font-bold text-slate-700 mb-1">Local Hosting</h4>
              <p className="text-xs text-slate-500 leading-relaxed">No data is sent to a central server. Your inventory, costs, and profits are stored encrypted in your browser's LocalStorage.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <h4 className="text-sm font-bold text-slate-700 mb-1">Public Web, Private Data</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Even if the app is hosted on GitHub or Vercel, the hosting provider only sees the code, never your records.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <h4 className="text-sm font-bold text-amber-800 mb-1">Browser Cache Warning</h4>
              <p className="text-xs text-amber-700 leading-relaxed">Clearing your browser's "Site Data" or "History" might delete your data. **Always keep a backup file.**</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-3xl text-white">
        <h3 className="text-xl font-bold mb-4">Host it yourself for Free</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl leading-relaxed">
          To access this on iPad and Android for $0, upload these files to **GitHub Pages**. It provides a private URL that you can open on any device. 
        </p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <a href="https://pages.github.com/" target="_blank" className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold text-sm text-center">Setup GitHub Pages</a>
          <a href="https://vercel.com/" target="_blank" className="px-6 py-2 bg-slate-700 text-white rounded-xl font-bold text-sm text-center">Try Vercel (Free Tier)</a>
        </div>
      </div>
    </div>
  );
};

export default Settings;
