(function() {
    class MinesGame {
        constructor(containerId, currency = 'cash', options = {}) {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.minesCount = options.mines || 3; // Default 3 mines if not specified
            
            // Setup UI
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2>Mines</h2>
                    <div class="game-visuals">
                        <div class="mines-game-container" style="display:flex; flex-direction:column; align-items:center;">
                            <div class="mines-grid" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; margin-bottom:10px;">
                                ${Array(25).fill(0).map((_, i) => `
                                    <div class="mine-tile" data-index="${i}" style="width:40px; height:40px; background:#333; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;">
                                        <div class="tile-content" style="display:none;"></div>
                                    </div>
                                `).join('')}
                            </div>
                            <div id="mines-status" style="height:20px; font-weight:bold;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div class="input-group">
                            <label>Multiplier Target</label>
                            <select id="mines-multiplier" class="game-input">
                                <option value="1.5">1.5x (Safe)</option>
                                <option value="3.0">3.0x (Medium)</option>
                                <option value="5.0">5.0x (Risky)</option>
                                <option value="10.0">10.0x (Extreme)</option>
                            </select>
                        </div>
                        <button id="play-btn" class="game-btn">Play</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.tiles = this.container.querySelectorAll('.mine-tile');
            this.statusDisplay = this.container.querySelector('#mines-status');
            this.betInput = this.container.querySelector('#bet-input');
            this.multiplierInput = this.container.querySelector('#mines-multiplier');
            this.playBtn = this.container.querySelector('#play-btn');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            if (this.playBtn) {
                this.playBtn.addEventListener('click', () => {
                    const bet = parseFloat(this.betInput.value);
                    const choice = this.multiplierInput.value;
                    
                    if (isNaN(bet) || bet <= 0) {
                        alert('Invalid bet amount');
                        return;
                    }
                    this.play(bet, choice);
                });
            }
        }

        reset() {
            this.tiles.forEach(tile => {
                tile.style.background = '#333';
                const content = tile.querySelector('.tile-content');
                if (content) {
                    content.style.display = 'none';
                    content.innerHTML = '';
                }
            });
            this.statusDisplay.innerText = '';
        }

        updateBalance(amount) {
            if (typeof window.MK === 'undefined') return;
            
            if (this.currency === 'cash') {
                if (window.MK.updateBalance) window.MK.updateBalance(amount);
            } else if (this.currency === 'gems') {
                if (window.MK.state && window.MK.state.user) {
                    window.MK.state.user.premiumBalance += amount;
                    if (window.MK.refreshUI) window.MK.refreshUI();
                }
            }
        }

        getUserBalance() {
            if (typeof window.MK === 'undefined') return 0;
            if (this.currency === 'cash') {
                return window.MK.state && window.MK.state.user ? window.MK.state.user.balance : 0;
            } else {
                return window.MK.state && window.MK.state.user ? window.MK.state.user.premiumBalance : 0;
            }
        }

        logResult(message, type = 'info') {
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.innerText = message;
            if (this.log.firstChild) {
                this.log.insertBefore(entry, this.log.firstChild);
            } else {
                this.log.appendChild(entry);
            }
            if (this.log.children.length > 10) {
                this.log.removeChild(this.log.lastChild);
            }
        }

        async play(bet, choice) {
            // Check balance
            const currentBalance = this.getUserBalance();
            if (currentBalance < bet) {
                alert("Insufficient funds!");
                return;
            }

            this.reset();
            this.playBtn.disabled = true;

            // Deduct bet
            this.updateBalance(-bet);
            this.logResult(`Bet placed: ${bet} on ${choice}x`, 'neutral');

            // Logic from resolveOutcome
            // "choice" is the multiplier option from the game catalog (e.g. "2", "3", "5")
            const multiplier = parseFloat(choice) || 1.5;
            
            // Logic: 70% win chance in original code (r > 0.3)
            // Adjusting win chance slightly based on multiplier for realism if we wanted, 
            // but sticking to original logic structure + some fairness adjustment perhaps?
            // Original: const isWin = Math.random() > 0.3;
            // Let's keep original logic for now as requested.
            const isWin = Math.random() > 0.3;
            
            const payout = isWin ? bet * multiplier : 0;

            const result = {
                win: isWin,
                multiplier: multiplier,
                message: isWin ? "Cleared!" : "Boom!",
                payout: payout
            };

            // Visual Animation
            this.statusDisplay.innerText = "Sweeping...";
            
            // Animate random tiles
            const indices = Array.from({length: 25}, (_, i) => i).sort(() => Math.random() - 0.5);
            const revealedCount = isWin ? 5 : 3; // Reveal some tiles

            for (let i = 0; i < revealedCount; i++) {
                await new Promise(r => setTimeout(r, 200));
                const tile = this.tiles[indices[i]];
                const content = tile.querySelector('.tile-content');
                
                if (isWin || i < revealedCount - 1) {
                    // Safe tile
                    tile.style.background = 'var(--accent-success)';
                    content.innerHTML = '<i class="fas fa-gem"></i>';
                    content.style.display = 'block';
                } else {
                    // Boom on last one if lost
                    tile.style.background = 'var(--accent-danger)';
                    content.innerHTML = '<i class="fas fa-bomb"></i>';
                    content.style.display = 'block';
                }
            }

            // Update Balance if Win
            if (isWin && payout > 0) {
                this.updateBalance(payout);
                this.logResult(`Win: ${multiplier}x (+$${payout.toFixed(2)})`, 'win');
            } else if (!isWin) {
                this.logResult(`Loss: (-$${bet.toFixed(2)})`, 'loss');
            }

            // Final status
            this.statusDisplay.innerHTML = result.win 
                ? `<span style="color:var(--accent-success)">CLEARED! (+$${result.payout.toFixed(2)})</span>`
                : `<span style="color:var(--accent-danger)">BOOM! (-$${bet.toFixed(2)})</span>`;

            this.playBtn.disabled = false;
            return result;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.MinesGame = MinesGame;
})();
