if (sessionStorage.redirect) {
  const redirectPath = sessionStorage.redirect;
  delete sessionStorage.redirect;
  history.replaceState(null, '', redirectPath);
}

if (
  location.pathname.startsWith('/StellarTiers/rankings') &&
  !/^\/StellarTiers\/rankings\/(overall|crystal|smp|diasmp|sword|axe|uhc|potion|nethpot|mace|speed|elytra|cart|ogvanilla|nethuhc|nethsword|ltm)?\/?$/.test(location.pathname)
) {
  location.replace('/StellarTiers/rankings/overall');
}


const STANDBY_TIER_CONFIG = {
    enabled: true,
    showIcon: true,
    opacity: 0.35,
    label: '-'
};

const ALL_GAMEMODES = {
    main: ['crystal', 'sword', 'uhc', 'potion', 'nethpot', 'smp', 'axe', 'mace', 'diasmp'],
    sub: ['speed', 'elytra', 'cart', 'ogvanilla'],
    limited: ['nethuhc', 'nethsword', 'ltm']
};

// Redirect invalid gamemode URLs safely
document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;
  const validGamemodes = [
    'overall', 'crystal', 'smp', 'diasmp', 'sword', 'axe', 'uhc', 'potion',
    'nethpot', 'mace', 'speed', 'elytra', 'cart', 'ogvanilla',
    'nethuhc', 'nethsword', 'ltm'
  ];

  const match = path.match(/\/StellarTiers\/rankings\/([^\/]+)/);
  const gamemode = match ? match[1] : null;

  // Only redirect if we’re inside /rankings but gamemode is invalid
  if (path.startsWith('/StellarTiers/rankings') && !validGamemodes.includes(gamemode)) {
    history.replaceState(null, '', '/StellarTiers/rankings/overall');
  }

  // Then initialize app normally
  initializeFromURL();
});

const ASSET_BASE = "/StellarTiers/";
const fixAssetPath = (path) => path.startsWith("assets/") ? ASSET_BASE + path : path;


const tierPoints = {
    RHT0: 200,
    RLT0: 100,
    HT0: 200,
    LT0: 100,
    RHT1: 85,
    RLT1: 70,
    HT1: 85,
    LT1: 70,
    RHT2: 50,
    RLT2: 40,
    HT2: 50,
    LT2: 40,
    RHT3: 20,
    RLT3: 15,
    HT3: 20,
    LT3: 15,
    RHT4: 8,
    RLT4: 6,
    HT4: 8,
    LT4: 6,
    RHT5: 4,
    RLT5: 2,
    HT5: 4,
    LT5: 2,
    RHT6: -10,
    RLT6: -20,
    HT6: -10,
    LT6: -20,
};

let players = [];
let currentGamemode = "overall";
let currentPage = 1;
let playersPerPage = 50;
let isLoadingMore = false;
let displayedPlayers = 0;
const INITIAL_LOAD = 15; // Load 15 players initially
const LOAD_MORE_COUNT = 10; // Load 10 more when scrolling
let filteredPlayers = []; // Store filtered players globally

// Kit information data
const kitInfo = {
    crystal: {
        title: "Crystal PvP Kit",
        description:
            "Advanced end crystal combat loadout with heavy emphasis on explosive warfare. Features extensive supplies of ender pearls for mobility, chorus fruit for emergency escapes, and respawn anchors for additional explosive options. The multiple diamond and obsidian blocks enable rapid crystal placement and defensive structures. Purple shulker boxes provide portable storage for extended engagements.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Crystal.png"),
    },
    smp: {
        title: "SMP Kit",
        description:
            "Standard survival multiplayer combat loadout with balanced resources. Full netherite protection with comprehensive potion support including healing, speed, and combat buffs. Purple shulker box for storage.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Smp.png"),
    },
    diasmp: {
        title: "Diamond SMP Kit",
        description:
            "Traditional diamond-tier SMP combat with balanced approach. Full diamond armor with extensive golden apple reserves and varied potions for adaptable fighting.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Diasmp.png"),
    },
    sword: {
        title: "Sword PvP Kit",
        description:
            "Pure sword combat minimalist setup focusing on fundamental melee mechanics. Clean inventory allowing focus on combos, strafing, and movement without distraction.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Sword.png"),
    },
    axe: {
        title: "Axe PvP Kit",
        description:
            "Axe-focused combat with emphasis on timing and high damage output. Minimal loadout designed for shield-breaking mechanics and cooldown-based attacks.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Axe.png"),
    },
    uhc: {
        title: "UHC Kit",
        description:
            "Ultra Hardcore optimized loadout emphasizing careful resource management. Golden apples are critical since natural regeneration is disabled. Balanced combat tools with strategic potion selection.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Uhc.png"),
    },
    nethuhc: {
        title: "Netherite UHC Kit",
        description:
            "Ultra Hardcore Netherite optimized loadout emphasizing careful resource management. Golden apples are critical since natural regeneration is disabled. Balanced combat tools with strategic potion selection.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/NethUhc.png"),
    },
    potion: {
        title: "Potion PvP Kit",
        description:
            "High-intensity potion warfare loadout with extensive splash potion arsenal. Features multiple types of instant damage, poison, and debuff potions for aggressive play, alongside healing and regeneration options. Golden carrots provide sustained saturation.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Potion.png"),
    },
    nethpot: {
        title: "Netherite Potion Kit",
        description:
            "Enhanced potion combat with full netherite protection. Combines the speed of potion PvP with superior armor durability and knockback resistance. Heavy focus on golden apples and fish for sustained healing between potion exchanges.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Nethpot.png"),
    },
    nethsword: {
        title: "Netherite Sword Kit",
        description:
            "Pure sword combat (But Netherite!) minimalist setup focusing on fundamental melee mechanics. Clean inventory allowing focus on combos, strafing, and movement without distraction.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/NethSword.png"),
    },
    mace: {
        title: "Mace Kit",
        description:
            "Vertical combat specialist kit built around the mace's fall damage mechanics introduced in 1.21. Features mace as primary weapon with golden apples for survivability. Potions provide mobility buffs and combat advantages for devastating smash attacks from height.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Mace.png"),
    },
    speed: {
        title: "Speed PvP Kit",
        description:
            "High-velocity combat kit dominated by splash potions for sustained speed effects. Minimal equipment to maximize movement speed and agility during combat.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Speed.png"),
    },
    elytra: {
        title: "Elytra Kit",
        description:
            "Aerial combat specialist with focus on elytra flight mechanics. Multiple milk buckets for clearing negative effects mid-flight, alongside food, potions, and honey for landing safety.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Elytra.png"),
    },
    trident: {
        title: "Trident Kit",
        description:
            "Minimalist trident-focused combat setup emphasizing aquatic mobility and ranged attacks. Clean loadout designed for riptide propulsion and loyalty mechanics with room for tactical flexibility.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Trident.png"),
    },
    cart: {
        title: "Minecart Kit",
        description:
            "Minecart-based combat utilizing rails, momentum, and vehicle mechanics for unique movement-based fighting strategies.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Cart.png"),
    },
    bed: {
        title: "Bed Kit",
        description:
            "Bedwars-style combat setup with building materials and utility items. Features swords, bows, and tools for rapid base construction and destruction. Includes TNT, beds, and various blocks for tactical gameplay.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Bed.png"),
    },
    bow: {
        title: "Bow Kit",
        description:
            "Archery-focused minimalist kit emphasizing ranged superiority. Features multiple bows and arrows for sustained ranged pressure with basic melee backup.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Bow.png"),
    },
    creeper: {
        title: "Creeper Kit",
        description:
            "Explosive-themed combat with milk buckets for clearing debuffs and golden apples for survival. Includes tools and materials for tactical positioning around explosion mechanics.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Creeper.png"),
    },
    debuff: {
        title: "Debuff Kit",
        description:
            "Status effect warfare specialist with heavy emphasis on negative splash potions. Arsenal designed to weaken opponents while maintaining personal advantages through strategic debuff application.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/DeBuff.png"),
    },
    diasurv: {
        title: "Diamond Survival Kit",
        description:
            "Diamond-tier crystal PvP combat with end crystal explosive warfare. Features extensive supplies of ender pearls for mobility, chorus fruit for emergency escapes, and respawn anchors for additional explosive options. Diamond armor provides solid protection while maintaining the core crystal combat mechanics with diamond and obsidian blocks for rapid placement.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/DiaSurv.png"),
    },
    manhunt: {
        title: "Manhunt Kit",
        description:
            "Diverse survival combat kit mirroring speedrunning scenarios. Includes crafting materials, tools for rapid resource gathering, and combat essentials for fighting while on the move. Features water buckets, beds for respawn setting, and golden apples for clutch healing.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/Manhunt.png"),
    },
    ogvanilla: {
        title: "OG Vanilla Kit",
        description:
            "Classic vanilla Minecraft combat with traditional techniques and straightforward gameplay. Focuses on fundamental combat skills without specialized mechanics or modern additions.\n\nWhen a tier testing queue opens for this kit, be sure to join right away to secure your test spot. LT3 tests and below have a 3-day cooldown, while HT3 and higher come with a 7-day cooldown, so plan accordingly!",
        image: fixAssetPath("assets/kits/OgVanilla.png"),
    },
};

function calculatePeakTier(currentTier, peakTier) {
    if (!peakTier || !currentTier) return null;
    
    // Lower rank number = better tier (HT1 is better than LT1)
    const tierRank = {
        'HT0': 0, 'LT0': 1, 'RHT0': 0, 'RLT0': 1,
        'HT1': 2, 'LT1': 3, 'RHT1': 2, 'RLT1': 3,
        'HT2': 4, 'LT2': 5, 'RHT2': 4, 'RLT2': 5,
        'HT3': 6, 'LT3': 7, 'RHT3': 6, 'RLT3': 7,
        'HT4': 8, 'LT4': 9, 'RHT4': 8, 'RLT4': 9,
        'HT5': 10, 'LT5': 11, 'RHT5': 10, 'RLT5': 11,
        'HT6': 12, 'LT6': 13, 'RHT6': 12, 'RLT6': 13,
    };
    
    const currentRank = tierRank[currentTier] ?? 999;
    const peakRank = tierRank[peakTier] ?? 999;
    
    // Peak tier has LOWER rank number (better), so show tooltip
    if (peakRank < currentRank) {
        return { isPeak: false, peakTier: peakTier, showTooltip: true };
    }
    // Current is at peak or better
    return { isPeak: true, peakTier: currentTier, showTooltip: false };
}

function getGamemodeFromURL() {
    const path = window.location.pathname;
    const match = path.match(/\/rankings\/([^\/]+)/);
    return match ? match[1] : 'overall';
}

// Update the URL without reloading the page
function updateURL(gamemode) {
    const newPath = `/StellarTiers/rankings/${gamemode}`;
    window.history.pushState({ gamemode }, '', newPath);
}

