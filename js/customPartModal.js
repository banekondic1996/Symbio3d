/**
 * customPartModal.js — Upload custom 3D parts (.glb/.gltf)
 * to replace specific body regions on the 3D model.
 */

const CustomPartModal = (() => {
  const BODY_PARTS = [
    { id: 'mouth', label: 'Mouth / Lips',   icon: '👄', desc: 'Replace mouth/lip mesh' },
    { id: 'nose',  label: 'Nose',            icon: '👃', desc: 'Replace nose mesh' },
    { id: 'eyes',  label: 'Eyes',            icon: '👁',  desc: 'Replace eye meshes' },
    { id: 'ears',  label: 'Ears',            icon: '👂', desc: 'Replace ear meshes' },
    { id: 'hair',  label: 'Hair / Brows',    icon: '💇', desc: 'Replace hair and eyebrows' },
    { id: 'head',  label: 'Full Head',       icon: '🗿', desc: 'Replace entire head mesh' },
  ];

  let overlayEl = null;

  function open() {
    if (!overlayEl) _build();
    _refreshList();
    overlayEl.classList.remove('hidden');
  }

  function close() {
    if (overlayEl) overlayEl.classList.add('hidden');
  }

  function _build() {
    overlayEl = document.createElement('div');
    overlayEl.id = 'part-modal-overlay';
    overlayEl.className = 'hidden';
    overlayEl.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);
      z-index:101;display:flex;align-items:center;justify-content:center;
    `;
    overlayEl.addEventListener('click', e => { if (e.target === overlayEl) close(); });

    overlayEl.innerHTML = `
      <div id="part-modal-box" style="
        background:var(--s1);border:1px solid var(--b1);border-radius:14px;width:500px;
        max-height:86vh;display:flex;flex-direction:column;
        box-shadow:0 30px 90px rgba(0,0,0,0.7);
        animation:mpop .2s cubic-bezier(.2,.8,.4,1);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--b1);">
          <div>
            <div style="font-size:14px;font-weight:700;">Custom 3D Parts</div>
            <div style="font-size:10px;color:var(--txd);margin-top:2px;">Upload .glb/.gltf files to replace body regions</div>
          </div>
          <button onclick="CustomPartModal.close()" style="
            background:none;border:1px solid var(--b1);color:var(--txd);
            width:26px;height:26px;border-radius:6px;cursor:pointer;font-size:12px;
          ">✕</button>
        </div>

        <div style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px;">

          <!-- Info banner -->
          <div style="
            background:rgba(34,211,184,0.08);border:1px solid rgba(34,211,184,0.2);
            border-radius:8px;padding:10px 12px;font-size:11px;color:var(--txd);line-height:1.6;
          ">
            <strong style="color:var(--a1);">How it works:</strong> Upload a .glb or .gltf file for any body part.
            The custom mesh will replace the corresponding region on the 3D model.
            Parts exported from Blender, Maya, or online tools are supported.
          </div>

          <!-- Part list -->
          <div id="part-modal-list" style="display:flex;flex-direction:column;gap:8px;"></div>

          <!-- Quick tips -->
          <div style="font-size:9.5px;color:var(--txm);border-top:1px solid var(--b2);padding-top:10px;line-height:1.7;">
            Tips: • Parts are auto-scaled to fit the model • Sliders still affect custom parts via bone transforms •
            Best results with watertight meshes centered at origin • Supports PBR materials (baseColor, roughness, metalness)
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid var(--b1);">
          <button onclick="CustomPartModal.close()" style="
            background:var(--s2);border:1px solid var(--b1);color:var(--txd);
            font-family:var(--body);font-size:12px;font-weight:600;
            padding:7px 18px;border-radius:var(--r2);cursor:pointer;
          ">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);
  }

  function _refreshList() {
    const list = document.getElementById('part-modal-list');
    if (!list) return;
    list.innerHTML = '';
    const activeParts = window.Model3D ? Model3D.getCustomParts() : [];

    BODY_PARTS.forEach(part => {
      const isActive = activeParts.includes(part.id);
      const row = document.createElement('div');
      row.style.cssText = `
        display:flex;align-items:center;gap:12px;
        background:${isActive ? 'rgba(34,211,184,0.06)' : 'var(--s2)'};
        border:1px solid ${isActive ? 'rgba(34,211,184,0.3)' : 'var(--b2)'};
        border-radius:8px;padding:10px 12px;transition:all .15s;
      `;

      row.innerHTML = `
        <span style="font-size:22px;flex-shrink:0">${part.icon}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:700;color:${isActive?'var(--a1)':'var(--tx)'};">${part.label}</div>
          <div style="font-size:10px;color:var(--txd);">${part.desc}</div>
          ${isActive ? `<div style="font-size:9px;color:var(--a1);margin-top:2px;">✓ Custom part loaded</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;">
          ${isActive ? `
            <button data-part="${part.id}" data-action="remove" style="
              background:rgba(240,80,96,0.1);border:1px solid rgba(240,80,96,0.3);
              color:#f05060;font-size:10px;padding:4px 10px;border-radius:4px;cursor:pointer;
            ">Remove</button>
          ` : ''}
          <label style="cursor:pointer;">
            <input type="file" accept=".glb,.gltf" data-part="${part.id}" style="display:none" />
            <span style="
              display:inline-block;
              background:var(--a1d);border:1px solid var(--a1);color:var(--a1);
              font-size:10px;font-family:var(--mono);padding:4px 12px;border-radius:4px;
              cursor:pointer;transition:all .15s;white-space:nowrap;
            ">${isActive ? '↑ Replace' : '↑ Upload'}</span>
          </label>
        </div>
      `;

      // File upload handler
      const fileInput = row.querySelector('input[type=file]');
      fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        _uploadPart(part.id, file, row);
      });

      // Remove handler
      const removeBtn = row.querySelector('[data-action="remove"]');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          if (window.Model3D) Model3D.removeCustomPart(part.id);
          _refreshList();
        });
      }

      list.appendChild(row);
    });
  }

  function _uploadPart(partId, file, rowEl) {
    // Model3D is always available; GLTFLoader may not be yet
    if (!window.Model3D) {
      alert('Page not ready — please refresh.');
      return;
    }

    // Show loading state
    const statusEl = document.createElement('div');
    statusEl.style.cssText = 'font-size:10px;color:var(--a1);margin-top:4px;';
    statusEl.textContent = `Loading ${file.name}…`;
    rowEl.appendChild(statusEl);

    Model3D.loadCustomPart(partId, file)
      .then(() => {
        _refreshList();
        // Flash status
        const st = document.getElementById('status-text');
        if (st) { st.textContent = `Custom ${partId} loaded`; setTimeout(() => st.textContent = 'Ready', 3000); }
      })
      .catch(err => {
        console.error('Failed to load custom part:', err);
        statusEl.style.color = '#f05060';
        statusEl.textContent = `Error: ${err.message || 'Failed to load file'}`;
        setTimeout(() => statusEl.remove(), 4000);
      });
  }

  return { open, close };
})();
