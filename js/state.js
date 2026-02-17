// Initialize Global Namespace
window.MoonKat = window.MoonKat || {};

// Tiers Configuration
window.MoonKat.TIERS = [
    { name: "Stray Kat", minXp: 0, icon: "🌑" },
    { name: "Alley Kat", minXp: 1000, icon: "🌒" },
    { name: "House Kat", minXp: 5000, icon: "🌓" },
    { name: "Fat Kat", minXp: 15000, icon: "🌔" },
    { name: "Kitalac", minXp: 50000, icon: "🍫" },
    { name: "Galactic Kat", minXp: 150000, icon: "🌌" }
];

// State
window.MoonKat.state = {
    user: {
        username: "Guest",
        bio: "Just a Kitalac player.",
        balance: 100.00,
        premiumBalance: 0,
        inventory: {},
        assets: [],
        xp: 0,
        tierIndex: 0,
        unlockedGames: ["crash", "roulette", "coinflip", "dice", "hilo"],
        stats: {
            totalBets: 0,
            totalWon: 0,
            totalLost: 0,
            gamesPlayed: 0,
            tokensLaunched: 0,
            assetsBought: 0
        },
        achievements: [], // IDs of claimed achievements
        lastDailyBonus: 0
    },
    coins: [],
    stocks: [
        { ticker: 'APL', name: 'Applex', price: 150.00, history: [], volatility: 0.02 },
        { ticker: 'GGL', name: 'Googol', price: 2800.00, history: [], volatility: 0.015 },
        { ticker: 'TSL', name: 'Teslaq', price: 900.00, history: [], volatility: 0.04 },
        { ticker: 'AMZ', name: 'Amazone', price: 3300.00, history: [], volatility: 0.01 },
        { ticker: 'NVDA', name: 'Nvidium', price: 500.00, history: [], volatility: 0.03 }
    ],
    bonds: [
        { id: 'b1', name: 'Treasury 1Y', yield: 0.05, duration: 60 * 1000, price: 1000 }, // 1 min duration for game speed
        { id: 'b2', name: 'Corp AAA 5Y', yield: 0.12, duration: 300 * 1000, price: 5000 },
        { id: 'b3', name: 'Junk Bond', yield: 0.50, duration: 120 * 1000, price: 500, risk: 0.2 } // 20% default risk
    ],
    launches: [],
    marketAssets: [],
    history: [],
    bots: [],
    settings: {
        sound: true,
        lowSpec: false
    },
    mode: 'offline' // 'offline' or 'online'
};

window.MoonKat.initBots = function() {
    if (window.MoonKat.state.bots.length > 0) return;
    
    const { userPrefixes, userSuffixes, userSingles } = window.MoonKatData;
    const bots = [];
    const usedNames = new Set();

    // Create 10000 Bots
    for (let i = 0; i < 10000; i++) {
        let name;
        // Generate Unique Name
        do {
            const type = Math.random();
            if (type < 0.4) {
                name = userPrefixes[Math.floor(Math.random() * userPrefixes.length)] + userSuffixes[Math.floor(Math.random() * userSuffixes.length)];
            } else if (type < 0.7) {
                name = userPrefixes[Math.floor(Math.random() * userPrefixes.length)] + Math.floor(Math.random() * 999);
            } else {
                name = userSingles[Math.floor(Math.random() * userSingles.length)] + (Math.random() > 0.5 ? Math.floor(Math.random() * 999) : "");
            }
        } while (usedNames.has(name));
        usedNames.add(name);

        // Distribute Wealth (Smoother Curve)
        let profit;
        const rand = Math.random();
        
        if (rand < 0.01) { // 1% Whales
            profit = 5000000 + Math.random() * 95000000;
        } else if (rand < 0.05) { // 4% Rich
            profit = 500000 + Math.random() * 4500000;
        } else if (rand < 0.20) { // 15% Upper Middle
            profit = 50000 + Math.random() * 450000;
        } else if (rand < 0.50) { // 30% Average
            profit = 1000 + Math.random() * 49000;
        } else if (rand < 0.85) { // 35% Lower Middle (around player start)
            profit = 50 + Math.random() * 950;
        } else { // 15% Poor/Debt
            profit = -5000 + Math.random() * 5050; // -5000 to 50
        }

        bots.push({ 
            name, 
            profit, 
            winRate: Math.floor(Math.random() * 100),
            tier: window.MoonKat.TIERS[Math.min(5, Math.floor(Math.random() * 6))].icon, // Random tier icon
            gamesPlayed: Math.floor(Math.random() * 5000)
        });
    }

    // Sort initially by profit
    bots.sort((a, b) => b.profit - a.profit);
    window.MoonKat.state.bots = bots;
};

