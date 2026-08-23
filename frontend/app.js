// Local split ports use :8787; public/mobile gateway deployments proxy /api on the same origin.
const isLocalSplitDev = ["127.0.0.1", "localhost"].includes(window.location.hostname);
const isGithubPages = window.location.hostname.endsWith(".github.io");
const isStaticPreviewHost = isGithubPages || window.location.hostname.endsWith("githack.com");
const API_BASE = isLocalSplitDev ? `${window.location.protocol}//${window.location.hostname}:8787` : "";
const SESSION_KEY = "brokeup_demo_session_v2";
const REQUEST_TIMEOUT_MS = 1800;

const chapters = [
  "开始之前",
  "讲给我听",
  "关系画像与启程",
  "情感交流",
  "行动推荐",
  "习惯成长",
  "同路人",
  "告别练习与结案",
];

const storyQuestions = [
  {
    question: "你们最后一次见面，TA 离开前做了什么？",
    options: ["他在门口站了一会儿，没有回头。", "我们还像平时一样吃了饭。"],
    placeholder: "从你记得最清楚的那个动作开始…",
  },
  {
    question: "现在最容易突然想起 TA 的，是一天里的什么时候？",
    options: ["睡前拿起手机的时候。", "周末醒来、还没安排事情的时候。"],
    placeholder: "比如一个时间、地点，或者很小的动作…",
  },
  {
    question: "TA 有哪个很普通的小习惯，你最近还会下意识等着？",
    options: ["到家会发一句“到了”。", "每次点单都先问我要不要喝的。"],
    placeholder: "越普通的细节，越能帮我听懂你们…",
  },
  {
    question: "你第一次意识到你们可能回不到从前，是哪一件小事？",
    options: ["那次争吵后，他第一次没有解释。", "我分享一件事，他只回了一个表情。"],
    placeholder: "不用总结关系，只说那一幕…",
  },
  {
    question: "你们反复绕不开的那件事，通常从哪一句话开始？",
    options: ["“以后再说吧。”", "“你为什么总要我现在回答？”"],
    placeholder: "写下你们最常说的那句话…",
  },
  {
    question: "那一次，你真正希望 TA 做的是什么？",
    options: ["把话说完，不要消失。", "不是解决问题，只是先抱抱我。"],
    placeholder: "不是 TA 做错了什么，而是你当时需要什么…",
  },
  {
    question: "谈恋爱以前，你的周末通常会留给什么？",
    options: ["我会一个人去游泳。", "我有固定见面的朋友和读书会。"],
    placeholder: "想想关系开始以前的你…",
  },
  {
    question: "有哪件你一直想学的事，后来总被放到“下一次”？",
    options: ["学会游泳。", "重新开始读书，或者去学攀岩。"],
    placeholder: "只写一件真的属于你的事…",
  },
  {
    question: "如果先拿回生活里很小的一块，你最想从哪里开始？",
    options: ["把周六上午重新留给自己。", "先恢复一项身体会记住的习惯。"],
    placeholder: "不用承诺改变，只选一个愿意试试的入口…",
  },
];

const voiceTurns = [
  {
    agent: "不用从头讲起。最近哪一个瞬间，最让你觉得这段关系还没有结束？",
    user: "前天整理相册，我看到京都清单还在共享文档里。",
    memory: ["触发场景：整理相册", "新线索：京都清单仍存在"],
  },
  {
    agent: "你盯着它看的那几分钟里，最想从它那里得到什么？",
    user: "我想知道他是不是也还没放下，但我不敢问。",
    memory: ["反复猜想：他是否还没放下", "行为：想联系但克制"],
  },
  {
    agent: "先不替他回答。离开这段关系后，有什么原本属于你的事，被你放下很久了？",
    user: "学游泳。以前报过名，后来周末都留给他了。",
    memory: ["被搁置的自己：学游泳", "周末长期让位于关系"],
  },
  {
    agent: "你说周末总留给他。恋爱以前，一个属于你自己的周六通常是什么样？",
    user: "我会晨泳，然后和读书会的人吃午饭。后来这些都慢慢停了。",
    memory: ["曾经的生活支点：晨泳、读书会", "希望拿回周六上午"],
  },
  {
    agent: "如果这周只拿回很小的一块，不需要证明自己，你愿意先拿回什么？",
    user: "先去泳池看一眼吧，不一定下水。",
    memory: ["可接受的第一步：泳池踩点", "当前行动偏好：低压力开始"],
  },
  {
    agent: "好。我现在已经更懂这段关系，也更懂你想找回什么。还有一句你希望我别忘的吗？",
    user: "我不是想靠变好让他后悔，我只是想让自己别一直停在这里。",
    memory: ["成长边界：不以证明给前任看为目标", "阶段目标：让生活重新流动"],
  },
];

const skillPacks = {
  游泳: {
    title: "四周游泳入门",
    reason: "你说学游泳原本是自己的愿望，后来周末总让位于关系。",
    peer: "南乔",
    milestones: ["去泳池踩点", "第一次下水", "连续游 200 米", "完成 500 米"],
  },
  读书: {
    title: "四周读书重启",
    reason: "你说书架上还有七本没拆封，它们一直在等你把注意力带回来。",
    peer: "林一",
    milestones: ["拆开第一本", "连续读 20 分钟", "读完第一本", "读完第二本"],
  },
  攀岩: {
    title: "四周攀岩入门",
    reason: "你说独处时最容易陷入反刍，而攀岩会把注意力带回手脚和当下。",
    peer: "阿蒙",
    milestones: ["去岩馆踩点", "完成第一条线路", "第一次登顶", "完成一次完整训练"],
  },
  滑雪: {
    title: "四周滑雪入门",
    reason: "你想重新独自安排一次周末，滑雪让这件事有一个清楚的目的地。",
    peer: "小满",
    milestones: ["试穿装备", "第一次上雪", "学会刹车", "独立滑完一整天"],
  },
};

const journeyViews = [
  { day: 1, text: "我还是想知道，他为什么没有把话说完。" },
  { day: 4, text: "我大部分时间仍在想他，但今天去看了泳池。" },
  { day: 9, text: "他的回避是他的方式，不等于我要继续等一个答案。" },
  { day: 15, text: "京都清单还在他那里，那是他的事。我今天没有点开。" },
  { day: 21, text: "他是我故事里重要的一部分，但不再是我每天的问题。" },
];

const actionFallback = [
  {
    id: "action-90s",
    level: "90 秒",
    title: "把想发的话存下，不发送",
    description: "先让冲动有地方落下，不要求自己立刻想通。",
  },
  {
    id: "action-20m",
    level: "20 分钟",
    title: "看看附近泳池的开放时间",
    description: "不用马上下水，只把这件事从“以后”带到今天。",
  },
  {
    id: "action-project",
    level: "四周项目",
    title: "把游泳入门还给自己",
    description: "从踩点开始，完成一次属于自己的 500 米。",
  },
];

const milestones = [
  { title: "去泳池踩点", note: "我只是去看了一眼，没有逼自己下水。" },
  { title: "第一次下水", note: "紧张没有消失，但我完成了第一节课。" },
  { title: "连续游 200 米", note: "我开始愿意为自己的周末做安排。" },
  { title: "完成 500 米", note: "这不是忘掉谁，是我重新拥有了一件事。" },
];

const fallbackEvidence = [
  { id: "ev-01", category: "fact", title: "分手发生在凌晨一点", detail: "周屿在手机上发了四行字，没有当面告别。", source: "讲述第 1 轮｜林澈确认", status: "confirmed" },
  { id: "ev-02", category: "view", title: "林澈觉得自己没有被认真告别", detail: "这是林澈对那四行字的感受，不是对周屿动机的判断。", source: "讲述第 2 轮｜用户视角", status: "confirmed" },
  { id: "ev-03", category: "model", title: "冲突出现时，周屿常先结束对话", detail: "这是根据三次事件形成的候选模式，仍可被修改或反对。", source: "事件 06、09、12｜模型候选", status: "candidate" },
  { id: "ev-04", category: "unknown", title: "周屿现在是否希望复合", detail: "目前没有直接联系或其他足够证据，无法判断。", source: "证据不足", status: "unknown" },
  { id: "ev-05", category: "self", title: "被搁置的自己：学会游泳", detail: "恋爱以前就想学，后来总把周末留给关系。", source: "讲述第 3 轮｜林澈确认", status: "confirmed" },
  { id: "ev-06", category: "self", title: "被搁置的自己：回到读书会", detail: "不为了疗愈打卡，只是重新拥有一个属于自己的晚上。", source: "关系档案｜林澈确认", status: "confirmed" },
];

