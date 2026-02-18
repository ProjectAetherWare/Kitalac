(function() {
    class TeenPattiGame {
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
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-cards"></i> Teen Patti</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px; min-height:250px;">
                        <div id="dealer-area" style="text-align:center;">
                            <div style="margin-bottom:5px; font-weight:bold; color:#aaa;">DEALER</div>
                            <div class="hand-display" id="dealer-hand" style="display:flex; gap:10px;">
                                <div class="card-slot back"></div>
                                <div class="card-slot back"></div>
                                <div class="card-slot back"></div>
                            </div>
                            <div id="dealer-status" style="height:20px; font-size:0.9rem; color:#aaa;"></div>
                        </div>
                        <div id="player-area" style="text-align:center;">
                            <div style="margin-bottom:5px; font-weight:bold; color:#aaa;">YOU</div>
                            <div class="hand-display" id="player-hand" style="display:flex; gap:10px;">
                                <div class="card-slot empty"></div>
                                <div class="card-slot empty"></div>
                                <div class="card-slot empty"></div>
                            </div>
                            <div id="player-status" style="height:20px; font-size:0.9rem; color:#ffd700;"></div>
                        </div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <button id="btn-deal" class="game-btn action-btn">DEAL</button>
                        <button id="btn-play" class="game-btn action-btn" style="display:none; background:#4caf50;">PLAY (x1)</button>
                        <button id="btn-fold" class="game-btn action-btn" style="display:none; background:#f44336;">FOLD</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
                <style>
                    .card-slot {
                        width: 60px; height: 90px;
                        background: #fff; border: 1px solid #999; border-radius: 6px;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                    }
                    .card-slot.back {
                        background: #222; border: 2px dashed #444;
                    }
                    .card-slot.empty {
                        background: #333; border: 1px dashed #555;
                    }
                </style>
            `;

            this.dealerHandEl = this.container.querySelector('#dealer-hand');
            this.playerHandEl = this.container.querySelector('#player-hand');
            this.dealerStatus = this.container.querySelector('#dealer-status');
            this.playerStatus = this.container.querySelector('#player-status');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnDeal = this.container.querySelector('#btn-deal');
            this.btnPlay = this.container.querySelector('#btn-play');
            this.btnFold = this.container.querySelector('#btn-fold');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.btnDeal.addEventListener('click', () => this.startRound());
            this.btnPlay.addEventListener('click', () => this.resolveGame(true));
            this.btnFold.addEventListener('click', () => this.resolveGame(false));
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

        renderHand(container, hand, hide = false) {
            container.innerHTML = '';
            hand.forEach(card => {
                const div = document.createElement('div');
                div.className = 'card-slot';
                if (hide) {
                    div.className += ' back';
                } else {
                    const color = (card.suit === '♥' || card.suit === '♦') ? '#e74c3c' : '#333';
                    div.innerHTML = `<div style="color:${color}; font-weight:bold; font-size:1.2rem;">${card.rank}</div><div style="color:${color}; font-size:1.5rem;">${card.suit}</div>`;
                }
                container.appendChild(div);
            });
        }

        getHandRank(hand) {
            // Sort by value desc
            hand.sort((a, b) => b.value - a.value);
            const v = hand.map(c => c.value);
            const s = hand.map(c => c.suit);
            
            const isFlush = s[0] === s[1] && s[1] === s[2];
            const isStraight = (v[0] - v[1] === 1 && v[1] - v[2] === 1) || (v[0] === 14 && v[1] === 3 && v[2] === 2); // A-2-3
            
            // 1. Trail (Set)
            if (v[0] === v[1] && v[1] === v[2]) return { type: 6, name: 'Trail', val: v[0] };
            
            // 2. Pure Sequence (Straight Flush)
            if (isFlush && isStraight) return { type: 5, name: 'Pure Sequence', val: v[0] };
            
            // 3. Sequence (Straight)
            if (isStraight) return { type: 4, name: 'Sequence', val: v[0] };
            
            // 4. Color (Flush)
            if (isFlush) return { type: 3, name: 'Color', val: v[0] }; // Tie break needs full hand comparison
            
            // 5. Pair
            if (v[0] === v[1]) return { type: 2, name: 'Pair', val: v[0], kicker: v[2] };
            if (v[1] === v[2]) return { type: 2, name: 'Pair', val: v[1], kicker: v[0] };
            
            // 6. High Card
            return { type: 1, name: 'High Card', val: v[0], next: v[1], last: v[2] };
        }

        compareHands(h1, h2) {
            const r1 = this.getHandRank(h1);
            const r2 = this.getHandRank(h2);
            
            if (r1.type > r2.type) return 1;
            if (r1.type < r2.type) return -1;
            
            // Same type
            if (r1.val > r2.val) return 1;
            if (r1.val < r2.val) return -1;
            
            // Tie breaks
            if (r1.type === 2) { // Pair
                if (r1.kicker > r2.kicker) return 1;
                if (r1.kicker < r2.kicker) return -1;
            }
            if (r1.type === 1 || r1.type === 3) { // High or Flush
                if (r1.next > r2.next) return 1;
                if (r1.next < r2.next) return -1;
                if (r1.last > r2.last) return 1;
                if (r1.last < r2.last) return -1;
            }
            
            return 0; // Push
        }

        async startRound() {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");
            
            this.currentBet = bet;
            this.btnDeal.style.display = 'none';
            this.dealerStatus.innerText = "";
            this.playerStatus.innerText = "";
            
            this.deck = this.createDeck();
            this.playerHand = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
            this.dealerHand = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
            
            this.renderHand(this.playerHandEl, this.playerHand);
            this.renderHand(this.dealerHandEl, this.dealerHand, true);
            
            const pRank = this.getHandRank(this.playerHand);
            this.playerStatus.innerText = pRank.name;
            
            this.btnPlay.style.display = 'inline-block';
            this.btnFold.style.display = 'inline-block';
        }

        async resolveGame(play) {
            this.btnPlay.style.display = 'none';
            this.btnFold.style.display = 'none';
            
            if (!play) {
                // Fold - lose ante
                this.logResult(`Folded. -$${this.currentBet.toFixed(2)}`, 'loss');
                this.btnDeal.style.display = 'inline-block';
                return;
            }
            
            // Play - Bet another 1x
            if (!this.MK.updateBalance(-this.currentBet)) {
                alert("Insufficient funds to play. Folded.");
                this.btnDeal.style.display = 'inline-block';
                return;
            }
            
            // Reveal Dealer
            this.renderHand(this.dealerHandEl, this.dealerHand);
            const dRank = this.getHandRank(this.dealerHand);
            this.dealerStatus.innerText = dRank.name;
            
            // Dealer Qualify? usually Q high or better.
            // Simplified: No qualify rule for now, just compare.
            
            const result = this.compareHands(this.playerHand, this.dealerHand);
            const totalBet = this.currentBet * 2;
            
            if (result === 1) {
                // Player Wins
                const win = totalBet * 2; // 1:1 on both Ante and Play
                this.MK.updateBalance(win);
                this.logResult(`Won with ${this.playerStatus.innerText}! +$${(win - totalBet).toFixed(2)}`, 'win');
                this.playerStatus.style.color = 'var(--accent-success)';
            } else if (result === -1) {
                this.logResult(`Lost to ${dRank.name}. -$${totalBet.toFixed(2)}`, 'loss');
                this.playerStatus.style.color = 'var(--accent-danger)';
            } else {
                this.MK.updateBalance(totalBet);
                this.logResult("Push. Refund.", 'neutral');
            }
            
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
    window.MoonKat.TeenPattiGame = TeenPattiGame;
})();
