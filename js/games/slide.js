(function() {
    class SlideGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.target = 2.00;
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            this.container.innerHTML = `
                <div class="game-panel slide-game">
                    <div class="game-header">
                        <h2>Slide</h2>
                        <div class="balance-display">Balance: <span id="slide-balance">Loading...</span></div>
                    </div>
                    <div class="game-visuals">
                        <div class="slider-container" style="position:relative; height:60px; background:#333; border-radius:30px; margin: 20px 0; overflow:hidden;">
                            <div id="slide-fill" style="position:absolute; left:0; top:0; height:100%; width:50%; background:var(--accent-color, #4CAF50); transition: width 0.1s;"></div>
                            <div id="slide-handle" style="position:absolute; left:50%; top:0; width:10px; height:100%; background:#fff; transform:translateX(-50%); box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>
                            <div id="slide-result-marker" style="position:absolute; left:0; top:0; width:4px; height:100%; background:gold; display:none; z-index:10;"></div>
                        </div>
                        <div class="slide-info" style="display:flex; justify-content:space-between; margin-bottom:20px;">
                            <div class="target-control">
                                <label>Target Multiplier</label>
                                <input type="number" id="slide-target" value="2.00" step="0.01" min="1.01" max="100.00" style="width:80px; padding:5px;">
                            </div>
                            <div class="win-chance">
                                <label>Win Chance</label>
                                <span id="slide-chance">49.50%</span>
                            </div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="slide-bet" value="10" min="1" class="game-input">
                        </div>
                        <button id="slide-play" class="game-btn action-btn">Slide</button>
                    </div>
                    <div id="slide-log" class="game-log" style="max-height:100px; overflow-y:auto; font-size:0.8em; margin-top:10px;"></div>
                </div>
            `;

            this.elements = {
                balance: this.container.querySelector('#slide-balance'),
                fill: this.container.querySelector('#slide-fill'),
                handle: this.container.querySelector('#slide-handle'),
                marker: this.container.querySelector('#slide-result-marker'),
                targetInput: this.container.querySelector('#slide-target'),
                chanceDisplay: this.container.querySelector('#slide-chance'),
                betInput: this.container.querySelector('#slide-bet'),
                playBtn: this.container.querySelector('#slide-play'),
                log: this.container.querySelector('#slide-log')
            };

            this.updateBalanceDisplay();
            this.updateCalculations();
        }

        bindEvents() {
            this.elements.targetInput.addEventListener('input', () => this.updateCalculations());
            this.elements.playBtn.addEventListener('click', () => this.play());
        }

        updateCalculations() {
            let target = parseFloat(this.elements.targetInput.value);
            if (isNaN(target) || target < 1.01) target = 1.01;
            this.target = target;
            
            // House edge 1-2% usually. Let's say 2%.
            // Win Chance = (98 / target)
            const winChance = 98 / target;
            this.elements.chanceDisplay.innerText = winChance.toFixed(2) + '%';
            
            // Update UI visual (fill width represents win area or similar)
            // Typically "Slide" means you pick a point, and if result is > point (or < point) you win.
            // Let's say we bet "Over".
            // If chance is 49%, we need result > 51 (approx).
            // Let's visualize "Win Area" as green.
            const winAreaWidth = winChance; 
            this.elements.fill.style.width = winAreaWidth + '%';
            this.elements.handle.style.left = winAreaWidth + '%';
            this.elements.fill.style.background = '#4CAF50'; // Green for win area
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
            if (typeof window.MK !== 'undefined' && window.MK.updateBalance) {
                window.MK.updateBalance(amount); // This usually handles both currencies inside main app if configured, but here we might need manual check if main app differentiates
                // If main app differentiates by currency arg:
                // window.MK.updateBalance(amount, this.currency);
                // But looking at wheel.js, it does manual check.
                if (this.currency === 'gems') {
                     if (window.MK.state && window.MK.state.user) {
                        window.MK.state.user.premiumBalance += amount;
                        if (window.MK.refreshUI) window.MK.refreshUI();
                    }
                } else {
                    // Default cash
                    window.MK.updateBalance(amount);
                }
            }
            this.updateBalanceDisplay();
        }

        log(msg, type='neutral') {
            const div = document.createElement('div');
            div.innerText = msg;
            div.className = type;
            div.style.color = type === 'win' ? '#4CAF50' : (type === 'loss' ? '#f44336' : '#ccc');
            this.elements.log.prepend(div);
        }

        async play() {
            const bet = parseFloat(this.elements.betInput.value);
            const balance = this.getUserBalance();
            if (isNaN(bet) || bet <= 0) return alert('Invalid bet');
            if (balance < bet) return alert('Insufficient funds');

            this.updateBalance(-bet);
            this.elements.playBtn.disabled = true;

            // Animation
            this.elements.marker.style.display = 'block';
            this.elements.marker.style.left = '0%';
            
            // Random result 0-100
            const result = Math.random() * 100;
            
            // Animate marker
            const duration = 1000;
            const start = performance.now();
            
            const animate = (time) => {
                const elapsed = time - start;
                const progress = Math.min(elapsed / duration, 1);
                // Easing
                const ease = 1 - Math.pow(1 - progress, 3);
                
                const currentPos = result * ease;
                this.elements.marker.style.left = currentPos + '%';

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.finishGame(result, bet);
                }
            };
            requestAnimationFrame(animate);
        }

        finishGame(result, bet) {
            const winChance = 98 / this.target;
            // If we bet "Over", usually user sets a point.
            // Let's stick to standard logic: We visualize "Win Range" as 0 to WinChance.
            // So if result is <= WinChance, we win?
            // Wait, usually slider is "Roll Under" or "Roll Over".
            // If I drew green bar from 0 to X, landing in green is win.
            // So logic: if result <= winChance => Win.
            
            const isWin = result <= winChance;
            
            if (isWin) {
                const payout = bet * this.target;
                this.updateBalance(payout);
                this.log(`Win! rolled ${result.toFixed(2)} (Target < ${winChance.toFixed(2)}), +${payout.toFixed(2)}`, 'win');
                // Flash green
                this.container.querySelector('.slider-container').style.boxShadow = '0 0 20px #4CAF50';
            } else {
                this.log(`Loss. rolled ${result.toFixed(2)} (Target < ${winChance.toFixed(2)})`, 'loss');
                // Flash red
                this.container.querySelector('.slider-container').style.boxShadow = '0 0 20px #f44336';
            }

            setTimeout(() => {
                this.container.querySelector('.slider-container').style.boxShadow = 'none';
                this.elements.playBtn.disabled = false;
            }, 500);
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.SlideGame = SlideGame;
})();
