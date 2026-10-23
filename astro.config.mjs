// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// 站点级配置。site 为部署占位域名，正式上线前替换（architecture.md §8 未决项）。
export default defineConfig({
  // 引入 React 集成：仅用于首页底部 LogoLoop 岛（HomeLogoLoop）。
  integrations: [react()],
  site: 'https://domn-portfolio.vercel.app',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  // 开启预取：链接进入视口即预拉取下一页 HTML，软导航近乎瞬时。
  // 原 false 是"点下去才卡一下"的主因之一。
  prefetch: { defaultStrategy: 'viewport' },
  // 固定绑 IPv4 回环。Node 22 下 `localhost` 解析成 ::1，dev server 会只监听 [::1]，
  // 而内置预览 / 调试脚本走 127.0.0.1 → 502 `upstream connect failed (os error 10061)`。
  // 写死 127.0.0.1 后无需再传 `--host`。
  server: { host: '127.0.0.1' },
  // 文件监听器忽略项：项目根下的 tmp / cdp profile / 备份 / 产物 等目录。
  // tmp/ 是浏览器自动化(CDP)的临时 profile 目录，其中的 Cookies 等文件常被锁定，
  // Vite 递归 watch 整棵目录树会命中 EBUSY 导致 dev server 直接崩溃。
  vite: {
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.astro/**',
          '**/dist/**',
          '**/tmp/**',
          '**/_cdp-profile/**',
          '**/_backups/**',
          '**/output/**',
        ],
      },
    },
  },
});
