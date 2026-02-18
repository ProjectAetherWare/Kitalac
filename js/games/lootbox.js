(function() {
    window.MoonKat = window.MoonKat || {};

    class LootboxGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 10 : 75;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-box-open"></i> Loot Box</h2>
                    <p class="section-subtitle">Open a case for rare loot! (High Risk)</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div class="loot-box-anim" style="font-size: 5rem; transition: transform 0.5s;"><i class="fas fa-box"></i></div>
                        <div class="loot-result" style="margin-top: 10px; font-size: 1.5rem; height: 30px;"></div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Case Cost (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">OPEN CASE</button>
                    </div>
                    <div id="game-log" class="game-log">Open a case to win!</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.boxIcon = this.container.querySelector(".loot-box-anim");
            this.resultText = this.container.querySelector(".loot-result");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");

            this.playBtn.addEventListener("click", () => this.play());
        }

        updateCurrency(amount) {
            if (this.currency === 'gems') {
                if (window.MoonKat.state.user.premiumBalance + amount < 0) return false;
                window.MoonKat.state.user.premiumBalance += amount;
            } else {
                if (!window.MoonKat.updateBalance(amount)) return false;
            }
            window.MoonKat.renderUserStats();
            return true;
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            if (!Number.isFinite(bet) || bet <= 0) {
                 this.log.innerText = "Invalid Cost";
                 return;
            }

            if (!this.updateCurrency(-bet)) {
                 this.log.innerText = `Insufficient ${this.currency === 'gems' ? 'Gems' : 'Funds'}`;
                 return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Opening...";
            this.boxIcon.innerHTML = '<i class="fas fa-box"></i>';
            this.boxIcon.style.transform = "scale(1.1) rotate(5deg)";
            this.resultText.innerText = "";
            
            // Animation shake
            let shakes = 0;
            const shakeInt = setInterval(() => {
                shakes++;
                this.boxIcon.style.transform = `scale(1.1) rotate(${shakes % 2 === 0 ? -5 : 5}deg)`;
                if(shakes > 5) {
                    clearInterval(shakeInt);
                    this.finishPlay(bet);
                }
            }, 100);
        }

        finishPlay(bet) {
            this.boxIcon.style.transform = "scale(1)";
            this.boxIcon.innerHTML = '<i class="fas fa-box-open"></i>';

            // Logic
            const rand = Math.random();
            let tier = "Common";
            let multiplier = 0.5; // Loss
            let color = "#aaa";

            if (rand > 0.60) { tier = "Uncommon"; multiplier = 1.2; color = "#2ecc71"; }
            if (rand > 0.85) { tier = "Rare"; multiplier = 3.0; color = "#3498db"; }
            if (rand > 0.95) { tier = "Legendary"; multiplier = 10.0; color = "#f1c40f"; }
            if (rand > 0.99) { tier = "Mythic"; multiplier = 50.0; color = "#e74c3c"; }

            const win = multiplier >= 1;
            const result = { win, multiplier, message: `${tier} Item!` };
            
            this.resultText.innerHTML = `<span style="color:${color}; font-weight:bold;">${tier.toUpperCase()}</span>`;

            const payout = bet * multiplier;
            if (payout > 0) this.updateCurrency(payout);

            const xpGain = Math.floor(Math.max(10, bet * 0.1));
            window.MoonKat.addXp(xpGain);

            // Stats
            if(window.MoonKat.state.user.stats) {
                window.MoonKat.state.user.stats.gamesPlayed++;
                window.MoonKat.state.user.stats.totalBets += bet;
                if(win) {
                    window.MoonKat.state.user.stats.wins = (window.MoonKat.state.user.stats.wins || 0) + 1;
                    window.MoonKat.state.user.stats.totalWon += payout;
                } else {
                    window.MoonKat.state.user.stats.totalLost += bet;
                }
            }

            this.log.innerHTML = `${result.message} ${win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
            this.playBtn.disabled = false;
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.LootboxGame = LootboxGame;
})();