const fallbackClue = {
  fact: "京都清单仍然存在；周屿没有直接联系你。",
  interpretations: ["它可能只是没有被整理的旧资料。", "他也可能保留了这段经历，但这不等于希望复合。"],
  unknown: "仅凭这份清单，无法判断他是否在等你联系。",
  loop: "继续刷新这个线索，不会增加确定性。",
  evidenceRefs: ["ev-01", "ev-04"],
};

const ui = {
  screen: 0,
  echoStep: 0,
  storyStage: "profile",
  storyMode: "",
  voiceTurn: 0,
  checkpointTurn: 0,
  pausedAtCheckpoint: false,
  archiveStage: "map",
  clueText: "他还保留京都旅行清单，是不是还在等我？",
  selectedAnswer: "",
  selectedEvidenceTab: "all",
  selectedEvidenceId: null,
  actions: null,
  energy: "medium",
  feedback: "",
  peer: null,
  closureRevealed: false,
  closureStage: "ask",
  callLine: 0,
  closureResult: null,
  busy: false,
  offlineFallback: false,
};

let session = null;
let toastTimer = null;

const screenHost = document.getElementById("screenHost");
const phoneSurface = document.getElementById("phoneSurface");
const progressBar = document.getElementById("progressBar");
const backButton = document.getElementById("backButton");
const chapterList = document.getElementById("chapterList");
const toast = document.getElementById("toast");
const infoModal = document.getElementById("infoModal");
const evidenceModal = document.getElementById("evidenceModal");
const demoModal = document.getElementById("demoModal");
const phaseTabs = document.getElementById("phaseTabs");
const launchScreen = document.getElementById("launchScreen");
const LAUNCH_MIN_DURATION = 1800;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fallbackSession() {
  return {
    sessionId: `local-${Date.now()}`,
    currentScreen: 0,
    consent: false,
    storyTurn: 0,
    storyAnswers: [],
    evidence: structuredClone(fallbackEvidence),
    clueAnalysis: null,
    selectedAction: null,
    projectMilestone: 0,
    peerConsent: false,
    closureChoice: null,
    supportMode: "UNDERSTAND",
    exProfile: { name: "周屿", handle: "@island_zhou", breakupReason: "他说不想耽误我", hobbies: "摄影、长跑、深夜播客" },
    entryMode: "",
    journeyDay: 1,
    totalDays: 21,
    extensions: 0,
    selectedSkill: "游泳",
    checkins: [],
    companionStarted: false,
  };
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "content-type": "application/json", ...(options.headers || {}) },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function setBusy(value) {
  ui.busy = value;
  render();
}

function loadingMarkup(label = "正在整理这段关系…") {
  return `
    <section class="screen">
      <div class="loading-block">
        <div>
          <div class="agent-orb"></div>
          <span>${escapeHtml(label)}</span>
        </div>
      </div>
    </section>`;
}

function dismissLaunchScreen() {
  if (!launchScreen || launchScreen.hidden) return;
  launchScreen.classList.add("is-leaving");
  window.setTimeout(() => {
    launchScreen.hidden = true;
  }, 280);
}

async function initialize() {
  renderChapterList();
  screenHost.innerHTML = loadingMarkup("正在打开 Broke UP…");
  // Loading should never block the product if an API is unavailable or slow.
  window.setTimeout(dismissLaunchScreen, LAUNCH_MIN_DURATION);
  if (isStaticPreviewHost) {
    session = fallbackSession();
    ui.offlineFallback = true;
    render();
    return;
  }
  const saved = localStorage.getItem(SESSION_KEY);
  try {
    if (saved) {
      const data = await request(`/api/session/${encodeURIComponent(saved)}`);
      session = data.session;
      ui.screen = session.currentScreen || 0;
    } else {
      await resetSession(false);
      return;
    }
  } catch {
    session = fallbackSession();
    ui.offlineFallback = true;
    localStorage.removeItem(SESSION_KEY);
    showToast("Mock API 暂未连接，已切换为透明的本地演示兜底。");
  }
  render();
}

async function resetSession(announce = true) {
  screenHost.innerHTML = loadingMarkup("正在重置合成案例…");
  if (isStaticPreviewHost) {
    session = fallbackSession();
    ui.offlineFallback = true;
  } else {
    try {
      const data = await request("/api/session/reset", { method: "POST", body: "{}" });
      session = data.session;
      ui.offlineFallback = false;
      localStorage.setItem(SESSION_KEY, session.sessionId);
    } catch {
      session = fallbackSession();
      ui.offlineFallback = true;
      localStorage.removeItem(SESSION_KEY);
    }
  }
  Object.assign(ui, {
    screen: 0,
    echoStep: 0,
    storyStage: "profile",
    storyMode: "",
    voiceTurn: 0,
    checkpointTurn: 0,
    pausedAtCheckpoint: false,
    archiveStage: "map",
    clueText: "他还保留京都旅行清单，是不是还在等我？",
    selectedAnswer: "",
    selectedEvidenceTab: "all",
    selectedEvidenceId: null,
    actions: null,
    energy: "medium",
    feedback: "",
    peer: null,
    closureRevealed: false,
    closureStage: "ask",
    callLine: 0,
    closureResult: null,
    busy: false,
  });
  render();
  if (announce) showToast("演示已经回到起点。");
}

function renderChapterList() {
  chapterList.innerHTML = chapters
    .map(
      (title, index) => `
      <li class="chapter-item">
        <button class="chapter-button${index === ui.screen ? " active" : ""}" type="button" data-jump="${index}">
          <span class="chapter-number">${String(index + 1).padStart(2, "0")}</span>
          <strong>${title}</strong>
          <span class="chapter-arrow">→</span>
        </button>
      </li>`,
    )
    .join("");
}

