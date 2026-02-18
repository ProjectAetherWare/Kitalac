(function() {
    window.MoonKat = window.MoonKat || {};

    class ColorGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 5 : 15;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-palette"></i> Chroma Key</h2>
                    <p class="section-subtitle">Predict the color. (Red 2x, Blue 2x, Yellow 5x)</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="color-box" style="width: 120px; height: 120px; background: #333; border-radius: 12px; transition: background 0.5s;"></div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Select Color</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="red" style="border-bottom: 3px solid #e74c3c;">Red (2x)</button>
                                <button class="game-btn-opt" data-choice="blue" style="border-bottom: 3px solid #3498db;">Blue (2x)</button>
                                <button class="game-btn-opt" data-choice="yellow" style="border-bottom: 3px solid #f1c40f;">Yellow (5x)</button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">PLAY</button>
                    </div>
                    <div id="game-log" class="game-log">Pick a color!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.colorBox = this.container.querySelector(".color-box");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.optionBtns = this.container.querySelectorAll(".game-btn-opt");
            
            this.selectedChoice = 'red'; // Default

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
            this.log.innerHTML = "Spinning...";
            
            // Animation
            let count = 0;
            const colors = ['#e74c3c', '#3498db', '#f1c40f']; // Red, Blue, Yellow
            const interval = setInterval(() => {
                this.colorBox.style.background = colors[count % 3];
                count++;
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                
                // Probabilities: Red 45%, Blue 45%, Yellow 10%
                const rand = Math.random();
                let result = 'red';
                let multiplier = 2;
                
                if (rand < 0.45) { result = 'red'; multiplier = 2; }
                else if (rand < 0.90) { result = 'blue'; multiplier = 2; }
                else { result = 'yellow'; multiplier = 5; }

                const colorMap = {
                    'red': '#e74c3c',
                    'blue': '#3498db',
                    'yellow': '#f1c40f'
                };

                this.colorBox.style.background = colorMap[result];
                
                const win = this.selectedChoice === result;
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

                this.log.innerHTML = `${win ? "WIN!" : "LOSE"} Result: ${result.toUpperCase()} ${win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 1500);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.ColorGame = ColorGame;
})();
