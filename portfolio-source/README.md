# 作品集资料档案

这个资料档案用于为未来的 AI 工作流提供素材和内容来源，以制作 DOMN 的作品集网页。

> 结构与命名的完整规范见上层 `architecture.md` §2。本文件是给归档者的简版操作说明。

## 目录结构

```
projects/
├── _project-template.md        # 模板（`_` 前缀 = 不进内容集合）
└── <type>/                     # 八大类型之一
    └── <slug>/                 # 小写连字符，全局唯一，即网页 URL
        ├── project.md          # 必需，含 frontmatter
        ├── 01-cover.webp
        ├── 02-process-concept.webp
        └── 07-final.mp4
```

`<type>` 八选一：`ai-video` / `tvc` / `character-design` / `worldbuilding` / `ai-images` / `visual-design` / `ai-tools` / `skills`。

**slug = 目录名**，不写在 frontmatter 里。

## 使用规则

- **`_` 前缀 = 不进内容集合**。模板、示例、草稿、未完成项目一律加前缀。这是防止虚构内容混进真实路由的唯一保险。
- 保持目录扁平。项目文件夹内只放文件，不要继续创建子文件夹。
- 使用清晰且带顺序的文件名，例如：`01-cover`、`02-process-concept`、`03-process-reference`、`04-process-prompt`、`05-process-generation`、`06-process-edit`、`07-final`。
- 每个项目文件夹保留一个 `project.md`，它是该项目的主要说明文件。
- 只保留经过筛选的过程证据，记录关键决策和有意义的迭代，不需要保存每一次失败生成。
- 可复用于多个项目的素材放入 `media/`，参考和研究资料放入 `references/`。
- 不要放入身份证件、住址、私人电话号码、密码或 API 密钥。

## 建议收集顺序

1. 填写 `profile/profile.md`。
2. 在 `projects/<type>/<slug>/` 下新建项目目录。
3. 复制 `_project-template.md` 为 `project.md`，先完成 frontmatter 字段，再写正文，最后添加媒体文件。
4. 添加精选过程素材，并在项目的 `project.md` 中列出每个素材文件。
5. 在 `writing/` 中补充作品集层面的文案和展示思路。