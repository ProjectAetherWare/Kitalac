(function() {
    window.MoonKat = window.MoonKat || {};

    class OracleGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Oracle", icon: "fa-eye", desc: "Ask the crystal ball.", options: ["yes", "no"], cost: 50 };
            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="oracle-ball"><i class="fas fa-eye fa-3x" style="color:#9b59b6;"></i></div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 50}" min="1" step="10" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            <option value="yes">YES</option>
                            <option value="no">NO</option>
                        </select>
                        <button id="game-play-btn" class="game-btn">ASK</button>
                    </div>
                    <div id="game-log" class="game-log">Ask the Oracle...</div>
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
            this.log.innerHTML = "Consulting...";
            
            // Animation
            this.visContainer.style.opacity = '0.5';
            this.visContainer.style.transform = 'scale(0.95)';

            setTimeout(() => {
                const choice = this.choiceInput.value;
                const ans = Math.random() > 0.5 ? "yes" : "no";
                const win = ans === choice;
                const result = { win, multiplier: 1.9, message: `Oracle says: ${ans.toUpperCase()}`, data: { ans } };
                
                // End Animation
                this.visContainer.style.opacity = '1';
                this.visContainer.style.transform = 'scale(1)';
                
                this.visContainer.innerHTML = `<div style="font-size:3rem; font-weight:bold; color:var(--accent-primary); animation: pulse 0.5s;">${ans.toUpperCase()}</div>`;

                const payout = win ? bet * 1.9 : 0;
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

    window.MoonKat.OracleGame = OracleGame;
})();
