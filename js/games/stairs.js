(function() {
    class StairsGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.rocks = 3; // Default difficulty
            this.currentStep = 0;
            this.steps = 13;
            this.inGame = false;
            this.bet = 0;
            this.multipliers = [];
            
            this.calculateMultipliers();
            this.setupUI();
            this.bindEvents();
        }

        calculateMultipliers() {
            // Simplified logic: more rocks = higher jump in multiplier
            // Base chance = (20 - rocks) / 20 per step (assuming 20 spots width)
            // Fair multiplier = 1 / chance
            // House edge ~1-2%
            const spots = 20;
            let currentMult = 1;
            this.multipliers = [];
            
            for(let i=0; i<this.steps; i++) {
                const winChance = (spots - this.rocks) / spots;
                currentMult = currentMult * (1/winChance) * 0.98; // 2% edge
                this.multipliers.push(parseFloat(currentMult.toFixed(2)));
            }
        }

        setupUI() {
            if (!this.container) return;
            
            // Build stairs HTML
            let stairsHtml = '';
            for(let i=this.steps-1; i>=0; i--) {
                stairsHtml += `<div class="stair-row" id="stair-${i}" style="display:flex; justify-content:center; margin:2px 0;">
                    <div class="stair-step" style="width:200px; height:30px; background:#444; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                        <span class="mult-label" style="font-size:0.8em; color:#aaa;">${this.multipliers[i]}x</span>
                    </div>
                </div>`;
            }

            this.container.innerHTML = `
                <div class="game-panel stairs-game">
                    <div class="game-header">
                        <h2>Stairs</h2>
                        <div class="balance-display">Balance: <span id="stairs-balance">0.00</span></div>
                    </div>
                    <div class="game-visuals" style="padding:20px;">
                        <div class="stairs-container" style="display:flex; flex-direction:column;">
                            ${stairsHtml}
                            <div class="start-pad" style="height:30px; background:#333; margin-top:5px; border-radius:4px; text-align:center; line-height:30px; color:#666;">START</div>
                        </div>
                    </div>
                    <div class="game-controls">
                         <div class="input-group">
                            <label>Rocks (1-7)</label>
                            <input type="range" id="stairs-rocks" min="1" max="7" value="3" class="game-slider">
                            <span id="rocks-val">3</span>
                        </div>
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="stairs-bet" value="10" min="1" class="game-input">
                        </div>
                        <button id="stairs-play" class="game-btn action-btn">Start Game</button>
                        <button id="stairs-cashout" class="game-btn success-btn" disabled>Cashout</button>
                    </div>
                    <div id="stairs-log" class="game-log"></div>
                </div>
            `;

            this.elements = {
                balance: this.container.querySelector('#stairs-balance'),
                rocksInput: this.container.querySelector('#stairs-rocks'),
                rocksVal: this.container.querySelector('#rocks-val'),
                betInput: this.container.querySelector('#stairs-bet'),
                playBtn: this.container.querySelector('#stairs-play'),
                cashoutBtn: this.container.querySelector('#stairs-cashout'),
                log: this.container.querySelector('#stairs-log'),
                stairs: Array.from(this.container.querySelectorAll('.stair-row'))
            };

            this.updateBalanceDisplay();
        }

        bindEvents() {
            this.elements.rocksInput.addEventListener('input', (e) => {
                this.rocks = parseInt(e.target.value);
                this.elements.rocksVal.innerText = this.rocks;
                this.calculateMultipliers();
                this.updateStairsUI();
            });
            
            this.elements.playBtn.addEventListener('click', () => {
                if(this.inGame) {
                    this.climb(); // If logic allows button to serve as climb
                } else {
                    this.startGame();
                }
            });

            this.elements.cashoutBtn.addEventListener('click', () => this.cashout());
        }

        updateStairsUI() {
            // Update multiplier labels
             this.elements.stairs.forEach((row, index) => {
                 // index 0 is top (step 12), index 12 is bottom (step 0)
                 // Wait, I built it top-down loop i=12..0.
                 // So elements[0] corresponds to step 12.
                 // Let's find the step index.
                 // The loop was: for(let i=this.steps-1; i>=0; i--)
                 // So the first element in DOM is step 12.
                 // We need to map DOM index to step index.
                 const stepIndex = this.steps - 1 - index;
                 const label = row.querySelector('.mult-label');
                 if(label) label.innerText = `${this.multipliers[stepIndex]}x`;
             });
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

        async startGame() {
            const bet = parseFloat(this.elements.betInput.value);
            const bal = this.getUserBalance();
            if(isNaN(bet) || bet <= 0) return alert('Invalid bet');
            if(bal < bet) return alert('Insufficient funds');

            this.updateBalance(-bet);
            this.bet = bet;
            this.inGame = true;
            this.currentStep = 0;
            
            // UI Reset
            this.elements.stairs.forEach(s => {
                s.querySelector('.stair-step').style.background = '#444';
                s.querySelector('.stair-step').classList.remove('active');
            });
            
            this.elements.playBtn.innerText = 'Climb';
            this.elements.cashoutBtn.disabled = true;
            this.elements.rocksInput.disabled = true;
            this.elements.betInput.disabled = true;
            
            this.log(`Started game with ${bet} ${this.currency}`, 'neutral');
        }

        async climb() {
            if(!this.inGame) return;
            
            // Logic: Roll to see if hit rock
            const spots = 20;
            const safeSpots = spots - this.rocks;
            const roll = Math.random() * spots; // 0..20
            
            const isSafe = roll < safeSpots;
            
            // Visual of current step
            // Map currentStep to DOM element
            // currentStep 0 is bottom (index steps-1)
            const domIndex = this.steps - 1 - this.currentStep;
            const stepRow = this.elements.stairs[domIndex];
            const stepEl = stepRow.querySelector('.stair-step');
            
            // Animate
            stepEl.style.background = '#666'; // Highlight processing
            await new Promise(r => setTimeout(r, 300));

            if (isSafe) {
                stepEl.style.background = '#4CAF50';
                stepEl.classList.add('active');
                
                const mult = this.multipliers[this.currentStep];
                const profit = this.bet * mult;
                this.log(`Climbed step ${this.currentStep+1}! Value: ${profit.toFixed(2)}`, 'success');
                
                this.currentStep++;
                
                if (this.currentStep >= this.steps) {
                    // Reached top! Auto cashout
                    this.cashout(true);
                } else {
                    this.elements.cashoutBtn.disabled = false;
                }
            } else {
                // Fell
                stepEl.style.background = '#f44336';
                this.log(`Hit a rock! Lost ${this.bet}`, 'loss');
                this.endGame();
            }
        }

        cashout(auto=false) {
            if(!this.inGame) return;
            
            const stepIndex = this.currentStep - 1;
            if(stepIndex < 0) return; // Should not happen if btn enabled
            
            const mult = this.multipliers[stepIndex];
            const payout = this.bet * mult;
            
            this.updateBalance(payout);
            this.log(`Cashed out at ${mult}x! Won ${payout.toFixed(2)}`, 'win');
            this.endGame();
        }

        endGame() {
            this.inGame = false;
            this.elements.playBtn.innerText = 'Start Game';
            this.elements.cashoutBtn.disabled = true;
            this.elements.rocksInput.disabled = false;
            this.elements.betInput.disabled = false;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.StairsGame = StairsGame;
})();
