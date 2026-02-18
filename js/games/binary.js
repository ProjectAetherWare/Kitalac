(function() {
    window.MoonKat = window.MoonKat || {};

    class BinaryGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 5 : 30;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-network-wired"></i> Binary Option</h2>
                    <p class="section-subtitle">0 or 1. 50/50 Chance.</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="binary-display" style="font-family: 'Courier New', monospace; font-size: 5rem; font-weight: bold; color: var(--accent-primary);">?</div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Prediction</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="0">0</button>
                                <button class="game-btn-opt" data-choice="1">1</button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">EXECUTE</button>
                    </div>
                    <div id="game-log" class="game-log">Select 0 or 1!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.display = this.container.querySelector(".binary-display");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.optionBtns = this.container.querySelectorAll(".game-btn-opt");
            
            this.selectedChoice = '0'; // Default

            this.optionBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.optionBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedChoice = btn.getAttribute('data-choice');
                });
            });

            this.playBtn.addEventListener("click", () => this.play());
        }

        updateCurrency(amount) {
            if (this.currency === 'gems') {
                if (window.MoonKat.state.user.premiumBalance + amount < 0) return false;
                window.MoonKat.state.user.premiumBalance += amount;
            } else {
                if (!window.MoonKat.updateBalance(amount)) return false;
            }
            window.MoonKat.renderUserStats();
            return true;
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) {
                 this.log.innerText = "Invalid Bet";
                 return;
            }

            if (!this.updateCurrency(-bet)) {
                 this.log.innerText = `Insufficient ${this.currency === 'gems' ? 'Gems' : 'Funds'}`;
                 return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Computing...";
            
            // Animation
            const int = setInterval(() => {
                this.display.innerText = Math.random() > 0.5 ? '1' : '0';
            }, 50);

            setTimeout(() => {
                clearInterval(int);
                const result = Math.random() > 0.5 ? '1' : '0';
                this.display.innerText = result;
                
                const win = this.selectedChoice === result;
                const multiplier = 1.95;
                const payout = win ? bet * multiplier : 0;

                if (payout > 0) this.updateCurrency(payout);

                const xpGain = Math.floor(Math.max(10, bet * 0.1));
                window.MoonKat.addXp(xpGain);

                if(window.MoonKat.state.user.stats) {
                    window.MoonKat.state.user.stats.gamesPlayed++;
                    window.MoonKat.state.user.stats.totalBets += bet;
                    if(win) {
                        window.MoonKat.state.user.stats.wins = (window.MoonKat.state.user.stats.wins || 0) + 1;
                        window.MoonKat.state.user.stats.totalWon += payout;
                    } else {
                        window.MoonKat.state.user.stats.totalLost += bet;
                    }
                }

                this.log.innerHTML = `${win ? "WIN!" : "LOSE"} Result: ${result} ${win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 800);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.BinaryGame = BinaryGame;
})();
