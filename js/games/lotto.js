(function() {
    window.MoonKat = window.MoonKat || {};

    class LottoGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Moon Lotto", icon: "fa-ticket", desc: "Pick a lucky number (1-10).", options: ["1", "3", "5", "7", "9"], cost: 10 };
            this.setupUI();
        }

        setupUI() {
            // Generate options 1-10
            const options = Array.from({length: 10}, (_, i) => String(i + 1));

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="lotto-balls"><span class="ball" style="font-size:3rem; background:#444; border-radius:50%; width:80px; height:80px; display:flex; align-items:center; justify-content:center;">?</span></div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 10}" min="1" step="10" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
                        </select>
                        <button id="game-play-btn" class="game-btn">DRAW</button>
                    </div>
                    <div id="game-log" class="game-log">Pick a number!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.choiceInput = this.container.querySelector("#game-choice");

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) {
                 this.log.innerText = "Invalid Bet";
                 return;
            }
            if (!window.MoonKat.updateBalance(-bet)) {
                 this.log.innerText = "Insufficient Funds";
                 return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Drawing...";
            
            // Animation
            this.visContainer.style.opacity = '0.5';
            this.visContainer.style.transform = 'scale(0.95)';

            setTimeout(() => {
                const choice = this.choiceInput.value;
                const n = Math.floor(Math.random()*10)+1;
                const win = String(n) === choice;
                const result = { win, multiplier: 9, message: `Ball: ${n}`, data: { n } };
                
                // End Animation
                this.visContainer.style.opacity = '1';
                this.visContainer.style.transform = 'scale(1)';
                
                this.visContainer.innerHTML = result.win 
                    ? `<div style="background:var(--accent-success); color:black; font-size:3rem; font-weight:bold; border-radius:50%; width:80px; height:80px; display:flex; align-items:center; justify-content:center; animation: pulse 0.5s;">${n}</div>`
                    : `<div style="background:#444; color:white; font-size:3rem; font-weight:bold; border-radius:50%; width:80px; height:80px; display:flex; align-items:center; justify-content:center; animation: shake 0.5s;">${n}</div>`;

                const payout = win ? bet * 9 : 0;
                if (payout > 0) window.MoonKat.updateBalance(payout);

                const xpGain = Math.floor(Math.max(10, bet * 0.08));
                window.MoonKat.addXp(xpGain);

                if(window.MoonKat.incrementStat) {
                    window.MoonKat.incrementStat('gamesPlayed');
                    window.MoonKat.incrementStat('totalBets');
                    if(result.win) {
                        window.MoonKat.incrementStat('wins');
                        window.MoonKat.incrementStat('totalWon', payout);
                    } else {
                        window.MoonKat.incrementStat('totalLost', bet);
                    }
                }

                this.log.innerHTML = `${result.message} ${result.win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 1000);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.LottoGame = LottoGame;
})();
