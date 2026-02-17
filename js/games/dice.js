(function() {
    class DiceGame {
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
            const gameName = this.currency === 'gems' ? 'Golden Dice' : 'Neon Dice';
            const gameDesc = 'Roll High or Low.';
            const icon = 'fa-dice';

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${icon}"></i> ${gameName}</h2>
                    <p class="section-subtitle">${gameDesc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div id="dice-result" style="font-size: 5rem; font-weight: bold; color: var(--accent-primary);">?</div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.currency === 'gems' ? 10 : 20}" min="1" step="${this.currency === 'gems' ? 1 : 10}" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            <option value="high">HIGH (4-6)</option>
                            <option value="low">LOW (1-3)</option>
                        </select>
                        <button id="game-play-btn" class="game-btn">ROLL DICE</button>
                    </div>
                    <div id="game-log" class="game-log">Pick High or Low.</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.choiceInput = this.container.querySelector("#game-choice");
            this.log = this.container.querySelector("#game-log");
            this.resultEl = this.container.querySelector("#dice-result");

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
            this.log.innerHTML = "Rolling...";
            
            // Anim
            let count = 0;
            const interval = setInterval(() => {
                this.resultEl.innerText = Math.floor(Math.random() * 6) + 1;
                count++;
                if (count > 10) {
                    clearInterval(interval);
                    this.resolve(bet, choice);
                }
            }, 100);
        }

        resolve(bet, choice) {
            const roll = Math.floor(Math.random() * 6) + 1;
            this.resultEl.innerText = roll;
            
            const win = (choice === "high" && roll >= 4) || (choice === "low" && roll <= 3);
            const multiplier = 1.95;
            const payout = win ? bet * multiplier : 0;
            
            if (win) {
                this._updateBalance(payout);
                this.log.innerHTML = `<span style="color:var(--accent-success)">ROLLED ${roll}! WON ${this.formatCurrency(payout)}</span>`;
                this.resultEl.style.color = "var(--accent-success)";
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">ROLLED ${roll}. LOST.</span>`;
                this.resultEl.style.color = "var(--accent-danger)";
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

    window.MoonKat.DiceGame = DiceGame;
})();
