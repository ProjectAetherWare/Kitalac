(function() {
    window.MoonKat = window.MoonKat || {};

    class GraphGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
        }

        setupUI() {
            const currencyLabel = this.currency === 'gems' ? 'GEMS' : 'CASH';
            const step = this.currency === 'gems' ? 1 : 10;
            const min = this.currency === 'gems' ? 1 : 10;
            const defaultBet = this.currency === 'gems' ? 5 : 35;

            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-chart-line"></i> Trade Graph</h2>
                    <p class="section-subtitle">Predict if the next tick is UP or DOWN.</p>
                    
                    <div class="game-visuals" id="game-visuals-container" style="min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <canvas id="graph-canvas" width="300" height="150" style="background: rgba(0,0,0,0.3); border-radius: 4px;"></canvas>
                        <div id="graph-result" style="margin-top: 10px; font-weight: bold; font-size: 1.2rem; min-height: 24px;"></div>
                    </div>

                    <div class="game-controls">
                        <div class="control-group">
                            <label>Bet Amount (${currencyLabel})</label>
                            <input id="game-bet" class="game-input" type="number" value="${defaultBet}" min="${min}" step="${step}" />
                        </div>
                        <div class="control-group">
                            <label>Prediction</label>
                            <div class="btn-group-row">
                                <button class="game-btn-opt active" data-choice="up" style="color: var(--accent-success);"><i class="fas fa-arrow-trend-up"></i> UP</button>
                                <button class="game-btn-opt" data-choice="down" style="color: var(--accent-danger);"><i class="fas fa-arrow-trend-down"></i> DOWN</button>
                            </div>
                        </div>
                        <button id="game-play-btn" class="game-btn action-btn">TRADE</button>
                    </div>
                    <div id="game-log" class="game-log">Make a prediction!</div>
                </div>
            `;

            this.canvas = this.container.querySelector("#graph-canvas");
            this.ctx = this.canvas.getContext('2d');
            this.resultDiv = this.container.querySelector("#graph-result");
            this.log = this.container.querySelector("#game-log");
            this.playBtn = this.container.querySelector("#game-play-btn");
            this.betInput = this.container.querySelector("#game-bet");
            this.optionBtns = this.container.querySelectorAll(".game-btn-opt");
            
            this.selectedChoice = 'up'; // Default

            this.optionBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.optionBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedChoice = btn.getAttribute('data-choice');
                });
            });

            this.playBtn.addEventListener("click", () => this.play());
            
            // Draw initial static line
            this.drawGraph([50, 60, 55, 70, 65, 80, 75, 90]);
        }

        drawGraph(points) {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            ctx.clearRect(0, 0, w, h);
            ctx.beginPath();
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            
            const step = w / (points.length - 1);
            
            points.forEach((p, i) => {
                const x = i * step;
                const y = h - (p / 100 * h); // Scale 0-100 to canvas height
                if(i===0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
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
            this.log.innerHTML = "Trading...";
            this.resultDiv.innerText = "";
            
            // Generate graph data
            let points = [50];
            for(let i=0; i<8; i++) {
                let last = points[points.length-1];
                points.push(Math.max(10, Math.min(90, last + (Math.random()*30 - 15))));
            }
            this.drawGraph(points);

            // Animate final tick
            let step = 0;
            const animateInt = setInterval(() => {
                let last = points[points.length-1];
                const finalP = Math.max(10, Math.min(90, last + (Math.random()*40 - 20)));
                const newPoints = [...points, finalP];
                this.drawGraph(newPoints);
                step++;
                
                if(step > 5) { // Stop
                    clearInterval(animateInt);
                    this.finishPlay(bet, points[points.length-1], finalP);
                } else {
                    points.push(finalP);
                }
            }, 200);
        }

        finishPlay(bet, lastVal, finalVal) {
            const isUp = finalVal > lastVal;
            const won = (this.selectedChoice === 'up' && isUp) || (this.selectedChoice === 'down' && !isUp);
            const multiplier = 1.9;

            const payout = won ? bet * multiplier : 0;
            if (payout > 0) this.updateCurrency(payout);

            const xpGain = Math.floor(Math.max(10, bet * 0.1));
            window.MoonKat.addXp(xpGain);

            if(window.MoonKat.state.user.stats) {
                window.MoonKat.state.user.stats.gamesPlayed++;
                window.MoonKat.state.user.stats.totalBets += bet;
                if(won) {
                    window.MoonKat.state.user.stats.wins = (window.MoonKat.state.user.stats.wins || 0) + 1;
                    window.MoonKat.state.user.stats.totalWon += payout;
                } else {
                    window.MoonKat.state.user.stats.totalLost += bet;
                }
            }
            
            this.resultDiv.innerHTML = isUp 
                ? `<span style="color:var(--accent-success)">UP (+${(finalVal-lastVal).toFixed(1)})</span>` 
                : `<span style="color:var(--accent-danger)">DOWN (${(finalVal-lastVal).toFixed(1)})</span>`;

            this.log.innerHTML = `${won ? "PROFIT!" : "LOSS!"} ${won ? `<span style="color:var(--accent-success)">+${payout.toFixed(2)}</span>` : `<span style="color:var(--accent-danger)">-${bet.toFixed(2)}</span>`} (+${xpGain} XP)`;
            this.playBtn.disabled = false;
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.GraphGame = GraphGame;
})();
