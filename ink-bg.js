// THIS IS AI GENERATED CODE. ONLY USE AS REFERENCE. DO NOT USE
// in index.html: <script src="ink-bg.js"></script>
// Ink flourishes that draw themselves down the page as you scroll.
// Edit the settings below.
(() => {
  const OPACITY = 0.2;       // overall strength. Lower = fainter
  const GROW_MS = 4200;      // how long one flourish takes to draw itself
  const SPACING = 60;        // extra gap between flourishes down the page, in px
  const SEED = 11;           // change for a different arrangement
  const SIZE = 1;            // 1 = normal. Try 0.8 smaller or 1.3 larger

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:' + OPACITY + ';';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1, ink = '#111111';
  let flourishes = [];

  // Small seeded random generator so the arrangement is the same every visit
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // Walk a pen along a path. curv(u, s) is how fast the pen turns at each step.
  // A turning rate that keeps increasing makes the pen wind into a curl.
  function walk(x, y, h, len, curv, ds) {
    const pts = [];
    const n = Math.max(2, Math.ceil(len / ds));
    let px = x, py = y, ph = h;
    for (let i = 0; i <= n; i++) {
      pts.push({ x: px, y: py, h: ph });
      ph += curv(i / n, i * ds) * ds;
      px += Math.cos(ph) * ds;
      py += Math.sin(ph) * ds;
    }
    return pts;
  }

  // Give a path its ink look: tapered width, slight wobble, speckle
  function inkify(pts, w0, w1, power, rand, scale) {
    const ph1 = rand() * 6.28, ph2 = rand() * 6.28;
    const dots = [];
    for (let i = 0; i < pts.length; i++) {
      const u = i / (pts.length - 1);
      const p = pts[i];
      const lead = Math.min(1, i / 4);                      // thin at the very start
      const wob = 1 + 0.16 * Math.sin(i * 0.23 + ph1) + 0.08 * Math.sin(i * 0.61 + ph2);
      p.w = Math.max(0.45, lerp(w0, w1, Math.pow(u, power)) * wob * (0.55 + 0.45 * lead) * scale);
      p.x += 0.6 * Math.sin(i * 0.17 + ph2) * scale;
      p.y += 0.6 * Math.sin(i * 0.19 + ph1) * scale;
      if (i % 5 === 0 && rand() < 0.6) {
        const off = (p.w / 2 + 0.7 + rand() * 2.2 * scale) * (rand() < 0.5 ? -1 : 1);
        dots.push({
          i,
          x: p.x + Math.cos(p.h + Math.PI / 2) * off,
          y: p.y + Math.sin(p.h + Math.PI / 2) * off,
          r: (0.35 + rand() * 0.55) * scale,
        });
      }
    }
    return dots;
  }

  // One flourish: a long stem with curls peeling off it, and small curls off those
  // lean = 1 for a vine rooted on the left edge, -1 for the right edge
  function makeFlourish(rand, scale, lean) {
    const strokes = [];
    const ds = 3 * scale;

    // Stem: gentle S-curve that finishes in its own curl
    const stemLen = (480 + rand() * 120) * scale;
    const A = (0.0045 + rand() * 0.003) / scale;
    const om = (0.011 + rand() * 0.003) / scale;
    const phi = rand() * 6.28;
    const endDir = rand() < 0.75 ? -lean : lean;        // mostly curl inward
    const h0 = Math.PI / 2 - 0.7 * lean;                // leave the edge heading inward
    const stem = walk(0, 0, h0, stemLen, (u, s) => {
      let k = A * Math.sin(om * s * scale + phi);
      k += lean * 0.0056 * clamp01(1 - u / 0.5) / scale;  // swing back down along the edge
      if (u > 0.8) k += endDir * (0.006 + 0.13 * Math.pow((u - 0.8) / 0.2, 2)) / scale;
      return k;
    }, ds);
    const stemDots = inkify(stem, 3.6, 0.9, 0.85, rand, scale);
    const stemDur = GROW_MS * 0.7;
    strokes.push({ pts: stem, dots: stemDots, t0: 0, dur: stemDur });

    // Curls peeling off the stem
    const spawns = [0.16, 0.33, 0.5, 0.66];
    let side = lean;                                    // peel inward, toward the page
    spawns.forEach((u0) => {
      const u = u0 + (rand() - 0.5) * 0.06;
      const base = stem[Math.floor(u * (stem.length - 1))];
      const len = (190 + rand() * 130) * scale;
      const off = 0.55 + rand() * 0.5;
      const dir = side;                                   // curl back around
      const k0 = 0.004, k1 = 0.13 + rand() * 0.05;
      const br = walk(base.x, base.y, base.h - side * off, len,
        (v) => dir * (k0 + k1 * Math.pow(v, 2.2)) / scale, ds);
      const brDots = inkify(br, 2.3, 0.7, 0.6, rand, scale);
      const t0 = u * stemDur;
      const dur = GROW_MS * 0.34;
      strokes.push({ pts: br, dots: brDots, t0, dur });

      // Small curl off the curl
      if (rand() < 0.8) {
        const v = 0.3 + rand() * 0.25;
        const b2 = br[Math.floor(v * (br.length - 1))];
        const s2 = -side;
        const sub = walk(b2.x, b2.y, b2.h + s2 * (0.5 + rand() * 0.4), (70 + rand() * 50) * scale,
          (w) => s2 * (0.01 + 0.2 * Math.pow(w, 2)) / scale, ds * 0.7);
        const subDots = inkify(sub, 1.5, 0.55, 0.6, rand, scale);
        strokes.push({ pts: sub, dots: subDots, t0: t0 + v * dur, dur: GROW_MS * 0.2 });
      }
      side = rand() < 0.7 ? lean : -lean;
    });

    // Bounding box (local coordinates) so off-screen flourishes are skipped
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    strokes.forEach((st) => st.pts.forEach((p) => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }));
    return { strokes, minX, maxX, minY, maxY, height: maxY };
  }

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#111111';
  }

  // Place flourishes down the whole page, alternating left and right
  function build() {
    const old = flourishes;
    const rand = rng(SEED);
    const docH = document.documentElement.scrollHeight;
    const scale = Math.min(1.15, Math.max(0.55, W / 1300)) * SIZE;
    flourishes = [];
    let y = 90;
    let n = 0;
    while (y < docH + 100) {
      const left = n % 2 === 0;
      const f = makeFlourish(rand, scale, left ? 1 : -1);
      f.x = left ? -4 : W + 4;                // rooted on the screen edge
      f.y = y;
      f.born = old[n] ? old[n].born : null;   // keep growth when the page is resized
      flourishes.push(f);
      y += f.height * 0.7 + SPACING * scale;
      n++;
    }
  }

  function draw(now) {
    const scrollY = window.scrollY;
    let growing = false;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const f of flourishes) {
      const top = f.y + f.minY - scrollY;
      const bottom = f.y + f.maxY - scrollY;
      if (f.born === null) {
        if (reduceMotion) f.born = -GROW_MS * 2;
        else if (f.y - scrollY < H * 0.92) f.born = now;   // start when it nears the bottom edge
        else continue;
      }
      const age = reduceMotion ? GROW_MS * 2 : now - f.born;
      if (age < GROW_MS * 1.05) growing = true;
      if (bottom < -20 || top > H + 20) continue;

      for (const st of f.strokes) {
        const p = easeInOut(clamp01((age - st.t0) / st.dur));
        const n = Math.floor(p * (st.pts.length - 1));
        if (n < 1) continue;
        const pts = st.pts;
        const ox = f.x, oy = f.y - scrollY;

        // Draw in runs of equal width, so there are fewer strokes to paint
        let cw = -1;
        for (let i = 0; i < n; i++) {
          const a = pts[i], b = pts[i + 1];
          const q = Math.round(a.w * 4);
          if (q !== cw) {
            if (cw !== -1) ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = q / 4;
            cw = q;
            ctx.moveTo(ox + a.x, oy + a.y);
          }
          ctx.lineTo(ox + b.x, oy + b.y);
        }
        if (cw !== -1) ctx.stroke();

        for (const d of st.dots) {
          if (d.i > n) break;
          ctx.beginPath();
          ctx.arc(ox + d.x, oy + d.y, d.r, 0, 6.2832);
          ctx.fill();
        }
      }
    }
    return growing;
  }

  function rebuild() {
    layout();
    build();
    if (reduceMotion) draw(0);
  }

  function start() {
    rebuild();
    let lastScroll = -1, growing = true;

    if (reduceMotion) {
      window.addEventListener('scroll', () => requestAnimationFrame(() => draw(0)), { passive: true });
    } else {
      const frame = (now) => {
        requestAnimationFrame(frame);
        const sc = window.scrollY;
        if (sc === lastScroll && !growing) return;   // nothing moving, nothing to redraw
        lastScroll = sc;
        growing = draw(now);
      };
      requestAnimationFrame(frame);
    }

    // Re-place flourishes if the window or the page height changes (photos loading, resizing)
    let timer;
    const again = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { rebuild(); growing = true; }, 150);
    };
    window.addEventListener('resize', again);
    if ('ResizeObserver' in window) new ResizeObserver(again).observe(document.body);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }
})();
