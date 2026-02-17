(function() {
    window.MoonKat = window.MoonKat || {};
    
    class SlotsGame {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.symbols = ['🍒', '🍋', '🍇', '🍉', '💎', '7️⃣', '🔔', '🍀'];
            this.reels = 3;
            this.rows = 1; // Show 1 row (classic) or 3? Let's do 3 visible rows for "modern" feel
            // Actually, user said "Slots should show emojis rolling".
            // Let's stick to 3 reels, 1 win line for simplicity but showing 3 rows is nicer.
            
            this.reelElements = [];
            this.spinning = false;
            
            this.setupUI();
        }

        destroy() {
            this.spinning = false;
            this.container.innerHTML = '';
        }

        setupUI() {
            this.container.innerHTML = '';
            
            const wrapper = document.createElement('div');
            wrapper.className = 'slots-wrapper';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '20px';
            wrapper.style.background = 'linear-gradient(180deg, #2b1055 0%, #7597de 100%)'; // Fun gradient
            wrapper.style.padding = '40px';
            wrapper.style.borderRadius = '20px';
            wrapper.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), inset 0 0 50px rgba(0,0,0,0.3)';
            wrapper.style.border = '4px solid #ffd700';

            // Reels Area
            const reelsContainer = document.createElement('div');
            reelsContainer.style.display = 'flex';
            reelsContainer.style.gap = '15px';
            reelsContainer.style.background = 'rgba(0,0,0,0.3)';
            reelsContainer.style.padding = '20px';
            reelsContainer.style.borderRadius = '15px';
            reelsContainer.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.8)';

            for(let i=0; i<this.reels; i++) {
                const reelWindow = document.createElement('div');
                reelWindow.style.width = '100px';
                reelWindow.style.height = '150px'; // Shows 1.5 symbols usually, let's allow 1 big one centered
                reelWindow.style.overflow = 'hidden';
                reelWindow.style.background = '#fff';
                reelWindow.style.borderRadius = '10px';
                reelWindow.style.position = 'relative';
                reelWindow.style.border = '2px solid #999';
                
                // The moving strip
                const strip = document.createElement('div');
                strip.className = 'reel-strip';
                strip.style.display = 'flex';
                strip.style.flexDirection = 'column';
                strip.style.alignItems = 'center';
                strip.style.transition = 'transform 0s'; // Manual control
                strip.style.transform = 'translateY(0)';
                
                // Initial Symbol
                strip.innerHTML = `<div class="slot-symbol" style="height:150px; display:flex; align-items:center; justify-content:center; font-size:80px;">${this.getRandomSymbol()}</div>`;
                
                reelWindow.appendChild(strip);
                reelsContainer.appendChild(reelWindow);
                this.reelElements.push(strip);
            }

            // Controls
            const controls = document.createElement('div');
            controls.style.display = 'flex';
            controls.style.flexDirection = 'column';
            controls.style.alignItems = 'center';
            controls.style.gap = '15px';
            controls.innerHTML = `
                <div class="bet-controls" style="background:rgba(0,0,0,0.5); padding:10px; borderRadius:30px; display:flex; gap:10px; align-items:center;">
                    <span style="color:gold; font-weight:bold;">BET:</span>
                    <input type="number" id="slots-bet" value="25" min="1" style="width:80px; padding:5px; border-radius:5px; border:none; text-align:center; font-weight:bold;">
                </div>
                <button id="spin-btn" style="
                    width:120px; height:120px; border-radius:50%; border:5px solid #ffd700;
                    background: radial-gradient(circle, #ff4500 0%, #cc0000 100%);
                    color:white; font-size:1.5rem; font-weight:900;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.5); cursor:pointer;
                    transition: transform 0.1s;
                ">SPIN</button>
                <div id="slots-msg" style="height:30px; font-weight:bold; color:white; text-shadow:0 2px 4px rgba(0,0,0,0.5);">Good Luck!</div>
            `;

            wrapper.appendChild(reelsContainer);
            wrapper.appendChild(controls);
            this.container.appendChild(wrapper);

            this.spinBtn = controls.querySelector('#spin-btn');
            this.betInput = controls.querySelector('#slots-bet');
            this.msg = controls.querySelector('#slots-msg');

            this.spinBtn.addEventListener('mousedown', () => this.spinBtn.style.transform = 'scale(0.95)');
            this.spinBtn.addEventListener('mouseup', () => this.spinBtn.style.transform = 'scale(1)');
            this.spinBtn.addEventListener('click', () => this.spin());
        }

        getRandomSymbol() {
            return this.symbols[Math.floor(Math.random() * this.symbols.length)];
        }

        async spin() {
            if(this.spinning) return;
            
            const bet = parseFloat(this.betInput.value);
            if(!bet || bet <= 0) return alert("Invalid bet");
            if(!window.MoonKat.updateBalance(-bet)) return alert("Insufficient funds");

            this.spinning = true;
            this.msg.innerText = "";
            this.spinBtn.disabled = true;
            this.spinBtn.style.filter = 'grayscale(1)';

            // Determine outcome first
            const finalSymbols = [
                this.getRandomSymbol(),
                this.getRandomSymbol(),
                this.getRandomSymbol()
            ];

            // Bias for wins (Make it fun)
            if(Math.random() > 0.7) { // 30% chance to force at least a pair
                const s = finalSymbols[0];
                if(Math.random() > 0.5) finalSymbols[1] = s;
                else finalSymbols[2] = s;
            }
            if(Math.random() > 0.9) { // 10% Jackpot chance override (simple logic)
                const s = finalSymbols[0];
                finalSymbols[1] = s;
                finalSymbols[2] = s;
            }

            // Animate reels
            const promises = this.reelElements.map((strip, i) => {
                return this.animateReel(strip, finalSymbols[i], i * 200); // Staggered start
            });

            await Promise.all(promises);

            this.checkWin(finalSymbols, bet);
            
            this.spinning = false;
            this.spinBtn.disabled = false;
            this.spinBtn.style.filter = 'none';
        }

        animateReel(strip, finalSymbol, delay) {
            return new Promise(resolve => {
                // Prepare strip
                // Content: [Current, ...Randoms, Final]
                // We want to scroll UP (translateY goes negative)
                
                const currentSymbol = strip.querySelector('.slot-symbol:last-child')?.innerText || this.getRandomSymbol();
                strip.innerHTML = '';
                
                // Add current symbol at top
                strip.innerHTML += `<div class="slot-symbol" style="height:150px; display:flex; align-items:center; justify-content:center; font-size:80px;">${currentSymbol}</div>`;
                
                // Add X random symbols
                const speed = 20; // items
                for(let i=0; i<speed; i++) {
                    strip.innerHTML += `<div class="slot-symbol" style="height:150px; display:flex; align-items:center; justify-content:center; font-size:80px; filter:blur(2px);">${this.getRandomSymbol()}</div>`;
                }
                
                // Add final symbol
                strip.innerHTML += `<div class="slot-symbol" style="height:150px; display:flex; align-items:center; justify-content:center; font-size:80px;">${finalSymbol}</div>`;
                
                // Reset transform
                strip.style.transition = 'none';
                strip.style.transform = 'translateY(0)';
                
                // Force reflow
                strip.offsetHeight;

                setTimeout(() => {
                    // Animate to end
                    const totalHeight = (speed + 1) * 150; // Scroll past X items + 1
                    strip.style.transition = `transform ${2 + (delay/1000)}s cubic-bezier(0.25, 1, 0.5, 1)`; // Ease out
                    strip.style.transform = `translateY(-${totalHeight}px)`;
                    
                    // Cleanup after animation
                    setTimeout(() => {
                        strip.style.transition = 'none';
                        strip.innerHTML = `<div class="slot-symbol" style="height:150px; display:flex; align-items:center; justify-content:center; font-size:80px;">${finalSymbol}</div>`;
                        strip.style.transform = 'translateY(0)';
                        resolve();
                    }, (2 + (delay/1000)) * 1000);
                }, delay);
            });
        }

        checkWin(symbols, bet) {
            const [a, b, c] = symbols;
            let win = 0;
            let msg = "Try Again";
            let color = "white";

            if (a === b && b === c) {
                // Jackpot
                if (a === '7️⃣') win = bet * 50;
                else if (a === '💎') win = bet * 30;
                else win = bet * 20;
                msg = `JACKPOT! Won $${win}`;
                color = "#00ff88";
            } else if (a === b || b === c || a === c) {
                // Pair
                win = bet * 2;
                msg = `Pair! Won $${win}`;
                color = "#ffcc00";
            }

            if (win > 0) {
                window.MoonKat.updateBalance(win);
                window.MoonKat.addXp(Math.floor(win/5));
                // Add fancy effect here?
            }

            this.msg.innerText = msg;
            this.msg.style.color = color;
        }
    }

    window.MoonKat.SlotsGame = SlotsGame;
})();