(function() {
    class RuneboundGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.MK = window.MoonKat;
            if (!this.container) return;
            this.init();
        }

        init() {
            this.runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];
            this.runeNames = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raido', 'Kenaz', 'Gebo', 'Wunjo'];
            this.render();
            this.bindEvents();
        }

        render() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-gem"></i> Runebound</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px; background:#1a1a1a; padding:20px; border-radius:10px;">
                        <div id="rune-circle" style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap; perspective:800px;">
                            <div class="rune-stone" id="rune-1"></div>
                            <div class="rune-stone" id="rune-2"></div>
                            <div class="rune-stone" id="rune-3"></div>
                            <div class="rune-stone" id="rune-4"></div>
                            <div class="rune-stone" id="rune-5"></div>
                        </div>
                        <div id="cast-result" style="font-size:1.2rem; color:#b388ff; min-height:30px;"></div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <button id="btn-cast" class="game-btn action-btn" style="background:linear-gradient(45deg, #673ab7, #512da8);">CAST RUNES</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
                <style>
                    .rune-stone {
                        width: 60px; height: 80px;
                        background: #444; border: 2px solid #666; border-radius: 10px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 2.5rem; color: #888;
                        text-shadow: 0 0 5px rgba(255,255,255,0.2);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                        transition: transform 0.5s, color 0.5s, text-shadow 0.5s;
                    }
                    .rune-stone.active {
                        color: #00e5ff;
                        text-shadow: 0 0 15px #00e5ff, 0 0 30px #00e5ff;
                        border-color: #00bcd4;
                        transform: translateY(-5px);
                    }
                </style>
            `;

            this.stones = [
                this.container.querySelector('#rune-1'),
                this.container.querySelector('#rune-2'),
                this.container.querySelector('#rune-3'),
                this.container.querySelector('#rune-4'),
                this.container.querySelector('#rune-5')
            ];
            this.resultDisplay = this.container.querySelector('#cast-result');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnCast = this.container.querySelector('#btn-cast');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.btnCast.addEventListener('click', () => this.play());
        }

        async play() {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");

            this.btnCast.disabled = true;
            this.resultDisplay.innerText = "Casting...";
            
            // Animation
            this.stones.forEach(s => {
                s.className = 'rune-stone'; // Reset
                s.innerText = '';
                s.style.transform = `rotateY(${Math.random() * 360}deg)`;
            });

            await new Promise(r => setTimeout(r, 800));

            const result = [];
            for(let i=0; i<5; i++) {
                const idx = Math.floor(Math.random() * this.runes.length);
                result.push(idx);
                
                const s = this.stones[i];
                s.style.transform = 'rotateY(0deg)';
                s.innerText = this.runes[idx];
                
                // Add staggered delay for reveal
                await new Promise(r => setTimeout(r, 100));
            }

            // Check matches
            const counts = {};
            result.forEach(idx => counts[idx] = (counts[idx] || 0) + 1);
            
            let win = false;
            let multiplier = 0;
            let msg = "";

            // Logic: Pairs, Triples, Quads, Quint
            // 5 of a kind: 50x
            // 4 of a kind: 20x
            // Full House (3+2): 15x
            // 3 of a kind: 5x
            // Two Pair: 3x
            // One Pair: 0x (Loss usually, or push? Let's say loss to balance high payouts)

            const values = Object.values(counts).sort((a,b) => b-a); // e.g. [3, 2]
            
            if (values[0] === 5) {
                multiplier = 50;
                msg = "5 OF A KIND! MYTHIC!";
                win = true;
            } else if (values[0] === 4) {
                multiplier = 20;
                msg = "4 OF A KIND!";
                win = true;
            } else if (values[0] === 3 && values[1] === 2) {
                multiplier = 15;
                msg = "FULL HOUSE!";
                win = true;
            } else if (values[0] === 3) {
                multiplier = 3;
                msg = "3 OF A KIND";
                win = true;
            } else if (values[0] === 2 && values[1] === 2) {
                multiplier = 2;
                msg = "TWO PAIR";
                win = true;
            } else if (values[0] === 2) {
                multiplier = 0.5; // Return half bet?
                msg = "ONE PAIR (Bad Luck)";
                win = false; // Actually a loss of half
            } else {
                msg = "No Matches.";
                win = false;
            }

            // Highlight matches
            this.stones.forEach((s, i) => {
                const runeIdx = result[i];
                if (counts[runeIdx] >= 2) {
                    s.classList.add('active');
                }
            });

            this.resultDisplay.innerText = msg;

            if (win) {
                const payout = bet * multiplier;
                this.MK.updateBalance(payout);
                this.logResult(`${msg} (+${(payout-bet).toFixed(2)})`, 'win');
                this.resultDisplay.style.color = '#00e5ff';
            } else if (multiplier > 0) {
                 // Partial return
                 const payout = bet * multiplier;
                 this.MK.updateBalance(payout);
                 this.logResult(`${msg} (-${(bet-payout).toFixed(2)})`, 'loss');
                 this.resultDisplay.style.color = '#ff9800';
            } else {
                this.logResult(`${msg} (-${bet.toFixed(2)})`, 'loss');
                this.resultDisplay.style.color = '#f44336';
            }

            this.btnCast.disabled = false;
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
    window.MoonKat.RuneboundGame = RuneboundGame;
})();
