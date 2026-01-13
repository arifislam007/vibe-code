const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const xlsx = require('xlsx');
const { parse } = require('csv-parse/sync');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.get('/api/items', (req, res) => {
  res.json(db.getItems());
});

// Export items as CSV
app.get('/api/items/export', (req, res) => {
  const items = db.getItems();
  function esc(s){
    if (s === undefined || s === null) return '';
    const str = String(s);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }
  const header = ['id','name','category','qty','location','notes'];
  const rows = items.map(i => [i.id, esc(i.name), esc(i.category), i.qty, esc(i.location), esc(i.notes)].join(','));
  const csv = header.join(',') + '\n' + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="items.csv"');
  res.send(csv);
});

// Import items (CSV or Excel)
app.post('/api/items/import', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const orig = (file.originalname || '').toLowerCase();
  let rows = [];
  try {
    if (orig.endsWith('.xlsx') || orig.endsWith('.xls')) {
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    } else {
      const content = fs.readFileSync(file.path, 'utf8');
      rows = parse(content, { columns: true, skip_empty_lines: true });
    }

    let added = 0;
    for (const r of rows) {
      // map common headers to our fields
      const item = {
        name: r.name || r.Name || r.item || r.Item || '',
        category: r.category || r.Category || r.type || r.Type || '',
        qty: r.qty || r.Qty || r.quantity || r.Quantity || 0,
        location: r.location || r.Location || '',
        notes: r.notes || r.Notes || ''
      };
      if (item.name) {
        db.addItem(item);
        added++;
      }
    }
    // cleanup uploaded file
    try { fs.unlinkSync(file.path); } catch (e) {}
    res.json({ success: true, added });
  } catch (err) {
    try { fs.unlinkSync(file.path); } catch (e) {}
    res.status(500).json({ error: String(err) });
  }
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
