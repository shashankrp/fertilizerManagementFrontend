import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [fertilizers, setFertilizers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fertsData = await api.get('/fertilizers');
      const salesDataRaw = await api.get('/sales');
      
      // Map sales data to frontend format
      const salesData = Array.isArray(salesDataRaw) ? salesDataRaw.map(sale => ({
        id: sale.id,
        billNumber: sale.bill_number,
        customerInfo: sale.customer_info,
        items: sale.items,
        subtotal: sale.subtotal,
        cgst: sale.cgst,
        sgst: sale.sgst,
        total: sale.total,
        billedBy: sale.billed_by,
        billedByEmail: sale.billed_by_email,
        timestamp: sale.created_at
      })) : [];

      setFertilizers(fertsData || []);
      setSales(salesData || []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Log a sale and update stock
  const recordSale = async (billData) => {
    try {
      // 1. Record Sale Details in Supabase
      // The server also handles stock decrement in its /api/sales POST handler
      const newSale = await api.post('/sales', {
        bill_number: billData.billNumber,
        customer_info: billData.customerInfo,
        items: billData.items,
        subtotal: billData.subtotal,
        cgst: billData.cgst,
        sgst: billData.sgst,
        total: billData.total,
        billed_by: billData.billedBy,
        billed_by_email: billData.billedByEmail
      });

      // 2. Refresh local state
      await fetchData();
      
      return newSale;
    } catch (error) {
      console.error('Error recording sale:', error);
      throw error;
    }
  };

  // Update an existing sale and correct stock
  const updateSale = async (id, billData) => {
    try {
      const updatedSale = await api.put(`/sales/${id}`, {
        bill_number: billData.billNumber,
        customer_info: billData.customerInfo,
        items: billData.items,
        subtotal: billData.subtotal,
        cgst: billData.cgst,
        sgst: billData.sgst,
        total: billData.total,
        billed_by: billData.billedBy,
        billed_by_email: billData.billedByEmail
      });
      await fetchData();
      return updatedSale;
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  };

  const addFertilizer = async (newItem) => {
    try {
      await api.post('/fertilizers', newItem);
      await fetchData();
    } catch (error) {
      console.error('Error adding fertilizer:', error);
    }
  };

  const updateFertilizer = async (updated) => {
    try {
      await api.put(`/fertilizers/${updated.id}`, updated);
      await fetchData();
    } catch (error) {
      console.error('Error updating fertilizer:', error);
    }
  };

  const deleteFertilizer = async (id) => {
    try {
      await api.delete(`/fertilizers/${id}`);
      await fetchData();
    } catch (error) {
      console.error('Error deleting fertilizer:', error);
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      fertilizers, 
      sales, 
      loading,
      recordSale, 
      updateSale,
      addFertilizer,
      updateFertilizer, 
      deleteFertilizer,
      refreshData: fetchData
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
