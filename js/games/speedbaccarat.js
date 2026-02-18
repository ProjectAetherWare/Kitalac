(function() {
    class SpeedBaccaratGame {
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
                    <h2><i class="fas fa-bolt"></i> Speed Baccarat</h2>
                    <p class="section-subtitle">Player vs Banker</p>
                    
                    <div class="game-visuals" style="display:flex; justify-content:space-around; margin: 20px 0;">
                        <div class="hand-box" style="text-align:center;">
                            <h3>PLAYER</h3>
                            <div id="sb-player-score" style="font-size:2rem; font-weight:bold; color:#3498db">0</div>
                            <div id="sb-player-cards" style="min-height:40px; font-size:1.5rem;"></div>
                        </div>
                        <div class="hand-box" style="text-align:center;">
                            <h3>BANKER</h3>
                            <div id="sb-banker-score" style="font-size:2rem; font-weight:bold; color:#e74c3c">0</div>
                            <div id="sb-banker-cards" style="min-height:40px; font-size:1.5rem;"></div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <input id="sb-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button class="game-btn sb-btn" data-type="player" style="background:#3498db">PLAYER (1:1)</button>
                            <button class="game-btn sb-btn" data-type="tie" style="background:#2ecc71">TIE (8:1)</button>
                            <button class="game-btn sb-btn" data-type="banker" style="background:#e74c3c">BANKER (0.95:1)</button>
                        </div>
                    </div>
                    <div id="sb-log" class="game-log">Place your bet.</div>
                </div>
            `;
        }

        bindEvents() {
            this.betInput = this.container.querySelector("#sb-bet");
            this.log = this.container.querySelector("#sb-log");
            this.pScoreEl = this.container.querySelector("#sb-player-score");
            this.bScoreEl = this.container.querySelector("#sb-banker-score");
            this.pCardsEl = this.container.querySelector("#sb-player-cards");
            this.bCardsEl = this.container.querySelector("#sb-banker-cards");

            this.container.querySelectorAll(".sb-btn").forEach(btn => {
                btn.addEventListener("click", (e) => this.play(e.target.dataset.type));
            });
        }

        play(betType) {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) return;
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.log.innerText = "Dealing...";
            
            // Simplified Baccarat Logic
            // 2 cards each initially
            const p1 = this.drawCard();
            const p2 = this.drawCard();
            const b1 = this.drawCard();
            const b2 = this.drawCard();

            let pHand = [p1, p2];
            let bHand = [b1, b2];

            // Calculate initial scores
            let pScore = this.calcScore(pHand);
            let bScore = this.calcScore(bHand);

            // Natural Win check (8 or 9)
            let finished = false;
            if (pScore >= 8 || bScore >= 8) {
                finished = true;
            }

            // Third card rules (Simplified implementation)
            if (!finished) {
                if (pScore <= 5) {
                    pHand.push(this.drawCard());
                    pScore = this.calcScore(pHand);
                }
                
                // Banker rules depend on player 3rd card, simplified here to standard house way roughly:
                if (bScore <= 5) {
                     bHand.push(this.drawCard());
                     bScore = this.calcScore(bHand);
                }
            }

            // Display
            this.pCardsEl.innerHTML = pHand.map(c => c.face).join(' ');
            this.bCardsEl.innerHTML = bHand.map(c => c.face).join(' ');
            this.pScoreEl.innerText = pScore;
            this.bScoreEl.innerText = bScore;

            // Determine Winner
            let result = 'tie';
            if (pScore > bScore) result = 'player';
            if (bScore > pScore) result = 'banker';

            // Payout
            let win = (betType === result);
            let payout = 0;
            
            if (win) {
                if (result === 'player') payout = bet * 2;
                if (result === 'tie') payout = bet * 9; // 8:1 pays 9 total
                if (result === 'banker') payout = bet * 1.95; // 5% comm
                
                this.MK.updateBalance(payout);
                this.log.innerHTML = `<span style="color:#2ecc71">WIN! ${result.toUpperCase()} wins. (+${payout.toFixed(2)})</span>`;
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">Lost. ${result.toUpperCase()} wins.</span>`;
            }
        }

        drawCard() {
            const val = Math.floor(Math.random() * 13) + 1;
            let score = val;
            let face = val;
            if (val > 9) score = 0; // 10, J, Q, K = 0
            if (val === 1) face = 'A';
            else if (val === 11) face = 'J';
            else if (val === 12) face = 'Q';
            else if (val === 13) face = 'K';
            
            // Random Suit
            const suits = ['♠', '♥', '♦', '♣'];
            const suit = suits[Math.floor(Math.random()*4)];
            
            return { score: score, face: `${face}${suit}` };
        }

        calcScore(hand) {
            let total = hand.reduce((acc, c) => acc + c.score, 0);
            return total % 10;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.SpeedBaccaratGame = SpeedBaccaratGame;
})();
