(function() {
    window.MoonKat = window.MoonKat || {};

    class ReflexGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Hyper Reflex", icon: "fa-bolt", desc: "Click when it turns green!", cost: 20 };
            
            this.state = 'idle'; // idle, waiting, green, early, done
            this.startTime = 0;
            this.timeoutId = null;
            this.betAmount = 0;

            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    <div id="reflex-area" style="height:200px; background:#333; margin:20px 0; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none;">
                        <span style="font-size:2rem; font-weight:bold; color:#aaa;">WAIT...</span>
                    </div>
                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 20}" min="1" step="10" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn">START</button>
                    </div>
                    <div id="game-log" class="game-log">Click only when it turns GREEN!</div>
                </div>
            `;

            this.area = this.container.querySelector('#reflex-area');
            this.playBtn = this.container.querySelector('#game-play-btn');
            this.betInput = this.container.querySelector('#game-bet');
            this.log = this.container.querySelector('#game-log');

            this.bindEvents();
        }

        bindEvents() {
            this.playBtn.addEventListener('click', () => this.startGame());
            this.area.addEventListener('mousedown', () => this.handleAreaClick());
        }

        startGame() {
            if(this.state !== 'idle') return;
            
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) {
                this.log.innerText = "Invalid Bet";
                return;
            }
            
            if (!window.MoonKat.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.betAmount = bet;
            this.state = 'waiting';
            this.playBtn.disabled = true;
            this.area.style.background = '#e74c3c'; // Red
            this.area.innerHTML = '<span style="font-size:3rem; font-weight:900; color:white;">WAIT...</span>';
            this.log.innerText = "Wait for green...";

            // Random delay 2-6s
            const delay = 2000 + Math.random() * 4000;

            this.timeoutId = setTimeout(() => {
                if(this.state === 'waiting') {
                    this.state = 'green';
                    this.startTime = Date.now();
                    this.area.style.background = '#2ecc71'; // Green
                    this.area.innerHTML = '<span style="font-size:4rem; font-weight:900; color:white;">CLICK!</span>';
                }
            }, delay);
        }

        handleAreaClick() {
            if(this.state === 'idle' || this.state === 'done') return;

            if(this.state === 'waiting') {
                // Early click -> Fail
                clearTimeout(this.timeoutId);
                this.state = 'idle';
                this.playBtn.disabled = false;
                this.area.style.background = '#333';
                this.area.innerHTML = '<span style="font-size:2rem; color:var(--accent-danger);">TOO EARLY!</span>';
                this.log.innerText = "You clicked too early! Bet lost.";
                
                if(window.MoonKat.incrementStat) window.MoonKat.incrementStat('totalLost', this.betAmount);
            } else if(this.state === 'green') {
                // Success
                const reactTime = Date.now() - this.startTime;
                this.state = 'idle';
                this.playBtn.disabled = false;
                this.area.style.background = '#333';

                let multi = 0;
                if(reactTime < 200) multi = 5.0; // Godlike
                else if(reactTime < 300) multi = 2.5; // Pro
                else if(reactTime < 400) multi = 1.5; // Good
                else if(reactTime < 500) multi = 1.1; // OK
                else multi = 0; // Too slow

                const win = multi > 0;
                const payout = this.betAmount * multi;

                if(win) {
                    window.MoonKat.updateBalance(payout);
                    if(window.MoonKat.incrementStat) {
                        window.MoonKat.incrementStat('wins');
                        window.MoonKat.incrementStat('totalWon', payout);
                    }
                    this.area.innerHTML = `<span style="font-size:2rem; color:var(--accent-success);">${reactTime}ms (x${multi})</span>`;
                    this.log.innerHTML = `Nice reflex! Won $${payout.toFixed(2)}`;
                } else {
                    if(window.MoonKat.incrementStat) window.MoonKat.incrementStat('totalLost', this.betAmount);
                    this.area.innerHTML = `<span style="font-size:2rem; color:var(--accent-danger);">${reactTime}ms (Too Slow)</span>`;
                    this.log.innerText = "Too slow! Need < 500ms.";
                }
            }
        }

        destroy() {
            if(this.timeoutId) clearTimeout(this.timeoutId);
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.ReflexGame = ReflexGame;
})();
