// DOMN-STUDIO · 舞台控制器（仅待机态 idle 全屏背景）
// 首页以 idle 视频作全屏背景（WebGL contain-fit，右锚留白给左侧文案）；
// 子页隐藏舞台（global.css: body:not(.is-home) .stage{display:none}），
// 各板块视频改为标题卡片（TitleCard 组件），故此处不再切换 section 视频。
//
// 暴露 window.__domnStage.setActive(0) 兼容旧调用（子页已无 section 视频可切换）。

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.getElementById('stage-canvas');
const fallbackWrap = document.querySelector('.stage-fallback');
const idleVideo = document.querySelector('.stage-fallback video[data-index="0"]');

let THREE = null;
let renderer, scene, camera, material, texture = null;
let ready = false;
// 跨软导航重跑时复用已有 WebGL 实例（#domn-stage 标了 transition:persist，canvas 不会重建）
const RT = (window.__domnRT = window.__domnRT || {});

/* ── three.js 模式 ── */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform vec2 uTexA_size;
  uniform vec2 uTexB_size;
  uniform vec2 uRes;
  uniform float uMix;
  uniform float uGlitch;

  // 电影黑边：以 contain 完整显示视频（不裁切），视频之外为纯黑（黑边在视频之外）。
  // 视频右锚（置右）：右缘贴画框右缘，左侧黑边留给文案。UV 恒在 [0,1] 内。
  vec2 containFit(vec2 uv, vec2 tex) {
    float rs = uRes.x / max(uRes.y, 1.0);
    float rt = max(tex.x, 1.0) / max(tex.y, 1.0);
    float sx = rs > rt ? rt / rs : 1.0; // 画框更宽：按高适配，视频占满高
    float sy = rs > rt ? 1.0 : rs / rt;  // 画框更窄：按宽适配，视频占满宽
    float ox = (1.0 - sx);              // 右锚：视频右缘贴画框右缘
    float oy = (1.0 - sy) * 0.5;        // 垂直居中
    return vec2((uv.x - ox) / sx, (uv.y - oy) / sy);
  }

  void main() {
    vec2 uvA = containFit(vUv, uTexA_size);
    vec2 uvB = containFit(vUv, uTexB_size);

    // 视频之外（黑边）输出纯黑
    float inA = step(0.0, uvA.x) * step(uvA.x, 1.0) * step(0.0, uvA.y) * step(uvA.y, 1.0);
    float inB = step(0.0, uvB.x) * step(uvB.x, 1.0) * step(0.0, uvB.y) * step(uvB.y, 1.0);

    float g = uGlitch * 0.006;
    vec3 a, b;
    a.r = texture2D(uTexA, uvA + vec2(g, 0.0)).r;
    a.g = texture2D(uTexA, uvA).g;
    a.b = texture2D(uTexA, uvA - vec2(g, 0.0)).b;
    b.r = texture2D(uTexB, uvB + vec2(g, 0.0)).r;
    b.g = texture2D(uTexB, uvB).g;
    b.b = texture2D(uTexB, uvB - vec2(g, 0.0)).b;

    a = mix(vec3(0.0), a, inA);
    b = mix(vec3(0.0), b, inB);
    vec3 col = mix(a, b, smoothstep(0.0, 1.0, uMix));
    gl_FragColor = vec4(col, 1.0);
  }
