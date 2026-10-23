---
# ===== 结构化数据（Astro zod 校验，字段见 architecture.md §3.2）=====
title: "中文标题"
titleEn: "English Title"          # 英文代号，页面以 mono 小字呈现
type: ai-video                    # ai-video / tvc / character-design / ai-images / visual-design / ai-tools / skills
year: 2026
status: 完成                      # 完成 / 进行中 / 实验
featured: false                   # ⚠️ 只允许真实项目为 true；示例/草稿请给文件加 `_` 前缀
client: ""                        # 客户名；留空 = 个人作品
duration: 90                      # 秒，视频类必填
tools:                            # 工具链，页面以 mono 呈现
  - "Runway Gen-3 Alpha"
  - "DaVinci Resolve"
statement: ""                     # 一句话导演阐述，见 site-architecture.md §4.5 模板

# 镜头表 —— 驱动案例页第 4 段 + M3 交叉高亮。frame 填分镜板文件名。
shots:
  - id: 1
    size: 远                      # 远 / 全 / 中 / 近 / 特
    lens: 广角                    # 广角 / 标准 / 长焦
    move: 推                      # 推 / 拉 / 摇 / 移 / 跟 / 升降 / 固定 / 手持 / 甩
    content: "画面主体 + 环境"
    function: 交代环境            # 交代环境 / 建立角色 / 推进冲突 / 情绪峰值 / 收束
    duration: 8
    transition: 直切              # 直切 / 淡入淡出 / 匹配剪辑 / 转场特效 / 声音先行
    frame: "08-storyboard-01.webp"
  # - id: 2 ...

# 媒体清单 —— 命名规范见 architecture.md §2.2，proves 同时作为图片 alt
media:
  - file: "01-cover.webp"
    kind: cover                   # cover / process / final
    proves: "封面帧，展示主视觉"
    public: true
  # - file: "07-final.mp4"
  #   kind: final
  #   proves: "90 秒成片"
  #   public: true
---

# 中文标题

（以下为叙述性正文，不进 schema 校验，按 heading 自由书写。）

## 项目故事

- 项目背景或起点：
- 项目目标：
- 受众或使用场景：
- 最终成果：
- 我的具体贡献：

## 工具和方法

- 使用的模型和工具：
- 关键工作流程：
- 技术限制：

## 创作过程证据

按顺序描述经过筛选的创作过程。每一项对应项目目录中的一个平铺文件。

1. 概念或草图：`02-process-concept`
2. 参考方向：`03-process-reference`
3. 提示词或脚本迭代：`04-process-prompt`
4. 生成结果对比：`05-process-generation`
5. 人工修改或合成：`06-process-edit`
6. 最终交付：`07-final`

## 关键决策

- 决策 1 及原因：
- 决策 2 及原因：
- 遇到的问题及解决方式：

## 提示词、脚本或配置说明

只保留能够解释重要结果的提示词、脚本、参数或工作流片段。

- 提示词或脚本说明：
- 重要参数：
- 可复用技巧：

## 未来展示建议

- 推荐展示方式：timeline / before-after / gallery / storyboard / tool demo / problem-solution-result
- 建议展示顺序：
- 希望观众理解的重点：

## 链接和备注

- 相关公开链接：
- 相关项目：
- 补充备注：
