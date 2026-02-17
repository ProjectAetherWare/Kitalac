(function() {
    const MK = window.MoonKat;

    MK.VIP = {
        COST: 100000000,
        
        init() {
            if(!MK.state.user.vip) {
                MK.state.user.vip = { active: false, expires: 0 };
            }
            this.checkExpiry();
            this.render();
        },

        checkExpiry() {
            if (MK.state.user.vip.active && Date.now() > MK.state.user.vip.expires) {
                MK.state.user.vip.active = false;
                alert("Your VIP subscription has expired.");
                this.render();
            }
        },

        buy() {
            if (MK.state.user.premiumBalance >= this.COST) {
                MK.state.user.premiumBalance -= this.COST;
                MK.state.user.vip.active = true;
                MK.state.user.vip.expires = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
                MK.renderUserStats();
                this.render();
                MK.Audio.playSuccess();
                alert("Welcome to the Elite Club! VIP Activated.");
            } else {
                MK.Audio.playError();
                alert("Insufficient Gems for VIP status.");
            }
        },

        render() {
            const btn = document.getElementById('vip-buy-btn');
            if(!btn) return;

            if (MK.state.user.vip.active) {
                const days = Math.ceil((MK.state.user.vip.expires - Date.now()) / (1000 * 60 * 60 * 24));
                btn.innerHTML = `<i class="fas fa-check"></i> VIP ACTIVE (${days}d)`;
                btn.classList.add('btn-success');
                btn.classList.remove('btn-premium');
                btn.disabled = true;
            } else {
                btn.innerHTML = `<i class="fas fa-crown"></i> BUY VIP (100M GEMS)`;
                btn.classList.add('btn-premium');
                btn.disabled = false;
                btn.onclick = () => MK.VIP.buy();
            }
        }
    };
})();
