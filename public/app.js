async function api(path, opts){
  const res = await fetch(path, opts);
  if (!res.ok && res.status !== 204) throw new Error('API error');
  return res.status === 204 ? null : res.json();
}

async function load(){
  const items = await api('/api/items');
  const tbody = document.querySelector('#itemsTable tbody');
  tbody.innerHTML = '';
  for (const it of items){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.id}</td>
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.category)}</td>
      <td>${it.qty}</td>
      <td>${escapeHtml(it.location)}</td>
      <td>${escapeHtml(it.notes)}</td>
      <td>
        <button data-id="${it.id}" class="edit">Edit</button>
        <button data-id="${it.id}" class="del">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  }
}

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.getElementById('addForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const f = e.target;
  const data = { name:f.name.value, category:f.category.value, qty: Number(f.qty.value||0), location:f.location.value, notes:f.notes.value };
  await api('/api/items', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  f.reset();
  load();
});

document.querySelector('#itemsTable tbody').addEventListener('click', async (e)=>{
  const id = e.target.dataset.id && Number(e.target.dataset.id);
  if (!id) return;
  if (e.target.classList.contains('del')){
    if (!confirm('Delete item?')) return;
    await api('/api/items/'+id, { method:'DELETE' });
    load();
  } else if (e.target.classList.contains('edit')){
    const name = prompt('New name:');
    if (name === null) return;
    await api('/api/items/'+id, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name }) });
    load();
  }
});

load().catch(err=>console.error(err));

// Export CSV
document.getElementById('exportCsv').addEventListener('click', ()=>{
  window.location = '/api/items/export';
});

// Import file
document.getElementById('importBtn').addEventListener('click', async ()=>{
  const inp = document.getElementById('importFile');
  if (!inp.files || !inp.files[0]) return alert('Select a file to import');
  const fd = new FormData();
  fd.append('file', inp.files[0]);
  try {
    const res = await fetch('/api/items/import', { method:'POST', body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Import failed');
    alert('Imported ' + (j.added||0) + ' items');
    inp.value = '';
    load();
  } catch (err) {
    alert('Import error: ' + err.message);
  }
});
