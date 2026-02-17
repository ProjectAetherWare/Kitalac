(function() {
    window.MoonKat = window.MoonKat || {};

    class TyperGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Speed Typer", icon: "fa-keyboard", desc: "Type the code fast.", cost: 30 };
            
            this.targetText = "";
            this.startTime = 0;
            this.isPlaying = false;
            this.cost = this.gameData.cost || 30;

            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    <div id="typer-display" style="font-family:monospace; font-size:2rem; background:#222; padding:20px; border-radius:8px; margin:20px 0; letter-spacing:3px; user-select:none;">
                        READY?
                    </div>
                    <div class="game-controls">
                        <input id="typer-input" class="game-input" type="text" placeholder="Type here..." disabled autocomplete="off" />
                        <button id="game-play-btn" class="game-btn">START ($${this.cost})</button>
                    </div>
                    <div id="game-log" class="game-log">Type the code exactly!</div>
                </div>
            `;

            this.display = this.container.querySelector('#typer-display');
            this.input = this.container.querySelector('#typer-input');
            this.btn = this.container.querySelector('#game-play-btn');
            this.log = this.container.querySelector('#game-log');

            this.bindEvents();
        }

        bindEvents() {
            this.btn.addEventListener('click', () => this.startGame());
            this.input.addEventListener('input', () => this.handleInput());
        }

        startGame() {
            if(this.isPlaying) return;
            
            if(!window.MoonKat.updateBalance(-this.cost)) {
                alert("Insufficient Funds");
                return;
            }
            
            this.isPlaying = true;
            this.btn.disabled = true;
            this.input.disabled = false;
            this.input.value = "";
            this.input.focus();
            
            // Generate random code
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            this.targetText = Array(8).fill(0).map(() => chars[Math.floor(Math.random()*chars.length)]).join("");
            
            this.display.innerText = "3...";
            setTimeout(() => this.display.innerText = "2...", 500);
            setTimeout(() => this.display.innerText = "1...", 1000);
            setTimeout(() => {
                this.display.innerText = this.targetText;
                this.display.style.color = "var(--accent-primary)";
                this.startTime = Date.now();
            }, 1500);
        }

        handleInput() {
            if(!this.isPlaying || this.startTime === 0) return;
            const val = this.input.value.toUpperCase();
            this.input.value = val;
            
            if (val === this.targetText) {
                const time = (Date.now() - this.startTime) / 1000;
                this.isPlaying = false;
                this.input.disabled = true;
                this.btn.disabled = false;
                
                let multi = 0;
                if(time < 2.0) multi = 5.0;
                else if(time < 3.0) multi = 2.5;
                else if(time < 4.0) multi = 1.2;
                
                if(multi > 0) {
                    const win = this.cost * multi;
                    window.MoonKat.updateBalance(win);
                    this.display.innerHTML = `<span style="color:var(--accent-success)">${time.toFixed(2)}s (x${multi})</span>`;
                    this.log.innerText = `Success! Won $${win.toFixed(2)}`;
                } else {
                    this.display.innerHTML = `<span style="color:var(--accent-danger)">${time.toFixed(2)}s (Too Slow)</span>`;
                    this.log.innerText = "Too slow!";
                }
            } else if (!this.targetText.startsWith(val)) {
                // Mistake
                this.display.style.color = "var(--accent-danger)";
            } else {
                this.display.style.color = "var(--accent-primary)";
            }
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.TyperGame = TyperGame;
})();
