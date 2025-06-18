import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function RemoteList() {
  const [remotes, setRemotes] = useState([]);
  const [newRemote, setNewRemote] = useState({ unit: '', remoteId: '', entranceId: '', exitId: '' });
  const [editingRemote, setEditingRemote] = useState(null);
  const [editData, setEditData] = useState({ unit: '', entranceId: '', exitId: '' });
  const { token } = useAuth();

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
        entranceId: newRemote.entranceId ? parseInt(newRemote.entranceId) : null,
        exitId: newRemote.exitId ? parseInt(newRemote.exitId) : null
      })
    });
    setNewRemote({ unit: '', remoteId: '', entranceId: '', exitId: '' });
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
        unit: editData.unit,
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
      unit: remote.unit,
      entranceId: remote.entranceId || '',
      exitId: remote.exitId || ''
    });
  };

  useEffect(() => {
    fetchRemotes();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Remotes</h2>
      
      <form onSubmit={addRemote} className="flex gap-2">
        <input
          type="text"
          placeholder="Unit Number"
          value={newRemote.unit}
          onChange={e => setNewRemote({...newRemote, unit: e.target.value})}
          className="input input-bordered w-full max-w-xs"
        />
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
              <th>Unit</th>
              <th>Remote ID</th>
              <th>Entrance ID</th>
              <th>Exit ID</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {remotes.map(remote => (
              <tr key={remote.remoteId}>
                <td>
                  {editingRemote === remote.remoteId ? (
                    <input
                      type="text"
                      value={editData.unit}
                      onChange={(e) => setEditData({...editData, unit: e.target.value})}
                      className="input input-bordered input-sm"
                    />
                  ) : (
                    remote.unit
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
