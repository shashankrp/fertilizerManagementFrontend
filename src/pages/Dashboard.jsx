import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  Users as UsersIcon,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  History
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StatCard = ({ title, value, change, positive, icon: Icon, color }) => (
  <div className="card p-4 md:p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">{title}</p>
        <h3 className="text-xl md:text-2xl font-bold text-stone-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-3 flex items-center gap-1">
      {change && (
        <>
          {positive ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-rose-600" />
          )}
          <span className={`text-[10px] font-bold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {change}
          </span>
          <span className="text-[10px] text-stone-400">vs last month</span>
        </>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { fertilizers, sales, loading: inventoryLoading } = useInventory();
  const { isSuperAdmin, isAdmin } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, logs] = await Promise.all([
          api.get('/users'),
          api.get('/audit-logs')
        ]);
        
        const visibleUsers = (users || []).filter(u => {
          // Hide own account
          if (u.id === user?.id) return false;
          // Hide super admins from regular admins
          if (isAdmin && !isSuperAdmin && u.role === 'SUPER_ADMIN') return false;
          return true;
        });
        
        setUserCount(visibleUsers.length || 0);
        setRecentLogs((logs || []).slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = sales.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  const totalStock = fertilizers.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0);
  const totalOrders = sales.length;

  // Generate chart data for the last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    const daySales = sales
      .filter(s => new Date(s.timestamp).toDateString() === date.toDateString())
      .reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    
    return { name: dayLabel, sales: daySales };
  });

  const lowStockItems = fertilizers.filter(f => f.stock < 20);
  const navigate = useNavigate();

  const handleEditBill = (bill) => {
    navigate('/billing', { state: { editingSale: bill } });
  };

  if (inventoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard | AgroGrow</title>
      </Helmet>

      <div>
        <h1 className="text-xl font-bold text-stone-900">Dashboard Overview</h1>
        <p className="text-xs text-stone-500">Welcome to your fertilizer management hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`Rs. ${totalRevenue.toLocaleString()}`} 
          change="+12.5%" 
          positive={true} 
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard 
          title="Active Stock" 
          value={`${totalStock.toLocaleString()} Bags`} 
          change="-2.4%" 
          positive={false} 
          icon={Package}
          color="amber"
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          change="+5.2%" 
          positive={true} 
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard 
          title="System Users" 
          value={userCount} 
          change={`${userCount > 0 ? '+1' : '0'} today`} 
          positive={true} 
          icon={UsersIcon}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 h-[450px] flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-stone-800">Sales Trend</h4>
            <p className="text-[10px] text-stone-400">Daily revenue performance (Last 7 Days)</p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#78716c' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#78716c' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col h-[450px]">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-stone-800">Inventory Alerts</h4>
            <p className="text-[10px] text-stone-400">Immediate actions required</p>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {lowStockItems.length > 0 ? (
              lowStockItems.map(item => (
                <div key={item.id} className="p-3 rounded-lg border border-amber-100 bg-amber-50 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-900 leading-tight">Low Stock: {item.name}</p>
                    <p className="text-[10px] text-amber-700 mt-1">Stock Level: {item.stock} bags remain.</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-stone-400">No inventory alerts found.</p>
              </div>
            )}
          </div>
          <button className="mt-4 w-full bg-stone-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors">
            Process All Alerts
          </button>
        </div>
      </div>

      {/* Recent Bills Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-sm font-bold text-stone-800">Recent Sales & Invoices</h4>
            <p className="text-[10px] text-stone-400">Latest 5 bills generated</p>
          </div>
          <button 
            onClick={() => navigate('/reports')}
            className="text-[10px] font-bold text-primary-600 hover:underline"
          >
            Manage All Bills
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="pb-3 text-[10px] font-black text-stone-400 uppercase">Bill No.</th>
                <th className="pb-3 text-[10px] font-black text-stone-400 uppercase">Customer</th>
                <th className="pb-3 text-[10px] font-black text-stone-400 uppercase text-right">Items</th>
                <th className="pb-3 text-[10px] font-black text-stone-400 uppercase text-right">Total</th>
                <th className="pb-3 text-[10px] font-black text-stone-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {sales.slice(0, 5).map((bill) => (
                <tr key={bill.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 text-xs font-bold text-stone-600">#{bill.billNumber}</td>
                  <td className="py-3 text-xs font-bold text-stone-800">{bill.customerInfo?.name || 'Cash Customer'}</td>
                  <td className="py-3 text-xs text-right text-stone-500">{bill.items?.length || 0} Products</td>
                  <td className="py-3 text-xs font-black text-emerald-700 text-right">Rs. {bill.total.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => handleEditBill(bill)}
                      className="p-1 px-2.5 bg-stone-100 hover:bg-primary-50 text-stone-600 hover:text-primary-600 rounded-lg text-[10px] font-bold transition-all"
                    >
                      Edit Items
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs text-stone-400 italic">No bills generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-sm font-bold text-stone-800">Recent System Activities</h4>
            <p className="text-[10px] text-stone-400">Latest administrative and user actions</p>
          </div>
          <button 
            onClick={() => window.location.href = '/audit-logs'}
            className="text-[10px] font-bold text-primary-600 hover:underline"
          >
            View All Logs
          </button>
        </div>

        <div className="space-y-3">
          {loadingLogs ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-stone-100 rounded-lg"></div>)}
            </div>
          ) : recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                    <History className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 leading-none mb-1">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-stone-500 line-clamp-1 italic">
                      {log.details}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-900 leading-none mb-1">
                    {log.user_name || 'System'}
                  </p>
                  <p className="text-[9px] text-stone-400">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-stone-400 italic">No recent activities found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
