
import React, { useMemo } from 'react';
import { AppData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const stats = useMemo(() => {
    const totalSales = data.sales.reduce((sum, s) => sum + s.selling_price, 0);
    const totalCOGS = data.sales.reduce((sum, s) => sum + s.cogs, 0);
    const totalFees = data.sales.reduce((sum, s) => sum + s.platform_fee, 0);
    const opExpenses = data.expenses.filter(e => e.type === 'Operating').reduce((sum, e) => sum + e.amount, 0);
    
    const grossProfit = totalSales - totalCOGS;
    const netProfit = grossProfit - totalFees - opExpenses;
    
    const lowStockItems = Array.from(new Set(data.inventory.map(i => i.item_name)))
      .map(name => ({
        name,
        qty: data.inventory.filter(i => i.item_name === name).reduce((s, i) => s + i.current_qty, 0)
      }))
      .filter(i => i.qty < 5);

    return { totalSales, grossProfit, netProfit, lowStockCount: lowStockItems.length, lowStockItems };
  }, [data]);

  // Aggregate monthly performance
  const chartData = useMemo(() => {
    const monthly: Record<string, any> = {};
    
    data.sales.forEach(s => {
      const month = s.sale_date.substring(0, 7); // YYYY-MM
      if (!monthly[month]) monthly[month] = { month, sales: 0, profit: 0, expenses: 0 };
      monthly[month].sales += s.selling_price;
      monthly[month].profit += s.margin_earn - s.platform_fee;
    });

    data.expenses.forEach(e => {
      const month = e.date_spent.substring(0, 7);
      if (!monthly[month]) monthly[month] = { month, sales: 0, profit: 0, expenses: 0 };
      if (e.type === 'Operating') {
        monthly[month].expenses += e.amount;
        monthly[month].profit -= e.amount;
      }
    });

    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [data]);

  const platformSales = useMemo(() => {
    const plats: Record<string, number> = {};
    data.sales.forEach(s => {
      plats[s.platform] = (plats[s.platform] || 0) + s.selling_price;
    });
    return Object.entries(plats).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Business Overview</h2>
        <p className="text-slate-500">Real-time performance metrics</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={stats.totalSales} color="blue" />
        <StatCard title="Net Profit" value={stats.netProfit} color="green" />
        <StatCard title="Low Stock Alerts" value={stats.lowStockCount} isCurrency={false} color="red" />
        <StatCard title="Monthly Growth" value={8.5} isCurrency={false} suffix="%" color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Performance Trend</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={0} name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar - Alerts & Breakdown */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Low Stock Items</h3>
            <div className="space-y-4">
              {stats.lowStockItems.length > 0 ? stats.lowStockItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-sm font-medium text-red-900">{item.name}</span>
                  <span className="text-xs px-2 py-1 bg-white text-red-600 rounded-lg font-bold border border-red-200">
                    {item.qty} left
                  </span>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  All inventory healthy ✅
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Sales by Platform</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformSales}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; color: string; isCurrency?: boolean; suffix?: string }> = ({ 
  title, value, color, isCurrency = true, suffix = '' 
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    indigo: 'bg-indigo-600',
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-2 h-2 rounded-full ${colorClasses[color]}`}></div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-slate-900">
          {isCurrency ? `RM ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
