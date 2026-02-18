(function () {
    const MK = window.MoonKat;

    // --- GAME CATALOG (50+ Games) ---
    MK.gameCatalog = [
        // --- CASH GAMES ---
        { id: "crash", icon: "fa-rocket", name: "Rocket Run", desc: "Eject before the crash! (Unpredictable)", options: ["1.5", "2.0", "3.0", "5.0", "10.0"] },
        { id: "roulette", icon: "fa-life-ring", name: "Cosmic Spin", desc: "Red, Black, or Green.", options: ["red", "black", "green"] },
        { id: "slots", icon: "fa-gamepad", name: "Neon Slots", desc: "Jackpot awaits.", cost: 5 },
        { id: "coinflip", icon: "fa-coins", name: "Quantum Flip", desc: "Heads or Tails.", options: ["heads", "tails"] },
        { id: "dice", icon: "fa-dice", name: "Neon Dice", desc: "Roll High or Low.", options: ["high", "low"] },
        { id: "hilo", icon: "fa-sort-amount-up", name: "High Voltage", desc: "Higher or Lower?", options: ["higher", "lower"] },
        { id: "keno", icon: "fa-table", name: "Keno 80", desc: "Pick odd/even strategy.", options: ["odd", "even"], cost: 5 },
        { id: "mines", icon: "fa-bomb", name: "Minefield", desc: "Don't step on the mines.", options: ["2", "3", "5"], cost: 10 },
        { id: "plinko", icon: "fa-bowling-ball", name: "Plinko Classic", desc: "Gravity determines your fate.", cost: 10 },
        { id: "baccarat", icon: "fa-credit-card", name: "Baccarat Pro", desc: "Player vs Banker.", options: ["player", "banker", "tie"], cost: 15 },
        { id: "wheel", icon: "fa-dharmachakra", name: "Fortune Wheel", desc: "Spin to win big.", cost: 15 },
        { id: "limbo", icon: "fa-chart-bar", name: "Limbo Jet", desc: "Fly under the radar.", options: ["1.5", "2.0", "5.0", "10.0"], cost: 20 },
        { id: "tower", icon: "fa-building", name: "Tower Climb", desc: "Ascend safely.", options: ["1", "2", "3"], cost: 20 },
        { id: "rps", icon: "fa-hand-scissors", name: "RPS Duel", desc: "Rock, Paper, Scissors.", options: ["rock", "paper", "scissors"], cost: 25 },
        { id: "lucky7", icon: "fa-dice-d20", name: "Lucky 7s", desc: "Roll a 7.", cost: 30 },
        { id: "blackjack", icon: "fa-heart", name: "Neon Blackjack", desc: "Beat the dealer to 21.", options: ["hit", "stand"], cost: 50 },
        { id: "poker", icon: "fa-spade", name: "Cyber Poker", desc: "Jacks or Better pair.", cost: 50 },
        { id: "racing", icon: "fa-horse-head", name: "Bot Racing", desc: "Bet on the winner.", options: ["Alpha", "Beta", "Gamma", "Delta"], cost: 40 },
        { id: "penalty", icon: "fa-futbol", name: "Penalty Kick", desc: "Pick a corner.", options: ["left", "center", "right"], cost: 25 },
        { id: "crazywheel", icon: "fa-fan", name: "Dream Spinner", desc: "Volatile wheel with huge multis.", cost: 100 },
        { id: "plinkox", icon: "fa-chevron-down", name: "Plinko X", desc: "Extreme volatility Plinko.", cost: 50 },
        { id: "lootbox", icon: "fa-box-open", name: "Loot Box", desc: "Open a case for rare skins.", cost: 75 },
        { id: "scratch", icon: "fa-ticket-alt", name: "Lucky Scratch", desc: "Match 3 symbols.", cost: 20 },
        { id: "lotto", icon: "fa-ticket", name: "Moon Lotto", desc: "Pick a lucky number (1-10).", options: ["1", "3", "5", "7", "9"], cost: 10 },
        { id: "revolver", icon: "fa-crosshairs", name: "Revolver", desc: "1/6 chance to lose it all.", options: ["pull"], cost: 100 },
        { id: "graph", icon: "fa-chart-line", name: "Trade Graph", desc: "Predict stock movement.", options: ["up", "down"], cost: 35 },
        { id: "color", icon: "fa-palette", name: "Chroma Key", desc: "Pick the next color.", options: ["red", "blue", "yellow"], cost: 15 },
        { id: "oracle", icon: "fa-eye", name: "Oracle", desc: "Ask the crystal ball.", options: ["yes", "no"], cost: 50 },
        { id: "safe", icon: "fa-lock", name: "Vault Breaker", desc: "Guess the last digit (0-9).", options: ["0", "5", "7", "9"], cost: 60 },
        { id: "binary", icon: "fa-network-wired", name: "Binary Option", desc: "0 or 1 outcome.", options: ["0", "1"], cost: 30 },
        
        // --- NEW EXPANSION (25 Games) ---
        { id: "slide", icon: "fa-sliders-h", name: "Neon Slide", desc: "Slide for multipliers." },
        { id: "stairs", icon: "fa-stream", name: "Cyber Stairs", desc: "Climb for glory.", options: ["1", "3", "5"] },
        { id: "diamonds", icon: "fa-gem", name: "Gem Hunter", desc: "Find the hidden gems." },
        { id: "dragontower", icon: "fa-dungeon", name: "Dragon Tower", desc: "Reveal eggs, avoid fire." },
        { id: "keno40", icon: "fa-border-all", name: "Keno 40", desc: "40 Ball Variant." },
        { id: "videopoker", icon: "fa-laptop-code", name: "Video Poker", desc: "Classic 5 Card Draw." },
        { id: "bjsurrender", icon: "fa-flag", name: "BJ Surrender", desc: "Blackjack with surrender." },
        { id: "doublewheel", icon: "fa-dharmachakra", name: "Twin Spin", desc: "Two wheels, double fun." },
        { id: "tripleclover", icon: "fa-leaf", name: "Triple Clover", desc: "3-Reel Classic." },
        { id: "cyberdice", icon: "fa-cube", name: "Cyber Dice 3D", desc: "Physics based rolling." },
        { id: "pachinko", icon: "fa-dot-circle", name: "Neon Pachinko", desc: "Drop the ball." },
        { id: "marblerace", icon: "fa-flag-checkered", name: "Marble Race", desc: "Bet on the winner." },
        { id: "cardmatch", icon: "fa-clone", name: "Card Match", desc: "Memory betting." },
        { id: "higherlower", icon: "fa-arrows-alt-v", name: "Higher Lower", desc: "Streak betting." },
        { id: "colorpred", icon: "fa-eye-dropper", name: "Color Predict", desc: "Next sequence color." },
        { id: "speedbaccarat", icon: "fa-bolt", name: "Speed Baccarat", desc: "Fast paced action." },
        { id: "war", icon: "fa-fighter-jet", name: "Casino War", desc: "High card wins." },
        { id: "reddog", icon: "fa-dog", name: "Red Dog", desc: "Spread betting." },
        { id: "sicbo", icon: "fa-dice-six", name: "Sic Bo", desc: "3 Dice Asian Classic." },
        { id: "andarbahar", icon: "fa-balance-scale", name: "Andar Bahar", desc: "Left or Right." },
        { id: "teenpatti", icon: "fa-users", name: "Teen Patti", desc: "3 Card Brag." },
        { id: "fantan", icon: "fa-ellipsis-h", name: "Fan Tan", desc: "Count the beads." },
        { id: "bullbear", icon: "fa-chart-area", name: "Bull Bear", desc: "Market simulation." },
        { id: "runebound", icon: "fa-magic", name: "Runebound", desc: "Match the runes." },
        { id: "ethercrash", icon: "fa-plane-departure", name: "Ether Crash", desc: "Plane flight variant." },

        // --- SKILL GAMES ---
        { id: "reflex", icon: "fa-bolt", name: "Hyper Reflex", desc: "Click when it turns green!", cost: 20 },
        { id: "memory", icon: "fa-brain", name: "Pattern Mind", desc: "Repeat the sequence.", cost: 25 },
        { id: "typer", icon: "fa-keyboard", name: "Speed Typer", desc: "Type the code fast.", cost: 30 },

        // --- GEM LOUNGE (Custom Games) ---
        { id: "gem_crash", icon: "fa-rocket", name: "Starship Voyager", desc: "Infinite multiplier potential.", currency: "gems", options: ["2.0", "5.0", "10.0"] },
        { id: "gem_plinko", icon: "fa-bowling-ball", name: "Diamond Drop", desc: "High stakes Plinko.", currency: "gems" },
        { id: "gem_mines", icon: "fa-bomb", name: "Crystal Mines", desc: "Clear the field for gems.", currency: "gems", options: ["1", "3", "5"] },
        { id: "gem_slots", icon: "fa-gem", name: "Royal Slots", desc: "Win the Crown Jewels.", currency: "gems" },
        { id: "gem_poker", icon: "fa-spade", name: "High Roller Poker", desc: "Only for the elite.", currency: "gems" },
        { id: "gem_roulette", icon: "fa-life-ring", name: "VIP Roulette", desc: "No limits.", currency: "gems", options: ["red", "black", "green"] },
        { id: "gem_dice", icon: "fa-dice-d20", name: "Golden Dice", desc: "Roll for gold.", currency: "gems", options: ["high", "low"] },
        { id: "gem_hilo", icon: "fa-sort", name: "Ascension", desc: "Climb the ladder.", currency: "gems", options: ["higher", "lower"] },
        { id: "gem_blackjack", icon: "fa-heart", name: "Platinum BJ", desc: "Dealer stands on 17.", currency: "gems", options: ["hit", "stand"] },
        { id: "gem_baccarat", icon: "fa-credit-card", name: "Grand Baccarat", desc: "The gentleman's game.", currency: "gems", options: ["player", "banker"] }
    ];

    MK.renderArena = function (filter = 'cash') {
        const grid = document.getElementById("arena-grid");
        if (!grid) return;
        
        if (!MK.state.user.unlockedGames) {
            MK.state.user.unlockedGames = ["crash", "roulette", "coinflip", "dice", "hilo"];
        }

        let toggle = document.getElementById('arena-currency-toggle');
        if(!toggle) {
            const container = document.getElementById('page-arena').querySelector('.section-title');
            toggle = document.createElement('div');
            toggle.id = 'arena-currency-toggle';
            toggle.style.marginTop = '10px';
            toggle.innerHTML = `
                <button class="btn-sm active" id="btn-cash-games" onclick="MoonKat.renderArena('cash')">CASH GAMES</button>
                <button class="btn-sm" id="btn-gem-games" onclick="MoonKat.renderArena('gems')">GEM LOUNGE</button>
            `;
            container.appendChild(toggle);
        }

        document.getElementById('btn-cash-games').classList.toggle('active', filter === 'cash');
        document.getElementById('btn-gem-games').classList.toggle('active', filter === 'gems');
        document.getElementById('btn-gem-games').style.background = filter === 'gems' ? 'var(--accent-premium)' : 'rgba(255,255,255,0.1)';
        document.getElementById('btn-gem-games').style.color = filter === 'gems' ? 'black' : 'white';

        let gamesToShow = [];
        if (filter === 'cash') {
            gamesToShow = MK.gameCatalog.filter(g => !g.currency || g.currency === 'cash');
        } else {
            const gemGames = MK.gameCatalog.filter(g => g.currency === 'gems');
            // If explicit gem games exist, use them. Otherwise fallback (though we defined them above).
            gamesToShow = gemGames.length > 0 ? gemGames : MK.gameCatalog.filter(g => g.id.startsWith('gem_')); 
        }

        grid.innerHTML = gamesToShow
            .map((game) => {
                const isGem = game.currency === 'gems';
                const isUnlocked = isGem ? true : MK.state.user.unlockedGames.includes(game.id);
                
                const lockOverlay = isUnlocked ? '' : '<div class="lock-overlay"><i class="fas fa-lock"></i></div>';
                const cost = game.cost || 0;
                const desc = isUnlocked ? game.desc : `<span style="color:var(--accent-premium); font-weight:bold;">${cost} GEMS</span>`;
                
                return `
                <div class="arena-card ${isUnlocked ? '' : 'locked'} ${isGem ? 'premium-border' : ''}" 
                     data-game="${game.id}" 
                     data-currency="${isGem ? 'gems' : 'cash'}"
                     data-cost="${cost}" 
                     data-locked="${!isUnlocked}"
                     data-name="${game.name}">
                    ${lockOverlay}
                    <div class="arena-icon" style="${isGem ? 'color:var(--accent-premium)' : ''}"><i class="fas ${game.icon}"></i></div>
                    <div class="arena-name">${game.name}</div>
                    <div class="arena-desc">${desc}</div>
                </div>`;
            })
            .join("");
            
        if(window.app && window.app.bindArenaCards) window.app.bindArenaCards();
    };

    MK.launchGame = function (gameId, containerId) {
        const root = document.getElementById(containerId);
        if (!root) return;

        // Cleanup previous instance
        if (MK.currentGameInstance && typeof MK.currentGameInstance.destroy === 'function') {
            MK.currentGameInstance.destroy();
            MK.currentGameInstance = null;
        }
        root.innerHTML = '';

        const game = MK.gameCatalog.find((g) => g.id === gameId);
        if (!game) return console.error("Game not found:", gameId);

        const isGem = gameId.startsWith('gem_');
        const logicId = gameId.replace('gem_', '');
        const currency = isGem ? 'gems' : 'cash';

        // Class Mapping
        const classMap = {
            'crash': MK.CrashGame,
            'roulette': MK.RouletteGame,
            'slots': MK.SlotsGame,
            'blackjack': MK.BlackjackGame,
            'baccarat': MK.BaccaratGame,
            'poker': MK.PokerGame,
            'dice': MK.DiceGame,
            'lucky7': MK.Lucky7Game,
            'plinko': MK.PlinkoGame,
            'plinkox': MK.PlinkoGame,
            'mines': MK.MinesGame,
            'keno': MK.KenoGame,
            'wheel': MK.WheelGame,
            'crazywheel': MK.WheelGame,
            'limbo': MK.LimboGame,
            'hilo': MK.HiloGame,
            'coinflip': MK.CoinflipGame,
            'tower': MK.TowerGame,
            'reflex': MK.ReflexGame,
            'typer': MK.TyperGame,
            'memory': MK.MemoryGame,
            'rps': MK.RpsGame,
            'racing': MK.RacingGame,
            'penalty': MK.PenaltyGame,
            'lootbox': MK.LootboxGame,
            'scratch': MK.ScratchGame,
            'lotto': MK.LottoGame,
            'graph': MK.GraphGame,
            'color': MK.ColorGame,
            'oracle': MK.OracleGame,
            'safe': MK.SafeGame,
            'binary': MK.BinaryGame,
            'revolver': MK.RevolverGame,
            
            // New Expansion
            'slide': MK.SlideGame,
            'stairs': MK.StairsGame,
            'diamonds': MK.DiamondsGame,
            'dragontower': MK.DragonTowerGame,
            'keno40': MK.Keno40Game,
            'videopoker': MK.VideoPokerGame,
            'bjsurrender': MK.BJSurrenderGame,
            'doublewheel': MK.DoubleWheelGame,
            'tripleclover': MK.TripleCloverGame,
            'cyberdice': MK.CyberDiceGame,
            'pachinko': MK.PachinkoGame,
            'marblerace': MK.MarbleRaceGame,
            'cardmatch': MK.CardMatchGame,
            'higherlower': MK.HigherLowerGame,
            'colorpred': MK.ColorPredGame,
            'speedbaccarat': MK.SpeedBaccaratGame,
            'war': MK.WarGame,
            'reddog': MK.RedDogGame,
            'sicbo': MK.SicBoGame,
            'andarbahar': MK.AndarBaharGame,
            'teenpatti': MK.TeenPattiGame,
            'fantan': MK.FanTanGame,
            'bullbear': MK.BullBearGame,
            'runebound': MK.RuneboundGame,
            'ethercrash': MK.EtherCrashGame
        };

        const GameClass = classMap[logicId];

        if (GameClass) {
            // Instantiate with (containerId, currency, variant/logicId)
            // Note: logicId is passed as 'variant' which games like Plinko/Wheel use
            MK.currentGameInstance = new GameClass(containerId, currency, logicId);
        } else {
            root.innerHTML = `<div style="text-align:center; padding:50px;">Game module for <b>${logicId}</b> not loaded.</div>`;
            console.error(`Class for ${logicId} not found in MoonKat namespace.`);
        }
    };

})();
