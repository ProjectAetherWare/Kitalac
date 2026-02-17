(function() {
    class LimboGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="limbo-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; padding:20px;">
                    <div class="limbo-display" style="font-size:3rem; font-weight:bold; color:var(--accent-primary); font-family:monospace; margin-bottom:10px;">
                        0.00x
                    </div>
                    <div class="limbo-bar-bg" style="width:100%; height:10px; background:#333; border-radius:5px; position:relative; overflow:hidden;">
                        <div class="limbo-progress" style="width:0%; height:100%; background:var(--accent-primary); transition:width 0.1s linear;"></div>
                    </div>
                    <div id="limbo-result" style="margin-top:10px; height:20px;"></div>
                </div>
            `;
            
            this.display = this.container.querySelector('.limbo-display');
            this.progressBar = this.container.querySelector('.limbo-progress');
            this.resultDisplay = this.container.querySelector('#limbo-result');
        }

        async play(bet, choice) {
            // Logic
            const target = parseFloat(choice) || 2.0;
            const flown = Math.random() * 10;
            const isWin = flown > target;
            const payout = isWin ? bet * target : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Launching...";
            this.progressBar.style.width = '0%';
            
            // Animate number going up
            const duration = 1000;
            const startTime = Date.now();
            
            await new Promise(resolve => {
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Simple easing
                    const currentVal = progress * flown;
                    this.display.innerText = `${currentVal.toFixed(2)}x`;
                    this.progressBar.style.width = `${progress * 100}%`;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                };
                requestAnimationFrame(animate);
            });

            // Final state
            this.display.innerText = `${flown.toFixed(2)}x`;
            this.display.style.color = isWin ? 'var(--accent-success)' : 'var(--accent-danger)';
            
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">Win! Target: ${target.toFixed(2)}x (+$${payout.toFixed(2)})</span>`
                : `<span style="color:var(--accent-danger)">Crashed! Target: ${target.toFixed(2)}x (-$${bet.toFixed(2)})</span>`;

            return {
                win: isWin,
                multiplier: target,
                payout: payout,
                message: `Flown: ${flown.toFixed(2)}x`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.LimboGame = LimboGame;
})();
