(function() {
    class TowerGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="tower-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; gap:20px;">
                    <div class="tower-ladder" style="position:relative; width:60px; height:200px; border-left:4px solid #555; border-right:4px solid #555; display:flex; flex-direction:column-reverse; justify-content:space-around;">
                        <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                        <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                        <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                        <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                        <div class="rung" style="width:100%; height:4px; background:#555;"></div>
                        
                        <div id="climber" style="position:absolute; bottom:0; left:50%; transform:translate(-50%, 0); font-size:2rem; transition:bottom 0.5s ease-out;">
                            🧗
                        </div>
                    </div>
                    <div id="tower-result" style="height:20px; font-weight:bold;"></div>
                </div>
            `;
            
            this.climber = this.container.querySelector('#climber');
            this.resultDisplay = this.container.querySelector('#tower-result');
        }

        async play(bet, choice) {
            // Logic
            const canClimb = Math.random() > 0.3; // 70% chance to climb
            const multiplier = 1.5;
            const payout = canClimb ? bet * multiplier : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Climbing...";
            
            // Start at bottom
            this.climber.style.bottom = '0';
            this.climber.style.opacity = '1';
            
            await new Promise(r => setTimeout(r, 200));
            
            // Climb up
            this.climber.style.bottom = '160px'; // Top
            
            await new Promise(r => setTimeout(r, 600));

            if (canClimb) {
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-success)">Reached the top! (+$${payout.toFixed(2)})</span>`;
                // Celebrate
                this.climber.innerHTML = '🚩';
            } else {
                // Fall
                this.climber.style.transition = 'bottom 0.3s ease-in';
                this.climber.style.bottom = '0';
                await new Promise(r => setTimeout(r, 300));
                this.climber.innerHTML = '💥';
                this.resultDisplay.innerHTML = `<span style="color:var(--accent-danger)">Fell! (-$${bet.toFixed(2)})</span>`;
            }
            
            // Reset icon after a bit
            setTimeout(() => {
                this.climber.innerHTML = '🧗';
                if(!canClimb) {
                     this.climber.style.transition = '';
                     this.climber.style.bottom = '0';
                }
            }, 2000);

            return {
                win: canClimb,
                multiplier: multiplier,
                payout: payout,
                message: canClimb ? "Climbed!" : "Fell!"
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.TowerGame = TowerGame;
})();
