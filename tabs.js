document.addEventListener("DOMContentLoaded", function () {
    const gameTab = document.getElementById("game-tab");
    const tasksTab = document.getElementById("tasks-tab");
    const inviteTab = document.getElementById("invite-tab");
    const leaderboardTab = document.getElementById("leaderboard-tab");
    const inviteTitle = document.getElementById("invite-title");
    const campaignTab = document.getElementById('campaign-tab');
    const allTab = document.getElementById('all-tab');
    const tradeTab =  document.getElementById('trade-tab');
    const inviteLeaderboardButton = document.getElementById('leaderboard-button');

    // Initialize the current mode variable to handle switching between Campaign and All
    let currentMode = 'campaign'; // Default mode is set to 'campaign'

    // Mapping object for button IDs to type values
    const typeMapping = {
        'invites-button': 'invites',
        'trading-net-profits-button': 'trading_net_profits',
        'trading-volume-button': 'transactions'
    };

    function updateTabIcons(selectedTab) {
        const tabs = [
            { element: gameTab, selectedIcon: 'game_icon_selected.png', unselectedIcon: 'game_icon_unselected.png' },
            { element: tasksTab, selectedIcon: 'tasks_icon_selected.png', unselectedIcon: 'tasks_icon_unselected.png' },
            { element: inviteTab, selectedIcon: 'invite_icon_selected.png', unselectedIcon: 'invite_icon_unselected.png' },
            { element: leaderboardTab, selectedIcon: 'leaderboard_icon_selected.png', unselectedIcon: 'leaderboard_icon_unselected.png' },
            { element: tradeTab, selectedIcon: 'trade_icon_selected.png', unselectedIcon: 'trade_icon_unselected.png' }
        ];

        tabs.forEach(tab => {
            const iconImg = tab.element.querySelector('img');
            if (tab.element === selectedTab) {
                iconImg.src = `/resources/${tab.selectedIcon}`;
            } else {
                iconImg.src = `/resources/${tab.unselectedIcon}`;
            }
        });
    }

    function loadContent(tab) {
        document.getElementById("startPage").style.display = "none";
        document.getElementById("task-popup").style.display = "none";
        document.getElementById("invite-container").style.display = "none"; 
        document.getElementById("leaderboard-popup").style.display = "none";
        document.getElementById("tradePage").style.display = "none"; 

        switch (tab) {
            case 'game':
                document.getElementById("startPage").style.display = "block";
                updateTabIcons(gameTab);
                break;
            case 'tasks':
                document.getElementById("task-popup").style.display = "block";
                window.loadTasks(window.currentUsername);
                window.loadTotalKaboomCoin(window.currentUsername);
                updateTabIcons(tasksTab);
                break;
            case 'invite':
                document.getElementById("invite-container").style.display = "flex";
                document.getElementById("energyCells").style.display = "none";
                updateTabIcons(inviteTab);
                if (inviteTitle) inviteTitle.style.display = "block";
                break;
            case 'leaderboard':
                document.getElementById("leaderboard-popup").style.display = "block";
                updateTabIcons(leaderboardTab);
                loadLeaderboard('invites', currentMode); // Load leaderboard with the current mode
                break;

            case 'trade':
                const tradePage = document.getElementById("tradePage");
                document.getElementById("energyCells").style.display = "none";
                tradePage.style.display = "block";
                // Initialize the trade page content
                if (typeof window.initializeTradePage === 'function') {
                    window.initializeTradePage();
                }
                updateTabIcons(tradeTab);
                // Show wallet connect button
                document.getElementById("ton-connect").style.display = "block";
                break;
        }
    }

    gameTab.addEventListener("click", () => loadContent('game'));
    tasksTab.addEventListener("click", () => loadContent('tasks'));

    inviteTab.addEventListener("click", () => loadContent('invite'));
    leaderboardTab.addEventListener("click", () => loadContent('leaderboard'));
    inviteLeaderboardButton.addEventListener("click", () => loadContent('leaderboard'));
    tradeTab.addEventListener("click", () => loadContent('trade'))

    const urlParams = new URLSearchParams(window.location.search);
    const defaultTab = urlParams.get('tab') || 'game';

    loadContent(defaultTab);

    // Leaderboard buttons
    const invitesButton = document.getElementById('invites-button');
    const tradingNetProfitsButton = document.getElementById('trading-net-profits-button');
    const tradingVolumeButton = document.getElementById('trading-volume-button');

    // Event listeners for leaderboard buttons using the correct type
    invitesButton.addEventListener('click', () => switchLeaderboardView('invites', currentMode));
    tradingNetProfitsButton.addEventListener('click', () => switchLeaderboardView('trading_net_profits', currentMode));
    tradingVolumeButton.addEventListener('click', () => switchLeaderboardView('transactions', currentMode));

    // Function to switch the leaderboard view
    function switchLeaderboardView(type, mode) {
        console.log('Switching Leaderboard View:', type, mode);  // Debug log
        // Remove 'active' class from all buttons
        document.querySelectorAll('.leaderboard-switch-button').forEach(button => button.classList.remove('active'));

        // Add 'active' class to the clicked button
        if (type === 'invites') {
            invitesButton.classList.add('active');
        } else if (type === 'trading_net_profits') {
            tradingNetProfitsButton.classList.add('active');
        } else if (type === 'transactions') {
            tradingVolumeButton.classList.add('active');
        }

        // Load the corresponding leaderboard data with the specified mode
        loadLeaderboard(type, mode);

        // Update column title based on the selected type
        const coinsTitle = document.querySelector('.leaderboard-coins-title');
        if (type === 'invites') {
            coinsTitle.textContent = 'Invites';
        } else if (type === 'trading_net_profits') {
            coinsTitle.textContent = 'Morph PNL(ETH)';
        } else if (type === 'transactions') {
            coinsTitle.textContent = 'Transactions';
        }
    }

    // Event listeners for Campaign and All mode buttons
    campaignTab.addEventListener('click', () => {
        currentMode = 'campaign';
        campaignTab.classList.add('active');
        allTab.classList.remove('active');
        // Reload the leaderboard with the selected mode
        const activeButton = document.querySelector('.leaderboard-switch-button.active');
        if (activeButton) {
            // Use type mapping to get the correct type
            const type = typeMapping[activeButton.id] || 'invites'; // Default to 'invites' if not found
            switchLeaderboardView(type, currentMode);
        } else {
            switchLeaderboardView('invites', currentMode); // Default if no active button
        }
    });

    allTab.addEventListener('click', () => {
        currentMode = 'all';
        allTab.classList.add('active');
        campaignTab.classList.remove('active');
        // Reload the leaderboard with the selected mode
        const activeButton = document.querySelector('.leaderboard-switch-button.active');
        if (activeButton) {
            // Use type mapping to get the correct type
            const type = typeMapping[activeButton.id] || 'invites'; // Default to 'invites' if not found
            switchLeaderboardView(type, currentMode);
        } else {
            switchLeaderboardView('invites', currentMode); // Default if no active button
        }
    });
});

