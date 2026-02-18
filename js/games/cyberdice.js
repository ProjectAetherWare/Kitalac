(function() {
    class CyberDiceGame {
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
                <div class="game-panel" style="border: 1px solid cyan; box-shadow: 0 0 10px cyan;">
                    <h2><i class="fas fa-cube"></i> CyberDice</h2>
                    <p class="section-subtitle">Quantum Randomization Protocol</p>
                    
                    <div class="game-visuals" style="height: 150px; display: flex; align-items: center; justify-content: center; perspective: 600px;">
                        <div id="cyber-die" style="width: 80px; height: 80px; position: relative; transform-style: preserve-3d; transition: transform 1s;">
                            <div class="die-face" style="position: absolute; width: 80px; height: 80px; background: rgba(0,255,255,0.2); border: 2px solid cyan; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: cyan; transform: translateZ(40px);">1</div>
                            <div class="die-face" style="position: absolute; width: 80px; height: 80px; background: rgba(0,255,255,0.2); border: 2px solid cyan; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: cyan; transform: rotateY(180deg) translateZ(40px);">6</div>
                            <div class="die-face" style="position: absolute; width: 80px; height: 80px; background: rgba(0,255,255,0.2); border: 2px solid cyan; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: cyan; transform: rotateY(90deg) translateZ(40px);">5</div>
                            <div class="die-face" style="position: absolute; width: 80px; height: 80px; background: rgba(0,255,255,0.2); border: 2px solid cyan; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: cyan; transform: rotateY(-90deg) translateZ(40px);">2</div>
                            <div class="die-face" style="position: absolute; width: 80px; height: 80px; background: rgba(0,255,255,0.2); border: 2px solid cyan; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: cyan; transform: rotateX(90deg) translateZ(40px);">4</div>
                            <div class="die-face" style="position: absolute; width: 80px; height: 80px; background: rgba(0,255,255,0.2); border: 2px solid cyan; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: cyan; transform: rotateX(-90deg) translateZ(40px);">3</div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <input id="cd-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                        <select id="cd-target" class="game-select">
                            <option value="under-7">Under 7 (x2.3)</option>
                            <option value="over-7">Over 7 (x2.3)</option>
                            <option value="7">Exactly 7 (x5.8)</option>
                        </select>
                        <button id="cd-play-btn" class="game-btn" style="border: 1px solid cyan; color: cyan;">EXECUTE</button>
                    </div>
                    <div id="cd-log" class="game-log">Awaiting input...</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#cd-play-btn");
            this.betInput = this.container.querySelector("#cd-bet");
            this.targetInput = this.container.querySelector("#cd-target");
            this.log = this.container.querySelector("#cd-log");
            this.die = this.container.querySelector("#cyber-die");

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            const target = this.targetInput.value;

            if (!Number.isFinite(bet) || bet <= 0) return;
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Credits";
                return;
            }

            this.playBtn.disabled = true;
            this.log.innerText = "Randomizing...";
            
            // Random rotation
            const xRand = Math.floor(Math.random() * 4) * 360 + 720;
            const yRand = Math.floor(Math.random() * 4) * 360 + 720;
            
            this.die.style.transform = `rotateX(${xRand}deg) rotateY(${yRand}deg)`;

            setTimeout(() => {
                this.resolve(bet, target);
            }, 1000);
        }

        resolve(bet, target) {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const sum = d1 + d2;

            // Reset transform to show result? 
            // Simplified: we just show the result number in log, 
            // the 3D dice is just visual flair that spins.
            // Ideally we'd map rotation to face, but for speed implementation:
            
            let win = false;
            let multiplier = 0;

            if (target === 'under-7' && sum < 7) {
                win = true;
                multiplier = 2.3;
            } else if (target === 'over-7' && sum > 7) {
                win = true;
                multiplier = 2.3;
            } else if (target === '7' && sum === 7) {
                win = true;
                multiplier = 5.8;
            }

            const payout = win ? bet * multiplier : 0;
            
            if (win) {
                this.MK.updateBalance(payout);
                this.log.innerHTML = `<span style="color:cyan">RESULT: ${sum} (${d1}+${d2}) - WIN ${payout.toFixed(2)}</span>`;
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">RESULT: ${sum} (${d1}+${d2}) - LOSS</span>`;
            }

            this.playBtn.disabled = false;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.CyberDiceGame = CyberDiceGame;
})();