function render() {
  if (!session) return;
  phoneSurface.dataset.phase = String(ui.screen);
  progressBar.style.width = `${((ui.screen + 1) / chapters.length) * 100}%`;
  backButton.disabled = ui.screen === 0 && ui.echoStep === 0;
  const companionVisible = Boolean(session.companionStarted) && ui.screen >= 2 && ui.screen <= 6;
  phoneSurface.dataset.companion = companionVisible ? "true" : "false";
  phaseTabs.classList.toggle("visible", companionVisible);
  phaseTabs.querySelectorAll("[data-phase-tab]").forEach((button) => {
    const tab = button.dataset.phaseTab;
    const active =
      (tab === "chat" && ui.screen === 3) ||
      (tab === "habit" && [4, 5].includes(ui.screen)) ||
      (tab === "peer" && ui.screen === 6) ||
      (tab === "journal" && ui.screen === 2);
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  renderChapterList();

  if (ui.busy) return;
  const renderers = [
    renderEcho,
    renderStory,
    renderArchive,
    renderClue,
    renderActions,
    renderProject,
    renderPeer,
    renderClosure,
  ];
  screenHost.innerHTML = renderers[ui.screen]();
}

function renderEcho() {
  return `
    <section class="screen">
      <p class="eyebrow">01 · BEFORE WE BEGIN</p>
      <h2>开始之前，<br />三件事说清楚。</h2>
      <p class="lead">你可以放心讲，也可以随时停。决定权一直在你手里。</p>
      <div class="promise-list">
        <article class="promise-card glass-card">
          <span class="promise-check">✓</span>
          <div><strong>我会记住你说过的事</strong><p>不用每次从头讲。所有记忆都能查看、修改和删除。</p><small>必须项</small></div>
        </article>
        <article class="promise-card glass-card">
          <span class="promise-check">✓</span>
          <div><strong>关于 TA，只代表你的叙述</strong><p>我不会声称那是 TA 的真相，也不会替 TA 解释动机。</p><small>必须项</small></div>
        </article>
      </div>
      <div class="safety-note">如果你正处在伤害自己的念头里，请先联系身边的人或专业机构。Broke UP 不是心理医生，也不能替代真人支持。</div>
      <div class="button-stack">
        <button class="primary-button" type="button" data-action="consent-start">同意并开始</button>
      </div>
    </section>`;
}

function renderStory() {
  if (ui.storyStage === "profile") {
    const reasons = ["TA 提出的，理由很模糊", "异地 / 未来规划不一致", "长期回避冲突", "第三个人", "我提出的", "还没想清楚"];
    const hobbies = ["摄影", "长跑", "深夜播客", "爬山", "做饭", "电子游戏", "看展", "养猫", "骑行", "写字"];
    const selectedHobbies = String(session.exProfile?.hobbies || "摄影、长跑、深夜播客").split(/[、,，]/).filter(Boolean);
    return `
      <section class="screen">
        <p class="eyebrow">02 · A MINIMUM PORTRAIT</p>
        <h2>先说说 TA。</h2>
        <p class="lead">这些信息只用来帮我理解你的讲述。它们代表你眼中的 TA，不代表 TA 本人。</p>
        <div class="profile-card glass-card simple-profile">
          <div class="profile-line"><div class="profile-avatar">${escapeHtml((session.exProfile?.name || "周屿").slice(0, 1))}</div><label>你怎么称呼 TA<input id="exName" value="${escapeHtml(session.exProfile?.name || "周屿")}" /></label></div>
          <label>社交媒体名字 <span>可跳过</span><input id="exHandle" value="${escapeHtml(session.exProfile?.handle || "@zhouyu_")}" /></label>
          <fieldset><legend>你认为的分开原因</legend><small>现在的理解就好，之后可以随时改</small><div class="profile-chips">${reasons.map((reason) => `<button class="profile-chip${session.exProfile?.breakupReason === reason ? " selected" : ""}" type="button" data-profile-reason="${escapeHtml(reason)}">${escapeHtml(reason)}</button>`).join("")}</div></fieldset>
          <fieldset><legend>TA 的爱好</legend><small>之后我会用它判断哪些线索值得你花时间</small><div class="profile-chips">${hobbies.map((hobby) => `<button class="profile-chip${selectedHobbies.includes(hobby) ? " selected" : ""}" type="button" data-profile-hobby="${escapeHtml(hobby)}">${escapeHtml(hobby)}</button>`).join("")}</div></fieldset>
        </div>
        <div class="button-stack"><button class="primary-button" type="button" data-action="save-profile">下一步</button></div>
      </section>`;
  }

  if (ui.storyStage === "choose") {
    return `
      <section class="screen">
        <p class="eyebrow">02 · CHOOSE HOW TO TELL</p>
        <h2>你想怎么开始？</h2>
        <p class="lead">两条路会汇到同一个地方。选现在更说得出口的那一种。</p>
        <div class="entry-grid">
          <button class="entry-card glass-card" type="button" data-entry="voice">
            <span class="entry-icon">◉</span><strong>语音倾诉</strong><em>连续对话</em>
            <small>你说，我会从细节里记住这段关系，也记住你原本的习惯和愿望。</small>
            <b>适合：现在情绪上来了，不想打字</b>
          </button>
          <button class="entry-card glass-card" type="button" data-entry="qa">
            <span class="entry-icon">→</span><strong>一个问题一个问题来</strong><em>慢慢讲</em>
            <small>我一次只问一个具体问题。答案只是方向，你可以从任何细节讲开。</small>
            <b>适合：想理清楚，不知道从哪讲起</b>
          </button>
        </div>
        <p class="microcopy">无论选哪个，都可以中途停下；已经说过的部分会保留。</p>
      </section>`;
  }

  if (ui.storyStage === "checkpoint") {
    const second = ui.checkpointTurn >= 6;
    return `
      <section class="screen checkpoint-screen">
        <p class="eyebrow">阶段性整理 · ${ui.checkpointTurn} 个细节</p>
        <h2>${ui.pausedAtCheckpoint ? "这次先到这里。" : "我先说说，\n我现在听懂了什么。"}</h2>
        <div class="checkpoint-grid">
          <article class="checkpoint-card glass-card"><small>我已经知道</small><strong>${second ? "你最难受的不是分开本身，而是很多话没有说完。" : "关系结束得很突然，你仍在一些日常细节里等待 TA。"}</strong><span>${second ? "需要：被认真回应，而不是被留下" : "触发：睡前、空下来的周末、熟悉的小动作"}</span></article>
          <article class="checkpoint-card glass-card open"><small>我还想知道</small><strong>${second ? "离开这段关系后，你想把哪一部分自己带回来？" : "这段关系从什么时候开始，让你越来越不像自己？"}</strong><span>你可以现在说，也可以下次从这里继续。</span></article>
        </div>
        <div class="portrait-meter"><div><span style="width:${Math.round((ui.checkpointTurn / storyQuestions.length) * 100)}%"></span></div><small>关系画像正在形成 · ${ui.checkpointTurn} / ${storyQuestions.length}</small></div>
        <div class="button-stack">
          <button class="primary-button" type="button" data-action="checkpoint-continue">${ui.pausedAtCheckpoint ? "从这个问题继续" : "我还想继续讲"}</button>
          <button class="secondary-button" type="button" data-action="checkpoint-pause">${ui.pausedAtCheckpoint ? "回到首页" : "今天先到这里"}</button>
        </div>
      </section>`;
  }

  if (ui.storyStage === "voice") {
    const index = Math.min(ui.voiceTurn, voiceTurns.length - 1);
    const turn = voiceTurns[index];
    const complete = ui.voiceTurn >= voiceTurns.length;
    if (complete) {
      ui.storyStage = "building";
      return renderStory();
    }
    return `
      <section class="screen voice-screen">
        <div class="simulation-tag">连续倾诉 · 我在听</div>
        <div class="voice-agent"><div class="agent-orb"></div><strong>我在听</strong><span>03:${String(12 + index * 37).padStart(2, "0")}</span></div>
        <div class="voice-transcript">
          <div class="voice-bubble agent">${escapeHtml(turn.agent)}</div>
          <div class="voice-bubble user">${escapeHtml(turn.user)}</div>
        </div>
        <div class="live-memory glass-card">
          <small>这句话让我暂时记住</small>
          ${turn.memory.map((item) => `<span>＋ ${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="button-stack">
          <button class="primary-button" type="button" data-action="voice-next">${index === voiceTurns.length - 1 ? "结束倾诉，整理画像" : "继续这通对话"}</button>
          <button class="secondary-button" type="button" data-action="switch-qa">改用逐题回答</button>
        </div>
      </section>`;
  }

  if (ui.storyStage === "building") {
    return `
      <section class="screen">
        <p class="eyebrow">BUILDING A RELATIONSHIP MAP</p>
        <div class="agent-orb" aria-hidden="true"></div>
        <h2>我在整理，<br />但不会替你下结论。</h2>
        <div class="build-list glass-card">
          <span class="done">✓ 关系时间线</span>
          <span class="done">✓ 事实与感受分开</span>
          <span class="done">✓ TA 的候选行为模式</span>
          <span class="done">✓ 被搁置的自己</span>
          <span>○ 仍然未知的部分</span>
        </div>
        <div class="button-stack"><button class="primary-button" type="button" data-action="finish-building">打开关系地图</button></div>
      </section>`;
  }

  const turn = Math.min(session.storyTurn || 0, storyQuestions.length);
  if (turn >= storyQuestions.length) {
    ui.storyStage = "building";
    return renderStory();
  }

  const item = storyQuestions[turn];
  return `
    <section class="screen">
      <p class="eyebrow">02 · LISTEN ONE THING AT A TIME</p>
      <div class="story-person"><span class="mini-avatar">周</span><span>正在讲：林澈与 ${escapeHtml(session.exProfile?.name || "周屿")}</span></div>
      <div class="question-index"><span>第 ${turn + 1} 个细节</span><span>画像 ${Math.round((turn / storyQuestions.length) * 100)}%</span></div>
      <h2 class="question-text">${item.question}</h2>
      <p class="question-hint">一个具体细节，比一段完整总结更有用。</p>
      <div class="answer-options">
        <small>如果不知道从哪讲，可以先点一个表达方向</small>
        ${item.options
          .map(
            (option) => `<button class="choice-card${ui.selectedAnswer === option ? " selected" : ""}" type="button" data-answer="${escapeHtml(option)}">${option}</button>`,
          )
          .join("")}
      </div>
      <div class="composer">
        <textarea id="storyInput" placeholder="${item.placeholder}">${escapeHtml(ui.selectedAnswer)}</textarea>
        <div class="composer-actions">
          <button class="record-button" id="recordButton" type="button" data-action="toggle-record" aria-label="语音输入">◉</button>
          <span class="memory-status" id="memoryStatus">回答后将标为“待确认”</span>
          <button class="send-button" type="button" data-action="submit-story" aria-label="提交回答">↑</button>
        </div>
      </div>
      <div class="story-footer"><span>回答后会标记“已记住 · 待确认”</span><button type="button" data-action="story-pause">我有点累了，下次再说</button></div>
    </section>`;
}

function renderArchive() {
  if (ui.archiveStage === "transition" && !session.companionStarted) {
    return `
      <section class="screen transition-screen">
        <p class="eyebrow">FROM UNDERSTANDING TO LIVING</p>
        <div class="transition-orb"><div class="agent-orb"></div><span>关系画像已经足够支撑下一步</span></div>
        <h2>我们已经一起看懂了很多。<br />接下来，慢慢把生活还给你。</h2>
        <p class="lead">不是要求你忘掉 TA，也不是突然开始一份打卡计划。以后每一次想起，我都会同时做两件事。</p>
        <div class="transition-path">
          <article class="glass-card"><span>01</span><div><strong>接住这次情绪</strong><p>分析新线索，区分事实、解释和未知，不替 TA 读心。</p></div></article>
          <article class="glass-card"><span>02</span><div><strong>把一点行动还给你</strong><p>从你说过的兴趣、愿望和被搁置的生活里，推荐一个现实入口。</p></div></article>
          <article class="glass-card"><span>03</span><div><strong>做成一件事，认识一个人</strong><p>让成长发生在真实世界，直到 Broke UP 可以慢慢退场。</p></div></article>
        </div>
        <div class="button-stack"><button class="primary-button" type="button" data-action="start-companion">好，我们开始往前走</button><button class="secondary-button" type="button" data-action="transition-back">再看看关系画像</button></div>
      </section>`;
  }

  const evidence = (session.evidence || fallbackEvidence).filter((item) => item.status !== "hidden");
  const filtered = ui.selectedEvidenceTab === "all" ? evidence : evidence.filter((item) => item.category === ui.selectedEvidenceTab);
  const labels = { all: "全部", fact: "事实", view: "我的理解", model: "人物模型", unknown: "未知", self: "被搁置的自己" };

  return `
    <section class="screen">
      <p class="eyebrow">${session.companionStarted ? "JOURNAL · RELATIONSHIP MEMORY" : "03 · RELATIONSHIP PORTRAIT"}</p>
      <div class="portrait-header glass-card"><div class="profile-avatar small">周</div><div><strong>${escapeHtml(session.exProfile?.name || "周屿")} 的关系画像</strong><small>${(session.evidence || fallbackEvidence).length} 条可追溯记忆 · 由林澈确认</small></div></div>
      <h2>${session.companionStarted ? "手账里记录的，\n不只是 TA。" : "这一阶段，\n我先这样理解你们。"}</h2>
      <p class="lead">每一条都能回到来源，也可以被确认、修改或隐藏。它会随着你继续讲而生长。</p>
      <div class="tab-row" role="tablist">
        ${Object.entries(labels)
          .map(([key, label]) => `<button class="tab-button${ui.selectedEvidenceTab === key ? " active" : ""}" type="button" data-tab="${key}" role="tab">${label}</button>`)
          .join("")}
      </div>
      <div class="evidence-list">
        ${filtered
          .map(
            (item) => `
              <button class="evidence-card" type="button" data-evidence="${item.id}" data-category="${item.category}">
                <span class="evidence-dot"></span>
                <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.source)} · ${item.status === "candidate" ? "待确认" : "可追溯"}</small></span>
                <span>›</span>
              </button>`,
          )
          .join("") || `<div class="glass-card" style="padding:20px;font-size:13px;color:#77736d">这个分类暂时没有可见条目。</div>`}
      </div>
      ${session.companionStarted ? `<div class="journal-note glass-card"><small>第 ${session.journeyDay || 1} 天 · 我的记录</small><p>“${escapeHtml(journeyViews.filter((item) => item.day <= (session.journeyDay || 1)).slice(-1)[0]?.text || journeyViews[0].text)}”</p><span>这句话保持你的原话，不会被 AI 改写。</span></div>` : ""}
      <p class="caveat">这不是周屿的真相，而是目前由林澈确认过的关系地图。</p>
      <div class="button-stack">
        ${session.companionStarted ? `<button class="primary-button" type="button" data-action="journal-add">继续补充一段记忆</button>` : `<button class="primary-button" type="button" data-action="portrait-ready">准备好了，和我一起往前走</button><button class="secondary-button" type="button" data-action="portrait-more">我还想再讲一点</button>`}
      </div>
    </section>`;
}

function renderClue() {
  const analysis = session.clueAnalysis;
  return `
    <section class="screen">
      <p class="eyebrow">情感交流 · 第 ${session.journeyDay || 1} 天</p>
      <div class="companion-head glass-card"><div class="agent-orb small"></div><div><strong>今天最想带回来的是哪一件事？</strong><small>我会回应情绪，也会帮你看清线索。</small></div></div>
      <h2>先接住，<br />再一起看清楚。</h2>
      <div class="clue-composer"><textarea id="clueInput" aria-label="输入今天想分析的线索">${escapeHtml(ui.clueText)}</textarea><button type="button" data-action="analyze-clue">↑</button></div>
      <div class="clue-presets"><button type="button" data-clue-preset="我又想联系他了。">我又想联系他了</button><button type="button" data-clue-preset="他突然给我的动态点了赞，这是什么意思？">他突然点赞了</button><button type="button" data-clue-preset="我今天什么都不想做。">今天什么都不想做</button></div>
      ${
        !analysis
          ? `
            <div class="agent-question" style="margin-top:18px">
              <div class="agent-orb small" aria-hidden="true"></div>
              <span>我会把已确认事实、可能解释和未知分开，不为安慰制造确定性。</span>
            </div>
            <p class="caveat">你可以直接输入，也可以点一个最近常出现的念头。</p>`
          : `
            <div class="analysis-stack">
              <div class="analysis-card"><strong>能确认</strong><span>${escapeHtml(analysis.fact)}</span></div>
              <div class="analysis-card"><strong>可能解释 A</strong><span>${escapeHtml(analysis.interpretations[0])}</span></div>
              <div class="analysis-card"><strong>可能解释 B</strong><span>${escapeHtml(analysis.interpretations[1])}</span></div>
              <div class="analysis-card unknown"><strong>仍然未知</strong><span>${escapeHtml(analysis.unknown)}</span></div>
              <div class="analysis-card loop"><strong>先停一下</strong><span>${escapeHtml(analysis.loop)}</span></div>
            </div>
            <button class="source-chip" type="button" data-evidence="ev-04">↗ 查看关系档案里的证据</button>
            <div class="button-stack">
              <button class="primary-button" type="button" data-action="next-screen">现在，把这十分钟还给自己</button>
            </div>`
      }
    </section>`;
}

function renderActions() {
  return `
    <section class="screen">
      <p class="eyebrow">05 · RETURN TO REAL LIFE</p>
      <h2>不是转移注意力，<br />是把行动权还回来。</h2>
      <p class="lead">此刻的你，大概还有多少力气？</p>
      <div class="energy-row">
        <button class="energy-button${ui.energy === "low" ? " selected" : ""}" type="button" data-energy="low">几乎没有</button>
        <button class="energy-button${ui.energy === "medium" ? " selected" : ""}" type="button" data-energy="medium">还能做一点</button>
        <button class="energy-button${ui.energy === "high" ? " selected" : ""}" type="button" data-energy="high">想认真开始</button>
      </div>
      ${
        !ui.actions
          ? `
            <div class="agent-question" style="margin-top:18px">
              <div class="agent-orb small" aria-hidden="true"></div>
              <span>我会从你确认过的故事里找入口，不给你一份通用习惯清单。</span>
            </div>
            <div class="button-stack">
              <button class="primary-button" type="button" data-action="recommend-actions">生成三个现实入口</button>
            </div>`
          : `
            <div class="action-list">
              ${ui.actions
                .map(
                  (action) => `
                    <article class="action-card">
                      <div>
                        <small>${escapeHtml(action.level)}</small>
                        <strong>${escapeHtml(action.title)}</strong>
                        <p>${escapeHtml(action.description)}</p>
                      </div>
                      <button class="action-select" type="button" data-select-action="${action.id}" aria-label="选择 ${escapeHtml(action.title)}">→</button>
                    </article>`,
                )
                .join("")}
            </div>
            <div class="recommendation-reason">推荐依据：你说，学游泳原本是自己的愿望，后来它总被放到下一次。<br /><span class="source-chip">来源 ev-05 · 林澈已确认</span></div>
            <div class="button-stack" style="margin-top:0">
              <button class="secondary-button" type="button" data-action="replace-actions">这不像我，换一个</button>
            </div>`
      }
    </section>`;
}

function renderProject() {
  const index = session.projectMilestone || 0;
  const day = session.journeyDay || [1, 4, 9, 15, 21][index] || 1;
  const totalDays = session.totalDays || 21;
  const skill = skillPacks[session.selectedSkill || "游泳"] || skillPacks.游泳;
  const activeMilestones = skill.milestones.map((title, i) => ({ title, note: milestones[i]?.note || "这一步由你自己记录。" }));
  const progress = Math.min(100, (day / totalDays) * 100);
  const visibleViews = journeyViews.filter((item) => item.day <= day);
  return `
    <section class="screen">
      <p class="eyebrow">06 · 21-DAY COMPANION</p>
      <div class="journey-head glass-card">
        <div><small>陪伴进行中</small><strong>第 ${day} 天 <i>/ ${totalDays} 天</i></strong></div>
        <span>${escapeHtml(skill.title)}</span>
        <div class="project-progress"><b style="width:${progress}%"></b></div>
      </div>
      <h2>做成一件事，<br />也看见自己怎么变。</h2>
      <div class="feedback-card glass-card">
        <p>这次做完回来，你有什么变化？</p>
        <div class="feedback-row">
          ${["冲动小了一点", "身体松了一点", "没有变化", "今天有点更难受"]
            .map((label) => `<button class="feedback-chip${ui.feedback === label ? " selected" : ""}" type="button" data-feedback="${label}">${label}</button>`)
            .join("")}
        </div>
      </div>
      <div class="project-card glass-card">
        <div class="project-meta"><span>${escapeHtml(skill.title)}</span><span>${index + 1} / ${activeMilestones.length}</span></div>
        <div class="project-progress"><span style="width:${((index + 1) / activeMilestones.length) * 100}%"></span></div>
        <div class="milestone-list">
          ${activeMilestones
            .map(
              (item, milestoneIndex) => `
                <button class="milestone-button${milestoneIndex < index ? " done" : ""}${milestoneIndex === index ? " current" : ""}" type="button" ${milestoneIndex > index ? "disabled" : ""}>
                  <span class="milestone-number">${milestoneIndex < index ? "✓" : milestoneIndex + 1}</span>
                  <span><strong>${item.title}</strong><small>${item.note}</small></span>
                </button>`,
            )
            .join("")}
        </div>
      </div>
      <div class="view-timeline glass-card">
        <div class="project-meta"><span>我现在怎么看 TA</span><span>保留用户原话</span></div>
        ${visibleViews.slice(-3).reverse().map((item, i) => `<div class="view-entry${i === 0 ? " latest" : ""}"><small>第 ${item.day} 天</small><p>${escapeHtml(item.text)}</p></div>`).join("")}
      </div>
      <p class="caveat">以下为合成演示轨迹。情绪“没有变化”不会被标记为失败。</p>
      <div class="button-stack">
        ${day < totalDays ? `<button class="primary-button" type="button" data-action="advance-project">完成记录并跃迁到下一节点</button>` : `<button class="primary-button" type="button" data-action="next-screen">把这件事带向一个真实连接</button>`}
      </div>
    </section>`;
}

function renderPeer() {
  const skill = skillPacks[session.selectedSkill || "游泳"] || skillPacks.游泳;
  return `
    <section class="screen">
      <p class="eyebrow">07 · MEET A PERSON, NOT A LABEL</p>
      <h2>认识一个人，<br />先从同一件事开始。</h2>
      <p class="lead">只有你主动公开的字段，才会进入同行卡。</p>
      <div class="consent-card glass-card">
        <div class="share-row"><span>昵称：林澈</span><label class="toggle"><input type="checkbox" checked data-share /><span></span></label></div>
        <div class="share-row"><span>${escapeHtml(skill.title)}</span><label class="toggle"><input type="checkbox" checked data-share /><span></span></label></div>
        <div class="share-row"><span>希望低压力同行</span><label class="toggle"><input type="checkbox" checked data-share /><span></span></label></div>
        <div class="share-row"><span>不想聊前任细节</span><label class="toggle"><input type="checkbox" checked data-share /><span></span></label></div>
      </div>
      ${
        !ui.peer
          ? `<div class="button-stack"><button class="primary-button" type="button" data-action="find-peer">使用这些字段寻找同行者</button><button class="secondary-button" type="button" data-action="skip-peer">暂时不认识人</button></div>`
          : `
            <article class="peer-card glass-card">
              <div class="peer-avatar" aria-hidden="true">${ui.peer.initials}</div>
              <div><h3>${ui.peer.name}</h3><p>${ui.peer.project} · ${ui.peer.rhythm}</p></div>
              <div class="peer-tags"><span>共同目标：游泳入门</span><span>${ui.peer.boundary}</span><span>合成人物</span></div>
              <p style="grid-column:1/-1;margin:0">${ui.peer.reason}</p>
            </article>
            <p class="caveat">人物与匹配为产品概念演示，不代表已存在真实社交供给。</p>
            <div class="button-stack"><button class="primary-button" type="button" data-action="next-screen">先交换一次泳后感受</button><button class="secondary-button" type="button" data-action="skip-peer">暂时不认识人</button></div>`
      }
      <div class="same-road-feed">
        <p class="eyebrow">同路的人今天做了什么</p>
        <div class="feed-card glass-card"><strong>${escapeHtml(skill.peer)} · 第 12 天</strong><p>今天终于完成了第一小步。没拍给任何人看，只是回来给自己留了一句话。</p><small>合成动态 · 无点赞排行</small></div>
      </div>
    </section>`;
}

function renderClosure() {
  if (ui.closureResult) {
    const summary = ui.closureResult.summary;
    return `
      <section class="screen">
        <p class="eyebrow">08 · CLOSE WITH CHOICE</p>
        <h2>关系 Broke 了，<br />自己重新 UP 起来。</h2>
        <div class="closure-message">${escapeHtml(ui.closureResult.message)}</div>
        <div class="summary-grid">
          <div class="summary-item"><small>你看清了什么</small><strong>${escapeHtml(summary.understood)}</strong></div>
          <div class="summary-item"><small>你完成了什么</small><strong>${escapeHtml(summary.completed)}</strong></div>
          <div class="summary-item"><small>你重新认识了谁</small><strong>${escapeHtml(summary.connected)}</strong></div>
          <div class="summary-item"><small>下一次反扑</small><strong>${escapeHtml(summary.next)}</strong></div>
        </div>
        <div class="closure-logo"><img src="./assets/broke-up-logo-transparent.png" alt="" /><span>Broke UP 将关闭每日提醒，把主动权留给你。</span></div>
        <div class="button-stack">
          <button class="primary-button" type="button" data-action="archive-take">带走关系手帐</button>
          <button class="secondary-button" type="button" data-action="archive-delete">删除这次演示资料</button>
          <button class="text-button" type="button" data-action="archive-return">偶尔回来</button>
        </div>
      </section>`;
  }

  if (ui.closureStage === "ask") {
    return `
      <section class="screen closure-center">
        <p class="eyebrow">DAY ${session.journeyDay || 21} · NO RIGHT ANSWER</p>
        <h2>你觉得，<br />自己放下 TA 了吗？</h2>
        <p class="lead">答案不会被记成成绩，也不会改变我对你的判断。</p>
        <div class="readiness-card glass-card"><span>这不是毕业考试</span><p>“还没有”只意味着我们再走一小段，不代表前 21 天白走了。</p></div>
        <div class="button-stack">
          <button class="primary-button" type="button" data-action="closure-ready">是，我想往前走了</button>
          <button class="secondary-button" type="button" data-action="closure-extend">还想再适应一段时间</button>
        </div>
      </section>`;
  }

  if (ui.closureStage === "extended") {
    return `
      <section class="screen closure-center">
        <p class="eyebrow">＋5 DAYS · NOT A FAILURE</p>
        <h2>好。那我们再走五天。</h2>
        <p class="lead">对话与现实项目照常，我会减少主动出现。五天后再问同一个问题。</p>
        <div class="build-list glass-card"><span>✓ 不清零进度</span><span>✓ 不增加催促</span><span>✓ 你随时可以主动结束</span></div>
        <div class="button-stack"><button class="primary-button" type="button" data-action="closure-fastforward">演示：快进五天</button></div>
      </section>`;
  }

  if (ui.closureStage === "invite") {
    return `
      <section class="screen">
        <h2>最后，<br />有一通电话。</h2>
        <p class="lead">它不是为了替你做决定。只是有些话，值得留到你准备好了再听见。</p>
        <div class="invite-card glass-card"><div class="profile-avatar">周</div><div><strong>周屿</strong><small>来电 · 此刻</small></div><p>你愿意接吗？</p></div>
        <div class="button-stack">
          <button class="primary-button" type="button" data-action="call-start">接听</button>
          <button class="secondary-button" type="button" data-closure="leave">把电话留在这里</button>
          <button class="text-button" type="button" data-closure="later">以后再说</button>
        </div>
      </section>`;
  }

  if (ui.closureStage === "ringing") {
    return `
      <section class="screen call-screen">
        <div class="simulation-tag">一段关系，正在回声里</div>
        <div class="call-orbit" aria-hidden="true"><span>周屿</span></div>
        <h2>关系号码来电</h2><p class="lead">不接不代表你没有走出来。</p>
        <div class="call-actions"><button type="button" class="decline-call" data-action="call-decline">×<small>不接</small></button><button type="button" class="answer-call" data-action="call-answer">✓<small>接通</small></button></div>
      </section>`;
  }

  if (ui.closureStage === "talking") {
    const lines = ["喂……是你啊。", "那天我说不想耽误你，其实是我不敢把话说完。", "对不起。也谢谢你，把那三年过得那么认真。"];
    return `
      <section class="screen call-screen talking">
        <div class="simulation-tag">你们没说完的话，正在被慢慢听见</div>
        <div class="profile-avatar">周</div><strong>周屿</strong><small>通话中 · 00:${String(12 + ui.callLine * 5).padStart(2, "0")}</small>
        <div class="call-transcript">${lines.slice(0, ui.callLine + 1).map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>
        <div class="button-stack"><button class="primary-button" type="button" data-action="call-next">${ui.callLine >= lines.length - 1 ? "结束通话，看看这段路" : "继续听"}</button><button class="text-button" type="button" data-action="call-end">随时挂断</button></div>
      </section>`;
  }

  return `
    <section class="screen memory-reel">
      <p class="eyebrow">YOUR ${session.totalDays || 21} DAYS</p>
      <h2>这段不是关于 TA，<br />是关于你走回来的路。</h2>
      <div class="reel-card"><small>第 1 天</small><p>你只想知道，他为什么没有把话说完。</p></div>
      <div class="reel-card warm"><small>第 9 天</small><p>第一次下水。有二十分钟，你没有想起任何人。</p></div>
      <div class="reel-card mint"><small>今天</small><p>他仍是故事的重要部分，只是不再是你每天的问题。</p></div>
      <p class="caveat">合成分镜演示 · 只使用用户确认过的内容</p>
      <div class="button-stack"><button class="primary-button" type="button" data-closure="practice">生成结案卡</button></div>
    </section>`;
}

async function goToScreen(next, persist = true) {
  const clamped = Math.max(0, Math.min(chapters.length - 1, next));
  ui.screen = clamped;
  if (clamped !== 0) ui.echoStep = Math.max(ui.echoStep, 2);
  if (clamped === 7 && !ui.closureResult) {
    session.journeyDay = Math.max(session.journeyDay || 1, session.totalDays || 21);
    ui.closureStage = "ask";
  }
  render();
  if (persist && session && !ui.offlineFallback) {
    request(`/api/session/${encodeURIComponent(session.sessionId)}`, {
      method: "PATCH",
      body: JSON.stringify({ currentScreen: clamped }),
    }).catch(() => {});
  }
}

async function handleAction(action, target) {
  if (ui.busy) return;

  if (action === "consent-start") {
    session.consent = true;
    persistSessionFields({ consent: true });
    return goToScreen(1);
  }
  if (action === "save-profile") {
    session.exProfile = {
      ...(session.exProfile || {}),
      name: document.getElementById("exName")?.value.trim() || "周屿",
      handle: document.getElementById("exHandle")?.value.trim() || "",
      breakupReason: session.exProfile?.breakupReason || "还没想清楚",
      hobbies: session.exProfile?.hobbies || "摄影、长跑、深夜播客",
    };
    ui.storyStage = "choose";
    persistSessionFields({ exProfile: session.exProfile });
    return render();
  }
  if (action === "voice-next") {
    ui.voiceTurn += 1;
    if (ui.voiceTurn === 3) {
      ui.checkpointTurn = 3;
      ui.pausedAtCheckpoint = false;
      ui.storyStage = "checkpoint";
    } else if (ui.voiceTurn >= voiceTurns.length) {
      ui.storyStage = "building";
    }
    return render();
  }
  if (action === "checkpoint-continue") {
    ui.pausedAtCheckpoint = false;
    ui.storyStage = ui.storyMode || "qa";
    return render();
  }
  if (action === "checkpoint-pause") {
    if (!ui.pausedAtCheckpoint) {
      ui.pausedAtCheckpoint = true;
      return render();
    }
    showToast("已经记到这里。下次会从“我还想知道”继续。");
    return goToScreen(0);
  }
  if (action === "story-pause") {
    ui.checkpointTurn = Math.max(session.storyTurn || 0, 1);
    ui.pausedAtCheckpoint = true;
    ui.storyStage = "checkpoint";
    return render();
  }
  if (action === "switch-qa") {
    ui.storyMode = "qa";
    ui.storyStage = "qa";
    session.entryMode = "qa";
    persistSessionFields({ entryMode: "qa" });
    return render();
  }
  if (action === "finish-building") {
    if (ui.storyMode === "voice") session.storyTurn = storyQuestions.length;
    ui.archiveStage = "map";
    persistSessionFields({ storyTurn: session.storyTurn });
    return goToScreen(2);
  }
  if (action === "portrait-ready") {
    ui.archiveStage = "transition";
    return render();
  }
  if (action === "transition-back") {
    ui.archiveStage = "map";
    return render();
  }
  if (action === "start-companion") {
    session.companionStarted = true;
    session.supportMode = "REDIRECT";
    persistSessionFields({ companionStarted: true, supportMode: "REDIRECT" });
    return goToScreen(3);
  }
  if (action === "portrait-more") {
    ui.storyMode = "qa";
    ui.storyStage = "qa";
    session.storyTurn = Math.min(session.storyTurn || 0, storyQuestions.length - 1);
    return goToScreen(1);
  }
  if (action === "journal-add") {
    ui.storyMode = "qa";
    ui.storyStage = "qa";
    session.storyTurn = storyQuestions.length - 1;
    return goToScreen(1);
  }
  if (action === "next-screen") return goToScreen(ui.screen + 1);
  if (action === "story-restart") {
    session.storyTurn = 2;
    return render();
  }
  if (action === "toggle-record") {
    const button = document.getElementById("recordButton");
    button?.classList.toggle("recording");
    showToast(button?.classList.contains("recording") ? "正在听你说…" : "这段话已经整理成文字草稿。");
    return;
  }
  if (action === "submit-story") return submitStory();
  if (action === "analyze-clue") return analyzeClue();
  if (action === "recommend-actions") return recommendActions();
  if (action === "replace-actions") {
    ui.actions = [...actionFallback].reverse();
    showToast("已换一组顺序；真实产品会根据你的拒绝继续调整。");
    return render();
  }
  if (action === "advance-project") return advanceProject();
  if (action === "find-peer") return findPeer();
  if (action === "skip-peer") {
    showToast("暂时不认识人也可以。真人连接不是毕业条件。");
    return goToScreen(7);
  }
  if (action === "closure-ready") {
    ui.closureStage = "invite";
    return render();
  }
  if (action === "closure-extend") {
    ui.closureStage = "extended";
    session.extensions = (session.extensions || 0) + 1;
    session.totalDays = (session.totalDays || 21) + 5;
    persistSessionFields({ extensions: session.extensions, totalDays: session.totalDays });
    return render();
  }
  if (action === "closure-fastforward") {
    session.journeyDay = session.totalDays;
    ui.closureStage = "ask";
    persistSessionFields({ journeyDay: session.journeyDay });
    return render();
  }
  if (action === "call-start") {
    ui.closureStage = "ringing";
    return render();
  }
  if (action === "call-decline") return closeJourney("leave");
  if (action === "call-answer") {
    ui.closureStage = "talking";
    ui.callLine = 0;
    return render();
  }
  if (action === "call-next") {
    if (ui.callLine < 2) ui.callLine += 1;
    else ui.closureStage = "video";
    return render();
  }
  if (action === "call-end") {
    ui.closureStage = "video";
    return render();
  }
  if (action === "archive-take") return showToast("演示手帐已生成。正式产品会提供可导出的私人档案。");
  if (action === "archive-delete") {
    showToast("演示资料已清除，即将回到起点。");
    return setTimeout(() => resetSession(false), 850);
  }
  if (action === "archive-return") return showToast("Broke UP 会留在背景，不再主动占用你的生活。");
}

function persistSessionFields(fields) {
  if (!session || ui.offlineFallback) return;
  request(`/api/session/${encodeURIComponent(session.sessionId)}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  }).catch(() => {});
}

async function submitStory() {
  const input = document.getElementById("storyInput");
  const answer = String(input?.value || ui.selectedAnswer).trim();
  if (!answer) return showToast("先说一个具体细节，或者选择上面的示例回答。");
  ui.selectedAnswer = "";
  ui.busy = true;
  screenHost.innerHTML = loadingMarkup("正在接住这一句，并寻找下一个关键问题…");
  try {
    if (ui.offlineFallback) {
      await new Promise((resolve) => setTimeout(resolve, 520));
      session.storyAnswers.push(answer);
      session.storyTurn = Math.min((session.storyTurn || 0) + 1, storyQuestions.length);
    } else {
      const data = await request("/api/story/turn", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId, answer }),
      });
      session = data.session;
    }
  } catch {
    session.storyAnswers.push(answer);
    session.storyTurn = Math.min((session.storyTurn || 0) + 1, storyQuestions.length);
    ui.offlineFallback = true;
    showToast("接口未响应，已使用明确标注的演示兜底。");
  }
  ui.busy = false;
  if ([3, 6].includes(session.storyTurn)) {
    ui.checkpointTurn = session.storyTurn;
    ui.pausedAtCheckpoint = false;
    ui.storyStage = "checkpoint";
  } else if (session.storyTurn >= storyQuestions.length) {
    ui.storyStage = "building";
  }
  render();
}

