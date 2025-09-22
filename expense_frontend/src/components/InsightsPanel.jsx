import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#3B82F6', '#F43F5E', '#22D3EE', '#84CC16', '#F97316'];

// PUBLIC_INTERFACE
export default function InsightsPanel({ expenses }) {
  /** Shows analytics charts: category distribution and daily trend. */
  const { byCategory, byDate } = useMemo(() => {
    const byCat = {};
    const byDt = {};
    for (const e of expenses) {
      const cat = e.category || 'Other';
      byCat[cat] = (byCat[cat] || 0) + (e.amount || 0);

      const d = new Date(e.date).toISOString().slice(0, 10);
      byDt[d] = (byDt[d] || 0) + (e.amount || 0);
    }
    return {
      byCategory: Object.entries(byCat).map(([name, value]) => ({ name, value })),
      byDate: Object.entries(byDt)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, amount]) => ({ date, amount })),
    };
  }, [expenses]);

  return (
    <div className="card" style={{ paddingBottom: 8 }}>
      <div className="card-header">
        <div className="card-title">Insights</div>
      </div>

      <div style={{ padding: 12 }}>
        <div className="subtle" style={{ margin: '8px 0 10px' }}>Category breakdown</div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {byCategory.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="subtle" style={{ margin: '12px 0 8px' }}>Daily spend trend</div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${v}`} width={48} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