//invite button
document.addEventListener("DOMContentLoaded", function() {
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp; // Now you can use the tg object

        const inviteButton = document.getElementById("invite-button");
        const invitePopup = document.getElementById("invite-popup");
        const sendButton = document.getElementById("send-button");
        const copyLinkButton = document.getElementById("copy-link-button");
        const closePopupButtons = document.querySelectorAll(".close-popup-button, #close-popup-button");
        const copiedPopup = document.getElementById("copied-popup");

        inviteButton.addEventListener("click", function() {
            invitePopup.style.display = "flex"; // Show the popup
        });

        closePopupButtons.forEach(button => {
            button.addEventListener("click", function() {
                invitePopup.style.display = "none"; // Hide the popup
            });
        });

        const inviteLink = `https://t.me/share/url?url=https://t.me/kaboom_meme_bot?start=${window.currentUsername}`;
    
        // Event listener for Send button
        sendButton.addEventListener("click", function() {
            window.location.href = inviteLink;
        });

        copyLinkButton.addEventListener("click", function() {
            const inviteLink = `https://t.me/kaboom_meme_bot?start=${window.currentUsername}`;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(inviteLink).then(function() {
                    copiedPopup.style.display = "block"; // Show the "Copied" popup
                    setTimeout(function() {
                        copiedPopup.style.display = "none"; // Hide after 1 second
                    }, 1000);
                }).catch(function(error) {
                    console.error("Copy failed:", error);
                });
            } else {
                alert("Your browser does not support clipboard copy. Please copy the text manually.");
            }
        });
    } else {
        console.error("Telegram Web App API not available. Please make sure the script is loaded.");
    }
});


