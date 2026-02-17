(function() {
    class MinesGame {
        constructor(containerId, currency = 'cash', options = {}) {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.minesCount = options.mines || 3; // Default 3 mines if not specified
            
            // Setup UI
            this.setupUI();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="mines-game-container" style="display:flex; flex-direction:column; align-items:center;">
                    <div class="mines-grid" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; margin-bottom:10px;">
                        ${Array(25).fill(0).map((_, i) => `
                            <div class="mine-tile" data-index="${i}" style="width:40px; height:40px; background:#333; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;">
                                <div class="tile-content" style="display:none;"></div>
                            </div>
                        `).join('')}
                    </div>
                    <div id="mines-status" style="height:20px; font-weight:bold;"></div>
                </div>
            `;
            
            this.tiles = this.container.querySelectorAll('.mine-tile');
            this.statusDisplay = this.container.querySelector('#mines-status');
        }

        reset() {
            this.tiles.forEach(tile => {
                tile.style.background = '#333';
                tile.querySelector('.tile-content').style.display = 'none';
                tile.querySelector('.tile-content').innerHTML = '';
            });
            this.statusDisplay.innerText = '';
        }

        async play(bet, choice) {
            this.reset();
            
            // Logic from resolveOutcome
            // "choice" is the multiplier option from the game catalog (e.g. "2", "3", "5")
            const multiplier = parseFloat(choice) || 1.5;
            
            // Logic: 70% win chance in original code (r > 0.3)
            const isWin = Math.random() > 0.3;
            
            const result = {
                win: isWin,
                multiplier: multiplier,
                message: isWin ? "Cleared!" : "Boom!",
                payout: isWin ? bet * multiplier : 0
            };

            // Visual Animation
            this.statusDisplay.innerText = "Sweeping...";
            
            // Animate random tiles
            const indices = Array.from({length: 25}, (_, i) => i).sort(() => Math.random() - 0.5);
            const revealedCount = isWin ? 5 : 3; // Reveal some tiles

            for (let i = 0; i < revealedCount; i++) {
                await new Promise(r => setTimeout(r, 200));
                const tile = this.tiles[indices[i]];
                const content = tile.querySelector('.tile-content');
                
                if (isWin || i < revealedCount - 1) {
                    // Safe tile
                    tile.style.background = 'var(--accent-success)';
                    content.innerHTML = '<i class="fas fa-gem"></i>';
                    content.style.display = 'block';
                } else {
                    // Boom on last one if lost
                    tile.style.background = 'var(--accent-danger)';
                    content.innerHTML = '<i class="fas fa-bomb"></i>';
                    content.style.display = 'block';
                }
            }

            // Final status
            this.statusDisplay.innerHTML = result.win 
                ? `<span style="color:var(--accent-success)">CLEARED! (+$${result.payout.toFixed(2)})</span>`
                : `<span style="color:var(--accent-danger)">BOOM! (-$${bet.toFixed(2)})</span>`;

            return result;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.MinesGame = MinesGame;
})();
