(function() {
    class PlinkoGame {
        constructor(containerId, currency = 'cash', variant = 'classic') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.variant = variant; // 'classic' or 'plinkox' (which maps to 'plinko' or 'plinkox' in arena logic)
            this.isPlinkoX = variant.includes('plinkox') || variant.includes('X');
            
            // Multipliers
            this.multipliers = this.isPlinkoX 
                ? [0.2, 0.5, 1, 1.5, 3, 20] 
                : [0.2, 0.5, 1, 1.5, 3, 10];

            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="plinko-board" style="display:flex; flex-direction:column; align-items:center; gap:5px; padding:20px; background:rgba(0,0,0,0.2); border-radius:10px;">
                    <div class="peg-row" style="color:#555;">.</div>
                    <div class="peg-row" style="color:#666;">...</div>
                    <div class="peg-row" style="color:#777;">.....</div>
                    <div class="peg-row" style="color:#888;">.......</div>
                    <div class="peg-row" style="color:#999;">.........</div>
                    <div id="plinko-ball-container" style="height:50px; display:flex; align-items:center; justify-content:center; width:100%;">
                        <div id="plinko-ball" style="width:20px; height:20px; background:var(--accent-primary); border-radius:50%; display:none;"></div>
                    </div>
                    <div class="plinko-buckets" style="display:flex; gap:5px; margin-top:10px;">
                        ${this.multipliers.map(m => `
                            <div class="bucket" style="padding:5px 8px; background:#333; border-radius:4px; font-size:0.8rem; color:${m >= 1 ? 'var(--accent-success)' : 'var(--accent-danger)'}">
                                ${m}x
                            </div>
                        `).join('')}
                    </div>
                    <div id="plinko-result" style="margin-top:10px; height:24px; font-weight:bold;"></div>
                </div>
            `;
            
            this.ball = this.container.querySelector('#plinko-ball');
            this.resultDisplay = this.container.querySelector('#plinko-result');
        }

        async play(bet) {
            if (!this.container) return null;
            
            // Visual Animation
            this.ball.style.display = 'block';
            this.ball.style.transform = 'translateY(-100px)';
            this.resultDisplay.innerText = "Dropping...";
            
            // Simple drop animation simulation
            await new Promise(r => setTimeout(r, 100));
            this.ball.style.transition = 'transform 0.8s cubic-bezier(0.5, 0, 0.5, 1)';
            this.ball.style.transform = 'translateY(0)';
            
            await new Promise(r => setTimeout(r, 800)); // Wait for drop

            // Logic
            const multiplier = this.multipliers[Math.floor(Math.random() * this.multipliers.length)];
            const win = multiplier >= 1;
            const payout = bet * multiplier;

            // Update UI
            this.ball.style.display = 'none';
            if (win) {
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-success)">Landed ${multiplier}x (+$${payout.toFixed(2)})</span>`;
            } else {
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-danger)">Landed ${multiplier}x (-$${bet.toFixed(2)})</span>`;
            }

            return {
                win: win,
                multiplier: multiplier,
                payout: payout,
                message: `Landed ${multiplier}x`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.PlinkoGame = PlinkoGame;
})();
