const tierPoints = {
    RHT0: 100,
    RLT0: 75,
    HT0: 100,
    LT0: 75,
    RHT1: 60,
    RLT1: 45,
    HT1: 60,
    LT1: 45,
    RHT2: 30,
    RLT2: 20,
    HT2: 30,
    LT2: 20,
    RHT3: 10,
    RLT3: 6,
    HT3: 10,
    LT3: 6,
    RHT4: 4,
    RLT4: 3,
    HT4: 4,
    LT4: 3,
    RHT5: 2,
    RLT5: 1,
    HT5: 2,
    LT5: 1,
    RHT6: -5,
    RLT6: -10,
    HT6: -5,
    LT6: -10,
};
let players = [];
let currentGamemode = "overall";
let currentPage = 1;
let playersPerPage = 50;
let isInitialLoad = !0;
async function loadPlayers() {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingSubtext = document.getElementById("loadingSubtext");
    try {
        const res = await fetch(
            "https://stellartiersbot.onrender.com/playersstellar.json"
        );
        if (!res.ok) throw new Error("Network response was not ok");
        players = await res.json();
        if (isInitialLoad) {
            const minLoadTime = 750;
            const startTime = window.loadStartTime || Date.now();
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadTime - elapsedTime);
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.classList.add("hidden");
                    setTimeout(() => {
                        loadingScreen.style.display = "none";
                    }, 500);
                }
                isInitialLoad = !1;
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
function getBadge(points) {
    if (points >= 250) return { label: "Legendary", class: "legendary" };
    if (points >= 150) return { label: "Master", class: "master" };
    if (points >= 75) return { label: "Expert", class: "expert" };
    if (points >= 45) return { label: "Advanced", class: "advanced" };
    if (points >= 20) return { label: "Intermediate", class: "intermediate" };
    return { label: "Novice", class: "novice" };
}
function updatePaginationControls(totalPages, totalPlayers) {
    const existingPagination = document.getElementById("pagination");
    if (existingPagination) {
        existingPagination.remove();
    }
    if (totalPages <= 1) return;
    const startRank = (currentPage - 1) * playersPerPage + 1;
    const endRank = Math.min(currentPage * playersPerPage, totalPlayers);
    const pagination = document.createElement("div");
    pagination.id = "pagination";
    pagination.style.cssText = ` display:flex;justify-content:center;align-items:center;gap:12px;margin-top:30px;padding:20px 0;border-top:1px solid rgb(168 85 247 / .3);`;
    const pageInfo = document.createElement("span");
    pageInfo.style.cssText = ` color:#9ca3af;font-size:.9rem;font-weight:600;margin:0 16px;`;
    pageInfo.textContent = `Showing ${startRank}-${endRank}of ${totalPlayers}players`;
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "← Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.cssText = ` background:${
        currentPage === 1 ? "rgba(60, 60, 60, 0.5)" : "rgba(45, 27, 78, 0.95)"
    };border:2px solid rgb(168 85 247 / .6);border-radius:12px;padding:8px 16px;color:${
        currentPage === 1 ? "#666" : "#c4b5fd"
    };font-weight:600;cursor:${
        currentPage === 1 ? "not-allowed" : "pointer"
    };transition:all 0.3s ease;`;
    if (currentPage > 1) {
        prevBtn.addEventListener("mouseover", () => {
            prevBtn.style.background = "rgba(124, 58, 237, 0.95)";
            prevBtn.style.borderColor = "#c4b5fd";
        });
        prevBtn.addEventListener("mouseout", () => {
            prevBtn.style.background = "rgba(45, 27, 78, 0.95)";
            prevBtn.style.borderColor = "rgba(168, 85, 247, 0.6)";
        });
    }
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next →";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.cssText = ` background:${
        currentPage === totalPages
            ? "rgba(60, 60, 60, 0.5)"
            : "rgba(45, 27, 78, 0.95)"
    };border:2px solid rgb(168 85 247 / .6);border-radius:12px;padding:8px 16px;color:${
        currentPage === totalPages ? "#666" : "#c4b5fd"
    };font-weight:600;cursor:${
        currentPage === totalPages ? "not-allowed" : "pointer"
    };transition:all 0.3s ease;`;
    if (currentPage < totalPages) {
        nextBtn.addEventListener("mouseover", () => {
            nextBtn.style.background = "rgba(124, 58, 237, 0.95)";
            nextBtn.style.borderColor = "#c4b5fd";
        });
        nextBtn.addEventListener("mouseout", () => {
            nextBtn.style.background = "rgba(45, 27, 78, 0.95)";
            nextBtn.style.borderColor = "rgba(168, 85, 247, 0.6)";
        });
    }
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
    const pageNumbers = document.createElement("div");
    pageNumbers.style.cssText = ` display:flex;gap:6px;align-items:center;`;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (startPage > 1) {
        const firstPage = createPageButton(1);
        pageNumbers.appendChild(firstPage);
        if (startPage > 2) {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.style.color = "#9ca3af";
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
            dots.style.color = "#9ca3af";
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
    btn.style.cssText = ` background:${
        pageNum === currentPage
            ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
            : "rgba(45, 27, 78, 0.95)"
    };border:2px solid ${
        pageNum === currentPage ? "#c4b5fd" : "rgba(168, 85, 247, 0.6)"
    };border-radius:8px;padding:6px 12px;color:${
        pageNum === currentPage ? "#fff" : "#c4b5fd"
    };font-weight:${
        pageNum === currentPage ? "700" : "600"
    };cursor:pointer;transition:all 0.3s ease;min-width:36px;`;
    if (pageNum !== currentPage) {
        btn.addEventListener("mouseover", () => {
            btn.style.background = "rgba(124, 58, 237, 0.95)";
            btn.style.borderColor = "#c4b5fd";
        });
        btn.addEventListener("mouseout", () => {
            btn.style.background = "rgba(45, 27, 78, 0.95)";
            btn.style.borderColor = "rgba(168, 85, 247, 0.6)";
        });
    }
    btn.addEventListener("click", () => {
        currentPage = pageNum;
        renderPlayers();
    });
    return btn;
}
function renderTierColumns(filteredPlayers, container) {
    // 1. Check if ANY player has a Tier 0 or Tier 6 in this specific gamemode
    let hasTier0 = false;
    let hasTier6 = false;

    filteredPlayers.forEach(p => {
        const t = p.tiers && p.tiers[currentGamemode];
        if (t && t.endsWith('0')) hasTier0 = true;
        if (t && t.endsWith('6')) hasTier6 = true;
    });

    // 2. Build the columns list dynamically. 
    const tierGroups = {};
    if (hasTier0) tierGroups["Tier 0"] = [];
    tierGroups["Tier 1"] = [];
    tierGroups["Tier 2"] = [];
    tierGroups["Tier 3"] = [];
    tierGroups["Tier 4"] = [];
    tierGroups["Tier 5"] = [];
    if (hasTier6) tierGroups["Tier 6"] = [];

    // 3. Mapping for tier strings to column group names
    const tierMapping = {
        HT0: "Tier 0", LT0: "Tier 0", RHT0: "Tier 0", RLT0: "Tier 0",
        HT1: "Tier 1", LT1: "Tier 1", RHT1: "Tier 1", RLT1: "Tier 1",
        HT2: "Tier 2", LT2: "Tier 2", RHT2: "Tier 2", RLT2: "Tier 2",
        HT3: "Tier 3", LT3: "Tier 3", RHT3: "Tier 3", RLT3: "Tier 3",
        HT4: "Tier 4", LT4: "Tier 4", RHT4: "Tier 4", RLT4: "Tier 4",
        HT5: "Tier 5", LT5: "Tier 5", RHT5: "Tier 5", RLT5: "Tier 5",
        HT6: "Tier 6", LT6: "Tier 6", RHT6: "Tier 6", RLT6: "Tier 6",
    };

    // 4. Icons configuration (Tier 0 uses tier_1 gold, Tier 6 uses tier_45 black)
    const tierIcons = {
        "Tier 0": "../assets/icons/tier_1.svg",   // Uses Gold Trophy (Same as T1)
        "Tier 1": "../assets/icons/tier_1.svg",
        "Tier 2": "../assets/icons/tier_2.svg",
        "Tier 3": "../assets/icons/tier_3.svg",
        "Tier 4": "../assets/icons/tier_45.svg",
        "Tier 5": "../assets/icons/tier_45.svg",
        "Tier 6": "../assets/icons/tier_45.svg",  // Uses Black Trophy (Same as T5)
    };

    // Populate groups using standard currentGamemode lookup
    filteredPlayers.forEach((player) => {
        const tierCode = player.tiers && player.tiers[currentGamemode];
        const tierGroup = tierMapping[tierCode];
        if (tierGroup) {
            player.currentTierCode = tierCode;
            tierGroups[tierGroup].push(player);
        }
    });

    const columnsContainer = document.createElement("div");
    columnsContainer.className = "tier-columns-container";

    Object.entries(tierGroups).forEach(([tierName, players]) => {
        const column = document.createElement("div");
        column.className = "tier-column";

        const header = document.createElement("div");
        
        // Extract the number (e.g. "0", "1", "6") so the CSS matches correctly
        const tierNum = tierName.split(' ')[1]; 
        header.className = `tier-column-header tier-${tierNum}`;

        const tierIcon = tierIcons[tierName];
        if (tierIcon) {
            header.innerHTML = `<img src="${tierIcon}" alt="${tierName}" onerror="this.style.display='none';"> ${tierName}`;
        } else {
            header.textContent = tierName;
        }

        column.appendChild(header);

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

                const tierIndicatorHTML = isRetired
                    ? `<img src="../assets/icons/retired_icon.svg" class="retired-indicator-icon" alt="Retired" onerror="this.style.display='none';">`
                    : "";

                const htltIndicatorHTML = isHighTier
                    ? `<img src="../assets/icons/ht_icon.svg" class="tier-indicator-icon" alt="HT" onerror="this.style.display='none';">`
                    : `<img src="../assets/icons/lt_icon.svg" class="tier-indicator-icon" alt="LT" onerror="this.style.display='none';">`;

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
    if (currentGamemode === "overall") {
        filtered.forEach((p) => (p.points = calculatePoints(p)));
        filtered.sort((a, b) => b.points - a.points);
    } else {
        filtered.forEach(
            (p) => (p.points = tierPoints[p.tiers[currentGamemode]] || 0)
        );
        filtered.sort((a, b) => b.points - a.points);
    }
    const totalPlayers = filtered.length;
    const totalPages = Math.ceil(totalPlayers / playersPerPage);
    const startIndex = (currentPage - 1) * playersPerPage;
    const endIndex = startIndex + playersPerPage;
    const playersToShow = filtered.slice(startIndex, endIndex);
    const container = document.getElementById("playerList");
    container.innerHTML = "";
    if (!filtered.length) {
        container.innerHTML = `<div class="no-results">No players found</div>`;
        updatePaginationControls(0, 0);
        return;
    }
    const leaderboardHeader = document.getElementById("leaderboardHeader");
    if (leaderboardHeader) {
        if (currentGamemode !== "overall") {
            leaderboardHeader.style.display = "none"; // Hide on specific gamemodes
        } else {
            leaderboardHeader.style.display = "";     // Show on overall tab
        }
    }
    if (currentGamemode !== "overall") {
        renderTierColumns(filtered, container);
        return;
    }
    const gamemodeIcons = {
        crystal: "../assets/gamemode-icons/Crystal.svg",
        sword: "../assets/gamemode-icons/Sword.svg",
        uhc: "../assets/gamemode-icons/Uhc.svg",
        potion: "../assets/gamemode-icons/Potion.svg",
        nethpot: "../assets/gamemode-icons/Nethpot.svg",
        smp: "../assets/gamemode-icons/Smp.svg",
        axe: "../assets/gamemode-icons/Axe.svg",
        mace: "../assets/gamemode-icons/Mace.svg",
        diasmp: "../assets/gamemode-icons/Diasmp.svg",
    };
    const tierHierarchy = {
        HT1: 0,
        RHT1: 0,
        LT1: 1,
        RLT1: 1,
        HT2: 2,
        RHT2: 2,
        LT2: 3,
        RLT2: 3,
        HT3: 4,
        LT3: 5,
        HT4: 6,
        LT4: 7,
        HT5: 8,
        LT5: 9,
    };
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
    playersToShow.forEach((p, idx) => {
        const badge = getBadge(calculatePoints(p));
        const displayRank = startIndex + idx + 1;
        let gamemodeDisplay =
            currentGamemode === "overall"
                ? (() => {
                      const playerTiers = [];
                      mainTiers.forEach((gm) => {
                          if (p.tiers[gm]) {
                              playerTiers.push([gm, p.tiers[gm]]);
                          }
                      });
                      const sortByTierHierarchy = (a, b) => {
                          const rankA = tierHierarchy[a[1]] ?? 999;
                          const rankB = tierHierarchy[b[1]] ?? 999;
                          return rankA - rankB;
                      };
                      playerTiers.sort(sortByTierHierarchy);
                      const createTierItem = ([gm, tier]) => {
                          const iconSrc =
                              gamemodeIcons[gm] ||
                              "assets/gamemode-icons/Overall.svg";
                          const tierClass = tier.toLowerCase();
                          return `<div class="gamemode-tier-item"><div class="gamemode-tier-icon-container" style="border-color: var(--${tierClass}, #666);"><img class="gamemode-tier-icon" src="${iconSrc}" alt="${gm}" onerror="this.style.display='none';"></div><span class="tier ${tierClass}">${tier}</span></div>`;
                      };
                      let html = "";
                      if (playerTiers.length > 0) {
                          html += '<div class="tier-row-wrapper">';
                          html += '<span class="tier-row-label"></span>';
                          html += '<div class="tier-row">';
                          html += playerTiers.map(createTierItem).join("");
                          html += "</div>";
                          html += "</div>";
                      }
                      return html;
                  })()
                : `<span class="tier ${p.tiers[
                      currentGamemode
                  ].toLowerCase()}">${p.tiers[currentGamemode]}</span>`;
        const row = document.createElement("div");
        row.className = "player-row";
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
            placementBadge =
                '<img src="../assets/icons/Placement1.svg" alt="1st Place" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" onerror="this.style.display=\'none\';" />';
        } else if (displayRank === 2) {
            placementBadge =
                '<img src="../assets/icons/Placement2.svg" alt="2nd Place" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" onerror="this.style.display=\'none\';" />';
        } else if (displayRank === 3) {
            placementBadge =
                '<img src="../assets/icons/Placement3.svg" alt="3rd Place" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" onerror="this.style.display=\'none\';" />';
        } else {
            placementBadge =
                '<img src="../assets/icons/PlacementOther.svg" alt="Rank" style="position: absolute; width: 80px; height: 40px; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);" onerror="this.style.display=\'none\';" />';
        }
        row.innerHTML = ` <div class="rank ${rankClass}" style="${badgeContainerStyle}">${placementBadge}<span style="${rankStyle}">${displayRank}</span></div><div class="player-info"><img class="player-avatar" src="${
            p.avatar
        }" alt="${
            p.name
        }"><div class="player-details"><span class="player-name">${p.name}${
            p.region
                ? `<span class="player-region ${String(
                      p.region || " "
                  ).toLowerCase()}">${p.region}</span>`
                : ""
        }</span><span class="player-points">${
            p.points
        } points <span class="points-badge ${badge.class}">${
            badge.label
        }</span></span></div></div><div class="gamemode-tiers">${gamemodeDisplay}</div>`;
        row.addEventListener("click", () => openPlayerModal(p));
        container.appendChild(row);
    });
    updatePaginationControls(totalPages, totalPlayers);
}
function openPlayerModal(player) {
    const modal = document.getElementById("playerModal");
    const body = document.getElementById("modalBody");
    const totalPoints = calculatePoints(player);
    const badge = getBadge(totalPoints);
    const gamemodeIcons = {
        crystal: "../assets/gamemode-icons/Crystal.svg",
        sword: "../assets/gamemode-icons/Sword.svg",
        uhc: "../assets/gamemode-icons/Uhc.svg",
        potion: "../assets/gamemode-icons/Potion.svg",
        nethpot: "../assets/gamemode-icons/Nethpot.svg",
        smp: "../assets/gamemode-icons/Smp.svg",
        axe: "../assets/gamemode-icons/Axe.svg",
        mace: "../assets/gamemode-icons/Mace.svg",
        diasmp: "../assets/gamemode-icons/Diasmp.svg",
    };
    const tierHierarchy = {
        HT1: 0,
        LT1: 1,
        HT2: 2,
        LT2: 3,
        HT3: 4,
        LT3: 5,
        HT4: 6,
        LT4: 7,
        HT5: 8,
        LT5: 9,
    };
    const sortedTiers = Object.entries(player.tiers).sort(
        ([, tierA], [, tierB]) => {
            const rankA = tierHierarchy[tierA] ?? 999;
            const rankB = tierHierarchy[tierB] ?? 999;
            return rankA - rankB;
        }
    );
    const validRegions = ["na", "eu", "as", "sa", "me", "au", "af"];
    const isValidRegion =
        player.region && validRegions.includes(player.region.toLowerCase());
    body.innerHTML = ` <div class="player-modal-header"><img class="player-modal-avatar" src="${
        player.avatar
    }" alt="${player.name}"><h2 class="player-modal-name">${player.name}${
        isValidRegion
            ? `<span class="player-region ${player.region.toLowerCase()}">${player.region.toUpperCase()}</span>`
            : ""
    }</h2><div class="player-modal-points">${totalPoints} points <span class="points-badge ${
        badge.class
    }">${badge.label}</span></div></div>`;
    const nameMcBtn = document.createElement("button");
    nameMcBtn.className = "action-button";
    nameMcBtn.style.cssText = ` background:rgb(45 27 78 / .9);border:2px solid rgb(168 85 247 / .6);border-radius:16px;padding:12px 20px;color:#c4b5fd;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.3s ease;margin:20px auto;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;width:fit-content;`;
    nameMcBtn.innerHTML = ` <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;"><path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" /></svg>View on NameMC `;
    nameMcBtn.addEventListener("click", () => {
        window.open(`https://namemc.com/profile/${player.name}`, "_blank");
    });
    nameMcBtn.addEventListener("mouseenter", () => {
        nameMcBtn.style.background = "#7c3aed";
        nameMcBtn.style.color = "#fff";
        nameMcBtn.style.transform = "translateY(-2px)";
        nameMcBtn.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.7)";
    });
    nameMcBtn.addEventListener("mouseleave", () => {
        nameMcBtn.style.background = "rgba(45, 27, 78, 0.9)";
        nameMcBtn.style.color = "#c4b5fd";
        nameMcBtn.style.transform = "translateY(0)";
        nameMcBtn.style.boxShadow = "0 0 15px rgba(168, 85, 247, 0.3)";
    });
    const modalBody = document.getElementById("modalBody");
    modalBody.appendChild(nameMcBtn);
    const tiersSection = document.createElement("div");
    tiersSection.className = "modal-section";
    tiersSection.style.marginTop = "20px";
    tiersSection.innerHTML = ` <h3 class="modal-section-title">Tiers</h3><div class="tier-grid">${sortedTiers
        .map(([gm, tier]) => {
            const tierClass = tier.toLowerCase();
            const iconSrc =
                gamemodeIcons[gm] || "assets/gamemode-icons/Overall.svg";
            return `<div class="tier-item"><div class="tier-icon-container" style="border-color: var(--${tierClass}, #666);"><img class="tier-icon" src="${iconSrc}" alt="${gm}" onerror="this.style.display='none';"></div><span class="tier-label tier ${tierClass}" style="text-align: center;">${tier}</span><span style="font-size: 0.7rem; color: #9ca3af; text-align: center;">${gm.toUpperCase()}</span></div>`;
        })
        .join("")}</div>`;
    modalBody.appendChild(tiersSection);
    modal.style.display = "flex";
}
document.getElementById("backToMainBtn").addEventListener("click", () => {
    window.location.href =
        "https://im-apo.github.io/SealTiers/rankings/overall";
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

    await loadPlayers();

    setTimeout(() => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.innerHTML = originalContent;
    }, 500);
});
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("playerModal").style.display = "none";
});
document.getElementById("tierInfoBtn").addEventListener("click", () => {
    document.getElementById("tierInfoModal").style.display = "flex";
});
document.getElementById("closeTierInfo").addEventListener("click", () => {
    document.getElementById("tierInfoModal").style.display = "none";
});
document.getElementById("logoBtn").addEventListener("click", () => {
    currentGamemode = "overall";
    currentPage = 1;
    document.getElementById("searchBox").value = "";
    document.querySelectorAll(".gamemode-tab").forEach((t) => {
        if (t.dataset.gamemode === "overall") {
            t.classList.add("active");
        } else {
            t.classList.remove("active");
        }
    });
    renderPlayers();
});
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
document.getElementById("pageSizeSelector").addEventListener("change", (e) => {
    playersPerPage = parseInt(e.target.value);
    localStorage.setItem("playersPerPage", playersPerPage.toString());
    currentPage = 1;
    renderPlayers();
});
document.getElementById("searchBox").addEventListener("input", (e) => {
    if (e.target.value === "/") {
        e.target.value = "";
    }
    currentPage = 1;
    renderPlayers();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        const playerModal = document.getElementById("playerModal");
        const tierInfoModal = document.getElementById("tierInfoModal");
        if (playerModal && playerModal.style.display !== "none") {
            playerModal.style.display = "none";
        }
        if (tierInfoModal && tierInfoModal.style.display !== "none") {
            tierInfoModal.style.display = "none";
        }
        return;
    }
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
window.addEventListener("online", () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingSubtext = document.getElementById("loadingSubtext");
    if (loadingScreen && loadingSubtext) {
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
        loadingScreen.style.display = "flex";
        loadingScreen.classList.remove("hidden");
        loadingSubtext.textContent =
            "No internet connection. Waiting for connection...";
        loadingSubtext.style.color = "#ef4444";
    }
});
document.querySelectorAll(".gamemode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document
            .querySelectorAll(".gamemode-tab")
            .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentGamemode = tab.dataset.gamemode;
        currentPage = 1;
        renderPlayers();
    });
});
document.getElementById("playerModal").addEventListener("click", (e) => {
    if (e.target.id === "playerModal") {
        document.getElementById("playerModal").style.display = "none";
    }
});
document.getElementById("tierInfoModal").addEventListener("click", (e) => {
    if (e.target.id === "tierInfoModal") {
        document.getElementById("tierInfoModal").style.display = "none";
    }
});
document.addEventListener("DOMContentLoaded", () => {
    window.loadStartTime = Date.now();
    loadPlayers();
});
