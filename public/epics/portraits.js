/* Rama and Krishna: portrait paintings (1200 x 1800) and extra Krishna landscapes. */
(function () {
  'use strict';
  const { mix, lite, dark } = Epic;
  const { F, scr, hut, boat, ARCH, PRAY, KNEEL, SIT, SAGE, KING, HANU } = Epic.kit;
  const RAMA = { skin: '#5f86b8', cloth: '#f0b93a', cloth2: '#e8703a', crown: 'bun', hair: '#1f1a2a', thread: true };
  const RAMA_K = Object.assign({}, RAMA, { crown: 'mukut' });
  const LAK = { skin: '#e0b287', cloth: '#5d8fb5', cloth2: '#f0b93a', crown: 'bun', hair: '#1f1a2a' };
  const SITA = { skin: '#e7b991', robe: '#d9483b', drape: '#f0b93a', longhair: true, crown: 'none', hair: '#1f1a2a', sash: false, aN: [14, 40], aF: [-6, 20] };
  const RAVAN = { skin: '#8f6f9c', cloth: '#6b2f4f', cloth2: '#c9463a', heads: 4, broad: 1.45, fangs: true, hair: '#1a1220', gold: '#f2c85a' };
  const KRISHNA = { skin: '#4a69a8', cloth: '#f2c23a', cloth2: '#e8703a', crown: 'mukut', feather: true, hair: '#17131f', gold: '#f6d77a' };
  const ARJUNA = { skin: '#d9a77c', cloth: '#f1ead8', cloth2: '#4f7fb5', crown: 'mukut', hair: '#1f1a2a', top: '#c9d2dc' };
  const DURYO = { skin: '#c99a78', top: '#6a4a8a', cloth: '#4a2f6a', cloth2: '#b8323a', crown: 'mukut', hair: '#17131f', broad: 1.35 };
  const KARNA = { skin: '#e0ae7a', top: '#f2c85a', cloth: '#e8703a', cloth2: '#f6e0a0', crown: 'mukut', hair: '#1f1a2a', gold: '#fff0a8' };
  const BHISHMA = { skin: '#d9b08c', top: '#dfe6ee', cloth: '#f1ead8', cloth2: '#9ab0c8', crown: 'mukut', hair: '#f1ece4', beard: '#f6f1ea', gold: '#e6ecf2' };
  const DRAU = { skin: '#b98866', robe: '#b8323a', drape: '#f0b93a', longhair: true, crown: 'none', hair: '#17131f', sash: false, aN: [14, 40], aF: [-6, 20] };
  const PW = 1200, PH = 1800;
  const base = (p, col, y) => { p.ridge({ y: (y || PH - 20), amp: 14, col: col, seed: 3, freq: 0.004 }); p.grass(0, p.W, (y || PH - 20) - 8, 30, col, 90); };
  const arch = (p, col, gold) => { p.pillar(110, 1560, 130, 1320, col); p.pillar(1090, 1560, 130, 1320, col); const c = p.c; c.strokeStyle = Epic.css(col); c.lineWidth = 90; c.beginPath(); c.ellipse(600, 300, 490, 240, 0, Math.PI, Math.PI * 2); c.stroke(); c.strokeStyle = Epic.css(gold); c.lineWidth = 12; c.beginPath(); c.ellipse(600, 300, 440, 200, 0, Math.PI, Math.PI * 2); c.stroke(); };
  const petals = (p, n, cols) => { for (let i = 0; i < n; i++) p.ell(p.rr(0, p.W), p.rr(0, p.H), p.rr(5, 11), p.rr(3, 6), cols[i % cols.length], 0.95, p.rr(0, 3)); };
  const R = [], K = [], KL = [];
  const P = (arr, o) => arr.push(Object.assign({ w: PW, h: PH }, o));

  // ---------------- Rama ----------------
  P(R, { title: 'Rama, Prince of Ayodhya', kanda: 'Bala Kanda', seed: 301, light: -1,
    text: 'Valmiki asks who in this world is truly virtuous, truthful and firm in his vows. Narada answers with one name: Rama of the line of Ikshvaku.',
    draw(p) {
      p.sky(['#8fa6da', '#cfc4e4', '#f8dcc4', '#fbe8b8']); p.sun(600, 620, 250, '#fff6d4', '#ffdc9c'); p.rays(600, 620, 40, 1500, '#fff0c4', 0.18);
      p.clouds({ n: 6, y0: 80, y1: 520, size: 150, col: '#fbf0e8', shadow: '#aaa2d4' });
      p.city({ x0: 0, x1: PW, base: 1320, h: 520, n: 16, col: '#e6cfa4', col2: '#d8acac', gold: '#fff0b0', peakX: 600, peakW: 500 }); p.fade('#f8e0c4', 0.45);
      arch(p, '#b88a7a', '#f6d77a'); p.rect(0, 1540, PW, 260, '#c8a48a'); for (let i = 0; i < 6; i++) p.rect(200 - i * 40, 1500 + i * 30, 800 + i * 80, 30, i % 2 ? '#e0c0a0' : '#c8a488');
      F(p, 600, 1500, 900, RAMA_K, { f: 1, lN: [12, 2], lF: [-12, -4], aN: [10, 30], aF: [40, 96], halo: '#fff6c8', haloR: 6, prop: { type: 'bow', hand: 'F', ang: 178, len: 0.44 } });
      petals(p, 120, ['#fbd0dc', '#fff3c0', '#f6a8b8']); p.lamp(240, 1560, 20); p.lamp(960, 1560, 20); base(p, '#5a3f4a');
    } });
  P(R, { title: 'Into the Forest', kanda: 'Ayodhya Kanda', seed: 302, light: 1,
    text: 'Rama walks into fourteen years of exile as calmly as he would have walked to his coronation. Sita follows him, and Lakshmana follows them both.',
    draw(p) {
      p.sky(['#c4d8c8', '#e6ecd0', '#f8f0cc', '#f0e0b0']); p.sun(820, 380, 90, '#fffbe0', '#fff0b4');
      p.forest({ x0: -60, x1: PW + 60, base: 1250, jit: 30, h: 900, n: 12, col: '#b0c8a8', col2: '#c6d0a4', trunk: '#a09890' }); p.fade('#f4ecc8', 0.5);
      p.forest({ x0: -60, x1: PW + 60, base: 1400, jit: 30, h: 1150, n: 7, col: '#86a884', col2: '#a0b47c', trunk: '#786a66', flowers: '#f6cad8' });
      p.rays(820, 380, 26, 1900, '#fff6cc', 0.26, 40, 150); p.fade('#f2e6b8', 0.25);
      const g = p.ridge({ y: 1500, amp: 30, col: '#c4c080', col2: '#7a8a54', seed: 6, freq: 0.004 }); p.poly([[520, 1480], [680, 1480], [1000, 1800], [200, 1800]], '#e4d4a0', 0.8);
      F(p, 640, 1560, 420, RAMA, { f: 1, lN: [22, 5], lF: [-20, -26], prop: { type: 'bow', hand: 'N', ang: 176 }, halo: '#fff6c8' });
      F(p, 460, 1590, 370, SITA, { f: 1, lN: [16, 4], lF: [-12, -16] }); F(p, 290, 1620, 400, LAK, { f: 1, lN: [22, 5], lF: [-20, -26], prop: { type: 'bow', hand: 'N', ang: 176 } });
      p.quad(960, 1540, 110, { kind: 'deer', f: -1, col: '#c9a070', spots: '#f6e6c8' }); p.grass(0, PW, g, 30, '#98a45c', 160);
      for (let i = 0; i < 60; i++) p.circ(p.rr(0, PW), p.rr(1520, 1780), p.rr(4, 8), p.r() < 0.5 ? '#f8d0dc' : '#fff4c4');
      p.tree(40, 1860, 1900, { col: '#35503f', trunk: '#241a26', spread: 0.28 }); p.tree(1180, 1880, 1700, { col: '#3b5540', trunk: '#241a26', spread: 0.26 }); p.birds(10, 200, 200, 1000, 700, '#6a7460', 9); base(p, '#2a2e28');
    } });
  P(R, { title: 'The Moonlit Hermitage', kanda: 'Aranya Kanda', seed: 303, light: -1,
    text: 'At Panchavati on the Godavari, Lakshmana builds a hut of bamboo and leaves. For a little while the exile is the happiest time of their lives.',
    draw(p) {
      p.sky(['#1c2452', '#3a4484', '#6e74a8', '#b0a4bc']); p.stars(260, 900); p.sun(860, 330, 110, '#f8f6e4', '#b4c0ea');
      p.clouds({ n: 6, y0: 100, y1: 600, size: 150, col: '#5a62a0', shadow: '#2a3066', light: '#ccd0ea' });
      p.ridge({ y: 1000, amp: 160, col: '#4a5890', col2: '#6a70a0', seed: 12 }); p.forest({ x0: 0, x1: PW, base: 1120, jit: 12, h: 260, n: 16, col: '#3f5a78', col2: '#4f6a70', trunk: '#2a2f50' });
      p.sea(1130, '#a8b0d4', '#2f3a78', '#f4f4e0', 860, 1420); scr(p, () => p.rays(860, 330, 16, 1700, '#d8def8', 0.14, 60, 130));
      const g = p.ridge({ y: 1440, amp: 24, col: '#5a6a86', col2: '#2f3a56', seed: 4, freq: 0.004 });
      p.tree(250, 1480, 900, { col: '#3f6a6e', trunk: '#2a2238', spread: 0.42, flowers: '#e8dcc0' }); hut(p, 330, 1470, 380); scr(p, () => p.glow(330, 1400, 200, '#ffc870', 0.8)); p.lamp(330, 1470, 14);
      F(p, 720, 1560, 400, RAMA, SIT, { f: -1, halo: '#e6e8ff', aN: [60, 90] }); F(p, 560, 1560, 360, SITA, SIT, { f: 1, aN: [60, 100] });
      F(p, 1020, 1520, 360, LAK, { f: -1, prop: { type: 'bow', hand: 'N', ang: 178 } }); p.quad(900, 1660, 120, { kind: 'deer', f: -1, col: '#a89a8a', spots: '#e6e6f0' });
      p.grass(0, PW, g, 26, '#4a6a70', 120); for (let i = 0; i < 40; i++) scr(p, () => p.glow(p.rr(0, PW), p.rr(900, 1700), p.rr(6, 14), '#e6ffb0', 0.9)); base(p, '#12101c');
    } });
  P(R, { title: 'Rama and Hanuman', kanda: 'Kishkindha Kanda', seed: 304, light: 1,
    text: 'Rama praises Hanuman\'s first speech to Lakshmana: no one could speak so without mastering the Vedas. From this meeting Hanuman is his for ever.',
    draw(p) {
      p.sky(['#86a6da', '#bccae8', '#f2deca', '#fbe8b8']); p.sun(900, 520, 110, '#fff8d4', '#ffe2a8'); p.rays(900, 520, 28, 1700, '#fff2c8', 0.16);
      p.clouds({ n: 7, y0: 80, y1: 620, size: 160, col: '#fdf4ea', shadow: '#a8aad6' });
      p.ridge({ y: 1050, amp: 260, col: '#a8a8ce', col2: '#c8bcce', seed: 41, peak: [300, 300, 300] }); p.ridge({ y: 1220, amp: 120, col: '#b2a68c', col2: '#cabb92', seed: 23, lit: '#e8d8aa' }); p.fade('#f2e2cc', 0.3);
      const g = p.ridge({ y: 1480, amp: 40, col: '#ba9c74', col2: '#7a6650', seed: 5, freq: 0.005, lit: '#e2c892' });
      for (const x of [140, 1050]) p.rock(x, g(x) + 30, 280, 170, '#9a8468');
      F(p, 740, 1560, 720, RAMA, { f: -1, aN: [50, 70], aF: [20, 40], halo: '#fff6c8', haloR: 6, prop: { type: 'bow', hand: 'F', ang: 176 } });
      F(p, 400, 1580, 620, HANU, KNEEL, PRAY, { f: 1, head: -16 }); scr(p, () => p.glow(560, 1150, 260, '#fff2c0', 0.5));
      p.grass(0, PW, g, 24, '#a89a60', 100); p.tree(1160, 1860, 1500, { col: '#40583f', trunk: '#241a26', spread: 0.26 }); p.birds(12, 100, 200, 900, 700, '#5a5a82', 9); base(p, '#2a2228');
    } });
  P(R, { title: 'Refuge for Vibhishana', kanda: 'Yuddha Kanda', seed: 305, light: -1,
    text: '"To anyone who comes to me even once and says, I am yours, I give safety from all beings. This is my vow." Rama accepts the brother of his enemy against every counsel of caution.',
    draw(p) {
      p.sky(['#4a5a94', '#8a82b4', '#e4a88c', '#fbd49c']); p.sun(300, 760, 100, '#fff2c4', '#ffb884'); p.clouds({ n: 8, y0: 60, y1: 640, size: 190, col: '#8a74a8', shadow: '#3f3a72', light: '#f6bc94' });
      p.sea(900, '#f2c4a4', '#4a5a98', '#fff2c8', 300, 1400); p.waves(1150, 1400, '#5a6aa4', 30, '#ffe8cc');
      scr(p, () => p.glow(520, 300, 420, '#fff0d0', 0.5));
      p.c.globalAlpha = 0.9; F(p, 520, 420, 300, { skin: '#a892b8', cloth: '#f1ead8', cloth2: '#c9a060', crown: 'mukut', gold: '#f2c85a', hair: '#1a1220', fly: true, f: 1, lean: 30, lN: [-40, -70], lF: [-20, -60] }, PRAY); p.c.globalAlpha = 1; p.ribbon([[440, 480], [300, 560], [160, 520], [40, 600]], 90, '#f6e6f0', 0.6);
      const g = p.ridge({ y: 1440, amp: 30, col: '#c9b48c', col2: '#6a5a50', seed: 9, freq: 0.005 });
      F(p, 760, 1540, 660, RAMA, { f: -1, aN: [150, 172], aF: [20, 50], halo: '#fff6c8', haloR: 6, prop: { type: 'bow', hand: 'F', ang: 176 } });
      F(p, 1010, 1560, 420, LAK, { f: -1 }); F(p, 300, 1580, 440, HANU, { f: 1, aN: [130, 160] }); p.crowd({ x0: 0, x1: 240, y: 1600, jit: 20, h: 130, n: 8, col: '#a8784a', col2: '#8a6a4a', tail: -1, spears: 0.2 });
      p.tree(1150, 1800, 1300, { col: '#2f4a44', trunk: '#1c1626', kind: 'palm' }); p.birds(14, 300, 500, 1100, 900, '#3a3055', 9); base(p, '#1c1626');
    } });
  P(R, { title: 'The Archer and the Ten-Headed King', kanda: 'Yuddha Kanda', seed: 306, light: -1,
    text: 'When Ravana stands disarmed and exhausted on the first day, Rama does not strike. "Go, rest, and come back tomorrow with your chariot and your bow."',
    draw(p) {
      p.sky(['#3a2f66', '#7a548a', '#dc9474', '#f8d09a']); p.clouds({ n: 9, y0: 40, y1: 700, size: 220, col: '#84648e', shadow: '#40305e', light: '#f0b088' });
      scr(p, () => p.glow(300, 1300, 600, '#fff0b8', 0.7));
      F(p, 760, 1500, 1260, RAVAN, { f: -1, lean: 4, lN: [20, 6], lF: [-22, -10], aN: [124, 156], aF: [80, 40], arms: [[150, 176], [100, 124], [56, 96], [156, 120]], cape: '#4a2a50', prop: [{ type: 'sword', hand: 'N', ang: 168, len: 0.4 }] });
      p.fade('#c08488', 0.3, 0, 1500);
      for (const x of [140, 980]) { p.fire(x, 1380, 160, 260, { sway: -0.3 }); p.smoke(x, 1160, 90, 400, '#5a4468', -0.5); }
      const g = p.ridge({ y: 1480, amp: 26, col: '#a67a6a', col2: '#5a3f4a', seed: 8, freq: 0.004 });
      p.crowd({ x0: 500, x1: PW, y: 1500, jit: 30, h: 60, n: 60, col: '#4a3350', col2: '#6a3f4f', spears: 0.5, banners: 0.08, bannerCol: '#b8323a', dir: -1 });
      const Rm = F(p, 300, 1640, 520, RAMA, ARCH, { f: 1, lean: -14, aF: [124, 126], aN: [128, -46], halo: '#fff2b8', prop: { type: 'bow', hand: 'F', ang: 212, drawn: true, glow: '#fff0a0', len: 0.46 } });
      scr(p, () => p.rays(Rm.hF[0] + 40, Rm.hF[1] - 40, 12, 900, '#fff0b0', 0.3, -70, -30)); base(p, '#2b1c30');
    } });
  P(R, { title: 'The Last Rites of an Enemy', kanda: 'Yuddha Kanda', seed: 307, light: 1,
    text: '"Enmity ends with death. Our purpose is accomplished. Perform his rites: he is now as much mine as yours." Rama tells Vibhishana to honour the fallen Ravana.',
    draw(p) {
      p.sky(['#2a2a5c', '#5e4a84', '#c47a6c', '#f6bc80']); p.stars(120, 600); p.clouds({ n: 8, y0: 60, y1: 600, size: 200, col: '#6a4f84', shadow: '#2e2654', light: '#f0a078' });
      p.ridge({ y: 1040, amp: 100, col: '#5a4680', col2: '#8a5a80', seed: 6 }); p.sea(1080, '#e89a78', '#3a3470', '#ffdca0', 600, 1360);
      scr(p, () => p.glow(600, 900, 620, '#ffb060', 0.7)); p.smoke(600, 760, 150, 700, '#4a3458', 0.25);
      for (let i = 0; i < 5; i++) p.rect(380, 1330 + i * 22, 440, 20, i % 2 ? '#6a4634' : '#8a5f44'); p.fire(600, 1330, 380, 560);
      const g = p.ridge({ y: 1460, amp: 20, col: '#8a5a54', col2: '#33243a', seed: 4, freq: 0.004 });
      F(p, 960, 1600, 520, RAMA, { f: -1, head: 14, aN: [20, 40], halo: '#fff2c0', prop: { type: 'bow', hand: 'F', ang: 176 } }); F(p, 1120, 1620, 420, LAK, { f: -1, head: 14 });
      F(p, 280, 1600, 460, { skin: '#a892b8', cloth: '#f1ead8', cloth2: '#c9a060', crown: 'bun', gold: '#f2c85a', hair: '#1a1220' }, { f: 1, aN: [70, 96], head: 18, prop: { type: 'staff', hand: 'N', ang: 96, len: 0.3, col: '#f8a33c' } });
      p.crowd({ x0: 0, x1: 180, y: 1640, jit: 16, h: 160, n: 5, col: '#2a2038', col2: '#4a3048' });
      for (let i = 0; i < 160; i++) p.rect(p.rr(200, 1000), p.rr(200, 1300), p.rr(3, 8), p.rr(3, 8), p.r() < 0.5 ? '#ffe08a' : '#ff9a3a', p.rr(0.5, 1)); base(p, '#17121f');
    } });
  P(R, { title: 'Rama Pattabhisheka', kanda: 'Yuddha Kanda', seed: 308, light: -1,
    text: 'Rama is crowned at last with Sita beside him. Valmiki says that while he ruled no widow mourned, no one feared wild beasts or disease, and the rains came on time.',
    draw(p) {
      p.sky(['#d8c4e0', '#f2d8d0', '#fbe8c8', '#f8deb0']); p.city({ x0: 0, x1: PW, base: 1200, h: 700, n: 14, col: '#d8bed2', col2: '#e8cec2', gold: '#f8e2a2' }); p.fade('#f8e4cc', 0.5);
      arch(p, '#c49a8a', '#f6d77a'); scr(p, () => { p.glow(600, 620, 620, '#fff4c8', 0.9); p.rays(600, 620, 36, 1300, '#fff2c0', 0.22); });
      for (let i = 0; i < 7; i++) p.ribbon([[220 + i * 130, 230], [250 + i * 130, 340], [220 + i * 130, 450], [260 + i * 130, 560]], 44, i % 2 ? '#e8703a' : '#f0b93a', 0.85);
      p.rect(0, 1500, PW, 300, '#c8a48a'); for (let i = 0; i < 5; i++) p.rect(240 - i * 40, 1380 + i * 32, 720 + i * 80, 32, i % 2 ? '#e6c8a4' : '#d0aa8c');
      p.rect(360, 900, 480, 480, '#b8323a'); p.rect(340, 860, 520, 50, '#f6d77a'); p.pillar(370, 1380, 40, 520, '#f0c85a'); p.pillar(830, 1380, 40, 520, '#f0c85a'); p.line(600, 560, 600, 860, 8, '#f0c85a'); p.c.fillStyle = '#fff6e0'; p.c.beginPath(); p.c.ellipse(600, 560, 250, 90, 0, Math.PI, 6.283); p.c.fill(); p.rect(350, 552, 500, 16, '#f0c85a');
      F(p, 520, 1380, 560, RAMA_K, SIT, { f: 1, halo: '#fff6c8', haloR: 5, aN: [60, 96], prop: { type: 'bow', hand: 'F', ang: 178, len: 0.4 } }); F(p, 720, 1380, 480, SITA, SIT, { f: -1, crown: 'mukut', longhair: true });
      F(p, 600, 1640, 380, HANU, KNEEL, PRAY, { f: -1, head: -30 }); F(p, 220, 1560, 440, LAK, { f: 1, aN: [150, 170] }); F(p, 990, 1560, 430, { skin: '#6f8fb8', cloth: '#b98a5a', cloth2: '#8a6a4a', crown: 'mukut', hair: '#1f1a2a' }, PRAY, { f: -1 });
      petals(p, 220, ['#fbd0dc', '#fff3c0', '#f6a8b8', '#ffffff']); p.lamp(120, 1700, 22); p.lamp(1080, 1700, 22); base(p, '#5a3f4a');
    } });

  // ---------------- Krishna ----------------
  P(K, { title: 'Krishna of Dvaraka', kanda: 'Sabha Parva', seed: 401, light: 1,
    text: 'He is never crowned. Ugrasena is king of the Yadavas; Krishna is counsellor, envoy, charioteer and friend, and at Yudhishthira\'s sacrifice he is chosen first among all the guests.',
    draw(p) {
      p.sky(['#7f9ad6', '#b8bce6', '#f4d6cc', '#fde8bc']); p.sun(880, 700, 120, '#fff4c4', '#ffd49c'); p.rays(880, 700, 30, 1700, '#fff0c8', 0.16);
      p.clouds({ n: 7, y0: 60, y1: 600, size: 170, col: '#fbeee8', shadow: '#a8a0d4' });
      p.sea(980, '#b8d2de', '#4c80a2', '#fff4d0', 880, 1420);
      p.ridge({ y: 990, amp: 14, col: '#a89ec8', peak: [300, 240, 120], seed: 4, bottom: 985 }); p.city({ x0: 60, x1: 560, base: 890, h: 330, n: 18, col: '#eacf8c', col2: '#c9a8c4', gold: '#fff0b0', peakX: 300, peakW: 170 }); p.fade('#f6dcc8', 0.16, 600, 1000);
      p.waves(1150, 1420, '#5a90b0', 26, '#f6fbf6');
      const g = p.ridge({ y: 1450, amp: 26, col: '#c9b88a', col2: '#6a5a50', seed: 9, freq: 0.005 });
      F(p, 620, 1580, 900, KRISHNA, { f: 1, lN: [10, 14], lF: [14, -8], aN: [60, 130], aF: [70, 126], halo: '#fff6c8', haloR: 6, tilak: '#f6d77a', head: 6, prop: { type: 'flute', hand: 'N' } });
      p.eagle(250, 1500, 150, { f: 1, col: '#2f7a8a', head: '#3b4fa8', gold: '#f0c85a', tip: '#2e8f7a', up: 0.1, spread: 0.1 }); for (let i = 0; i < 8; i++) p.ell(120 + i * 10, 1500 + i * 14, 14, 50, i % 2 ? '#2e8f7a' : '#3b4fa8', 0.9, -0.9);
      p.quad(1010, 1600, 190, { kind: 'deer', f: -1, col: '#f1ead8', antlers: false, mane: '#c9b8a0' }); p.grass(0, PW, g, 24, '#a89a60', 100); p.birds(14, 100, 300, 1100, 800, '#f6f1e6', 9); base(p, '#2a2228');
    } });
  P(K, { title: 'Protector of Draupadi', kanda: 'Sabha Parva', seed: 402, light: -1,
    text: 'When the elders sit silent and her husbands cannot act, Draupadi calls on the one who is far away in Dvaraka. The cloth does not end.',
    draw(p) {
      p.sky(['#3a2a50', '#6a4468', '#b87a70', '#f0c090']); p.pillar(100, 1560, 120, 1560, '#7a5870'); p.pillar(1100, 1560, 120, 1560, '#7a5870'); p.fade('#a86a70', 0.3);
      scr(p, () => { p.glow(600, 200, 900, '#fff0c8', 0.95); p.rays(600, 160, 36, 1700, '#fff3d0', 0.28, 20, 160); });
      p.c.globalAlpha = 0.6; F(p, 600, 620, 760, KRISHNA, { fly: true, f: 1, skin: '#8fa8e0', aN: [70, 40], aF: [80, 50], lN: [3, 0], lF: [-3, 0], halo: '#fff6d8', haloR: 8 }); p.c.globalAlpha = 1; p.fade('#f6e0c0', 0.22, 0, 1200);
      p.rect(0, 1540, PW, 260, '#8a5a62');
      const cols = ['#d9483b', '#f0b93a', '#e8703a', '#f6d36a', '#c9463a', '#f8e0a0'];
      for (let k = 0; k < 6; k++) { const Q = []; for (let i = 0; i <= 18; i++) { const t = i / 18, a = t * 11 + k * 1.05, r = 50 + t * 420; Q.push([600 + Math.cos(a) * r, 1380 - t * 1300 + Math.sin(a) * r * 0.2]); } p.tube(Q, t => 54 + 44 * Math.sin(t * 12 + k), 0, cols[k], 10); p.tube(Q.map(q => [q[0], q[1] - 12]), 12, 12, lite(cols[k], 0.4), 10); }
      for (let i = 0; i < 26; i++) { const x = p.rr(150, 520), y = p.rr(1580, 1760); p.blob([[x - 90, y + 20], [x - 30, y - p.rr(20, 70)], [x + 40, y - p.rr(10, 50)], [x + 100, y + 24]], cols[i % 6]); }
      F(p, 600, 1640, 460, DRAU, { f: 1, aN: [164, 178], aF: [158, 176], halo: '#fff6d0', head: -24 });
      F(p, 300, 1700, 420, { skin: '#b88a6a', top: '#5a4a7a', cloth: '#3a2a5a', cloth2: '#8a3a4a', crown: 'mukut', hair: '#17131f', broad: 1.3 }, { f: 1, lean: 34, aN: [80, 100], aF: [70, 96], lN: [50, -10], lF: [-10, -50] });
      for (const x of [920, 1030]) F(p, x, 1650, 330, x < 1000 ? BHISHMA : DURYO, SIT, { f: -1, head: 26 }); base(p, '#1c1422');
    } });
  P(K, { title: 'The Envoy of Peace', kanda: 'Udyoga Parva', seed: 403, light: 1,
    text: 'Before the war Krishna goes to Hastinapura himself. He asks for five villages for five brothers. Duryodhana answers that he will not give land enough to cover the point of a needle.',
    draw(p) {
      p.sky(['#d6c4de', '#f0d8d0', '#fbe6c6', '#f6dcae']); p.city({ x0: 0, x1: PW, base: 1250, h: 760, n: 14, col: '#d6bed0', col2: '#e6cec0', gold: '#f6e0a0' }); p.fade('#f6e2cc', 0.5);
      arch(p, '#8a6a7a', '#e6c878'); scr(p, () => { p.glow(600, 700, 560, '#fff6d4', 0.8); p.rays(600, 700, 30, 1300, '#fff4c8', 0.18); });
      p.rect(0, 1500, PW, 300, '#b8947e'); p.poly([[420, 1500], [780, 1500], [1000, 1800], [200, 1800]], '#b8323a'); p.poly([[450, 1500], [750, 1500], [940, 1800], [260, 1800]], '#d9583a');
      F(p, 600, 1600, 820, KRISHNA, { f: 1, aN: [120, 150], aF: [20, 60], lN: [16, 3], lF: [-14, -8], halo: '#fff6c8', haloR: 6 });
      F(p, 1010, 1620, 420, DURYO, { f: -1, aN: [40, 120], aF: [30, 110], lean: -6 }); F(p, 220, 1620, 430, BHISHMA, { f: 1, head: 12 });
      p.crowd({ x0: 0, x1: 150, y: 1650, jit: 14, h: 170, n: 4, col: '#5a3f5a', col2: '#8a5a6a', spears: 0.6 }); p.crowd({ x0: 1080, x1: PW, y: 1660, jit: 14, h: 170, n: 4, col: '#5a3f5a', col2: '#8a5a6a', spears: 0.6 }); p.lamp(330, 1560, 16); p.lamp(870, 1560, 16); base(p, '#4a3442');
    } });
  P(K, { title: 'Parthasarathi', kanda: 'Bhishma Parva', seed: 404, light: 1,
    text: 'He has sworn to carry no weapon in this war. Krishna takes the reins of Arjuna\'s chariot and drives it out between the two armies.',
    draw(p) {
      p.sky(['#6a7ac0', '#b0a8dc', '#f3c8b8', '#fde2a8']); p.sun(600, 900, 150, '#fff3c0', '#ffc890'); p.rays(600, 900, 44, 1700, '#ffe6b8', 0.2);
      p.clouds({ n: 9, y0: 40, y1: 700, size: 190, col: '#f6dcd6', shadow: '#9a90c8', light: '#fff0d0' });
      p.ridge({ y: 1100, amp: 26, col: '#b8a0c0', col2: '#d6b8b0', seed: 4 }); p.fade('#f6d6b8', 0.3, 900, 1260);
      p.crowd({ x0: 0, x1: 440, y: 1160, jit: 20, h: 40, n: 90, col: '#c9a060', col2: '#e6d0a0', spears: 0.6, banners: 0.08, bannerCol: '#f0c85a' }); p.crowd({ x0: 760, x1: PW, y: 1160, jit: 20, h: 40, n: 90, col: '#5a4a6a', col2: '#8a5a5a', spears: 0.6, banners: 0.08, bannerCol: '#b8323a', dir: -1 });
      const g = p.ridge({ y: 1320, amp: 20, col: '#d6c08a', col2: '#8a7450', seed: 6, freq: 0.004 });
      const d = p.chariot(430, 1640, 430, { f: 1, col: '#b0763a', horse: '#ffffff', canopyCol: '#f0c85a', flag: '#f6e0a0', horses: 4, gait: 'walk' });
      F(p, d.x - 40, d.y, 520, ARJUNA, { f: 1, head: 14, aN: [20, 40], prop: { type: 'bow', hand: 'F', ang: 178 } });
      const Kr = F(p, d.x + 190, d.y, 500, KRISHNA, { f: 1, aN: [70, 96], aF: [60, 90], halo: '#fff6c8', haloR: 5, head: -90 + 76 });
      p.line(Kr.hN[0], Kr.hN[1], d.x + 600, d.y - 60, 4, '#5a3f34'); p.line(Kr.hF[0], Kr.hF[1], d.x + 640, d.y - 90, 4, '#5a3f34');
      p.grass(0, PW, g, 20, '#a89a5a', 90); p.birds(22, 100, 100, 1100, 700, '#3a3055', 10); base(p, '#3a2a36');
    } });
  P(K, { title: 'Vishvarupa', kanda: 'Bhishma Parva (Gita 11)', seed: 405, light: -1,
    text: '"I am Time, grown old to destroy the worlds. Even without you, none of these warriors will remain. Therefore rise: be only the instrument."',
    draw(p) {
      p.sky(['#141433', '#33306a', '#8a5a90', '#f0b070']); p.stars(300, 1100);
      scr(p, () => { p.glow(600, 520, 1100, '#ffe6a0', 0.95); p.rays(600, 520, 60, 1900, '#fff3c0', 0.3); for (let i = 0; i < 10; i++) p.glow(600 + Math.cos(i * 0.63) * 460, 560 + Math.sin(i * 0.63) * 420, 80, ['#ffd0a0', '#c0d0ff', '#ffe0f0'][i % 3], 0.8); });
      for (const r of [300, 440, 560]) { p.c.strokeStyle = 'rgba(255,240,190,0.5)'; p.c.lineWidth = 5; p.c.beginPath(); p.c.ellipse(600, 600, r, r * 1.05, 0, 0, 6.3); p.c.stroke(); }
      const arms = []; for (let i = 0; i < 12; i++) arms.push([40 + i * 13, 70 + i * 11]);
      const o = { skin: '#5a7ad0', broad: 1.35, lN: [10, 2], lF: [-10, -3] };
      F(p, 600, 1560, 1180, KRISHNA, o, { f: 1, heads: 4, arms: arms, aN: [150, 176], aF: [110, 140], halo: '#fff6c0', haloR: 9, prop: [{ type: 'chakra', hand: 'N' }, { type: 'mace', hand: 'F', ang: 110, len: 0.22 }] });
      F(p, 600, 1560, 1180, KRISHNA, o, { f: -1, arms: arms, aN: [150, 176], aF: [110, 140], crown: 'none', sash: false, prop: [{ type: 'trident', hand: 'N', ang: 176, len: 0.28 }] });
      F(p, 600, 1560, 1180, KRISHNA, o, { f: 1, heads: 4, aN: [30, 80], aF: [20, 70], halo: '#fff6c0', haloR: 5 });
      p.fade('#f6c890', 0.16, 0, 1500); p.clouds({ n: 6, y0: 1380, y1: 1520, size: 200, col: '#6a4f88', shadow: '#2a2456', light: '#f6c090' });
      p.ridge({ y: 1560, amp: 30, col: '#7a5a80', col2: '#3a2a4a', seed: 6 }); p.crowd({ x0: 0, x1: PW, y: 1600, jit: 30, h: 46, n: 120, col: '#4a3a5a', col2: '#c9a060', spears: 0.6, banners: 0.06, bannerCol: '#b8323a' });
      F(p, 300, 1720, 260, ARJUNA, KNEEL, PRAY, { f: 1, head: -40 }); base(p, '#17121f');
    } });
  P(K, { title: 'The Wheel Against Bhishma', kanda: 'Bhishma Parva', seed: 406, light: 1,
    text: 'Seeing Arjuna fight his grandsire half-heartedly, Krishna leaps down and runs at Bhishma, breaking his own vow. The epic gives him his discus; later tradition, followed here, a chariot wheel. Bhishma drops his bow and welcomes him with folded hands.',
    draw(p) {
      p.sky(['#5a6ab4', '#a89cd4', '#f0bca8', '#fbdca0']); p.sun(250, 800, 110, '#fff2c4', '#ffc088'); p.rays(250, 800, 30, 1700, '#ffe4b4', 0.18);
      p.clouds({ n: 8, y0: 60, y1: 640, size: 190, col: '#eccfd2', shadow: '#8f86c0', light: '#fff0d4' });
      p.ridge({ y: 1100, amp: 30, col: '#a890b8', col2: '#d0a8a8', seed: 5 }); p.crowd({ x0: 0, x1: PW, y: 1160, jit: 22, h: 40, n: 160, col: '#5a4a6a', col2: '#c9a060', spears: 0.6, banners: 0.07, bannerCol: '#b8323a' });
      for (let i = 0; i < 18; i++) p.circ(p.rr(0, PW), p.rr(1180, 1420), p.rr(60, 150), '#f0d0a8', 0.3);
      const g = p.ridge({ y: 1440, amp: 20, col: '#d0b488', col2: '#7a6450', seed: 6, freq: 0.004 });
      const Kr = F(p, 470, 1600, 760, KRISHNA, { f: 1, lean: 18, lN: [40, -4], lF: [-30, -44], aN: [160, 174], aF: [140, 168], halo: '#fff6c8', haloR: 5, sash: true });
      const wx = (Kr.hN[0] + Kr.hF[0]) / 2 + 20, wy = Kr.hN[1] - 120; scr(p, () => p.glow(wx, wy, 300, '#fff0b0', 0.8)); p.wheel(wx, wy, 150, '#6a4634', '#f0c85a');
      F(p, 980, 1620, 460, BHISHMA, PRAY, { f: -1, head: -14 }); p.curve([[1100, 1640], [1150, 1560], [1110, 1480]], 10, '#c99a4a');
      F(p, 160, 1640, 360, ARJUNA, { f: 1, lean: 24, aN: [90, 100], aF: [80, 96], lN: [40, 0], lF: [-20, -40] });
      p.volley(20, 500, 300, 1100, 900, 170, 90, '#3a2a40', 3, 14); p.grass(0, PW, g, 20, '#a89a5a', 80); base(p, '#3a2a36');
    } });
  P(K, { title: "Gandhari's Curse", kanda: 'Stri Parva', seed: 407, light: -1,
    text: 'Among the dead of Kurukshetra, Gandhari tells Krishna that he could have prevented this and did not, and curses his clan to destroy itself in thirty-six years. Krishna answers that he knew, and accepts it.',
    draw(p) {
      p.sky(['#2a2c5c', '#5e5488', '#b88078', '#f0bc88']); p.stars(100, 600); p.clouds({ n: 9, y0: 60, y1: 700, size: 210, col: '#62507e', shadow: '#2c2650', light: '#e8a480' });
      p.ridge({ y: 1100, amp: 40, col: '#5a4a7c', col2: '#8a5e7c', seed: 6 });
      for (const [x, y] of [[180, 1180], [520, 1140], [860, 1190], [1060, 1150], [360, 1230]]) { p.fire(x, y, 70, 130); p.smoke(x, y - 110, 50, 360, '#4a3a5c', 0.3); }
      p.fade('#a8707a', 0.25, 800, 1300);
      const g = p.ridge({ y: 1420, amp: 20, col: '#7a5a5c', col2: '#2e2238', seed: 4, freq: 0.004 });
      for (let i = 0; i < 16; i++) { const x = p.rr(0, PW); p.line(x, 1500 + p.rr(-40, 160), x + p.rr(-30, 30), 1380 + p.rr(-40, 120), 4, '#3a2a36'); } p.wheel(1040, 1560, 90, '#3a2430', '#8a6a4a'); p.wheel(140, 1660, 70, '#3a2430', '#8a6a4a');
      const Ga = F(p, 380, 1620, 600, { skin: '#d9b494', robe: '#f1ece4', drape: '#dcd4cc', hair: '#c9c0b8', longhair: true, crown: 'none', sash: false, plain: true }, { f: 1, aN: [100, 96], aF: [20, 50], lean: 6 });
      p.line(Ga.head[0] - 34, Ga.head[1] - 12, Ga.head[0] + 38, Ga.head[1] - 6, 16, '#fbf8f0');
      F(p, 800, 1640, 640, KRISHNA, { f: -1, head: 16, aN: [36, 126], aF: [30, 120], halo: '#fff2c8', haloR: 5 });
      p.birds(20, 100, 200, 1100, 900, '#17121f', 11); base(p, '#17121f');
    } });
  P(K, { title: "The Hunter's Arrow", kanda: 'Mausala Parva', seed: 408, light: 1,
    text: 'His clan destroyed as foretold, Krishna sits alone in the forest. A hunter named Jara mistakes his foot for a deer and looses an arrow. Krishna comforts the man, and leaves the world.',
    draw(p) {
      p.sky(['#3a4a84', '#7a78ac', '#dca890', '#f8d8a4']); p.sun(900, 760, 110, '#fff2cc', '#ffbe8c'); p.clouds({ n: 7, y0: 60, y1: 620, size: 180, col: '#8a78a8', shadow: '#40407a', light: '#f6c098' });
      p.sea(960, '#f0c4a8', '#4a5a98', '#fff2cc', 900, 1300); p.fade('#eab49c', 0.2, 820, 1200);
      p.forest({ x0: 0, x1: PW, base: 1320, jit: 20, h: 520, n: 8, col: '#4a6a6c', col2: '#5a7460', trunk: '#33304a' }); p.fade('#c09a94', 0.25);
      const g = p.ridge({ y: 1460, amp: 24, col: '#8a8a64', col2: '#3f4440', seed: 4, freq: 0.004 });
      p.tree(520, 1560, 1500, { col: '#3f6a5a', trunk: '#3a2c30', spread: 0.44 });
      scr(p, () => { p.glow(600, 1300, 420, '#fff2c8', 0.7); p.rays(600, 1250, 20, 700, '#fff4d0', 0.2); });
      const Kr = F(p, 640, 1620, 640, KRISHNA, SIT, { f: 1, lean: -14, lN: [84, 10], lF: [62, -84], aN: [20, 40], aF: [-10, 30], halo: '#fff6d0', haloR: 6, head: 6 });
      p.arrow(1010, 1500, Kr.fN[0] + 8, Kr.fN[1] - 6, '#5a4038', 5);
      F(p, 1090, 1560, 260, { skin: '#7a5440', cloth: '#5a6a4a', cloth2: '#8a6a4a', crown: 'bun', plain: true, hair: '#17131f' }, KNEEL, { f: -1, aN: [60, 110], aF: [50, 100], head: 20 });
      p.grass(0, PW, g, 26, '#6a7a54', 130); for (let i = 0; i < 40; i++) p.circ(p.rr(0, PW), p.rr(1500, 1780), p.rr(4, 8), p.r() < 0.5 ? '#f8d6e0' : '#fff6d0'); p.birds(10, 100, 300, 1100, 800, '#33305a', 9); base(p, '#1c1a26');
    } });

  // ---------------- Krishna: more landscapes ----------------
  KL.push({ title: 'The Choice', kanda: 'Udyoga Parva', seed: 501, light: -1,
    text: 'Both cousins come to Dvaraka for help and find Krishna asleep. He offers one his whole army and the other himself, unarmed. Arjuna, asked first, chooses Krishna. Duryodhana is delighted with the army.',
    draw(p) {
      p.sky(['#d4c6e2', '#eedad4', '#fbe8c8', '#f6deb0']); p.city({ x0: 0, x1: 2000, base: 560, h: 380, n: 18, col: '#d2c0d6', col2: '#e4d0c4', gold: '#f6e2a4' }); p.fade('#f6e4cc', 0.5);
      for (const x of [260, 560, 1440, 1740]) p.pillar(x, 690, 90, 660, '#dcc6ba'); for (let i = 0; i < 8; i++) p.ribbon([[300 + i * 190, 60], [330 + i * 190, 170], [300 + i * 190, 280]], 60, i % 2 ? '#8fa8d8' : '#f0d890', 0.7);
      scr(p, () => p.glow(1000, 420, 520, '#fff6d8', 0.8)); p.rect(0, 690, 2000, 170, '#c8a890');
      p.rect(620, 600, 760, 70, '#8a5a3a'); p.rect(600, 580, 800, 30, '#f0c85a'); for (const x of [640, 1360]) p.rect(x - 16, 660, 32, 70, '#6a4630'); p.blob([[640, 580], [1000, 556], [1360, 580], [1000, 596]], '#fbf3e4');
      F(p, 960, 548, 430, KRISHNA, { fly: true, f: 1, lean: 84, head: -18, lN: [84, 90], lF: [78, 84], aN: [70, 90], aF: [100, 96], halo: '#fff6d0', sash: false });
      F(p, 1500, 720, 300, ARJUNA, PRAY, { f: -1 }); F(p, 520, 640, 300, DURYO, SIT, { f: 1, aN: [60, 96] }); p.rect(440, 640, 170, 60, '#8a3a4a'); p.rect(430, 620, 190, 26, '#f0c85a');
      p.lamp(760, 730, 14); p.lamp(1240, 730, 14); p.pillar(60, 900, 170, 900, '#7a5a6a'); p.pillar(1940, 900, 170, 900, '#7a5a6a');
    } });
  KL.push({ title: 'Krishna and Karna', kanda: 'Udyoga Parva', seed: 502, light: 1,
    text: 'Leaving Hastinapura, Krishna takes Karna up on his chariot and tells him the truth: he is Kunti\'s eldest son, and the kingdom is his if he will cross over. Karna knows he will die, and refuses out of loyalty.',
    draw(p) {
      p.sky(['#6f8ad0', '#b4b4e0', '#f2d2c4', '#fde4b4']); p.sun(1450, 420, 80, '#fff4c8', '#ffd09a'); p.rays(1450, 420, 28, 1700, '#fff0c8', 0.16);
      p.clouds({ n: 8, y0: 40, y1: 300, size: 180, col: '#fbeee6', shadow: '#a8a0d0' }); p.streaks({ n: 12, y0: 320, y1: 480, col: '#fff2dc' });
      p.ridge({ y: 520, amp: 60, col: '#b0a6cc', col2: '#d2bcc4', seed: 8 }); p.city({ x0: 0, x1: 560, base: 540, h: 230, n: 16, col: '#d8c0c8', col2: '#e6d0b8', gold: '#f6e2a4' }); p.fade('#f6dcc8', 0.3);
      p.sea(560, '#dcdcd8', '#6f98b0', '#fff6dc', 1450, 690);
      const g = p.ridge({ y: 720, amp: 16, col: '#cbbd84', col2: '#7a7450', seed: 6, freq: 0.004 }); p.forest({ x0: 1500, x1: 2000, base: g, h: 380, n: 5, col: '#6a9070', col2: '#88a064', trunk: '#4a3a38' });
      const d = p.chariot(760, 800, 250, { f: 1, col: '#b0763a', horse: '#ffffff', canopyCol: '#f0c85a', flag: '#f6e0a0', horses: 4, gait: 'walk' });
      F(p, d.x + 110, d.y, 320, KRISHNA, { f: -1, aN: [60, 100], aF: [40, 80], halo: '#fff6c8' }); F(p, d.x - 60, d.y, 320, KARNA, { f: 1, head: 16, aN: [10, 30], halo: '#fff0b0' });
      p.grass(0, 2000, g, 22, '#a0a05c', 140); p.tree(60, 900, 880, { col: '#3f5a48', trunk: '#241a26' }); p.birds(12, 500, 100, 1300, 320, '#5a5880', 8);
    } });
  KL.push({ title: 'The False Sunset', kanda: 'Drona Parva', seed: 503, light: -1,
    text: 'Arjuna has sworn to kill Jayadratha before sunset or enter the fire. As the day runs out Krishna veils the sun. Jayadratha looks up to see, and Krishna says: there is the sun, and there is his head.',
    draw(p) {
      p.sky(['#1c1c44', '#3c3470', '#74508a', '#b8747c']); p.stars(140, 300);
      p.clouds({ n: 9, y0: 30, y1: 330, size: 210, col: '#4a3f78', shadow: '#201c48', light: '#c88a8c' });
      scr(p, () => { p.glow(1420, 300, 520, '#ffb070', 0.7); }); p.circ(1420, 300, 120, '#ffe0a0'); p.circ(1385, 300, 122, '#241e4c');
      scr(p, () => { p.glow(1260, 300, 220, '#fff0b0', 0.9); }); p.c.strokeStyle = '#fff6c8'; p.c.lineWidth = 14; p.c.beginPath(); p.c.arc(1385, 300, 132, 0, 6.3); p.c.stroke(); for (let i = 0; i < 16; i++) p.line(1385 + Math.cos(i * 0.39) * 132, 300 + Math.sin(i * 0.39) * 132, 1385 + Math.cos(i * 0.39) * 168, 300 + Math.sin(i * 0.39) * 168, 8, '#fff0b0');
      p.ridge({ y: 610, amp: 30, col: '#4a3f70', col2: '#6a4a70', seed: 6 });
      p.crowd({ x0: 900, x1: 2000, y: 660, jit: 26, h: 34, n: 260, col: '#3a3058', col2: '#6a3f52', spears: 0.6, banners: 0.05, bannerCol: '#b8323a', dir: -1 });
      for (const x of [1300, 1560, 1800]) p.quad(x, 690, 90, { kind: 'elephant', f: -1, col: '#5a5672', cloth: '#7a2f3a' });
      F(p, 1560, 800, 260, { skin: '#c99a78', top: '#8a8aa0', cloth: '#5a4a6a', cloth2: '#b8323a', crown: 'mukut', hair: '#17131f' }, { f: -1, head: -30, aN: [140, 160], lean: -6 });
      const g = p.ridge({ y: 740, amp: 16, col: '#5a4a6c', col2: '#221c34', seed: 3, freq: 0.004 });
      const d = p.chariot(430, 790, 210, { f: 1, col: '#b0763a', horse: '#ffffff', canopyCol: '#f0c85a', flag: '#f6e0a0', horses: 4 });
      F(p, d.x + 10, d.y, 260, ARJUNA, ARCH, { f: 1, lean: -8, prop: { type: 'bow', hand: 'F', ang: 182, drawn: true, glow: '#fff0a0', len: 0.46 } });
      F(p, d.x + 110, d.y, 240, KRISHNA, { f: 1, aN: [150, 170], halo: '#fff6c8' });
      for (let i = 0; i < 60; i++) p.lamp(p.rr(900, 2000), p.rr(640, 760), 4); p.birds(20, 300, 60, 1800, 300, '#12101f', 9);
    } });
  KL.push({ title: 'The Song on the Battlefield', kanda: 'Bhishma Parva (Gita 2)', seed: 504, light: 1,
    text: '"You have a right to the work alone, never to its fruits. Do not let the fruit of action be your motive, and do not cling to inaction." Arjuna has laid down his bow, and Krishna begins to teach.',
    draw(p) {
      p.sky(['#6a7ac0', '#b0a8dc', '#f3c8b8', '#fde2a8']); p.sun(1000, 480, 110, '#fff3c0', '#ffc890'); p.rays(1000, 480, 46, 1500, '#ffe6b8', 0.2);
      p.clouds({ n: 9, y0: 30, y1: 320, size: 200, col: '#f6dcd6', shadow: '#9a90c8', light: '#fff0d0' });
      p.ridge({ y: 580, amp: 26, col: '#b8a0c0', col2: '#d6b8b0', seed: 4 }); p.fade('#f6d6b8', 0.3, 440, 680);
      p.crowd({ x0: 0, x1: 560, y: 640, jit: 22, h: 34, n: 180, col: '#c9a060', col2: '#e6d0a0', spears: 0.6, banners: 0.06, bannerCol: '#f0c85a' }); p.crowd({ x0: 1440, x1: 2000, y: 640, jit: 22, h: 34, n: 180, col: '#5a4a6a', col2: '#8a5a5a', spears: 0.6, banners: 0.06, bannerCol: '#b8323a', dir: -1 });
      const g = p.ridge({ y: 720, amp: 14, col: '#d8c290', col2: '#8a7450', seed: 6, freq: 0.004 });
      const d = p.chariot(940, 800, 300, { f: 1, col: '#b0763a', horse: '#ffffff', canopyCol: '#f0c85a', flag: '#f6e0a0', horses: 4, gait: 'stand' });
      const A = F(p, d.x - 70, d.y + 8, 330, ARJUNA, SIT, { f: 1, lean: 24, head: 30, aN: [30, 60], aF: [20, 50] }); p.curve([[d.x - 190, d.y - 10], [d.x - 150, d.y - 100], [d.x - 200, d.y - 190]], 10, '#c99a4a');
      F(p, d.x + 110, d.y, 400, KRISHNA, { f: -1, aN: [70, 120], aF: [30, 60], halo: '#fff6c8', haloR: 6 }); scr(p, () => p.glow(d.x + 60, d.y - 300, 300, '#fff4c8', 0.5));
      p.grass(0, 2000, g, 18, '#a89a5a', 110); p.birds(26, 200, 60, 1800, 320, '#3a3055', 9);
    } });
  KL.push({ title: 'Dvaraka Returns to the Sea', kanda: 'Mausala Parva', seed: 505, light: -1,
    text: 'When Krishna has gone, the ocean rises over his city street by street. Arjuna leads the survivors out and looks back to see the towers go under.',
    draw(p) {
      p.sky(['#2c3460', '#5a6090', '#98a0b4', '#d8ccb0']); p.sun(1500, 250, 60, '#f8f6e0', '#d0d4c8'); p.clouds({ n: 10, y0: 20, y1: 340, size: 220, col: '#6a7494', shadow: '#2f3860', light: '#d6d6cc' });
      p.city({ x0: 500, x1: 1700, base: 640, h: 440, n: 30, col: '#c8b88c', col2: '#a898b0', gold: '#f0e0a0', peakX: 1100, peakW: 380 }); p.fade('#8a98ac', 0.3);
      p.sea(520, '#a0b8c0', '#284c6c', '#e8f0e8', 1500); p.city({ x0: 600, x1: 1600, base: 700, h: 200, n: 12, col: '#9a9478', col2: '#7a7890', gold: '#d8cc98' });
      p.sea(640, '#7fa0b0', '#20405c', '#e8f0e8', 1500);
      for (let i = 0; i < 22; i++) { const x = p.rr(500, 1700), y = p.rr(640, 740); p.blob([[x - 130, y + 30], [x - 50, y - p.rr(20, 60)], [x + 40, y - p.rr(10, 40)], [x + 140, y + 30]], p.r() < 0.3 ? '#c8dcdc' : '#4f7f98', 0.9); }
      p.waves(680, 840, '#2f5878', 50, '#eef6f0');
      const g = p.ridge({ y: 800, amp: 34, col: '#b4a888', col2: '#4a4448', seed: 9, peak: [260, 420, 150], freq: 0.005, x1: 900 });
      F(p, 420, g(420) + 4, 230, ARJUNA, { f: 1, head: -8, aN: [20, 40], prop: { type: 'bow', hand: 'N', ang: 176 } });
      p.crowd({ x0: 0, x1: 340, y: g, h: 90, n: 26, col: '#6a5a6a', col2: '#b89a7a' }); p.quad(120, g(120) + 4, 110, { kind: 'elephant', f: -1, col: '#7a7486', cloth: '#5a6a9a' });
      p.birds(30, 300, 80, 1800, 420, '#e8eef0', 9);
    } });

  Epic.scenes.rama = R; Epic.scenes.krishna = K; Epic.scenes.krishnaland = KL;
})();