// Initialize the page based on URL on first load
function initializeFromURL() {
    const gamemodeFromURL = getGamemodeFromURL();
    
    // All valid gamemodes from your site
    const validGamemodes = [
        'overall', 'crystal', 'smp', 'diasmp', 'sword', 'axe', 'uhc', 'potion',
        'nethpot', 'mace', 'speed', 'elytra', 'cart', 'ogvanilla', 'nethuhc',
        'nethsword', 'ltm'
    ];
    
    if (validGamemodes.includes(gamemodeFromURL)) {
        currentGamemode = gamemodeFromURL;
    } else {
        // Redirect to overall if invalid gamemode
        updateURL('overall');
        currentGamemode = 'overall';
    }
    
    // Update active tab in UI
    document.querySelectorAll('.gamemode-tab').forEach(tab => {
        if (tab.dataset.gamemode === currentGamemode) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    updateKitInfoButton();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.gamemode) {
        currentGamemode = event.state.gamemode;
    } else {
        currentGamemode = getGamemodeFromURL();
    }
    
    // Update active tab
    document.querySelectorAll('.gamemode-tab').forEach(tab => {
        if (tab.dataset.gamemode === currentGamemode) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    currentPage = 1;
    updateKitInfoButton();
    renderPlayers();
});


function createTierWithTooltip(gamemode, tier, peakTier, iconSrc) {
    const tierClass = tier.toLowerCase();
    const peakInfo = calculatePeakTier(tier, peakTier);
    
    const tooltipContent = peakInfo && !peakInfo.isPeak ? `
        <div class="peak-tier-tooltip">
            <div class="peak-tier-content">
                <span class="peak-tier-label">Peak Tier</span>
                <span class="peak-tier-value">
                    <img src="${iconSrc}" class="peak-icon" alt="${gamemode}" onerror="this.style.display='none';">
                    <span class="tier ${peakTier.toLowerCase()}">${peakTier}</span>
                </span>
            </div>
        </div>
    ` : '';
    
    return `
        <div class="tier-wrapper">
            <div class="gamemode-tier-item">
                <div class="gamemode-tier-icon-container" style="border-color: var(--${tierClass}, #666);">
                    <img class="gamemode-tier-icon" src="${iconSrc}" alt="${gamemode}" 
                         onerror="this.style.display='none';">
                </div>
                <span class="tier ${tierClass}">${tier}</span>
            </div>
            ${tooltipContent}
        </div>
    `;
}

function renderTierHistory(player, gamemode) {
    if (!player.tierHistory || !player.tierHistory[gamemode] || player.tierHistory[gamemode].length === 0) {
        return '<div class="no-history">No tier history available for this gamemode</div>';
    }
    
    const history = player.tierHistory[gamemode];
    const tierColors = {
        'HT1': '#f472b6', 'LT1': '#ec4899', 'RHT1': '#f472b6', 'RLT1': '#ec4899',
        'HT2': '#c084fc', 'LT2': '#a855f7', 'RHT2': '#c084fc', 'RLT2': '#a855f7',
        'HT3': '#93c5fd', 'LT3': '#60a5fa', 'RHT3': '#93c5fd', 'RLT3': '#60a5fa',
        'HT4': '#5eead4', 'LT4': '#34d399', 'RHT4': '#5eead4', 'RLT4': '#34d399',
        'HT5': '#fcd34d', 'LT5': '#fbbf24', 'RHT5': '#fcd34d', 'RLT5': '#fbbf24',
    };
    
    return `
        <div class="chart-container">
            <div class="tier-timeline">
                <div class="timeline-line"></div>
                ${history.map((entry, index) => {
                    const color = tierColors[entry.tier] || '#6b7280';
                    const date = new Date(entry.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                    });
                    
                    return `
                        <div class="timeline-point">
                            <div class="timeline-dot" style="border-color: ${color};" 
                                 title="${entry.tier} - ${date}${entry.note ? ' (' + entry.note + ')' : ''}"></div>
                            <span class="timeline-tier tier ${entry.tier.toLowerCase()}">${entry.tier}</span>
                            <span class="timeline-date">${date}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Show/hide Kit Info button based on gamemode
function updateKitInfoButton() {
    const kitInfoBtn = document.getElementById("kitInfoBtn");
    if (currentGamemode !== "overall" && kitInfo[currentGamemode]) {
        kitInfoBtn.style.display = "flex";
    } else {
        kitInfoBtn.style.display = "none";
    }
}

// Multi-region filter functionality
let selectedRegions = new Set(); // Store selected regions
let allPlayersRanking = []; // Store the complete ranking for reference

let isInitialLoad = true;

async function loadPlayers() {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingSubtext = document.getElementById("loadingSubtext");

    try {
        const res = await fetch(
            "https://stellartiersbot.onrender.com/players.json"
        );

        if (!res.ok) {
            throw new Error("Network response was not ok");
        }

        players = await res.json();

        // Show loading screen for minimum 0.75 seconds on initial load
        if (isInitialLoad) {
            const minLoadTime = 750;
            const startTime = window.loadStartTime || Date.now();
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadTime - elapsedTime);

            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.classList.add("hidden");
                    // Remove from DOM after fade completes
                    setTimeout(() => {
                        loadingScreen.style.display = "none";
                    }, 500); // Match the CSS transition duration
                }
                isInitialLoad = false;
            }, remainingTime);
        } else {
            if (loadingScreen) {
                loadingScreen.classList.add("hidden");
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                }, 500);
            }
        }

        renderPlayers();
    } catch (error) {
        console.error("Failed to load players:", error);
        if (loadingSubtext) {
            loadingSubtext.textContent =
                "Connection failed. Please check your internet connection.";
            loadingSubtext.style.color = "#ef4444";
        }

        // Retry after 3 seconds
        setTimeout(() => {
            if (loadingSubtext) {
                loadingSubtext.textContent = "Retrying...";
                loadingSubtext.style.color = "#9ca3af";
            }
            loadPlayers();
        }, 3000);
    }
}

function calculatePoints(player) {
    let total = 0;
    for (const mode in player.tiers) {
        total += tierPoints[player.tiers[mode]] || 0;
    }
    return total;
}

document.getElementById("copyIpBtn").addEventListener("click", () => {
    navigator.clipboard.writeText("We Are Not Officially linked with any server.");
    const popup = document.getElementById("copyPopup");
    popup.style.display = "block";
    setTimeout(() => (popup.style.display = "none"), 2000);
});
document.getElementById("discordBtn").addEventListener("click", () => {
    window.open("https://discord.gg/zMqy5QbevP", "_blank");
});

function getBadge(points) {
	if (points >= 900)
        return {
            label: "Points Overlord",
            class: "pointoverlord",
        };
    if (points >= 300)
        return {
            label: "Legendary",
            class: "legendary",
        };
    if (points >= 200)
        return {
            label: "Master",
            class: "master",
        };
    if (points >= 100)
        return {
            label: "Expert",
            class: "expert",
        };
    if (points >= 50)
        return {
            label: "Advanced",
            class: "advanced",
        };
    if (points >= 20)
        return {
            label: "Intermediate",
            class: "intermediate",
        };
    return {
        label: "Novice",
        class: "novice",
    };
}

function updateOverallTabAppearance() {
    const overallTabs = document.querySelectorAll(
        '.gamemode-tab[data-gamemode="overall"]'
    );

    overallTabs.forEach((tab) => {
        if (selectedRegions.size > 0) {
            tab.classList.add("filtered");
            const span = tab.querySelector("span");
            const regionList = Array.from(selectedRegions)
                .map((r) => r.toUpperCase())
                .join(", ");
            span.textContent = `Overall (${regionList})`;
        } else {
            tab.classList.remove("filtered");
            tab.querySelector("span").textContent = "Overall";
        }
    });
}

// Add this after your loadPlayers function
window.addEventListener("online", () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingSubtext = document.getElementById("loadingSubtext");

    if (loadingScreen && loadingSubtext) {
        // Show the loading screen again
        loadingScreen.style.display = "flex";
        loadingScreen.classList.remove("hidden");

        loadingSubtext.textContent = "Connection restored. Reloading...";
        loadingSubtext.style.color = "#10b981";

        setTimeout(() => {
            loadPlayers();
        }, 1000);
    }
});

window.addEventListener("offline", () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingSubtext = document.getElementById("loadingSubtext");

    if (loadingScreen && loadingSubtext) {
        // Show the loading screen
        loadingScreen.style.display = "flex";
        loadingScreen.classList.remove("hidden");

        loadingSubtext.textContent =
            "No internet connection. Waiting for connection...";
        loadingSubtext.style.color = "#ef4444";
    }
});

document.getElementById("refreshBtn").addEventListener("click", async () => {
    const btn = document.getElementById("refreshBtn");
    const originalContent = btn.innerHTML;

    // Visual feedback - disable and show loading
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; animation: spin 1s linear infinite;">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        Refreshing...
    `;

    // Reload the data
    await loadPlayers();

    // Re-enable button after a short delay
    setTimeout(() => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.innerHTML = originalContent;
    }, 500);
});

function updatePaginationControls(totalPages, totalPlayers) {
    // Remove existing pagination if it exists
    const existingPagination = document.getElementById("pagination");
    if (existingPagination) {
        existingPagination.remove();
    }

    if (totalPages <= 1) return; // Don't show pagination for single page

    const startRank = (currentPage - 1) * playersPerPage + 1;
    const endRank = Math.min(currentPage * playersPerPage, totalPlayers);

    const pagination = document.createElement("div");
    pagination.id = "pagination";
    pagination.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 30px;
    padding: 20px 0;
    border-top: 1px solid rgba(80, 80, 80, 0.3);
  `;

    const pageInfo = document.createElement("span");
    pageInfo.style.cssText = `
    color: #9ca3af;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 16px;
  `;
    pageInfo.textContent = `Showing ${startRank}-${endRank} of ${totalPlayers} players`;

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.cssText = `
    background: ${
        currentPage === 1 ? "rgba(60, 60, 60, 0.5)" : "rgba(30, 30, 30, 0.95)"
    };
    border: 2px solid rgba(80, 80, 80, 0.6);
    border-radius: 12px;
    padding: 8px 16px;
    color: ${currentPage === 1 ? "#666" : "#d1d5db"};
    font-weight: 600;
    cursor: ${currentPage === 1 ? "not-allowed" : "pointer"};
    transition: all 0.3s ease;
  `;
    if (currentPage > 1) {
        prevBtn.addEventListener("mouseover", () => {
            prevBtn.style.background = "rgba(50, 50, 50, 0.95)";
            prevBtn.style.borderColor = "#aaa";
        });
        prevBtn.addEventListener("mouseout", () => {
            prevBtn.style.background = "rgba(30, 30, 30, 0.95)";
            prevBtn.style.borderColor = "rgba(80, 80, 80, 0.6)";
        });
    }

    document.getElementById("logoBtn").addEventListener("click", () => {
    // Reset to overall gamemode
    currentGamemode = "overall";
    
    // Update URL
    updateURL('overall');

    // Reset to first page of players
    currentPage = 1;

    // Reset to first page of gamemode switcher
    currentPageIndex = 0;
    showPage(0);

    // Clear any region filters
    selectedRegions.clear();
    updateOverallTabAppearance();
    updateRegionCheckboxes();

    // Clear search box
    document.getElementById("searchBox").value = "";

    // Update all gamemode tabs to show overall as active
    document.querySelectorAll(".gamemode-tab").forEach((t) => {
        if (t.dataset.gamemode === "overall") {
            t.classList.add("active");
        } else {
            t.classList.remove("active");
        }
    });

    // Re-render the players
    renderPlayers();
});

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.cssText = `
    background: ${
        currentPage === totalPages
            ? "rgba(60, 60, 60, 0.5)"
            : "rgba(30, 30, 30, 0.95)"
    };
    border: 2px solid rgba(80, 80, 80, 0.6);
    border-radius: 12px;
    padding: 8px 16px;
    color: ${currentPage === totalPages ? "#666" : "#d1d5db"};
    font-weight: 600;
    cursor: ${currentPage === totalPages ? "not-allowed" : "pointer"};
    transition: all 0.3s ease;
  `;
    if (currentPage < totalPages) {
        nextBtn.addEventListener("mouseover", () => {
            nextBtn.style.background = "rgba(50, 50, 50, 0.95)";
            nextBtn.style.borderColor = "#aaa";
        });
        nextBtn.addEventListener("mouseout", () => {
            nextBtn.style.background = "rgba(30, 30, 30, 0.95)";
            nextBtn.style.borderColor = "rgba(80, 80, 80, 0.6)";
        });
    }

    // Add click handlers
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPlayers();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPlayers();
        }
    });

    pagination.appendChild(prevBtn);

    // Add page numbers (show max 5 pages around current page)
    const pageNumbers = document.createElement("div");
    pageNumbers.style.cssText = `
    display: flex;
    gap: 6px;
    align-items: center;
  `;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        const firstPage = createPageButton(1);
        pageNumbers.appendChild(firstPage);
        if (startPage > 2) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.style.color = "#666";
            pageNumbers.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.appendChild(createPageButton(i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.style.color = "#666";
            pageNumbers.appendChild(dots);
        }
        const lastPage = createPageButton(totalPages);
        pageNumbers.appendChild(lastPage);
    }

    pagination.appendChild(pageNumbers);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextBtn);

    document.getElementById("playerList").appendChild(pagination);
}

