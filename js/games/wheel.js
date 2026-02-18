(function() {
    class WheelGame {
        constructor(containerId, currency = 'cash', variant = 'wheel') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.variant = variant; // 'wheel' or 'crazywheel'
            
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            // Using a simple CSS spinner for now as per getGameHTML
            const iconClass = this.variant === 'crazywheel' ? 'fa-fan' : 'fa-dharmachakra';
            const color = this.variant === 'crazywheel' ? 'var(--accent-premium)' : 'var(--text-color)';
            
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2>${this.variant === 'crazywheel' ? 'Crazy Wheel' : 'Wheel'}</h2>
                    <div class="game-visuals">
                        <div class="wheel-game-container" style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                            <div class="wheel-spinner" style="font-size:4rem; color:${color}; transition:transform 2s cubic-bezier(0.25, 0.1, 0.25, 1);">
                                <i class="fas ${iconClass}"></i>
                            </div>
                            <div id="wheel-result" style="height:24px; font-weight:bold;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <button id="play-btn" class="game-btn">Spin</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.spinner = this.container.querySelector('.wheel-spinner');
            this.resultDisplay = this.container.querySelector('#wheel-result');
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

        async play(bet) {
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

            // Logic
            let multipliers;
            if (this.variant === 'crazywheel') {
                multipliers = [0, 0, 0, 2, 5, 10, 25, 100];
            } else {
                multipliers = [0, 0, 1.5, 1.5, 2, 3];
            }
            
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            const isWin = multiplier > 0;
            const payout = bet * multiplier;

            // Visual Animation
            this.resultDisplay.innerText = "Spinning...";
            
            // Reset rotation
            this.spinner.style.transition = 'none';
            this.spinner.style.transform = 'rotate(0deg)';
            
            // Force reflow
            void this.spinner.offsetWidth;
            
            // Spin
            const rotations = 5 + Math.random() * 5; // 5-10 full spins
            const deg = rotations * 360;
            
            this.spinner.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
            this.spinner.style.transform = `rotate(${deg}deg)`;
            
            await new Promise(r => setTimeout(r, 3000));

            // Update Balance if Win
            if (isWin && payout > 0) {
                this.updateBalance(payout);
                this.logResult(`Win: ${multiplier}x (+$${payout.toFixed(2)})`, 'win');
            } else {
                this.logResult(`Loss: 0x (-$${bet.toFixed(2)})`, 'loss');
            }

            // Show result
            const resultText = `${multiplier}x`;
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">${resultText} - WIN $${payout.toFixed(2)}</span>`
                : `<span style="color:var(--accent-danger)">${resultText} - LOSS</span>`;

            this.playBtn.disabled = false;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: `Spin: ${multiplier}x`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.WheelGame = WheelGame;
})();
