const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/items', (req, res) => {
  res.json(db.getItems());
});

app.post('/api/items', (req, res) => {
  const item = db.addItem(req.body);
  res.status(201).json(item);
});

app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updated = db.updateItem(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ok = db.deleteItem(id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
