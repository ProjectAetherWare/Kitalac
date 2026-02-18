(function() {
    class Keno40Game {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.selected = [];
            this.drawCount = 20;
            this.maxSelect = 10;
            this.payouts = {
                1: {1: 3},
                2: {2: 10, 1: 1},
                3: {3: 45, 2: 2},
                4: {4: 80, 3: 10, 2: 1},
                5: {5: 150, 4: 20, 3: 2},
                6: {6: 300, 5: 40, 4: 5, 3: 1},
                7: {7: 500, 6: 80, 5: 15, 4: 2},
                8: {8: 800, 7: 150, 6: 50, 5: 5, 4: 1},
                9: {9: 1000, 8: 300, 7: 80, 6: 10, 5: 2},
                10: {10: 2000, 9: 500, 8: 100, 7: 20, 6: 5, 5: 1}
            };
            
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            // Build grid
            let gridHtml = '';
            for(let i=1; i<=40; i++) {
                gridHtml += `<div class="keno-ball" data-num="${i}" style="width:40px; height:40px; border-radius:50%; background:#333; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; margin:2px;">${i}</div>`;
            }

            this.container.innerHTML = `
                <div class="game-panel keno-game">
                    <div class="game-header">
                        <h2>Keno 40</h2>
                        <div class="balance-display">Balance: <span id="keno-balance">0.00</span></div>
                    </div>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px; padding:20px;">
                        <div class="keno-grid" style="display:flex; flex-wrap:wrap; width:360px; justify-content:center;">
                            ${gridHtml}
                        </div>
                        <div class="payout-info" id="keno-payouts" style="font-size:0.8em; color:#888; min-height:20px;">
                            Select numbers to see payouts
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="control-row" style="display:flex; gap:10px; margin-bottom:10px;">
                            <button id="keno-clear" class="game-btn secondary-btn">Clear</button>
                            <button id="keno-random" class="game-btn secondary-btn">Random</button>
                        </div>
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="keno-bet" value="10" min="1" class="game-input">
                        </div>
                        <button id="keno-play" class="game-btn action-btn">Play</button>
                    </div>
                    <div id="keno-log" class="game-log"></div>
                </div>
            `;
            
            this.elements = {
                balance: this.container.querySelector('#keno-balance'),
                grid: this.container.querySelector('.keno-grid'),
                payouts: this.container.querySelector('#keno-payouts'),
                betInput: this.container.querySelector('#keno-bet'),
                playBtn: this.container.querySelector('#keno-play'),
                clearBtn: this.container.querySelector('#keno-clear'),
                randomBtn: this.container.querySelector('#keno-random'),
                log: this.container.querySelector('#keno-log'),
                balls: Array.from(this.container.querySelectorAll('.keno-ball'))
            };
            
            this.updateBalanceDisplay();
        }

        bindEvents() {
            this.elements.balls.forEach(ball => {
                ball.addEventListener('click', () => {
                    const num = parseInt(ball.dataset.num);
                    this.toggleNumber(num);
                });
            });
            
            this.elements.clearBtn.addEventListener('click', () => {
                this.selected = [];
                this.updateGrid();
            });
            
            this.elements.randomBtn.addEventListener('click', () => {
                this.selected = [];
                while(this.selected.length < this.maxSelect) {
                    const r = Math.floor(Math.random() * 40) + 1;
                    if(!this.selected.includes(r)) this.selected.push(r);
                }
                this.updateGrid();
            });
            
            this.elements.playBtn.addEventListener('click', () => this.play());
        }
        
        toggleNumber(num) {
            if (this.selected.includes(num)) {
                this.selected = this.selected.filter(n => n !== num);
            } else {
                if(this.selected.length < this.maxSelect) {
                    this.selected.push(num);
                }
            }
            this.updateGrid();
        }
        
        updateGrid() {
            this.elements.balls.forEach(ball => {
                const num = parseInt(ball.dataset.num);
                if (this.selected.includes(num)) {
                    ball.style.background = '#ffd700'; // Selected
                    ball.style.color = '#000';
                } else {
                    ball.style.background = '#333';
                    ball.style.color = '#fff';
                }
                // Reset hit styles
                ball.style.border = 'none';
                ball.style.transform = 'none';
            });
            
            // Update payouts text
            const count = this.selected.length;
            if(count > 0 && this.payouts[count]) {
                const table = this.payouts[count];
                let txt = `Payouts for ${count}: `;
                for(let hit in table) {
                    txt += `${hit} hits: ${table[hit]}x | `;
                }
                this.elements.payouts.innerText = txt;
            } else {
                this.elements.payouts.innerText = 'Select numbers to see payouts';
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

        async play() {
            const bet = parseFloat(this.elements.betInput.value);
            const bal = this.getUserBalance();
            
            if(isNaN(bet) || bet <= 0) return alert('Invalid bet');
            if(bal < bet) return alert('Insufficient funds');
            if(this.selected.length === 0) return alert('Select numbers first');
            
            this.updateBalance(-bet);
            this.elements.playBtn.disabled = true;
            
            // Draw 20 numbers
            const drawn = [];
            while(drawn.length < 20) {
                const r = Math.floor(Math.random() * 40) + 1;
                if(!drawn.includes(r)) drawn.push(r);
            }
            
            // Animate reveal
            for(let i=0; i<20; i++) {
                const num = drawn[i];
                const ball = this.elements.balls.find(b => parseInt(b.dataset.num) === num);
                
                // Highlight drawn
                if(this.selected.includes(num)) {
                    // HIT
                    ball.style.background = '#4CAF50';
                    ball.style.boxShadow = '0 0 10px #4CAF50';
                    ball.style.transform = 'scale(1.2)';
                } else {
                    // MISS (but drawn)
                    ball.style.border = '2px solid #f44336';
                    ball.style.color = '#f44336';
                }
                
                await new Promise(r => setTimeout(r, 100));
            }
            
            // Calculate Hits
            let hits = 0;
            this.selected.forEach(s => {
                if(drawn.includes(s)) hits++;
            });
            
            // Payout
            const table = this.payouts[this.selected.length];
            const mult = table && table[hits] ? table[hits] : 0;
            const payout = bet * mult;
            
            if (payout > 0) {
                this.updateBalance(payout);
                this.log(`Win! ${hits} hits (${mult}x) +${payout.toFixed(2)}`, 'win');
            } else {
                this.log(`Loss. ${hits} hits.`, 'loss');
            }
            
            this.elements.playBtn.disabled = false;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.Keno40Game = Keno40Game;
})();
