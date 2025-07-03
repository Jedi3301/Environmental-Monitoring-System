import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import Papa from 'papaparse';

function EditableTable({ tableName, columns, canEdit }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [adding, setAdding] = useState(false);
  const [addRow, setAddRow] = useState({});
  const [csvError, setCsvError] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Wrap fetchData in useCallback for stable identity
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const orderColumn =
      tableName === 'air_quality' || tableName === 'water_quality'
        ? 'recorded_at'
        : 'forecast_time';
    const { data, error } = await supabase.from(tableName).select('*').order(orderColumn, { ascending: false });
    if (error) setError('Failed to fetch data.');
    setData(data || []);
    setLoading(false);
  }, [tableName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEdit = idx => {
    setEditIdx(idx);
    setEditRow({ ...data[idx] });
  };

  const cancelEdit = () => {
    setEditIdx(null);
    setEditRow({});
  };

  const saveEdit = async idx => {
    const row = editRow;
    const { id, ...updateFields } = row;
    const { error } = await supabase.from(tableName).update(updateFields).eq('id', id);
    if (error) {
      setError('Failed to update row.');
    } else {
      const newData = [...data];
      newData[idx] = row;
      setData(newData);
      setEditIdx(null);
      setEditRow({});
    }
  };

  const deleteRow = async id => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      setError('Failed to delete row.');
    } else {
      setData(data.filter(row => row.id !== id));
    }
  };

  const startAdd = () => {
    setAdding(true);
    setAddRow({});
  };

  const cancelAdd = () => {
    setAdding(false);
    setAddRow({});
  };

  const saveAdd = async () => {
    const { error, data: inserted } = await supabase.from(tableName).insert([addRow]).select();
    if (error) {
      setError('Failed to add row.');
    } else {
      setData([...data, ...(inserted || [])]);
      setAdding(false);
      setAddRow({});
    }
  };

  const handleCsvUpload = e => {
    setCsvError(null);
    setCsvSuccess(null);
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async results => {
        const csvRows = results.data;
        // Only keep fields that match columns
        const validRows = csvRows.map(row => {
          const filtered = {};
          columns.forEach(col => {
            if (row[col]) filtered[col] = row[col];
          });
          return filtered;
        });
        // Check if at least one row has all required columns
        const allFieldsPresent = validRows.every(row => columns.every(col => col in row));
        if (!allFieldsPresent) {
          setCsvError('CSV headers must match all required columns.');
          return;
        }
        // Insert into Supabase
        const { error } = await supabase.from(tableName).insert(validRows);
        if (error) {
          setCsvError('Failed to import CSV.');
        } else {
          setCsvSuccess('CSV imported successfully!');
          fetchData();
        }
      },
      error: err => setCsvError('Failed to parse CSV.'),
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', overflowX: 'auto' }}>
      {canEdit && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500 }}>
            Upload CSV: <input type="file" accept=".csv" onChange={handleCsvUpload} />
          </label>
          {csvError && <span style={{ color: 'red', marginLeft: 8 }}>{csvError}</span>}
          {csvSuccess && <span style={{ color: 'green', marginLeft: 8 }}>{csvSuccess}</span>}
        </div>
      )}
      <div style={{ border: '1.5px solid #b6c6e3', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(99,102,241,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem', background: 'rgba(255,255,255,0.97)' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={{ border: '1px solid #b6c6e3', padding: '4px 8px', textAlign: 'left', background: '#f1f5fa', fontWeight: 600 }}>{col}</th>
              ))}
              {canEdit && <th style={{ background: '#f1f5fa', border: '1px solid #b6c6e3' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {(showAll ? data : data.slice(0, 10)).map((row, idx) => (
              <tr key={row.id || idx} style={{ borderBottom: '1px solid #e0e7ff' }}>
                {columns.map(col => (
                  <td key={col} style={{ border: '1px solid #b6c6e3', padding: '3px 6px', fontSize: '0.92rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {editIdx === idx ? (
                      <input
                        value={editRow[col] || ''}
                        onChange={e => setEditRow({ ...editRow, [col]: e.target.value })}
                        style={{ width: '100%', padding: 2, fontSize: '0.92rem' }}
                      />
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
                {canEdit && (
                  <td style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>
                    {editIdx === idx ? (
                      <>
                        <button onClick={() => saveEdit(idx)} style={{ marginRight: 4, fontSize: '0.92rem', padding: '2px 8px' }}>Save</button>
                        <button onClick={cancelEdit} style={{ fontSize: '0.92rem', padding: '2px 8px' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(idx)} style={{ marginRight: 4, fontSize: '0.92rem', padding: '2px 8px' }}>Edit</button>
                        <button onClick={() => deleteRow(row.id)} style={{ color: 'red', fontSize: '0.92rem', padding: '2px 8px' }}>Delete</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {canEdit && adding && (
              <tr>
                {columns.map(col => (
                  <td key={col} style={{ border: '1px solid #b6c6e3', padding: '3px 6px' }}>
                    <input
                      value={addRow[col] || ''}
                      onChange={e => setAddRow({ ...addRow, [col]: e.target.value })}
                      style={{ width: '100%', padding: 2, fontSize: '0.92rem' }}
                    />
                  </td>
                ))}
                <td>
                  <button onClick={saveAdd} style={{ marginRight: 4, fontSize: '0.92rem', padding: '2px 8px' }}>Add</button>
                  <button onClick={cancelAdd} style={{ fontSize: '0.92rem', padding: '2px 8px' }}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <button onClick={() => setShowAll(!showAll)} style={{ marginTop: 8, fontSize: '0.92rem', padding: '4px 16px', borderRadius: 6, border: '1px solid #b6c6e3', background: '#f1f5fa', color: '#1976d2', fontWeight: 600 }}>
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
      {canEdit && !adding && (
        <button onClick={startAdd} style={{ marginTop: 12, fontSize: '0.92rem', padding: '4px 16px' }}>Add New Row</button>
      )}
    </div>
  );
}

export default EditableTable; 