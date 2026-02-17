(function() {
    class HiloGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="hilo-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; gap:20px;">
                    <div class="hilo-cards" style="display:flex; gap:20px;">
                        <div id="hilo-card-current" class="card-display" style="width:100px; height:150px; background:#fff; color:#333; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; box-shadow:0 4px 8px rgba(0,0,0,0.3);">
                            <span class="card-val">?</span>
                            <span class="card-suit">♠</span>
                        </div>
                        <div id="hilo-arrow" style="display:flex; align-items:center; font-size:2rem; color:#aaa;">
                            <i class="fas fa-arrow-right"></i>
                        </div>
                        <div id="hilo-card-next" class="card-display" style="width:100px; height:150px; background:#444; color:#666; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; border:2px dashed #666;">
                            <span class="card-val">?</span>
                        </div>
                    </div>
                    <div id="hilo-result" style="height:20px; font-weight:bold;"></div>
                </div>
            `;
            
            this.currentCard = this.container.querySelector('#hilo-card-current');
            this.nextCard = this.container.querySelector('#hilo-card-next');
            this.resultDisplay = this.container.querySelector('#hilo-result');
            
            // Initial random card
            this.setCard(this.currentCard, Math.floor(Math.random() * 13) + 1);
        }

        setCard(el, val) {
            const suits = ['♠', '♥', '♦', '♣'];
            const suit = suits[Math.floor(Math.random() * suits.length)];
            const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';
            
            let displayVal = val;
            if (val === 1) displayVal = 'A';
            if (val === 11) displayVal = 'J';
            if (val === 12) displayVal = 'Q';
            if (val === 13) displayVal = 'K';

            el.style.background = '#fff';
            el.style.color = color;
            el.innerHTML = `
                <div style="font-size:1.5rem; position:absolute; top:5px; left:5px;">${displayVal}</div>
                <div style="font-size:3rem;">${suit}</div>
                <div style="font-size:1.5rem; position:absolute; bottom:5px; right:5px; transform:rotate(180deg);">${displayVal}</div>
            `;
        }

        async play(bet, choice) {
            // Logic
            // The existing card is what we base 'higher/lower' on.
            // But wait, arena logic generates current AND next randomly each time.
            // "case 'hilo': const c = ..., n = ...;"
            // This means it doesn't maintain state between rounds in the original logic.
            // To be faithful to `resolveOutcome`, I will generate both fresh.
            
            const c = Math.floor(Math.random() * 13) + 1;
            const n = Math.floor(Math.random() * 13) + 1;
            const isWin = (choice === "higher" && n > c) || (choice === "lower" && n < c);
            const multiplier = 1.95;
            const payout = isWin ? bet * multiplier : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Drawing...";
            
            // Show 'Current' card first (simulate it was there)
            this.setCard(this.currentCard, c);
            
            // Animate 'Next' card flip
            this.nextCard.style.transform = "rotateY(90deg)";
            this.nextCard.style.transition = "transform 0.3s";
            
            await new Promise(r => setTimeout(r, 300));
            
            this.setCard(this.nextCard, n);
            this.nextCard.style.transform = "rotateY(0deg)";
            
            await new Promise(r => setTimeout(r, 300));

            // Result
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">Win! ${c} -> ${n} (+$${payout.toFixed(2)})</span>`
                : `<span style="color:var(--accent-danger)">Loss! ${c} -> ${n} (-$${bet.toFixed(2)})</span>`;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: `${c} -> ${n}`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.HiloGame = HiloGame;
})();
