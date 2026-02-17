(function() {
    window.MoonKat = window.MoonKat || {};

    class RevolverGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Revolver", icon: "fa-crosshairs", desc: "1/6 chance to lose it all.", options: ["pull"], cost: 100 };
            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="revolver-cyl"><i class="fas fa-crosshairs fa-3x" style="color:#aaa;"></i></div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 100}" min="1" step="10" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn" style="background:var(--accent-danger);">PULL TRIGGER</button>
                    </div>
                    <div id="game-log" class="game-log">Feeling lucky?</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");

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
            this.log.innerHTML = "Spinning...";
            this.visContainer.innerHTML = '<div class="revolver-cyl"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
            
            setTimeout(() => {
                const dead = Math.random() < 0.166;
                const win = !dead;
                const result = { win, multiplier: 1.2, message: dead ? "BANG!" : "Click...", data: { dead } };
                
                this.visContainer.innerHTML = win 
                    ? `<div style="color:#aaa; font-size:3rem; font-weight:bold;">*CLICK*</div>`
                    : `<div style="color:var(--accent-danger); font-size:4rem; font-weight:bold; animation: shake 0.2s;">BANG!</div>`;

                const payout = win ? bet * 1.2 : 0;
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

    window.MoonKat.RevolverGame = RevolverGame;
})();
