/* ==========================================================================
   Bunny Tiers - remade front end
   Same data source, routing, points system and features as before,
   organised into small modules and rendered with the new layout.
   ========================================================================== */

// ---------------------------------------------------------------------------
// Basics
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const BASE_PATH = new URL(".", document.baseURI).pathname;
const IS_LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);

if (sessionStorage.redirect) {
    const redirectPath = sessionStorage.redirect;
    delete sessionStorage.redirect;
    history.replaceState(null, "", redirectPath);
}

const fixAssetPath = (path) => (path.startsWith("assets/") ? BASE_PATH + path : path);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byPoints = (a, b) => b.points - a.points || String(a.name).localeCompare(String(b.name));

const VALID_GAMEMODES = [
    "overall", "crystal", "smp", "diasmp", "sword", "axe", "uhc", "potion", "nethpot", "mace",
    "speed", "elytra", "cart", "ogvanilla", "nethuhc", "nethsword", "moddia", "ltm"
];

if (location.pathname.startsWith(BASE_PATH + "rankings") &&
    !new RegExp("^" + BASE_PATH + "rankings/(" + VALID_GAMEMODES.join("|") + ")?/?$").test(location.pathname)) {
    location.replace(BASE_PATH + "rankings/overall");
}

const STANDBY_TIER_CONFIG = { enabled: true, label: "-" };

// Gamemodes shown on each player's row, in the original order
const ALL_GAMEMODES = {
    main: ["crystal", "sword", "uhc", "potion", "nethpot", "smp", "axe", "mace", "diasmp"],
    sub: ["speed", "elytra", "cart", "ogvanilla"],
    limited: ["nethuhc", "nethsword", "moddia"]
};
// Gamemodes shown in the gamemode bar (LTM lives under Limited)
const BAR_GROUPS = {
    main: ["crystal", "smp", "diasmp", "sword", "axe", "uhc", "potion", "nethpot", "mace"],
    sub: ["speed", "elytra", "cart", "ogvanilla"],
    limited: ["nethuhc", "nethsword", "moddia", "ltm"]
};
const GM_LABEL = {
    overall: "Overall", crystal: "Crystal", smp: "SMP", diasmp: "Diamond SMP", sword: "Sword", axe: "Axe", uhc: "UHC",
    potion: "Potion", nethpot: "Netherite Pot", mace: "Mace", speed: "Speed", elytra: "Elytra", cart: "Cart",
    ogvanilla: "OG Vanilla", nethuhc: "Netherite UHC", nethsword: "Netherite Sword", moddia: "Modern Diamond", ltm: "LTM",
    trident: "Trident", bed: "Bed", bow: "Bow", creeper: "Creeper", debuff: "Debuff", diasurv: "Diamond Survival", manhunt: "Manhunt"
};
const groupOf = (gm) => Object.keys(BAR_GROUPS).find((g) => BAR_GROUPS[g].includes(gm)) || "main";

const ICON_FILES = { overall: "Overall", crystal: "Crystal", sword: "Sword", uhc: "Uhc", potion: "Potion", nethpot: "Nethpot", nethsword: "NethSword", smp: "Smp", axe: "Axe", mace: "Mace", diasmp: "Diasmp", speed: "Speed", elytra: "Elytra", trident: "Trident", cart: "Cart", bed: "Bed", bow: "Bow", creeper: "Creeper", debuff: "DeBuff", diasurv: "DiaSurv", manhunt: "Manhunt", ogvanilla: "OgVanilla", nethuhc: "NethUhc", ltm: "LTM", moddia: "ModernDiamond" };
const GAMEMODE_ICONS = Object.fromEntries(Object.entries(ICON_FILES).map(([k, f]) => [k, fixAssetPath(`assets/gamemode-icons/${f}.svg`)]));
const gmIcon = (gm) => GAMEMODE_ICONS[gm] || GAMEMODE_ICONS.overall;

const TIER_ORDER = {};
for (let n = 0; n <= 6; n++) for (const p of ["", "R"]) { TIER_ORDER[`${p}HT${n}`] = n * 2; TIER_ORDER[`${p}LT${n}`] = n * 2 + 1; }

const tierPoints = {
    RHT0: 200, RLT0: 100, HT0: 200, LT0: 100,
    RHT1: 85, RLT1: 70, HT1: 85, LT1: 70,
    RHT2: 50, RLT2: 40, HT2: 50, LT2: 40,
    RHT3: 20, RLT3: 15, HT3: 20, LT3: 15,
    RHT4: 8, RLT4: 6, HT4: 8, LT4: 6,
    RHT5: 4, RLT5: 2, HT5: 4, LT5: 2,
    RHT6: -10, RLT6: -20, HT6: -10, LT6: -20
};

const REGIONS = ["na", "eu", "as", "sa", "me", "au", "af"];
const REGION_NAMES = { na: "North America", eu: "Europe", as: "Asia", sa: "South America", me: "Middle East", au: "Oceania", af: "Africa" };

