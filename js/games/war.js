(function() {
    class WarGame {
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
            this.deck = this.createDeck();
        }

        render() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-swords"></i> Casino War</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px; min-height:200px; justify-content:center;">
                        <div style="display:flex; justify-content:space-around; width:100%;">
                            <div id="dealer-area" style="text-align:center;">
                                <div style="margin-bottom:10px; font-weight:bold; color:#aaa;">DEALER</div>
                                <div id="dealer-card" class="card-slot" style="width:80px; height:120px; border:2px dashed #444; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#222;">
                                    <span style="font-size:2rem; opacity:0.3;">?</span>
                                </div>
                            </div>
                            <div id="player-area" style="text-align:center;">
                                <div style="margin-bottom:10px; font-weight:bold; color:#aaa;">YOU</div>
                                <div id="player-card" class="card-slot" style="width:80px; height:120px; border:2px dashed #444; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#222;">
                                    <span style="font-size:2rem; opacity:0.3;">?</span>
                                </div>
                            </div>
                        </div>
                        <div id="war-status" style="height:30px; font-weight:bold; color:#ffd700;"></div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <button id="btn-deal" class="game-btn action-btn">DEAL</button>
                        <button id="btn-war" class="game-btn action-btn" style="display:none; background:#d32f2f;">GO TO WAR</button>
                        <button id="btn-surrender" class="game-btn action-btn" style="display:none; background:#757575;">SURRENDER</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;

            this.dealerCardEl = this.container.querySelector('#dealer-card');
            this.playerCardEl = this.container.querySelector('#player-card');
            this.statusEl = this.container.querySelector('#war-status');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnDeal = this.container.querySelector('#btn-deal');
            this.btnWar = this.container.querySelector('#btn-war');
            this.btnSurrender = this.container.querySelector('#btn-surrender');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.btnDeal.addEventListener('click', () => this.play());
            this.btnWar.addEventListener('click', () => this.resolveWar(true));
            this.btnSurrender.addEventListener('click', () => this.resolveWar(false));
        }

        createDeck() {
            const suits = ['♥', '♦', '♠', '♣'];
            const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            let deck = [];
            for (let s of suits) {
                for (let r of ranks) {
                    let val = parseInt(r);
                    if (r === 'J') val = 11;
                    if (r === 'Q') val = 12;
                    if (r === 'K') val = 13;
                    if (r === 'A') val = 14;
                    deck.push({ suit: s, rank: r, value: val });
                }
            }
            return deck;
        }

        drawCard() {
            if (!this.deck || this.deck.length < 10) this.deck = this.createDeck();
            const idx = Math.floor(Math.random() * this.deck.length);
            return this.deck.splice(idx, 1)[0];
        }

        renderCard(el, card) {
            const color = (card.suit === '♥' || card.suit === '♦') ? '#e74c3c' : '#ecf0f1';
            el.style.background = '#fff';
            el.style.border = '1px solid #999';
            el.innerHTML = `
                <div style="color:${color}; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; width:100%;">
                    <div style="font-size:1.5rem; font-weight:bold;">${card.rank}</div>
                    <div style="font-size:2rem;">${card.suit}</div>
                </div>
            `;
        }

        clearCard(el) {
            el.style.background = '#222';
            el.style.border = '2px dashed #444';
            el.innerHTML = '<span style="font-size:2rem; opacity:0.3;">?</span>';
        }

        async play() {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");

            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");
            
            this.currentBet = bet;
            this.btnDeal.disabled = true;
            this.statusEl.innerText = "";
            this.clearCard(this.dealerCardEl);
            this.clearCard(this.playerCardEl);

            // Animation delay
            await new Promise(r => setTimeout(r, 500));

            const playerCard = this.drawCard();
            this.renderCard(this.playerCardEl, playerCard);
            
            await new Promise(r => setTimeout(r, 500));
            
            const dealerCard = this.drawCard();
            this.renderCard(this.dealerCardEl, dealerCard);

            if (playerCard.value > dealerCard.value) {
                this.endGame(true, 1);
            } else if (playerCard.value < dealerCard.value) {
                this.endGame(false);
            } else {
                this.statusEl.innerText = "WAR!";
                this.btnDeal.style.display = 'none';
                this.btnWar.style.display = 'inline-block';
                this.btnSurrender.style.display = 'inline-block';
            }
        }

        async resolveWar(goWar) {
            this.btnWar.style.display = 'none';
            this.btnSurrender.style.display = 'none';

            if (!goWar) {
                // Surrender: lose half bet
                this.MK.updateBalance(this.currentBet * 0.5);
                this.logResult(`Surrendered. Refunded $${(this.currentBet * 0.5).toFixed(2)}`, 'neutral');
                this.btnDeal.style.display = 'inline-block';
                this.btnDeal.disabled = false;
                return;
            }

            // Go to War: Match bet
            if (!this.MK.updateBalance(-this.currentBet)) {
                alert("Insufficient funds for War! Auto-surrender.");
                this.resolveWar(false);
                return;
            }

            this.statusEl.innerText = "Burning cards...";
            await new Promise(r => setTimeout(r, 1000));

            // Burn 3 cards each (simulated)
            
            const playerCard = this.drawCard();
            this.renderCard(this.playerCardEl, playerCard);
            
            const dealerCard = this.drawCard();
            this.renderCard(this.dealerCardEl, dealerCard);

            if (playerCard.value >= dealerCard.value) { // Player wins or ties in war
                 // Win original bet (1x) + War bet (2x) = Profit 1 unit on original? 
                 // Standard Casino War: If player wins war, they win even money on raise, push on original.
                 // Actually usually: Original bet pushes, Raise bet pays 1:1.
                 // So total return = Original (returned) + Raise (returned) + Raise (win).
                 // Total payout = 3 * Original Bet units (since Raise = Original).
                 // If I deducted 1 unit first, then 1 unit for war. Total cost 2 units.
                 // Return 3 units = +1 unit profit.
                 const totalPayout = this.currentBet * 3; // Original + Raise + Profit on Raise
                 // Wait, if tie in war, standard rules say bonus. Simplifying: Win = Pay both.
                 this.MK.updateBalance(totalPayout);
                 this.logResult(`Won War! +$${(totalPayout - (this.currentBet * 2)).toFixed(2)}`, 'win');
            } else {
                this.logResult(`Lost War. -$${(this.currentBet * 2).toFixed(2)}`, 'loss');
            }

            this.btnDeal.style.display = 'inline-block';
            this.btnDeal.disabled = false;
            this.statusEl.innerText = "";
        }

        endGame(win, multiplier) {
            if (win) {
                const payout = this.currentBet * (1 + multiplier);
                this.MK.updateBalance(payout);
                this.logResult(`Won $${(this.currentBet * multiplier).toFixed(2)}`, 'win');
            } else {
                this.logResult(`Lost $${this.currentBet.toFixed(2)}`, 'loss');
            }
            this.btnDeal.disabled = false;
        }

        logResult(msg, type) {
            const div = document.createElement('div');
            div.className = `log-entry ${type}`;
            div.innerText = msg;
            this.log.prepend(div);
            if (this.log.children.length > 5) this.log.lastChild.remove();
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.WarGame = WarGame;
})();
