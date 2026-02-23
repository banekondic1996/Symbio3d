/**
 * app.js — Main orchestrator
 */
const App = (() => {
  const selectedTraits = {};
  let currentSex = 'male';
  let currentTab = 'visual';
  let currentRTab = 'visual-traits';
  let slidersOpen = false;

  function init() {
    Model.init();
    Sliders.build();
    TraitTree.build();
    NonVisual.build();
    GeneOutput.render(selectedTraits);

    // Header btn events
    document.getElementById('btn-add-trait').addEventListener('click', () => Modal.open());
    document.getElementById('btn-export').addEventListener('click', () => {
      GeneOutput.exportGenome(selectedTraits, NonVisual.getSelected());
    });

    // Height model bar default
    _updateModelBar();
  }

  function setSex(sex) {
    currentSex = sex;
    document.querySelectorAll('.gs-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.sex === sex);
    });
    document.getElementById('mb-sex-label').textContent =
      sex === 'male' ? 'Male' : sex === 'female' ? 'Female' : 'Intersex';
    Model.setSex(sex);
  }

  function setTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
  }

  function setRightTab(tab) {
    currentRTab = tab;
    document.querySelectorAll('.rp-tab').forEach(b => b.classList.toggle('active', b.dataset.rtab === tab));
    document.querySelectorAll('.rtab-content').forEach(c => c.classList.toggle('active', c.id === 'rtab-' + tab));
  }

  function selectTrait(traitKey, varKey, btn) {
    // Deactivate siblings
    document.querySelectorAll(`[data-trait="${traitKey}"]`).forEach(b => b.classList.remove('active'));

    if (selectedTraits[traitKey] === varKey) {
      delete selectedTraits[traitKey];
    } else {
      selectedTraits[traitKey] = varKey;
      btn.classList.add('active');
    }

    Model.setTraits(selectedTraits);
    GeneOutput.render(selectedTraits);
    _updateModelBar();
  }

  function removeTrait(traitKey) {
    delete selectedTraits[traitKey];
    document.querySelectorAll(`[data-trait="${traitKey}"]`).forEach(b => b.classList.remove('active'));
    Model.setTraits(selectedTraits);
    GeneOutput.render(selectedTraits);
    _updateModelBar();
  }

  function removeNVTrait(id) {
    NonVisual.removeById(id);
    GeneOutput.render(selectedTraits);
    _updateModelBar();
  }

  function toggleSliders() {
    slidersOpen = !slidersOpen;
    document.getElementById('sliders-panel').classList.toggle('open', slidersOpen);
    document.getElementById('btn-toggle-sliders').classList.toggle('active', slidersOpen);
  }

  function copyGenome() {
    const pre = document.getElementById('genome-pre');
    const text = pre.innerText || pre.textContent;
    navigator.clipboard.writeText(text).catch(()=>{});
    const btn = document.getElementById('btn-copy-genome') || document.querySelector('.copy-btn');
    if (btn) { const o=btn.textContent; btn.textContent='COPIED ✓'; setTimeout(()=>btn.textContent=o,1500); }
  }

  function rebuildModel() {
    Model.setTraits(selectedTraits);
  }

  function _updateModelBar() {
    const total = Object.keys(selectedTraits).length + Object.keys(NonVisual.getSelected()).length;
    const countEl = document.getElementById('trait-count');
    if (countEl) countEl.textContent = total;
    const bar = document.getElementById('mb-traits');
    if (bar) bar.textContent = total > 0 ? `${total} trait${total!==1?'s':''} active` : 'No traits selected';

    // Height indicator
    const hEl = document.getElementById('mb-height');
    if (hEl) {
      hEl.textContent = selectedTraits.height === 'short' ? '152–165'
                      : selectedTraits.height === 'tall'  ? '180–195' : '165–180';
    }
  }

  function getSelected() { return selectedTraits; }
  function getNVSelected() { return NonVisual.getSelected(); }
  function getCurrentSex() { return currentSex; }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    setSex, setTab, setRightTab, selectTrait, removeTrait, removeNVTrait,
    toggleSliders, copyGenome, rebuildModel, getSelected, getNVSelected, getCurrentSex
  };
})();
