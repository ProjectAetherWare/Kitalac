(function() {
    const MK = window.MoonKat;

    // Asset Types
    MK.ASSET_TYPES = {
        VEHICLE: { icon: 'fa-car', label: 'Vehicle' },
        REAL_ESTATE: { icon: 'fa-home', label: 'Real Estate' },
        TECH: { icon: 'fa-microchip', label: 'Tech' },
        LUXURY: { icon: 'fa-gem', label: 'Luxury' }
    };

    // Catalog of possible assets
    const ASSET_CATALOG = [
        { name: "CyberTruck X", type: "VEHICLE", basePrice: 50000, premium: false },
        { name: "Neon Roadster", type: "VEHICLE", basePrice: 120000, premium: true },
        { name: "Hover Bike", type: "VEHICLE", basePrice: 25000, premium: false },
        { name: "Penthouse Suite", type: "REAL_ESTATE", basePrice: 2500000, premium: true },
        { name: "Moon Base Pod", type: "REAL_ESTATE", basePrice: 500000, premium: false },
        { name: "Quantum Rig", type: "TECH", basePrice: 15000, premium: false },
        { name: "AI Server Farm", type: "TECH", basePrice: 80000, premium: true },
        { name: "Gold Rolex", type: "LUXURY", basePrice: 35000, premium: false },
        { name: "Diamond Hands", type: "LUXURY", basePrice: 100000, premium: true }
    ];

    MK.initAssets = function() {
        if (!MK.state.user.assets) MK.state.user.assets = []; 
        if (!MK.state.marketAssets) MK.state.marketAssets = [];
        
        // Spawn initial assets if empty
        if (MK.state.marketAssets.length === 0) {
            spawnAssets(5);
        }

        // Loop to spawn/despawn assets
        setInterval(() => {
            if(!MK.state.marketAssets) MK.state.marketAssets = [];
            
            // Higher spawn rate if empty
            const chance = MK.state.marketAssets.length < 3 ? 0.8 : 0.3;
            if (Math.random() < chance) spawnAssets(1);
            
            // Sim Bots buying assets
            if (Math.random() < 0.2 && MK.state.marketAssets.length > 3) {
                const index = Math.floor(Math.random() * MK.state.marketAssets.length);
                const asset = MK.state.marketAssets[index];
                if(asset) {
                    MK.state.marketAssets.splice(index, 1);
                    // Notification if high value
                    if (asset.price > 100000 && window.app && window.app.showToast) {
                        // Safety check for bots
                        let buyer = "Rich Bot";
                        if(MK.state.bots && MK.state.bots.length > 0) {
                             buyer = MK.state.bots[Math.floor(Math.random()*MK.state.bots.length)].name;
                        }
                        window.app.showToast(`${asset.name} bought by ${buyer}!`, 'info');
                    }
                }
                MK.renderAssets();
            }
            
            MK.renderAssets();
        }, 8000); // Slightly faster loop
    };

    function spawnAssets(count) {
        for (let i = 0; i < count; i++) {
            const template = ASSET_CATALOG[Math.floor(Math.random() * ASSET_CATALOG.length)];
            const asset = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                ...template,
                price: Math.floor(template.basePrice * (0.8 + Math.random() * 0.4)), // +/- 20%
                expires: Date.now() + 1000 * 60 * (5 + Math.random() * 25) // 5-30 mins
            };
            MK.state.marketAssets.push(asset);
        }
    }

    function removeRandomAsset() {
        MK.state.marketAssets.shift();
    }

    MK.renderAssets = function() {
        const grid = document.getElementById('asset-market-grid');
        if (!grid) return; // Only render if on page

        if (!MK.state.marketAssets) MK.state.marketAssets = [];

        grid.innerHTML = MK.state.marketAssets.map(asset => {
            const typeInfo = MK.ASSET_TYPES[asset.type] || { icon: 'fa-question', label: 'Unknown' };
            const priceDisplay = asset.premium 
                ? `<span class="premium-text"><i class="fas fa-gem"></i> ${asset.price.toLocaleString()}</span>`
                : `$${asset.price.toLocaleString()}`;
            
            const buyBtn = asset.premium 
                ? `<button class="btn-action btn-premium" onclick="MoonKat.buyAsset('${asset.id}', true)">Buy (gems)</button>`
                : `<button class="btn-action btn-buy" onclick="MoonKat.buyAsset('${asset.id}', false)">Buy</button>`;

            return `
                <div class="asset-card ${asset.premium ? 'premium-border' : ''}">
                    <div class="asset-icon"><i class="fas ${typeInfo.icon}"></i></div>
                    <div class="asset-details">
                        <h4>${asset.name}</h4>
                        <p class="asset-type">${typeInfo.label}</p>
                        <div class="asset-price">${priceDisplay}</div>
                    </div>
                    ${buyBtn}
                </div>
            `;
        }).join('');

        renderInventory();
    };

    function renderInventory() {
        const list = document.getElementById('user-inventory-list');
        if (!list) return;
        
        if (!MK.state.user.assets) MK.state.user.assets = [];

        if (MK.state.user.assets.length === 0) {
            list.innerHTML = '<div class="empty-state">No assets owned yet.</div>';
            return;
        }

        list.innerHTML = MK.state.user.assets.map(asset => {
            const typeInfo = MK.ASSET_TYPES[asset.type] || { icon: 'fa-question', label: 'Unknown' };
            return `
                <div class="inventory-item">
                    <i class="fas ${typeInfo.icon}"></i>
                    <span>${asset.name}</span>
                    <span class="asset-value">Est. $${asset.price.toLocaleString()}</span>
                    <button class="btn-sm btn-sell" onclick="MoonKat.sellAsset('${asset.id}')">Sell</button>
                </div>
            `;
        }).join('');
    }

    MK.buyAsset = function(id, isPremium) {
        const index = MK.state.marketAssets.findIndex(a => a.id === id);
        if (index === -1) return alert("Asset expired or sold!");
        const asset = MK.state.marketAssets[index];

        if (isPremium) {
            if (MK.state.user.premiumBalance >= asset.price) {
                MK.state.user.premiumBalance -= asset.price;
                completePurchase(asset, index);
            } else {
                alert("Not enough MoonGems!");
            }
        } else {
            if (MK.state.user.balance >= asset.price) {
                MK.updateBalance(-asset.price);
                completePurchase(asset, index);
            } else {
                alert("Insufficient Funds!");
            }
        }
    };

    function completePurchase(asset, index) {
        MK.state.marketAssets.splice(index, 1);
        MK.state.user.assets.push(asset);
        MK.addXp(asset.price * (asset.premium ? 0.5 : 0.05)); // More XP for premium
        MK.renderAssets();
        MK.renderUserStats();
        alert(`Purchased ${asset.name}!`);
    }

    MK.sellAsset = function(id) {
        const index = MK.state.user.assets.findIndex(a => a.id === id);
        if (index === -1) return;
        const asset = MK.state.user.assets[index];
        
        const sellPrice = Math.floor(asset.price * 0.8); // 20% depreciation instant
        
        if (confirm(`Sell ${asset.name} for $${sellPrice.toLocaleString()}? (Premium assets sell for cash)`)) {
            MK.updateBalance(sellPrice);
            MK.state.user.assets.splice(index, 1);
            MK.renderAssets();
        }
    };

})();
