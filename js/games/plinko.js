(function() {
    window.MoonKat = window.MoonKat || {};
    
    class PlinkoGame {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.width = 800;
            this.height = 600;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.width = '100%';
            this.canvas.style.height = 'auto';
            this.canvas.style.background = '#0f1219';
            this.canvas.style.borderRadius = '12px';
            this.canvas.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';

            this.balls = [];
            this.pegs = [];
            this.buckets = [];
            this.rows = 16;
            this.pegSize = 4;
            this.ballSize = 6;
            
            this.running = true;
            
            this.setupBoard();
            this.setupUI();
            this.loop();
        }

        destroy() {
            this.running = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.container.innerHTML = '';
        }

        setupBoard() {
            // Create Pegs (Pyramid)
            const startX = this.width / 2;
            const startY = 100;
            const gapX = 40;
            const gapY = 35;

            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col <= row; col++) {
                    const x = startX - (row * gapX / 2) + (col * gapX);
                    const y = startY + (row * gapY);
                    this.pegs.push({ x, y, r: this.pegSize });
                }
            }

            // Create Buckets
            const bucketCount = this.rows + 1;
            const bucketWidth = gapX; // Match peg spacing roughly
            const bucketY = startY + (this.rows * gapY) + 20;
            
            // Multipliers: High ends, low center
            // Example: 110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, ...
            const mults = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
            // Adjust to rows size
            // If rows=16, we have 17 buckets.
            
            const totalWidth = bucketCount * bucketWidth;
            const startBucketX = this.width/2 - totalWidth/2;

            for(let i=0; i<bucketCount; i++) {
                this.buckets.push({
                    x: startBucketX + i * bucketWidth,
                    y: bucketY,
                    w: bucketWidth,
                    h: 40,
                    val: mults[i % mults.length], // simplified
                    color: this.getBucketColor(mults[i % mults.length])
                });
            }
        }

        getBucketColor(val) {
            if(val >= 10) return '#ff0055';
            if(val >= 3) return '#ffaa00';
            if(val >= 1) return '#00ff88';
            return '#0099ff';
        }

        setupUI() {
            const controls = document.createElement('div');
            controls.style.padding = '20px';
            controls.style.textAlign = 'center';
            controls.innerHTML = `
                <div style="margin-bottom:15px; color:white;">
                    Bet Amount: <input type="number" id="plinko-bet" value="10" min="1" style="padding:8px; width:80px; border-radius:4px; border:none;">
                </div>
                <button id="plinko-drop" style="padding:15px 40px; background:#00ff88; border:none; border-radius:30px; font-weight:bold; font-size:1.2rem; cursor:pointer;">DROP BALL</button>
            `;
            
            this.container.appendChild(this.canvas);
            this.container.appendChild(controls);
            
            this.betInput = controls.querySelector('#plinko-bet');
            this.dropBtn = controls.querySelector('#plinko-drop');
            
            this.dropBtn.addEventListener('click', () => this.dropBall());
        }

        dropBall() {
            const bet = parseFloat(this.betInput.value);
            if (!bet || bet <= 0) return alert("Invalid bet");
            if (!window.MoonKat.updateBalance(-bet)) return alert("Insufficient funds");
            
            // Spawn ball at top with slight random x offset
            const ball = {
                x: this.width / 2 + (Math.random() * 4 - 2), // Tiny jitter
                y: 50,
                vx: (Math.random() - 0.5) * 1, // Tiny random horizontal velocity
                vy: 0,
                r: this.ballSize,
                bet: bet,
                active: true,
                color: '#ffffff'
            };
            this.balls.push(ball);
        }

        loop() {
            if(!this.running) return;
            
            this.update();
            this.draw();
            this.rafId = requestAnimationFrame(() => this.loop());
        }

        update() {
            const gravity = 0.25;
            const friction = 0.99;
            const elasticity = 0.7; // Bounciness
            
            for (let i = this.balls.length - 1; i >= 0; i--) {
                let b = this.balls[i];
                if (!b.active) continue;

                // Physics
                b.vy += gravity;
                b.vx *= friction;
                b.x += b.vx;
                b.y += b.vy;

                // Peg Collisions
                for (let p of this.pegs) {
                    const dx = b.x - p.x;
                    const dy = b.y - p.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const minDist = b.r + p.r;
                    
                    if (dist < minDist) {
                        // Collision!
                        // Resolve position
                        const angle = Math.atan2(dy, dx);
                        const tx = p.x + Math.cos(angle) * minDist;
                        const ty = p.y + Math.sin(angle) * minDist;
                        
                        b.x = tx;
                        b.y = ty;

                        // Reflect velocity (simplified)
                        // Add some randomness to make it "fair" unpredictable
                        const randomBounce = (Math.random() - 0.5) * 2; 
                        
                        b.vx += Math.cos(angle) * 2 + randomBounce;
                        b.vy *= -elasticity;
                    }
                }

                // Bucket Collisions (Bottom)
                if (b.y > this.height - 50) {
                    // Check which bucket
                    for(let bucket of this.buckets) {
                        if (b.x > bucket.x && b.x < bucket.x + bucket.w) {
                            // Landed!
                            this.completeBall(b, bucket);
                            break;
                        }
                    }
                    if(b.y > this.height) b.active = false; // Remove if fell through
                }
            }
            
            // Cleanup inactive balls
            this.balls = this.balls.filter(b => b.active);
        }

        completeBall(ball, bucket) {
            ball.active = false;
            const win = ball.bet * bucket.val;
            window.MoonKat.updateBalance(win);
            
            // Visual feedback could be added here (e.g. floating text)
            // console.log(`Ball landed in ${bucket.val}x! Won ${win}`);
        }

        draw() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;

            ctx.clearRect(0, 0, w, h);

            // Draw Pegs
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            for(let p of this.pegs) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fill();
            }

            // Draw Buckets
            for(let b of this.buckets) {
                ctx.fillStyle = b.color;
                // Draw as a rounded rect or just a rect at bottom
                // ctx.fillRect(b.x + 2, b.y, b.w - 4, b.h);
                
                // Draw curved bottom "cup"
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x + b.w, b.y);
                ctx.lineTo(b.x + b.w - 2, b.y + 30);
                ctx.lineTo(b.x + 2, b.y + 30);
                ctx.fill();

                ctx.fillStyle = '#000';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${b.val}x`, b.x + b.w/2, b.y + 20);
            }

            // Draw Balls
            for(let b of this.balls) {
                ctx.fillStyle = b.color;
                ctx.shadowColor = b.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    window.MoonKat.PlinkoGame = PlinkoGame;
})();