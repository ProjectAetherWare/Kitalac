(function() {
    class SlotsGame {
        constructor(containerId, currency = 'cash') {
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
            const gameName = this.currency === 'gems' ? 'Gem Slots' : 'Neon Slots';
            const gameDesc = 'Jackpot awaits.';
            const icon = 'fa-gamepad';

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${icon}"></i> ${gameName}</h2>
                    <p class="section-subtitle">${gameDesc}</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="slots-container" style="display: flex; gap: 10px; font-size: 3rem; background: #222; padding: 20px; border-radius: 10px; border: 2px solid var(--accent-primary);">
                            <div class="reel" id="reel-1">7️⃣</div>
                            <div class="reel" id="reel-2">7️⃣</div>
                            <div class="reel" id="reel-3">7️⃣</div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <input id="game-bet" class="game-input" type="number" value="${this.currency === 'gems' ? 5 : 10}" min="1" step="${this.currency === 'gems' ? 1 : 5}" placeholder="Bet Amount" />
                        <button id="game-play-btn" class="game-btn">SPIN</button>
                    </div>
                    <div id="game-log" class="game-log">Spin the reels!</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.log = this.container.querySelector("#game-log");
            this.reels = [
                this.container.querySelector("#reel-1"),
                this.container.querySelector("#reel-2"),
                this.container.querySelector("#reel-3")
            ];

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);

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
            
            // Animation loop
            let spins = 0;
            const maxSpins = 20;
            const symbols = ["🍒", "🍋", "💎", "7️⃣", "🔔"];
            
            const interval = setInterval(() => {
                this.reels.forEach(r => r.innerText = symbols[Math.floor(Math.random() * symbols.length)]);
                spins++;
                if (spins >= maxSpins) {
                    clearInterval(interval);
                    this.resolve(bet);
                }
            }, 100);
        }

        resolve(bet) {
            const s = ["🍒", "🍋", "💎", "7️⃣", "🔔"];
            const a = s[Math.floor(Math.random()*s.length)];
            const b = s[Math.floor(Math.random()*s.length)];
            const c = s[Math.floor(Math.random()*s.length)];
            
            // Set final symbols
            this.reels[0].innerText = a;
            this.reels[1].innerText = b;
            this.reels[2].innerText = c;

            // Logic
            // Win condition from arena.js: (a===b && b===c) || (a===b || b===c || a===c) -- Wait, arena logic was loose
            // Arena logic: const win = (a===b && b===c) || (a===b || b===c || a===c && Math.random() < 0.3);
            // Let's refine it slightly to be more standard but keep spirit
            
            const isJackpot = (a === b && b === c);
            const isPair = (a === b || b === c || a === c);
            
            let multiplier = 0;
            let message = "";
            let win = false;

            if (isJackpot) {
                win = true;
                multiplier = a === "7️⃣" ? 50 : 20;
                message = "JACKPOT! " + (a === "7️⃣" ? "MEGA WIN!" : "Big Win!");
            } else if (isPair) {
                // Arena logic had random chance for pair win? "a===c && Math.random() < 0.3"
                // Let's make pairs always win small or follow arena strictly.
                // Arena: const win = (a===b && b===c) || (a===b || b===c || a===c && Math.random() < 0.3);
                // It seems pairs are not guaranteed wins in Arena logic, mainly for 3-matches.
                // Let's improve it: Pair = 1.5x (Refund + profit), Jackpot = 20-50x
                win = true;
                multiplier = 1.5;
                message = "Pair matched!";
            } else {
                win = false;
                message = "No match.";
            }

            const payout = win ? bet * multiplier : 0;

            if (win) {
                this._updateBalance(payout);
                this.log.innerHTML = `<span style="color:var(--accent-success)">${message} (+${this.formatCurrency(payout)})</span>`;
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">${message}</span>`;
            }

            // XP and Stats
             if (this.currency === 'cash') {
                this.MK.addXp(Math.floor(bet * 0.1));
                if (this.MK.incrementStat) {
                    this.MK.incrementStat('gamesPlayed');
                    if (win) this.MK.incrementStat('wins');
                }
            }

            this.playBtn.disabled = false;
        }

        _updateBalance(amount) {
            if (this.currency === 'cash') {
                return this.MK.updateBalance(amount);
            } else {
                if (this.MK.state.user.premiumBalance + amount < 0) return false;
                this.MK.state.user.premiumBalance += amount;
                if (typeof this.MK.saveUser === 'function') this.MK.saveUser();
                if (window.app && window.app.updateUI) window.app.updateUI();
                return true;
            }
        }

        formatCurrency(amount) {
            return this.currency === 'cash' ? `$${amount.toFixed(2)}` : `${amount} Gems`;
        }
    }

    window.MoonKat.SlotsGame = SlotsGame;
})();
