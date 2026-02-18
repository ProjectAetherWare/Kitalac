(function() {
    class CardMatchGame {
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
                    <h2><i class="fas fa-question-circle"></i> Find the Joker</h2>
                    <p class="section-subtitle">Select the Joker card to win.</p>
                    
                    <div class="game-visuals" style="display: flex; gap: 20px; justify-content: center; min-height: 150px; perspective: 600px;">
                        <div class="card-option" data-idx="0" style="width: 80px; height: 120px; background: #34495e; border: 2px solid #fff; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 2rem;">?</div>
                        <div class="card-option" data-idx="1" style="width: 80px; height: 120px; background: #34495e; border: 2px solid #fff; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 2rem;">?</div>
                        <div class="card-option" data-idx="2" style="width: 80px; height: 120px; background: #34495e; border: 2px solid #fff; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 2rem;">?</div>
                    </div>

                    <div class="game-controls">
                        <input id="cm-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                    </div>
                    <div id="cm-log" class="game-log">Click a card to bet!</div>
                </div>
            `;
        }

        bindEvents() {
            this.betInput = this.container.querySelector("#cm-bet");
            this.log = this.container.querySelector("#cm-log");
            this.cards = this.container.querySelectorAll(".card-option");

            this.cards.forEach(card => {
                card.addEventListener("click", (e) => this.play(e.target.dataset.idx));
            });
        }

        play(choiceIdx) {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) {
                 this.log.innerText = "Invalid Bet";
                 return;
            }
            if (this.playing) return;
            
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playing = true;
            this.log.innerText = "Revealing...";

            // Logic: 1 winner out of 3
            const winnerIdx = Math.floor(Math.random() * 3);
            
            // Animate reveal
            this.cards.forEach((card, idx) => {
                card.style.transition = "transform 0.5s";
                card.style.transform = "rotateY(180deg)";
                
                setTimeout(() => {
                    // Back of card logic
                    // In a real 3d flip we'd swap content half way, simplified here:
                    card.style.background = "#ecf0f1";
                    card.style.color = "#2c3e50";
                    if (idx == winnerIdx) {
                        card.innerHTML = '<i class="fas fa-hat-wizard" style="color: purple;"></i>'; // Joker/Wizard
                        card.style.borderColor = "gold";
                    } else {
                        card.innerHTML = "X";
                    }
                }, 200);
            });

            setTimeout(() => {
                this.resolve(bet, parseInt(choiceIdx), winnerIdx);
            }, 1000);
        }

        resolve(bet, choiceIdx, winnerIdx) {
            const win = choiceIdx === winnerIdx;
            const payout = win ? bet * 2.9 : 0; // House edge
            
            if (win) {
                this.MK.updateBalance(payout);
                this.log.innerHTML = `<span style="color:#2ecc71">FOUND IT! Won ${payout.toFixed(2)}</span>`;
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">Wrong card.</span>`;
            }

            setTimeout(() => {
                // Reset
                this.cards.forEach(card => {
                    card.style.transform = "rotateY(0deg)";
                    card.style.background = "#34495e";
                    card.style.color = "#fff";
                    card.style.borderColor = "#fff";
                    card.innerHTML = "?";
                });
                this.playing = false;
            }, 2000);
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.CardMatchGame = CardMatchGame;
})();