// ---------------------------------------------------------------------------
// Kit info
// ---------------------------------------------------------------------------
const KIT_NOTE = "\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!";
const kit = (title, img, description) => ({ title, description: description + KIT_NOTE, image: fixAssetPath(`assets/kits/${img}.png`) });
const kitInfo = {
    crystal: kit("Crystal PvP Kit", "Crystal", "Advanced end crystal combat loadout with heavy emphasis on explosive warfare. Features extensive supplies of ender pearls for mobility, chorus fruit for emergency escapes, and respawn anchors for additional explosive options. The multiple diamond and obsidian blocks enable rapid crystal placement and defensive structures. Purple shulker boxes provide portable storage for extended engagements."),
    smp: kit("SMP Kit", "Smp", "Standard survival multiplayer combat loadout with balanced resources. Full netherite protection with comprehensive potion support including healing, speed, and combat buffs. Purple shulker box for storage."),
    diasmp: kit("Diamond SMP Kit", "Diasmp", "Traditional diamond-tier SMP combat with balanced approach. Full diamond armor with extensive golden apple reserves and varied potions for adaptable fighting."),
    sword: kit("Sword PvP Kit", "Sword", "Pure sword combat minimalist setup focusing on fundamental melee mechanics. Clean inventory allowing focus on combos, strafing, and movement without distraction."),
    axe: kit("Axe PvP Kit", "Axe", "Axe-focused combat with emphasis on timing and high damage output. Minimal loadout designed for shield-breaking mechanics and cooldown-based attacks."),
    uhc: kit("UHC Kit", "Uhc", "Ultra Hardcore optimized loadout emphasizing careful resource management. Golden apples are critical since natural regeneration is disabled. Balanced combat tools with strategic potion selection."),
    nethuhc: kit("Netherite UHC Kit", "NethUhc", "Ultra Hardcore Netherite optimized loadout emphasizing careful resource management. Golden apples are critical since natural regeneration is disabled. Balanced combat tools with strategic potion selection."),
    potion: kit("Potion PvP Kit", "Potion", "High-intensity potion warfare loadout with extensive splash potion arsenal. Features multiple types of instant damage, poison, and debuff potions for aggressive play, alongside healing and regeneration options. Golden carrots provide sustained saturation."),
    nethpot: kit("Netherite Potion Kit", "Nethpot", "Enhanced potion combat with full netherite protection. Combines the speed of potion PvP with superior armor durability and knockback resistance. Heavy focus on golden apples and fish for sustained healing between potion exchanges."),
    nethsword: kit("Netherite Sword Kit", "NethSword", "Pure sword combat (But Netherite!) minimalist setup focusing on fundamental melee mechanics. Clean inventory allowing focus on combos, strafing, and movement without distraction."),
    mace: kit("Mace Kit", "Mace", "Vertical combat specialist kit built around the mace's fall damage mechanics introduced in 1.21. Features mace as primary weapon with golden apples for survivability. Potions provide mobility buffs and combat advantages for devastating smash attacks from height."),
    speed: kit("Speed PvP Kit", "Speed", "High-velocity combat kit dominated by splash potions for sustained speed effects. Minimal equipment to maximize movement speed and agility during combat."),
    elytra: kit("Elytra Kit", "Elytra", "Aerial combat specialist with focus on elytra flight mechanics. Multiple milk buckets for clearing negative effects mid-flight, alongside food, potions, and honey for landing safety."),
    trident: kit("Trident Kit", "Trident", "Minimalist trident-focused combat setup emphasizing aquatic mobility and ranged attacks. Clean loadout designed for riptide propulsion and loyalty mechanics with room for tactical flexibility."),
    cart: kit("Minecart Kit", "Cart", "Minecart-based combat utilizing rails, momentum, and vehicle mechanics for unique movement-based fighting strategies."),
    bed: kit("Bed Kit", "Bed", "Bedwars-style combat setup with building materials and utility items. Features swords, bows, and tools for rapid base construction and destruction. Includes TNT, beds, and various blocks for tactical gameplay."),
    bow: kit("Bow Kit", "Bow", "Archery-focused minimalist kit emphasizing ranged superiority. Features multiple bows and arrows for sustained ranged pressure with basic melee backup."),
    creeper: kit("Creeper Kit", "Creeper", "Explosive-themed combat with milk buckets for clearing debuffs and golden apples for survival. Includes tools and materials for tactical positioning around explosion mechanics."),
    debuff: kit("Debuff Kit", "DeBuff", "Status effect warfare specialist with heavy emphasis on negative splash potions. Arsenal designed to weaken opponents while maintaining personal advantages through strategic debuff application."),
    diasurv: kit("Diamond Survival Kit", "DiaSurv", "Diamond-tier crystal PvP combat with end crystal explosive warfare. Features extensive supplies of ender pearls for mobility, chorus fruit for emergency escapes, and respawn anchors for additional explosive options. Diamond armor provides solid protection while maintaining the core crystal combat mechanics with diamond and obsidian blocks for rapid placement."),
    manhunt: kit("Manhunt Kit", "Manhunt", "Diverse survival combat kit mirroring speedrunning scenarios. Includes crafting materials, tools for rapid resource gathering, and combat essentials for fighting while on the move. Features water buckets, beds for respawn setting, and golden apples for clutch healing."),
    ogvanilla: kit("OG Vanilla Kit", "OgVanilla", "Classic vanilla Minecraft combat with traditional techniques and straightforward gameplay. Focuses on fundamental combat skills without specialized mechanics or modern additions."),
    moddia: kit("Modern Diamond Kit", "ModernDiamond", "Suit up in full diamond armour and dominate the battlefield with raw power and precision. Master the fundamentals of diamond-tier combat, from sword technique to strategic positioning, in this classic yet formidable kit.")
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let players = [];
let currentGamemode = "overall";
let currentGroup = "main";
let currentPage = 1;
let playersPerPage = 50;
let allPlayersRanking = [];
let selectedRegions = new Set();
let isInitialLoad = true;
let retryDelay = 3000;

const PLAYERS_URL = "https://stellartiersbot.onrender.com/players.json";
const CACHE_KEY = "players_cache_v1";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
let toastTimer;
function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
function openOverlay(id) { $(id)?.classList.add("open"); }
function closeOverlay(id) { $(id)?.classList.remove("open"); }
function closeAllOverlays() {
    document.querySelectorAll(".overlay").forEach((o) => o.classList.remove("open"));
    $("playerContextMenu").style.display = "none";
}
function copyText(text, okMsg) {
    navigator.clipboard?.writeText(text).then(() => toast(okMsg), () => toast("Could not copy"));
}

const tierKey = (t) => String(t || "").toLowerCase();
const pill = (tier) => `<span class="tier" data-t="${esc(tierKey(tier))}">${esc(tier)}</span>`;
const icoImg = (gm) => `<img src="${gmIcon(gm)}" alt="" loading="lazy" onerror="this.style.display='none';">`;
const avatarImg = (p, cls = "avatar") => `<img class="${cls}" src="${esc(p.avatar)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.visibility='hidden';">`;
const regionTag = (r) => r ? `<span class="region ${esc(String(r).toLowerCase())}">${esc(String(r).toUpperCase())}</span>` : "";
const bestTiers = (p, n = 3) => Object.entries(p.tiers || {}).filter(([, t]) => t).sort((a, b) => (TIER_ORDER[a[1]] ?? 999) - (TIER_ORDER[b[1]] ?? 999)).slice(0, n);

function calculatePoints(player) {
    let total = 0;
    for (const mode in (player.tiers || {})) total += tierPoints[player.tiers[mode]] || 0;
    return total;
}

function getBadge(points) {
    if (points >= 900) return { label: "Points Overlord", class: "pointoverlord" };
    if (points >= 300) return { label: "Legendary", class: "legendary" };
    if (points >= 200) return { label: "Master", class: "master" };
    if (points >= 100) return { label: "Expert", class: "expert" };
    if (points >= 50) return { label: "Advanced", class: "advanced" };
    if (points >= 20) return { label: "Intermediate", class: "intermediate" };
    return { label: "Novice", class: "novice" };
}

function calculatePeakTier(currentTier, peakTier) {
    if (!peakTier || !currentTier) return null;
    const currentRank = TIER_ORDER[currentTier] ?? 999;
    const peakRank = TIER_ORDER[peakTier] ?? 999;
    if (peakRank < currentRank) return { isPeak: false, peakTier, showTooltip: true };
    return { isPeak: true, peakTier: currentTier, showTooltip: false };
}

function getPlayerRank(playerName) {
    const sorted = [...players];
    if (currentGamemode === "overall") sorted.forEach((p) => (p.points = calculatePoints(p)));
    else sorted.forEach((p) => (p.points = tierPoints[p.tiers?.[currentGamemode]] || 0));
    sorted.sort(byPoints);
    const i = sorted.findIndex((p) => p.name === playerName);
    return i !== -1 ? i + 1 : 0;
}

// A gamemode chip: icon + tier pill, with a hover tip for peak tier
function chip(gm, tier, peakTier) {
    const label = GM_LABEL[gm] || gm;
    if (!tier) {
        if (!STANDBY_TIER_CONFIG.enabled) return "";
        return `<span class="chip standby" title="${esc(label)}: unranked"><span class="ico">${icoImg(gm)}</span><span class="chip-t">${STANDBY_TIER_CONFIG.label}</span></span>`;
    }
    const pk = calculatePeakTier(tier, peakTier);
    const tip = pk && !pk.isPeak ? `<span class="peak"><span>Peak tier</span>${pill(peakTier)}</span>` : "";
    return `<span class="chip" data-t="${esc(tierKey(tier))}" title="${esc(label)}" tabindex="0"><span class="ico">${icoImg(gm)}</span>${pill(tier)}${tip}</span>`;
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------
function getGamemodeFromURL() {
    if (IS_LOCAL && location.hash.length > 1) return location.hash.slice(1);
    const match = location.pathname.match(/\/rankings\/([^\/]+)/);
    return match ? match[1] : "overall";
}

function updateURL(gamemode) {
    const url = IS_LOCAL ? `${location.pathname.replace(/\/rankings\/.*$/, "/")}#${gamemode}` : `${BASE_PATH}rankings/${gamemode}${location.search}`;
    history.pushState({ gamemode }, "", url);
}

function applyGamemode(gm) {
    currentGamemode = VALID_GAMEMODES.includes(gm) ? gm : "overall";
    if (currentGamemode !== "overall") currentGroup = groupOf(currentGamemode);
    currentPage = 1;
}

window.addEventListener("popstate", (event) => {
    applyGamemode(event.state?.gamemode || getGamemodeFromURL());
    renderPlayers();
});

// ---------------------------------------------------------------------------
// Gamemode bar
// ---------------------------------------------------------------------------
function buildModeBar() {
    const scroller = $("modeChips"), prevLeft = scroller.scrollLeft;
    scroller.innerHTML = BAR_GROUPS[currentGroup].map((gm) =>
        `<button class="mode${gm === currentGamemode ? " active" : ""}" data-gamemode="${gm}" role="tab">${icoImg(gm)}<span>${esc(GM_LABEL[gm])}</span></button>`
    ).join("");
    document.querySelectorAll("#groupSwitch button").forEach((b) => b.classList.toggle("on", b.dataset.group === currentGroup));
    scroller.scrollLeft = prevLeft;
}

function syncModeUI() {
    buildModeBar();
    const overall = $("overallTab");
    overall.classList.toggle("active", currentGamemode === "overall");
    overall.classList.toggle("filtered", selectedRegions.size > 0);
    overall.querySelector("span").textContent = selectedRegions.size
        ? `Overall (${[...selectedRegions].map((r) => r.toUpperCase()).join(", ")})`
        : "Overall";
    $("kitInfoBtn").style.display = currentGamemode !== "overall" && kitInfo[currentGamemode] ? "inline-flex" : "none";
    const isOverall = currentGamemode === "overall";
    $("regionBtn").style.display = isOverall ? "inline-flex" : "none";
    $("pageSizeSelector").style.display = isOverall ? "" : "none";
    $("regionBtnLabel").textContent = selectedRegions.size ? `Regions: ${[...selectedRegions].map((r) => r.toUpperCase()).join(", ")}` : "Regions";
}

function setGamemode(gm) {
    applyGamemode(gm);
    updateURL(currentGamemode);
    renderPlayers();
}

$("modebar").addEventListener("click", (e) => {
    const sw = e.target.closest("#groupSwitch button");
    if (sw) { currentGroup = sw.dataset.group; buildModeBar(); return; }
    const m = e.target.closest(".mode");
    if (m) setGamemode(m.dataset.gamemode);
});

function resetToOverall() {
    selectedRegions.clear();
    $("searchBox").value = "";
    $("clearSearchBtn").style.display = "none";
    currentGroup = "main";
    const u = new URL(location.href); u.searchParams.delete("q"); history.replaceState(history.state, "", u);
    setGamemode("overall");
}
$("logoBtn").addEventListener("click", resetToOverall);
$("logoBtn").addEventListener("keydown", (e) => { if (e.key === "Enter") resetToOverall(); });

// ---------------------------------------------------------------------------
// Loading players
// ---------------------------------------------------------------------------
function hideLoader() {
    const l = $("loadingScreen");
    if (!l || l.classList.contains("hidden-fade")) return;
    l.classList.add("hidden-fade");
    setTimeout(() => { if (l.classList.contains("hidden-fade")) l.style.display = "none"; }, 500);
}
function showLoader(msg, color) {
    const l = $("loadingScreen"), s = $("loadingSubtext");
    if (!l || !s) return;
    l.style.display = "flex";
    requestAnimationFrame(() => l.classList.remove("hidden-fade"));
    s.textContent = msg;
    s.style.color = color;
}

async function loadPlayers() {
    const sub = $("loadingSubtext");
    if (isInitialLoad) {
        isInitialLoad = false;
        try {
            const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
            if (Array.isArray(c) && c.length) { players = c; hideLoader(); renderPlayers(); }
        } catch {}
    }
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 60000);
        const res = await fetch(PLAYERS_URL, { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error("Network response was not ok");
        players = await res.json();
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(players)); } catch {}
        retryDelay = 3000;
        hideLoader();
        renderPlayers();
    } catch (error) {
        console.error("Failed to load players:", error);
        if (!players.length && sub) { sub.textContent = "Server is waking up. Retrying..."; sub.style.color = "#f59e0b"; }
        setTimeout(loadPlayers, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
    }
}

window.addEventListener("online", () => {
    showLoader("Connection restored. Reloading...", "#10b981");
    setTimeout(loadPlayers, 1000);
});
window.addEventListener("offline", () => showLoader("No internet connection. Waiting for connection...", "#ef4444"));

$("refreshBtn").addEventListener("click", async () => {
    const btn = $("refreshBtn"), original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg viewBox="0 0 24 24" style="animation: spin 1s linear infinite"><path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg><span class="lbl">Refreshing...</span>`;
    await loadPlayers();
    setTimeout(() => { btn.disabled = false; btn.innerHTML = original; }, 500);
});

// ---------------------------------------------------------------------------
// Rendering: overall list, podium, tier columns, pagination
// ---------------------------------------------------------------------------
function tiersHTML(p) {
    const sorter = (a, b) => (TIER_ORDER[a[1]] ?? 999) - (TIER_ORDER[b[1]] ?? 999);
    const line = (arr) => arr.map((gm) => [gm, p.tiers?.[gm] || null, p.peakTiers?.[gm]]).sort(sorter).map(([gm, t, pk]) => chip(gm, t, pk)).join("");
    return `<div class="tline"><span class="gl">Main</span>${line(ALL_GAMEMODES.main)}</div>` +
        `<div class="tline"><span class="gl">Sub</span>${line(ALL_GAMEMODES.sub)}<span class="sp"></span><span class="gl lim">Limited</span>${line(ALL_GAMEMODES.limited)}</div>`;
}

const dataAttrs = (p) => `data-name="${esc(p.name)}" data-points="${esc(p.points)}" data-tiers="${esc(JSON.stringify(p.tiers || {}))}"`;

function podiumHTML(top) {
    return `<div class="podium">${top.map((p, i) => {
        const b = getBadge(p.points);
        return `<div class="pod p${i + 1}" ${dataAttrs(p)} tabindex="0" role="button">
            <span class="medal">${i + 1}</span>
            ${avatarImg(p)}
            <h3><span>${esc(p.name)}</span>${regionTag(p.region)}</h3>
            <div class="pod-pts"><span class="pts ${b.class}">${p.points} pts</span><span class="badge ${b.class}">${b.label}</span></div>
            <div class="pod-tiers">${bestTiers(p).map(([gm, t]) => chip(gm, t)).join("")}</div>
        </div>`;
    }).join("")}</div>`;
}

function rowHTML(p, rank) {
    const b = getBadge(p.points);
    return `<div class="prow" ${dataAttrs(p)} tabindex="0" role="button">
        <div class="rank">${rank}</div>
        <div class="who">${avatarImg(p)}<div class="who-meta">
            <div class="who-name"><span>${esc(p.name)}</span>${regionTag(p.region)}</div>
            <div class="who-pts"><span class="pts ${b.class}">${p.points} pts</span><span class="badge ${b.class}">${b.label}</span></div>
        </div></div>
        <div class="tiers">${tiersHTML(p)}</div>
    </div>`;
}

function renderTierColumns(list, container) {
    const groups = [[], [], [], [], []];
    const mapping = {};
    for (let n = 1; n <= 5; n++) for (const t of ["HT", "LT", "RHT", "RLT"]) mapping[`${t}${n}`] = n - 1;
    list.forEach((p) => {
        const code = p.tiers?.[currentGamemode];
        if (code in mapping) groups[mapping[code]].push({ p, code });
    });
    const total = groups.reduce((n, g) => n + g.length, 0);
    if (!total) { container.innerHTML = `<div class="state"><h3>No players here yet</h3><p>Nobody has a tier in ${esc(GM_LABEL[currentGamemode])} that matches your search.</p></div>`; return 0; }

    const icons = ["tier_1", "tier_2", "tier_3", "tier_45", "tier_45"].map((f) => fixAssetPath(`assets/icons/${f}.svg`));
    container.innerHTML = `<div class="cols">${groups.map((g, i) => `
        <section class="col">
            <div class="col-head t${i + 1}"><img src="${icons[i]}" alt="" onerror="this.style.display='none';">Tier ${i + 1}<span class="count">${g.length}</span></div>
            <div class="col-body">${g.length ? g.map(({ p, code }) => {
                const high = /HT/.test(code), retired = /^R/.test(code);
                return `<div class="cp ${high ? "hi" : ""} ${retired ? "retired" : ""}" ${dataAttrs(p)} tabindex="0" role="button">
                    ${avatarImg(p)}
                    <span class="cp-name"><span>${esc(p.name)}</span>${regionTag(p.region)}</span>
                    <span class="cp-icons">
                        ${retired ? `<img src="${fixAssetPath("assets/icons/retired_icon.svg")}" alt="Retired" title="Retired" onerror="this.style.display='none';">` : ""}
                        <img src="${fixAssetPath(high ? "assets/icons/ht_icon.svg" : "assets/icons/lt_icon.svg")}" alt="${high ? "HT" : "LT"}" title="${code}" onerror="this.style.display='none';">
                    </span></div>`;
            }).join("") : `<div class="empty">No players in this tier</div>`}</div>
        </section>`).join("")}</div>`;
    return total;
}

function pagerHTML(totalPages, totalPlayers) {
    if (totalPages <= 1) return "";
    const start = (currentPage - 1) * playersPerPage + 1;
    const end = Math.min(currentPage * playersPerPage, totalPlayers);
    const btn = (n) => `<button class="pg${n === currentPage ? " on" : ""}" data-page="${n}">${n}</button>`;
    let nums = "";
    const s = Math.max(1, currentPage - 2), e = Math.min(totalPages, currentPage + 2);
    if (s > 1) { nums += btn(1); if (s > 2) nums += `<span class="dots">...</span>`; }
    for (let i = s; i <= e; i++) nums += btn(i);
    if (e < totalPages) { if (e < totalPages - 1) nums += `<span class="dots">...</span>`; nums += btn(totalPages); }
    return `<div class="pager">
        <button class="pg" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>← Previous</button>
        ${nums}
        <span class="info">Showing ${start}-${end} of ${totalPlayers} players</span>
        <button class="pg" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>Next →</button>
    </div>`;
}

function setHead(title, sub) {
    $("resultsTitle").textContent = title;
    $("resultsSub").textContent = sub;
}

function renderPlayers() {
    syncModeUI();
    const box = $("playerList");
    const query = $("searchBox").value;
    renderFilterChips(query);
    if (players.length) $("statPlayers").textContent = players.length;

    if (currentGamemode === "ltm") {
        setHead("Limited-time modes", "");
        box.innerHTML = `<div class="ltm"><h2>Limited-time modes are coming soon</h2>
            <p>We're working on implementing LTMs, which will include <strong>custom limited-time kits</strong> for future Minecraft updates and special servers. A few other things will take priority for now :)</p></div>`;
        return;
    }

    let filtered = advancedSearch.search(query);

    if (currentGamemode === "overall") {
        players.forEach((p) => (p.points = calculatePoints(p)));
        allPlayersRanking = [...players].sort(byPoints);
        if (selectedRegions.size > 0) filtered = filtered.filter((p) => p.region && selectedRegions.has(p.region.toLowerCase()));
        filtered.forEach((p) => (p.points = calculatePoints(p)));
        filtered.sort(byPoints);
    } else {
        filtered.forEach((p) => (p.points = tierPoints[p.tiers?.[currentGamemode]] || 0));
        filtered.sort(byPoints);
    }

    if (!players.length) return;
    if (!filtered.length) {
        setHead(currentGamemode === "overall" ? "Overall rankings" : `${GM_LABEL[currentGamemode]} tier list`, "0 players");
        box.innerHTML = `<div class="state"><h3>No players found</h3><p>Try a different name, or remove a filter.</p></div>`;
        return;
    }

    if (currentGamemode !== "overall") {
        const n = renderTierColumns(filtered, box);
        setHead(`${GM_LABEL[currentGamemode]} tier list`, `${n} ranked in ${GM_LABEL[currentGamemode]}`);
        return;
    }

    const totalPlayers = filtered.length;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);
    if (currentPage > totalPages) currentPage = 1;
    const startIndex = (currentPage - 1) * playersPerPage;
    const pageSlice = filtered.slice(startIndex, startIndex + playersPerPage);
    const rankOf = (p, idx) => (selectedRegions.size > 0 ? allPlayersRanking.findIndex((x) => x.name === p.name) + 1 : startIndex + idx + 1);

    const showPodium = !query.trim() && selectedRegions.size === 0 && currentPage === 1 && pageSlice.length >= 3;
    const podium = showPodium ? podiumHTML(pageSlice.slice(0, 3)) : "";
    const rest = showPodium ? pageSlice.slice(3) : pageSlice;
    const offset = showPodium ? 3 : 0;

    box.innerHTML = podium + `<div class="rows">${rest.map((p, i) => rowHTML(p, rankOf(p, i + offset))).join("")}</div>` + pagerHTML(totalPages, totalPlayers);
    setHead("Overall rankings", `${totalPlayers} player${totalPlayers === 1 ? "" : "s"}${selectedRegions.size ? " in " + [...selectedRegions].map((r) => REGION_NAMES[r]).join(", ") : ""}`);
}