async function analyzeClue() {
  const input = document.getElementById("clueInput");
  if (input?.value.trim()) ui.clueText = input.value.trim();
  ui.busy = true;
  screenHost.innerHTML = loadingMarkup("正在把事实、解释和未知分开…");
  try {
    if (ui.offlineFallback) {
      await new Promise((resolve) => setTimeout(resolve, 560));
      session.clueAnalysis = structuredClone(fallbackClue);
    } else {
      const data = await request("/api/clue/analyze", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId, clue: ui.clueText }),
      });
      session = data.session;
      session.clueAnalysis = data.analysis;
    }
  } catch {
    session.clueAnalysis = structuredClone(fallbackClue);
    ui.offlineFallback = true;
  }
  ui.busy = false;
  render();
}

async function recommendActions() {
  ui.busy = true;
  screenHost.innerHTML = loadingMarkup("正在从被搁置的自己里寻找现实入口…");
  try {
    if (ui.offlineFallback) {
      await new Promise((resolve) => setTimeout(resolve, 520));
      ui.actions = structuredClone(actionFallback);
    } else {
      const data = await request("/api/actions/recommend", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId, energy: ui.energy }),
      });
      session = data.session;
      ui.actions = data.actions;
    }
  } catch {
    ui.actions = structuredClone(actionFallback);
    ui.offlineFallback = true;
  }
  ui.busy = false;
  render();
}

