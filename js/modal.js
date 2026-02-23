/**
 * modal.js — Custom trait modal
 */
const Modal = (() => {
  const PARAMS = [
    {id:'head-width',label:'Head Width',min:50,max:150,def:100},
    {id:'head-height',label:'Head Height',min:50,max:150,def:100},
    {id:'nose-width',label:'Nose Width',min:40,max:220,def:100},
    {id:'eye-size',label:'Eye Size',min:50,max:180,def:100},
    {id:'eye-spacing',label:'Eye Spacing',min:55,max:145,def:100},
    {id:'lip-volume',label:'Lip Volume',min:25,max:250,def:100},
    {id:'jaw-width',label:'Jaw Width',min:55,max:150,def:100},
    {id:'shoulder-width',label:'Shoulder Width',min:55,max:150,def:100},
    {id:'torso-width',label:'Torso Width',min:55,max:155,def:100},
    {id:'waist-ratio',label:'Waist Taper',min:45,max:125,def:100},
    {id:'leg-length',label:'Leg Length',min:65,max:145,def:100},
    {id:'arm-length',label:'Arm Length',min:65,max:145,def:100},
    {id:'neck-width',label:'Neck Width',min:45,max:190,def:100},
    {id:'ear-size',label:'Ear Size',min:45,max:220,def:100},
    {id:'brow-thickness',label:'Brow Thickness',min:25,max:260,def:100},
  ];

  let activeSliders = [];

  function open() {
    _buildForm();
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('ct-name').focus(), 100);
  }

  function close() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  function _buildForm() {
    document.getElementById('modal-body-content').innerHTML = `
      <div class="form-row"><label>Trait Name</label><input type="text" id="ct-name" placeholder="e.g. Prominent Cheekbones" maxlength="50"></div>
      <div class="form-row"><label>Category</label>
        <select id="ct-cat">
          <option value="facial">Facial</option><option value="hair">Hair</option>
          <option value="skin">Skin</option><option value="body">Body</option>
          <option value="limb">Limbs & Digits</option><option value="other">Other</option>
        </select>
      </div>
      <div class="form-row"><label>Gene Symbol</label><input type="text" id="ct-gene" placeholder="e.g. EDAR" maxlength="30"></div>
      <div class="form-row"><label>SNP ID</label><input type="text" id="ct-snp" placeholder="e.g. rs3827760" maxlength="30"></div>
      <div class="form-row"><label>Chromosome / Locus</label><input type="text" id="ct-chr" placeholder="e.g. 2q13" maxlength="20"></div>
      <div class="form-row"><label>Allele (Genotype)</label><input type="text" id="ct-allele" placeholder="e.g. A/A" maxlength="15"></div>
      <div class="form-row"><label>Biological Effect</label><textarea id="ct-effect" rows="2" placeholder="Describe the mechanism..."></textarea></div>
      <div class="form-row"><label>Phenotype Color</label><input type="color" id="ct-color" value="#4a90d9"></div>
      <div class="modal-section-sep">Visual Parameter Sliders</div>
      <div id="modal-slider-rows"></div>
      <button class="add-slider-btn" onclick="Modal.addSlider()">+ Add Visual Parameter</button>
      <div class="modal-section-sep" style="margin-top:8px">Special Options</div>
      <div class="form-row form-row-check"><input type="checkbox" id="ct-poly"><label for="ct-poly">Add extra finger (Polydactyly)</label></div>
      <div class="form-row form-row-check"><input type="checkbox" id="ct-bilateral" checked><label for="ct-bilateral">Bilateral (both sides)</label></div>
    `;
    activeSliders = [];
  }

  function addSlider() {
    const container = document.getElementById('modal-slider-rows');
    const usedIds = activeSliders.map(s => s.paramId);
    const avail = PARAMS.filter(p => !usedIds.includes(p.id));
    if (!avail.length) return;
    const p = avail[0];

    const row = document.createElement('div');
    row.className = 'modal-slider-row';
    row.innerHTML = `
      <div class="msr-top">
        <select class="msr-sel">${avail.map(pp => `<option value="${pp.id}" ${pp.id===p.id?'selected':''}>${pp.label}</option>`).join('')}</select>
        <button class="msr-remove" onclick="this.closest('.modal-slider-row').remove()">✕</button>
      </div>
      <div class="msr-range-row">
        <input type="range" min="${p.min}" max="${p.max}" value="${p.def}" step="1">
        <span class="msr-val">${p.def}%</span>
      </div>`;

    const sel = row.querySelector('.msr-sel');
    const range = row.querySelector('input[type=range]');
    const val = row.querySelector('.msr-val');
    sel.addEventListener('change', () => {
      const np = PARAMS.find(x => x.id === sel.value);
      if (np) { range.min=np.min; range.max=np.max; range.value=np.def; val.textContent=np.def+'%'; }
    });
    range.addEventListener('input', () => val.textContent = range.value + '%');
    container.appendChild(row);
    activeSliders.push({ row });
  }

  function save() {
    const name = document.getElementById('ct-name').value.trim();
    if (!name) { alert('Please enter a trait name.'); return; }

    const gene   = document.getElementById('ct-gene').value.trim() || 'UNKNOWN';
    const snp    = document.getElementById('ct-snp').value.trim() || 'rs?';
    const chr    = document.getElementById('ct-chr').value.trim() || '?';
    const allele = document.getElementById('ct-allele').value.trim() || '?/?';
    const effect = document.getElementById('ct-effect').value.trim() || 'User-defined';
    const color  = document.getElementById('ct-color').value;
    const isPoly = document.getElementById('ct-poly').checked;
    const catVal = document.getElementById('ct-cat').value;

    const id = 'custom_' + Date.now();
    addCustomTrait(id, {
      label: name, category: catVal, icon: isPoly ? '✋' : '🧬', _custom: true,
      variants: {
        expressed: {
          label: name, color,
          genes: [{gene, snp, chr, allele, effect}],
          code: `${gene}(${snp}) | ${allele} | chr${chr} | User-defined`,
          frequency: 'Custom', heritage: 'Custom entry',
          _polydactyly: isPoly,
        },
        wildtype: {
          label: 'Not Expressed',
          genes: [{gene, snp, chr, allele:'WT/WT', effect:'Wild-type — trait absent'}],
          code: `${gene}(${snp}) | WT | Wild-type`,
          frequency: 'Common', heritage: 'Universal',
        },
      }
    });

    TraitTree.build();
    close();
    const st = document.getElementById('status-msg');
    if (st) { st.textContent = `Custom trait "${name}" added`; setTimeout(()=>st.textContent='',3000); }
  }

  return { open, close, save, addSlider };
})();
