(function() {

    window.MoonKat = window.MoonKat || {};
    
    class CrashGame {
    
        constructor(containerId, currency = 'cash') {
    
            this.container = document.getElementById(containerId);
            this.currency = currency;
    
            this.canvas = null;
            this.ctx = null;
            this.overlay = null;
    
            this.width = 800;
            this.height = 500;
    
            this.state = 'IDLE'; // IDLE, RUNNING, CRASHED, CASHED_OUT
            this.multiplier = 1.00;
            this.crashPoint = 1.00;
            this.startTime = 0;
            this.rafId = null;
            
            this.betAmount = 0;
            
            this.setupUI();
        }
    
        setupUI() {
    
            this.container.innerHTML = `
            <div class="game-panel">
                <div style="width:100%;height:400px;display:flex;flex-direction:column;background:#151921;border-radius:12px;overflow:hidden;position:relative;margin-bottom:20px;">
    
                    <div style="position:relative;flex:1;">
                        <canvas style="width:100%;height:100%;"></canvas>
                        <div class="overlay" style="
                            position:absolute;
                            top:50%;
                            left:50%;
                            transform:translate(-50%,-50%);
                            font-size:64px;
                            font-weight:900;
                            color:white;
                            font-family:var(--font-main);
                            text-shadow: 0 0 20px rgba(0,0,0,0.5);
                        ">1.00x</div>
                    </div>
                </div>

                <div class="game-controls">
                    <div class="input-group">
                        <label>Bet Amount (${this.currency === 'gems' ? 'Gems' : 'Cash'})</label>
                        <input type="number" id="crash-bet" class="game-input" value="${this.currency === 'gems' ? 50 : 100}" min="1">
                    </div>
                    <div class="input-group">
                        <label>Auto Cashout (x)</label>
                        <input type="number" id="crash-auto" class="game-input" value="2.00" min="1.01" step="0.01">
                    </div>
                    
                    <button id="crash-action-btn" class="game-btn" style="width:160px; font-size:1.2rem;">START</button>
                </div>
                
                <div id="game-log" class="game-log"></div>
            </div>
            `;
    
            this.canvas = this.container.querySelector("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.overlay = this.container.querySelector(".overlay");
            this.btn = this.container.querySelector("#crash-action-btn");
            this.betInput = this.container.querySelector("#crash-bet");
            this.autoInput = this.container.querySelector("#crash-auto");
            this.log = this.container.querySelector("#game-log");
    
            this.btn.onclick = () => {
                if (this.state === 'RUNNING') {
                    this.cashOut();
                } else if (this.state === 'IDLE' || this.state === 'CRASHED' || this.state === 'CASHED_OUT') {
                    this.start();
                }
            };
    
            this.resize();
    
            // Bind resize
            this.resizeHandler = () => this.resize();
            window.addEventListener("resize", this.resizeHandler);
        }
        
        destroy() {
            if(this.rafId) cancelAnimationFrame(this.rafId);
            window.removeEventListener("resize", this.resizeHandler);
        }
    
        resize() {
            if(!this.canvas) return;
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
    
            this.canvas.width = this.width;
            this.canvas.height = this.height;
    
            if(this.state === 'IDLE') this.drawStatic();
        }
    
        generateCrashPoint() {
            // Secure Random
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            const r = array[0] / (0xffffffff + 1); // 0 to 1

            // House Edge: 1% instant crash (1.00x)
            if (r < 0.01) return 1.00;

            // Pareto Distribution: E = 0.99 / (1 - r)
            let crash = 0.99 / (1 - r);
            
            // Cap at 100x or 1000x? Let's say 1000x for fun
            if (crash > 1000.00) crash = 1000.00;

            return Math.max(1.00, Math.floor(crash * 100) / 100);
        }
        
        getBalance() {
            if(this.currency === 'gems') return window.MoonKat.state.user.premiumBalance;
            return window.MoonKat.state.user.balance;
        }
        
        updateBalance(amount) {
            if(this.currency === 'gems') {
                window.MoonKat.state.user.premiumBalance += amount;
                window.MoonKat.renderUserStats();
                return true;
            } else {
                return window.MoonKat.updateBalance(amount);
            }
        }
    
        start() {
            if (this.state === "RUNNING") return;
            
            const bet = parseFloat(this.betInput.value);
            if(isNaN(bet) || bet <= 0) {
                alert("Invalid bet amount");
                return;
            }
            
            if(this.getBalance() < bet) {
                alert("Insufficient funds");
                return;
            }
            
            // Deduct Bet
            this.updateBalance(-bet);
            this.betAmount = bet;
            
            this.state = "RUNNING";
            this.multiplier = 1.00;
            this.crashPoint = this.generateCrashPoint();
            this.startTime = performance.now();
            
            this.btn.innerText = "CASH OUT";
            this.btn.style.background = "#ffcc00";
            this.btn.style.color = "black";
    
            this.overlay.innerText = "1.00x";
            this.overlay.style.color = "white";
            
            this.log.innerHTML = `Started round with $${bet}...`;
    
            this.loop();
        }
    
        cashOut() {
            if (this.state !== "RUNNING") return;
    
            this.state = "CASHED_OUT";
            
            const win = this.betAmount * this.multiplier;
            this.updateBalance(win);
            
            this.btn.innerText = "START";
            this.btn.style.background = "#00ff88";
            
            this.overlay.innerText = `WON $${win.toFixed(2)}`;
            this.overlay.style.color = "#00ff88";
            
            this.log.innerHTML = `<span style="color:#00ff88">WIN! Cashed out at ${this.multiplier.toFixed(2)}x (+$${win.toFixed(2)})</span>`;
            
            if(window.MoonKat.incrementStat) window.MoonKat.incrementStat('totalWon', 1);
            window.MoonKat.addXp(win * 0.1);
        }
    
        crash() {
            this.state = "CRASHED";
            
            this.btn.innerText = "START";
            this.btn.style.background = "#00ff88";
    
            this.overlay.innerText = `CRASHED @ ${this.crashPoint.toFixed(2)}x`;
            this.overlay.style.color = "#ff4444";
            
            this.log.innerHTML = `<span style="color:#ff4444">CRASHED at ${this.crashPoint.toFixed(2)}x. Lost $${this.betAmount}.</span>`;
            
            if(window.MoonKat.incrementStat) window.MoonKat.incrementStat('totalLost', 1);
        }
    
        loop() {
            if (this.state === "CASHED_OUT" || this.state === "CRASHED" || this.state === "IDLE") return;
    
            const now = performance.now();
            const elapsed = (now - this.startTime) / 1000; // seconds
    
            // Growth Function: 1.00 * e^(0.06 * t) - slightly slower start then speeds up
            this.multiplier = Math.max(1.00, Math.pow(Math.E, 0.06 * elapsed));
            
            // Check Auto Cashout
            const auto = parseFloat(this.autoInput.value);
            if (!isNaN(auto) && auto > 1 && this.multiplier >= auto) {
                this.multiplier = auto; // Clamp to auto
                this.cashOut();
                return;
            }
    
            if (this.multiplier >= this.crashPoint) {
                this.multiplier = this.crashPoint;
                this.crash();
                return;
            }
    
            this.overlay.innerText = this.multiplier.toFixed(2) + "x";
            this.drawGraph(elapsed);
    
            this.rafId = requestAnimationFrame(() => this.loop());
        }
    
        drawStatic() {
            this.ctx.fillStyle = "#151921";
            this.ctx.fillRect(0, 0, this.width, this.height);
    
            this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
            this.ctx.lineWidth = 1;
    
            for (let x = 0; x < this.width; x += 80) {
                this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.height); this.ctx.stroke();
            }
            for (let y = 0; y < this.height; y += 80) {
                this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
            }
        }
    
        drawGraph(elapsed) {
            this.drawStatic();
    
            this.ctx.strokeStyle = this.state === 'CRASHED' ? '#ff4444' : (this.state === 'CASHED_OUT' ? '#ffd700' : '#00ff88');
            this.ctx.lineWidth = 5;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.ctx.strokeStyle;
    
            this.ctx.beginPath();
    
            const padding = 60;
            const startX = padding;
            const startY = this.height - padding;
    
            // Dynamic Zoom: As time goes on, the graph scales to fit
            const maxTime = Math.max(10, elapsed * 1.2); 
            // Calculate max multiplier scale based on time
            const maxMult = Math.pow(Math.E, 0.06 * maxTime);
            
            // Plot curve
            let currentX = startX;
            let currentY = startY;
            
            // Step size
            const step = Math.max(0.05, elapsed / 100);
            
            this.ctx.moveTo(startX, startY);
            
            for (let t = 0; t <= elapsed; t += step) {
                const m = Math.pow(Math.E, 0.06 * t);
                
                // Map time to X (linear)
                const x = startX + ((t / maxTime) * (this.width - 2 * padding));
                
                // Map multiplier to Y (logarithmic scale usually looks better for crash, but let's try linear first or slight log)
                // Let's use linear mapping relative to current zoom
                // Norm = (m - 1) / (maxMult - 1)
                const normY = (m - 1) / (maxMult - 1);
                const y = startY - (normY * (this.height - 2 * padding));
                
                this.ctx.lineTo(x, y);
                currentX = x;
                currentY = y;
            }
            
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
            
            // Draw Rocket
            this.ctx.font = "32px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            
            if(this.state === 'CRASHED') {
                this.ctx.fillText("💥", currentX, currentY);
            } else {
                this.ctx.save();
                this.ctx.translate(currentX, currentY);
                // Rotate based on slope?
                this.ctx.rotate(-Math.PI / 4);
                this.ctx.fillText("🚀", 0, 0);
                this.ctx.restore();
            }
        }
    
    }
    
    window.MoonKat = window.MoonKat || {};
    window.MoonKat.CrashGame = CrashGame;
    
    
    })();
    