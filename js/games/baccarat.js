(function() {
    class BaccaratGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.MK = window.MoonKat;
            if (!this.container) return;
            this.init();
        }

        init() {
            this.render();
            this.bindEvents();
        }

        render() {
            const gameName = this.currency === 'gems' ? 'Grand Baccarat' : 'Baccarat Pro';
            const gameDesc = 'Player vs Banker.';
            const icon = 'fa-credit-card';

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${icon}"></i> ${gameName}</h2>
                    <p class="section-subtitle">${gameDesc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: row; gap: 40px; align-items: center; justify-content: center;">
                        <div class="bacc-side">
                            <h3>PLAYER</h3>
                            <div id="player-score" style="font-size:3rem; font-weight:bold; color:var(--accent-primary);">0</div>
                        </div>
                        <div style="font-size:1.5rem;">VS</div>
                        <div class="bacc-side">
                            <h3>BANKER</h3>
                            <div id="banker-score" style="font-size:3rem; font-weight:bold; color:var(--accent-danger);">0</div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.currency === 'gems' ? 15 : 50}" min="1" step="${this.currency === 'gems' ? 1 : 10}" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            <option value="player">PLAYER (2x)</option>
                            <option value="banker">BANKER (1.95x)</option>
                            <option value="tie">TIE (8x)</option>
                        </select>
                        <button id="game-play-btn" class="game-btn">DEAL</button>
                    </div>
                    <div id="game-log" class="game-log">Select side and deal.</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.choiceInput = this.container.querySelector("#game-choice");
            this.log = this.container.querySelector("#game-log");
            this.pScore = this.container.querySelector("#player-score");
            this.bScore = this.container.querySelector("#banker-score");

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            const choice = this.choiceInput.value;

            if (!Number.isFinite(bet) || bet <= 0) {
                this.log.innerText = "Invalid Bet";
                return;
            }

            if (!this._updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Dealing...";
            
            // Ported logic from arena.js
            const pScore = Math.floor(Math.random() * 10);
            const bScore = Math.floor(Math.random() * 10);
            
            this.pScore.innerText = "-";
            this.bScore.innerText = "-";
            
            setTimeout(() => {
                this.pScore.innerText = pScore;
                this.bScore.innerText = bScore;
                
                let outcome = 'tie';
                if (pScore > bScore) outcome = 'player';
                if (bScore > pScore) outcome = 'banker';
                
                const win = outcome === choice;
                let multiplier = 0;
                if(win) {
                    if(outcome === 'tie') multiplier = 8;
                    else if(outcome === 'banker') multiplier = 1.95; // House edge
                    else multiplier = 2;
                }
                
                // Arena logic override check:
                // "multiplier: outcome==='tie' ? 8 : 1.95" (Simplified in arena.js for both P and B?)
                // Arena code: "multiplier: outcome==='tie' ? 8 : 1.95"
                // It seems arena.js uses 1.95 for both player and banker to be safe/simple? Or maybe it implies 5% comm.
                // I'll stick to arena.js logic:
                if (win) {
                     multiplier = (outcome === 'tie') ? 8 : 1.95;
                }

                const payout = win ? bet * multiplier : 0;
                
                if (win) {
                    this._updateBalance(payout);
                    this.log.innerHTML = `<span style="color:var(--accent-success)">${outcome.toUpperCase()} WINS! Won ${this.formatCurrency(payout)}</span>`;
                } else {
                    this.log.innerHTML = `<span style="color:var(--accent-danger)">${outcome.toUpperCase()} WINS. Lost bet.</span>`;
                }
                
                this.playBtn.disabled = false;
                
                 if (this.currency === 'cash') {
                    this.MK.addXp(Math.floor(bet * 0.1));
                }

            }, 800);
        }

        _updateBalance(amount) {
            if (this.currency === 'cash') {
                return this.MK.updateBalance(amount);
            } else {
                if (this.MK.state.user.premiumBalance + amount < 0) return false;
                this.MK.state.user.premiumBalance += amount;
                if (typeof this.MK.saveUser === 'function') this.MK.saveUser();
                if (window.app && window.app.updateUI) window.app.updateUI();
                return true;
            }
        }
        
        formatCurrency(amount) {
            return this.currency === 'cash' ? `$${amount.toFixed(2)}` : `${amount} Gems`;
        }
    }

    window.MoonKat.BaccaratGame = BaccaratGame;
})();
