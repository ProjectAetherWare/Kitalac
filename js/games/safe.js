(function() {
    window.MoonKat = window.MoonKat || {};

    class SafeGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 10 : 60;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-lock"></i> Vault Breaker</h2>
                    <p class="section-subtitle">Guess the last digit (0, 5, 7, 9).</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="safe-dial" style="width: 150px; height: 150px; border-radius: 50%; border: 10px solid #555; background: #222; position: relative; display: flex; align-items: center; justify-content: center;">
                            <div class="safe-knob" style="width: 100px; height: 100px; border-radius: 50%; background: #444; border: 2px solid #666; display: flex; align-items: center; justify-content: center;">
                                <div class="knob-marker" style="width: 10px; height: 20px; background: red; position: absolute; top: 10px;"></div>
                                <span id="safe-display" style="color: #0f0; font-family: monospace; font-size: 2rem;">--</span>
                            </div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Select Digit</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="0">0</button>
                                <button class="game-btn-opt" data-choice="5">5</button>
                                <button class="game-btn-opt" data-choice="7">7</button>
                                <button class="game-btn-opt" data-choice="9">9</button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">CRACK SAFE</button>
                    </div>
                    <div id="game-log" class="game-log">Select a digit!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.safeDisplay = this.container.querySelector("#safe-display");
            this.safeKnob = this.container.querySelector(".safe-knob");
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
            this.log.innerHTML = "Cracking...";
            
            // Animation
            let rot = 0;
            const spinInt = setInterval(() => {
                rot += 45;
                this.safeKnob.style.transform = `rotate(${rot}deg)`;
                this.safeDisplay.innerText = Math.floor(Math.random() * 10);
            }, 100);

            setTimeout(() => {
                clearInterval(spinInt);
                this.safeKnob.style.transform = `rotate(0deg)`;

                // Weighted or Random logic? 
                // Description: "Guess the last digit (0-9)". But options are only 0, 5, 7, 9.
                // It seems like we only care if it lands on one of these?
                // Or maybe the result IS restricted to these 4? 
                // Let's assume standard 0-9 random generation.
                // Probability of hitting 1 specific number out of 10 is 1/10.
                // Payout should be high, around 9x.
                
                const result = Math.floor(Math.random() * 10);
                const selected = parseInt(this.selectedChoice);
                const win = result === selected;
                
                this.safeDisplay.innerText = result;
                
                // If the options were specific, maybe the game ONLY rolls 0, 5, 7, 9?
                // The user prompt said: "Options: 0, 5, 7, 9".
                // If it's standard 0-9, hitting a specific number is 10% chance.
                // I will stick to 0-9 rng.

                const multiplier = 9.0;
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

                this.log.innerHTML = `${win ? "OPENED!" : "LOCKED"} Result: ${result} ${win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 1500);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.SafeGame = SafeGame;
})();
