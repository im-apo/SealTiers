/* ==========================================================================
   Bunny Tiers - home page + theme picker
   Loaded after main.js. Uses its globals (players, setGamemode, esc, avatarImg,
   icoImg, pill, regionTag, calculatePoints, getBadge, ALL_GAMEMODES, GM_LABEL,
   TIER_ORDER, REGION_NAMES, openPlayerModal).
   ========================================================================== */
(() => {
    "use strict";

    // ------------------------------------------------------------------
    // Themes
    // ------------------------------------------------------------------
    const THEMES = [
        { id: "dark", name: "Dark", c: ["#0b1220", "#7fa1c3"] },
        { id: "light", name: "Light", c: ["#eef2f7", "#4f74a0"] },
        { id: "void", name: "Void", c: ["#000000", "#c9c9d4"] },
        { id: "fire", name: "Fire", c: ["#1e0b05", "#ff5a1f"] },
        { id: "galaxy", name: "Galaxy", c: ["#120c2c", "#a78bfa"] },
        { id: "ocean", name: "Ocean", c: ["#0b2a3d", "#22d3ee"] },
        { id: "forest", name: "Forest", c: ["#12251a", "#4ade80"] },
        { id: "sakura", name: "Sakura", c: ["#fff4f8", "#e5588b"] }
    ];
    const root = document.documentElement;
    const btn = $("themeBtn");
    const menu = document.createElement("div");
    menu.className = "theme-menu";
    menu.id = "themeMenu";
    menu.hidden = true;
    menu.setAttribute("role", "group");
    menu.setAttribute("aria-label", "Choose a theme");
    menu.innerHTML = THEMES.map((t) =>
        `<button type="button" class="theme-opt" data-theme-id="${t.id}" aria-pressed="false">` +
        `<span class="theme-sw" style="background:linear-gradient(135deg,${t.c[0]} 50%,${t.c[1]} 50%)"></span>${t.name}</button>`).join("");
    document.body.appendChild(menu);

    function applyTheme(id, save) {
        if (!THEMES.some((t) => t.id === id)) id = "dark";
        root.dataset.theme = id;
        if (save) { try { localStorage.setItem("theme", id); } catch {} }
        menu.querySelectorAll(".theme-opt").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeId === id)));
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = getComputedStyle(root).getPropertyValue("--bt-bg").trim() || "#0b1220";
    }

    function placeMenu() {
        const r = btn.getBoundingClientRect();
        menu.style.top = `${Math.round(r.bottom + 8)}px`;
        menu.style.right = `${Math.max(12, Math.round(innerWidth - r.right))}px`;
    }
    function toggleMenu(open) {
        menu.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        if (open) { placeMenu(); menu.querySelector('[aria-pressed="true"]')?.focus(); }
    }

    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3c2 0 3.7-1.6 3.7-3.6C21 6.9 17 3 12 3zM6.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>';
    btn.title = "Choose a theme";
    btn.setAttribute("aria-label", "Choose a theme");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(menu.hidden); });
    menu.addEventListener("click", (e) => {
        const o = e.target.closest(".theme-opt");
        if (o) { applyTheme(o.dataset.themeId, true); toggleMenu(false); btn.focus(); }
    });
    document.addEventListener("click", (e) => { if (!menu.hidden && !menu.contains(e.target)) toggleMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { toggleMenu(false); btn.focus(); } });
    addEventListener("resize", () => { if (!menu.hidden) placeMenu(); });
    applyTheme(root.dataset.theme, false);

    // ------------------------------------------------------------------
    // Home page
    // ------------------------------------------------------------------
    const home = $("homeView");
    const fmt = (n) => Number(n).toLocaleString();
    const BADGE_COLORS = { pointoverlord: "#fbbf24", legendary: "#a855f7", master: "#8b5cf6", expert: "var(--bt-accent)", advanced: "#10b981", intermediate: "#f97316", novice: "#6b7280" };
    const BADGE_ORDER = ["pointoverlord", "legendary", "master", "expert", "advanced", "intermediate", "novice"];
    let mounted = false;

    function mount() {
        mounted = true;
        home.innerHTML = `
        <section class="hm-hero">
            <div>
                <div class="hm-brand">
                    <img class="hm-logo" src="logo.png" alt="" onerror="this.style.display='none';">
                    <h1 class="hm-title">Bunny Tiers</h1>
                </div>
                <p class="hm-lead">The Bunny community's Minecraft PvP tierlist. Search a player, pick a gamemode, or see who is on top right now.</p>
                <form class="hm-search" id="hmSearchForm" role="search">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/></svg>
                    <input id="hmSearch" type="text" aria-label="Search players" placeholder="Search players, or add filters like #ht @eu >100" autocomplete="off" spellcheck="false">
                    <button class="hm-btn primary" type="submit">Search</button>
                </form>
                <div class="hm-actions">
                    <button type="button" class="hm-btn" data-go="overall">Open rankings</button>
                    <a class="hm-btn" href="https://discord.gg/zMqy5QbevP" target="_blank" rel="noopener">Join the Discord</a>
                    <button type="button" class="hm-btn ghost" data-action="info">How points work</button>
                </div>
                <p class="hm-note">Run <code>/verify</code> with your username in the Discord server to get ranked.</p>
            </div>
            <aside class="hm-top" aria-label="Top players">
                <h2>Top of the board</h2>
                <div id="hmTop"></div>
                <button type="button" class="hm-link" data-go="overall">See the full ranking</button>
            </aside>
        </section>
        <dl class="hm-stats" id="hmStats"></dl>
        <section class="hm-sec"><h2>Browse by gamemode</h2><div id="hmModes"></div></section>
        <div class="hm-two">
            <section class="hm-sec"><h2>Rank badges</h2><div id="hmBadges"></div></section>
            <section class="hm-sec"><h2>Where players are from</h2><div id="hmRegions"></div></section>
        </div>
        <section class="hm-cta">
            <div><h2>Want a spot on the board?</h2><p>Join the Discord and run <code>/verify</code> with your username. Your tiers show up here once they are added.</p></div>
            <a class="hm-btn primary" href="https://discord.gg/zMqy5QbevP" target="_blank" rel="noopener">Join the Discord</a>
        </section>`;

        $("hmSearchForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const sb = $("searchBox");
            sb.value = $("hmSearch").value.trim();
            sb.dispatchEvent(new Event("input", { bubbles: true }));
            setGamemode("overall");
            scrollTo({ top: 0 });
        });
        const openPlayer = (el) => { const p = players.find((x) => x.name === el.dataset.name); if (p) openPlayerModal(p); };
        home.addEventListener("click", (e) => {
            const go = e.target.closest("[data-go]");
            if (go) { setGamemode(go.dataset.go); scrollTo({ top: 0 }); return; }
            if (e.target.closest('[data-action="info"]')) { $("tierInfoBtn").click(); return; }
            const row = e.target.closest("[data-name]");
            if (row) openPlayer(row);
        });
        home.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;
            const row = e.target.closest("[data-name]");
            if (row) openPlayer(row);
        });
    }

    const bars = (rows, max) => rows.map((r) =>
        `<div class="hm-bar"><span class="hm-bl">${esc(r.label)}</span><span class="hm-bt"><i style="width:${Math.round((r.n / max) * 100)}%;${r.c ? `--c:${r.c}` : ""}"></i></span><span class="hm-bn">${fmt(r.n)}</span></div>`).join("");

    function leaderOf(gm) {
        let best = null, count = 0;
        for (const p of players) {
            const t = p.tiers?.[gm];
            if (!t) continue;
            count++;
            const o = TIER_ORDER[t] ?? 999;
            if (!best || o < best.o || (o === best.o && p.name.localeCompare(best.p.name) < 0)) best = { p, o, t };
        }
        return { count, best };
    }

    function renderHome() {
        if (!mounted) mount();
        const ranked = players.map((p) => ({ p, pts: calculatePoints(p) })).sort((a, b) => b.pts - a.pts || String(a.p.name).localeCompare(String(b.p.name)));

        // top 5
        $("hmTop").innerHTML = ranked.length ? ranked.slice(0, 5).map(({ p, pts }, i) => {
            const b = getBadge(pts);
            return `<div class="hm-prow r${i + 1}" data-name="${esc(p.name)}" tabindex="0" role="button">
                <span class="hm-rk">${i + 1}</span>${avatarImg(p, "hm-av")}
                <span class="hm-pn"><span class="hm-nm">${esc(p.name)}</span>${regionTag(p.region)}</span>
                <span class="hm-pp"><span><b>${fmt(pts)}</b> pts</span><span class="badge ${b.class}">${b.label}</span></span></div>`;
        }).join("") : `<div class="hm-empty">Loading rankings...</div>`;

        // stats
        const modeCount = Object.values(ALL_GAMEMODES).reduce((n, g) => n + g.length, 0);
        const tiersAwarded = players.reduce((n, p) => n + Object.values(p.tiers || {}).filter(Boolean).length, 0);
        const stat = (label, val) => `<div><dt>${label}</dt><dd>${val}</dd></div>`;
        $("hmStats").innerHTML =
            stat("Players ranked", players.length ? fmt(players.length) : "-") +
            stat("Gamemodes", modeCount) +
            stat("Tiers awarded", players.length ? fmt(tiersAwarded) : "-") +
            stat("Highest score", ranked.length ? fmt(ranked[0].pts) : "-");

        // gamemodes
        const groupTitle = { main: "Main", sub: "Sub", limited: "Limited" };
        $("hmModes").innerHTML = Object.entries(ALL_GAMEMODES).map(([g, list]) => `
            <div class="hm-group"><h3>${groupTitle[g] || g}</h3><div class="hm-tiles">${list.map((gm) => {
                const { count, best } = leaderOf(gm);
                return `<button type="button" class="hm-tile" data-go="${gm}">${icoImg(gm)}
                    <span class="hm-tn">${esc(GM_LABEL[gm] || gm)}</span><span class="hm-tc">${fmt(count)} ranked</span>
                    ${best ? `<span class="hm-ld">${avatarImg(best.p, "hm-av s")}<span>${esc(best.p.name)}</span>${pill(best.t)}</span>` : `<span class="hm-ld none">No players yet</span>`}
                </button>`;
            }).join("")}</div></div>`).join("");

        // badges
        const bc = {};
        ranked.forEach(({ pts }) => { const k = getBadge(pts).class; bc[k] = (bc[k] || 0) + 1; });
        const labels = {};
        [900, 300, 200, 100, 50, 20, 0].forEach((v) => { const b = getBadge(v); labels[b.class] = b.label; });
        const badgeRows = BADGE_ORDER.map((k) => ({ label: labels[k], n: bc[k] || 0, c: BADGE_COLORS[k] }));
        $("hmBadges").innerHTML = bars(badgeRows, Math.max(1, ...badgeRows.map((r) => r.n)));

        // regions
        const rc = {};
        players.forEach((p) => { const r = String(p.region || "").toLowerCase(); if (r) rc[r] = (rc[r] || 0) + 1; });
        const regionRows = Object.entries(rc).sort((a, b) => b[1] - a[1]).map(([r, n]) => ({ label: REGION_NAMES[r] || r.toUpperCase(), n }));
        $("hmRegions").innerHTML = regionRows.length ? bars(regionRows, Math.max(1, ...regionRows.map((r) => r.n))) : `<div class="hm-empty">No region data yet</div>`;
    }

    window.renderHome = renderHome;
    // main.js may already have tried to render before this file loaded
    if (currentGamemode === "home") renderPlayers();
})();