async function loadLeaderboard(type, mode = 'campaign') {
    try {
        const username = window.currentUsername;

        // Construct the base URL for the leaderboard request
        let url = `/leaderboard?type=${type}&mode=${mode}&username=${encodeURIComponent(username)}`;

        // Add start and end date parameters if the mode is "campaign"
        if (mode === "campaign") {
            const start = new Date("2024-08-29T11:59:00"); // Adjust the start date as per your campaign
            const end = new Date("2024-10-07T11:59:59"); // Adjust the end date as per your campaign
            url += `&start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
        }

        const response = await appFetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard data: ${response.statusText}`);
        }

        const data = await response.json();
        populateLeaderboard(data, type); // Populate the leaderboard with the retrieved data
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}



function populateLeaderboard(data, type) { 
    const leaderboardTable = document.querySelector(".leaderboard-table");
    leaderboardTable.innerHTML = ""; // Clear previous rows

    // Check if leaderboard data is available
    if (data && data.leaderboard && data.leaderboard.length > 0) {
        data.leaderboard.forEach((user) => {
            // Use `user.stat` or directly access the field based on the type
            const statValue = (type === 'invites' ? user.invites : 
                              (type === 'transactions' ? user.transactions : 
                              user.profit)) || 0;

            const row = document.createElement("div");
            row.className = "leaderboard-row";
            row.innerHTML = `
                <div class="leaderboard-rank">${user.rank}</div>
                <div class="leaderboard-name">${user.username}</div>
                <div class="leaderboard-coins">${statValue}</div> 
            `;
            leaderboardTable.appendChild(row);
        });
    } else {
        leaderboardTable.innerHTML = "<p>No leaderboard data available.</p>";
    }

    // Update user's rank and stats at the top
    if (data && data.user) {
        const userStatValue = (type === 'invites' ? data.user.invites : 
                              (type === 'transactions' ? data.user.transactions : 
                              data.user.profit)) || 0;

        document.querySelector(".user-rank").textContent = data.user.rank || "N/A";
        document.querySelector(".user-name").textContent = data.user.username || "N/A";
        document.querySelector(".user-coins").textContent = userStatValue;
    } else {
        document.querySelector(".user-rank").textContent = "N/A";
        document.querySelector(".user-name").textContent = "N/A";
        document.querySelector(".user-coins").textContent = "0";
    }
}


document.addEventListener("DOMContentLoaded", function() {
    const leaderboardPopup = document.getElementById("leaderboard-popup");
    const gameButton = document.getElementById("game-tab");
    const tasksButton = document.getElementById("tasks-tab");
    
    // Ensure leaderboard popup exists
    if (leaderboardPopup) {
        // Close leaderboard popup when "Game" button is clicked
        if (gameButton) {
            gameButton.addEventListener("click", function() {
                leaderboardPopup.style.display = "none";
            });
        }

        // Close leaderboard popup when "Tasks" button is clicked
        if (tasksButton) {
            tasksButton.addEventListener("click", function() {
                leaderboardPopup.style.display = "none";
            });
        }
    }
});



