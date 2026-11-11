/* Mahabharata: 25 moments, composed for the Epic Painter engine. */
(function () {
  'use strict';
  const { W, H, mix, lite, dark } = Epic;
  const { F, scr, fg, hut, boat, ARCH, PRAY, KNEEL, SIT, SAGE, KING, HANU } = Epic.kit;
  const KRISHNA = { skin: '#4a69a8', cloth: '#f2c23a', cloth2: '#e8703a', crown: 'mukut', feather: true, hair: '#17131f', gold: '#f6d77a' };
  const ARJUNA = { skin: '#d9a77c', cloth: '#f1ead8', cloth2: '#4f7fb5', crown: 'mukut', hair: '#1f1a2a', top: '#c9d2dc' };
  const BHIMA = { skin: '#d6a070', cloth: '#b8323a', cloth2: '#f0b93a', crown: 'mukut', hair: '#1f1a2a', broad: 1.5 };
  const YUDH = { skin: '#dcae84', cloth: '#f4ecd8', cloth2: '#d6a44a', crown: 'mukut', hair: '#1f1a2a' };
  const TWIN = { skin: '#dcae84', cloth: '#6a9a7a', cloth2: '#f0c85a', crown: 'mukut', hair: '#1f1a2a' };
  const DRAU = { skin: '#b98866', robe: '#b8323a', drape: '#f0b93a', longhair: true, crown: 'none', hair: '#17131f', sash: false, aN: [14, 40], aF: [-6, 20] };
  const KARNA = { skin: '#e0ae7a', top: '#f2c85a', cloth: '#e8703a', cloth2: '#f6e0a0', crown: 'mukut', hair: '#1f1a2a', gold: '#fff0a8' };
  const BHISHMA = { skin: '#d9b08c', top: '#dfe6ee', cloth: '#f1ead8', cloth2: '#9ab0c8', crown: 'mukut', hair: '#f1ece4', beard: '#f6f1ea', gold: '#e6ecf2' };
  const DURYO = { skin: '#c99a78', top: '#6a4a8a', cloth: '#4a2f6a', cloth2: '#b8323a', crown: 'mukut', hair: '#17131f', broad: 1.35 };
  const DRONA = Object.assign({}, SAGE, { robe: '#f1ead8', beard: '#f1ece4' });
  const SOLD = { skin: '#b98866', top: '#8a6a5a', cloth: '#7a4a4a', crown: 'helmet', gold: '#c9b070', plain: true };
  const S = [];

  // 1
  S.push({
    title: 'Ganga and the King', kanda: 'Adi Parva', seed: 201, light: 1,
    text: 'King Shantanu loves a woman he met on the riverbank and has sworn never to question her. When she carries their eighth son to the water, he cries out at last, and she stands revealed as the river Ganga herself.',
    draw(p) {
      p.sky(['#8fa8d6', '#c9c6e6', '#f6d6c8', '#fbe8c0']); p.sun(1500, 400, 54, '#fff3c8', '#ffd8a8'); p.rays(1500, 400, 22, 1600, '#fff0c8', 0.15);
      p.clouds({ n: 7, y0: 40, y1: 280, size: 160, col: '#fbeee6', shadow: '#b0a6d4' }); p.streaks({ n: 12, y0: 300, y1: 450, col: '#fff3de' });
      p.ridge({ y: 470, amp: 90, col: '#b0aad2', col2: '#d0c0d4', seed: 22, peak: [400, 300, 120] }); p.ridge({ y: 505, amp: 30, col: '#9fb0b8', seed: 5 });
      p.forest({ x0: 0, x1: W, base: 520, jit: 5, h: 80, n: 40, col: '#93ad9c', col2: '#a9b890', trunk: '#8a7a78' });
      p.sea(522, '#e6e2dc', '#6f9ab2', '#fff6dc', 1500); p.fade('#f8e6d0', 0.2, 430, 620);
      scr(p, () => { p.glow(1000, 360, 520, '#f6f6ff', 0.75); p.rays(1000, 420, 18, 800, '#f0f6ff', 0.2); });
      const G = F(p, 1000, 560, 620, { skin: '#f3e6e0', robe: '#cfe2ea', drape: '#f6fbff', longhair: true, hair: '#aab8d8', crown: 'mukut', gold: '#fff6d8', gem: '#8fd0e0', sash: false, f: -1, aN: [60, 100], aF: [52, 96], halo: '#f6fbff', haloR: 7, fly: true, lN: [3, 0], lF: [-3, 0] });
      p.ell(G.hN[0] - 30, G.hN[1] - 14, 40, 20, '#fff3e0'); p.circ(G.hN[0] - 56, G.hN[1] - 22, 15, '#e7b991');
      for (let i = 0; i < 24; i++) { const x = p.rr(780, 1220), y = p.rr(600, 760); p.blob([[x - 80, y + 20], [x - 20, y - p.rr(20, 70)], [x + 30, y - p.rr(10, 50)], [x + 90, y + 20]], p.r() < 0.5 ? '#f1f8fb' : '#a9cfe0', 0.9); }
      p.fade('#e6eef6', 0.12, 200, 700); p.waves(640, 840, '#7fa8c0', 30, '#fbfdff');
      const g = p.ridge({ y: 800, amp: 34, col: '#c9b88a', col2: '#6a5a50', seed: 3, peak: [280, 360, 110], freq: 0.005 });
      F(p, 420, g(420) + 4, 190, KING, { f: 1, robe: '#6a3f7a', beard: null, aN: [96, 120], aF: [80, 110], lean: 14, lN: [30, 0], lF: [-16, -30] });
      p.tree(90, 880, 760, { col: '#3f5a50', trunk: '#241a26' }); p.birds(12, 300, 120, 900, 380, '#6a5f80', 8);
    }
  });
  // 2
  S.push({
    title: "Bhishma's Vow", kanda: 'Adi Parva', seed: 202, light: -1,
    text: 'So that his father may marry the fisher-king\'s daughter, Prince Devavrata renounces the throne and swears never to marry. The gods cry "Bhishma!", the terrible one, and flowers fall from the sky.',
    draw(p) {
      p.sky(['#4a4a88', '#8a70a8', '#e6a890', '#fbd8a0']); p.clouds({ n: 9, y0: 20, y1: 330, size: 210, col: '#7a6aa0', shadow: '#3a3468', light: '#f6c8a0' });
      scr(p, () => { p.glow(1000, 80, 760, '#fff0c0', 0.9); p.rays(1000, 60, 34, 1400, '#fff3c8', 0.26, 20, 160); });
      for (const [x, y, f] of [[520, 170, 1], [1480, 170, -1], [760, 110, 1], [1240, 110, -1]]) { p.c.globalAlpha = 0.55; F(p, x, y + 150, 220, { skin: '#f6e6c8', cloth: '#f6e0a8', cloth2: '#f6c8b0', gold: '#fff6d0', fly: true, f: f, lean: 30, aN: [70, 40], aF: [90, 70], lN: [-40, -70], lF: [-20, -60], halo: '#fff6d0' }); p.c.globalAlpha = 1; }
      for (let i = 0; i < 260; i++) { const x = p.rr(300, 1700), y = p.rr(120, 760); p.ell(x, y, p.rr(4, 9), p.rr(2, 5), ['#fbd0dc', '#fff3c0', '#f6a8b8', '#ffffff'][i % 4], 0.95, p.rr(0, 3)); }
      p.ridge({ y: 560, amp: 60, col: '#7a6aa0', col2: '#b88aa0', seed: 8 }); p.forest({ x0: 0, x1: W, base: 590, jit: 6, h: 100, n: 34, col: '#5f6a8a', col2: '#6f7a80', trunk: '#4a4a66' });
      p.sea(592, '#f0c0a8', '#5a5a98', '#fff0c8', 1000, 730);
      for (const x of [300, 520, 1500]) boat(p, x, 660 + p.rr(-20, 30), 200, '#4a3540');
      const g = p.ridge({ y: 750, amp: 20, col: '#b89a80', col2: '#5a4650', seed: 4, freq: 0.004 });
      hut(p, 1560, 760, 220); hut(p, 1760, 776, 180); for (let i = 0; i < 5; i++) { p.line(1300 + i * 40, 760, 1310 + i * 40, 640, 4, '#5a4038'); } p.curve([[1300, 660], [1380, 700], [1470, 650]], 2, '#e6dcc8');
      const B = F(p, 1000, 772, 290, { skin: '#dcb088', top: '#e6ecf2', cloth: '#f4eede', cloth2: '#8fa8c8', crown: 'mukut', hair: '#1f1a2a', gold: '#f6e8b0' }, { f: 1, aN: [164, 178], aF: [30, 60], halo: '#fff6d0', lN: [14, 2], lF: [-14, -6] });
      scr(p, () => p.glow(B.hN[0], B.hN[1] - 20, 160, '#fff6c0', 0.9));
      F(p, 1240, 770, 170, { skin: '#8a5a44', cloth: '#5a6a5a', crown: 'bun', plain: true }, { f: -1, aN: [60, 110] }); F(p, 1320, 772, 150, DRAU, { f: -1, robe: '#3f6a8a', drape: '#e6dcc8' });
      const d = p.chariot(560, 780, 150, { f: 1, col: '#a8703a', horse: '#fbf3e6', gait: 'stand', canopyCol: '#8fa8c8' }); p.crowd({ x0: 60, x1: 380, y: 790, jit: 14, h: 76, n: 14, col: '#4a3a5a', col2: '#7a5a6a', spears: 0.5 }); fg(p, 5, '#241a2c', 866);
    }
  });
  // 3
  S.push({
    title: "The Bird's Eye", kanda: 'Adi Parva', seed: 203, light: 1,
    text: 'Drona sets a wooden bird in a treetop and asks each prince what he sees. The others see the tree, the sky, their brothers. Arjuna sees only the eye of the bird.',
    draw(p) {
      p.sky(['#9fc0d8', '#cfdcd6', '#f6eccc', '#f6e0b0']); p.sun(1420, 240, 150, '#fff8dc', '#ffe9a8'); p.clouds({ n: 5, y0: 40, y1: 230, size: 140, col: '#fdf8ea', shadow: '#b8c8d0', x0: 0, x1: 900 });
      p.ridge({ y: 520, amp: 90, col: '#b0c8b8', col2: '#d0d8b8', seed: 14 }); p.forest({ x0: 0, x1: W, base: 600, jit: 10, h: 230, n: 20, col: '#9fba9c', col2: '#b8c690', trunk: '#8f8480' }); p.fade('#f3e8c0', 0.4);
      const g = p.ridge({ y: 730, amp: 18, col: '#b8bf7a', col2: '#7a8a54', seed: 6, freq: 0.004 });
      p.tree(1420, 760, 880, { col: '#5f8a5f', trunk: '#4a3a30', spread: 0.3 });
      scr(p, () => { p.glow(1420, 240, 130, '#ffffff', 0.9); });
      p.ell(1420, 246, 34, 18, '#b8523a'); p.circ(1452, 232, 13, '#d9783a'); p.poly([[1462, 230], [1484, 234], [1462, 240]], '#f0c85a'); p.poly([[1390, 240], [1350, 226], [1356, 256]], '#8a3a2a'); p.circ(1456, 229, 4, '#17131f');
      p.c.setLineDash([14, 12]); p.line(560, 596, 1448, 232, 2.5, '#fff6d0', 0.9); p.c.setLineDash([]);
      const A = F(p, 500, 740, 250, ARJUNA, ARCH, { f: 1, crown: 'bun', top: null, lean: -12, aF: [112, 114], aN: [118, -56], prop: { type: 'bow', hand: 'F', ang: 200, drawn: true, glow: '#fff0a0' } });
      F(p, 330, 744, 240, DRONA, { f: 1, aN: [70, 100], prop: { type: 'staff', hand: 'F', ang: 180, len: 0.4 } });
      for (const [x, c] of [[90, YUDH], [170, BHIMA], [240, DURYO]]) F(p, x, 752, 200, c, { f: 1, crown: 'bun', top: null, prop: { type: 'bow', hand: 'N', ang: 178 } });
      p.grass(0, W, g, 22, '#98a45c', 150); for (let i = 0; i < 50; i++) p.circ(p.rr(0, W), p.rr(745, 830), p.rr(3, 6), p.r() < 0.5 ? '#f8d6e0' : '#fff6d0');
      p.tree(1930, 920, 820, { col: '#3f5f4a', trunk: '#241a26' }); fg(p, 3, '#2a2e26'); p.birds(9, 300, 100, 1000, 300, '#6a7a80', 7);
    }
  });
  // 4
  S.push({
    title: "Ekalavya's Gift", kanda: 'Adi Parva', seed: 204, light: -1,
    text: 'Refused as a pupil, the forest boy Ekalavya shapes a clay image of Drona and teaches himself before it until he outshoots the princes. When Drona asks for his teacher\'s fee, he gives his right thumb.',
    draw(p) {
      p.sky(['#3f5a5a', '#6a8a7a', '#b8c8a0', '#e6e0b0']); p.sun(500, 180, 60, '#fbf8dc', '#e6e6b0');
      p.ridge({ y: 470, amp: 120, col: '#6a8a80', col2: '#8fa890', seed: 9 }); p.forest({ x0: -50, x1: W, base: 590, jit: 14, h: 380, n: 18, col: '#5f8070', col2: '#73906a', trunk: '#4a5050' }); p.fade('#a8c0a0', 0.35);
      p.rays(500, 180, 20, 1700, '#f6f6d0', 0.26, 10, 80);
      p.forest({ x0: -50, x1: W, base: 690, jit: 14, h: 480, n: 8, col: '#3f6050', col2: '#507050', trunk: '#2a3030' });
      const g = p.ridge({ y: 730, amp: 20, col: '#7a8a5a', col2: '#3f4a3a', seed: 4, freq: 0.004 });
      scr(p, () => p.glow(1000, 600, 420, '#f6f6d0', 0.55));
      p.rect(900, 700, 200, 46, '#8a7a6a'); p.rect(880, 740, 240, 16, '#6a5a50');
      F(p, 1000, 702, 400, { skin: '#b89a80', robe: '#a88a70', top: '#b89a80', hair: '#a08a74', beard: '#c8b09a', crown: 'bun', band: '#8a7460', plain: true, sash: false, f: -1, aN: [50, 110] });
      for (let i = 0; i < 9; i++) p.circ(p.rr(930, 1070), p.rr(696, 706), 7, ['#f6a03a', '#f8d6e0', '#fff6d0'][i % 3]);
      const E = F(p, 760, 752, 190, { skin: '#7a5440', cloth: '#5a6a4a', cloth2: '#8a6a4a', crown: 'bun', plain: true, hair: '#17131f' }, KNEEL, { f: 1, aN: [86, 100], aF: [70, 96], head: 14 });
      scr(p, () => p.glow(E.hN[0], E.hN[1], 70, '#ffb0a0', 0.9)); p.circ(E.hN[0] + 8, E.hN[1] + 4, 7, '#b8323a');
      p.curve([[650, 760], [690, 700], [660, 640]], 7, '#6a4a34'); p.line(650, 760, 660, 640, 1.5, '#e6dcc8');
      F(p, 1320, 752, 230, DRONA, { f: -1, aN: [80, 110] }); F(p, 1440, 754, 200, ARJUNA, { f: -1, crown: 'bun', top: null, prop: { type: 'bow', hand: 'N', ang: 178 } });
      p.quad(560, 760, 60, { kind: 'deer', f: 1, col: '#b89a7a', antlers: false, mane: '#8a6a4a' });
      p.grass(0, W, g, 24, '#6a7a50', 160); p.tree(80, 930, 1000, { col: '#263a34', trunk: '#161a1c' }); p.tree(1920, 930, 1000, { col: '#2a4038', trunk: '#161a1c' }); fg(p, 5, '#161a1c');
    }
  });
  // 5
  S.push({
    title: 'Karna Enters the Arena', kanda: 'Adi Parva', seed: 205, light: 1,
    text: 'At the tournament of the princes a stranger walks in, born with golden armour and earrings, and matches every feat of Arjuna. He is Karna, the son of the Sun, and no one there knows it.',
    draw(p) {
      p.sky(['#7f9ad8', '#c0c0e6', '#f6dcc0', '#fbe6b0']); p.sun(1000, 250, 110, '#fff8d8', '#ffe0a0'); p.rays(1000, 250, 40, 1500, '#fff0c0', 0.2);
      p.clouds({ n: 6, y0: 30, y1: 220, size: 150, col: '#fbf0e6', shadow: '#a8a8d4' });
      p.city({ x0: 0, x1: W, base: 470, h: 300, n: 22, col: '#c9b8d0', col2: '#e0c8b8', gold: '#f6e0a0' }); p.fade('#f3dcc8', 0.4);
      for (let t = 0; t < 4; t++) { const y = 470 + t * 46; p.rect(0, y, W, 46, t % 2 ? '#c9a898' : '#b89888'); p.rect(0, y, W, 8, '#e6ccb0'); p.crowd({ x0: 0, x1: W, y: y + 38, jit: 4, h: 30 + t * 4, n: 150, col: ['#a85a5a', '#5a7aa8', '#c99a4a', '#7a5a8a'][t], col2: '#e6c8a0', arms: 0.3 }); }
      for (let i = 0; i < 12; i++) p.ribbon([[i * 180, 300 + p.rr(-50, 50)], [i * 180 + 70, 350], [i * 180 + 120, 300], [i * 180 + 200, 350]], 34, ['#e8703a', '#f0c85a', '#b8323a'][i % 3], 0.9);
      p.wall(0, W, 700, 50, '#b08a78'); p.rect(0, 700, W, 160, '#e6cfa0'); p.ridge({ y: 720, amp: 6, col: '#ecd8a8', col2: '#c9a878', seed: 3 });
      scr(p, () => { p.glow(1000, 520, 380, '#fff0b0', 0.8); });
      F(p, 1000, 790, 380, KARNA, { f: -1, halo: '#fff3b0', haloR: 7, lN: [16, 2], lF: [-16, -6], aN: [20, 50], prop: { type: 'bow', hand: 'F', ang: 176 } });
      F(p, 520, 800, 250, ARJUNA, { f: 1, prop: { type: 'bow', hand: 'N', ang: 176 } }); F(p, 400, 800, 230, DRONA, { f: 1 }); F(p, 300, 802, 250, BHIMA, { f: 1, prop: { type: 'mace', hand: 'N', ang: 180 } });
      F(p, 1480, 800, 260, DURYO, { f: -1, aN: [140, 165], aF: [120, 150] }); F(p, 1620, 802, 230, KING, { f: -1 });
      p.pillar(40, 900, 110, 620, '#6a4a5a'); p.pillar(1960, 900, 110, 620, '#6a4a5a'); p.birds(12, 300, 60, 1700, 200, '#5a5a80', 8);
    }
  });
  // 6
  S.push({
    title: 'The House of Lac', kanda: 'Adi Parva', seed: 206, light: 1,
    text: 'Duryodhana builds his cousins a palace of lacquer, resin and oil, and means to burn them in it. Warned in time, the Pandavas escape by a tunnel, and Bhima carries the family through the night.',
    draw(p) {
      p.sky(['#141a3a', '#3a2a50', '#8a3a3a', '#e8803a']); p.stars(160, 330); p.clouds({ n: 7, y0: 20, y1: 280, size: 200, col: '#4a2a44', shadow: '#1c1428', light: '#e8703a' });
      p.ridge({ y: 560, amp: 80, col: '#3a2a4a', col2: '#5a3040', seed: 7 });
      scr(p, () => p.glow(1380, 420, 760, '#ff9a40', 0.8));
      p.pavilion(1380, 650, 700, 420, '#8a4a3a', '#ffd070'); p.shikhara(1080, 650, 130, 380, '#7a3f38', '#ffd070'); p.shikhara(1690, 650, 130, 380, '#7a3f38', '#ffd070');
      for (const [x, y, w, h] of [[1380, 640, 620, 560], [1100, 600, 200, 380], [1680, 600, 200, 380], [1380, 420, 300, 300]]) p.fire(x, y, w, h, { sway: -0.3 });
      p.smoke(1300, 200, 160, 300, '#3a2038', -0.9);
      for (let i = 0; i < 220; i++) p.rect(p.rr(700, W), p.rr(0, 640), p.rr(2, 7), p.rr(2, 7), p.r() < 0.5 ? '#ffd070' : '#ff8a3a', p.rr(0.5, 1));
      const g = p.ridge({ y: 700, amp: 30, col: '#5a3a3a', col2: '#1c1622', seed: 5, freq: 0.004 });
      p.forest({ x0: -40, x1: 760, base: 730, jit: 20, h: 520, n: 8, col: '#1f2f3a', col2: '#2a3a34', trunk: '#12101a' });
      p.ell(820, 770, 90, 30, '#0e0a14');
      const B = F(p, 560, 800, 260, BHIMA, { f: -1, crown: 'bun', lN: [26, 2], lF: [-24, -30], aN: [150, 110], aF: [140, 100], lean: 10 });
      F(p, B.sh[0] + 30, B.sh[1] - 8, 100, DRAU, SIT, { f: -1, robe: '#e6dcc8', drape: '#c9b8a0', hair: '#c9c0b8' });
      for (const [x, c, h] of [[700, YUDH, 190], [430, ARJUNA, 190], [340, TWIN, 170], [270, TWIN, 170]]) F(p, x, 806, h, c, { f: -1, crown: 'bun', top: null, lN: [24, 4], lF: [-20, -26] });
      p.grass(0, 900, g, 26, '#2a3a34', 100); p.tree(60, 930, 1000, { col: '#141c26', trunk: '#0c0a12' }); fg(p, 4, '#0c0a12', 866);
    }
  });
  // 7
  S.push({
    title: 'Bhima and Bakasura', kanda: 'Adi Parva', seed: 207, light: -1,
    text: 'A demon holds the town of Ekachakra to ransom: a cartload of food each week, and the driver with it. Bhima takes the cart, eats the food himself, and waits for the demon to come out.',
    draw(p) {
      p.sky(['#8a9ac8', '#c8c0d8', '#f0d8c0', '#f6e0a8']); p.sun(350, 250, 60, '#fff6d0', '#ffe0a8'); p.clouds({ n: 7, y0: 40, y1: 300, size: 170, col: '#f6ece6', shadow: '#a8a0c8' });
      p.ridge({ y: 520, amp: 150, col: '#a8a0c0', col2: '#c8b8b8', seed: 33, peak: [1400, 400, 200] }); p.ridge({ y: 620, amp: 60, col: '#a8a888', col2: '#c0b890', seed: 12, lit: '#e0d6a8' });
      for (let i = 0; i < 9; i++) hut(p, 100 + i * 90 + p.rr(-20, 20), 640 + p.rr(-10, 16), 70); p.fade('#f0dcc0', 0.3);
      p.ell(1560, 560, 190, 150, '#2a2030'); p.ell(1560, 580, 150, 120, '#17121c');
      F(p, 1280, 800, 720, { skin: '#6a8a6a', cloth: '#4a3a4a', cloth2: '#8a3a3a', crown: 'horns', hair: '#1c1420', fangs: true, gold: '#b8a060', broad: 1.5, f: -1, lean: 16, lN: [30, 4], lF: [-26, -16], aN: [100, 130], aF: [130, 160], longhair: true });
      p.fade('#e6ccb0', 0.18);
      const g = p.ridge({ y: 750, amp: 22, col: '#c0a878', col2: '#7a6850', seed: 6, freq: 0.004 });
      p.wheel(520, 720, 60, '#5a3f34', '#c9a060'); p.rect(430, 640, 240, 50, '#8a5f3a'); p.line(660, 670, 760, 690, 8, '#6a4a34');
      for (let i = 0; i < 16; i++) p.circ(p.rr(450, 650), p.rr(600, 640), p.rr(14, 26), ['#f6e6c0', '#e8a03a', '#c9463a', '#f6d36a'][i % 4]);
      p.quad(800, 756, 90, { kind: 'horse', f: 1, col: '#c9b8a0', mane: '#f1ead8' });
      F(p, 640, 620, 210, BHIMA, SIT, { f: 1, crown: 'bun', aN: [70, 130], aF: [40, 60] });
      p.crowd({ x0: 0, x1: 300, y: 760, jit: 14, h: 60, n: 16, col: '#8a5a5a', col2: '#c99a6a', arms: 0.5 }); p.grass(0, W, g, 22, '#a89a5a', 120);
      p.tree(1930, 920, 900, { col: '#3f5a48', trunk: '#241a26' }); fg(p, 3, '#2a2228'); p.birds(16, 1000, 80, 1800, 400, '#2a2030', 9);
    }
  });
  // 8
  S.push({
    title: "The Fish's Eye", kanda: 'Adi Parva', seed: 208, light: -1,
    text: 'To win Draupadi a suitor must string a giant bow and hit the eye of a golden fish turning high overhead, aiming only by its reflection in a bowl of oil. Kings fail one after another. A young brahmin steps forward.',
    draw(p) {
      p.sky(['#d6c2de', '#f0d6d0', '#fbe6c6', '#f6dcb0']);
      p.city({ x0: 0, x1: W, base: 590, h: 440, n: 18, col: '#d6bcd0', col2: '#e6ccc0', gold: '#f6e0a0' }); p.fade('#f6e2cc', 0.5);
      for (const x of [260, 520, 1480, 1740]) p.pillar(x, 690, 90, 660, '#dcc4b8'); p.fade('#f8e4c8', 0.2);
      // the turning fish
      p.line(1000, 0, 1000, 150, 6, '#8a6a4a'); scr(p, () => { p.glow(1000, 190, 260, '#fff3b0', 0.9); p.rays(1000, 190, 26, 500, '#fff0b0', 0.3); });
      const c = p.c; c.strokeStyle = '#b8863a'; c.lineWidth = 12; c.beginPath(); c.ellipse(1000, 190, 150, 44, 0, 0, 6.3); c.stroke(); for (let i = 0; i < 12; i++) p.line(1000, 190, 1000 + Math.cos(i * 0.52) * 150, 190 + Math.sin(i * 0.52) * 44, 4, '#c99a4a');
      p.blob([[900, 190], [960, 160], [1040, 164], [1090, 190], [1040, 216], [960, 220]], '#f6c84a'); p.poly([[1085, 190], [1140, 158], [1130, 190], [1140, 222]], '#e8a03a'); p.circ(930, 184, 9, '#b8323a'); p.blob([[960, 166], [1000, 140], [1030, 166]], '#e8a03a');
      p.rect(0, 690, W, 170, '#c8a890'); p.rect(620, 700, 760, 40, '#e6c8a8');
      p.ell(1000, 736, 150, 30, '#8a6a3a'); p.ell(1000, 730, 135, 22, '#3a2a34'); p.ell(985, 728, 34, 8, '#f6c84a', 0.8);
      const A = F(p, 1000, 716, 300, ARJUNA, { f: 1, crown: 'bun', top: null, cloth: '#f1ead8', cloth2: '#e88f3c', head: 26, lean: 6, lN: [18, 2], lF: [-18, -6], aF: [150, 172], aN: [150, 60], thread: true, plain: true, prop: { type: 'bow', hand: 'F', ang: 96, drawn: true, glow: '#fff0a0', len: 0.4 } });
      p.c.setLineDash([12, 12]); p.line(A.hF[0], A.hF[1] - 40, 940, 200, 2.5, '#fffbe6', 0.9); p.c.setLineDash([]);
      F(p, 1340, 706, 190, DRAU, { f: -1, aN: [60, 96], aF: [50, 92] }); p.curve([[1262, 600], [1238, 632], [1262, 664]], 10, '#f6a03a'); F(p, 1440, 708, 200, KING, { f: -1 }); F(p, 700, 708, 200, KRISHNA, { f: 1, aN: [30, 80] });
      p.crowd({ x0: 0, x1: 600, y: 716, jit: 20, h: 90, n: 30, col: '#8a5a7a', col2: '#c98a5a', spears: 0.15, banners: 0.08, bannerCol: '#d9483b' }); p.crowd({ x0: 1520, x1: W, y: 716, jit: 20, h: 90, n: 26, col: '#5a6a9a', col2: '#c98a5a', spears: 0.15, banners: 0.08, bannerCol: '#f0b93a', dir: -1 });
      p.pillar(60, 900, 170, 900, '#7a5a6a'); p.pillar(1940, 900, 170, 900, '#7a5a6a'); fg(p, 8, '#4a3442', 870);
    }
  });
  // 9
  S.push({
    title: 'The Burning of Khandava', kanda: 'Adi Parva', seed: 209, light: 1,
    text: 'Agni, god of fire, begs to consume the Khandava forest. Krishna and Arjuna guard its edges while Indra, king of heaven, rides his white elephant through the smoke and pours down rain in vain.',
    draw(p) {
      p.sky(['#2a2a50', '#5a3a5a', '#b8503a', '#f0903a']); p.clouds({ n: 9, y0: 10, y1: 320, size: 220, col: '#4a3a5a', shadow: '#1c182c', light: '#e8703a' });
      scr(p, () => p.glow(420, 200, 420, '#cfe0ff', 0.6));
      p.clouds({ n: 3, y0: 250, y1: 290, size: 150, col: '#b8c0e0', shadow: '#5a5a90', x0: 250, x1: 620 });
      const el = p.quad(430, 262, 190, { kind: 'elephant', f: 1, col: '#f1f1f6', cloth: '#5a7ab8' }); F(p, el.back[0] - 10, el.back[1] - 20, 150, { skin: '#e6c8a0', cloth: '#f6e0a0', crown: 'mukut', gold: '#fff6c0', halo: '#e6f0ff' }, SIT, { f: 1, aN: [130, 160], prop: { type: 'spear', hand: 'N', ang: 150, len: 0.5, col: '#e6f0ff' } });
      for (let i = 0; i < 4; i++) p.curve([[560 + i * 60, 180], [700 + i * 90, 300 + i * 20], [760 + i * 100, 360], [900 + i * 120, 520]], 4, '#e6f0ff', 0.9);
      for (let i = 0; i < 220; i++) { const x = p.rr(100, 1500), y = p.rr(300, 640); p.line(x, y, x + 12, y + 34, 2, '#b8d0f0', 0.6); }
      p.ridge({ y: 560, amp: 60, col: '#4a2a40', col2: '#7a3a3a', seed: 8 });
      p.forest({ x0: 600, x1: W, base: 640, jit: 20, h: 420, n: 14, col: '#3a2a34', col2: '#5a3030', trunk: '#1c1420' });
      for (let i = 0; i < 9; i++) p.fire(700 + i * 150 + p.rr(-40, 40), p.rr(520, 660), p.rr(120, 240), p.rr(260, 520), { sway: -0.25 });
      scr(p, () => p.glow(1350, 300, 520, '#ff9a40', 0.6));
      p.c.globalAlpha = 0.85; F(p, 1380, 430, 560, { skin: '#fbb64a', cloth: '#d9482a', cloth2: '#ffe38a', gold: '#fff0a8', hair: '#c9462a', beard: '#f08a3a', halo: '#fff0b0', fly: true, f: -1, broad: 1.3, aN: [150, 172], aF: [120, 160], lN: [4, 0], lF: [-6, 0] }); p.c.globalAlpha = 1;
      for (let i = 0; i < 6; i++) p.fire(900 + i * 190, 700, 200, 330, { sway: -0.25 });
      const g = p.ridge({ y: 750, amp: 16, col: '#7a4a40', col2: '#2a1c26', seed: 3, freq: 0.004 });
      const d = p.chariot(380, 780, 170, { f: 1, col: '#a8703a', horse: '#fbf3e6', canopyCol: '#f0c85a', flag: '#f6e0a0' });
      F(p, d.x + 30, d.y, 200, ARJUNA, ARCH, { f: 1, lean: -10, aF: [110, 112], aN: [116, -56], prop: { type: 'bow', hand: 'F', ang: 198, drawn: true, glow: '#fff0a0' } }); F(p, d.x + 90, d.y, 180, KRISHNA, { f: 1, aN: [120, 150], prop: { type: 'chakra', hand: 'N' } });
      p.volley(40, 600, 200, 1300, 520, -38, 80, '#fff0c0', 2, 10);
      for (let i = 0; i < 8; i++) p.quad(p.rr(900, 1500), 780 + p.rr(-10, 20), p.rr(40, 60), { kind: 'deer', f: -1, col: '#2a1c22', gait: 'gallop', antlers: i % 2 === 0, antler: '#2a1c22' });
      p.birds(30, 700, 60, 1900, 380, '#17121c', 9); fg(p, 5, '#17121c', 866);
    }
  });
  // 10
  S.push({
    title: 'The Hall of Illusions', kanda: 'Sabha Parva', seed: 210, light: -1,
    text: 'The demon architect Maya builds the Pandavas a hall at Indraprastha where crystal floors look like water and pools look like floors. Duryodhana, proud guest, walks straight into one, and hears laughter.',
    draw(p) {
      p.sky(['#9ac0e0', '#c8dcec', '#eef0e0', '#f6ecc8']); p.sun(1000, 200, 70, '#ffffff', '#f6f6d8'); p.rays(1000, 200, 30, 1400, '#ffffff', 0.18);
      p.city({ x0: 200, x1: 1800, base: 560, h: 520, n: 26, col: '#cfe6ec', col2: '#e6e0f0', gold: '#fff6c8', peakX: 1000, peakW: 420 }); p.fade('#eef6f0', 0.45);
      for (const x of [300, 560, 820, 1180, 1440, 1700]) p.pillar(x, 640, 70, 560, '#dff0f0'); p.rect(240, 70, 1520, 44, '#cfe6ea'); p.fade('#f6faf0', 0.2);
      for (let i = 0; i < 80; i++) { const x = p.rr(240, 1760), y = p.rr(80, 620); p.poly([[x, y - 8], [x + 5, y], [x, y + 8], [x - 5, y]], '#ffffff', 0.9); }
      p.rect(0, 640, W, 220, '#d6ecee'); for (let i = 0; i < 16; i++) p.poly([[1000 + (i - 8) * 60, 640], [1000 + (i - 7) * 60, 640], [1000 + (i - 7) * 320, 860], [1000 + (i - 8) * 320, 860]], i % 2 ? '#c8e2e6' : '#e6f4f2');
      p.blob([[620, 720], [900, 690], [1300, 700], [1500, 760], [1300, 830], [800, 840], [560, 790]], '#7fc0c8'); p.blob([[700, 730], [920, 706], [1260, 714], [1400, 760], [1200, 800], [820, 806]], '#a8dcdc');
      for (let i = 0; i < 20; i++) { const x = p.rr(700, 1400), y = p.rr(720, 810); p.ell(x, y, 24, 7, '#6fa890'); if (i % 2) p.poly([[x - 8, y - 2], [x, y - 22], [x + 8, y - 2]], '#f6a8c0'); }
      for (const r of [50, 90, 130]) { p.c.strokeStyle = 'rgba(255,255,255,0.9)'; p.c.lineWidth = 4; p.c.beginPath(); p.c.ellipse(1040, 770, r * 1.6, r * 0.36, 0, 0, 6.3); p.c.stroke(); }
      F(p, 1040, 800, 260, DURYO, { f: -1, lean: -24, aN: [150, 170], aF: [130, 160], lN: [40, 10], lF: [20, 0] }); p.blob([[900, 790], [1040, 760], [1180, 790], [1040, 830]], '#a8dcdc'); for (let i = 0; i < 16; i++) p.ell(p.rr(900, 1180), p.rr(600, 760), 6, 12, '#ffffff', 0.9);
      F(p, 420, 700, 190, DRAU, { f: 1, aN: [60, 120] }); F(p, 320, 702, 220, BHIMA, { f: 1, aN: [140, 160] }); F(p, 220, 704, 200, YUDH, { f: 1 }); F(p, 1640, 704, 200, { skin: '#a8c8a0', robe: '#5a7a8a', crown: 'horns', hair: '#2a3a44', sash: false, gold: '#cfe6c8' }, { f: -1 });
      for (let i = 0; i < 6; i++) p.eagle(p.rr(300, 1700), p.rr(140, 380), 46, { f: i % 2 ? 1 : -1, col: '#ffffff', crane: true, gold: '#f6c84a', head: '#ffffff', spread: 0.5 });
      p.pillar(60, 900, 150, 900, '#a8c8d0'); p.pillar(1940, 900, 150, 900, '#a8c8d0');
    }
  });
  // 11
  S.push({
    title: 'The Game of Dice', kanda: 'Sabha Parva', seed: 211, light: 1,
    text: 'Shakuni throws loaded dice and Yudhishthira cannot stop. He stakes his jewels, his army, his kingdom, his brothers, himself, and at last Draupadi, and loses every throw.',
    draw(p) {
      p.sky(['#2a2040', '#4a2f50', '#7a4a50', '#b87a50']);
      for (const x of [300, 600, 1400, 1700]) p.pillar(x, 660, 100, 660, '#5a4058'); p.rect(0, 0, W, 60, '#3a2a40'); p.fade('#7a4a50', 0.3);
      for (const x of [450, 1000, 1550]) { p.line(x, 0, x, 150, 4, '#c9a060'); p.lamp(x, 190, 22); scr(p, () => p.glow(x, 190, 330, '#ffb860', 0.5)); }
      // the vast shadow on the wall
      p.c.globalAlpha = 0.5; F(p, 1340, 700, 700, { skin: '#1c1428', cloth: '#1c1428', cloth2: '#1c1428', gold: '#1c1428', hair: '#1c1428', top: '#1c1428', crown: 'mukut', gem: '#1c1428', plain: true, f: -1, lean: 20, aN: [80, 120], aF: [60, 100] }); p.c.globalAlpha = 1;
      p.rect(0, 660, W, 200, '#6a4450'); p.poly([[500, 700], [1500, 700], [1700, 860], [300, 860]], '#8a3a3a'); p.poly([[560, 712], [1440, 712], [1600, 850], [400, 850]], '#a8503a');
      for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) p.rect(700 + i * 68, 730 + j * 30, 60, 26, (i + j) % 2 ? '#e6c890' : '#5a2a34');
      // the dice, enormous in the air
      scr(p, () => p.glow(1000, 430, 300, '#ffd890', 0.7));
      const die = (x, y, s, a) => { const c = p.c; c.save(); c.translate(x, y); c.rotate(a); p.poly([[-s, -s], [s, -s], [s, s], [-s, s]], '#f6ead0'); p.poly([[s, -s], [s * 1.4, -s * 1.3], [s * 1.4, s * 0.7], [s, s]], '#c9b890'); p.poly([[-s, -s], [-s * 0.6, -s * 1.3], [s * 1.4, -s * 1.3], [s, -s]], '#fffaf0'); for (const [u, v] of [[-0.5, -0.5], [0.5, 0.5], [0, 0], [-0.5, 0.5], [0.5, -0.5]]) p.circ(u * s, v * s, s * 0.14, '#8a2a2a'); c.restore(); };
      die(900, 420, 80, 0.4); die(1130, 500, 64, -0.3);
      F(p, 1380, 742, 230, { skin: '#b88a6a', robe: '#3a2a4a', drape: '#6a3a5a', crown: 'mukut', beard: '#2a2030', beardLen: 1.6, gold: '#c9a060', sash: false }, SIT, { f: -1, aN: [110, 140], aF: [60, 100], lean: 16 });
      F(p, 1520, 742, 230, DURYO, SIT, { f: -1, aN: [130, 160] });
      F(p, 640, 742, 230, YUDH, SIT, { f: 1, lean: 20, head: 20, aN: [40, 60], aF: [30, 50] });
      for (const [x, c] of [[500, BHIMA], [400, ARJUNA], [310, TWIN], [230, TWIN]]) F(p, x, 742, 210, c, SIT, { f: 1, head: 18 });
      F(p, 1700, 700, 250, KING, { f: -1, robe: '#5a4a6a', hair: '#e6e0d8' }); F(p, 1820, 702, 250, BHISHMA, { f: -1, head: 16 });
      p.crowd({ x0: 0, x1: 200, y: 720, jit: 14, h: 90, n: 8, col: '#2a2034', col2: '#4a2f44' }); p.pillar(60, 900, 160, 900, '#201828'); p.pillar(1940, 900, 160, 900, '#201828'); fg(p, 4, '#17121c', 870);
    }
  });
  // 12
  S.push({
    title: 'The Endless Garment', kanda: 'Sabha Parva', seed: 212, light: -1,
    text: 'Dragged into the hall, Draupadi asks the elders a question none will answer. When Dushasana seizes her robe she calls on Krishna, and the cloth unwinds without end until he falls exhausted in a mountain of silk.',
    draw(p) {
      p.sky(['#3a2a50', '#6a4468', '#b87a70', '#f0c090']);
      for (const x of [260, 540, 1460, 1740]) p.pillar(x, 680, 100, 680, '#7a5870'); p.rect(0, 0, W, 50, '#4a3450'); p.fade('#a86a70', 0.3);
      scr(p, () => { p.glow(1000, 60, 800, '#fff0c8', 0.95); p.rays(1000, 20, 34, 1300, '#fff3d0', 0.28, 30, 150); });
      p.c.globalAlpha = 0.5; F(p, 1000, 330, 560, KRISHNA, { fly: true, f: 1, skin: '#8fa8e0', aN: [70, 40], aF: [80, 50], lN: [3, 0], lF: [-3, 0], halo: '#fff6d8', haloR: 8 }); p.c.globalAlpha = 1; p.fade('#f6e0c0', 0.2, 0, 600);
      p.rect(0, 680, W, 180, '#8a5a62'); p.poly([[400, 700], [1600, 700], [1800, 860], [200, 860]], '#a86a5a');
      // the unending cloth
      const cols = ['#d9483b', '#f0b93a', '#e8703a', '#f6d36a', '#c9463a', '#f8e0a0'];
      for (let k = 0; k < 6; k++) { const P = []; for (let i = 0; i <= 16; i++) { const t = i / 16, a = t * 9 + k * 1.05, r = 60 + t * 520; P.push([1000 + Math.cos(a) * r, 660 - t * 620 + Math.sin(a) * r * 0.22]); } p.tube(P, t => 60 + 50 * Math.sin(t * 12 + k), 0, cols[k], 10); p.tube(P.map(q => [q[0], q[1] - 14]), 14, 14, lite(cols[k], 0.4), 10); }
      for (let i = 0; i < 30; i++) { const x = p.rr(520, 900), y = p.rr(700, 830); p.blob([[x - 90, y + 20], [x - 30, y - p.rr(20, 70)], [x + 40, y - p.rr(10, 50)], [x + 100, y + 24]], cols[i % 6]); }
      F(p, 1000, 780, 250, DRAU, { f: 1, aN: [164, 178], aF: [158, 176], halo: '#fff6d0', head: -24 });
      F(p, 700, 806, 250, { skin: '#b88a6a', top: '#5a4a7a', cloth: '#3a2a5a', cloth2: '#8a3a4a', crown: 'mukut', hair: '#17131f', broad: 1.3 }, { f: 1, lean: 30, aN: [80, 100], aF: [70, 96], lN: [50, -10], lF: [-10, -50] });
      for (const [x, c] of [[1360, YUDH], [1450, BHIMA], [1540, ARJUNA], [1620, TWIN], [1700, TWIN]]) F(p, x, 760, 200, c, SIT, { f: -1, head: 26, lean: 14 });
      F(p, 300, 730, 240, DURYO, SIT, { f: 1, aN: [120, 150] }); F(p, 180, 728, 250, BHISHMA, { f: 1, head: 28 });
      p.crowd({ x0: 1780, x1: W, y: 740, jit: 14, h: 100, n: 6, col: '#3a2840', col2: '#5a3a50' }); p.pillar(40, 900, 130, 900, '#2a1c30'); p.pillar(1960, 900, 130, 900, '#2a1c30'); fg(p, 4, '#1c1422', 870);
    }
  });
  // 13
  S.push({
    title: 'The Hunter on the Mountain', kanda: 'Vana Parva', seed: 213, light: 1,
    text: 'Arjuna climbs the Himalaya to win divine weapons and quarrels with a wild hunter over a boar both have shot. He fights until his strength is gone, then sees the garland he offered to Shiva lying on the hunter\'s head.',
    draw(p) {
      p.sky(['#6f8fc8', '#a8bce0', '#dce0ec', '#f6ecd8']); p.sun(1650, 220, 60, '#ffffff', '#f0f0e0'); p.clouds({ n: 7, y0: 30, y1: 300, size: 170, col: '#fafaff', shadow: '#a0b0d8' });
      p.ridge({ y: 470, amp: 300, col: '#c8d4f0', col2: '#8f9fd0', seed: 44, oct: 5, lit: '#ffffff', freq: 0.003 }); p.ridge({ y: 600, amp: 200, col: '#a8b8e0', col2: '#7a8ac0', seed: 21, oct: 5, lit: '#f1f5ff' }); p.fade('#e6ecf8', 0.3);
      scr(p, () => { p.glow(1150, 360, 480, '#e6f0ff', 0.6); });
      F(p, 1150, 800, 720, { skin: '#9ab8d8', cloth: '#c9a060', cloth2: '#8a5a3a', crown: 'bun', hair: '#2a2a44', band: '#e6e6f0', gold: '#e6e6f0', broad: 1.35, halo: '#f0f6ff', haloR: 6, f: -1, lN: [20, 4], lF: [-20, -8], aN: [20, 50], aF: [60, 100], thread: true, prop: [{ type: 'trident', hand: 'F', ang: 176, len: 0.5 }, { type: 'bow', hand: 'N', ang: 170, len: 0.34 }] });
      p.serpent([[1150, 250], [1110, 280], [1160, 300], [1210, 280], [1230, 240]], 22, 16, '#4a6a5a', { hood: true });
      p.fade('#e6ecf8', 0.2);
      const g = p.ridge({ y: 760, amp: 40, col: '#f6f8ff', col2: '#a8b4d8', seed: 7, freq: 0.005, lit: '#ffffff' });
      p.forest({ x0: 0, x1: 380, base: g, h: 300, n: 6, col: '#4a6a70', col2: '#5f7a78', trunk: '#3a3a4a', kind: 'pine' }); p.forest({ x0: 1600, x1: W, base: g, h: 320, n: 6, col: '#4a6a70', col2: '#5f7a78', trunk: '#3a3a4a', kind: 'pine' });
      const A = F(p, 560, g(560) + 4, 200, ARJUNA, ARCH, { f: 1, crown: 'bun', top: null, cloth: '#b89a70', lean: -14, aF: [118, 120], aN: [122, -52], prop: { type: 'bow', hand: 'F', ang: 206, drawn: true, glow: '#fff0a0' } });
      p.blob([[800, 770], [840, 730], [920, 726], [960, 756], [940, 786], [830, 790]], '#3a3038'); p.circ(962, 760, 18, '#3a3038'); p.arrow(880, 660, 870, 740, '#5a4038', 3); p.arrow(910, 650, 905, 736, '#e6e6f0', 3);
      for (let i = 0; i < 200; i++) p.circ(p.rr(0, W), p.rr(0, H), p.rr(1.5, 4), '#ffffff', 0.8); fg(p, 6, '#3a4460', 868);
    }
  });
  // 14
  S.push({
    title: 'Bhima and the Old Monkey', kanda: 'Vana Parva', seed: 214, light: 1,
    text: 'Searching for a thousand-petalled lotus, Bhima finds an old monkey lying across the path and tries to move its tail aside. He cannot lift it. The monkey is Hanuman, his own elder brother, both sons of the Wind.',
    draw(p) {
      p.sky(['#a8c8d8', '#d6e0d0', '#f6eccc', '#f6e0b0']); p.sun(1500, 230, 60, '#fff8dc', '#ffeab0'); p.clouds({ n: 5, y0: 40, y1: 240, size: 150, col: '#fdf8ea', shadow: '#b8c8d0' });
      p.ridge({ y: 470, amp: 180, col: '#b0c4d0', col2: '#d0d8c0', seed: 51, lit: '#f1f5f0' }); p.forest({ x0: 0, x1: W, base: 590, jit: 10, h: 250, n: 22, col: '#9fba9c', col2: '#b8c690', trunk: '#8f8480' }); p.fade('#f3e8c0', 0.4);
      for (let i = 0; i < 12; i++) p.tree(p.rr(0, W), 640 + p.rr(-10, 20), p.rr(220, 320), { kind: 'palm', col: '#7fa870', trunk: '#8a7a60' });
      p.rays(1500, 230, 18, 1500, '#fff6d0', 0.18, 80, 200);
      const g = p.ridge({ y: 740, amp: 18, col: '#c8c080', col2: '#8a8a58', seed: 6, freq: 0.004 });
      p.poly([[0, 760], [W, 720], [W, 800], [0, 860]], '#e0cf9a', 0.8);
      // the reclining Hanuman
      scr(p, () => p.glow(1250, 560, 520, '#fff0c0', 0.5));
      const Hn = F(p, 1300, 700, 620, HANU, { fly: true, f: -1, skin: '#c9a070', muzzle: '#f1d6c0', hair: '#e6dcd0', lean: 62, head: -50, lN: [78, 30], lF: [88, 86], aN: [100, 170], aF: [30, 70], tail: false, crown: 'none', gold: '#e6c878' });
      p.tube([[Hn.hip[0] + 40, Hn.hip[1] + 20], [1400, 800], [1100, 790], [860, 770], [640, 790], [520, 760]], 56, 30, '#b88a5a'); p.tube([[Hn.hip[0] + 40, Hn.hip[1] + 10], [1400, 790], [1100, 780], [860, 760], [640, 780], [520, 752]], 24, 12, '#deb888');
      const B = F(p, 610, 790, 250, BHIMA, { f: 1, lean: 34, lN: [50, -10], lF: [-20, -50], aN: [50, 30], aF: [40, 20], crown: 'bun' });
      p.line(B.hip[0] - 70, B.hip[1] + 100, B.hip[0] - 60, B.hip[1] + 110, 1, '#000', 0); p.rock(300, 800, 200, 80, '#9a8a70');
      p.grass(0, W, g, 22, '#98a45c', 120); for (let i = 0; i < 40; i++) p.circ(p.rr(0, W), p.rr(750, 840), p.rr(3, 6), p.r() < 0.5 ? '#f8b0c0' : '#fff6d0');
      p.tree(80, 920, 900, { col: '#3f5f4a', trunk: '#241a26' }); p.tree(1930, 900, 700, { kind: 'palm', col: '#3f5f4a', trunk: '#241a26' }); fg(p, 3, '#2a2e26'); p.birds(9, 300, 100, 1000, 300, '#6a7a80', 7);
    }
  });
  // 15
  S.push({
    title: "The Yaksha's Questions", kanda: 'Vana Parva', seed: 215, light: -1,
    text: 'One by one four brothers drink from a forest lake against the warning of its unseen guardian, and fall. Yudhishthira answers every riddle of the Yaksha, and when offered one life back, chooses fairly.',
    draw(p) {
      p.sky(['#2f3f5a', '#5a6a80', '#9aa898', '#d6d0a8']); p.sun(1000, 200, 60, '#f6f6e0', '#d6dcc0'); p.clouds({ n: 6, y0: 30, y1: 260, size: 180, col: '#6a7a8a', shadow: '#33405a', light: '#c8d0c0' });
      p.ridge({ y: 500, amp: 100, col: '#5a6f7a', col2: '#7a8a88', seed: 9 }); p.forest({ x0: -40, x1: W, base: 590, jit: 10, h: 330, n: 20, col: '#4f6a6a', col2: '#5f7a68', trunk: '#3a4450' }); p.fade('#8a9a98', 0.3);
      p.sea(600, '#b8c8b8', '#3f5a6a', '#e6f0e0', 1000, 760);
      scr(p, () => { p.glow(1000, 400, 460, '#d6f0e6', 0.7); p.rays(1000, 300, 16, 900, '#e0f6ec', 0.16, 40, 140); });
      p.c.globalAlpha = 0.6; F(p, 1000, 430, 560, { skin: '#a8d8c8', cloth: '#5f9a90', cloth2: '#d6f0e6', gold: '#e6fff0', hair: '#3f6a6a', crown: 'mukut', gem: '#a8ffe0', broad: 1.3, fly: true, f: -1, aN: [40, 90], aF: [70, 110], lN: [3, 0], lF: [-3, 0], halo: '#d6fff0', haloR: 7 }); p.c.globalAlpha = 1;
      p.fade('#a8c8c0', 0.24, 300, 740);
      p.eagle(1180, 640, 120, { f: -1, col: '#f1f1ea', crane: true, gold: '#e8b84a', head: '#f1f1ea', tip: '#3a3a4a', up: 0.4, spread: 0.2 });
      for (let i = 0; i < 26; i++) { const x = p.rr(300, 1700), y = p.rr(640, 750); p.ell(x, y, 30, 8, '#4f7a68'); if (i % 3 === 0) p.poly([[x - 9, y - 2], [x, y - 24], [x + 9, y - 2]], '#f6c8d6'); }
      const g = p.ridge({ y: 770, amp: 16, col: '#7a8a6a', col2: '#3a4440', seed: 5, freq: 0.004 });
      for (const [x, c, f] of [[380, BHIMA, 1], [1420, ARJUNA, -1], [1620, TWIN, -1], [200, TWIN, 1]]) F(p, x, 806, 200, c, { fly: true, f: f, crown: 'bun', top: null, lean: 86, lN: [86, 90], lF: [80, 84], aN: [110, 130], aF: [70, 80] });
      F(p, 760, 800, 220, YUDH, PRAY, { f: 1, crown: 'bun', top: null, head: -14 });
      p.grass(0, W, g, 22, '#5a6a54', 130); p.tree(70, 920, 950, { col: '#263a38', trunk: '#17131e' }); p.tree(1930, 920, 950, { col: '#2a3f3a', trunk: '#17131e' }); fg(p, 5, '#17131e');
    }
  });
  // 16
  S.push({
    title: 'One Chariot Against an Army', kanda: 'Virata Parva', seed: 216, light: 1,
    text: 'In the thirteenth year of hiding, the Kauravas raid the cattle of King Virata. Arjuna, disguised as a dancing-master, takes the reins from a frightened prince and rides out alone to meet them.',
    draw(p) {
      p.sky(['#7f9ad0', '#c0bfe0', '#f3d6c4', '#fbe4b0']); p.sun(400, 360, 64, '#fff3c8', '#ffd49a'); p.rays(400, 360, 26, 1700, '#ffe9c0', 0.18, -60, 80);
      p.clouds({ n: 8, y0: 30, y1: 300, size: 180, col: '#fbeee6', shadow: '#a8a0d0' });
      p.ridge({ y: 560, amp: 60, col: '#b0a4c8', col2: '#d0b8c0', seed: 13 }); p.fade('#f3dcc8', 0.25);
      const far = p.ridge({ y: 640, amp: 20, col: '#d0b890', col2: '#b89a78', seed: 4 });
      p.crowd({ x0: 900, x1: W, y: 640, jit: 26, h: 30, n: 320, col: '#5a4a6a', col2: '#8a5a5a', spears: 0.6, banners: 0.05, bannerCol: '#b8323a', dir: -1 });
      for (const x of [1100, 1300, 1480, 1650, 1820]) p.quad(x, 650 + p.rr(-12, 12), 80, { kind: 'elephant', f: -1, col: '#8a8494', cloth: '#8a2f3a' });
      for (const x of [1000, 1200, 1400, 1600, 1800]) p.chariot(x, 690 + p.rr(-8, 8), 70, { f: -1, col: '#6a4a44', horse: '#4a3a40', canopyCol: '#8a2f3a', flag: '#b8323a', horses: 2, gait: 'stand' });
      for (let i = 0; i < 20; i++) p.circ(p.rr(700, W), p.rr(650, 720), p.rr(40, 100), '#e6caa0', 0.35);
      const g = p.ridge({ y: 760, amp: 16, col: '#d6c08a', col2: '#8a7450', seed: 6, freq: 0.004 });
      const d = p.chariot(430, 790, 210, { f: 1, col: '#b0763a', horse: '#fbf6ea', canopyCol: '#e8a33a', flag: '#f6d36a', horses: 4 });
      F(p, d.x + 30, d.y, 250, ARJUNA, ARCH, { f: 1, crown: 'none', longhair: true, top: null, robe: '#d9483b', drape: '#f0b93a', halo: '#fff3c0', prop: { type: 'bow', hand: 'F', ang: 176, drawn: true, glow: '#fff0a0', len: 0.46 } });
      F(p, d.x + 110, d.y, 170, TWIN, KNEEL, { f: 1, aN: [150, 170], aF: [140, 166], lean: -16 });
      scr(p, () => p.rays(d.x + 190, d.y - 190, 12, 900, '#fff0b0', 0.3, -16, 16)); p.volley(40, 800, 300, 1500, 600, 180, 80, '#3a2a40', 2, 12);
      for (let i = 0; i < 12; i++) p.quad(p.rr(60, 900), 820 + p.rr(-16, 30), p.rr(50, 70), { kind: 'deer', f: -1, col: ['#f1ead8', '#c9a880', '#8a6a54'][i % 3], antlers: false, gait: 'walk', mane: '#5a4a40' });
      p.grass(0, W, g, 20, '#a89a5a', 110); fg(p, 2, '#3a2a36', 868); p.birds(12, 700, 80, 1600, 300, '#5a4f77', 8);
    }
  });
  // 17
  S.push({
    title: 'The Envoy Reveals Himself', kanda: 'Udyoga Parva', seed: 217, light: -1,
    text: 'Krishna comes to Hastinapura to ask for five villages and peace. Duryodhana orders him seized. Krishna laughs, and the court is blinded as every god and every warrior blazes out of his body.',
    draw(p) {
      p.sky(['#2a2448', '#5a3f6a', '#b8805a', '#f6d08a']);
      for (const x of [240, 520, 1480, 1760]) p.pillar(x, 700, 100, 700, '#6a4a66'); p.rect(0, 0, W, 50, '#3a2a44'); p.fade('#a8705a', 0.3);
      scr(p, () => { p.glow(1000, 330, 900, '#fff0b0', 0.95); p.rays(1000, 330, 46, 1500, '#fff6c8', 0.3); });
      for (const [dx, dy, s, f] of [[-330, -40, 240, -1], [330, -40, 240, 1], [-520, 90, 200, -1], [520, 90, 200, 1], [-190, -190, 210, -1], [190, -190, 210, 1]]) { p.c.globalAlpha = 0.6; F(p, 1000 + dx, 520 + dy, s, { skin: '#ffe6a8', cloth: '#f6c85a', cloth2: '#f6a03a', gold: '#fff6d0', hair: '#c98a3a', fly: true, f: f, lean: 14, aN: [140, 160], aF: [100, 130], lN: [10, 0], lF: [-10, -10] }, { prop: { type: ['mace', 'bow', 'trident', 'sword', 'spear', 'chakra'][Math.abs(dx + dy) % 6 | 0], hand: 'N', ang: 170, len: 0.4 } }); p.c.globalAlpha = 1; }
      F(p, 1000, 730, 640, KRISHNA, { f: 1, heads: 3, arms: [[150, 176], [120, 150], [96, 120], [150, 120], [60, 100], [176, 150]], aN: [140, 166], aF: [80, 110], halo: '#fff6c0', haloR: 9, broad: 1.3, lN: [14, 2], lF: [-14, -4], prop: [{ type: 'chakra', hand: 'N' }, { type: 'mace', hand: 'F', ang: 100, len: 0.3 }] });
      scr(p, () => p.glow(1000, 300, 420, '#fffbe0', 0.5));
      p.rect(0, 700, W, 160, '#7a4a52'); p.poly([[300, 720], [1700, 720], [1900, 860], [100, 860]], '#9a5a4a');
      for (const [x, c, f] of [[420, DURYO, 1], [300, KARNA, 1], [1580, BHISHMA, -1], [1700, DRONA, -1]]) F(p, x, 790, 230, c, { f: f, lean: -22, aN: [130, 100], aF: [120, 96], lN: [10, 20], lF: [-30, -10], head: -10 });
      F(p, 180, 790, 230, KING, { f: 1, robe: '#5a4a6a', hair: '#e6e0d8', aN: [130, 100] });
      p.crowd({ x0: 500, x1: 800, y: 800, jit: 14, h: 100, n: 10, col: '#3a2840', col2: '#6a3a44', spears: 0.5, arms: 0.5 }); p.crowd({ x0: 1200, x1: 1500, y: 800, jit: 14, h: 100, n: 10, col: '#3a2840', col2: '#6a3a44', spears: 0.5, arms: 0.5 });
      p.pillar(40, 900, 120, 900, '#241a2c'); p.pillar(1960, 900, 120, 900, '#241a2c'); fg(p, 4, '#1c1422', 872);
    }
  });
  // 18
  S.push({
    title: 'The Field of Kurukshetra', kanda: 'Bhishma Parva', seed: 218, light: 1,
    text: 'Eighteen armies face each other across the plain at sunrise. Conches sound from both sides until earth and sky ring, and the white horses of one chariot walk out into the space between.',
    draw(p) {
      p.sky(['#6a7ac0', '#b0a8dc', '#f3c8b8', '#fde2a8']); p.sun(1000, 520, 80, '#fff3c0', '#ffc890'); p.rays(1000, 520, 44, 1500, '#ffe6b8', 0.2, 180, 360);
      p.clouds({ n: 9, y0: 30, y1: 330, size: 200, col: '#f6dcd6', shadow: '#9a90c8', light: '#fff0d0' }); p.streaks({ n: 14, y0: 380, y1: 520, col: '#fff0d6' });
      p.ridge({ y: 560, amp: 26, col: '#b8a0c0', col2: '#d6b8b0', seed: 4 }); p.fade('#f6d6b8', 0.3, 440, 660);
      for (const side of [-1, 1]) {
        const x0 = side < 0 ? 0 : 1140, x1 = side < 0 ? 860 : W, c1 = side < 0 ? '#c9a060' : '#5a4a6a', c2 = side < 0 ? '#e6d0a0' : '#8a5a5a', bc = side < 0 ? '#f0c85a' : '#b8323a';
        p.crowd({ x0: x0, x1: x1, y: 590, jit: 10, h: 16, n: 260, col: c1, col2: c2, spears: 0.6, banners: 0.05, bannerCol: bc, dir: -side });
        for (let i = 0; i < 5; i++) p.quad(x0 + 80 + i * 150, 620 + p.rr(-8, 8), 60, { kind: 'elephant', f: -side, col: side < 0 ? '#a8a0a8' : '#7a7486', cloth: bc });
        p.crowd({ x0: x0, x1: x1, y: 660, jit: 22, h: 36, n: 180, col: c1, col2: c2, spears: 0.6, banners: 0.06, bannerCol: bc, dir: -side });
        for (let i = 0; i < 4; i++) p.chariot(side < 0 ? 180 + i * 190 : 1820 - i * 190, 730 + p.rr(-10, 14), 90, { f: -side, col: side < 0 ? '#b0763a' : '#6a4a44', horse: side < 0 ? '#f1e6d0' : '#4a3a40', canopyCol: bc, flag: bc, horses: 2, gait: 'stand' });
        p.crowd({ x0: x0 - 40, x1: x1 + 40, y: 800, jit: 30, h: 70, n: 60, col: dark(c1, 0.2), col2: c2, spears: 0.7, banners: 0.08, bannerCol: bc, dir: -side });
      }
      for (let i = 0; i < 16; i++) p.circ(p.rr(0, W), p.rr(600, 700), p.rr(40, 110), '#f0d0a8', 0.25);
      p.poly([[900, 600], [1100, 600], [1300, 860], [700, 860]], '#e6c898', 0.7);
      const d = p.chariot(960, 770, 170, { f: 1, col: '#b0763a', horse: '#ffffff', canopyCol: '#f0c85a', flag: '#f6e0a0', horses: 4, gait: 'walk' });
      F(p, d.x - 10, d.y, 190, ARJUNA, { f: 1, aN: [150, 130], prop: { type: 'bow', hand: 'F', ang: 176 } }); F(p, d.x + 80, d.y, 180, KRISHNA, { f: 1, aN: [70, 40] });
      scr(p, () => p.glow(d.x + 20, d.y - 130, 240, '#fff3c0', 0.5)); p.birds(30, 200, 60, 1800, 330, '#3a3055', 9);
    }
  });
  // 19
  S.push({
    title: 'The Universal Form', kanda: 'Bhishma Parva', seed: 219, light: -1,
    text: 'Arjuna lowers his bow, unable to fight his own kin. His charioteer speaks the Gita, and then shows him what he truly is: a form with countless mouths and eyes, brighter than a thousand suns, into which the armies are rushing.',
    draw(p) {
      p.sky(['#141433', '#33306a', '#8a5a90', '#f0b070']); p.stars(260, 420);
      p.clouds({ n: 8, y0: 420, y1: 620, size: 220, col: '#6a4f88', shadow: '#2a2456', light: '#f6c090' });
      scr(p, () => { p.glow(1000, 300, 980, '#ffe6a0', 0.95); p.rays(1000, 300, 60, 1600, '#fff3c0', 0.3); for (let i = 0; i < 9; i++) p.glow(1000 + Math.cos(i * 0.7) * 620, 300 + Math.sin(i * 0.7) * 260, 90, ['#ffd0a0', '#c0d0ff', '#ffe0f0'][i % 3], 0.8); });
      for (const r of [330, 520, 720]) { p.c.strokeStyle = 'rgba(255,240,190,0.5)'; p.c.lineWidth = 5; p.c.beginPath(); p.c.ellipse(1000, 330, r, r * 0.5, 0, 0, 6.3); p.c.stroke(); }
      const arms = []; for (let i = 0; i < 12; i++) arms.push([40 + i * 13, 70 + i * 11]);
      F(p, 1000, 800, 880, KRISHNA, { f: 1, skin: '#5a7ad0', heads: 4, arms: arms, aN: [150, 176], aF: [110, 140], halo: '#fff6c0', haloR: 10, broad: 1.35, lN: [10, 2], lF: [-10, -3], prop: [{ type: 'chakra', hand: 'N' }, { type: 'mace', hand: 'F', ang: 110, len: 0.24 }] });
      F(p, 1000, 800, 880, KRISHNA, { f: -1, skin: '#5a7ad0', arms: arms, aN: [150, 176], aF: [110, 140], broad: 1.35, lN: [10, 2], lF: [-10, -3], crown: 'none', sash: false, prop: [{ type: 'trident', hand: 'N', ang: 176, len: 0.3 }] });
      F(p, 1000, 800, 880, KRISHNA, { f: 1, skin: '#5a7ad0', heads: 4, aN: [30, 80], aF: [20, 70], broad: 1.35, lN: [10, 2], lF: [-10, -3], halo: '#fff6c0', haloR: 6 });
      p.fade('#f6c890', 0.16, 0, 760); scr(p, () => p.glow(1000, 150, 300, '#ffffff', 0.5));
      p.ridge({ y: 700, amp: 30, col: '#7a5a80', col2: '#3a2a4a', seed: 6 });
      p.crowd({ x0: 0, x1: 760, y: 740, jit: 26, h: 34, n: 160, col: '#c9a060', col2: '#8a6a50', spears: 0.6, banners: 0.05, bannerCol: '#f0c85a' }); p.crowd({ x0: 1240, x1: W, y: 740, jit: 26, h: 34, n: 160, col: '#4a3a5a', col2: '#7a4a50', spears: 0.6, banners: 0.05, bannerCol: '#b8323a', dir: -1 });
      const d = p.chariot(560, 800, 150, { f: 1, col: '#b0763a', horse: '#ffffff', canopyCol: '#f0c85a', flag: '#f6e0a0', horses: 4, gait: 'stand' });
      F(p, d.x + 10, d.y, 170, ARJUNA, KNEEL, PRAY, { f: 1, head: -30 }); p.curve([[d.x - 60, d.y - 20], [d.x - 40, d.y - 80], [d.x - 70, d.y - 140]], 6, '#c99a4a');
      fg(p, 4, '#17121f', 870);
    }
  });
  // 20
  S.push({
    title: 'The Bed of Arrows', kanda: 'Bhishma Parva', seed: 220, light: -1,
    text: 'On the tenth day the grandsire Bhishma falls, so pierced that his body rests on arrow-shafts and never touches the ground. Both armies lay down their weapons. Arjuna shoots into the earth, and a spring rises to his lips.',
    draw(p) {
      p.sky(['#3a3a78', '#7a5a98', '#e08a70', '#fbc880']); p.sun(1450, 520, 90, '#fff0c0', '#ff9a60'); p.rays(1450, 520, 30, 1600, '#ffd8a0', 0.18, 170, 370);
      p.clouds({ n: 9, y0: 30, y1: 330, size: 210, col: '#7a5a90', shadow: '#33295a', light: '#f6a880' }); p.streaks({ n: 14, y0: 380, y1: 520, col: '#ffc8a0' });
      p.ridge({ y: 590, amp: 30, col: '#7a5a88', col2: '#a8707a', seed: 6 }); p.fade('#e89a78', 0.25, 460, 680);
      p.crowd({ x0: 0, x1: W, y: 620, jit: 14, h: 24, n: 300, col: '#4a3a5a', col2: '#7a4a55', spears: 0.6, banners: 0.05, bannerCol: '#b8323a' });
      const g = p.ridge({ y: 720, amp: 14, col: '#a8786a', col2: '#4a3440', seed: 3, freq: 0.004 });
      // the bed
      for (let i = 0; i < 70; i++) { const x = 720 + i * 8.5 + p.rr(-4, 4); p.line(x, 760 + p.rr(-6, 10), x + p.rr(-22, 22), 610 + p.rr(-16, 16), 3, i % 3 ? '#4a3440' : '#e6c890'); }
      scr(p, () => p.glow(1000, 560, 380, '#fff0c8', 0.6));
      F(p, 1000, 640, 520, BHISHMA, { fly: true, f: 1, lean: 84, head: -18, lN: [84, 90], lF: [78, 84], aN: [70, 90], aF: [100, 96], halo: '#fff6e0' });
      for (let i = 0; i < 26; i++) { const x = 760 + i * 20 + p.rr(-6, 6); p.arrow(x + p.rr(-30, 30), 470 + p.rr(-30, 20), x, 600 + p.rr(-10, 16), i % 2 ? '#e6c890' : '#5a4050', 3); }
      scr(p, () => p.glow(1330, 700, 110, '#d6f0ff', 0.9)); p.tube([[1340, 760], [1330, 660], [1290, 610], [1250, 630]], 14, 5, '#e6f6ff'); for (let i = 0; i < 16; i++) p.circ(p.rr(1230, 1360), p.rr(600, 690), p.rr(2, 5), '#ffffff');
      F(p, 1560, 790, 240, ARJUNA, ARCH, { f: -1, lean: 12, aF: [60, 50], aN: [80, 130], prop: { type: 'bow', hand: 'F', ang: 130 } }); F(p, 1680, 792, 230, KRISHNA, { f: -1 });
      for (const [x, c, f] of [[300, DURYO, 1], [420, KARNA, 1], [540, DRONA, 1], [180, YUDH, 1], [1800, BHIMA, -1]]) F(p, x, 794, 220, c, { f: f, head: 24, lean: 8 });
      p.crowd({ x0: 0, x1: 120, y: 800, jit: 10, h: 110, n: 4, col: '#2a2034' }); for (let i = 0; i < 10; i++) { const x = p.rr(100, 1900); p.line(x, 830, x + p.rr(-20, 20), 760, 3, '#3a2a36'); }
      fg(p, 5, '#1c1422', 868); p.birds(18, 200, 60, 1800, 330, '#241c30', 9);
    }
  });
  // 21
  S.push({
    title: 'Abhimanyu in the Wheel', kanda: 'Drona Parva', seed: 221, light: -1,
    text: 'Arjuna\'s sixteen-year-old son knows how to break into the spinning wheel formation but not how to leave it. Cut off, his chariot and weapons gone, he fights on with a broken wheel in his hands.',
    draw(p) {
      p.sky(['#5a4a70', '#8a6a80', '#c89a80', '#e0c090']); p.rect(0, 0, W, H, '#b89a78'); p.sky(['#a88a70', '#b89a78', '#c0a47c', '#a88868']);
      for (let i = 0; i < 40; i++) p.ell(p.rr(0, W), p.rr(0, H), p.rr(100, 300), p.rr(40, 110), p.r() < 0.5 ? '#c8ac84' : '#a48a6c', 0.5);
      // rings of the formation, seen from above
      const cx = 1000, cy = 450;
      for (let ring = 7; ring >= 1; ring--) {
        const rx = 120 + ring * 122, ry = rx * 0.47, n = 26 + ring * 22, gap = ring * 0.9 + 0.4, col = ring % 2 ? '#4a3a5a' : '#6a3f4a';
        for (let i = 0; i < n; i++) { const a = i / n * 6.283 + ring * 0.3; let da = Math.abs(((a - gap + 9.42) % 6.283) - 3.1416); if (da < 0.22) continue; const x = cx + Math.cos(a) * rx * p.rr(0.97, 1.03), y = cy + Math.sin(a) * ry * p.rr(0.97, 1.03); if (y < -20 || y > H + 30) continue; const s = 22 + (y / H) * 30; p.mini(x, y, s, mix(col, '#8a5a5a', p.r() * 0.5), { spear: p.r() < 0.6, banner: p.r() < 0.04 ? '#b8323a' : null, dir: 1 }); }
        if (ring % 2 === 0) for (let k = 0; k < 4; k++) { const a = k * 1.57 + ring; const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; if (y > 60 && y < H - 40) p.quad(x, y, 46 + y / 30, { kind: 'elephant', f: Math.cos(a) > 0 ? -1 : 1, col: '#7a7486', cloth: '#8a2f3a' }); }
      }
      scr(p, () => { p.glow(cx, cy - 30, 300, '#fff0b8', 0.95); p.rays(cx, cy - 40, 30, 520, '#fff3c0', 0.34); });
      p.ell(cx, cy + 34, 150, 60, '#d6bc90');
      for (let i = 0; i < 14; i++) { const a = i * 0.45; p.arrow(cx + Math.cos(a) * 240, cy + Math.sin(a) * 110 - 40, cx + Math.cos(a) * 100, cy + Math.sin(a) * 46 - 10, '#3a2a36', 3); }
      p.poly([[cx - 150, cy + 30], [cx - 60, cy + 10], [cx - 40, cy + 50], [cx - 140, cy + 64]], '#8a5f3a'); p.wheel(cx - 150, cy + 30, 34, '#5a3f34', '#c9a060');
      const A = F(p, cx, cy + 50, 190, ARJUNA, { f: 1, cloth2: '#d9483b', top: '#f2c85a', lN: [24, 4], lF: [-22, -8], aN: [160, 176], aF: [150, 172], halo: '#fff3c0' });
      p.wheel((A.hN[0] + A.hF[0]) / 2, A.hN[1] - 50, 62, '#6a4634', '#f0c85a');
      for (const [dx, dy, c, f] of [[-250, 30, KARNA, 1], [250, 20, DRONA, -1], [-170, 120, DURYO, 1], [190, 130, SOLD, -1], [0, 180, SOLD, 1], [-120, -110, SOLD, 1], [130, -110, SOLD, -1]]) F(p, cx + dx, cy + dy + 60, 150, c, ARCH, { f: f, prop: { type: 'bow', hand: 'F', ang: 176, drawn: true } });
      p.fade('#e0c8a0', 0.12); for (let i = 0; i < 16; i++) p.circ(p.rr(0, W), p.rr(0, H), p.rr(60, 140), '#e6d0a8', 0.22);
    }
  });
  // 22
  S.push({
    title: 'The Fall of Ghatotkacha', kanda: 'Drona Parva', seed: 222, light: 1,
    text: 'When the war runs on into the night, Bhima\'s demon son grows mountainous and rains fire on the Kauravas. Karna is forced to spend the one infallible spear he had saved for Arjuna. Dying, the giant falls on the enemy host.',
    draw(p) {
      p.sky(['#0e1230', '#232a60', '#4a4a88', '#8a6a90']); p.stars(280, 520); p.sun(250, 170, 70, '#f6f6e6', '#aab8e6');
      p.clouds({ n: 8, y0: 30, y1: 330, size: 200, col: '#3f4a88', shadow: '#1c2250', light: '#b8c0e6' });
      p.ridge({ y: 640, amp: 40, col: '#3a3a70', col2: '#5a4a78', seed: 6 });
      scr(p, () => { p.glow(1080, 330, 620, '#ffd890', 0.85); p.rays(1080, 330, 36, 1100, '#fff0c0', 0.3); });
      F(p, 1040, 330, 760, { skin: '#5a7a70', cloth: '#7a3a3a', cloth2: '#e8703a', crown: 'none', hair: '#17131f', fangs: true, gold: '#f0c85a', broad: 1.5, fly: true, f: -1, lean: -62, head: 30, lN: [60, 20], lF: [20, -30], aN: [176, 150], aF: [130, 176], plain: false, prop: { type: 'mace', hand: 'F', ang: 150, len: 0.3 } });
      // the Shakti spear
      scr(p, () => { p.glow(1090, 330, 200, '#ffffff', 1); }); p.line(1640, 720, 1100, 336, 12, '#fff6c0'); p.line(1640, 720, 1100, 336, 4, '#ffffff'); p.poly([[1100, 336], [1150, 340], [1122, 380]], '#ffffff');
      for (let i = 0; i < 9; i++) { const a = p.rr(0, 6.28), l = p.rr(140, 330); p.curve([[1090, 332], [1090 + Math.cos(a) * l * 0.5 + p.rr(-30, 30), 332 + Math.sin(a) * l * 0.5 + p.rr(-30, 30)], [1090 + Math.cos(a) * l, 332 + Math.sin(a) * l]], 4, '#fffbe6'); }
      for (let i = 0; i < 14; i++) p.fire(p.rr(300, 1500), p.rr(560, 700), p.rr(40, 90), p.rr(70, 160));
      const g = p.ridge({ y: 740, amp: 16, col: '#4a4070', col2: '#1c1830', seed: 3, freq: 0.004 });
      p.crowd({ x0: 0, x1: W, y: 730, jit: 30, h: 40, n: 260, col: '#2a2448', col2: '#5a3a50', spears: 0.6, banners: 0.05, bannerCol: '#b8323a', arms: 0.4 });
      for (let i = 0; i < 90; i++) p.lamp(p.rr(0, W), p.rr(690, 790), 4);
      const d = p.chariot(1660, 800, 150, { f: -1, col: '#8a5a3a', horse: '#c9b8a0', canopyCol: '#e8703a', flag: '#f2c85a', gait: 'stand' });
      F(p, d.x, d.y, 200, KARNA, { f: -1, aN: [120, 140], aF: [70, 30], halo: '#fff0b0', prop: { type: 'bow', hand: 'F', ang: 176 } });
      for (const x of [400, 800]) p.quad(x, 800, 110, { kind: 'elephant', f: 1, col: '#4a4a66', cloth: '#6a2f3a' });
      for (let i = 0; i < 140; i++) p.rect(p.rr(500, 1700), p.rr(0, 700), p.rr(2, 6), p.rr(2, 6), p.r() < 0.5 ? '#ffd890' : '#ffffff', p.rr(0.5, 1)); fg(p, 5, '#0c0a18', 868);
    }
  });
  // 23
  S.push({
    title: "Karna's Wheel", kanda: 'Karna Parva', seed: 223, light: 1,
    text: 'At the height of their duel the earth swallows the wheel of Karna\'s chariot, and the knowledge of his weapons leaves him as a curse foretold. He climbs down to free it, with the sun, his father, sinking behind him.',
    draw(p) {
      p.sky(['#4a3f80', '#9a6a98', '#f09a70', '#fdd088']); p.sun(1360, 470, 190, '#fff3c0', '#ff9a50'); p.rays(1360, 470, 40, 1500, '#ffd8a0', 0.2);
      p.clouds({ n: 8, y0: 30, y1: 300, size: 200, col: '#8a5a90', shadow: '#3a2f66', light: '#f6b080' }); p.streaks({ n: 16, y0: 330, y1: 560, col: '#ffcaa0', a: 0.6 });
      p.ridge({ y: 600, amp: 30, col: '#8a5a80', col2: '#b8707a', seed: 6 }); p.fade('#f0a070', 0.25, 460, 700);
      p.crowd({ x0: 0, x1: W, y: 630, jit: 14, h: 22, n: 260, col: '#4a3458', col2: '#7a4450', spears: 0.6, banners: 0.05, bannerCol: '#b8323a' });
      const g = p.ridge({ y: 730, amp: 18, col: '#b0786a', col2: '#4a3240', seed: 3, freq: 0.004 });
      // Karna's chariot, tilted
      p.c.save(); p.c.translate(1360, 760); p.c.rotate(0.16); p.chariot(0, 0, 200, { f: -1, col: '#8a5a3a', horse: '#c9b8a0', canopyCol: '#e8703a', flag: '#f2c85a', gait: 'stand', horses: 0 }); p.c.restore();
      p.quad(1040, 760, 130, { kind: 'horse', f: -1, col: '#d6c6b0', gait: 'gallop' }); p.quad(1000, 772, 130, { kind: 'horse', f: -1, col: '#b8a890', gait: 'gallop' });
      p.ell(1400, 780, 150, 34, '#3a2634'); p.wheel(1410, 742, 66, '#3a2430', '#c9a060'); p.ell(1410, 800, 130, 30, '#5a3a44');
      scr(p, () => p.glow(1500, 620, 240, '#ffe0a0', 0.6));
      F(p, 1520, 800, 290, KARNA, KNEEL, { f: -1, lean: 30, aN: [60, 70], aF: [50, 60], halo: '#fff0b0', head: -30 });
      const d = p.chariot(430, 780, 210, { f: 1, col: '#b0763a', horse: '#ffffff', canopyCol: '#f0c85a', flag: '#f6e0a0', horses: 4 });
      const A = F(p, d.x + 20, d.y, 260, ARJUNA, ARCH, { f: 1, prop: { type: 'bow', hand: 'F', ang: 176, drawn: true, glow: '#d6f0ff', len: 0.46 } }); F(p, d.x + 110, d.y, 220, KRISHNA, { f: 1, aN: [96, 100] });
      p.ribbon([[d.x - 30, d.y - 400], [d.x - 150, d.y - 420], [d.x - 260, d.y - 380]], 50, '#f6e0a0'); F(p, d.x - 110, d.y - 420, 70, HANU, SIT, { f: 1, tail: 1.2 });
      for (let i = 0; i < 14; i++) p.circ(p.rr(900, 1700), p.rr(720, 800), p.rr(40, 90), '#e6b090', 0.3);
      p.grass(0, W, g, 18, '#8a5a50', 90); fg(p, 2, '#241826', 868); p.birds(20, 200, 60, 1800, 330, '#2a1c36', 9);
    }
  });
  // 24
  S.push({
    title: 'The Duel at the Lake', kanda: 'Shalya Parva', seed: 224, light: -1,
    text: 'His army gone, Duryodhana hides beneath the waters of a lake. Called out, he chooses the mace and fights Bhima as an equal until Krishna slaps his own thigh, and Bhima remembers his vow.',
    draw(p) {
      p.sky(['#4a5a90', '#8a7aa8', '#e0a088', '#fbd098']); p.sun(1000, 500, 70, '#fff0c0', '#ffb080'); p.clouds({ n: 8, y0: 30, y1: 320, size: 200, col: '#8a70a0', shadow: '#3f3a70', light: '#f6b890' }); p.streaks({ n: 12, y0: 380, y1: 500, col: '#ffd0b0' });
      p.ridge({ y: 520, amp: 70, col: '#7a6aa0', col2: '#a8809a', seed: 16 }); p.forest({ x0: 0, x1: W, base: 560, jit: 6, h: 120, n: 34, col: '#5f6a8a', col2: '#6f7a80', trunk: '#4a4a66' });
      p.sea(562, '#f0c0a0', '#5a5a98', '#fff0c8', 1000, 700); p.fade('#f0b098', 0.2, 460, 700);
      const g = p.ridge({ y: 720, amp: 16, col: '#b89a7a', col2: '#5a4650', seed: 4, freq: 0.004 });
      for (let i = 0; i < 14; i++) p.circ(p.rr(600, 1400), p.rr(680, 780), p.rr(40, 110), '#e6c8a8', 0.35);
      scr(p, () => p.glow(1000, 480, 300, '#fff0c0', 0.6));
      const B = F(p, 800, 790, 480, BHIMA, { f: 1, lean: 14, lN: [34, 0], lF: [-30, -34], aN: [150, 170], aF: [130, 160], prop: { type: 'mace', hand: 'N', ang: 150, len: 0.34 } });
      const Du = F(p, 1210, 790, 470, DURYO, { f: -1, lean: 10, lN: [30, 0], lF: [-28, -30], aN: [120, 150], aF: [100, 130], prop: { type: 'mace', hand: 'N', ang: 140, len: 0.34 } });
      scr(p, () => { p.glow(1000, 330, 150, '#ffffff', 0.9); p.rays(1000, 330, 16, 300, '#fff6d0', 0.5); });
      F(p, 300, 780, 230, KRISHNA, { f: 1, aN: [40, 20] }); F(p, 190, 782, 250, { skin: '#f1e6dc', cloth: '#3f5a9a', cloth2: '#f6e0a0', crown: 'mukut', broad: 1.3 }, { f: 1, aN: [130, 150], prop: { type: 'staff', hand: 'F', ang: 180, len: 0.5 } });
      for (const [x, c] of [[420, YUDH], [1640, ARJUNA], [1740, TWIN], [1830, TWIN]]) F(p, x, 784, 210, c, { f: x < 1000 ? 1 : -1 });
      p.grass(0, W, g, 20, '#8a7a5a', 110); p.tree(60, 900, 760, { col: '#2f3a4a', trunk: '#1c1626' }); p.tree(1950, 900, 760, { col: '#2f3a4a', trunk: '#1c1626' }); fg(p, 5, '#1c1626', 868); p.birds(14, 300, 80, 1700, 330, '#3a3055', 8);
    }
  });
  // 25
  S.push({
    title: 'The Last Ascent', kanda: 'Svargarohana Parva', seed: 225, light: 1,
    text: 'The Pandavas leave their kingdom and walk north into the snows. One by one they fall, until only Yudhishthira and a dog remain. At the gate of heaven he refuses to enter without it, and the dog is revealed as Dharma.',
    draw(p) {
      p.sky(['#5f7fc8', '#a0b4e6', '#e0dcf0', '#fbf0dc']); p.stars(40, 160);
      p.clouds({ n: 8, y0: 20, y1: 260, size: 190, col: '#fafaff', shadow: '#a8b4e0' });
      scr(p, () => { p.glow(1500, 120, 760, '#fff6d8', 0.95); p.rays(1500, 110, 40, 1500, '#fffbe6', 0.28, 60, 220); });
      p.ridge({ y: 420, amp: 300, col: '#d0daf6', col2: '#98a8dc', seed: 61, oct: 5, lit: '#ffffff', freq: 0.003 }); p.ridge({ y: 560, amp: 220, col: '#b4c2ec', col2: '#8494cc', seed: 27, oct: 5, lit: '#f6f8ff' }); p.fade('#eef0fb', 0.3);
      // the chariot of Indra
      p.clouds({ n: 4, y0: 250, y1: 300, size: 130, col: '#fffaf0', shadow: '#d0c8e6', x0: 1280, x1: 1760 });
      const d = p.chariot(1560, 250, 150, { f: -1, col: '#f0d890', horse: '#ffffff', canopyCol: '#fff0b0', flag: '#fff6d0', gold: '#fff6c8', horses: 4, gait: 'gallop' });
      F(p, d.x, d.y, 180, { skin: '#f6e0c0', cloth: '#fff0b0', cloth2: '#f6d0a0', crown: 'mukut', gold: '#fff6d0', halo: '#fffbe6' }, { f: -1, aN: [70, 100] });
      for (let i = 0; i < 9; i++) p.rect(1320 - i * 62, 300 + i * 46, 100, 16, '#fff6d8', 0.75 - i * 0.05);
      const g = p.ridge({ y: 780, amp: 60, col: '#ffffff', col2: '#a8b6e0', seed: 8, tilt: -0.2, freq: 0.004, lit: '#ffffff' });
      F(p, 1000, g(1000) + 4, 210, YUDH, { f: 1, crown: 'bun', top: '#b89a70', cloth: '#b89a70', cloth2: '#8a6a4a', lean: 12, lN: [34, 6], lF: [-20, -30], aN: [60, 90], halo: '#fff6d8', prop: { type: 'staff', hand: 'F', ang: 176, len: 0.42 } });
      const dx = 880, dy = g(880) + 2; p.ell(dx, dy - 34, 44, 20, '#c9a880'); p.cap(dx + 34, dy - 44, dx + 56, dy - 62, 22, 16, '#c9a880'); p.poly([[dx + 52, dy - 72], [dx + 60, dy - 90], [dx + 66, dy - 70]], '#8a6a50'); for (const o of [-30, -14, 18, 32]) p.line(dx + o, dy - 26, dx + o + 3, dy, 8, '#b89870'); p.curve([[dx - 40, dy - 40], [dx - 62, dy - 62], [dx - 54, dy - 80]], 8, '#c9a880'); p.circ(dx + 60, dy - 64, 3, '#17131f');
      for (const [x, c, f] of [[640, BHIMA, 1], [470, ARJUNA, -1], [330, TWIN, 1], [210, TWIN, -1], [90, DRAU, 1]]) { F(p, x, g(x) - 4, 170, c, { fly: true, f: f, crown: 'bun', top: '#b89a70', cloth: '#b89a70', lean: 86, lN: [86, 90], lF: [80, 84], aN: [110, 130], aF: [70, 80] }); p.ell(x, g(x) + 2, 110, 16, '#ffffff', 0.85); }
      for (let i = 0; i < 260; i++) p.circ(p.rr(0, W), p.rr(0, H), p.rr(1.5, 4.5), '#ffffff', 0.85);
      p.forest({ x0: 1700, x1: W, base: g, h: 260, n: 4, col: '#4a6a70', col2: '#5f7a78', trunk: '#3a3a4a', kind: 'pine' }); fg(p, 6, '#3a4466', 870);
    }
  });

  Epic.scenes.mahabharata = S;
})();
