import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.BROKEUP_API_PORT || 8787);
const sessions = new Map();

const evidenceSeed = [
  {
    id: "ev-01",
    category: "fact",
    title: "分手发生在凌晨一点",
    detail: "周屿在手机上发了四行字，没有当面告别。",
    source: "讲述第 1 轮｜林澈确认",
    status: "confirmed",
  },
  {
    id: "ev-02",
    category: "view",
    title: "林澈觉得自己没有被认真告别",
    detail: "这是林澈对那四行字的感受，不是对周屿动机的判断。",
    source: "讲述第 2 轮｜用户视角",
    status: "confirmed",
  },
  {
    id: "ev-03",
    category: "model",
    title: "冲突出现时，周屿常先结束对话",
    detail: "这是根据三次事件形成的候选模式，仍可被修改或反对。",
    source: "事件 06、09、12｜模型候选",
    status: "candidate",
  },
  {
    id: "ev-04",
    category: "unknown",
    title: "周屿现在是否希望复合",
    detail: "目前没有直接联系或其他足够证据，无法判断。",
    source: "证据不足",
    status: "unknown",
  },
  {
    id: "ev-05",
    category: "self",
    title: "被搁置的自己：学会游泳",
    detail: "恋爱以前就想学，后来总把周末留给关系。",
    source: "讲述第 3 轮｜林澈确认",
    status: "confirmed",
  },
  {
    id: "ev-06",
    category: "self",
    title: "被搁置的自己：回到读书会",
    detail: "不为了疗愈打卡，只是重新拥有一个属于自己的晚上。",
    source: "关系档案｜林澈确认",
    status: "confirmed",
  },
];

const storyQuestions = [
  "你们最后一次见面，TA 离开前做了什么？",
  "现在最容易突然想起 TA 的，是一天里的什么时候？",
  "TA 有哪个很普通的小习惯，你最近还会下意识等着？",
  "你第一次意识到你们可能回不到从前，是哪一件小事？",
  "你们反复绕不开的那件事，通常从哪一句话开始？",
  "那一次，你真正希望 TA 做的是什么？",
  "谈恋爱以前，你的周末通常会留给什么？",
  "有哪件你一直想学的事，后来总被放到“下一次”？",
  "如果先拿回生活里很小的一块，你最想从哪里开始？",
];

const clueAnalysis = {
  source: "fixture",
  fact: "京都清单仍然存在；周屿没有直接联系你。",
  interpretations: [
    "它可能只是没有被整理的旧资料。",
    "他也可能保留了这段经历，但这不等于希望复合。",
  ],
  unknown: "仅凭这份清单，无法判断他是否在等你联系。",
  loop: "继续刷新这个线索，不会增加确定性。",
  evidenceRefs: ["ev-01", "ev-04"],
};

function buildClueAnalysis(rawClue) {
  const clue = String(rawClue || "").trim();
  if (clue.includes("点赞") || clue.includes("动态")) {
    return {
      source: "fixture",
      fact: "周屿给这条动态点了赞；没有留言，也没有直接联系你。",
      interpretations: ["他可能只是顺手浏览并点赞。", "他也可能仍然关注你的近况，但关注不等于想复合。"],
      unknown: "仅凭一次点赞，无法判断他的关系意图。",
      loop: "反复查看点赞列表，不会产生新的证据。",
      evidenceRefs: ["ev-03", "ev-04"],
    };
  }
  if (clue.includes("联系")) {
    return {
      source: "fixture",
      fact: "你此刻很想联系他；到目前为止，这条消息还没有发出。",
      interpretations: ["你可能在寻找一个结束感。", "你也可能只是希望今晚有人接住你。"],
      unknown: "现在无法确定联系后会得到怎样的回应。",
      loop: "先把想说的话写在这里，20 分钟后再决定是否发送。",
      evidenceRefs: ["ev-02", "ev-04"],
    };
  }
  if (clue.includes("什么都不想做") || clue.includes("没力气")) {
    return {
      source: "fixture",
      fact: "你描述今天没有行动能量，也不想被催着振作。",
      interpretations: ["这可能是一次情绪反扑。", "也可能只是身体和注意力都已经很累。"],
      unknown: "一次低能量状态不能说明你正在倒退。",
      loop: "今天的行动可以降到最低；没有完成也不算失败。",
      evidenceRefs: ["ev-02", "ev-05"],
    };
  }
  return structuredClone(clueAnalysis);
}

const actions = [
  {
    id: "action-90s",
    level: "90 秒",
    title: "把想发的话存下，不发送",
    description: "先让冲动有地方落下，不要求自己立刻想通。",
    energy: "low",
    sourceRef: "ev-05",
  },
  {
    id: "action-20m",
    level: "20 分钟",
    title: "看看附近泳池的开放时间",
    description: "不用马上下水，只把这件事从“以后”带到今天。",
    energy: "medium",
    sourceRef: "ev-05",
  },
  {
    id: "action-project",
    level: "四周项目",
    title: "把游泳入门还给自己",
    description: "从踩点开始，完成一次属于自己的 500 米。",
    energy: "high",
    sourceRef: "ev-05",
  },
];

