(function() {
    const MK = window.MoonKat;
    
    // Simple Synth for SFX
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let ctx = new AudioCtx();

    MK.Audio = {
        playTone: function(freq, type, duration, vol = 0.1) {
            if (!MK.state.settings.sound) return;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        },

        playClick: () => MK.Audio.playTone(400, 'sine', 0.1, 0.05),
        playSuccess: () => {
            MK.Audio.playTone(600, 'sine', 0.1, 0.1);
            setTimeout(() => MK.Audio.playTone(800, 'sine', 0.2, 0.1), 100);
        },
        playError: () => {
            MK.Audio.playTone(200, 'sawtooth', 0.2, 0.1);
            setTimeout(() => MK.Audio.playTone(150, 'sawtooth', 0.2, 0.1), 150);
        },
        playCash: () => {
            MK.Audio.playTone(1200, 'sine', 0.1, 0.05);
            setTimeout(() => MK.Audio.playTone(1600, 'sine', 0.3, 0.05), 50);
        },
        playExplosion: () => { // For crash
            if (!MK.state.settings.sound) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        }
    };

    // Attach to global clicks for generic feedback
    document.addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.nav-item')) {
            MK.Audio.playClick();
        }
    });

})();
