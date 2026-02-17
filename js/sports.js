(function() {
    const MK = window.MoonKat;
    if (!MK.state.sports) MK.state.sports = { activeMatches: [], bets: [], history: [] };

    const TEAMS = [
        "Cyber United", "Neon Strikers", "Quantum FC", "Binary Bulls", "Pixel Pirates",
        "Void Vipers", "Astro Aces", "Solar Spartans", "Galaxy Giants", "Nebula Knights",
        "Mecha Mavericks", "Robo Rangers", "Synth Sharks", "Data Dragons", "Laser Lions",
        "Techno Tigers", "Circuit Cobras", "Glitch Griffin", "Vector Vikings", "Code Crusaders"
    ];

    const SPORTS = ["BotBall", "Drone Racing", "Cyber Tennis", "Mecha Boxing"];

    MK.initSports = function() {
        if (MK.state.sports.activeMatches.length === 0) {
            spawnMatches(5);
        }
        MK.renderSports();
        
        // Match resolution loop
        setInterval(() => {
            resolveMatches();
            spawnMatches(2); // Keep matches flowing
            MK.renderSports();
        }, 15000); // Check every 15s
    };

    function spawnMatches(count) {
        for (let i = 0; i < count; i++) {
            if (MK.state.sports.activeMatches.length > 10) return;

            const sport = SPORTS[Math.floor(Math.random() * SPORTS.length)];
            const teamA = TEAMS[Math.floor(Math.random() * TEAMS.length)];
            let teamB = TEAMS[Math.floor(Math.random() * TEAMS.length)];
            while (teamA === teamB) teamB = TEAMS[Math.floor(Math.random() * TEAMS.length)];

            // Odds Calculation
            const strengthA = Math.random();
            const strengthB = Math.random();
            const total = strengthA + strengthB;
            const probA = strengthA / total;
            
            // Decimal odds = 1 / probability (with house edge)
            const oddsA = (1 / probA * 0.9).toFixed(2);
            const oddsB = (1 / (1 - probA) * 0.9).toFixed(2);

            MK.state.sports.activeMatches.push({
                id: Date.now() + Math.random().toString(36).substr(2, 5),
                sport,
                teamA,
                teamB,
                oddsA,
                oddsB,
                scoreA: 0,
                scoreB: 0,
                startTime: Date.now() + 1000 * 30, // Starts in 30s
                status: 'upcoming' // upcoming, live, finished
            });
        }
    }

    function resolveMatches() {
        const now = Date.now();
        MK.state.sports.activeMatches.forEach(m => {
            if (m.status === 'upcoming' && now > m.startTime) {
                m.status = 'live';
            }
            
            if (m.status === 'live') {
                // Simulate Scoring
                if (Math.random() < 0.3) m.scoreA += Math.floor(Math.random() * 3);
                if (Math.random() < 0.3) m.scoreB += Math.floor(Math.random() * 3);
                
                // End match chance
                if (Math.random() < 0.1) {
                    m.status = 'finished';
                    payoutBets(m);
                }
            }
        });

        // Filter out old finished matches
        MK.state.sports.activeMatches = MK.state.sports.activeMatches.filter(m => m.status !== 'finished' || Math.random() > 0.2);
    }

    function payoutBets(match) {
        MK.state.sports.bets.forEach(bet => {
            if (bet.matchId === match.id && !bet.settled) {
                let won = false;
                if (bet.pick === 'A' && match.scoreA > match.scoreB) won = true;
                if (bet.pick === 'B' && match.scoreB > match.scoreA) won = true;
                
                if (won) {
                    const payout = bet.amount * bet.odds;
                    MK.updateBalance(payout);
                    if(window.app && window.app.showToast) window.app.showToast(`Sports Bet Won! +$${payout.toFixed(2)}`, "success");
                }
                bet.settled = true;
            }
        });
    }

    MK.renderSports = function() {
        const container = document.getElementById('sports-container');
        if (!container) return;

        container.innerHTML = `
            <div class="section-title">
                <h2>Cyber Sportsbook</h2>
                <div class="section-subtitle">Live betting on simulated matches.</div>
            </div>
            <div class="matches-grid">
                ${MK.state.sports.activeMatches.map(m => {
                    const isLive = m.status === 'live';
                    return `
                    <div class="match-card ${isLive ? 'live-border' : ''}">
                        <div class="match-header">
                            <span class="sport-tag">${m.sport}</span>
                            <span class="match-status ${m.status}">${m.status.toUpperCase()}</span>
                        </div>
                        <div class="teams-row">
                            <div class="team">
                                <div class="team-name">${m.teamA}</div>
                                <div class="odds-btn" onclick="MoonKat.placeBet('${m.id}', 'A', ${m.oddsA})">${m.oddsA}</div>
                            </div>
                            <div class="score-display">
                                ${isLive || m.status === 'finished' ? `${m.scoreA} - ${m.scoreB}` : 'VS'}
                            </div>
                            <div class="team">
                                <div class="team-name">${m.teamB}</div>
                                <div class="odds-btn" onclick="MoonKat.placeBet('${m.id}', 'B', ${m.oddsB})">${m.oddsB}</div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    };

    MK.placeBet = function(matchId, pick, odds) {
        const match = MK.state.sports.activeMatches.find(m => m.id === matchId);
        if (!match || match.status !== 'upcoming') return alert("Betting closed for this match.");

        const amt = prompt(`Bet on ${pick === 'A' ? match.teamA : match.teamB} @ ${odds}x\nEnter Amount:`);
        if (amt) {
            const val = parseFloat(amt);
            if (!Number.isFinite(val) || val <= 0) return;
            if (MK.updateBalance(-val)) {
                MK.state.sports.bets.push({
                    matchId,
                    pick,
                    odds,
                    amount: val,
                    settled: false
                });
                alert("Bet Placed!");
            } else {
                alert("Insufficient Funds");
            }
        }
    };

})();