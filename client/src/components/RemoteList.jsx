import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function RemoteList() {
  const [remotes, setRemotes] = useState([]);
  const [newRemote, setNewRemote] = useState({ unit: '', remoteId: '' });
  const [editingRemote, setEditingRemote] = useState(null);
  const [editUnit, setEditUnit] = useState('');
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
      body: JSON.stringify(newRemote)
    });
    setNewRemote({ unit: '', remoteId: '' });
    fetchRemotes();
  };

  const updateRemote = async (remoteId) => {
    await fetch(`/api/remotes/${remoteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ unit: editUnit })
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
    setEditUnit(remote.unit);
  };

  useEffect(() => {
    fetchRemotes();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gate Remotes</h2>
      
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
        <button type="submit" className="btn btn-primary">
          Add Remote
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Remote ID</th>
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
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="input input-bordered input-sm"
                    />
                  ) : (
                    remote.unit
                  )}
                </td>
                <td>{remote.remoteId}</td>
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