// Delegated interactions on the list
$("playerList").addEventListener("click", (e) => {
    const pg = e.target.closest("[data-page]");
    if (pg && !pg.disabled) { currentPage = parseInt(pg.dataset.page); renderPlayers(); $("modebar").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const el = e.target.closest("[data-name]");
    if (el) { const p = players.find((x) => x.name === el.dataset.name); if (p) openPlayerModal(p); }
});
$("playerList").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const el = e.target.closest("[data-name]");
    if (el) { const p = players.find((x) => x.name === el.dataset.name); if (p) openPlayerModal(p); }
});

// Page size
try {
    const saved = localStorage.getItem("playersPerPage");
    if (saved) { playersPerPage = parseInt(saved); $("pageSizeSelector").value = saved; }
} catch {}
$("pageSizeSelector").addEventListener("change", (e) => {
    playersPerPage = parseInt(e.target.value);
    try { localStorage.setItem("playersPerPage", String(playersPerPage)); } catch {}
    currentPage = 1;
    renderPlayers();
});

// ---------------------------------------------------------------------------
// Player profile drawer
// ---------------------------------------------------------------------------
class PlayerBioSystem {
    constructor() { this.bios = new Map(); this.loadFromStorage(); }
    setBio(name, data) { this.bios.set(name, { ...data, lastUpdated: Date.now() }); this.saveToStorage(); }
    getBio(name) { return this.bios.get(name) || null; }
    saveToStorage() {
        try { localStorage.setItem("tierlist_bios", JSON.stringify(Array.from(this.bios.entries()))); }
        catch (e) { console.warn("Could not save bios:", e); }
    }
    loadFromStorage() {
        try {
            const stored = localStorage.getItem("tierlist_bios");
            if (stored) this.bios = new Map(JSON.parse(stored));
        } catch (e) { console.warn("Could not load bios:", e); }
    }
    renderBio(name) {
        const bio = this.getBio(name);
        if (!bio) return `<div class="bio empty">No bio available</div>`;
        const s = bio.socials || {};
        const safe = (u) => (/^https?:\/\//i.test(u) ? esc(u) : "#");
        const socials = [
            s.youtube ? `<a class="soc yt" href="${safe(s.youtube)}" target="_blank" rel="noopener">YouTube</a>` : "",
            s.twitch ? `<a class="soc tw" href="${safe(s.twitch)}" target="_blank" rel="noopener">Twitch</a>` : "",
            s.twitter ? `<a class="soc x" href="${safe(s.twitter)}" target="_blank" rel="noopener">Twitter</a>` : "",
            s.discord ? `<span class="soc dc">Discord: ${esc(s.discord)}</span>` : ""
        ].join("");
        return `<div class="bio">
            ${bio.description ? `<p>${esc(bio.description)}</p>` : ""}
            ${socials ? `<div class="socials">${socials}</div>` : ""}
            ${bio.favGamemode ? `<div class="meta"><strong>Favorite gamemode:</strong> ${esc(bio.favGamemode)}</div>` : ""}
            ${bio.playstyle ? `<div class="meta"><strong>Playstyle:</strong> ${esc(bio.playstyle)}</div>` : ""}
        </div>`;
    }
}
const playerBioSystem = new PlayerBioSystem();
playerBioSystem.setBio("ImApo", {
    description: "Creator and developer of the Bunny Tiers. Casual PvP player with an aggressive playstyle.",
    socials: { youtube: "https://www.youtube.com/@Im-Apo", discord: "im_apo_" },
    favGamemode: "UHC", playstyle: "Aggressive"
});
playerBioSystem.setBio("Meraliu", {
    description: "Owner of the MissMorphs animal castle - I also really like Bunnies. 🦭",
    socials: { youtube: "https://www.youtube.com/@ImMeraliu", discord: "meraliu" },
    favGamemode: "Spear Mace", playstyle: "Bunny"
});
function setPlayerBio(playerName, bio) { playerBioSystem.setBio(playerName, bio); }

function openPlayerModal(player) {
    const totalPoints = calculatePoints(player);
    const badge = getBadge(totalPoints);
    const sortedTiers = Object.entries(player.tiers || {}).filter(([, t]) => t).sort(([, a], [, b]) => (TIER_ORDER[a] ?? 999) - (TIER_ORDER[b] ?? 999));
    const validRegion = player.region && REGIONS.includes(player.region.toLowerCase());
    const rank = getPlayerRank(player.name);
    const rankClass = rank === 1 ? "rank-1-name" : rank === 2 ? "rank-2-name" : rank === 3 ? "rank-3-name" : "";
    const hasHistory = player.tierHistory && Object.keys(player.tierHistory).some((gm) => player.tierHistory[gm]?.length > 0);

    $("modalBody").innerHTML = `
        <div class="pl-head">
            ${avatarImg(player)}
            <div>
                <h2><span class="${rankClass}">${esc(player.name)}</span>${validRegion ? regionTag(player.region) : ""}</h2>
                <div class="pl-pts"><span class="pts ${badge.class}">${totalPoints} points</span><span class="badge ${badge.class}">${badge.label}</span></div>
                ${rank ? `<div class="rk">Rank #${rank} in ${esc(GM_LABEL[currentGamemode] || "Overall")}</div>` : ""}
            </div>
        </div>
        <div class="actions">
            <button class="btn" id="nameMcBtn"><svg viewBox="0 0 24 24"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm5 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/></svg>View on NameMC</button>
            ${hasHistory ? `<button class="btn" id="historyBtn"><svg viewBox="0 0 24 24"><path d="M13.5 8H12v5l4.28 2.54.72-1.21-3.5-2.08V8zM13 3a9 9 0 0 0-9 9H1l3.96 4.03L9 12H6a7 7 0 1 1 2.05 4.95l-1.41 1.41A9 9 0 1 0 13 3z"/></svg>View tier history</button>` : ""}
            <button class="btn primary" id="openCompareFromProfile">Compare with another player</button>
        </div>
        <div class="block"><h3>Tiers</h3>
            ${sortedTiers.length ? `<div class="tgrid">${sortedTiers.map(([gm, tier]) => `
                <div class="tcell" data-t="${esc(tierKey(tier))}"><span class="ico">${icoImg(gm)}</span>${pill(tier)}<small>${esc(GM_LABEL[gm] || gm)}</small></div>`).join("")}</div>`
                : `<div class="bio empty">No tiers yet</div>`}
        </div>
        <div class="block"><h3>Player bio</h3>${playerBioSystem.renderBio(player.name)}</div>`;

    $("nameMcBtn").addEventListener("click", () => window.open(`https://namemc.com/profile/${encodeURIComponent(player.name)}`, "_blank"));
    $("historyBtn")?.addEventListener("click", () => openTierHistoryModal(player));
    $("openCompareFromProfile").addEventListener("click", () => {
        closeOverlay("playerModal");
        populatePlayerDatalist();
        $("player1Input").value = player.name;
        $("player2Input").value = "";
        $("player1Box").classList.add("sel");
        $("player2Box").classList.remove("sel");
        $("executeCompare").disabled = true;
        $("comparisonResult").innerHTML = "";
        openOverlay("comparisonModal");
        $("player2Input").focus();
    });
    openOverlay("playerModal");
}

// ---------------------------------------------------------------------------
// Tier history
// ---------------------------------------------------------------------------
function renderTierHistory(player, gamemode) {
    const history = player.tierHistory?.[gamemode];
    if (!history || !history.length) return `<div class="no-history">No tier history available for this gamemode</div>`;
    return `<div class="timeline">${history.map((entry) => {
        const date = new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return `<div class="tl" data-t="${esc(tierKey(entry.tier))}" title="${esc(entry.tier)} - ${date}${entry.note ? " (" + esc(entry.note) + ")" : ""}">
            <span class="dot"></span>${pill(entry.tier)}<span class="date">${date}</span>${entry.note ? `<span class="nt">${esc(entry.note)}</span>` : ""}
        </div>`;
    }).join("")}</div>`;
}

function openTierHistoryModal(player) {
    const games = Object.keys(player.tierHistory || {}).filter((gm) => player.tierHistory[gm]?.length > 0);
    if (!games.length) return;
    const body = $("tierHistoryBody");
    body.innerHTML = `
        <div class="pl-head">${avatarImg(player)}<div><h2><span>${esc(player.name)}</span></h2><div class="lede" style="margin:4px 0 0">Tier history</div></div></div>
        <div class="gm-picker">${games.map((gm, i) => `<button class="gm-pick${i === 0 ? " on" : ""}" data-gm="${gm}" title="${esc(GM_LABEL[gm] || gm)}" aria-label="${esc(GM_LABEL[gm] || gm)}">${icoImg(gm)}</button>`).join("")}</div>
        <div id="historyChart">${renderTierHistory(player, games[0])}</div>`;
    body.querySelectorAll(".gm-pick").forEach((btn) => btn.addEventListener("click", () => {
        body.querySelectorAll(".gm-pick").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        $("historyChart").innerHTML = renderTierHistory(player, btn.dataset.gm);
    }));
    openOverlay("tierHistoryModal");
}

// ---------------------------------------------------------------------------
// Compare players
// ---------------------------------------------------------------------------
class PlayerComparison {
    compare(p1, p2) {
        const pts = [calculatePoints(p1), calculatePoints(p2)];
        const gms = new Set([...Object.keys(p1.tiers || {}), ...Object.keys(p2.tiers || {})]);
        const gamemodes = {};
        gms.forEach((gm) => {
            const t1 = p1.tiers?.[gm], t2 = p2.tiers?.[gm];
            gamemodes[gm] = { player1: t1 || "N/A", player2: t2 || "N/A", better: this.compareTiers(t1, t2) };
        });
        return { players: [p1.name, p2.name], totalPoints: pts, winner: pts[0] > pts[1] ? p1.name : p2.name, gamemodes };
    }
    compareTiers(a, b) {
        if (!a && !b) return "tie";
        if (!a) return "player2";
        if (!b) return "player1";
        const r1 = TIER_ORDER[a] ?? 999, r2 = TIER_ORDER[b] ?? 999;
        return r1 < r2 ? "player1" : r2 < r1 ? "player2" : "tie";
    }
    renderComparison(c) {
        const [n1, n2] = c.players, [a, b] = c.totalPoints;
        const cell = (t, win) => t === "N/A" ? `<span class="tier" data-t="none">N/A</span>` : `<span class="tier${win ? " win" : ""}" data-t="${esc(tierKey(t))}">${esc(t)}</span>`;
        return `
            <div class="vs">
                <div class="side${a > b ? " win" : ""}"><b>${esc(n1)}</b><div class="big">${a}</div><small>points</small></div>
                <div class="mid">VS</div>
                <div class="side${b > a ? " win" : ""}"><b>${esc(n2)}</b><div class="big">${b}</div><small>points</small></div>
            </div>
            <div class="block"><h3>Gamemode breakdown</h3>
            ${Object.entries(c.gamemodes).map(([gm, d]) => `
                <div class="cmp-row">
                    <div class="l">${cell(d.player1, d.better === "player1")}</div>
                    <div class="gm">${esc(GM_LABEL[gm] || gm)}</div>
                    <div class="r">${cell(d.player2, d.better === "player2")}</div>
                </div>`).join("")}
            </div>`;
    }
}
const playerComparison = new PlayerComparison();

function populatePlayerDatalist() {
    const options = players.map((p) => `<option value="${esc(p.name)}">`).join("");
    $("playerList1").innerHTML = options;
    $("playerList2").innerHTML = options;
}
["player1Input", "player2Input"].forEach((id) => $(id).addEventListener("input", () => {
    const a = $("player1Input").value, b = $("player2Input").value;
    $("executeCompare").disabled = !a || !b;
    $("player1Box").classList.toggle("sel", !!a);
    $("player2Box").classList.toggle("sel", !!b);
}));
$("executeCompare").addEventListener("click", () => {
    const p1 = players.find((p) => p.name === $("player1Input").value);
    const p2 = players.find((p) => p.name === $("player2Input").value);
    $("comparisonResult").innerHTML = p1 && p2
        ? playerComparison.renderComparison(playerComparison.compare(p1, p2))
        : `<div class="err">One or both players were not found. Check the names and try again.</div>`;
});

// ---------------------------------------------------------------------------
// Advanced search
// ---------------------------------------------------------------------------
class AdvancedSearch {
    constructor() { this.searchHistory = this.loadHistory(); }
    loadHistory() { try { return JSON.parse(localStorage.getItem("search_history") || "[]"); } catch { return []; } }
    saveHistory(query) {
        if (!query.trim()) return;
        this.searchHistory = [query, ...this.searchHistory.filter((q) => q !== query)].slice(0, 10);
        try { localStorage.setItem("search_history", JSON.stringify(this.searchHistory)); } catch {}
    }
    parseQuery(query) {
        const tokens = query.toLowerCase().trim().split(/\s+/);
        const filters = {};
        const nameSearch = [];
        tokens.forEach((token) => {
            if (token.startsWith("#")) {
                const tierQuery = token.slice(1).toUpperCase();
                if (/^(HT|LT|RT|RHT|RLT|T\d)/.test(tierQuery)) filters.tier = tierQuery;
            } else if (token.startsWith("@")) filters.region = token.slice(1).toUpperCase();
            else if (token.startsWith(">")) filters.minPoints = parseInt(token.slice(1));
            else if (token.startsWith("<")) filters.maxPoints = parseInt(token.slice(1));
            else if (/^\d+-\d+$/.test(token)) { const [min, max] = token.split("-").map(Number); filters.minPoints = min; filters.maxPoints = max; }
            else if (token.startsWith("!")) filters.badge = token.slice(1);
            else if (token.startsWith(":")) filters.gamemode = token.slice(1);
            else if (token) nameSearch.push(token);
        });
        filters.name = nameSearch.join(" ");
        return filters;
    }
    search(query) {
        const f = this.parseQuery(query);
        return players.filter((player) => {
            if (f.name && !player.name.toLowerCase().includes(f.name)) return false;
            if (f.tier && !this.matchesTierFilter(player, f.tier)) return false;
            if (f.region && player.region?.toUpperCase() !== f.region) return false;
            const points = calculatePoints(player);
            if (f.minPoints && points < f.minPoints) return false;
            if (f.maxPoints && points > f.maxPoints) return false;
            if (f.badge && !getBadge(points).class.includes(f.badge)) return false;
            if (f.gamemode && !player.tiers?.[f.gamemode]) return false;
            return true;
        });
    }
    matchesTierFilter(player, q) {
        const check = (tier) => {
            if (q === "HT") return /^HT\d+$/.test(tier);
            if (q === "LT") return /^LT\d+$/.test(tier);
            if (q === "RT") return /^R/.test(tier);
            if (q === "RHT") return /^RHT\d+$/.test(tier);
            if (q === "RLT") return /^RLT\d+$/.test(tier);
            if (/^T\d+$/.test(q)) return new RegExp(`^(HT|LT|RHT|RLT)${q[1]}$`).test(tier);
            return tier === q;
        };
        return Object.values(player.tiers || {}).some(check);
    }
    getSuggestions(query) {
        if (!query.trim()) return this.searchHistory.map((h) => ({ type: "history", value: h, label: h, icon: "🕒" }));
        const out = [];
        const lq = query.toLowerCase();
        players.forEach((p) => { if (p.name.toLowerCase().includes(lq) && out.length < 5) out.push({ type: "player", value: p.name, label: p.name, icon: "👤" }); });
        if (query.includes("#")) out.push(
            { type: "filter", value: "#ht", label: "High tiers", icon: "🔍" },
            { type: "filter", value: "#lt", label: "Low tiers", icon: "🔍" },
            { type: "filter", value: "#rt", label: "Retired", icon: "🔍" },
            { type: "filter", value: "#t5", label: "All tier 5", icon: "🔍" });
        if (query.includes("@")) ["NA", "EU", "AS", "SA", "ME", "AU", "AF"].forEach((r) => out.push({ type: "filter", value: `@${r.toLowerCase()}`, label: `Region: ${r}`, icon: "🌍" }));
        if (query.includes(":")) Object.keys(kitInfo).forEach((gm) => { if (out.length < 8) out.push({ type: "filter", value: `:${gm}`, label: `Gamemode: ${GM_LABEL[gm] || gm}`, icon: "🎮" }); });
        return out.slice(0, 8);
    }
}
const advancedSearch = new AdvancedSearch();

function renderFilterChips(query) {
    const box = $("activeFilters");
    const tokens = query.trim().split(/\s+/).filter((t) => /^([#@:!<>]|\d+-\d+$)/.test(t) && t.length > 1);
    if (!tokens.length) { box.style.display = "none"; box.innerHTML = ""; return; }
    box.style.display = "flex";
    box.innerHTML = tokens.map((t) => `<span class="fchip">${esc(t)}<button data-token="${esc(t)}" aria-label="Remove filter ${esc(t)}">&times;</button></span>`).join("");
}
$("activeFilters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-token]");
    if (!b) return;
    const input = $("searchBox");
    input.value = input.value.split(/\s+/).filter((t) => t && t !== b.dataset.token).join(" ");
    input.dispatchEvent(new Event("input"));
});

(function initSearch() {
    const input = $("searchBox"), box = $("searchSuggestions"), clear = $("clearSearchBtn");
    let timer;

    const renderSuggestions = (list) => {
        if (!list.length) { box.style.display = "none"; return; }
        box.innerHTML = list.map((s) => `<div class="sugg" data-type="${s.type}" data-value="${esc(s.value)}">
            <span class="si">${s.icon}</span><div><b>${esc(s.label)}</b>${s.type === "filter" ? "<small>Click to add filter</small>" : ""}</div></div>`).join("");
        box.style.display = "block";
    };

    input.addEventListener("input", (e) => {
        if (e.target.value === "/") e.target.value = "";
        const query = e.target.value;
        clear.style.display = query ? "grid" : "none";
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (query.trim()) renderSuggestions(advancedSearch.getSuggestions(query)); else box.style.display = "none";
            currentPage = 1;
            renderPlayers();
            const u = new URL(location.href);
            query.trim() ? u.searchParams.set("q", query) : u.searchParams.delete("q");
            history.replaceState(history.state, "", u);
        }, 250);
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { advancedSearch.saveHistory(input.value); box.style.display = "none"; } });
    input.addEventListener("focus", () => { if (input.value.trim()) renderSuggestions(advancedSearch.getSuggestions(input.value)); });
    input.addEventListener("blur", () => setTimeout(() => (box.style.display = "none"), 200));

    box.addEventListener("mousedown", (e) => e.preventDefault());
    box.addEventListener("click", (e) => {
        const item = e.target.closest(".sugg");
        if (!item) return;
        input.value = item.dataset.type === "filter" ? (input.value.trim() + " " + item.dataset.value) : item.dataset.value;
        if (item.dataset.type !== "filter") advancedSearch.saveHistory(input.value);
        input.focus();
        input.dispatchEvent(new Event("input"));
    });

    clear.addEventListener("click", () => {
        input.value = "";
        clear.style.display = "none";
        input.dispatchEvent(new Event("input"));
        input.focus();
    });
    $("searchHelpBtn").addEventListener("click", () => openOverlay("searchHelpModal"));
})();

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------
function updateRegionCheckboxes() {
    document.querySelectorAll('#regionFilterModal input[type="checkbox"]').forEach((c) => (c.checked = selectedRegions.has(c.value)));
}
function openRegionFilter() { updateRegionCheckboxes(); openOverlay("regionFilterModal"); }
$("regionBtn").addEventListener("click", openRegionFilter);
document.addEventListener("contextmenu", (e) => {
    if (e.target.closest('.mode[data-gamemode="overall"]') && currentGamemode === "overall") { e.preventDefault(); openRegionFilter(); }
});
$("regionFilterModal").addEventListener("change", (e) => {
    if (e.target.type !== "checkbox") return;
    e.target.checked ? selectedRegions.add(e.target.value) : selectedRegions.delete(e.target.value);
    if (REGIONS.every((r) => selectedRegions.has(r))) { selectedRegions.clear(); updateRegionCheckboxes(); }
    currentPage = 1;
    renderPlayers();
});
$("clearRegions").addEventListener("click", () => { selectedRegions.clear(); updateRegionCheckboxes(); currentPage = 1; renderPlayers(); });

