(function() {
    window.MoonKat = window.MoonKat || {};

    class OracleGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 10 : 50;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-eye"></i> Oracle</h2>
                    <p class="section-subtitle">Ask the Oracle (Yes/No). Win 1.95x.</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="crystal-ball" style="width: 150px; height: 150px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #a29bfe, #6c5ce7); box-shadow: 0 0 20px #6c5ce7; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">?</div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Prediction</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="yes">YES</button>
                                <button class="game-btn-opt" data-choice="no">NO</button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">CONSULT ORACLE</button>
                    </div>
                    <div id="game-log" class="game-log">Ask a question!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.ball = this.container.querySelector(".crystal-ball");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.optionBtns = this.container.querySelectorAll(".game-btn-opt");
            
            this.selectedChoice = 'yes'; // Default

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
            this.log.innerHTML = "Consulting...";
            this.ball.innerText = "...";
            this.ball.style.boxShadow = "0 0 40px #a29bfe";
            
            // Animation
            setTimeout(() => {
                const rand = Math.random();
                const result = rand > 0.5 ? 'yes' : 'no';
                
                this.ball.innerText = result.toUpperCase();
                this.ball.style.boxShadow = "0 0 20px #6c5ce7";
                
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

                this.log.innerHTML = `${win ? "CORRECT!" : "WRONG!"} Oracle says: ${result.toUpperCase()} ${win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 1500);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.OracleGame = OracleGame;
})();
