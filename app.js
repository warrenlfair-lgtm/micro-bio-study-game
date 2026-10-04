(function () {
  "use strict";

  // ---------- Configuration ----------
  const STORAGE_KEY = "microBioStudyGame.v1";
  const SOUND_KEY = "microBioStudyGame.sound";
  const QUIZ_SIZE = 10;
  const EXAM_SIZE = 25;
  const BLITZ_SECONDS = 60;
  const MASTERY_STREAK = 3; // consecutive correct answers needed to clear a missed question
  const XP_PER_CORRECT = 10;
  const FLASH_MASTERY = 2; // consecutive "Got it" ratings needed to master a flashcard
  const MATCH_PAIRS = 6;

  const CHAPTERS = [
    { id: "3", title: "Chapter 3 — Tools of the Laboratory" },
    { id: "4", title: "Chapter 4 — Bacteria & Archaea Cell Structures" },
    { id: "5", title: "Chapter 5 — Eukaryotic Cells & Microorganisms" },
    { id: "10", title: "Chapter 10 — Microbial Metabolism" },
    { id: "11A", title: "Chapter 11A — Physical Control of Microbes" }
  ];
  const ALL = { id: "all", title: "All Chapters" };
  const REVIEW = { id: "review", title: "Needs Review" };

  const LEVEL_TITLES = [
    "Petri Dish Rookie", "Streak Plater", "Gram Stain Apprentice", "Colony Builder",
    "Culture Keeper", "Spore Slayer", "Microscope Master", "Lab Legend"
  ];

  const BADGES = [
    { id: "first", name: "First Steps", desc: "Answer your first question" },
    { id: "hundred", name: "Centurion", desc: "Answer 100 questions" },
    { id: "streak5", name: "Hot Streak", desc: "5 correct in a row" },
    { id: "streak10", name: "On Fire", desc: "10 correct in a row" },
    { id: "perfect", name: "Perfect Quiz", desc: "Score 100% on a quiz of 5+ questions" },
    { id: "examAce", name: "Exam Ace", desc: "Score 90%+ on an exam of 10+ questions" },
    { id: "comeback", name: "Comeback Kid", desc: "Master 5 missed questions" },
    { id: "blitz10", name: "Blitz Runner", desc: "10 correct in one Timed Blitz" },
    { id: "cards10", name: "Card Shark", desc: "Master 10 flashcards" },
    { id: "matchMaker", name: "Match Maker", desc: "Finish a Match Game" }
  ];

  const app = document.getElementById("app");
  const bank = (typeof QUESTIONS !== "undefined" && Array.isArray(QUESTIONS)) ? QUESTIONS : [];
  const cardBank = (typeof FLASHCARDS !== "undefined" && Array.isArray(FLASHCARDS)) ? FLASHCARDS : [];
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Helpers ----------
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") el.className = attrs[k];
      else if (k.indexOf("on") === 0) el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k]);
    });
    [].concat(children == null ? [] : children).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    });
    return el;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function render(nodes, quiet) {
    app.innerHTML = "";
    [].concat(nodes).forEach(function (n) { if (n) app.appendChild(n); });
    if (quiet) return;
    app.style.animation = "none";
    void app.offsetHeight;
    app.style.animation = "";
    window.scrollTo(0, 0);
  }

  const pct = function (a, b) { return b ? Math.round((a / b) * 100) : 0; };

  // ---------- Sound, toast, confetti ----------
  let soundOn = true;
  try { soundOn = localStorage.getItem(SOUND_KEY) !== "off"; } catch (e) { /* ignore */ }
  let audioCtx = null;

  function beep(freq, dur, type, delay) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime + (delay || 0);
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) { /* audio unavailable */ }
  }

  const sfx = {
    correct: function () { beep(660, 0.12, "sine", 0); beep(880, 0.16, "sine", 0.1); },
    wrong: function () { beep(180, 0.25, "sawtooth", 0); },
    fanfare: function () { beep(523, 0.14, "triangle", 0); beep(659, 0.14, "triangle", 0.12); beep(784, 0.25, "triangle", 0.24); }
  };

  function toast(msg) {
    let box = document.getElementById("toasts");
    if (!box) { box = h("div", { id: "toasts", class: "toasts", "aria-live": "polite" }); document.body.appendChild(box); }
    const t = h("div", { class: "toast" }, msg);
    box.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  function confetti(count) {
    if (reducedMotion) return;
    const colors = ["#22d3ee", "#a78bfa", "#22c55e", "#fbbf24", "#f472b6", "#60a5fa"];
    const wrap = h("div", { class: "confetti", "aria-hidden": "true" });
    for (let i = 0; i < count; i++) {
      const style = "left:" + Math.random() * 100 + "%;background:" + colors[i % colors.length] +
        ";animation-delay:" + (Math.random() * 0.5).toFixed(2) + "s;animation-duration:" + (1.6 + Math.random() * 1.4).toFixed(2) + "s";
      wrap.appendChild(h("i", { style: style }));
    }
    document.body.appendChild(wrap);
    setTimeout(function () { wrap.remove(); }, 3600);
  }

  // ---------- Progress storage ----------
  function emptyProgress() {
    return { answered: 0, correct: 0, questions: {}, xp: 0, bestStreak: 0, badges: {}, blitzBest: {}, cards: {}, matchBest: {} };
  }

  function loadProgress() {
    try {
      const p = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (p && typeof p === "object" && p.questions) {
        p.xp = p.xp || 0;
        p.bestStreak = p.bestStreak || 0;
        p.badges = p.badges || {};
        p.blitzBest = p.blitzBest || {};
        p.cards = p.cards || {};
        p.matchBest = p.matchBest || {};
        return p;
      }
    } catch (e) { /* fall through */ }
    return emptyProgress();
  }

  let progress = loadProgress();

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) { /* storage unavailable */ }
  }

  function levelInfo(xp) {
    const level = Math.floor(Math.sqrt(xp / 50)) + 1;
    const floor = 50 * (level - 1) * (level - 1);
    const next = 50 * level * level;
    return {
      level: level,
      title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
      into: xp - floor,
      span: next - floor,
      toNext: next - xp
    };
  }

  function unlock(id) {
    if (progress.badges[id]) return;
    const b = BADGES.find(function (x) { return x.id === id; });
    if (!b) return;
    progress.badges[id] = Date.now();
    saveProgress();
    toast("Badge unlocked: " + b.name);
    sfx.fanfare();
  }

  function masteredCount() {
    return Object.keys(progress.questions).filter(function (k) { return progress.questions[k].mastered; }).length;
  }

  function addXP(amount) {
    const before = levelInfo(progress.xp).level;
    progress.xp += amount;
    saveProgress();
    const after = levelInfo(progress.xp);
    if (after.level > before) {
      toast("Level up! Level " + after.level + ": " + after.title);
      sfx.fanfare();
      confetti(50);
    }
  }

  // streak = consecutive correct answers including this one (0 if wrong). Returns XP earned.
  function recordAnswer(id, isCorrect, streak) {
    const q = progress.questions[id] || (progress.questions[id] = { correct: 0, wrong: 0, streak: 0, review: false, mastered: false });
    let xp = 0;
    progress.answered++;
    if (isCorrect) {
      progress.correct++;
      q.correct++;
      q.streak++;
      if (q.review && q.streak >= MASTERY_STREAK) { q.review = false; q.mastered = true; }
      xp = XP_PER_CORRECT + Math.min(Math.max(streak - 1, 0), 5) * 2;
      addXP(xp);
    } else {
      q.wrong++;
      q.streak = 0;
      q.review = true;
      q.mastered = false;
    }
    if (streak > progress.bestStreak) progress.bestStreak = streak;
    saveProgress();

    unlock("first");
    if (progress.answered >= 100) unlock("hundred");
    if (streak >= 5) unlock("streak5");
    if (streak >= 10) unlock("streak10");
    if (masteredCount() >= 5) unlock("comeback");
    return xp;
  }

  function reviewQuestions() {
    return bank.filter(function (q) { const s = progress.questions[q.id]; return s && s.review; });
  }

  function poolFor(id) {
    if (id === "all") return bank.slice();
    if (id === "review") return reviewQuestions();
    return bank.filter(function (q) { return q.chapter === id; });
  }

  // ---------- Question preparation ----------
  function prepare(q) {
    const choices = shuffle(q.choices.map(function (text, i) { return { text: text, correct: i === q.answer }; }));
    return { q: q, choices: choices, correctIndex: choices.findIndex(function (c) { return c.correct; }) };
  }

  const LETTERS = "ABCDEFGHIJ";

  function slideRef(q) {
    if (q.slide) return "Review: " + q.slide;
    const m = /-(\d+)$/.exec(q.id);
    const entry = typeof SLIDE_MAP !== "undefined" ? SLIDE_MAP[q.chapter] : null;
    const ref = entry && m ? entry.refs[parseInt(m[1], 10)] : null;
    if (!ref) return "";
    return "Review: " + entry.label + (/[,-]/.test(ref) ? " slides " : " slide ") + ref;
  }

  // ---------- Blitz timer ----------
  let blitzTimer = null;
  let activeBlitz = null;
  let matchTimer = null;
  let activeKeys = null; // keyboard handler for the current flashcard deck

  function stopTimer() {
    if (blitzTimer) { clearInterval(blitzTimer); blitzTimer = null; }
    if (matchTimer) { clearInterval(matchTimer); matchTimer = null; }
    if (activeBlitz) { activeBlitz.over = true; activeBlitz = null; }
    activeKeys = null;
  }

  // ---------- Views ----------
  function homeView() {
    stopTimer();
    const needs = reviewQuestions().length;
    const lv = levelInfo(progress.xp);
    const stats = [
      ["Questions answered", progress.answered],
      ["Correct answers", progress.correct],
      ["Accuracy", pct(progress.correct, progress.answered) + "%"],
      ["Needing review", needs],
      ["Best streak", progress.bestStreak]
    ];

    function card(ch, cls, tag) {
      const n = poolFor(ch.id).length;
      return h("button", { class: "card " + cls, type: "button", onclick: function () { modeView(ch); } }, [
        h("span", { class: "tag" }, tag),
        h("span", { class: "title" }, ch.title),
        h("span", { class: "meta" }, n + (n === 1 ? " question" : " questions"))
      ]);
    }

    const cards = CHAPTERS.map(function (c) { return card(c, "", "Chapter " + c.id); });
    cards.push(card(ALL, "all", "Mix"));
    cards.push(card(REVIEW, "review", "Practice"));
    cards.push(flashTile());

    const earned = BADGES.filter(function (b) { return progress.badges[b.id]; }).length;

    render([
      h("h1", {}, "Micro Bio Study Game"),
      h("p", { class: "sub" }, "Choose a chapter to start studying."),
      h("div", { class: "level-card" }, [
        h("div", { class: "level-top" }, [
          h("span", { class: "level-num" }, "Level " + lv.level),
          h("span", { class: "level-title" }, lv.title),
          h("span", { class: "level-xp" }, progress.xp + " XP")
        ]),
        h("div", { class: "bar" }, h("i", { style: "width:" + pct(lv.into, lv.span) + "%" })),
        h("div", { class: "meta" }, lv.toNext + " XP to Level " + (lv.level + 1))
      ]),
      h("div", { class: "stats" }, stats.map(function (s) {
        return h("div", { class: "stat" }, [h("div", { class: "num" }, s[1]), h("div", { class: "lbl" }, s[0])]);
      })),
      h("h2", {}, "Chapters"),
      h("div", { class: "grid" }, cards),
      h("h2", {}, "Badges (" + earned + " / " + BADGES.length + ")"),
      h("div", { class: "badges" }, BADGES.map(function (b) {
        const on = !!progress.badges[b.id];
        return h("div", { class: "badge " + (on ? "earned" : "locked") }, [
          h("strong", {}, b.name),
          h("span", {}, on ? b.desc : "Locked: " + b.desc)
        ]);
      })),
      h("div", { class: "home-footer" }, h("button", { class: "link-btn", type: "button", onclick: confirmReset }, "Reset Progress"))
    ]);
  }

  function modeView(ch) {
    stopTimer();
    const n = poolFor(ch.id).length;
    function mode(name, tag, desc, count, kind) {
      return h("button", { class: "card", type: "button", disabled: n === 0, onclick: function () { startGame(ch, kind); } }, [
        h("span", { class: "tag" }, tag),
        h("span", { class: "title" }, name),
        h("span", { class: "meta" }, desc + (count ? " (" + count + " questions)" : ""))
      ]);
    }
    const items = [
      mode("Study Mode", "Learn", "Instant feedback and explanations, one at a time.", n, "study"),
      mode("Quiz Mode", "Practice", "Random questions with feedback after each answer.", Math.min(QUIZ_SIZE, n), "quiz"),
      mode("Exam Mode", "Test", "No answers revealed until you submit.", Math.min(EXAM_SIZE, n), "exam"),
      mode("Timed Blitz", "Challenge", BLITZ_SECONDS + " seconds. Answer as many as you can.", 0, "blitz")
    ];
    const best = progress.blitzBest[ch.id];
    const empty = n === 0
      ? h("p", { class: "sub" }, ch.id === "review" ? "Nothing needs review right now. Missed questions will appear here." : "No questions available for this selection yet.")
      : null;
    render([
      h("h1", {}, ch.title),
      h("p", { class: "sub" }, "Select a mode." + (best ? " Blitz best: " + best + "." : "")),
      empty,
      h("div", { class: "grid" }, items),
      h("div", { class: "actions" }, h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home"))
    ]);
  }

  // ---------- Game ----------
  function startGame(ch, kind) {
    stopTimer();
    let pool = shuffle(poolFor(ch.id));
    if (kind === "quiz") pool = pool.slice(0, QUIZ_SIZE);
    if (kind === "exam") pool = pool.slice(0, EXAM_SIZE);
    if (!pool.length) return;
    const game = {
      ch: ch,
      kind: kind,
      items: pool.map(prepare), // unique questions only, so none repeat within a session
      index: 0,
      score: 0,
      streak: 0,
      picks: [],      // exam: chosen index per question
      locked: false
    };
    if (kind === "blitz") { startBlitz(game); return; }
    showQuestion(game);
  }

  function streakChip(game) {
    return h("span", { class: "chip" + (game.streak >= 3 ? " hot" : "") }, "Streak " + game.streak);
  }

  function header(game) {
    const total = game.items.length;
    const label = { study: "Study", quiz: "Quiz", exam: "Exam" }[game.kind];
    const done = game.index + (game.locked ? 1 : 0);
    return [
      h("div", { class: "topbar" }, [
        h("span", {}, label + " · " + game.ch.title),
        h("span", {}, ["Question ", h("b", {}, game.index + 1), " of ", total]),
        game.kind === "exam"
          ? h("span", {}, "Answered: " + game.picks.filter(function (p) { return p != null; }).length)
          : h("span", {}, ["Score: ", h("b", {}, game.score), " / ", done, " ", streakChip(game)])
      ]),
      h("div", { class: "bar" }, h("i", { style: "width:" + pct(done, total) + "%" }))
    ];
  }

  function showQuestion(game) {
    const item = game.items[game.index];
    const isExam = game.kind === "exam";
    const total = game.items.length;
    const isLast = game.index === total - 1;
    game.locked = false;

    const choiceEls = item.choices.map(function (c, i) {
      const el = h("button", { class: "choice", type: "button", onclick: function () { pick(i); } }, [
        h("span", { class: "letter" }, LETTERS[i]),
        h("span", {}, c.text)
      ]);
      if (isExam && game.picks[game.index] === i) el.classList.add("selected");
      return el;
    });

    const feedbackBox = h("div", {});
    const nextBtn = h("button", {
      class: "btn", type: "button",
      onclick: function () { next(); }
    }, isExam ? (isLast ? "Review & Submit" : "Next") : (isLast ? "Finish" : "Next Question"));
    if (!isExam) nextBtn.style.display = "none";

    const actions = [];
    if (isExam && game.index > 0) {
      actions.push(h("button", { class: "btn secondary", type: "button", onclick: function () { game.index--; showQuestion(game); } }, "Previous"));
    }
    actions.push(nextBtn);
    actions.push(h("button", { class: "btn secondary", type: "button", onclick: function () { startGame(game.ch, game.kind); } }, "Restart"));
    actions.push(h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home"));

    function pick(i) {
      if (isExam) {
        game.picks[game.index] = i;
        choiceEls.forEach(function (el, k) { el.classList.toggle("selected", k === i); });
        return;
      }
      if (game.locked) return;
      game.locked = true;
      const ok = i === item.correctIndex;
      game.streak = ok ? game.streak + 1 : 0;
      if (ok) game.score++;
      const xp = recordAnswer(item.q.id, ok, game.streak);
      if (ok) sfx.correct(); else sfx.wrong();
      choiceEls.forEach(function (el, k) {
        el.disabled = true;
        if (k === item.correctIndex) el.classList.add("correct");
        else if (k === i) el.classList.add("wrong");
      });
      feedbackBox.appendChild(h("div", { class: "feedback " + (ok ? "good" : "bad") }, [
        h("strong", {}, ok ? "Correct! +" + xp + " XP" : "Incorrect. Correct answer: " + LETTERS[item.correctIndex] + ". " + item.choices[item.correctIndex].text),
        h("span", {}, item.q.explanation || ""),
        !ok && slideRef(item.q) ? h("span", { class: "slide-ref" }, slideRef(item.q)) : null
      ]));
      nextBtn.style.display = "";
      nextBtn.focus();
      const top = app.querySelector(".topbar");
      if (top) { const fresh = header(game); top.replaceWith(fresh[0]); app.querySelector(".bar").replaceWith(fresh[1]); }
    }

    function next() {
      if (game.index < total - 1) { game.index++; showQuestion(game); }
      else if (isExam) submitExam(game);
      else finishGame(game);
    }

    render(header(game).concat([
      h("div", { class: "qcard" }, [
        h("div", { class: "topic" }, item.q.topic || ""),
        h("div", { class: "qtext" }, item.q.question),
        h("div", { class: "choices" }, choiceEls),
        feedbackBox
      ]),
      h("div", { class: "actions" }, actions)
    ]));
  }

  function resultActions(game) {
    return h("div", { class: "actions" }, [
      h("button", { class: "btn", type: "button", onclick: function () { startGame(game.ch, game.kind); } }, "Restart"),
      h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home")
    ]);
  }

  function scoreBox(title, score, total) {
    return h("div", { class: "score-big" }, [
      h("div", {}, title),
      h("div", { class: "pct" }, pct(score, total) + "%"),
      h("div", {}, score + " of " + total + " correct")
    ]);
  }

  function finishGame(game) {
    const total = game.items.length;
    const p = pct(game.score, total);
    if (game.kind === "quiz" && total >= 5 && game.score === total) unlock("perfect");
    if (p >= 80) { confetti(70); sfx.fanfare(); }
    render([
      h("h1", {}, game.kind === "quiz" ? "Quiz Complete" : "Study Session Complete"),
      scoreBox(game.ch.title, game.score, total),
      resultActions(game)
    ]);
  }

  function submitExam(game) {
    const unanswered = game.items.length - game.picks.filter(function (p) { return p != null; }).length;
    if (unanswered > 0) {
      const ok = window.confirm("You have " + unanswered + " unanswered question(s). Submit anyway? Unanswered questions count as incorrect.");
      if (!ok) return;
    }
    let score = 0;
    const rows = game.items.map(function (item, i) {
      const picked = game.picks[i];
      const ok = picked === item.correctIndex;
      if (ok) score++;
      recordAnswer(item.q.id, ok, ok ? 1 : 0);
      return { item: item, picked: picked, ok: ok };
    });
    const missed = rows.filter(function (r) { return !r.ok; });
    const p = pct(score, rows.length);
    if (rows.length >= 10 && p >= 90) unlock("examAce");
    if (p >= 80) { confetti(80); sfx.fanfare(); }

    function rowEl(r, n) {
      const it = r.item;
      return h("div", { class: "review-item " + (r.ok ? "ok" : "miss") }, [
        h("p", {}, h("b", {}, n + ". " + it.q.question)),
        h("p", { class: r.ok ? "ok-text" : "bad-text" },
          "Your answer: " + (r.picked == null ? "(no answer)" : LETTERS[r.picked] + ". " + it.choices[r.picked].text)),
        r.ok ? null : h("p", { class: "ok-text" }, "Correct answer: " + LETTERS[it.correctIndex] + ". " + it.choices[it.correctIndex].text),
        h("p", {}, it.q.explanation || ""),
        !r.ok && slideRef(it.q) ? h("p", { class: "slide-ref" }, slideRef(it.q)) : null
      ]);
    }

    const out = [
      h("h1", {}, "Exam Results"),
      scoreBox(game.ch.title, score, rows.length),
      h("p", { class: "sub", style: "margin-top:12px" }, "Correct: " + score + " · Missed: " + missed.length)
    ];
    if (missed.length) {
      out.push(h("h2", {}, "Missed Questions"));
      rows.forEach(function (r, i) { if (!r.ok) out.push(rowEl(r, i + 1)); });
    }
    out.push(h("h2", {}, "Correct Answers"));
    const good = rows.filter(function (r) { return r.ok; });
    if (!good.length) out.push(h("p", { class: "sub" }, "None."));
    rows.forEach(function (r, i) { if (r.ok) out.push(rowEl(r, i + 1)); });
    out.push(resultActions(game));
    render(out);
  }

  // ---------- Timed Blitz ----------
  function startBlitz(game) {
    game.answered = 0;
    game.over = false;
    game.endsAt = Date.now() + BLITZ_SECONDS * 1000;
    activeBlitz = game;
    blitzTimer = setInterval(function () {
      const left = Math.max(0, Math.ceil((game.endsAt - Date.now()) / 1000));
      const t = document.getElementById("blitz-time");
      const b = document.getElementById("blitz-bar");
      if (t) t.textContent = left;
      if (b) b.style.width = pct(left, BLITZ_SECONDS) + "%";
      if (left <= 0) endBlitz(game);
    }, 250);
    showBlitz(game, false);
  }

  function showBlitz(game, quiet) {
    const item = game.items[game.index];
    const left = Math.max(0, Math.ceil((game.endsAt - Date.now()) / 1000));
    game.locked = false;

    const choiceEls = item.choices.map(function (c, i) {
      return h("button", { class: "choice", type: "button", onclick: function () { pick(i); } }, [
        h("span", { class: "letter" }, LETTERS[i]),
        h("span", {}, c.text)
      ]);
    });

    function pick(i) {
      if (game.locked || game.over) return;
      game.locked = true;
      const ok = i === item.correctIndex;
      game.streak = ok ? game.streak + 1 : 0;
      game.answered++;
      if (ok) game.score++;
      recordAnswer(item.q.id, ok, game.streak);
      if (ok) sfx.correct(); else sfx.wrong();
      choiceEls.forEach(function (el, k) {
        el.disabled = true;
        if (k === item.correctIndex) el.classList.add("correct");
        else if (k === i) el.classList.add("wrong");
      });
      setTimeout(function () {
        if (game.over) return;
        game.index++;
        if (game.index >= game.items.length) {
          const last = game.items[game.items.length - 1].q.id;
          game.items = shuffle(poolFor(game.ch.id)).map(prepare);
          if (game.items.length > 1 && game.items[0].q.id === last) game.items.push(game.items.shift());
          game.index = 0;
        }
        showBlitz(game, true);
      }, ok ? 500 : 1100);
    }

    render([
      h("div", { class: "topbar" }, [
        h("span", {}, "Blitz · " + game.ch.title),
        h("span", {}, ["Time: ", h("b", { id: "blitz-time" }, left)]),
        h("span", {}, ["Score: ", h("b", {}, game.score), " ", streakChip(game)])
      ]),
      h("div", { class: "bar" }, h("i", { id: "blitz-bar", style: "width:" + pct(left, BLITZ_SECONDS) + "%" })),
      h("div", { class: "qcard" }, [
        h("div", { class: "topic" }, item.q.topic || ""),
        h("div", { class: "qtext" }, item.q.question),
        h("div", { class: "choices" }, choiceEls)
      ]),
      h("div", { class: "actions" }, [
        h("button", { class: "btn secondary", type: "button", onclick: function () { startGame(game.ch, "blitz"); } }, "Restart"),
        h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home")
      ])
    ], quiet);
  }

  function endBlitz(game) {
    stopTimer();
    const prev = progress.blitzBest[game.ch.id] || 0;
    const isBest = game.score > prev;
    if (isBest) progress.blitzBest[game.ch.id] = game.score;
    saveProgress();
    if (game.score >= 10) unlock("blitz10");
    if (isBest && game.score > 0) { confetti(70); sfx.fanfare(); }
    render([
      h("h1", {}, "Time's Up!"),
      h("div", { class: "score-big" }, [
        h("div", {}, game.ch.title),
        h("div", { class: "pct" }, game.score),
        h("div", {}, "correct out of " + game.answered + " answered (" + pct(game.score, game.answered) + "%)"),
        h("div", { class: "meta", style: "margin-top:8px" }, isBest && game.score > 0 ? "New personal best!" : "Best: " + Math.max(prev, game.score))
      ]),
      resultActions(game)
    ]);
  }

  // ---------- Flashcards ----------
  const LEARNING = { id: "learning", title: "Still Learning" };

  function flashPool(id) {
    if (id === "all") return cardBank.slice();
    if (id === "learning") return cardBank.filter(function (c) { const s = progress.cards[c.id]; return s && s.learning; });
    return cardBank.filter(function (c) { return c.chapter === id; });
  }

  function cardState(id) {
    return progress.cards[id] || (progress.cards[id] = { known: 0, miss: 0, streak: 0, learning: false, mastered: false });
  }

  function flashMastered() {
    return cardBank.filter(function (c) { const s = progress.cards[c.id]; return s && s.mastered; }).length;
  }

  function flashTile() {
    const n = cardBank.length;
    return h("button", { class: "card flash", type: "button", onclick: flashHome }, [
      h("span", { class: "tag" }, "Flashcards"),
      h("span", { class: "title" }, "Flashcard Arena"),
      h("span", { class: "meta" }, n + (n === 1 ? " card" : " cards") + " · flip, sort, and match")
    ]);
  }

  function flashHome() {
    stopTimer();
    function choice(ch, tag, cls) {
      const n = flashPool(ch.id).length;
      return h("button", { class: "card " + cls, type: "button", disabled: n === 0, onclick: function () { flashModeView(ch); } }, [
        h("span", { class: "tag" }, tag),
        h("span", { class: "title" }, ch.title),
        h("span", { class: "meta" }, n + (n === 1 ? " card" : " cards"))
      ]);
    }
    const items = CHAPTERS.map(function (c) { return choice(c, "Chapter " + c.id, ""); });
    items.push(choice(ALL, "Mix", "all"));
    items.push(choice(LEARNING, "Practice", "review"));
    render([
      h("h1", {}, "Flashcard Arena"),
      h("p", { class: "sub" }, cardBank.length
        ? "Mastered " + flashMastered() + " of " + cardBank.length + " cards. Choose a deck."
        : "No flashcards yet. Add them to flashcards.js."),
      h("div", { class: "grid" }, items),
      h("div", { class: "actions" }, h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home"))
    ]);
  }

  function flashModeView(ch) {
    stopTimer();
    const n = flashPool(ch.id).length;
    const best = progress.matchBest[ch.id];
    render([
      h("h1", {}, ch.title),
      h("p", { class: "sub" }, "Choose a game." + (best ? " Best match time: " + best + "s." : "")),
      h("div", { class: "grid" }, [
        h("button", { class: "card flash", type: "button", disabled: n === 0, onclick: function () { startDeck(ch); } }, [
          h("span", { class: "tag" }, "Learn"),
          h("span", { class: "title" }, "Flip Deck"),
          h("span", { class: "meta" }, "Flip each card, then rate yourself. Missed cards come back. (" + n + " cards)")
        ]),
        h("button", { class: "card flash", type: "button", disabled: n < 3, onclick: function () { startMatch(ch); } }, [
          h("span", { class: "tag" }, "Challenge"),
          h("span", { class: "title" }, "Match Game"),
          h("span", { class: "meta" }, n < 3 ? "Needs at least 3 cards." : "Pair terms with definitions as fast as you can.")
        ])
      ]),
      h("div", { class: "actions" }, [
        h("button", { class: "btn secondary", type: "button", onclick: flashHome }, "Back"),
        h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home")
      ])
    ]);
  }

  function startDeck(ch, subset) {
    stopTimer();
    const cards = shuffle(subset || flashPool(ch.id));
    if (!cards.length) return;
    showCard({ ch: ch, cards: cards, index: 0, got: 0, streak: 0, learn: [], flipped: false, rated: false }, false);
  }

  function showCard(game, quiet) {
    const card = game.cards[game.index];
    const total = game.cards.length;
    game.flipped = false;
    game.rated = false;

    const flip = h("div", { class: "flip", tabindex: "0", role: "button", "aria-label": "Flashcard. Activate to flip.", onclick: doFlip },
      h("div", { class: "flip-inner" }, [
        h("div", { class: "face front" }, [
          h("div", { class: "topic" }, card.topic || ""),
          h("div", { class: "face-text" }, card.front),
          h("div", { class: "hint" }, "Tap to flip")
        ]),
        h("div", { class: "face back" }, [
          h("div", { class: "topic" }, "Answer"),
          h("div", { class: "face-text" }, card.back),
          card.slide ? h("div", { class: "slide-ref" }, "Review: " + card.slide) : null
        ])
      ]));
    const flipBtn = h("button", { class: "btn", type: "button", onclick: doFlip }, "Flip card");
    const gotBtn = h("button", { class: "btn good", type: "button", onclick: function () { rate(true); } }, "Got it");
    const learnBtn = h("button", { class: "btn bad", type: "button", onclick: function () { rate(false); } }, "Still learning");
    gotBtn.style.display = "none";
    learnBtn.style.display = "none";

    function doFlip() {
      flip.classList.toggle("flipped");
      if (!game.flipped) {
        game.flipped = true;
        gotBtn.style.display = "";
        learnBtn.style.display = "";
        flipBtn.textContent = "Flip again";
      }
    }

    function rate(known) {
      if (!game.flipped) { doFlip(); return; }
      if (game.rated) return;
      game.rated = true;
      const s = cardState(card.id);
      if (known) {
        s.known++;
        s.streak++;
        game.got++;
        game.streak++;
        if (s.streak >= FLASH_MASTERY) {
          if (!s.mastered) toast("Card mastered!");
          s.mastered = true;
          s.learning = false;
        }
        sfx.correct();
        addXP(5 + Math.min(game.streak - 1, 5));
      } else {
        s.miss++;
        s.streak = 0;
        s.learning = true;
        s.mastered = false;
        game.streak = 0;
        game.learn.push(card);
        sfx.wrong();
      }
      saveProgress();
      if (flashMastered() >= 10) unlock("cards10");
      game.index++;
      if (game.index >= total) finishDeck(game); else showCard(game, true);
    }

    activeKeys = function (e) {
      if (e.key === "ArrowRight") rate(true);
      else if (e.key === "ArrowLeft") rate(false);
      else if ((e.key === " " || e.key === "Enter") && !(e.target && e.target.tagName === "BUTTON")) { e.preventDefault(); doFlip(); }
    };

    render([
      h("div", { class: "topbar" }, [
        h("span", {}, "Flashcards · " + game.ch.title),
        h("span", {}, ["Card ", h("b", {}, game.index + 1), " of ", total]),
        h("span", {}, ["Got it: ", h("b", {}, game.got), " ", streakChip(game)])
      ]),
      h("div", { class: "bar" }, h("i", { style: "width:" + pct(game.index, total) + "%" })),
      flip,
      h("p", { class: "key-hint" }, "Space: flip · Right arrow: Got it · Left arrow: Still learning"),
      h("div", { class: "actions" }, [flipBtn, gotBtn, learnBtn]),
      h("div", { class: "actions" }, [
        h("button", { class: "btn secondary", type: "button", onclick: function () { startDeck(game.ch); } }, "Restart"),
        h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home")
      ])
    ], quiet);
  }

  function finishDeck(game) {
    const total = game.cards.length;
    const p = pct(game.got, total);
    activeKeys = null;
    addXP(10);
    if (p >= 80) { confetti(70); sfx.fanfare(); }
    const again = game.learn.length;
    render([
      h("h1", {}, "Deck Complete"),
      scoreBox(game.ch.title, game.got, total),
      h("p", { class: "sub", style: "margin-top:12px" }, "Got it: " + game.got + " · Still learning: " + again + " · +10 XP deck bonus"),
      h("div", { class: "actions" }, [
        again ? h("button", { class: "btn", type: "button", onclick: function () { startDeck(game.ch, game.learn); } }, "Review Still Learning (" + again + ")") : null,
        h("button", { class: again ? "btn secondary" : "btn", type: "button", onclick: function () { startDeck(game.ch); } }, "Restart Deck"),
        h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home")
      ])
    ]);
  }

  function startMatch(ch) {
    stopTimer();
    const pool = flashPool(ch.id);
    if (pool.length < 3) return;
    const set = shuffle(pool).slice(0, MATCH_PAIRS);
    const game = { ch: ch, left: set.length, mistakes: 0, selected: null, startedAt: Date.now() };

    function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

    function select(el, card, side) {
      el.classList.add("selected");
      game.selected = { el: el, card: card, side: side };
    }

    function pickTile(el, card, side) {
      if (el.disabled) return;
      const sel = game.selected;
      if (!sel) { select(el, card, side); return; }
      if (sel.el === el) { el.classList.remove("selected"); game.selected = null; return; }
      if (sel.side === side) { sel.el.classList.remove("selected"); select(el, card, side); return; }
      sel.el.classList.remove("selected");
      game.selected = null;
      if (sel.card.id === card.id) {
        [sel.el, el].forEach(function (t) { t.classList.add("matched"); t.disabled = true; });
        game.left--;
        sfx.correct();
        addXP(5);
        setText("match-left", game.left);
        if (game.left === 0) endMatch(game);
      } else {
        game.mistakes++;
        sfx.wrong();
        setText("match-miss", game.mistakes);
        [sel.el, el].forEach(function (t) { t.classList.add("wrong"); });
        setTimeout(function () { [sel.el, el].forEach(function (t) { t.classList.remove("wrong"); }); }, 450);
      }
    }

    function tile(card, side) {
      const el = h("button", { class: "match-tile " + side, type: "button" }, side === "term" ? card.front : card.back);
      el.addEventListener("click", function () { pickTile(el, card, side); });
      return el;
    }

    matchTimer = setInterval(function () {
      setText("match-time", Math.floor((Date.now() - game.startedAt) / 1000) + "s");
    }, 500);

    render([
      h("div", { class: "topbar" }, [
        h("span", {}, "Match Game · " + ch.title),
        h("span", {}, ["Time: ", h("b", { id: "match-time" }, "0s")]),
        h("span", {}, ["Left: ", h("b", { id: "match-left" }, game.left), " · Mistakes: ", h("b", { id: "match-miss" }, 0)])
      ]),
      h("p", { class: "sub" }, "Tap a term, then tap its matching definition."),
      h("div", { class: "match-grid" }, [
        h("div", { class: "match-col" }, shuffle(set).map(function (c) { return tile(c, "term"); })),
        h("div", { class: "match-col" }, shuffle(set).map(function (c) { return tile(c, "def"); }))
      ]),
      h("div", { class: "actions" }, [
        h("button", { class: "btn secondary", type: "button", onclick: function () { startMatch(ch); } }, "New Round"),
        h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home")
      ])
    ]);
  }

  function endMatch(game) {
    const secs = Math.max(1, Math.round((Date.now() - game.startedAt) / 1000));
    stopTimer();
    const prev = progress.matchBest[game.ch.id];
    const isBest = !prev || secs < prev;
    if (isBest) progress.matchBest[game.ch.id] = secs;
    saveProgress();
    const bonus = game.mistakes === 0 ? 20 : 10;
    addXP(bonus);
    unlock("matchMaker");
    confetti(70);
    sfx.fanfare();
    render([
      h("h1", {}, "All Matched!"),
      h("div", { class: "score-big" }, [
        h("div", {}, game.ch.title),
        h("div", { class: "pct" }, secs + "s"),
        h("div", {}, game.mistakes + (game.mistakes === 1 ? " mistake" : " mistakes") + " · +" + bonus + " XP bonus"),
        h("div", { class: "meta", style: "margin-top:8px" }, isBest ? "New best time!" : "Best: " + prev + "s")
      ]),
      h("div", { class: "actions" }, [
        h("button", { class: "btn", type: "button", onclick: function () { startMatch(game.ch); } }, "Play Again"),
        h("button", { class: "btn secondary", type: "button", onclick: homeView }, "Return Home")
      ])
    ]);
  }

  // ---------- Reset ----------
  function confirmReset() {
    const back = h("div", { class: "modal-back", role: "dialog", "aria-modal": "true" }, h("div", { class: "modal" }, [
      h("h2", { style: "margin-top:0" }, "Reset all progress?"),
      h("p", {}, "This permanently deletes your saved stats, XP, badges, and Needs Review list. This cannot be undone."),
      h("div", { class: "actions" }, [
        h("button", { class: "btn secondary", type: "button", onclick: function () { back.remove(); } }, "Cancel"),
        h("button", { class: "btn danger", type: "button", onclick: function () {
          progress = emptyProgress();
          try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
          back.remove();
          homeView();
        } }, "Delete Progress")
      ])
    ]));
    document.body.appendChild(back);
  }

  // ---------- Init ----------
  const soundBtn = document.getElementById("sound");
  function updateSoundBtn() {
    if (soundBtn) soundBtn.textContent = "Sound: " + (soundOn ? "On" : "Off");
  }
  if (soundBtn) {
    soundBtn.addEventListener("click", function () {
      soundOn = !soundOn;
      try { localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off"); } catch (e) { /* ignore */ }
      updateSoundBtn();
      if (soundOn) sfx.correct();
    });
  }
  updateSoundBtn();

  document.addEventListener("keydown", function (e) { if (activeKeys) activeKeys(e); });
  document.getElementById("brand").addEventListener("click", homeView);
  homeView();
})();
