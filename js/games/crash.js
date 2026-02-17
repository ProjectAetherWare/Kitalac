(function() {
    window.MoonKat = window.MoonKat || {};
    
    class CrashGame {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.width = 800;
            this.height = 500;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.background = '#151921';
            this.canvas.style.borderRadius = '12px';

            this.multiplier = 1.00;
            this.running = false;
            this.crashed = false;
            this.betAmount = 0;
            
            this.setupUI();
        }

        destroy() {
            this.running = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.container.innerHTML = '';
        }
    
        setupUI() {
            this.container.innerHTML = '';
            
            const gameWrapper = document.createElement('div');
            gameWrapper.style.position = 'relative';
            gameWrapper.style.width = '100%';
            gameWrapper.style.maxWidth = '800px';
            gameWrapper.style.margin = '0 auto';
            gameWrapper.appendChild(this.canvas);
            
            // Overlay controls
            const controls = document.createElement('div');
            controls.style.position = 'absolute';
            controls.style.bottom = '20px';
            controls.style.left = '50%';
            controls.style.transform = 'translateX(-50%)';
            controls.style.display = 'flex';
            controls.style.gap = '10px';
            controls.style.background = 'rgba(0,0,0,0.8)';
            controls.style.padding = '15px';
            controls.style.borderRadius = '12px';
            controls.style.border = '1px solid rgba(255,255,255,0.1)';
    
            controls.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <label style="color:#aaa; font-size:0.8rem;">Bet Amount</label>
                    <input type="number" id="crash-bet" value="100" min="1" step="1" style="padding:12px; border-radius:8px; border:1px solid #444; background:#222; color:white; width:120px; font-size:1rem;">
                </div>
                <button id="crash-btn" style="padding:0 40px; background:#00ff88; color:#000; border:none; border-radius:8px; font-weight:900; font-size:1.2rem; cursor:pointer; text-transform:uppercase; margin-left:10px; transition:0.2s;">BET</button>
            `;
            
            gameWrapper.appendChild(controls);
            this.container.appendChild(gameWrapper);
    
            this.btn = controls.querySelector('#crash-btn');
            this.input = controls.querySelector('#crash-bet');
    
            this.btn.addEventListener('click', () => {
                if(this.running) this.cashOut();
                else this.startGame();
            });

            // Add listener for input changes to validate/clamp if needed
            this.input.addEventListener('input', (e) => {
                if(e.target.value < 0) e.target.value = 0;
            });
    
            this.drawGraph();
        }
    
        startGame() {
            if (this.running) return;

            const bet = parseFloat(this.input.value);
            if (!bet || bet <= 0) return alert("Enter valid bet");

            if(window.MoonKat.updateBalance(-bet)) {
                this.betAmount = bet;
                this.running = true;
                this.crashed = false;
                this.multiplier = 1.00;
                this.startTime = Date.now();
                // Crash point logic: 1% instant crash, otherwise Pareto distribution
                // formula: E = 0.99 / (1 - U) where U is random [0,1)
                const r = Math.random();
                let rawCrash = Math.floor(100 * (0.99 / (1 - r))) / 100;
                this.crashPoint = Math.min(100.00, Math.max(1.00, rawCrash));
                
                this.btn.innerText = "CASH OUT";
                this.btn.style.background = "#ffcc00"; // Yellow for cashout
                this.btn.style.color = "#000";
                this.input.disabled = true;
                
                this.loop();
            } else {
                alert("Insufficient funds");
            }
        }
    
        cashOut() {
            if (!this.running || this.crashed) return;
            
            this.running = false;
            const win = this.betAmount * this.multiplier;
            window.MoonKat.updateBalance(win);
            window.MoonKat.addXp(Math.floor(win/10)); // Add XP based on win

            this.btn.innerText = `WON $${win.toFixed(2)}`;
            this.btn.style.background = "#00ff88"; // Green for win
            this.input.disabled = false;
            
            this.drawGraph(); // Final draw

            setTimeout(() => {
                if (!this.crashed) { // Only reset if not already crashed state (user cashed out early)
                     this.btn.innerText = "BET";
                }
            }, 2000);
        }
    
        loop() {
            if(!this.running) return;
            
            const elapsed = (Date.now() - this.startTime) / 1000;
            // Exponential growth: 1 * e^(0.06 * t) - tweak 0.06 for speed
            this.multiplier = Math.max(1.00, Math.pow(Math.E, 0.15 * elapsed));
            
            if(this.multiplier >= this.crashPoint) {
                this.crashed = true;
                this.running = false;
                this.multiplier = this.crashPoint;
                this.btn.innerText = "CRASHED";
                this.btn.style.background = "#ff4500"; // Red for crash
                this.btn.style.color = "#fff";
                this.input.disabled = false;
                
                setTimeout(() => {
                    this.btn.innerText = "BET";
                    this.btn.style.background = "#00ff88";
                    this.btn.style.color = "#000";
                }, 2000);
            }
            
            this.drawGraph();
            
            if(this.running) {
                this.rafId = requestAnimationFrame(() => this.loop());
            }
        }
    
        drawGraph() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;
            
            ctx.clearRect(0,0,w,h);
            
            // Background Grid
            ctx.strokeStyle = '#2a2e39';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Dynamic grid lines based on zoom could be cool, but fixed for now
            for(let i=0; i<w; i+=100) { ctx.moveTo(i,0); ctx.lineTo(i,h); }
            for(let i=0; i<h; i+=100) { ctx.moveTo(0,i); ctx.lineTo(w,i); }
            ctx.stroke();
            
            // Curve
            if(this.running || this.crashed) {
                ctx.strokeStyle = this.crashed ? '#ff4500' : '#00ff88';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(0, h);
                
                // Map time/multiplier to X/Y
                // X axis = time (0 to 10s for example, then scroll?)
                // Simple quadratic viz for effect
                // Let's make it look like a rocket path
                
                const timeScale = 10; // seconds to fill screen width
                const elapsed = (Date.now() - this.startTime) / 1000;
                
                // For visualization, we just draw a curve up to current point
                // Normalized progress 0..1
                // We use a log scale for Y so it doesn't shoot off screen immediately
                
                // Simple Bezier for "Rocket" feel
                const progress = Math.min(1, (this.multiplier - 1) / 5); // caps at 5x for visual full height? No, let's just make it look good
                
                // Just draw a curve from bottom-left
                // X is linear with time, Y is exponential
                
                const x = Math.min(w, (elapsed / timeScale) * w);
                const y = h - Math.min(h, (Math.log(this.multiplier) / Math.log(10)) * h); // Log scale height
                
                // Draw curve
                ctx.quadraticCurveTo(x/2, h, x, y);
                ctx.stroke();
                
                // Rocket Icon at tip
                ctx.save();
                ctx.translate(x, y);
                // content, x, y
                ctx.fillStyle = 'white';
                ctx.font = '24px "Font Awesome 5 Free"';
                ctx.fillText('\uf135', 0, 0); // Rocket icon unicode
                ctx.restore();

                // Big Multiplier Text
                ctx.fillStyle = this.crashed ? '#ff4500' : 'white';
                ctx.font = 'bold 80px Roboto, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 10;
                ctx.fillText(`${this.multiplier.toFixed(2)}x`, w/2, h/2);
                
                if(this.crashed) {
                     ctx.font = 'bold 30px Roboto, sans-serif';
                     ctx.fillStyle = '#ff4500';
                     ctx.fillText("CRASHED", w/2, h/2 + 60);
                }
            } else {
                 ctx.fillStyle = '#666';
                 ctx.font = '20px Roboto, sans-serif';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.fillText("Place your bet to start the engine...", w/2, h/2);
            }
        }
    }

    window.MoonKat.CrashGame = CrashGame;
})();