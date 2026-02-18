(function() {
    class AndarBaharGame {
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
                    <h2><i class="fas fa-heart"></i> Andar Bahar</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px; min-height:250px;">
                        <div style="text-align:center;">
                            <div style="margin-bottom:5px; font-weight:bold; color:#ffd700;">JOKER</div>
                            <div id="joker-card" class="card-slot"></div>
                        </div>
                        <div style="display:flex; gap:40px; width:100%; justify-content:center;">
                            <div style="text-align:center;">
                                <div style="margin-bottom:5px; font-weight:bold;">ANDAR (A)</div>
                                <div id="andar-pile" class="card-slot"></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="margin-bottom:5px; font-weight:bold;">BAHAR (B)</div>
                                <div id="bahar-pile" class="card-slot"></div>
                            </div>
                        </div>
                        <div id="status-msg" style="height:24px; font-weight:bold;"></div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button id="btn-andar" class="game-btn bet-btn" style="background:#e91e63;">BET ANDAR (1.9x)</button>
                            <button id="btn-bahar" class="game-btn bet-btn" style="background:#2196f3;">BET BAHAR (2.0x)</button>
                        </div>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
                <style>
                    .card-slot {
                        width: 70px; height: 100px;
                        background: #222; border: 2px dashed #444; border-radius: 6px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 1.5rem; color: #555;
                        position: relative;
                    }
                    .bet-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                </style>
            `;

            this.jokerEl = this.container.querySelector('#joker-card');
            this.andarEl = this.container.querySelector('#andar-pile');
            this.baharEl = this.container.querySelector('#bahar-pile');
            this.statusEl = this.container.querySelector('#status-msg');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnAndar = this.container.querySelector('#btn-andar');
            this.btnBahar = this.container.querySelector('#btn-bahar');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.btnAndar.addEventListener('click', () => this.play('andar'));
            this.btnBahar.addEventListener('click', () => this.play('bahar'));
        }

        createDeck() {
            const suits = ['♥', '♦', '♠', '♣'];
            const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            let deck = [];
            for (let s of suits) {
                for (let r of ranks) {
                    deck.push({ suit: s, rank: r });
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
                    <div style="font-size:1.2rem; font-weight:bold;">${card.rank}</div>
                    <div style="font-size:1.5rem;">${card.suit}</div>
                </div>
            `;
        }

        resetCard(el) {
            el.style.background = '#222';
            el.style.border = '2px dashed #444';
            el.innerHTML = '';
        }

        async play(choice) {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");

            this.btnAndar.disabled = true;
            this.btnBahar.disabled = true;
            this.statusEl.innerText = "Dealing Joker...";
            this.resetCard(this.andarEl);
            this.resetCard(this.baharEl);

            // Deal Joker
            const joker = this.drawCard();
            this.renderCard(this.jokerEl, joker);
            
            await new Promise(r => setTimeout(r, 800));

            // Determine winner
            let winner = null;
            let currentPile = 'andar'; // Andar gets first card usually
            
            // Loop dealing
            while (!winner) {
                const card = this.drawCard();
                
                if (currentPile === 'andar') {
                    this.renderCard(this.andarEl, card);
                } else {
                    this.renderCard(this.baharEl, card);
                }
                
                await new Promise(r => setTimeout(r, 600));

                if (card.rank === joker.rank) {
                    winner = currentPile;
                } else {
                    currentPile = currentPile === 'andar' ? 'bahar' : 'andar';
                }
            }

            this.statusEl.innerText = `Winner: ${winner.toUpperCase()}!`;
            
            // Payouts
            // Andar usually 0.9:1 (1.9x), Bahar 1:1 (2.0x) because Andar goes first so has slight advantage?
            // Or usually Andar pays 0.9:1 if win on 1st card, else 50/50.
            // Simplified: Andar 1.9x, Bahar 2.0x (Assuming Bahar is harder? No, Andar is more likely cause it starts).
            // Let's use standard: Andar 1.9, Bahar 2.0.
            
            let payout = 0;
            if (choice === winner) {
                const mult = choice === 'andar' ? 1.9 : 2.0;
                payout = bet * mult;
                this.MK.updateBalance(payout);
                this.logResult(`Won on ${choice.toUpperCase()}! +$${(payout - bet).toFixed(2)}`, 'win');
                this.statusEl.style.color = 'var(--accent-success)';
            } else {
                this.logResult(`Lost on ${choice.toUpperCase()}. -$${bet.toFixed(2)}`, 'loss');
                this.statusEl.style.color = 'var(--accent-danger)';
            }

            this.btnAndar.disabled = false;
            this.btnBahar.disabled = false;
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
    window.MoonKat.AndarBaharGame = AndarBaharGame;
})();
