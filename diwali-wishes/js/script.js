(() => {
"use strict";
const C = window.CONFIG, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const ORDER = ["gate","name","reveal","gallery","gift","diya","fortune","letter","wish","final"];
const store = { get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
                set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };
const sess = { get(k){ try { return sessionStorage.getItem(k); } catch(e){ return null; } },
               set(k,v){ try { sessionStorage.setItem(k,v); } catch(e){} } };
let user = store.get("dw_user"), step = 0, bag = [], fi = 0;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fill = t => t.replace(/\{n\}/g, user ? user.name : "Friend");
document.title = C.siteTitle;

/* particles */
const cv = $("#fx"), cx = cv.getContext("2d"); let P = [], run = false;
const size = () => { cv.width = innerWidth; cv.height = innerHeight; }; size(); addEventListener("resize", size);
const kick = () => { if (!run) { run = true; requestAnimationFrame(tick); } };
function burst(x, y, n = 36) {
  n = reduce ? Math.min(n, 8) : n; const cols = ["#C9A15A","#E3C386","#FFE09A","#B79CDB","#fff"];
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = 1 + Math.random() * 4;
    P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, l: 1, c: cols[i % 5], r: 1 + Math.random() * 2, g: .05 }); }
  kick();
}
function rise(x, y) { for (let i = 0; i < (reduce ? 4 : 14); i++) P.push({ x: x + (Math.random()-.5)*60, y, vx: Math.random()-.5, vy: -1 - Math.random()*2, l: 1, c: "#FFE09A", r: 1.5, g: -.01 }); kick(); }
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height); P = P.filter(p => p.l > 0);
  for (const p of P) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.l -= .014; cx.globalAlpha = Math.max(p.l, 0); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); }
  cx.globalAlpha = 1;
  if (P.length) requestAnimationFrame(tick); else { run = false; cx.clearRect(0, 0, cv.width, cv.height); }
}
const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; };
let fw; const stopFW = () => clearInterval(fw);
const startFW = () => { stopFW(); let n = 0; fw = setInterval(() => { burst(innerWidth*(.15+Math.random()*.7), innerHeight*(.1+Math.random()*.35), 40); if (++n > 9) stopFW(); }, 700); };

/* navigation */
function show(i) {
  step = Math.max(0, Math.min(i, ORDER.length - 1)); sess.set("dw_step", step);
  $$(".screen").forEach(s => s.classList.remove("active"));
  $("#" + ORDER[step]).classList.add("active"); scrollTo(0, 0); stopFW();
  if (user) { $("#revealName").textContent = `Happy Diwali, ${user.name}!`; $("#fName").textContent = `Happy Diwali, ${user.name}!`; }
  const id = ORDER[step];
  if (id === "reveal") startFW();
  if (id === "name" && user) $("#nameIn").value = user.name;
  if (id === "gallery") buildPhotos();
  if (id === "final") { $("#fLine").textContent = C.finalLine; $("#fSig").textContent = C.sender; burst(innerWidth/2, innerHeight/3, 30); }
}
$$(".next").forEach(b => b.addEventListener("click", () => show(step + 1)));

/* gate */
$("#gateForm").addEventListener("submit", e => {
  e.preventDefault(); const err = $("#gateErr"), f = $("#gateForm"); err.textContent = "";
  if ($("#code").value.trim().toLowerCase() === String(C.secretCode).trim().toLowerCase()) { sess.set("dw_ok", "1"); startMusic(); show(1); }
  else { err.textContent = "That code isn't quite right. Please try again."; f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); }
});

/* name */
$("#nameForm").addEventListener("submit", e => {
  e.preventDefault(); const name = $("#nameIn").value.replace(/\s+/g, " ").trim();
  if (!name) { $("#nameErr").textContent = "Please enter your name."; return; }
  $("#nameErr").textContent = "";
  user = { name, gender: (document.querySelector("input[name=g]:checked") || {}).value || "neutral" };
  store.set("dw_user", user); show(2);
});

/* gallery */
function buildPhotos() {
  const box = $("#photos"); if (box.childElementCount) return;
  C.photos.forEach(p => { const f = document.createElement("figure"), i = new Image(), c = document.createElement("figcaption");
    i.src = p.src; i.alt = p.alt; i.onerror = () => f.remove(); c.textContent = p.caption; f.append(i, c); box.append(f); });
}

/* gift / diya / fortune / letter / wish */
$("#giftBox").addEventListener("click", e => { const b = e.currentTarget; if (b.classList.contains("open")) return; b.classList.add("open");
  const [x, y] = center(b); burst(x, y - 30, 50); const m = $("#giftMsg"); m.textContent = fill(C.giftMsg); m.classList.add("show"); });
$("#diyaBtn").addEventListener("click", e => { const b = e.currentTarget; b.classList.add("lit"); const [x, y] = center(b);
  rise(x, y - 40); setTimeout(() => rise(x, y - 40), 400);
  const m = $("#diyaMsg"); m.classList.remove("show"); m.textContent = fill(C.blessings[Math.floor(Math.random() * C.blessings.length)]);
  void m.offsetWidth; m.classList.add("show"); });