function createPageButton(pageNum) {
    const btn = document.createElement("button");
    btn.textContent = pageNum;
    btn.style.cssText = `
    background: ${
        pageNum === currentPage
            ? "linear-gradient(135deg, #333, #111)"
            : "rgba(30, 30, 30, 0.95)"
    };
    border: 2px solid ${
        pageNum === currentPage ? "#ccc" : "rgba(80, 80, 80, 0.6)"
    };
    border-radius: 8px;
    padding: 6px 12px;
    color: ${pageNum === currentPage ? "#fff" : "#d1d5db"};
    font-weight: ${pageNum === currentPage ? "700" : "600"};
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 36px;
  `;

    if (pageNum !== currentPage) {
        btn.addEventListener("mouseover", () => {
            btn.style.background = "rgba(50, 50, 50, 0.95)";
            btn.style.borderColor = "#aaa";
        });
        btn.addEventListener("mouseout", () => {
            btn.style.background = "rgba(30, 30, 30, 0.95)";
            btn.style.borderColor = "rgba(80, 80, 80, 0.6)";
        });
    }

    btn.addEventListener("click", () => {
        currentPage = pageNum;
        renderPlayers();
    });

    return btn;
}

function renderTierColumns(filteredPlayers, container) {
    // Group players by tier
    const tierGroups = {
        "Tier 1": [],
        "Tier 2": [],
        "Tier 3": [],
        "Tier 4": [],
        "Tier 5": [],
    };

    const tierMapping = {
        HT1: "Tier 1", LT1: "Tier 1", RHT1: "Tier 1", RLT1: "Tier 1",
        HT2: "Tier 2", LT2: "Tier 2", RHT2: "Tier 2", RLT2: "Tier 2",
        HT3: "Tier 3", LT3: "Tier 3", RHT3: "Tier 3", RLT3: "Tier 3",
        HT4: "Tier 4", LT4: "Tier 4", RHT4: "Tier 4", RLT4: "Tier 4",
        HT5: "Tier 5", LT5: "Tier 5", RHT5: "Tier 5", RLT5: "Tier 5",
    };

    // Tier icons mapping
    const tierIcons = {
        "Tier 1": fixAssetPath("assets/icons/tier_1.svg"),
        "Tier 2": fixAssetPath("assets/icons/tier_2.svg"),
        "Tier 3": fixAssetPath("assets/icons/tier_3.svg"),
        "Tier 4": fixAssetPath("assets/icons/tier_45.svg"),
        "Tier 5": fixAssetPath("assets/icons/tier_45.svg"),
    };

    // Populate groups
    filteredPlayers.forEach((player) => {
        const tierCode = player.tiers && player.tiers[currentGamemode];
        const tierGroup = tierMapping[tierCode];
        if (tierGroup) {
            player.currentTierCode = tierCode;
            tierGroups[tierGroup].push(player);
        }
    });

    // Create columns container
    const columnsContainer = document.createElement("div");
    columnsContainer.className = "tier-columns-container";

    // Create a column for each tier (always show all 5)
    Object.entries(tierGroups).forEach(([tierName, players], index) => {
        const column = document.createElement("div");
        column.className = "tier-column";

        const header = document.createElement("div");
        header.className = `tier-column-header tier-${index + 1}`;

        const tierIcon = tierIcons[tierName];
        if (tierIcon) {
            header.innerHTML = `<img src="${tierIcon}" alt="${tierName}" onerror="this.style.display='none';"> ${tierName}`;
        } else {
            header.textContent = tierName;
        }

        column.appendChild(header);

        // Show empty state if no players
        if (!players || players.length === 0) {
            const emptyState = document.createElement("div");
            emptyState.style.cssText = `
                text-align: center;
                padding: 20px;
                color: #64748b;
                font-size: 0.9rem;
                font-style: italic;
            `;
            emptyState.textContent = "No players in this tier";
            column.appendChild(emptyState);
        } else {
            players.forEach((player) => {
                const tierCode = player.currentTierCode || "";
                const isHighTier = /HT/.test(tierCode);
                const isRetired = /^R/.test(tierCode);

                const playerDiv = document.createElement("div");
                playerDiv.classList.add("tier-column-player");
                playerDiv.classList.add(isHighTier ? "tier-column-player-high" : "tier-column-player-low");
                if (isRetired) playerDiv.classList.add("tier-column-player-retired");

                // ✅ Correct interpolation here:
                const tierIndicatorHTML = isRetired
                    ? `<img src="${fixAssetPath("assets/icons/retired_icon.svg")}" class="retired-indicator-icon" alt="Retired" onerror="this.style.display='none';">`
                    : "";

                const htltIndicatorHTML = isHighTier
                    ? `<img src="${fixAssetPath("assets/icons/ht_icon.svg")}" class="tier-indicator-icon" alt="HT" onerror="this.style.display='none';">`
                    : `<img src="${fixAssetPath("assets/icons/lt_icon.svg")}" class="tier-indicator-icon" alt="LT" onerror="this.style.display='none';">`;

                playerDiv.innerHTML = `
                    <img src="${player.avatar}" alt="${player.name}" class="player-avatar-small" onerror="this.style.display='none';">
                    <div class="tier-column-player-info">
                        <span class="tier-column-player-name ${isHighTier ? "high-tier" : "low-tier"}">
                            ${player.name}
                            <span class="player-region ${player.region ? player.region.toLowerCase() : "unknown"}">
                                ${player.region ? player.region.toUpperCase() : "UNKNOWN"}
                            </span>
                        </span>
                    </div>
                    <div class="tier-column-player-icons">
                        ${tierIndicatorHTML}
                        ${htltIndicatorHTML}
                    </div>
                `;

                playerDiv.addEventListener("click", () => openPlayerModal(player));
                column.appendChild(playerDiv);
            });
        }

        columnsContainer.appendChild(column);
    });

    container.innerHTML = "";
    container.appendChild(columnsContainer);
}



