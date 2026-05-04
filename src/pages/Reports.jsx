import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  BarChart2,
  PieChart as PieChartIcon,
  Users as UsersIcon,
  CreditCard,
  Edit
} from 'lucide-react';
import Table from '../components/Table';
import api from '../services/api';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#065f46', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const Reports = () => {
  const { sales, fertilizers } = useInventory();
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get('/users');
        setUsers(data || []);
      } catch (error) {
        console.error('Failed to fetch users for report:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleEditSale = (sale) => {
    navigate('/billing', { state: { editingSale: sale } });
  };

  // Aggregate sales by fertilizer
  const salesByProduct = useMemo(() => {
    const agg = {};
    fertilizers.forEach(f => {
      agg[f.name] = { item: f.name, quantity: 0, revenue: 0, stock: f.stock };
    });

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (agg[item.name]) {
          agg[item.name].quantity += item.quantity;
          agg[item.name].revenue += (item.price || item.pricePerBag) * item.quantity;
        }
      });
    });

    return Object.values(agg).filter(a => a.quantity > 0 || a.stock > 0);
  }, [sales, fertilizers]);

  // Aggregate total sales per user
  const salesByUser = useMemo(() => {
    const agg = {};
    
    // Initialize with all known users from profiles
    users.forEach(u => {
      agg[u.name || u.email] = { user: u.name || u.email, totalQuantity: 0, totalRevenue: 0, billCount: 0 };
    });

    sales.forEach(sale => {
      const userName = sale.billedBy || 'Anonymous';
      if (!agg[userName]) {
        agg[userName] = { user: userName, totalQuantity: 0, totalRevenue: 0, billCount: 0 };
      }
      agg[userName].billCount += 1;
      agg[userName].totalRevenue += sale.total;
      sale.items.forEach(item => {
        agg[userName].totalQuantity += item.quantity;
      });
    });
    return Object.values(agg).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sales, users]);

  const pieData = useMemo(() => {
    return salesByProduct.map(s => ({ name: s.item, value: s.revenue }));
  }, [salesByProduct]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Fertilizer', 'Quantity Sold', 'Revenue (Rs.)', 'Remaining Stock'],
      ...salesByProduct.map(d => [d.item, d.quantity, d.revenue, d.stock])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agrogrow_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 report-container">
      <Helmet>
        <title>Business Reports | AgroGrow</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Analytics & Reports</h1>
          <p className="text-xs text-stone-500">Comprehensive breakdown of sales and inventory performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg text-xs font-bold hover:bg-stone-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button 
            onClick={handleExportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card flex flex-col h-[300px] md:h-[350px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">Revenue per Category</h4>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByProduct} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#78716c' }} />
                <YAxis dataKey="item" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#78716c' }} width={80} />
                <Tooltip cursor={{ fill: '#f5f5f4' }} />
                <Bar dataKey="revenue" fill="#047857" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card flex flex-col h-[300px] md:h-[350px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">Market Share Distribution</h4>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                    innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

        {/* User-wise Billing Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-bold text-stone-800">Billing Performance by User</h4>
          </div>
          <Table 
            headers={['System User', 'Bills Generated', 'Total Bags Sold', 'Revenue Contribution']}
            data={salesByUser}
            renderRow={(item) => (
              <>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-600">
                      {item.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-bold text-stone-800">{item.user}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-stone-600">{item.billCount} Invoices</td>
                <td className="px-4 py-3 font-bold text-stone-800">{item.totalQuantity} Bags</td>
                <td className="px-4 py-3 font-black text-emerald-700">Rs. {item.totalRevenue.toLocaleString()}</td>
              </>
            )}
          />
        </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-bold text-stone-800">Recent Transactions (Edit Bills)</h4>
          </div>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Click edit to modify items</p>
        </div>
        <Table 
          headers={['Bill No.', 'Customer', 'Payment', 'Date', 'Total Amount', 'Actions']}
          data={sales.slice(0, 10)}
          renderRow={(sale) => (
            <>
              <td className="px-4 py-3 font-bold text-stone-600">#{sale.billNumber}</td>
              <td className="px-4 py-3 font-bold text-stone-800">{sale.customerInfo?.name || 'Cash Customer'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  sale.paymentMethod === 'Credit' 
                    ? 'bg-rose-50 text-rose-600' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {sale.paymentMethod || 'Cash'}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-500">{new Date(sale.timestamp).toLocaleDateString()}</td>
              <td className="px-4 py-3 font-black text-emerald-700">Rs. {sale.total.toLocaleString()}</td>
              <td className="px-4 py-3">
                <button 
                  onClick={() => handleEditSale(sale)}
                  className="p-1.5 hover:bg-primary-50 text-stone-400 hover:text-primary-600 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                >
                  <Edit className="w-3 h-3" />
                  Edit Bill
                </button>
              </td>
            </>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <h4 className="text-sm font-bold text-stone-800">Detailed Sales Statistics</h4>
        </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table 
              headers={['Fertilizer Item', 'Quantity Sold (Bags)', 'Revenue Generated', 'Remaining Stock']}
              data={salesByProduct}
              renderRow={(item) => (
                <>
                  <td className="px-4 py-3 font-bold text-stone-800">{item.item}</td>
                  <td className="px-4 py-3 font-medium text-stone-600">{item.quantity}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">Rs. {item.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.stock < 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, item.stock / 5)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-stone-500">{item.stock}</span>
                    </div>
                  </td>
                </>
              )}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4">
            {salesByProduct.map((item, idx) => (
              <div key={idx} className="card p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-stone-900">{item.item}</h5>
                  <span className="text-xs font-black text-emerald-700">Rs. {item.revenue.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5">Sold (Bags)</p>
                    <p className="text-sm font-black text-stone-800">{item.quantity}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5">Stock Left</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${item.stock < 100 ? 'text-amber-600' : 'text-emerald-700'}`}>
                        {item.stock}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.stock < 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, item.stock / 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print, header, aside, .sidebar-nav { display: none !important; }
          .pl-64 { padding-left: 0 !important; }
          main { padding: 0 !important; }
          .card { border: 1px solid #e7e5e4 !important; box-shadow: none !important; }
          .report-container { background: white !important; }
        }
      `}} />
    </div>
  );
};

export default Reports;
