// Market Logic
(function() {
    const MK = window.MoonKat;

    // Real Usernames
    const REAL_NAMES = [
        "CryptoKing", "SatoshiNakamoto", "DogeFather", "DiamondHands", "RocketMan", 
        "LunaWitch", "SolarFlare", "NebulaDrifter", "StarLord", "CosmicRay",
        "VoidWalker", "AstroNut", "GalaxyBrain", "CometChaser", "PlanetPluto",
        "OrbitOperator", "SpaceCadet", "ZeroG", "HyperDrive", "WarpSpeed",
        "FalconHeavy", "MarsRover", "TitanTitan", "EuropaIce", "IoOcean"
    ];

    const NEWS_HEADLINES = [
        "SEC considers approving new meme ETF.",
        "Bitcoin maxis declare war on Ethereum.",
        "Doge coin surges after Musk tweet.",
        "Market volatility hits all-time high.",
        "New regulation proposed for AI trading bots.",
        "Whale wallet moves $1B in BTC.",
        "DeFi platform hacked for $50M.",
        "NFT sales drop by 20% this week.",
        "Fed announces rate hike decision soon.",
        "Crypto adoption grows in emerging markets.",
        "Tech stocks rally ahead of earnings reports.",
        "Gold prices stabilize amidst global uncertainty.",
        "Oil futures dip as supply increases.",
        "Central Bank digital currency pilot launches.",
        "Major exchange halts withdrawals temporarily."
    ];

    const CHAT_MESSAGES = [
        "LFG!!! 🚀", "Who else is buying the dip?", "This coin is a rug pull lol", 
        "Just liquidated my life savings", "Wen Lambo?", "HODL HODL HODL", 
        "Guys is this site legit?", "I just won big on Crash!", "Rip my shorts", 
        "Buy high sell low", "Anyone trading MoonDog?", "Dev do something",
        "Bullish on MoonKat", "Need more gems", "Wait for the pump", "Scam wicks",
        "Can i get a refund?", "Admin?", "To the mooooon", "Bear market is over"
    ];

    MK.initMarket = function() {
        try {
            // Safety Checks
            if (!MK.state) MK.state = {};
            if (!MK.state.user) MK.state.user = { balance: 100, inventory: {}, portfolio: {} };
            if (!MK.state.coins) MK.state.coins = [];
            if (!MK.state.stocks) MK.state.stocks = [];
            if (!MK.state.bonds) MK.state.bonds = [];
            if (!MK.state.user.portfolio) MK.state.user.portfolio = {};
            if (!MK.state.user.inventory) MK.state.user.inventory = {};

            // Try to init bots, but don't crash if data missing
            try {
                if(window.MoonKatData) MK.initBots();
            } catch(e) { console.error("Bot init failed", e); }

            // Try to init assets
            if(MK.initAssets) MK.initAssets(); 

            // Init coins if empty or corrupted
            if(!Array.isArray(MK.state.coins) || MK.state.coins.length === 0) {
                MK.state.coins = [];
                MK.initialCoins.forEach(c => {
                    const coin = {
                        ...c,
                        change24h: (Math.random() * 10 - 5),
                        marketCap: c.price * 1000000,
                        history: generateHistory(c.price),
                        supply: c.supply || 1000000,
                        launchedAmount: c.launchedAmount || 1000000
                    };
                    MK.state.coins.push(coin);
                });
            }

            // Init Stocks if empty (Force Repopulate)
            if(!Array.isArray(MK.state.stocks) || MK.state.stocks.length === 0) {
                 MK.state.stocks = [
                    { ticker: 'APL', name: 'Applex', price: 150.00, history: generateHistory(150), volatility: 0.02 },
                    { ticker: 'GGL', name: 'Googol', price: 2800.00, history: generateHistory(2800), volatility: 0.015 },
                    { ticker: 'TSL', name: 'Teslaq', price: 900.00, history: generateHistory(900), volatility: 0.04 },
                    { ticker: 'AMZ', name: 'Amazone', price: 3300.00, history: generateHistory(3300), volatility: 0.01 },
                    { ticker: 'NVDA', name: 'Nvidium', price: 500.00, history: generateHistory(500), volatility: 0.03 }
                ];
            }

            // Init Bonds if empty (Force Repopulate)
            if(!Array.isArray(MK.state.bonds) || MK.state.bonds.length === 0) {
                 MK.state.bonds = [
                    { id: 'b1', name: 'Treasury 1Y', yield: 0.05, duration: 60000, price: 1000 },
                    { id: 'b2', name: 'Corp AAA 5Y', yield: 0.12, duration: 300000, price: 5000 },
                    { id: 'b3', name: 'Junk Bond', yield: 0.50, duration: 120000, price: 500, risk: 0.2 }
                ];
            }
            
            MK.renderMarket();
            
            // Start Loop
            setInterval(() => {
                updatePrices();
                MK.renderMarket(MK.currentMarketTab || 'coins');
                MK.renderTrending();
                
                if (MK.state.mode !== 'online') {
                    MK.updateLeaderboard();
                    MK.renderLeaderboard(); // Widget (unused)
                    MK.renderFullLeaderboard();
                } else {
                    // In online mode, we just re-render the cached list in case tab changed
                    MK.renderFullLeaderboard();
                }
            }, 1000);

            // Online Leaderboard Poller
            setInterval(async () => {
                if(MK.state.mode === 'online' && window.MK_Firebase) {
                    try {
                        const users = await window.MK_Firebase.fetchLeaderboard();
                        MK.onlineLeaderboardData = users.map(u => ({
                            name: u.username,
                            score: u.balance,
                            tier: "👤", // Or calc from XP
                            winRate: u.stats ? (u.stats.totalWon > 0 ? Math.floor((u.stats.totalWon / u.stats.totalBets)*100) : 0) : 0,
                            gamesPlayed: u.stats ? u.stats.gamesPlayed : 0,
                            isUser: window.MK_Firebase.currentUser && u.uid === window.MK_Firebase.currentUser.uid
                        }));
                        MK.renderFullLeaderboard();
                    } catch(e) { console.error("LB Fetch Error", e); }
                }
            }, 10000);

            // Init Ticker System
            initTickerSystem();

            // Update Online Count Randomly - More Volatile
            setInterval(updateOnlineCount, 2000);

            // Global Events - Every 45s
            setInterval(triggerGlobalEvent, 45000);

            // Chat Bot Loop
            setInterval(addBotChatMessage, 3500);

            // Randomly list new tokens
            setInterval(() => {
                if (Math.random() < 0.2) { 
                    spawnRandomToken();
                }
            }, 15000);

            MK.renderLeaderboard();
            MK.renderLaunchpadStats();

        } catch(e) {
            console.error("Critical Market Init Error", e);
            alert("Market System Error: " + e.message + ". Trying reset...");
        }
    };

    function updateOnlineCount() {
        const el = document.getElementById('online-users');
        if(!el) return;
        const current = parseInt(el.innerText.replace(/,/g, '')) || 14000;
        
        // Huge volatility simulation
        const spike = Math.random() < 0.1; // 10% chance of big spike
        const change = spike 
            ? Math.floor(Math.random() * 5000) - 2500 
            : Math.floor(Math.random() * 300) - 150;
            
        let next = current + change;
        if(next < 8000) next = 8000 + Math.floor(Math.random() * 2000);
        if(next > 150000) next = 150000;
        
        el.innerText = next.toLocaleString();
    }

    // Expose for usage in maintenance loop
    function triggerGlobalEvent() {
        if(Math.random() > 0.4) return; // Only 40% chance

        const events = [
            { name: "Market Crash", effect: -0.15, msg: "📉 FLASH CRASH! Market is tanking!" },
            { name: "Bull Run", effect: 0.12, msg: "🚀 BULL RUN! Everything is pumping!" },
            { name: "Whale Buy", effect: 0.05, msg: "🐳 Whale Alert! Massive buy orders detected." },
            { name: "FUD Spread", effect: -0.05, msg: "⚠️ FUD Spreading. Weak hands selling." }
        ];

        const ev = events[Math.floor(Math.random() * events.length)];
        
        // Apply effect
        MK.state.coins.forEach(c => {
            c.price *= (1 + ev.effect);
            if(c.price < 0.00000001) c.price = 0.00000001;
        });

        // Show Notification
        if(window.app && window.app.showToast) {
            window.app.showToast(ev.msg, ev.effect > 0 ? "success" : "danger");
        }
    }

    function addBotChatMessage() {
        const box = document.getElementById('trollbox-messages');
        if(!box) return;
        
        let user = "Anon";
        if(MK.state.bots.length > 0) {
            user = MK.state.bots[Math.floor(Math.random() * MK.state.bots.length)].name;
        } else {
            const { userPrefixes, userSuffixes } = window.MoonKatData;
            user = userPrefixes[Math.floor(Math.random() * userPrefixes.length)] + userSuffixes[Math.floor(Math.random() * userSuffixes.length)];
        }

        const text = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
        const rank = Math.random() < 0.1 ? 'chat-rank-whale' : '';
        const rankIcon = rank ? '<i class="fas fa-crown"></i> ' : '';

        const msg = document.createElement('div');
        msg.className = 'chat-msg';
        msg.innerHTML = `<span class="chat-user ${rank}">${rankIcon}${user}:</span> <span class="chat-text">${text}</span>`;
        
        box.appendChild(msg);
        box.scrollTop = box.scrollHeight;
        
        if(box.children.length > 50) box.removeChild(box.firstElementChild);
    }

    // --- Ticker System ---
    let tickerItems = [];
    let tickerSpeed = 1.5; // Pixels per frame
    let tickerOffset = 0;
    
    function initTickerSystem() {
        const feed = document.getElementById('live-ticker');
        if (!feed) return;
        
        feed.innerHTML = '<div class="ticker-content" id="ticker-track"></div>';
        const track = document.getElementById('ticker-track');
        
        // Fill initial buffer
        for(let i=0; i<10; i++) {
            addTickerItem(generateTickerData());
        }

        // Animation Loop
        function animate() {
            if(!track) return;
            tickerOffset -= tickerSpeed;
            track.style.transform = `translateX(${tickerOffset}px)`;
            
            // Check if we need to remove first item
            const firstItem = track.firstElementChild;
            if(firstItem) {
                const rect = firstItem.getBoundingClientRect();
                if(rect.right < 0) {
                    // Item is off screen, remove it and adjust offset
                    const width = rect.width + 40; // 40 is gap
                    track.removeChild(firstItem);
                    tickerOffset += width;
                    track.style.transform = `translateX(${tickerOffset}px)`;
                    
                    // Add new item to end
                    addTickerItem(generateTickerData());
                }
            }
            
            // If track is too short (e.g. window resize), add more
            if (track.lastElementChild && track.lastElementChild.getBoundingClientRect().right < window.innerWidth) {
                 addTickerItem(generateTickerData());
            }

            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    function generateTickerData() {
        // .1% chance for Zenith Prime ad
        if (Math.random() < 0.001) {
            return `<span style="color:#ff00ff; font-weight:bold;">AD</span> <span style="font-style:italic;">Also try Zenith Prime!</span>`;
        }

        const type = Math.random();
        if (type < 0.15) {
            // News
            const news = NEWS_HEADLINES[Math.floor(Math.random() * NEWS_HEADLINES.length)];
            return `<span style="color:#ffcc00; font-weight:bold;">NEWS</span> ${news}`;
        } else {
            // Activity
            const actions = ['bought', 'sold', 'aping into', 'dumped', 'FOMO\'d into'];
            const coin = MK.state.coins[Math.floor(Math.random() * MK.state.coins.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const amount = (Math.random() * 5000 + 100).toFixed(0);
            
            // Use bot name or fallback
            let user = "Anon";
            if(MK.state.bots.length > 0) {
                user = MK.state.bots[Math.floor(Math.random() * MK.state.bots.length)].name;
            } else {
                user = "Trader" + Math.floor(Math.random()*999);
            }

            return `<span>${user}</span> <span style="color:#888">${action}</span> <span class="ticker-highlight">$${Number(amount).toLocaleString()}</span> ${coin ? coin.ticker : 'BTC'}`;
        }
    }

    function addTickerItem(html) {
        const track = document.getElementById('ticker-track');
        if(!track) return;
        const div = document.createElement('div');
        div.className = 'ticker-item';
        div.innerHTML = html;
        track.appendChild(div);
    }

    // Replace old addFakeActivity since ticker is now self-driving
    function addFakeActivity() {
        // No-op, handled by loop
    }


    function updateOnlineCount() {
        // Logic moved to main loop area
    }

    function generateHistory(basePrice) {
        const hist = [];
        let p = basePrice;
        for(let i=0; i<20; i++) {
            p = p * (1 + (Math.random() * 0.04 - 0.02));
            hist.push(p);
        }
        return hist;
    }

    function updatePrices() {
        // Update Coins
        MK.state.coins.forEach(coin => {
            const change = (Math.random() * 0.04 - 0.02);
            coin.price = coin.price * (1 + change);
            
            // Dynamic Supply
            if(coin.supply) {
                const supplyChange = Math.floor(Math.random() * 500) - 250;
                coin.supply = Math.max(1000, coin.supply + supplyChange);
            }

            if(Math.random() > 0.98) coin.price *= 1.1;
            if(Math.random() < 0.02) coin.price *= 0.9;
            if(coin.price < 0.00000001) coin.price = 0.00000001;
            coin.history.shift();
            coin.history.push(coin.price);
            const open = coin.history[0];
            coin.change24h = ((coin.price - open) / open) * 100;
            coin.marketCap = coin.price * (coin.supply || 1000000);
        });

        // Update Stocks
        if(MK.state.stocks) {
            MK.state.stocks.forEach(stock => {
                const vol = stock.volatility || 0.02;
                const change = (Math.random() * vol * 2 - vol);
                stock.price = stock.price * (1 + change);
                if(!stock.history) stock.history = [stock.price];
                if(stock.history.length > 20) stock.history.shift();
                stock.history.push(stock.price);
                const open = stock.history[0] || stock.price;
                stock.change24h = ((stock.price - open) / open) * 100;
            });
        }
    }

    // Random Asset Generation
    setInterval(() => {
        // More frequent stock/bond generation
        if(Math.random() < 0.4) spawnRandomStockOrBond();
    }, 10000); // Faster loop (10s instead of 20s)

    function spawnRandomStockOrBond() {
        if(Math.random() > 0.5) {
            // New Stock
            const names = ['Nano', 'Cyber', 'Bio', 'Mech', 'Solar', 'Lunar', 'Star', 'Void', 'Quantum', 'Hyper'];
            const suffixes = ['Corp', 'Inc', 'Tech', 'Systems', 'Dynamics', 'Logic', 'Net', 'Soft', 'Ind', 'Labs'];
            const name = names[Math.floor(Math.random()*names.length)] + ' ' + suffixes[Math.floor(Math.random()*suffixes.length)];
            const ticker = name.replace(/[^A-Z]/g, '').substr(0,4).toUpperCase();
            
            if(!MK.state.stocks) MK.state.stocks = [];
            if(MK.state.stocks.length > 20) MK.state.stocks.shift(); // Keep list manageable

            MK.state.stocks.push({
                ticker, name,
                price: Math.random() * 500 + 50,
                history: [],
                volatility: Math.random() * 0.05 + 0.01
            });
            if(window.app && window.app.showToast) window.app.showToast(`New IPO: ${name} (${ticker})`, 'info');
        } else {
            // New Bond
            if(!MK.state.bonds) MK.state.bonds = [];
            if(MK.state.bonds.length > 10) MK.state.bonds.shift();
            
            const duration = Math.floor(Math.random() * 300 + 60); // 1-6 mins
            const risk = Math.random();
            let rating = 'AAA';
            let yieldVal = 0.05;
            
            if(risk > 0.8) { rating = 'CCC'; yieldVal = 0.40; }
            else if(risk > 0.5) { rating = 'BBB'; yieldVal = 0.15; }
            
            const bond = {
                id: 'b' + Date.now(),
                name: `Corp ${rating} ${duration}s Bond`,
                yield: yieldVal,
                duration: duration * 1000,
                price: 1000 * Math.floor(Math.random() * 10 + 1),
                risk: risk > 0.8 ? 0.3 : 0
            };
            MK.state.bonds.push(bond);
        }
    }

    MK.openStockModal = function(ticker) {
        const modal = document.getElementById('stock-modal');
        if(!modal) return;
        
        let item = MK.state.coins.find(c => c.ticker === ticker);
        let type = 'crypto';
        if(!item && MK.state.stocks) {
            item = MK.state.stocks.find(c => c.ticker === ticker);
            type = 'stock';
        }
        if(!item) return;

        // Populate Modal
        document.getElementById('modal-stock-name').innerText = `${item.name} (${item.ticker})`;
        document.getElementById('modal-stock-price').innerText = '$' + MK.formatCurrency(item.price);
        const changeEl = document.getElementById('modal-stock-change');
        changeEl.innerText = (item.change24h || 0).toFixed(2) + '%';
        changeEl.style.color = item.change24h >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)';

        // Buttons
        const btnBuy = document.getElementById('modal-buy-btn');
        const btnSell = document.getElementById('modal-sell-btn');
        
        btnBuy.onclick = () => type === 'stock' ? MK.buyStock(ticker) : MK.buy(ticker);
        btnSell.onclick = () => type === 'stock' ? MK.sellStock(ticker) : MK.sell(ticker);

        // Chart (Simple Canvas Drawing)
        const canvas = document.getElementById('modal-stock-chart');
        if(canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);
            
            // Resize logic if needed, but assuming fixed for now or responsive css
            // Let's assume 100% width/height of parent, we need to set internal resolution
            canvas.width = canvas.parentElement.clientWidth || 600;
            canvas.height = canvas.parentElement.clientHeight || 250;

            const hist = item.history || [];
            if(hist.length > 1) {
                const min = Math.min(...hist);
                const max = Math.max(...hist);
                const range = max - min || 1;
                
                ctx.beginPath();
                ctx.strokeStyle = item.change24h >= 0 ? '#2ecc71' : '#e74c3c';
                ctx.lineWidth = 3;
                
                const step = canvas.width / (hist.length - 1);
                hist.forEach((p, i) => {
                    const x = i * step;
                    const y = canvas.height - ((p - min) / range) * (canvas.height - 40) - 20;
                    if(i===0) ctx.moveTo(x,y);
                    else ctx.lineTo(x,y);
                });
                ctx.stroke();
                
                // Gradient fill
                const grad = ctx.createLinearGradient(0,0,0,canvas.height);
                grad.addColorStop(0, item.change24h >= 0 ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.fill();
            }
        }

        modal.style.display = 'flex';
        
        // Bind Close
        const closeBtn = document.getElementById('close-stock-modal');
        if(closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
    };

    MK.renderPortfolio = function() {
        const list = document.getElementById('portfolio-list');
        if(!list) return; // Not on page
        
        list.innerHTML = '';
        let totalVal = 0;
        
        // Use container for centering if list empty
        if((!MK.state.user.inventory || Object.keys(MK.state.user.inventory).length === 0) && 
           (!MK.state.user.portfolio || Object.keys(MK.state.user.portfolio).length === 0)) {
            list.innerHTML = '<div style="text-align:center; padding:50px; color:var(--text-secondary);">Portfolio is empty. Go trade!</div>';
        }

        const renderItem = (ticker, amount, type) => {
            let item = type === 'crypto' 
                ? MK.state.coins.find(c => c.ticker === ticker)
                : MK.state.stocks.find(s => s.ticker === ticker);
                
            if(!item) return;
            
            const val = amount * item.price;
            totalVal += val;
            
            const row = document.createElement('div');
            row.className = 'coin-row';
            row.onclick = (e) => {
                if(!e.target.closest('button')) MK.openStockModal(ticker);
            };
            row.style.cursor = 'pointer';

            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:16px;">
                    <div class="coin-icon" style="color:${getColor(ticker)}; border-color:${getColor(ticker)}">
                        <i class="fas ${type === 'crypto' ? 'fa-coins' : 'fa-building'}"></i>
                    </div>
                    <div>
                        <span style="font-weight:bold; font-size:1.1rem; display:block;">${item.name}</span>
                        <span style="color:var(--text-secondary); font-size:0.85rem;">${amount.toFixed(4)} Shares/Tokens</span>
                    </div>
                </div>
                <div></div>
                <div style="text-align:right; margin-right:24px;">
                    <span style="font-size:1.1rem; font-weight:bold; display:block;">$${MK.formatCurrency(val)}</span>
                    <span style="font-size:0.9rem; color:var(--text-secondary)">$${MK.formatCurrency(item.price)} each</span>
                </div>
                <div></div>
                <div style="display:flex; gap:8px; justify-content:flex-end;">
                     <button class="btn-action btn-buy" onclick="event.stopPropagation(); ${type==='stock' ? `MoonKat.buyStock('${ticker}')` : `MoonKat.buy('${ticker}')`}">Buy</button>
                     <button class="btn-action btn-sell" onclick="event.stopPropagation(); ${type==='stock' ? `MoonKat.sellStock('${ticker}')` : `MoonKat.sell('${ticker}')`}">Sell</button>
                </div>
            `;
            list.appendChild(row);
        };

        // Render Crypto
        if(MK.state.user.inventory) {
            Object.entries(MK.state.user.inventory).forEach(([t, amt]) => {
                if(amt > 0.000001) renderItem(t, amt, 'crypto');
            });
        }
        
        // Render Stocks
        if(MK.state.user.portfolio) {
            Object.entries(MK.state.user.portfolio).forEach(([t, amt]) => {
                if(amt > 0.000001) renderItem(t, amt, 'stock');
            });
        }
        
        // Update Stats
        const totalEl = document.getElementById('portfolio-total');
        if(totalEl) totalEl.innerText = '$' + MK.formatCurrency(totalVal + MK.state.user.balance);
        
        const changeEl = document.getElementById('portfolio-change');
        if(changeEl) {
             // Fake portfolio change for now or calc simple
             const chg = (Math.random() * 2 - 1).toFixed(2);
             changeEl.innerText = (chg > 0 ? '+' : '') + chg + '%';
             changeEl.style.color = chg > 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
        }
    };

    MK.renderMarket = function(filter = 'coins') {
        const list = document.getElementById('market-list');
        if(!list) return;
        
        MK.currentMarketTab = filter;

        // Inject Tabs
        let tabs = document.getElementById('market-tabs');
        if(!tabs) {
            const container = document.getElementById('page-market').querySelector('.section-title');
            tabs = document.createElement('div');
            tabs.id = 'market-tabs';
            tabs.className = 'leaderboard-tabs'; // Reuse style
            tabs.style.marginTop = '10px';
            tabs.innerHTML = `
                <button class="lb-tab active" onclick="MoonKat.renderMarket('coins')">Crypto</button>
                <button class="lb-tab" onclick="MoonKat.renderMarket('stocks')">Stocks</button>
                <button class="lb-tab" onclick="MoonKat.renderMarket('bonds')">Bonds</button>
            `;
            container.appendChild(tabs);
        }

        // Update active tab
        const tabButtons = tabs.querySelectorAll('button');
        tabButtons.forEach(b => {
            b.classList.toggle('active', b.innerText.toLowerCase().includes(filter === 'coins' ? 'crypto' : filter));
        });

        list.innerHTML = '';

        if (filter === 'bonds') {
            if(!Array.isArray(MK.state.bonds) || MK.state.bonds.length === 0) {
                 list.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);">No bonds available.</div>';
                 return;
            }
            list.innerHTML = MK.state.bonds.map(bond => `
                <div class="coin-row">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div class="coin-icon" style="color:#aaa; border-color:#aaa"><i class="fas fa-file-contract"></i></div>
                        <div>
                            <span style="font-weight:bold; font-size:1.1rem; display:block;">${bond.name}</span>
                            <span style="color:var(--text-secondary); font-size:0.85rem;">Yield: ${(bond.yield * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div></div>
                    <div style="text-align:right; margin-right:24px;">
                        <span style="font-size:1.1rem; font-weight:bold; display:block;">$${bond.price.toLocaleString()}</span>
                        <span style="font-size:0.9rem; color:var(--accent-success)">Safe Return</span>
                    </div>
                    <div></div>
                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                        <button class="btn-action btn-buy" onclick="MoonKat.buyBond('${bond.id}')">Invest</button>
                    </div>
                </div>
            `).join('');
            return;
        }

        let items = filter === 'stocks' ? (MK.state.stocks || []) : [...MK.state.coins];
        
        if(!items || items.length === 0) {
             list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-secondary);">No ${filter} available yet. Waiting for market...</div>`;
             return;
        }

        // Sort
        if(filter === 'coins') items.sort((a,b) => b.marketCap - a.marketCap);

        items.forEach(item => {
            if(!item) return; // Skip invalid
            const row = document.createElement('div');
            row.className = 'coin-row';
            row.onclick = (e) => {
                if(!e.target.closest('button')) MK.openStockModal(item.ticker); // Use item.ticker not ticker
            };
            row.style.cursor = 'pointer';

            // Sparkline bars
            let sparkHtml = '<div style="display:flex; align-items:flex-end; gap:3px; height:40px; width:100px;">';
            if(item.history) {
                item.history.forEach(p => {
                    const min = Math.min(...item.history);
                    const max = Math.max(...item.history);
                    const range = max - min || 1;
                    const h = 20 + ((p - min) / range) * 80;
                    const barColor = (item.change24h >= 0) ? 'var(--accent-success)' : 'var(--accent-danger)'; // use item
                    sparkHtml += `<div style="height:${h}%; background:${barColor}; opacity:0.5; width:4px; border-radius:2px;"></div>`;
                });
            }
            sparkHtml += '</div>';

            const ticker = item.ticker; // Ensure defined
            const isUp = item.change24h >= 0;
            const colorClass = isUp ? 'var(--accent-success)' : 'var(--accent-danger)';
            const sign = isUp ? '+' : '';

            const buyFn = filter === 'stocks' ? `MoonKat.buyStock('${ticker}')` : `MoonKat.buy('${ticker}')`;
            const sellFn = filter === 'stocks' ? `MoonKat.sellStock('${ticker}')` : `MoonKat.sell('${ticker}')`;
            const supplyText = filter === 'stocks' ? '' : `<span style="display:block; color:var(--text-secondary); font-size:0.75rem;">Supply</span><span style="font-weight:700;">${Number(item.supply || 0).toLocaleString()}</span>`;

            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:16px;">
                    <div class="coin-icon" style="color:${getColor(ticker)}; border-color:${getColor(ticker)}">
                        <i class="fas ${filter === 'stocks' ? 'fa-building' : 'fa-coins'}"></i>
                    </div>
                    <div>
                        <span style="font-weight:bold; font-size:1.1rem; display:block;">${item.name}</span>
                        <span style="color:var(--text-secondary); font-size:0.85rem;">${ticker}</span>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:center;">
                    ${sparkHtml}
                </div>

                <div style="text-align:right; margin-right:24px;">
                    <span style="font-size:1.1rem; font-weight:bold; display:block;">$${MK.formatCurrency(item.price)}</span>
                    <span style="font-size:0.9rem; font-weight:500; color:${colorClass}">${sign}${(item.change24h||0).toFixed(2)}%</span>
                </div>

                <div style="text-align:right; margin-right:10px;">
                    ${supplyText}
                </div>

                <div style="display:flex; gap:8px; justify-content:flex-end;">
                    <button class="btn-action btn-buy" onclick="event.stopPropagation(); ${buyFn}">Buy</button>
                    <button class="btn-action btn-sell" onclick="event.stopPropagation(); ${sellFn}">Sell</button>
                </div>
            `;
            list.appendChild(row);
        });
    };

    MK.buyStock = function(ticker) {
        const stock = MK.state.stocks.find(s => s.ticker === ticker);
        if (!stock) return;
        const amt = prompt(`Buy ${stock.name} Stock ($${stock.price.toFixed(2)})\nEnter # of shares:`, "1");
        if(amt) {
            const shares = parseFloat(amt);
            if (!Number.isFinite(shares) || shares <= 0) return;
            const cost = shares * stock.price;
            if(MK.updateBalance(-cost)) {
                if(!MK.state.user.portfolio) MK.state.user.portfolio = {};
                MK.state.user.portfolio[ticker] = (MK.state.user.portfolio[ticker] || 0) + shares;
                MK.addXp(cost * 0.05);
                alert(`Bought ${shares} shares of ${ticker}`);
            } else {
                alert("Insufficient Funds");
            }
        }
    };

    MK.sellStock = function(ticker) {
        const stock = MK.state.stocks.find(s => s.ticker === ticker);
        if(!MK.state.user.portfolio) MK.state.user.portfolio = {};
        const owned = MK.state.user.portfolio[ticker] || 0;
        if(owned <= 0) return alert("No shares owned.");
        
        const amt = prompt(`Sell ${ticker} (Owned: ${owned})\nEnter # of shares:`, owned);
        if(amt) {
            const shares = parseFloat(amt);
            if(shares <= owned && shares > 0) {
                const val = shares * stock.price;
                MK.updateBalance(val);
                MK.state.user.portfolio[ticker] -= shares;
                alert(`Sold for $${val.toLocaleString()}`);
            } else {
                alert("Invalid amount");
            }
        }
    };

    MK.buyBond = function(id) {
        const bond = MK.state.bonds.find(b => b.id === id);
        if(!bond) return;
        if(confirm(`Invest $${bond.price} in ${bond.name}? Yield: ${(bond.yield*100).toFixed(1)}%`)) {
            if(MK.updateBalance(-bond.price)) {
                // Simulate maturation instantly or delayed?
                // Let's do a delayed callback using setTimeout but warn user it's session based
                alert(`Bond purchased! Payout in ${(bond.duration/1000).toFixed(0)}s.`);
                setTimeout(() => {
                    const payout = bond.price * (1 + bond.yield);
                    MK.updateBalance(payout);
                    window.app.showToast(`Bond Matured: +$${payout.toLocaleString()}`, 'success');
                }, bond.duration); // Scaled duration
            } else {
                alert("Insufficient Funds");
            }
        }
    };

    MK.renderTrending = function() {
        const widget = document.getElementById('market-trending-container');
        if(!widget) return;
        
        const trending = [...MK.state.coins].sort((a,b) => b.change24h - a.change24h).slice(0, 5);
        
        widget.innerHTML = trending.map(c => `
            <div class="trending-card">
                <div style="display:flex; gap:10px; align-items:center;">
                     <div style="width:10px; height:10px; border-radius:50%; background:${getColor(c.ticker)}"></div>
                     <div>
                        <div style="font-weight:bold; font-size:0.9rem;">${c.name}</div>
                        <div style="font-size:0.75rem; color:#666;">${c.ticker}</div>
                     </div>
                </div>
                <div style="color:var(--accent-success); font-weight:bold;">
                    +${c.change24h.toFixed(1)}%
                </div>
            </div>
        `).join('');
    };

    function addFakeActivity() {
        // No-op, handled by loop
    }

    MK.renderLeaderboard = function() {
        // Widget removed in new layout
    };

    MK.currentLeaderboardTab = 'rich';

    MK.setLeaderboardTab = function(tab) {
        MK.currentLeaderboardTab = tab;
        document.querySelectorAll('.lb-tab').forEach(el => {
            el.classList.toggle('active', el.textContent.toLowerCase().includes(tab) || 
                (tab === 'rich' && el.textContent.includes('Most Money')) ||
                (tab === 'poor' && el.textContent.includes('Most Broke')) ||
                (tab === 'top10' && el.textContent.includes('Top 10')) ||
                (tab === 'top100' && el.textContent.includes('Top 100')) ||
                (tab === 'global' && el.textContent.includes('Global'))
            );
        });
        MK.renderFullLeaderboard();
    };

    MK.renderFullLeaderboard = function() {
        const list = document.getElementById("leaderboard-full-list");
        if (!list) return; // Only if on page

        let combined = getSortedLeaderboard();
        
        // Filter based on tab
        if (MK.currentLeaderboardTab === 'poor') {
            combined.sort((a, b) => a.score - b.score);
            combined = combined.slice(0, 100);
        } else if (MK.currentLeaderboardTab === 'top10') {
            combined = combined.slice(0, 10);
        } else if (MK.currentLeaderboardTab === 'top100') {
            combined = combined.slice(0, 100);
        } else if (MK.currentLeaderboardTab === 'global') {
            // Find user index
            const userIndex = combined.findIndex(u => u.isUser);
            if (userIndex !== -1) {
                const start = Math.max(0, userIndex - 3);
                const end = Math.min(combined.length, userIndex + 4);
                combined = combined.slice(start, end);
            } else {
                combined = combined.slice(0, 7); // Fallback
            }
        } else {
            // Rich (default) - maybe limit to 100 for perf
            combined = combined.slice(0, 100);
        }

        list.innerHTML = combined.map((entry) => {
            // Find actual rank in global list for display
            // If global view, use their actual rank. 
            // If sorted by poor, rank is inverted or specific.
            // Simplified: Just use current position in view for now, or calculate true rank.
            
            // Recalculate true rank if needed, but for "Rich/Top" index + 1 is fine.
            // For "Poor", it's "Rank #1 Broke".
            // For "Global", we need the absolute index.
            
            let displayRank = 0;
            const fullList = getSortedLeaderboard(); // Inefficient but accurate
            if (MK.currentLeaderboardTab === 'poor') {
                // Rank from bottom? Or just #1 Brokest
                displayRank = fullList.length - fullList.findIndex(u => u.name === entry.name);
            } else {
                displayRank = fullList.findIndex(u => u.name === entry.name) + 1;
            }

            return `
            <div class="leaderboard-row ${entry.isUser ? 'highlight' : ''}">
                <span class="rank">#${displayRank}</span>
                <span class="trader-name">${entry.name}</span>
                <span class="tier-icon">${entry.tier || '🌑'}</span>
                <span class="net-worth" style="color:${entry.score < 0 ? 'var(--accent-danger)' : 'var(--accent-success)'}">$${Math.round(entry.score).toLocaleString()}</span>
                <span class="win-rate">${entry.winRate || Math.floor(Math.random() * 40 + 40)}%</span>
                <span class="games-played">${(entry.gamesPlayed || 0).toLocaleString()}</span>
            </div>
        `}).join("");
    };

    function getSortedLeaderboard() {
        // Cache this if performance becomes an issue
        const bots = [...MK.state.bots].map(b => ({ 
            name: b.name, 
            score: b.profit, 
            winRate: b.winRate, 
            tier: b.tier,
            gamesPlayed: b.gamesPlayed,
            isUser: false 
        }));
        
        const userWorth = MK.getUserNetWorth();
        const userTier = MK.TIERS[MK.state.user.tierIndex].icon;
        
        bots.push({ 
            name: MK.state.user.username, 
            score: userWorth, 
            winRate: 50, 
            tier: userTier,
            gamesPlayed: MK.state.user.stats ? MK.state.user.stats.gamesPlayed : 0,
            isUser: true 
        });
        
        return bots.sort((a, b) => b.score - a.score);
    }
    
    MK.renderLaunchpadStats = function() {
        const totalTokensEl = document.getElementById("launchpad-total-tokens");
        const totalSupplyEl = document.getElementById("launchpad-total-supply");
        const listEl = document.getElementById("launchpad-recent-list");
        if (!totalTokensEl || !totalSupplyEl || !listEl) return;

        // Filter only user launched tokens
        const launches = MK.state.launches || [];
        const totalSupply = launches.reduce((sum, l) => sum + l.amount, 0);

        totalTokensEl.innerText = launches.length.toLocaleString();
        totalSupplyEl.innerText = totalSupply.toLocaleString();

        listEl.innerHTML = launches.slice(0, 5).map((l) => `
            <div style="padding:8px 10px; border-radius:10px; background:rgba(255,255,255,0.03); margin-bottom:8px;">
                <div style="font-weight:700;">${l.name} <span style="color:var(--text-secondary)">(${l.ticker})</span></div>
                <div style="font-size:0.8rem; color:var(--text-secondary);">Supply: ${l.amount.toLocaleString()}</div>
            </div>
        `).join("");
    };

    function spawnRandomToken() {
        const { coinPrefixes, coinSuffixes } = window.MoonKatData;
        const name = coinPrefixes[Math.floor(Math.random() * coinPrefixes.length)] + coinSuffixes[Math.floor(Math.random() * coinSuffixes.length)];
        
        const ticker = name.replace(/[^A-Za-z]/g, "").slice(0, 5).toUpperCase() || `TK${Math.floor(Math.random() * 90 + 10)}`;
        const amount = Math.floor(Math.random() * 9000000 + 1000000);

        MK.createCoin(name, ticker, amount, true);
        
        // Add to ticker via helper
        addTickerItem(`<span style="color:var(--accent-primary); font-weight:bold;">NEW LISTING</span> ${name} (${ticker}) <span style="color:#888">Supply: ${amount.toLocaleString()}</span>`);
    }

    function getColor(ticker) {
        const colors = ['#f7931a', '#627eea', '#00ff7f', '#e91e63', '#9c27b0', '#ffeb3b', '#ff9f1c'];
        let hash = 0;
        for (let i = 0; i < ticker.length; i++) hash += ticker.charCodeAt(i);
        return colors[hash % colors.length];
    }

    MK.buy = function(ticker) {
        const coin = MK.state.coins.find(c => c.ticker === ticker);
        if (!coin) return;
        const amt = prompt(`Buy ${ticker} ($${MK.formatCurrency(coin.price)})\nEnter USD amount:`, "100");
        if(amt) {
            const val = parseFloat(amt);
            if (!Number.isFinite(val) || val <= 0) return;
            if(MK.updateBalance(-val)) {
                MK.state.user.inventory[ticker] = (MK.state.user.inventory[ticker] || 0) + (val / coin.price);
                coin.price *= 1.02;
                MK.addXp(val * 0.1); 
                MK.renderMarket();
            } else {
                alert("Insufficient Funds");
            }
        }
    };

    MK.sell = function(ticker) {
        const coin = MK.state.coins.find(c => c.ticker === ticker);
        if (!coin) return;
        const owned = MK.state.user.inventory[ticker] || 0;
        if(owned <= 0) return alert("You don't hold any " + ticker);
        
        const amt = prompt(`Sell ${ticker} (Holdings: ${owned.toFixed(4)})\nEnter amount to sell:`, owned);
        if(amt) {
            const val = parseFloat(amt);
            if (!Number.isFinite(val) || val <= 0) return;
            if(val <= owned) {
                const total = val * coin.price;
                MK.updateBalance(total);
                MK.state.user.inventory[ticker] -= val;
                coin.price *= 0.98;
                MK.addXp(total * 0.1);
                MK.renderMarket();
            } else {
                alert("Insufficient holdings");
            }
        }
    };

    MK.createCoin = function(name, ticker, launchAmount, fromRandomSpawn) {
        const amount = Number.isFinite(launchAmount) && launchAmount > 0 ? Math.floor(launchAmount) : 1000000;
        let safeTicker = ticker.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "NEWTKN";
        
        // Uniqueness Check
        if (MK.state.coins.some((c) => c.ticker === safeTicker)) {
            if (fromRandomSpawn) {
                // Bots retry with modified ticker
                safeTicker = `${safeTicker.slice(0, 6)}${Math.floor(Math.random() * 90 + 10)}`;
            } else {
                // User rejected
                alert(`Ticker ${safeTicker} is already taken!`);
                return;
            }
        }

        MK.state.coins.unshift({
            name, ticker: safeTicker,
            price: Math.random() * 5,
            change24h: 0,
            marketCap: 0,
            history: generateHistory(Math.random() * 5),
            supply: amount,
            launchedAmount: amount
        });
        
        // Only track launches for user
        if (!fromRandomSpawn) {
            MK.state.launches.unshift({ name, ticker: safeTicker, amount, ts: Date.now() });
            MK.addXp(500); 
            // In online mode, we might want to sync this to cloud eventually
        }
        MK.renderMarket();
        MK.renderLaunchpadStats();
    };

})();
