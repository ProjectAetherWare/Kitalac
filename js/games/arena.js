(function () {
    const MK = window.MoonKat;

    // --- GAME CATALOG (50+ Games) ---
    MK.gameCatalog = [
        // --- CASH GAMES ---
        { id: "crash", icon: "fa-rocket", name: "Rocket Run", desc: "Eject before the crash! (Unpredictable)", options: ["1.5", "2.0", "3.0", "5.0", "10.0"] },
        { id: "roulette", icon: "fa-life-ring", name: "Cosmic Spin", desc: "Red, Black, or Green.", options: ["red", "black", "green"] },
        { id: "slots", icon: "fa-gamepad", name: "Neon Slots", desc: "Jackpot awaits.", cost: 5 },
        { id: "coinflip", icon: "fa-coins", name: "Quantum Flip", desc: "Heads or Tails.", options: ["heads", "tails"] },
        { id: "dice", icon: "fa-dice", name: "Neon Dice", desc: "Roll High or Low.", options: ["high", "low"] },
        { id: "hilo", icon: "fa-sort-amount-up", name: "High Voltage", desc: "Higher or Lower?", options: ["higher", "lower"] },
        { id: "keno", icon: "fa-table", name: "Keno 80", desc: "Pick odd/even strategy.", options: ["odd", "even"], cost: 5 },
        { id: "mines", icon: "fa-bomb", name: "Minefield", desc: "Don't step on the mines.", options: ["2", "3", "5"], cost: 10 },
        { id: "plinko", icon: "fa-bowling-ball", name: "Plinko Classic", desc: "Gravity determines your fate.", cost: 10 },
        { id: "baccarat", icon: "fa-credit-card", name: "Baccarat Pro", desc: "Player vs Banker.", options: ["player", "banker", "tie"], cost: 15 },
        { id: "wheel", icon: "fa-dharmachakra", name: "Fortune Wheel", desc: "Spin to win big.", cost: 15 },
        { id: "limbo", icon: "fa-chart-bar", name: "Limbo Jet", desc: "Fly under the radar.", options: ["1.5", "2.0", "5.0", "10.0"], cost: 20 },
        { id: "tower", icon: "fa-building", name: "Tower Climb", desc: "Ascend safely.", options: ["1", "2", "3"], cost: 20 },
        { id: "rps", icon: "fa-hand-scissors", name: "RPS Duel", desc: "Rock, Paper, Scissors.", options: ["rock", "paper", "scissors"], cost: 25 },
        { id: "lucky7", icon: "fa-dice-d20", name: "Lucky 7s", desc: "Roll a 7.", cost: 30 },
        { id: "blackjack", icon: "fa-heart", name: "Neon Blackjack", desc: "Beat the dealer to 21.", options: ["hit", "stand"], cost: 50 },
        { id: "poker", icon: "fa-spade", name: "Cyber Poker", desc: "Jacks or Better pair.", cost: 50 },
        { id: "racing", icon: "fa-horse-head", name: "Bot Racing", desc: "Bet on the winner.", options: ["Alpha", "Beta", "Gamma", "Delta"], cost: 40 },
        { id: "penalty", icon: "fa-futbol", name: "Penalty Kick", desc: "Pick a corner.", options: ["left", "center", "right"], cost: 25 },
        { id: "crazywheel", icon: "fa-fan", name: "Dream Spinner", desc: "Volatile wheel with huge multis.", cost: 100 },
        { id: "plinkox", icon: "fa-chevron-down", name: "Plinko X", desc: "Extreme volatility Plinko.", cost: 50 },
        { id: "lootbox", icon: "fa-box-open", name: "Loot Box", desc: "Open a case for rare skins.", cost: 75 },
        { id: "scratch", icon: "fa-ticket-alt", name: "Lucky Scratch", desc: "Match 3 symbols.", cost: 20 },
        { id: "lotto", icon: "fa-ticket", name: "Moon Lotto", desc: "Pick a lucky number (1-10).", options: ["1", "3", "5", "7", "9"], cost: 10 },
        { id: "revolver", icon: "fa-crosshairs", name: "Revolver", desc: "1/6 chance to lose it all.", options: ["pull"], cost: 100 },
        { id: "graph", icon: "fa-chart-line", name: "Trade Graph", desc: "Predict stock movement.", options: ["up", "down"], cost: 35 },
        { id: "color", icon: "fa-palette", name: "Chroma Key", desc: "Pick the next color.", options: ["red", "blue", "yellow"], cost: 15 },
        { id: "oracle", icon: "fa-eye", name: "Oracle", desc: "Ask the crystal ball.", options: ["yes", "no"], cost: 50 },
        { id: "safe", icon: "fa-lock", name: "Vault Breaker", desc: "Guess the last digit (0-9).", options: ["0", "5", "7", "9"], cost: 60 },
        { id: "binary", icon: "fa-network-wired", name: "Binary Option", desc: "0 or 1 outcome.", options: ["0", "1"], cost: 30 },
        
        // --- SKILL GAMES ---
        { id: "reflex", icon: "fa-bolt", name: "Hyper Reflex", desc: "Click when it turns green!", cost: 20 },
        { id: "memory", icon: "fa-brain", name: "Pattern Mind", desc: "Repeat the sequence.", cost: 25 },
        { id: "typer", icon: "fa-keyboard", name: "Speed Typer", desc: "Type the code fast.", cost: 30 },

        // --- GEM LOUNGE (Custom Games) ---
        { id: "gem_crash", icon: "fa-rocket", name: "Starship Voyager", desc: "Infinite multiplier potential.", currency: "gems", options: ["2.0", "5.0", "10.0"] },
        { id: "gem_plinko", icon: "fa-bowling-ball", name: "Diamond Drop", desc: "High stakes Plinko.", currency: "gems" },
        { id: "gem_mines", icon: "fa-bomb", name: "Crystal Mines", desc: "Clear the field for gems.", currency: "gems", options: ["1", "3", "5"] },
        { id: "gem_slots", icon: "fa-gem", name: "Royal Slots", desc: "Win the Crown Jewels.", currency: "gems" },
        { id: "gem_poker", icon: "fa-spade", name: "High Roller Poker", desc: "Only for the elite.", currency: "gems" },
        { id: "gem_roulette", icon: "fa-life-ring", name: "VIP Roulette", desc: "No limits.", currency: "gems", options: ["red", "black", "green"] },
        { id: "gem_dice", icon: "fa-dice-d20", name: "Golden Dice", desc: "Roll for gold.", currency: "gems", options: ["high", "low"] },
        { id: "gem_hilo", icon: "fa-sort", name: "Ascension", desc: "Climb the ladder.", currency: "gems", options: ["higher", "lower"] },
        { id: "gem_blackjack", icon: "fa-heart", name: "Platinum BJ", desc: "Dealer stands on 17.", currency: "gems", options: ["hit", "stand"] },
        { id: "gem_baccarat", icon: "fa-credit-card", name: "Grand Baccarat", desc: "The gentleman's game.", currency: "gems", options: ["player", "banker"] }
    ];

    MK.renderArena = function (filter = 'cash') {
        const grid = document.getElementById("arena-grid");
        if (!grid) return;
        
        // Ensure unlockedGames exists
        if (!MK.state.user.unlockedGames) {
            MK.state.user.unlockedGames = ["crash", "roulette", "coinflip", "dice", "hilo"];
        }

        // Add Toggle if missing
        let toggle = document.getElementById('arena-currency-toggle');
        if(!toggle) {
            const container = document.getElementById('page-arena').querySelector('.section-title');
            toggle = document.createElement('div');
            toggle.id = 'arena-currency-toggle';
            toggle.style.marginTop = '10px';
            toggle.innerHTML = `
                <button class="btn-sm active" id="btn-cash-games" onclick="MoonKat.renderArena('cash')">CASH GAMES</button>
                <button class="btn-sm" id="btn-gem-games" onclick="MoonKat.renderArena('gems')">GEM LOUNGE</button>
            `;
            container.appendChild(toggle);
        }

        // Update Toggle State
        document.getElementById('btn-cash-games').classList.toggle('active', filter === 'cash');
        document.getElementById('btn-gem-games').classList.toggle('active', filter === 'gems');
        document.getElementById('btn-gem-games').style.background = filter === 'gems' ? 'var(--accent-premium)' : 'rgba(255,255,255,0.1)';
        document.getElementById('btn-gem-games').style.color = filter === 'gems' ? 'black' : 'white';

        let gamesToShow = [];
        if (filter === 'cash') {
            gamesToShow = MK.gameCatalog.filter(g => !g.currency || g.currency === 'cash');
        } else {
            // If no explicit gem games, we can duplicate some for now or define them
            // Let's dynamically create Gem versions of popular games if not present
            const gemGames = MK.gameCatalog.filter(g => g.currency === 'gems');
            if (gemGames.length === 0) {
                // Generate virtual gem games
                gamesToShow = [
                    { id: "crash", name: "Gem Crash", icon: "fa-rocket", desc: "Bet Gems to win Gems!", currency: "gems", options: ["1.5", "2.0", "3.0"] },
                    { id: "plinko", name: "Gem Plinko", icon: "fa-bowling-ball", desc: "Drop for Gems.", currency: "gems" },
                    { id: "roulette", name: "Gem Roulette", icon: "fa-life-ring", desc: "Spin for Gems.", currency: "gems", options: ["red", "black", "green"] },
                    { id: "slots", name: "Gem Slots", icon: "fa-gamepad", desc: "Jackpot = 1000 Gems", currency: "gems" },
                    { id: "mines", name: "Gem Mines", icon: "fa-bomb", desc: "Clear mines for Gems.", currency: "gems", options: ["3"] }
                ];
            } else {
                gamesToShow = gemGames;
            }
        }

        grid.innerHTML = gamesToShow
            .map((game) => {
                // Gem games are always unlocked if they are virtual duplicates, or we track them separately
                // For simplicity, Gem Games are always unlocked for now
                const isGem = game.currency === 'gems';
                const isUnlocked = isGem ? true : MK.state.user.unlockedGames.includes(game.id);
                
                const lockOverlay = isUnlocked ? '' : '<div class="lock-overlay"><i class="fas fa-lock"></i></div>';
                const cost = game.cost || 0;
                const desc = isUnlocked ? game.desc : `<span style="color:var(--accent-premium); font-weight:bold;">${cost} GEMS</span>`;
                
                // We need to pass the currency mode to the click handler
                // We'll use a data attribute
                return `
                <div class="arena-card ${isUnlocked ? '' : 'locked'} ${isGem ? 'premium-border' : ''}" 
                     data-game="${game.id}" 
                     data-currency="${isGem ? 'gems' : 'cash'}"
                     data-cost="${cost}" 
                     data-locked="${!isUnlocked}"
                     data-name="${game.name}"> <!-- Pass display name -->
                    ${lockOverlay}
                    <div class="arena-icon" style="${isGem ? 'color:var(--accent-premium)' : ''}"><i class="fas ${game.icon}"></i></div>
                    <div class="arena-name">${game.name}</div>
                    <div class="arena-desc">${desc}</div>
                </div>`;
            })
            .join("");
            
        // Re-bind clicks
        if(window.app && window.app.bindArenaCards) window.app.bindArenaCards();
    };

    // --- CRASH GAME CLASS (Physics Based & Unpredictable) ---
    MK.CrashGame = class {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.render();
            this.canvas = this.container.querySelector('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.running = false;
            this.crashAt = 0;
            this.startTime = 0;
            this.accentColor = getComputedStyle(document.body).getPropertyValue('--accent-primary').trim() || '#ff9f1c';
            this.resize();
            this.boundResize = this.resize.bind(this);
            window.addEventListener('resize', this.boundResize);
        }

        render() {
            this.container.innerHTML = `
                <div class="crash-wrapper" style="position:relative; width:100%; height:100%; background:rgba(0,0,0,0.5); border-radius:12px; overflow:hidden;">
                    <canvas style="display:block; width:100%; height:100%;"></canvas>
                    <div class="crash-overlay" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:4rem; font-weight:900; color:white; z-index:10; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">
                        1.00x
                    </div>
                </div>
            `;
        }

        resize() {
            if(!this.canvas || !this.container) return;
            const rect = this.container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            if (!this.running) this.drawStatic();
        }

        drawStatic() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            this.ctx.clearRect(0, 0, w, h);
            
            this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            // Generic Grid
            for(let i=0; i<w; i+=80) { this.ctx.moveTo(i,0); this.ctx.lineTo(i,h); }
            for(let i=0; i<h; i+=80) { this.ctx.moveTo(0,i); this.ctx.lineTo(w,i); }
            this.ctx.stroke();

            // Axes
            this.ctx.strokeStyle = '#444';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(40, h - 40);
            this.ctx.lineTo(w, h - 40); 
            this.ctx.moveTo(40, h - 40);
            this.ctx.lineTo(40, 0); 
            this.ctx.stroke();
        }

        start(crashAt) {
            this.running = true;
            this.crashAt = crashAt;
            this.startTime = Date.now();
            this.overlay = this.container.querySelector('.crash-overlay');
            this.overlay.style.color = 'white';
            this.animate();
        }

        getCurrentMultiplier() {
            if (!this.running) return 1.0;
            const t = (Date.now() - this.startTime) / 1000; // seconds
            // Growth function: M(t) = 1 + 0.06*t + 0.04*t^2
            // Unpredictable in terms of duration because crashAt is random
            return 1 + (0.06 * t) + (0.04 * t * t);
        }

        animate() {
            if (!this.running) return;
            
            const currentMult = this.getCurrentMultiplier();
            
            if (currentMult >= this.crashAt) {
                this.running = false;
                this.drawCrash();
                return;
            }
            
            this.overlay.innerText = currentMult.toFixed(2) + "x";

            const w = this.canvas.width;
            const h = this.canvas.height;
            const padding = 40;
            
            this.ctx.clearRect(0, 0, w, h);
            this.drawStatic(); 

            // Calculate Curve Points
            this.ctx.strokeStyle = this.accentColor;
            this.ctx.lineWidth = 6;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            
            // X-Axis Scale logic
            const t = (Date.now() - this.startTime) / 1000;
            let timeScale = 10; // Viewport width in seconds
            if (t > 8) timeScale = t + 2; // Expand view if game goes long

            const step = 0.1; 
            const startX = padding;
            const startY = h - padding;
            
            let lastX = startX;
            let lastY = startY;
            this.ctx.moveTo(startX, startY);

            for(let i=0; i<=t; i+=step) {
                const xPct = i / timeScale;
                const drawX = padding + (w - padding) * xPct;
                
                const m = 1 + (0.06 * i) + (0.04 * i * i);
                const maxDisplayMult = Math.max(2, currentMult * 1.2);
                const yPct = (m - 1) / (maxDisplayMult - 1);
                
                const drawY = (h - padding) - ((h - padding - 40) * yPct);
                
                this.ctx.lineTo(drawX, drawY);
                lastX = drawX;
                lastY = drawY;
            }
            this.ctx.stroke();
            
            // Rocket
            this.ctx.save();
            this.ctx.translate(lastX, lastY);
            this.ctx.rotate(-Math.PI / 4); 
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px "Font Awesome 5 Free"';
            this.ctx.fillText('🚀', -12, 8); 
            this.ctx.restore();
            
            // Gradient Fill
            this.ctx.lineTo(lastX, h - padding);
            this.ctx.lineTo(startX, h - padding);
            this.ctx.fillStyle = 'rgba(255, 159, 28, 0.15)';
            this.ctx.fill();

            requestAnimationFrame(() => this.animate());
        }

        drawCrash() {
            this.overlay.style.color = 'var(--accent-danger)';
            this.overlay.innerText = "CRASHED @ " + this.crashAt.toFixed(2) + "x";
            
            // Shake effect
            this.canvas.style.transform = "translate(5px, 5px)";
            setTimeout(() => this.canvas.style.transform = "translate(-5px, -5px)", 50);
            setTimeout(() => this.canvas.style.transform = "translate(0, 0)", 100);
        }

        destroy() {
            this.running = false;
            window.removeEventListener('resize', this.boundResize);
        }
    };

    MK.launchGame = function (gameId, containerId) {
        const root = document.getElementById(containerId);
        if (!root) return;

        // Cleanup
        if (MK.currentGameInstance && typeof MK.currentGameInstance.destroy === 'function') {
            MK.currentGameInstance.destroy();
            MK.currentGameInstance = null;
        }
        root.innerHTML = '';

        const game = MK.gameCatalog.find((g) => g.id === gameId);
        if (!game) return;

        // --- ROCKET RUN (CRASH) SPECIAL HANDLING ---
        if (gameId === 'crash') {
            root.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${game.icon}"></i> ${game.name}</h2>
                    <p class="section-subtitle">${game.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="height:350px;"></div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="100" min="1" step="10" placeholder="Bet Amount" />
                        <div style="display:flex; gap:10px; flex:1;">
                            <input id="game-auto-out" class="game-input" type="number" placeholder="Auto Cashout (Optional)" step="0.1" min="1.01" />
                        </div>
                        <button id="game-play-btn" class="game-btn">LAUNCH ROCKET</button>
                    </div>
                    <div id="game-log" class="game-log">Place a bet and eject before the crash!</div>
                </div>
            `;
            
            const visContainer = root.querySelector("#game-visuals-container");
            const crashGame = new MK.CrashGame(visContainer.id);
            visContainer.id = "crash-canvas-area";
            crashGame.container = visContainer;
            crashGame.resize();
            MK.currentGameInstance = crashGame;

            const log = root.querySelector("#game-log");
            const playBtn = root.querySelector("#game-play-btn");
            const betInput = root.querySelector("#game-bet");
            const autoOutInput = root.querySelector("#game-auto-out");

            let isRunning = false;
            let currentCrashPoint = 0;
            let animationId;
            let startTime;
            let hasCashedOut = false;

            playBtn.addEventListener("click", () => {
                if (isRunning) {
                    // EJECT ACTION
                    if (hasCashedOut) return;
                    
                    const now = Date.now();
                    const elapsed = now - startTime;
                    // Calculate current multiplier based on time approximately
                    // Matches animation logic: 1 + (crashAt - 1) * (pct^2) is hard to reverse exactly without sync.
                    // Simpler approach: Read value from DOM or Shared State in Class?
                    // Better: The Class instance knows the current value.
                    // Let's modify the Class to expose currentMultiplier.
                    
                    const currentMult = crashGame.getCurrentMultiplier(); 
                    
                    hasCashedOut = true;
                    playBtn.disabled = true;
                    playBtn.innerText = "EJECTED!";
                    playBtn.style.background = "var(--accent-success)";
                    
                    const bet = parseFloat(betInput.value);
                    const payout = bet * currentMult;
                    MK.updateBalance(payout);
                    
                    const xpGain = Math.floor(bet * 0.1);
                    MK.addXp(xpGain);
                    
                    log.innerHTML = `<span style="color:var(--accent-success)">EJECTED @ ${currentMult.toFixed(2)}x (+$${payout.toFixed(2)})</span>`;
                    
                    // Stats
                    if(MK.incrementStat) {
                        MK.incrementStat('wins');
                        MK.incrementStat('totalWon', payout);
                    }
                    
                    return;
                }

                // START ACTION
                const bet = parseFloat(betInput.value);
                const autoOut = parseFloat(autoOutInput.value) || 100000; // Default high if empty
                
                if (!Number.isFinite(bet) || bet <= 0) return log.innerText = "Invalid Bet";
                if (!MK.updateBalance(-bet)) return log.innerText = "Insufficient Funds";

                isRunning = true;
                hasCashedOut = false;
                playBtn.innerText = "EJECT (Running)";
                playBtn.style.background = "var(--accent-danger)";
                log.innerHTML = "Rocket launching...";
                
                // Determine crash point
                const crashAt = Math.max(1.00, (1 / (1 - Math.random()) * 0.99));
                const finalCrash = Math.min(crashAt, 50.00); 
                currentCrashPoint = finalCrash;
                
                // Animation Duration
                const duration = 3000 + (Math.min(finalCrash, 10) * 800); 
                startTime = Date.now();

                // Start Visuals
                crashGame.start(duration, finalCrash);
                
                // Monitoring Loop
                const monitor = setInterval(() => {
                    if (!isRunning) { clearInterval(monitor); return; }
                    
                    const currentMult = crashGame.getCurrentMultiplier();
                    
                    // Auto Cashout Check
                    if (!hasCashedOut && currentMult >= autoOut) {
                        hasCashedOut = true;
                        playBtn.disabled = true;
                        playBtn.innerText = "AUTO EJECTED";
                        playBtn.style.background = "var(--accent-success)";
                        
                        const payout = bet * autoOut;
                        MK.updateBalance(payout);
                        MK.addXp(Math.floor(bet * 0.1));
                        
                        log.innerHTML = `<span style="color:var(--accent-success)">AUTO EJECT @ ${autoOut.toFixed(2)}x (+$${payout.toFixed(2)})</span>`;
                        
                        if(MK.incrementStat) {
                            MK.incrementStat('wins');
                            MK.incrementStat('totalWon', payout);
                        }
                    }

                    // Crash Check (Time based on visuals)
                    // Visuals end automatically. We hook into when visuals say "crashed".
                    if (!crashGame.running && !hasCashedOut) {
                        // Crashed and we didn't eject
                        clearInterval(monitor);
                        isRunning = false;
                        playBtn.disabled = false;
                        playBtn.innerText = "LAUNCH ROCKET";
                        playBtn.style.background = "";
                        log.innerHTML = `<span style="color:var(--accent-danger)">CRASHED @ ${finalCrash.toFixed(2)}x (-$${bet.toFixed(2)})</span>`;
                        
                        if(MK.incrementStat) {
                            MK.incrementStat('totalLost', bet);
                        }
                    } else if (!crashGame.running && hasCashedOut) {
                        // Crashed but we won already
                        clearInterval(monitor);
                        isRunning = false;
                        playBtn.disabled = false;
                        playBtn.innerText = "LAUNCH ROCKET";
                        playBtn.style.background = "";
                    }
                }, 50);
                
                if(MK.incrementStat) {
                    MK.incrementStat('gamesPlayed');
                    MK.incrementStat('totalBets');
                }
            });
            return;
        }

        // --- REFLEX (SKILL GAME) ---
        if (gameId === 'reflex') {
            root.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${game.icon}"></i> ${game.name}</h2>
                    <p class="section-subtitle">${game.desc}</p>
                    <div id="reflex-area" style="height:200px; background:#333; margin:20px 0; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                        <span style="font-size:2rem; font-weight:bold; color:#aaa;">WAIT...</span>
                    </div>
                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="20" min="1" step="10" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn">START</button>
                    </div>
                    <div id="game-log" class="game-log">Click only when it turns GREEN!</div>
                </div>
            `;
            
            const area = root.querySelector('#reflex-area');
            const playBtn = root.querySelector('#game-play-btn');
            const betInput = root.querySelector('#game-bet');
            const log = root.querySelector('#game-log');
            
            let state = 'idle'; // idle, waiting, green, early, done
            let startTime = 0;
            let timeoutId;

            playBtn.addEventListener('click', () => {
                if(state !== 'idle') return;
                const bet = parseFloat(betInput.value);
                if (!Number.isFinite(bet) || bet <= 0) return log.innerText = "Invalid Bet";
                if (!MK.updateBalance(-bet)) return log.innerText = "Insufficient Funds";
                
                state = 'waiting';
                playBtn.disabled = true;
                area.style.background = '#e74c3c'; // Red
                area.innerHTML = '<span style="font-size:3rem; font-weight:900; color:white;">WAIT...</span>';
                log.innerText = "Wait for green...";
                
                // Random delay 2-6s
                const delay = 2000 + Math.random() * 4000;
                
                timeoutId = setTimeout(() => {
                    if(state === 'waiting') {
                        state = 'green';
                        startTime = Date.now();
                        area.style.background = '#2ecc71'; // Green
                        area.innerHTML = '<span style="font-size:4rem; font-weight:900; color:white;">CLICK!</span>';
                    }
                }, delay);
            });

            area.addEventListener('mousedown', () => {
                if(state === 'idle' || state === 'done') return;
                
                if(state === 'waiting') {
                    // Early click -> Fail
                    clearTimeout(timeoutId);
                    state = 'idle';
                    playBtn.disabled = false;
                    area.style.background = '#333';
                    area.innerHTML = '<span style="font-size:2rem; color:var(--accent-danger);">TOO EARLY!</span>';
                    log.innerText = "You clicked too early! Bet lost.";
                    MK.incrementStat('totalLost', parseFloat(betInput.value));
                } else if(state === 'green') {
                    // Success
                    const reactTime = Date.now() - startTime;
                    state = 'idle';
                    playBtn.disabled = false;
                    area.style.background = '#333';
                    
                    let multi = 0;
                    if(reactTime < 200) multi = 5.0; // Godlike
                    else if(reactTime < 300) multi = 2.5; // Pro
                    else if(reactTime < 400) multi = 1.5; // Good
                    else if(reactTime < 500) multi = 1.1; // OK
                    else multi = 0; // Too slow
                    
                    const bet = parseFloat(betInput.value);
                    const win = multi > 0;
                    const payout = bet * multi;
                    
                    if(win) {
                        MK.updateBalance(payout);
                        MK.incrementStat('wins');
                        MK.incrementStat('totalWon', payout);
                        area.innerHTML = `<span style="font-size:2rem; color:var(--accent-success);">${reactTime}ms (x${multi})</span>`;
                        log.innerHTML = `Nice reflex! Won $${payout.toFixed(2)}`;
                    } else {
                        MK.incrementStat('totalLost', bet);
                        area.innerHTML = `<span style="font-size:2rem; color:var(--accent-danger);">${reactTime}ms (Too Slow)</span>`;
                        log.innerText = "Too slow! Need < 500ms.";
                    }
                }
            });
            return;
        }

        // --- GENERIC GAMES ---
        root.innerHTML = `
            <div class="game-panel">
                <h2><i class="fas ${game.icon}"></i> ${game.name}</h2>
                <p class="section-subtitle">${game.desc}</p>
                
                <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                    ${getGameHTML(gameId)}
                </div>

                <div class="game-controls">
                    <input id="game-bet" class="game-input" type="number" value="50" min="1" step="10" placeholder="Bet Amount" />
                    ${
                        game.options
                            ? `<select id="game-choice" class="game-select">${game.options
                                  .map((o) => `<option value="${o}">${o.toUpperCase()}</option>`)
                                  .join("")}</select>`
                            : ""
                    }
                    <button id="game-play-btn" class="game-btn">PLAY ROUND</button>
                </div>
                <div id="game-log" class="game-log">Place a bet and play!</div>
            </div>
        `;

        const log = root.querySelector("#game-log");
        const playBtn = root.querySelector("#game-play-btn");
        const betInput = root.querySelector("#game-bet");
        const choiceInput = root.querySelector("#game-choice");
        const visContainer = root.querySelector("#game-visuals-container");

        playBtn.addEventListener("click", () => {
            const bet = parseFloat(betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) {
                 log.innerText = "Invalid Bet";
                 return;
            }
            if (!MK.updateBalance(-bet)) {
                 log.innerText = "Insufficient Funds";
                 return;
            }

            playBtn.disabled = true;
            log.innerHTML = "Playing...";
            
            // Generic Animation
            visContainer.style.opacity = '0.5';
            visContainer.style.transform = 'scale(0.95)';

            setTimeout(() => {
                const choice = choiceInput ? choiceInput.value : "";
                // Fallback for simple games: resolveOutcome uses Math.random internally
                let result = { win: false, multiplier: 0, message: "Error", data: {} };
                
                // --- SIMPLE LOGIC DISPATCH ---
                const r = Math.random();
                switch (gameId) {
                    case "roulette": {
                        const res = r < 0.48 ? "red" : r < 0.96 ? "black" : "green";
                        result = { win: res === choice, multiplier: res === "green" ? 14 : 2, message: `Ball landed on ${res.toUpperCase()}.`, data: { color: res } };
                        break;
                    }
                    case "slots": {
                        const s = ["🍒", "🍋", "💎", "7️⃣", "🔔"];
                        const a = s[Math.floor(Math.random()*s.length)], b = s[Math.floor(Math.random()*s.length)], c = s[Math.floor(Math.random()*s.length)];
                        const win = (a===b && b===c) || (a===b || b===c || a===c);
                        const mult = (a===b && b===c) ? (a==="7️⃣" ? 50 : 10) : 2;
                        result = { win, multiplier: mult, message: `${a} ${b} ${c}`, data: { symbols: [a,b,c] } };
                        break;
                    }
                    case "coinflip": {
                        const f = r > 0.5 ? "heads" : "tails";
                        result = { win: f === choice, multiplier: 1.95, message: `Result: ${f.toUpperCase()}`, data: { face: f } };
                        break;
                    }
                    case "dice": {
                        const roll = Math.floor(r * 6) + 1;
                        const win = (choice === "high" && roll >= 4) || (choice === "low" && roll <= 3);
                        result = { win, multiplier: 1.95, message: `Rolled a ${roll}.`, data: { roll } };
                        break;
                    }
                    case "hilo": {
                        const c = Math.floor(Math.random()*13)+1, n = Math.floor(Math.random()*13)+1;
                        const win = (choice==="higher" && n>c) || (choice==="lower" && n<c);
                        result = { win, multiplier: 1.95, message: `${c} -> ${n}`, data: { current: c, next: n } };
                        break;
                    }
                    case "blackjack": {
                        const p = Math.floor(Math.random()*10)+12; // 12-21
                        const d = Math.floor(Math.random()*10)+12;
                        const win = p > d && p <= 21; 
                        result = { win, multiplier: 2.5, message: `You: ${p}, Dealer: ${d}`, data: { p, d } };
                        break;
                    }
                    case "poker": {
                        const win = r < 0.3; 
                        result = { win, multiplier: 3, message: win ? "Jacks or Better!" : "High Card.", data: {} };
                        break;
                    }
                    case "racing": {
                        const winner = ["Alpha", "Beta", "Gamma", "Delta"][Math.floor(Math.random()*4)];
                        result = { win: winner === choice, multiplier: 3.8, message: `Winner: ${winner}`, data: { winner } };
                        break;
                    }
                    case "penalty": {
                        const save = ["left", "center", "right"][Math.floor(Math.random()*3)];
                        const win = save !== choice;
                        result = { win, multiplier: 1.4, message: win ? "GOAL!" : "SAVED!", data: { save } };
                        break;
                    }
                    case "crazywheel": {
                        const m = [0, 0, 0, 1.5, 2, 5, 10, 50][Math.floor(Math.random()*8)];
                        result = { win: m > 0, multiplier: m, message: `Spin: ${m}x`, data: { mult: m } };
                        break;
                    }
                    case "plinko":
                    case "plinkox": {
                        const m = [0.2, 0.5, 1, 1.5, 3, 10][Math.floor(Math.random()*6)];
                        result = { win: m >= 1, multiplier: m, message: `Landed ${m}x`, data: { mult: m } };
                        break;
                    }
                    case "mines": {
                        const win = r > 0.3;
                        result = { win, multiplier: parseFloat(choice) || 1.5, message: win ? "Cleared!" : "Boom!", data: {} };
                        break;
                    }
                    case "revolver": {
                        const dead = Math.random() < 0.166;
                        result = { win: !dead, multiplier: 1.2, message: dead ? "BANG!" : "Click...", data: {} };
                        break;
                    }
                    case "scratch": {
                        const win = r < 0.25;
                        result = { win, multiplier: 5, message: win ? "3 Matches!" : "No match.", data: {} };
                        break;
                    }
                    case "lotto": {
                        const n = Math.floor(Math.random()*10)+1;
                        result = { win: String(n) === choice, multiplier: 9, message: `Ball: ${n}`, data: { n } };
                        break;
                    }
                    default: 
                        result = { win: r > 0.5, multiplier: 1.95, message: r > 0.5 ? "Win" : "Loss", data: {} };
                }
                
                // End Animation
                visContainer.style.opacity = '1';
                visContainer.style.transform = 'scale(1)';
                
                if(gameId === 'slots' && result.data.symbols) {
                     const reels = visContainer.querySelectorAll('.reel');
                     if(reels.length === 3) result.data.symbols.forEach((s,i) => reels[i].innerText = s);
                } else if(gameId === 'dice' && result.data.roll) {
                    visContainer.innerHTML = `<div style="font-size:4rem; font-weight:bold;">${result.data.roll}</div>`;
                } else {
                    visContainer.innerHTML = result.win 
                    ? `<div style="color:var(--accent-success); font-size:3rem; font-weight:bold; animation: pulse 0.5s;"><i class="fas fa-check-circle"></i></div>`
                    : `<div style="color:var(--accent-danger); font-size:3rem; font-weight:bold; animation: shake 0.5s;"><i class="fas fa-times-circle"></i></div>`;
                }

                const payout = result.win ? bet * result.multiplier : 0;
                if (payout > 0) MK.updateBalance(payout);

                const xpGain = Math.floor(Math.max(10, bet * 0.08));
                MK.addXp(xpGain);

                if(MK.incrementStat) {
                    MK.incrementStat('gamesPlayed');
                    MK.incrementStat('totalBets');
                    if(result.win) {
                        MK.incrementStat('wins');
                        MK.incrementStat('totalWon', payout);
                    } else {
                        MK.incrementStat('totalLost', bet);
                    }
                }

                log.innerHTML = `${result.message} ${result.win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                playBtn.disabled = false;
            }, 1000);
        });
    };

    // --- LOGIC ENGINE ---
    function resolveOutcome(gameId, bet, choice) {
        const r = Math.random();
        
        switch (gameId) {
            case "roulette": {
                const res = r < 0.48 ? "red" : r < 0.96 ? "black" : "green";
                return { win: res === choice, multiplier: res === "green" ? 14 : 2, message: `Ball landed on ${res.toUpperCase()}.`, data: { color: res } };
            }
            case "slots": {
                const s = ["🍒", "🍋", "💎", "7️⃣", "🔔"];
                const a = s[Math.floor(Math.random()*s.length)], b = s[Math.floor(Math.random()*s.length)], c = s[Math.floor(Math.random()*s.length)];
                const win = (a===b && b===c) || (a===b || b===c || a===c);
                const mult = (a===b && b===c) ? (a==="7️⃣" ? 50 : 10) : 2;
                return { win, multiplier: mult, message: `${a} ${b} ${c}`, data: { symbols: [a,b,c] } };
            }
            case "coinflip": {
                const f = r > 0.5 ? "heads" : "tails";
                return { win: f === choice, multiplier: 1.95, message: `Result: ${f.toUpperCase()}`, data: { face: f } };
            }
            case "dice": {
                const roll = Math.floor(r * 6) + 1;
                const win = (choice === "high" && roll >= 4) || (choice === "low" && roll <= 3);
                return { win, multiplier: 1.95, message: `Rolled a ${roll}.`, data: { roll } };
            }
            case "hilo": {
                const c = Math.floor(Math.random()*13)+1, n = Math.floor(Math.random()*13)+1;
                const win = (choice==="higher" && n>c) || (choice==="lower" && n<c);
                return { win, multiplier: 1.95, message: `${c} -> ${n}`, data: { current: c, next: n } };
            }
            case "blackjack": {
                const p = Math.floor(Math.random()*10)+12; // 12-21
                const d = Math.floor(Math.random()*10)+12;
                const win = p > d && p <= 21; // Simplified
                return { win, multiplier: 2.5, message: `You: ${p}, Dealer: ${d}`, data: { p, d } };
            }
            case "poker": {
                const win = r < 0.3; // 30% chance
                return { win, multiplier: 3, message: win ? "Jacks or Better!" : "High Card.", data: {} };
            }
            case "racing": {
                const winner = ["Alpha", "Beta", "Gamma", "Delta"][Math.floor(Math.random()*4)];
                return { win: winner === choice, multiplier: 3.8, message: `Winner: ${winner}`, data: { winner } };
            }
            case "penalty": {
                const save = ["left", "center", "right"][Math.floor(Math.random()*3)];
                const win = save !== choice;
                return { win, multiplier: 1.4, message: win ? "GOAL!" : "SAVED!", data: { save } };
            }
            case "crazywheel": {
                const m = [0, 0, 0, 1.5, 2, 5, 10, 50][Math.floor(Math.random()*8)];
                return { win: m > 0, multiplier: m, message: `Spin: ${m}x`, data: { mult: m } };
            }
            case "plinko":
            case "plinkox": {
                const m = [0.2, 0.5, 1, 1.5, 3, 10][Math.floor(Math.random()*6)];
                return { win: m >= 1, multiplier: m, message: `Landed ${m}x`, data: { mult: m } };
            }
            case "mines": {
                const win = r > 0.3;
                return { win, multiplier: parseFloat(choice) || 1.5, message: win ? "Cleared!" : "Boom!", data: {} };
            }
            case "revolver": {
                const dead = Math.random() < 0.166;
                return { win: !dead, multiplier: 1.2, message: dead ? "BANG!" : "Click...", data: {} };
            }
            case "scratch": {
                const win = r < 0.25;
                return { win, multiplier: 5, message: win ? "3 Matches!" : "No match.", data: {} };
            }
            case "lotto": {
                const n = Math.floor(Math.random()*10)+1;
                return { win: String(n) === choice, multiplier: 9, message: `Ball: ${n}`, data: { n } };
            }
            default: // Generic 50/50
                return { win: r > 0.5, multiplier: 1.95, message: r > 0.5 ? "Win" : "Loss", data: {} };
        }
    }

    // --- HTML GENERATORS ---
    function getGameHTML(id) {
        if(id === 'slots') return `<div class="slots-container"><div class="reel">?</div><div class="reel">?</div><div class="reel">?</div></div>`;
        if(id === 'dice') return `<div class="dice-container"><i class="fas fa-dice-one fa-4x"></i></div>`;
        if(id === 'roulette') return `<div class="roulette-wheel"><div class="wheel-inner"></div></div>`;
        if(id === 'blackjack') return `<div style="font-size:4rem; text-align:center;"><i class="fas fa-heart" style="color:red;"></i> <i class="fas fa-spade"></i></div>`;
        if(id === 'penalty') return `<div style="font-size:4rem; text-align:center;"><i class="fas fa-futbol"></i></div>`;
        if(id === 'racing') return `<div style="font-size:3rem; display:flex; gap:10px; justify-content:center;"><i class="fas fa-horse"></i> <i class="fas fa-horse"></i> <i class="fas fa-horse"></i></div>`;
        return `<div class="visual-placeholder"><i class="fas fa-gamepad fa-4x" style="opacity:0.5;"></i></div>`;
    }

    function startAnimation(id, el) {
        el.style.opacity = '0.5';
        el.style.transform = 'scale(0.95)';
    }

    function endAnimation(id, el, result) {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
        
        if(id === 'slots') {
             const reels = el.querySelectorAll('.reel');
             if(reels.length === 3) result.data.symbols.forEach((s,i) => reels[i].innerText = s);
        }
        else if(id === 'dice') {
            el.innerHTML = `<div style="font-size:4rem; font-weight:bold;">${result.data.roll}</div>`;
        }
        else {
            el.innerHTML = result.win 
            ? `<div style="color:var(--accent-success); font-size:3rem; font-weight:bold;"><i class="fas fa-check-circle"></i></div>`
            : `<div style="color:var(--accent-danger); font-size:3rem; font-weight:bold;"><i class="fas fa-times-circle"></i></div>`;
        }
    }

})();