(function() {
    window.MoonKat = window.MoonKat || {};

    class PenaltyGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 5 : 25;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-futbol"></i> Penalty Kick</h2>
                    <p class="section-subtitle">Pick a corner to score! (Multiplier based on odds)</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <div style="font-size: 5rem; margin-bottom: 20px;" id="goal-display">🥅</div>
                        <div id="ball-display" style="font-size: 2rem; transition: all 0.5s ease;">⚽</div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Aim Direction</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="left"><i class="fas fa-arrow-left"></i> Left</button>
                                <button class="game-btn-opt" data-choice="center"><i class="fas fa-arrow-up"></i> Center</button>
                                <button class="game-btn-opt" data-choice="right">Right <i class="fas fa-arrow-right"></i></button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">SHOOT</button>
                    </div>
                    <div id="game-log" class="game-log">Select a direction and shoot!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.goalDisplay = this.container.querySelector("#goal-display");
            this.ballDisplay = this.container.querySelector("#ball-display");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.optionBtns = this.container.querySelectorAll(".game-btn-opt");
            
            this.selectedChoice = 'left'; // Default

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
            this.log.innerHTML = "Shooting...";
            this.ballDisplay.style.transform = 'translate(0, 0) scale(1)';
            this.goalDisplay.innerHTML = '🥅';
            
            // Animation
            setTimeout(() => {
                const choice = this.selectedChoice;
                const goalieMove = ["left", "center", "right"][Math.floor(Math.random()*3)];
                const win = goalieMove !== choice;
                
                // 1.9 multiplier for ~66% win rate (2/3 chance to not hit goalie)
                // Actually 1.4 is low for 66% win rate (fair is 1.5). Let's do 2.0 (fair is 3.0? No, 2/3 win chance means fair is 1.5x)
                // If there are 3 spots, and goalie picks 1.
                // Win chance = 2/3.
                // If goalie is good, maybe they pick user's spot more often?
                // Let's keep it simple: 1/3 chance goalie saves it.
                // Win mult should be around 1.4-1.5 to be house edge.
                
                const multiplier = 1.4; 
                
                let result = { win, multiplier, message: win ? "GOAL!" : "BLOCKED!" };
                
                // Visuals
                let x = 0;
                let y = -50;
                if(choice === 'left') x = -50;
                if(choice === 'right') x = 50;
                
                this.ballDisplay.style.transform = `translate(${x}px, ${y}px) scale(0.5)`;
                
                setTimeout(() => {
                    this.goalDisplay.innerHTML = win ? '🥅' : '🧤'; // Glove if saved
                     const payout = result.win ? bet * result.multiplier : 0;
                    if (payout > 0) this.updateCurrency(payout);

                    const xpGain = Math.floor(Math.max(10, bet * 0.1));
                    window.MoonKat.addXp(xpGain);
                    
                    // Stats
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

                    this.log.innerHTML = `${result.message} (Goalie went ${goalieMove.toUpperCase()}) ${result.win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                    this.playBtn.disabled = false;
                    this.ballDisplay.style.transform = 'translate(0, 0) scale(1)';
                }, 500);

            }, 500);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.PenaltyGame = PenaltyGame;
})();