async function advanceProject() {
  ui.busy = true;
  screenHost.innerHTML = loadingMarkup("正在把这一次完成写进现实轨迹…");
  try {
    if (ui.offlineFallback) {
      await new Promise((resolve) => setTimeout(resolve, 480));
      session.projectMilestone = Math.min((session.projectMilestone || 0) + 1, milestones.length - 1);
      session.journeyDay = [1, 4, 9, 15, 21][session.projectMilestone] || session.totalDays || 21;
    } else {
      const data = await request("/api/project/advance", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId, selectedAction: session.selectedAction || "action-project", feedback: ui.feedback || "没有变化" }),
      });
      session = data.session;
    }
  } catch {
    session.projectMilestone = Math.min((session.projectMilestone || 0) + 1, milestones.length - 1);
    ui.offlineFallback = true;
  }
  ui.busy = false;
  render();
}

async function findPeer() {
  const checked = [...document.querySelectorAll("[data-share]")].filter((input) => input.checked).length;
  if (!checked) return showToast("至少选择一个你愿意公开的字段。");
  ui.busy = true;
  screenHost.innerHTML = loadingMarkup("正在按现实目标与边界寻找同行者…");
  try {
    if (ui.offlineFallback) {
      await new Promise((resolve) => setTimeout(resolve, 520));
      const skill = skillPacks[session.selectedSkill || "游泳"] || skillPacks.游泳;
      ui.peer = { name: skill.peer, initials: skill.peer.slice(0, 2), project: skill.title, rhythm: "每周互相提醒一次", boundary: "不以分手细节作为开场白", reason: "你们正在做同一件事，也都选择了低压力同行。" };
    } else {
      const data = await request("/api/peer/match", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId, consent: true }),
      });
      session = data.session;
      ui.peer = data.candidate;
    }
  } catch {
    const skill = skillPacks[session.selectedSkill || "游泳"] || skillPacks.游泳;
    ui.peer = { name: skill.peer, initials: skill.peer.slice(0, 2), project: skill.title, rhythm: "每周互相提醒一次", boundary: "不以分手细节作为开场白", reason: "你们正在做同一件事，也都选择了低压力同行。" };
    ui.offlineFallback = true;
  }
  ui.busy = false;
  render();
}

