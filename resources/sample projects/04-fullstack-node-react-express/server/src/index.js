const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let items = [{ id: 1, name: 'Learn Express' }];
let nextId = 2;

app.get('/api/items', (req, res) => res.json(items));
app.post('/api/items', (req, res) => {
  const item = { id: nextId++, name: req.body.name };
  items.push(item);
  res.status(201).json(item);
});
app.delete('/api/items/:id', (req, res) => {
  items = items.filter(i => i.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(4000, () => console.log('API on http://localhost:4000'));
