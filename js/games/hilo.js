(function() {
    class HiloGame {
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
                    <h2>HiLo</h2>
                    <div class="game-visuals">
                        <div class="hilo-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; gap:20px;">
                            <div class="hilo-cards" style="display:flex; gap:20px;">
                                <div id="hilo-card-current" class="card-display" style="width:100px; height:150px; background:#fff; color:#333; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; box-shadow:0 4px 8px rgba(0,0,0,0.3);">
                                    <span class="card-val">?</span>
                                    <span class="card-suit">♠</span>
                                </div>
                                <div id="hilo-arrow" style="display:flex; align-items:center; font-size:2rem; color:#aaa;">
                                    <i class="fas fa-arrow-right"></i>
                                </div>
                                <div id="hilo-card-next" class="card-display" style="width:100px; height:150px; background:#444; color:#666; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; border:2px dashed #666;">
                                    <span class="card-val">?</span>
                                </div>
                            </div>
                            <div id="hilo-result" style="height:20px; font-weight:bold;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div class="button-group" style="display:flex; gap:10px;">
                            <button id="btn-higher" class="game-btn" style="background:var(--accent-success);">Higher</button>
                            <button id="btn-lower" class="game-btn" style="background:var(--accent-danger);">Lower</button>
                        </div>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.currentCard = this.container.querySelector('#hilo-card-current');
            this.nextCard = this.container.querySelector('#hilo-card-next');
            this.resultDisplay = this.container.querySelector('#hilo-result');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnHigher = this.container.querySelector('#btn-higher');
            this.btnLower = this.container.querySelector('#btn-lower');
            this.log = this.container.querySelector('#game-log');
            
            // Initial random card
            this.setCard(this.currentCard, Math.floor(Math.random() * 13) + 1);
        }

        bindEvents() {
            const handlePlay = (choice) => {
                const bet = parseFloat(this.betInput.value);
                if (isNaN(bet) || bet <= 0) {
                    alert('Invalid bet amount');
                    return;
                }
                this.play(bet, choice);
            };

            if (this.btnHigher) {
                this.btnHigher.addEventListener('click', () => handlePlay('higher'));
            }
            if (this.btnLower) {
                this.btnLower.addEventListener('click', () => handlePlay('lower'));
            }
        }

        setCard(el, val) {
            const suits = ['♠', '♥', '♦', '♣'];
            const suit = suits[Math.floor(Math.random() * suits.length)];
            const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
            
            let displayVal = val;
            if (val === 1) displayVal = 'A';
            if (val === 11) displayVal = 'J';
            if (val === 12) displayVal = 'Q';
            if (val === 13) displayVal = 'K';

            el.style.background = '#fff';
            el.style.color = color;
            el.innerHTML = `
                <div style="font-size:1.5rem; position:absolute; top:5px; left:5px;">${displayVal}</div>
                <div style="font-size:3rem;">${suit}</div>
                <div style="font-size:1.5rem; position:absolute; bottom:5px; right:5px; transform:rotate(180deg);">${displayVal}</div>
            `;
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
            this.btnHigher.disabled = true;
            this.btnLower.disabled = true;

            // Logic
            // "case 'hilo': const c = ..., n = ...;"
            // This means it doesn't maintain state between rounds in the original logic.
            // To be faithful to `resolveOutcome`, I will generate both fresh.
            
            const c = Math.floor(Math.random() * 13) + 1;
            const n = Math.floor(Math.random() * 13) + 1;
            
            // Logic check: Ace is 1 (Low) or High? Usually Ace is Low in simple implementations unless specified.
            // Code uses 1-13. 1 < 2. So Ace is Low.
            
            // Equality check? Usually pushes or loses. Let's assume loss if equal for simplicity unless I see rules.
            // Original logic: `(choice === "higher" && n > c) || (choice === "lower" && n < c)`
            // This implies equal is a loss.
            
            const isWin = (choice === "higher" && n > c) || (choice === "lower" && n < c);
            const multiplier = 1.95;
            const payout = isWin ? bet * multiplier : 0;

            this.logResult(`Bet placed: ${bet} on ${choice}`, 'neutral');

            // Visual Animation
            this.resultDisplay.innerText = "Drawing...";
            
            // Show 'Current' card first (simulate it was there)
            this.setCard(this.currentCard, c);
            
            // Animate 'Next' card flip
            this.nextCard.style.transform = "rotateY(90deg)";
            this.nextCard.style.transition = "transform 0.3s";
            
            await new Promise(r => setTimeout(r, 300));
            
            this.setCard(this.nextCard, n);
            this.nextCard.style.transform = "rotateY(0deg)";
            
            await new Promise(r => setTimeout(r, 300));

            // Result
            const cardName = (val) => {
                if (val===1) return 'A';
                if (val===11) return 'J';
                if (val===12) return 'Q';
                if (val===13) return 'K';
                return val;
            };

            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">Win! ${cardName(c)} -> ${cardName(n)} (+$${payout.toFixed(2)})</span>`
                : `<span style="color:var(--accent-danger)">Loss! ${cardName(c)} -> ${cardName(n)} (-$${bet.toFixed(2)})</span>`;

            // Update Balance if Win
            if (isWin && payout > 0) {
                this.updateBalance(payout);
                this.logResult(`Win: ${cardName(c)} -> ${cardName(n)} (+$${payout.toFixed(2)})`, 'win');
            } else {
                this.logResult(`Loss: ${cardName(c)} -> ${cardName(n)} (-$${bet.toFixed(2)})`, 'loss');
            }

            this.btnHigher.disabled = false;
            this.btnLower.disabled = false;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: `${c} -> ${n}`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.HiloGame = HiloGame;
})();
