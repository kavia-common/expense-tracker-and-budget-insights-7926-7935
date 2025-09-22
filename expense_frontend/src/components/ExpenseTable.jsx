import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export default function ExpenseTable({ expenses, categories, onCreate, onUpdate, onDelete }) {
  /** Displays expenses with controls to add/edit/delete. */
  const [draft, setDraft] = useState({ title: '', amount: '', category: categories[0] || 'Other', date: dateInputValue(new Date()), notes: '' });
  const [editRow, setEditRow] = useState(null);

  const rows = useMemo(() => expenses, [expenses]);

  const handleCreate = async () => {
    if (!draft.title || !draft.amount) return;
    await onCreate({ ...draft, amount: Number(draft.amount) });
    setDraft({ title: '', amount: '', category: categories[0] || 'Other', date: dateInputValue(new Date()), notes: '' });
  };

  const handleUpdate = async (id, patch) => {
    await onUpdate(id, patch);
    setEditRow(null);
  };

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th style={{ width: 200 }}>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th style={{ width: 140 }}>Date</th>
            <th>Notes</th>
            <th>Receipt</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input className="input" placeholder="e.g., Groceries" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></td>
            <td><input className="input" type="number" step="0.01" placeholder="0.00" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} /></td>
            <td>
              <select className="select" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </td>
            <td><input className="input" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></td>
            <td><input className="input" placeholder="Optional notes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></td>
            <td className="subtle">—</td>
            <td className="tr-actions">
              <button className="btn" onClick={handleCreate}>Add</button>
            </td>
          </tr>

          {rows.map((e) => (
            <tr key={e.id}>
              <td>
                {editRow === e.id ? (
                  <input className="input" defaultValue={e.title} onChange={(ev) => (e._title = ev.target.value)} />
                ) : (
                  e.title
                )}
              </td>
              <td>
                {editRow === e.id ? (
                  <input className="input" type="number" step="0.01" defaultValue={e.amount} onChange={(ev) => (e._amount = Number(ev.target.value))} />
                ) : (
                  currency(e.amount)
                )}
              </td>
              <td>
                {editRow === e.id ? (
                  <select className="select" defaultValue={e.category} onChange={(ev) => (e._category = ev.target.value)}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <span className="badge">{e.category}</span>
                )}
              </td>
              <td>
                {editRow === e.id ? (
                  <input className="input" type="date" defaultValue={dateInputValue(e.date)} onChange={(ev) => (e._date = ev.target.value)} />
                ) : (
                  new Date(e.date).toLocaleDateString()
                )}
              </td>
              <td>
                {editRow === e.id ? (
                  <input className="input" defaultValue={e.notes || ''} onChange={(ev) => (e._notes = ev.target.value)} />
                ) : (
                  e.notes || '—'
                )}
              </td>
              <td>
                {e.receipt_url ? (
                  <a href={e.receipt_url} target="_blank" rel="noreferrer" className="btn ghost">View</a>
                ) : (
                  <span className="subtle">None</span>
                )}
              </td>
              <td className="tr-actions">
                {editRow === e.id ? (
                  <>
                    <button
                      className="btn"
                      onClick={() =>
                        handleUpdate(e.id, {
                          title: e._title ?? e.title,
                          amount: e._amount ?? e.amount,
                          category: e._category ?? e.category,
                          date: e._date ? new Date(e._date).toISOString() : e.date,
                          notes: e._notes ?? e.notes,
                        })
                      }
                    >
                      Save
                    </button>
                    <button className="btn ghost" onClick={() => setEditRow(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn" onClick={() => setEditRow(e.id)}>Edit</button>
                    <button className="btn secondary" onClick={() => onDelete(e.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 24 }} className="subtle">
                No expenses found in the selected range.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function currency(n) {
  return n?.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function dateInputValue(d) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
