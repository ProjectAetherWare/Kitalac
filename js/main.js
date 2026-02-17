// Main App Controller
(function () {
    const MK = window.MoonKat;
    const SAVE_KEY = "moonkat_data";

    const App = {
        currentPage: "market",
        currentGame: null,

        init() {
            this.bindMouseGlow();
            this.bindNavigation();
            this.bindActions();
            
            // Initialize Saves System first
            if(MK.Saves) MK.Saves.init(); 
            // Note: MK.Saves.init() calls loadCurrent() which populates MK.state
            
            this.initChat();

            MK.initMarket();
            MK.renderUserStats();
            MK.renderTrending();
            MK.renderLaunchpadStats();
            MK.renderLeaderboard();
            MK.renderArena();
            
            // Map & VIP Init
            if(MK.Map) MK.Map.init();
            if(MK.VIP) MK.VIP.init();

            this.bindArenaCards();
            this.goTo("market");
            
            // Autosave is handled by MK.Saves now
        },

        initChat() {
            const toggle = document.getElementById("chat-toggle");
            const panel = document.getElementById("trollbox");
            const close = document.getElementById("close-chat");
            
            if(toggle && panel) {
                toggle.addEventListener("click", () => panel.classList.toggle("open"));
            }
            if(close && panel) {
                close.addEventListener("click", () => panel.classList.remove("open"));
            }
        },

        showToast(msg, type = 'info') {
            const container = document.getElementById('toast-container');
            if(!container) return;

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            let icon = 'fa-info-circle';
            if(type === 'success') icon = 'fa-check-circle';
            if(type === 'danger') icon = 'fa-exclamation-triangle';

            toast.innerHTML = `<i class="fas ${icon} toast-icon"></i> <span>${msg}</span>`;
            
            container.appendChild(toast);

            // Remove after 4s
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        },

        bindMouseGlow() {
            document.body.addEventListener("mousemove", (e) => {
                document.body.style.setProperty("--cursor-x", `${e.clientX}px`);
                document.body.style.setProperty("--cursor-y", `${e.clientY}px`);
            });
        },

        bindNavigation() {
            const nav = document.getElementById("main-nav");
            if (!nav) return;

            nav.addEventListener("click", (e) => {
                const item = e.target.closest(".nav-item");
                if (!item) return;
                const page = item.getAttribute("data-page");
                if (page) this.goTo(page);
            });
        },

        bindArenaCards() {
            document.querySelectorAll("[data-game]").forEach((card) => {
                card.addEventListener("click", () => {
                    const gameId = card.getAttribute("data-game");
                    const currency = card.getAttribute("data-currency");
                    const name = card.getAttribute("data-name");
                    const isLocked = card.getAttribute("data-locked") === "true";
                    
                    if (isLocked) {
                        // Check for free unlocks
                        if (MK.state.user.freeUnlocks && MK.state.user.freeUnlocks > 0) {
                            if(confirm(`Unlock ${name || gameId} for FREE? (${MK.state.user.freeUnlocks} remaining)`)) {
                                MK.state.user.freeUnlocks--;
                                MK.state.user.unlockedGames.push(gameId);
                                MK.renderUserStats();
                                MK.renderArena();
                                alert("Game Unlocked!");
                                return;
                            }
                        }

                        const cost = parseInt(card.getAttribute("data-cost"));
                        if (confirm(`Unlock ${name || gameId} for ${cost} Gems?`)) {
                            if (MK.state.user.premiumBalance >= cost) {
                                MK.state.user.premiumBalance -= cost;
                                MK.state.user.unlockedGames.push(gameId);
                                MK.renderUserStats();
                                MK.renderArena();
                                // this.bindArenaCards(); // handled by renderArena calls usually, but let's be safe
                                alert("Game Unlocked!");
                            } else {
                                alert("Not enough Gems!");
                            }
                        }
                    } else {
                        this.loadGame(gameId, currency, name);
                    }
                });
            });
        },

        bindActions() {
            const form = document.getElementById("create-coin-form");
            if (form) {
                form.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.createCoin();
                });
            }

            const backBtn = document.getElementById("back-to-arena");
            if (backBtn) {
                backBtn.addEventListener("click", () => this.goTo("arena"));
            }

            // Daily Bonus
            const dailyBtn = document.getElementById("btn-daily-bonus");
            if (dailyBtn) {
                dailyBtn.addEventListener("click", () => {
                    if (MK.claimDailyBonus) MK.claimDailyBonus();
                });
            }

            // Achievements
            const achBtn = document.getElementById("btn-achievements");
            const achModal = document.getElementById("achievements-modal");
            const achClose = document.getElementById("close-achievements");

            if (achBtn && achModal) {
                achBtn.addEventListener("click", () => {
                    achModal.style.display = "flex";
                    if (MK.renderAchievements) MK.renderAchievements();
                });
            }
            if (achClose && achModal) {
                achClose.addEventListener("click", () => achModal.style.display = "none");
            }
        },

        setNavActive(page) {
            document.querySelectorAll(".nav-item").forEach((el) => {
                const isActive = el.getAttribute("data-page") === page;
                el.classList.toggle("active", isActive);
            });
        },

        goTo(page) {
            const target = document.getElementById(`page-${page}`);
            if (!target) return;

            document.querySelectorAll(".page").forEach((el) => el.classList.remove("active"));
            target.classList.add("active");

            this.currentPage = page;
            this.setNavActive(page === "game" ? "arena" : page);

            if (page !== "game" && this.currentGame) {
                if (MK.currentGameInstance && typeof MK.currentGameInstance.destroy === 'function') {
                    MK.currentGameInstance.destroy();
                    MK.currentGameInstance = null;
                }
                this.currentGame = null;
                const area = document.getElementById("game-canvas-area");
                if (area) area.innerHTML = "";
            }

            if (page === "settings") {
                const input = document.getElementById("setting-username");
                if (input) input.value = MK.state.user.username;
            }

            if (page === "market") {
                MK.renderMarket();
            }
            if (page === "portfolio") {
                if(MK.renderPortfolio) MK.renderPortfolio();
            }
            if (page === "map") {
                if(MK.Map && MK.Map.resize) MK.Map.resize();
            }
            if (page === "sports") {
                MK.initSports(); // Initialize or render
            }
            if (page === "assets") {
                MK.renderAssets();
            }
            if (page === "arena") {
                MK.renderArena();
                this.bindArenaCards();
            }
            if (page === "leaderboard") {
                MK.renderFullLeaderboard();
            }
        },

        exchangeCurrency() {
            const amount = parseFloat(document.getElementById('exchange-amount').value);
            const direction = document.getElementById('exchange-direction').value;
            
            if (!amount || amount <= 0) return alert("Enter valid amount");

            if (direction === 'buy') {
                // Buy Gems ($100 -> 1 Gem)
                const cost = amount * 100;
                if (MK.state.user.balance >= cost) {
                    MK.updateBalance(-cost);
                    MK.state.user.premiumBalance += amount;
                    MK.renderUserStats();
                    alert(`Bought ${amount} Gems for $${cost.toLocaleString()}`);
                } else {
                    alert("Insufficient Cash!");
                }
            } else {
                // Sell Gems (1 Gem -> $50)
                if (MK.state.user.premiumBalance >= amount) {
                    const earnings = amount * 50;
                    MK.state.user.premiumBalance -= amount;
                    MK.updateBalance(earnings);
                    MK.renderUserStats();
                    alert(`Sold ${amount} Gems for $${earnings.toLocaleString()}`);
                } else {
                    alert("Insufficient Gems!");
                }
            }
        },

        loadGame(gameType, currencyMode = 'cash', customName = null) {
            this.goTo("game");
            MK.launchGame(gameType, "game-canvas-area", currencyMode, customName);
            this.currentGame = gameType;
        },

        createCoin() {
            const name = document.getElementById("coin-name").value.trim();
            const ticker = document.getElementById("coin-ticker").value.trim().toUpperCase();
            const amount = parseInt(document.getElementById("coin-launch-amount").value, 10);
            if (!name || !ticker) return;

            if (MK.updateBalance(-500)) {
                MK.createCoin(name, ticker, amount);
                MK.renderMarket();
                alert("Token deployed. +500 XP");
                this.goTo("market");
            } else {
                alert("Insufficient funds ($500 required).");
            }
        },

        saveUsername() {
            const input = document.getElementById("setting-username");
            if (!input) return;
            const value = input.value.trim();
            if (!value) return;
            MK.state.user.username = value;
            MK.renderUserStats();
            alert("Username updated.");
        },

        setMode(mode) {
            if (mode === MK.state.mode) return;
            
            if (mode === 'online') {
                if (!window.MK_Firebase) return alert("Firebase not loaded yet!");
                document.getElementById('current-mode-display').innerText = "LIVE ONLINE";
                document.getElementById('auth-section').style.display = 'block';
                document.getElementById('btn-login').style.display = 'block';
                MK.state.mode = 'online';
                
                // Clear local loop if any
                if(MK.Saves && MK.Saves.stopAutosave) MK.Saves.stopAutosave();

                if(window.MK_Firebase.currentUser) {
                    this.updateAuthUI(window.MK_Firebase.currentUser);
                } else {
                    alert("Please login to play Online.");
                }
                
                // Trigger Market Mode Switch
                if(MK.initMarket) MK.initMarket();

            } else {
                document.getElementById('current-mode-display').innerText = "OFFLINE (BOTS)";
                document.getElementById('auth-section').style.display = 'none';
                MK.state.mode = 'offline';
                // Reload to restore full offline state cleanly
                location.reload();
            }
        },

        updateAuthUI(user) {
            const loginBtn = document.getElementById('btn-login');
            const loggedInUI = document.getElementById('logged-in-ui');
            const emailSpan = document.getElementById('auth-email');

            if (user) {
                loginBtn.style.display = 'none';
                loggedInUI.style.display = 'block';
                emailSpan.innerText = user.email;
                
                // Load Cloud Data
                window.MK_Firebase.loadUserProfile(user).then(data => {
                    MK.state.user = { ...MK.state.user, ...data }; // Merge
                    MK.renderUserStats();
                    this.showToast("Loaded Cloud Profile", "success");
                    
                    // Start Cloud Autosave
                    if(this.cloudSaveInterval) clearInterval(this.cloudSaveInterval);
                    this.cloudSaveInterval = setInterval(() => {
                        window.MK_Firebase.saveState(MK.state.user);
                    }, 10000);

                    // Switch Chat to Live
                    this.initLiveChat();
                });
            } else {
                loginBtn.style.display = 'block';
                loggedInUI.style.display = 'none';
                if(this.cloudSaveInterval) clearInterval(this.cloudSaveInterval);
            }
        },

        initLiveChat() {
            const list = document.getElementById("chat-messages");
            if(!list) return;
            list.innerHTML = ''; // Clear bot messages

            window.MK_Firebase.initChatListener((msgs) => {
                list.innerHTML = '';
                msgs.forEach(msg => {
                    const el = document.createElement("div");
                    el.className = "chat-msg";
                    el.innerHTML = `<span class="chat-user" onclick="app.openProfile('${msg.uid}')">${msg.username}:</span> <span class="chat-text">${msg.text}</span>`;
                    list.appendChild(el);
                });
                list.scrollTop = list.scrollHeight;
            });
            
            // Override send
            const input = document.getElementById("chat-input");
            const btn = document.getElementById("chat-send");
            
            // Remove old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener("click", () => {
                const text = input.value.trim();
                if(text) {
                    window.MK_Firebase.sendMessage(text);
                    input.value = "";
                }
            });
        },

        openProfile(uid) {
            // Fetch profile
            if(!window.MK_Firebase || !window.MK_Firebase.getProfile) return;
            
            window.MK_Firebase.getProfile(uid).then(data => {
                if(data) {
                    alert(`User: ${data.username}\nBio: ${data.bio || "No bio"}\nNet Worth: $${MK.formatCurrency(data.balance)}`);
                } else {
                    alert("User not found.");
                }
            });
        },

        saveProfile() {
             const user = document.getElementById("setting-username").value;
             const bio = document.getElementById("setting-bio").value;
             
             if(MK.state.mode === 'online') {
                 if(user && user !== MK.state.user.username) {
                     // Check uniqueness first
                     window.MK_Firebase.getUserByUsername(user).then(existing => {
                         if(existing && existing.uid !== window.MK_Firebase.currentUser.uid) {
                             alert("Username is already taken!");
                             return;
                         }
                         if(user) MK.state.user.username = user;
                         if(bio) MK.state.user.bio = bio;
                         window.MK_Firebase.saveState(MK.state.user);
                         alert("Profile Saved to Cloud!");
                         MK.renderUserStats();
                     });
                 } else {
                     if(bio) MK.state.user.bio = bio;
                     window.MK_Firebase.saveState(MK.state.user);
                     alert("Profile Saved to Cloud!");
                     MK.renderUserStats();
                 }
             } else {
                 if(user) MK.state.user.username = user;
                 if(bio) MK.state.user.bio = bio;
                 alert("Profile Saved Locally!");
                 if(MK.Saves) MK.Saves.saveCurrent();
                 MK.renderUserStats();
             }
        },

        searchUser() {
             const query = prompt("Enter username to search:");
             if(!query) return;
             
             if(MK.state.mode === 'online') {
                 window.MK_Firebase.getUserByUsername(query).then(user => {
                     if(user) {
                         alert(`User Found:\nName: ${user.username}\nBio: ${user.bio || "No bio"}\nNet Worth: $${MK.formatCurrency(user.balance)}`);
                     } else {
                         alert("User not found.");
                     }
                 });
             } else {
                 // Offline search (bots only)
                 const bot = MK.state.bots.find(b => b.name.toLowerCase() === query.toLowerCase());
                 if(bot) {
                     alert(`Bot Found:\nName: ${bot.name}\nNet Worth: $${MK.formatCurrency(bot.profit)}\nWin Rate: ${bot.winRate}%`);
                 } else {
                     alert("User/Bot not found.");
                 }
             }
        },

        searchUserFromInput() {
             const input = document.getElementById("user-search-input");
             if(!input) return;
             const query = input.value.trim();
             if(!query) return;
             
             if(MK.state.mode === 'online') {
                 if(!window.MK_Firebase) return alert("Firebase not ready.");
                 window.MK_Firebase.getUserByUsername(query).then(user => {
                     if(user) {
                         alert(`User Found:\nName: ${user.username}\nBio: ${user.bio || "No bio"}\nNet Worth: $${MK.formatCurrency(user.balance)}`);
                     } else {
                         alert("User not found.");
                     }
                 });
             } else {
                 const bot = MK.state.bots.find(b => b.name.toLowerCase() === query.toLowerCase());
                 if(bot) {
                     alert(`Bot Found:\nName: ${bot.name}\nNet Worth: $${MK.formatCurrency(bot.profit)}\nWin Rate: ${bot.winRate}%`);
                 } else {
                     alert("User/Bot not found.");
                 }
             }
        },

        exportData() {
             if(MK.Saves) MK.Saves.download(MK.Saves.currentId);
        },

        importData() {
             if (MK.state.mode === 'online') {
                 alert("Importing data is disabled in Live Online mode.");
                 return;
             }
             if(MK.Saves) MK.Saves.importString();
        },

        resetData() {
             if(MK.Saves) MK.Saves.delete(MK.Saves.currentId);
        },
        
        // Old methods deprecated but kept empty to avoid breaks if referenced
        loadData() {},
        startAutosave() {},
    };

    window.app = App;
    window.addEventListener("DOMContentLoaded", () => App.init());
})();
