(function() {
    const MK = window.MoonKat;
    
    // Achievement Definitions
    const ACHIEVEMENTS = [
        { id: 'first_bet', name: "First Steps", desc: "Place your first bet.", reward: 50, condition: (s) => s.totalBets >= 1 },
        { id: 'high_roller', name: "High Roller", desc: "Win $1,000 in total.", reward: 200, condition: (s) => s.totalWon >= 1000 },
        { id: 'whale', name: "Whale Status", desc: "Hold $1,000,000 net worth.", reward: 5000, condition: (s) => MK.getUserNetWorth() >= 1000000 },
        { id: 'collector', name: "Collector", desc: "Buy 3 Assets.", reward: 500, condition: (s) => s.assetsBought >= 3 },
        { id: 'developer', name: "Dev Mode", desc: "Launch your own token.", reward: 1000, condition: (s) => s.tokensLaunched >= 1 },
        { id: 'addict', name: "Degen", desc: "Play 100 rounds.", reward: 300, condition: (s) => s.gamesPlayed >= 100 },
        { id: 'diamond_hands', name: "Diamond Hands", desc: "Reach Kitalac Tier.", reward: 10000, condition: (s) => MK.state.user.tierIndex >= 4 },
        { id: 'broke', name: "Rekt", desc: "Go below $10 balance.", reward: 100, condition: (s) => MK.state.user.balance < 10 && MK.state.user.balance > 0 }
    ];

    MK.checkAchievements = function() {
        const stats = MK.state.user.stats || {};
        const claimed = MK.state.user.achievements || [];
        
        ACHIEVEMENTS.forEach(ach => {
            if (claimed.includes(ach.id)) return;
            
            if (ach.condition(stats)) {
                // Unlock!
                MK.state.user.achievements.push(ach.id);
                MK.updateBalance(ach.reward);
                if(window.app && window.app.showToast) {
                    window.app.showToast(`🏆 Achievement Unlocked: ${ach.name} (+$${ach.reward})`, "success");
                } else {
                    alert(`🏆 Achievement Unlocked: ${ach.name}\nReward: $${ach.reward}`);
                }
            }
        });
    };

    MK.renderAchievements = function() {
        const list = document.getElementById('achievements-list');
        if(!list) return;
        
        const claimed = MK.state.user.achievements || [];
        
        list.innerHTML = ACHIEVEMENTS.map(ach => {
            const isUnlocked = claimed.includes(ach.id);
            return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" style="padding:15px; margin-bottom:10px; background:${isUnlocked ? 'rgba(0,255,127,0.1)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${isUnlocked ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)'}; border-radius:8px; display:flex; align-items:center; gap:15px;">
                    <div style="font-size:2rem; color:${isUnlocked ? '#ffd700' : '#444'};">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:bold; color:${isUnlocked ? 'white' : '#888'};">${ach.name}</div>
                        <div style="font-size:0.85rem; color:#aaa;">${ach.desc}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:var(--accent-success); font-weight:bold;">+$${ach.reward}</div>
                        ${isUnlocked ? '<div style="color:var(--accent-success); font-size:0.8rem;"><i class="fas fa-check"></i></div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    };

    MK.claimDailyBonus = function() {
        const now = Date.now();
        const last = MK.state.user.lastDailyBonus || 0;
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - last >= cooldown) {
            const cashReward = 250 + (MK.state.user.tierIndex * 100); // Scale with tier
            const gemReward = 10;
            
            MK.updateBalance(cashReward);
            MK.state.user.premiumBalance = (MK.state.user.premiumBalance || 0) + gemReward;
            MK.state.user.lastDailyBonus = now;
            MK.renderUserStats();
            
            const msg = `Daily Bonus: +$${cashReward} and +${gemReward} Gems!`;
            if(window.app && window.app.showToast) {
                window.app.showToast(msg, "success");
            } else {
                alert(msg);
            }
        } else {
            const remaining = cooldown - (now - last);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            if(window.app && window.app.showToast) {
                 window.app.showToast(`Come back in ${hours}h ${mins}m`, "info");
            } else {
                 alert(`Come back in ${hours}h ${mins}m`);
            }
        }
    };

    // Helper to update stats
    MK.incrementStat = function(key, amount = 1) {
        if(!MK.state.user.stats) MK.state.user.stats = {};
        MK.state.user.stats[key] = (MK.state.user.stats[key] || 0) + amount;
        MK.checkAchievements();
    };

})();