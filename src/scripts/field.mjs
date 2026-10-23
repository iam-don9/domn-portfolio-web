// DOMN-STUDIO · 全站生成式氛围层（静水单光晕）
// 轻量原生 WebGL 片元着色器：暗底上一团缓慢漂移 + 呼吸的品牌绿柔光，余下大面积留黑。
// 极克制，让文字与绿脊线成为唯一主角。无 THREE 依赖，不与 stage.mjs 的 video 上下文冲突。
// 仅在首页（body.is-home）运行；子页由 global.css 的 body:not(.is-home) .field{display:none} 隐藏。

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 仅首页运行：子页的 .field 由 global.css 隐藏，且各板块有独立 TitleCard 视频
if (document.body.classList.contains('is-home')) {
  const canvas = document.getElementById('field-canvas');
  if (canvas) initField(canvas);
}

function initField(canvas) {
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
      || canvas.getContext('experimental-webgl');
  } catch (e) { gl = null; }
  if (!gl) return; // 无 WebGL：留纯黑，零降级成本

  const VERT = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uRes;
    uniform float uTime;

    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
      return v;
    }

    void main(){
      vec2 uv = vUv;
      vec2 p = uv - 0.5;
      p.x *= uRes.x / max(uRes.y, 1.0);
      float t = uTime * 0.06;

      // 单团柔光：缓慢漂移 + 呼吸，余下大面积留黑（静水单光晕）
      vec2 c = vec2(sin(t * 0.55) * 0.20, cos(t * 0.40) * 0.13);
      float d = length(p - c);
      float glow = exp(-d * d * 2.6);
      glow *= 0.62 + 0.38 * sin(t * 0.8);

      vec3 green = vec3(0.0, 0.46, 0.39);          // 品牌青绿（暗调）
      vec3 col = green * glow * 0.085;              // 极克制：仅一缕呼吸的绿
      col += vec3(0.018, 0.024, 0.022);             // 近黑暖绿底，避免死黑

      // 暗角保可读，绿雾集中中部
      float vig = smoothstep(1.15, 0.18, length(uv - 0.5));
      col *= mix(0.5, 1.0, vig);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[field] shader 编译失败', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('[field] link 失败'); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  const start = performance.now();
  let rafId = null;

  function frame() {
    gl.uniform1f(uTime, (performance.now() - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    rafId = requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    // 静态单帧
    gl.uniform1f(uTime, 2.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  } else {
    frame();
  }

  // 离开首页：停渲染省电
  document.addEventListener('astro:page-load', () => {
    const isHome = document.body.classList.contains('is-home');
    if (isHome && rafId === null && !reduceMotion) frame();
    if (!isHome && rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  });
}
