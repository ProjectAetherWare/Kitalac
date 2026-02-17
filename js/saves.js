(function() {
    const MK = window.MoonKat;
    const INDEX_KEY = "kitalac_saves_index";
    const CURRENT_ID_KEY = "kitalac_current_save_id";
    const SAVE_PREFIX = "kitalac_save_";
    const KEY1 = "KITALAC_V1";

    function encrypt(text) {
        // Method 1: XOR
        let result1 = "";
        for(let i=0; i<text.length; i++) {
            result1 += String.fromCharCode(text.charCodeAt(i) ^ KEY1.charCodeAt(i % KEY1.length));
        }
        
        // Method 2: Base64 Encode
        return btoa(result1);
    }

    function decrypt(encoded) {
        try {
            // Reverse Method 2: Base64
            let text = atob(encoded);
            
            // Reverse Method 1: XOR
            let result1 = "";
            for(let i=0; i<text.length; i++) {
                result1 += String.fromCharCode(text.charCodeAt(i) ^ KEY1.charCodeAt(i % KEY1.length));
            }
            return result1;
        } catch (e) {
            // Quiet fail
            return null;
        }
    }

    MK.Saves = {
        currentId: null,
        
        init() {
            // Migrate old save if exists
            const oldSave = localStorage.getItem("moonkat_data");
            if (oldSave && !localStorage.getItem(INDEX_KEY)) {
                this.create("Legacy Save", oldSave);
                localStorage.removeItem("moonkat_data"); // Cleanup
            }

            this.currentId = localStorage.getItem(CURRENT_ID_KEY);
            
            // If no save exists at all, create one
            if (!this.currentId || !localStorage.getItem(SAVE_PREFIX + this.currentId)) {
                console.log("Creating default save...");
                this.create("My Career");
            }
            
            // Load the current save into memory
            this.loadCurrent();
            this.startAutosave();
        },

        getList() {
            const raw = localStorage.getItem(INDEX_KEY);
            return raw ? JSON.parse(raw) : [];
        },

        create(name, dataString = null) {
            const list = this.getList();
            const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            
            const newSave = { 
                id, 
                name, 
                created: Date.now(), 
                lastPlayed: Date.now(),
                balance: 100 
            };
            
            list.push(newSave);
            localStorage.setItem(INDEX_KEY, JSON.stringify(list));
            
            if (dataString) {
                localStorage.setItem(SAVE_PREFIX + id, dataString);
            } else {
                const cleanState = {
                    user: { 
                        username: "Guest", balance: 100, premiumBalance: 0, 
                        inventory: {}, assets: [], xp: 0, tierIndex: 0, 
                        unlockedGames: ["crash", "roulette", "coinflip", "dice", "hilo"],
                        stats: { totalBets: 0, totalWon: 0, totalLost: 0, gamesPlayed: 0, tokensLaunched: 0, assetsBought: 0 },
                        achievements: [], lastDailyBonus: 0
                    },
                    coins: MK.initialCoins ? JSON.parse(JSON.stringify(MK.initialCoins)) : [],
                    stocks: [
                        { ticker: 'APL', name: 'Applex', price: 150.00, history: [], volatility: 0.02 },
                        { ticker: 'GGL', name: 'Googol', price: 2800.00, history: [], volatility: 0.015 },
                        { ticker: 'TSL', name: 'Teslaq', price: 900.00, history: [], volatility: 0.04 },
                        { ticker: 'AMZ', name: 'Amazone', price: 3300.00, history: [], volatility: 0.01 },
                        { ticker: 'NVDA', name: 'Nvidium', price: 500.00, history: [], volatility: 0.03 }
                    ],
                    bonds: [
                        { id: 'b1', name: 'Treasury 1Y', yield: 0.05, duration: 60000, price: 1000 },
                        { id: 'b2', name: 'Corp AAA 5Y', yield: 0.12, duration: 300000, price: 5000 },
                        { id: 'b3', name: 'Junk Bond', yield: 0.50, duration: 120000, price: 500, risk: 0.2 }
                    ],
                    launches: [],
                    marketAssets: [],
                    bots: [], // Will be generated
                    settings: { sound: true }
                };

                const payload = JSON.stringify(cleanState);
                const safePayload = unescape(encodeURIComponent(payload));
                const encrypted = encrypt(safePayload);
                localStorage.setItem(SAVE_PREFIX + id, encrypted);
            }
            
            this.currentId = id;
            localStorage.setItem(CURRENT_ID_KEY, id);
            
            // If we created a new save during runtime (not init), we likely want to switch to it immediately
            if (dataString === null && MK.state) { 
                 // It's a "New Game" action
                 this.switch(id);
            }
            
            return id;
        },

        switch(id) {
            if(!localStorage.getItem(SAVE_PREFIX + id)) return false;
            this.currentId = id;
            localStorage.setItem(CURRENT_ID_KEY, id);
            location.reload(); 
        },

        delete(id) {
            if (!confirm("Delete this save file permanently?")) return;
            
            const list = this.getList().filter(s => s.id !== id);
            localStorage.setItem(INDEX_KEY, JSON.stringify(list));
            localStorage.removeItem(SAVE_PREFIX + id);
            
            if (this.currentId === id) {
                if (list.length > 0) {
                    this.switch(list[0].id);
                } else {
                    this.currentId = null;
                    localStorage.removeItem(CURRENT_ID_KEY);
                    location.reload(); // Will trigger init -> create default
                }
            } else {
                this.renderUI();
            }
        },

        saveCurrent() {
            if (!this.currentId) return;
            
            // Update Meta
            const list = this.getList();
            const entry = list.find(s => s.id === this.currentId);
            if (entry) {
                entry.lastPlayed = Date.now();
                entry.balance = MK.state.user.balance;
                if(MK.state.user.username) entry.name = MK.state.user.username + "'s Save";
                localStorage.setItem(INDEX_KEY, JSON.stringify(list));
            }

            // Construct Full Payload
            const payload = JSON.stringify({
                user: MK.state.user,
                settings: MK.state.settings,
                launches: MK.state.launches,
                bots: MK.state.bots,
                coins: MK.state.coins,
                stocks: MK.state.stocks,
                marketAssets: MK.state.marketAssets,
                sports: MK.state.sports,
                map: MK.state.map,
                timestamp: Date.now(),
            });
            
            const safePayload = unescape(encodeURIComponent(payload));
            const encrypted = encrypt(safePayload);
            localStorage.setItem(SAVE_PREFIX + this.currentId, encrypted);
        },

        loadCurrent() {
            if (!this.currentId) return;
            const raw = localStorage.getItem(SAVE_PREFIX + this.currentId);
            if (raw) {
                try {
                    let decoded;
                    let decrypted = decrypt(raw);
                    
                    if (decrypted) {
                        decoded = decodeURIComponent(escape(decrypted));
                    } else {
                         // Fallback to old Base64
                         console.warn("Legacy load or decrypt failed, trying base64");
                         try {
                            decoded = decodeURIComponent(escape(atob(raw)));
                         } catch(err) {
                             throw new Error("Data corrupted");
                         }
                    }

                    const data = JSON.parse(decoded);
                    
                    // Merge Data
                    if (data.user) MK.state.user = { ...MK.state.user, ...data.user };
                    if (data.settings) MK.state.settings = { ...MK.state.settings, ...data.settings };
                    if (data.launches) MK.state.launches = data.launches;
                    if (data.bots) MK.state.bots = data.bots;
                    if (data.coins) MK.state.coins = data.coins;
                    if (data.stocks) MK.state.stocks = data.stocks;
                    if (data.marketAssets) MK.state.marketAssets = data.marketAssets;
                    if (data.sports) MK.state.sports = data.sports;
                    if (data.map) MK.state.map = data.map;
                    
                    console.log("Save Loaded:", this.currentId);
                } catch(e) {
                    console.error("Save load error", e);
                    window.app.showToast("Failed to load save data", "danger");
                }
            }
        },
        
        startAutosave() {
            setInterval(() => this.saveCurrent(), 5000);
        },

        download(id) {
            const raw = localStorage.getItem(SAVE_PREFIX + id);
            if (!raw) return;
            
            // Get Name
            const list = this.getList();
            const entry = list.find(s => s.id === id);
            const name = entry ? entry.name.replace(/[^a-z0-9]/gi, '_') : 'save';

            const blob = new Blob([raw], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kitalac_${name}_${id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.app.showToast("Save file downloaded", "success");
        },
        
        importString() {
            const str = prompt("Paste save string:");
            if(!str) return;
            try {
                // Try decrypt
                let decrypted = decrypt(str);
                if(decrypted) {
                     decrypted = decodeURIComponent(escape(decrypted));
                } else {
                    // Try legacy base64
                    decrypted = decodeURIComponent(escape(atob(str)));
                }
                
                const data = JSON.parse(decrypted);
                // Re-encrypt for storage format
                const newPayload = unescape(encodeURIComponent(JSON.stringify(data)));
                const newEncrypted = encrypt(newPayload);
                
                this.create("Imported Save", newEncrypted);
                window.app.showToast("Save imported successfully", "success");
                this.renderUI();
            } catch(e) {
                console.error(e);
                alert("Invalid Save Data");
            }
        },

        uploadFile() {
             const input = document.createElement('input');
             input.type = 'file';
             input.accept = '.txt';
             input.onchange = e => {
                 const file = e.target.files[0];
                 if(!file) return;
                 const reader = new FileReader();
                 reader.onload = event => {
                     const str = event.target.result;
                     try {
                        let decrypted = decrypt(str);
                        if(decrypted) {
                             decrypted = decodeURIComponent(escape(decrypted));
                        } else {
                             decrypted = decodeURIComponent(escape(atob(str)));
                        }

                        const data = JSON.parse(decrypted);
                        const newPayload = unescape(encodeURIComponent(JSON.stringify(data)));
                        const newEncrypted = encrypt(newPayload);
                        
                        this.create("Uploaded Save", newEncrypted);
                        window.app.showToast("Save uploaded successfully", "success");
                        this.renderUI();
                     } catch(e) {
                         alert("Invalid Save File");
                     }
                 };
                 reader.readAsText(file);
             };
             input.click();
        },

        renderUI() {
            const container = document.getElementById('saves-list');
            if (!container) return;
            const list = this.getList();
            
            container.innerHTML = list.map(s => `
                <div class="save-slot ${s.id === this.currentId ? 'active' : ''}">
                    <div class="save-info">
                        <div class="save-name">${s.name}</div>
                        <div class="save-meta">
                            <span><i class="fas fa-clock"></i> ${new Date(s.lastPlayed).toLocaleDateString()}</span>
                            <span style="color:var(--accent-success); margin-left:10px;">$${(s.balance||0).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="save-actions">
                        ${s.id !== this.currentId ? 
                            `<button class="btn-sm" onclick="MoonKat.Saves.switch('${s.id}')">LOAD</button>` : 
                            `<span class="badge-current">ACTIVE</span>`
                        }
                        <button class="btn-sm" onclick="MoonKat.Saves.download('${s.id}')" title="Download"><i class="fas fa-download"></i></button>
                        <button class="btn-sm btn-del" onclick="MoonKat.Saves.delete('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('') + `
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button class="btn-action" onclick="MoonKat.Saves.create('New Career')">+ NEW SAVE</button>
                    <button class="btn-action" onclick="MoonKat.Saves.uploadFile()">UPLOAD FILE</button>
                </div>
            `;
        }
    };
})();
