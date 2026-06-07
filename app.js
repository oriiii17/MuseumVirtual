const state = {
  query: '',
  bentuk: '',
  bahan: '',
  fungsi: '',
  cara: '',
  sort: 'az'
};

const cardsEl = document.getElementById('cards');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const resetFilter = document.getElementById('resetFilter');
const sortSelect = document.getElementById('sortSelect');
const filterBentuk = document.getElementById('filterBentuk');
const filterBahan = document.getElementById('filterBahan');
const filterFungsi = document.getElementById('filterFungsi');
const filterCara = document.getElementById('filterCara');
const dialog = document.getElementById('modelDialog');
const closeDialog = document.getElementById('closeDialog');
const viewer = document.getElementById('viewer');
const dialogTitle = document.getElementById('dialogTitle');
const dialogSubtitle = document.getElementById('dialogSubtitle');
const dialogMeta = document.getElementById('dialogMeta');
const openFirstModel = document.getElementById('openFirstModel');
const navToggle = document.getElementById('navToggle');
const siteHeader = document.querySelector('.site-header');
const siteNav = document.querySelector('.site-header nav');
const allFilterBtn = document.querySelector('[data-filter="all"]');

// Ikon garis (feather-style) untuk baris metadata kartu.
const ICONS = {
  bahan: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>',
  fungsi: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>'
};

// Favorit disimpan di localStorage agar bertahan saat halaman dimuat ulang.
const FAV_KEY = 'museum-favorites';
let favorites = new Set();
try { favorites = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch(e){ favorites = new Set(); }
function saveFavorites(){
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); } catch(e){}
}

