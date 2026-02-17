(function() {
    window.MoonKat = window.MoonKat || {};
    
    class CrashGame {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.canvas = null;
            this.ctx = null;
            this.width = 800;
            this.height = 500;
            
            // Game State
            this.state = 'IDLE'; // IDLE, RUNNING, CRASHED, CASHED_OUT
            this.multiplier = 1.00;
            this.crashPoint = 0;
            this.betAmount = 0;
            this.autoCashOut = 0;
            this.startTime = 0;
            this.rafId = null;
            
            // Visuals
            this.accentColor = '#00ff88'; // Default green
            
            this.callbacks = {
                onTick: null,
                onCrash: null,
                onWin: null
            };

            this.setupUI();
        }

        destroy() {
            this.stop();
            this.container.innerHTML = '';
        }
    
        setupUI() {
            this.container.innerHTML = `
                <div class="crash-wrapper" style="position:relative; width:100%; height:100%; background:#151921; border-radius:12px; overflow:hidden;">
                    <canvas style="display:block; width:100%; height:100%;"></canvas>
                    <div class="crash-overlay" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:5rem; font-weight:900; color:white; z-index:10; text-shadow: 0 4px 20px rgba(0,0,0,0.5); font-family: 'Roboto', sans-serif;">
                        1.00x
                    </div>
                </div>
            `;
            this.canvas = this.container.querySelector('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.overlay = this.container.querySelector('.crash-overlay');
            
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            if(!this.container || !this.canvas) return;
            const rect = this.container.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            if(this.state === 'IDLE') this.drawStatic();
        }

        // --- CORE LOGIC ---

        generateCrashPoint() {
            // Secure Random generation
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            const r = array[0] / (0xffffffff + 1); // 0 to 1
            
            // House Edge: 1% instant crash (1.00x)
            // Pareto Distribution: E = 0.99 / (1 - r)
            let crash = Math.floor(100 * 0.99 / (1 - r)) / 100;
            
            // Cap at 100x as requested
            if (crash > 100.00) crash = 100.00;
            
            // Ensure min 1.00
            return Math.max(1.00, crash);
        }

        placeBet(amount, autoOut = Infinity) {
            if (this.state !== 'IDLE') return false;
            if (amount <= 0) return false;

            this.betAmount = amount;
            this.autoCashOut = autoOut > 1 ? autoOut : Infinity;
            this.crashPoint = this.generateCrashPoint();
            this.multiplier = 1.00;
            this.state = 'RUNNING';
            this.startTime = Date.now();
            
            this.overlay.style.color = 'white';
            
            // Start Loop
            this.loop();
            return true;
        }

        cashOut() {
            // CRITICAL: Can only cash out if running and logic says we haven't crashed yet
            if (this.state !== 'RUNNING') return false;
            
            // Double check strict timing (prevent lag-switch exploits)
            // We use the calculated multiplier from time, if it exceeds crash point, we essentially missed the window
            // But since this is client-side sim, we just trust local state for now.
            if (this.multiplier >= this.crashPoint) {
                this.crash();
                return false;
            }

            this.state = 'CASHED_OUT';
            const winAmount = this.betAmount * this.multiplier;
            
            if (this.callbacks.onWin) this.callbacks.onWin(winAmount, this.multiplier);
            
            return true;
        }

        crash() {
            this.state = 'CRASHED';
            this.multiplier = this.crashPoint;
            this.drawCrash();
            if (this.callbacks.onCrash) this.callbacks.onCrash(this.crashPoint);
        }

        stop() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.state = 'IDLE';
        }

        loop() {
            if (this.state !== 'RUNNING' && this.state !== 'CASHED_OUT') return;

            const now = Date.now();
            const elapsed = (now - this.startTime) / 1000; // seconds
            
            // Growth Function: Exponential
            // Speed up: 1 * e^(0.06 * t) -> reaches 2x in ~11s, 100x in ~76s
            this.multiplier = Math.max(1.00, Math.pow(Math.E, 0.06 * elapsed));

            // Visual Update
            this.drawGraph(elapsed);
            
            // Logic Check
            if (this.state === 'RUNNING') {
                this.overlay.innerText = this.multiplier.toFixed(2) + "x";

                // Check Auto Cashout
                if (this.multiplier >= this.autoCashOut) {
                    this.cashOut();
                }
                
                // Check Crash
                if (this.multiplier >= this.crashPoint) {
                    this.crash();
                    return; // Stop loop
                }
            } else if (this.state === 'CASHED_OUT') {
                // Continue showing graph until crash point, but user is safe
                if (this.multiplier >= this.crashPoint) {
                    this.crash(); // Visual crash
                    return;
                }
            }

            this.rafId = requestAnimationFrame(() => this.loop());
        }

        // --- DRAWING ---

        drawStatic() {
            this.ctx.fillStyle = '#151921';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.drawGrid();
        }

        drawGrid() {
            const w = this.width;
            const h = this.height;
            this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for(let i=0; i<w; i+=80) { this.ctx.moveTo(i,0); this.ctx.lineTo(i,h); }
            for(let i=0; i<h; i+=80) { this.ctx.moveTo(0,i); this.ctx.lineTo(w,i); }
            this.ctx.stroke();
        }

        drawGraph(elapsed) {
            const w = this.width;
            const h = this.height;
            
            this.ctx.clearRect(0, 0, w, h);
            this.drawStatic();

            // Graph Curve
            this.ctx.strokeStyle = this.state === 'CASHED_OUT' ? '#ffd700' : '#00ff88';
            this.ctx.lineWidth = 5;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();

            // Dynamic Scale
            let timeScale = 10; // seconds width
            if (elapsed > 8) timeScale = elapsed + 2;

            const padding = 50;
            const startX = padding;
            const startY = h - padding;
            
            this.ctx.moveTo(startX, startY);

            let currentX = startX;
            let currentY = startY;

            // Draw segments
            const step = 0.1; 
            for(let t=0; t<=elapsed; t+=step) {
                const mult = Math.pow(Math.E, 0.06 * t);
                
                const xPct = t / timeScale;
                const drawX = padding + (w - padding * 2) * xPct;
                
                // Y Scale (Logarithmic for better visualization of height)
                const yLog = Math.log(mult);
                const maxLog = Math.log(Math.max(2, this.multiplier * 1.1));
                const yPct = yLog / maxLog;
                
                const drawY = startY - (startY - padding) * yPct;
                
                this.ctx.lineTo(drawX, drawY);
                currentX = drawX;
                currentY = drawY;
            }
            this.ctx.stroke();

            // Rocket Icon
            this.ctx.save();
            this.ctx.translate(currentX, currentY);
            this.ctx.rotate(-Math.PI / 4);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px "Font Awesome 5 Free"';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🚀', 0, 0);
            this.ctx.restore();
            
            // Area Fill
            this.ctx.lineTo(currentX, startY);
            this.ctx.lineTo(startX, startY);
            this.ctx.fillStyle = this.state === 'CASHED_OUT' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)';
            this.ctx.fill();
        }

        drawCrash() {
            this.overlay.innerText = "CRASHED @ " + this.crashPoint.toFixed(2) + "x";
            this.overlay.style.color = '#ff4500';
            
            // Shake
            this.canvas.style.transform = "translate(5px, 5px)";
            setTimeout(() => this.canvas.style.transform = "translate(-5px, -5px)", 50);
            setTimeout(() => this.canvas.style.transform = "translate(0, 0)", 100);
        }
    }

    window.MoonKat.CrashGame = CrashGame;
})();