async function closeJourney(choice) {
  ui.busy = true;
  screenHost.innerHTML = loadingMarkup("正在把主动权和这段手帐交还给你…");
  try {
    if (ui.offlineFallback) {
      await new Promise((resolve) => setTimeout(resolve, 520));
      ui.closureResult = {
        message: choice === "leave" ? "不拨，也是一种选择。你不需要向任何人证明自己已经放下。" : choice === "later" ? "以后再说也可以。准备好不是一项必须完成的证明。" : "你把没说完的话，留在了这一段关系回声里。",
        summary: {
          understood: "保留与联系不是同一件事，未知仍然可以是未知。",
          completed: "从泳池踩点，到完成属于自己的 500 米。",
          connected: "认识了一个围绕现实行动同行的人。",
          next: "下一次反扑时，先把十分钟还给现实。",
        },
      };
    } else {
      const data = await request("/api/closure", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId, choice }),
      });
      session = data.session;
      ui.closureResult = data;
    }
  } catch {
    ui.offlineFallback = true;
    return closeJourney(choice);
  }
  ui.busy = false;
  render();
}

function openEvidence(id) {
  const item = (session.evidence || fallbackEvidence).find((entry) => entry.id === id);
  if (!item) return showToast("这条证据暂时不可用。");
  ui.selectedEvidenceId = id;
  document.getElementById("evidenceType").textContent = item.category === "unknown" ? "UNKNOWN · 当前无法判断" : "RELATIONSHIP EVIDENCE";
  document.getElementById("evidenceTitle").textContent = item.title;
  document.getElementById("evidenceSource").textContent = item.source;
  document.getElementById("evidenceDetail").value = item.detail;
  evidenceModal.showModal();
}

