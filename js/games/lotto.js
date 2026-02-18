(function() {
    window.MoonKat = window.MoonKat || {};

    class LottoGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 5 : 10;
            
            // Options 1-10
            const options = Array.from({length: 10}, (_, i) => i + 1);

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-ticket"></i> Moon Lotto</h2>
                    <p class="section-subtitle">Pick a lucky number (1-10). Win 9x!</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div class="lotto-ball-display" style="width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #555, #000); display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">?</div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Select Number</label>
                            <div class="lotto-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px;">
                                ${options.map(n => `<button class="game-btn-opt lotto-num" data-val="${n}">${n}</button>`).join('')}
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">DRAW BALL</button>
                    </div>
                    <div id="game-log" class="game-log">Pick a number to play!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.ballDisplay = this.container.querySelector(".lotto-ball-display");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.numBtns = this.container.querySelectorAll(".lotto-num");
            
            this.selectedNumber = 1; // Default
            this.numBtns[0].classList.add('active');

            this.numBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.numBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedNumber = parseInt(btn.getAttribute('data-val'));
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
            this.log.innerHTML = "Drawing...";
            this.ballDisplay.innerText = "?";
            this.ballDisplay.style.background = "radial-gradient(circle at 30% 30%, #555, #000)";
            this.ballDisplay.classList.add('shake');
            
            setTimeout(() => {
                this.ballDisplay.classList.remove('shake');
                
                const drawn = Math.floor(Math.random() * 10) + 1;
                const win = drawn === this.selectedNumber;
                const multiplier = 9.0;
                
                // Colorize ball based on result
                if(win) {
                    this.ballDisplay.style.background = "radial-gradient(circle at 30% 30%, #2ecc71, #27ae60)";
                } else {
                    this.ballDisplay.style.background = "radial-gradient(circle at 30% 30%, #e74c3c, #c0392b)";
                }
                this.ballDisplay.innerText = drawn;

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

                this.log.innerHTML = `${win ? "WINNER!" : "Try Again."} Drawn: ${drawn} ${win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 1000);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.LottoGame = LottoGame;
})();
