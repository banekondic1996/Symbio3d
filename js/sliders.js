/**
 * sliders.js — Feature fine-tuning sliders
 * Maps slider values to CSS custom properties applied to #human-svg transforms.
 */

const Sliders = (() => {
  const SLIDER_DEFS = [
    { id: 'head-width',      label: 'Head Width',       min: 70, max: 130, def: 100, unit: '%', css: '--sv-head-w' },
    { id: 'head-height',     label: 'Head Height',      min: 75, max: 125, def: 100, unit: '%', css: '--sv-head-h' },
    { id: 'nose-width',      label: 'Nose Width',       min: 50, max: 200, def: 100, unit: '%', css: '--sv-nose-w' },
    { id: 'eye-size',        label: 'Eye Size',         min: 60, max: 160, def: 100, unit: '%', css: '--sv-eye-s' },
    { id: 'eye-spacing',     label: 'Eye Spacing',      min: 60, max: 140, def: 100, unit: '%', css: '--sv-eye-sp' },
    { id: 'lip-volume',      label: 'Lip Volume',       min: 30, max: 220, def: 100, unit: '%', css: '--sv-lip-v' },
    { id: 'jaw-width',       label: 'Jaw Width',        min: 60, max: 145, def: 100, unit: '%', css: '--sv-jaw-w' },
    { id: 'shoulder-width',  label: 'Shoulder Width',   min: 60, max: 145, def: 100, unit: '%', css: '--sv-shou-w' },
    { id: 'torso-width',     label: 'Torso Width',      min: 60, max: 150, def: 100, unit: '%', css: '--sv-torso-w' },
    { id: 'waist-ratio',     label: 'Waist Taper',      min: 50, max: 120, def: 100, unit: '%', css: '--sv-waist' },
    { id: 'leg-length',      label: 'Leg Length',       min: 70, max: 140, def: 100, unit: '%', css: '--sv-leg-l' },
    { id: 'arm-length',      label: 'Arm Length',       min: 70, max: 140, def: 100, unit: '%', css: '--sv-arm-l' },
    { id: 'neck-width',      label: 'Neck Width',       min: 50, max: 180, def: 100, unit: '%', css: '--sv-neck-w' },
    { id: 'ear-size',        label: 'Ear Size',         min: 50, max: 200, def: 100, unit: '%', css: '--sv-ear-s' },
    { id: 'brow-thickness',  label: 'Brow Thickness',   min: 30, max: 250, def: 100, unit: '%', css: '--sv-brow-t' },
  ];

  const values = {};

  function build() {
    const list = document.getElementById('sliders-list');
    list.innerHTML = '';
    values;

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
          id="sv-${def.id}"
          min="${def.min}" max="${def.max}" value="${def.def}" step="1">
      `;

      const input = item.querySelector('input');
      const lbl   = item.querySelector('.slider-lbl-val');

      input.addEventListener('input', () => {
        const v = parseInt(input.value);
        values[def.id] = v;
        lbl.textContent = v + def.unit;
        _apply(def, v);
      });

      list.appendChild(item);
    });
  }

  function _apply(def, v) {
    // Apply via SVG element transforms where possible
    const svg = document.getElementById('human-svg');
    if (!svg) return;

    const factor = v / 100;

    switch(def.id) {
      case 'head-width': {
        const head = svg.getElementById('head-shape');
        if (head) {
          const base = head.tagName === 'ellipse' ? parseFloat(head.getAttribute('rx')) : 40;
          // Scale head group via transform
          const headEls = svg.querySelectorAll('#head-shape, .body-hair:first-of-type');
          svg.style.setProperty('--head-w-scale', factor);
        }
        break;
      }
      case 'nose-width': {
        // The nose width is controlled by trait selection mostly, but slider adds fine-tune
        svg.style.setProperty('--nose-scale', factor);
        break;
      }
      case 'shoulder-width': {
        svg.style.setProperty('--shoulder-scale', factor);
        break;
      }
    }

    // Universal: post all values to CSS vars for future shader/filter usage
    document.documentElement.style.setProperty(def.css, factor);

    // Visual feedback: scale specific SVG groups using viewBox manipulation
    _applySVGScale(svg, def.id, factor);
  }

  function _applySVGScale(svg, sliderId, factor) {
    // Apply transform to relevant SVG elements based on slider
    // Using SVG transform attribute for reliable cross-browser support
    const transforms = {
      'shoulder-width': { sel: null, hint: 'Affects shoulder silhouette on next render' },
      'leg-length':     { sel: null, hint: 'Affects leg length on next render' },
    };

    // For most sliders, trigger a model re-render which reads the slider values
    if (window.App) {
      // Debounced re-render
      clearTimeout(Sliders._renderTimer);
      Sliders._renderTimer = setTimeout(() => App.rebuildModel(), 50);
    }
  }

  function reset() {
    SLIDER_DEFS.forEach(def => {
      values[def.id] = def.def;
      const input = document.getElementById('sv-' + def.id);
      const lbl   = document.getElementById('sv-lbl-' + def.id);
      if (input) input.value = def.def;
      if (lbl)   lbl.textContent = def.def + def.unit;
      document.documentElement.style.setProperty(def.css, 1.0);
    });
    if (window.App) App.rebuildModel();
  }

  function getValues() { return { ...values }; }

  function getDef(id) { return SLIDER_DEFS.find(d => d.id === id); }
  function getAllDefs() { return SLIDER_DEFS; }

  return { build, reset, getValues, getDef, getAllDefs };
})();
