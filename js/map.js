(function() {
    const MK = window.MoonKat;

    MK.Map = {
        canvas: null,
        ctx: null,
        tiles: [],
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        lastX: 0,
        lastY: 0,
        hoverTile: null,
        hexRadius: 30,
        
        init() {
            // Check if map data exists, if not generate
            if (!MK.state.map) {
                MK.state.map = {
                    radius: 10,
                    tiles: []
                };
                this.generateMap(MK.state.map.radius);
            } else {
                // Rehydrate tiles if needed (restore class methods if we had any, but using plain objects)
                this.tiles = MK.state.map.tiles;
            }

            // Ensure free unlocks initialized
            if (MK.state.user.freeUnlocks === undefined) {
                MK.state.user.freeUnlocks = 5;
            }

            this.setupCanvas();
            this.setupEvents();
            
            // Bot Loop
            setInterval(() => this.botTick(), 5000);
            
            // Render Loop
            const loop = () => {
                if(window.app.currentPage === 'map') {
                    this.render();
                }
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        },

        // ...
        // Initial 5 Free Unlocks if not already set (For user onboarding)
        if(!MK.state.user.unlockedGames || MK.state.user.unlockedGames.length === 5) {
             // Already has 5 (the defaults), maybe we want to grant 5 *more* or ensure specific ones
             // The defaults are crash, roulette, coinflip, dice, hilo.
             // Let's assume user wants ability to pick 5 MORE free? 
             // Or maybe they just want the defaults to be unlocked correctly.
             
             // Let's ensure the user has at least 5 unlocking credits or just set a flag.
             // Actually, the simplest way to "give 5 free game unlocks" is to give them enough gems to unlock 5 games, or set a counter.
             // But the prompt likely implies "make sure the user starts with 5 games unlocked".
             // The default state ALREADY has 5 games unlocked: ["crash", "roulette", "coinflip", "dice", "hilo"]
             
             // If the user means "allow me to unlock 5 OTHERS for free", we could add a `freeUnlocks` property.
             // Let's stick to ensuring the base games are definitely unlocked and maybe add 500 Gems as a "starter pack" for 1 more game?
             // Or let's interpret "5 free game unlocks" as increasing the default unlocked set.
             
             // Let's just make sure the map is fixed first.
        }
        
        setupCanvas() {
            const container = document.getElementById('map-container');
            if(!container) return;
            // Clear existing to prevent duplicates if recalled
            container.innerHTML = ''; 
            
            const canvas = document.createElement('canvas');
            canvas.id = 'hex-map';
            canvas.style.display = 'block'; // Ensure block display
            canvas.style.width = '100%';    // CSS handles size but explicit doesn't hurt
            canvas.style.height = '100%';
            container.appendChild(canvas);
            
            const ui = document.createElement('div');
            ui.id = 'map-ui';
            ui.className = 'map-ui';
            container.appendChild(ui);

            this.canvas = canvas;
            this.ctx = this.canvas.getContext('2d');
            
            // Force a resize calculation immediately
            setTimeout(() => this.resize(), 100); 
            window.addEventListener('resize', () => this.resize());
        },

        resize() {
            if(!this.canvas) return;
            const container = this.canvas.parentElement;
            if(!container) return;
            
            const rect = container.getBoundingClientRect();
            // Critical fix: If width/height is 0 (hidden), don't set invalid size, just return
            if(rect.width === 0 || rect.height === 0) return;

            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.offsetX = this.canvas.width / 2;
            this.offsetY = this.canvas.height / 2;
            this.render();
        },
        // ...

        generateMap(radius) {
            const tiles = [];
            // Axial coordinates
            for (let q = -radius; q <= radius; q++) {
                let r1 = Math.max(-radius, -q - radius);
                let r2 = Math.min(radius, -q + radius);
                for (let r = r1; r <= r2; r++) {
                    const price = Math.floor(Math.random() * 50000 + 5000);
                    tiles.push({
                        q, r, s: -q-r,
                        owner: null, // null = system, string = bot/user
                        price: price,
                        forSale: true,
                        type: Math.random() > 0.8 ? 'gold' : (Math.random() > 0.6 ? 'forest' : 'plains'),
                        value: price
                    });
                }
            }
            MK.state.map.tiles = tiles;
            this.tiles = tiles;
        },

        expandMap() {
            MK.state.map.radius += 5;
            const newRadius = MK.state.map.radius;
            const existing sigs = new Set(this.tiles.map(t => `${t.q},${t.r}`));
            
            for (let q = -newRadius; q <= newRadius; q++) {
                let r1 = Math.max(-newRadius, -q - newRadius);
                let r2 = Math.min(newRadius, -q + newRadius);
                for (let r = r1; r <= r2; r++) {
                    if(sigs.has(`${q},${r}`)) continue;
                    
                    const price = Math.floor(Math.random() * 100000 + 20000);
                    this.tiles.push({
                        q, r, s: -q-r,
                        owner: null,
                        price: price,
                        forSale: true,
                        type: Math.random() > 0.9 ? 'diamond' : (Math.random() > 0.7 ? 'city' : 'wasteland'),
                        value: price
                    });
                }
            }
            MK.state.map.tiles = this.tiles;
            if(window.app) window.app.showToast("The world has expanded!", "info");
        },

        hexToPixel(q, r) {
            const x = this.hexRadius * (3/2 * q);
            const y = this.hexRadius * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
            return { x, y };
        },

        pixelToHex(x, y) {
            const q = (2/3 * x) / this.hexRadius;
            const r = (-1/3 * x + Math.sqrt(3)/3 * y) / this.hexRadius;
            return this.hexRound(q, r, -q-r);
        },

        hexRound(q, r, s) {
            let rq = Math.round(q);
            let rr = Math.round(r);
            let rs = Math.round(s);

            const q_diff = Math.abs(rq - q);
            const r_diff = Math.abs(rr - r);
            const s_diff = Math.abs(rs - s);

            if (q_diff > r_diff && q_diff > s_diff) {
                rq = -rr - rs;
            } else if (r_diff > s_diff) {
                rr = -rq - rs;
            } else {
                rs = -rq - rr;
            }
            return { q: rq, r: rr };
        },

        render() {
            if(!this.ctx) return;
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.save();
            ctx.translate(this.offsetX, this.offsetY);

            this.tiles.forEach(tile => {
                const pos = this.hexToPixel(tile.q, tile.r);
                this.drawHex(ctx, pos.x, pos.y, tile);
            });

            ctx.restore();
            this.updateUI();
        },

        drawHex(ctx, x, y, tile) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = 2 * Math.PI / 6 * i;
                const x_i = x + this.hexRadius * Math.cos(angle);
                const y_i = y + this.hexRadius * Math.sin(angle);
                if (i === 0) ctx.moveTo(x_i, y_i);
                else ctx.lineTo(x_i, y_i);
            }
            ctx.closePath();

            // Style based on type/owner
            if (tile.owner === MK.state.user.username) {
                ctx.fillStyle = '#2ecc71'; // Own
            } else if (tile.owner) {
                ctx.fillStyle = '#e74c3c'; // Taken
            } else {
                // Biomes
                switch(tile.type) {
                    case 'gold': ctx.fillStyle = '#f1c40f'; break;
                    case 'forest': ctx.fillStyle = '#27ae60'; break;
                    case 'diamond': ctx.fillStyle = '#9b59b6'; break;
                    case 'city': ctx.fillStyle = '#95a5a6'; break;
                    case 'wasteland': ctx.fillStyle = '#7f8c8d'; break;
                    default: ctx.fillStyle = '#34495e'; // Plains
                }
            }
            
            ctx.fill();
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            
            // Hover effect
            if (this.hoverTile === tile) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
            }
            ctx.stroke();
        },

        setupEvents() {
            this.canvas.addEventListener('mousedown', e => {
                this.isDragging = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            });

            window.addEventListener('mouseup', () => this.isDragging = false);

            this.canvas.addEventListener('mousemove', e => {
                if (this.isDragging) {
                    this.offsetX += e.clientX - this.lastX;
                    this.offsetY += e.clientY - this.lastY;
                    this.lastX = e.clientX;
                    this.lastY = e.clientY;
                } else {
                    // Hover logic
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left - this.offsetX;
                    const y = e.clientY - rect.top - this.offsetY;
                    const h = this.pixelToHex(x, y);
                    this.hoverTile = this.tiles.find(t => t.q === h.q && t.r === h.r);
                }
            });

            this.canvas.addEventListener('click', e => {
                if (this.hoverTile && !this.isDragging) { // Simple click check
                    this.interactTile(this.hoverTile);
                }
            });
        },

        interactTile(tile) {
            if (tile.owner === MK.state.user.username) {
                const sellPrice = prompt("Set sale price for this land:", tile.price * 1.5);
                if (sellPrice) {
                    tile.price = parseFloat(sellPrice);
                    tile.forSale = true;
                    alert("Land marked for sale!");
                }
            } else if (tile.owner === null) {
                // Buy unowned
                if (confirm(`Buy this ${tile.type} land for $${tile.price.toLocaleString()}?`)) {
                    if (MK.updateBalance(-tile.price)) {
                        tile.owner = MK.state.user.username;
                        tile.forSale = false;
                        MK.Audio.playSuccess();
                        this.checkExpansion();
                    } else {
                        MK.Audio.playError();
                        alert("Insufficient funds");
                    }
                }
            } else {
                // Buy from other
                const successChance = MK.state.user.vip && MK.state.user.vip.active ? 0.4 : 0.2; // VIP bonus
                if (confirm(`Attempt to buy land from ${tile.owner} for $${tile.price.toLocaleString()}?\n(Hostile Takeover Chance: ${(successChance*100).toFixed(0)}%)`)) {
                    if (MK.updateBalance(-tile.price)) {
                        if (Math.random() < successChance) {
                            tile.owner = MK.state.user.username;
                            tile.forSale = false;
                            MK.Audio.playSuccess();
                            alert("Hostile takeover successful!");
                        } else {
                            MK.Audio.playError();
                            alert("Takeover failed! Money lost to legal fees.");
                        }
                    } else {
                        alert("Insufficient funds");
                    }
                }
            }
        },

        updateUI() {
            const ui = document.getElementById('map-ui');
            if (!ui) return;
            
            if (this.hoverTile) {
                ui.innerHTML = `
                    <div class="glass-panel" style="padding:10px; position:absolute; bottom:20px; left:20px; pointer-events:none;">
                        <h3>${this.hoverTile.type.toUpperCase()} LAND</h3>
                        <p>Owner: ${this.hoverTile.owner || "None"}</p>
                        <p>Value: $${this.hoverTile.price.toLocaleString()}</p>
                        <p>Coords: ${this.hoverTile.q}, ${this.hoverTile.r}</p>
                    </div>
                `;
            } else {
                ui.innerHTML = '';
            }
        },

        botTick() {
            // Bots buy land
            if(MK.state.map.tiles.filter(t => !t.owner).length === 0) return;
            
            const bot = MK.state.bots[Math.floor(Math.random() * MK.state.bots.length)];
            const available = MK.state.map.tiles.filter(t => !t.owner && t.price < bot.profit);
            
            if (available.length > 0 && Math.random() < 0.1) {
                const tile = available[Math.floor(Math.random() * available.length)];
                tile.owner = bot.name;
                tile.forSale = false;
                bot.profit -= tile.price;
                this.checkExpansion();
            }
        },

        checkExpansion() {
            const free = this.tiles.filter(t => !t.owner).length;
            if (free < this.tiles.length * 0.1) { // < 10% free
                this.expandMap();
            }
        }
    };
})();