function renderPlayers() {
    const searchValue = document
        .getElementById("searchBox")
        .value.toLowerCase();
    let filtered = players.filter((p) =>
        p.name.toLowerCase().includes(searchValue)
    );

    // Special case: LTM gamemode shows announcement instead of leaderboard
    if (currentGamemode === "ltm") {
        const container = document.getElementById("playerList");
        container.innerHTML = `
          				<div id="ltmAnnouncement" class="ltm-announcement">
  <h1>⚒️ Limited-Time Modes are coming soon!</h1>
  <p>
    We're working on implementing LTMs, which will include
    <strong>custom limited-time kits</strong> for future minecraft updates and special servers – however,
    a few other things will take priority :)
  </p>
</div>
        `;
        return;
    }

    // Calculate points and create complete ranking first (for true rank reference)
    if (currentGamemode === "overall") {
        // Create complete ranking of all players
        allPlayersRanking = [...players];
        allPlayersRanking.forEach((p) => (p.points = calculatePoints(p)));
        allPlayersRanking.sort((a, b) => b.points - a.points);

        // Apply region filter if any regions are selected
        if (selectedRegions.size > 0) {
            filtered = filtered.filter(
                (p) => p.region && selectedRegions.has(p.region.toLowerCase())
            );
        }

        filtered.forEach((p) => (p.points = calculatePoints(p)));
        filtered.sort((a, b) => b.points - a.points);
    } else {
        filtered.forEach(
            (p) => (p.points = tierPoints[p.tiers[currentGamemode]] || 0)
        );
        filtered.sort((a, b) => b.points - a.points);
    }

    const container = document.getElementById("playerList");
    container.innerHTML = "";

    if (!filtered.length) {
        container.innerHTML = `<div class="no-results">No players found</div>`;
        return;
    }

    // If viewing a specific gamemode, use tier-based column layout
    if (currentGamemode !== "overall") {
        renderTierColumns(filtered, container);
        return;
    }

    // Calculate pagination for overall view
    const totalPlayers = filtered.length;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);
    const startIndex = (currentPage - 1) * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const playersToShow = filtered.slice(startIndex, endIndex);

    playersToShow.forEach((p, idx) => {
        const badge = getBadge(calculatePoints(p));

        // Calculate actual rank (not just position on current page)
        let displayRank = startIndex + idx + 1;
        if (currentGamemode === "overall" && selectedRegions.size > 0) {
            const trueRank =
                allPlayersRanking.findIndex(
                    (player) => player.name === p.name
                ) + 1;
            displayRank = trueRank;
        }

        // Create gamemode icons mapping
        const gamemodeIcons = {
            crystal: fixAssetPath("assets/gamemode-icons/Crystal.svg"),
            sword: fixAssetPath("assets/gamemode-icons/Sword.svg"),
            uhc: fixAssetPath("assets/gamemode-icons/Uhc.svg"),
            potion: fixAssetPath("assets/gamemode-icons/Potion.svg"),
            nethpot: fixAssetPath("assets/gamemode-icons/Nethpot.svg"),
            nethsword: fixAssetPath("assets/gamemode-icons/NethSword.svg"),
            smp: fixAssetPath("assets/gamemode-icons/Smp.svg"),
            axe: fixAssetPath("assets/gamemode-icons/Axe.svg"),
            mace: fixAssetPath("assets/gamemode-icons/Mace.svg"),
            diasmp: fixAssetPath("assets/gamemode-icons/Diasmp.svg"),
            speed: fixAssetPath("assets/gamemode-icons/Speed.svg"),
            elytra: fixAssetPath("assets/gamemode-icons/Elytra.svg"),
            trident: fixAssetPath("assets/gamemode-icons/Trident.svg"),
            cart: fixAssetPath("assets/gamemode-icons/Cart.svg"),
            bed: fixAssetPath("assets/gamemode-icons/Bed.svg"),
            bow: fixAssetPath("assets/gamemode-icons/Bow.svg"),
            creeper: fixAssetPath("assets/gamemode-icons/Creeper.svg"),
            debuff: fixAssetPath("assets/gamemode-icons/DeBuff.svg"),
            diasurv: fixAssetPath("assets/gamemode-icons/DiaSurv.svg"),
            manhunt: fixAssetPath("assets/gamemode-icons/Manhunt.svg"),
            ogvanilla: fixAssetPath("assets/gamemode-icons/OgVanilla.svg"),
            nethuhc: fixAssetPath("assets/gamemode-icons/NethUhc.svg"),
            ltm: fixAssetPath("assets/gamemode-icons/LTM.svg"),
        };

        // Define tier hierarchy for sorting (higher tiers first)
        const tierHierarchy = {
            HT0: 0,
            LT0: 1,
            RHT0: 0,
            RLT0: 1,
            HT1: 2,
            LT1: 3,
            RHT1: 2,
            RLT1: 3,
            HT2: 4,
            LT2: 5,
            RHT2: 4,
            RLT2: 5,
            HT3: 6,
            LT3: 7,
            RHT3: 6,
            RLT3: 7,
            HT4: 8,
            LT4: 9,
            RHT4: 8,
            RLT4: 9,
            HT5: 10,
            LT5: 11,
            RHT5: 10,
            RLT5: 11,
            HT6: 12,
            LT6: 13,
            RHT6: 12,
            RLT6: 13,
        };

        // Define tier organization
        const mainTiers = [
            "crystal",
            "sword",
            "uhc",
            "potion",
            "nethpot",
            "smp",
            "axe",
            "mace",
            "diasmp",
        ];
        const subTiers = [
            "speed",
            "elytra",
            "cart",
            "ogvanilla",
        ];

        const limitedTiers = ["nethuhc", "nethsword", "ltm"];

let gamemodeDisplay = (() => {
    const playerMainTiers = [];
    const playerSubTiers = [];
    const playerLimitedTiers = [];

    // Process main tiers (show all, including empty)
    ALL_GAMEMODES.main.forEach((gm) => {
        const tier = p.tiers?.[gm];
        const peakTier = p.peakTiers?.[gm];
        playerMainTiers.push([gm, tier || null, peakTier]);
    });

    // Process sub tiers (show all, including empty)
    ALL_GAMEMODES.sub.forEach((gm) => {
        const tier = p.tiers?.[gm];
        const peakTier = p.peakTiers?.[gm];
        playerSubTiers.push([gm, tier || null, peakTier]);
    });

    // Process limited tiers (show all, including empty)
    ALL_GAMEMODES.limited.forEach((gm) => {
        const tier = p.tiers?.[gm];
        const peakTier = p.peakTiers?.[gm];
        playerLimitedTiers.push([gm, tier || null, peakTier]);
    });

    const sortByTierHierarchy = (a, b) => {
        const rankA = tierHierarchy[a[1]] ?? 999;
        const rankB = tierHierarchy[b[1]] ?? 999;
        return rankA - rankB;
    };

    playerMainTiers.sort(sortByTierHierarchy);
    playerSubTiers.sort(sortByTierHierarchy);
    playerLimitedTiers.sort(sortByTierHierarchy);

    const createTierItem = ([gm, tier, peakTier]) => {
        const iconSrc = gamemodeIcons[gm] || 'assets/gamemode-icons/Overall.svg';
        
        // If no tier, create standby version
        if (!tier && STANDBY_TIER_CONFIG.enabled) {
            return `
                <div class="tier-wrapper">
                    <div class="gamemode-tier-item standby-tier" style="opacity: ${STANDBY_TIER_CONFIG.opacity};">
                        <div class="gamemode-tier-icon-container" style="border-color: #444; border-style: dashed;">
                            <img class="gamemode-tier-icon" src="${iconSrc}" alt="${gm}" onerror="this.style.display='none';">
                        </div>
                        <span class="tier" style="background: #333; color: #666; box-shadow: none;">
                            ${STANDBY_TIER_CONFIG.label}
                        </span>
                    </div>
                </div>
            `;
        }
        
        // Normal tier with tooltip
        return createTierWithTooltip(gm, tier, peakTier, iconSrc);
    };

    let html = '';

    if (playerMainTiers.length > 0) {
        html += '<div class="tier-row-wrapper">';
        html += '<span class="tier-row-label">Main Tiers:</span>';
        html += '<div class="tier-row">';
        html += playerMainTiers.map(createTierItem).join('');
        html += '</div>';
        html += '</div>';
    }

    if (playerSubTiers.length > 0) {
        html += '<div class="tier-row-wrapper">';
        html += '<span class="tier-row-label">SubTiers:</span>';
        html += '<div class="tier-row">';
        html += playerSubTiers.map(createTierItem).join('');
        html += '</div>';
        html += '</div>';
    }

    if (playerLimitedTiers.length > 0) {
        html += '<div class="tier-row-wrapper">';
        html += '<span class="tier-row-label">Limited Tiers:</span>';
        html += '<div class="tier-row">';
        html += playerLimitedTiers.map(createTierItem).join('');
        html += '</div>';
        html += '</div>';
    }

    return html;
})();

        const row = document.createElement("div");
        row.className = "player-row";

        // Use true overall rank when region filtering is active
        const rankClass =
            displayRank === 1
                ? "gold"
                : displayRank === 2
                ? "silver"
                : displayRank === 3
                ? "bronze"
                : "";

        let placementBadge = "";
        let rankStyle = "position: relative; z-index: 2;";
        let badgeContainerStyle =
            "position: relative; display: flex; align-items: center; justify-content: center;";

        if (displayRank === 1) {
  placementBadge = `
    <img src="${fixAssetPath('assets/icons/Placement1.svg')}"
         alt="1st Place"
         style="position: absolute; width: 80px; height: 40px; z-index: 1;
                left: 50%; top: 50%; transform: translate(-50%, -50%);" />
  `;
} else if (displayRank === 2) {
  placementBadge = `
    <img src="${fixAssetPath('assets/icons/Placement2.svg')}"
         alt="2nd Place"
         style="position: absolute; width: 80px; height: 40px; z-index: 1;
                left: 50%; top: 50%; transform: translate(-50%, -50%);" />
  `;
} else if (displayRank === 3) {
  placementBadge = `
    <img src="${fixAssetPath('assets/icons/Placement3.svg')}"
         alt="3rd Place"
         style="position: absolute; width: 80px; height: 40px; z-index: 1;
                left: 50%; top: 50%; transform: translate(-50%, -50%);" />
  `;
} else {
  placementBadge = `
    <img src="${fixAssetPath('assets/icons/PlacementOther.svg')}"
         alt="Rank"
         style="position: absolute; width: 80px; height: 40px; z-index: 1;
                left: 50%; top: 50%; transform: translate(-50%, -50%);" />
  `;
}

        row.innerHTML = `
  <div class="rank ${rankClass}" style="${badgeContainerStyle}">
    ${placementBadge}
    <span style="${rankStyle}">${displayRank}</span>
  </div>
  <div class="player-info">
    <img class="player-avatar" src="${p.avatar}" alt="${p.name}">
    <div class="player-details">
      <span class="player-name">
      ${p.name}
         <span class="player-region ${String(p.region || "").toLowerCase()}">${
            p.region
        }</span>
      </span>
      <span class="player-points"><span class="points-number">${p.points} pts</span> <span class="points-badge ${badge.class}">${badge.label}</span></span>
    </div>
  </div>
  <div class="gamemode-tiers">${gamemodeDisplay}</div>
`;
        row.addEventListener("click", () => openPlayerModal(p));

        // Store player data for context menu
        row.dataset.username = p.name;
        row.dataset.tiers = JSON.stringify(p.tiers);
        row.dataset.points = p.points;

        container.appendChild(row);
    });

    updatePaginationControls(totalPages, totalPlayers);
}

function openPlayerModal(player) {
    const modal = document.getElementById("playerModal");
    const body = document.getElementById("modalBody");
    const totalPoints = calculatePoints(player);
    const badge = getBadge(totalPoints);

    // Create tier icons mapping
    const gamemodeIcons = {
        crystal: fixAssetPath("assets/gamemode-icons/Crystal.svg"),
        sword: fixAssetPath("assets/gamemode-icons/Sword.svg"),
        uhc: fixAssetPath("assets/gamemode-icons/Uhc.svg"),
        potion: fixAssetPath("assets/gamemode-icons/Potion.svg"),
        nethpot: fixAssetPath("assets/gamemode-icons/Nethpot.svg"),
        nethsword: fixAssetPath("assets/gamemode-icons/NethSword.svg"),
        smp: fixAssetPath("assets/gamemode-icons/Smp.svg"),
        axe: fixAssetPath("assets/gamemode-icons/Axe.svg"),
        mace: fixAssetPath("assets/gamemode-icons/Mace.svg"),
        diasmp: fixAssetPath("assets/gamemode-icons/Diasmp.svg"),
        speed: fixAssetPath("assets/gamemode-icons/Speed.svg"),
        elytra: fixAssetPath("assets/gamemode-icons/Elytra.svg"),
        trident: fixAssetPath("assets/gamemode-icons/Trident.svg"),
        cart: fixAssetPath("assets/gamemode-icons/Cart.svg"),
        bed: fixAssetPath("assets/gamemode-icons/Bed.svg"),
        bow: fixAssetPath("assets/gamemode-icons/Bow.svg"),
        creeper: fixAssetPath("assets/gamemode-icons/Creeper.svg"),
        debuff: fixAssetPath("assets/gamemode-icons/DeBuff.svg"),
        diasurv: fixAssetPath("assets/gamemode-icons/DiaSurv.svg"),
        manhunt: fixAssetPath("assets/gamemode-icons/Manhunt.svg"),
        ogvanilla: fixAssetPath("assets/gamemode-icons/OgVanilla.svg"),
        ltm: fixAssetPath("assets/gamemode-icons/LTM.svg"),
        nethuhc: fixAssetPath("assets/gamemode-icons/NethUhc.svg"),
    };

    // Define tier hierarchy for sorting (higher tiers first)
    // Retired tiers have same priority as normal tiers
    const tierHierarchy = {
        HT0: 0,
        LT0: 1,
        RHT0: 0,
        RLT0: 1,
        HT1: 2,
        LT1: 3,
        RHT1: 2,
        RLT1: 3,
        HT2: 4,
        LT2: 5,
        RHT2: 4,
        RLT2: 5,
        HT3: 6,
        LT3: 7,
        RHT3: 6,
        RLT3: 7,
        HT4: 8,
        LT4: 9,
        RHT4: 8,
        RLT4: 9,
        HT5: 10,
        LT5: 11,
        RHT5: 10,
        RLT5: 11,
        HT6: 12,
        LT6: 13,
        RHT6: 12,
        RLT6: 13,
    };

    // Sort tiers by hierarchy (highest first)
    const sortedTiers = Object.entries(player.tiers).sort(
        ([, tierA], [, tierB]) => {
            const rankA = tierHierarchy[tierA] ?? 999;
            const rankB = tierHierarchy[tierB] ?? 999;
            return rankA - rankB;
        }
    );

    // Check if region is a valid region code (2-3 letters) or something else
    const validRegions = ["na", "eu", "as", "sa", "me", "au", "af"];
    const isValidRegion =
        player.region && validRegions.includes(player.region.toLowerCase());

    // Get player's rank position (1-based)
    const playerRank = getPlayerRank(player.name);
    let rankClass = "";
    if (playerRank === 1) rankClass = "rank-1-name";
    else if (playerRank === 2) rankClass = "rank-2-name";
    else if (playerRank === 3) rankClass = "rank-3-name";

    body.innerHTML = `
    <div class="player-modal-header">
      <img class="player-modal-avatar" src="${player.avatar}" alt="${
        player.name
    }">
      <h2 class="player-modal-name">
        <span class="${rankClass}">${player.name}</span>
        ${
            isValidRegion
                ? `<span class="player-region ${player.region.toLowerCase()}">${player.region.toUpperCase()}</span>`
                : ""
        }
      </h2>
      <div class="player-modal-points">
		<span class="points-number">${totalPoints} points</span>
		<span class="points-badge ${badge.class}">${badge.label}</span>
	  </div>
    </div>
  `;

    const nameMcBtn = document.createElement("button");
    nameMcBtn.className = "action-button";
    nameMcBtn.style.cssText = `
  background: rgba(30, 30, 30, 0.9);
  border: 2px solid rgba(120, 120, 120, 0.6);
  border-radius: 16px;
  padding: 12px 20px;
  color: #d1d5db;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
`;
    nameMcBtn.innerHTML = `
  <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
    <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
  </svg>
  View on NameMC
`;
    nameMcBtn.addEventListener("click", () => {
        window.open(`https://namemc.com/profile/${player.name}`, "_blank");
    });
    nameMcBtn.addEventListener("mouseenter", () => {
        nameMcBtn.style.background = "#111";
        nameMcBtn.style.color = "#fff";
        nameMcBtn.style.transform = "translateY(-2px)";
        nameMcBtn.style.boxShadow = "0 0 20px rgba(160, 160, 160, 0.7)";
    });
    nameMcBtn.addEventListener("mouseleave", () => {
        nameMcBtn.style.background = "rgba(30, 30, 30, 0.9)";
        nameMcBtn.style.color = "#d1d5db";
        nameMcBtn.style.transform = "translateY(0)";
        nameMcBtn.style.boxShadow = "0 0 15px rgba(50, 50, 50, 0.6)";
    });

    // Check if player has any tier history
    const hasHistory = player.tierHistory && Object.keys(player.tierHistory).some(
        gm => player.tierHistory[gm] && player.tierHistory[gm].length > 0
    );

    // Insert button after the header section
    const modalBody = document.getElementById("modalBody");

    if (hasHistory) {
        const tierHistoryBtn = document.createElement("button");
        tierHistoryBtn.className = "action-button";
        tierHistoryBtn.style.cssText = `
      background: rgba(30, 30, 30, 0.9);
      border: 2px solid rgba(120, 120, 120, 0.6);
      border-radius: 16px;
      padding: 12px 20px;
      color: #d1d5db;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      margin-top: 12px;
    `;
        tierHistoryBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
        <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
      </svg>
      View Tier History
    `;
        tierHistoryBtn.addEventListener("click", () => {
			openTierHistoryModal(player); // This now uses the new modal
		});
		document.getElementById("tierHistoryModal").addEventListener("click", (e) => {
			if (e.target === document.getElementById("tierHistoryModal")) {
				document.getElementById("tierHistoryModal").style.display = "none";
			}
		});
        tierHistoryBtn.addEventListener("mouseenter", () => {
            tierHistoryBtn.style.background = "#111";
            tierHistoryBtn.style.color = "#fff";
            tierHistoryBtn.style.transform = "translateY(-2px)";
            tierHistoryBtn.style.boxShadow = "0 0 20px rgba(160, 160, 160, 0.7)";
        });
        tierHistoryBtn.addEventListener("mouseleave", () => {
            tierHistoryBtn.style.background = "rgba(30, 30, 30, 0.9)";
            tierHistoryBtn.style.color = "#d1d5db";
            tierHistoryBtn.style.transform = "translateY(0)";
            tierHistoryBtn.style.boxShadow = "0 0 15px rgba(50, 50, 50, 0.6)";
        });

        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0;
            margin: 20px auto;
            width: fit-content;
        `;
        
        buttonsContainer.appendChild(nameMcBtn);
        buttonsContainer.appendChild(tierHistoryBtn);
        modalBody.appendChild(buttonsContainer);
    } else {
        nameMcBtn.style.margin = "20px auto";
        nameMcBtn.style.width = "fit-content";
        modalBody.appendChild(nameMcBtn);
    }

    // Add tiers section after button
    const tiersSection = document.createElement("div");
    tiersSection.className = "modal-section";
    tiersSection.style.marginTop = "20px";
    tiersSection.innerHTML = `
    <h3 class="modal-section-title">Tiers</h3>
    <div class="tier-grid">
      ${sortedTiers
          .map(([gm, tier]) => {
              const tierClass = tier.toLowerCase();
              const iconSrc =
                  gamemodeIcons[gm] || fixAssetPath("assets/gamemode-icons/Overall.svg");

              return `
          <div class="tier-item">
            <div class="tier-icon-container" style="border-color: var(--${tierClass}, #666);">
              <img class="tier-icon" src="${iconSrc}" alt="${gm}" 
                   onerror="this.style.display='none';">
            </div>
            <span class="tier-label tier ${tierClass}" style="text-align: center;">${tier}</span>
            <span style="font-size: 0.7rem; color: #9ca3af; text-align: center;">${gm.toUpperCase()}</span>
          </div>
        `;
          })
          .join("")}
    </div>
  `;

    modalBody.appendChild(tiersSection);

    modal.style.display = "flex";
}

