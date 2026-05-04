import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  User, 
  Phone, 
  Receipt, 
  AlertCircle, 
  Search, 
  ChevronRight,
  ShoppingCart,
  X,
  Shield,
  CheckCircle,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

const COMPANY_DETAILS = {
  name: 'Sri Basaveshwara Fertilizers',
  address: 'Main Road, Gopnal',
  email: 'drchandru.67@gmail.com',
  gstin: '29AKRPC0830F1ZB',
  state: 'Karnataka',
  stateCode: '29'
};

const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n2w = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + n2w(n % 100) : '');
    if (n < 100000) return n2w(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? n2w(n % 1000) : '');
    if (n < 10000000) return n2w(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? n2w(n % 100000) : '');
    return n2w(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? n2w(n % 10000000) : '');
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let str = n2w(integerPart) + 'Rupees ';
  if (decimalPart > 0) {
    str += 'and ' + n2w(decimalPart) + ' Paise ';
  }
  return str + 'Only';
};

const DEFAULT_HSN = '31010099'; // Default for organic fertilizers/generic

const Billing = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { fertilizers, sales, recordSale, updateSale } = useInventory();
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', aadhar: '', state: 'Karnataka', stateCode: '29' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showBill, setShowBill] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  const [isCommitSuccess, setIsCommitSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const summaryRef = useRef(null);

  const getNextBillNumber = () => {
    if (!sales || sales.length === 0) return '1';
    
    const numericBillNumbers = sales
      .map(s => parseInt(s.billNumber))
      .filter(n => !isNaN(n));
    
    if (numericBillNumbers.length === 0) return '1';
    
    const maxBillNum = Math.max(...numericBillNumbers);
    return (maxBillNum + 1).toString();
  };

  useEffect(() => {
    if (location.state?.editingSale) {
      const sale = location.state.editingSale;
      setIsEditing(true);
      setEditingId(sale.id);
      setBillNumber(sale.billNumber);
      setCustomerInfo(sale.customerInfo || { name: '', phone: '', aadhar: '', state: 'Karnataka', stateCode: '29' });
      setPaymentMethod(sale.paymentMethod || 'Cash');
      setCart(sale.items || []);
    } else if (sales.length > 0) {
      setBillNumber(getNextBillNumber());
    } else {
      // Default to 1 if first ever bill
      setBillNumber('1');
    }
  }, [location.state, sales]);

  const recordTransaction = async () => {
    if (cart.length === 0) return;
    if (showBill && !isEditing) {
      alert('This bill has already been generated. Please click "New Bill" or "Clear All" to start a new transaction.');
      return;
    }
    
    try {
      setIsCommitSuccess(true);
      const billData = {
        billNumber,
        customerInfo,
        items: cart,
        subtotal,
        cgst,
        sgst,
        total,
        paymentMethod,
        billedBy: isEditing ? (location.state?.editingSale?.billedBy || user?.name) : user?.name,
        billedByEmail: isEditing ? (location.state?.editingSale?.billedByEmail || user?.email) : user?.email
      };

      if (isEditing) {
        await updateSale(editingId, billData);
      } else {
        const result = await recordSale(billData);
        if (result && result.id) {
          setEditingId(result.id);
          setIsEditing(true);
        }
      }
      
      setShowBill(true);
    } catch (error) {
      console.error('Failed to record transaction:', error);
      alert('Error recording transaction. Please check your connection.');
    } finally {
      setIsCommitSuccess(false);
    }
  };

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const existingItemIndex = cart.findIndex(item => item.id === selectedProduct.id);
    
    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { ...selectedProduct, quantity }]);
    }
    
    setSelectedProduct(null);
    setQuantity(1);
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id, newQuantity) => {
    const qty = parseInt(newQuantity);
    if (isNaN(qty) || qty < 1) return;
    setCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const calculateSubtotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const getTaxSummary = () => {
    const summary = {};
    cart.forEach(item => {
      const hsn = item.hsn_code || DEFAULT_HSN;
      const taxableValue = item.price * item.quantity;
      const gstRate = parseFloat(item.gst_rate) || 5.0;
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      const cgstAmount = (taxableValue * cgstRate) / 100;
      const sgstAmount = (taxableValue * sgstRate) / 100;

      if (!summary[hsn]) {
        summary[hsn] = {
          hsn: hsn,
          taxableValue: 0,
          cgstRate,
          sgstRate,
          cgstAmount: 0,
          sgstAmount: 0,
          totalTax: 0
        };
      }
      summary[hsn].taxableValue += taxableValue;
      summary[hsn].cgstAmount += cgstAmount;
      summary[hsn].sgstAmount += sgstAmount;
      summary[hsn].totalTax += (cgstAmount + sgstAmount);
    });
    return Object.values(summary);
  };

  const subtotal = calculateSubtotal();
  const taxSummary = getTaxSummary();
  const cgst = taxSummary.reduce((acc, curr) => acc + curr.cgstAmount, 0);
  const sgst = taxSummary.reduce((acc, curr) => acc + curr.sgstAmount, 0);
  const total = subtotal + cgst + sgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 print-container">
      <Helmet>
        <title>New Bill | AgroGrow</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            {isEditing ? 'Edit Existing Bill' : 'Generate New Bill'}
          </h1>
          <p className="text-xs text-stone-500">
            {isEditing ? `Modifying items for Bill #${billNumber}` : 'Create itemized invoices for customers.'}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button 
              onClick={() => navigate('/reports')}
              className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
            >
              Cancel Edit
            </button>
          )}
          <button 
            onClick={() => {
              if (isEditing) {
                navigate('/billing', { state: null, replace: true });
                setIsEditing(false);
                setEditingId(null);
              }
              setCart([]); 
              setCustomerInfo({name: '', phone: '', aadhar: '', state: 'Karnataka', stateCode: '29'});
              setPaymentMethod('Cash');
              setBillNumber(getNextBillNumber());
            }}
            className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
          >
            {isEditing ? 'New Bill' : 'Clear All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="card">
            <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" 
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="tel" 
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Aadhar Number (Optional)</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" 
                    value={customerInfo.aadhar}
                    onChange={(e) => setCustomerInfo({...customerInfo, aadhar: e.target.value})}
                    placeholder="12-digit Aadhar"
                    maxLength={12}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Payment Method</label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm appearance-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="card">
            <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-600" />
              Add Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Select Product</label>
                <select 
                  value={selectedProduct?.id || ''}
                  onChange={(e) => setSelectedProduct(fertilizers.find(p => p.id === e.target.value))}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="">Choose a product...</option>
                  {fertilizers.map(product => (
                    <option key={product.id} value={product.id} disabled={product.stock <= 0}>
                      {product.name} (Stock: {product.stock} {product.unit || 'Bags'}) - Rs. {product.price}/{product.unit || 'bag'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
                />
              </div>
              <button 
                onClick={addToCart}
                disabled={!selectedProduct}
                className="bg-primary-600 text-white font-bold py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-white" />
                Add Item
              </button>
            </div>
          </div>

          {/* Cart Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 px-1">
              <ShoppingCart className="w-4 h-4 text-primary-600" />
              Items in Cart ({cart.length})
            </h3>
            
            {/* Desktop Table View */}
            <div className="card hidden md:block overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-black text-stone-500 uppercase">Product Details</th>
                      <th className="px-6 py-3 text-[10px] font-black text-stone-500 uppercase text-center">Qty</th>
                      <th className="px-6 py-3 text-[10px] font-black text-stone-500 uppercase text-right">Rate</th>
                      <th className="px-6 py-3 text-[10px] font-black text-stone-500 uppercase text-right">Total</th>
                      <th className="px-6 py-3 text-[10px] font-black text-stone-500 uppercase text-right w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-stone-400 text-xs italic">
                          No items added to the bill yet.
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-stone-800">{item.name}</p>
                            <p className="text-[10px] text-stone-500">Size: {item.packaging || item.bagSize || 'Standard'}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <input 
                                type="number" 
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                                className="w-16 px-2 py-1 text-center text-xs font-bold bg-stone-100 border border-stone-200 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-stone-600">
                            Rs. {item.price?.toFixed(2) || item.pricePerBag?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-bold text-stone-900">Rs. {((item.price || item.pricePerBag) * item.quantity).toFixed(2)}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-stone-300 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-3">
              {cart.length === 0 ? (
                <div className="card text-center py-10 text-stone-400 text-xs italic">
                  No items added yet.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="card p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-stone-900">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">{item.packaging || item.bagSize || 'Standard'}</span>
                        <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                            className="w-10 px-1 py-0.5 text-center text-xs font-bold text-primary-600 bg-primary-50 border border-primary-100 rounded-md"
                          />
                          <span className="text-[10px] font-bold text-primary-600">{item.unit || 'Bags'}</span>
                        </div>
                      </div>
                      <p className="text-xs font-black text-stone-900 mt-2">Rs. {((item.price || item.pricePerBag) * item.quantity).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-3 bg-rose-50 text-rose-500 rounded-xl active:scale-95 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="card !bg-stone-900 text-white border-none shadow-2xl lg:sticky lg:top-24 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/20 transition-all duration-700" />
            
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-primary-400" />
              </div>
              Order Summary
            </h3>
            
            <div className="space-y-4 mb-8 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-stone-400">Total Items</span>
                <span className="text-sm font-bold">{cart.reduce((a, b) => a + b.quantity, 0)} Units</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>Subtotal</span>
                <span className="text-stone-200">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>Total Tax (GST 18%)</span>
                <span className="text-stone-200">+Rs. {(cgst + sgst).toFixed(2)}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1">Grand Total</p>
                  <span className="text-sm font-medium text-stone-400">Incl. all taxes</span>
                </div>
                <span className="text-2xl font-black text-white">Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={recordTransaction}
              disabled={cart.length === 0 || !customerInfo.name || isCommitSuccess || (showBill && !isEditing)}
              className="w-full bg-primary-500 hover:bg-primary-400 text-white font-black py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 disabled:pointer-events-none relative z-10"
            >
              {isCommitSuccess ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5" />
                  {isEditing ? 'Update & Save Bill' : 'Generate Invoice'}
                </>
              )}
            </button>
            
            {!customerInfo.name && cart.length > 0 && (
              <div className="mt-4 p-3 bg-primary-500/10 rounded-xl border border-primary-500/20 flex items-center gap-2 relative z-10">
                <AlertCircle className="w-3.5 h-3.5 text-primary-400" />
                <p className="text-[9px] text-primary-200 font-medium leading-tight">Enter customer name above to continue</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed">
              Verify all items and customer details before generating the final bill. Generated bills are recorded in the audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-1 left-0 right-0 bg-white border-t border-stone-100 p-4 shadow-[0_-15px_30px_rgba(0,0,0,0.08)] z-40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Total Payable</p>
            <p className="text-2xl font-black text-stone-900 tracking-tight">Rs. {total.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              {cart.reduce((a, b) => a + b.quantity, 0)} Qty
            </span>
          </div>
        </div>
        <button 
          onClick={recordTransaction}
          disabled={cart.length === 0 || !customerInfo.name || isCommitSuccess}
          className="w-full bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-600/20 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
        >
          {isCommitSuccess ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Receipt className="w-5 h-5" />
          )}
          {isCommitSuccess ? 'Generating...' : (isEditing ? 'Update Bill' : 'Generate Bill')}
        </button>
      </div>

      {/* Bill Preview Modal */}
      <AnimatePresence>
        {showBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBill(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              id="preview-modal-root"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-60"
            >
              {/* Header Controls */}
              <div className="sticky top-0 bg-white border-b border-stone-100 p-4 flex items-center justify-between z-10 print:hidden">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary-600" />
                  <span className="font-bold text-stone-800">Bill Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowBill(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-xs font-bold hover:bg-primary-100 transition-all border border-primary-200"
                  >
                    <Edit className="w-4 h-4" />
                    Modify Bill
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print Bill
                  </button>
                  <button 
                    onClick={() => {
                      if (isEditing) {
                        navigate('/reports');
                      } else {
                        setCart([]);
                        setCustomerInfo({name: '', phone: '', aadhar: '', state: 'Karnataka', stateCode: '29'});
                        setPaymentMethod('Cash');
                        setBillNumber(getNextBillNumber());
                        setShowBill(false);
                      }
                    }}
                    className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* The Bill Itself */}
              <div id="printable-bill" className="p-8 md:p-12 text-stone-900 font-sans print:p-0">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-widest border-b-2 border-stone-800 inline-block px-8 pb-1">Tax Invoice</h2>
                </div>

                {/* Header Information */}
                <div className="grid grid-cols-2 border border-stone-800 text-[11px]">
                  <div className="p-3 border-r border-stone-800 space-y-1">
                    <h3 className="text-sm font-black uppercase">{COMPANY_DETAILS.name}</h3>
                    <p className="font-bold">{COMPANY_DETAILS.address}</p>
                    <p><span className="font-bold">GSTIN/UIN:</span> {COMPANY_DETAILS.gstin}</p>
                    <p><span className="font-bold">State Name:</span> {COMPANY_DETAILS.state}, <span className="font-bold">Code:</span> {COMPANY_DETAILS.stateCode}</p>
                    <p><span className="font-bold">E-Mail:</span> {COMPANY_DETAILS.email}</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-2 border-b border-stone-800">
                      <div className="p-2 border-r border-stone-800">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Invoice No.</p>
                        <p className="font-bold">{billNumber}</p>
                      </div>
                      <div className="p-2">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Dated</p>
                        <p className="font-bold">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-stone-800">
                      <div className="p-2 border-r border-stone-800 h-10">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Delivery Note</p>
                      </div>
                      <div className="p-2 h-10">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Mode/Terms of Payment</p>
                        <p className="font-bold">
                          {paymentMethod === 'Cash' ? (
                            <>
                              Cash / Digital Payment
                              <br />
                              <span className="text-[10px] text-emerald-600 tracking-widest text-xs">PAID</span>
                            </>
                          ) : 'Credit'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="p-2 border-r border-stone-800 h-10">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Supplier's Ref.</p>
                      </div>
                      <div className="p-2 h-10">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Other Reference(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="grid grid-cols-2 border-x border-b border-stone-800 text-[11px]">
                  <div className="p-3 border-r border-stone-800">
                    <p className="text-[9px] font-bold text-stone-500 uppercase mb-1">Buyer</p>
                    <p className="text-sm font-black uppercase">{customerInfo.name || 'CASH CUSTOMER'}</p>
                    <p className="font-bold">Phone: {customerInfo.phone || 'N/A'}</p>
                    <p><span className="font-bold">State Name:</span> {customerInfo.state || COMPANY_DETAILS.state}, <span className="font-bold">Code:</span> {customerInfo.stateCode || COMPANY_DETAILS.stateCode}</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-2 border-b border-stone-800 h-10">
                      <div className="p-2 border-r border-stone-800">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Buyer's Order No.</p>
                      </div>
                      <div className="p-2">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Dated</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-stone-800 h-10">
                      <div className="p-2 border-r border-stone-800">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Despatch Document No.</p>
                      </div>
                      <div className="p-2">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Delivery Note Date</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 h-10">
                      <div className="p-2 border-r border-stone-800">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Despatched through</p>
                      </div>
                      <div className="p-2">
                        <p className="text-[9px] font-bold text-stone-500 uppercase">Destination</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-x border-stone-800">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-stone-800 font-bold uppercase">
                        <th className="p-2 border-r border-stone-800 w-8 text-center">Sl No.</th>
                        <th className="p-2 border-r border-stone-800 text-left">Description of Goods</th>
                        <th className="p-2 border-r border-stone-800 w-20 text-center">HSN/SAC</th>
                        <th className="p-2 border-r border-stone-800 w-20 text-center">Quantity</th>
                        <th className="p-2 border-r border-stone-800 w-20 text-right">Rate</th>
                        <th className="p-2 border-r border-stone-800 w-16 text-center">per</th>
                        <th className="p-2 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={item.id} className="min-h-[30px]">
                          <td className="px-2 py-1 border-r border-stone-800 text-center">{index + 1}</td>
                          <td className="px-2 py-1 border-r border-stone-800 font-black">
                            {item.name}
                            <div className="text-[9px] font-normal italic mt-0.5">Type: {item.type || 'General'}</div>
                          </td>
                          <td className="px-2 py-1 border-r border-stone-800 text-center font-bold">{item.hsn_code || DEFAULT_HSN}</td>
                          <td className="px-2 py-1 border-r border-stone-800 text-center font-bold">
                            {item.quantity} {item.unit || 'bag'}
                          </td>
                          <td className="px-2 py-1 border-r border-stone-800 text-right">{(item.price || item.pricePerBag).toFixed(2)}</td>
                          <td className="px-2 py-1 border-r border-stone-800 text-center">{item.unit || 'bag'}</td>
                          <td className="px-2 py-1 text-right font-bold text-sm">
                            {((item.price || item.pricePerBag) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Fill empty space logic could go here, but omitted for brevity */}
                      <tr className="border-t border-stone-800 font-bold">
                        <td colSpan="6" className="px-2 py-1 text-right border-r border-stone-800">Subtotal</td>
                        <td className="px-2 py-1 text-right">{subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="6" className="px-2 py-1 text-right border-r border-stone-800 font-bold">CGST</td>
                        <td className="px-2 py-1 text-right font-bold">{cgst.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan="6" className="px-2 py-1 text-right border-r border-stone-800 font-bold">SGST</td>
                        <td className="px-2 py-1 text-right font-bold">{sgst.toFixed(2)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-y border-stone-800 font-black bg-stone-50">
                        <td colSpan="3" className="px-2 py-2 text-right border-r border-stone-800">Total</td>
                        <td className="px-2 py-2 text-center border-r border-stone-800">
                          {cart.reduce((acc, curr) => acc + curr.quantity, 0)} Qty
                        </td>
                        <td colSpan="2" className="px-2 py-2 text-right border-r border-stone-800"></td>
                        <td className="px-2 py-2 text-right text-sm">₹ {total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Amount in Words */}
                <div className="border-x border-b border-stone-800 p-2 text-[11px]">
                  <p className="font-bold flex gap-2">
                    <span className="text-stone-500 italic">Amount Chargeable (in words):</span>
                    <span className="font-black uppercase tracking-tight">{numberToWords(total)}</span>
                  </p>
                </div>

                {/* GST Summary Table */}
                <div className="mt-4">
                  <table className="w-full text-[11px] border border-stone-800 border-collapse text-stone-950">
                    <thead>
                      <tr className="border-b border-stone-800 font-bold bg-stone-50">
                        <th rowSpan="2" className="p-1 border-r border-stone-800 text-left">HSN/SAC</th>
                        <th rowSpan="2" className="p-1 border-r border-stone-800 text-right">Taxable Value</th>
                        <th colSpan="2" className="p-1 border-r border-stone-800 text-center">Central Tax</th>
                        <th colSpan="2" className="p-1 border-r border-stone-800 text-center">State Tax</th>
                        <th rowSpan="2" className="p-1 text-right">Total Tax Amount</th>
                      </tr>
                      <tr className="border-b border-stone-800 bg-stone-50">
                        <th className="p-1 border-r border-stone-800 text-right">Rate</th>
                        <th className="p-1 border-r border-stone-800 text-right">Amount</th>
                        <th className="p-1 border-r border-stone-800 text-right">Rate</th>
                        <th className="p-1 border-r border-stone-800 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxSummary.map((sum) => (
                        <tr key={sum.hsn} className="border-b border-stone-800">
                          <td className="p-1 border-r border-stone-800 italic">{sum.hsn}</td>
                          <td className="p-1 border-r border-stone-800 text-right">{(sum.taxableValue || 0).toFixed(2)}</td>
                          <td className="p-1 border-r border-stone-800 text-right">{(sum.cgstRate || 0).toFixed(2)}%</td>
                          <td className="p-1 border-r border-stone-800 text-right">{(sum.cgstAmount || 0).toFixed(2)}</td>
                          <td className="p-1 border-r border-stone-800 text-right">{(sum.sgstRate || 0).toFixed(2)}%</td>
                          <td className="p-1 border-r border-stone-800 text-right">{(sum.sgstAmount || 0).toFixed(2)}</td>
                          <td className="p-1 text-right font-bold">{(sum.totalTax || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold border-t border-stone-800">
                        <td className="p-1 border-r border-stone-800 text-right">Total</td>
                        <td className="p-1 border-r border-stone-800 text-right">{subtotal.toFixed(2)}</td>
                        <td className="p-1 border-r border-stone-800 text-right"></td>
                        <td className="p-1 border-r border-stone-800 text-right">{cgst.toFixed(2)}</td>
                        <td className="p-1 border-r border-stone-800 text-right"></td>
                        <td className="p-1 border-r border-stone-800 text-right">{sgst.toFixed(2)}</td>
                        <td className="p-1 text-right font-bold">{(cgst + sgst).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <p className="text-[10px] font-bold mt-2 flex gap-2">
                    <span className="text-stone-500 italic">Tax Amount (in words):</span>
                    <span className="font-black uppercase tracking-tight text-stone-900">{numberToWords(cgst + sgst)}</span>
                  </p>
                </div>

                {/* Declarations and Footer */}
                <div className="grid grid-cols-2 mt-8 text-[10px]">
                  <div className="pr-4 border border-stone-800 p-2">
                    <p className="font-bold border-b border-stone-300 pb-1 mb-2">Declaration:</p>
                    <p className="italic leading-relaxed text-stone-500">
                      We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                    </p>
                  </div>
                  <div className="border border-stone-800 border-l-0">
                    <div className="text-right p-1 bg-stone-50 border-b border-stone-800">
                      <p className="font-bold uppercase">for {COMPANY_DETAILS.name}</p>
                    </div>
                    <div className="h-16"></div>
                    <div className="text-right p-1 border-t border-stone-800">
                      <p className="font-bold">Authorised Signatory</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6 text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                  <p>Subject to DAVANGERE jurisdiction</p>
                  <p className="mt-1">This is a Computer Generated Invoice</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }

          #printable-bill,
          #printable-bill * {
            visibility: visible;
          }

          #preview-modal-root {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100%;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .sticky,
          .print\\:hidden {
            display: none !important;
          }

          @page {
            margin: 1.5cm;
          }
        }
      `}} />
    </div>
  );
};

export default Billing;
