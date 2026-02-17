(function() {
    window.MoonKat = window.MoonKat || {};
    
    class RouletteGame {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.setupUI();
        }

        destroy() {
            this.container.innerHTML = '';
        }

        setupUI() {
            this.container.innerHTML = '';
            
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '30px';
            wrapper.style.padding = '40px';
            wrapper.style.background = '#0a0e17';
            wrapper.style.borderRadius = '20px';
            wrapper.style.border = '1px solid #333';

            // Wheel
            const wheelContainer = document.createElement('div');
            wheelContainer.style.position = 'relative';
            wheelContainer.style.width = '300px';
            wheelContainer.style.height = '300px';
            
            const wheel = document.createElement('div');
            wheel.style.width = '100%';
            wheel.style.height = '100%';
            wheel.style.borderRadius = '50%';
            wheel.style.border = '10px solid #2c3e50';
            wheel.style.boxShadow = '0 0 30px rgba(0,0,0,0.8)';
            // 37 segments (0-36). Simplified: Green, Red, Black repeating
            // Conic gradient: Green (0-10deg), Red (10-185deg), Black (185-360deg) approximately
            wheel.style.background = 'conic-gradient(#2ecc71 0deg 10deg, #e74c3c 10deg 185deg, #2c3e50 185deg 360deg)';
            wheel.style.transition = 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)';
            wheel.style.transform = 'rotate(0deg)';
            
            // Inner decorative circle
            const inner = document.createElement('div');
            inner.style.position = 'absolute';
            inner.style.top = '50%'; inner.style.left = '50%';
            inner.style.transform = 'translate(-50%, -50%)';
            inner.style.width = '140px'; inner.style.height = '140px';
            inner.style.borderRadius = '50%';
            inner.style.background = '#1a1a1a';
            inner.style.border = '5px solid #fff';
            inner.style.display = 'flex';
            inner.style.alignItems = 'center';
            inner.style.justifyContent = 'center';
            inner.style.color = 'white';
            inner.style.fontSize = '2rem';
            inner.style.fontWeight = 'bold';
            inner.innerHTML = '<i class="fas fa-gem"></i>';
            
            // Pointer
            const pointer = document.createElement('div');
            pointer.style.position = 'absolute';
            pointer.style.top = '-15px';
            pointer.style.left = '50%';
            pointer.style.transform = 'translateX(-50%)';
            pointer.style.width = '0'; 
            pointer.style.height = '0'; 
            pointer.style.borderLeft = '15px solid transparent';
            pointer.style.borderRight = '15px solid transparent';
            pointer.style.borderTop = '25px solid #f1c40f';
            pointer.style.zIndex = '10';
            pointer.style.filter = 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))';

            wheelContainer.appendChild(wheel);
            wheelContainer.appendChild(inner);
            wheelContainer.appendChild(pointer);
            this.wheelEl = wheel;
            this.resultDisplay = inner;

            // Betting Board
            const board = document.createElement('div');
            board.style.display = 'flex';
            board.style.gap = '15px';
            board.style.flexWrap = 'wrap';
            board.style.justifyContent = 'center';
            
            const bets = [
                { type: 'red', color: '#e74c3c', label: 'RED (2x)' },
                { type: 'green', color: '#2ecc71', label: 'GREEN (14x)' },
                { type: 'black', color: '#34495e', label: 'BLACK (2x)' }
            ];

            this.betButtons = [];
            bets.forEach(b => {
                const btn = document.createElement('button');
                btn.style.padding = '15px 30px';
                btn.style.background = b.color;
                btn.style.border = '3px solid transparent';
                btn.style.borderRadius = '10px';
                btn.style.color = 'white';
                btn.style.fontWeight = '900';
                btn.style.cursor = 'pointer';
                btn.style.fontSize = '1rem';
                btn.innerText = b.label;
                btn.dataset.type = b.type;
                
                btn.addEventListener('click', () => {
                    this.selectedType = b.type;
                    this.betButtons.forEach(x => {
                        x.style.borderColor = 'transparent';
                        x.style.opacity = '0.5';
                    });
                    btn.style.borderColor = '#fff';
                    btn.style.opacity = '1';
                });
                
                this.betButtons.push(btn);
                board.appendChild(btn);
            });

            // Input and Spin
            const controls = document.createElement('div');
            controls.style.display = 'flex';
            controls.style.gap = '10px';
            controls.style.alignItems = 'center';
            controls.style.marginTop = '20px';
            controls.innerHTML = `
                <div style="background:#222; padding:5px 15px; border-radius:8px; display:flex; align-items:center;">
                    <span style="color:#aaa; margin-right:10px;">BET:</span>
                    <input type="number" id="r-amount" value="50" style="background:transparent; border:none; color:white; width:80px; font-weight:bold; font-size:1.1rem; text-align:right;">
                </div>
                <button id="r-spin" style="padding:12px 40px; background:#f1c40f; color:#000; font-weight:900; border:none; border-radius:8px; cursor:pointer; font-size:1.1rem;">SPIN</button>
            `;
            
            this.msg = document.createElement('div');
            this.msg.style.height = '30px';
            this.msg.style.marginTop = '15px';
            this.msg.style.fontWeight = 'bold';
            this.msg.style.color = '#fff';
            this.msg.innerText = 'Select a color to start';

            wrapper.appendChild(wheelContainer);
            wrapper.appendChild(board);
            wrapper.appendChild(controls);
            wrapper.appendChild(this.msg);
            this.container.appendChild(wrapper);

            this.spinBtn = controls.querySelector('#r-spin');
            this.input = controls.querySelector('#r-amount');
            
            this.spinBtn.addEventListener('click', () => this.spin());
            
            // Select default
            this.betButtons[0].click();
        }

        async spin() {
            if(!this.selectedType) return alert("Select a color!");
            if(this.spinning) return;
            
            const bet = parseFloat(this.input.value);
            if(!bet || bet <= 0) return alert("Invalid bet");
            if(!window.MoonKat.updateBalance(-bet)) return alert("Insufficient Funds");

            this.spinning = true;
            this.msg.innerText = "Spinning...";
            this.spinBtn.disabled = true;
            this.spinBtn.style.opacity = '0.5';

            // Determine Result
            // 0-0.05 Green, 0.05-0.525 Red, 0.525-1.0 Black
            const r = Math.random();
            let result = 'black';
            let targetDeg = 0;
            
            // Map result to approximate degrees on our simple wheel
            // Green: 0-10 deg (Target ~5)
            // Red: 10-185 deg (Target ~100)
            // Black: 185-360 deg (Target ~270)
            
            // Since pointer is at TOP (0 deg visual), and we rotate the wheel...
            // If we want Green at top, we rotate so Green segment is at top.
            // Green is 0-10. Center 5. Rotation needed: -5 (or 355).
            
            // Let's assume standard rotation coordinate system (0 is top? or right?)
            // CSS rotate(0) usually means no change.
            // If pointer is at top.
            // To land on Green (0-10deg on wheel): Rotate wheel by 360 - 5 = 355deg.
            // To land on Red (10-185deg): Rotate wheel by 360 - 100 = 260deg.
            // To land on Black (185-360deg): Rotate wheel by 360 - 270 = 90deg.
            
            // Add randomness within segment
            
            if(r < 0.05) { 
                result = 'green';
                targetDeg = 360 - (0 + Math.random()*10); 
            } else if(r < 0.525) { 
                result = 'red';
                targetDeg = 360 - (10 + Math.random()*175); 
            } else { 
                result = 'black'; 
                targetDeg = 360 - (185 + Math.random()*175); 
            }

            // Add multiple full spins (5-10)
            const spins = 5 + Math.floor(Math.random() * 5);
            const totalDeg = (spins * 360) + targetDeg;
            
            this.wheelEl.style.transform = `rotate(${totalDeg}deg)`;

            await new Promise(r => setTimeout(r, 4000)); // Match CSS transition time

            // Check Win
            let winAmount = 0;
            if(this.selectedType === result) {
                const mult = result === 'green' ? 14 : 2;
                winAmount = bet * mult;
                window.MoonKat.updateBalance(winAmount);
                window.MoonKat.addXp(Math.floor(winAmount/5));
                this.msg.innerHTML = `<span style="color:#2ecc71">WIN! ${result.toUpperCase()} (${winAmount})</span>`;
                this.resultDisplay.innerHTML = `<span style="color:${this.getColor(result)}">${result[0].toUpperCase()}</span>`;
            } else {
                this.msg.innerHTML = `<span style="color:#e74c3c">LOSE. It was ${result.toUpperCase()}</span>`;
                this.resultDisplay.innerHTML = `<span style="color:${this.getColor(result)}">${result[0].toUpperCase()}</span>`;
            }
            
            this.spinning = false;
            this.spinBtn.disabled = false;
            this.spinBtn.style.opacity = '1';
            
            // Reset for next spin without spinning back?
            // Actually, we can just keep increasing degrees next time or reset silently.
            // Reset silently:
            setTimeout(() => {
                this.wheelEl.style.transition = 'none';
                this.wheelEl.style.transform = `rotate(${targetDeg % 360}deg)`;
                // Force reflow
                this.wheelEl.offsetHeight;
                setTimeout(() => {
                    this.wheelEl.style.transition = 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)';
                }, 50);
            }, 2000);
        }

        getColor(type) {
            if(type==='red') return '#e74c3c';
            if(type==='green') return '#2ecc71';
            return '#bdc3c7';
        }
    }

    window.MoonKat.RouletteGame = RouletteGame;
})();