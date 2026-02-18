(function() {
    class MarbleRaceGame {
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
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas fa-flag-checkered"></i> Marble Race</h2>
                    <p class="section-subtitle">Bet on the winner!</p>
                    
                    <div id="race-track" style="background: #222; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                        <!-- Marbles rendered here -->
                        <div class="track-lane" style="margin: 5px 0; background: #333; height: 30px; position: relative;">
                            <div class="marble" id="marble-red" style="width: 20px; height: 20px; background: red; border-radius: 50%; position: absolute; top: 5px; left: 0;"></div>
                        </div>
                        <div class="track-lane" style="margin: 5px 0; background: #333; height: 30px; position: relative;">
                            <div class="marble" id="marble-blue" style="width: 20px; height: 20px; background: blue; border-radius: 50%; position: absolute; top: 5px; left: 0;"></div>
                        </div>
                        <div class="track-lane" style="margin: 5px 0; background: #333; height: 30px; position: relative;">
                            <div class="marble" id="marble-green" style="width: 20px; height: 20px; background: green; border-radius: 50%; position: absolute; top: 5px; left: 0;"></div>
                        </div>
                        <div class="track-lane" style="margin: 5px 0; background: #333; height: 30px; position: relative;">
                            <div class="marble" id="marble-yellow" style="width: 20px; height: 20px; background: yellow; border-radius: 50%; position: absolute; top: 5px; left: 0;"></div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <input id="mr-bet" class="game-input" type="number" value="10" min="1" placeholder="Bet" />
                        <select id="mr-pick" class="game-select">
                            <option value="red">Red (x3.8)</option>
                            <option value="blue">Blue (x3.8)</option>
                            <option value="green">Green (x3.8)</option>
                            <option value="yellow">Yellow (x3.8)</option>
                        </select>
                        <button id="mr-play-btn" class="game-btn">START RACE</button>
                    </div>
                    <div id="mr-log" class="game-log">Pick a marble to win!</div>
                </div>
            `;
        }

        bindEvents() {
            this.playBtn = this.container.querySelector("#mr-play-btn");
            this.betInput = this.container.querySelector("#mr-bet");
            this.pickInput = this.container.querySelector("#mr-pick");
            this.log = this.container.querySelector("#mr-log");
            
            this.marbles = {
                red: this.container.querySelector("#marble-red"),
                blue: this.container.querySelector("#marble-blue"),
                green: this.container.querySelector("#marble-green"),
                yellow: this.container.querySelector("#marble-yellow")
            };

            this.playBtn.addEventListener("click", () => this.play());
        }

        play() {
            const bet = parseFloat(this.betInput.value);
            const pick = this.pickInput.value;

            if (!Number.isFinite(bet) || bet <= 0) return;
            if (!this.MK.updateBalance(-bet)) {
                this.log.innerText = "Insufficient Funds";
                return;
            }

            this.playBtn.disabled = true;
            this.log.innerText = "Racing...";
            
            // Reset positions
            Object.values(this.marbles).forEach(m => m.style.left = '0%');
            
            // Race Logic
            let progress = { red: 0, blue: 0, green: 0, yellow: 0 };
            let finished = false;
            
            const interval = setInterval(() => {
                if (finished) return;
                
                for (let key in progress) {
                    // Random speed bump
                    progress[key] += Math.random() * 3; 
                    this.marbles[key].style.left = Math.min(95, progress[key]) + '%';
                    
                    if (progress[key] >= 95) {
                        finished = true;
                        clearInterval(interval);
                        this.resolve(bet, pick, key);
                        break;
                    }
                }
            }, 50);
        }

        resolve(bet, pick, winner) {
            const win = pick === winner;
            const payout = win ? bet * 3.8 : 0;
            
            if (win) {
                this.MK.updateBalance(payout);
                this.log.innerHTML = `<span style="color:#2ecc71">WINNER: ${winner.toUpperCase()}! Won ${payout.toFixed(2)}</span>`;
            } else {
                this.log.innerHTML = `<span style="color:var(--accent-danger)">WINNER: ${winner.toUpperCase()}. You lost.</span>`;
            }
            
            this.playBtn.disabled = false;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.MarbleRaceGame = MarbleRaceGame;
})();
