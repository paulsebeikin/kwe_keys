import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useUnitSearch from '../hooks/useUnitSearch';

function RemoteList() {
  const [remotes, setRemotes] = useState([]);
  const [units, setUnits] = useState([]);
  const [newRemote, setNewRemote] = useState({ unitNumber: '', remoteId: '', entranceId: '', exitId: '' });
  const [editingRemote, setEditingRemote] = useState(null);
  const [editData, setEditData] = useState({ unitNumber: '', entranceId: '', exitId: '' });
  const { token } = useAuth();

  const { search, setSearch, filteredItems } = useUnitSearch(remotes, 'unitNumber');

  const fetchUnits = async () => {
    const response = await fetch('/api/units', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUnits(data);
  };

  const fetchRemotes = async () => {
    const response = await fetch('/api/remotes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setRemotes(data);
  };

  const addRemote = async (e) => {
    e.preventDefault();
    await fetch('/api/remotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...newRemote,
        unitNumber: parseInt(newRemote.unitNumber),
        entranceId: newRemote.entranceId ? parseInt(newRemote.entranceId) : null,
        exitId: newRemote.exitId ? parseInt(newRemote.exitId) : null
      })
    });
    setNewRemote({ unitNumber: '', remoteId: '', entranceId: '', exitId: '' });
    fetchRemotes();
  };

  const updateRemote = async (remoteId) => {
    await fetch(`/api/remotes/${remoteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        unitNumber: parseInt(editData.unitNumber),
        entranceId: editData.entranceId ? parseInt(editData.entranceId) : null,
        exitId: editData.exitId ? parseInt(editData.exitId) : null
      })
    });
    setEditingRemote(null);
    fetchRemotes();
  };

  const deleteRemote = async (remoteId) => {
    if (window.confirm('Are you sure you want to delete this remote?')) {
      await fetch(`/api/remotes/${remoteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchRemotes();
    }
  };

  const startEdit = (remote) => {
    setEditingRemote(remote.remoteId);
    setEditData({
      unitNumber: remote.unitNumber,
      entranceId: remote.entranceId || '',
      exitId: remote.exitId || ''
    });
  };

  useEffect(() => {
    fetchRemotes();
    fetchUnits();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Remotes</h2>
      
      <input
        type="text"
        placeholder="Search by Unit number"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />

      <form onSubmit={addRemote} className="flex gap-2">
        <select
          value={newRemote.unitNumber}
          onChange={e => setNewRemote({...newRemote, unitNumber: e.target.value})}
          className="select select-bordered w-full max-w-xs"
          required
        >
          <option value="">Select Unit</option>
          {units.map(unit => (
            <option key={unit.unitNumber} value={unit.unitNumber}>
              Unit {unit.unitNumber}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Remote ID"
          value={newRemote.remoteId}
          onChange={e => setNewRemote({...newRemote, remoteId: e.target.value})}
          className="input input-bordered w-full max-w-xs"
        />
        <input
          type="number"
          placeholder="Entrance ID"
          value={newRemote.entranceId}
          onChange={e => setNewRemote({...newRemote, entranceId: e.target.value})}
          className="input input-bordered w-full max-w-xs"
        />
        <input
          type="number"
          placeholder="Exit ID"
          value={newRemote.exitId}
          onChange={e => setNewRemote({...newRemote, exitId: e.target.value})}
          className="input input-bordered w-full max-w-xs"
        />
        <button type="submit" className="btn btn-primary">Add Remote</button>
      </form>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Unit Number</th>
              <th>Remote ID</th>
              <th>Entrance ID</th>
              <th>Exit ID</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(remote => (
              <tr key={remote.remoteId}>
                <td>
                  {editingRemote === remote.remoteId ? (
                    <select
                      value={editData.unitNumber}
                      onChange={(e) => setEditData({...editData, unitNumber: e.target.value})}
                      className="select select-bordered select-sm w-full max-w-xs"
                    >
                      {units.map(unit => (
                        <option key={unit.unitNumber} value={unit.unitNumber}>
                          {unit.unitNumber}
                        </option>
                      ))}
                    </select>
                  ) : (
                    `Unit ${remote.unitNumber}`
                  )}
                </td>
                <td>{remote.remoteId}</td>
                <td>
                  {editingRemote === remote.remoteId ? (
                    <input
                      type="number"
                      value={editData.entranceId}
                      onChange={(e) => setEditData({...editData, entranceId: e.target.value})}
                      className="input input-bordered input-sm"
                    />
                  ) : (
                    remote.entranceId
                  )}
                </td>
                <td>
                  {editingRemote === remote.remoteId ? (
                    <input
                      type="number"
                      value={editData.exitId}
                      onChange={(e) => setEditData({...editData, exitId: e.target.value})}
                      className="input input-bordered input-sm"
                    />
                  ) : (
                    remote.exitId
                  )}
                </td>
                <td>{new Date(remote.assignedAt).toLocaleDateString()}</td>
                <td>
                  {editingRemote === remote.remoteId ? (
                    <div className="space-x-2">
                      <button 
                        onClick={() => updateRemote(remote.remoteId)}
                        className="btn btn-sm btn-success btn-soft">
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingRemote(null)}
                        className="btn btn-sm btn-soft">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button 
                        onClick={() => startEdit(remote)}
                        className="btn btn-sm btn-info btn-soft">
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteRemote(remote.remoteId)}
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

export default RemoteList;
