(function() {
    class DiamondsGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            this.gems = ['💎', 'Ruby', 'Emerald', 'Sapphire', 'Gold', 'Amethyst', 'Topaz']; // Just placeholders or use colors
            this.colors = ['#0ff', '#f00', '#0f0', '#00f', '#ffd700', '#9966cc', '#ffcc00'];
            
            this.payouts = {
                5: 50,
                4: 10,
                3: 3,
                2: 0.1, // Pair is basically a loss
                0: 0
            };
            
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel diamonds-game">
                    <div class="game-header">
                        <h2>Diamonds</h2>
                        <div class="balance-display">Balance: <span id="diamonds-balance">0.00</span></div>
                    </div>
                    <div class="game-visuals" style="padding:20px; text-align:center;">
                        <div class="gem-slots" style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">
                            <div class="gem-slot" id="gem-0" style="width:60px; height:60px; background:#333; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:2em; box-shadow:inset 0 0 10px #000;">?</div>
                            <div class="gem-slot" id="gem-1" style="width:60px; height:60px; background:#333; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:2em; box-shadow:inset 0 0 10px #000;">?</div>
                            <div class="gem-slot" id="gem-2" style="width:60px; height:60px; background:#333; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:2em; box-shadow:inset 0 0 10px #000;">?</div>
                            <div class="gem-slot" id="gem-3" style="width:60px; height:60px; background:#333; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:2em; box-shadow:inset 0 0 10px #000;">?</div>
                            <div class="gem-slot" id="gem-4" style="width:60px; height:60px; background:#333; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:2em; box-shadow:inset 0 0 10px #000;">?</div>
                        </div>
                        <div class="payout-info" style="font-size:0.8em; color:#888;">
                            5x: 50x | 4x: 10x | 3x: 3x
                        </div>
                    </div>
                    <div class="game-controls">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="diamonds-bet" value="10" min="1" class="game-input">
                        </div>
                        <button id="diamonds-play" class="game-btn action-btn">Play</button>
                    </div>
                    <div id="diamonds-log" class="game-log"></div>
                </div>
            `;
            
            this.elements = {
                balance: this.container.querySelector('#diamonds-balance'),
                slots: [0,1,2,3,4].map(i => this.container.querySelector(`#gem-${i}`)),
                betInput: this.container.querySelector('#diamonds-bet'),
                playBtn: this.container.querySelector('#diamonds-play'),
                log: this.container.querySelector('#diamonds-log')
            };

            this.updateBalanceDisplay();
        }

        bindEvents() {
            this.elements.playBtn.addEventListener('click', () => this.play());
        }
        
        getUserBalance() {
             if (typeof window.MK === 'undefined') return 0;
            return this.currency === 'cash' 
                ? (window.MK.state?.user?.balance || 0)
                : (window.MK.state?.user?.premiumBalance || 0);
        }

        updateBalanceDisplay() {
             this.elements.balance.innerText = this.getUserBalance().toFixed(2);
        }
        
        updateBalance(amount) {
            if (typeof window.MK !== 'undefined') {
                if (this.currency === 'cash' && window.MK.updateBalance) {
                     window.MK.updateBalance(amount);
                } else if (this.currency === 'gems' && window.MK.state && window.MK.state.user) {
                     window.MK.state.user.premiumBalance += amount;
                     if (window.MK.refreshUI) window.MK.refreshUI();
                }
            }
            this.updateBalanceDisplay();
        }
        
        log(msg, type='neutral') {
             const div = document.createElement('div');
            div.innerText = msg;
            div.className = `log-entry ${type}`;
             if (this.elements.log.firstChild) {
                this.elements.log.insertBefore(div, this.elements.log.firstChild);
            } else {
                this.elements.log.appendChild(div);
            }
        }

        async play() {
            const bet = parseFloat(this.elements.betInput.value);
            const bal = this.getUserBalance();
            
            if(isNaN(bet) || bet <= 0) return alert('Invalid bet');
            if(bal < bet) return alert('Insufficient funds');
            
            this.updateBalance(-bet);
            this.elements.playBtn.disabled = true;
            
            // Generate results
            const results = [];
            for(let i=0; i<5; i++) {
                results.push(Math.floor(Math.random() * this.colors.length));
            }
            
            // Animation
            for(let i=0; i<5; i++) {
                this.elements.slots[i].innerHTML = '<i class="fas fa-gem fa-spin"></i>'; // Loading
                this.elements.slots[i].style.color = '#fff';
            }
            
            await new Promise(r => setTimeout(r, 500));
            
            for(let i=0; i<5; i++) {
                const colorIdx = results[i];
                const color = this.colors[colorIdx];
                this.elements.slots[i].innerHTML = '<i class="fas fa-gem"></i>';
                this.elements.slots[i].style.color = color;
                this.elements.slots[i].style.textShadow = `0 0 10px ${color}`;
                // Add pop animation
                this.elements.slots[i].animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.2)' },
                    { transform: 'scale(1)' }
                ], { duration: 200 });
                await new Promise(r => setTimeout(r, 100));
            }
            
            // Check matches
            const counts = {};
            results.forEach(r => counts[r] = (counts[r] || 0) + 1);
            
            let maxMatch = 0;
            for(let k in counts) {
                if(counts[k] > maxMatch) maxMatch = counts[k];
            }
            
            const mult = this.payouts[maxMatch] || 0;
            const payout = bet * mult;
            
            if (payout > 0) {
                this.updateBalance(payout);
                this.log(`Win! ${maxMatch} Matches (${mult}x) +${payout.toFixed(2)}`, 'win');
            } else {
                this.log(`Loss. Max match: ${maxMatch}`, 'loss');
            }
            
            this.elements.playBtn.disabled = false;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.DiamondsGame = DiamondsGame;
})();
