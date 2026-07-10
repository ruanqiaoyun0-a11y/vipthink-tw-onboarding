/* ============================================================
   VIP THINK 台湾团队 · 新人启航训练营
   整合培训门户 — 核心逻辑
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 课程数据（按天组织，模块即子课程） ---------- */
  var COURSES = {
    day1: {
      id: "day1", day: "Day 1", icon: "🛡️",
      title: "CC & LP 退费挽单",
      desc: "掌握退费处理规则、挽单流程与高阶话术，把退费危机转化为留存机会。",
      modules: [
        { title: "退费挽单实战演练", desc: "规则地图 · 挽单流程 · 高阶话术 · 互动考核",
          url: "https://sanl1101.github.io/vipthink-refund-course/", lang: "简体中文" }
      ]
    },
    day2: {
      id: "day2", day: "Day 2", icon: "📞",
      title: "CC 课前课中 + LP 服务流程",
      desc: "CC 课前课中 SOP 标准动作，以及 LP 学员服务全流程话术。",
      modules: [
        { title: "CC 课前课中 SOP", desc: "课前准备 · 课中跟进标准动作（台湾团队）",
          url: "./cc-taiwan-afterclass-sop/index.html", lang: "繁体中文" },
        { title: "LP 学员服务流程与话术", desc: "首通 · 首课回访 · 专题/月度回访 · 停课唤醒 · 交接 · 结课",
          url: "https://ruanqiaoyun0-a11y.github.io/vipthink-tw-lp-course-zh/", lang: "简体中文" }
      ]
    },
    day3: {
      id: "day3", day: "Day 3", icon: "💰",
      title: "CC 课后 + LP 续费",
      desc: "CC 课后电话 8 步 SOP，以及 LP 续费全流程实战。",
      modules: [
        { title: "CC 台湾课后 SOP", desc: "课后电话 8 步 · 异议处理 · 关单 · 终极考核",
          url: "https://ruanqiaoyun0-a11y.github.io/cc-tw-afterclass-sop-cn/", lang: "简体中文" },
        { title: "台湾 LP 续费全流程", desc: "续费策略 · 谈单逻辑 · 学情反馈 · 课包方案 · 推单收单",
          url: "https://ruanqiaoyun0-a11y.github.io/tw-lp-renewal-microcourse/", lang: "简体中文" }
      ]
    },
    day4: {
      id: "day4", day: "Day 4", icon: "✅",
      title: "CC & LP 质检标准",
      desc: "业务及服务质检体系、违规分级与红线、20 题终极考核。",
      modules: [
        { title: "业务及服务质检标准详解", desc: "质检体系 · A~H 级违规 · 新人保护 · 20 题考核",
          url: "https://sanl1101.github.io/happy-childhood-quality-check/", lang: "简体中文" }
      ]
    }
  };
  var DAY_ORDER = ["day1", "day2", "day3", "day4"];

  /* ---------- 状态存储 ---------- */
  var KEY = "vipthink_training_v1";
  var state = load();
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === "object") return Object.assign({ done: {}, notes: {}, seconds: 0 }, s);
    } catch (e) {}
    return { done: {}, notes: {}, seconds: 0 };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- DOM 引用 ---------- */
  var elSidebar = document.getElementById("sidebar");
  var elNav = document.getElementById("navDays");
  var elContent = document.getElementById("content");
  var elTitle = document.getElementById("tbTitle"); // 顶栏动态标题
  var elProgress = document.getElementById("tbProgress");
  var elTimer = document.getElementById("tbTimer");
  var elOverlay = document.getElementById("overlay");
  var elScrim = document.getElementById("scrim");
  var elToast = document.getElementById("toast");

  var current = { view: "home", day: null, module: null };
  var timerHandle = null;

  /* ---------- 工具 ---------- */
  function doneCount() {
    return DAY_ORDER.filter(function (d) { return state.done[d]; }).length;
  }
  function pct() { return Math.round((doneCount() / DAY_ORDER.length) * 100); }
  function fmtTime(sec) {
    sec = Math.floor(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return h + "h " + m + "m";
    if (m > 0) return m + "m " + s + "s";
    return s + "s";
  }
  function toast(msg) {
    elToast.textContent = msg;
    elToast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { elToast.classList.remove("show"); }, 2200);
  }

  /* ---------- 侧边栏 / 顶栏 渲染 ---------- */
  function renderSidebar() {
    elNav.innerHTML = "";
    DAY_ORDER.forEach(function (id) {
      var c = COURSES[id];
      var b = document.createElement("button");
      b.className = "nav-day" + (state.done[id] ? " done" : "") + (current.day === id && current.view !== "home" ? " active" : "");
      b.innerHTML =
        '<span class="ico">' + c.icon + '</span>' +
        '<span class="meta"><span class="t">' + c.day + '</span>' +
        '<span class="s">' + c.title + '</span></span>' +
        '<span class="check">✓</span>';
      b.onclick = function () { goDay(id); closeSidebar(); };
      elNav.appendChild(b);
    });
    var ob = document.querySelector(".overall .obar > i");
    var ot = document.querySelector(".overall .ot b");
    if (ob) ob.style.width = pct() + "%";
    if (ot) ot.textContent = pct() + "%";
  }
  function renderTopbar() {
    elProgress.innerHTML = "总进度 <b>" + pct() + "%</b> · " + doneCount() + "/" + DAY_ORDER.length + " 天";
    elTimer.innerHTML = "⏱ 学习时长 <b>" + fmtTime(state.seconds) + "</b>";
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    elTitle.innerHTML = 'VIP THINK <span class="accent">新人启航训练营</span>';
    var cards = DAY_ORDER.map(function (id) {
      var c = COURSES[id];
      var mods = c.modules.map(function (m) {
        return '<div class="dc-mod"><span class="dot"></span>' + m.title + '</div>';
      }).join("");
      return (
        '<div class="day-card' + (state.done[id] ? " done" : "") + '" data-day="' + id + '">' +
          '<div class="dc-top"><div class="dc-ico">' + c.icon + '</div>' +
          '<div><div class="dc-day">' + c.day + '</div>' +
          '<div class="dc-title">' + c.title + '</div></div></div>' +
          '<div class="dc-desc">' + c.desc + '</div>' +
          '<div class="dc-mods">' + mods + '</div>' +
          '<div class="dc-foot"><span class="dc-go">进入学习 →</span>' +
          '<span class="dc-badge">✓ 已完成</span></div>' +
        '</div>'
      );
    }).join("");

    elContent.innerHTML =
      '<section class="hero">' +
        '<h1>欢迎加入 <span class="g">VIP THINK 台湾团队</span><br>新人启航训练营</h1>' +
        '<p>用 4 天系统掌握 CC（课程顾问）与 LP（学习规划师）的岗位核心能力：' +
        '退费挽单、课前课中服务、课后转化、续费实战，以及业务质检红线。' +
        '完成全部 4 天培训即可获得结业证书。</p>' +
        '<div class="tags"><span class="tag">🛡️ 退费挽单</span>' +
        '<span class="tag">📞 服务流程</span><span class="tag">💰 续费实战</span>' +
        '<span class="tag">✅ 质检标准</span></div>' +
      '</section>' +
      '<div class="section-title"><span class="bar"></span>四天培训路线</div>' +
      '<div class="day-grid">' + cards + '</div>';

    Array.prototype.forEach.call(elContent.querySelectorAll(".day-card"), function (card) {
      card.onclick = function () { goDay(card.getAttribute("data-day")); };
    });
  }

  /* ---------- 单天视图 ---------- */
  function renderDay(id) {
    var c = COURSES[id];
    current.day = id; current.view = "day"; current.module = null;
    elTitle.innerHTML = c.day + ' · <span class="accent">' + c.title + '</span>';

    var mods = c.modules.map(function (m, i) {
      return (
        '<div class="mod-card">' +
          '<div class="mc-info"><div class="mc-title">' + m.title + '</div>' +
          '<div class="mc-desc">' + m.desc + '</div>' +
          '<span class="mc-lang">' + m.lang + '</span></div>' +
          '<button class="btn" data-mod="' + i + '">开始学习 →</button>' +
        '</div>'
      );
    }).join("");

    var note = state.notes[id] || "";
    elContent.innerHTML =
      '<div class="breadcrumb"><a href="#" data-home="1">训练营</a> / ' + c.day + ' · ' + c.title + '</div>' +
      '<div class="day-head"><div class="dh-ico">' + c.icon + '</div>' +
        '<div><h2>' + c.day + ' · ' + c.title + '</h2><p>' + c.desc + '</p></div></div>' +
      mods +
      '<div class="day-actions">' +
        '<button class="btn' + (state.done[id] ? '" disabled' : '"') + ' id="markDone">' +
          (state.done[id] ? "✓ 本日已标记完成" : "标记本日完成") + '</button>' +
        '<button class="btn ghost" id="openNote">📝 我的笔记</button>' +
      '</div>' +
      '<div class="note-box"><h4>📝 本日学习笔记</h4>' +
        '<textarea id="noteArea" placeholder="记录本日重点话术、易错点与个人心得…">' + escapeHtml(note) + '</textarea>' +
        '<div class="nb-save" id="noteSaved"></div></div>';

    elContent.querySelector('[data-home]').onclick = function (e) { e.preventDefault(); goHome(); };
    Array.prototype.forEach.call(elContent.querySelectorAll(".mod-card .btn"), function (btn) {
      btn.onclick = function () { openCourse(id, parseInt(btn.getAttribute("data-mod"), 10)); };
    });
    var md = document.getElementById("markDone");
    if (md && !state.done[id]) md.onclick = function () { markDone(id); };
    document.getElementById("openNote").onclick = function () {
      var ta = document.getElementById("noteArea"); ta.focus(); ta.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    var ta = document.getElementById("noteArea");
    ta.oninput = function () {
      state.notes[id] = ta.value; save();
      var saved = document.getElementById("noteSaved");
      saved.textContent = "已自动保存";
      clearTimeout(ta._t); ta._t = setTimeout(function () { saved.textContent = ""; }, 1500);
    };
    renderSidebar();
  }

  /* ---------- 课程 iframe 视图 ---------- */
  function openCourse(dayId, modIdx) {
    var c = COURSES[dayId], m = c.modules[modIdx];
    current.day = dayId; current.view = "course"; current.module = modIdx;
    elTitle.innerHTML = c.day + ' · <span class="accent">' + c.title + '</span>';

    elContent.innerHTML =
      '<div class="course-view">' +
        '<div class="course-bar">' +
          '<button class="btn ghost" id="backBtn">← 返回 ' + c.day + '</button>' +
          '<div class="cb-title">' + m.title + '<small>' + m.desc + '</small></div>' +
          '<a class="btn ghost" href="' + m.url + '" target="_blank" rel="noopener">↗ 新标签打开</a>' +
        '</div>' +
        '<iframe class="course-frame" id="courseFrame" src="' + m.url + '" ' +
          'title="' + m.title + '" loading="lazy"></iframe>' +
      '</div>';

    document.getElementById("backBtn").onclick = function () { renderDay(dayId); };
    startTimer();
    renderSidebar();
  }
  function startTimer() {
    stopTimer();
    timerHandle = setInterval(function () {
      state.seconds += 1; save(); renderTopbar();
    }, 1000);
  }
  function stopTimer() { if (timerHandle) { clearInterval(timerHandle); timerHandle = null; } }

  /* ---------- 完成 / 进度 ---------- */
  function markDone(id) {
    state.done[id] = true; save();
    renderDay(id); renderSidebar(); renderTopbar();
    toast("🎉 " + COURSES[id].day + " 已标记完成！");
    if (doneCount() === DAY_ORDER.length) {
      setTimeout(function () { openCertificate(); }, 700);
    }
  }

  /* ---------- 笔记弹窗（全站汇总） ---------- */
  function openNotesModal() {
    var body = DAY_ORDER.map(function (id) {
      var c = COURSES[id];
      return '<label>' + c.day + ' · ' + c.title + '</label>' +
        '<textarea data-day="' + id + '" rows="3">' + escapeHtml(state.notes[id] || "") + '</textarea>';
    }).join("");
    showModal(
      '<h3>📝 我的学习笔记</h3><div class="m-sub">按天整理，自动保存在本地浏览器。</div>' + body +
      '<div class="m-actions"><button class="btn" id="mOk">完成</button></div>'
    );
    Array.prototype.forEach.call(elOverlay.querySelectorAll("textarea[data-day]"), function (ta) {
      ta.oninput = function () { state.notes[ta.getAttribute("data-day")] = ta.value; save(); };
    });
    document.getElementById("mOk").onclick = closeModal;
  }

  /* ---------- 结业证书 ---------- */
  function openCertificate() {
    showModal(
      '<h3>🏆 结业证书</h3>' +
      '<div class="m-sub">恭喜完成全部 4 天新人入职培训！填写姓名生成你的专属证书。</div>' +
      '<label>学员姓名</label><input type="text" id="certName" placeholder="请输入你的姓名" value="' +
        escapeHtml(state.name || "") + '">' +
      '<div class="cert-preview"><canvas id="certCanvas" width="1000" height="700"></canvas></div>' +
      '<div class="m-actions">' +
        '<button class="btn ghost" id="certClose">关闭</button>' +
        '<button class="btn" id="certDownload">⬇ 下载证书</button>' +
      '</div>'
    );
    var nameInput = document.getElementById("certName");
    var draw = function () { drawCertificate(nameInput.value.trim() || "学员"); };
    nameInput.oninput = function () { state.name = nameInput.value; save(); draw(); };
    draw();
    document.getElementById("certClose").onclick = closeModal;
    document.getElementById("certDownload").onclick = function () {
      var a = document.createElement("a");
      a.download = "VIPTHINK_结业证书_" + (nameInput.value.trim() || "学员") + ".png";
      a.href = document.getElementById("certCanvas").toDataURL("image/png");
      a.click();
      toast("证书已下载 ✅");
    };
  }

  function drawCertificate(name) {
    var cv = document.getElementById("certCanvas");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    // 背景
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ecfdf5"; ctx.fillRect(0, 0, W, 14); ctx.fillStyle = "#10b981"; ctx.fillRect(0, H - 14, W, 14);
    // 外框
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 6; ctx.strokeRect(34, 34, W - 68, H - 68);
    ctx.strokeStyle = "#a7f3d0"; ctx.lineWidth = 2; ctx.strokeRect(48, 48, W - 96, H - 96);
    // Logo
    var img = new Image();
    img.onload = function () {
      try { ctx.drawImage(img, W / 2 - 42, 86, 84, 84); } catch (e) {}
      paintText();
    };
    img.onerror = paintText;
    img.src = "logo.jpg";
    function paintText() {
      ctx.textAlign = "center";
      ctx.fillStyle = "#059669"; ctx.font = "700 30px sans-serif";
      ctx.fillText("VIP THINK 台湾团队", W / 2, 210);
      ctx.fillStyle = "#0f172a"; ctx.font = "700 46px sans-serif";
      ctx.fillText("结 业 证 书", W / 2, 290);
      ctx.fillStyle = "#64748b"; ctx.font = "20px sans-serif";
      ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 322);
      ctx.fillStyle = "#334155"; ctx.font = "22px sans-serif";
      ctx.fillText("兹证明", W / 2, 392);
      ctx.fillStyle = "#10b981"; ctx.font = "700 40px sans-serif";
      ctx.fillText(name, W / 2, 450);
      ctx.fillStyle = "#334155"; ctx.font = "21px sans-serif";
      ctx.fillText("已完成《新人启航训练营》全部 4 天入职培训", W / 2, 510);
      ctx.fillText("（退费挽单 · 服务流程 · 续费实战 · 质检标准）", W / 2, 544);
      // 日期
      var d = new Date();
      var ds = d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日";
      ctx.fillStyle = "#64748b"; ctx.font = "18px sans-serif";
      ctx.fillText("颁发日期：" + ds, W / 2, 612);
      // 印章
      ctx.strokeStyle = "#10b981"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W - 200, 600, 56, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#10b981"; ctx.font = "700 15px sans-serif";
      ctx.fillText("VIP THINK", W - 200, 596); ctx.fillText("认证", W - 200, 618);
    }
  }

  /* ---------- Modal 通用 ---------- */
  function showModal(html) { elOverlay.innerHTML = '<div class="modal">' + html + '</div>'; elOverlay.classList.add("show"); }
  function closeModal() { elOverlay.classList.remove("show"); elOverlay.innerHTML = ""; }
  elOverlay.onclick = function (e) { if (e.target === elOverlay) closeModal(); };

  /* ---------- 路由 ---------- */
  function goHome() { stopTimer(); current.view = "home"; current.day = null; renderHome(); renderSidebar(); renderTopbar(); closeSidebar(); window.scrollTo(0, 0); }
  function goDay(id) { stopTimer(); renderDay(id); renderSidebar(); renderTopbar(); window.scrollTo(0, 0); }
  function closeSidebar() { elSidebar.classList.remove("open"); elScrim.classList.remove("show"); }
  function openSidebar() { elSidebar.classList.add("open"); elScrim.classList.add("show"); }

  /* ---------- 绑定 ---------- */
  document.getElementById("hamburger").onclick = openSidebar;
  elScrim.onclick = closeSidebar;
  document.getElementById("goHome").onclick = function (e) { e.preventDefault(); goHome(); };
  document.getElementById("btnNotes").onclick = openNotesModal;
  document.getElementById("btnCert").onclick = openCertificate;

  /* ---------- 启动 ---------- */
  renderSidebar(); renderTopbar(); renderHome();

  /* ---------- 辅助 ---------- */
  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