// ---------------------------------------------------------------------------
// Info dialogs, header buttons
// ---------------------------------------------------------------------------
(function buildTierInfo() {
    const rows = (prefix, nums, kinds) => nums.flatMap((n) => kinds.map((k) => {
        const t = `${prefix}${k}${n}`;
        return `<tr data-t="${tierKey(t)}"><td>${pill(t)}</td><td>${tierPoints[t]}</td></tr>`;
    })).join("");
    $("tierPointsBody").innerHTML = rows("", [1, 2, 3, 4, 5], ["HT", "LT"]);
    $("retiredPointsBody").innerHTML = rows("R", [1, 2], ["HT", "LT"]);
})();

$("tierInfoBtn").addEventListener("click", () => openOverlay("tierInfoModal"));
$("kitInfoBtn").addEventListener("click", () => {
    const info = kitInfo[currentGamemode];
    if (!info) return;
    $("kitInfoTitle").textContent = info.title;
    $("kitInfoDesc").textContent = info.description;
    $("kitInfoImage").querySelector("img").src = info.image;
    openOverlay("kitInfoModal");
});
$("copyIpBtn").addEventListener("click", () => toast("Not officially linked with any server"));
$("discordBtn").addEventListener("click", () => window.open("https://discord.gg/zMqy5QbevP", "_blank"));
$("apolloBtn").addEventListener("click", () => (window.location.href = "https://im-apo.github.io/ApolloRPG/"));
$("ronBtn").addEventListener("click", () => (window.location.href = "https://im-apo.github.io/SealTiers/StellarTiers/"));
$("themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
});

