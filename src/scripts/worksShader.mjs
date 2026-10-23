// DOMN · 代表作品封面着色器（three.js）
// 每卡一个 WebGL 上下文：封面纹理 + 色散(RGB split) + 颗粒 + UV 波动；hover 增强。
// 3D 纵深由 CSS perspective 倾斜承担（见 SelectedWorks 的 .sw-tilt 鼠标跟随）。
// 仅在卡片进入视口时渲染、离开暂停；无 WebGL / reduced-motion 降级保留 <img>。
// 复用 stage.mjs 的惰性 import('three') 模式。

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const VERT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;
  void main() {
    vUv = uv;
    vec3 p = position;
    // 轻微波动制造“呼吸”，hover 时加强 —— 正交相机下表现为边缘位移而非深度
    float w = sin(uv.x * 9.0 + uTime * 0.5) * cos(uv.y * 7.0 - uTime * 0.35);
    p.xy += w * 0.012 * (0.4 + uHover * 0.9);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uTexSize;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uTint;

  // cover-fit：填满画布、裁掉溢出，保持封面比例
  vec2 coverUv(vec2 uv) {
    float rs = uRes.x / max(uRes.y, 1.0);
    float rt = uTexSize.x / max(uTexSize.y, 1.0);
    vec2 o = uv - 0.5;
    if (rs > rt) o.y *= rt / rs; else o.x *= rs / rt;
    return o + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    float ca = 0.0035 + uHover * 0.016;          // 色散强度：hover 拉大
    vec2 dir = vUv - 0.5;
    float r = texture2D(uTex, uv + dir * ca).r;
    float g = texture2D(uTex, uv).g;
    float b = texture2D(uTex, uv - dir * ca).b;
    vec3 col = vec3(r, g, b);

    // 胶片颗粒
    float grain = fract(sin(dot(vUv * (uTime + 1.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    col += grain * (0.05 + uHover * 0.07);

    // 暗角 + hover 轻微品牌绿染色
    float vig = smoothstep(1.15, 0.25, length(dir));
    col *= mix(0.82, 1.04, vig);
    col = mix(col, col * uTint, uHover * 0.22);

    gl_FragColor = vec4(col, 1.0);
  }
`;

async function makeCover(canvas, src, tintHex) {
  let THREE;
  try {
    THREE = await import('three');
  } catch (e) {
    console.warn('[worksShader] three 加载失败，保留 DOM 封面', e);
    return null;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    console.warn('[worksShader] WebGL 初始化失败，保留 DOM 封面', e);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const tex = new THREE.TextureLoader().load(src, (t) => {
    material.uniforms.uTexSize.value.set(t.image.width, t.image.height);
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const tint = new THREE.Color(tintHex || '#00b894');
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTex: { value: tex },
      uTexSize: { value: new THREE.Vector2(16, 9) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uTint: { value: new THREE.Vector3(tint.r, tint.g, tint.b) },
    },
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const state = { visible: false, hovering: false, target: 0, raf: null };

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    material.uniforms.uRes.value.set(w, h);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  function loop(now) {
    if (!state.visible) {
      state.raf = null;
      return;
    }
    state.target += ((state.hovering ? 1 : 0) - state.target) * 0.08;
    material.uniforms.uTime.value = now * 0.001;
    material.uniforms.uHover.value = state.target;
    renderer.render(scene, camera);
    state.raf = requestAnimationFrame(loop);
  }

  return {
    start() {
      if (state.visible) return;
      state.visible = true;
      if (!state.raf) state.raf = requestAnimationFrame(loop);
    },
    stop() {
      state.visible = false;
    },
    setHover(v) {
      state.hovering = v;
    },
  };
}

// ── 鼠标 3D 倾斜（CSS perspective，承担“3D 纵深”观感）──
function bindTilt(card) {
  const tilt = card.querySelector('.sw-tilt');
  if (!tilt) return;
  const MAX = 7;
  let raf = null;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  function onMove(e) {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tx = -py * MAX;
    ty = px * MAX;
    if (!raf) raf = requestAnimationFrame(apply);
  }
  function apply() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    tilt.style.transform = `rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
    if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) {
      raf = requestAnimationFrame(apply);
    } else {
      raf = null;
    }
  }
  function reset() {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(apply);
  }
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', reset);
}

async function boot() {
  if (reduceMotion) {
    document.querySelectorAll('canvas[data-shader-cover]').forEach((c) => (c.style.display = 'none'));
    return;
  }
  const canvases = [...document.querySelectorAll('canvas[data-shader-cover]')];
  for (const cv of canvases) {
    const inst = await makeCover(cv, cv.dataset.src, cv.dataset.tint);
    if (!inst) {
      cv.style.display = 'none'; // 失败：露出底层 <img>
      continue;
    }
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => (e.isIntersecting ? inst.start() : inst.stop())),
      { threshold: 0.05 }
    );
    io.observe(cv);

    const card = cv.closest('.sw-card');
    if (card) {
      card.addEventListener('pointerenter', () => inst.setHover(true));
      card.addEventListener('pointerleave', () => inst.setHover(false));
      bindTilt(card);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// 软导航回到首页时重跑（S3 仅在首页）
document.addEventListener('astro:page-load', () => {
  if (document.body.classList.contains('is-home')) boot();
});
