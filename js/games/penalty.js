(function() {
    window.MoonKat = window.MoonKat || {};

    class PenaltyGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Penalty Kick", icon: "fa-futbol", desc: "Pick a corner.", options: ["left", "center", "right"], cost: 25 };
            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="penalty-goal"><div class="goalie">🥅</div>⚽</div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 25}" min="1" step="10" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            <option value="left">LEFT</option>
                            <option value="center">CENTER</option>
                            <option value="right">RIGHT</option>
                        </select>
                        <button id="game-play-btn" class="game-btn">SHOOT</button>
                    </div>
                    <div id="game-log" class="game-log">Pick a spot!</div>
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
            this.log.innerHTML = "Shooting...";
            
            // Animation
            this.visContainer.style.opacity = '0.5';
            this.visContainer.style.transform = 'scale(0.95)';

            setTimeout(() => {
                const choice = this.choiceInput.value;
                const save = ["left", "center", "right"][Math.floor(Math.random()*3)];
                const win = save !== choice;
                const result = { win, multiplier: 1.4, message: win ? "GOAL!" : "SAVED!", data: { save } };
                
                // End Animation
                this.visContainer.style.opacity = '1';
                this.visContainer.style.transform = 'scale(1)';
                
                this.visContainer.innerHTML = result.win 
                    ? `<div style="color:var(--accent-success); font-size:3rem; font-weight:bold; animation: pulse 0.5s;">GOAL! ⚽</div>`
                    : `<div style="color:var(--accent-danger); font-size:3rem; font-weight:bold; animation: shake 0.5s;">SAVED! 🥅</div>`;

                const payout = result.win ? bet * result.multiplier : 0;
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

    window.MoonKat.PenaltyGame = PenaltyGame;
})();
