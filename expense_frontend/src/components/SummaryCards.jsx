import React from 'react';

// PUBLIC_INTERFACE
export default function SummaryCards({ totals }) {
  /** Shows quick summary metrics: total, average, count, top category. */
  const items = [
    { label: 'Total Spent', value: currency(totals.total), hint: 'Last 30 days', accent: 'primary' },
    { label: 'Average Expense', value: currency(totals.avg), hint: 'Per expense', accent: 'secondary' },
    { label: 'Expenses', value: totals.count, hint: 'Items', accent: 'primary' },
    { label: 'Top Category', value: totals.topCategory || '—', hint: currency(totals.topCategoryTotal || 0), accent: 'secondary' },
  ];

  return (
    <div className="row">
      {items.map((card, idx) => (
        <div className="col-3" key={idx}>
          <div className="card" style={{ padding: 16, backgroundImage: 'var(--card-gradient)' }}>
            <div className="subtle" style={{ marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.accent === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
              {card.value}
            </div>
            <div className="subtle" style={{ marginTop: 6 }}>{card.hint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function currency(n) {
  return n?.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}
