(function() {
    window.MoonKat = window.MoonKat || {};

    class RacingGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 10 : 40;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-horse-head"></i> Bot Racing</h2>
                    <p class="section-subtitle">Bet on the winner (4x Payout)</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                        <div class="race-track" style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-around; padding: 10px;">
                            <!-- Racers will be animated here -->
                            <div style="font-size: 3rem; text-align: center; color: var(--text-muted); opacity: 0.5;">
                                <i class="fas fa-flag-checkered"></i>
                            </div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Select Winner</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="Alpha">Alpha</button>
                                <button class="game-btn-opt" data-choice="Beta">Beta</button>
                                <button class="game-btn-opt" data-choice="Gamma">Gamma</button>
                                <button class="game-btn-opt" data-choice="Delta">Delta</button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">START RACE</button>
                    </div>
                    <div id="game-log" class="game-log">Select a bot and place your bet!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.optionBtns = this.container.querySelectorAll(".game-btn-opt");
            
            this.selectedChoice = 'Alpha'; // Default

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
            this.log.innerHTML = "Racing...";
            
            // Simple visual representation of the race
            this.visContainer.innerHTML = '';
            const racers = ['Alpha', 'Beta', 'Gamma', 'Delta'];
            const racerEls = [];
            
            racers.forEach((name, i) => {
                const el = document.createElement('div');
                el.style.cssText = `display: flex; align-items: center; width: 100%; margin-bottom: 5px;`;
                el.innerHTML = `<span style="width: 60px; font-size: 0.8rem;">${name}</span> <div style="flex:1; background: #333; height: 10px; border-radius: 5px; position: relative;"><div class="racer-dot" style="position: absolute; left: 0; top: -5px; width: 20px; height: 20px; background: var(--accent-primary); border-radius: 50%; transition: left 0.5s linear;"></div></div>`;
                this.visContainer.appendChild(el);
                racerEls.push({ name, el: el.querySelector('.racer-dot') });
            });

            // Simulate race steps
            let steps = 0;
            const maxSteps = 20;
            const interval = setInterval(() => {
                steps++;
                let positions = racerEls.map(r => ({ ...r, pos: parseFloat(r.el.style.left) || 0 }));
                
                // Random movement
                racerEls.forEach(r => {
                    const move = Math.random() * 10;
                    const current = parseFloat(r.el.style.left) || 0;
                    const newPos = Math.min(95, current + move); // %
                    r.el.style.left = `${newPos}%`;
                });

                if (steps >= 10) { // Race finish logic
                    clearInterval(interval);
                    
                    const winner = racers[Math.floor(Math.random() * racers.length)];
                    // Visually snap winner to end
                    racerEls.find(r => r.name === winner).el.style.left = '95%';
                    
                    const choice = this.selectedChoice;
                    const result = { win: winner === choice, multiplier: 3.8, message: `Winner: ${winner}` };

                    const payout = result.win ? bet * result.multiplier : 0;
                    if (payout > 0) this.updateCurrency(payout);

                    const xpGain = Math.floor(Math.max(10, bet * 0.1));
                    window.MoonKat.addXp(xpGain);

                    // Stats logic
                    if(window.MoonKat.state.user.stats) {
                        window.MoonKat.state.user.stats.gamesPlayed++;
                        window.MoonKat.state.user.stats.totalBets += bet;
                        if(result.win) {
                            window.MoonKat.state.user.stats.wins = (window.MoonKat.state.user.stats.wins || 0) + 1;
                            window.MoonKat.state.user.stats.totalWon += payout;
                        } else {
                            window.MoonKat.state.user.stats.totalLost += bet;
                        }
                    }

                    this.log.innerHTML = `${result.message} ${result.win ? `<span style="color:var(--accent-success)">+${payout}</span>` : `<span style="color:var(--accent-danger)">-${bet}</span>`} (+${xpGain} XP)`;
                    this.playBtn.disabled = false;
                }
            }, 200);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.RacingGame = RacingGame;
})();
