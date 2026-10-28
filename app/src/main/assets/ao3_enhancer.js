(function() {
  if (window.__ao3EnhancerLoaded) return;
  window.__ao3EnhancerLoaded = true;

  const DEFAULT_CONFIG = {
    fontSize: 17,
    fontFamily: "system",
    hue: 265,
    sat: 28,
    light: 88,
    presetIndex: 0,
    bgImage: "",
    bgOpacity: 75,
    readingMode: "scroll", // "scroll" or "page"
    zhTranslate: true,
    mirrorHost: "https://archiveofourown.org"
  };

  let config = Object.assign({}, DEFAULT_CONFIG);
  try {
    const saved = localStorage.getItem("__ao3_custom_reader_cfg_v1");
    if (saved) config = Object.assign({}, DEFAULT_CONFIG, JSON.parse(saved));
  } catch (e) {}

  // Load large background image separately from localStorage if present
  try {
    const savedBg = localStorage.getItem("__ao3_custom_reader_bg_v1");
    if (savedBg) config.bgImage = savedBg;
  } catch (e) {}

  function saveConfig() {
    try {
      const copy = Object.assign({}, config, { bgImage: "" });
      localStorage.setItem("__ao3_custom_reader_cfg_v1", JSON.stringify(copy));
      if (config.bgImage) {
        localStorage.setItem("__ao3_custom_reader_bg_v1", config.bgImage);
      } else {
        localStorage.removeItem("__ao3_custom_reader_bg_v1");
      }
    } catch (e) {}
  }

  const PRESETS = [
    { name: "雾紫", h: 265, s: 28, l: 88 },
    { name: "丁香", h: 258, s: 42, l: 82 },
    { name: "烟粉", h: 315, s: 26, l: 86 },
    { name: "暮山紫", h: 260, s: 22, l: 74 },
    { name: "云灰", h: 220, s: 14, l: 91 },
    { name: "羊皮纸", h: 42, s: 38, l: 93 },
    { name: "夜间墨黑", h: 240, s: 12, l: 15 }
  ];

  const ZH_DICT = {
    "Fandoms": "同人圈",
    "Browse": "浏览",
    "Search": "搜索",
    "About": "关于",
    "Log In": "登录",
    "Log Out": "退出",
    "Hi,": "你好，",
    "My Dashboard": "个人主页",
    "Bookmarks": "书签收藏",
    "History": "阅读历史",
    "Subscriptions": "我的订阅",
    "Works": "作品",
    "Drafts": "草稿",
    "Preferences": "偏好设置",
    "Skins": "网站皮肤",
    "Entire Work": "全文阅读",
    "Chapter by Chapter": "分章阅读",
    "Chapter Index": "章节目录",
    "Next Chapter →": "下一章 →",
    "← Previous Chapter": "← 上一章",
    "Kudos ♥": "点赞 ♥",
    "Kudos": "点赞",
    "Bookmark": "收藏",
    "Subscribe": "订阅",
    "Download": "下载",
    "Comments": "评论",
    "Share": "分享",
    "Rating:": "分级：",
    "Archive Warning:": "归档警告：",
    "Archive Warnings:": "归档警告：",
    "Category:": "性向分类：",
    "Categories:": "性向分类：",
    "Fandom:": "原作圈：",
    "Fandoms:": "原作圈：",
    "Relationship:": "配对/CP：",
    "Relationships:": "配对/CP：",
    "Character:": "角色：",
    "Characters:": "角色：",
    "Additional Tags:": "附加标签：",
    "Language:": "语言：",
    "Stats:": "统计：",
    "Published:": "发布：",
    "Updated:": "更新：",
    "Completed:": "完结：",
    "Words:": "字数：",
    "Chapters:": "章节：",
    "Hits:": "点击：",
    "Sort and Filter": "排序与筛选",
    "Include": "包含标签",
    "Exclude": "排除标签",
    "More Options": "更多选项",
    "Work Search": "作品搜索",
    "People Search": "作者搜索",
    "Bookmark Search": "书签搜索",
    "Tag Search": "标签搜索",
    "Top": "返回顶部"
  };

  function getFontStack(key) {
    if (key === "song") return "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'SimSun', serif";
    if (key === "kai") return "'LXGW WenKai', 'Kaiti SC', 'STKaiti', 'KaiTi', serif";
    if (key === "hei") return "'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei', sans-serif";
    return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', sans-serif";
  }

  function injectStyles() {
    let styleEl = document.getElementById("__ao3_custom_style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "__ao3_custom_style";
      (document.head || document.documentElement).appendChild(styleEl);
    }

    const isDark = config.light < 35;
    const textColor = isDark ? "#eae6f2" : "#2d2838";
    const subTextColor = isDark ? "#a8a0b8" : "#6e667e";
    const accentColor = `hsl(${config.hue}, ${Math.min(config.sat + 25, 75)}%, ${isDark ? 68 : 46}%)`;
    const pageBgHsl = `hsl(${config.hue}, ${config.sat}%, ${config.light}%)`;
    const cardAlpha = Math.max(0.15, Math.min(1, config.bgOpacity / 100));
    const cardBg = isDark
      ? `rgba(34, 32, 42, ${cardAlpha})`
      : `rgba(255, 255, 255, ${cardAlpha})`;
    const fontStack = getFontStack(config.fontFamily);

    styleEl.textContent = `
      :root {
        --ao3-bg: ${pageBgHsl};
        --ao3-card-bg: ${cardBg};
        --ao3-text: ${textColor};
        --ao3-subtext: ${subTextColor};
        --ao3-accent: ${accentColor};
        --ao3-font: ${fontStack};
        --ao3-font-size: ${config.fontSize}px;
      }

      /* Remove AO3 Classic Red and replace with custom theme */
      body, #outer, #inner, #main {
        background: transparent !important;
        color: var(--ao3-text) !important;
        font-family: var(--ao3-font) !important;
      }

      #__ao3_bg_layer {
        position: fixed;
        inset: 0;
        z-index: -2;
        background-color: var(--ao3-bg);
        background-image: ${config.bgImage ? `url("${config.bgImage}")` : "none"};
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }

      #__ao3_bg_overlay {
        position: fixed;
        inset: 0;
        z-index: -1;
        background-color: var(--ao3-bg);
        opacity: ${config.bgImage ? (100 - config.bgOpacity) / 100 : 1};
        pointer-events: none;
      }

      #header, #header .primary, #footer {
        background: var(--ao3-card-bg) !important;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid rgba(150, 140, 175, 0.2) !important;
        box-shadow: none !important;
      }

      #header h1.heading a, #header a, a, a:link, a:visited {
        color: var(--ao3-text) !important;
        text-decoration: none !important;
      }

      /* Card-style Search & Work Blurbs */
      ol.work.index.group, ul.index.group {
        padding: 8px 12px !important;
      }

      li.work.blurb.group, li.bookmark.blurb.group {
        background: var(--ao3-card-bg) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 18px !important;
        border: 1px solid rgba(160, 150, 185, 0.25) !important;
        padding: 16px !important;
        margin: 14px 0 !important;
        box-shadow: 0 6px 20px rgba(45, 35, 70, 0.06) !important;
      }

      li.work.blurb.group .header h4.heading a:first-child {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--ao3-accent) !important;
      }

      /* Collapsible Tags & Summary inside Search Cards */
      li.work.blurb.group:not(.__ao3_expanded) ul.tags.commas {
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
        max-height: 3.4em !important;
      }

      li.work.blurb.group:not(.__ao3_expanded) blockquote.userstuff.summary {
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
        max-height: 3.4em !important;
        margin-top: 8px !important;
      }

      .__ao3_card_toggle {
        margin-top: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(140, 125, 175, 0.14);
        color: var(--ao3-accent);
        font-size: 12px;
        font-weight: 600;
        text-align: center;
        cursor: pointer;
        user-select: none;
      }

      /* Reading Body Styling */
      #chapters, div.userstuff {
        font-family: var(--ao3-font) !important;
        font-size: var(--ao3-font-size) !important;
        line-height: 1.85 !important;
        color: var(--ao3-text) !important;
      }

      #workskin {
        background: var(--ao3-card-bg) !important;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 20px !important;
        padding: 18px 16px !important;
        margin: 10px 8px !important;
      }

      /* Instant Page Flip Mode (Zero Animation!) */
      body.__ao3_page_mode {
        overflow: hidden !important;
        height: 100vh !important;
      }
      body.__ao3_page_mode * {
        transition: none !important;
        animation: none !important;
        scroll-behavior: auto !important;
      }
    `;
  }

  function ensureBgLayers() {
    if (!document.getElementById("__ao3_bg_layer")) {
      const bg = document.createElement("div");
      bg.id = "__ao3_bg_layer";
      const ov = document.createElement("div");
      ov.id = "__ao3_bg_overlay";
      document.body.prepend(ov);
      document.body.prepend(bg);
    }
  }

  function enhanceBlurbCards() {
    const blurbs = document.querySelectorAll("li.work.blurb.group, li.bookmark.blurb.group");
    blurbs.forEach(card => {
      if (card.querySelector(".__ao3_card_toggle")) return;
      const toggle = document.createElement("div");
      toggle.className = "__ao3_card_toggle";
      toggle.textContent = "点击展开全部标签与简介 ▾";
      toggle.addEventListener("click", function(e) {
        e.stopPropagation();
        const expanded = card.classList.toggle("__ao3_expanded");
        toggle.textContent = expanded ? "点击收起部分内容 ▴" : "点击展开全部标签与简介 ▾";
      });
      card.appendChild(toggle);
    });
  }

  function translateDOM() {
    if (!config.zhTranslate) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue.trim();
      if (ZH_DICT[raw]) {
        node.nodeValue = node.nodeValue.replace(raw, ZH_DICT[raw]);
      }
    }
  }

  // Instant No-Animation Page Turn Controller
  window.__ao3TurnPage = function(dir) {
    const step = Math.floor(window.innerHeight * 0.88);
    window.scrollTo({
      top: window.scrollY + (dir === "next" ? step : -step),
      behavior: "instant"
    });
  };

  window.__ao3VolumeKey = function(dir) {
    window.__ao3TurnPage(dir);
  };

  function setupPageFlipOverlay() {
    let overlay = document.getElementById("__ao3_tap_zones");
    if (config.readingMode === "page") {
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "__ao3_tap_zones";
        overlay.style.cssText = "position:fixed;inset:56px 0 48px 0;z-index:9990;display:flex;pointer-events:none;";
        overlay.innerHTML = `
          <div id="__ao3_tap_left" style="width:28%;height:100%;pointer-events:auto;"></div>
          <div style="width:44%;height:100%;pointer-events:none;"></div>
          <div id="__ao3_tap_right" style="width:28%;height:100%;pointer-events:auto;"></div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector("#__ao3_tap_left").addEventListener("click", () => window.__ao3TurnPage("prev"));
        overlay.querySelector("#__ao3_tap_right").addEventListener("click", () => window.__ao3TurnPage("next"));
      }
      overlay.style.display = "flex";
    } else if (overlay) {
      overlay.style.display = "none";
    }
  }

  function buildFloatingToolbarAndModal() {
    if (document.getElementById("__ao3_top_pill")) return;
    const pill = document.createElement("div");
    pill.id = "__ao3_top_pill";
    pill.style.cssText = "position:fixed;top:12px;right:12px;z-index:99999;display:flex;gap:8px;align-items:center;";
    pill.innerHTML = `
      <button id="__ao3_mode_btn" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(150,140,175,0.35);background:rgba(245,242,250,0.92);color:#3a3248;font-size:13px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,0.08);">
        ${config.readingMode === "page" ? "翻页模式(无动画)" : "滑动模式"}
      </button>
      <button id="__ao3_open_settings" style="width:38px;height:38px;border-radius:999px;border:1px solid rgba(150,140,175,0.35);background:rgba(245,242,250,0.92);color:#3a3248;font-size:16px;box-shadow:0 4px 14px rgba(0,0,0,0.08);">
        🖌️
      </button>
    `;
    document.body.appendChild(pill);

    pill.querySelector("#__ao3_mode_btn").addEventListener("click", function() {
      config.readingMode = config.readingMode === "scroll" ? "page" : "scroll";
      this.textContent = config.readingMode === "page" ? "翻页模式(无动画)" : "滑动模式";
      saveConfig();
      applyAll();
    });

    pill.querySelector("#__ao3_open_settings").addEventListener("click", function() {
      const modal = document.getElementById("__ao3_settings_modal");
      if (modal) modal.style.display = "flex";
    });

    // Settings Modal matching screenshot 1000130110.jpg
    const modal = document.createElement("div");
    modal.id = "__ao3_settings_modal";
    modal.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(20,16,28,0.45);display:none;align-items:flex-end;justify-content:center;";
    modal.innerHTML = `
      <div style="width:100%;max-width:480px;max-height:88vh;overflow-y:auto;background:#fbfafc;border-radius:28px 28px 0 0;padding:22px 20px 26px;color:#2c2638;box-shadow:0 -8px 32px rgba(0,0,0,0.18);font-family:sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div style="font-size:20px;font-weight:700;">阅读设置</div>
          <button id="__ao3_close_modal" style="width:36px;height:36px;border-radius:12px;border:1px solid #e6e2ec;background:#fff;font-size:18px;color:#555;">✕</button>
        </div>
        <div style="font-size:12px;color:#8c849c;margin-bottom:16px;">字号、字体、主题颜色与自定义背景在首页及正文全局共用。</div>

        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">正文字号 • <span id="__ao3_fs_val">${config.fontSize}</span> px</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <button id="__ao3_fs_dec" style="width:42px;height:38px;border-radius:10px;border:1px solid #e2dde9;background:#fff;font-weight:600;">A-</button>
          <input id="__ao3_fs_range" type="range" min="13" max="26" value="${config.fontSize}" style="flex:1;accent-color:#6b5e82;" />
          <button id="__ao3_fs_inc" style="width:42px;height:38px;border-radius:10px;border:1px solid #e2dde9;background:#fff;font-weight:600;">A+</button>
        </div>

        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">正文字体</div>
        <select id="__ao3_font_sel" style="width:100%;padding:10px 14px;border-radius:14px;border:1px solid #e2dde9;background:#fff;font-size:14px;margin-bottom:14px;">
          <option value="system">系统默认字体（默认）</option>
          <option value="song">飞花宋体 / 思源宋体</option>
          <option value="kai">霞鹜文楷 / 楷体</option>
          <option value="hei">纯净黑体 / 无衬线</option>
        </select>

        <div id="__ao3_preview_box" style="padding:16px;border-radius:16px;border:1px solid #e2dde9;margin-bottom:16px;line-height:1.75;">
          浮光落在纸页上。他放下书，轻声说：<br>“不着急，慢慢读。”
        </div>

        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">阅读翻页方式与界面语言</div>
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button id="__ao3_set_scroll" style="flex:1;padding:9px;border-radius:12px;border:1px solid #dcd6e8;background:#fff;font-size:13px;font-weight:600;">上下滑动模式</button>
          <button id="__ao3_set_page" style="flex:1;padding:9px;border-radius:12px;border:1px solid #dcd6e8;background:#fff;font-size:13px;font-weight:600;">左右翻页(无动画)</button>
          <button id="__ao3_set_zh" style="padding:9px 12px;border-radius:12px;border:1px solid #dcd6e8;background:#fff;font-size:13px;font-weight:600;">中文界面: 开</button>
        </div>

        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">背景颜色与自定义壁纸</div>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;" id="__ao3_preset_row"></div>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:13px;color:#6e667e;">
          <span style="width:36px;">色相</span>
          <input id="__ao3_hue" type="range" min="0" max="360" value="${config.hue}" style="flex:1;" />
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:13px;color:#6e667e;">
          <span style="width:36px;">浓淡</span>
          <input id="__ao3_sat" type="range" min="0" max="80" value="${config.sat}" style="flex:1;" />
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:13px;color:#6e667e;">
          <span style="width:36px;">明暗</span>
          <input id="__ao3_light" type="range" min="12" max="97" value="${config.light}" style="flex:1;" />
        </div>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;font-size:13px;color:#6e667e;">
          <span style="width:72px;">背景透明度</span>
          <input id="__ao3_opacity" type="range" min="20" max="100" value="${config.bgOpacity}" style="flex:1;" />
          <span id="__ao3_op_val" style="width:38px;text-align:right;">${config.bgOpacity}%</span>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:18px;">
          <label style="flex:1;padding:10px;border-radius:12px;border:1px dashed #b8aed0;background:#f5f2fa;color:#524668;font-size:13px;font-weight:600;text-align:center;cursor:pointer;">
            🖼️ 选择手机相册背景图
            <input id="__ao3_bg_file" type="file" accept="image/*" style="display:none;" />
          </label>
          <button id="__ao3_clear_bg" style="padding:10px 14px;border-radius:12px;border:1px solid #e2dde9;background:#fff;font-size:13px;color:#666;">清除背景图</button>
        </div>

        <div style="display:flex;gap:12px;">
          <button id="__ao3_reset_btn" style="flex:1;padding:12px;border-radius:14px;border:1px solid #dcd6e8;background:#fff;font-size:15px;font-weight:600;color:#554d66;">恢复默认</button>
          <button id="__ao3_save_btn" style="flex:1;padding:12px;border-radius:14px;border:none;background:#3b3746;font-size:15px;font-weight:600;color:#fff;">保存</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const presetRow = modal.querySelector("#__ao3_preset_row");
    PRESETS.forEach((p, idx) => {
      const btn = document.createElement("button");
      btn.title = p.name;
      btn.style.cssText = `width:32px;height:32px;border-radius:50%;border:2px solid #b5abc9;background:hsl(${p.h},${p.s}%,${p.l}%);cursor:pointer;`;
      btn.addEventListener("click", () => {
        config.hue = p.h;
        config.sat = p.s;
        config.light = p.l;
        modal.querySelector("#__ao3_hue").value = p.h;
        modal.querySelector("#__ao3_sat").value = p.s;
        modal.querySelector("#__ao3_light").value = p.l;
        applyAll();
      });
      presetRow.appendChild(btn);
    });

    function syncPreview() {
      const box = modal.querySelector("#__ao3_preview_box");
      box.style.fontSize = config.fontSize + "px";
      box.style.fontFamily = getFontStack(config.fontFamily);
      box.style.background = `hsl(${config.hue}, ${config.sat}%, ${config.light}%)`;
      box.style.color = config.light < 35 ? "#f2eef8" : "#2c2638";
    }

    modal.querySelector("#__ao3_close_modal").addEventListener("click", () => modal.style.display = "none");
    modal.querySelector("#__ao3_save_btn").addEventListener("click", () => {
      saveConfig();
      modal.style.display = "none";
    });
    modal.querySelector("#__ao3_reset_btn").addEventListener("click", () => {
      config = Object.assign({}, DEFAULT_CONFIG);
      saveConfig();
      applyAll();
      syncPreview();
    });

    modal.querySelector("#__ao3_fs_range").addEventListener("input", e => {
      config.fontSize = parseInt(e.target.value, 10);
      modal.querySelector("#__ao3_fs_val").textContent = config.fontSize;
      applyAll();
      syncPreview();
    });
    modal.querySelector("#__ao3_fs_dec").addEventListener("click", () => {
      config.fontSize = Math.max(13, config.fontSize - 1);
      modal.querySelector("#__ao3_fs_range").value = config.fontSize;
      modal.querySelector("#__ao3_fs_val").textContent = config.fontSize;
      applyAll();
      syncPreview();
    });
    modal.querySelector("#__ao3_fs_inc").addEventListener("click", () => {
      config.fontSize = Math.min(26, config.fontSize + 1);
      modal.querySelector("#__ao3_fs_range").value = config.fontSize;
      modal.querySelector("#__ao3_fs_val").textContent = config.fontSize;
      applyAll();
      syncPreview();
    });
    modal.querySelector("#__ao3_font_sel").value = config.fontFamily;
    modal.querySelector("#__ao3_font_sel").addEventListener("change", e => {
      config.fontFamily = e.target.value;
      applyAll();
      syncPreview();
    });
    modal.querySelector("#__ao3_hue").addEventListener("input", e => {
      config.hue = parseInt(e.target.value, 10);
      applyAll();
      syncPreview();
    });
    modal.querySelector("#__ao3_sat").addEventListener("input", e => {
      config.sat = parseInt(e.target.value, 10);
      applyAll();
      syncPreview();
    });
    modal.querySelector("#__ao3_light").addEventListener("input", e => {
      config.light = parseInt(e.target.value, 10);
      applyAll();
      syncPreview();
    });
    modal.querySelector("#__ao3_opacity").addEventListener("input", e => {
      config.bgOpacity = parseInt(e.target.value, 10);
      modal.querySelector("#__ao3_op_val").textContent = config.bgOpacity + "%";
      applyAll();
    });
    modal.querySelector("#__ao3_set_scroll").addEventListener("click", () => {
      config.readingMode = "scroll";
      document.getElementById("__ao3_mode_btn").textContent = "滑动模式";
      applyAll();
    });
    modal.querySelector("#__ao3_set_page").addEventListener("click", () => {
      config.readingMode = "page";
      document.getElementById("__ao3_mode_btn").textContent = "翻页模式(无动画)";
      applyAll();
    });
    modal.querySelector("#__ao3_set_zh").addEventListener("click", function() {
      config.zhTranslate = !config.zhTranslate;
      this.textContent = "中文界面: " + (config.zhTranslate ? "开" : "关");
      applyAll();
    });
    modal.querySelector("#__ao3_bg_file").addEventListener("change", e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        config.bgImage = ev.target.result;
        saveConfig();
        applyAll();
      };
      reader.readAsDataURL(file);
    });
    modal.querySelector("#__ao3_clear_bg").addEventListener("click", () => {
      config.bgImage = "";
      saveConfig();
      applyAll();
    });

    syncPreview();
  }

  function applyAll() {
    ensureBgLayers();
    injectStyles();
    enhanceBlurbCards();
    translateDOM();
    setupPageFlipOverlay();
    buildFloatingToolbarAndModal();
  }

  window.__ao3ApplyAll = applyAll;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll);
  } else {
    applyAll();
  }
})();