function getPlayerRank(playerName) {
    // Create a sorted copy of players for overall ranking
    const sortedPlayers = [...players];

    if (currentGamemode === "overall") {
        sortedPlayers.forEach((p) => (p.points = calculatePoints(p)));
        sortedPlayers.sort((a, b) => b.points - a.points);
    } else {
        sortedPlayers.forEach(
            (p) => (p.points = tierPoints[p.tiers[currentGamemode]] || 0)
        );
        sortedPlayers.sort((a, b) => b.points - a.points);
    }

    // Find the player's position (1-based ranking)
    const playerIndex = sortedPlayers.findIndex((p) => p.name === playerName);
    return playerIndex !== -1 ? playerIndex + 1 : 0;
}

function updateRegionCheckboxes() {
    const checkboxes = document.querySelectorAll(
        '#regionFilterModal input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectedRegions.has(checkbox.value);
    });
}

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("playerModal").style.display = "none";
});

document.getElementById("tierInfoBtn").addEventListener("click", () => {
    document.getElementById("tierInfoModal").style.display = "flex";
});
document.getElementById("closeTierInfo").addEventListener("click", () => {
    document.getElementById("tierInfoModal").style.display = "none";
});

// Page size selector
document.addEventListener("DOMContentLoaded", () => {
    const savedPageSize = localStorage.getItem("playersPerPage");
    if (savedPageSize) {
        playersPerPage = parseInt(savedPageSize);
        const selector = document.getElementById("pageSizeSelector");
        if (selector) {
            selector.value = savedPageSize;
        }
    }
});

// Event listener for page size selector
document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("pageSizeSelector");
    document.addEventListener("keydown", (e) => {
        // Handle Escape key
        document.addEventListener("keydown", (e) => {
            // Handle Escape key
            if (e.key === "Escape") {
                e.preventDefault(); // Stop the event from bubbling
                e.stopPropagation(); // Additional stop

                const contextMenu = document.getElementById(
                    "playerContextMenu"
                );
                const regionModal = document.getElementById(
                    "regionFilterModal"
                );
                const playerModal = document.getElementById("playerModal"); // Add this too
                const tierInfoModal = document.getElementById("tierInfoModal"); // Add this too
                const kitInfoModal = document.getElementById("kitInfoModal");

                // Hide all modals
                if (contextMenu && contextMenu.style.display !== "none") {
                    contextMenu.style.display = "none";
                }
                if (kitInfoModal && kitInfoModal.style.display !== "none") {
                    kitInfoModal.style.display = "none";
                }
                if (regionModal && regionModal.style.display !== "none") {
                    regionModal.style.display = "none";
                }
                if (playerModal && playerModal.style.display !== "none") {
                    playerModal.style.display = "none";
                }
                if (tierInfoModal && tierInfoModal.style.display !== "none") {
                    tierInfoModal.style.display = "none";
                }
                return; // Exit early after handling escape
            }

            // Handle "/" key for search focus
            if (
                e.target.tagName !== "INPUT" &&
                e.target.tagName !== "TEXTAREA" &&
                !e.target.isContentEditable
            ) {
                if (e.key === "/") {
                    e.preventDefault();
                    const searchBox = document.getElementById("searchBox");
                    if (searchBox) {
                        searchBox.focus();
                    }
                }
            }
        });
    });
    if (selector) {
        selector.addEventListener("change", (e) => {
            playersPerPage = parseInt(e.target.value);
            localStorage.setItem("playersPerPage", playersPerPage.toString());
            currentPage = 1;
            renderPlayers();
        });
    }
});

// Clear the "/" from the search box if it gets typed
document.getElementById("searchBox").addEventListener("input", (e) => {
    if (e.target.value === "/") {
        e.target.value = "";
    }
    currentPage = 1;
    renderPlayers();
});

document.querySelectorAll(".gamemode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document
            .querySelectorAll(".gamemode-tab")
            .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        
        currentGamemode = tab.dataset.gamemode;
        
        // Update URL when gamemode changes
        updateURL(currentGamemode);
        
        currentPage = 1;
        updateKitInfoButton();
        renderPlayers();
    });
});

const pages = ["gamemodePageMain", "gamemodePageSub", "gamemodePageExtra"];
let currentPageIndex = 0;

function showPage(index) {
    pages.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
            if (i === index) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        }
    });
    currentPageIndex = index;
}

document.getElementById("prevPageBtn").addEventListener("click", () => {
    currentPageIndex = (currentPageIndex - 1 + pages.length) % pages.length;
    showPage(currentPageIndex);
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
    currentPageIndex = (currentPageIndex + 1) % pages.length;
    showPage(currentPageIndex);
});

showPage(0);

// Multi-region filter functionality
const regionModal = document.getElementById("regionFilterModal");

// Show region filter modal on right-click of any Overall button
document.addEventListener("contextmenu", (e) => {
    const overallTab = e.target.closest(
        '.gamemode-tab[data-gamemode="overall"]'
    );
    if (overallTab && currentGamemode === "overall") {
        e.preventDefault();

        // Update checkboxes to reflect current selection
        updateRegionCheckboxes();

        // Position and show modal
        regionModal.style.display = "flex";
    }
});

// Handle region selection
document.getElementById("regionFilterModal").addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
        const region = e.target.value;

        if (e.target.checked) {
            selectedRegions.add(region);
        } else {
            selectedRegions.delete(region);
        }

        // If all regions are selected, clear selection (show all)
        const allRegions = ["na", "eu", "as", "sa", "me", "au", "af"];
        if (allRegions.every((r) => selectedRegions.has(r))) {
            selectedRegions.clear();
            updateRegionCheckboxes();
        }

        updateOverallTabAppearance();
        currentPage = 1;
        renderPlayers();
    }
});

// Close modal when clicking outside or close button
document.getElementById("regionFilterModal").addEventListener("click", (e) => {
    if (
        e.target === regionModal ||
        e.target.classList.contains("close-region-filter")
    ) {
        regionModal.style.display = "none";
    }
});

