/**
 * model.js — SVG Anatomical Human Model
 *
 * Uses detailed SVG paths for a realistic silhouette.
 * Traits morph colors, shapes, and visibility of SVG elements.
 * This is the correct approach: import a real model or use SVG paths.
 * For production, replace the SVG paths with a loaded .glb/.gltf model via Three.js.
 */

const Model = (() => {
  let currentSex = 'male';
  let currentView = 'front';
  let traits = {};

  // Skin/hair/eye color resolved from traits
  let skinColor = '#e8c090';
  let skinDark   = '#c8a070';
  let hairColor  = '#3d1f10';
  let eyeColor   = '#5c3010';
  let lipColor   = '#c89070';

  function init() {
    render();
  }

  function setTraits(t) {
    traits = t;
    _resolveColors();
    render();
  }

  function setSex(sex) {
    currentSex = sex;
    render();
  }

  function setView(view) {
    currentView = view;
    const mc = document.getElementById('model-container');
    mc.className = 'view-' + view;
    // Update active button
    document.querySelectorAll('.mc-btn[data-view]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('onclick').includes(`'${view}'`));
    });
  }

  function _resolveColors() {
    const skinMap = {
      type1:'#fde8ce', type2:'#f5c98a', type3:'#d4935a',
      type4:'#9b6232', type5:'#5c3218', type6:'#321808',
    };
    const eyeMap = {
      blue:'#4a8fd6', gray:'#8a9bab', green:'#3a9a5c',
      violet:'#7050c0', hazel:'#8b6200', amber:'#d4880a', brown:'#5c3010',
    };
    const hairMap = {
      platinum:'#f0ece0', blonde:'#e8c97a', red:'#c03020',
      auburn:'#8b3820', brown:'#6b3520', black:'#181010',
      white:'#f5f2f0',
    };

    skinColor = skinMap[traits.skinTone] || '#e8c090';
    const sc = _hexToRgb(skinColor);
    skinDark  = _rgbDarken(sc, 0.80);
    lipColor  = _rgbDarken(sc, 0.85);
    hairColor = hairMap[traits.hairColor] || '#3d1f10';
    eyeColor  = eyeMap[traits.eyeColor]  || '#5c3010';
  }

  function render() {
    const container = document.getElementById('model-container');
    container.innerHTML = '';
    container.className = 'view-' + currentView;

    const isFemale = currentSex === 'female';

    // Build CSS class string for model state
    const classes = [
      'model-' + currentSex,
      'hair-' + (traits.hairTexture || 'wavy'),
      traits.freckles === 'present' ? 'freckles-on' : '',
      traits.dimples  === 'present' ? 'dimples-on'  : '',
      'beard-' + (traits.beardDensity || 'none'),
      traits.polydactyly === 'six' ? 'polydactyly' : '',
    ].filter(Boolean).join(' ');

    const heightClass = traits.height === 'short' ? 'height-short'
                      : traits.height === 'tall'   ? 'height-tall' : '';

    const svg = _buildSVG(isFemale, classes, heightClass);
    container.appendChild(svg);

    _applyColors();
  }

  function _applyColors() {
    const svg = document.getElementById('human-svg');
    if (!svg) return;

    svg.querySelectorAll('.body-skin').forEach(el  => el.setAttribute('fill', skinColor));
    svg.querySelectorAll('.body-dark').forEach(el  => el.setAttribute('fill', skinDark));
    svg.querySelectorAll('.body-hair').forEach(el  => el.setAttribute('fill', hairColor));
    svg.querySelectorAll('.body-eye').forEach(el   => el.setAttribute('fill', eyeColor));
    svg.querySelectorAll('.body-lip').forEach(el   => el.setAttribute('fill', lipColor));
    svg.querySelectorAll('.body-outline').forEach(el => el.setAttribute('stroke', skinDark));

    // Freckle color
    const freckleColor = _rgbDarken(_hexToRgb(skinColor), 0.65);
    svg.querySelectorAll('.freckle').forEach(el => el.setAttribute('fill', freckleColor));

    // Beard color
    svg.querySelectorAll('.beard').forEach(el => {
      el.setAttribute('fill', hairColor);
      el.setAttribute('opacity', '0.85');
    });
  }

  // ── THE SVG MODEL ──────────────────────────────────────────
  // A detailed anatomical human silhouette drawn with SVG paths.
  // viewBox 0 0 200 520 — proportioned anatomically.
  // Real production: load .glb via THREE.GLTFLoader instead.
  function _buildSVG(isFemale, classes, heightClass) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'human-svg');
    svg.setAttribute('viewBox', '0 0 200 520');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('class', [classes, heightClass].filter(Boolean).join(' '));

    // ── 1. LEGS ──────────────────────────────────────────────
    // Left leg (viewer's right)
    svg.innerHTML = `
    <defs>
      <radialGradient id="skinGrad" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${skinColor}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${skinDark}" stop-opacity="1"/>
      </radialGradient>
      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.3"/>
      </filter>
    </defs>

    <!-- ── LEGS ── -->
    <!-- Left thigh -->
    <path class="body-cloth" d="M 82 290 Q 78 310 76 340 Q 74 360 75 390 L 90 392 Q 92 360 93 340 Q 95 310 96 290 Z"/>
    <!-- Right thigh -->
    <path class="body-cloth" d="M 104 290 Q 108 310 110 340 Q 112 360 110 390 L 125 392 Q 124 360 122 340 Q 120 310 116 290 Z"/>

    <!-- Left shin -->
    <path class="body-cloth2" d="M 75 390 Q 73 415 72 440 Q 71 460 72 480 L 87 480 Q 87 460 88 440 Q 89 415 90 392 Z"/>
    <!-- Right shin -->
    <path class="body-cloth2" d="M 110 390 Q 112 415 113 440 Q 114 460 113 480 L 128 480 Q 127 460 126 440 Q 124 415 122 392 Z"/>

    <!-- Left foot -->
    <path class="body-cloth2" d="M 62 475 Q 60 480 60 486 Q 60 492 65 494 L 88 494 Q 90 494 90 492 L 90 480 Z" rx="4"/>
    <!-- Right foot -->
    <path class="body-cloth2" d="M 112 480 L 112 492 Q 112 494 114 494 L 138 494 Q 143 492 142 486 Q 142 480 140 475 Z" rx="4"/>

    <!-- Knee caps (subtle) -->
    <ellipse class="body-cloth" cx="82" cy="392" rx="8" ry="6"/>
    <ellipse class="body-cloth" cx="117" cy="392" rx="8" ry="6"/>

    <!-- ── PELVIS / HIPS ── -->
    ${isFemale ?
      `<path class="body-cloth2" d="M 72 270 Q 65 275 64 285 Q 63 295 70 300 L 130 300 Q 137 295 136 285 Q 135 275 128 270 Z"/>` :
      `<path class="body-cloth2" d="M 76 270 Q 72 278 72 288 Q 72 298 78 300 L 122 300 Q 128 298 128 288 Q 128 278 124 270 Z"/>`
    }

    <!-- ── TORSO ── -->
    ${isFemale ? `
      <!-- Female torso — hourglass -->
      <path class="body-cloth" d="M 76 175 Q 68 185 66 200 Q 64 215 66 228 Q 64 240 65 255 Q 66 265 72 270 L 128 270 Q 134 265 135 255 Q 136 240 134 228 Q 136 215 134 200 Q 132 185 124 175 Z"/>
      <!-- Waist nip -->
      <ellipse class="body-cloth" cx="100" cy="228" rx="30" ry="8" style="fill:rgba(0,0,0,0.05)"/>
    ` : `
      <!-- Male torso — wider shoulders, V-taper -->
      <path class="body-cloth" d="M 72 175 Q 66 188 65 205 Q 64 218 65 232 Q 65 250 68 265 Q 70 272 76 275 L 124 275 Q 130 272 132 265 Q 135 250 135 232 Q 136 218 135 205 Q 134 188 128 175 Z"/>
      <!-- Pec muscle hints -->
      <path class="body-cloth" style="fill:rgba(0,0,0,0.06)" d="M 70 195 Q 85 190 98 195 Q 100 210 95 220 Q 85 222 72 215 Z"/>
      <path class="body-cloth" style="fill:rgba(0,0,0,0.06)" d="M 130 195 Q 115 190 102 195 Q 100 210 105 220 Q 115 222 128 215 Z"/>
    `}

    <!-- ── SHOULDERS ── -->
    <ellipse class="body-cloth" cx="${isFemale ? 68 : 64}" cy="178" rx="${isFemale ? 12 : 14}" ry="10"/>
    <ellipse class="body-cloth" cx="${isFemale ? 132 : 136}" cy="178" rx="${isFemale ? 12 : 14}" ry="10"/>

    <!-- ── ARMS ── -->
    <!-- Left upper arm -->
    <path class="body-cloth" d="M ${isFemale?'60':'54'} 175 Q ${isFemale?'52':'44'} 185 ${isFemale?'50':'46'} 205 Q ${isFemale?'48':'44'} 220 ${isFemale?'50':'46'} 232 L ${isFemale?'60':'57'} 232 Q ${isFemale?'60':'57'} 220 ${isFemale?'62':'58'} 205 Q ${isFemale?'63':'58'} 185 ${isFemale?'70':'66'} 175 Z"/>
    <!-- Right upper arm -->
    <path class="body-cloth" d="M ${isFemale?'140':'146'} 175 Q ${isFemale?'148':'156'} 185 ${isFemale?'150':'154'} 205 Q ${isFemale?'152':'156'} 220 ${isFemale?'150':'154'} 232 L ${isFemale?'140':'143'} 232 Q ${isFemale?'140':'143'} 220 ${isFemale?'138':'142'} 205 Q ${isFemale?'137':'142'} 185 ${isFemale?'130':'134'} 175 Z"/>

    <!-- Left forearm (skin) -->
    <path class="body-skin body-region" d="M ${isFemale?'48':'43'} 232 Q ${isFemale?'45':'40'} 248 ${isFemale?'44':'39'} 262 Q ${isFemale?'43':'38'} 272 ${isFemale?'44':'39'} 280 L ${isFemale?'56':'53'} 280 Q ${isFemale?'57':'54'} 272 ${isFemale?'58':'55'} 262 Q ${isFemale?'59':'56'} 248 ${isFemale?'61':'59'} 232 Z"/>
    <!-- Right forearm (skin) -->
    <path class="body-skin body-region" d="M ${isFemale?'152':'157'} 232 Q ${isFemale?'155':'160'} 248 ${isFemale?'156':'161'} 262 Q ${isFemale?'157':'162'} 272 ${isFemale?'156':'161'} 280 L ${isFemale?'144':'147'} 280 Q ${isFemale?'143':'146'} 272 ${isFemale?'142':'145'} 262 Q ${isFemale?'141':'144'} 248 ${isFemale?'139':'141'} 232 Z"/>

    <!-- ── HANDS ── -->
    <!-- Left hand -->
    <g class="body-skin">
      <!-- Palm -->
      <rect class="body-dark" x="${isFemale?'40':'35'}" y="280" width="${isFemale?'17':'18'}" height="15" rx="4"/>
      <!-- Fingers -->
      ${_genFingers(isFemale ? 40 : 35, 295, -1, traits.polydactyly === 'six')}
    </g>
    <!-- Right hand -->
    <g class="body-skin">
      <rect class="body-dark" x="${isFemale?'143':'147'}" y="280" width="${isFemale?'17':'18'}" height="15" rx="4"/>
      ${_genFingers(isFemale ? 143 : 147, 295, 1, traits.polydactyly === 'six')}
    </g>

    <!-- ── NECK ── -->
    <path class="body-skin body-region" d="M ${isFemale?'91':'89'} 140 Q ${isFemale?'89':'87'} 145 ${isFemale?'89':'87'} 152 L ${isFemale?'111':'113'} 152 Q ${isFemale?'111':'113'} 145 ${isFemale?'109':'111'} 140 Z"/>
    <!-- Trapezius hints -->
    <path class="body-skin" d="M 89 148 Q 78 152 70 162 Q 75 165 82 163 Q 87 158 90 152 Z" style="opacity:0.7"/>
    <path class="body-skin" d="M 111 148 Q 122 152 130 162 Q 125 165 118 163 Q 113 158 110 152 Z" style="opacity:0.7"/>

    <!-- ── HEAD ── -->
    <!-- Skull base shape -->
    ${isFemale ?
      `<ellipse class="body-skin body-region" id="head-shape" cx="100" cy="100" rx="38" ry="45"/>` :
      `<ellipse class="body-skin body-region" id="head-shape" cx="100" cy="100" rx="40" ry="46"/>`
    }

    <!-- ── HAIR ── -->
    ${_buildHair(isFemale)}

    <!-- ── EARS ── -->
    <ellipse class="body-dark" cx="${isFemale?'63':'61'}" cy="102" rx="5" ry="9"/>
    <ellipse class="body-skin" cx="${isFemale?'63':'61'}" cy="102" rx="3.5" ry="7"/>
    <ellipse class="body-dark" cx="${isFemale?'137':'139'}" cy="102" rx="5" ry="9"/>
    <ellipse class="body-skin" cx="${isFemale?'137':'139'}" cy="102" rx="3.5" ry="7"/>
    <!-- Ear lobe morphs -->
    ${traits.earLobe === 'attached' ?
      `<ellipse class="body-skin" cx="${isFemale?'63':'61'}" cy="111" rx="3" ry="2"/>
       <ellipse class="body-skin" cx="${isFemale?'137':'139'}" cy="111" rx="3" ry="2"/>` :
      `<circle class="body-dark" cx="${isFemale?'63':'61'}" cy="112" r="3.5"/>
       <circle class="body-dark" cx="${isFemale?'137':'139'}" cy="112" r="3.5"/>`
    }

    <!-- ── BROWS ── -->
    ${traits.beardDensity === 'thick' || traits.beardDensity === 'medium' ?
      `<path class="body-hair" d="M 78 80 Q 88 77 92 79" stroke-width="${traits.beardDensity==='thick'?'4':'3'}" stroke="none" fill="none" style="stroke:${hairColor};stroke-width:${traits.beardDensity==='thick'?4:3};stroke-linecap:round"/>
       <path class="body-hair" d="M 108 79 Q 112 77 122 80" stroke-width="${traits.beardDensity==='thick'?'4':'3'}" stroke="none" fill="none" style="stroke:${hairColor};stroke-width:${traits.beardDensity==='thick'?4:3};stroke-linecap:round"/>` :
      `<path style="stroke:${hairColor};stroke-width:3;stroke-linecap:round;fill:none" d="M 79 82 Q 89 79 93 81"/>
       <path style="stroke:${hairColor};stroke-width:3;stroke-linecap:round;fill:none" d="M 107 81 Q 111 79 121 82"/>`
    }

    <!-- ── EYES ── -->
    <!-- Left eye socket -->
    <ellipse class="body-dark" cx="86" cy="97" rx="10" ry="7"/>
    <!-- Left sclera -->
    <ellipse fill="#f8f3ea" cx="86" cy="97" rx="8.5" ry="6"/>
    <!-- Left iris -->
    <ellipse class="body-eye" cx="86" cy="97" rx="5" ry="5"/>
    <!-- Left pupil -->
    <ellipse fill="#080808" cx="86" cy="97" rx="2.5" ry="2.5"/>
    <!-- Left cornea gloss -->
    <ellipse fill="rgba(255,255,255,0.35)" cx="84" cy="95" rx="1.5" ry="1.5"/>
    <!-- Left eyelids -->
    <path fill="${skinColor}" d="M 77 94 Q 86 90 95 94 Q 93 89 86 88 Q 79 89 77 94 Z"/>
    <path fill="${skinDark}" d="M 77 100 Q 86 104 95 100 Q 93 106 86 107 Q 79 106 77 100 Z" style="opacity:0.5"/>

    <!-- Right eye socket -->
    <ellipse class="body-dark" cx="114" cy="97" rx="10" ry="7"/>
    <!-- Right sclera -->
    <ellipse fill="#f8f3ea" cx="114" cy="97" rx="8.5" ry="6"/>
    <!-- Right iris -->
    <ellipse class="body-eye" cx="114" cy="97" rx="5" ry="5"/>
    <!-- Right pupil -->
    <ellipse fill="#080808" cx="114" cy="97" rx="2.5" ry="2.5"/>
    <!-- Right cornea gloss -->
    <ellipse fill="rgba(255,255,255,0.35)" cx="112" cy="95" rx="1.5" ry="1.5"/>
    <!-- Right eyelids -->
    <path fill="${skinColor}" d="M 105 94 Q 114 90 123 94 Q 121 89 114 88 Q 107 89 105 94 Z"/>
    <path fill="${skinDark}" d="M 105 100 Q 114 104 123 100 Q 121 106 114 107 Q 107 106 105 100 Z" style="opacity:0.5"/>

    <!-- ── NOSE ── -->
    ${_buildNose()}

    <!-- ── MOUTH ── -->
    ${_buildMouth()}

    <!-- ── CHIN ── -->
    ${traits.chinShape === 'cleft' ? `<line x1="100" y1="130" x2="100" y2="136" stroke="${skinDark}" stroke-width="1.5" stroke-linecap="round"/>` : ''}
    ${traits.chinShape === 'square' ? `<rect fill="none" stroke="${skinDark}" stroke-width="0.8" x="88" y="126" width="24" height="8" rx="2" style="opacity:0.2"/>` : ''}

    <!-- ── FRECKLES ── -->
    <circle class="freckle" cx="82" cy="94" r="1.2"/>
    <circle class="freckle" cx="90" cy="91" r="1.0"/>
    <circle class="freckle" cx="95" cy="95" r="1.3"/>
    <circle class="freckle" cx="78" cy="99" r="1.1"/>
    <circle class="freckle" cx="104" cy="93" r="1.2"/>
    <circle class="freckle" cx="112" cy="91" r="1.0"/>
    <circle class="freckle" cx="118" cy="95" r="1.1"/>
    <circle class="freckle" cx="121" cy="100" r="1.3"/>
    <circle class="freckle" cx="88" cy="105" r="1.0"/>
    <circle class="freckle" cx="100" cy="89" r="1.1"/>
    <circle class="freckle" cx="107" cy="103" r="1.2"/>
    <circle class="freckle" cx="75" cy="96" r="0.9"/>

    <!-- ── DIMPLES ── -->
    <circle class="dimple" cx="88" cy="122" r="2.5" fill="${skinDark}" style="opacity:0.5"/>
    <circle class="dimple" cx="112" cy="122" r="2.5" fill="${skinDark}" style="opacity:0.5"/>

    <!-- ── BEARD OVERLAY ── -->
    ${!isFemale ? `
    <path class="beard sparse medium thick" d="M 75 116 Q 80 125 87 130 Q 95 135 100 136 Q 105 135 113 130 Q 120 125 125 116 Q 118 120 113 124 Q 107 128 100 129 Q 93 128 87 124 Q 82 120 75 116 Z" opacity="0"/>
    <path class="beard medium thick" d="M 77 110 Q 76 118 78 126 Q 84 134 100 136 Q 116 134 122 126 Q 124 118 123 110 Q 118 115 113 120 Q 107 125 100 126 Q 93 125 87 120 Q 82 115 77 110 Z" opacity="0"/>
    <path class="beard thick" d="M 84 85 Q 80 90 79 98 Q 78 106 79 112 L 90 114 Q 89 106 90 98 Q 91 92 88 87 Z" opacity="0"/>
    <path class="beard thick" d="M 116 85 Q 120 90 121 98 Q 122 106 121 112 L 110 114 Q 111 106 110 98 Q 109 92 112 87 Z" opacity="0"/>
    <path class="beard medium thick" d="M 86 85 Q 93 82 100 82 Q 107 82 114 85 Q 110 83 100 83 Q 90 83 86 85 Z" style="stroke:${hairColor};stroke-width:2;fill:none" opacity="0"/>
    ` : ''}

    <!-- ── NASOLABIAL FOLD (subtle realism) ── -->
    <path fill="none" style="stroke:${skinDark};stroke-width:0.8;opacity:0.4;stroke-linecap:round" d="M 88 108 Q 85 114 87 119"/>
    <path fill="none" style="stroke:${skinDark};stroke-width:0.8;opacity:0.4;stroke-linecap:round" d="M 112 108 Q 115 114 113 119"/>

    <!-- ── AMBIENT BODY SHADOW (depth) ── -->
    <ellipse cx="100" cy="500" rx="55" ry="8" fill="rgba(0,0,0,0.2)"/>
    `;

    return svg;
  }

  function _buildHair(isFemale) {
    const type = traits.hairTexture || 'wavy';
    const isBald = traits.baldness === 'bald';
    const isThin = traits.baldness === 'thinning';

    if (isBald) {
      // Just skull, no hair cap
      return `<ellipse class="body-skin" cx="100" cy="68" rx="${isFemale?35:37}" ry="28" style="opacity:0.5"/>`;
    }

    const hairCap = isFemale ?
      `<ellipse class="body-hair" cx="100" cy="68" rx="38" ry="30"/>
       <rect class="body-hair" x="62" y="68" width="76" height="20"/>` :
      `<ellipse class="body-hair" cx="100" cy="68" rx="40" ry="28"/>
       <rect class="body-hair" x="60" y="68" width="80" height="18"/>`;

    if (isThin) {
      return `${hairCap}<ellipse fill="${skinColor}" cx="100" cy="70" rx="25" ry="18" style="opacity:0.7"/>`;
    }

    if (type === 'straight') {
      const sideHair = isFemale ?
        `<path class="body-hair" d="M 62 68 Q 54 80 52 110 Q 50 140 55 160 L 62 160 Q 58 140 60 110 Q 62 80 66 68 Z"/>
         <path class="body-hair" d="M 138 68 Q 146 80 148 110 Q 150 140 145 160 L 138 160 Q 142 140 140 110 Q 138 80 134 68 Z"/>` :
        `<path class="body-hair" d="M 60 68 Q 54 78 54 95 Q 54 110 58 118 L 65 118 Q 62 110 62 95 Q 62 78 66 68 Z"/>
         <path class="body-hair" d="M 140 68 Q 146 78 146 95 Q 146 110 142 118 L 135 118 Q 138 110 138 95 Q 138 78 134 68 Z"/>`;
      return hairCap + sideHair;
    }

    if (type === 'curly' || type === 'coiled') {
      const curlSize = type === 'coiled' ? 6 : 8;
      const curls = Array.from({length: type === 'coiled' ? 22 : 16}, (_, i) => {
        const angle = (i / (type === 'coiled' ? 22 : 16)) * Math.PI * 2;
        const r = type === 'coiled' ? 42 : 38;
        const cx = 100 + Math.cos(angle) * r * 0.7;
        const cy = 68  + Math.sin(angle) * r * 0.65 - 5;
        return `<circle class="body-hair" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${curlSize - Math.random()*2}"/>`;
      }).join('');
      return hairCap + curls;
    }

    // Wavy
    const waveLines = isFemale ?
      `<path class="body-hair" d="M 62 68 Q 56 85 54 110 Q 52 130 55 155 Q 56 165 58 175 L 65 175 Q 63 165 64 155 Q 62 130 64 110 Q 66 85 68 68 Z"/>
       <path class="body-hair" d="M 138 68 Q 144 85 146 110 Q 148 130 145 155 Q 144 165 142 175 L 135 175 Q 137 165 136 155 Q 138 130 136 110 Q 134 85 132 68 Z"/>
       <!-- Wavy ends -->
       <path class="body-hair" d="M 55 155 Q 52 165 56 175 Q 53 165 58 175" style="fill:none;stroke:${hairColor};stroke-width:6;stroke-linecap:round"/>` :
      `<path class="body-hair" d="M 60 68 Q 55 80 53 100 Q 51 118 55 130 L 62 130 Q 59 118 61 100 Q 63 80 67 68 Z"/>
       <path class="body-hair" d="M 140 68 Q 145 80 147 100 Q 149 118 145 130 L 138 130 Q 141 118 139 100 Q 137 80 133 68 Z"/>`;

    return hairCap + waveLines;
  }

  function _buildNose() {
    const broad   = traits.noseShape === 'broad';
    const narrow  = traits.noseShape === 'narrow';
    const upturn  = traits.noseShape === 'upturned';
    const nw = broad ? 1.6 : narrow ? 0.65 : 1.0;
    const tipY = upturn ? 116 : 120;
    const bw = 7 * nw;

    return `
    <!-- Nose bridge -->
    <path fill="none" style="stroke:${skinDark};stroke-width:${narrow?1.2:1.8};opacity:0.4;stroke-linecap:round" d="M 100 84 Q ${98 + (narrow?1:-1)} 105 ${100-bw*0.3} ${tipY}"/>
    <path fill="none" style="stroke:${skinDark};stroke-width:${narrow?1.2:1.8};opacity:0.4;stroke-linecap:round" d="M 100 84 Q ${102 - (narrow?1:-1)} 105 ${100+bw*0.3} ${tipY}"/>
    <!-- Nose tip -->
    <ellipse class="body-dark" cx="100" cy="${tipY}" rx="${bw*0.8}" ry="${4*nw*0.8}"/>
    <!-- Nostrils -->
    <ellipse class="body-dark" cx="${100-bw*0.65}" cy="${tipY+1}" rx="${3.5*nw*0.85}" ry="${2.5*nw*0.75}"/>
    <ellipse class="body-dark" cx="${100+bw*0.65}" cy="${tipY+1}" rx="${3.5*nw*0.85}" ry="${2.5*nw*0.75}"/>
    <!-- Nostril holes -->
    <ellipse fill="${skinDark}" cx="${100-bw*0.65}" cy="${tipY+1}" rx="${2*nw*0.8}" ry="${1.5*nw*0.7}" style="opacity:0.6"/>
    <ellipse fill="${skinDark}" cx="${100+bw*0.65}" cy="${tipY+1}" rx="${2*nw*0.8}" ry="${1.5*nw*0.7}" style="opacity:0.6"/>
    `;
  }

  function _buildMouth() {
    const full  = traits.mouthShape === 'full';
    const thin  = traits.mouthShape === 'thin';
    const cupid = traits.mouthShape === 'cupid';

    const uLipH = full ? 6 : thin ? 3 : 4.5;
    const lLipH = full ? 8 : thin ? 4 : 6;
    const mouthW = full ? 20 : thin ? 14 : 18;

    const upperLip = cupid ?
      `<path class="body-lip" d="M ${100-mouthW} 124 Q ${100-mouthW*0.5} ${124-uLipH*1.2} ${100} ${124-uLipH*0.4} Q ${100+mouthW*0.5} ${124-uLipH*1.2} ${100+mouthW} 124 Q ${100} ${124+uLipH*0.4} ${100-mouthW} 124 Z"/>` :
      `<ellipse class="body-lip" cx="100" cy="${124-uLipH*0.3}" rx="${mouthW}" ry="${uLipH}"/>`;

    return `
    <!-- Mouth line -->
    <path fill="none" style="stroke:${skinDark};stroke-width:1.2;stroke-linecap:round;opacity:0.7" d="M ${100-mouthW} 124 Q 100 ${124 + (full?2:1)} ${100+mouthW} 124"/>
    <!-- Upper lip -->
    ${upperLip}
    <!-- Lower lip -->
    <ellipse class="body-lip" cx="100" cy="${124+lLipH*0.6}" rx="${mouthW*1.05}" ry="${lLipH}"/>
    <!-- Philtrum -->
    <path fill="none" style="stroke:${skinDark};stroke-width:1;opacity:0.3;stroke-linecap:round" d="M 97 110 L 97 122 M 103 110 L 103 122"/>
    <!-- Corner shadows -->
    <circle fill="${skinDark}" cx="${100-mouthW}" cy="124" r="1.5" style="opacity:0.4"/>
    <circle fill="${skinDark}" cx="${100+mouthW}" cy="124" r="1.5" style="opacity:0.4"/>
    `;
  }

  function _genFingers(palmX, palmY, dir, six) {
    // dir: -1 = left hand, 1 = right hand
    const count = six ? 6 : 5;
    const positions = six ?
      [-7, -3.5, 0, 3.5, 7, 10.5] :
      [-6, -2.5, 1, 4.5, 8];
    const lengths = six ?
      [10, 13, 14, 12, 10, 8] :
      [10, 13, 14, 12, 10];

    return positions.slice(0, count).map((ox, i) => {
      const fx = palmX + 2 + ox + (dir > 0 ? 5 : 0);
      const fy = palmY;
      const fl = lengths[i];
      const cls = i === count-1 && six ? 'finger-6 body-skin' : 'body-skin';
      return `
        <rect class="${cls}" x="${fx}" y="${fy}" width="2.8" height="${fl}" rx="1.4"/>
        <rect class="${cls}" fill="${skinDark}" x="${fx+0.4}" y="${fy}" width="2" height="1.2" rx="0.6" style="opacity:0.5"/>
      `;
    }).join('');
  }

  // ── Helpers ─────────────────────────────────────────────────
  function _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  }

  function _rgbDarken({r,g,b}, factor) {
    return `#${Math.round(r*factor).toString(16).padStart(2,'0')}${Math.round(g*factor).toString(16).padStart(2,'0')}${Math.round(b*factor).toString(16).padStart(2,'0')}`;
  }

  return { init, setTraits, setSex, setView, render };
})();
