(function() {
    class RedDogGame {
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
                    <h2><i class="fas fa-dog"></i> Red Dog</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                        <div class="cards-container" style="display:flex; gap:10px; justify-content:center; padding:20px;">
                            <div id="card-1" class="card-slot"></div>
                            <div id="card-2" class="card-slot"></div>
                            <div id="card-3" class="card-slot"></div>
                        </div>
                        <div id="spread-info" style="font-size:1.2rem; font-weight:bold; height:30px;"></div>
                        <div id="payout-info" style="color:#aaa; font-size:0.9rem;"></div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <button id="btn-deal" class="game-btn action-btn">DEAL</button>
                        <button id="btn-raise" class="game-btn action-btn" style="display:none; background:#ff9800;">RAISE</button>
                        <button id="btn-call" class="game-btn action-btn" style="display:none; background:#4caf50;">CALL</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
                <style>
                    .card-slot {
                        width: 80px; height: 120px;
                        background: #222; border: 2px dashed #444; border-radius: 8px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 2rem; color: #555;
                    }
                </style>
            `;

            this.card1El = this.container.querySelector('#card-1');
            this.card2El = this.container.querySelector('#card-2');
            this.card3El = this.container.querySelector('#card-3');
            this.spreadInfo = this.container.querySelector('#spread-info');
            this.payoutInfo = this.container.querySelector('#payout-info');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnDeal = this.container.querySelector('#btn-deal');
            this.btnRaise = this.container.querySelector('#btn-raise');
            this.btnCall = this.container.querySelector('#btn-call');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.btnDeal.addEventListener('click', () => this.startRound());
            this.btnRaise.addEventListener('click', () => this.playTurn(true));
            this.btnCall.addEventListener('click', () => this.playTurn(false));
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
            return deck.sort(() => Math.random() - 0.5);
        }

        drawCard() {
            if (!this.deck || this.deck.length < 10) this.deck = this.createDeck();
            return this.deck.pop();
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

        resetCard(el) {
            el.style.background = '#222';
            el.style.border = '2px dashed #444';
            el.innerHTML = '';
        }

        getPayout(spread) {
            if (spread === 1) return 5;
            if (spread === 2) return 4;
            if (spread === 3) return 2;
            return 1;
        }

        async startRound() {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");
            
            this.currentBet = bet;
            this.btnDeal.style.display = 'none';
            this.resetCard(this.card1El);
            this.resetCard(this.card2El);
            this.resetCard(this.card3El);
            this.spreadInfo.innerText = "";
            this.payoutInfo.innerText = "";

            this.card1 = this.drawCard();
            this.renderCard(this.card1El, this.card1);
            await new Promise(r => setTimeout(r, 300));
            
            this.card2 = this.drawCard();
            this.renderCard(this.card2El, this.card2);

            // Calculate Spread
            // If cards are equal -> Consecutive?
            // Values: 2=2, A=14.
            // Spread = absolute diff - 1.
            // Example: 2 and 4. Diff is 2. Spread is 1 (only 3 fits).
            // Example: 2 and 3. Diff is 1. Spread is 0 (Consecutive).
            // Example: 2 and 2. Pair.
            
            const v1 = this.card1.value;
            const v2 = this.card2.value;
            
            if (v1 === v2) {
                // Pair - auto deal 3rd
                this.spreadInfo.innerText = "Pair! Dealing 3rd card...";
                await new Promise(r => setTimeout(r, 1000));
                this.card3 = this.drawCard();
                this.renderCard(this.card3El, this.card3);
                
                if (this.card3.value === v1) {
                    // Red Dog! 11:1
                    const win = this.currentBet * 12; 
                    this.MK.updateBalance(win);
                    this.logResult(`RED DOG! 3 of a kind! +$${win.toFixed(2)}`, 'win');
                } else {
                    // Push
                    this.MK.updateBalance(this.currentBet);
                    this.logResult("Push (Pair not matched)", 'neutral');
                }
                this.endRound();
                return;
            }
            
            const diff = Math.abs(v1 - v2);
            if (diff === 1) {
                // Consecutive - Push
                this.spreadInfo.innerText = "Consecutive! Push.";
                this.MK.updateBalance(this.currentBet);
                this.logResult("Push (Consecutive)", 'neutral');
                this.endRound();
                return;
            }
            
            this.spread = diff - 1;
            this.payoutOdds = this.getPayout(this.spread);
            
            this.spreadInfo.innerText = `Spread: ${this.spread}`;
            this.payoutInfo.innerText = `Pays ${this.payoutOdds}:1`;
            
            this.btnRaise.style.display = 'inline-block';
            this.btnCall.style.display = 'inline-block';
        }

        async playTurn(raise) {
            this.btnRaise.style.display = 'none';
            this.btnCall.style.display = 'none';
            
            let totalBet = this.currentBet;
            if (raise) {
                if (!this.MK.updateBalance(-this.currentBet)) {
                    alert("Insufficient funds to raise");
                    this.playTurn(false); // Force call
                    return;
                }
                totalBet *= 2;
                this.logResult("Raised bet!", 'neutral');
            }
            
            this.card3 = this.drawCard();
            this.renderCard(this.card3El, this.card3);
            
            const v3 = this.card3.value;
            const min = Math.min(this.card1.value, this.card2.value);
            const max = Math.max(this.card1.value, this.card2.value);
            
            if (v3 > min && v3 < max) {
                // Win
                const profit = totalBet * this.payoutOdds;
                const totalReturn = totalBet + profit;
                this.MK.updateBalance(totalReturn);
                this.logResult(`Win! ${v3} is between ${min} and ${max}. +$${profit.toFixed(2)}`, 'win');
            } else {
                // Loss
                this.logResult(`Loss. ${v3} not between. -$${totalBet.toFixed(2)}`, 'loss');
            }
            
            this.endRound();
        }

        endRound() {
            this.btnDeal.style.display = 'inline-block';
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
    window.MoonKat.RedDogGame = RedDogGame;
})();
