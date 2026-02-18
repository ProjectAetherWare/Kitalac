(function() {
    class CoinFlipGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel">
                    <h2>Coinflip</h2>
                    <div class="game-visuals">
                        <div class="coinflip-game-container" style="display:flex; flex-direction:column; align-items:center; width:100%; gap:20px;">
                            <div id="coin" style="width:100px; height:100px; position:relative; transform-style:preserve-3d; transition:transform 2s ease-out;">
                                <div class="coin-face front" style="width:100%; height:100%; border-radius:50%; background:gold; display:flex; align-items:center; justify-content:center; position:absolute; backface-visibility:hidden; border:4px solid #DAA520; box-shadow:inset 0 0 10px #DAA520;">
                                    <span style="font-size:2rem; font-weight:bold; color:#B8860B;">HEADS</span>
                                </div>
                                <div class="coin-face back" style="width:100%; height:100%; border-radius:50%; background:silver; display:flex; align-items:center; justify-content:center; position:absolute; backface-visibility:hidden; transform:rotateY(180deg); border:4px solid #A9A9A9; box-shadow:inset 0 0 10px #A9A9A9;">
                                    <span style="font-size:2rem; font-weight:bold; color:#696969;">TAILS</span>
                                </div>
                            </div>
                            <div id="coinflip-result" style="height:20px; font-weight:bold;"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="bet-input" value="10" min="1" class="game-input">
                        </div>
                        <div class="button-group" style="display:flex; gap:10px;">
                            <button id="btn-heads" class="game-btn" style="background:#DAA520; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.5);">Heads</button>
                            <button id="btn-tails" class="game-btn" style="background:#A9A9A9; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.5);">Tails</button>
                        </div>
                    </div>
                    <div id="game-log" class="game-log"></div>
                </div>
            `;
            
            this.coin = this.container.querySelector('#coin');
            this.resultDisplay = this.container.querySelector('#coinflip-result');
            this.betInput = this.container.querySelector('#bet-input');
            this.btnHeads = this.container.querySelector('#btn-heads');
            this.btnTails = this.container.querySelector('#btn-tails');
            this.log = this.container.querySelector('#game-log');
        }

        bindEvents() {
            const handlePlay = (choice) => {
                const bet = parseFloat(this.betInput.value);
                if (isNaN(bet) || bet <= 0) {
                    alert('Invalid bet amount');
                    return;
                }
                this.play(bet, choice);
            };

            if (this.btnHeads) {
                this.btnHeads.addEventListener('click', () => handlePlay('heads'));
            }
            if (this.btnTails) {
                this.btnTails.addEventListener('click', () => handlePlay('tails'));
            }
        }

        updateBalance(amount) {
            if (typeof window.MK === 'undefined') return;
            
            if (this.currency === 'cash') {
                if (window.MK.updateBalance) window.MK.updateBalance(amount);
            } else if (this.currency === 'gems') {
                if (window.MK.state && window.MK.state.user) {
                    window.MK.state.user.premiumBalance += amount;
                    if (window.MK.refreshUI) window.MK.refreshUI();
                }
            }
        }

        getUserBalance() {
            if (typeof window.MK === 'undefined') return 0;
            if (this.currency === 'cash') {
                return window.MK.state && window.MK.state.user ? window.MK.state.user.balance : 0;
            } else {
                return window.MK.state && window.MK.state.user ? window.MK.state.user.premiumBalance : 0;
            }
        }

        logResult(message, type = 'info') {
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.innerText = message;
            if (this.log.firstChild) {
                this.log.insertBefore(entry, this.log.firstChild);
            } else {
                this.log.appendChild(entry);
            }
            if (this.log.children.length > 10) {
                this.log.removeChild(this.log.lastChild);
            }
        }

        async play(bet, choice) {
            // Check balance
            const currentBalance = this.getUserBalance();
            if (currentBalance < bet) {
                alert("Insufficient funds!");
                return;
            }

            // Deduct bet
            this.updateBalance(-bet);
            this.btnHeads.disabled = true;
            this.btnTails.disabled = true;

            this.logResult(`Bet placed: ${bet} on ${choice.toUpperCase()}`, 'neutral');

            // Logic
            const isHeads = Math.random() > 0.5;
            const resultFace = isHeads ? "heads" : "tails";
            const isWin = resultFace === choice;
            const multiplier = 1.95;
            const payout = isWin ? bet * multiplier : 0;

            // Visual Animation
            this.resultDisplay.innerText = "Flipping...";
            
            // Randomize spins (5-10 spins)
            const spins = 5 + Math.floor(Math.random() * 5);
            // If heads (0deg), we want even spins * 360. If tails (180deg), we want even spins * 360 + 180.
            // But we start from 0.
            const outcomeDeg = isHeads ? 0 : 180;
            const totalDeg = (spins * 360) + outcomeDeg;

            // Reset
            this.coin.style.transition = 'none';
            this.coin.style.transform = 'rotateY(0deg)';
            
            // Force reflow
            void this.coin.offsetWidth;
            
            // Flip
            this.coin.style.transition = 'transform 3s cubic-bezier(0.1, 0.7, 0.1, 1)';
            this.coin.style.transform = `rotateY(${totalDeg}deg)`;
            
            await new Promise(r => setTimeout(r, 3000));

            // Result
            this.resultDisplay.innerHTML = isWin 
                ? `<span style="color:var(--accent-success)">${resultFace.toUpperCase()}! Win $${payout.toFixed(2)}</span>`
                : `<span style="color:var(--accent-danger)">${resultFace.toUpperCase()}! Lost $${bet.toFixed(2)}</span>`;

            // Update Balance if Win
            if (isWin && payout > 0) {
                this.updateBalance(payout);
                this.logResult(`Win: ${resultFace.toUpperCase()} (+$${payout.toFixed(2)})`, 'win');
            } else {
                this.logResult(`Loss: ${resultFace.toUpperCase()} (-$${bet.toFixed(2)})`, 'loss');
            }

            this.btnHeads.disabled = false;
            this.btnTails.disabled = false;

            return {
                win: isWin,
                multiplier: multiplier,
                payout: payout,
                message: `Result: ${resultFace.toUpperCase()}`
            };
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.CoinFlipGame = CoinFlipGame;
})();
