import React, { useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import Filters from './components/Filters';
import ExpenseTable from './components/ExpenseTable';
import InsightsPanel from './components/InsightsPanel';
import ReceiptModal from './components/ReceiptModal';
import AuthGate from './components/AuthGate';

// PUBLIC_INTERFACE
function App() {
  /**
   * Entry point for the Expense Tracker app.
   * Handles authentication and renders the dashboard once the user is logged in.
   */
  const { session, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div className="kicker">Loading</div>
          <h2 style={{ margin: '8px 0 0 0' }}>Preparing your dashboard…</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthGate />;
  }

  return <Dashboard userId={session.user.id} />;
}

function Dashboard({ userId }) {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [flash, setFlash] = useState(null); // brief confirmation/error banner
  const {
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
  } = useExpenses(userId);

  const totals = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const byCat = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
      return acc;
    }, {});
    const largest = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0] || ['', 0];
    return {
      total,
      count: expenses.length,
      avg: expenses.length ? total / expenses.length : 0,
      topCategory: largest[0],
      topCategoryTotal: largest[1],
    };
  }, [expenses]);

  // PUBLIC_INTERFACE
  async function quickAddTestExpense() {
    /**
     * Inserts a sample expense into Supabase for the current user.
     * Uses: category='Test', amount=50.00, description='Test expense', date=current date.
     * Displays a temporary confirmation or error message.
     */
    try {
      await addExpense({
        title: 'Test expense',
        amount: 50.0,
        category: 'Test',
        date: new Date().toISOString(),
        notes: 'Test expense',
      });
      setFlash({ type: 'success', text: 'Test expense added successfully.' });
    } catch (e) {
      setFlash({ type: 'error', text: e.message || 'Failed to add test expense.' });
    } finally {
      // Remove message after 3 seconds
      setTimeout(() => setFlash(null), 3000);
    }
  }

  return (
    <>
      <div className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-dot" />
            <span>Ocean Budget</span>
          </div>

          <div className="inline-filters" aria-label="Quick actions">
            <button className="btn ghost" onClick={refresh} title="Refresh data">Refresh</button>
            <button className="btn" onClick={() => setShowReceiptModal(true)}>Upload Receipt</button>
            <button className="btn secondary" onClick={quickAddTestExpense} title="Insert a test expense">
              Quick Add Test Expense
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <Header />

        {flash && (
          <div
            role="status"
            aria-live="polite"
            className="card"
            style={{
              padding: 12,
              margin: '12px 0',
              borderLeft: `6px solid ${flash.type === 'success' ? 'var(--color-secondary)' : 'var(--color-error)'}`,
              background: 'white',
            }}
          >
            <div className="kicker" style={{ color: flash.type === 'success' ? 'var(--color-secondary)' : 'var(--color-error)' }}>
              {flash.type === 'success' ? 'Success' : 'Error'}
            </div>
            <div style={{ marginTop: 4 }}>{flash.text}</div>
          </div>
        )}

        <div className="row" style={{ marginTop: 16 }}>
          <div className="col-12">
            <SummaryCards totals={totals} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 8 }}>
          <div className="col-8">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Expenses</div>
              </div>
              <div style={{ padding: 16, display: 'grid', gap: 12 }}>
                <Filters
                  categories={categories}
                  dateRange={dateRange}
                  onCategoryChange={setCategoryFilter}
                  onDateRangeChange={setDateRange}
                />
                <ExpenseTable
                  expenses={expenses}
                  categories={categories}
                  onCreate={addExpense}
                  onUpdate={updateExpense}
                  onDelete={deleteExpense}
                />
              </div>
            </div>
          </div>

          <div className="col-4">
            <InsightsPanel expenses={expenses} />
          </div>
        </div>
      </div>

      {showReceiptModal && (
        <ReceiptModal
          onClose={() => setShowReceiptModal(false)}
          onUpload={uploadReceipt}
          loading={uploading}
        />
      )}
    </>
  );
}

export default App;
