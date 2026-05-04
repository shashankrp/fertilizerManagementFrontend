import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

const Fertilizers = () => {
  const { isAdmin } = useAuth();
  const { fertilizers, addFertilizer, updateFertilizer, deleteFertilizer, loading } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFertilizer, setSelectedFertilizer] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', type: 'General', unit: 'KG', hsn_code: '', gst_rate: '5.0' });

  const filteredData = (fertilizers || []).filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (fertilizer) => {
    setSelectedFertilizer(fertilizer);
    setFormData({ 
      name: fertilizer.name || '', 
      description: fertilizer.description || '', 
      price: fertilizer.price || '', 
      stock: fertilizer.stock || '',
      type: fertilizer.type || 'General',
      unit: fertilizer.unit || 'KG',
      hsn_code: fertilizer.hsn_code || '',
      gst_rate: fertilizer.gst_rate || '5.0'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (fertilizer) => {
    setSelectedFertilizer(fertilizer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      gst_rate: parseFloat(formData.gst_rate)
    };

    if (selectedFertilizer) {
      await updateFertilizer({ ...data, id: selectedFertilizer.id });
    } else {
      await addFertilizer(data);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (selectedFertilizer) {
      await deleteFertilizer(selectedFertilizer.id);
      setIsDeleteModalOpen(false);
    }
  };

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
        <title>Fertilizers | Sri Basaveshwara</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Fertilizer Inventory</h1>
          <p className="text-xs text-stone-500">Manage your product catalog and listings.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setSelectedFertilizer(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Fertilizer
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="input-field pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table 
          headers={['Image', 'Name & Description', 'Price', 'Stock Level', 'Actions']}
          data={filteredData}
          renderRow={(item) => (
            <>
              <td className="px-4 py-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-stone-400" />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-stone-800">{item.name}</div>
                <div className="text-[10px] text-stone-400 truncate max-w-[200px]">{item.description}</div>
              </td>
              <td className="px-4 py-3 font-bold text-stone-700">Rs. {item.price.toFixed(2)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.stock < 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.stock} Bags
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <>
                      <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-stone-100 rounded-md text-stone-500 hover:text-primary-600 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-stone-100 rounded-md text-stone-500 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-stone-400">View Only</span>
                  )}
                </div>
              </td>
            </>
          )}
        />
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className="card p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-stone-400 mt-0.5 uppercase font-bold tracking-wider">Product #{item.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <button onClick={() => handleEdit(item)} className="p-2 bg-stone-50 text-stone-600 rounded-lg active:scale-95 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-2 bg-rose-50 text-rose-500 rounded-lg active:scale-95 transition-all ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5">Price</p>
                  <p className="text-sm font-black text-stone-900">Rs. {item.price.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5">Stock</p>
                  <span className={`text-sm font-black ${
                    item.stock < 50 ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {item.stock} Bags
                  </span>
                </div>
              </div>
              
              <p className="text-[11px] text-stone-500 line-clamp-2 italic px-1">
                "{item.description}"
              </p>
            </div>
          ))
        ) : (
          <div className="card py-10 text-center text-stone-400 text-xs italic">
            No fertilizers found matching your search.
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedFertilizer ? 'Edit Fertilizer' : 'Add New Fertilizer'}
        footer={
          <div className="flex gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-md">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary">{selectedFertilizer ? 'Update' : 'Create'}</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Product Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. NPK 10-26-26" 
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Type</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Nitrogenous" 
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Unit</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. KG or Bags" 
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">HSN Code</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. 3101" 
                value={formData.hsn_code || ''}
                onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">GST Rate (%)</label>
              <select 
                className="input-field" 
                value={formData.gst_rate || '5.0'}
                onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })}
              >
                <option value="0">0% (Nil)</option>
                <option value="5.0">5% (Fertilizers)</option>
                <option value="12.0">12%</option>
                <option value="18.0">18%</option>
                <option value="28.0">28%</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Description</label>
            <textarea 
              className="input-field h-24" 
              placeholder="Brief details about the usage..." 
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Price (Rs.)</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-field" 
                placeholder="0.00" 
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">Initial Stock</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0" 
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded-md">Cancel</button>
            <button onClick={confirmDelete} className="bg-rose-600 text-white px-4 py-1.5 rounded-md hover:bg-rose-700 transition-all font-bold text-xs shadow-sm">Delete Forever</button>
          </div>
        }
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-900">Are you absolutely sure?</p>
            <p className="text-xs text-stone-500 mt-1">This will permanently remove <span className="font-bold text-stone-800">{selectedFertilizer?.name}</span> from the database. This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Fertilizers;
