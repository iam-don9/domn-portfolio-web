# -*- coding: utf-8 -*-
# 技能 deck 数据 · 手写部分（视觉类，图文 deck）
# 每个 skill 4 页：成果(图墙) / 是什么·解决什么 / 核心结构(真实文件树) / 工作流
# body 为 slide-content 内的 HTML 片段（不含 chrome/foot，由生成器包裹）。
# 文字类 10 个 deck 由 text-decks-extract.json 经 gen-skill-deck.py 自动转换。

SKILLS = [
    {
        "en": "domn-character-poster",
        "brand": "domn-character-poster · 原创角色海报 / 设定图",
        "slides": [
            {
                "kicker": "先看成果",
                "title": "从一张参考图，到一套角色视觉",
                "page": "Output / 01 / 04",
                "footL": "进化论：牧狼人 · 雪兔 / 猫鹰对决",
                "footR": "参考图 → keyvisual → sheet",
                "body": """<div class="pwall reveal">
      <figure class="fig"><img src="/media/character-poster/xuetu-keyvisual.webp" alt="雪兔主视觉海报" /><figcaption>雪兔 · 主视觉海报 keyvisual</figcaption></figure>
      <figure class="fig"><img src="/media/character-poster/xuetu-sheet.webp" alt="雪兔角色设定图" /><figcaption>雪兔 · 角色设定图 sheet</figcaption></figure>
      <figure class="fig"><img src="/media/character-poster/maoying-keyvisual.webp" alt="猫鹰对决主视觉海报" /><figcaption>猫鹰对决 · 主视觉海报 keyvisual</figcaption></figure>
    </div>""",
            },
            {
                "kicker": "它是什么 · 它解决什么",
                "title": "原创角色海报 / 设定图",
                "page": "About / 02 / 04",
                "footL": "不接：纯文生图、无参考图的凭空捏造",
                "footR": "超出范围",
                "body": """<p class="vmeta reveal">视觉图像 · 参考图驱动</p>
    <p class="lead reveal">输入角色参考图，按指定方向出 keyvisual 主视觉海报或人物设定图（sheet）。角色长相由参考图锚点卡锁死，演出与版式分别由演出库、画风库决定，三方互不越界。画面文字全英文。</p>
    <div class="split reveal">
      <ul class="plist">
        <li>同一角色不同海报「脸不一样」，越出越多越乱</li>
        <li>海报版式与角色演出混在一起，改一处坏全局</li>
        <li>没有可复用的方向库，每次都从零找感觉</li>
      </ul>
      <div class="pcard">
        <p class="lab">解法</p>
        <p>锚点卡把长相锁死 → 演出库管「怎么演」→ 画风库管「什么调」→ 三方分离、互不越界。先查库命中即套用，未命中按方法现生成，效率与一致性兼得。</p>
      </div>
    </div>""",
            },
            {
                "kicker": "核心结构",
                "title": "一个执行说明，加一整套可查库",
                "page": "Structure / 03 / 04",
                "footL": "没有写死的套图，只有可生长的库",
                "footR": "逻辑全在 SKILL.md + references",
                "body": """<div class="struct reveal">
      <pre class="tree">domn-character-poster/
<span class="fname">SKILL.md</span>  <span class="cmt">· 执行说明书</span>
<span class="fname">config.md</span>  <span class="cmt">· 配置</span>
<span class="dir">references/</span>
  <span class="fname">anchor-card.md</span>  <span class="cmt">· 角色锚点卡（锁脸）</span>
  <span class="fname">skeleton-keyvisual.md</span>  <span class="cmt">· 主视觉版式骨架</span>
  <span class="fname">skeleton-sheet.md</span>  <span class="cmt">· 设定图版式骨架</span>
  <span class="fname">staging-atom.md / staging-library.md</span>  <span class="cmt">· 演出原子库</span>
  <span class="fname">style-atom.md / style-library.md</span>  <span class="cmt">· 画风原子库</span>
  <span class="fname">typography.md</span>  <span class="cmt">· 字体与排版</span></pre>
      <div class="filerow">
        <div class="fcard">
          <p class="fl">SKILL.md</p>
          <p>主执行说明：入参闸门、锚点卡写法、演出／画风库调用规则、keyvisual 与 sheet 两套骨架、双闸门审批与交付格式。Agent 干活时读的就是它。</p>
          <p class="meta-tags">config.md 管配置；references/ 是可查可复用的「库」。</p>
        </div>
        <div class="fcard">
          <p class="fl">references/ · 一整套可查库</p>
          <p>锚点卡把长相锁死；两套骨架定 keyvisual / sheet 版式；演出库管动作构图，画风库管影调材质；字体排版管画面文字。查库命中即套用，未命中按方法现生成。</p>
          <p class="meta-tags">库越用越厚，下次同类型角色直接复用。</p>
        </div>
      </div>
    </div>""",
            },
            {
                "kicker": "工作流",
                "title": "八步出一张对的角色海报",
                "page": "Workflow / 04 / 04",
                "footL": "先锁脸，再谈演出与版式",
                "footR": "只往前，不回头",
                "body": """<div class="fgrid reveal">
      <div class="fcell"><span class="fn">01</span><p>入参闸门：收参考图与方向</p></div>
      <div class="fcell"><span class="fn">02</span><p>锚点卡锁脸</p></div>
      <div class="fcell"><span class="fn">03</span><p>画风库定调</p></div>
      <div class="fcell"><span class="fn">04</span><p>版式骨架（keyvisual / sheet）</p></div>
      <div class="fcell"><span class="fn">05</span><p>演出原子（动作构图）</p></div>
      <div class="fcell"><span class="fn">06</span><p>字体与排版</p></div>
      <div class="fcell"><span class="fn">07</span><p>双闸门审批：生成前定方案／批量后定稿</p></div>
      <div class="fcell"><span class="fn">08</span><p>产出母版入库</p></div>
    </div>""",
            },
        ],
    },
    {
        "en": "domn-image-ipsticker-generator",
        "brand": "domn-image-ipsticker-generator · IP 贴纸素材库",
        "slides": [
            {
                "kicker": "先看成果",
                "title": "一个 IP，一整排能直接发的表情贴纸",
                "page": "Output / 01 / 04",
                "footL": "水母头男孩 · 通用情绪 avatar",
                "footR": "主形象 → 情绪变体 → 单张贴纸",
                "body": """<div class="swall reveal">
      <figure class="fig"><img src="/media/ip-sticker/kaixin.webp" alt="开心大笑贴纸" /><figcaption>开心大笑</figcaption></figure>
      <figure class="fig"><img src="/media/ip-sticker/shuijiao.webp" alt="睡觉贴纸" /><figcaption>睡觉</figcaption></figure>
      <figure class="fig"><img src="/media/ip-sticker/sikao.webp" alt="思考贴纸" /><figcaption>思考</figcaption></figure>
      <figure class="fig"><img src="/media/ip-sticker/kuqi.webp" alt="哭泣贴纸" /><figcaption>哭泣</figcaption></figure>
      <figure class="fig"><img src="/media/ip-sticker/fennu.webp" alt="愤怒贴纸" /><figcaption>愤怒</figcaption></figure>
      <figure class="fig"><img src="/media/ip-sticker/zhayan.webp" alt="眨眼俏皮贴纸" /><figcaption>眨眼俏皮</figcaption></figure>
      <figure class="fig"><img src="/media/ip-sticker/jiayou.webp" alt="加油贴纸" /><figcaption>加油</figcaption></figure>
      <figure class="fig"><img src="/media/ip-sticker/shengqi.webp" alt="生气贴纸" /><figcaption>生气</figcaption></figure>
    </div>""",
            },
            {
                "kicker": "它是什么 · 它解决什么",
                "title": "IP 贴纸素材库",
                "page": "About / 02 / 04",
                "footL": "从已锁定的形象长出贴纸，不另起炉灶",
                "footR": "超出范围",
                "body": """<p class="vmeta reveal">视觉图像 · 形象衍生</p>
    <p class="lead reveal">锁定已确定的 IP 主形象，按情绪清单生成一整套方形透明贴纸：同一张脸、同一套画风，一张表出齐，再用配套脚本把大表切成单张，直接进聊天软件当表情用。</p>
    <div class="split reveal">
      <ul class="plist">
        <li>一张张生成，贴纸之间风格漂移，凑不成套</li>
        <li>背景不透明，发出去像截图，没法当表情</li>
        <li>情绪覆盖靠临时起意，常用的表情总是缺</li>
      </ul>
      <div class="pcard">
        <p class="lab">解法</p>
        <p>先锁形象 → 按情绪清单一次成表 → 透明底检查 → 脚本切片成单张 → 命名归档。成套、透明、可直接用。</p>
      </div>
    </div>""",
            },
            {
                "kicker": "核心结构",
                "title": "三个文件，一条流水线",
                "page": "Structure / 03 / 04",
                "footL": "没有第三方依赖",
                "footR": "逻辑全在文档 + 一个切片脚本",
                "body": """<div class="struct reveal">
      <pre class="tree">domn-image-ipsticker-generator/
<span class="fname">meta.yaml</span>  <span class="cmt">· 身份卡：名称、版本、分类、摘要</span>
<span class="fname">SKILL.md / SKILL.cn.md</span>  <span class="cmt">· 执行说明书（中英双语）</span>
<span class="dir">scripts/</span>
  <span class="fname">split_3x3.py</span>  <span class="cmt">· 把 3×3 大表切成单张贴纸</span></pre>
      <div class="filerow">
        <div class="fcard">
          <p class="fl">SKILL.md / SKILL.cn.md</p>
          <p>执行说明书：形象锁定规则、情绪清单确认、成表提示词结构、透明底检查与切片交付。中文版给中文场景直接用。</p>
          <p class="meta-tags">meta.yaml 只管身份信息，不参与执行。</p>
        </div>
        <div class="fcard">
          <p class="fl">scripts/split_3x3.py</p>
          <p>唯一的脚本：把生成好的 3×3 大表按九宫格切开，输出单张贴纸并按情绪命名。切完即可逐张导入微信 / QQ 当表情。</p>
          <p class="meta-tags">零依赖，标准库就能跑。</p>
        </div>
      </div>
    </div>""",
            },
            {
                "kicker": "工作流",
                "title": "六步出一套能发的贴纸",
                "page": "Workflow / 04 / 04",
                "footL": "先锁形象，再铺情绪",
                "footR": "只往前，不回头",
                "body": """<div class="fgrid reveal">
      <div class="fcell"><span class="fn">01</span><p>形象确认：取已锁定主形象</p></div>
      <div class="fcell"><span class="fn">02</span><p>情绪清单确认</p></div>
      <div class="fcell"><span class="fn">03</span><p>3×3 成表生成</p></div>
      <div class="fcell"><span class="fn">04</span><p>透明底与一致性检查</p></div>
      <div class="fcell"><span class="fn">05</span><p>split_3x3.py 切片</p></div>
      <div class="fcell"><span class="fn">06</span><p>命名归档交付</p></div>
    </div>""",
            },
        ],
    },
    {
        "en": "domn-cover",
        "brand": "domn-cover · 真人出镜封面",
        "slides": [
            {
                "kicker": "先看成果",
                "title": "同一个选题，一轮出一批可挑的封面",
                "page": "Output / 01 / 04",
                "footL": "「AI 短片 3 步搞定」· 三轮影调测试",
                "footR": "主持人锚点 → 影调方向 → 成图",
                "body": """<div class="pwall reveal">
      <figure class="fig"><img src="/media/cover/theater.webp" alt="剧场纵深封面" /><figcaption>剧场纵深 · 暖金影调</figcaption></figure>
      <figure class="fig"><img src="/media/cover/tension.webp" alt="胶片张力封面" /><figcaption>胶片张力 · 青绿影调</figcaption></figure>
      <figure class="fig"><img src="/media/cover/flare.webp" alt="黑白漫格封面" /><figcaption>黑白漫格 · AIGC 质感</figcaption></figure>
    </div>""",
            },
            {
                "kicker": "它是什么 · 它解决什么",
                "title": "真人出镜自媒体封面",
                "page": "About / 02 / 04",
                "footL": "不接：无真人参考图的虚构人像封面",
                "footR": "超出范围",
                "body": """<p class="vmeta reveal">视觉图像 · 主持人锚点驱动</p>
    <p class="lead reveal">主持人照片做锚点卡锁脸，出「真人 + 视觉创意」的小红书封面：每轮先定影调方向再批量出图，同一张脸在所有封面里都是同一个人，文字排版不压脸。</p>
    <div class="split reveal">
      <ul class="plist">
        <li>真人封面「脸不一致」，每张都像换了个人</li>
        <li>标题文字压脸、压主体，排版全凭手感</li>
        <li>一次只出一张，没法挑，改一轮废一轮</li>
      </ul>
      <div class="pcard">
        <p class="lab">解法</p>
        <p>锚点卡锁脸 → 演出库管构图动作 → 画风库管影调 → 骨架定文字区 → 一轮一批，挑着用。</p>
      </div>
    </div>""",
            },
            {
                "kicker": "核心结构",
                "title": "一个说明书，加一整套可查库",
                "page": "Structure / 03 / 04",
                "footL": "演出包可继续扩充",
                "footR": "逻辑全在 SKILL.md + references",
                "body": """<div class="struct reveal">
      <pre class="tree">domn-cover/
<span class="fname">SKILL.md</span>  <span class="cmt">· 执行说明书</span>
<span class="fname">anchor-card.md / config.md</span>  <span class="cmt">· 锚点卡示例与配置</span>
<span class="fname">assets/host.jpg</span>  <span class="cmt">· 主持人参考图</span>
<span class="dir">staging/</span>
  <span class="fname">high-energy-motion/</span>  <span class="cmt">· 演出包（META + STAGE）</span>
<span class="dir">references/</span>
  <span class="fname">anchor-card / examples / gate-and-input / rules</span>
  <span class="fname">skeleton / staging-atom / staging-library</span>
  <span class="fname">style-atom / style-library</span></pre>
      <div class="filerow">
        <div class="fcard">
          <p class="fl">SKILL.md</p>
          <p>主执行说明：入参闸门收主持人照片与选题，锚点卡锁脸，调用演出库与画风库，按骨架排文字，一轮批量出图后挑片复盘。</p>
          <p class="meta-tags">assets/host.jpg 是锚点卡的输入示例。</p>
        </div>
        <div class="fcard">
          <p class="fl">staging/ + references/</p>
          <p>staging/ 是可插拔的演出包（每包 META + STAGE 两个文件），high-energy-motion 是第一个；references/ 放锚点卡、样例、闸门规则、两套原子库等九份资料，命中即用。</p>
          <p class="meta-tags">演出包按需新增，库随项目长。</p>
        </div>
      </div>
    </div>""",
            },
            {
                "kicker": "工作流",
                "title": "八步出一轮可用封面",
                "page": "Workflow / 04 / 04",
                "footL": "先锁脸，再谈影调与排版",
                "footR": "只往前，不回头",
                "body": """<div class="fgrid reveal">
      <div class="fcell"><span class="fn">01</span><p>入参闸门：收照片与选题</p></div>
      <div class="fcell"><span class="fn">02</span><p>锚点卡锁脸</p></div>
      <div class="fcell"><span class="fn">03</span><p>影调方向（画风库）</p></div>
      <div class="fcell"><span class="fn">04</span><p>版式骨架定文字区</p></div>
      <div class="fcell"><span class="fn">05</span><p>演出原子（动作构图）</p></div>
      <div class="fcell"><span class="fn">06</span><p>标题文字压图排版</p></div>
      <div class="fcell"><span class="fn">07</span><p>一轮批量成图</p></div>
      <div class="fcell"><span class="fn">08</span><p>挑片复盘入库</p></div>
    </div>""",
            },
        ],
    },
]