window.MoonKat.getUserNetWorth = function() {
    const s = window.MoonKat.state;
    let holdings = 0;
    Object.entries(s.user.inventory).forEach(([ticker, amount]) => {
        const coin = s.coins.find((c) => c.ticker === ticker);
        if (coin) holdings += amount * coin.price;
    });
    return s.user.balance + holdings;
};

window.MoonKat.updateLeaderboard = function() {
    const s = window.MoonKat.state;
    s.bots.forEach((bot) => {
        bot.profit += Math.floor(Math.random() * 3000) - 1200;
    });
};

// Helpers
window.MoonKat.formatCurrency = function(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return num.toFixed(2);
    if (num < 0.0001 && num > 0) return num.toExponential(4);
    return num.toFixed(4);
};

window.MoonKat.updateBalance = function(amount) {
    if (window.MoonKat.state.user.balance + amount < -0.01) return false;
    window.MoonKat.state.user.balance += amount;
    window.MoonKat.renderUserStats();
    return true;
};

window.MoonKat.addXp = function(amount) {
    const s = window.MoonKat.state.user;
    s.xp += Math.floor(amount);
    
    // Check Rank Up
    const tiers = window.MoonKat.TIERS;
    let newTierIdx = s.tierIndex;
    
    // Find highest tier qualified for
    for(let i = 0; i < tiers.length; i++) {
        if(s.xp >= tiers[i].minXp) newTierIdx = i;
    }

    if(newTierIdx > s.tierIndex) {
        alert(`LEVEL UP! You are now a ${tiers[newTierIdx].name} ${tiers[newTierIdx].icon}`);
        s.tierIndex = newTierIdx;
    }
    
    window.MoonKat.renderUserStats();
};

window.MoonKat.renderUserStats = function() {
    const s = window.MoonKat.state.user;
    const tiers = window.MoonKat.TIERS;
    const currentTier = tiers[s.tierIndex];
    const nextTier = tiers[s.tierIndex + 1] || { minXp: s.xp * 2 };

    const balEl = document.getElementById('user-balance');
    const premEl = document.getElementById('user-premium');
    if(balEl) balEl.innerText = window.MoonKat.formatCurrency(s.balance);
    if(premEl) premEl.innerText = s.premiumBalance.toLocaleString();

    const tierNameEl = document.getElementById('user-tier-name');
    const tierIconEl = document.getElementById('user-tier-icon');
    const xpEl = document.getElementById('user-xp');
    const nextXpEl = document.getElementById('next-level-xp');
    const barFill = document.getElementById('xp-bar-fill');
    const usernameEl = document.getElementById('header-username');

    if(tierNameEl) tierNameEl.innerText = currentTier.name;
    if(tierIconEl) tierIconEl.innerText = currentTier.icon;
    if(xpEl) xpEl.innerText = s.xp.toLocaleString();
    if(nextXpEl) nextXpEl.innerText = nextTier.minXp.toLocaleString();
    if(usernameEl) usernameEl.innerText = s.username;

    // Bar Width
    if(barFill) {
        const range = nextTier.minXp - currentTier.minXp;
        const progress = s.xp - currentTier.minXp;
        const pct = Math.min(100, Math.max(0, (progress / range) * 100));
        barFill.style.width = `${pct}%`;
    }
};

// Initial Coins Data
window.MoonKat.initialCoins = [
    { name: 'Bitcoin', ticker: 'BTC', price: 63085.84, history: [], supply: 21000000, launchedAmount: 21000000 },
    { name: 'Ethereum', ticker: 'ETH', price: 3467.87, history: [], supply: 120000000, launchedAmount: 120000000 },
    { name: 'Solana', ticker: 'SOL', price: 139.13, history: [], supply: 589000000, launchedAmount: 589000000 },
    { name: 'Kitalac', ticker: 'KTL', price: 0.00420, history: [], supply: 1000000000, launchedAmount: 1000000000 },
    { name: 'Doge', ticker: 'DOGE', price: 0.16, history: [], supply: 145000000000, launchedAmount: 145000000000 }
];
