(function() {
    class SicBoGame {
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
                    <h2><i class="fas fa-dice"></i> Sic Bo</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                        <div id="dice-container" style="display:flex; gap:15px; justify-content:center; padding:20px; perspective: 1000px;">
                            <div class="die" id="die-1">?</div>
                            <div class="die" id="die-2">?</div>
                            <div class="die" id="die-3">?</div>
                        </div>
                        <div id="result-display" style="font-size:1.5rem; font-weight:bold; height:30px; color:#ffd700;"></div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div class="bet-options" style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; width:100%; max-width:400px; margin:0 auto;">
                            <button class="game-btn bet-btn" data-type="small">SMALL (4-10)<br><span style="font-size:0.8em">Pays 1:1</span></button>
                            <button class="game-btn bet-btn" data-type="big">BIG (11-17)<br><span style="font-size:0.8em">Pays 1:1</span></button>
                            <button class="game-btn bet-btn" data-type="odd">ODD<br><span style="font-size:0.8em">Pays 1:1</span></button>
                            <button class="game-btn bet-btn" data-type="even">EVEN<br><span style="font-size:0.8em">Pays 1:1</span></button>
                            <button class="game-btn bet-btn" data-type="triple" style="grid-column: span 2;">ANY TRIPLE<br><span style="font-size:0.8em">Pays 30:1</span></button>
                        </div>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
                <style>
                    .die {
                        width: 60px; height: 60px;
                        background: #fff; border-radius: 10px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 2rem; color: #333;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        font-weight: bold;
                    }
                    .bet-btn.selected {
                        border: 2px solid #ffd700;
                        background: #444;
                    }
                </style>
            `;

            this.diceEls = [
                this.container.querySelector('#die-1'),
                this.container.querySelector('#die-2'),
                this.container.querySelector('#die-3')
            ];
            this.resultDisplay = this.container.querySelector('#result-display');
            this.betInput = this.container.querySelector('#bet-input');
            this.betButtons = this.container.querySelectorAll('.bet-btn');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.betButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.play(btn.dataset.type);
                });
            });
        }

        async play(betType) {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");

            this.betButtons.forEach(b => b.disabled = true);
            this.resultDisplay.innerText = "Rolling...";

            // Animation
            let rolls = 0;
            const interval = setInterval(() => {
                this.diceEls.forEach(d => {
                    d.innerText = Math.floor(Math.random() * 6) + 1;
                });
                rolls++;
                if (rolls > 10) clearInterval(interval);
            }, 100);

            await new Promise(r => setTimeout(r, 1200));

            const dice = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];

            this.diceEls.forEach((d, i) => d.innerText = dice[i]);

            const sum = dice.reduce((a, b) => a + b, 0);
            const isTriple = dice[0] === dice[1] && dice[1] === dice[2];
            
            let win = false;
            let payout = 0;
            let multiplier = 0;

            // Logic
            // Note: Big/Small usually lose on Triples in strict Sic Bo rules.
            if (betType === 'triple') {
                if (isTriple) {
                    win = true;
                    multiplier = 30;
                }
            } else if (isTriple) {
                // House takes all on triples for Big/Small/Odd/Even usually
                win = false;
            } else {
                switch (betType) {
                    case 'small':
                        if (sum >= 4 && sum <= 10) { win = true; multiplier = 1; }
                        break;
                    case 'big':
                        if (sum >= 11 && sum <= 17) { win = true; multiplier = 1; }
                        break;
                    case 'odd':
                        if (sum % 2 !== 0) { win = true; multiplier = 1; }
                        break;
                    case 'even':
                        if (sum % 2 === 0) { win = true; multiplier = 1; }
                        break;
                }
            }

            if (win) {
                payout = bet * (1 + multiplier);
                this.MK.updateBalance(payout);
                this.resultDisplay.innerText = `WIN! Sum: ${sum}`;
                this.resultDisplay.style.color = 'var(--accent-success)';
                this.logResult(`Win on ${betType.toUpperCase()}! +$${(bet * multiplier).toFixed(2)}`, 'win');
            } else {
                this.resultDisplay.innerText = `LOSS! Sum: ${sum}`;
                this.resultDisplay.style.color = 'var(--accent-danger)';
                this.logResult(`Lost on ${betType.toUpperCase()}. -$${bet.toFixed(2)}`, 'loss');
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
    window.MoonKat.SicBoGame = SicBoGame;
})();
