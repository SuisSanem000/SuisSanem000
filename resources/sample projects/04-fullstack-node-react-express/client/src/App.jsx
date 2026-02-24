import { useState, useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch items from Express API
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName }),
      });
      const newItem = await res.json();
      setItems([...items, newItem]);
      setNewItemName('');
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const toggleItem = async (id) => {
    const item = items.find((i) => i.id === id);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !item.done }),
      });
      const updated = await res.json();
      setItems(items.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="app">
      <h1>📋 Full-Stack Todo</h1>
      <p className="subtitle">Express API + React + Vite</p>

      <form onSubmit={addItem} className="add-form">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add a new item..."
        />
        <button type="submit">Add</button>
      </form>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className={item.done ? 'done' : ''}>
            <span onClick={() => toggleItem(item.id)}>
              {item.done ? '✅' : '⬜'} {item.name}
            </span>
            <button onClick={() => deleteItem(item.id)} className="delete-btn">
              ✕
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && <p className="empty">No items yet. Add one above!</p>}
    </div>
  );
}

export default App;