// Close buttons + backdrop clicks for every overlay
[["closeModal", "playerModal"], ["closeTierHistory", "tierHistoryModal"], ["closeTierInfo", "tierInfoModal"], ["closeKitInfo", "kitInfoModal"],
 ["closeComparison", "comparisonModal"], ["closeSearchHelp", "searchHelpModal"], ["closeActivityFeed", "activityFeedModal"]]
    .forEach(([btn, id]) => $(btn).addEventListener("click", () => closeOverlay(id)));
document.querySelector(".close-region-filter").addEventListener("click", () => closeOverlay("regionFilterModal"));
document.querySelectorAll(".overlay").forEach((o) => o.addEventListener("click", (e) => { if (e.target === o) o.classList.remove("open"); }));

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeAllOverlays(); return; }
    const t = e.target;
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) { e.preventDefault(); $("searchBox").focus(); }
});

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------
$("activityFeedBtn").addEventListener("click", () => {
    const items = [];
    players.forEach((p) => Object.entries(p.tierHistory || {}).forEach(([gm, h]) => (h || []).forEach((e) => e && e.date && items.push({ p, gm, e, d: new Date(e.date) }))));
    items.sort((a, b) => b.d - a.d);
    $("activityList").innerHTML = items.length ? items.slice(0, 30).map(({ p, gm, e, d }) => `
        <div class="act">${avatarImg(p)}<div><strong>${esc(p.name)}</strong> reached ${pill(e.tier)} in ${esc(GM_LABEL[gm] || gm)}
        <small>${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}${e.note ? " · " + esc(e.note) : ""}</small></div></div>`).join("")
        : `<div class="no-history">No recent activity yet</div>`;
    openOverlay("activityFeedModal");
});

