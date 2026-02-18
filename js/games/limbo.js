(function() {
    class LimboGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2>Limbo</h2>
                    <div class="game-visuals">
                        <div class="limbo-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; padding:20px;">
                            <div class="limbo-display" style="font-size:3rem; font-weight:bold; color:var(--accent-primary); font-family:monospace; margin-bottom:10px;">
                                0.00x
                            </div>
                            <div class="limbo-bar-bg" style="width:100%; height:10px; background:#333; border-radius:5px; position:relative; overflow:hidden;">
                                <div class="limbo-progress" style="width:0%; height:100%; background:var(--accent-primary); transition:width 0.1s linear;"></div>
                            </div>
                            <div id="limbo-result" style="margin-top:10px; height:20px;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div class="input-group">
                            <label>Target Multiplier</label>
                            <input type="number" id="limbo-target" value="2.00" min="1.01" step="0.01" class="game-input">
                        </div>
                        <button id="play-btn" class="game-btn">Launch</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.display = this.container.querySelector('.limbo-display');
            this.progressBar = this.container.querySelector('.limbo-progress');
            this.resultDisplay = this.container.querySelector('#limbo-result');
            this.betInput = this.container.querySelector('#bet-input');
            this.targetInput = this.container.querySelector('#limbo-target');
            this.playBtn = this.container.querySelector('#play-btn');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            if (this.playBtn) {
                this.playBtn.addEventListener('click', () => {
                    const bet = parseFloat(this.betInput.value);
                    const target = parseFloat(this.targetInput.value);
                    
                    if (isNaN(bet) || bet <= 0) {
                        alert('Invalid bet amount');
                        return;
                    }
                    if (isNaN(target) || target <= 1) {
                        alert('Invalid target multiplier (must be > 1)');
                        return;
                    }
                    this.play(bet, target);
                });
            }
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

            // Deduct bet
            this.updateBalance(-bet);
            this.playBtn.disabled = true;

            // Logic
            const target = parseFloat(choice) || 2.0;
            this.logResult(`Bet placed: ${bet} on >${target.toFixed(2)}x`, 'neutral');

            const flown = Math.random() * 10;
            const isWin = flown > target;
            const payout = isWin ? bet * target : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Launching...";
            this.progressBar.style.width = '0%';
            
            // Animate number going up
            const duration = 1000;
            const startTime = Date.now();
            
            await new Promise(resolve => {
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Simple easing
                    const currentVal = progress * flown;
                    this.display.innerText = `${currentVal.toFixed(2)}x`;
                    this.progressBar.style.width = `${progress * 100}%`;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                };
                requestAnimationFrame(animate);
            });

            // Final state
            this.display.innerText = `${flown.toFixed(2)}x`;
            this.display.style.color = isWin ? 'var(--accent-success)' : 'var(--accent-danger)';
            
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">Win! Target: ${target.toFixed(2)}x (+$${payout.toFixed(2)})</span>`
                : `<span style="color:var(--accent-danger)">Crashed! Target: ${target.toFixed(2)}x (-$${bet.toFixed(2)})</span>`;

            // Update Balance if Win
            if (isWin && payout > 0) {
                this.updateBalance(payout);
                this.logResult(`Win: ${flown.toFixed(2)}x (Target ${target}x) +$${payout.toFixed(2)}`, 'win');
            } else {
                this.logResult(`Crash: ${flown.toFixed(2)}x (Target ${target}x) -$${bet.toFixed(2)}`, 'loss');
            }

            this.playBtn.disabled = false;

            return {
                win: isWin,
                multiplier: target,
                payout: payout,
                message: `Flown: ${flown.toFixed(2)}x`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.LimboGame = LimboGame;
})();