$("#fBtn").addEventListener("click", () => {
  if (!bag.length) bag = C.fortunes.map((_, i) => i).sort(() => Math.random() - .5);
  const card = $("#fCard"); card.textContent = fill(C.fortunes[bag.pop()]);
  card.className = "fcard"; void card.offsetWidth; card.className = "fcard f" + (fi++ % 3 + 1);
  const [x, y] = center(card); burst(x, y, 16); $("#fBtn").textContent = "Reveal Another Blessing";
});
$("#env").addEventListener("click", e => {
  const env = e.currentTarget; env.classList.add("open"); const [x, y] = center(env); burst(x, y, 24);
  setTimeout(() => {
    env.hidden = true; const paper = $("#paper"); paper.textContent = "";
    C.letter.forEach(t => { const p = document.createElement("p"); p.textContent = fill(t); paper.append(p); });
    const s = document.createElement("p"); s.className = "sig"; s.textContent = C.sender; paper.append(s);
    paper.hidden = false; $("#letterNext").hidden = false;
  }, 900);
});
$("#star").addEventListener("click", e => { const b = e.currentTarget; b.classList.add("on"); const [x, y] = center(b); burst(x, y, 60);
  const m = $("#wishMsg"); m.textContent = fill(C.wishMsg); m.classList.add("show"); });

/* final: download / share / replay */
function wrap(c, text, x, y, w, lh) { let line = ""; for (const word of text.split(" ")) { const t = line ? line + " " + word : word;
  if (c.measureText(t).width > w && line) { c.fillText(line, x, y); line = word; y += lh; } else line = t; } c.fillText(line, x, y); return y + lh; }
$("#dl").addEventListener("click", async () => {
  try { await Promise.all([document.fonts.load("700 80px 'Cormorant Garamond'"), document.fonts.load("80px Allura"), document.fonts.load("30px Manrope")]); } catch (e) {}
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#6B3FA0"); bg.addColorStop(1, "#3D1E5C"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#C9A15A"; g.lineWidth = 8; g.strokeRect(40, 40, W - 80, H - 80); g.lineWidth = 2; g.strokeRect(65, 65, W - 130, H - 130);
  g.textAlign = "center";
  const gl = g.createRadialGradient(W/2, 330, 10, W/2, 330, 150); gl.addColorStop(0, "rgba(255,200,90,.7)"); gl.addColorStop(1, "rgba(255,200,90,0)"); g.fillStyle = gl; g.fillRect(W/2 - 160, 180, 320, 320);
  g.fillStyle = "#FFB52E"; g.beginPath(); g.ellipse(W/2, 335, 20, 48, 0, 0, 6.283); g.fill();
  g.fillStyle = "#C9A15A"; g.beginPath(); g.moveTo(W/2 - 100, 385); g.quadraticCurveTo(W/2, 520, W/2 + 100, 385); g.closePath(); g.fill();
  const title = `Happy Diwali, ${user.name}!`; let fs = 104;
  do { g.font = `700 ${fs}px 'Cormorant Garamond', Georgia, serif`; fs -= 4; } while (g.measureText(title).width > W - 200 && fs > 40);
  g.fillStyle = "#C9A15A"; let y = 640;
  if (g.measureText(title).width > W - 200) y = wrap(g, title, W/2, y, W - 200, 60) - 60; else g.fillText(title, W/2, y);
  g.fillStyle = "#F3EEFA"; g.font = "400 38px Manrope, sans-serif"; y = wrap(g, C.finalLine, W/2, y + 90, 760, 58);
  g.fillStyle = "#B79CDB"; g.font = "400 32px Manrope, sans-serif"; g.fillText("With love and warm wishes,", W/2, y + 70);
  g.fillStyle = "#C9A15A"; g.font = "100px Allura, cursive"; g.fillText(C.sender, W/2, y + 190);
  c.toBlob(b => { if (!b) return alert("Sorry, the card couldn't be created."); const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = `Diwali-Wishes-${user.name.replace(/[^\w-]+/g, "_")}.png`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, "image/png");
});
$("#wa").addEventListener("click", () => open("https://wa.me/?text=" + encodeURIComponent(`${C.shareText} ${C.siteUrl}`), "_blank", "noopener"));
$("#replay").addEventListener("click", () => {
  ["#giftMsg","#diyaMsg","#wishMsg"].forEach(s => { $(s).classList.remove("show"); $(s).textContent = ""; });
  $("#giftBox").classList.remove("open"); $("#diyaBtn").classList.remove("lit"); $("#star").classList.remove("on");
  $("#fCard").innerHTML = "<span>✦</span>"; $("#fCard").className = "fcard"; $("#fBtn").textContent = "Reveal a Blessing";
  $("#env").hidden = false; $("#env").classList.remove("open"); $("#paper").hidden = true; $("#letterNext").hidden = true; show(2);
});
$("#edit").addEventListener("click", () => show(1));

/* music */
const bgm = $("#bgm"), mb = $("#musicBtn"); let want = true, fade;
bgm.src = C.audio; bgm.volume = 0; mb.setAttribute("aria-label", "Pause music");
bgm.addEventListener("error", () => { mb.hidden = true; });
function ramp(to, done) { clearInterval(fade); fade = setInterval(() => { const d = to - bgm.volume;
  if (Math.abs(d) < .02) { bgm.volume = to; clearInterval(fade); done && done(); } else bgm.volume = Math.max(0, Math.min(1, bgm.volume + Math.sign(d) * .02)); }, 80); }
function startMusic() { mb.hidden = false; want = true; mb.classList.remove("off"); bgm.play().then(() => ramp(.35)).catch(() => { want = false; mb.classList.add("off"); mb.setAttribute("aria-label", "Play music"); }); }
mb.addEventListener("click", () => {
  if (want) { want = false; mb.classList.add("off"); mb.setAttribute("aria-label", "Play music"); ramp(0, () => bgm.pause()); }
  else { want = true; mb.classList.remove("off"); mb.setAttribute("aria-label", "Pause music"); bgm.play().then(() => ramp(.35)).catch(() => {}); } });

/* start */
if (sess.get("dw_ok") === "1") { mb.hidden = false; mb.classList.add("off"); want = false; show(user ? Math.max(2, +sess.get("dw_step") || 2) : 1); }
else show(0);
})();
