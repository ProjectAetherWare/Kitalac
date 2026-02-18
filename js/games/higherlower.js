(function() {
    class HigherLowerGame {
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
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-sort-amount-up"></i> Higher/Lower</h2>
                    <p class="section-subtitle">Predict the next number.</p>
                    
                    <div class="game-visuals" style="text-align: center; margin: 20px 0;">
                        <div id="hl-current" style="font-size: 5rem; font-weight: bold;">50</div>
                        <div style="font-size: 1.2rem; margin-top: 10px;">Range: 1-100</div>
                        <div id="hl-streak" style="color: gold;">Streak: 0 (x1.00)</div>
                    </div>

                    <div class="game-controls">
                        <div id="hl-bet-controls">
                            <input id="hl-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                            <button id="hl-start-btn" class="game-btn">START GAME</button>
                        </div>
                        <div id="hl-play-controls" style="display:none; gap: 10px;">
                            <button id="hl-higher" class="game-btn" style="background:#2ecc71">HIGHER</button>
                            <button id="hl-lower" class="game-btn" style="background:#e74c3c">LOWER</button>
                            <button id="hl-cashout" class="game-btn" style="background:#f1c40f; color:#000;">CASHOUT</button>
                        </div>
                    </div>
                    <div id="hl-log" class="game-log">Start a new game.</div>
                </div>
            `;
        }

        bindEvents() {
            this.startBtn = this.container.querySelector("#hl-start-btn");
            this.betInput = this.container.querySelector("#hl-bet");
            this.betControls = this.container.querySelector("#hl-bet-controls");
            this.playControls = this.container.querySelector("#hl-play-controls");
            this.currentEl = this.container.querySelector("#hl-current");
            this.streakEl = this.container.querySelector("#hl-streak");
            this.log = this.container.querySelector("#hl-log");

            this.startBtn.addEventListener("click", () => this.startGame());
            this.container.querySelector("#hl-higher").addEventListener("click", () => this.guess('high'));
            this.container.querySelector("#hl-lower").addEventListener("click", () => this.guess('low'));
            this.container.querySelector("#hl-cashout").addEventListener("click", () => this.cashout());
        }

        startGame() {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) return;
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.currentBet = bet;
            this.currentVal = Math.floor(Math.random() * 100) + 1;
            this.currentMultiplier = 1.0;
            this.streak = 0;
            
            this.updateUI();
            this.betControls.style.display = 'none';
            this.playControls.style.display = 'flex';
            this.log.innerText = "Make your choice.";
        }

        updateUI() {
            this.currentEl.innerText = this.currentVal;
            this.streakEl.innerText = `Streak: ${this.streak} (x${this.currentMultiplier.toFixed(2)})`;
        }

        guess(direction) {
            const nextVal = Math.floor(Math.random() * 100) + 1;
            
            // Tie = push (usually loss in some games, lets say push keeps streak but no multi increase, or loss? Let's say loss for simplicity unless defined)
            // Convention: Tie is usually loss in HiLo unless stated. Let's make it a loss to be safer for house, or redraw. 
            // Let's redraw if same.
            if (nextVal === this.currentVal) {
                this.log.innerText = "Same number, redraw...";
                this.guess(direction); 
                return;
            }

            const won = (direction === 'high' && nextVal > this.currentVal) || 
                        (direction === 'low' && nextVal < this.currentVal);

            this.currentVal = nextVal;

            if (won) {
                this.streak++;
                // Calc Multiplier based on probability would be complex, doing fixed increase for simplicity
                // Or semi-realistic: 
                // If I bet High on 90, chance is low, payout high.
                // If I bet Low on 90, chance is high, payout low.
                // Simplified: Fixed 1.5x per step compounding? Too high.
                // Let's do 1.3x compounding.
                this.currentMultiplier *= 1.3;
                this.updateUI();
                this.log.innerText = "Correct! Continue or Cashout.";
            } else {
                this.endGame(0);
                this.log.innerHTML = `<span style="color:var(--accent-danger)">Wrong! It was ${nextVal}. Lost ${this.currentBet}.</span>`;
            }
        }

        cashout() {
            const payout = this.currentBet * this.currentMultiplier;
            this.MK.updateBalance(payout);
            this.endGame(payout);
            this.log.innerHTML = `<span style="color:#2ecc71">Cashed out: ${payout.toFixed(2)}</span>`;
        }

        endGame(payout) {
            this.betControls.style.display = 'block';
            this.playControls.style.display = 'none';
            this.currentEl.innerText = "?";
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.HigherLowerGame = HigherLowerGame;
})();
