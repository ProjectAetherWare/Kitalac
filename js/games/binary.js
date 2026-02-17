(function() {
    window.MoonKat = window.MoonKat || {};

    class BinaryGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Binary Option", icon: "fa-network-wired", desc: "0 or 1 outcome.", options: ["0", "1"], cost: 30 };
            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="binary-stream" style="font-family:monospace; font-size:2rem; color:var(--accent-primary);">010110...</div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 30}" min="1" step="10" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            <option value="0">0</option>
                            <option value="1">1</option>
                        </select>
                        <button id="game-play-btn" class="game-btn">EXECUTE</button>
                    </div>
                    <div id="game-log" class="game-log">0 or 1?</div>
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
            this.log.innerHTML = "Processing...";
            
            // Animation
            this.visContainer.style.opacity = '0.5';
            
            let stream = "";
            let interval = setInterval(() => {
                stream = Math.random() > 0.5 ? "1" : "0";
                this.visContainer.innerText = stream + Math.floor(Math.random()*100000);
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                this.visContainer.style.opacity = '1';
                
                const choice = this.choiceInput.value;
                const bit = Math.random() > 0.5 ? "1" : "0";
                const win = bit === choice;
                const result = { win, multiplier: 1.9, message: `Bit: ${bit}`, data: { bit } };
                
                this.visContainer.innerHTML = win 
                    ? `<div style="color:var(--accent-success); font-size:6rem; font-weight:bold; animation: pulse 0.5s;">${bit}</div>`
                    : `<div style="color:var(--accent-danger); font-size:6rem; font-weight:bold; animation: shake 0.5s;">${bit}</div>`;

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

    window.MoonKat.BinaryGame = BinaryGame;
})();
