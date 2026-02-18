(function() {
    class ColorPredGame {
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
                    <h2><i class="fas fa-palette"></i> Color Prediction</h2>
                    <p class="section-subtitle">Red, Black, or Green?</p>
                    
                    <div id="cp-history" style="display:flex; gap:5px; justify-content:center; margin-bottom:10px; min-height:30px;">
                        <!-- History dots -->
                    </div>

                    <div class="game-visuals" style="height: 100px; display: flex; align-items: center; justify-content: center; background: #222; margin-bottom: 20px;">
                        <div id="cp-result" style="width: 60px; height: 60px; border-radius: 50%; background: #444; border: 4px solid #fff;"></div>
                    </div>

                    <div class="game-controls">
                        <input id="cp-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button class="game-btn cp-btn" data-color="red" style="background:#e74c3c">Red (x2)</button>
                            <button class="game-btn cp-btn" data-color="green" style="background:#2ecc71">Green (x14)</button>
                            <button class="game-btn cp-btn" data-color="black" style="background:#34495e">Black (x2)</button>
                        </div>
                    </div>
                    <div id="cp-log" class="game-log">Pick a color.</div>
                </div>
            `;
        }

        bindEvents() {
            this.betInput = this.container.querySelector("#cp-bet");
            this.resultEl = this.container.querySelector("#cp-result");
            this.log = this.container.querySelector("#cp-log");
            this.historyEl = this.container.querySelector("#cp-history");
            this.history = [];

            this.container.querySelectorAll(".cp-btn").forEach(btn => {
                btn.addEventListener("click", (e) => this.play(e.target.dataset.color));
            });
        }

        play(choice) {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) return;
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.log.innerText = "Spinning...";
            
            // Animation
            let ticks = 0;
            const colors = ['red', 'black', 'green'];
            const interval = setInterval(() => {
                const randC = colors[Math.floor(Math.random() * 3)];
                this.setResultColor(randC);
                ticks++;
                if (ticks > 15) {
                    clearInterval(interval);
                    this.resolve(bet, choice);
                }
            }, 100);
        }

        setResultColor(color) {
            const map = {
                'red': '#e74c3c',
                'black': '#34495e',
                'green': '#2ecc71'
            };
            this.resultEl.style.background = map[color];
        }

        resolve(bet, choice) {
            // Weights: Green is rare (like 0 in roulette)
            // 0-4: Red, 5-9: Black, 10: Green ? 
            // Let's use 15 slots: 7 Red, 7 Black, 1 Green.
            const roll = Math.floor(Math.random() * 15);
            let resultColor = 'black';
            if (roll === 0) resultColor = 'green';
            else if (roll <= 7) resultColor = 'red';
            
            this.setResultColor(resultColor);
            this.addToHistory(resultColor);

            let win = (choice === resultColor);
            let mult = resultColor === 'green' ? 14 : 2;
            let payout = win ? bet * mult : 0;

            if (win) {
                this.MK.updateBalance(payout);
                this.log.innerHTML = `<span style="color:${resultColor === 'black' ? '#aaa' : resultColor}">WIN! ${resultColor.toUpperCase()} (+${payout})</span>`;
            } else {
                 this.log.innerHTML = `<span style="color:var(--accent-danger)">Lost. Result was ${resultColor}.</span>`;
            }
        }

        addToHistory(color) {
            this.history.unshift(color);
            if (this.history.length > 10) this.history.pop();
            
            this.historyEl.innerHTML = this.history.map(c => {
                const map = { 'red': '#e74c3c', 'black': '#34495e', 'green': '#2ecc71' };
                return `<div style="width:15px; height:15px; border-radius:50%; background:${map[c]}"></div>`;
            }).join('');
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.ColorPredGame = ColorPredGame;
})();