// Warna pastel konsisten per kategori bentuk (hue diturunkan dari teksnya).
function categoryHue(str){
  let h = 0;
  for(const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function uniqueValues(key){
  return [...new Set(koleksi.map(item => item[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id'));
}

function fillSelect(selectEl, key){
  const label = selectEl.options[0].textContent;
  uniqueValues(key).forEach(value => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    selectEl.appendChild(opt);
  });
  selectEl.options[0].textContent = label;
}

function matches(item){
  const q = state.query.trim().toLowerCase();
  const text = [item.nama, item.bahan, item.bentuk, item.fungsi, item.cara, item.asal, item.lokasi, item.deskripsi].join(' ').toLowerCase();
  if(q && !text.includes(q)) return false;
  if(state.bentuk && item.bentuk !== state.bentuk) return false;
  if(state.bahan && item.bahan !== state.bahan) return false;
  if(state.fungsi && item.fungsi !== state.fungsi) return false;
  if(state.cara && item.cara !== state.cara) return false;
  return true;
}

function sortItems(items){
  const sorted = [...items];
  if(state.sort === 'za') sorted.sort((a,b)=>b.nama.localeCompare(a.nama,'id'));
  else if(state.sort === 'fungsi') sorted.sort((a,b)=>a.fungsi.localeCompare(b.fungsi,'id') || a.nama.localeCompare(b.nama,'id'));
  else sorted.sort((a,b)=>a.nama.localeCompare(b.nama,'id'));
  return sorted;
}

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function getPreviewImage(item){
  return item.gambarReferensi || item.gambar || '';
}

function renderCards(){
  const items = sortItems(koleksi.filter(matches));
  cardsEl.innerHTML = '';
  emptyState.hidden = items.length !== 0;

  for(const item of items){
    const previewImage = getPreviewImage(item);
    const isFav = favorites.has(item.id);
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-preview" aria-label="Pratinjau gambar ${escapeHtml(item.nama)}">
        <span class="badge" style="--cat:${categoryHue(item.bentuk)}">${escapeHtml(item.bentuk)}</span>
        <button class="heart${isFav ? ' active' : ''}" type="button" data-fav="${escapeHtml(item.id)}" aria-label="Tandai favorit" aria-pressed="${isFav}">${isFav ? '♥' : '♡'}</button>
        <img
          class="card-image"
          src="${escapeHtml(previewImage)}"
          alt="Gambar ${escapeHtml(item.nama)}"
          loading="lazy"
          decoding="async"
          onerror="this.hidden=true; this.nextElementSibling.hidden=false;"
        >
        <span class="image-fallback" hidden>Gambar belum tersedia</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(item.nama)}</h3>
        <div class="meta-row">
          <span>${ICONS.bahan} ${escapeHtml(item.bahan)}</span>
          <span>${ICONS.fungsi} ${escapeHtml(item.fungsi)}</span>
        </div>
        <p class="desc">${escapeHtml(item.deskripsi)}</p>
        <button class="detail-btn" type="button" data-id="${escapeHtml(item.id)}">Lihat Model 3D <span>›</span></button>
      </div>
    `;
    cardsEl.appendChild(card);
  }
}

function closeModel(){
  if(dialog.open) dialog.close();
  viewer.removeAttribute('src');
  viewer.removeAttribute('poster');
}

function openModel(id){
  const item = koleksi.find(o => o.id === id) || koleksi[0];
  if(!item) return;

  dialogTitle.textContent = item.nama;
  dialogSubtitle.textContent = `${item.fungsi} · ${item.digitalisasi}`;

  // Model .glb hanya dipasang saat user menekan tombol "Lihat Model 3D".
  // Tampilan awal kartu tetap memakai asset gambar dari assets/images.
  viewer.poster = getPreviewImage(item);
  viewer.src = item.model;
  viewer.alt = `Model 3D ${item.nama}`;

  dialogMeta.innerHTML = `
    <dt>Bahan Utama</dt><dd>${escapeHtml(item.bahan)}</dd>
    <dt>Bentuk</dt><dd>${escapeHtml(item.bentuk)}</dd>
    <dt>Fungsi</dt><dd>${escapeHtml(item.fungsi)}</dd>
    <dt>Cara Penggunaan</dt><dd>${escapeHtml(item.cara)}</dd>
    <dt>Asal Daerah</dt><dd>${escapeHtml(item.asal)}</dd>
    <dt>Lokasi Observasi</dt><dd>${escapeHtml(item.lokasi)}</dd>
    <dt>Potensi Digitalisasi</dt><dd>${escapeHtml(item.digitalisasi)}</dd>
    <dt>Keterangan</dt><dd>${escapeHtml(item.deskripsi)}</dd>
  `;

  if(typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open','');
}

function updateStats(){
  document.getElementById('totalKoleksi').textContent = koleksi.length;
  document.getElementById('totalModel').textContent = koleksi.filter(k => k.model).length;
  document.getElementById('totalBentuk').textContent = uniqueValues('bentuk').length;
}

function setupEvents(){
  searchInput.addEventListener('input', e => { state.query = e.target.value; renderCards(); });
  filterBentuk.addEventListener('change', e => { state.bentuk = e.target.value; renderCards(); });
  filterBahan.addEventListener('change', e => { state.bahan = e.target.value; renderCards(); });
  filterFungsi.addEventListener('change', e => { state.fungsi = e.target.value; renderCards(); });
  filterCara.addEventListener('change', e => { state.cara = e.target.value; renderCards(); });
  sortSelect.addEventListener('change', e => { state.sort = e.target.value; renderCards(); });
  resetFilter.addEventListener('click', () => {
    Object.assign(state, {query:'', bentuk:'', bahan:'', fungsi:'', cara:'', sort:'az'});
    searchInput.value = '';
    filterBentuk.value = '';
    filterBahan.value = '';
    filterFungsi.value = '';
    filterCara.value = '';
    sortSelect.value = 'az';
    renderCards();
  });
  cardsEl.addEventListener('click', e => {
    const favBtn = e.target.closest('[data-fav]');
    if(favBtn){
      const id = favBtn.dataset.fav;
      if(favorites.has(id)) favorites.delete(id); else favorites.add(id);
      saveFavorites();
      const on = favorites.has(id);
      favBtn.classList.toggle('active', on);
      favBtn.textContent = on ? '♥' : '♡';
      favBtn.setAttribute('aria-pressed', on);
      return;
    }
    const btn = e.target.closest('[data-id]');
    if(btn) openModel(btn.dataset.id);
  });

  if(allFilterBtn){
    allFilterBtn.addEventListener('click', () => {
      Object.assign(state, {bentuk:'', bahan:'', fungsi:'', cara:''});
      filterBentuk.value = '';
      filterBahan.value = '';
      filterFungsi.value = '';
      filterCara.value = '';
      renderCards();
    });
  }

  if(navToggle){
    navToggle.addEventListener('click', () => {
      const open = siteHeader.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open);
    });
  }
  if(siteNav){
    siteNav.addEventListener('click', e => {
      if(e.target.tagName === 'A') siteHeader.classList.remove('nav-open');
    });
  }

  closeDialog.addEventListener('click', closeModel);
  dialog.addEventListener('click', e => {
    const rect = dialog.getBoundingClientRect();
    const outside = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
    if(outside) closeModel();
  });
  openFirstModel.addEventListener('click', () => openModel(koleksi[0]?.id));
}

fillSelect(filterBentuk, 'bentuk');
fillSelect(filterBahan, 'bahan');
fillSelect(filterFungsi, 'fungsi');
fillSelect(filterCara, 'cara');
updateStats();
setupEvents();
renderCards();
