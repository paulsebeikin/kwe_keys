import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useUnitSearch from '../hooks/useUnitSearch';

function UnitList() {
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState({ unitNumber: '', owner: '' });
  const [editingUnit, setEditingUnit] = useState(null);
  const [editData, setEditData] = useState({ owner: '' });
  const { token } = useAuth();

  const { search, setSearch, filteredItems } = useUnitSearch(units);

  const fetchUnits = async () => {
    const response = await fetch('/api/units', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUnits(data);
  };

  const addUnit = async (e) => {
    e.preventDefault();
    await fetch('/api/units', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        unitNumber: newUnit.unitNumber,
        owner: newUnit.owner
      })
    });
    setNewUnit({ unitNumber: '', owner: '' });
    fetchUnits();
  };

  const updateUnit = async (unitNumber) => {
    await fetch(`/api/units/${unitNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ owner: editData.owner })
    });
    setEditingUnit(null);
    fetchUnits();
  };

  const deleteUnit = async (unitNumber) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      await fetch(`/api/units/${unitNumber}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUnits();
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Units</h2>
      
      <input
        type="text"
        placeholder="Search by Unit number"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />

      <form onSubmit={addUnit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="number"
          placeholder="Unit Number"
          value={newUnit.unitNumber}
          onChange={e => setNewUnit({...newUnit, unitNumber: e.target.value})}
          className="input input-bordered w-full max-w-xs"
        />
        <input
          type="text"
          placeholder="Owner"
          value={newUnit.owner}
          onChange={e => setNewUnit({...newUnit, owner: e.target.value})}
          className="input input-bordered w-full max-w-xs"
        />
        <button type="submit" className="btn btn-primary">Add Unit</button>
      </form>

      {/* Table container with fixed height and scroll */}
      <div className="overflow-x-auto flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-260px)]">
        <table className="table w-full min-w-[500px]">
          <thead>
            <tr>
              <th>Unit Number</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(unit => (
              <tr key={unit.unitNumber}>
                <td>{parseInt(unit.unitNumber)}</td>
                <td>
                  {editingUnit === unit.unitNumber ? (
                    <input
                      type="text"
                      value={editData.owner}
                      onChange={(e) => setEditData({...editData, owner: e.target.value})}
                      className="input input-bordered input-sm"
                    />
                  ) : (
                    unit.owner
                  )}
                </td>
                <td>
                  {editingUnit === unit.unitNumber ? (
                    <div className="space-x-2">
                      <button 
                        onClick={() => updateUnit(unit.unitNumber)}
                        className="btn btn-sm btn-success btn-soft">
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingUnit(null)}
                        className="btn btn-sm btn-soft">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button 
                        onClick={() => {
                          setEditingUnit(unit.unitNumber);
                          setEditData({ owner: unit.owner });
                        }}
                        className="btn btn-sm btn-info btn-soft">
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteUnit(unit.unitNumber)}
                        className="btn btn-sm btn-error btn-soft">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UnitList;