function openTierHistoryModal(player) {
    const modal = document.getElementById("tierHistoryModal");
    const body = document.getElementById("tierHistoryBody");
    
    const gamemodeIcons = {
        crystal: fixAssetPath("assets/gamemode-icons/Crystal.svg"),
        sword: fixAssetPath("assets/gamemode-icons/Sword.svg"),
        uhc: fixAssetPath("assets/gamemode-icons/Uhc.svg"),
        potion: fixAssetPath("assets/gamemode-icons/Potion.svg"),
        nethpot: fixAssetPath("assets/gamemode-icons/Nethpot.svg"),
        nethsword: fixAssetPath("assets/gamemode-icons/NethSword.svg"),
        smp: fixAssetPath("assets/gamemode-icons/Smp.svg"),
        axe: fixAssetPath("assets/gamemode-icons/Axe.svg"),
        mace: fixAssetPath("assets/gamemode-icons/Mace.svg"),
        diasmp: fixAssetPath("assets/gamemode-icons/Diasmp.svg"),
        speed: fixAssetPath("assets/gamemode-icons/Speed.svg"),
        elytra: fixAssetPath("assets/gamemode-icons/Elytra.svg"),
        trident: fixAssetPath("assets/gamemode-icons/Trident.svg"),
        cart: fixAssetPath("assets/gamemode-icons/Cart.svg"),
        bed: fixAssetPath("assets/gamemode-icons/Bed.svg"),
        bow: fixAssetPath("assets/gamemode-icons/Bow.svg"),
        creeper: fixAssetPath("assets/gamemode-icons/Creeper.svg"),
        debuff: fixAssetPath("assets/gamemode-icons/DeBuff.svg"),
        diasurv: fixAssetPath("assets/gamemode-icons/DiaSurv.svg"),
        manhunt: fixAssetPath("assets/gamemode-icons/Manhunt.svg"),
        ogvanilla: fixAssetPath("assets/gamemode-icons/OgVanilla.svg"),
        ltm: fixAssetPath("assets/gamemode-icons/LTM.svg"),
        nethuhc: fixAssetPath("assets/gamemode-icons/NethUhc.svg"),
    };

    const gamesWithHistory = Object.keys(player.tierHistory || {}).filter(
        gm => player.tierHistory[gm] && player.tierHistory[gm].length > 0
    );

    if (gamesWithHistory.length === 0) return;

    const firstGamemode = gamesWithHistory[0];
    
    body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div class="player-modal-header" style="margin-bottom: 32px;">
                <img class="player-modal-avatar" src="${player.avatar}" alt="${player.name}">
                <h2 class="player-modal-name" style="margin-bottom: 8px;">
                    <span>${player.name}</span>
                </h2>
                <div style="font-size: 1.2rem; color: #9ca3af; font-weight: 600;">Tier History</div>
            </div>
            
            <div style="width: 100%; padding: 40px; background: rgba(15, 15, 15, 0.6); border-radius: 20px; border: 1px solid rgba(80, 80, 80, 0.3);">
                <div style="display: flex; justify-content: center; margin-bottom: 40px;">
                    <div class="gamemode-selector" style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
                        ${gamesWithHistory.map(gm => {
                            const iconSrc = gamemodeIcons[gm] || 'assets/gamemode-icons/Overall.svg';
                            return `
                                <button class="gamemode-selector-btn ${gm === firstGamemode ? 'active' : ''}" 
                                        data-gamemode="${gm}"
                                        style="background: ${gm === firstGamemode ? 'linear-gradient(135deg, #333, #111)' : 'rgba(30, 30, 30, 0.8)'}; 
                                               border: 2px solid ${gm === firstGamemode ? '#ccc' : 'rgba(80, 80, 80, 0.4)'}; 
                                               border-radius: 16px; 
                                               padding: 16px; 
                                               cursor: pointer; 
                                               transition: all 0.3s ease;
                                               box-shadow: ${gm === firstGamemode ? '0 0 18px rgba(200, 200, 200, 0.7)' : 'none'};">
                                    <img src="${iconSrc}" alt="${gm}" style="width: 40px; height: 40px; display: block;" onerror="this.style.display='none';">
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="tier-history-chart" style="min-height: 320px;">
                    ${renderTierHistory(player, firstGamemode)}
                </div>
            </div>
        </div>
    `;
    
    body.querySelectorAll('.gamemode-selector-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            body.querySelectorAll('.gamemode-selector-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'rgba(30, 30, 30, 0.8)';
                b.style.borderColor = 'rgba(80, 80, 80, 0.4)';
                b.style.boxShadow = 'none';
            });
            btn.classList.add('active');
            btn.style.background = 'linear-gradient(135deg, #333, #111)';
            btn.style.borderColor = '#ccc';
            btn.style.boxShadow = '0 0 18px rgba(200, 200, 200, 0.7)';
            
            const selectedGamemode = btn.dataset.gamemode;
            const chart = body.querySelector('.tier-history-chart');
            chart.innerHTML = renderTierHistory(player, selectedGamemode);
        });
        
        // Add hover effects
        btn.addEventListener('mouseenter', () => {
            if (!btn.classList.contains('active')) {
                btn.style.background = 'rgba(50, 50, 50, 0.9)';
                btn.style.borderColor = '#999';
            }
        });
        btn.addEventListener('mouseleave', () => {
            if (!btn.classList.contains('active')) {
                btn.style.background = 'rgba(30, 30, 30, 0.8)';
                btn.style.borderColor = 'rgba(80, 80, 80, 0.4)';
            }
        });
    });
    
    modal.style.display = "flex";
}

// Add close button event listener
document.getElementById("closeTierHistory").addEventListener("click", () => {
    document.getElementById("tierHistoryModal").style.display = "none";
});

class PlayerBioSystem {
    constructor() {
        this.bios = new Map();
        this.loadFromStorage();
    }

    setBio(playerName, bioData) {
        this.bios.set(playerName, {
            ...bioData,
            lastUpdated: Date.now()
        });
        this.saveToStorage();
    }

    getBio(playerName) {
        return this.bios.get(playerName) || null;
    }

    saveToStorage() {
        try {
            const data = Array.from(this.bios.entries());
            localStorage.setItem('tierlist_bios', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save bios:', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('tierlist_bios');
            if (stored) {
                const data = JSON.parse(stored);
                this.bios = new Map(data);
            }
        } catch (e) {
            console.warn('Could not load bios:', e);
        }
    }

    renderBio(playerName) {
        const bio = this.getBio(playerName);
        
        if (!bio) {
            return `
                <div style="
                    background: rgba(20, 20, 20, 0.6);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                    color: #64748b;
                    font-style: italic;
                ">
                    No bio available
                </div>
            `;
        }

        return `
            <div style="
                background: rgba(20, 20, 20, 0.6);
                border-radius: 12px;
                padding: 16px;
                border: 1px solid rgba(80, 80, 80, 0.3);
            ">
                ${bio.description ? `
                    <div style="color: #e5e5e5; margin-bottom: 12px; line-height: 1.6;">
                        ${bio.description}
                    </div>
                ` : ''}
                
                ${bio.socials && Object.keys(bio.socials).length > 0 ? `
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px;">
                        ${bio.socials.youtube ? `
                            <a href="${bio.socials.youtube}" target="_blank" style="
                                background: #ff0000;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 8px;
                                text-decoration: none;
                                font-size: 0.85rem;
                                font-weight: 600;
                            ">📺 YouTube</a>
                        ` : ''}
                        ${bio.socials.twitch ? `
                            <a href="${bio.socials.twitch}" target="_blank" style="
                                background: #9146ff;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 8px;
                                text-decoration: none;
                                font-size: 0.85rem;
                                font-weight: 600;
                            ">📹 Twitch</a>
                        ` : ''}
                        ${bio.socials.twitter ? `
                            <a href="${bio.socials.twitter}" target="_blank" style="
                                background: #1da1f2;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 8px;
                                text-decoration: none;
                                font-size: 0.85rem;
                                font-weight: 600;
                            ">🐦 Twitter</a>
                        ` : ''}
                        ${bio.socials.discord ? `
                            <div style="
                                background: #5865f2;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 8px;
                                font-size: 0.85rem;
                                font-weight: 600;
                            ">💬 ${bio.socials.discord}</div>
                        ` : ''}
                    </div>
                ` : ''}

                ${bio.favGamemode ? `
                    <div style="margin-top: 12px; color: #9ca3af; font-size: 0.85rem;">
                        <strong>Favorite Gamemode:</strong> ${bio.favGamemode}
                    </div>
                ` : ''}

                ${bio.playstyle ? `
                    <div style="margin-top: 8px; color: #9ca3af; font-size: 0.85rem;">
                        <strong>Playstyle:</strong> ${bio.playstyle}
                    </div>
                ` : ''}
            </div>
        `;
    }
}

const playerBioSystem = new PlayerBioSystem();

playerBioSystem.setBio('ImApo', {
    description: 'Creator and developer of the Axis Tierlist. Competitive PvP player with an aggressive playstyle.',
    socials: {
        youtube: 'https://www.youtube.com/@Im-Apo',
        discord: 'cxnine._'
    },
    favGamemode: 'Diamond SMP',
    playstyle: 'Aggressive'
});


// ============================================================================
// PLAYER COMPARISON TOOL
// ============================================================================

class PlayerComparison {
    compare(player1, player2) {
        const p1Points = calculatePoints(player1);
        const p2Points = calculatePoints(player2);

        const comparison = {
            players: [player1.name, player2.name],
            totalPoints: [p1Points, p2Points],
            winner: p1Points > p2Points ? player1.name : player2.name,
            gamemodes: {}
        };

        // Compare each gamemode
        const allGamemodes = new Set([
            ...Object.keys(player1.tiers || {}),
            ...Object.keys(player2.tiers || {})
        ]);

        allGamemodes.forEach(gm => {
            const t1 = player1.tiers?.[gm];
            const t2 = player2.tiers?.[gm];
            
            comparison.gamemodes[gm] = {
                player1: t1 || 'N/A',
                player2: t2 || 'N/A',
                better: this.compareTiers(t1, t2)
            };
        });

        return comparison;
    }

    compareTiers(tier1, tier2) {
        if (!tier1 && !tier2) return 'tie';
        if (!tier1) return 'player2';
        if (!tier2) return 'player1';

        const tierRank = {
            'HT0': 0, 'LT0': 1, 'RHT0': 0, 'RLT0': 1,
            'HT1': 2, 'LT1': 3, 'RHT1': 2, 'RLT1': 3,
            'HT2': 4, 'LT2': 5, 'RHT2': 4, 'RLT2': 5,
            'HT3': 6, 'LT3': 7, 'RHT3': 6, 'RLT3': 7,
            'HT4': 8, 'LT4': 9, 'RHT4': 8, 'RLT4': 9,
            'HT5': 10, 'LT5': 11, 'RHT5': 10, 'RLT5': 11,
            'HT6': 12, 'LT6': 13, 'RHT6': 12, 'RLT6': 13,
        };

        const rank1 = tierRank[tier1] ?? 999;
        const rank2 = tierRank[tier2] ?? 999;

        if (rank1 < rank2) return 'player1';
        if (rank2 < rank1) return 'player2';
        return 'tie';
    }

    renderComparison(comparison) {
        const [p1Name, p2Name] = comparison.players;
        const [p1Points, p2Points] = comparison.totalPoints;

        return `
            <div style="padding: 20px;">
                <h2 style="text-align: center; margin-bottom: 24px; color: #e5e5e5;">
                    Player Comparison
                </h2>

                <!-- Points Comparison -->
                <div style="
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 20px;
                    margin-bottom: 32px;
                    align-items: center;
                ">
                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: 700; color: ${p1Points > p2Points ? '#10b981' : '#e5e5e5'};">
                            ${p1Name}
                        </div>
                        <div style="font-size: 2rem; font-weight: 800; color: ${p1Points > p2Points ? '#10b981' : '#9ca3af'}; margin-top: 8px;">
                            ${p1Points}
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b;">points</div>
                    </div>

                    <div style="font-size: 1.5rem; color: #64748b;">VS</div>

                    <div style="text-align: center;">
                        <div style="font-size: 1.2rem; font-weight: 700; color: ${p2Points > p1Points ? '#10b981' : '#e5e5e5'};">
                            ${p2Name}
                        </div>
                        <div style="font-size: 2rem; font-weight: 800; color: ${p2Points > p1Points ? '#10b981' : '#9ca3af'}; margin-top: 8px;">
                            ${p2Points}
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b;">points</div>
                    </div>
                </div>

                <!-- Gamemode Comparison -->
                <div style="
                    background: rgba(20, 20, 20, 0.6);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid rgba(80, 80, 80, 0.3);
                ">
                    <h3 style="color: #9ca3af; margin-bottom: 16px; font-size: 1rem; text-transform: uppercase;">
                        Gamemode Breakdown
                    </h3>
                    ${Object.entries(comparison.gamemodes).map(([gm, data]) => `
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr auto 1fr;
                            gap: 12px;
                            padding: 12px;
                            margin-bottom: 8px;
                            background: rgba(30, 30, 30, 0.6);
                            border-radius: 8px;
                            align-items: center;
                        ">
                            <div style="text-align: right;">
                                <span class="tier ${data.player1.toLowerCase()}" style="${data.better === 'player1' ? 'box-shadow: 0 0 12px currentColor;' : ''}">
                                    ${data.player1}
                                </span>
                            </div>
                            <div style="
                                font-size: 0.85rem;
                                color: #64748b;
                                text-transform: uppercase;
                                font-weight: 600;
                                min-width: 100px;
                                text-align: center;
                            ">
                                ${gm}
                            </div>
                            <div style="text-align: left;">
                                <span class="tier ${data.player2.toLowerCase()}" style="${data.better === 'player2' ? 'box-shadow: 0 0 12px currentColor;' : ''}">
                                    ${data.player2}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

const playerComparison = new PlayerComparison();


// ============================================================================
// SEARCH BY TIER
// ============================================================================

// ============================================================================
// ADVANCED SEARCH SYSTEM
// ============================================================================

class AdvancedSearch {
    constructor() {
        this.searchHistory = this.loadHistory();
        this.filters = {
            tier: null,
            region: null,
            points: { min: null, max: null },
            gamemode: null,
            badge: null
        };
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('search_history') || '[]');
        } catch {
            return [];
        }
    }

