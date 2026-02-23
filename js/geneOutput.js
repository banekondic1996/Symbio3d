/**
 * geneOutput.js — Right panel gene code cards
 */
const GeneOutput = (() => {
  function render(selected) {
    _renderVisualTraits(selected);
    _renderAllTraits(selected);
    _renderGenome(selected);
  }

  function _renderVisualTraits(selected) {
    const list = document.getElementById('gene-output-list');
    if (!Object.keys(selected).length) {
      list.innerHTML = '<div class="output-empty">Select visual traits to see gene codes</div>';
      return;
    }
    list.innerHTML = '';
    const allT = getAllTraits();
    Object.entries(selected).forEach(([tk,vk]) => {
      const t = allT[tk]; if (!t) return;
      const v = t.variants[vk]; if (!v) return;
      if (t.category === '_nonvisual') return; // handled separately
      list.appendChild(_buildCard(tk, t, vk, v));
    });
    if (!list.children.length) list.innerHTML = '<div class="output-empty">Select visual traits to see gene codes</div>';
  }

  function _buildCard(tk, t, vk, v) {
    const card = document.createElement('div');
    card.className = 'gene-card';
    const sw = v.color ? `<span class="gc-swatch" style="background:${v.color}"></span>` : '';
    card.innerHTML = `
      <div class="gc-head" onclick="this.parentElement.classList.toggle('collapsed')">
        <span class="gc-icon">${t.icon||'•'}</span>
        <span class="gc-name">${t.label}</span>
        <span class="gc-badge">${vk}</span>
        <span class="gc-chev">▾</span>
      </div>
      <div class="gc-body">
        <div class="gc-pheno">${sw}<span class="gc-pheno-name">${v.label}</span><span class="gc-freq">${v.frequency||''}</span></div>
        ${v.heritage?`<div class="gc-heritage">${v.heritage}</div>`:''}
        ${v.note?`<div style="font-size:8.5px;color:var(--txm);margin:3px 0 6px;line-height:1.5">${v.note}</div>`:''}
        ${_lociTable(v.genes)}
        <div class="snp-blk">
          <div class="snp-blk-lbl">SNP Genotype Code</div>
          <div class="snp-blk-val">${_esc(v.code)}</div>
          <button class="snp-copy" onclick="GeneOutput.copy('${_escA(v.code)}',this)">COPY</button>
        </div>
      </div>`;
    return card;
  }

  function _lociTable(genes) {
    if (!genes?.length) return '';
    return `<table class="loci-tbl">
      <thead><tr><th>Gene</th><th>SNP</th><th>Allele</th><th>Mechanism</th></tr></thead>
      <tbody>${genes.map(g=>`<tr>
        <td class="td-gene">${_esc(g.gene)}</td>
        <td class="td-snp">${_esc(g.snp)}</td>
        <td class="td-al">${_esc(g.allele)}</td>
        <td class="td-eff">${_esc(g.effect)}</td>
      </tr>`).join('')}</tbody>
    </table>`;
  }

  function _renderAllTraits(selected) {
    const list = document.getElementById('all-traits-list');
    const allT = getAllTraits();
    const nvSelected = App.getNVSelected ? App.getNVSelected() : {};
    const allSelected = { ...selected };

    // Add non-visual
    Object.keys(nvSelected).forEach(id => {
      allSelected['_nv_' + id] = id;
    });

    if (!Object.keys(allSelected).length) {
      list.innerHTML = '<div class="output-empty">No traits selected</div>';
      return;
    }
    list.innerHTML = '';

    // Visual traits
    Object.entries(selected).forEach(([tk, vk]) => {
      const t = allT[tk]; if (!t) return;
      const v = t.variants[vk]; if (!v) return;
      const item = document.createElement('div');
      item.className = 'at-item';
      item.innerHTML = `
        <span class="at-icon">${t.icon||'•'}</span>
        <div class="at-info">
          <div class="at-cat">${t.category}</div>
          <div class="at-name">${t.label}: ${v.label}</div>
          <div class="at-code">${_esc(v.code.substring(0,80))}${v.code.length>80?'…':''}</div>
        </div>
        <button class="at-rmv" onclick="App.removeTrait('${tk}')" title="Remove">×</button>`;
      list.appendChild(item);
    });

    // Non-visual traits
    Object.keys(nvSelected).forEach(id => {
      const cat = _findNVTrait(id);
      if (!cat) return;
      const item = document.createElement('div');
      item.className = 'at-item';
      item.innerHTML = `
        <span class="at-icon">${cat.icon}</span>
        <div class="at-info">
          <div class="at-cat">Non-visual</div>
          <div class="at-name">${cat.name}</div>
          <div class="at-code">${_esc(cat.gene)}</div>
        </div>
        <button class="at-rmv" onclick="App.removeNVTrait('${id}')" title="Remove">×</button>`;
      list.appendChild(item);
    });
  }

  function _findNVTrait(id) {
    for (const cat of Object.values(NON_VISUAL_DB)) {
      const t = cat.traits.find(t => t.id === id);
      if (t) return t;
    }
    return null;
  }

  function _renderGenome(selected) {
    const pre = document.getElementById('genome-pre');
    const allT = getAllTraits();
    const nvSelected = App.getNVSelected ? App.getNVSelected() : {};

    if (!Object.keys(selected).length && !Object.keys(nvSelected).length) {
      pre.innerHTML = '<span style="color:var(--txm)">// Select traits to generate profile</span>';
      return;
    }

    let out = `<span style="color:var(--txm)">// GeneModeler v3 — Compiled SNP Profile\n// Reference: GRCh38/hg38 · dbSNP 156\n// Sex: ${App.getCurrentSex ? App.getCurrentSex() : 'unspecified'}\n\n</span>`;

    Object.entries(selected).forEach(([tk, vk]) => {
      const t = allT[tk]; if (!t) return;
      const v = t.variants[vk]; if (!v) return;
      out += `<span style="color:var(--txd)">/* ${t.label}: ${v.label} */\n</span>`;
      if (v.genes) v.genes.forEach(g => {
        out += `<span style="color:var(--a1)">${g.gene}</span> <span style="color:var(--a2)">${g.snp}</span>(${g.allele})\n`;
      });
      out += '\n';
    });

    Object.keys(nvSelected).forEach(id => {
      const t = _findNVTrait(id);
      if (!t) return;
      out += `<span style="color:var(--txd)">/* Non-visual: ${t.name} */\n</span>`;
      out += `<span style="color:var(--a1)">${t.gene.split('/')[0].trim()}</span> <span style="color:var(--a2)">${t.snp.split(';')[0].split(' ')[0]}</span>(${t.allele})\n\n`;
    });

    pre.innerHTML = out;
  }

  function copy(code, btn) {
    const decoded = code.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    navigator.clipboard.writeText(decoded).catch(()=>{
      const el = document.createElement('textarea');
      el.value = decoded; document.body.appendChild(el); el.select();
      document.execCommand('copy'); el.remove();
    });
    const orig = btn.textContent;
    btn.textContent = 'COPIED ✓';
    setTimeout(() => btn.textContent = orig, 1500);
  }

  function exportGenome(selected, nvSelected) {
    const allT = getAllTraits();
    let text = '=== GeneModeler v3 — Genotype Export ===\nReference: GRCh38/hg38 · dbSNP 156\n\n';
    Object.entries(selected).forEach(([tk,vk]) => {
      const t = allT[tk]; if(!t) return;
      const v = t.variants[vk]; if(!v) return;
      text += `--- ${t.label}: ${v.label} ---\nCode: ${v.code}\n`;
      if (v.genes) v.genes.forEach(g => text += `  ${g.gene} ${g.snp}(${g.allele}) — ${g.effect}\n`);
      if (v.frequency) text += `Frequency: ${v.frequency}\n`;
      text += '\n';
    });
    Object.keys(nvSelected).forEach(id => {
      for (const cat of Object.values(NON_VISUAL_DB)) {
        const t = cat.traits.find(t => t.id === id); if (!t) continue;
        text += `--- ${t.name} (Non-Visual) ---\nGene: ${t.gene}\nSNP: ${t.snp}\nCode: ${t.code}\nMechanism: ${t.mechanism}\n\n`;
      }
    });
    const blob = new Blob([text], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'genotype-profile.txt'; a.click();
  }

  function _esc(s) { if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _escA(s) { if(!s) return ''; return String(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }

  return { render, copy, exportGenome };
})();
