import { useState, useEffect } from 'react';

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(setItems);
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setItems([...items, await res.json()]);
    setName('');
  };

  return (
    <div>
      <h1>Items</h1>
      <form onSubmit={addItem}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New item" />
        <button>Add</button>
      </form>
      <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
    </div>
  );
}
