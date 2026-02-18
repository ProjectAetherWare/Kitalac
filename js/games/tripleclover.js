(function() {
    class TripleCloverGame {
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
                <div class="game-panel triple-clover-theme">
                    <h2><i class="fas fa-leaf"></i> Triple Clover</h2>
                    <p class="section-subtitle">Find the Lucky Clovers!</p>
                    
                    <div class="game-visuals" style="background: #0f380f; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #2ecc71;">
                        <div class="slots-container" style="display: flex; gap: 10px; justify-content: center; font-size: 3.5rem;">
                            <div class="reel" id="tc-reel-1" style="background:#000; width:80px; height:100px; display:flex; align-items:center; justify-content:center; border:2px solid #4caf50; border-radius:5px;">🍀</div>
                            <div class="reel" id="tc-reel-2" style="background:#000; width:80px; height:100px; display:flex; align-items:center; justify-content:center; border:2px solid #4caf50; border-radius:5px;">🍀</div>
                            <div class="reel" id="tc-reel-3" style="background:#000; width:80px; height:100px; display:flex; align-items:center; justify-content:center; border:2px solid #4caf50; border-radius:5px;">🍀</div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <input id="tc-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                        <button id="tc-play-btn" class="game-btn" style="background: #27ae60;">SPIN</button>
                    </div>
                    <div id="tc-log" class="game-log">May the luck of the Irish be with you!</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#tc-play-btn");
            this.betInput = this.container.querySelector("#tc-bet");
            this.log = this.container.querySelector("#tc-log");
            this.reels = [
                this.container.querySelector("#tc-reel-1"),
                this.container.querySelector("#tc-reel-2"),
                this.container.querySelector("#tc-reel-3")
            ];

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) {
                this.log.innerText = "Invalid Bet";
                return;
            }
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Spinning...";

            let spins = 0;
            const maxSpins = 20;
            const symbols = ["🍀", "💎", "7️⃣", "🍇", "🔔", "🍋"];
            
            const interval = setInterval(() => {
                this.reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
                spins++;
                if (spins >= maxSpins) {
                    clearInterval(interval);
                    this.resolve(bet);
                }
            }, 80);
        }

        resolve(bet) {
            const symbols = ["🍀", "💎", "7️⃣", "🍇", "🔔", "🍋"];
            // Weights could be added here for realism, currently uniform random
            const r1 = symbols[Math.floor(Math.random() * symbols.length)];
            const r2 = symbols[Math.floor(Math.random() * symbols.length)];
            const r3 = symbols[Math.floor(Math.random() * symbols.length)];

            this.reels[0].innerText = r1;
            this.reels[1].innerText = r2;
            this.reels[2].innerText = r3;

            let multiplier = 0;
            let win = false;
            let msg = "";

            if (r1 === r2 && r2 === r3) {
                win = true;
                if (r1 === "🍀") {
                    multiplier = 100;
                    msg = "TRIPLE CLOVER JACKPOT!";
                } else if (r1 === "7️⃣") {
                    multiplier = 50;
                    msg = "777 Jackpot!";
                } else {
                    multiplier = 20;
                    msg = "Triple Match!";
                }
            } else if (r1 === r2 || r2 === r3 || r1 === r3) {
                win = true;
                multiplier = 1.5;
                msg = "Small Pair Win";
            }

            // Bonus check for any clover
            const cloverCount = [r1, r2, r3].filter(s => s === "🍀").length;
            if (cloverCount === 1 && !win) {
                 win = true;
                 multiplier = 1.2;
                 msg = "Lucky Clover Bonus";
            } else if (cloverCount === 2 && multiplier < 5) {
                // If we had a pair but it was clovers, boost it
                multiplier = 5;
                msg = "Double Clover Win!";
            }

            const payout = win ? bet * multiplier : 0;
            if (win) {
                this.MK.updateBalance(payout);
                this.log.innerHTML = `<span style="color:#2ecc71">${msg} (+${payout.toFixed(2)})</span>`;
                this.reels.forEach(r => r.style.borderColor = "#2ecc71");
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">Try again...</span>`;
                this.reels.forEach(r => r.style.borderColor = "#4caf50");
            }

            this.playBtn.disabled = false;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.TripleCloverGame = TripleCloverGame;
})();
