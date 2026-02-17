(function() {
    window.MoonKat = window.MoonKat || {};

    class MemoryGame {
        constructor(containerId, gameData) {
            this.container = document.getElementById(containerId);
            this.gameData = gameData || { name: "Pattern Mind", icon: "fa-brain", desc: "Repeat the sequence.", cost: 25 };
            
            this.sequence = [];
            this.playerIdx = 0;
            this.isPlaying = false;
            this.isShowing = false;
            this.cost = this.gameData.cost || 25;

            this.setupUI();
        }

        setupUI() {
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2><i class="fas ${this.gameData.icon}"></i> ${this.gameData.name}</h2>
                    <p class="section-subtitle">${this.gameData.desc}</p>
                    <div id="memory-grid" style="display:flex; gap:10px; justify-content:center; margin:30px 0;">
                        <div class="mem-btn" data-id="0" style="width:60px; height:60px; background:#444; border-radius:50%; cursor:pointer;"></div>
                        <div class="mem-btn" data-id="1" style="width:60px; height:60px; background:#444; border-radius:50%; cursor:pointer;"></div>
                        <div class="mem-btn" data-id="2" style="width:60px; height:60px; background:#444; border-radius:50%; cursor:pointer;"></div>
                        <div class="mem-btn" data-id="3" style="width:60px; height:60px; background:#444; border-radius:50%; cursor:pointer;"></div>
                    </div>
                    <div class="game-controls">
                        <button id="game-play-btn" class="game-btn">START ($${this.cost})</button>
                    </div>
                    <div id="game-log" class="game-log">Watch the pattern!</div>
                </div>
            `;

            this.btn = this.container.querySelector('#game-play-btn');
            this.log = this.container.querySelector('#game-log');
            this.tiles = this.container.querySelectorAll('.mem-btn');

            this.bindEvents();
        }

        bindEvents() {
            this.btn.addEventListener('click', () => this.startGame());
            this.tiles.forEach((tile, i) => {
                tile.addEventListener('mousedown', () => this.handleTileClick(i, tile));
            });
        }

        async startGame() {
            if(this.isPlaying) return;
            
            if(!window.MoonKat.updateBalance(-this.cost)) {
                alert("Insufficient Funds");
                return;
            }
            
            this.isPlaying = true;
            this.btn.disabled = true;
            this.sequence = [];
            this.playerIdx = 0;
            
            // Generate 5 step pattern
            for(let i=0; i<5; i++) this.sequence.push(Math.floor(Math.random()*4));
            
            this.log.innerText = "Watch...";
            this.isShowing = true;
            
            for(let i=0; i<this.sequence.length; i++) {
                await new Promise(r => setTimeout(r, 600));
                this.flash(this.sequence[i]);
            }
            
            this.isShowing = false;
            this.log.innerText = "Repeat the pattern!";
        }

        flash(idx) {
            const tile = this.tiles[idx];
            if (!tile) return;
            tile.style.background = 'var(--accent-primary)';
            tile.style.boxShadow = '0 0 20px var(--accent-primary)';
            setTimeout(() => {
                tile.style.background = '#444';
                tile.style.boxShadow = 'none';
            }, 300);
        }

        handleTileClick(i, tile) {
            if(!this.isPlaying || this.isShowing) return;
            
            this.flash(i);
            
            if(i === this.sequence[this.playerIdx]) {
                this.playerIdx++;
                if(this.playerIdx >= this.sequence.length) {
                    // Win
                    this.isPlaying = false;
                    this.btn.disabled = false;
                    const payout = this.cost * 3;
                    window.MoonKat.updateBalance(payout);
                    this.log.innerHTML = `<span style="color:var(--accent-success)">Correct! Won $${payout}</span>`;
                }
            } else {
                // Lose
                this.isPlaying = false;
                this.btn.disabled = false;
                this.log.innerHTML = `<span style="color:var(--accent-danger)">Wrong!</span>`;
                tile.style.background = 'red';
                setTimeout(() => { tile.style.background = '#444'; }, 500);
            }
        }

        destroy() {
            this.container.innerHTML = '';
        }
    }

    window.MoonKat.MemoryGame = MemoryGame;
})();
