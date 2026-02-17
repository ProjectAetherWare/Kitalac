(function() {
    class WheelGame {
        constructor(containerId, currency = 'cash', variant = 'wheel') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.variant = variant; // 'wheel' or 'crazywheel'
            
            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            // Using a simple CSS spinner for now as per getGameHTML
            const iconClass = this.variant === 'crazywheel' ? 'fa-fan' : 'fa-dharmachakra';
            const color = this.variant === 'crazywheel' ? 'var(--accent-premium)' : 'var(--text-color)';
            
            this.container.innerHTML = `
                <div class="wheel-game-container" style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                    <div class="wheel-spinner" style="font-size:4rem; color:${color}; transition:transform 2s cubic-bezier(0.25, 0.1, 0.25, 1);">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div id="wheel-result" style="height:24px; font-weight:bold;"></div>
                </div>
            `;
            
            this.spinner = this.container.querySelector('.wheel-spinner');
            this.resultDisplay = this.container.querySelector('#wheel-result');
        }

        async play(bet) {
            // Logic
            let multipliers;
            if (this.variant === 'crazywheel') {
                multipliers = [0, 0, 0, 2, 5, 10, 25, 100];
            } else {
                multipliers = [0, 0, 1.5, 1.5, 2, 3];
            }
            
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            const isWin = multiplier > 0;
            const payout = bet * multiplier;

            // Visual Animation
            this.resultDisplay.innerText = "Spinning...";
            
            // Reset rotation
            this.spinner.style.transition = 'none';
            this.spinner.style.transform = 'rotate(0deg)';
            
            // Force reflow
            void this.spinner.offsetWidth;
            
            // Spin
            const rotations = 5 + Math.random() * 5; // 5-10 full spins
            const deg = rotations * 360;
            
            this.spinner.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
            this.spinner.style.transform = `rotate(${deg}deg)`;
            
            await new Promise(r => setTimeout(r, 3000));

            // Show result
            const resultText = `${multiplier}x`;
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">${resultText} - WIN $${payout.toFixed(2)}</span>`
                : `<span style="color:var(--accent-danger)">${resultText} - LOSS</span>`;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: `Spin: ${multiplier}x`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.WheelGame = WheelGame;
})();
