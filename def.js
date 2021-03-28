const Canvas = document.querySelector("canvas");
const Width = Canvas.width;
const Height = Canvas.height;
const $ = Canvas.getContext("2d");

Canvas.addEventListener("mousemove", movePlayer);
Canvas.addEventListener("click", addProjectile);

var projectiles = [];
var eProjectiles = [];
var targetColors = ["#FF6A00", "#FF9640", "#FFB273", "#FFAE73"];
var targets = [];
const fps = 65;
const player = {
    x: Width / 2 - 25,
    y: Height - 20,
    width: 50,
    height: 20,
    color: "#36BBCE",
    score: 0,
    lives: 3
};

function Target(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 20;
    this.color = targetColors[Math.floor(Math.random() * Math.floor(4))];
    this.scoreGain = 10;
};

function Pooper(x, y) {
    this.x = x;
    this.y = y;
    this.cx = 10;
    this.cy = 10;
    this.width = 20;
    this.height = 20;
    this.color = "#FFD600";
    this.borderColor = "#FF0D00";
    this.scoreGain = 20;
    this.isPooper = true;
};

function Projectile(color) {
    this.x = player.x + 25;
    this.y = player.y;
    this.cy = -6;
    this.r = 3;
    this.color = color;
};

function Eprojectile(x, y, color) {
    this.x = x;
    this.y = y;
    this.cx = 6;
    this.cy = Math.random() * (6 - 3) + 3;
    this.color = color;
    this.r = 3
};

function addEprojectile(x, y, color) {
    var eProjectile = new Eprojectile(x, y, color);
    eProjectiles.push(eProjectile);
};

function drawEprojectile(x, y, color) {
    $.fillStyle = color;
    $.beginPath();
    $.arc(x, y, 4, 0, 2 * Math.PI);
    $.closePath();
    $.fill();
}

function movePlayer(event) { ///в ивент приходит движение курсора по х и у
    let rect = Canvas.getBoundingClientRect();
    player.x = event.clientX - rect.left - player.width / 2;
};

function drawBackground(x, y, w, h, color) {
    $.fillStyle = color;
    $.fillRect(x, y, w, h);
};

function addTarget() {
    for (let i = 5; i < Width - 5; i += 50) {
        for (let z = 5; z < Height / 2; z += 25) {
            if ((Math.random() * (11 - 1) + 1) > 3) {
                var target = new Target(i, z);
                targets.push(target);
            } else {
                var target = new Pooper(i + 10, z);
                targets.push(target);
            }
        }
    }
};

function drawTargets() {
    for (let i = 0; i < targets.length; i++) {
        $.fillStyle = targets[i].color;
        $.fillRect(targets[i].x, targets[i].y, targets[i].width, targets[i].height);
        if (targets[i].isPooper == true) {
            if (isShoot()) {
                addEprojectile(targets[i].x, targets[i].y, targets[i].color);
            }
        }
    }
};

function addProjectile() {
    var projectile = new Projectile("#FF0000");
    projectiles.push(projectile);
};

function drawProjectile(x, y, color) {
    $.fillStyle = color;
    $.beginPath();
    $.arc(x, y, 4, 0, 2 * Math.PI);
    $.closePath();
    $.fill();
};

function drawScore(text, x, y, color) {
    $.fillStyle = color;
    $.font = "30px fantasy";
    $.fillText(text, x, y);
};

function collision(projectile, target) { //вернёт true при столкновении
    target.top = target.y;
    target.bottom = target.y + target.height;
    target.left = target.x;
    target.right = target.x + target.width;

    projectile.top = projectile.y - projectile.r;
    projectile.bottom = projectile.y + projectile.r;
    projectile.left = projectile.x - projectile.r;
    projectile.right = projectile.x + projectile.r;

    return (projectile.left < target.right && projectile.top < target.bottom && projectile.right > target.left &&
        projectile.bottom > target.top);
};

function isShoot() {
    return ((Math.random() * (100 - 1) + 1) < 1.4);
}

function update() {
    for (let i = 0; i < projectiles.length; i++) {
        if (projectiles[i].y < -Height) {
            projectiles.splice(i, 1);
            return;
        }
        for (let z = 0; z < targets.length; z++) {
            if (collision(projectiles[i], targets[z])) {
                projectiles.splice(i, 1);
                player.score += targets[z].scoreGain;
                targets.splice(z, 1);
                return;
            }
        }
        projectiles[i].y += projectiles[i].cy;
        drawProjectile(projectiles[i].x, projectiles[i].y, projectiles[i].color);

    }
    for (let i = 0; i < eProjectiles.length; i++) {
        if (eProjectiles[i].y > Height) {
            eProjectiles.splice(i, 1);
            return;
        }
        for (let z = 0; z < targets.length; z++) {
            if (collision(eProjectiles[i], player)) {
                projectiles.splice(i, 1);
                player.lives += -1;
                if (player.lives == 0) {
                    drawScore("POTRACHENO", 5, Height / 2 + 50, "red");
                    drawScore((`Score: ${player.score}`), 5, Height / 2 + 85, "red");
                    drawScore((`Press F5 to restart`), 5, Height / 2 + 120, "#39E24D");
                    clearInterval(interval);
                }
                restart();
                return;
            }
        }
        eProjectiles[i].y += eProjectiles[i].cy;
        drawEprojectile(eProjectiles[i].x, eProjectiles[i].y, "#A13DD5");
    }
};

function render() {
    drawBackground(0, 0, Width, Height, "black");
    drawScore(player.score, Width - 70, Height - 5, "yellow");
    drawScore(player.lives, Width - 580, Height - 5, "yellow");
    drawBackground(player.x, player.y, player.width, player.height, player.color);
    drawTargets()
};

function Game() {
    render();
    update();
    this.restart = function () {
        projectiles.splice(0, projectiles.length);
        eProjectiles.splice(0, eProjectiles.length);
    }
};


addTarget();
let interval = setInterval(Game, 1000 / fps);