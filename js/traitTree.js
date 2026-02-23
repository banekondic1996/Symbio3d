/**
 * traitTree.js — Left panel visual trait tree
 */
const TraitTree = (() => {
  const CAT_ORDER = ['facial','hair','skin','body','limb','other'];
  const CAT_LABELS = { facial:'Facial',hair:'Hair',skin:'Skin',body:'Body',limb:'Limbs & Digits',other:'Other' };

  function build() {
    const container = document.getElementById('trait-tree');
    container.innerHTML = '';
    const allTraits = getAllTraits();
    const byCat = {};
    Object.entries(allTraits).forEach(([k,t]) => {
      const c = t.category||'other';
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push([k,t]);
    });
    CAT_ORDER.forEach(cat => {
      if (!byCat[cat]?.length) return;
      const sec = document.createElement('div');
      sec.className = 'trait-category-section';
      sec.innerHTML = `<div class="cat-header">${CAT_LABELS[cat]||cat}</div>`;
      byCat[cat].forEach(([traitKey, traitData]) => {
        const row = document.createElement('div');
        row.className = 'trait-row';
        const lbl = document.createElement('div');
        lbl.className = 'trait-lbl';
        lbl.innerHTML = `<span class="trait-icon-sm">${traitData.icon||'•'}</span>${traitData.label}`;
        row.appendChild(lbl);
        const opts = document.createElement('div');
        opts.className = 'trait-options';
        Object.entries(traitData.variants).forEach(([varKey, varData]) => {
          const btn = document.createElement('button');
          btn.className = 'tbtn' + (traitData._custom?' custom':'');
          btn.dataset.trait = traitKey;
          btn.dataset.variant = varKey;
          if (varData.color) {
            const s = document.createElement('span');
            s.className = 'tswatch';
            s.style.background = varData.color;
            btn.appendChild(s);
          }
          btn.appendChild(document.createTextNode(varData.label));
          const sel = App.getSelected();
          if (sel[traitKey] === varKey) btn.classList.add('active');
          btn.addEventListener('click', () => App.selectTrait(traitKey, varKey, btn));
          opts.appendChild(btn);
        });
        row.appendChild(opts);
        sec.appendChild(row);
      });
      container.appendChild(sec);
    });
  }
  return { build };
})();
