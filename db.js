const fs = require('fs');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'db.json');

let data = { items: [], nextId: 1 };
try {
  // Ensure parent directory exists (useful when DB_PATH points to a mounted volume)
  fs.mkdirSync(require('path').dirname(dbPath), { recursive: true });
  if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8')) || data;
  } else {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.error('Failed to load DB:', err);
}

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getItems() {
  return data.items;
}

function addItem(item) {
  const newItem = {
    id: data.nextId++,
    name: item.name || '',
    category: item.category || '',
    qty: Number(item.qty) || 0,
    location: item.location || '',
    notes: item.notes || ''
  };
  data.items.push(newItem);
  save();
  return newItem;
}

function updateItem(id, patch) {
  const i = data.items.find(x => x.id === id);
  if (!i) return null;
  i.name = patch.name !== undefined ? patch.name : i.name;
  i.category = patch.category !== undefined ? patch.category : i.category;
  i.qty = patch.qty !== undefined ? Number(patch.qty) : i.qty;
  i.location = patch.location !== undefined ? patch.location : i.location;
  i.notes = patch.notes !== undefined ? patch.notes : i.notes;
  save();
  return i;
}

function deleteItem(id) {
  const idx = data.items.findIndex(x => x.id === id);
  if (idx === -1) return false;
  data.items.splice(idx, 1);
  save();
  return true;
}

module.exports = { getItems, addItem, updateItem, deleteItem };