const projectMilestones = [
  { title: "去泳池踩点", note: "我只是去看了一眼，没有逼自己下水。" },
  { title: "第一次下水", note: "紧张没有消失，但我完成了第一节课。" },
  { title: "连续游 200 米", note: "我开始愿意为自己的周末做安排。" },
  { title: "完成 500 米", note: "这不是忘掉谁，是我重新拥有了一件事。" },
];

function createSession() {
  const session = {
    sessionId: randomUUID(),
    currentScreen: 0,
    consent: false,
    storyTurn: 0,
    storyAnswers: [],
    evidence: structuredClone(evidenceSeed),
    clueAnalysis: null,
    selectedAction: null,
    energy: "medium",
    projectMilestone: 0,
    peerConsent: false,
    closureChoice: null,
    supportMode: "UNDERSTAND",
    exProfile: {
      name: "周屿",
      handle: "@island_zhou",
      breakupReason: "他说不想耽误我",
      hobbies: "摄影、长跑、深夜播客",
    },
    entryMode: "",
    journeyDay: 1,
    totalDays: 21,
    extensions: 0,
    selectedSkill: "游泳",
    checkins: [],
    companionStarted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sessions.set(session.sessionId, session);
  return session;
}

function send(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function getSession(id) {
  return sessions.get(id);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("invalid_json");
  }
}

function touch(session) {
  session.updatedAt = new Date().toISOString();
  return session;
}

function pause(pathname) {
  const base = pathname.length * 29;
  return new Promise((resolve) => setTimeout(resolve, 420 + (base % 330)));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname;

  try {
    if (req.method === "GET" && path === "/api/health") {
      return send(res, 200, { ok: true, product: "Broke UP", mode: "synthetic-demo" });
    }

    if (req.method === "POST" && path === "/api/session/reset") {
      await pause(path);
      return send(res, 201, { session: createSession(), source: "fixture" });
    }

    const sessionMatch = path.match(/^\/api\/session\/([^/]+)$/);
    if (sessionMatch && req.method === "GET") {
      const session = getSession(sessionMatch[1]);
      return session
        ? send(res, 200, { session, source: "fixture" })
        : send(res, 404, { error: "session_not_found" });
    }
    if (sessionMatch && req.method === "PATCH") {
      const session = getSession(sessionMatch[1]);
      if (!session) return send(res, 404, { error: "session_not_found" });
      const body = await readBody(req);
      if (Number.isInteger(body.currentScreen)) {
        session.currentScreen = Math.max(0, Math.min(7, body.currentScreen));
      }
      if (typeof body.consent === "boolean") session.consent = body.consent;
      if (typeof body.companionStarted === "boolean") session.companionStarted = body.companionStarted;
      if (body.exProfile && typeof body.exProfile === "object") session.exProfile = { ...session.exProfile, ...body.exProfile };
      if (["voice", "qa", ""].includes(body.entryMode)) session.entryMode = body.entryMode;
      if (Number.isInteger(body.journeyDay)) session.journeyDay = Math.max(1, Math.min(40, body.journeyDay));
      if (Number.isInteger(body.totalDays)) session.totalDays = Math.max(21, Math.min(40, body.totalDays));
      if (Number.isInteger(body.extensions)) session.extensions = Math.max(0, Math.min(3, body.extensions));
      if (["游泳", "读书", "攀岩", "滑雪"].includes(body.selectedSkill)) session.selectedSkill = body.selectedSkill;
      if (Number.isInteger(body.projectMilestone)) session.projectMilestone = Math.max(0, Math.min(3, body.projectMilestone));
      if (Number.isInteger(body.storyTurn)) session.storyTurn = Math.max(0, Math.min(storyQuestions.length, body.storyTurn));
      if (["UNDERSTAND", "REDIRECT", "WITNESS", "EXIT"].includes(body.supportMode)) session.supportMode = body.supportMode;
      return send(res, 200, { session: touch(session), source: "fixture" });
    }

    const body = await readBody(req);
    const session = getSession(body.sessionId);
    if (!session) return send(res, 404, { error: "session_not_found" });
    await pause(path);

    if (req.method === "POST" && path === "/api/story/turn") {
      const answer = String(body.answer || "").trim();
      if (answer) session.storyAnswers.push(answer);
      session.storyTurn = Math.min(session.storyTurn + 1, storyQuestions.length);
      session.currentScreen = 1;
      const nextQuestion = storyQuestions[session.storyTurn] || null;
      return send(res, 200, {
        turn: session.storyTurn,
        nextQuestion,
        completed: !nextQuestion,
        memoryStatus: answer ? "已记住 · 待确认" : "已跳过 · 可以继续",
        session: touch(session),
        source: "fixture",
      });
    }

    const evidenceMatch = path.match(/^\/api\/evidence\/([^/]+)$/);
    if (req.method === "PATCH" && evidenceMatch) {
      const item = session.evidence.find((entry) => entry.id === evidenceMatch[1]);
      if (!item) return send(res, 404, { error: "evidence_not_found" });
      if (body.action === "confirm") item.status = "confirmed";
      if (body.action === "hide") item.status = "hidden";
      if (body.action === "edit" && String(body.detail || "").trim()) {
        item.detail = String(body.detail).trim();
        item.status = "confirmed";
      }
      return send(res, 200, { evidence: item, session: touch(session), source: "fixture" });
    }

    if (req.method === "POST" && path === "/api/clue/analyze") {
      session.clueAnalysis = buildClueAnalysis(body.clue);
      session.currentScreen = 3;
      session.supportMode = "REDIRECT";
      return send(res, 200, { analysis: session.clueAnalysis, session: touch(session) });
    }

    if (req.method === "POST" && path === "/api/actions/recommend") {
      session.energy = ["low", "medium", "high"].includes(body.energy) ? body.energy : "medium";
      session.currentScreen = 4;
      return send(res, 200, {
        actions,
        rationale: "你说，学游泳原本是自己的愿望，后来它总被放到下一次。",
        evidenceRef: "ev-05",
        session: touch(session),
        source: "fixture",
      });
    }

    if (req.method === "POST" && path === "/api/project/advance") {
      if (body.selectedAction) session.selectedAction = body.selectedAction;
      if (body.feedback) session.actionFeedback = String(body.feedback);
      session.projectMilestone = Math.min(session.projectMilestone + 1, projectMilestones.length - 1);
      session.journeyDay = [1, 4, 9, 15, 21][session.projectMilestone] || session.totalDays;
      session.checkins.unshift({
        day: session.journeyDay,
        feedback: String(body.feedback || "没有变化"),
        viewOfEx: [
          "我还是想知道，他为什么没有把话说完。",
          "我大部分时间仍在想他，但今天完成了现实里的一小步。",
          "他的回避是他的方式，不等于我要继续等一个答案。",
          "他是故事的重要部分，但不再是我每天的问题。",
        ][session.projectMilestone],
      });
      session.currentScreen = 5;
      session.supportMode = session.projectMilestone >= 2 ? "WITNESS" : "REDIRECT";
      return send(res, 200, {
        milestone: projectMilestones[session.projectMilestone],
        index: session.projectMilestone,
        total: projectMilestones.length,
        session: touch(session),
        source: "fixture",
      });
    }

    if (req.method === "POST" && path === "/api/peer/match") {
      session.peerConsent = Boolean(body.consent);
      session.currentScreen = 6;
      const peerBySkill = {
        游泳: ["南乔", "NQ", "四周游泳入门"],
        读书: ["林一", "LY", "四周读书重启"],
        攀岩: ["阿蒙", "AM", "四周攀岩入门"],
        滑雪: ["小满", "XM", "四周滑雪入门"],
      };
      const peer = peerBySkill[session.selectedSkill] || peerBySkill.游泳;
      return send(res, 200, {
        candidate: session.peerConsent
          ? {
              name: peer[0],
              initials: peer[1],
              project: peer[2],
              rhythm: "每周互相提醒一次",
              boundary: "不以分手细节作为开场白",
              reason: "你们正在做同一件事，也都选择了低压力同行。",
            }
          : null,
        session: touch(session),
        source: "fixture",
      });
    }

    if (req.method === "POST" && path === "/api/closure") {
      session.closureChoice = ["practice", "leave", "later"].includes(body.choice)
        ? body.choice
        : "leave";
      session.currentScreen = 7;
      session.supportMode = "EXIT";
      const completionBySkill = {
        游泳: ["从泳池踩点，到完成属于自己的 500 米。", "认识了南乔，一个围绕游泳同行的人。"],
        读书: ["从拆开一本书，到重新读完两本。", "认识了林一，一个愿意交换摘抄的人。"],
        攀岩: ["从岩馆踩点，到完成第一次登顶。", "认识了阿蒙，一个专注当下的攀岩同行者。"],
        滑雪: ["从试穿装备，到独立滑完一整天。", "认识了小满，一个从初级道开始的同行者。"],
      };
      const completion = completionBySkill[session.selectedSkill] || completionBySkill.游泳;
      return send(res, 200, {
        message:
          session.closureChoice === "leave"
            ? "不拨，也是一种选择。你不需要向任何人证明自己已经放下。"
            : session.closureChoice === "later"
              ? "以后再说也可以。准备好不是一项必须完成的证明。"
              : "你把没说完的话，留在了这一段关系回声里。",
        summary: {
          understood: "保留与联系不是同一件事，未知仍然可以是未知。",
          completed: completion[0],
          connected: session.peerConsent ? completion[1] : "这次没有认识新的人；真人连接不是毕业条件。",
          next: "下一次反扑时，先把十分钟还给现实。",
        },
        session: touch(session),
        source: "fixture",
      });
    }

    return send(res, 404, { error: "route_not_found" });
  } catch (error) {
    return send(res, error.message === "invalid_json" ? 400 : 500, {
      error: error.message === "invalid_json" ? "invalid_json" : "demo_server_error",
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Broke UP mock API: http://0.0.0.0:${PORT}`);
});
