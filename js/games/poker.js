(function() {
    class PokerGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.MK = window.MoonKat;
            if (!this.container) return;
            this.init();
        }

        init() {
            this.render();
            this.bindEvents();
        }

        render() {
            const gameName = this.currency === 'gems' ? 'High Roller Poker' : 'Cyber Poker';
            const gameDesc = 'Jacks or Better pair.';
            const icon = 'fa-spade';

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${icon}"></i> ${gameName}</h2>
                    <p class="section-subtitle">${gameDesc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div class="cards-display" id="poker-hand" style="display: flex; gap: 10px; margin-bottom: 20px;">
                            ${this.renderCardBack()}${this.renderCardBack()}${this.renderCardBack()}${this.renderCardBack()}${this.renderCardBack()}
                        </div>
                        <div id="poker-result" style="font-size: 1.5rem; font-weight: bold; min-height: 30px;"></div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.currency === 'gems' ? 50 : 50}" min="1" step="${this.currency === 'gems' ? 5 : 10}" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn">DEAL HAND</button>
                    </div>
                    <div id="game-log" class="game-log">Jacks or Better to win.</div>
                </div>
            `;
        }
        
        renderCardBack() {
             return `<div class="card back" style="background: #444; width: 50px; height: 75px; border-radius: 4px; border: 1px solid #555;"></div>`;
        }
        
        renderCard(val, suit) {
            const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
            return `<div class="card" style="background:white; color:${color}; width:50px; height:75px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:1px solid #999; font-size: 1.2rem;">${val}${suit}</div>`;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.log = this.container.querySelector("#game-log");
            this.handContainer = this.container.querySelector("#poker-hand");
            this.resultText = this.container.querySelector("#poker-result");

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);

            if (!Number.isFinite(bet) || bet <= 0) {
                this.log.innerText = "Invalid Bet";
                return;
            }

            if (!this._updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Dealing...";
            this.resultText.innerText = "";
            
            // Animation placeholder
            this.handContainer.style.opacity = '0.5';
            
            setTimeout(() => {
                this.resolve(bet);
                this.handContainer.style.opacity = '1';
            }, 500);
        }

        resolve(bet) {
            // Logic from arena.js
            // arena.js was: const win = r < 0.3; return { win, multiplier: 3, message: ... }
            // It didn't actually simulate poker hands, just a 30% win chance.
            // Requirement: "Port the logic from resolveOutcome".
            // However, it also says "Show Hand" in Game Specifics.
            // I should generate a visual hand that matches the outcome if possible, or just random cards.
            
            const r = Math.random();
            const win = r < 0.3;
            
            // Generate visual hand
            const suits = ['♥', '♦', '♠', '♣'];
            const vals = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
            let hand = [];
            
            if (win) {
                // Force a winning visual (Pair of Jacks+)
                const high = ['J','Q','K','A'][Math.floor(Math.random()*4)];
                hand.push({val: high, suit: suits[0]});
                hand.push({val: high, suit: suits[1]});
                hand.push({val: vals[Math.floor(Math.random()*9)], suit: suits[2]});
                hand.push({val: vals[Math.floor(Math.random()*9)], suit: suits[3]});
                hand.push({val: vals[Math.floor(Math.random()*9)], suit: suits[0]});
            } else {
                // Random junk
                for(let i=0; i<5; i++) {
                    hand.push({val: vals[Math.floor(Math.random()*vals.length)], suit: suits[Math.floor(Math.random()*4)]});
                }
            }
            
            this.handContainer.innerHTML = hand.map(c => this.renderCard(c.val, c.suit)).join('');
            
            const multiplier = 3;
            const message = win ? "Jacks or Better!" : "High Card / Low Pair";
            const payout = win ? bet * multiplier : 0;
            
            if (win) {
                this._updateBalance(payout);
                this.log.innerHTML = `<span style="color:var(--accent-success)">${message} (+${this.formatCurrency(payout)})</span>`;
                this.resultText.innerHTML = `<span style="color:var(--accent-success)">WIN!</span>`;
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">${message}</span>`;
                this.resultText.innerHTML = `<span style="color:#888">LOSE</span>`;
            }
            
            this.playBtn.disabled = false;
        }

        _updateBalance(amount) {
            if (this.currency === 'cash') {
                return this.MK.updateBalance(amount);
            } else {
                if (this.MK.state.user.premiumBalance + amount < 0) return false;
                this.MK.state.user.premiumBalance += amount;
                if (typeof this.MK.saveUser === 'function') this.MK.saveUser();
                if (window.app && window.app.updateUI) window.app.updateUI();
                return true;
            }
        }
        
        formatCurrency(amount) {
            return this.currency === 'cash' ? `$${amount.toFixed(2)}` : `${amount} Gems`;
        }
    }

    window.MoonKat.PokerGame = PokerGame;
})();