// ---------------------------------------------------------------------------
// Context menu (right-click a player)
// ---------------------------------------------------------------------------
const contextMenu = $("playerContextMenu");
let contextPlayer = null;
$("playerList").addEventListener("contextmenu", (e) => {
    const row = e.target.closest("[data-name]");
    if (!row) return;
    e.preventDefault();
    contextPlayer = { name: row.dataset.name, points: row.dataset.points, tiers: row.dataset.tiers };
    contextMenu.querySelector(".lbl").textContent = `Profile - ${contextPlayer.name}`;
    contextMenu.style.display = "block";
    const w = contextMenu.offsetWidth, h = contextMenu.offsetHeight;
    contextMenu.style.left = `${Math.min(e.clientX, innerWidth - w - 8)}px`;
    contextMenu.style.top = `${Math.min(e.clientY, innerHeight - h - 8)}px`;
});
contextMenu.addEventListener("click", (e) => {
    if (!contextPlayer) return;
    const action = e.target.dataset.action;
    if (action === "username") copyText(contextPlayer.name, "Username copied");
    else if (action === "tiers") copyText(contextPlayer.tiers, "Tiers copied");
    contextMenu.style.display = "none";
});
document.addEventListener("click", (e) => { if (!contextMenu.contains(e.target)) contextMenu.style.display = "none"; });

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
(function init() {
    window.loadStartTime = Date.now();
    const fromURL = getGamemodeFromURL();
    if (location.pathname.startsWith(BASE_PATH + "rankings") && !VALID_GAMEMODES.includes(fromURL)) history.replaceState(null, "", BASE_PATH + "rankings/overall");
    if (VALID_GAMEMODES.includes(fromURL)) applyGamemode(fromURL); else { updateURL("overall"); applyGamemode("overall"); }
    const q = new URLSearchParams(location.search).get("q");
    if (q) { $("searchBox").value = q; $("clearSearchBtn").style.display = "grid"; }
    syncModeUI();
    loadPlayers();
})();