async function updateEvidence(action) {
  const id = ui.selectedEvidenceId;
  const item = session.evidence.find((entry) => entry.id === id);
  if (!item) return;
  const detail = document.getElementById("evidenceDetail").value.trim();
  if (action === "hide") item.status = "hidden";
  if (action === "edit") {
    if (!detail) return showToast("内容不能为空。");
    item.detail = detail;
    item.status = "confirmed";
  }
  if (!ui.offlineFallback) {
    try {
      await request(`/api/evidence/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ sessionId: session.sessionId, action, detail }),
      });
    } catch {
      ui.offlineFallback = true;
    }
  }
  evidenceModal.close();
  render();
  showToast(action === "hide" ? "这条内容已隐藏，不再用于后续推荐。" : "修改已确认，后续只引用这个版本。");
}

screenHost.addEventListener("click", async (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget) return handleAction(actionTarget.dataset.action, actionTarget);

  const entryTarget = event.target.closest("[data-entry]");
  if (entryTarget) {
    ui.storyMode = entryTarget.dataset.entry;
    ui.storyStage = ui.storyMode;
    session.entryMode = ui.storyMode;
    persistSessionFields({ entryMode: ui.storyMode });
    return render();
  }

  const reasonTarget = event.target.closest("[data-profile-reason]");
  if (reasonTarget) {
    session.exProfile = { ...(session.exProfile || {}), breakupReason: reasonTarget.dataset.profileReason };
    screenHost.querySelectorAll("[data-profile-reason]").forEach((button) => button.classList.toggle("selected", button === reasonTarget));
    return;
  }

  const hobbyTarget = event.target.closest("[data-profile-hobby]");
  if (hobbyTarget) {
    hobbyTarget.classList.toggle("selected");
    const selected = [...screenHost.querySelectorAll("[data-profile-hobby].selected")].map((button) => button.dataset.profileHobby);
    session.exProfile = { ...(session.exProfile || {}), hobbies: selected.join("、") };
    return;
  }

  const cluePreset = event.target.closest("[data-clue-preset]");
  if (cluePreset) {
    ui.clueText = cluePreset.dataset.cluePreset;
    session.clueAnalysis = null;
    return render();
  }

  const answerTarget = event.target.closest("[data-answer]");
  if (answerTarget) {
    ui.selectedAnswer = answerTarget.dataset.answer;
    return render();
  }

  const tabTarget = event.target.closest("[data-tab]");
  if (tabTarget) {
    ui.selectedEvidenceTab = tabTarget.dataset.tab;
    return render();
  }

  const evidenceTarget = event.target.closest("[data-evidence]");
  if (evidenceTarget) return openEvidence(evidenceTarget.dataset.evidence);

  const energyTarget = event.target.closest("[data-energy]");
  if (energyTarget) {
    ui.energy = energyTarget.dataset.energy;
    ui.actions = null;
    return render();
  }

  const actionSelect = event.target.closest("[data-select-action]");
  if (actionSelect) {
    session.selectedAction = actionSelect.dataset.selectAction;
    if (session.selectedAction === "action-project") session.selectedSkill = session.selectedSkill || "游泳";
    showToast("已选择。先从一次低成本尝试开始，不要求立即承诺四周。");
    return goToScreen(5);
  }

  const feedbackTarget = event.target.closest("[data-feedback]");
  if (feedbackTarget) {
    ui.feedback = feedbackTarget.dataset.feedback;
    showToast(ui.feedback === "没有变化" ? "没有变化也是真实反馈，不会被判定为失败。" : "这条反馈会影响下一次推荐。 ");
    return render();
  }

  const closureTarget = event.target.closest("[data-closure]");
  if (closureTarget) return closeJourney(closureTarget.dataset.closure);
});

phaseTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-phase-tab]");
  if (!button) return;
  const target = {
    chat: 3,
    habit: session.selectedAction ? 5 : 4,
    peer: 6,
    journal: 2,
  }[button.dataset.phaseTab];
  if (button.dataset.phaseTab === "journal") ui.archiveStage = "map";
  goToScreen(target);
});

chapterList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-jump]");
  if (!button) return;
  goToScreen(Number(button.dataset.jump));
});

backButton.addEventListener("click", () => {
  if (ui.screen === 0 && ui.echoStep > 0) {
    ui.echoStep -= 1;
    render();
  } else {
    goToScreen(ui.screen - 1);
  }
});

document.getElementById("brandButton").addEventListener("click", () => goToScreen(0));
document.getElementById("demoButton").addEventListener("click", () => demoModal.showModal());
document.getElementById("resetButton").addEventListener("click", () => resetSession());
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => infoModal.close()));
document.querySelectorAll("[data-close-demo]").forEach((button) => button.addEventListener("click", () => demoModal.close()));
demoModal.addEventListener("click", (event) => {
  const day = event.target.closest("[data-demo-day]");
  if (day) {
    session.journeyDay = Number(day.dataset.demoDay);
    session.projectMilestone = session.journeyDay >= 20 ? 3 : session.journeyDay >= 15 ? 2 : session.journeyDay >= 9 ? 1 : 0;
    persistSessionFields({ journeyDay: session.journeyDay, projectMilestone: session.projectMilestone });
    demoModal.close();
    goToScreen(session.journeyDay >= 21 ? 7 : 5);
    return;
  }
  const skill = event.target.closest("[data-demo-skill]");
  if (skill) {
    session.selectedSkill = skill.dataset.demoSkill;
    persistSessionFields({ selectedSkill: session.selectedSkill });
    demoModal.close();
    goToScreen(5);
    return;
  }
  if (event.target.closest("[data-demo-reset]")) {
    demoModal.close();
    resetSession();
  }
});
document.getElementById("saveEvidence").addEventListener("click", () => updateEvidence("edit"));
document.getElementById("hideEvidence").addEventListener("click", () => updateEvidence("hide"));

window.addEventListener("keydown", (event) => {
  const editing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (editing) return;
  if (event.key === "ArrowRight") goToScreen(ui.screen + 1);
  if (event.key === "ArrowLeft") goToScreen(ui.screen - 1);
  if (event.key.toLowerCase() === "r") resetSession();
});

initialize();
