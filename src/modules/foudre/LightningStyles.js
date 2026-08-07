export const LIGHTNING_DESIGNS = {
    Classic: {
        name: "Sphère Classique",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = 1;
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
            if (isRecent) {
                const strobe = Math.sin(Date.now() / 150) > 0;
                if (strobe) {
                    ctx.beginPath();
                    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.3;
                    ctx.fill();
                }
            }
        }
    },
    Glow: {
        name: "Halo Lumineux",
        render: (ctx, x, y, size, color, isRecent) => {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    },
    Cross: {
        name: "Croix Éclatante",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - size * 1.5, y);
            ctx.lineTo(x + size * 1.5, y);
            ctx.moveTo(x, y - size * 1.5);
            ctx.lineTo(x, y + size * 1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    },
    Bolt: {
        name: "Éclair Vectoriel",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y - size * 2);
            ctx.lineTo(x - size, y + size * 0.5);
            ctx.lineTo(x, y + size * 0.5);
            ctx.lineTo(x - size * 0.5, y + size * 2);
            ctx.lineTo(x + size, y - size * 0.5);
            ctx.lineTo(x, y - size * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    },
    Ring: {
        name: "Anneau Cyber",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    },
    Diamond: {
        name: "Diamant Pur",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y - size * 1.5);
            ctx.lineTo(x + size * 1.5, y);
            ctx.lineTo(x, y + size * 1.5);
            ctx.lineTo(x - size * 1.5, y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    },
    Square: {
        name: "Pixel Art",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.fillStyle = color;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - size, y - size, size * 2, size * 2);
        }
    },
    Triangle: {
        name: "Triangle Delta",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y - size * 1.5);
            ctx.lineTo(x + size * 1.5, y + size * 1.2);
            ctx.lineTo(x - size * 1.5, y + size * 1.2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    },
    Hexagon: {
        name: "Hexagone Tech",
        render: (ctx, x, y, size, color, isRecent) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const px = x + size * 1.6 * Math.cos(angle);
                const py = y + size * 1.6 * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.stroke();
        }
    },
    PulseWave: {
        name: "Onde de Choc",
        render: (ctx, x, y, size, color, isRecent) => {
            const time = Date.now() / 1000;
            const wave = (time % 1);

            ctx.beginPath();
            ctx.arc(x, y, size * 1, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, size * (1 + wave * 3), 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.globalAlpha = 1 - wave;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
};
