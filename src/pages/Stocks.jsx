import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ClipboardList, Plus, Search, Edit, ArrowRightLeft, User, Calendar } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

const Stocks = () => {
  const { user, isAdmin } = useAuth();
  const { sales, fertilizers, loading, recordSale } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fertilizerId: '',
    customerName: '',
    quantity: ''
  });

  const handleSubmit = async () => {
    if (!formData.fertilizerId || !formData.customerName || !formData.quantity) {
      alert('Please fill all fields');
      return;
    }

    const fertilizer = fertilizers.find(f => f.id === formData.fertilizerId);
    if (!fertilizer) return;

    if (parseInt(formData.quantity) > fertilizer.stock) {
      alert(`Insufficient stock. Available: ${fertilizer.stock} ${fertilizer.unit || 'Bags'}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const billData = {
        billNumber: `MOV-${Date.now().toString().slice(-6)}`,
        customerInfo: { name: formData.customerName },
        items: [
          {
            id: fertilizer.id,
            name: fertilizer.name,
            quantity: parseInt(formData.quantity),
            unit: fertilizer.unit || 'Bags',
            price: fertilizer.price || 0
          }
        ],
        subtotal: (fertilizer.price || 0) * parseInt(formData.quantity),
        cgst: 0,
        sgst: 0,
        total: (fertilizer.price || 0) * parseInt(formData.quantity),
        billedBy: user?.name || user?.email,
        billedByEmail: user?.email
      };

      await recordSale(billData);
      setIsModalOpen(false);
      setFormData({ fertilizerId: '', customerName: '', quantity: '' });
      alert('Movement recorded successfully!');
    } catch (error) {
      console.error('Failed to record movement:', error);
      alert('Failed to record movement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flatten sales to show movements per item
  const movements = (sales || []).flatMap(sale => 
    (sale.items || []).map(item => {
      const fert = fertilizers.find(f => f.id === item.id || f.name === item.name);
      return {
        id: `${sale.id}-${item.id || Math.random()}`,
        billNumber: sale.billNumber,
        fertilizer: item.name,
        quantity: item.quantity,
        unit: fert?.unit || item.unit || 'Bags',
        customer: sale.customerInfo?.name || 'Unknown',
        date: new Date(sale.timestamp).toLocaleString(),
        billedBy: sale.billedBy,
        totalAmount: (item.price || item.pricePerBag || 0) * (item.quantity || 0)
      };
    })
  );

  const filteredData = movements.filter(m => 
    m.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.fertilizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.billedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalBags = filteredData.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalValue = filteredData.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Stocks | AgroGrow</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Stock Movements</h1>
          <p className="text-xs text-stone-500">Track and manage fertilizer distributions.</p>
        </div>
        <button 
          onClick={() => { 
            setSelectedStock(null); 
            setFormData({ fertilizerId: '', customerName: '', quantity: '' });
            setIsModalOpen(true); 
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Movement
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by customer, fertilizer or user..." 
            className="input-field pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none p-3 bg-primary-900 border border-primary-800 rounded-2xl shadow-sm min-w-[140px]">
            <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1">Total Items Moved</p>
            <p className="text-lg font-black text-white">{totalBags} <span className="text-[10px] font-medium opacity-60">Qty</span></p>
          </div>
          <div className="flex-1 sm:flex-none p-3 bg-white border border-stone-200 rounded-2xl shadow-sm min-w-[140px]">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Gross Value</p>
            <p className="text-lg font-black text-primary-900">Rs. {totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table 
          headers={['Date', 'Fertilizer Type', 'Quantity', 'Customer', 'Billed By']}
          data={filteredData}
          renderRow={(item) => (
            <>
              <td className="px-4 py-3 font-medium text-stone-500">{item.date}</td>
              <td className="px-4 py-3 font-bold text-stone-800">{item.fertilizer}</td>
              <td className="px-4 py-3 font-bold text-stone-900">{item.quantity} {item.unit}</td>
              <td className="px-4 py-3">
                <div className="text-stone-600 font-medium">{item.customer}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-[10px] font-bold text-primary-600">
                     {item.billedBy?.split(' ').map(n => n[0]).join('') || '?'}
                   </div>
                   <span className="text-xs font-bold text-stone-500">{item.billedBy}</span>
                </div>
              </td>
            </>
          )}
        />
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className="card p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5">{item.date}</p>
                  <h3 className="font-bold text-stone-900 leading-tight">{item.fertilizer}</h3>
                </div>
                <button onClick={() => handleEdit(item)} className="p-2 bg-stone-50 text-stone-600 rounded-lg active:scale-95 transition-all">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-stone-50">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                  <ClipboardList className="w-3.5 h-3.5 text-primary-500" />
                  {item.quantity} {item.unit} Distributed
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-500 text-[10px] font-bold border border-stone-200">
                     {item.billedBy?.split(' ').map(n => n[0]).join('') || '?'}
                   </div>
                   <div>
                     <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Billed By</p>
                     <p className="text-xs font-bold text-stone-800">{item.billedBy}</p>
                   </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card py-10 text-center text-stone-400 text-xs italic">
            No stock movements record matches your search.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedStock ? 'Update Movement Record' : 'Record New Movement'}
        footer={
          <div className="flex gap-2">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Recording...' : (selectedStock ? 'Save Changes' : 'Confirm Entry')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-stone-50 border border-stone-100 rounded-lg flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-stone-600 leading-tight">
              Recording this movement will automatically adjust the inventory stock level of the selected fertilizer.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Fertilizer Type</label>
            <select 
              className="input-field" 
              value={formData.fertilizerId}
              onChange={(e) => setFormData({ ...formData, fertilizerId: e.target.value })}
            >
              <option value="">Select a fertilizer...</option>
              {fertilizers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.stock} {f.unit || 'bags'} available)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Customer Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Full name of customer" 
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Quantity</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="0" 
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stocks;