`;

function getSize(v) {
  const w = v.videoWidth || 16;
  const h = v.videoHeight || 9;
  return [w, h];
}

function makeTexture(THREE, v) {
  const t = new THREE.VideoTexture(v);
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

async function initThree() {
  // 已初始化过（软导航导致脚本重跑）：复用已有 WebGL 实例，避免在同一 canvas 上重复建上下文
  if (RT.ready) {
    renderer = RT.renderer; scene = RT.scene; camera = RT.camera;
    material = RT.material; texture = RT.texture; THREE = RT.THREE; ready = true;
    return true;
  }
  if (reduceMotion) return false;
  try {
    THREE = await import('three');
  } catch (e) {
    console.warn('[stage] three 加载失败，降级 DOM 模式', e);
    return false;
  }
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTexA: { value: null },
        uTexB: { value: null },
        uTexA_size: { value: new THREE.Vector2(16, 9) },
        uTexB_size: { value: new THREE.Vector2(16, 9) },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMix: { value: 0 },
        uGlitch: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    resize();
    window.addEventListener('resize', resize);
    ready = true;
    RT.renderer = renderer; RT.scene = scene; RT.camera = camera;
    RT.material = material; RT.texture = texture; RT.THREE = THREE; RT.ready = true;
    // 保留 fallback 视频在 DOM 中继续解码（供 VideoTexture 取帧），仅透明化置于画布之下
    if (fallbackWrap) {
      fallbackWrap.style.opacity = '0';
      fallbackWrap.style.pointerEvents = 'none';
    }
    return true;
  } catch (e) {
    console.warn('[stage] WebGL 初始化失败，降级 DOM 模式', e);
    ready = false;
    return false;
  }
}

function resize() {
  if (!renderer) return;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth;
  const h = canvas.clientHeight || canvas.parentElement.clientHeight;
  renderer.setSize(w, h, false);
  material.uniforms.uRes.value.set(w, h);
}

function ensurePlaying(v) {
  if (!v) return;
  const p = v.play();
  // 播放被策略拦截或数据未就绪时，等视频可播放再试一次（不再静默吞掉，避免背景永久不播）
  if (p && p.catch) {
    p.catch(() => {
      v.addEventListener('canplay', () => v.play().catch(() => {}), { once: true });
    });
  }
}

// 给 idle 上纹理并播放（WebGL 模式）
function primeIdle() {
  if (!texture) texture = makeTexture(THREE, idleVideo);
  const [w, h] = getSize(idleVideo);
  material.uniforms.uTexA.value = texture;
  material.uniforms.uTexB.value = texture;
  material.uniforms.uTexA_size.value.set(w, h);
  material.uniforms.uTexB_size.value.set(w, h);
  ensurePlaying(idleVideo);
}

let lastT = performance.now();
let rafId = null;
let lastRender = 0;
let frameInterval = 33;   // 当前视频实际帧间隔(ms)，测得后覆盖；默认 ~30fps
let measuring = null;     // rvfc 帧率采样句柄

// 测量 idle 视频的实际帧率：取首段若干帧间隔的中位均值，用于静止态节流渲染
function measureFrameRate() {
  const v = idleVideo;
  if (!v) return;
  if (measuring != null) { v.cancelVideoFrameCallback?.(measuring); measuring = null; }
  if (typeof v.requestVideoFrameCallback === 'function') {
    let prev = null;
    let samples = [];
    const collect = (now) => {
      if (prev == null) { prev = now; measuring = v.requestVideoFrameCallback(collect); return; }
      samples.push(now - prev);
      prev = now;
      if (samples.length >= 6) {
        const sorted = [...samples].sort((a, b) => a - b);
        const core = sorted.slice(1, -1); // 去抖：丢最大/最小
        const avg = core.reduce((a, b) => a + b, 0) / core.length;
        if (avg > 0) frameInterval = avg; // 实际帧间隔
        measuring = null;
        return;
      }
      measuring = v.requestVideoFrameCallback(collect);
    };
    measuring = v.requestVideoFrameCallback(collect);
  } else {
    frameInterval = 33; // 无 rvfc：退化为 30fps 节流（仍非 60fps 空转）
  }
}

// 渲染一帧（idle 单一纹理，无过渡）
function renderStage() {
  if (!texture) return;
  renderer.render(scene, camera);
  lastRender = performance.now();
}

// 统一渲染循环：严格按 idle 视频「实际帧率」节流渲染（frameInterval 由 measureFrameRate 测得），不空转。
function tick() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  if (now - lastRender >= frameInterval) {
    renderStage();
  }
  rafId = requestAnimationFrame(tick);
}

function ensureRenderLoop() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(tick);
}

/* ── 对外 API：仅 idle 有意义 ── */
function setActive(i) {
  if (i !== 0) return; // 子页已无 section 视频可切换
  if (ready) ensurePlaying(idleVideo);
  else idleVideo?.play?.().catch(() => {});
}
window.__domnStage = { setActive, isReady: () => ready };

/* 首页：启动/恢复 idle 渲染 */
async function startStage() {
  // 惰性初始化 three：仅在真正落到首页时才加载（子页零 three 负担）
  if (!ready) {
    const ok = await initThree();
    if (!ok) { ensurePlaying(idleVideo); return; }
  }
  if (!texture) primeIdle(); else ensurePlaying(idleVideo);
  ensureRenderLoop();
  measureFrameRate();
}

/* 子页：停掉舞台渲染并暂停 idle，避免后台空转解码 */
function stopStage() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  idleVideo?.pause?.();
}

// 标签页重新可见时恢复 idle 播放（浏览器后台会暂停解码）
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  const isHome = document.body.classList.contains('is-home');
  if (isHome) ensurePlaying(idleVideo);
});

// 视频元数据/数据就绪后再确保一次播放（应对 play() 早于 canplay 被浏览器忽略）
if (idleVideo) {
  idleVideo.addEventListener('loadeddata', () => {
    if (document.body.classList.contains('is-home')) ensurePlaying(idleVideo);
  });
}

/* ── 页面级：根据当前路由更新舞台（首页 idle / 子页隐藏） ── */
function onPageLoad() {
  const navItems = document.querySelectorAll('.nav-item');
  const locked = document.body.dataset.stageSection;
  if (locked) {
    navItems.forEach((n) => n.classList.toggle('is-active', n.dataset.key === locked));
    stopStage(); // 子页：隐藏舞台，停渲染
  } else {
    navItems.forEach((n) => n.classList.remove('is-active'));
    startStage(); // 首页：恢复 idle
  }
}

/* ── 板块进入：点击后画幅先「收束提亮」，再由 View Transition 接管换页 ── */
document.addEventListener('astro:before-preparation', (e) => {
  if (reduceMotion) return;
  // 仅当「离开首页」时才走收束提亮 + 340ms 延迟；子页互跳不加这道强制延迟
  if (!document.body.classList.contains('is-home')) return;
  const orig = e.loader;
  if (typeof orig !== 'function') return;
  e.loader = async () => {
    document.body.classList.add('is-entering');
    const loaded = orig();
    await new Promise((r) => setTimeout(r, 340));
    await loaded;
  };
});
function clearEntering() {
  document.body.classList.remove('is-entering');
}
document.addEventListener('astro:after-swap', clearEntering);
document.addEventListener('astro:page-load', clearEntering);

/* ── 启动 ── */
// 启动时不再强塞 three：onPageLoad 仅在真正落到首页时惰性初始化（子页零 three 负担）
onPageLoad();
if (!window.__domnPageLoadBound) {
  document.addEventListener('astro:page-load', onPageLoad);
  window.__domnPageLoadBound = true;
}
