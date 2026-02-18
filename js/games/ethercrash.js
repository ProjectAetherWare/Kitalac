(function() {
    class EtherCrashGame {
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
            this.ctx = this.canvas.getContext('2d');
            this.running = false;
            this.crashed = false;
        }

        render() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-rocket"></i> EtherCrash</h2>
                    <div class="game-visuals" style="position:relative; width:100%; height:300px; background:#111; border-radius:8px; overflow:hidden;">
                        <canvas id="crash-canvas" width="600" height="300"></canvas>
                        <div id="multiplier-display" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:4rem; font-weight:bold; color:#fff; text-shadow:0 0 10px rgba(0,0,0,0.5);">1.00x</div>
                        <div id="crash-msg" style="position:absolute; top:65%; left:50%; transform:translateX(-50%); font-size:1.5rem; font-weight:bold; color:#f44336; display:none;">CRASHED</div>
                    </div>
                    
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div class="input-group">
                            <label>Auto Cashout (x)</label>
                            <input type="number" id="auto-cashout" value="2.00" min="1.01" step="0.01" class="game-input">
                        </div>
                        <button id="btn-action" class="game-btn action-btn" style="background:#4caf50; min-width:150px;">PLACE BET</button>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;

            this.canvas = this.container.querySelector('#crash-canvas');
            this.multiplierDisplay = this.container.querySelector('#multiplier-display');
            this.crashMsg = this.container.querySelector('#crash-msg');
            this.betInput = this.container.querySelector('#bet-input');
            this.autoInput = this.container.querySelector('#auto-cashout');
            this.btnAction = this.container.querySelector('#btn-action');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            this.btnAction.addEventListener('click', () => {
                if (this.running && !this.crashed && this.hasBet) {
                    this.cashOut();
                } else if (!this.running) {
                    this.placeBet();
                }
            });
        }

        placeBet() {
            const bet = parseFloat(this.betInput.value);
            if (isNaN(bet) || bet <= 0) return alert("Invalid bet");
            if (!this.MK.updateBalance(-bet)) return alert("Insufficient funds");

            this.currentBet = bet;
            this.hasBet = true;
            this.autoCashout = parseFloat(this.autoInput.value) || 2.0;
            
            this.btnAction.innerText = "CASHOUT";
            this.btnAction.style.background = "#ff9800";
            this.startGame();
        }

        startGame() {
            this.running = true;
            this.crashed = false;
            this.crashMsg.style.display = 'none';
            this.multiplier = 1.00;
            this.startTime = Date.now();
            this.history = [];
            
            // Generate crash point
            // E = 100 / (1 - U) where U is random [0,1)
            // Or simple inverse distribution
            // House edge: 1% instant crash at 1.00x?
            const r = Math.random();
            this.crashPoint = 0.99 / (1 - r);
            if (this.crashPoint < 1.01) this.crashPoint = 1.00; // Instant crash
            
            this.logResult(`Game Starting...`, 'neutral');
            
            this.loop();
        }

        loop() {
            if (!this.running) return;

            const elapsed = (Date.now() - this.startTime) / 1000;
            // Growth function: e^(0.06 * t)
            this.multiplier = Math.pow(Math.E, 0.06 * elapsed);
            
            this.multiplierDisplay.innerText = this.multiplier.toFixed(2) + "x";
            
            // Update Canvas
            this.drawGraph();

            // Check Auto Cashout
            if (this.hasBet && this.multiplier >= this.autoCashout) {
                this.cashOut();
            }

            // Check Crash
            if (this.multiplier >= this.crashPoint) {
                this.crash();
            } else {
                requestAnimationFrame(() => this.loop());
            }
        }

        drawGraph() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            this.ctx.clearRect(0, 0, w, h);
            
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            
            // Map multiplier to Y (log scale visually)
            // Or just linear for short run? Exponential curve looks better.
            
            const timeScale = 10; // 10 seconds fits on screen
            const t = (Date.now() - this.startTime) / 1000;
            
            // Draw previous path
            // We can't store infinite points. Just draw curve function.
            
            this.ctx.moveTo(0, h);
            for(let x=0; x<w; x+=5) {
                const time = (x / w) * timeScale;
                if (time > t) break;
                
                const m = Math.pow(Math.E, 0.06 * time);
                // Scale Y: 1.0 at bottom (h), 10.0 at top (0)
                // log(1) = 0. log(10) = 2.3.
                // y = h - (log(m) / log(max_visible_mult)) * h
                
                const maxMult = Math.pow(Math.E, 0.06 * timeScale); // multiplier at end of screen
                const y = h - ((m - 1) / (maxMult - 1)) * h * 0.8; // Simple linear mapping of multiplier value
                
                this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }

        crash() {
            this.running = false;
            this.crashed = true;
            this.multiplierDisplay.style.color = '#f44336';
            this.crashMsg.style.display = 'block';
            this.crashMsg.innerText = `CRASHED @ ${this.multiplier.toFixed(2)}x`;
            
            if (this.hasBet) {
                this.logResult(`Crashed! Lost $${this.currentBet.toFixed(2)}`, 'loss');
                this.hasBet = false;
            }
            
            this.btnAction.innerText = "PLACE BET";
            this.btnAction.style.background = "#4caf50";
            this.btnAction.disabled = false;
        }

        cashOut() {
            if (!this.hasBet) return;
            
            const payout = this.currentBet * this.multiplier;
            this.MK.updateBalance(payout);
            this.logResult(`Cashed out at ${this.multiplier.toFixed(2)}x! +$${(payout - this.currentBet).toFixed(2)}`, 'win');
            
            this.hasBet = false;
            this.btnAction.innerText = "BET PLACED (Done)";
            this.btnAction.style.background = "#888";
            this.btnAction.disabled = true;
            
            // Re-enable button next round handled by crash state reset?
            // Actually, wait for crash to reset button.
            // But user might want to bet again immediately? No, wait for round end.
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
    window.MoonKat.EtherCrashGame = EtherCrashGame;
})();
