/**
 * nonVisual.js — Non-visual traits tab
 */
const NonVisual = (() => {
  const selected = {};

  function build() {
    const container = document.getElementById('nv-categories');
    container.innerHTML = '';

    Object.entries(NON_VISUAL_DB).forEach(([catKey, catData]) => {
      const sec = document.createElement('div');
      sec.className = 'nv-cat-section';
      sec.innerHTML = `<div class="nv-cat-hdr">${catData.icon} ${catData.label}</div>`;

      catData.traits.forEach(trait => {
        sec.appendChild(_buildItem(trait));
      });

      container.appendChild(sec);
    });
  }

  function _buildItem(trait) {
    const item = document.createElement('div');
    item.className = 'nv-item' + (selected[trait.id] ? ' selected' : '');
    item.dataset.id = trait.id;

    const badges = (trait.badges || []).map(b =>
      `<span class="nv-badge ${b}">${b}</span>`
    ).join(' ');

    item.innerHTML = `
      <span class="nv-item-icon">${trait.icon}</span>
      <div class="nv-item-info">
        <div class="nv-item-name">${_esc(trait.name)}</div>
        <div class="nv-item-gene">${_esc(trait.gene)} · ${_esc(trait.snp.split(';')[0].split('+')[0].trim())}</div>
        <div class="nv-item-desc">${_esc(trait.mechanism.substring(0, 120))}…</div>
        <div style="margin-top:4px">${badges}</div>
      </div>
      <span class="nv-item-add">${selected[trait.id] ? '✓' : '+'}</span>
    `;

    item.addEventListener('click', () => _toggle(trait, item));
    return item;
  }

  function _toggle(trait, item) {
    if (selected[trait.id]) {
      delete selected[trait.id];
      item.classList.remove('selected');
      item.querySelector('.nv-item-add').textContent = '+';
    } else {
      selected[trait.id] = true;
      item.classList.add('selected');
      item.querySelector('.nv-item-add').textContent = '✓';
    }
    _updateNVDetail(trait);
    GeneOutput.render(App.getSelected());
    _updateCount();
  }

  function _updateNVDetail(trait) {
    // Could show detail in right panel — handled by GeneOutput
  }

  function search(query) {
    const cats = document.getElementById('nv-categories');
    const results = document.getElementById('nv-results');
    const q = query.trim().toLowerCase();

    if (!q) {
      cats.classList.remove('hidden');
      results.classList.add('hidden');
      results.innerHTML = '';
      return;
    }

    cats.classList.add('hidden');
    results.classList.remove('hidden');
    results.innerHTML = '';

    let found = 0;
    Object.entries(NON_VISUAL_DB).forEach(([catKey, catData]) => {
      catData.traits.forEach(trait => {
        const searchText = [trait.name, trait.gene, trait.snp, trait.mechanism,
          ...(trait.effects||[]), trait.heritage, trait.source].join(' ').toLowerCase();
        if (!searchText.includes(q)) return;
        found++;
        const item = _buildItem(trait);
        // Highlight match in name
        const nameEl = item.querySelector('.nv-item-name');
        nameEl.innerHTML = _highlight(trait.name, q);
        const geneEl = item.querySelector('.nv-item-gene');
        geneEl.innerHTML = _highlight(`${trait.gene} · ${trait.snp.split(';')[0].trim()}`, q);
        results.appendChild(item);
      });
    });

    if (!found) {
      results.innerHTML = `<div class="output-empty">No traits matching "<strong>${_esc(query)}</strong>"</div>`;
    }
  }

  function _highlight(text, q) {
    const esc = _esc(text);
    const escQ = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return esc.replace(new RegExp(`(${escQ})`, 'gi'), '<span class="nv-highlight">$1</span>');
  }

  function getSelected() { return selected; }

  function removeById(id) {
    delete selected[id];
    // Update UI
    document.querySelectorAll('.nv-item').forEach(item => {
      if (item.dataset.id === id) {
        item.classList.remove('selected');
        item.querySelector('.nv-item-add').textContent = '+';
      }
    });
    _updateCount();
    GeneOutput.render(App.getSelected());
  }

  function _updateCount() {
    const vCount = Object.keys(App.getSelected()).length;
    const nvCount = Object.keys(selected).length;
    const total = vCount + nvCount;
    const el = document.getElementById('trait-count');
    if (el) el.textContent = total;
    const bar = document.getElementById('mb-traits');
    if (bar) bar.textContent = total > 0 ? `${total} trait${total!==1?'s':''} active` : 'No traits selected';
  }

  function _esc(s) { if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  return { build, search, getSelected, removeById };
})();
