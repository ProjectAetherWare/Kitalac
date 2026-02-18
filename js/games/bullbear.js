(function() {
    class BullBearGame {
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
            this.startGraph();
        }

        render() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-chart-line"></i> Bull vs Bear</h2>
                    <div class="game-visuals" style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                        <canvas id="market-graph" width="400" height="200" style="background:#222; border-radius:8px; border:1px solid #444;"></canvas>
                        <div style="display:flex; justify-content:space-between; width:100%; padding:0 20px;">
                            <div style="font-size:1.2rem; font-weight:bold;">Current: <span id="current-price">100.00</span></div>
                            <div style="font-size:1.2rem; font-weight:bold;">Target: <span id="target-price">-</span></div>
                        </div>
                        <div id="timer-display" style="font-size:2rem; font-weight:bold; color:#fff;"></div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div style="display:flex; gap:20px; justify-content:center;">
                            <button id="btn-bull" class="game-btn bet-btn" style="background:#4caf50; flex:1;">BULL (Higher) <i class="fas fa-arrow-up"></i></button>
                            <button id="btn-bear" class="game-btn bet-btn" style="background:#f44336; flex:1;">BEAR (Lower) <i class="fas fa-arrow-down"></i></button>
                        </div>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;

            this.canvas = this.container.querySelector('#market-graph');
            this.ctx = this.canvas.getContext('2d');
            this.priceEl = this.container.querySelector('#current-price');
            this.targetEl = this.container.querySelector('#target-price');
            this.timerEl = this.container.querySelector('#timer-display');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnBull = this.container.querySelector('#btn-bull');
            this.btnBear = this.container.querySelector('#btn-bear');
            this.log = this.container.querySelector('#game-log');
            
            this.price = 100;
            this.history = [];
            for(let i=0; i<50; i++) this.history.push(100);
            this.running = true;
        }

        bindEvents() {
            this.btnBull.addEventListener('click', () => this.placeBet('bull'));
            this.btnBear.addEventListener('click', () => this.placeBet('bear'));
        }

        startGraph() {
            setInterval(() => {
                if (!this.running) return;
                
                // Random walk
                const change = (Math.random() - 0.5) * 2;
                this.price += change;
                if (this.price < 10) this.price = 10; // Floor
                
                this.history.push(this.price);
                if (this.history.length > 50) this.history.shift();
                
                this.drawGraph();
                this.priceEl.innerText = this.price.toFixed(2);
                
                if (this.activeBet) {
                    const elapsed = (Date.now() - this.activeBet.startTime) / 1000;
                    const remaining = Math.max(0, 5 - elapsed); // 5 second rounds
                    this.timerEl.innerText = remaining.toFixed(1) + "s";
                    
                    if (remaining === 0) {
                        this.resolveBet();
                    }
                }
            }, 100);
        }

        drawGraph() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            this.ctx.clearRect(0, 0, w, h);
            
            // Grid
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for(let i=0; i<w; i+=40) { this.ctx.moveTo(i,0); this.ctx.lineTo(i,h); }
            for(let i=0; i<h; i+=40) { this.ctx.moveTo(0,i); this.ctx.lineTo(w,i); }
            this.ctx.stroke();

            // Line
            this.ctx.strokeStyle = '#00bcd4';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            const min = Math.min(...this.history) - 2;
            const max = Math.max(...this.history) + 2;
            const range = max - min || 1;
            
            for(let i=0; i<this.history.length; i++) {
                const x = (i / (this.history.length-1)) * w;
                const y = h - ((this.history[i] - min) / range) * h;
                if (i===0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            
            // Target Line
            if (this.activeBet) {
                const targetY = h - ((this.activeBet.startPrice - min) / range) * h;
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(0, targetY);
                this.ctx.lineTo(w, targetY);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }

        placeBet(type) {
            if (this.activeBet) return;
            
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");
            
            this.activeBet = {
                type: type,
                amount: bet,
                startPrice: this.price,
                startTime: Date.now()
            };
            
            this.targetEl.innerText = this.price.toFixed(2);
            this.btnBull.disabled = true;
            this.btnBear.disabled = true;
            this.logResult(`Bet ${type.toUpperCase()} at ${this.price.toFixed(2)}...`, 'neutral');
        }

        resolveBet() {
            const endPrice = this.price;
            const startPrice = this.activeBet.startPrice;
            const type = this.activeBet.type;
            const bet = this.activeBet.amount;
            
            let win = false;
            if (type === 'bull' && endPrice > startPrice) win = true;
            if (type === 'bear' && endPrice < startPrice) win = true;
            
            if (win) {
                const payout = bet * 1.95;
                this.MK.updateBalance(payout);
                this.logResult(`WIN! Closed at ${endPrice.toFixed(2)}. +$${(payout-bet).toFixed(2)}`, 'win');
            } else {
                this.logResult(`LOSS. Closed at ${endPrice.toFixed(2)}. -$${bet.toFixed(2)}`, 'loss');
            }
            
            this.activeBet = null;
            this.targetEl.innerText = "-";
            this.timerEl.innerText = "";
            this.btnBull.disabled = false;
            this.btnBear.disabled = false;
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
    window.MoonKat.BullBearGame = BullBearGame;
})();
