(function() {

window.MoonKat = window.MoonKat || {};

class CrashGame {

    constructor(containerId) {

        this.container = document.getElementById(containerId);

        this.canvas = null;
        this.ctx = null;
        this.overlay = null;

        this.width = 800;
        this.height = 500;

        this.state = 'IDLE';
        this.multiplier = 1;
        this.crashPoint = 1;
        this.startTime = 0;
        this.rafId = null;

        this.setupUI();
    }

    setupUI() {

        this.container.innerHTML = `
        <div style="width:100%;height:100%;display:flex;flex-direction:column;background:#151921;border-radius:12px;overflow:hidden;">

            <div style="position:relative;flex:1;">

                <canvas style="width:100%;height:100%;"></canvas>

                <div class="overlay" style="
                    position:absolute;
                    top:50%;
                    left:50%;
                    transform:translate(-50%,-50%);
                    font-size:64px;
                    font-weight:bold;
                    color:white;
                    font-family:sans-serif;
                ">1.00x</div>

            </div>

            <div style="
                padding:10px;
                background:#0f1318;
                display:flex;
                gap:10px;
                justify-content:center;
            ">

                <button class="startBtn" style="
                    padding:10px 20px;
                    font-size:18px;
                    background:#00ff88;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                ">START</button>

                <button class="stopBtn" style="
                    padding:10px 20px;
                    font-size:18px;
                    background:#ff4444;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                ">STOP</button>

            </div>

        </div>
        `;

        this.canvas = this.container.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.overlay = this.container.querySelector(".overlay");

        this.startBtn =
            this.container.querySelector(".startBtn");

        this.stopBtn =
            this.container.querySelector(".stopBtn");

        this.startBtn.onclick =
            () => this.start();

        this.stopBtn.onclick =
            () => this.stop();

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );
    }

    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.drawStatic();
    }

    generateCrashPoint() {

        const array = new Uint32Array(1);

        crypto.getRandomValues(array);

        const r =
            array[0] / 4294967296;

        if (r < 0.01)
            return 1;

        const crash =
            0.99 / (1 - r);

        return Math.min(
            Math.max(crash, 1),
            100
        );
    }

    start() {

        if (
            this.state === "RUNNING"
        )
            return;

        this.stop();

        this.state = "RUNNING";

        this.multiplier = 1;

        this.crashPoint =
            this.generateCrashPoint();

        this.startTime =
            performance.now();

        this.overlay.style.color =
            "white";

        this.loop();
    }

    stop() {

        if (this.rafId) {

            cancelAnimationFrame(
                this.rafId
            );

            this.rafId = null;
        }

        if (
            this.state === "RUNNING"
        ) {

            this.state =
                "STOPPED";

            this.overlay.innerText =
                "STOPPED";

            this.overlay.style.color =
                "#ffaa00";
        }
        else {

            this.state = "IDLE";

            this.overlay.innerText =
                "1.00x";

            this.overlay.style.color =
                "white";
        }

        this.drawStatic();
    }

    crash() {

        this.stop();

        this.state =
            "CRASHED";

        this.overlay.innerText =
            "CRASHED @ " +
            this.crashPoint.toFixed(2) +
            "x";

        this.overlay.style.color =
            "#ff4444";
    }

    loop() {

        if (
            this.state !== "RUNNING"
        )
            return;

        const elapsed =
            (performance.now() -
                this.startTime) /
            1000;

        this.multiplier =
            Math.pow(
                Math.E,
                0.085 * elapsed
            );

        if (
            this.multiplier >=
            this.crashPoint
        ) {

            this.multiplier =
                this.crashPoint;

            this.crash();

            return;
        }

        this.overlay.innerText =
            this.multiplier.toFixed(2) +
            "x";

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

        this.ctx.strokeStyle =
            "rgba(255,255,255,0.05)";

        for (
            let x = 0;
            x < this.width;
            x += 80
        ) {

            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(
                x,
                this.height
            );
            this.ctx.stroke();
        }

        for (
            let y = 0;
            y < this.height;
            y += 80
        ) {

            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(
                this.width,
                y
            );
            this.ctx.stroke();
        }
    }

    drawGraph(elapsed) {

        this.drawStatic();

        this.ctx.strokeStyle =
            "#00ff88";

        this.ctx.lineWidth = 4;

        this.ctx.beginPath();

        const padding = 50;

        const startX = padding;
        const startY =
            this.height -
            padding;

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

        this.ctx.font =
            "24px sans-serif";

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