    saveHistory(query) {
        if (!query.trim()) return;
        this.searchHistory = [query, ...this.searchHistory.filter(q => q !== query)].slice(0, 10);
        localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }

    parseQuery(query) {
        const tokens = query.toLowerCase().trim().split(/\s+/);
        const filters = {};
        let nameSearch = [];

        tokens.forEach(token => {
            // Tier filters: #ht, #lt, #rt, #t5, #ht3
            if (token.startsWith('#')) {
                const tierQuery = token.slice(1).toUpperCase();
                if (/^(HT|LT|RT|RHT|RLT|T\d)/.test(tierQuery)) {
                    filters.tier = tierQuery;
                }
            }
            // Region filter: @na, @eu, @as, @sa, @me, @au, @af
            else if (token.startsWith('@')) {
                filters.region = token.slice(1).toUpperCase();
            }
            // Points filter: >100, <500, 100-500
            else if (token.startsWith('>')) {
                filters.minPoints = parseInt(token.slice(1));
            }
            else if (token.startsWith('<')) {
                filters.maxPoints = parseInt(token.slice(1));
            }
            else if (/^\d+-\d+$/.test(token)) {
                const [min, max] = token.split('-').map(Number);
                filters.minPoints = min;
                filters.maxPoints = max;
            }
            // Badge filter: !legendary, !master, !expert
            else if (token.startsWith('!')) {
                filters.badge = token.slice(1);
            }
            // Gamemode filter: :crystal, :sword, :uhc
            else if (token.startsWith(':')) {
                filters.gamemode = token.slice(1);
            }
            // Regular name search
            else {
                nameSearch.push(token);
            }
        });

        filters.name = nameSearch.join(' ');
        return filters;
    }

    search(query) {
        const filters = this.parseQuery(query);
        
        return players.filter(player => {
            // Name filter
            if (filters.name && !player.name.toLowerCase().includes(filters.name)) {
                return false;
            }

            // Tier filter
            if (filters.tier) {
                const hasTier = this.matchesTierFilter(player, filters.tier);
                if (!hasTier) return false;
            }

            // Region filter
            if (filters.region && player.region?.toUpperCase() !== filters.region) {
                return false;
            }

            // Points filter
            const points = calculatePoints(player);
            if (filters.minPoints && points < filters.minPoints) return false;
            if (filters.maxPoints && points > filters.maxPoints) return false;

            // Badge filter
            if (filters.badge) {
                const badge = getBadge(points);
                if (!badge.class.includes(filters.badge)) return false;
            }

            // Gamemode filter
            if (filters.gamemode && !player.tiers?.[filters.gamemode]) {
                return false;
            }

            return true;
        });
    }

    matchesTierFilter(player, tierQuery) {
        const checkTier = (tier) => {
            if (tierQuery === 'HT') return /^HT\d+$/.test(tier);
            if (tierQuery === 'LT') return /^LT\d+$/.test(tier);
            if (tierQuery === 'RT') return /^R/.test(tier);
            if (tierQuery === 'RHT') return /^RHT\d+$/.test(tier);
            if (tierQuery === 'RLT') return /^RLT\d+$/.test(tier);
            if (/^T\d+$/.test(tierQuery)) {
                const num = tierQuery[1];
                return new RegExp(`^(HT|LT|RHT|RLT)${num}$`).test(tier);
            }
            return tier === tierQuery;
        };

        return Object.values(player.tiers || {}).some(checkTier);
    }

    getSuggestions(query) {
        if (!query.trim()) return this.searchHistory.map(h => ({
            type: 'history',
            value: h,
            label: h,
            icon: '🕒'
        }));

        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        // Suggest player names
        players.forEach(p => {
            if (p.name.toLowerCase().includes(lowerQuery) && suggestions.length < 5) {
                suggestions.push({
                    type: 'player',
                    value: p.name,
                    label: p.name,
                    icon: '👤'
                });
            }
        });

        // Suggest filters if typing special characters
        if (query.includes('#')) {
            suggestions.push(
                { type: 'filter', value: '#ht', label: 'High Tiers', icon: '🔍' },
                { type: 'filter', value: '#lt', label: 'Low Tiers', icon: '🔍' },
                { type: 'filter', value: '#rt', label: 'Retired', icon: '🔍' },
                { type: 'filter', value: '#t5', label: 'All Tier 5', icon: '🔍' }
            );
        }
        if (query.includes('@')) {
            ['NA', 'EU', 'AS', 'SA', 'ME', 'AU', 'AF'].forEach(region => {
                suggestions.push({
                    type: 'filter',
                    value: `@${region.toLowerCase()}`,
                    label: `Region: ${region}`,
                    icon: '🌍'
                });
            });
        }
        if (query.includes(':')) {
            Object.keys(kitInfo).forEach(gm => {
                if (suggestions.length < 8) {
                    suggestions.push({
                        type: 'filter',
                        value: `:${gm}`,
                        label: `Gamemode: ${gm}`,
                        icon: '🎮'
                    });
                }
            });
        }

        return suggestions.slice(0, 8);
    }
}

const advancedSearch = new AdvancedSearch();


// Helper function to render with custom filter
function renderPlayersWithFilter(filteredList) {
    const container = document.getElementById('playerList');
    container.innerHTML = '';
    
    if (!filteredList.length) {
        container.innerHTML = `<div class="no-results">No players found</div>`;
        return;
    }
    
    // Sort by points
    filteredList.forEach(p => p.points = calculatePoints(p));
    filteredList.sort((a, b) => b.points - a.points);
    
    // Calculate pagination
    const totalPlayers = filteredList.length;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);
    const startIndex = (currentPage - 1) * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const playersToShow = filteredList.slice(startIndex, endIndex);
    
    playersToShow.forEach((p, idx) => {
        const badge = getBadge(p.points);
        const displayRank = startIndex + idx + 1;
        
        const gamemodeIcons = {
            crystal: fixAssetPath("assets/gamemode-icons/Crystal.svg"),
            sword: fixAssetPath("assets/gamemode-icons/Sword.svg"),
            uhc: fixAssetPath("assets/gamemode-icons/Uhc.svg"),
            potion: fixAssetPath("assets/gamemode-icons/Potion.svg"),
            nethpot: fixAssetPath("assets/gamemode-icons/Nethpot.svg"),
            nethsword: fixAssetPath("assets/gamemode-icons/NethSword.svg"),
            smp: fixAssetPath("assets/gamemode-icons/Smp.svg"),
            axe: fixAssetPath("assets/gamemode-icons/Axe.svg"),
            mace: fixAssetPath("assets/gamemode-icons/Mace.svg"),
            diasmp: fixAssetPath("assets/gamemode-icons/Diasmp.svg"),
            speed: fixAssetPath("assets/gamemode-icons/Speed.svg"),
            elytra: fixAssetPath("assets/gamemode-icons/Elytra.svg"),
            cart: fixAssetPath("assets/gamemode-icons/Cart.svg"),
            ogvanilla: fixAssetPath("assets/gamemode-icons/OgVanilla.svg"),
            nethuhc: fixAssetPath("assets/gamemode-icons/NethUhc.svg"),
        };
        
        const tierHierarchy = {
            HT0: 0, LT0: 1, RHT0: 0, RLT0: 1,
            HT1: 2, LT1: 3, RHT1: 2, RLT1: 3,
            HT2: 4, LT2: 5, RHT2: 4, RLT2: 5,
            HT3: 6, LT3: 7, RHT3: 6, RLT3: 7,
            HT4: 8, LT4: 9, RHT4: 8, RLT4: 9,
            HT5: 10, LT5: 11, RHT5: 10, RLT5: 11,
            HT6: 12, LT6: 13, RHT6: 12, RLT6: 13,
        };
        
        const playerMainTiers = [];
        const playerSubTiers = [];
        const playerLimitedTiers = [];
        
        ALL_GAMEMODES.main.forEach((gm) => {
            const tier = p.tiers?.[gm];
            const peakTier = p.peakTiers?.[gm];
            playerMainTiers.push([gm, tier || null, peakTier]);
        });
        
        ALL_GAMEMODES.sub.forEach((gm) => {
            const tier = p.tiers?.[gm];
            const peakTier = p.peakTiers?.[gm];
            playerSubTiers.push([gm, tier || null, peakTier]);
        });
        
        ALL_GAMEMODES.limited.forEach((gm) => {
            const tier = p.tiers?.[gm];
            const peakTier = p.peakTiers?.[gm];
            playerLimitedTiers.push([gm, tier || null, peakTier]);
        });
        
        const sortByTierHierarchy = (a, b) => {
            const rankA = tierHierarchy[a[1]] ?? 999;
            const rankB = tierHierarchy[b[1]] ?? 999;
            return rankA - rankB;
        };
        
        playerMainTiers.sort(sortByTierHierarchy);
        playerSubTiers.sort(sortByTierHierarchy);
        playerLimitedTiers.sort(sortByTierHierarchy);
        
        const createTierItem = ([gm, tier, peakTier]) => {
            const iconSrc = gamemodeIcons[gm] || 'assets/gamemode-icons/Overall.svg';
            
            if (!tier && STANDBY_TIER_CONFIG.enabled) {
                return `
                    <div class="tier-wrapper">
                        <div class="gamemode-tier-item standby-tier" style="opacity: ${STANDBY_TIER_CONFIG.opacity};">
                            <div class="gamemode-tier-icon-container" style="border-color: #444; border-style: dashed;">
                                <img class="gamemode-tier-icon" src="${iconSrc}" alt="${gm}" onerror="this.style.display='none';">
                            </div>
                            <span class="tier" style="background: #333; color: #666; box-shadow: none;">
                                ${STANDBY_TIER_CONFIG.label}
                            </span>
                        </div>
                    </div>
                `;
            }
            
            return createTierWithTooltip(gm, tier, peakTier, iconSrc);
        };
        
        let gamemodeDisplay = '';
        
        if (playerMainTiers.length > 0) {
            gamemodeDisplay += '<div class="tier-row-wrapper">';
            gamemodeDisplay += '<span class="tier-row-label">Main Tiers:</span>';
            gamemodeDisplay += '<div class="tier-row">';
            gamemodeDisplay += playerMainTiers.map(createTierItem).join('');
            gamemodeDisplay += '</div>';
            gamemodeDisplay += '</div>';
        }
        
        if (playerSubTiers.length > 0) {
            gamemodeDisplay += '<div class="tier-row-wrapper">';
            gamemodeDisplay += '<span class="tier-row-label">SubTiers:</span>';
            gamemodeDisplay += '<div class="tier-row">';
            gamemodeDisplay += playerSubTiers.map(createTierItem).join('');
            gamemodeDisplay += '</div>';
            gamemodeDisplay += '</div>';
        }
        
        if (playerLimitedTiers.length > 0) {
            gamemodeDisplay += '<div class="tier-row-wrapper">';
            gamemodeDisplay += '<span class="tier-row-label">Limited Tiers:</span>';
            gamemodeDisplay += '<div class="tier-row">';
            gamemodeDisplay += playerLimitedTiers.map(createTierItem).join('');
            gamemodeDisplay += '</div>';
            gamemodeDisplay += '</div>';
        }
        
        const rankClass = displayRank === 1 ? "gold" : displayRank === 2 ? "silver" : displayRank === 3 ? "bronze" : "";
        let placementBadge = "";
        
        if (displayRank === 1) {
            placementBadge = `<img src="${fixAssetPath('assets/icons/Placement1.svg')}" alt="1st Place" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" />`;
        } else if (displayRank === 2) {
            placementBadge = `<img src="${fixAssetPath('assets/icons/Placement2.svg')}" alt="2nd Place" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" />`;
        } else if (displayRank === 3) {
            placementBadge = `<img src="${fixAssetPath('assets/icons/Placement3.svg')}" alt="3rd Place" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" />`;
        } else {
            placementBadge = `<img src="${fixAssetPath('assets/icons/PlacementOther.svg')}" alt="Rank" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" />`;
        }
        
        const row = document.createElement('div');
        row.className = 'player-row';
        row.innerHTML = `
            <div class="rank ${rankClass}" style="position: relative; display: flex; align-items: center; justify-content: center;">
                ${placementBadge}
                <span style="position: relative; z-index: 2;">${displayRank}</span>
            </div>
            <div class="player-info">
                <img class="player-avatar" src="${p.avatar}" alt="${p.name}">
                <div class="player-details">
                    <span class="player-name">
                        ${p.name}
                        <span class="player-region ${String(p.region || "").toLowerCase()}">${p.region || ''}</span>
                    </span>
                    <span class="player-points">
                        <span class="points-number">${p.points} pts</span>
                        <span class="points-badge ${badge.class}">${badge.label}</span>
                    </span>
                </div>
            </div>
            <div class="gamemode-tiers">${gamemodeDisplay}</div>
        `;
        
        row.addEventListener('click', () => openPlayerModal(p));
        row.dataset.username = p.name;
        row.dataset.tiers = JSON.stringify(p.tiers);
        row.dataset.points = p.points;
        
        container.appendChild(row);
    });
    
