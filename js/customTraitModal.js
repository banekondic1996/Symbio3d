/**
 * customTraitModal.js
 * Handles the "Add Custom Trait" modal with visual parameter sliders.
 */

const CustomTraitModal = (() => {

  const VISUAL_PARAMS = [
    { id: 'headWidth',    label: 'Head Width',      min: 0.5, max: 1.5, def: 1.0, fmt: 'x' },
    { id: 'headHeight',   label: 'Head Height',     min: 0.5, max: 1.5, def: 1.0, fmt: 'x' },
    { id: 'noseWidth',    label: 'Nose Width',      min: 0.4, max: 2.0, def: 1.0, fmt: 'x' },
    { id: 'noseLength',   label: 'Nose Length',     min: 0.5, max: 1.8, def: 1.0, fmt: 'x' },
    { id: 'lipVolume',    label: 'Lip Volume',      min: 0.3, max: 2.0, def: 1.0, fmt: 'x' },
    { id: 'earSize',      label: 'Ear Size',        min: 0.5, max: 1.8, def: 1.0, fmt: 'x' },
    { id: 'eyeSpacing',   label: 'Eye Spacing',     min: 0.6, max: 1.4, def: 1.0, fmt: 'x' },
    { id: 'browThickness',label: 'Brow Thickness',  min: 0.2, max: 2.0, def: 1.0, fmt: 'x' },
    { id: 'jawWidth',     label: 'Jaw Width',       min: 0.6, max: 1.5, def: 1.0, fmt: 'x' },
    { id: 'neckWidth',    label: 'Neck Width',      min: 0.5, max: 1.6, def: 1.0, fmt: 'x' },
    { id: 'shoulderWidth',label: 'Shoulder Width',  min: 0.6, max: 1.5, def: 1.0, fmt: 'x' },
    { id: 'torsoLength',  label: 'Torso Length',    min: 0.7, max: 1.4, def: 1.0, fmt: 'x' },
    { id: 'legLength',    label: 'Leg Length',      min: 0.7, max: 1.4, def: 1.0, fmt: 'x' },
    { id: 'fingerLength', label: 'Finger Length',   min: 0.6, max: 1.5, def: 1.0, fmt: 'x' },
    { id: 'muscleBuild',  label: 'Muscle Build',    min: 0.5, max: 1.6, def: 1.0, fmt: 'x' },
  ];

  let activeSliders = []; // { paramId, el }

  function open() {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('ct-name').focus();
    _resetForm();
  }

  function close() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  function _resetForm() {
    document.getElementById('ct-name').value = '';
    document.getElementById('ct-gene').value = '';
    document.getElementById('ct-snp').value = '';
    document.getElementById('ct-chromosome').value = '';
    document.getElementById('ct-allele').value = '';
    document.getElementById('ct-effect').value = '';
    document.getElementById('ct-color').value = '#4a90d9';
    document.getElementById('ct-polydactyly').checked = false;
    document.getElementById('ct-bilatateral').checked = true;
    document.getElementById('slider-rows').innerHTML = '';
    activeSliders = [];
  }

  function addSlider() {
    const container = document.getElementById('slider-rows');

    // Pick a param not already added
    const usedIds = activeSliders.map(s => s.paramId);
    const available = VISUAL_PARAMS.filter(p => !usedIds.includes(p.id));
    if (!available.length) { alert('All visual parameters are already added.'); return; }

    const param = available[0];

    const row = document.createElement('div');
    row.className = 'slider-row-item';
    row.dataset.paramId = param.id;

    row.innerHTML = `
      <div class="slider-row-top">
        <select class="param-select">
          ${available.map(p => `<option value="${p.id}" ${p.id===param.id?'selected':''}>${p.label}</option>`).join('')}
        </select>
        <button class="slider-row-remove" title="Remove">✕</button>
      </div>
      <div class="slider-label-row">
        <span class="slider-end-label">min</span>
        <span class="slider-end-label">max</span>
      </div>
      <div class="slider-range-row">
        <input type="range" min="${param.min}" max="${param.max}" step="0.01" value="${param.def}">
        <span class="slider-val">${param.def.toFixed(2)}x</span>
      </div>
    `;

    // Events
    const select = row.querySelector('.param-select');
    const slider = row.querySelector('input[type="range"]');
    const valLbl = row.querySelector('.slider-val');
    const removeBtn = row.querySelector('.slider-row-remove');

    select.addEventListener('change', () => {
      const newParam = VISUAL_PARAMS.find(p => p.id === select.value);
      if (newParam) {
        slider.min = newParam.min;
        slider.max = newParam.max;
        slider.value = newParam.def;
        valLbl.textContent = newParam.def.toFixed(2) + newParam.fmt;
        row.dataset.paramId = newParam.id;
        // Update tracked
        const entry = activeSliders.find(s => s.row === row);
        if (entry) entry.paramId = newParam.id;
      }
    });

    slider.addEventListener('input', () => {
      valLbl.textContent = parseFloat(slider.value).toFixed(2) + 'x';
    });

    removeBtn.addEventListener('click', () => {
      activeSliders = activeSliders.filter(s => s.row !== row);
      row.remove();
    });

    container.appendChild(row);
    activeSliders.push({ paramId: param.id, row, slider, select });
  }

  function save() {
    const name = document.getElementById('ct-name').value.trim();
    if (!name) { alert('Please enter a trait name.'); return; }

    const gene = document.getElementById('ct-gene').value.trim() || 'UNKNOWN';
    const snp  = document.getElementById('ct-snp').value.trim() || 'rs???????';
    const chr  = document.getElementById('ct-chromosome').value.trim() || '?q?';
    const allele = document.getElementById('ct-allele').value.trim() || '?/?';
    const effect = document.getElementById('ct-effect').value.trim() || 'User-defined trait';
    const color  = document.getElementById('ct-color').value;
    const isPolydactyly = document.getElementById('ct-polydactyly').checked;
    const bilateral = document.getElementById('ct-bilatateral').checked;

    // Collect slider values
    const sliderValues = {};
    activeSliders.forEach(({ paramId, slider }) => {
      sliderValues[paramId] = parseFloat(slider.value);
    });

    // Build trait ID
    const traitId = 'custom_' + name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const variantId = 'expressed';

    const geneVariant = {
      label: name,
      color: color,
      genes: [{ gene, snp, chr, allele, effect }],
      code: `${gene}(${snp}) | ${allele} | chr${chr} | User-defined`,
      frequency: 'User-defined trait',
      heritage: 'Custom entry',
      _sliders: sliderValues,
      _isPolydactyly: isPolydactyly,
      _bilateral: bilateral,
    };

    const traitObj = {
      label: name,
      category: document.getElementById('ct-category').value,
      icon: isPolydactyly ? '✋' : '🧬',
      _custom: true,
      variants: {
        [variantId]: geneVariant,
        none: {
          label: 'Not Expressed',
          genes: [{ gene, snp, chr, allele: 'WT/WT', effect: 'Wild-type — trait not expressed' }],
          code: `${gene}(${snp}) | WT | Wild-type`,
          frequency: 'Common',
          heritage: 'Universal',
        },
      },
    };

    addCustomTrait(traitId, traitObj);
    TraitControls.refresh();
    close();

    // Flash status
    const st = document.getElementById('status-text');
    if (st) { st.textContent = `Custom trait "${name}" added`; setTimeout(()=>st.textContent='Ready', 3000); }
  }

  function init() {
    document.getElementById('btn-add-trait').addEventListener('click', open);
    document.getElementById('modal-close').addEventListener('click', close);
    document.getElementById('modal-cancel').addEventListener('click', close);
    document.getElementById('modal-save').addEventListener('click', save);
    document.getElementById('btn-add-slider').addEventListener('click', addSlider);

    // Close on overlay click
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) close();
    });
  }

  return { init, open, close, save, addSlider };
})();
