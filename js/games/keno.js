(function() {
    class KenoGame {
        constructor(containerId, currency = 'cash', options = {}) {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.balls = 20; // Standard Keno usually has 80, but HTML in arena uses 20 for simplicity
            
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2>Keno</h2>
                    <div class="game-visuals">
                        <div class="keno-container" style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                            <div class="keno-grid" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px;">
                                ${Array(this.balls).fill(0).map((_, i) => `
                                    <div class="keno-ball" id="ball-${i+1}" style="width:30px; height:30px; background:#333; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; color:#aaa;">
                                        ${i+1}
                                    </div>
                                `).join('')}
                            </div>
                            <div id="keno-result" style="height:20px; font-weight:bold; margin-top:10px;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div class="input-group">
                            <label>Prediction</label>
                            <select id="keno-choice" class="game-input">
                                <option value="even">Even Hits</option>
                                <option value="odd">Odd Hits</option>
                            </select>
                        </div>
                        <button id="play-btn" class="game-btn">Play</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.resultDisplay = this.container.querySelector('#keno-result');
            this.betInput = this.container.querySelector('#bet-input');
            this.choiceInput = this.container.querySelector('#keno-choice');
            this.playBtn = this.container.querySelector('#play-btn');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            if (this.playBtn) {
                this.playBtn.addEventListener('click', () => {
                    const bet = parseFloat(this.betInput.value);
                    const choice = this.choiceInput.value;
                    if (isNaN(bet) || bet <= 0) {
                        alert('Invalid bet amount');
                        return;
                    }
                    this.play(bet, choice);
                });
            }
        }

        reset() {
            for(let i=1; i<=this.balls; i++) {
                const ball = this.container.querySelector(`#ball-${i}`);
                if(ball) {
                    ball.style.background = '#333';
                    ball.style.color = '#aaa';
                    ball.style.transform = 'scale(1)';
                }
            }
            this.resultDisplay.innerText = '';
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
            this.logResult(`Bet placed: ${bet} on ${choice}`, 'neutral');
            
            // Logic from arena.js
            // "hits" is random 0-4.
            const hitsCount = Math.floor(Math.random() * 5); 
            // Logic check: arena.js logic is `hits % 2 === 0`
            const isEven = hitsCount % 2 === 0;
            const isWin = (choice === 'even' && isEven) || (choice === 'odd' && !isEven);
            const multiplier = 1.9;
            const payout = isWin ? bet * multiplier : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Drawing...";
            
            // Select random balls to highlight
            // We need to pick 'hitsCount' unique numbers from 1-20
            const chosenBalls = [];
            while(chosenBalls.length < hitsCount) {
                const num = Math.floor(Math.random() * this.balls) + 1;
                if(!chosenBalls.includes(num)) chosenBalls.push(num);
            }

            // Animate revealing them one by one
            for (const num of chosenBalls) {
                await new Promise(r => setTimeout(r, 400));
                const ball = this.container.querySelector(`#ball-${num}`);
                if (ball) {
                    ball.style.background = 'var(--accent-primary)';
                    ball.style.color = '#fff';
                    ball.style.transform = 'scale(1.1)';
                    ball.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }
            }

            // Update Balance if Win
            if (isWin && payout > 0) {
                this.updateBalance(payout);
                this.logResult(`Win: ${hitsCount} hits (${choice}) +$${payout.toFixed(2)}`, 'win');
            } else if (!isWin) {
                this.logResult(`Loss: ${hitsCount} hits (${isEven ? 'even' : 'odd'}) -$${bet.toFixed(2)}`, 'loss');
            }

            // Show result
            const resultText = `${hitsCount} hits (${isEven ? 'EVEN' : 'ODD'})`;
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">${resultText} - WIN $${payout.toFixed(2)}</span>`
                : `<span style="color:var(--accent-danger)">${resultText} - LOST $${bet.toFixed(2)}</span>`;

            this.playBtn.disabled = false;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: resultText
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.KenoGame = KenoGame;
})();
