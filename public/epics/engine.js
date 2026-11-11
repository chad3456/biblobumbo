/* Epic Painter: a plain-JavaScript painterly image engine.
   A scene is composed from flat shapes on a reference canvas, then repainted
   with layered brush strokes that follow the edges of the picture. */
(function (root) {
  'use strict';
  const W = 2000, H = 860, TAU = Math.PI * 2, D = Math.PI / 180;

  function mulberry(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hex(c) {
    if (Array.isArray(c)) return c;
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function css(c, a) { c = hex(c); return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')'; }
  function mix(a, b, t) { a = hex(a); b = hex(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  const lite = (c, t) => mix(c, '#fff4d8', t);
  const dark = (c, t) => mix(c, '#231433', t);
  const hash = (i, s) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

  // Catmull-Rom spline through points
  function spline(pts, seg) {
    seg = seg || 14; const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < seg; k++) {
        const t = k / seg, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  class Painter {
    constructor(ctx, seed, light) {
      this.c = ctx; this.r = mulberry(seed); this.lx = light || -1; this.W = W; this.H = H;
    }
    rr(a, b) { return a + (b - a) * this.r(); }
    n1(x, s) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, s) * (1 - u) + hash(i + 1, s) * u; }
    fbm(x, s, oct) { let v = 0, a = 0.5, t = 0; for (let o = 0; o < (oct || 4); o++) { v += a * this.n1(x, s + o * 17); t += a; x *= 2.03; a *= 0.5; } return v / t; }

    // ---------- primitives ----------
    poly(pts, col, a) {
      const c = this.c; c.globalAlpha = a == null ? 1 : a; c.fillStyle = css(col); c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
      c.closePath(); c.fill(); c.globalAlpha = 1;
    }
    blob(pts, col, a) { this.poly(spline(pts.concat([pts[0]]), 8), col, a); }
    rect(x, y, w, h, col, a) { const c = this.c; c.globalAlpha = a == null ? 1 : a; c.fillStyle = css(col); c.fillRect(x, y, w, h); c.globalAlpha = 1; }
    circ(x, y, r, col, a) { this.ell(x, y, r, r, col, a); }
    ell(x, y, rx, ry, col, a, rot) {
      const c = this.c; c.globalAlpha = a == null ? 1 : a; c.fillStyle = css(col); c.beginPath();
      c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); c.fill(); c.globalAlpha = 1;
    }
    line(x1, y1, x2, y2, w, col, a) {
      const c = this.c; c.globalAlpha = a == null ? 1 : a; c.strokeStyle = css(col); c.lineWidth = w; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.globalAlpha = 1;
    }
    curve(pts, w, col, a) {
      const c = this.c, s = spline(pts, 10); c.globalAlpha = a == null ? 1 : a; c.strokeStyle = css(col); c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(s[0][0], s[0][1]); for (const q of s) c.lineTo(q[0], q[1]); c.stroke(); c.globalAlpha = 1;
    }
    cap(x1, y1, x2, y2, w1, w2, col) {
      const c = this.c, dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      c.fillStyle = css(col); c.beginPath();
      c.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); c.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2);
      c.lineTo(x2 - nx * w2 / 2, y2 - ny * w2 / 2); c.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); c.fill();
      c.beginPath(); c.arc(x1, y1, w1 / 2, 0, TAU); c.fill(); c.beginPath(); c.arc(x2, y2, w2 / 2, 0, TAU); c.fill();
    }
    // limb with a lit side
    limb(x1, y1, x2, y2, w1, w2, col, bulge) {
      const lx = this.lx, bg = bulge == null ? 0.22 : bulge, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const one = (ox, oy, k, c) => { this.tube([[x1 + ox * w1, y1 + oy * w1], [mx + ox * w1, my + oy * w1], [x2 + ox * w2, y2 + oy * w2]], t => (w1 + (w2 - w1) * t) * k * (1 + bg * Math.sin(Math.min(1, t * 1.25) * Math.PI)), 0, c, 6); this.circ(x1 + ox * w1, y1 + oy * w1, w1 * k / 2, c); this.circ(x2 + ox * w2, y2 + oy * w2, w2 * k / 2, c); };
      one(0, 0, 1, dark(col, 0.32)); one(lx * 0.13, -0.05, 0.7, col); one(lx * 0.27, -0.1, 0.24, lite(col, 0.38));
    }
    tube(pts, w0, w1, col, seg) {
      const s = spline(pts, seg || 12), n = s.length, L = [], R = [];
      for (let i = 0; i < n; i++) {
        const a = s[Math.max(0, i - 1)], b = s[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const t = i / (n - 1), w = (typeof w0 === 'function' ? w0(t) : w0 + (w1 - w0) * t) / 2;
        L.push([s[i][0] - dy / l * w, s[i][1] + dx / l * w]); R.push([s[i][0] + dy / l * w, s[i][1] - dx / l * w]);
      }
      this.poly(L.concat(R.reverse()), col);
      return s;
    }

    // ---------- sky and air ----------
    sky(stops) {
      const c = this.c, g = c.createLinearGradient(0, 0, 0, H);
      stops.forEach((s, i) => { if (Array.isArray(s) && typeof s[0] === 'number' && s.length === 2) g.addColorStop(s[0], css(s[1])); else g.addColorStop(i / (stops.length - 1), css(s)); });
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    glow(x, y, r, col, a) {
      const c = this.c, g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, css(col, a == null ? 0.8 : a)); g.addColorStop(1, css(col, 0));
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    sun(x, y, r, col, halo) {
      this.glow(x, y, r * 9, halo || col, 0.45); this.glow(x, y, r * 3.5, col, 0.7); this.circ(x, y, r, lite(col, 0.7));
    }
    rays(x, y, n, len, col, a, a0, a1) {
      const c = this.c; c.globalCompositeOperation = 'screen';
      for (let i = 0; i < n; i++) {
        const an = (a0 == null ? 0 : a0) + ((a1 == null ? 360 : a1) - (a0 == null ? 0 : a0)) * (i + this.r() * 0.7) / n, wd = this.rr(1.5, 5) * D;
        const g = c.createRadialGradient(x, y, 0, x, y, len); g.addColorStop(0, css(col, a || 0.25)); g.addColorStop(1, css(col, 0));
        c.fillStyle = g; c.beginPath(); c.moveTo(x, y);
        c.lineTo(x + Math.cos(an * D - wd) * len, y + Math.sin(an * D - wd) * len); c.lineTo(x + Math.cos(an * D + wd) * len, y + Math.sin(an * D + wd) * len); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
    }
    fade(col, a, y0, y1) {
      const c = this.c;
      if (y0 == null) { this.rect(0, 0, W, H, col, a); return; }
      const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, css(col, 0)); g.addColorStop(0.5, css(col, a)); g.addColorStop(1, css(col, 0));
      c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0);
    }
    mist(y0, y1, col, a) { const c = this.c, g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, css(col, 0)); g.addColorStop(1, css(col, a)); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0); }
    clouds(o) {
      const n = o.n || 6, x0 = o.x0 == null ? -100 : o.x0, x1 = o.x1 == null ? W + 100 : o.x1, y0 = o.y0 || 80, y1 = o.y1 || 300, size = o.size || 110;
      const col = o.col || '#ffffff', sh = o.shadow || mix(col, '#8d86b8', 0.45), li = o.light || lite(col, 0.7), al = o.a == null ? 1 : o.a;
      for (let i = 0; i < n; i++) {
        const cx = this.rr(x0, x1), cy = this.rr(y0, y1), s = size * this.rr(0.6, 1.4), w = s * this.rr(1.6, 3), m = 26 + (this.r() * 16 | 0), P = [];
        for (let k = 0; k < m; k++) {
          const dx = (this.r() + this.r() + this.r()) / 1.5 - 1, env = 1 - Math.abs(dx) * 0.6, pr = s * this.rr(0.16, 0.5) * env;
          P.push([cx + dx * w, cy - this.rr(0.1, 1.0) * s * 0.75 * env, pr, this.rr(0.6, 1), this.rr(-0.5, 0.5)]);
        }
        for (let k = 0; k < 5; k++) this.ell(cx + this.rr(-1, 1) * w * 0.5, cy + s * this.rr(0.02, 0.2), w * this.rr(0.5, 1.1), s * this.rr(0.06, 0.16), mix(sh, col, this.rr(0, 0.4)), al * 0.85);
        for (const q of P) this.ell(q[0], q[1] + q[2] * 0.35, q[2] * 1.15, q[2] * q[3], sh, al, q[4]);
        for (const q of P) this.ell(q[0], q[1], q[2] * 1.05, q[2] * q[3] * 0.9, mix(col, sh, Math.max(0, Math.min(1, (q[1] - cy + s * 0.5) / s)) * 0.5), al, q[4]);
        for (const q of P) this.ell(q[0] + this.lx * q[2] * 0.3, q[1] - q[2] * 0.3, q[2] * 0.65, q[2] * q[3] * 0.5, li, al, q[4]);
        for (const q of P) if (this.r() < 0.4) this.ell(q[0] + this.lx * q[2] * 0.5, q[1] - q[2] * 0.5, q[2] * 0.3, q[2] * 0.18, lite(li, 0.6), al, q[4]);
      }
    }
    streaks(o) {
      for (let i = 0; i < (o.n || 10); i++) {
        const x = this.rr(-100, W + 100), y = this.rr(o.y0, o.y1), w = this.rr(150, 520) * (o.size || 1);
        this.ell(x, y, w, this.rr(5, 16) * (o.size || 1), o.col, o.a == null ? 0.7 : o.a);
      }
    }
    stars(n, y1, col) { for (let i = 0; i < n; i++) this.circ(this.rr(0, W), this.rr(0, y1), this.rr(0.8, 2.4), col || '#fff6dc', this.rr(0.4, 1)); }
    birds(n, x0, y0, x1, y1, col, s) {
      for (let i = 0; i < n; i++) {
        const x = this.rr(x0, x1), y = this.rr(y0, y1), z = (s || 9) * this.rr(0.6, 1.5), d = this.rr(0.2, 0.6);
        this.curve([[x - z, y - z * d], [x - z * 0.4, y - z * 0.5], [x, y], [x + z * 0.4, y - z * 0.5], [x + z, y - z * d]], z * 0.22, col || '#3a2f45');
      }
    }

    // ---------- land and water ----------
    ridge(o) {
      const c = this.c, amp = o.amp == null ? 100 : o.amp, fr = o.freq || 0.004, sd = o.seed || 1, x0 = o.x0 == null ? 0 : o.x0, x1 = o.x1 == null ? W : o.x1, bot = o.bottom || H;
      const tilt = o.tilt || 0, self = this;
      const yAt = x => o.y + tilt * (x - W / 2) - amp * (self.fbm(x * fr, sd, o.oct || 4) - 0.5) * 2 - (o.peak ? o.peak[2] * Math.exp(-Math.pow((x - o.peak[0]) / o.peak[1], 2)) : 0);
      const g = c.createLinearGradient(0, o.y - amp, 0, bot); g.addColorStop(0, css(o.col)); g.addColorStop(1, css(o.col2 || o.col));
      c.fillStyle = g; c.globalAlpha = o.a == null ? 1 : o.a; c.beginPath(); c.moveTo(x0, bot);
      for (let x = x0; x <= x1; x += 5) c.lineTo(x, yAt(x)); c.lineTo(x1, bot); c.fill(); c.globalAlpha = 1;
      if (o.lit) { // lit facets
        for (let x = x0; x < x1; x += this.rr(30, 90)) {
          const y = yAt(x), w = this.rr(30, 110), h = this.rr(20, amp * 0.9);
          this.poly([[x, y], [x + this.lx * w, y + h], [x + this.lx * w * 0.2, y + h * 1.1]], o.lit, 0.55);
        }
      }
      return yAt;
    }
    sea(y, top, bot, glint, sx, bottom) {
      const c = this.c, g = c.createLinearGradient(0, y, 0, bottom || H); g.addColorStop(0, css(top)); g.addColorStop(1, css(bot));
      c.fillStyle = g; c.fillRect(0, y, W, (bottom || H) - y);
      const hh = (bottom || H) - y;
      for (let i = 0; i < 520; i++) {
        const t = Math.pow(this.r(), 1.6), yy = y + t * hh, sc = 0.25 + t * 1.6;
        let x = this.rr(0, W); if (sx != null && this.r() < 0.6) x = sx + (this.r() + this.r() - 1) * (60 + t * 380);
        this.ell(x, yy, this.rr(8, 46) * sc, this.rr(1, 3.4) * sc, this.r() < 0.6 ? glint : mix(top, bot, t * 0.6 + 0.3), 0.75);
      }
    }
    waves(y0, y1, col, n, foam) {
      for (let i = 0; i < (n || 40); i++) {
        const t = this.r(), y = y0 + (y1 - y0) * t, x = this.rr(-50, W), w = this.rr(60, 200) * (0.5 + t), h = this.rr(8, 26) * (0.5 + t);
        this.blob([[x, y], [x + w * 0.5, y - h], [x + w, y], [x + w * 0.5, y + h * 0.3]], col, 0.8);
        if (foam) this.curve([[x + w * 0.15, y - h * 0.5], [x + w * 0.5, y - h], [x + w * 0.85, y - h * 0.5]], 3 + t * 4, foam, 0.9);
      }
    }
    rock(x, y, w, h, col) {
      const P = [], n = 7; for (let i = 0; i <= n; i++) { const t = i / n; P.push([x - w / 2 + w * t + this.rr(-0.05, 0.05) * w, y - h * Math.sin(t * Math.PI) * this.rr(0.7, 1.05)]); }
      this.poly([[x - w / 2, y]].concat(P, [[x + w / 2, y]]), col);
      const m = P[3 + (this.lx > 0 ? 1 : -1)];
      this.poly([P[3], m, [m[0] + this.lx * w * 0.1, y - h * 0.2], [P[3][0], y - h * 0.35]], lite(col, 0.28));
      this.poly([P[3], [P[3][0], y], [x - this.lx * w / 2, y], P[this.lx > 0 ? 1 : 5]], dark(col, 0.22), 0.8);
    }
    grass(x0, x1, yf, h, col, n) {
      for (let i = 0; i < (n || 200); i++) {
        const x = this.rr(x0, x1), y = typeof yf === 'function' ? yf(x) : yf, hh = h * this.rr(0.4, 1.2);
        this.line(x, y + 3, x + this.rr(-0.4, 0.4) * hh, y - hh, this.rr(1.5, 4), this.r() < 0.5 ? col : lite(col, 0.25), 0.9);
      }
    }

    // ---------- architecture ----------
    block(x, base, w, h, col) {
      this.rect(x - w / 2, base - h, w, h, col);
      this.rect(this.lx < 0 ? x : x - w / 2, base - h, w / 2, h, dark(col, 0.14));
      this.rect(x - w / 2 - w * 0.04, base - h, w * 1.08, Math.max(3, h * 0.035), lite(col, 0.3));
      const rows = Math.max(1, h / 34 | 0), cols = Math.max(1, w / 22 | 0);
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (this.r() < 0.45)
        this.rect(x - w / 2 + (j + 0.25) * w / cols, base - h + (i + 0.35) * h / rows, w / cols * 0.4, h / rows * 0.4, dark(col, 0.3), 0.8);
    }
    shikhara(x, base, w, h, col, gold) {
      gold = gold || '#f0cf78'; const n = 10, bh = h * 0.2, th = h * 0.66, lx = this.lx;
      this.rect(x - w * 0.62, base - bh, w * 1.24, bh, dark(col, 0.1)); this.rect(x - w * 0.66, base - bh, w * 1.32, bh * 0.14, lite(col, 0.25));
      for (let k = -2; k <= 2; k++) this.rect(x + k * w * 0.25 - w * 0.03, base - bh * 0.8, w * 0.06, bh * 0.8, dark(col, 0.35));
      for (let i = 0; i < n; i++) {
        const t = i / n, wi = w * (1 - Math.pow(t, 1.7) * 0.78), y = base - bh - th * t, sh = th / n + 1, cc = i % 2 ? col : dark(col, 0.08);
        this.rect(x - wi / 2, y - sh, wi, sh, cc);
        this.rect(lx < 0 ? x - wi / 2 : x + wi * 0.18, y - sh, wi * 0.32, sh, lite(cc, 0.22));
        this.rect(lx < 0 ? x + wi * 0.2 : x - wi / 2, y - sh, wi * 0.3, sh, dark(cc, 0.2));
        this.rect(x - wi * 0.12, y - sh, wi * 0.24, sh * 0.4, lite(cc, 0.12));
      }
      const ty = base - bh - th; this.ell(x, ty - h * 0.02, w * 0.17, h * 0.035, dark(col, 0.2));
      this.poly([[x - w * 0.07, ty - h * 0.05], [x + w * 0.07, ty - h * 0.05], [x, ty - h * 0.14]], gold); this.circ(x, ty - h * 0.055, w * 0.06, gold);
    }
    gopuram(x, base, w, h, col, gold) {
      const n = 7, lx = this.lx;
      for (let i = 0; i < n; i++) {
        const t = i / n, wi = w * (1 - t * 0.55), y = base - h * 0.88 * t, sh = h * 0.88 / n;
        this.rect(x - wi / 2, y - sh, wi, sh, i % 2 ? col : dark(col, 0.1));
        this.rect(lx < 0 ? x - wi / 2 : x, y - sh, wi / 2, sh, lite(col, 0.12), 0.7);
        this.rect(x - wi / 2 - 3, y - sh, wi + 6, sh * 0.16, lite(col, 0.32));
        for (let k = 0; k < 5; k++) this.rect(x - wi / 2 + (k + 0.3) * wi / 5, y - sh * 0.7, wi / 12, sh * 0.5, dark(col, 0.35), 0.8);
      }
      const wt = w * 0.45; this.ell(x, base - h * 0.88, wt / 2, h * 0.1, dark(col, 0.05)); this.rect(x - wt / 2, base - h * 0.88, wt, h * 0.04, col);
      for (let k = -1; k <= 1; k++) this.poly([[x + k * wt * 0.3 - 3, base - h * 0.96], [x + k * wt * 0.3 + 3, base - h * 0.96], [x + k * wt * 0.3, base - h * 1.04]], gold || '#f0cf78');
      this.rect(x - w * 0.09, base - h * 0.13, w * 0.18, h * 0.13, dark(col, 0.5));
    }
    pavilion(x, base, w, h, col, gold) {
      const ph = h * 0.12, ch = h * 0.42, k = Math.max(3, w / 30 | 0);
      this.rect(x - w / 2, base - ph, w, ph, dark(col, 0.12)); this.rect(x - w * 0.46, base - ph - ch, w * 0.92, ch, dark(col, 0.42));
      for (let i = 0; i <= k; i++) { const cx = x - w * 0.44 + i * w * 0.88 / k; this.rect(cx - w * 0.02, base - ph - ch, w * 0.04, ch, i % 2 ? col : lite(col, 0.2)); }
      this.rect(x - w * 0.55, base - ph - ch - h * 0.07, w * 1.1, h * 0.07, lite(col, 0.18));
      this.rect(x - w * 0.3, base - ph - ch - h * 0.22, w * 0.6, h * 0.15, col);
      const c = this.c; c.fillStyle = css(gold || lite(col, 0.3)); c.beginPath(); c.ellipse(x, base - ph - ch - h * 0.22, w * 0.24, h * 0.2, 0, Math.PI, TAU); c.fill();
      this.line(x, base - ph - ch - h * 0.42, x, base - h, 3, gold || '#f0cf78');
    }
    wall(x0, x1, base, h, col) {
      this.rect(x0, base - h, x1 - x0, h, col); this.rect(x0, base - h, x1 - x0, h * 0.08, lite(col, 0.25));
      for (let x = x0; x < x1; x += h * 0.22) this.rect(x, base - h * 1.1, h * 0.11, h * 0.1, col);
      for (let x = x0 + 20; x < x1; x += this.rr(40, 120)) this.rect(x, base - h * this.rr(0.3, 0.8), this.rr(10, 40), this.rr(4, 14), dark(col, 0.18), 0.7);
    }
    city(o) {
      const L = [];
      for (let i = 0; i < (o.n || 20); i++) {
        const x = this.rr(o.x0, o.x1), bh = o.h * this.rr(0.3, 1) * (o.peakX != null ? 0.45 + 0.75 * Math.exp(-Math.pow((x - o.peakX) / (o.peakW || 300), 2)) : 1);
        L.push([x, bh, this.r(), this.r()]);
      }
      L.sort((a, b) => b[1] - a[1]);
      for (const q of L) {
        const x = q[0], bh = q[1], base = typeof o.base === 'function' ? o.base(x) : o.base, cc = mix(o.col, o.col2 || o.col, q[3]);
        if (q[2] < 0.3) this.shikhara(x, base, bh * 0.42, bh, cc, o.gold);
        else if (q[2] < 0.48) this.pavilion(x, base, bh * 0.9, bh * 0.7, cc, o.gold);
        else if (q[2] < 0.62) this.gopuram(x, base, bh * 0.5, bh, cc, o.gold);
        else this.block(x, base, bh * this.rr(0.35, 0.8), bh * this.rr(0.5, 0.9), cc);
      }
    }
    pillar(x, base, w, h, col) {
      this.rect(x - w / 2, base - h, w, h, col); this.rect(this.lx < 0 ? x - w / 2 : x + w * 0.15, base - h, w * 0.35, h, lite(col, 0.25));
      this.rect(this.lx < 0 ? x + w * 0.2 : x - w / 2, base - h, w * 0.3, h, dark(col, 0.25));
      this.rect(x - w * 0.75, base - h, w * 1.5, h * 0.05, lite(col, 0.15)); this.rect(x - w * 0.65, base - h * 0.92, w * 1.3, h * 0.03, dark(col, 0.2));
      this.rect(x - w * 0.75, base - h * 0.07, w * 1.5, h * 0.07, dark(col, 0.1));
      for (let i = 0; i < 6; i++) this.rect(x - w / 2, base - h * (0.15 + i * 0.13), w, h * 0.012, dark(col, 0.3), 0.6);
    }

    // ---------- plants ----------
    tree(x, base, h, o) {
      o = o || {}; const col = o.col || '#5f7f55', tr = o.trunk || '#4a3530', kind = o.kind || 'broad', bend = this.rr(-0.12, 0.12) * h;
      if (kind === 'palm') {
        const top = [x + bend * 2, base - h];
        this.tube([[x, base], [x + bend * 0.6, base - h * 0.5], top], h * 0.05, h * 0.03, tr);
        for (let i = 0; i < 9; i++) { const a = (-200 + i * 28 + this.rr(-8, 8)) * D, l = h * this.rr(0.28, 0.4); this.tube([top, [top[0] + Math.cos(a) * l * 0.6, top[1] + Math.sin(a) * l * 0.6 - l * 0.15], [top[0] + Math.cos(a) * l, top[1] + Math.sin(a) * l + l * 0.25]], h * 0.035, 2, i % 2 ? col : dark(col, 0.2)); }
        return;
      }
      if (kind === 'pine') {
        this.tube([[x, base], [x + bend * 0.5, base - h * 0.5], [x + bend, base - h]], h * 0.035, h * 0.012, tr);
        for (let i = 0; i < 9; i++) {
          const t = 0.3 + i * 0.08, y = base - h * t, w = h * 0.2 * (1.25 - t) * this.rr(0.7, 1.2), cx = x + bend * t + this.rr(-0.5, 0.5) * w * 0.5;
          this.rect(cx - w / 2, y - h * 0.035, w, h * 0.055, dark(col, 0.2)); this.rect(cx - w / 2 + this.lx * w * 0.1, y - h * 0.05, w * 0.7, h * 0.035, col);
          this.rect(cx - w * 0.2 + this.lx * w * 0.2, y - h * 0.055, w * 0.35, h * 0.018, lite(col, 0.3));
        }
        return;
      }
      const tx = x + bend, ty = base - h * 0.62;
      this.tube([[x, base], [x + bend * 0.3, base - h * 0.3], [tx, ty]], h * 0.07, h * 0.035, tr);
      this.tube([[x + bend * 0.4, base - h * 0.38], [tx - h * 0.16, ty - h * 0.04], [tx - h * 0.24, ty - h * 0.14]], h * 0.03, h * 0.012, tr);
      this.tube([[x + bend * 0.5, base - h * 0.44], [tx + h * 0.15, ty - h * 0.06], [tx + h * 0.22, ty - h * 0.18]], h * 0.03, h * 0.012, tr);
      const sp = o.spread || 0.34, B = [], nb = h > 500 ? 90 : h > 250 ? 54 : 30, bs = h > 500 ? 0.55 : h > 250 ? 0.75 : 1;
      for (let i = 0; i < nb; i++) { const a = this.r() * TAU, d = Math.sqrt(this.r()); B.push([tx + Math.cos(a) * d * h * sp, ty - h * 0.14 + Math.sin(a) * d * h * 0.24, h * this.rr(0.06, 0.13) * bs, this.rr(-0.6, 0.6), this.rr(0.55, 0.9)]); }
      B.sort((p1, p2) => p2[1] - p1[1]);
      for (const b of B) this.ell(b[0], b[1] + b[2] * 0.25, b[2] * 1.25, b[2] * b[4], dark(col, 0.3), 1, b[3]);
      for (const b of B) this.ell(b[0] + this.lx * b[2] * 0.2, b[1] - b[2] * 0.15, b[2] * 0.95, b[2] * b[4] * 0.7, mix(col, dark(col, 0.2), this.r() * 0.6), 1, b[3]);
      for (const b of B) if (this.r() < 0.65) this.ell(b[0] + this.lx * b[2] * 0.45, b[1] - b[2] * 0.4, b[2] * 0.5, b[2] * b[4] * 0.32, lite(col, this.rr(0.2, 0.45)), 1, b[3]);
      if (o.flowers) for (let i = 0; i < nb * 2; i++) { const b = B[this.r() * B.length | 0]; this.rect(b[0] + this.rr(-1, 1) * b[2], b[1] + this.rr(-1, 1) * b[2], h * 0.014 + 2, h * 0.012 + 2, o.flowers); }
    }
    forest(o) {
      const L = []; for (let i = 0; i < o.n; i++) { const x = this.rr(o.x0, o.x1); L.push([x, (typeof o.base === 'function' ? o.base(x) : o.base) + this.rr(-1, 1) * (o.jit || 0), o.h * this.rr(0.6, 1.2)]); }
      L.sort((a, b) => a[1] - b[1]);
      for (const q of L) this.tree(q[0], q[1], q[2], { col: mix(o.col, o.col2 || o.col, this.r()), trunk: o.trunk, kind: o.kind, flowers: o.flowers && this.r() < 0.4 ? o.flowers : null });
    }

    // ---------- fire, ribbons, serpents ----------
    fire(x, y, w, h, o) {
      o = o || {}; const c = this.c, cols = o.cols || ['#a8261f', '#e2592a', '#f8a33c', '#ffe79a'];
      c.globalCompositeOperation = 'screen'; this.glow(x, y - h * 0.4, Math.max(w, h) * 1.3, cols[2], 0.4); c.globalCompositeOperation = 'source-over';
      cols.forEach((col, li) => {
        const sc = 1 - li * 0.2, n = Math.max(3, (w / 26 | 0) + 3 - li);
        for (let i = 0; i < n; i++) {
          const bx = x + this.rr(-0.5, 0.5) * w * sc, th = h * sc * this.rr(0.45, 1) * (1 - Math.abs(bx - x) / w), tw = Math.max(6, w * 0.16 * this.rr(0.6, 1.3)), tx = bx + this.rr(-1, 1) * tw + (o.sway || 0) * th;
          c.fillStyle = css(col); c.beginPath(); c.moveTo(bx - tw, y);
          c.bezierCurveTo(bx - tw, y - th * 0.5, tx - tw * 0.3, y - th * 0.7, tx, y - th);
          c.bezierCurveTo(tx + tw * 0.4, y - th * 0.6, bx + tw, y - th * 0.4, bx + tw, y); c.fill();
        }
      });
      for (let i = 0; i < 26; i++) this.rect(x + this.rr(-0.7, 0.7) * w + (o.sway || 0) * h, y - this.rr(0.3, 1.5) * h, this.rr(2, 6), this.rr(2, 6), cols[3], 0.9);
    }
    smoke(x, y, w, h, col, drift) {
      for (let i = 0; i < 22; i++) { const t = i / 22, r = w * (0.25 + t * 0.9) * this.rr(0.5, 1); this.circ(x + (drift || 0) * t * h + this.rr(-0.5, 0.5) * w * (0.4 + t), y - t * h, r, mix(col, '#d9d0de', t * 0.6), 0.55 - t * 0.3); }
    }
    ribbon(pts, w, col, a) {
      const self = this, ph = this.r() * 6;
      const c = this.c; c.globalAlpha = a == null ? 1 : a;
      this.tube(pts, t => w * (0.55 + 0.45 * Math.sin(t * 9 + ph)) * (1 - t * 0.6), 0, col, 16);
      c.globalAlpha = (a == null ? 1 : a) * 0.6;
      this.tube(pts.map(q => [q[0], q[1] - w * 0.18]), t => w * 0.25 * (1 - t * 0.6), 0, lite(col, 0.4), 16);
      c.globalAlpha = 1;
    }
    serpent(pts, w0, w1, col, o) {
      o = o || {}; const belly = o.belly || lite(col, 0.45);
      const wf = t => (w0 + (w1 - w0) * t) * (o.swell ? 0.75 + 0.25 * Math.sin(t * Math.PI) : 1);
      const s = this.tube(pts, t => wf(t), 0, dark(col, 0.22), 14);
      this.tube(pts.map(q => [q[0] + this.lx * 2, q[1] - wf(0.5) * 0.12]), t => wf(t) * 0.72, 0, col, 14);
      this.tube(pts.map(q => [q[0], q[1] + wf(0.5) * 0.3]), t => wf(t) * 0.25, 0, belly, 14);
      for (let i = 3; i < s.length - 2; i += 2) { // scales and spine
        const a = s[i - 1], b = s[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = wf(i / s.length);
        const nx = -dy / l, ny = dx / l, up = ny > 0 ? -1 : 1;
        this.line(s[i][0] + nx * w * 0.1, s[i][1] + ny * w * 0.1, s[i][0] - nx * w * 0.3, s[i][1] - ny * w * 0.3, Math.max(1.5, w * 0.05), lite(col, 0.3), 0.7);
        if (o.mane) this.poly([[s[i][0] + nx * up * w * 0.45, s[i][1] + ny * up * w * 0.45], [b[0] + nx * up * w * 0.45, b[1] + ny * up * w * 0.45], [s[i][0] + nx * up * w * (0.8 + this.r() * 0.4) - dx / l * w * 0.4, s[i][1] + ny * up * w * (0.8 + this.r() * 0.4) - dy / l * w * 0.4]], o.mane);
      }
      if (o.head !== false) {
        const h = s[s.length - 1], p = s[s.length - 4], an = Math.atan2(h[1] - p[1], h[0] - p[0]), hw = (o.headW || w1 * 1.1);
        if (o.hood) { this.ell(h[0] - Math.cos(an) * hw * 0.9, h[1] - Math.sin(an) * hw * 0.9, hw * 1.5, hw * 1.25, dark(col, 0.15), 1, an); this.ell(h[0] - Math.cos(an) * hw * 0.8, h[1] - Math.sin(an) * hw * 0.8, hw * 1.1, hw * 0.75, belly, 1, an); }
        this.ell(h[0], h[1], hw * 0.95, hw * 0.6, col, 1, an); this.ell(h[0] + Math.cos(an) * hw * 0.5, h[1] + Math.sin(an) * hw * 0.5, hw * 0.6, hw * 0.4, lite(col, 0.15), 1, an);
        this.circ(h[0] + Math.cos(an - 0.6) * hw * 0.45, h[1] + Math.sin(an - 0.6) * hw * 0.45, hw * 0.11, o.eye || '#ffe98a');
        if (o.tongue) this.curve([[h[0] + Math.cos(an) * hw, h[1] + Math.sin(an) * hw], [h[0] + Math.cos(an) * hw * 1.6, h[1] + Math.sin(an) * hw * 1.6 + hw * 0.1], [h[0] + Math.cos(an) * hw * 2, h[1] + Math.sin(an) * hw * 2 - hw * 0.2]], hw * 0.07, '#c7372f');
      }
      return s;
    }

    // ---------- creatures ----------
    wing(sx, sy, tx, ty, wd, col, tip) {
      const dx = tx - sx, dy = ty - sy, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l; let nx = -uy, ny = ux; if (ny < 0) { nx = -nx; ny = -ny; }
      const bone = t => [sx + dx * t - nx * l * 0.13 * Math.sin(t * Math.PI), sy + dy * t - ny * l * 0.13 * Math.sin(t * Math.PI)], N = 15;
      for (let k = 0; k < N; k++) {
        const q = k / (N - 1), t = 0.1 + 0.9 * q, b = bone(t), m = Math.pow(q, 1.7); let fx = nx * (1 - m * 0.75) + ux * m * 1.15, fy = ny * (1 - m * 0.75) + uy * m * 1.15; const fl = Math.hypot(fx, fy); fx /= fl; fy /= fl;
        const len = wd * (0.8 + 0.5 * Math.sin(t * Math.PI * 0.85)) * (1 + 0.35 * m), e = [b[0] + fx * len, b[1] + fy * len], md = [(b[0] + e[0]) / 2 + nx * wd * 0.06, (b[1] + e[1]) / 2 + ny * wd * 0.06];
        this.tube([b, md, e], t2 => wd * (0.2 - 0.13 * t2 * t2), 0, k % 2 ? col : dark(col, 0.14), 6);
        if (tip && q > 0.45) this.tube([[b[0] + (e[0] - b[0]) * 0.6, b[1] + (e[1] - b[1]) * 0.6], e], wd * 0.14, wd * 0.05, tip, 4);
        this.line(b[0], b[1], md[0], md[1], Math.max(1, wd * 0.02), lite(col, 0.4), 0.6);
      }
      const ang = Math.atan2(dy, dx);
      for (let k = 0; k < 11; k++) { const t = 0.06 + 0.84 * k / 10, b = bone(t); this.ell(b[0] + nx * wd * 0.24, b[1] + ny * wd * 0.24, wd * 0.2, wd * 0.3, k % 2 ? lite(col, 0.16) : lite(col, 0.05), 1, ang); }
      for (let k = 0; k < 9; k++) { const t = 0.04 + 0.7 * k / 8, b = bone(t); this.ell(b[0] + nx * wd * 0.1, b[1] + ny * wd * 0.1, wd * 0.16, wd * 0.2, lite(col, 0.3), 1, ang); }
      this.tube([bone(0), bone(0.25), bone(0.5), bone(0.75), bone(1)], wd * 0.24, wd * 0.05, lite(col, 0.4));
    }
    eagle(x, y, s, o) {
      o = o || {}; const f = o.f || 1, col = o.col || '#8a6a4a', up = o.up == null ? 0.6 : o.up, gold = o.gold || '#f2c14e', cr = o.crane, nk = cr ? 2.1 : 1;
      const sp = o.spread || 0; this.wing(x - f * s * 0.02, y - s * 0.06, x - f * s * (0.5 + sp * 0.75), y - s * up * (1.35 - sp * 0.5), s * 0.4, dark(col, 0.28), o.tip && dark(o.tip, 0.3));
      if (cr) { this.line(x - f * s * 0.3, y + s * 0.05, x - f * s * 1.0, y + s * 0.2, s * 0.03, gold); this.line(x - f * s * 0.3, y + s * 0.08, x - f * s * 0.95, y + s * 0.27, s * 0.03, dark(gold, 0.2)); }
      for (let k = 0; k < 7; k++) { const a = (-18 + k * 9) * D; this.tube([[x - f * s * 0.3, y + s * 0.02], [x - f * s * (0.3 + Math.cos(a) * (cr ? 0.28 : 0.5)), y + s * (0.02 + Math.sin(a) * 0.5)]], s * 0.1, s * 0.05, k % 2 ? dark(col, 0.25) : dark(col, 0.12), 4); }
      const B = q => [x + f * q[0] * s, y + q[1] * s];
      this.blob([[0.44, -0.1], [0.2, -0.2], [-0.2, -0.15], [-0.46, 0.0], [-0.2, 0.16], [0.2, 0.15]].map(B), dark(col, 0.18)); this.blob([[0.4, -0.1], [0.18, -0.19], [-0.2, -0.13], [-0.38, -0.02], [-0.1, 0.06], [0.24, 0.05]].map(B), col); this.blob([[0.38, -0.02], [0.1, 0.04], [-0.2, 0.1], [0.05, 0.14], [0.3, 0.08]].map(B), lite(col, 0.4));
      const hx = x + f * s * (0.38 + 0.24 * nk), hy = y - s * (0.1 + 0.16 * nk);
      this.tube([[x + f * s * 0.34, y - s * 0.07], [x + f * s * (0.4 + 0.1 * nk), y - s * (0.16 + 0.04 * nk)], [hx, hy]], s * 0.2, s * (cr ? 0.07 : 0.13), lite(col, 0.3));
      this.circ(hx + f * s * 0.02, hy - s * 0.01, s * (cr ? 0.065 : 0.085), o.head || '#f4ead8'); this.circ(hx + f * s * 0.02 + this.lx * s * 0.02, hy - s * 0.03, s * 0.045, lite(o.head || '#f4ead8', 0.4));
      if (cr) this.poly([[hx + f * s * 0.05, hy - s * 0.04], [hx + f * s * 0.34, hy + s * 0.02], [hx + f * s * 0.05, hy + s * 0.03]], gold);
      else this.blob([[hx + f * s * 0.07, hy - s * 0.05], [hx + f * s * 0.19, hy - s * 0.03], [hx + f * s * 0.215, hy + s * 0.055], [hx + f * s * 0.15, hy + s * 0.015], [hx + f * s * 0.07, hy + s * 0.035]], gold);
      this.circ(hx + f * s * 0.045, hy - s * 0.02, s * 0.012, '#2a1c22');
      if (!cr) { this.line(x - f * s * 0.02, y + s * 0.12, x - f * s * 0.1, y + s * 0.28, s * 0.04, gold); this.line(x + f * s * 0.1, y + s * 0.12, x + f * s * 0.04, y + s * 0.3, s * 0.04, gold); }
      this.wing(x + f * s * 0.12, y - s * 0.08, x + f * s * (0.02 + sp * 0.95), y - s * up * (1.6 - sp * 0.55) - s * 0.08, s * 0.44, col, o.tip);
    }
    quad(x, y, h, o) {
      o = o || {}; const f = o.f || 1, kind = o.kind || 'horse', col = o.col || '#e9e2d6', gait = o.gait || 'stand';
      const E = kind === 'elephant', Dd = kind === 'deer';
      const rx = h * (E ? 0.62 : Dd ? 0.44 : 0.5), ry = h * (E ? 0.36 : Dd ? 0.17 : 0.2), cx = x, cy = y - h * (E ? 0.66 : 0.74);
      const lw = h * (E ? 0.2 : Dd ? 0.05 : 0.07), off = { stand: [[0.02, 0], [-0.04, 0], [0.03, 0], [-0.05, 0]], walk: [[0.12, 0], [-0.1, 0], [-0.12, 0], [0.1, 0]], gallop: [[0.42, -0.14], [0.28, -0.05], [-0.42, -0.1], [-0.3, -0.02]], leap: [[0.3, -0.3], [0.2, -0.24], [-0.46, -0.1], [-0.36, -0.05]] }[gait];
      const leg = (bx, i, c) => {
        const hx = bx + f * off[i][0] * h, hy = y + off[i][1] * h, by = cy + ry * 0.3, kx = (bx + hx) / 2 + f * (i < 2 ? (gait === 'leap' ? 0.16 : 0.05) : -0.08) * h * (gait === 'stand' ? 0.3 : 1), ky = (by + hy) / 2 + (gait === 'leap' && i < 2 ? 0.08 * h : 0);
        if (E) { this.limb(bx, by, kx, ky, lw * 1.3, lw, c); this.limb(kx, ky, hx, hy, lw, lw * 0.9, c); return; }
        this.limb(bx, by, kx, ky, lw * 2.1, lw * 0.85, c, 0.3); this.limb(kx, ky, hx, hy, lw * 0.7, lw * 0.45, c, 0); this.cap(hx, hy, hx + f * lw * 0.3, hy + lw * 0.1, lw * 0.6, lw * 0.5, '#3a2a2c');
      };
      const fx = cx + f * rx * 0.72, bx = cx - f * rx * 0.75, dc = dark(col, 0.28);
      leg(fx, 1, dc); leg(bx, 3, dc);
      if (!E) this.ribbon([[cx - f * rx * 0.98, cy - ry * 0.5], [cx - f * (rx + h * (Dd ? 0.06 : 0.2)), cy - ry * (Dd ? 0.9 : 0)], [cx - f * (rx + h * (Dd ? 0.1 : 0.35)), cy + h * (Dd ? -0.02 : 0.3)]], h * (Dd ? 0.07 : 0.13), o.mane || dark(col, 0.3));
      if (E) { this.ell(cx, cy, rx, ry, dark(col, 0.25)); this.ell(cx + this.lx * rx * 0.06, cy - ry * 0.18, rx * 0.92, ry * 0.75, col); this.ell(cx + this.lx * rx * 0.15, cy - ry * 0.45, rx * 0.6, ry * 0.3, lite(col, 0.35)); }
      else {
        const sv = Dd ? 0.85 : 1, Bq = (k, dy2) => [[-0.54, -0.02], [-0.46, -0.2], [-0.1, -0.2], [0.3, -0.25], [0.54, -0.14], [0.57, 0.08], [0.34, 0.2], [-0.06, 0.15], [-0.38, 0.19], [-0.56, 0.1]].map(q => [cx + f * q[0] * h * (Dd ? 0.9 : 1) * k, cy + (q[1] * sv * k + dy2) * h]);
        this.blob(Bq(1, 0), dark(col, 0.26)); this.blob(Bq(0.86, -0.02), col); this.blob([[-0.4, -0.15], [0.0, -0.18], [0.4, -0.2], [0.3, -0.08], [-0.2, -0.06]].map(q => [cx + f * q[0] * h + this.lx * h * 0.02, cy + q[1] * sv * h]), lite(col, 0.35));
        this.blob([[-0.2, 0.08], [0.2, 0.1], [0.3, 0.17], [-0.1, 0.14]].map(q => [cx + f * q[0] * h, cy + q[1] * sv * h]), lite(col, 0.5), Dd ? 0.8 : 0.3);
      }
      leg(fx, 0, col); leg(bx, 2, col);
      let head;
      if (E) {
        const hx = cx + f * rx * 0.92, hy = cy - h * 0.1, hr = h * 0.3;
        this.blob([[hx - f * hr * 0.3, hy - hr * 0.9], [hx - f * hr * 1.3, hy - hr * 0.5], [hx - f * hr * 1.2, hy + hr * 0.9], [hx - f * hr * 0.3, hy + hr * 0.5]], dark(col, 0.22));
        this.circ(hx, hy, hr, col); this.circ(hx + this.lx * hr * 0.2, hy - hr * 0.3, hr * 0.6, lite(col, 0.25));
        this.tube([[hx + f * hr * 0.6, hy + hr * 0.1], [hx + f * hr * 1.1, hy + hr * 1.2], [hx + f * hr * 0.9, hy + hr * 2.1], [hx + f * hr * 1.5, hy + hr * 2.3]], hr * 0.6, hr * 0.2, col);
        this.tube([[hx + f * hr * 0.5, hy + hr * 0.6], [hx + f * hr * 1.2, hy + hr * 1.0], [hx + f * hr * 1.7, hy + hr * 0.6]], hr * 0.2, hr * 0.05, '#fbf3e0');
        this.circ(hx + f * hr * 0.35, hy - hr * 0.15, hr * 0.07, '#2a1c22');
        if (o.cloth) { this.poly([[cx - rx * 0.5, cy - ry * 0.95], [cx + rx * 0.5, cy - ry * 0.95], [cx + rx * 0.55, cy + ry * 0.5], [cx - rx * 0.55, cy + ry * 0.5]], o.cloth); this.rect(cx - rx * 0.55, cy + ry * 0.35, rx * 1.1, ry * 0.16, '#f0cf78'); this.rect(cx - rx * 0.3, cy - ry * 1.6, rx * 0.6, ry * 0.7, dark(o.cloth, 0.2)); this.rect(cx - rx * 0.36, cy - ry * 1.7, rx * 0.72, ry * 0.14, '#f0cf78'); }
        head = [hx, hy];
      } else {
        const nx0 = cx + f * rx * 0.8, ny0 = cy - ry * 0.25, nl = h * (Dd ? 0.44 : 0.46), na = (Dd ? 66 : 54) * D;
        const hx = nx0 + f * Math.cos(na) * nl, hy = ny0 - Math.sin(na) * nl, nw = h * (Dd ? 0.2 : 0.3);
        const neck = (k, c) => this.tube([[nx0 - f * h * 0.06, ny0 + h * 0.04], [(nx0 + hx) / 2 - f * h * 0.05, (ny0 + hy) / 2 + h * 0.02], [hx - f * h * 0.01, hy + h * 0.02]], nw * k, nw * 0.42 * k, c);
        neck(1, dark(col, 0.26)); neck(0.72, col);
        if (!Dd) this.tube([[nx0 - f * h * 0.16, ny0 - h * 0.06], [(nx0 + hx) / 2 - f * h * 0.14, (ny0 + hy) / 2 - h * 0.02], [hx - f * h * 0.06, hy - h * 0.07], [hx + f * h * 0.02, hy - h * 0.1]], h * 0.1, h * 0.05, o.mane || dark(col, 0.3));
        const ex = hx + f * h * (Dd ? 0.17 : 0.24), ey = hy + h * (Dd ? 0.07 : 0.15);
        this.blob([[hx - f * h * 0.06, hy - h * 0.06], [hx + f * h * 0.03, hy - h * 0.08], [ex + f * h * 0.01, ey - h * 0.035], [ex + f * h * 0.015, ey + h * 0.02], [ex - f * h * 0.04, ey + h * 0.035], [hx - f * h * 0.02, hy + h * 0.08]], col);
        this.blob([[hx - f * h * 0.03, hy - h * 0.06], [hx + f * h * 0.03, hy - h * 0.075], [ex, ey - h * 0.03], [hx + f * h * 0.04, hy - h * 0.01]], lite(col, 0.3));
        this.blob([[hx - f * h * 0.03, hy - h * 0.05], [hx - f * h * 0.1, hy - h * 0.18], [hx - f * h * 0.02, hy - h * 0.2], [hx + f * h * 0.01, hy - h * 0.06]], dark(col, 0.1));
        this.circ(hx + f * h * 0.045, hy - h * 0.005, h * 0.014, '#2a1c22'); this.circ(ex, ey, h * 0.012, '#3a2a2c');
        if (Dd && o.antlers !== false) for (const sg of [0, 1]) { const ax = hx - f * h * 0.015 * sg, c2 = sg ? dark(o.antler || '#f6e2a0', 0.2) : (o.antler || '#f6e2a0'), w = h * 0.026; this.curve([[ax, hy - h * 0.06], [ax - f * h * 0.1, hy - h * 0.26], [ax - f * h * 0.04, hy - h * 0.46], [ax + f * h * 0.08, hy - h * 0.56]], w, c2); this.curve([[ax - f * h * 0.08, hy - h * 0.2], [ax + f * h * 0.02, hy - h * 0.28], [ax + f * h * 0.08, hy - h * 0.38]], w * 0.8, c2); this.curve([[ax - f * h * 0.08, hy - h * 0.36], [ax - f * h * 0.16, hy - h * 0.46], [ax - f * h * 0.14, hy - h * 0.56]], w * 0.8, c2); }
        if (o.spots) for (let i = 0; i < 30; i++) this.circ(cx + this.rr(-0.75, 0.75) * rx, cy + this.rr(-0.8, 0.3) * ry, h * 0.013, o.spots, 0.9);
        head = [hx, hy];
      }
      return { back: [cx, cy - ry], head: head, cx: cx, cy: cy };
    }
    wheel(x, y, r, col, gold) {
      const c = this.c; c.strokeStyle = css(col); c.lineWidth = r * 0.16; c.beginPath(); c.arc(x, y, r * 0.92, 0, TAU); c.stroke();
      c.strokeStyle = css(gold); c.lineWidth = r * 0.05; c.beginPath(); c.arc(x, y, r * 0.8, 0, TAU); c.stroke();
      const a0 = this.r() * 1; for (let i = 0; i < 10; i++) this.line(x, y, x + Math.cos(a0 + i * TAU / 10) * r * 0.85, y + Math.sin(a0 + i * TAU / 10) * r * 0.85, r * 0.07, col);
      this.circ(x, y, r * 0.2, gold);
    }
    chariot(x, y, h, o) {
      o = o || {}; const f = o.f || 1, col = o.col || '#8d5a34', gold = o.gold || '#f0cf78', n = o.horses == null ? 3 : o.horses, r = h * 0.3;
      for (let i = n - 1; i >= 0; i--) this.quad(x + f * (h * 1.25 + i * h * 0.16), y - i * h * 0.03, h * 0.66, { f: f, col: i % 2 ? dark(o.horse || '#f1ebe0', 0.12) : (o.horse || '#f1ebe0'), gait: o.gait || 'gallop', mane: o.mane });
      this.line(x + f * h * 0.3, y - h * 0.4, x + f * h * 1.1, y - h * 0.5, h * 0.03, dark(col, 0.2));
      this.poly([[x - f * h * 0.5, y - h * 0.34], [x + f * h * 0.42, y - h * 0.34], [x + f * h * 0.62, y - h * 0.82], [x + f * h * 0.42, y - h * 0.7], [x - f * h * 0.5, y - h * 0.6]], col);
      this.poly([[x - f * h * 0.5, y - h * 0.6], [x + f * h * 0.42, y - h * 0.7], [x + f * h * 0.62, y - h * 0.82], [x + f * h * 0.6, y - h * 0.86], [x + f * h * 0.4, y - h * 0.75], [x - f * h * 0.5, y - h * 0.65]], gold);
      this.rect(x - h * 0.5, y - h * 0.4, h * 0.95, h * 0.05, gold);
      if (o.canopy !== false) {
        this.line(x - f * h * 0.42, y - h * 0.6, x - f * h * 0.42, y - h * 1.25, h * 0.022, gold); this.line(x + f * h * 0.3, y - h * 0.7, x + f * h * 0.3, y - h * 1.25, h * 0.022, gold);
        const c = this.c; c.fillStyle = css(o.canopyCol || '#c9463a'); c.beginPath(); c.ellipse(x - f * h * 0.06, y - h * 1.25, h * 0.5, h * 0.2, 0, Math.PI, TAU); c.fill();
        this.rect(x - f * h * 0.06 - h * 0.52, y - h * 1.27, h * 1.04, h * 0.045, gold);
        this.line(x - f * h * 0.06, y - h * 1.45, x - f * h * 0.06, y - h * 1.85, h * 0.018, gold);
        this.ribbon([[x - f * h * 0.06, y - h * 1.82], [x - f * h * 0.3, y - h * 1.86], [x - f * h * 0.55, y - h * 1.74], [x - f * h * 0.8, y - h * 1.8]], h * 0.16, o.flag || '#e8a33a');
      }
      this.wheel(x - f * h * 0.05, y - r, r, dark(col, 0.3), gold);
      return { x: x - f * h * 0.1, y: y - h * 0.45 };
    }
    mini(x, y, h, col, o) {
      o = o || {};
      this.line(x - h * 0.08, y, x - h * 0.04, y - h * 0.45, h * 0.1, dark(col, 0.2)); this.line(x + h * 0.1, y, x + h * 0.04, y - h * 0.45, h * 0.1, dark(col, 0.2));
      this.cap(x, y - h * 0.42, x, y - h * 0.74, h * 0.26, h * 0.3, col); this.circ(x, y - h * 0.88, h * 0.1, o.head || dark(col, 0.25));
      if (o.tail) this.curve([[x, y - h * 0.42], [x - o.tail * h * 0.3, y - h * 0.3], [x - o.tail * h * 0.42, y - h * 0.62]], h * 0.06, col);
      if (o.spear) this.line(x + h * 0.2, y - h * 0.1, x + h * 0.26, y - h * 1.5, Math.max(1.2, h * 0.035), o.spearCol || '#3b2b33');
      if (o.banner) { this.line(x - h * 0.2, y - h * 0.2, x - h * 0.2, y - h * 2.1, Math.max(1.5, h * 0.04), '#3b2b33'); this.poly([[x - h * 0.2, y - h * 2.1], [x - h * 0.2 + o.dir * h * 0.9, y - h * 1.95], [x - h * 0.2 + o.dir * h * 0.6, y - h * 1.75], [x - h * 0.2, y - h * 1.6]], o.banner); }
      if (o.arms) { this.line(x - h * 0.12, y - h * 0.7, x - h * 0.3, y - h * 1.05, h * 0.07, col); this.line(x + h * 0.12, y - h * 0.7, x + h * 0.3, y - h * 1.05, h * 0.07, col); }
    }
    crowd(o) {
      const L = []; for (let i = 0; i < o.n; i++) { const x = this.rr(o.x0, o.x1); L.push([x, (typeof o.y === 'function' ? o.y(x) : o.y) + this.rr(-1, 1) * (o.jit || 0)]); }
      L.sort((a, b) => a[1] - b[1]);
      for (const q of L) {
        const d = o.depth ? 0.6 + 0.8 * (q[1] - o.depth[0]) / (o.depth[1] - o.depth[0]) : 1;
        this.mini(q[0], q[1], o.h * this.rr(0.85, 1.15) * d, mix(o.col, o.col2 || o.col, this.r()), { spear: this.r() < (o.spears || 0), banner: this.r() < (o.banners || 0) ? (o.bannerCol || '#d8553a') : null, dir: o.dir || 1, tail: o.tail, arms: this.r() < (o.arms || 0), head: o.head });
      }
    }

    // ---------- the figure ----------
    figure(x, y, h, o) {
      o = o || {}; const f = o.f || 1, skin = o.skin || '#c98d62', cloth = o.cloth || '#e0a53c', cloth2 = o.cloth2 || '#c9463a', gold = o.gold || '#f3cf6b', hair = o.hair || '#2a1c22', lx = this.lx;
      const dir = a => [Math.sin(a * D) * f, Math.cos(a * D)], bw = o.broad || 1;
      const ua = 0.16 * h, fa = 0.15 * h, th = 0.235 * h, sh = 0.235 * h, to = 0.29 * h, hr = 0.058 * h * (o.headScale || 1), lean = o.lean || 0;
      const lN = o.lN || [8, -3], lF = o.lF || [-10, -2], aN = o.aN || [8, 22], aF = o.aF || [-14, 4];
      const leg = l => { const d1 = dir(l[0]), d2 = dir(l[1]); return { k: [d1[0] * th, d1[1] * th], t: [d1[0] * th + d2[0] * sh, d1[1] * th + d2[1] * sh] }; };
      const gN = leg(lN), gF = leg(lF), hx = x, hy = o.fly ? y : y - Math.max(gN.t[1], gF.t[1]);
      const td = [Math.sin(lean * D) * f, -Math.cos(lean * D)], px = -td[1], py = td[0];
      const sx = hx + td[0] * to, sy = hy + td[1] * to;
      const hl = (lean + (o.head || 0)) * D, hd = [Math.sin(hl) * f, -Math.cos(hl)], hcx = sx + hd[0] * hr * 1.75, hcy = sy + hd[1] * hr * 1.75;
      const arm = (a, ox) => { const s = [sx + px * ox, sy + py * ox - 0.01 * h], d1 = dir(a[0]), d2 = dir(a[1]), e = [s[0] + d1[0] * ua, s[1] + d1[1] * ua]; return { s: s, e: e, h: [e[0] + d2[0] * fa, e[1] + d2[1] * fa] }; };
      const AN = arm(aN, -f * 0.07 * h * bw), AF = arm(aF, f * 0.08 * h * bw), dsk = dark(skin, 0.3);
      const drawArm = (A, c) => { this.limb(A.s[0], A.s[1], A.e[0], A.e[1], 0.075 * h * bw, 0.06 * h, c); this.limb(A.e[0], A.e[1], A.h[0], A.h[1], 0.058 * h, 0.042 * h, c); this.circ(A.h[0], A.h[1], 0.028 * h, c); if (o.gold !== false && !o.plain) { const m = [(A.s[0] + A.e[0]) / 2, (A.s[1] + A.e[1]) / 2]; this.circ(m[0], m[1], 0.036 * h, gold); this.circ(m[0], m[1], 0.024 * h, c); this.circ(A.h[0] - (A.h[0] - A.e[0]) * 0.22, A.h[1] - (A.h[1] - A.e[1]) * 0.22, 0.027 * h, gold); } };
      const drawLeg = (g, c, cc) => { this.limb(hx, hy, hx + g.k[0], hy + g.k[1], 0.1 * h, 0.075 * h, c); this.limb(hx + g.k[0], hy + g.k[1], hx + g.t[0], hy + g.t[1], 0.07 * h, 0.045 * h, c); this.cap(hx + g.t[0], hy + g.t[1], hx + g.t[0] + f * 0.06 * h, hy + g.t[1] + 0.008 * h, 0.04 * h, 0.03 * h, c); if (!o.robe) this.limb(hx, hy, hx + g.k[0] * 1.05, hy + g.k[1] * 1.05, 0.135 * h, 0.105 * h, cc); };
      if (o.halo) { this.c.globalCompositeOperation = 'screen'; this.glow(hcx, hcy, hr * (o.haloR || 5), o.halo, 0.75); this.c.globalCompositeOperation = 'source-over'; }
      if (o.cape) this.blob([[sx - px * 0.1 * h, sy], [sx + px * 0.1 * h, sy], [hx - f * 0.16 * h, hy + 0.1 * h], [hx - f * 0.34 * h, hy + 0.42 * h], [hx - f * 0.12 * h, hy + 0.36 * h]], o.cape);
      (o.arms || []).forEach((a, i) => drawArm(arm(a, (i % 2 ? -1 : 1) * 0.06 * h), dsk));
      drawArm(AF, dsk); drawLeg(gF, dsk, dark(cloth, 0.3));
      if (o.tail) { const tl = o.tail === true ? 1 : o.tail; this.tube([[hx - f * 0.03 * h, hy - 0.02 * h], [hx - f * 0.22 * h * tl, hy + 0.08 * h], [hx - f * 0.42 * h * tl, hy - 0.06 * h], [hx - f * 0.46 * h * tl, hy - 0.34 * h], [hx - f * 0.3 * h * tl, hy - 0.5 * h], [hx - f * 0.2 * h * tl, hy - 0.4 * h]], 0.05 * h, 0.022 * h, dark(skin, 0.12)); }
      if (o.longhair) this.blob([[hcx - f * hr * 0.2, hcy - hr * 1.1], [hcx - f * hr * 1.3, hcy], [sx - f * 0.09 * h, sy + 0.12 * h], [sx - f * 0.12 * h, hy - 0.06 * h], [sx + f * 0.0 * h, sy + 0.06 * h]], hair);
      // torso
      const top = o.top || skin, swd = 0.105 * h * bw, wwd = 0.068 * h * (o.robe ? 1.1 : 1);
      const ls = lx * (px >= 0 ? 1 : -1), ax = sx - hx, ay = sy - hy;
      const tor = (k, sft, c) => { const Wd = [[0, 0.078], [0.3, 0.064], [0.68, 0.1 * bw], [0.95, 0.108 * bw], [1.04, 0.07 * bw]], Lf = [], Rt = []; for (const q of Wd) { const cx0 = hx + ax * q[0] + px * sft * h * ls, cy0 = hy + ay * q[0] + py * sft * h * ls, wv = q[1] * h * k; Lf.push([cx0 - px * wv, cy0 - py * wv]); Rt.push([cx0 + px * wv, cy0 + py * wv]); } this.blob(Lf.concat(Rt.reverse()), c); };
      tor(1, 0, dark(top, 0.3)); tor(0.74, 0.018, top); tor(0.3, 0.055, lite(top, 0.32));
      this.circ(sx - px * swd * 0.85, sy - py * swd * 0.85, 0.046 * h * bw, dark(top, 0.2)); this.circ(sx + px * swd * 0.85, sy + py * swd * 0.85, 0.046 * h * bw, ls > 0 ? lite(top, 0.2) : dark(top, 0.2));
      this.cap(sx, sy, sx + hd[0] * hr * 0.8, sy + hd[1] * hr * 0.8, 0.055 * h, 0.05 * h, dark(skin, 0.15));
      if (!o.plain && o.gold !== false) { this.curve([[sx - px * swd * 0.6, sy - py * swd * 0.6], [sx - td[0] * 0.07 * h, sy - td[1] * 0.07 * h], [sx + px * swd * 0.6, sy + py * swd * 0.6]], 0.016 * h, gold); }
      if (o.thread) this.line(sx + px * swd * 0.5, sy + py * swd * 0.5, hx - px * wwd * 0.8, hy - py * wwd * 0.8, 0.008 * h, '#f7efdc');
      if (o.robe) { // long garment
        const fy = hy + Math.max(gN.t[1], gF.t[1]), sw = o.robeW || 0.16;
        this.poly([[hx - px * wwd, hy - py * wwd], [hx + px * wwd, hy + py * wwd], [hx + gN.t[0] * 0.6 + sw * h, fy], [hx + gF.t[0] * 0.6 - sw * h, fy]], dark(o.robe, 0.22));
        this.poly([[hx + px * wwd * ls, hy + py * wwd * ls], [hx, hy], [hx + gN.t[0] * 0.3, fy], [hx + gN.t[0] * 0.6 + ls * sw * h, fy]], o.robe);
        for (let k = -2; k <= 2; k++) this.curve([[hx + k * wwd * 0.35, hy + 0.03 * h], [hx + k * sw * h * 0.3 + k * 0.01 * h, (hy + fy) / 2], [hx + (gN.t[0] + gF.t[0]) * 0.3 + k * sw * h * 0.45, fy - 0.01 * h]], 0.012 * h, k * ls > 0 ? lite(o.robe, 0.25) : dark(o.robe, 0.3), 0.8);
        this.rect(hx + gF.t[0] * 0.6 - sw * h, fy - 0.03 * h, sw * 2 * h + (gN.t[0] - gF.t[0]) * 0.6, 0.03 * h, gold);
        if (o.drape) this.poly([[sx - px * swd, sy - py * swd], [sx + px * swd * 0.2, sy + py * swd * 0.2], [hx + px * wwd, hy + py * wwd], [hx - px * wwd * 0.2, hy]], o.drape);
      } else drawLeg(gN, skin, cloth);
      if (!o.robe) { this.poly([[hx - 0.035 * h, hy], [hx + 0.035 * h, hy], [hx + f * 0.03 * h + 0.045 * h, hy + 0.2 * h], [hx + f * 0.03 * h - 0.03 * h, hy + 0.22 * h]], cloth2); this.poly([[hx - 0.01 * h, hy], [hx + 0.02 * h, hy], [hx + f * 0.03 * h + 0.02 * h, hy + 0.2 * h], [hx + f * 0.03 * h, hy + 0.21 * h]], lite(cloth2, 0.3)); }
      this.cap(hx - px * wwd * 0.9, hy - py * wwd * 0.9 - 0.01 * h, hx + px * wwd * 0.9, hy + py * wwd * 0.9 - 0.01 * h, 0.06 * h, 0.06 * h, o.belt || gold);
      if (o.sash !== false) this.ribbon([[hx, hy], [hx - f * 0.2 * h, hy + 0.06 * h], [hx - f * 0.38 * h, hy - 0.02 * h], [hx - f * 0.56 * h, hy + 0.1 * h]], 0.085 * h, cloth2);
      // heads
      const headAt = (cx, cy, r, main) => {
        const fw = [Math.cos(hl) * f, Math.sin(hl)], up = hd, van = o.kind === 'vanara', fc = o.face || skin;
        const M = q => [cx + fw[0] * q[0] * r - up[0] * q[1] * r, cy + fw[1] * q[0] * r - up[1] * q[1] * r];
        const LP = (pts, c, a) => this.poly(pts.map(M), c, a), LB = (pts, c) => this.blob(pts.map(M), c), LC = (u, v, rr, c) => { const q = M([u, v]); this.circ(q[0], q[1], rr * r, c); };
        if (o.back) { LC(0, 0, 1.05, van ? dark(skin, 0.15) : hair); LC(lx * f * 0.25, -0.2, 0.6, lite(van ? skin : hair, 0.15)); }
        else {
          LB([[-1, 0], [-0.75, -0.75], [-0.1, -1.02], [0.55, -0.85], [0.88, -0.35], van ? [1.5, 0.15] : [1.22, 0.08], van ? [1.45, 0.6] : [0.9, 0.3], [0.92, 0.55], [0.7, 0.98], [0.1, 0.95], [-0.6, 0.6]], dark(fc, 0.12));
          LB([[-0.5, -0.1], [-0.2, -0.8], [0.5, -0.75], [0.82, -0.3], van ? [1.4, 0.2] : [1.12, 0.08], [0.85, 0.45], [0.55, 0.85], [0, 0.7]], lx * f > 0 ? lite(fc, 0.18) : fc);
          if (van) { LB([[0.75, -0.05], [1.5, 0.1], [1.5, 0.62], [0.95, 0.8], [0.6, 0.4]], o.muzzle || '#edc3a8'); LC(1.38, 0.2, 0.07, '#3a2622'); LP([[0.85, 0.52], [1.45, 0.5], [0.9, 0.6]], '#5a2f2a'); }
          LB(van ? [[-1.1, 0.5], [-1.15, -0.5], [-0.5, -1.15], [0.3, -1.1], [0.55, -0.8], [0, -0.6], [-0.3, 0], [-0.4, 0.8]] : [[-1.08, 0.45], [-1.1, -0.5], [-0.45, -1.12], [0.35, -1.05], [0.6, -0.78], [0.1, -0.62], [-0.25, -0.1], [-0.5, 0.75]], van ? dark(skin, 0.18) : hair);
          LC(-0.2, 0.15, 0.24, van ? (o.muzzle || '#edc3a8') : dark(fc, 0.1)); if (!o.plain) LC(-0.22, 0.42, 0.17, gold);
          LP([[0.42, -0.24], [0.74, -0.2], [0.72, -0.08], [0.45, -0.1]], '#241a26'); LP([[0.35, -0.42], [0.82, -0.4], [0.8, -0.33]], '#241a26', 0.8);
          if (o.tilak) LP([[0.72, -0.8], [0.84, -0.78], [0.86, -0.42], [0.76, -0.42]], o.tilak);
          if (o.fangs) LP([[0.6, 0.5], [0.72, 0.95], [0.84, 0.5]], '#fbf3e0');
          if (o.beard) LB([[-0.5, 0.5], [0.95, 0.45], [0.9, 1.5], [0.4, o.beardLen || 2.6], [-0.1, 1.6]], o.beard);
        }
        const c = o.crown || 'mukut';
        if (c === 'mukut') {
          const g2 = dark(gold, 0.25), g3 = lite(gold, 0.55), s2 = lx * f;
          LP([[-1.08, -0.42], [0.92, -0.62], [0.82, -1.38], [-0.92, -1.25]], gold); LP([[-0.78, -1.25], [0.68, -1.38], [0.42, -2.1], [-0.55, -2.02]], gold); LP([[-0.5, -2.02], [0.36, -2.1], [0.02, -2.95], [-0.16, -2.95]], gold);
          LP(s2 > 0 ? [[0.3, -0.56], [0.92, -0.62], [0.82, -1.38], [0.3, -1.34]] : [[-1.08, -0.42], [-0.5, -0.48], [-0.45, -1.28], [-0.92, -1.25]], g3); LP(s2 > 0 ? [[0.25, -1.34], [0.68, -1.38], [0.42, -2.1], [0.15, -2.07]] : [[-0.78, -1.25], [-0.4, -1.28], [-0.3, -2.04], [-0.55, -2.02]], g3);
          LP([[-1.12, -0.4], [0.96, -0.6], [0.94, -0.82], [-1.1, -0.62]], g2); LP([[-0.82, -1.22], [0.72, -1.36], [0.7, -1.5], [-0.8, -1.36]], g2); LP([[-0.54, -2], [0.4, -2.08], [0.38, -2.2], [-0.52, -2.12]], g2);
          LC(-0.07, -3.02, 0.2, g3); LC(0.15, -1.0, 0.16, o.gem || '#c9342f'); LC(-0.45, -0.95, 0.1, o.gem || '#2f8f7a'); LC(0.05, -1.72, 0.11, o.gem || '#c9342f');
          LP([[-1.1, -0.45], [-1.45, -0.9], [-1.0, -1.1]], gold);
        } else if (c === 'bun') { LC(-0.25, -1.3, 0.62, hair); LC(-0.25 + lx * f * 0.15, -1.42, 0.3, lite(hair, 0.2)); LP([[-0.8, -0.85], [0.3, -0.98], [0.3, -0.82], [-0.8, -0.7]], o.band || '#b98a5a'); }
        else if (c === 'helmet') { LB([[-1.12, 0.1], [-1.05, -0.8], [-0.2, -1.25], [0.7, -0.95], [0.95, -0.4], [0.3, -0.5], [-0.4, -0.2]], gold); LP([[-0.4, -1.15], [0.1, -1.18], [-0.1, -2.0]], gold); LB([[-0.1, -1.9], [-0.9, -2.3], [-1.6, -1.5], [-1.0, -1.7]], o.plume || '#c9463a'); }
        else if (c === 'horns') { for (const sg of [-1, 1]) this.curve([M([sg * 0.6 - 0.2, -0.7]), M([sg * 1.5 - 0.2, -1.3]), M([sg * 1.2 - 0.2, -2.3])], r * 0.32, '#e9dcc0'); }
        if (o.feather) { const q = M([-0.5, -2.6]); this.ell(q[0], q[1], r * 0.4, r * 1.0, '#2e8f7a', 1, f * -0.4 + hl); this.circ(q[0], q[1] - r * 0.3, r * 0.24, '#3b4fa8'); }
      };
      if (o.heads) for (let i = o.heads; i >= 1; i--) for (const sg of [-1, 1]) headAt(hcx + sg * i * hr * 1.7 * (1 - i * 0.04), hcy + i * i * hr * 0.09 + hr * 0.1, hr * (0.86 - i * 0.07), false);
      headAt(hcx, hcy, hr, true);
      drawArm(AN, skin);
      const J = { head: [hcx, hcy], hN: AN.h, hF: AF.h, hip: [hx, hy], sh: [sx, sy], fN: [hx + gN.t[0], hy + gN.t[1]], fF: [hx + gF.t[0], hy + gF.t[1]], h: h, f: f };
      if (o.prop) (Array.isArray(o.prop) ? o.prop : [o.prop]).forEach(p => this.prop(p, J));
      return J;
    }
    prop(p, J) {
      const h = J.h, f = J.f, hand = p.hand === 'F' ? J.hF : J.hN, other = p.hand === 'F' ? J.hN : J.hF, gold = p.col || '#f0cf78', c = this.c;
      const an = (p.ang == null ? 170 : p.ang) * D, dx = Math.sin(an) * f, dy = Math.cos(an);
      if (p.type === 'bow') {
        const L = h * (p.len || 0.42), nx = -dy, ny = dx, bend = h * 0.17 * f;
        const t = [hand[0] + dx * L, hand[1] + dy * L], b = [hand[0] - dx * L, hand[1] - dy * L], sgn = (p.flip ? -1 : 1);
        const m = [hand[0] + nx * bend * sgn, hand[1] + ny * bend * sgn];
        this.curve([t, [m[0] + dx * L * 0.4, m[1] + dy * L * 0.4], m, [m[0] - dx * L * 0.4, m[1] - dy * L * 0.4], b], h * 0.022, gold);
        if (p.drawn) { this.line(t[0], t[1], other[0], other[1], h * 0.006, '#fff6dc'); this.line(b[0], b[1], other[0], other[1], h * 0.006, '#fff6dc'); const ax = m[0] - other[0], ay = m[1] - other[1], al = Math.hypot(ax, ay) || 1; this.arrow(other[0], other[1], m[0] + ax / al * h * 0.16, m[1] + ay / al * h * 0.16, p.arrowCol || '#fff3c4', h * 0.012); if (p.glow) { c.globalCompositeOperation = 'screen'; this.glow(m[0] + ax / al * h * 0.16, m[1] + ay / al * h * 0.16, h * 0.3, p.glow, 0.9); c.globalCompositeOperation = 'source-over'; } }
        else this.line(t[0], t[1], b[0], b[1], h * 0.006, '#fff6dc');
      } else if (p.type === 'mace') {
        const L = h * (p.len || 0.42), e = [hand[0] + dx * L, hand[1] + dy * L];
        this.line(hand[0] - dx * h * 0.06, hand[1] - dy * h * 0.06, e[0], e[1], h * 0.03, dark(gold, 0.25));
        this.circ(e[0], e[1], h * (p.r || 0.085), dark(gold, 0.15)); this.circ(e[0] + this.lx * h * 0.02, e[1] - h * 0.02, h * (p.r || 0.085) * 0.7, gold); this.circ(e[0] + this.lx * h * 0.035, e[1] - h * 0.035, h * 0.025, lite(gold, 0.6));
        this.circ(e[0] + dx * h * 0.09, e[1] + dy * h * 0.09, h * 0.03, gold);
      } else if (p.type === 'sword') {
        const L = h * (p.len || 0.4), e = [hand[0] + dx * L, hand[1] + dy * L];
        this.cap(hand[0], hand[1], e[0], e[1], h * 0.035, h * 0.008, p.col || '#e8edf2'); this.line(hand[0] - dy * h * 0.04, hand[1] + dx * h * 0.04, hand[0] + dy * h * 0.04, hand[1] - dx * h * 0.04, h * 0.02, '#f0cf78');
      } else if (p.type === 'spear' || p.type === 'staff' || p.type === 'trident' || p.type === 'flag' || p.type === 'axe') {
        const L = h * (p.len || 0.6), e = [hand[0] + dx * L, hand[1] + dy * L], b = [hand[0] - dx * L * (p.back == null ? 0.6 : p.back), hand[1] - dy * L * (p.back == null ? 0.6 : p.back)];
        this.line(b[0], b[1], e[0], e[1], h * 0.016, p.shaft || '#5a3f33');
        if (p.type === 'spear') this.poly([[e[0] - dy * h * 0.025, e[1] + dx * h * 0.025], [e[0] + dy * h * 0.025, e[1] - dx * h * 0.025], [e[0] + dx * h * 0.12, e[1] + dy * h * 0.12]], gold);
        if (p.type === 'trident') for (const s of [-1, 0, 1]) this.line(e[0] - dy * s * h * 0.05, e[1] + dx * s * h * 0.05, e[0] - dy * s * h * 0.06 + dx * h * 0.12, e[1] + dx * s * h * 0.06 + dy * h * 0.12, h * 0.014, gold);
        if (p.type === 'axe') { this.blob([[e[0], e[1]], [e[0] + f * h * 0.14, e[1] - h * 0.07], [e[0] + f * h * 0.17, e[1] + h * 0.04], [e[0] + f * h * 0.12, e[1] + h * 0.13], [e[0] - dx * h * 0.1, e[1] - dy * h * 0.1]], p.col || '#dfe6ee'); }
        if (p.type === 'flag') this.ribbon([e, [e[0] - f * h * 0.2, e[1] + h * 0.03], [e[0] - f * h * 0.42, e[1] - h * 0.04], [e[0] - f * h * 0.6, e[1] + h * 0.06]], h * 0.16, p.col || '#e8a33a');
      } else if (p.type === 'chakra') {
        c.globalCompositeOperation = 'screen'; this.glow(hand[0], hand[1] - h * 0.08, h * 0.3, gold, 0.9); c.globalCompositeOperation = 'source-over';
        c.strokeStyle = css(lite(gold, 0.5)); c.lineWidth = h * 0.02; c.beginPath(); c.arc(hand[0], hand[1] - h * 0.08, h * 0.08, 0, TAU); c.stroke();
      } else if (p.type === 'flute') {
        this.line(hand[0] - f * h * 0.1, hand[1], hand[0] + f * h * 0.16, hand[1] - h * 0.02, h * 0.014, gold);
      }
    }
    arrow(x1, y1, x2, y2, col, w) {
      w = w || 3; const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
      this.line(x1, y1, x2, y2, w, col);
      this.poly([[x2 + ux * w * 3.5, y2 + uy * w * 3.5], [x2 - uy * w * 1.5, y2 + ux * w * 1.5], [x2 + uy * w * 1.5, y2 - ux * w * 1.5]], col);
    }
    volley(n, x0, y0, x1, y1, ang, len, col, w, spread) {
      for (let i = 0; i < n; i++) { const x = this.rr(x0, x1), y = this.rr(y0, y1), a = (ang + this.rr(-1, 1) * (spread || 6)) * D, l = len * this.rr(0.7, 1.2); this.arrow(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, col, w || 2); }
    }
    lamp(x, y, s) { this.ell(x, y, s, s * 0.4, '#b5683c'); this.c.globalCompositeOperation = 'screen'; this.glow(x, y - s, s * 5, '#ffc766', 0.8); this.c.globalCompositeOperation = 'source-over'; this.ell(x, y - s * 0.9, s * 0.35, s * 0.8, '#fff0b0'); }
  }

  // ---------- the painterly pass ----------
  function paint(ref, out, seed, o) {
    o = o || {}; const r = mulberry((seed || 1) + 4099), w = ref.width, h = ref.height;
    const rc = ref.getContext('2d'), oc = out.getContext('2d'), src = rc.getImageData(0, 0, w, h).data;
    const S = 4, gw = (w / S) | 0, gh = (h / S) | 0, sm = document.createElement('canvas'); sm.width = gw; sm.height = gh;
    const sc = sm.getContext('2d'); sc.drawImage(ref, 0, 0, gw, gh); const sd = sc.getImageData(0, 0, gw, gh).data, lum = new Float32Array(gw * gh);
    for (let i = 0; i < gw * gh; i++) lum[i] = sd[i * 4] * 0.3 + sd[i * 4 + 1] * 0.59 + sd[i * 4 + 2] * 0.11;
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.drawImage(sm, 0, 0, w, h);
    const sdx = (seed % 97) * 0.37, temp = (x, y) => Math.sin(x * 0.0047 + sdx) * Math.cos(y * 0.0071 - sdx) + 0.6 * Math.sin((x + y) * 0.013 + sdx * 2) + 0.4 * Math.sin(x * 0.031 - y * 0.027);
    const layers = o.layers || [[78, 0], [38, 40], [18, 58], [9, 80], [4.5, 105], [2.5, 150]], vary = o.vary == null ? 1 : o.vary;
    for (const [size, thr] of layers) {
      const cur = thr ? oc.getImageData(0, 0, w, h).data : null, step = size * 0.5, nx = Math.ceil(w / step), ny = Math.ceil(h / step), N = nx * ny;
      const order = new Uint32Array(N); for (let i = 0; i < N; i++) order[i] = i;
      for (let i = N - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0, t = order[i]; order[i] = order[j]; order[j] = t; }
      for (let q = 0; q < N; q++) {
        const id = order[q], x = Math.min(w - 1, Math.max(0, ((id % nx) + r()) * step)) | 0, y = Math.min(h - 1, Math.max(0, (((id / nx) | 0) + r()) * step)) | 0, k = (y * w + x) * 4;
        const R = src[k], G = src[k + 1], B = src[k + 2];
        if (cur && Math.abs(cur[k] - R) + Math.abs(cur[k + 1] - G) + Math.abs(cur[k + 2] - B) < thr) continue;
        const gx0 = Math.min(gw - 2, Math.max(1, (x / S) | 0)), gy0 = Math.min(gh - 2, Math.max(1, (y / S) | 0)), gi = gy0 * gw + gx0;
        const gx = lum[gi + 1] - lum[gi - 1], gy = lum[gi + gw] - lum[gi - gw], mag = Math.hypot(gx, gy);
        let ang = mag > 4 ? Math.atan2(gy, gx) + Math.PI / 2 : Math.sin(x * 0.0021 + y * 0.004 + sdx) * 0.8 + Math.cos(y * 0.006) * 0.35;
        ang += (r() - 0.5) * (size > 20 ? 0.7 : 0.4);
        const len = size * (1.1 + r() * 2.1) * (mag > 30 ? 0.7 : 1), wd = size * (0.4 + r() * 0.55), cs = Math.cos(ang), sn = Math.sin(ang);
        const big = size > 8 ? 1 : 0.45, tp = temp(x, y) * 11 * vary * big, j = (r() - 0.5) * 20 * big, lumv = (R + G + B) / 3, sat = lumv > 60 ? 1 : 0.5;
        oc.setTransform(cs, sn, -sn, cs, x, y); oc.globalAlpha = size > 30 ? 0.8 + r() * 0.2 : 0.7 + r() * 0.3;
        oc.fillStyle = 'rgb(' + ((R + j + tp * sat + (r() - 0.5) * 14 * big) | 0) + ',' + ((G + j + (r() - 0.5) * 12 * big) | 0) + ',' + ((B + j - tp * sat + (r() - 0.5) * 16 * big) | 0) + ')';
        oc.fillRect(-len / 2, -wd / 2, len, wd);
        if (size > 5) { oc.globalAlpha = 0.16; for (let b = 0; b < 3; b++) { oc.fillStyle = r() < 0.55 ? 'rgb(255,247,226)' : 'rgb(46,28,62)'; oc.fillRect(-len / 2 + r() * len * 0.2, -wd / 2 + r() * wd * 0.85, len * (0.4 + r() * 0.6), wd * (0.08 + r() * 0.12)); } }
      }
    }
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = o.crisp == null ? 0.16 : o.crisp; oc.drawImage(ref, 0, 0); oc.globalAlpha = 1;
    for (let i = 0; i < 120000; i++) { oc.fillStyle = r() < 0.5 ? 'rgba(255,250,235,0.06)' : 'rgba(30,18,44,0.06)'; oc.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5); }
    const g = oc.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, w * 0.72); g.addColorStop(0, 'rgba(30,16,40,0)'); g.addColorStop(1, 'rgba(30,16,40,0.3)'); oc.fillStyle = g; oc.fillRect(0, 0, w, h);
  }

  function render(scene, out, seedShift) {
    const ref = document.createElement('canvas'); ref.width = W; ref.height = H; out.width = W; out.height = H;
    const ctx = ref.getContext('2d'), seed = (scene.seed || 7) + (seedShift || 0);
    scene.draw(new Painter(ctx, seed, scene.light || -1));
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    paint(ref, out, seed, scene.paint);
    return out;
  }

  root.Epic = { W: W, H: H, Painter: Painter, paint: paint, render: render, mix: mix, lite: lite, dark: dark, css: css, scenes: {} };
})(typeof window !== 'undefined' ? window : globalThis);
