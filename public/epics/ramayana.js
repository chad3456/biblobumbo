/* Ramayana: 25 moments, composed for the Epic Painter engine. */
(function () {
  'use strict';
  const { W, H, mix, lite, dark } = Epic;
  // recurring cast
  const RAMA = { skin: '#5f86b8', cloth: '#f0b93a', cloth2: '#e8703a', crown: 'bun', hair: '#1f1a2a', thread: true };
  const RAMA_K = Object.assign({}, RAMA, { crown: 'mukut' });
  const LAK = { skin: '#e0b287', cloth: '#5d8fb5', cloth2: '#f0b93a', crown: 'bun', hair: '#1f1a2a' };
  const SITA = { skin: '#e7b991', robe: '#d9483b', drape: '#f0b93a', longhair: true, crown: 'none', hair: '#1f1a2a', sash: false, aN: [14, 40], aF: [-6, 20] };
  const HANU = { kind: 'vanara', skin: '#d99a52', cloth: '#c8452f', cloth2: '#f0b93a', tail: true, crown: 'mukut', broad: 1.25 };
  const VAN = { kind: 'vanara', skin: '#b98455', cloth: '#7d8f5a', cloth2: '#d6a44a', tail: true, crown: 'none', plain: true, broad: 1.15 };
  const RAVAN = { skin: '#8f6f9c', cloth: '#6b2f4f', cloth2: '#c9463a', heads: 4, broad: 1.45, fangs: true, hair: '#1a1220', gold: '#f2c85a' };
  const SAGE = { skin: '#c99772', robe: '#e88f3c', crown: 'bun', hair: '#e9e4dc', beard: '#f1ece4', sash: false, plain: true, band: '#8a5a3a' };
  const KING = { skin: '#d9a77c', robe: '#8f3f5a', drape: '#f0c85a', crown: 'mukut', sash: false, beard: '#e9e4dc', beardLen: 1.8 };
  const ARCH = { lN: [18, 4], lF: [-12, -6], aF: [88, 90], aN: [100, -70] };
  const PRAY = { aN: [38, 128], aF: [32, 122] };
  const KNEEL = { lN: [85, -5], lF: [0, -90] };
  const SIT = { lN: [78, -72], lF: [62, -84], sash: false };
  const WALK = { lN: [22, 5], lF: [-20, -26] };
  const F = (p, x, y, h, base, ...ex) => p.figure(x, y, h, Object.assign({}, base, ...ex));
  const scr = (p, fn) => { p.c.globalCompositeOperation = 'screen'; fn(); p.c.globalCompositeOperation = 'source-over'; };
  const fg = (p, seed, col, y) => { p.ridge({ y: (y || 852) - 6, amp: 16, col: col || '#2a1c30', seed: seed, freq: 0.0035 }); p.grass(0, W, (y || 852) - 12, 26, col || '#2a1c30', 150); };
  function vimana(p, x, y, s, f) {
    p.wing(x - f * s * 0.3, y, x - f * s * 1.25, y - s * 0.55, s * 0.34, '#f3e2bd', '#e8a33a'); p.wing(x + f * s * 0.3, y, x + f * s * 1.15, y - s * 0.7, s * 0.34, '#fff3d6', '#e8a33a');
    p.poly([[x - s * 0.75, y - s * 0.02], [x + s * 0.75, y - s * 0.02], [x + s * 0.5, y + s * 0.18], [x - s * 0.5, y + s * 0.18]], '#a8763a'); p.rect(x - s * 0.78, y - s * 0.06, s * 1.56, s * 0.06, '#f6d77a');
    p.shikhara(x - s * 0.5, y - s * 0.05, s * 0.2, s * 0.6, '#d9a84e', '#fff0b0'); p.shikhara(x + s * 0.5, y - s * 0.05, s * 0.2, s * 0.6, '#d9a84e', '#fff0b0');
    p.pavilion(x, y - s * 0.05, s * 0.8, s * 0.9, '#e9c56a', '#fff0b0');
    p.ribbon([[x - f * s * 0.75, y - s * 0.3], [x - f * s * 1.1, y - s * 0.4], [x - f * s * 1.4, y - s * 0.22], [x - f * s * 1.75, y - s * 0.34]], s * 0.13, '#e8703a');
    p.clouds({ n: 3, x0: x - s * 0.6, x1: x + s * 0.6, y0: y + s * 0.22, y1: y + s * 0.3, size: s * 0.24, col: '#fff3e0', shadow: '#c9a7c4' });
  }
  function boat(p, x, y, w, col) { p.blob([[x - w / 2, y - w * 0.08], [x - w * 0.3, y + w * 0.06], [x + w * 0.3, y + w * 0.06], [x + w / 2, y - w * 0.1], [x + w * 0.35, y - w * 0.02], [x - w * 0.35, y - w * 0.02]], col); p.line(x - w * 0.4, y + w * 0.07, x + w * 0.4, y + w * 0.07, 3, '#fff3d6', 0.6); }
  function hut(p, x, y, s) { p.poly([[x - s * 0.5, y], [x - s * 0.5, y - s * 0.45], [x, y - s * 0.75], [x + s * 0.5, y - s * 0.45], [x + s * 0.5, y]], '#b08a5e'); p.poly([[x - s * 0.62, y - s * 0.4], [x, y - s * 0.85], [x + s * 0.62, y - s * 0.4], [x + s * 0.5, y - s * 0.36], [x, y - s * 0.72], [x - s * 0.5, y - s * 0.36]], '#8a6a48'); p.rect(x - s * 0.1, y - s * 0.32, s * 0.22, s * 0.32, '#4a3830'); }
  const S = [];

  // 1
  S.push({
    title: 'The First Verse', kanda: 'Bala Kanda', seed: 101, light: 1,
    text: 'On the bank of the Tamasa a hunter fells one of two loving krauncha birds. From the grief of the sage Valmiki the first shloka is born, and with it the Ramayana.',
    draw(p) {
      p.sky(['#9fb0d8', '#d2c8e4', '#f6d8c6', '#fbe9c0']); p.sun(1380, 430, 52, '#fff3c8', '#ffd9a8'); p.rays(1380, 430, 24, 1500, '#fff0c8', 0.15);
      p.clouds({ n: 6, y0: 60, y1: 280, size: 150, col: '#fbeee6', shadow: '#b3a8d4' }); p.streaks({ n: 12, y0: 320, y1: 470, col: '#fff3de' });
      p.ridge({ y: 500, amp: 70, col: '#b9b3d6', col2: '#d6c6d8', seed: 2 }); p.ridge({ y: 540, amp: 40, col: '#a9b6b8', col2: '#c8cdb8', seed: 5 });
      p.forest({ x0: 0, x1: W, base: 572, jit: 6, h: 100, n: 34, col: '#93ad98', col2: '#a9b890', trunk: '#8a7a78' });
      p.sea(575, '#dfe0d6', '#7fa6b2', '#fff6dc', 1380, 760); p.fade('#f8e6cc', 0.22, 470, 650);
      // the two cranes
      scr(p, () => p.glow(980, 250, 380, '#fff3d0', 0.6));
      p.eagle(800, 250, 330, { f: 1, col: '#f3ede4', head: '#d9483b', gold: '#e8b84a', tip: '#3a3550', up: 0.7, crane: true });
      p.eagle(1230, 400, 270, { f: -1, col: '#e9e2da', head: '#d9483b', gold: '#e8b84a', tip: '#3a3550', up: -0.3, crane: true }); p.arrow(1440, 660, 1238, 404, '#4a3830', 4);
      for (let i = 0; i < 16; i++) p.ell(p.rr(1100, 1330), p.rr(420, 640), 10, 4, '#fbf6ee', 0.9, p.rr(0, 3));
      const g = p.ridge({ y: 760, amp: 30, col: '#b9b078', col2: '#6a7250', seed: 8, freq: 0.004, tilt: -0.03 });
      hut(p, 300, g(300) + 6, 190); p.forest({ x0: 60, x1: 620, base: g, h: 260, n: 5, col: '#6f9478', col2: '#8fa468', trunk: '#4a3a3a', flowers: '#f6cfd8' });
      p.rock(980, g(980) + 14, 240, 70, '#7a6a72');
      F(p, 990, g(990) - 48, 150, SAGE, { f: 1, aN: [120, 150], aF: [20, 60] });
      F(p, 1500, g(1500) + 4, 110, { skin: '#8a5a44', cloth: '#5a4a3a', crown: 'bun', plain: true, sash: false }, ARCH, { f: -1, prop: { type: 'bow', hand: 'F', ang: 150 } });
      p.grass(0, W, g, 30, '#8f9a58', 180); p.tree(1900, 900, 880, { col: '#3f5a48', trunk: '#241a26', spread: 0.3 }); fg(p, 3); p.birds(9, 200, 100, 700, 330, '#6a5f80', 7);
    }
  });
  // 2
  S.push({
    title: 'The Gift of the Fire', kanda: 'Bala Kanda', seed: 102, light: -1,
    text: 'King Dasharatha, childless, performs the great sacrifice. Out of the flames rises a radiant being bearing a golden vessel of payasam: the promise of four sons.',
    draw(p) {
      p.sky(['#2f2446', '#5e3f66', '#b06a5c', '#f0b26a']); p.stars(120, 300);
      p.city({ x0: 100, x1: 1900, base: 640, h: 330, n: 16, col: '#6a4a70', col2: '#8a5a6a', gold: '#d9a85a' }); p.fade('#a8605a', 0.4);
      for (const x of [420, 640, 1360, 1580]) p.pillar(x, 700, 70, 560, '#8a6276'); p.rect(380, 120, 1240, 50, '#7a5670'); p.fade('#c9805e', 0.22);
      p.rect(0, 690, W, 170, '#7a5262'); for (let i = 0; i < 5; i++) p.rect(700 - i * 30, 700 - i * 22 + 66, 600 + i * 60, 24, i % 2 ? '#b9806a' : '#9a6a62');
      scr(p, () => { p.glow(1000, 380, 700, '#ffb45a', 0.75); p.rays(1000, 420, 30, 1300, '#ffd28a', 0.2); });
      p.fire(1000, 660, 330, 470); p.smoke(1000, 220, 120, 260, '#6a4a6a', 0.2);
      const J = F(p, 1000, 420, 520, { skin: '#fbc25a', cloth: '#e2592a', cloth2: '#ffe38a', gold: '#fff0a8', hair: '#c9462a', halo: '#fff0b0', haloR: 8, fly: true, f: -1, aN: [62, 96], aF: [56, 92], lN: [4, 0], lF: [-6, 0] });
      p.fire(1000, 690, 300, 330); scr(p, () => p.glow(J.hN[0] - 20, J.hN[1], 150, '#fff3b0', 0.9));
      p.ell(J.hN[0] - 26, J.hN[1] - 4, 54, 22, '#f6d36a'); p.ell(J.hN[0] - 26, J.hN[1] - 12, 44, 12, '#fff6d0');
      F(p, 650, 742, 130, KING, KNEEL, { f: 1, aN: [110, 140], aF: [100, 134] });
      for (const [x, s] of [[1330, -1], [1420, -1], [1500, -1], [520, 1]]) F(p, x, 748, 110, SAGE, SIT, PRAY, { f: s });
      p.crowd({ x0: 0, x1: 380, y: 760, jit: 20, h: 70, n: 14, col: '#4a3350', col2: '#7a4a5a' }); p.crowd({ x0: 1640, x1: W, y: 760, jit: 20, h: 70, n: 14, col: '#4a3350', col2: '#7a4a5a' });
      p.pillar(90, 900, 150, 900, '#3a2840'); p.pillar(1910, 900, 150, 900, '#3a2840'); fg(p, 4, '#241628', 866);
    }
  });
  // 3
  S.push({
    title: 'Tataka in the Dark Forest', kanda: 'Bala Kanda', seed: 103, light: 1,
    text: 'The sage Vishwamitra leads the boy princes into a forest laid waste by the demoness Tataka. She rises above the trees, and young Rama strings his bow for the first time in war.',
    draw(p) {
      p.sky(['#2a3350', '#4a5a78', '#8a9a9a', '#cfd0a8']); p.sun(1600, 180, 60, '#f6f1d0', '#cfd6b0'); p.stars(60, 250);
      p.clouds({ n: 6, y0: 40, y1: 260, size: 170, col: '#6a7690', shadow: '#333c58', light: '#b9c2b8' });
      p.ridge({ y: 520, amp: 90, col: '#55687a', col2: '#6f8088', seed: 7 }); p.forest({ x0: -50, x1: W, base: 610, jit: 14, h: 300, n: 18, col: '#4f6a70', col2: '#5f7868', trunk: '#3a4050' }); p.fade('#8fa0a0', 0.3);
      F(p, 760, 800, 700, { skin: '#4f7a7a', robe: '#3a2f4a', drape: '#6a3a4a', crown: 'horns', hair: '#16121e', longhair: true, fangs: true, gold: '#b9a05a', broad: 1.3, sash: false, f: 1, lean: 14, aN: [70, 110], aF: [110, 140], head: 10 });
      scr(p, () => { p.glow(805, 190, 60, '#ffd95a', 0.9); });
      p.fade('#6f8a8a', 0.3); p.forest({ x0: -50, x1: W, base: 700, jit: 16, h: 380, n: 9, col: '#3f5a55', col2: '#4f6850', trunk: '#2a2a38' });
      p.rays(1600, 180, 16, 1500, '#e9f0c8', 0.14, 100, 190);
      const g = p.ridge({ y: 740, amp: 22, col: '#6a7a5a', col2: '#3f4a40', seed: 3, freq: 0.004 });
      const R = F(p, 1380, 742, 120, RAMA, ARCH, { f: -1, lean: -10, aF: [118, 122], aN: [120, -50], prop: { type: 'bow', hand: 'F', ang: 205, drawn: true, glow: '#fff0a0' } });
      F(p, 1460, 746, 112, LAK, { f: -1, prop: { type: 'bow', hand: 'N', ang: 175 } }); F(p, 1560, 750, 135, SAGE, { f: -1, aN: [100, 110], prop: { type: 'staff', hand: 'F', ang: 180, len: 0.4 } });
      p.grass(900, W, g, 26, '#7a8a5a', 120); p.tree(120, 920, 980, { col: '#263a38', trunk: '#17131e', spread: 0.3 }); p.tree(1900, 930, 900, { col: '#2a3f3a', trunk: '#17131e' }); fg(p, 5, '#17131e'); p.birds(14, 300, 60, 1300, 300, '#1c1826', 9);
    }
  });
  // 4
  S.push({
    title: 'Ahalya Released', kanda: 'Bala Kanda', seed: 104, light: -1,
    text: 'In a silent, abandoned hermitage Ahalya has waited for ages, turned to stone by a curse. At the touch of Rama she rises again, shining like the moon freed from mist.',
    draw(p) {
      p.sky(['#bfd0cf', '#dfe6cf', '#f6f0cf', '#f3e6b8']); p.sun(520, 200, 56, '#fffbe0', '#fff0b8');
      p.ridge({ y: 470, amp: 110, col: '#bccfc0', col2: '#d6dcc0', seed: 12 }); p.forest({ x0: -50, x1: W, base: 590, jit: 14, h: 330, n: 16, col: '#a8c2a8', col2: '#bccb9f', trunk: '#9a8f8a', flowers: '#f8d6e0' }); p.fade('#f3ecc8', 0.4);
      p.rays(520, 200, 22, 1600, '#fff8d0', 0.24, -10, 120);
      const g = p.ridge({ y: 700, amp: 24, col: '#b7c486', col2: '#7f9060', seed: 6, freq: 0.004 });
      hut(p, 1560, g(1560) + 4, 260); p.forest({ x0: 1300, x1: 1960, base: g, h: 330, n: 4, col: '#7fa27a', col2: '#96aa6a', trunk: '#5a4a48', flowers: '#f6c6d6' });
      // the rock and the rising woman
      p.rock(960, 720, 330, 150, '#9a9a9a'); p.rock(840, 730, 160, 80, '#8a8c90');
      scr(p, () => { p.glow(980, 430, 420, '#fffbe0', 0.9); p.rays(980, 470, 20, 700, '#fff8d8', 0.3); });
      F(p, 980, 610, 380, { skin: '#f7ead8', robe: '#fbf3e4', drape: '#f6e2b8', longhair: true, hair: '#d9d0c8', crown: 'none', gold: '#fff0b8', sash: false, f: -1, aN: [40, 120], aF: [34, 116], halo: '#fffbe0', haloR: 7, head: -8 });
      p.rock(980, 730, 260, 96, '#a7a7a4'); for (let i = 0; i < 60; i++) p.rect(p.rr(800, 1160), p.rr(250, 690), p.rr(3, 9), p.rr(3, 9), '#fffbe0', p.rr(0.5, 1));
      F(p, 640, g(640) + 4, 135, RAMA, { f: 1, aN: [60, 85], lean: 8 }); F(p, 550, g(550) + 6, 125, LAK, PRAY, { f: 1 }); F(p, 450, g(450) + 8, 140, SAGE, { f: 1, prop: { type: 'staff', hand: 'N', ang: 180, len: 0.4 } });
      p.grass(0, W, g, 28, '#93a560', 200); for (let i = 0; i < 40; i++) p.circ(p.rr(0, W), p.rr(720, 820), p.rr(3, 6), p.r() < 0.5 ? '#f8d6e0' : '#fff6d0');
      p.tree(70, 900, 900, { col: '#4a6a4f', trunk: '#2a2028', spread: 0.3, flowers: '#f2b8c8' }); fg(p, 7, '#2a2a2c');
    }
  });
  // 5
  S.push({
    title: "The Breaking of Shiva's Bow", kanda: 'Bala Kanda', seed: 105, light: -1,
    text: 'In the court of Mithila no king could even lift the bow of Shiva. Rama raises it, strings it, and it breaks with a sound like the splitting of a mountain. Sita stands waiting with the garland.',
    draw(p) {
      p.sky(['#d9c7de', '#f0d8d0', '#fbe6c4', '#f6dcae']);
      p.city({ x0: 0, x1: W, base: 600, h: 420, n: 18, col: '#d6bfd0', col2: '#e6cfc0', gold: '#f6e0a0' }); p.fade('#f6e2cc', 0.5);
      for (const x of [250, 520, 1480, 1750]) p.pillar(x, 690, 90, 640, '#e0c6b8'); p.rect(180, 30, 1640, 60, '#d6b6a8'); p.fade('#f8e4c8', 0.25);
      for (let i = 0; i < 9; i++) p.ribbon([[200 + i * 200, 90], [240 + i * 200, 190], [200 + i * 200, 290], [250 + i * 200, 380]], 44, i % 2 ? '#e8703a' : '#f0b93a', 0.85);
      p.rect(0, 690, W, 170, '#caa890'); p.rect(560, 700, 880, 50, '#e6c8a8'); p.rect(600, 680, 800, 24, '#f0d8b8');
      p.crowd({ x0: 0, x1: 540, y: 716, jit: 20, h: 82, n: 34, col: '#8a5a7a', col2: '#c98a5a', spears: 0.15, banners: 0.08, bannerCol: '#d9483b' }); p.crowd({ x0: 1480, x1: W, y: 716, jit: 20, h: 82, n: 34, col: '#5a6a9a', col2: '#c98a5a', spears: 0.15, banners: 0.08, bannerCol: '#f0b93a', dir: -1 });
      // the colossal bow
      scr(p, () => { p.glow(1005, 420, 520, '#fff6d0', 0.95); p.rays(1005, 420, 34, 1400, '#fff3c0', 0.3); });
      p.curve([[990, 420], [900, 300], [820, 170], [860, 20]], 34, '#b8863a'); p.curve([[990, 420], [900, 300], [820, 170], [860, 20]], 12, '#ffe9a0');
      p.curve([[1030, 440], [1180, 520], [1330, 560], [1500, 500]], 34, '#b8863a'); p.curve([[1030, 440], [1180, 520], [1330, 560], [1500, 500]], 12, '#ffe9a0');
      p.curve([[860, 20], [930, 200], [900, 330]], 3, '#fff6dc'); p.curve([[1500, 500], [1380, 470], [1250, 500]], 3, '#fff6dc');
      for (let i = 0; i < 9; i++) { const a = p.rr(0, 6.28), l = p.rr(160, 420); p.curve([[1005, 425], [1005 + Math.cos(a) * l * 0.5 + p.rr(-30, 30), 425 + Math.sin(a) * l * 0.5 + p.rr(-30, 30)], [1005 + Math.cos(a) * l, 425 + Math.sin(a) * l]], 4, '#fffbe6'); }
      F(p, 1005, 682, 300, RAMA, { f: 1, lN: [20, 4], lF: [-22, -8], aN: [160, 176], aF: [128, 150], lean: -4, halo: '#fff3c0' });
      F(p, 1330, 700, 150, SITA, { f: -1, aN: [60, 96], aF: [50, 92] }); p.curve([[1262, 610], [1240, 640], [1262, 668]], 9, '#f6a03a');
      F(p, 1420, 704, 165, KING, { f: -1, aN: [120, 150] }); F(p, 700, 704, 150, SAGE, { f: 1 }); F(p, 620, 704, 140, LAK, { f: 1, aN: [130, 160] });
      p.pillar(60, 900, 170, 900, '#7a5a6a'); p.pillar(1940, 900, 170, 900, '#7a5a6a'); fg(p, 8, '#4a3442', 870);
    }
  });
  // 6
  S.push({
    title: 'The Road Out of Ayodhya', kanda: 'Ayodhya Kanda', seed: 106, light: 1,
    text: 'To keep his father\'s word Rama gives up the throne for fourteen years of forest exile. Sita and Lakshmana go with him, and the whole city follows the chariot weeping.',
    draw(p) {
      p.sky(['#8f9fd0', '#c9bfe0', '#f6cfc0', '#fbe2b0']); p.sun(1700, 380, 56, '#fff3c8', '#ffd4a0'); p.rays(1700, 380, 22, 1700, '#ffe9c0', 0.18, 90, 270);
      p.clouds({ n: 7, y0: 40, y1: 260, size: 160, col: '#f6e2e0', shadow: '#a89cc8' });
      p.ridge({ y: 560, amp: 40, col: '#b9aacb', col2: '#d6bfc8', seed: 3 });
      const hill = p.ridge({ y: 620, amp: 26, col: '#c9b0a8', col2: '#b89a8a', seed: 9, peak: [1500, 520, 110] });
      p.city({ x0: 1020, x1: 2040, base: hill, h: 380, n: 34, col: '#e9cfa0', col2: '#d6a8a8', gold: '#fff0b0', peakX: 1560, peakW: 330 }); p.wall(980, W, 640, 60, '#d6b898');
      p.gopuram(1010, 646, 130, 250, '#d9b890', '#fff0b0'); p.fade('#f8dcc0', 0.22);
      for (let i = 0; i < 7; i++) p.ribbon([[1100 + i * 130, 330 + p.rr(-60, 60)], [1040 + i * 130, 300], [960 + i * 130, 340], [880 + i * 130, 300]], 30, i % 2 ? '#e8703a' : '#f0c85a', 0.85);
      const g = p.ridge({ y: 720, amp: 16, col: '#d6bf8a', col2: '#9a8a62', seed: 4, freq: 0.003 });
      p.poly([[1000, 650], [1060, 650], [700, 860], [80, 860]], '#ead6a8', 0.9);
      p.crowd({ x0: 760, x1: 1500, y: 700, jit: 34, h: 56, n: 150, col: '#a86a6a', col2: '#e0b070', arms: 0.4, banners: 0.03 });
      const d = p.chariot(520, 760, 150, { f: -1, col: '#a8703a', horse: '#fbf3e6', canopyCol: '#d9483b' });
      F(p, d.x - 20, d.y, 150, RAMA, { f: -1, back: false, aN: [20, 60] }); F(p, d.x + 36, d.y, 132, SITA, { f: -1 }); F(p, d.x + 86, d.y, 142, LAK, { f: 1, aN: [100, 130] });
      p.forest({ x0: -40, x1: 300, base: 730, jit: 30, h: 420, n: 5, col: '#5f8068', col2: '#7a9060', trunk: '#3a2a30' }); p.grass(0, W, 790, 30, '#a89a5a', 120);
      F(p, 1240, 800, 150, KING, { f: -1, aN: [110, 150], aF: [100, 140], lean: 18, lN: [30, 0], lF: [-10, -40] }); p.birds(12, 300, 120, 1000, 380, '#5a4f77', 8); fg(p, 2, '#3a2a36', 866);
    }
  });
  // 7
  S.push({
    title: 'Crossing the Ganga', kanda: 'Ayodhya Kanda', seed: 107, light: -1,
    text: 'Guha, king of the forest people, ferries the exiles across the Ganga at dusk. On the far bank the kingdom ends and the wilderness begins.',
    draw(p) {
      p.sky(['#5a5a9a', '#9a7fb8', '#f0a890', '#fbd89a']); p.sun(640, 470, 64, '#fff0c0', '#ffc890'); p.stars(50, 200);
      p.clouds({ n: 7, y0: 60, y1: 300, size: 170, col: '#e8b8b8', shadow: '#7a6aa8', light: '#ffe2b8' }); p.streaks({ n: 14, y0: 330, y1: 470, col: '#ffe0c0' });
      p.ridge({ y: 500, amp: 70, col: '#8a7ab0', col2: '#b890b0', seed: 5, peak: [1500, 300, 120] }); p.ridge({ y: 520, amp: 24, col: '#6f6a98', seed: 11 });
      p.forest({ x0: 0, x1: W, base: 536, jit: 6, h: 90, n: 40, col: '#5f6a8a', col2: '#6f7a80', trunk: '#4a4a66' });
      p.sea(540, '#f6c8a8', '#5f6aa0', '#fff0c8', 640); p.fade('#f0b8a0', 0.2, 440, 640);
      // faint river goddess in the afterglow
      scr(p, () => { p.glow(1400, 330, 380, '#ffe0d0', 0.5); });
      p.c.globalAlpha = 0.5; F(p, 1400, 560, 520, { skin: '#f6dcd8', robe: '#e6d0e6', drape: '#fbeede', longhair: true, hair: '#c9b8d8', crown: 'mukut', gold: '#fff3d0', sash: false, f: -1, aN: [50, 110], aF: [40, 104], halo: '#fff3e0' }); p.c.globalAlpha = 1;
      p.fade('#e8b0a8', 0.25, 380, 660);
      boat(p, 900, 660, 330, '#5a3f3a'); p.ell(900, 690, 220, 10, '#3f3a66', 0.5);
      F(p, 800, 652, 110, RAMA, SIT, { f: 1 }); F(p, 870, 652, 100, SITA, SIT, { f: 1 }); F(p, 940, 652, 105, LAK, SIT, { f: -1 });
      F(p, 1030, 648, 118, { skin: '#8a5a44', cloth: '#4a6a5a', crown: 'bun', plain: true }, { f: 1, aN: [60, 30], aF: [70, 40], prop: { type: 'staff', hand: 'N', ang: 20, len: 0.7, back: 0.9 } });
      p.waves(700, 840, '#6a70a8', 26, '#ffe6c8');
      const g = p.ridge({ y: 830, amp: 40, col: '#3a2f4a', seed: 4, freq: 0.006, peak: [200, 300, 120] });
      p.crowd({ x0: 40, x1: 420, y: g, h: 50, n: 16, col: '#2a2238', arms: 0.5 }); p.tree(60, 780, 620, { col: '#2f3a4a', trunk: '#1c1626' }); p.tree(1930, 900, 800, { col: '#2f3a4a', trunk: '#1c1626', kind: 'palm' }); p.birds(16, 300, 300, 1500, 480, '#3a3055', 8);
    }
  });
  // 8
  S.push({
    title: 'The Sandals on the Throne', kanda: 'Ayodhya Kanda', seed: 108, light: -1,
    text: 'Bharata climbs Chitrakoot to beg his brother to return. Rama will not break his word, so Bharata carries back his sandals, to rule only in their name.',
    draw(p) {
      p.sky(['#9ab8d8', '#c9d6e0', '#f0e6cf', '#f6e2b8']); p.sun(300, 200, 60, '#fff8d8', '#ffe9b0'); p.clouds({ n: 7, y0: 40, y1: 300, size: 170, col: '#fdf6ea', shadow: '#a8b8d0' });
      p.ridge({ y: 430, amp: 150, col: '#a8bcc8', col2: '#c9d2c8', seed: 21, peak: [1500, 400, 160] }); p.ridge({ y: 520, amp: 110, col: '#8fae9a', col2: '#b8c8a0', seed: 13, lit: '#d6e0b8' });
      p.fade('#e9eed6', 0.3); 
      const v = p.ridge({ y: 650, amp: 30, col: '#a8b884', col2: '#8a9a6a', seed: 4 });
      p.crowd({ x0: 1100, x1: W, y: 650, jit: 26, h: 26, n: 220, col: '#a86a5a', col2: '#e0c080', spears: 0.5, banners: 0.05, bannerCol: '#f0b93a' });
      for (const x of [1300, 1480, 1690, 1860]) p.quad(x, 660 + p.rr(-10, 10), 70, { kind: 'elephant', f: -1, col: '#9a94a0', cloth: '#c9463a' });
      p.fade('#e6e8cc', 0.22);
      const g = p.ridge({ y: 760, amp: 26, col: '#9aae70', col2: '#5f7450', seed: 31, peak: [620, 520, 190], freq: 0.005 });
      p.forest({ x0: 60, x1: 420, base: g, h: 330, n: 4, col: '#5f8a66', col2: '#7a9a5a', trunk: '#3a2a30', flowers: '#f6c6d6' }); hut(p, 330, g(330) + 6, 170);
      scr(p, () => p.glow(720, g(720) - 150, 240, '#fff3c0', 0.6));
      F(p, 640, g(640) + 4, 210, RAMA, { f: 1, aN: [40, 70], aF: [20, 50], halo: '#fff3c0' }); F(p, 540, g(540) + 4, 180, SITA, { f: 1 }); F(p, 470, g(470) + 4, 195, LAK, { f: 1 });
      const B = F(p, 830, g(830) + 6, 200, { skin: '#6f8fb8', cloth: '#b98a5a', cloth2: '#8a6a4a', crown: 'bun', hair: '#1f1a2a' }, KNEEL, { f: -1, aN: [150, 172], aF: [146, 170] });
      p.rect(B.hN[0] - 30, B.hN[1] - 22, 62, 12, '#c98a4a'); p.rect(B.hN[0] - 24, B.hN[1] - 30, 10, 10, '#f6d36a'); p.rect(B.hN[0] + 8, B.hN[1] - 30, 10, 10, '#f6d36a'); scr(p, () => p.glow(B.hN[0], B.hN[1] - 20, 90, '#fff3b0', 0.9));
      p.grass(0, 1200, g, 26, '#8a9a58', 140); p.tree(1930, 920, 900, { col: '#3f5f4a', trunk: '#241a26', spread: 0.3 }); fg(p, 6, '#263026'); p.birds(10, 600, 100, 1300, 300, '#5a6a80', 8);
    }
  });
  // 9
  S.push({
    title: 'The Golden Deer', kanda: 'Aranya Kanda', seed: 9, light: 1,
    text: 'At Panchavati a deer of living gold dances through the trees. Sita is enchanted, and Rama takes up his bow, not knowing it is the demon Maricha.',
    draw(p) {
      p.sky(['#cfd9c4', '#e9e6c8', '#f8eccb', '#f4e2b4']); p.sun(1480, 250, 60, '#fff6d0', '#ffe9a8');
      p.ridge({ y: 470, amp: 120, col: '#c9d3bd', col2: '#dfe2c4', seed: 3 });
      p.forest({ x0: -50, x1: W + 50, base: 560, jit: 20, h: 330, n: 16, col: '#b5c6a8', col2: '#c9cfa6', trunk: '#a99c92' }); p.fade('#f6ecc8', 0.45);
      p.forest({ x0: -50, x1: W + 50, base: 640, jit: 20, h: 400, n: 9, col: '#8fae8a', col2: '#a8b780', trunk: '#7a6a66', flowers: '#f4c9d8' });
      p.rays(1480, 250, 22, 1500, '#fff4c8', 0.22, 60, 200); p.fade('#f3e6b8', 0.3);
      const g = p.ridge({ y: 690, amp: 26, col: '#c8c27a', col2: '#8f9a58', seed: 12, freq: 0.003 });
      scr(p, () => { p.glow(1080, 440, 460, '#ffe9a0', 0.85); p.rays(1080, 440, 18, 600, '#fff3c0', 0.2); });
      p.quad(1080, 650, 400, { kind: 'deer', f: -1, col: '#f3c552', gait: 'leap', spots: '#fff6d0', antler: '#fff0b0', mane: '#fff0c0' });
      for (let i = 0; i < 90; i++) p.rect(p.rr(760, 1420), p.rr(260, 700), p.rr(3, 9), p.rr(3, 9), '#fff7d0', p.rr(0.5, 1));
      hut(p, 270, 706, 280);
      F(p, 520, 706, 130, SITA, { f: 1, aN: [70, 100], aF: [40, 70] });
      F(p, 660, 712, 150, RAMA, { f: 1, lN: [16, 2], lF: [-16, -8], aF: [78, 84], aN: [20, 70], prop: { type: 'bow', hand: 'F', ang: 172 } });
      p.grass(0, W, g, 22, '#a7a65c', 160); for (let i = 0; i < 50; i++) p.circ(p.rr(0, W), p.rr(715, 820), p.rr(3, 6), p.r() < 0.5 ? '#f8d0d8' : '#fff3c0');
      p.tree(60, 900, 900, { col: '#35503f', trunk: '#241a26', spread: 0.3 }); p.tree(1880, 920, 1000, { col: '#3b5540', trunk: '#241a26', spread: 0.32 }); fg(p, 5, '#2c2a30'); p.birds(7, 500, 120, 1300, 300, '#6a6a55', 7);
    }
  });
  // 10
  S.push({
    title: 'The Abduction of Sita', kanda: 'Aranya Kanda', seed: 110, light: 1,
    text: 'The beggar at the hermitage door throws off his disguise. Ravana, ten-headed lord of Lanka, towers over the line Lakshmana drew, and his sky-chariot waits in the storm.',
    draw(p) {
      p.sky(['#3f3a66', '#7a5a8a', '#d98a78', '#f6c890']); p.sun(1750, 520, 50, '#ffe6b0', '#ff9a70');
      p.clouds({ n: 8, y0: 20, y1: 300, size: 200, col: '#6a5a8a', shadow: '#33294f', light: '#e8a08a' });
      p.ridge({ y: 560, amp: 60, col: '#6a5a88', col2: '#9a6a88', seed: 8 }); p.forest({ x0: 0, x1: W, base: 620, jit: 12, h: 240, n: 20, col: '#55607a', col2: '#6a6a70', trunk: '#3a3350' }); p.fade('#b8788a', 0.3);
      vimana(p, 1560, 250, 210, -1);
      F(p, 1100, 800, 660, RAVAN, { f: -1, lean: 3, lN: [24, 4], lF: [-20, -8], aN: [70, 100], aF: [95, 120], arms: [[150, 170], [120, 150], [30, 80], [-40, 30]], cape: '#3a2244' });
      p.fade('#a8687a', 0.26); p.ridge({ y: 640, amp: 30, col: '#5a4a6a', a: 0.0, seed: 2 });
      p.forest({ x0: -40, x1: 520, base: 700, jit: 12, h: 380, n: 5, col: '#45606a', col2: '#566a5a', trunk: '#2a2238' });
      const g = p.ridge({ y: 730, amp: 20, col: '#a8846a', col2: '#5a4a52', seed: 12, freq: 0.004 });
      hut(p, 380, 736, 260);
      scr(p, () => { p.glow(640, 760, 260, '#fff0a0', 0.5); }); p.curve([[420, 800], [560, 770], [720, 772], [860, 800]], 9, '#fff3b0'); p.curve([[420, 800], [560, 770], [720, 772], [860, 800]], 22, '#ffd96a', 0.35);
      F(p, 600, 760, 140, SITA, { f: 1, lean: -14, aN: [120, 150], aF: [100, 140] });
      p.rect(770, 760, 50, 14, '#b08a5e'); p.circ(800, 752, 12, '#8a6a48');
      p.tree(1900, 920, 900, { col: '#2a3040', trunk: '#17131e' }); fg(p, 3, '#1c1626'); p.birds(18, 200, 80, 1300, 400, '#1c1626', 9);
    }
  });
  // 11
  S.push({
    title: 'Jatayu Against the Sky-Chariot', kanda: 'Aranya Kanda', seed: 111, light: -1,
    text: 'The old vulture king Jatayu hears Sita cry out. Alone, high above the clouds, he tears at Ravana\'s chariot until the demon\'s sword takes his wings.',
    draw(p) {
      p.sky(['#5f7fc0', '#9fb0dc', '#e6c8d0', '#fbe0b8']); p.sun(250, 560, 60, '#fff3c8', '#ffcf9a'); p.rays(250, 560, 22, 1700, '#ffe9c0', 0.16, -70, 20);
      p.clouds({ n: 6, y0: 40, y1: 230, size: 150, col: '#f6e9ee', shadow: '#9a9ac8' });
      p.ridge({ y: 780, amp: 40, col: '#a8a0c8', col2: '#c8b0c0', seed: 3, a: 0.8 });
      p.clouds({ n: 9, y0: 620, y1: 800, size: 230, col: '#fbeee6', shadow: '#b0a0cc' });
      vimana(p, 1380, 470, 300, -1);
      F(p, 1380, 392, 250, RAVAN, { f: -1, lean: 10, aN: [150, 172], aF: [80, 60], arms: [[120, 150], [60, 90]], prop: { type: 'sword', hand: 'N', ang: 196, len: 0.5 } });
      F(p, 1500, 400, 110, SITA, { f: 1, aN: [140, 160], aF: [120, 150] });
      scr(p, () => p.glow(820, 340, 480, '#fff0d0', 0.5));
      p.eagle(760, 420, 560, { f: 1, col: '#9a6f4a', head: '#e6d2b0', gold: '#f2c14e', tip: '#3a2a30', up: 0.6, spread: 0.55 });
      for (let i = 0; i < 26; i++) p.ell(p.rr(500, 1300), p.rr(450, 820), p.rr(10, 26), p.rr(3, 7), p.r() < 0.5 ? '#9a6f4a' : '#e9d8c0', 0.9, p.rr(0, 3));
      p.clouds({ n: 5, y0: 800, y1: 880, size: 240, col: '#e6d0de', shadow: '#8a7ab0' }); p.birds(10, 100, 100, 600, 300, '#f6f1e6', 8);
    }
  });
  // 12
  S.push({
    title: "Shabari's Berries", kanda: 'Aranya Kanda', seed: 112, light: 1,
    text: 'By the lotus lake Pampa an old forest woman has swept her path every day of her life, waiting. She offers Rama the berries she has tasted one by one to be sure they are sweet.',
    draw(p) {
      p.sky(['#c6d8d6', '#e6ead0', '#f8eec8', '#f6e0b0']); p.sun(1500, 260, 56, '#fff8d8', '#ffeab0');
      p.ridge({ y: 440, amp: 120, col: '#b8ccc0', col2: '#d6dcc0', seed: 17 }); p.forest({ x0: 0, x1: W, base: 540, jit: 10, h: 250, n: 22, col: '#a6c0a6', col2: '#bccb9f', trunk: '#9a8f8a' }); p.fade('#f3ecc8', 0.4);
      p.sea(560, '#e6ead0', '#8fb0a8', '#fff8dc', 1500, 720); p.rays(1500, 260, 20, 1500, '#fff6d0', 0.2, 70, 200);
      for (let i = 0; i < 46; i++) { const x = p.rr(700, W), y = p.rr(590, 715), s = (y - 540) / 12; p.ell(x, y, s * 2.2, s * 0.7, '#6f9a78'); if (p.r() < 0.6) { p.poly([[x - s, y - s * 0.3], [x, y - s * 2], [x + s, y - s * 0.3]], '#f4a8c0'); p.poly([[x - s * 0.5, y - s * 0.3], [x, y - s * 1.6], [x + s * 0.5, y - s * 0.3]], '#fde0e8'); } }
      const g = p.ridge({ y: 725, amp: 22, col: '#b8c080', col2: '#7a8a58', seed: 9, freq: 0.004, peak: [400, 500, 60] });
      // the great banyan
      p.tree(430, g(430) + 20, 880, { col: '#6a9470', trunk: '#5a4640', spread: 0.52, flowers: '#f6d0a8' });
      hut(p, 210, g(210) + 4, 200);
      F(p, 640, g(640) + 6, 170, RAMA, SIT, { f: -1, aN: [70, 100], halo: '#fff3c0' }); F(p, 740, g(740) + 6, 160, LAK, SIT, { f: -1 });
      const Sb = F(p, 500, g(500) + 6, 150, { skin: '#a87a5a', robe: '#e6dcc8', drape: '#d6c6a8', hair: '#f1ece4', crown: 'bun', plain: true, sash: false }, { f: 1, lean: 22, aN: [70, 95], aF: [60, 90] });
      p.ell(Sb.hN[0] + 14, Sb.hN[1] - 2, 26, 9, '#8a6a48'); for (let i = 0; i < 7; i++) p.circ(Sb.hN[0] + p.rr(-6, 34), Sb.hN[1] - p.rr(6, 14), 5, '#b8323a');
      p.grass(0, W, g, 22, '#93a560', 160); for (let i = 0; i < 60; i++) p.circ(p.rr(0, 900), p.rr(740, 830), p.rr(3, 6), p.r() < 0.5 ? '#f8d6e0' : '#fff6d0');
      p.quad(1300, g(1300) + 6, 70, { kind: 'deer', f: -1, col: '#c99a6a', spots: '#f6e6c8' }); fg(p, 5, '#2c3026'); p.birds(8, 900, 100, 1700, 300, '#6a7a6a', 7);
    }
  });
  // 13
  S.push({
    title: 'Hanuman Bears the Brothers', kanda: 'Kishkindha Kanda', seed: 113, light: 1,
    text: 'On Mount Rishyamukha the exiles meet Hanuman, minister of the monkey prince Sugriva. He takes his true form, lifts Rama and Lakshmana on his shoulders, and carries them up the mountain.',
    draw(p) {
      p.sky(['#86a6d8', '#bcc8e6', '#f0dccc', '#fbe6b8']); p.sun(1650, 300, 58, '#fff6d0', '#ffe0a8'); p.rays(1650, 300, 22, 1700, '#fff0c8', 0.15, 80, 260);
      p.clouds({ n: 8, y0: 40, y1: 320, size: 170, col: '#fdf3ea', shadow: '#a8a8d4' });
      p.ridge({ y: 520, amp: 130, col: '#a8a8cc', col2: '#c8bccc', seed: 41, peak: [400, 350, 200] }); p.ridge({ y: 600, amp: 80, col: '#b0a48a', col2: '#c8b890', seed: 23, lit: '#e6d6a8' }); p.fade('#f0e0cc', 0.3);
      const g = p.ridge({ y: 700, amp: 60, col: '#b89a72', col2: '#7a6650', seed: 5, tilt: -0.14, freq: 0.006, lit: '#e0c690' });
      for (const x of [300, 520, 1500, 1750]) p.rock(x, g(x) + 20, p.rr(120, 260), p.rr(70, 150), '#9a8468');
      const J = F(p, 1010, g(1010) + 10, 600, HANU, { f: -1, lean: 8, lN: [34, 2], lF: [-26, -40], aN: [150, 120], aF: [140, 110], halo: '#fff0b0', haloR: 6 });
      F(p, J.sh[0] + 78, J.sh[1] - 18, 150, RAMA, SIT, { f: -1, prop: { type: 'bow', hand: 'F', ang: 170 } }); F(p, J.sh[0] - 96, J.sh[1] - 12, 140, LAK, SIT, { f: -1, prop: { type: 'bow', hand: 'F', ang: 170 } });
      p.fade('#f0dcc0', 0.12);
      F(p, 420, g(420) + 4, 110, VAN, { f: 1, aN: [140, 165], crown: 'mukut', plain: false }); for (const x of [250, 330, 520]) p.mini(x, g(x) + 4, 70, '#a8784a', { tail: -1, arms: true });
      p.forest({ x0: 1500, x1: W, base: g, h: 260, n: 5, col: '#6a8a60', col2: '#8a9a58', trunk: '#4a3a34' }); p.grass(0, W, g, 20, '#a89a60', 100);
      p.tree(70, 900, 860, { col: '#40583f', trunk: '#241a26', kind: 'broad' }); fg(p, 2, '#2a2228'); p.birds(12, 500, 80, 1400, 260, '#5a5a80', 8);
    }
  });
  // 14
  S.push({
    title: 'Vali and Sugriva', kanda: 'Kishkindha Kanda', seed: 114, light: -1,
    text: 'Two monkey kings, brothers alike as the two Ashvins, wrestle for Kishkindha until the forest shakes. Hidden among the trees, Rama waits with one arrow.',
    draw(p) {
      p.sky(['#a8c0b8', '#d6dcc0', '#f6e6b8', '#f0c890']); p.sun(1000, 330, 80, '#fff6d0', '#ffd890');
      p.ridge({ y: 470, amp: 130, col: '#a8bca8', col2: '#c8cca8', seed: 19 }); p.forest({ x0: 0, x1: W, base: 590, jit: 12, h: 320, n: 18, col: '#93b093', col2: '#b0bc88', trunk: '#8a7f78' }); p.fade('#f3dcae', 0.45);
      p.rays(1000, 330, 30, 1300, '#fff0c0', 0.2);
      const g = p.ridge({ y: 720, amp: 20, col: '#c9a870', col2: '#8a7450', seed: 7, freq: 0.004 });
      for (let i = 0; i < 16; i++) p.circ(p.rr(600, 1400), p.rr(600, 740), p.rr(40, 110), '#f0d6a8', 0.35);
      F(p, 900, 730, 520, VAN, { f: 1, skin: '#c98a4a', cloth: '#b8323a', crown: 'mukut', plain: false, lean: 22, lN: [40, -6], lF: [-34, -44], aN: [86, 110], aF: [70, 120], gold: '#f6d36a' });
      F(p, 1130, 730, 500, VAN, { f: -1, skin: '#a8703a', cloth: '#3f6a8a', crown: 'mukut', plain: false, lean: 22, lN: [40, -6], lF: [-34, -44], aN: [92, 130], aF: [76, 100], gold: '#e6e0d0' });
      for (let i = 0; i < 12; i++) p.circ(p.rr(700, 1300), p.rr(680, 760), p.rr(30, 80), '#e6caa0', 0.5);
      p.crowd({ x0: 1450, x1: 1900, y: 716, jit: 16, h: 60, n: 16, col: '#a8784a', col2: '#8a6a4a', tail: 1, arms: 0.5 });
      p.grass(0, W, g, 22, '#a89a5a', 130);
      p.tree(330, 930, 1050, { col: '#3a5a44', trunk: '#241a26', spread: 0.36 }); p.tree(40, 900, 900, { col: '#2f4a3a', trunk: '#1c1620' });
      F(p, 190, 824, 230, RAMA, ARCH, { f: 1, prop: { type: 'bow', hand: 'F', ang: 176, drawn: true, glow: '#fff0a0' } }); F(p, 70, 834, 200, LAK, { f: 1 });
      p.tree(1900, 930, 950, { col: '#35503f', trunk: '#241a26' }); fg(p, 5, '#221a22', 862);
    }
  });
  // 15
  S.push({
    title: "Hanuman's Leap", kanda: 'Sundara Kanda', seed: 15, light: 1,
    text: 'From the summit of Mount Mahendra, Hanuman grows vast as a mountain and leaps across the ocean toward golden Lanka.',
    draw(p) {
      p.sky(['#7f97cf', '#b9b9e4', '#f3d5cb', '#fde9bd']);
      p.sun(1560, 520, 44, '#fff2c0', '#ffd49a'); p.rays(1560, 520, 26, 1500, '#fff0c8', 0.16, 180, 360);
      p.streaks({ n: 14, y0: 380, y1: 540, col: '#fff3de', a: 0.6 }); p.clouds({ n: 7, y0: 60, y1: 300, size: 170, col: '#fbeee6', shadow: '#a9a0d2' });
      p.sea(575, '#b8d2dc', '#4c7fa0', '#fff3cf', 1560);
      p.ridge({ y: 590, amp: 14, x0: 1600, x1: W, bottom: 580, col: '#a79dc8', peak: [1800, 110, 105], seed: 4 });
      p.city({ x0: 1700, x1: 1900, base: 520, h: 120, n: 14, col: '#e9cf8a', col2: '#c9a7c4', gold: '#fff0b0', peakX: 1800, peakW: 80 });
      p.fade('#f6dcc8', 0.14, 430, 620); p.clouds({ n: 5, y0: 500, y1: 640, size: 90, col: '#fff6ea', shadow: '#b7b3da', x0: 300, x1: 1500 });
      p.serpent([[1240, 860], [1200, 760], [1290, 700], [1380, 730], [1400, 660]], 60, 44, '#5a8a8a', { hood: true, tongue: true, belly: '#cfe0c8' });
      p.ribbon([[640, 380], [460, 430], [280, 400], [80, 470]], 110, '#fff8ee', 0.75); p.ribbon([[700, 300], [470, 250], [260, 300], [40, 240]], 80, '#f6e6f0', 0.6);
      const J = F(p, 930, 330, 620, HANU, { fly: true, lean: 68, head: -42, lN: [-78, -86], lF: [-48, -118], aF: [104, 96], aN: [-40, -75], halo: '#fff0b0', haloR: 7, prop: { type: 'mace', hand: 'N', ang: -112, len: 0.34 } });
      p.ribbon([[J.hip[0], J.hip[1]], [700, 470], [520, 430], [330, 520]], 90, '#e8703a', 0.95);
      p.birds(16, 300, 420, 1200, 620, '#f7f1e6', 8); p.birds(8, 1000, 100, 1700, 300, '#5a4f77', 7);
      p.ridge({ y: 870, amp: 60, col: '#3b2f4a', col2: '#201528', peak: [150, 260, 260], seed: 9, freq: 0.012 });
      p.rock(330, 780, 240, 110, '#4a3b58'); p.forest({ x0: 0, x1: 260, base: 640, jit: 30, h: 150, n: 7, col: '#3f5a50', col2: '#5a6f4a', trunk: '#2a1c22' });
      for (const [x, y] of [[250, 640], [300, 668], [352, 690], [400, 716]]) p.mini(x, y, 50, '#b07a4a', { tail: -1, arms: true });
    }
  });
  // 16
  S.push({
    title: 'The Ring in the Ashoka Grove', kanda: 'Sundara Kanda', seed: 116, light: -1,
    text: 'Under the ashoka trees of Lanka, ringed by demon guards, Sita keeps her vigil. From the branches a small monkey drops Rama\'s signet ring into her hands.',
    draw(p) {
      p.sky(['#1f2450', '#3a3f7a', '#6a6a9a', '#a89ab0']); p.stars(220, 420); p.sun(420, 190, 70, '#f6f3e0', '#b8c0e6');
      p.clouds({ n: 6, y0: 60, y1: 300, size: 160, col: '#5a5f98', shadow: '#2a2f60', light: '#c8cce6' });
      p.city({ x0: 700, x1: W, base: 600, h: 460, n: 22, col: '#6a6a9a', col2: '#8a7aa0', gold: '#f0d890', peakX: 1500, peakW: 400 });
      for (let i = 0; i < 60; i++) p.rect(p.rr(800, W), p.rr(260, 590), 6, 8, '#ffd98a', 0.9); p.fade('#4a4f88', 0.4);
      p.forest({ x0: -40, x1: W, base: 660, jit: 16, h: 330, n: 12, col: '#3f5a70', col2: '#4f6a6a', trunk: '#2a2a48', flowers: '#c9463a' }); p.fade('#3f4a80', 0.2);
      const g = p.ridge({ y: 730, amp: 16, col: '#5a6a80', col2: '#33405a', seed: 6, freq: 0.004 });
      p.tree(980, 760, 760, { col: '#3f6a6a', trunk: '#2a2238', spread: 0.5, flowers: '#e8503a' });
      scr(p, () => { p.rays(420, 190, 14, 1500, '#d6dcf6', 0.16, 10, 70); p.glow(1000, 640, 260, '#cfd6ff', 0.5); });
      F(p, 1000, 748, 190, SITA, SIT, { f: -1, robe: '#e6c85a', drape: '#f6e6b8', aN: [60, 110], aF: [50, 100], halo: '#e6e6ff', haloR: 4, head: 20 });
      const Hn = F(p, 880, 520, 120, HANU, SIT, { f: 1, lean: 30, aN: [50, 30], tail: 1.3 });
      scr(p, () => p.glow(906, 640, 60, '#fff0a0', 1)); p.circ(906, 640, 7, '#fff6c0'); p.line(Hn.hN[0], Hn.hN[1], 906, 634, 1.5, '#fff0a0', 0.6);
      for (const [x, f, c] of [[520, 1, '#4a6a6a'], [640, 1, '#6a4a6a'], [1420, -1, '#5a4a70'], [1560, -1, '#4a5a70']]) F(p, x, 760, 210, { skin: c, robe: '#2f2640', drape: '#5a2f4a', crown: 'horns', hair: '#12101a', fangs: true, sash: false, gold: '#a89a6a' }, f > 0 ? SIT : {}, { f: f, prop: f < 0 ? { type: 'trident', hand: 'N', ang: 180, len: 0.5 } : null });
      p.lamp(1160, 760, 12); p.lamp(820, 766, 12); p.grass(0, W, g, 20, '#4a6a70', 120);
      for (let i = 0; i < 70; i++) p.rect(p.rr(700, 1300), p.rr(300, 780), 6, 5, '#e8503a', 0.9);
      p.tree(80, 920, 900, { col: '#1f2f44', trunk: '#12101c', flowers: '#8a2f3a' }); p.tree(1930, 920, 900, { col: '#1f2f44', trunk: '#12101c' }); fg(p, 4, '#12101c');
    }
  });
  // 17
  S.push({
    title: 'Lanka in Flames', kanda: 'Sundara Kanda', seed: 117, light: -1,
    text: 'The demons wrap Hanuman\'s tail in oiled cloth and set it alight. He slips his bonds, grows huge, and bounds from roof to golden roof until all Lanka burns.',
    draw(p) {
      p.sky(['#1c1830', '#4a2440', '#a8443a', '#f08a3a']); p.stars(100, 260);
      p.clouds({ n: 8, y0: 20, y1: 300, size: 220, col: '#5a3048', shadow: '#241428', light: '#e8703a' });
      p.ridge({ y: 520, amp: 80, col: '#4a2a48', col2: '#7a3a44', seed: 5, peak: [1000, 500, 130] });
      p.city({ x0: 0, x1: W, base: 640, h: 420, n: 30, col: '#7a4048', col2: '#b8683a', gold: '#ffd070', peakX: 1000, peakW: 600 });
      for (let i = 0; i < 9; i++) { const x = 120 + i * 220 + p.rr(-50, 50); p.fire(x, p.rr(470, 620), p.rr(90, 200), p.rr(180, 380), { sway: 0.25 }); p.smoke(x + 40, 320, 80, 320, '#3a2038', 0.7); }
      p.fade('#d85a3a', 0.2);
      scr(p, () => p.glow(1050, 300, 600, '#ffb060', 0.6));
      const J = F(p, 1040, 330, 540, HANU, { fly: true, f: -1, lean: 40, head: -20, lN: [70, -30], lF: [-60, -100], aN: [130, 160], aF: [60, 100], tail: 1.4, skin: '#c98444', prop: { type: 'mace', hand: 'N', ang: 190, len: 0.36 } });
      p.fire(J.hip[0] + 150, J.hip[1] - 250, 90, 190, { sway: 0.5 }); p.fire(J.hip[0] + 230, J.hip[1] - 120, 70, 150, { sway: 0.5 });
      p.city({ x0: 0, x1: W, base: 760, h: 300, n: 16, col: '#3a2238', col2: '#5a2f3a', gold: '#e8a04a' });
      for (let i = 0; i < 7; i++) p.fire(160 + i * 280 + p.rr(-60, 60), p.rr(560, 720), p.rr(80, 160), p.rr(150, 260), { sway: 0.25 });
      p.crowd({ x0: 0, x1: W, y: 800, jit: 20, h: 44, n: 60, col: '#1c1424', spears: 0.5, arms: 0.4 });
      for (let i = 0; i < 160; i++) p.rect(p.rr(0, W), p.rr(0, 700), p.rr(2, 6), p.rr(2, 6), p.r() < 0.5 ? '#ffd070' : '#ff8a3a', p.rr(0.5, 1));
      fg(p, 6, '#140e1a', 866);
    }
  });
  // 18
  S.push({
    title: 'The Ocean Answers', kanda: 'Yuddha Kanda', seed: 118, light: 1,
    text: 'For three days Rama asks the sea for a path, and the sea is silent. When he fits a burning arrow to his bow, the Lord of the Ocean rises from the waves with folded hands.',
    draw(p) {
      p.sky(['#3f4f7a', '#6a7aa8', '#a8b0c8', '#e6d6b8']); p.sun(1250, 250, 50, '#fff6d8', '#e6e0c0');
      p.clouds({ n: 9, y0: 20, y1: 330, size: 210, col: '#7a86a8', shadow: '#3a4468', light: '#e6e0d0' });
      p.sea(520, '#a8c0c8', '#2f5f80', '#e6f0e6', 1250);
      scr(p, () => { p.glow(1250, 380, 520, '#d6f0f0', 0.5); p.rays(1250, 250, 18, 1300, '#e6f6f0', 0.14, 30, 150); });
      F(p, 1250, 560, 600, { skin: '#6fb0b8', cloth: '#3f7a8a', cloth2: '#cfe6e0', gold: '#f6e6a8', hair: '#e6f0f0', beard: '#e9f3f0', crown: 'mukut', gem: '#6fd0d0', fly: true, f: -1, broad: 1.3, halo: '#e6fff6', haloR: 6 }, PRAY, { lN: [4, 0], lF: [-4, 0] });
      p.fade('#a8c8d0', 0.14, 100, 700);
      for (let i = 0; i < 16; i++) { const x = p.rr(950, 1550), y = p.rr(640, 720); p.blob([[x - 90, y + 30], [x - 30, y - p.rr(30, 80)], [x + 30, y - p.rr(20, 60)], [x + 100, y + 30]], p.r() < 0.5 ? '#cfe6e6' : '#7fb0c0', 0.9); }
      p.serpent([[1640, 760], [1700, 650], [1620, 560], [1700, 470]], 46, 30, '#3f7a7a', { hood: true }); p.serpent([[860, 760], [800, 660], [880, 600], [820, 520]], 40, 26, '#4a8a80', { hood: true });
      p.waves(600, 800, '#3f6f90', 46, '#eef6f0');
      const g = p.ridge({ y: 790, amp: 30, col: '#c9b890', col2: '#6a5a50', seed: 9, peak: [300, 420, 120], freq: 0.005 });
      const R = F(p, 470, g(470) + 4, 200, RAMA, ARCH, { f: 1, prop: { type: 'bow', hand: 'F', ang: 172, drawn: true, glow: '#ffb060', arrowCol: '#ffd070' } });
      p.fire(R.hF[0] + 46, R.hF[1] + 10, 26, 60); F(p, 360, g(360) + 4, 180, LAK, { f: 1 }); F(p, 250, g(250) + 4, 190, HANU, { f: 1 });
      p.crowd({ x0: 0, x1: 220, y: g, h: 60, n: 20, col: '#a8784a', col2: '#8a6a4a', tail: -1, spears: 0.2 }); p.tree(40, 860, 640, { col: '#2f4a44', trunk: '#1c1626', kind: 'palm' }); fg(p, 8, '#1c1a26', 868); p.birds(14, 300, 150, 1000, 420, '#e6eef0', 8);
    }
  });
  // 19
  S.push({
    title: 'The Bridge to Lanka', kanda: 'Yuddha Kanda', seed: 119, light: -1,
    text: 'Nala the builder directs, and the monkey armies tear up hills and forests. Stones marked with the name of Rama float, and in five days a bridge lies across the sea.',
    draw(p) {
      p.sky(['#6f9ad6', '#a8c0e6', '#e6dcd6', '#fbe9c0']); p.sun(420, 300, 56, '#fff8d8', '#ffe6b0'); p.clouds({ n: 9, y0: 40, y1: 360, size: 180, col: '#fdf6ee', shadow: '#a0acd6' });
      p.sea(560, '#b8d6dc', '#3f7fa0', '#fff6dc', 420);
      p.ridge({ y: 572, amp: 10, x0: 1500, x1: W, bottom: 566, col: '#a8a0c8', peak: [1760, 130, 80], seed: 4 }); p.city({ x0: 1680, x1: 1840, base: 520, h: 80, n: 10, col: '#e6cf90', col2: '#c9a8c0', gold: '#fff0b0' });
      // the causeway in perspective
      p.poly([[1740, 566], [1760, 566], [1250, 860], [520, 860]], '#b8a488'); p.poly([[1740, 566], [1748, 566], [860, 860], [520, 860]], '#d6c4a0');
      for (let i = 0; i < 70; i++) { const t = Math.pow(p.r(), 0.7), x = 1750 - t * 900 + p.rr(-1, 1) * t * 300, y = 566 + t * 294; p.rock(x, y, 20 + t * 130, 8 + t * 50, p.r() < 0.5 ? '#a8947a' : '#8a7a6a'); }
      p.crowd({ x0: 900, x1: 1500, y: x => 566 + (1750 - x) / 900 * 294 * 0.9, jit: 14, h: 40, n: 60, col: '#b07a4a', col2: '#8a6a4a', tail: 1, arms: 0.6, depth: [600, 860] });
      // Hanuman with a hill
      const J = F(p, 470, 810, 430, HANU, { f: 1, lean: 6, lN: [26, 2], lF: [-22, -30], aN: [165, 178], aF: [150, 174] });
      const mx = J.hN[0] + 10, my = J.hN[1] + 6;
      p.blob([[mx - 300, my], [mx - 250, my - 90], [mx - 130, my - 190], [mx - 20, my - 250], [mx + 90, my - 180], [mx + 230, my - 110], [mx + 310, my], [mx, my + 46]], '#7a8a62');
      p.blob([[mx - 280, my - 6], [mx - 230, my - 86], [mx - 120, my - 180], [mx - 24, my - 236], [mx - 60, my - 90], [mx - 90, my + 16]], '#a8b47a'); p.blob([[mx - 240, my + 4], [mx, my + 44], [mx + 290, my + 2], [mx, my + 14]], '#5a5a4a');
      p.forest({ x0: mx - 200, x1: mx + 220, base: x => my - 80 - 130 * Math.exp(-Math.pow((x - mx + 20) / 130, 2)), jit: 10, h: 80, n: 12, col: '#5f8a5a', col2: '#7a9a50', trunk: '#4a3a34' });
      for (let i = 0; i < 14; i++) p.rock(mx + p.rr(-260, 260), my + p.rr(60, 220), p.rr(8, 24), p.rr(6, 16), '#6a6a5a');
      p.waves(640, 840, '#4f8fb0', 30, '#f6fbf6');
      const g = p.ridge({ y: 820, amp: 30, col: '#c9b48a', col2: '#6a5a4a', seed: 6, peak: [1750, 300, 110], freq: 0.006, x0: 1300 });
      F(p, 1640, g(1640) + 4, 150, RAMA, { f: -1, aN: [100, 110], halo: '#fff3c0' }); F(p, 1720, g(1720) + 4, 140, LAK, { f: -1 }); p.mini(1560, g(1560) + 4, 34, '#a88a6a', { tail: 1 });
      p.tree(1900, 860, 620, { col: '#3f5f4a', trunk: '#241a26', kind: 'palm' }); p.birds(16, 700, 200, 1700, 500, '#f6f6ee', 8);
    }
  });
  // 20
  S.push({
    title: 'Kumbhakarna Wakes', kanda: 'Yuddha Kanda', seed: 120, light: 1,
    text: 'Roused from his six-month sleep with drums, elephants and mountains of food, the giant Kumbhakarna strides out through the gate of Lanka, and the monkey host breaks before him.',
    draw(p) {
      p.sky(['#6a6a98', '#a890a8', '#e6b8a0', '#f6dcb0']); p.sun(1700, 330, 60, '#fff0c8', '#ffc890'); p.rays(1700, 330, 20, 1700, '#ffe6c0', 0.16, 90, 270);
      p.clouds({ n: 8, y0: 30, y1: 300, size: 190, col: '#c8a8b8', shadow: '#6a5a8a', light: '#fbe0c0' });
      p.ridge({ y: 560, amp: 70, col: '#8a7a9a', col2: '#b8909a', seed: 9 });
      p.wall(0, W, 640, 150, '#a8869a'); p.gopuram(1320, 650, 300, 520, '#b8929a', '#f0d080'); p.gopuram(260, 650, 220, 380, '#a8869a', '#f0d080'); p.city({ x0: 500, x1: 1100, base: 500, h: 220, n: 12, col: '#9a809a', col2: '#b8909a', gold: '#f0d080' }); p.fade('#d8a898', 0.35);
      F(p, 820, 800, 700, { skin: '#7a8a9a', cloth: '#5a3a4a', cloth2: '#b8323a', crown: 'mukut', gold: '#e6c060', hair: '#1c1626', fangs: true, broad: 1.5, f: -1, lean: 6, lN: [28, 6], lF: [-24, -12], aN: [20, 60], aF: [70, 110], prop: { type: 'trident', hand: 'F', ang: 172, len: 0.42 } });
      p.fade('#d6a090', 0.22);
      for (let i = 0; i < 14; i++) p.circ(p.rr(400, 1300), p.rr(700, 790), p.rr(40, 120), '#e6c0a0', 0.4);
      const g = p.ridge({ y: 760, amp: 20, col: '#b89878', col2: '#6a5650', seed: 3, freq: 0.004 });
      p.crowd({ x0: 0, x1: 640, y: 770, jit: 34, h: 40, n: 110, col: '#b07a4a', col2: '#8a6a4a', tail: 1, arms: 0.5, spears: 0.1 });
      p.crowd({ x0: 1150, x1: W, y: 760, jit: 30, h: 42, n: 80, col: '#4a3350', col2: '#6a3f4f', spears: 0.6, banners: 0.07, bannerCol: '#b8323a', dir: -1 });
      for (const x of [1500, 1700]) p.quad(x, 770, 110, { kind: 'elephant', f: -1, col: '#7a7486', cloth: '#8a2f3a' });
      for (let i = 0; i < 9; i++) p.rock(p.rr(200, 700), p.rr(300, 560), p.rr(30, 60), p.rr(20, 40), '#8a7a6a');
      F(p, 300, 790, 130, HANU, { f: 1, aN: [150, 170], prop: { type: 'mace', hand: 'N', ang: 185 } }); p.rock(1850, 870, 400, 140, '#33223a'); fg(p, 4, '#2a1c30', 866); p.birds(20, 300, 60, 1500, 300, '#2a1c30', 9);
    }
  });
  // 21
  S.push({
    title: 'The Serpent Arrows and Garuda', kanda: 'Yuddha Kanda', seed: 121, light: -1,
    text: 'Indrajit, fighting unseen, binds Rama and Lakshmana in arrows that turn to serpents. Then a great wind rises: Garuda, king of birds, descends, and every snake flees.',
    draw(p) {
      p.sky(['#232a55', '#4a4a88', '#9a7a9a', '#f0c070']); p.stars(120, 300);
      p.clouds({ n: 8, y0: 20, y1: 330, size: 210, col: '#4a4a80', shadow: '#222650', light: '#f6d090' });
      scr(p, () => { p.glow(1000, 240, 760, '#ffe08a', 0.8); p.rays(1000, 220, 36, 1500, '#fff0b0', 0.24); });
      p.eagle(1000, 360, 560, { f: -1, col: '#e8a83a', head: '#fff3d0', gold: '#c9463a', tip: '#c9463a', up: 0.42, spread: 0.9 });
      F(p, 1030, 318, 170, { skin: '#f6d98a', cloth: '#c9463a', crown: 'mukut', gold: '#fff3b0', fly: true, f: -1, lN: [70, -20], lF: [60, -40], aN: [130, 150], aF: [60, 90], halo: '#fff6c0' });
      p.ridge({ y: 620, amp: 50, col: '#5a4a80', col2: '#8a6a80', seed: 6 }); p.fade('#c99a80', 0.22, 400, 760);
      const g = p.ridge({ y: 740, amp: 18, col: '#9a7a70', col2: '#4a3a4a', seed: 2, freq: 0.004 });
      p.crowd({ x0: 0, x1: 700, y: 740, jit: 26, h: 54, n: 50, col: '#a8784a', col2: '#7a5a44', tail: -1, arms: 0.6 }); p.crowd({ x0: 1300, x1: W, y: 740, jit: 26, h: 54, n: 50, col: '#a8784a', col2: '#7a5a44', tail: 1, arms: 0.6 });
      // the bound brothers
      F(p, 930, 772, 190, RAMA, { fly: true, f: 1, lean: 84, lN: [86, 88], lF: [80, 84], aN: [70, 80], aF: [96, 92], head: -6 }); F(p, 1090, 790, 180, LAK, { fly: true, f: 1, lean: 84, lN: [86, 88], lF: [80, 84], aN: [70, 80], aF: [96, 92] });
      for (let i = 0; i < 12; i++) { const x = p.rr(760, 1300), d = x < 1010 ? -1 : 1; p.serpent([[x, 780], [x + d * 60, 740 + p.rr(-20, 20)], [x + d * 140, 770], [x + d * p.rr(200, 320), p.rr(690, 760)], [x + d * p.rr(320, 440), p.rr(640, 780)]], 16, 12, p.r() < 0.5 ? '#3f6a5a' : '#5a4a7a', { hood: p.r() < 0.5 }); }
      
      F(p, 640, 770, 150, HANU, KNEEL, PRAY, { f: 1 }); fg(p, 4, '#161226', 866);
    }
  });
  // 22
  S.push({
    title: 'The Mountain of Herbs', kanda: 'Yuddha Kanda', seed: 122, light: -1,
    text: 'Lakshmana lies dying and only the sanjeevani herb can save him before dawn. Unable to tell one glowing plant from another, Hanuman tears up the whole mountain and flies south with it.',
    draw(p) {
      p.sky(['#161c44', '#2f3a78', '#5a6aa8', '#a8a8c8']); p.stars(260, 520); p.sun(1620, 190, 76, '#f6f6e6', '#aab8e6');
      p.clouds({ n: 6, y0: 80, y1: 330, size: 170, col: '#4f5a98', shadow: '#232a5a', light: '#c8d0f0' });
      p.ridge({ y: 640, amp: 190, col: '#8a96c8', col2: '#5a66a0', seed: 31, oct: 5, lit: '#e6ecff' }); p.ridge({ y: 720, amp: 130, col: '#5a68a8', col2: '#3a4680', seed: 12, oct: 5, lit: '#c8d2f6' });
      p.clouds({ n: 8, y0: 700, y1: 840, size: 200, col: '#8a96c8', shadow: '#3f4a88', light: '#e0e6ff' });
      p.ribbon([[700, 470], [470, 520], [260, 470], [40, 540]], 120, '#c8d0f0', 0.5);
      const J = F(p, 880, 610, 400, HANU, { fly: true, f: 1, lean: 52, head: -34, lN: [-70, -84], lF: [-40, -110], aN: [168, 180], aF: [156, 176], skin: '#c9905a', halo: '#e6e6ff', haloR: 5 });
      const mx = J.hN[0] + 20, my = J.hN[1] + 6, k = 0.72;
      p.blob([[mx - 420 * k, my], [mx - 300 * k, my - 150 * k], [mx - 120 * k, my - 330 * k], [mx + 60 * k, my - 420 * k], [mx + 220 * k, my - 250 * k], [mx + 400 * k, my - 110 * k], [mx + 440 * k, my], [mx, my + 70 * k]], '#4a6a70');
      p.blob([[mx - 380 * k, my - 10], [mx - 280 * k, my - 140 * k], [mx - 120 * k, my - 310 * k], [mx + 40 * k, my - 390 * k], [mx - 20 * k, my - 150 * k], [mx - 100 * k, my + 20 * k]], '#7a9a98'); p.blob([[mx - 60 * k, my - 300 * k], [mx + 60 * k, my - 410 * k], [mx + 130 * k, my - 330 * k], [mx + 30 * k, my - 290 * k]], '#f1f5ff');
      p.blob([[mx - 400 * k, my + 4], [mx, my + 66 * k], [mx + 420 * k, my + 2], [mx, my + 20]], '#33444a');
      p.forest({ x0: mx - 300 * k, x1: mx + 320 * k, base: x => my - 80 * k - 180 * k * Math.exp(-Math.pow((x - mx - 30) / (190 * k), 2)), jit: 14, h: 70, n: 16, col: '#3f6a5a', col2: '#5a7a60', trunk: '#2a2a3a', kind: 'pine' });
      scr(p, () => { for (let i = 0; i < 46; i++) { const x = mx + p.rr(-340, 360) * k, y = my - p.rr(20, 300) * k * (1 - Math.abs(x - mx) / (480 * k)); p.glow(x, y, p.rr(14, 36), p.r() < 0.6 ? '#a8ffd0' : '#fff6a0', 0.95); } p.glow(mx, my - 150, 460, '#a8f0d0', 0.3); });
      for (let i = 0; i < 26; i++) p.rock(mx + p.rr(-300, 300), my + p.rr(60, 260), p.rr(8, 26), p.rr(6, 18), '#4a5a70');
      p.birds(8, 1200, 300, 1900, 500, '#c8d0f0', 7);
    }
  });
  // 23
  S.push({
    title: 'Rama and Ravana', kanda: 'Yuddha Kanda', seed: 23, light: -1,
    text: 'On the chariot of Indra, Rama faces the ten-headed king of Lanka. The Brahmastra blazes on his bowstring and the worlds hold their breath.',
    draw(p) {
      p.sky(['#4a3a6e', '#8a5f8f', '#e39a78', '#f8d49a']); p.sun(330, 300, 70, '#fff3c8', '#ffcf8a'); p.rays(330, 300, 30, 1700, '#ffe2a8', 0.2, -40, 140);
      p.clouds({ n: 6, y0: 40, y1: 260, size: 190, col: '#8a6a96', shadow: '#4a3766', light: '#f0b48a', x0: 800, x1: W }); p.clouds({ n: 5, y0: 80, y1: 330, size: 150, col: '#f6d3b0', shadow: '#b78aa6', x0: -100, x1: 800 });
      p.ridge({ y: 610, amp: 50, col: '#8f6f96', col2: '#a8808f', seed: 6 }); p.city({ x0: 1150, x1: 1980, base: 610, h: 230, n: 18, col: '#7d5f8a', col2: '#a36f7f', gold: '#f1c36a' });
      for (const x of [1240, 1900]) { p.fire(x, 560, 110, 170, { sway: -0.3 }); p.smoke(x - 20, 440, 60, 330, '#5a4468', -0.6); } p.fade('#e7a786', 0.28);
      F(p, 1560, 790, 680, RAVAN, { f: -1, lean: 6, lN: [22, 6], lF: [-24, -10], aN: [124, 156], aF: [80, 40], arms: [[150, 176], [100, 124], [56, 96], [156, 120]], cape: '#4a2a50', prop: [{ type: 'sword', hand: 'N', ang: 168, len: 0.44 }, { type: 'mace', hand: 'F', ang: 96, len: 0.26 }] });
      p.fade('#c98a8a', 0.16);
      p.ridge({ y: 724, amp: 24, col: '#a67a6a', col2: '#6a4a52', seed: 8, freq: 0.003 });
      p.crowd({ x0: 900, x1: W, y: 730, jit: 30, h: 36, n: 120, col: '#4a3350', col2: '#6a3f4f', spears: 0.5, banners: 0.06, bannerCol: '#b8323a', dir: -1 });
      p.crowd({ x0: 0, x1: 800, y: 740, jit: 30, h: 36, n: 100, col: '#9a6f4a', col2: '#b98455', spears: 0.2, banners: 0.05, bannerCol: '#f0b93a', tail: -1, arms: 0.3 });
      const d = p.chariot(400, 710, 190, { f: 1, col: '#b0763a', horse: '#fbf6ea', canopyCol: '#e8a33a', flag: '#f6d36a' });
      const R = F(p, d.x + 6, d.y + 2, 240, RAMA_K, ARCH, { f: 1, lean: -6, halo: '#fff2b8', prop: { type: 'bow', hand: 'F', ang: 176, drawn: true, glow: '#fff0a0', len: 0.46 } });
      scr(p, () => { p.glow(R.hF[0] + 50, R.hF[1], 220, '#fff3b0', 0.95); p.rays(R.hF[0] + 50, R.hF[1], 14, 760, '#fff0b0', 0.34, -24, 24); });
      p.volley(26, 800, 280, 1300, 600, 180, 80, '#3a2a40', 2, 14); p.volley(26, 600, 300, 1200, 600, -8, 90, '#fff0c0', 2, 10);
      p.rock(1800, 860, 400, 120, '#33223a'); F(p, 1760, 760, 110, HANU, { f: -1, back: true, aN: [150, 170], prop: { type: 'mace', hand: 'N', ang: 180 } }); fg(p, 3, '#2b1c30', 866);
    }
  });
  // 24
  S.push({
    title: 'The Trial by Fire', kanda: 'Yuddha Kanda', seed: 124, light: 1,
    text: 'Sita walks into the flames to answer the doubt of the world. The fire does not burn her. Agni himself rises and carries her back to Rama, unharmed.',
    draw(p) {
      p.sky(['#3a2f5a', '#7a4a70', '#d9805a', '#f8c070']); p.stars(80, 240);
      p.clouds({ n: 7, y0: 20, y1: 300, size: 200, col: '#7a4a6a', shadow: '#33244a', light: '#f6a060' });
      p.ridge({ y: 600, amp: 60, col: '#6a4a70', col2: '#a86a6a', seed: 3 }); p.sea(640, '#e8a070', '#6a4a7a', '#ffe0a0', 1000, 720);
      scr(p, () => { p.glow(1000, 380, 800, '#ffb050', 0.8); p.rays(1000, 420, 34, 1400, '#ffd890', 0.2); });
      p.fire(1000, 760, 620, 640); const A = F(p, 1000, 380, 600, { skin: '#fbb64a', cloth: '#d9482a', cloth2: '#ffe38a', gold: '#fff0a8', hair: '#c9462a', beard: '#f08a3a', halo: '#fff0b0', haloR: 8, fly: true, f: 1, broad: 1.3, aN: [70, 100], aF: [62, 96], lN: [4, 0], lF: [-6, 0] });
      p.fade('#f89a3a', 0.2, 0, 800);
      const Sx = A.hN[0] + 40, Sy = A.hN[1] + 60; scr(p, () => p.glow(Sx, Sy - 100, 190, '#fffbe0', 0.9));
      F(p, Sx, Sy + 60, 200, SITA, PRAY, { f: 1, robe: '#fbe6b0', drape: '#fff6d8', halo: '#fffbe0' });
      p.fire(1000, 800, 560, 360);
      const g = p.ridge({ y: 780, amp: 16, col: '#8a5a52', col2: '#3a2838', seed: 6, freq: 0.004 });
      F(p, 1560, 790, 200, RAMA_K, { f: -1, aN: [50, 100], prop: { type: 'bow', hand: 'F', ang: 176 } }); F(p, 1660, 794, 185, LAK, PRAY, { f: -1 }); F(p, 1760, 798, 190, HANU, KNEEL, PRAY, { f: -1 });
      p.crowd({ x0: 0, x1: 560, y: 790, jit: 24, h: 70, n: 40, col: '#3a2438', col2: '#6a3f44', tail: -1, arms: 0.5 }); p.crowd({ x0: 1800, x1: W, y: 800, jit: 20, h: 70, n: 10, col: '#3a2438' });
      for (let i = 0; i < 200; i++) p.rect(p.rr(400, 1600), p.rr(0, 760), p.rr(2, 7), p.rr(2, 7), p.r() < 0.5 ? '#ffe08a' : '#ff9a3a', p.rr(0.5, 1)); fg(p, 5, '#1c1220', 868);
    }
  });
  // 25
  S.push({
    title: 'The Return to Ayodhya', kanda: 'Yuddha Kanda', seed: 125, light: -1,
    text: 'Fourteen years are over. The flying palace Pushpaka descends on Ayodhya, and the city lights a lamp in every window and on every step of the river to bring its king home.',
    draw(p) {
      p.sky(['#20275a', '#4a4a90', '#a070a0', '#f6b078']); p.stars(200, 380); p.sun(1000, 610, 60, '#fff0c0', '#ffb070');
      p.clouds({ n: 8, y0: 40, y1: 330, size: 190, col: '#5a5598', shadow: '#2a2a60', light: '#f6b890' }); p.streaks({ n: 12, y0: 420, y1: 580, col: '#ffc8a0', a: 0.5 });
      scr(p, () => { p.glow(760, 250, 420, '#ffe6a0', 0.7); p.rays(760, 260, 22, 900, '#fff0b8', 0.2, 30, 150); });
      vimana(p, 760, 280, 300, 1); F(p, 740, 236, 100, RAMA_K, { f: 1, aN: [130, 160], halo: '#fff3c0' }); F(p, 800, 236, 90, SITA, { f: 1 });
      p.ridge({ y: 600, amp: 30, col: '#5a4a88', col2: '#8a5a88', seed: 4 });
      p.city({ x0: -40, x1: W + 40, base: 660, h: 400, n: 40, col: '#5a4a88', col2: '#8a5a80', gold: '#ffd880', peakX: 1450, peakW: 420 });
      p.fade('#8a5a8a', 0.25, 300, 700);
      p.city({ x0: -40, x1: W + 40, base: 700, h: 220, n: 26, col: '#4a3a70', col2: '#6a4470', gold: '#ffd070' });
      for (let i = 0; i < 420; i++) { const x = p.rr(0, W), y = p.rr(330, 700); p.rect(x, y, 5, 6, '#ffd98a'); }
      scr(p, () => { for (let i = 0; i < 60; i++) p.glow(p.rr(0, W), p.rr(380, 700), p.rr(20, 50), '#ffc060', 0.6); });
      p.sea(700, '#c9809a', '#2a2a66', '#ffd98a', 1000);
      for (let i = 0; i < 6; i++) p.rect(0, 700 + i * 12, W, 7, i % 2 ? '#6a4a78' : '#8a5a80');
      for (let i = 0; i < 120; i++) { const x = p.rr(0, W), y = p.rr(700, 772); p.lamp(x, y, 5); } for (let i = 0; i < 60; i++) { const y = p.rr(780, 850); p.lamp(p.rr(0, W), y, 4 + (y - 780) / 10); }
      p.crowd({ x0: 0, x1: W, y: 716, jit: 12, h: 40, n: 150, col: '#3a2a5a', col2: '#6a3f5a', arms: 0.6, banners: 0.05, bannerCol: '#e8703a' });
      for (let i = 0; i < 9; i++) p.ribbon([[i * 240, 420 + p.rr(-40, 40)], [i * 240 + 80, 380], [i * 240 + 160, 430], [i * 240 + 260, 390]], 26, i % 2 ? '#e8703a' : '#f0c85a', 0.8);
      const fwx = [300, 1300, 1700]; scr(p, () => fwx.forEach((x, i) => { const y = 160 + i * 40; p.glow(x, y, 150, i % 2 ? '#ffb0d0' : '#ffe08a', 0.8); p.rays(x, y, 26, 170, i % 2 ? '#ffc0e0' : '#fff0a0', 0.7); }));
      p.pillar(60, 900, 120, 700, '#1c1836'); p.pillar(1940, 900, 120, 700, '#1c1836'); p.lamp(60, 196, 16); p.lamp(1940, 196, 16);
    }
  });

  Epic.scenes.ramayana = S;
  Epic.kit = { F, scr, fg, vimana, boat, hut, ARCH, PRAY, KNEEL, SIT, WALK, SAGE, KING, HANU };
})();
