(function() {
    class CoinFlipGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="coinflip-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; gap:20px;">
                    <div id="coin" style="width:100px; height:100px; position:relative; transform-style:preserve-3d; transition:transform 2s ease-out;">
                        <div class="coin-face front" style="width:100%; height:100%; border-radius:50%; background:gold; display:flex; align-items:center; justify-content:center; position:absolute; backface-visibility:hidden; border:4px solid #DAA520; box-shadow:inset 0 0 10px #DAA520;">
                            <span style="font-size:2rem; font-weight:bold; color:#B8860B;">HEADS</span>
                        </div>
                        <div class="coin-face back" style="width:100%; height:100%; border-radius:50%; background:silver; display:flex; align-items:center; justify-content:center; position:absolute; backface-visibility:hidden; transform:rotateY(180deg); border:4px solid #A9A9A9; box-shadow:inset 0 0 10px #A9A9A9;">
                            <span style="font-size:2rem; font-weight:bold; color:#696969;">TAILS</span>
                        </div>
                    </div>
                    <div id="coinflip-result" style="height:20px; font-weight:bold;"></div>
                </div>
            `;
            
            this.coin = this.container.querySelector('#coin');
            this.resultDisplay = this.container.querySelector('#coinflip-result');
        }

        async play(bet, choice) {
            // Logic
            const isHeads = Math.random() > 0.5;
            const resultFace = isHeads ? "heads" : "tails";
            const isWin = resultFace === choice;
            const multiplier = 1.95;
            const payout = isWin ? bet * multiplier : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Flipping...";
            
            // Randomize spins (5-10 spins)
            const spins = 5 + Math.floor(Math.random() * 5);
            // If heads (0deg), we want even spins * 360. If tails (180deg), we want even spins * 360 + 180.
            // But we start from 0.
            const outcomeDeg = isHeads ? 0 : 180;
            const totalDeg = (spins * 360) + outcomeDeg;

            // Reset
            this.coin.style.transition = 'none';
            this.coin.style.transform = 'rotateY(0deg)';
            
            // Force reflow
            void this.coin.offsetWidth;
            
            // Flip
            this.coin.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
            this.coin.style.transform = `rotateY(${totalDeg}deg)`;
            
            await new Promise(r => setTimeout(r, 3000));

            // Result
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">${resultFace.toUpperCase()}! Win $${payout.toFixed(2)}</span>`
                : `<span style="color:var(--accent-danger)">${resultFace.toUpperCase()}! Lost $${bet.toFixed(2)}</span>`;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: `Result: ${resultFace.toUpperCase()}`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.CoinFlipGame = CoinFlipGame;
})();