console.log(`MIT License

Copyright (c) 2026 ImApo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`);

console.log(`-----------------------------------------------------------------------------------
If Website appears to be Down Contact ImApo Immediately
discord: cxnine._ Bunny Discord Server: https://discord.gg/zMqy5QbevP
-----------------------------------------------------------------------------------`);

// ---------------------------------------------------------------------------
// Protection system (kept from the original site)
// ---------------------------------------------------------------------------
document.addEventListener("contextmenu", (e) => {
    const allowed = e.target.closest("[data-name]") || e.target.closest('.mode[data-gamemode="overall"]') || e.target.closest("input, textarea");
    if (!allowed) e.preventDefault();
});
document.addEventListener("keydown", (e) => {
    if (IS_LOCAL || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    let blocked = false;
    if (e.key === "F12") blocked = true;
    if (e.ctrlKey && e.shiftKey && ["I", "J", "C", "i", "j", "c"].includes(e.key)) blocked = true;
    if (e.ctrlKey && ["u", "U", "s", "S", "a", "A", "p", "P"].includes(e.key)) blocked = true;
    if (blocked) { e.preventDefault(); e.stopPropagation(); return false; }
}, true);
if (!IS_LOCAL) setInterval(() => {
    console.clear();
    console.log("%c🔒 Bunny Tiers — All Rights Reserved", "color:#ff003c;font-size:14px;font-weight:bold;");
}, 1500);
document.addEventListener("selectstart", (e) => {
    const el = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    if (el && el.closest("input, textarea")) return;
    e.preventDefault();
});
