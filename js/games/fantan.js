(function() {
    class FanTanGame {
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
                    <h2><i class="fas fa-circle"></i> Fan Tan</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                        <div id="bead-bowl" style="width:300px; height:200px; background:#333; border-radius:100px; position:relative; overflow:hidden; border:4px solid #555;">
                            <!-- Beads will be injected here -->
                        </div>
                        <div id="result-display" style="font-size:2rem; font-weight:bold; color:#ffd700; height:40px;"></div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button class="game-btn bet-btn" data-val="1">1</button>
                            <button class="game-btn bet-btn" data-val="2">2</button>
                            <button class="game-btn bet-btn" data-val="3">3</button>
                            <button class="game-btn bet-btn" data-val="4">4</button>
                        </div>
                        <p style="text-align:center; color:#aaa; font-size:0.8rem;">Pays 2.85x (5% Commission)</p>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
                <style>
                    .bead {
                        width: 8px; height: 8px;
                        background: #fff;
                        border-radius: 50%;
                        position: absolute;
                        box-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    }
                    .bet-btn {
                        width: 50px; height: 50px;
                        border-radius: 50%;
                        font-size: 1.5rem;
                        font-weight: bold;
                    }
                </style>
            `;

            this.bowl = this.container.querySelector('#bead-bowl');
            this.resultDisplay = this.container.querySelector('#result-display');
            this.betInput = this.container.querySelector('#bet-input');
            this.betButtons = this.container.querySelectorAll('.bet-btn');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.betButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.play(parseInt(btn.dataset.val));
                });
            });
        }

        generateBeads(count) {
            this.bowl.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const bead = document.createElement('div');
                bead.className = 'bead';
                bead.style.left = Math.random() * 280 + 'px';
                bead.style.top = Math.random() * 180 + 'px';
                this.bowl.appendChild(bead);
            }
        }

        async play(choice) {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");

            this.betButtons.forEach(b => b.disabled = true);
            this.resultDisplay.innerText = "";
            
            // Generate random beads (60-100)
            const count = 60 + Math.floor(Math.random() * 41);
            this.generateBeads(count);
            
            // Animation: Remove beads in groups of 4
            let current = count;
            const interval = setInterval(() => {
                if (current <= 4) {
                    clearInterval(interval);
                    this.finishGame(current, choice, bet);
                } else {
                    current -= 4;
                    // Visually remove 4 random beads
                    for(let i=0; i<4; i++) {
                        if(this.bowl.lastChild) this.bowl.removeChild(this.bowl.lastChild);
                    }
                }
            }, 100);
        }

        finishGame(remainder, choice, bet) {
            // Remainder 0 is usually treated as 4 in Fan Tan logic?
            // Actually, modulo 4: 1, 2, 3, 0. 0 means 4.
            const result = remainder === 0 ? 4 : remainder;
            
            this.resultDisplay.innerText = result;
            
            // Update remaining beads visually to exact position if possible, but simplified here:
            this.bowl.innerHTML = '';
            for(let i=0; i<result; i++) {
                const bead = document.createElement('div');
                bead.className = 'bead';
                bead.style.left = (130 + (i*20)) + 'px';
                bead.style.top = '90px';
                bead.style.width = '15px';
                bead.style.height = '15px';
                this.bowl.appendChild(bead);
            }

            if (result === choice) {
                // Odds: 1 in 4. Payout usually 3:1 (4x) minus commission?
                // Standard Fan Tan pays 2.85 to 1 (Comm 5%).
                // Let's do 3.85x total return (2.85 profit).
                const payout = bet * 3.85;
                this.MK.updateBalance(payout);
                this.logResult(`Won on ${choice}! +$${(payout - bet).toFixed(2)}`, 'win');
                this.resultDisplay.style.color = 'var(--accent-success)';
            } else {
                this.logResult(`Lost on ${choice}. Result: ${result}. -$${bet.toFixed(2)}`, 'loss');
                this.resultDisplay.style.color = 'var(--accent-danger)';
            }

            this.betButtons.forEach(b => b.disabled = false);
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
    window.MoonKat.FanTanGame = FanTanGame;
})();
