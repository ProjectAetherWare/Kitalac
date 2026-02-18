(function() {
    class TowerGame {
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
                    <h2>Tower</h2>
                    <div class="game-visuals">
                        <div class="tower-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; gap:20px;">
                            <div class="tower-ladder" style="position:relative; width:60px; height:200px; border-left:4px solid #555; border-right:4px solid #555; display:flex; flex-direction:column-reverse; justify-content:space-around;">
                                <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                                <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                                <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                                <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                                <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                                
                                <div id="climber" style="position:absolute; bottom:0; left:50%; transform:translate(-50%, 0); font-size:2rem; transition:bottom 0.5s ease-out;">
                                    🧗
                                </div>
                            </div>
                            <div id="tower-result" style="height:20px; font-weight:bold;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <button id="play-btn" class="game-btn">Climb</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.climber = this.container.querySelector('#climber');
            this.resultDisplay = this.container.querySelector('#tower-result');
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
            this.logResult(`Bet placed: ${bet} ${this.currency}`, 'neutral');

            // Logic
            const canClimb = Math.random() > 0.3; // 70% chance to climb
            const multiplier = 1.5;
            const payout = canClimb ? bet * multiplier : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Climbing...";
            
            // Start at bottom
            this.climber.style.bottom = '0';
            this.climber.style.opacity = '1';
            
            await new Promise(r => setTimeout(r, 200));
            
            // Climb up
            this.climber.style.bottom = '160px'; // Top
            
            await new Promise(r => setTimeout(r, 600));

            // Update Balance if Win
            if (canClimb && payout > 0) {
                this.updateBalance(payout);
                this.logResult(`Win: Reached top (+$${payout.toFixed(2)})`, 'win');
                
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-success)">Reached the top! (+$${payout.toFixed(2)})</span>`;
                // Celebrate
                this.climber.innerHTML = '🚩';
            } else {
                this.logResult(`Loss: Fell off (-$${bet.toFixed(2)})`, 'loss');
                
                // Fall
                this.climber.style.transition = 'bottom 0.3s ease-in';
                this.climber.style.bottom = '0';
                await new Promise(r => setTimeout(r, 300));
                this.climber.innerHTML = '💥';
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-danger)">Fell! (-$${bet.toFixed(2)})</span>`;
            }

            // Reset icon after a bit
            setTimeout(() => {
                this.climber.innerHTML = '🧗';
                if(!canClimb) {
                     this.climber.style.transition = '';
                     this.climber.style.bottom = '0';
                }
                this.playBtn.disabled = false;
            }, 2000);

            return {
                win: canClimb,
                multiplier: multiplier,
                payout: payout,
                message: canClimb ? "Climbed!" : "Fell!"
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.TowerGame = TowerGame;
})();
