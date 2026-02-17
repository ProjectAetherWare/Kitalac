(function() {
    class KenoGame {
        constructor(containerId, currency = 'cash', options = {}) {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.balls = 20; // Standard Keno usually has 80, but HTML in arena uses 20 for simplicity
            
            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="keno-container" style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                    <div class="keno-grid" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px;">
                        ${Array(this.balls).fill(0).map((_, i) => `
                            <div class="keno-ball" id="ball-${i+1}" style="width:30px; height:30px; background:#333; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; color:#aaa;">
                                ${i+1}
                            </div>
                        `).join('')}
                    </div>
                    <div id="keno-result" style="height:20px; font-weight:bold; margin-top:10px;"></div>
                </div>
            `;
            
            this.resultDisplay = this.container.querySelector('#keno-result');
        }

        reset() {
            for(let i=1; i<=this.balls; i++) {
                const ball = this.container.querySelector(`#ball-${i}`);
                if(ball) {
                    ball.style.background = '#333';
                    ball.style.color = '#aaa';
                    ball.style.transform = 'scale(1)';
                }
            }
            this.resultDisplay.innerText = '';
        }

        async play(bet, choice) {
            this.reset();
            
            // Logic from arena.js
            // "hits" is random 0-4.
            const hitsCount = Math.floor(Math.random() * 5); 
            // Logic check: arena.js logic is `hits % 2 === 0`
            const isEven = hitsCount % 2 === 0;
            const isWin = (choice === 'even' && isEven) || (choice === 'odd' && !isEven);
            const multiplier = 1.9;
            const payout = isWin ? bet * multiplier : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Drawing...";
            
            // Select random balls to highlight
            // We need to pick 'hitsCount' unique numbers from 1-20
            const chosenBalls = [];
            while(chosenBalls.length < hitsCount) {
                const num = Math.floor(Math.random() * this.balls) + 1;
                if(!chosenBalls.includes(num)) chosenBalls.push(num);
            }

            // Animate revealing them one by one
            for (const num of chosenBalls) {
                await new Promise(r => setTimeout(r, 400));
                const ball = this.container.querySelector(`#ball-${num}`);
                if (ball) {
                    ball.style.background = 'var(--accent-primary)';
                    ball.style.color = '#fff';
                    ball.style.transform = 'scale(1.1)';
                    ball.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }
            }

            // Show result
            const resultText = `${hitsCount} hits (${isEven ? 'EVEN' : 'ODD'})`;
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">${resultText} - WIN $${payout.toFixed(2)}</span>`
                : `<span style="color:var(--accent-danger)">${resultText} - LOST $${bet.toFixed(2)}</span>`;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: resultText
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.KenoGame = KenoGame;
})();
