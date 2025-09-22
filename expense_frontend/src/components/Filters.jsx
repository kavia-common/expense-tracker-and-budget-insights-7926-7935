import React, { useState } from 'react';

// PUBLIC_INTERFACE
export default function Filters({ categories, dateRange, onCategoryChange, onDateRangeChange }) {
  /** Category select and date range picker. */
  const [local, setLocal] = useState({
    category: 'All',
    start: dateInputValue(dateRange.start),
    end: dateInputValue(dateRange.end),
  });

  function apply() {
    onCategoryChange(local.category);
    onDateRangeChange({
      start: new Date(local.start),
      end: new Date(local.end),
    });
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <select
        className="select"
        value={local.category}
        onChange={(e) => setLocal(prev => ({ ...prev, category: e.target.value }))}
        aria-label="Filter by category"
      >
        <option value="All">All Categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <input
        type="date"
        className="date-input"
        value={local.start}
        onChange={(e) => setLocal(prev => ({ ...prev, start: e.target.value }))}
        aria-label="Start date"
      />
      <input
        type="date"
        className="date-input"
        value={local.end}
        onChange={(e) => setLocal(prev => ({ ...prev, end: e.target.value }))}
        aria-label="End date"
      />
      <button className="btn" onClick={apply}>Apply</button>
    </div>
  );
}

function dateInputValue(d) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
