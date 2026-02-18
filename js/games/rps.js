(function() {
    window.MoonKat = window.MoonKat || {};

    class RpsGame {
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
                    <h2><i class="fas fa-hand-scissors"></i> Rock Paper Scissors</h2>
                    <p class="section-subtitle">Beat the CPU to win 2x!</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
                        <div class="rps-result" style="font-size: 4rem;">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <div class="vs-text" style="font-size: 1.5rem; opacity: 0.5;">VS</div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Your Move</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="rock"><i class="fas fa-hand-rock"></i></button>
                                <button class="game-btn-opt" data-choice="paper"><i class="fas fa-hand-paper"></i></button>
                                <button class="game-btn-opt" data-choice="scissors"><i class="fas fa-hand-scissors"></i></button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">PLAY ROUND</button>
                    </div>
                    <div id="game-log" class="game-log">Select a move and place your bet!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.resultIcon = this.container.querySelector(".rps-result");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.optionBtns = this.container.querySelectorAll(".game-btn-opt");
            
            this.selectedChoice = 'rock'; // Default

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
            this.log.innerHTML = "Playing...";
            this.resultIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Animation
            setTimeout(() => {
                const cpu = ["rock", "paper", "scissors"][Math.floor(Math.random()*3)];
                const choice = this.selectedChoice;
                let outcome = 'draw';
                
                if ((choice==='rock'&&cpu==='scissors') || (choice==='paper'&&cpu==='rock') || (choice==='scissors'&&cpu==='paper')) outcome = 'win';
                else if (choice !== cpu) outcome = 'lose';
                
                const iconMap = {
                    rock: 'fa-hand-rock',
                    paper: 'fa-hand-paper',
                    scissors: 'fa-hand-scissors'
                };

                let result = { win: outcome === 'win', multiplier: 2, message: `CPU chose ${cpu.toUpperCase()}`, data: {} };
                if(outcome==='draw') { result.message = "Draw (Refund)"; result.multiplier = 1; result.win = true; }

                // Visual Update
                const color = outcome === 'win' ? 'var(--accent-success)' : (outcome === 'draw' ? 'var(--text-muted)' : 'var(--accent-danger)');
                this.resultIcon.innerHTML = `<i class="fas ${iconMap[cpu]}" style="color:${color}"></i>`;
                
                const payout = result.win ? bet * result.multiplier : 0;
                if (payout > 0) this.updateCurrency(payout);

                const xpGain = Math.floor(Math.max(10, bet * 0.1));
                window.MoonKat.addXp(xpGain);

                // Stats
                if(window.MoonKat.state.user.stats) {
                    window.MoonKat.state.user.stats.gamesPlayed++;
                    window.MoonKat.state.user.stats.totalBets += bet; // Note: Mixing currencies in stats might be messy, but keeping it simple
                    if(result.win && outcome !== 'draw') {
                         window.MoonKat.state.user.stats.wins = (window.MoonKat.state.user.stats.wins || 0) + 1;
                         window.MoonKat.state.user.stats.totalWon += payout;
                    } else if(outcome === 'lose') {
                        window.MoonKat.state.user.stats.totalLost += bet;
                    }
                }

                this.log.innerHTML = `${result.message} ${result.win ? `<span style="color:var(--accent-success)">+${payout}</span>` : `<span style="color:var(--accent-danger)">-${bet}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 600);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.RpsGame = RpsGame;
})();
