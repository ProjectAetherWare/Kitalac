(function() {
    class RouletteGame {
        constructor(containerId, currency = 'cash') {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.MK = window.MoonKat;
            
            if (!this.container) return;
            
            this.init();
        }

        init() {
            this.render();
            this.bindEvents();
        }

        render() {
            const gameName = this.currency === 'gems' ? 'Gem Roulette' : 'Cosmic Spin';
            const gameDesc = this.currency === 'gems' ? 'Spin for Gems.' : 'Red, Black, or Green.';
            const icon = 'fa-life-ring';

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${icon}"></i> ${gameName}</h2>
                    <p class="section-subtitle">${gameDesc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div class="roulette-wheel" id="roulette-wheel" style="transition: transform 3s ease-out; width: 100px; height: 100px; border-radius: 50%; border: 5px solid #333; position: relative; display: flex; align-items: center; justify-content: center; background: conic-gradient(red 0% 48%, black 48% 96%, green 96% 100%);">
                            <div class="wheel-inner" style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 10px;"></div>
                        </div>
                        <div id="roulette-result-text" style="margin-top: 20px; font-size: 1.5rem; font-weight: bold;"></div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.currency === 'gems' ? 10 : 50}" min="1" step="${this.currency === 'gems' ? 1 : 10}" placeholder="Bet Amount" />
                        <select id="game-choice" class="game-select">
                            <option value="red">RED (2x)</option>
                            <option value="black">BLACK (2x)</option>
                            <option value="green">GREEN (14x)</option>
                        </select>
                        <button id="game-play-btn" class="game-btn">SPIN WHEEL</button>
                    </div>
                    <div id="game-log" class="game-log">Place your bet...</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.choiceInput = this.container.querySelector("#game-choice");
            this.log = this.container.querySelector("#game-log");
            this.wheel = this.container.querySelector("#roulette-wheel");
            this.resultText = this.container.querySelector("#roulette-result-text");

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            const choice = this.choiceInput.value;

            if (!Number.isFinite(bet) || bet <= 0) {
                this.log.innerText = "Invalid Bet";
                return;
            }

            if (!this._updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Spinning...";
            this.resultText.innerText = "";
            
            // Animation
            const rotations = 5 + Math.random() * 5;
            this.wheel.style.transition = 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)';
            this.wheel.style.transform = `rotate(${rotations * 360}deg)`;

            setTimeout(() => {
                this.resolve(bet, choice);
                this.wheel.style.transition = 'none';
                this.wheel.style.transform = 'rotate(0deg)';
            }, 3000);
        }

        resolve(bet, choice) {
            const r = Math.random();
            const res = r < 0.48 ? "red" : r < 0.96 ? "black" : "green";
            const win = res === choice;
            const multiplier = res === "green" ? 14 : 2;
            const payout = win ? bet * multiplier : 0;

            // Update Visuals
            let color = res === 'red' ? 'var(--accent-danger)' : (res === 'black' ? '#888' : 'var(--accent-success)');
            this.resultText.innerHTML = `<span style="color:${color}">${res.toUpperCase()}</span>`;

            if (win) {
                this._updateBalance(payout);
                this.log.innerHTML = `<span style="color:var(--accent-success)">WON ${this.formatCurrency(payout)}! Ball landed on ${res.toUpperCase()}.</span>`;
                this.triggerWinEffect();
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">LOST. Ball landed on ${res.toUpperCase()}.</span>`;
            }

            // Stats & XP
            if (this.currency === 'cash') {
                const xpGain = Math.floor(Math.max(10, bet * 0.08));
                this.MK.addXp(xpGain);
                if (this.MK.incrementStat) {
                    this.MK.incrementStat('gamesPlayed');
                    this.MK.incrementStat('totalBets');
                    if (win) {
                        this.MK.incrementStat('wins');
                        this.MK.incrementStat('totalWon', payout);
                    } else {
                        this.MK.incrementStat('totalLost', bet);
                    }
                }
            }

            this.playBtn.disabled = false;
        }

        _updateBalance(amount) {
            if (this.currency === 'cash') {
                return this.MK.updateBalance(amount);
            } else {
                // Gems handling
                if (this.MK.state.user.premiumBalance + amount < 0) return false;
                this.MK.state.user.premiumBalance += amount;
                // Trigger UI update if possible, otherwise assume global loop handles it or specific UI update needed
                // Assuming MK.updateBalance might trigger UI refresh even if cash doesn't change, or we need to update UI manually.
                // Since I don't see a separate updateUI for gems, I'll assume referencing state is enough for persistence if autosaved, 
                // but for UI we might need to update a DOM element if it exists.
                // Let's try to find a UI update function.
                if (typeof this.MK.saveUser === 'function') this.MK.saveUser();
                
                // Hack to refresh UI:
                const gemDisplay = document.getElementById('user-gems-display'); // Hypothetical ID
                if(gemDisplay) gemDisplay.innerText = Math.floor(this.MK.state.user.premiumBalance);
                
                // Also trigger generic update if available
                if (window.app && window.app.updateUI) window.app.updateUI();
                
                return true;
            }
        }

        formatCurrency(amount) {
            return this.currency === 'cash' ? `$${amount.toFixed(2)}` : `${amount} Gems`;
        }

        triggerWinEffect() {
            // Simple visual effect could go here
        }
    }

    window.MoonKat.RouletteGame = RouletteGame;
})();
