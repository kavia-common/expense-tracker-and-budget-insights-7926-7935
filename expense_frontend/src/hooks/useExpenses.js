/**
 * Hook to manage expenses CRUD, filtering, and receipt uploads via Supabase.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, endOfDay, formatISO, startOfDay, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Travel', 'Education', 'Other'];

// PUBLIC_INTERFACE
export function useExpenses(userId) {
  /** Provides expenses data, filters and CRUD operations. */
  const [allExpenses, setAllExpenses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = subDays(end, 30);
    return { start, end };
  });
  const [uploading, setUploading] = useState(false);

  const categories = useMemo(() => DEFAULT_CATEGORIES, []);

  const fetchExpenses = useCallback(async () => {
    const from = formatISO(startOfDay(dateRange.start));
    const to = formatISO(endOfDay(dateRange.end));

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false });

    if (categoryFilter && categoryFilter !== 'All') {
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query;
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading expenses:', error.message);
      return;
    }
    setAllExpenses(data || []);
  }, [userId, dateRange, categoryFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // CRUD
  // PUBLIC_INTERFACE
  async function addExpense(expense) {
    /** Create a new expense */
    const payload = {
      user_id: userId,
      title: expense.title || 'Untitled',
      amount: Number(expense.amount || 0),
      category: expense.category || 'Other',
      date: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
      notes: expense.notes || '',
      receipt_url: expense.receipt_url || null
    };

    const { data, error } = await supabase.from('expenses').insert(payload).select().single();
    if (error) throw error;
    setAllExpenses(prev => [data, ...prev]);
  }

  // PUBLIC_INTERFACE
  async function updateExpense(id, patch) {
    /** Update an existing expense by id */
    const { data, error } = await supabase.from('expenses').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setAllExpenses(prev => prev.map(e => (e.id === id ? data : e)));
  }

  // PUBLIC_INTERFACE
  async function deleteExpense(id) {
    /** Delete expense by id */
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    setAllExpenses(prev => prev.filter(e => e.id !== id));
  }

  // PUBLIC_INTERFACE
  async function uploadReceipt(file) {
    /** Upload a receipt file to Supabase Storage and return its public URL. */
    if (!file) throw new Error('No file provided');
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage.from('receipts').upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('receipts').getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  const expenses = allExpenses;

  // PUBLIC_INTERFACE
  function refresh() {
    /** Manually refresh expense list */
    fetchExpenses();
  }

  return {
    expenses,
    categories,
    dateRange,
    setCategoryFilter,
    setDateRange,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh,
    uploading,
    uploadReceipt,
  };
}
