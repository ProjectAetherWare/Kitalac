(function() {
    window.MoonKat = window.MoonKat || {};

    class RevolverGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 20 : 100;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-crosshairs"></i> Revolver</h2>
                    <p class="section-subtitle">1/6 chance to lose it all. 5/6 chance to win 1.18x.</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div class="revolver-cylinder" style="width: 150px; height: 150px; border-radius: 50%; border: 5px solid #444; position: relative;">
                            <!-- Chambers -->
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; top: 10px; left: 55px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; top: 40px; right: 10px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; bottom: 40px; right: 10px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; bottom: 10px; left: 55px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; bottom: 40px; left: 10px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; top: 40px; left: 10px;"></div>
                            
                            <div style="position: absolute; width: 10px; height: 10px; background: red; top: 0; left: 70px;"></div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">PULL TRIGGER</button>
                    </div>
                    <div id="game-log" class="game-log">Risk it?</div>
                </div>
            `;

            this.visContainer = this.container.querySelector("#game-visuals-container");
            this.cylinder = this.container.querySelector(".revolver-cylinder");
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
                 this.log.innerText = "Invalid Bet";
                 return;
            }

            if (!this.updateCurrency(-bet)) {
                 this.log.innerText = `Insufficient ${this.currency === 'gems' ? 'Gems' : 'Funds'}`;
                 return;
            }

            this.playBtn.disabled = true;
            this.log.innerHTML = "Spinning...";
            
            // Animation
            const rotations = 720 + Math.floor(Math.random() * 360);
            this.cylinder.style.transition = 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)';
            this.cylinder.style.transform = `rotate(${rotations}deg)`;

            setTimeout(() => {
                // 1/6 chance to lose (fire)
                const fire = Math.random() < (1/6);
                const multiplier = 1.18; // Low payout because high win chance (5/6 = 83%)
                
                // Visual
                if(fire) {
                     this.visContainer.innerHTML = '<div style="font-size: 5rem; animation: shake 0.5s;">💥</div>';
                } else {
                     this.visContainer.innerHTML = '<div style="font-size: 5rem; color: #555;">💨</div>';
                }

                const win = !fire;
                const payout = win ? bet * multiplier : 0;

                if (payout > 0) this.updateCurrency(payout);

                const xpGain = Math.floor(Math.max(10, bet * 0.1));
                window.MoonKat.addXp(xpGain);

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

                this.log.innerHTML = `${fire ? "BANG! You lost." : "CLICK. You survived."} ${win ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
                this.playBtn.disabled = false;
                
                // Reset visuals after delay
                setTimeout(() => {
                    this.cylinder.style.transition = 'none';
                    this.cylinder.style.transform = 'rotate(0deg)';
                    this.visContainer.innerHTML = `
                        <div class="revolver-cylinder" style="width: 150px; height: 150px; border-radius: 50%; border: 5px solid #444; position: relative;">
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; top: 10px; left: 55px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; top: 40px; right: 10px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; bottom: 40px; right: 10px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; bottom: 10px; left: 55px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; bottom: 40px; left: 10px;"></div>
                            <div class="chamber" style="width: 30px; height: 30px; border-radius: 50%; background: #222; position: absolute; top: 40px; left: 10px;"></div>
                            <div style="position: absolute; width: 10px; height: 10px; background: red; top: 0; left: 70px;"></div>
                        </div>
                    `;
                    this.cylinder = this.container.querySelector(".revolver-cylinder");
                }, 2000);

            }, 1000);
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.RevolverGame = RevolverGame;
})();
