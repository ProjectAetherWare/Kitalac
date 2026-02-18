(function() {
    class BJSurrenderGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.deck = [];
            this.playerHand = [];
            this.dealerHand = [];
            this.stage = 'bet'; // bet, player, dealer, result
            this.bet = 0;
            
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel bj-game">
                    <div class="game-header">
                        <h2>Blackjack Surrender</h2>
                        <div class="balance-display">Balance: <span id="bj-balance">0.00</span></div>
                    </div>
                    <div class="game-visuals" style="padding:20px; text-align:center;">
                        <div class="dealer-area" style="min-height:100px; margin-bottom:20px;">
                            <div class="hand-label">Dealer <span id="dealer-score"></span></div>
                            <div id="dealer-cards" style="display:flex; justify-content:center; gap:10px;"></div>
                        </div>
                        <div class="player-area" style="min-height:100px;">
                            <div class="hand-label">Player <span id="player-score"></span></div>
                            <div id="player-cards" style="display:flex; justify-content:center; gap:10px;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group" id="bet-controls">
                            <label>Bet Amount</label>
                            <input type="number" id="bj-bet" value="10" min="1" class="game-input">
                            <button id="bj-deal" class="game-btn action-btn">Deal</button>
                        </div>
                        <div class="action-buttons" style="display:none; gap:10px; justify-content:center;">
                            <button id="bj-hit" class="game-btn secondary-btn">Hit</button>
                            <button id="bj-stand" class="game-btn secondary-btn">Stand</button>
                            <button id="bj-double" class="game-btn secondary-btn">Double</button>
                            <button id="bj-surrender" class="game-btn warning-btn">Surrender</button>
                        </div>
                    </div>
                    <div id="bj-log" class="game-log"></div>
                </div>
            `;
            
            this.elements = {
                balance: this.container.querySelector('#bj-balance'),
                dealerCards: this.container.querySelector('#dealer-cards'),
                playerCards: this.container.querySelector('#player-cards'),
                dealerScore: this.container.querySelector('#dealer-score'),
                playerScore: this.container.querySelector('#player-score'),
                betInput: this.container.querySelector('#bj-bet'),
                dealBtn: this.container.querySelector('#bj-deal'),
                hitBtn: this.container.querySelector('#bj-hit'),
                standBtn: this.container.querySelector('#bj-stand'),
                doubleBtn: this.container.querySelector('#bj-double'),
                surrenderBtn: this.container.querySelector('#bj-surrender'),
                betControls: this.container.querySelector('#bet-controls'),
                actionButtons: this.container.querySelector('.action-buttons'),
                log: this.container.querySelector('#bj-log')
            };

            this.updateBalanceDisplay();
        }

        bindEvents() {
            this.elements.dealBtn.addEventListener('click', () => this.deal());
            this.elements.hitBtn.addEventListener('click', () => this.hit());
            this.elements.standBtn.addEventListener('click', () => this.stand());
            this.elements.doubleBtn.addEventListener('click', () => this.double());
            this.elements.surrenderBtn.addEventListener('click', () => this.surrender());
        }
        
        createDeck() {
            const suits = ['♠', '♥', '♦', '♣'];
            const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
            let deck = [];
            for(let s of suits) {
                for(let r of ranks) {
                    let val = parseInt(r);
                    if(r === 'J' || r === 'Q' || r === 'K') val = 10;
                    if(r === 'A') val = 11;
                    deck.push({suit:s, rank:r, value: val});
                }
            }
            return deck.sort(() => Math.random() - 0.5);
        }
        
        getScore(hand) {
            let score = 0;
            let aces = 0;
            hand.forEach(c => {
                score += c.value;
                if(c.rank === 'A') aces++;
            });
            while(score > 21 && aces > 0) {
                score -= 10;
                aces--;
            }
            return score;
        }

        renderCard(card, hidden=false) {
            const div = document.createElement('div');
            div.className = 'bj-card';
            div.style.width = '60px';
            div.style.height = '90px';
            div.style.background = '#fff';
            div.style.color = (card && (card.suit === '♥' || card.suit === '♦')) ? 'red' : 'black';
            div.style.borderRadius = '6px';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.style.fontSize = '1.5em';
            div.style.border = '1px solid #ccc';
            
            if(hidden) {
                div.style.background = '#666'; // Back of card
                div.innerText = '';
            } else {
                div.innerText = `${card.rank}${card.suit}`;
            }
            return div;
        }

        updateTable(hideDealer=true) {
            this.elements.dealerCards.innerHTML = '';
            this.elements.playerCards.innerHTML = '';
            
            this.dealerHand.forEach((c, i) => {
                const hidden = hideDealer && i === 1;
                this.elements.dealerCards.appendChild(this.renderCard(c, hidden));
            });
            
            this.playerHand.forEach(c => {
                this.elements.playerCards.appendChild(this.renderCard(c));
            });
            
            this.elements.playerScore.innerText = this.getScore(this.playerHand);
            if(!hideDealer) {
                this.elements.dealerScore.innerText = this.getScore(this.dealerHand);
            } else {
                this.elements.dealerScore.innerText = '?';
            }
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

        async deal() {
            const bet = parseFloat(this.elements.betInput.value);
            const bal = this.getUserBalance();
            if(isNaN(bet) || bet <= 0) return alert('Invalid bet');
            if(bal < bet) return alert('Insufficient funds');
            
            this.updateBalance(-bet);
            this.bet = bet;
            this.deck = this.createDeck();
            this.playerHand = [this.deck.pop(), this.deck.pop()];
            this.dealerHand = [this.deck.pop(), this.deck.pop()];
            
            this.stage = 'player';
            this.elements.betControls.style.display = 'none';
            this.elements.actionButtons.style.display = 'flex';
            this.elements.surrenderBtn.disabled = false;
            this.elements.doubleBtn.disabled = false;
            
            this.updateTable(true);
            
            const pScore = this.getScore(this.playerHand);
            if (pScore === 21) {
                // Blackjack! Check dealer
                this.stand(); // Auto stand on BJ
            }
        }

        hit() {
            this.elements.surrenderBtn.disabled = true; // Can't surrender after hit
            this.elements.doubleBtn.disabled = true;
            this.playerHand.push(this.deck.pop());
            this.updateTable(true);
            
            const score = this.getScore(this.playerHand);
            if(score > 21) {
                this.endRound('bust');
            }
        }

        double() {
            const bal = this.getUserBalance();
            if(bal < this.bet) return alert('Insufficient funds to double');
            
            this.updateBalance(-this.bet);
            this.bet *= 2;
            
            this.playerHand.push(this.deck.pop());
            this.updateTable(true);
            
            const score = this.getScore(this.playerHand);
            if(score > 21) {
                this.endRound('bust');
            } else {
                this.stand();
            }
        }

        surrender() {
            const refund = this.bet * 0.5;
            this.updateBalance(refund);
            this.log(`Surrendered. Refunded ${refund.toFixed(2)}`, 'neutral');
            this.resetGame();
        }

        async stand() {
            this.elements.actionButtons.style.display = 'none';
            this.updateTable(false); // Show dealer card
            
            let dScore = this.getScore(this.dealerHand);
            while(dScore < 17) {
                await new Promise(r => setTimeout(r, 500));
                this.dealerHand.push(this.deck.pop());
                this.updateTable(false);
                dScore = this.getScore(this.dealerHand);
            }
            
            const pScore = this.getScore(this.playerHand);
            
            if (dScore > 21) {
                this.endRound('dealer_bust');
            } else if (pScore > dScore) {
                this.endRound('win');
            } else if (pScore === dScore) {
                this.endRound('push');
            } else {
                this.endRound('loss');
            }
        }

        endRound(result) {
            const pScore = this.getScore(this.playerHand);
            const dScore = this.getScore(this.dealerHand); // Might be hidden if bust
            
            let payout = 0;
            let msg = '';
            
            if (result === 'bust') {
                msg = `Bust! You lose ${this.bet}`;
            } else if (result === 'dealer_bust') {
                payout = this.bet * 2;
                msg = `Dealer Bust! You win ${payout}`;
            } else if (result === 'win') {
                // Check if BJ
                if (pScore === 21 && this.playerHand.length === 2) {
                     payout = this.bet * 2.5; // 3:2 payout usually
                     msg = `Blackjack! You win ${payout}`;
                } else {
                     payout = this.bet * 2;
                     msg = `You Win! ${pScore} vs ${dScore}`;
                }
            } else if (result === 'push') {
                payout = this.bet;
                msg = `Push. Bets returned.`;
            } else {
                msg = `Dealer Wins. ${dScore} vs ${pScore}`;
            }
            
            if (payout > 0) {
                this.updateBalance(payout);
                this.log(msg, 'win');
            } else {
                this.log(msg, 'loss');
            }
            
            setTimeout(() => this.resetGame(), 1000);
        }

        resetGame() {
            this.elements.betControls.style.display = 'flex';
            this.elements.actionButtons.style.display = 'none';
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.BJSurrenderGame = BJSurrenderGame;
})();
