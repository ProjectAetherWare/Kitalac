(function() {
    window.MoonKat = window.MoonKat || {};

    class ScratchGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Lucky Scratch", icon: "fa-ticket-alt", desc: "Match 3 symbols.", cost: 20 };
            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="scratch-card" style="font-size:3rem; letter-spacing:5px;">▒▒▒▒▒▒</div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 20}" min="1" step="10" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn">SCRATCH</button>
                    </div>
                    <div id="game-log" class="game-log">Match 3 to win!</div>
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
            this.log.innerHTML = "Scratching...";
            
            // Animation
            this.visContainer.style.opacity = '0.5';
            this.visContainer.style.transform = 'scale(0.95)';

            setTimeout(() => {
                const matches = Math.random() < 0.25;
                const result = { win: matches, multiplier: 5, message: matches ? "3 Matches!" : "No match.", data: {} };
                
                // End Animation
                this.visContainer.style.opacity = '1';
                this.visContainer.style.transform = 'scale(1)';
                
                this.visContainer.innerHTML = matches 
                    ? `<div style="color:var(--accent-success); font-size:3rem; font-weight:bold; animation: pulse 0.5s;">💎💎💎</div>`
                    : `<div style="color:#666; font-size:3rem; font-weight:bold;">🍒🍋🔔</div>`;

                const payout = matches ? bet * 5 : 0;
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

    window.MoonKat.ScratchGame = ScratchGame;
})();