    updatePaginationControls(totalPages, totalPlayers);
}


// ============================================================================
// USAGE EXAMPLES & INTEGRATION
// ============================================================================

// Example: Set player bio (admin function)
function setPlayerBio(playerName, bio) {
    playerBioSystem.setBio(playerName, bio);
}

// Player comparison modal handlers
document.getElementById('closeComparison').addEventListener('click', () => {
    document.getElementById('comparisonModal').classList.remove('active');
});

document.getElementById('comparisonModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('comparisonModal')) {
        document.getElementById('comparisonModal').classList.remove('active');
    }
});

function populatePlayerDatalist() {
    const datalist1 = document.getElementById('playerList1');
    const datalist2 = document.getElementById('playerList2');
    
    const options = players.map(p => `<option value="${p.name}">`).join('');
    datalist1.innerHTML = options;
    datalist2.innerHTML = options;
}

// Enable compare button when both players selected
['player1Input', 'player2Input'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        const p1 = document.getElementById('player1Input').value;
        const p2 = document.getElementById('player2Input').value;
        const btn = document.getElementById('executeCompare');
        btn.disabled = !p1 || !p2;
        
        // Highlight selected boxes
        if (p1) {
            document.getElementById('player1Box').classList.add('selected');
        } else {
            document.getElementById('player1Box').classList.remove('selected');
        }
        
        if (p2) {
            document.getElementById('player2Box').classList.add('selected');
        } else {
            document.getElementById('player2Box').classList.remove('selected');
        }
    });
});

// Execute comparison
document.getElementById('executeCompare').addEventListener('click', () => {
    const p1Name = document.getElementById('player1Input').value;
    const p2Name = document.getElementById('player2Input').value;
    
    const player1 = players.find(p => p.name === p1Name);
    const player2 = players.find(p => p.name === p2Name);
    
    if (player1 && player2) {
        const comparison = playerComparison.compare(player1, player2);
        document.getElementById('comparisonResult').innerHTML = 
            playerComparison.renderComparison(comparison);
    } else {
        document.getElementById('comparisonResult').innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 20px;">
                ❌ One or both players not found. Please check the names.
            </div>
        `;
    }
});

// ENHANCED openPlayerModal - Wrap your existing function
const originalOpenPlayerModal = typeof openPlayerModal !== 'undefined' ? openPlayerModal : null;

if (originalOpenPlayerModal) {
    openPlayerModal = function(player) {
        // Call original function
        originalOpenPlayerModal(player);
        
        // Add enhanced profile section to modal if not already added
        const modalBody = document.getElementById('modalBody');
        if (!document.getElementById('enhancedPlayerProfile')) {
            const enhancedSection = document.createElement('div');
            enhancedSection.id = 'enhancedPlayerProfile';
            enhancedSection.innerHTML = `

                <!-- Bio Section -->
                <div class="bio-section">
                    <h3 class="bio-section-title">📝 Player Bio</h3>
                    <div id="playerBio"></div>
                </div>

                <!-- Comparison Button -->
                <button class="compare-players-button" id="openCompareFromProfile">
                    ⚖️ Compare with Another Player
                </button>
            `;
            modalBody.appendChild(enhancedSection);
            
            // Add event listener for compare button
            document.getElementById('openCompareFromProfile').addEventListener('click', () => {
                document.getElementById('comparisonModal').classList.add('active');
                document.getElementById('playerModal').style.display = 'none';
                populatePlayerDatalist();
                
                // Pre-fill first player
                document.getElementById('player1Input').value = player.name;
                document.getElementById('player1Box').classList.add('selected');
            });
        }
        
        // Populate bio
        const bioHtml = playerBioSystem.renderBio(player.name);
        document.getElementById('playerBio').innerHTML = bioHtml;
        
        // Show enhanced profile
        document.getElementById('enhancedPlayerProfile').style.display = 'block';
        
        // Check for new achievements
    };
}

// ============================================================================
// INITIALIZE ADVANCED SEARCH
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('searchBox');
    const suggestionsBox = document.getElementById('searchSuggestions');
    const clearBtn = document.getElementById('clearSearchBtn');
    const helpBtn = document.getElementById('searchHelpBtn');
    const searchWrapper = document.getElementById('searchWrapper');
    
    if (!searchBox || !searchWrapper) return;
    
    let debounceTimer;
    
    // Search input handler
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value;
        
        // Show/hide clear button
        clearBtn.style.display = query ? 'block' : 'none';
        
        // Debounce search
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (query.trim()) {
                const results = advancedSearch.search(query);
                advancedSearch.saveHistory(query);
                currentPage = 1;
                renderPlayersWithFilter(results);
                
                // Show suggestions
                const suggestions = advancedSearch.getSuggestions(query);
                renderSuggestions(suggestions);
            } else {
                renderPlayers();
                if (suggestionsBox) suggestionsBox.style.display = 'none';
            }
        }, 300);
    });
    
    // Focus effects
    searchBox.addEventListener('focus', () => {
        if (searchWrapper) {
            searchWrapper.style.borderColor = '#aaa';
            searchWrapper.style.boxShadow = '0 0 20px rgba(170, 170, 170, 0.3)';
        }
        
        if (searchBox.value.trim()) {
            const suggestions = advancedSearch.getSuggestions(searchBox.value);
            renderSuggestions(suggestions);
        }
    });
    
    searchBox.addEventListener('blur', () => {
        if (searchWrapper) {
            searchWrapper.style.borderColor = 'rgba(80, 80, 80, 0.4)';
            searchWrapper.style.boxShadow = 'none';
        }
        
        // Delay hiding suggestions to allow clicks
        setTimeout(() => {
            if (suggestionsBox) suggestionsBox.style.display = 'none';
        }, 200);
    });
    
    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchBox.value = '';
            clearBtn.style.display = 'none';
            currentPage = 1;
            renderPlayers();
            searchBox.focus();
        });
    }
    
    // Help button
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            const modal = document.getElementById('searchHelpModal');
            if (modal) modal.style.display = 'flex';
        });
    }
    
    // Close help modal handlers
    const closeHelpBtn = document.getElementById('closeSearchHelp');
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', () => {
            const modal = document.getElementById('searchHelpModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    const helpModal = document.getElementById('searchHelpModal');
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }
    
    // Render suggestions
    function renderSuggestions(suggestions) {
        if (!suggestionsBox || !suggestions.length) {
            if (suggestionsBox) suggestionsBox.style.display = 'none';
            return;
        }
        
        suggestionsBox.innerHTML = suggestions.map(s => `
            <div class="suggestion-item" data-value="${s.value}" style="
                padding: 12px;
                cursor: pointer;
                border-radius: 8px;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                gap: 12px;
            ">
                <span style="font-size: 1.2rem;">${s.icon}</span>
                <div style="flex: 1;">
                    <div style="color: #e5e5e5; font-weight: 600;">${s.label}</div>
                    ${s.type === 'filter' ? `<div style="color: #64748b; font-size: 0.85rem;">Click to add filter</div>` : ''}
                </div>
            </div>
        `).join('');
        
        suggestionsBox.style.display = 'block';
        
        // Add click handlers
        suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(50, 50, 50, 0.6)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                if (item.querySelector('[style*="Click to add filter"]')) {
                    searchBox.value = searchBox.value.trim() + ' ' + value;
                } else {
                    searchBox.value = value;
                }
                searchBox.focus();
                searchBox.dispatchEvent(new Event('input'));
            });
        });
    }
});

// Run milestone check after players load
const originalLoadPlayers = loadPlayers;
loadPlayers = async function() {
    await originalLoadPlayers();
    checkMilestones();
};

// ============================================
// ADMIN FUNCTIONS - Use these to set player bios
// ============================================

// Example: Set a player bio (you'd call this from admin panel or manually)
function setPlayerBioExample() {
    // Example usage:
    playerBioSystem.setBio('ImApo', {
        description: 'Competitive PvP player specializing in Sword combat. Known for aggressive playstyle and quick reflexes.',
        socials: {
            youtube: 'https://youtube.com/@exampleplayer',
            twitch: 'https://twitch.tv/exampleplayer',
            twitter: 'https://twitter.com/exampleplayer',
            discord: 'exampleplayer#1234'
        },
        favGamemode: 'Crystal',
        playstyle: 'Aggressive'
    });
    
    console.log('✅ Bio set for ExamplePlayer');
}


// Run example activities on load
setTimeout(addExampleActivities, 1000);

// =======================
// Context Menu
// =======================
const contextMenu = document.getElementById("playerContextMenu");
let contextPlayer = null;

// Show context menu only on player rows
document.querySelector("#playerList").addEventListener("contextmenu", (e) => {
    const row = e.target.closest(".player-row");
    if (row) {
        e.preventDefault();

        // Get player data stored on the row
        contextPlayer = {
            name: row.dataset.username,
            points: row.dataset.points,
            tiers: row.dataset.tiers,
        };

        // Update label dynamically
        contextMenu.querySelector(
            ".context-label"
        ).innerText = `Profile – ${contextPlayer.name}`;

        // Position the menu
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.display = "block";
    }
});

contextMenu.addEventListener("click", (e) => {
    if (!contextPlayer) return;
    const action = e.target.dataset.action;
    if (action === "username") {
        navigator.clipboard.writeText(contextPlayer.name);
    } else if (action === "tiers") {
        navigator.clipboard.writeText(contextPlayer.tiers);
    } else if (action === "points") {
        navigator.clipboard.writeText(contextPlayer.points);
    }
    contextMenu.style.display = "none";
});

document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target) && !regionModal.contains(e.target)) {
        contextMenu.style.display = "none";
    }
});


let lastScrollTop = 0;
const navbar = document.getElementById('navbar');
const scrollThreshold = 30;

if (navbar) {
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
}

document.getElementById("kitInfoBtn").addEventListener("click", () => {
    const info = kitInfo[currentGamemode];
    if (info) {
        document.getElementById("kitInfoTitle").textContent = info.title;
        document.getElementById("kitInfoDesc").textContent = info.description;
        document.querySelector("#kitInfoImage img").src = info.image;
        document.getElementById("kitInfoModal").style.display = "flex";
    }
});

document.getElementById("closeKitInfo").addEventListener("click", () => {
    document.getElementById("kitInfoModal").style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
    window.loadStartTime = Date.now();
    
    // Initialize from URL first
    initializeFromURL();
    // Then load players
    loadPlayers();
});

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
discord: cxnine._ Axis Discord Server: https://discord.gg/e39z2S4Edg
-----------------------------------------------------------------------------------`);
