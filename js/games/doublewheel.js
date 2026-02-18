(function() {
    class DoubleWheelGame {
        constructor(containerId, currency = 'cash') {
            this.container = document.getElementById(containerId);
            this.currency = currency;
            
            this.innerSegments = [1, 0, 2, 0, 5, 1]; // 6 segments
            this.outerSegments = [1, 2, 0, 5, 0, 10, 1, 0]; // 8 segments
            this.currentInnerRot = 0;
            this.currentOuterRot = 0;
            
            this.setupUI();
            this.bindEvents();
        }

        setupUI() {
            if (!this.container) return;
            
            this.container.innerHTML = `
                <div class="game-panel dw-game">
                    <div class="game-header">
                        <h2>Double Wheel</h2>
                        <div class="balance-display">Balance: <span id="dw-balance">0.00</span></div>
                    </div>
                    <div class="game-visuals" style="position:relative; height:300px; display:flex; justify-content:center; align-items:center;">
                        <!-- Outer Wheel -->
                        <div id="dw-outer" style="width:280px; height:280px; border-radius:50%; border:10px solid #444; position:absolute; transition:transform 4s cubic-bezier(0.1, 0.7, 0.1, 1); display:flex; align-items:center; justify-content:center; overflow:hidden; background:conic-gradient(
                            #f44336 0% 12.5%, 
                            #2196F3 12.5% 25%, 
                            #4CAF50 25% 37.5%, 
                            #FFC107 37.5% 50%, 
                            #9C27B0 50% 62.5%, 
                            #FF5722 62.5% 75%, 
                            #607D8B 75% 87.5%, 
                            #795548 87.5% 100%
                        );">
                            <!-- Outer segments labels would be complex to rotate here, simplifying visual -->
                            <div style="position:absolute; top:10px; color:#fff; font-weight:bold;">V</div>
                        </div>
                        
                        <!-- Inner Wheel -->
                        <div id="dw-inner" style="width:160px; height:160px; border-radius:50%; border:8px solid #222; position:absolute; transition:transform 3s cubic-bezier(0.1, 0.7, 0.1, 1); background:conic-gradient(
                            #333 0% 16.6%,
                            #555 16.6% 33.3%,
                            #333 33.3% 50%,
                            #555 50% 66.6%,
                            #333 66.6% 83.3%,
                            #555 83.3% 100%
                        ); display:flex; align-items:center; justify-content:center;">
                             <div style="color:#fff; font-size:2em; z-index:10;"><i class="fas fa-crosshairs"></i></div>
                        </div>
                        
                        <!-- Pointer -->
                        <div style="position:absolute; top:0; width:4px; height:30px; background:white; z-index:20;"></div>
                    </div>
                    
                    <div class="game-controls" style="margin-top:20px;">
                        <div class="input-group">
                            <label>Bet Amount</label>
                            <input type="number" id="dw-bet" value="10" min="1" class="game-input">
                        </div>
                        <button id="dw-spin" class="game-btn action-btn">Spin</button>
                    </div>
                    <div id="dw-result" style="text-align:center; font-size:1.2em; font-weight:bold; margin-top:10px; height:30px;"></div>
                    <div id="dw-log" class="game-log"></div>
                </div>
            `;
            
            this.elements = {
                balance: this.container.querySelector('#dw-balance'),
                outer: this.container.querySelector('#dw-outer'),
                inner: this.container.querySelector('#dw-inner'),
                betInput: this.container.querySelector('#dw-bet'),
                spinBtn: this.container.querySelector('#dw-spin'),
                result: this.container.querySelector('#dw-result'),
                log: this.container.querySelector('#dw-log')
            };

            this.updateBalanceDisplay();
        }

        bindEvents() {
            this.elements.spinBtn.addEventListener('click', () => this.spin());
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

        async spin() {
            const bet = parseFloat(this.elements.betInput.value);
            const bal = this.getUserBalance();
            if(isNaN(bet) || bet <= 0) return alert('Invalid bet');
            if(bal < bet) return alert('Insufficient funds');
            
            this.updateBalance(-bet);
            this.elements.spinBtn.disabled = true;
            this.elements.result.innerText = '';
            
            // Random degrees to add
            const innerAdd = 1800 + Math.random() * 360; 
            const outerAdd = 1800 + Math.random() * 360;
            
            this.currentInnerRot += innerAdd;
            this.currentOuterRot += outerAdd;
            
            this.elements.inner.style.transform = `rotate(${this.currentInnerRot}deg)`;
            this.elements.outer.style.transform = `rotate(-${this.currentOuterRot}deg)`;
            
            await new Promise(r => setTimeout(r, 4000));
            
            // Calculate Result
            // Normalize degrees to 0-360 relative to a single rotation
            const normInner = this.currentInnerRot % 360;
            const normOuter = this.currentOuterRot % 360;
            
            // Inner (Clockwise):
            // Top segment is at (360 - (rot % 360)) % 360
            // Segment size = 60
            const innerAngle = (360 - normInner) % 360;
            const innerIndex = Math.floor(innerAngle / 60);
            
            // Outer (Counter-Clockwise):
            // Top segment is at (rot % 360)
            // Segment size = 45 (360/8)
            const outerAngle = normOuter;
            const outerIndex = Math.floor(outerAngle / 45);
            
            const innerMult = this.innerSegments[innerIndex] || 0;
            const outerMult = this.outerSegments[outerIndex] || 0;
            
            const totalMult = innerMult * outerMult;
            const payout = bet * totalMult;
            
            if (payout > 0) {
                this.updateBalance(payout);
                this.elements.result.innerHTML = `<span style="color:#4CAF50">WIN! ${innerMult}x * ${outerMult}x = ${totalMult}x ($${payout.toFixed(2)})</span>`;
                this.log(`Win! ${totalMult}x ($${payout.toFixed(2)})`, 'win');
            } else {
                this.elements.result.innerHTML = `<span style="color:#f44336">LOSS. ${innerMult}x * ${outerMult}x = 0x</span>`;
                this.log(`Loss. ${innerMult}x * ${outerMult}x`, 'loss');
            }
            
            // Reset for next spin (need to handle rotation continuity if I want smooth)
            // For now just leave it. Next spin will add to current transform if I changed logic, but here I replace transform.
            // So it spins from 0 each time? No, that looks glitchy.
            // To make it smooth, I should store current rotation in a variable and add to it.
            // But this is simple version.
            
            this.elements.spinBtn.disabled = false;
        }
    }

    window.MoonKat = window.MoonKat || {};
    window.MoonKat.DoubleWheelGame = DoubleWheelGame;
})();
