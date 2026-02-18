(function() {
    window.MoonKat = window.MoonKat || {};

    class ScratchGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 5 : 20;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-ticket-alt"></i> Lucky Scratch</h2>
                    <p class="section-subtitle">Match 3 symbols to win 5x!</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="scratch-card-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <div class="scratch-cell" style="width: 80px; height: 80px; background: #444; display: flex; align-items: center; justify-content: center; font-size: 2rem; border-radius: 5px; cursor: pointer;">?</div>
                            <div class="scratch-cell" style="width: 80px; height: 80px; background: #444; display: flex; align-items: center; justify-content: center; font-size: 2rem; border-radius: 5px; cursor: pointer;">?</div>
                            <div class="scratch-cell" style="width: 80px; height: 80px; background: #444; display: flex; align-items: center; justify-content: center; font-size: 2rem; border-radius: 5px; cursor: pointer;">?</div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Ticket Cost (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">BUY TICKET & SCRATCH</button>
                    </div>
                    <div id="game-log" class="game-log">Buy a ticket to play!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.cells = this.container.querySelectorAll(".scratch-cell");

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
            this.log.innerHTML = "Scratching...";
            
            // Reset Cells
            this.cells.forEach(cell => {
                cell.innerHTML = '<i class="fas fa-question" style="opacity:0.2;"></i>';
                cell.style.background = '#444';
            });

            // Logic
            // Win chance 25%? 
            // 3 matching symbols needed.
            const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
            const isWin = Math.random() < 0.25;
            let resultSymbols = [];

            if(isWin) {
                const sym = symbols[Math.floor(Math.random() * symbols.length)];
                resultSymbols = [sym, sym, sym];
            } else {
                // Generate non-matching
                resultSymbols = [
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)]
                ];
                // Ensure not matching by accident (simple check)
                if(resultSymbols[0] === resultSymbols[1] && resultSymbols[1] === resultSymbols[2]) {
                     resultSymbols[2] = symbols[(symbols.indexOf(resultSymbols[2]) + 1) % symbols.length];
                }
            }

            // Reveal Animation
            let revealed = 0;
            resultSymbols.forEach((sym, i) => {
                setTimeout(() => {
                    this.cells[i].innerHTML = sym;
                    this.cells[i].style.background = '#555';
                    revealed++;
                    if(revealed === 3) {
                        this.finishPlay(bet, isWin);
                    }
                }, 400 * (i + 1));
            });
        }

        finishPlay(bet, isWin) {
            const payout = isWin ? bet * 5 : 0;
            const message = isWin ? "3 Matches! You Won!" : "No Match. Try again.";

            if (payout > 0) this.updateCurrency(payout);

            const xpGain = Math.floor(Math.max(10, bet * 0.1));
            window.MoonKat.addXp(xpGain);

            if(window.MoonKat.state.user.stats) {
                window.MoonKat.state.user.stats.gamesPlayed++;
                window.MoonKat.state.user.stats.totalBets += bet;
                if(isWin) {
                    window.MoonKat.state.user.stats.wins = (window.MoonKat.state.user.stats.wins || 0) + 1;
                    window.MoonKat.state.user.stats.totalWon += payout;
                } else {
                    window.MoonKat.state.user.stats.totalLost += bet;
                }
            }

            this.log.innerHTML = `${message} ${isWin ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
            this.playBtn.disabled = false;
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.ScratchGame = ScratchGame;
})();
