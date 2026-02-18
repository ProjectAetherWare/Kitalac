(function() {
    class PlinkoGame {
        constructor(containerId, currency = 'cash', variant = 'classic') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.variant = variant; // 'classic' or 'plinkox' (which maps to 'plinko' or 'plinkox' in arena logic)
            this.isPlinkoX = variant.includes('plinkox') || variant.includes('X');
            
            // Multipliers
            this.multipliers = this.isPlinkoX 
                ? [0.2, 0.5, 1, 1.5, 3, 20] 
                : [0.2, 0.5, 1, 1.5, 3, 10];

            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2>${this.variant.charAt(0).toUpperCase() + this.variant.slice(1)} Plinko</h2>
                    <div class="game-visuals">
                        <div class="plinko-board" style="display:flex; flex-direction:column; align-items:center; gap:5px; padding:20px; background:rgba(0,0,0,0.2); border-radius:10px;">
                            <div class="peg-row" style="color:#555;">.</div>
                            <div class="peg-row" style="color:#666;">...</div>
                            <div class="peg-row" style="color:#777;">.....</div>
                            <div class="peg-row" style="color:#888;">.......</div>
                            <div class="peg-row" style="color:#999;">.........</div>
                            <div id="plinko-ball-container" style="height:50px; display:flex; align-items:center; justify-content:center; width:100%;">
                                <div id="plinko-ball" style="width:20px; height:20px; background:var(--accent-primary); border-radius:50%; display:none;"></div>
                            </div>
                            <div class="plinko-buckets" style="display:flex; gap:5px; margin-top:10px;">
                                ${this.multipliers.map(m => `
                                    <div class="bucket" style="padding:5px 8px; background:#333; border-radius:4px; font-size:0.8rem; color:${m >= 1 ? 'var(--accent-success)' : 'var(--accent-danger)'}">
                                        ${m}x
                                    </div>
                                `).join('')}
                            </div>
                            <div id="plinko-result" style="margin-top:10px; height:24px; font-weight:bold;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <button id="play-btn" class="game-btn">Play</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.ball = this.container.querySelector('#plinko-ball');
            this.resultDisplay = this.container.querySelector('#plinko-result');
            this.betInput = this.container.querySelector('#bet-input');
            this.playBtn = this.container.querySelector('#play-btn');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            if (this.playBtn) {
                this.playBtn.addEventListener('click', () => {
                    const bet = parseFloat(this.betInput.value);
                    if (isNaN(bet) || bet <= 0) {
                        alert('Invalid bet amount');
                        return;
                    }
                    this.play(bet);
                });
            }
        }

        updateBalance(amount) {
            if (this.currency === 'cash') {
                if (window.MK && window.MK.updateBalance) {
                    window.MK.updateBalance(amount);
                }
            } else if (this.currency === 'gems') {
                if (window.MK && window.MK.state && window.MK.state.user) {
                    window.MK.state.user.premiumBalance += amount;
                    // Trigger UI update if possible, otherwise assume reactive
                    if (window.MK.refreshUI) window.MK.refreshUI();
                }
            }
        }

        getUserBalance() {
            if (this.currency === 'cash') {
                return window.MK && window.MK.state && window.MK.state.user ? window.MK.state.user.balance : 0;
            } else {
                return window.MK && window.MK.state && window.MK.state.user ? window.MK.state.user.premiumBalance : 0;
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
            // Limit log size
            if (this.log.children.length > 10) {
                this.log.removeChild(this.log.lastChild);
            }
        }

        async play(bet) {
            if (!this.container) return null;

            // Check balance
            const currentBalance = this.getUserBalance();
            if (currentBalance < bet) {
                alert("Insufficient funds!");
                return;
            }

            // Deduct bet
            this.updateBalance(-bet);
            this.playBtn.disabled = true;
            this.logResult(`Bet placed: ${bet} ${this.currency}`, 'neutral');
            
            // Visual Animation
            this.ball.style.display = 'block';
            this.ball.style.transform = 'translateY(-100px)';
            this.resultDisplay.innerText = "Dropping...";
            
            // Simple drop animation simulation
            await new Promise(r => setTimeout(r, 100));
            this.ball.style.transition = 'transform 0.8s cubic-bezier(0.5, 0, 0.5, 1)';
            this.ball.style.transform = 'translateY(0)';
            
            await new Promise(r => setTimeout(r, 800)); // Wait for drop

            // Logic
            const multiplier = this.multipliers[Math.floor(Math.random() * this.multipliers.length)];
            const win = multiplier >= 1;
            const payout = bet * multiplier;

            // Add winnings
            if (payout > 0) {
                this.updateBalance(payout);
            }

            // Update UI
            this.ball.style.display = 'none';
            if (win) {
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-success)">Landed ${multiplier}x (+$${payout.toFixed(2)})</span>`;
                this.logResult(`Win: ${multiplier}x (+$${payout.toFixed(2)})`, 'win');
            } else {
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-danger)">Landed ${multiplier}x (-$${bet.toFixed(2)})</span>`;
                this.logResult(`Loss: ${multiplier}x (-$${bet.toFixed(2)})`, 'loss');
            }

            this.playBtn.disabled = false;

            return {
                win: win,
                multiplier: multiplier,
                payout: payout,
                message: `Landed ${multiplier}x`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.PlinkoGame = PlinkoGame;
})();
