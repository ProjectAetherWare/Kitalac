(function() {
    window.MoonKat = window.MoonKat || {};

    class SafeGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Vault Breaker", icon: "fa-lock", desc: "Guess the last digit (0-9).", options: ["0", "5", "7", "9"], cost: 60 };
            this.setupUI();
        }

        setupUI() {
             const options = Array.from({length: 10}, (_, i) => String(i));

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="safe-dial"><i class="fas fa-circle-notch fa-3x" style="color:#aaa;"></i></div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 60}" min="1" step="10" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
                        </select>
                        <button id="game-play-btn" class="game-btn">CRACK</button>
                    </div>
                    <div id="game-log" class="game-log">Guess the digit!</div>
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
            this.log.innerHTML = "Cracking...";
            
            // Animation
            this.visContainer.innerHTML = '<div class="safe-dial"><i class="fas fa-circle-notch fa-spin fa-3x" style="color:#aaa;"></i></div>';

            setTimeout(() => {
                const choice = this.choiceInput.value;
                const rolled = Math.floor(Math.random()*10);
                const win = String(rolled) === choice;
                const result = { win, multiplier: 9, message: `Code: ..${rolled}`, data: { rolled } };
                
                // End Animation
                this.visContainer.innerHTML = win 
                    ? `<div style="color:var(--accent-success); font-size:4rem; font-weight:bold; animation: pulse 0.5s;"><i class="fas fa-unlock"></i> ${rolled}</div>`
                    : `<div style="color:var(--accent-danger); font-size:4rem; font-weight:bold; animation: shake 0.5s;"><i class="fas fa-lock"></i> ${rolled}</div>`;

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
            }, 1500);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.SafeGame = SafeGame;
})();
