(function() {
    class Lucky7Game {
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
            const gameName = this.currency === 'gems' ? 'Lucky 7s (Gem)' : 'Lucky 7s';
            const gameDesc = 'Roll a 7.';
            const icon = 'fa-dice-d20';

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${icon}"></i> ${gameName}</h2>
                    <p class="section-subtitle">${gameDesc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center; gap: 20px;">
                        <div id="d1" style="font-size: 4rem; font-weight: bold; background: #333; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 10px;">?</div>
                        <div id="d2" style="font-size: 4rem; font-weight: bold; background: #333; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 10px;">?</div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.currency === 'gems' ? 10 : 30}" min="1" step="${this.currency === 'gems' ? 1 : 10}" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn">ROLL (7x Payout)</button>
                    </div>
                    <div id="game-log" class="game-log">Total must be 7.</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.log = this.container.querySelector("#game-log");
            this.d1 = this.container.querySelector("#d1");
            this.d2 = this.container.querySelector("#d2");

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);

            if (!Number.isFinite(bet) || bet <= 0) {
                this.log.innerText = "Invalid Bet";
                return;
            }

            if (!this._updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Rolling...";
            
            // Anim
            let count = 0;
            const interval = setInterval(() => {
                this.d1.innerText = Math.floor(Math.random() * 6) + 1;
                this.d2.innerText = Math.floor(Math.random() * 6) + 1;
                count++;
                if (count > 10) {
                    clearInterval(interval);
                    this.resolve(bet);
                }
            }, 80);
        }

        resolve(bet) {
            const r1 = Math.floor(Math.random() * 6) + 1;
            const r2 = Math.floor(Math.random() * 6) + 1;
            const sum = r1 + r2;
            
            this.d1.innerText = r1;
            this.d2.innerText = r2;
            
            const win = sum === 7;
            const multiplier = 7;
            const payout = win ? bet * multiplier : 0;
            
            if (win) {
                this._updateBalance(payout);
                this.log.innerHTML = `<span style="color:var(--accent-success)">LUCKY 7! WON ${this.formatCurrency(payout)}</span>`;
                this.d1.style.background = 'var(--accent-success)';
                this.d2.style.background = 'var(--accent-success)';
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">Sum is ${sum}. Lost.</span>`;
                this.d1.style.background = '#333';
                this.d2.style.background = '#333';
            }
            
            this.playBtn.disabled = false;
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

    window.MoonKat.Lucky7Game = Lucky7Game;
})();
