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
    <div>
      <h2 className="text-2xl font-bold mb-4">Gate Remotes</h2>
      
      <form onSubmit={addRemote} className="mb-4">
        <input
          type="text"
          placeholder="Unit Number"
          value={newRemote.unit}
          onChange={e => setNewRemote({...newRemote, unit: e.target.value})}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Remote ID"
          value={newRemote.remoteId}
          onChange={e => setNewRemote({...newRemote, remoteId: e.target.value})}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Remote
        </button>
      </form>

      <table className="w-full">
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
                    className="border p-1"
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
                      className="text-green-500 hover:text-green-700">
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingRemote(null)}
                      className="text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <button 
                      onClick={() => startEdit(remote)}
                      className="text-blue-500 hover:text-blue-700">
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteRemote(remote.remoteId)}
                      className="text-red-500 hover:text-red-700">
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
  );
}

export default RemoteList;
