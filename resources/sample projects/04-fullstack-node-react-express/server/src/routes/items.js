const express = require('express');
const router = express.Router();

// In-memory data store
let items = [
  { id: 1, name: 'Learn Express', done: true },
  { id: 2, name: 'Build React frontend', done: false },
  { id: 3, name: 'Connect full-stack', done: false },
];
let nextId = 4;

// GET /api/items
router.get('/', (req, res) => {
  res.json(items);
});

// GET /api/items/:id
router.get('/:id', (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// POST /api/items
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newItem = { id: nextId++, name, done: false };
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT /api/items/:id
router.put('/:id', (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const { name, done } = req.body;
  if (name !== undefined) item.name = name;
  if (done !== undefined) item.done = done;
  res.json(item);
});

// DELETE /api/items/:id
router.delete('/:id', (req, res) => {
  const index = items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Item not found' });

  items.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
