(function() {
    class VideoPokerGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.deck = [];
            this.hand = [];
            this.held = [false, false, false, false, false];
            this.stage = 'deal'; // deal or draw
            this.bet = 0;
            
            this.payouts = {
                'ROYAL_FLUSH': 800,
                'STRAIGHT_FLUSH': 50,
                'FOUR_OF_A_KIND': 25,
                'FULL_HOUSE': 9,
                'FLUSH': 6,
                'STRAIGHT': 4,
                'THREE_OF_A_KIND': 3,
                'TWO_PAIR': 2,
                'JACKS_OR_BETTER': 1
            };
            
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel vp-game">
                    <div class="game-header">
                        <h2>Video Poker</h2>
                        <div class="balance-display">Balance: <span id="vp-balance">0.00</span></div>
                    </div>
                    <div class="game-visuals" style="padding:20px; text-align:center;">
                        <div class="cards-container" style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">
                            ${[0,1,2,3,4].map(i => `
                                <div class="card-slot" id="card-${i}" style="width:80px; height:120px; background:#fff; color:#000; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:2em; position:relative; cursor:pointer;">
                                    <span class="card-val">?</span>
                                    <div class="hold-indicator" style="position:absolute; bottom:5px; font-size:0.4em; color:red; display:none;">HELD</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="payout-table" style="font-size:0.7em; color:#888; display:grid; grid-template-columns:1fr 1fr;">
                            <div>Royal Flush: 800x</div>
                            <div>Straight Flush: 50x</div>
                            <div>4 of a Kind: 25x</div>
                            <div>Full House: 9x</div>
                            <div>Flush: 6x</div>
                            <div>Straight: 4x</div>
                            <div>3 of a Kind: 3x</div>
                            <div>2 Pair: 2x</div>
                            <div>Jacks+: 1x</div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="vp-bet" value="10" min="1" class="game-input">
                        </div>
                        <button id="vp-action" class="game-btn action-btn">Deal</button>
                    </div>
                    <div id="vp-log" class="game-log"></div>
                </div>
            `;
            
            this.elements = {
                balance: this.container.querySelector('#vp-balance'),
                cards: [0,1,2,3,4].map(i => this.container.querySelector(`#card-${i}`)),
                betInput: this.container.querySelector('#vp-bet'),
                actionBtn: this.container.querySelector('#vp-action'),
                log: this.container.querySelector('#vp-log')
            };

            this.updateBalanceDisplay();
        }

        bindEvents() {
            this.elements.cards.forEach((card, idx) => {
                card.addEventListener('click', () => this.toggleHold(idx));
            });
            
            this.elements.actionBtn.addEventListener('click', () => {
                if(this.stage === 'deal') this.deal();
                else this.draw();
            });
        }
        
        toggleHold(idx) {
            if(this.stage !== 'draw') return;
            this.held[idx] = !this.held[idx];
            const indicator = this.elements.cards[idx].querySelector('.hold-indicator');
            indicator.style.display = this.held[idx] ? 'block' : 'none';
            this.elements.cards[idx].style.border = this.held[idx] ? '2px solid gold' : 'none';
        }
        
        getUserBalance() {
             if (typeof window.MK === 'undefined') return 0;
            return this.currency === 'cash' 
                ? (window.MK.state?.user?.balance || 0)
                : (window.MK.state?.user?.premiumBalance || 0);
        }

        updateBalanceDisplay() {
             this.elements.balance.innerText = this.getUserBalance().toFixed(2);
        }
        
        updateBalance(amount) {
            if (typeof window.MK !== 'undefined') {
                if (this.currency === 'cash' && window.MK.updateBalance) {
                     window.MK.updateBalance(amount);
                } else if (this.currency === 'gems' && window.MK.state && window.MK.state.user) {
                     window.MK.state.user.premiumBalance += amount;
                     if (window.MK.refreshUI) window.MK.refreshUI();
                }
            }
            this.updateBalanceDisplay();
        }
        
        log(msg, type='neutral') {
             const div = document.createElement('div');
            div.innerText = msg;
            div.className = `log-entry ${type}`;
             if (this.elements.log.firstChild) {
                this.elements.log.insertBefore(div, this.elements.log.firstChild);
            } else {
                this.elements.log.appendChild(div);
            }
        }

        createDeck() {
            const suits = ['♠', '♥', '♦', '♣'];
            const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
            let deck = [];
            for(let s of suits) {
                for(let r of ranks) {
                    deck.push({suit:s, rank:r, value: ranks.indexOf(r)});
                }
            }
            return deck.sort(() => Math.random() - 0.5);
        }

        async deal() {
            const bet = parseFloat(this.elements.betInput.value);
            const bal = this.getUserBalance();
            if(isNaN(bet) || bet <= 0) return alert('Invalid bet');
            if(bal < bet) return alert('Insufficient funds');
            
            this.updateBalance(-bet);
            this.bet = bet;
            this.stage = 'draw';
            this.deck = this.createDeck();
            this.hand = [];
            this.held = [false, false, false, false, false];
            
            // Draw 5 cards
            for(let i=0; i<5; i++) {
                this.hand.push(this.deck.pop());
            }
            
            this.updateCardsUI();
            this.elements.actionBtn.innerText = 'Draw';
            this.elements.betInput.disabled = true;
            this.log(`Dealt hand. Select cards to hold.`, 'neutral');
        }

        async draw() {
            // Replace unheld cards
            for(let i=0; i<5; i++) {
                if(!this.held[i]) {
                    this.hand[i] = this.deck.pop();
                }
            }
            
            this.updateCardsUI();
            this.evaluateHand();
            
            this.stage = 'deal';
            this.elements.actionBtn.innerText = 'Deal';
            this.elements.betInput.disabled = false;
        }

        updateCardsUI() {
            this.hand.forEach((card, i) => {
                const el = this.elements.cards[i];
                const val = el.querySelector('.card-val');
                val.innerText = `${card.rank}${card.suit}`;
                el.style.color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
                
                // Reset hold if not held (visual only)
                const indicator = el.querySelector('.hold-indicator');
                indicator.style.display = this.held[i] ? 'block' : 'none';
                el.style.border = this.held[i] ? '2px solid gold' : 'none';
            });
        }

        evaluateHand() {
            // Check hand rank
            const ranks = this.hand.map(c => c.value).sort((a,b) => a-b);
            const suits = this.hand.map(c => c.suit);
            
            const isFlush = suits.every(s => s === suits[0]);
            let isStraight = true;
            for(let i=0; i<4; i++) {
                if(ranks[i+1] !== ranks[i]+1) {
                    // Check for Wheel (A,2,3,4,5) -> A is 12, 2 is 0.
                    // If ranks are 0,1,2,3,12 (2,3,4,5,A)
                    if (i===3 && ranks[3]===3 && ranks[4]===12) continue; // 5 and A
                    isStraight = false; 
                    break;
                }
            }
            // Special check for A-5 straight (Wheel)
            if(!isStraight && ranks.join(',') === '0,1,2,3,12') isStraight = true;

            const counts = {};
            ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
            const countValues = Object.values(counts).sort((a,b) => b-a); // 4,1 or 3,2 etc
            
            let rank = 'HIGH_CARD';
            let mult = 0;
            
            if (isFlush && isStraight) {
                if (ranks[0] === 8) rank = 'ROYAL_FLUSH'; // 10,J,Q,K,A -> 8,9,10,11,12
                else rank = 'STRAIGHT_FLUSH';
            } else if (countValues[0] === 4) {
                rank = 'FOUR_OF_A_KIND';
            } else if (countValues[0] === 3 && countValues[1] === 2) {
                rank = 'FULL_HOUSE';
            } else if (isFlush) {
                rank = 'FLUSH';
            } else if (isStraight) {
                rank = 'STRAIGHT';
            } else if (countValues[0] === 3) {
                rank = 'THREE_OF_A_KIND';
            } else if (countValues[0] === 2 && countValues[1] === 2) {
                rank = 'TWO_PAIR';
            } else if (countValues[0] === 2) {
                // Check Jacks or Better (J=9, Q=10, K=11, A=12)
                const pairRank = parseInt(Object.keys(counts).find(key => counts[key] === 2));
                if (pairRank >= 9) rank = 'JACKS_OR_BETTER';
            }
            
            if (this.payouts[rank]) {
                mult = this.payouts[rank];
                const payout = this.bet * mult;
                this.updateBalance(payout);
                this.log(`Win! ${rank.replace(/_/g, ' ')} (${mult}x) +${payout.toFixed(2)}`, 'win');
            } else {
                this.log(`Loss. ${rank.replace(/_/g, ' ')}`, 'loss');
            }
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.VideoPokerGame = VideoPokerGame;
})();
