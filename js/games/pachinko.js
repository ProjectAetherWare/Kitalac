(function() {
    class PachinkoGame {
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
                    <h2><i class="fas fa-dot-circle"></i> Pachinko</h2>
                    <p class="section-subtitle">Drop the ball!</p>
                    
                    <div style="position:relative; margin: 0 auto; width: 300px;">
                        <canvas id="pachinko-canvas" width="300" height="400" style="background: #111; border: 2px solid var(--accent-primary); border-radius: 5px;"></canvas>
                        <div id="p-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; pointer-events:none;"></div>
                    </div>

                    <div class="game-controls">
                        <input id="p-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                        <button id="p-drop-btn" class="game-btn">DROP BALL</button>
                    </div>
                    <div id="p-log" class="game-log">Select bet and drop!</div>
                </div>
            `;
        }

        bindEvents() {
            this.canvas = this.container.querySelector("#pachinko-canvas");
            this.ctx = this.canvas.getContext("2d");
            this.playBtn = this.container.querySelector("#p-drop-btn");
            this.betInput = this.container.querySelector("#p-bet");
            this.log = this.container.querySelector("#p-log");

            this.playBtn.addEventListener("click", () => this.play());
            
            this.setupBoard();
            this.draw();
        }

        setupBoard() {
            this.pins = [];
            const rows = 10;
            const cols = 9;
            const startX = 30;
            const startY = 80;
            const spacing = 30;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const offset = (r % 2) * (spacing / 2);
                    if (c === cols -1 && r % 2 === 1) continue; 
                    this.pins.push({
                        x: startX + c * spacing + offset,
                        y: startY + r * spacing,
                        r: 3
                    });
                }
            }
            
            // Buckets at bottom
            this.buckets = [
                { x: 30, w: 40, mul: 0.5, color: '#e74c3c' },
                { x: 70, w: 40, mul: 1.5, color: '#f1c40f' },
                { x: 110, w: 40, mul: 5.0, color: '#2ecc71' }, // Center jackpot
                { x: 150, w: 40, mul: 5.0, color: '#2ecc71' },
                { x: 190, w: 40, mul: 1.5, color: '#f1c40f' },
                { x: 230, w: 40, mul: 0.5, color: '#e74c3c' }
            ];
            
            // Adjust bucket positions to fit canvas width 300
            // Evenly space 6 buckets: 300 / 6 = 50px each roughly
            for(let i=0; i<6; i++) {
                this.buckets[i].x = i * 50;
                this.buckets[i].w = 50;
            }
            this.buckets[2].mul = 3.0; // center
            this.buckets[3].mul = 3.0;
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) return;
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playBtn.disabled = true;
            this.currentBet = bet;
            
            // Ball Init
            this.ball = {
                x: 150 + (Math.random() * 20 - 10), // slight random start
                y: 20,
                vx: 0,
                vy: 0,
                r: 5,
                active: true
            };
            
            this.animate();
        }

        animate() {
            if (!this.ball.active) return;
            
            // Physics
            this.ball.vy += 0.2; // Gravity
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            
            // Wall collisions
            if (this.ball.x < 0 || this.ball.x > 300) this.ball.vx *= -0.7;
            this.ball.x = Math.max(5, Math.min(295, this.ball.x));
            
            // Pin collisions
            for (let pin of this.pins) {
                const dx = this.ball.x - pin.x;
                const dy = this.ball.y - pin.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < this.ball.r + pin.r) {
                    // Collision
                    const angle = Math.atan2(dy, dx);
                    const force = 2.0;
                    this.ball.vx = Math.cos(angle) * force + (Math.random() - 0.5);
                    this.ball.vy = Math.sin(angle) * force;
                    this.ball.y += this.ball.vy; // push out
                }
            }
            
            // Bottom collision (buckets)
            if (this.ball.y > 380) {
                this.ball.active = false;
                this.resolveBucket();
            } else {
                this.draw();
                requestAnimationFrame(() => this.animate());
            }
        }

        resolveBucket() {
            // Find which bucket
            let mult = 0;
            for(let b of this.buckets) {
                if(this.ball.x >= b.x && this.ball.x < b.x + b.w) {
                    mult = b.mul;
                    break;
                }
            }
            
            const payout = this.currentBet * mult;
            if (payout > 0) {
                this.MK.updateBalance(payout);
                this.log.innerHTML = `<span style="color:#2ecc71">Landed in x${mult}! Won ${payout.toFixed(2)}</span>`;
            } else {
                this.log.innerHTML = "No Win.";
            }
            
            this.draw(); // Final frame
            this.playBtn.disabled = false;
        }

        draw() {
            this.ctx.clearRect(0, 0, 300, 400);
            
            // Draw Pins
            this.ctx.fillStyle = '#fff';
            for (let pin of this.pins) {
                this.ctx.beginPath();
                this.ctx.arc(pin.x, pin.y, pin.r, 0, Math.PI*2);
                this.ctx.fill();
            }
            
            // Draw Buckets
            for (let b of this.buckets) {
                this.ctx.fillStyle = b.color;
                this.ctx.globalAlpha = 0.5;
                this.ctx.fillRect(b.x, 380, b.w, 20);
                this.ctx.globalAlpha = 1.0;
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(b.x, 380, b.w, 20);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(`x${b.mul}`, b.x + 10, 395);
            }
            
            // Draw Ball
            if (this.ball && this.ball.active) {
                this.ctx.fillStyle = '#3498db';
                this.ctx.beginPath();
                this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI*2);
                this.ctx.fill();
            }
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.PachinkoGame = PachinkoGame;
})();
