import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { History, Search, Filter, Shield, User, Clock } from 'lucide-react';
import Table from '../components/Table';
import api from '../services/api';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/audit-logs');
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'bg-rose-100 text-rose-700';
    if (action.includes('ADD') || action.includes('CREATE') || action.includes('RECORD')) return 'bg-emerald-100 text-emerald-700';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-700';
    return 'bg-stone-100 text-stone-700';
  };

  const filteredLogs = logs.filter(log => 
    (log.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Audit Logs | Sri Basaveshwara</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">System Audit Logs</h1>
          <p className="text-xs text-stone-500">Track all administrative and user activities for compliance.</p>
        </div>
      </div>

      <div className="card bg-stone-900 text-white border-none p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
          <Shield className="w-48 md:w-64 h-48 md:h-64" />
        </div>
        <div className="relative z-10">
          <h4 className="font-bold text-sm">Integrity Shield Active</h4>
          <p className="text-[10px] text-stone-400 mt-1 max-w-sm">All actions are recorded permanently with IP verification and timestamps. Logs cannot be modified or deleted.</p>
        </div>
        <div className="flex gap-4 md:gap-8 relative z-10 shrink-0">
          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-emerald-400">{logs.length}</p>
            <p className="text-[9px] md:text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Total Events</p>
          </div>
          <div className="w-px h-10 bg-stone-800"></div>
          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-blue-400">0</p>
            <p className="text-[9px] md:text-[10px] text-stone-500 uppercase font-bold tracking-tighter">Security Alerts</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by user or action..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-100 transition-all outline-none" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchLogs} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all active:scale-95">
          <History className="w-3.5 h-3.5" />
          Refresh Logs
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table 
          headers={['System User', 'Action Type', 'Log Details', 'Timestamp', 'Origin IP']}
          data={filteredLogs}
          renderRow={(item) => (
            <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-stone-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-800">{item.user_name}</span>
                    <span className="text-[10px] text-stone-400 lowercase">{item.user_email}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight uppercase ${getActionColor(item.action)}`}>
                  {(item.action || '').replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-600 font-medium text-xs">{item.details}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-[10px] text-stone-400">{item.ip_address}</td>
            </tr>
          )}
        />
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-4">
        {filteredLogs.map((item) => (
          <div key={item.id} className="card p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs border border-stone-200">
                  {item.user_name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{item.user_name}</h4>
                  <p className="text-[10px] text-stone-400 lowercase">{item.user_email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-tighter uppercase ${getActionColor(item.action)}`}>
                      {(item.action || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-stone-400">{item.ip_address}</p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5 font-sans">Activity Details</p>
              <p className="text-xs font-bold text-stone-700 leading-relaxed font-sans">{item.details}</p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 px-1 font-sans">
              <Clock className="w-3 h-3" />
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-sm text-stone-500">No activity logs found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
