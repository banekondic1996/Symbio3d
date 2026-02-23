/**
 * traitControls.js
 * Builds the left-panel trait tree from GENE_DB.
 * Manages selectedTraits state.
 */

const TraitControls = (() => {
  const selectedTraits = {};

  const CATEGORY_ORDER = ['facial', 'hair', 'skin', 'body', 'limb', 'other'];
  const CATEGORY_LABELS = {
    facial: 'Facial Features',
    hair:   'Hair',
    skin:   'Skin',
    body:   'Body',
    limb:   'Limbs & Digits',
    other:  'Other',
  };

  function build() {
    const container = document.getElementById('trait-tree');
    container.innerHTML = '';
    _renderTree(container);
  }

  function _renderTree(container) {
    const allTraits = getAllTraits();
    const byCategory = {};

    Object.entries(allTraits).forEach(([key, trait]) => {
      const cat = trait.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push([key, trait]);
    });

    CATEGORY_ORDER.forEach(cat => {
      if (!byCategory[cat] || !byCategory[cat].length) return;

      const section = document.createElement('div');
      section.className = 'trait-category-section';
      section.innerHTML = `<div class="category-header">${CATEGORY_LABELS[cat] || cat}</div>`;

      byCategory[cat].forEach(([traitKey, traitData]) => {
        const row = document.createElement('div');
        row.className = 'trait-row';

        const label = document.createElement('div');
        label.className = 'trait-label';
        label.textContent = `${traitData.icon || '•'} ${traitData.label}`;
        row.appendChild(label);

        const opts = document.createElement('div');
        opts.className = 'trait-options-row';

        Object.entries(traitData.variants).forEach(([varKey, varData]) => {
          const btn = document.createElement('button');
          btn.className = 'trait-btn';
          if (traitData._custom) btn.classList.add('custom-trait');
          btn.dataset.trait = traitKey;
          btn.dataset.variant = varKey;

          // Color swatch
          const colorVal = varData.color;
          if (colorVal) {
            const swatch = document.createElement('span');
            swatch.className = 'color-swatch';
            swatch.style.background = colorVal;
            btn.appendChild(swatch);
          }

          // Icon
          if (varData.icon) {
            const icon = document.createElement('span');
            icon.className = 'trait-icon';
            icon.textContent = varData.icon;
            btn.appendChild(icon);
          }

          // Label text
          btn.appendChild(document.createTextNode(varData.label));

          // Restore active state
          if (selectedTraits[traitKey] === varKey) {
            btn.classList.add('active');
          }

          btn.addEventListener('click', () => _onTraitClick(traitKey, varKey, btn));
          opts.appendChild(btn);
        });

        row.appendChild(opts);
        section.appendChild(row);
      });

      container.appendChild(section);
    });
  }

  function _onTraitClick(traitKey, varKey, btn) {
    // Deactivate all buttons for this trait
    document.querySelectorAll(`[data-trait="${traitKey}"]`)
      .forEach(b => b.classList.remove('active'));

    if (selectedTraits[traitKey] === varKey) {
      // Toggle off
      delete selectedTraits[traitKey];
      _setStatus('Trait removed');
    } else {
      selectedTraits[traitKey] = varKey;
      btn.classList.add('active');
      _setStatus(`Applied: ${varKey}`);
    }

    ModelBuilder.build(selectedTraits);
    GeneOutput.render(selectedTraits);
  }

  function _setStatus(text) {
    const el = document.getElementById('status-text');
    if (el) { el.textContent = text; clearTimeout(el._t); el._t = setTimeout(() => el.textContent = 'Ready', 2500); }
  }

  function getSelected() { return selectedTraits; }

  // Called after adding a custom trait to re-render the tree
  function refresh() { build(); }

  return { build, getSelected, refresh };
})();
