(function() {
    window.MoonKat = window.MoonKat || {};

    class LootboxGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Loot Box", icon: "fa-box-open", desc: "Open a case for rare skins.", cost: 75 };
            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="loot-box-anim"><i class="fas fa-box-open fa-3x"></i></div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.gameData.cost || 75}" min="1" step="10" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn">OPEN CASE</button>
                    </div>
                    <div id="game-log" class="game-log">Open a case!</div>
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
            this.log.innerHTML = "Opening...";
            
            // Animation
            this.visContainer.style.opacity = '0.5';
            this.visContainer.style.transform = 'scale(0.95)';

            setTimeout(() => {
                const rarity = Math.random();
                let tier = "Common";
                let val = 0.5;
                let color = "#aaa";

                if(rarity > 0.6) { tier = "Uncommon"; val = 1.2; color = "#2ecc71"; }
                if(rarity > 0.85) { tier = "Rare"; val = 3; color = "#3498db"; }
                if(rarity > 0.95) { tier = "Legendary"; val = 10; color = "#f1c40f"; }
                if(rarity > 0.99) { tier = "Mythic"; val = 50; color = "#e74c3c"; }

                const result = { win: val >= 1, multiplier: val, message: `${tier} Item`, data: { tier } };
                
                // End Animation
                this.visContainer.style.opacity = '1';
                this.visContainer.style.transform = 'scale(1)';
                
                this.visContainer.innerHTML = `<div style="color:${color}; font-size:2rem; font-weight:bold; animation: pulse 0.5s;">${tier.toUpperCase()}</div>
                                               <div style="font-size:1rem; color:#888;">x${val}</div>`;

                const payout = bet * val;
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

                this.log.innerHTML = `${result.message} ${val >= 1 ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
            }, 1000);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.LootboxGame = LootboxGame;
})();
