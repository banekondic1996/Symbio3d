/**
 * sliders.js — Feature fine-tuning sliders
 * Drives Model3D bone scales and morph target influences.
 */

const Sliders = (() => {
  const SLIDER_DEFS = [
    { id: 'head-width',      label: 'Head Width',       min: 70, max: 130, def: 100, unit: '%' },
    { id: 'head-height',     label: 'Head Height',      min: 75, max: 125, def: 100, unit: '%' },
    { id: 'nose-width',      label: 'Nose Width',       min: 50, max: 200, def: 100, unit: '%' },
    { id: 'eye-size',        label: 'Eye Size',         min: 60, max: 160, def: 100, unit: '%' },
    { id: 'eye-spacing',     label: 'Eye Spacing',      min: 60, max: 140, def: 100, unit: '%' },
    { id: 'lip-volume',      label: 'Lip Volume',       min: 30, max: 220, def: 100, unit: '%' },
    { id: 'jaw-width',       label: 'Jaw Width',        min: 60, max: 145, def: 100, unit: '%' },
    { id: 'shoulder-width',  label: 'Shoulder Width',   min: 60, max: 145, def: 100, unit: '%' },
    { id: 'torso-width',     label: 'Torso Width',      min: 60, max: 150, def: 100, unit: '%' },
    { id: 'waist-ratio',     label: 'Waist Taper',      min: 50, max: 120, def: 100, unit: '%' },
    { id: 'leg-length',      label: 'Leg Length',       min: 70, max: 140, def: 100, unit: '%' },
    { id: 'arm-length',      label: 'Arm Length',       min: 70, max: 140, def: 100, unit: '%' },
    { id: 'neck-width',      label: 'Neck Width',       min: 50, max: 180, def: 100, unit: '%' },
    { id: 'ear-size',        label: 'Ear Size',         min: 50, max: 200, def: 100, unit: '%' },
    { id: 'brow-thickness',  label: 'Brow Thickness',   min: 30, max: 250, def: 100, unit: '%' },
  ];

  const values = {};

  function build() {
    const list = document.getElementById('sliders-list');
    if (!list) return;
    list.innerHTML = '';

    SLIDER_DEFS.forEach(def => {
      values[def.id] = def.def;

      const item = document.createElement('div');
      item.className = 'slider-item';
      item.innerHTML = `
        <div class="slider-lbl">
          <span class="slider-lbl-name">${def.label}</span>
          <span class="slider-lbl-val" id="sv-lbl-${def.id}">${def.def}${def.unit}</span>
        </div>
        <input class="slider-input" type="range"
          id="sv-${def.id}" min="${def.min}" max="${def.max}" value="${def.def}" step="1">
      `;

      const input = item.querySelector('input');
      const lbl   = item.querySelector('.slider-lbl-val');

      input.addEventListener('input', () => {
        const v = parseInt(input.value);
        values[def.id] = v;
        lbl.textContent = v + def.unit;
        _debounceApply();
      });

      list.appendChild(item);
    });
  }

  let _applyTimer = null;
  function _debounceApply() {
    clearTimeout(_applyTimer);
    _applyTimer = setTimeout(() => {
      if (window.Model3D) Model3D.applySliders({ ...values });
    }, 30);
  }

  function reset() {
    SLIDER_DEFS.forEach(def => {
      values[def.id] = def.def;
      const input = document.getElementById('sv-' + def.id);
      const lbl   = document.getElementById('sv-lbl-' + def.id);
      if (input) input.value = def.def;
      if (lbl)   lbl.textContent = def.def + def.unit;
    });
    if (window.Model3D) Model3D.applySliders({ ...values });
  }

  function getValues()  { return { ...values }; }
  function getDef(id)   { return SLIDER_DEFS.find(d => d.id === id); }
  function getAllDefs()  { return SLIDER_DEFS; }

  return { build, reset, getValues, getDef, getAllDefs };
})();
