(function() {

window.MoonKat = window.MoonKat || {};

class CrashGame {

    constructor(containerId) {

        this.container = document.getElementById(containerId);

        this.canvas = null;
        this.ctx = null;

        this.width = 800;
        this.height = 500;

        // GAME STATE
        this.state = 'IDLE';
        this.multiplier = 1.00;
        this.crashPoint = 1.00;
        this.betAmount = 0;
        this.autoCashOut = Infinity;
        this.startTime = 0;
        this.rafId = null;

        this.callbacks = {
            onTick: null,
            onCrash: null,
            onWin: null
        };

        this.setupUI();
    }

    destroy() {
        this.stop();
        this.container.innerHTML = '';
    }

    stop() {

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        this.state = 'IDLE';
    }

    setupUI() {

        this.container.innerHTML = `
            <div style="
                position:relative;
                width:100%;
                height:100%;
                background:#151921;
                border-radius:12px;
                overflow:hidden;
            ">

                <canvas style="
                    display:block;
                    width:100%;
                    height:100%;
                "></canvas>

                <div class="crash-overlay" style="
                    position:absolute;
                    top:50%;
                    left:50%;
                    transform:translate(-50%, -50%);
                    font-size:5rem;
                    font-weight:900;
                    color:white;
                    font-family:sans-serif;
                ">
                    1.00x
                </div>

            </div>
        `;

        this.canvas = this.container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = this.container.querySelector('.crash-overlay');

        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {

        const rect = this.container.getBoundingClientRect();

        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.drawStatic();
    }

    // TRUE RANDOM CRASH POINT
    generateCrashPoint() {

        const array = new Uint32Array(1);
        crypto.getRandomValues(array);

        const r = array[0] / 4294967296;

        if (r < 0.01)
            return 1.00;

        const crash = 0.99 / (1 - r);

        return Math.min(Math.max(crash, 1.00), 100.00);
    }

    placeBet(amount, autoCashOut = Infinity) {

        if (this.state !== 'IDLE')
            return false;

        if (amount <= 0)
            return false;

        // STOP old loop
        this.stop();

        this.betAmount = amount;

        this.autoCashOut =
            autoCashOut > 1 ? autoCashOut : Infinity;

        this.crashPoint = this.generateCrashPoint();

        this.multiplier = 1.00;

        this.startTime = performance.now();

        this.state = 'RUNNING';

        this.overlay.style.color = "white";

        this.loop();

        return true;
    }

    cashOut() {

        if (this.state !== 'RUNNING')
            return false;

        if (this.multiplier >= this.crashPoint) {

            this.crash();
            return false;
        }

        this.state = 'CASHED_OUT';

        const win =
            this.betAmount * this.multiplier;

        if (this.callbacks.onWin)
            this.callbacks.onWin(win, this.multiplier);

        return true;
    }

    crash() {

        if (this.state === 'CRASHED')
            return;

        this.stop();

        this.state = 'CRASHED';

        this.multiplier = this.crashPoint;

        this.overlay.innerText =
            "CRASHED @ " +
            this.crashPoint.toFixed(2) +
            "x";

        this.overlay.style.color = "#ff4444";

        this.drawGraph(999);

        if (this.callbacks.onCrash)
            this.callbacks.onCrash(this.crashPoint);
    }

    loop() {

        if (
            this.state !== 'RUNNING' &&
            this.state !== 'CASHED_OUT'
        )
            return;

        const now = performance.now();

        const elapsed =
            (now - this.startTime) / 1000;

        // Exponential growth
        this.multiplier =
            Math.pow(Math.E, 0.085 * elapsed);

        // HARD STOP
        if (this.multiplier >= this.crashPoint) {

            this.multiplier =
                this.crashPoint;

            this.crash();

            return;
        }

        if (this.state === 'RUNNING') {

            this.overlay.innerText =
                this.multiplier.toFixed(2) + "x";

            if (
                this.multiplier >=
                this.autoCashOut
            )
                this.cashOut();
        }

        this.drawGraph(elapsed);

        this.rafId =
            requestAnimationFrame(
                this.loop.bind(this)
            );
    }

    drawStatic() {

        this.ctx.fillStyle =
            "#151921";

        this.ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

        this.drawGrid();
    }

    drawGrid() {

        this.ctx.strokeStyle =
            "rgba(255,255,255,0.05)";

        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        for (
            let x = 0;
            x < this.width;
            x += 80
        ) {

            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(
                x,
                this.height
            );
        }

        for (
            let y = 0;
            y < this.height;
            y += 80
        ) {

            this.ctx.moveTo(0, y);
            this.ctx.lineTo(
                this.width,
                y
            );
        }

        this.ctx.stroke();
    }

    drawGraph(elapsed) {

        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        this.drawStatic();

        this.ctx.strokeStyle =
            this.state === 'CASHED_OUT'
                ? "#ffd700"
                : "#00ff88";

        this.ctx.lineWidth = 5;

        this.ctx.beginPath();

        const padding = 50;

        const startX = padding;
        const startY =
            this.height - padding;

        this.ctx.moveTo(
            startX,
            startY
        );

        let lastX = startX;
        let lastY = startY;

        const maxTime =
            Math.max(elapsed, 8);

        for (
            let t = 0;
            t <= elapsed;
            t += 0.05
        ) {

            const mult =
                Math.pow(
                    Math.E,
                    0.085 * t
                );

            const x =
                padding +
                (this.width -
                    padding * 2) *
                    (t / maxTime);

            const y =
                startY -
                (Math.log(mult) /
                    Math.log(
                        Math.max(
                            this.multiplier,
                            2
                        )
                    )) *
                    (startY -
                        padding);

            this.ctx.lineTo(x, y);

            lastX = x;
            lastY = y;
        }

        this.ctx.stroke();

        this.ctx.font = "24px sans-serif";

        this.ctx.fillText(
            "🚀",
            lastX,
            lastY
        );
    }

}

window.MoonKat.CrashGame =
    CrashGame;

})();
