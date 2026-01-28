const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ================== RESIZE ================== */
function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ================== CONSTANTES ================== */
const BLACK="black", WHITE="white";

/* ================== AUDIO ================== */
const music = new Audio("retro-game-arcade-236133.mp3");
music.loop = true;
music.volume = 0.2;

const deadSound = new Audio("dead-song.mp3");
deadSound.volume = 0.5;

let musicOn = true;
let deadOn = true;

/* ================== ETAT ================== */
let gameState = "menu"; // menu | skin | settings | game | pause
let showSkinText = false;
let gameOverLock = false;

/* ================== INPUT ================== */
let keys = {};
document.addEventListener("keydown", e=>{
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){
        e.preventDefault();
    }
    keys[e.key] = true;
});
document.addEventListener("keyup", e=> keys[e.key] = false);

/* ================== PLAYER ================== */
let player = {
    size: 50,
    speed: 6,
    x: 0,
    y: 0
};

let currentSkin = "red";

/* ================== SKINS IMAGES ================== */
const skinRed = new Image();
const skinBlue = new Image();
const skinGreen = new Image();
const skinYellow = new Image();

skinRed.src = "SkinRed.png";
skinBlue.src = "SkinBlue.png";
skinGreen.src = "SkinGreen.png";
skinYellow.src = "SkinYellow.png";

/* ================== ENNEMIS ================== */
let enemies = [];
let enemySize = 50;
let enemySpeed = 4;
let spawnTimer = 0;
let score = 0;

/* ================== UTILS ================== */
function drawText(txt,x,y,size=40,color=WHITE){
    ctx.fillStyle=color;
    ctx.font=`${size}px Arial`;
    ctx.textAlign="center";
    ctx.fillText(txt,x,y);
}

function drawButton(txt,x,y,w,h){
    ctx.fillStyle="#222";
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle=WHITE;
    ctx.strokeRect(x,y,w,h);
    ctx.fillStyle=WHITE;
    ctx.font="26px Arial";
    ctx.textAlign="center";
    ctx.fillText(txt,x+w/2,y+h/2+9);
}

function isInside(px,py,x,y,w,h){
    return px>x && px<x+w && py>y && py<y+h;
}

function getPlayerSkin(){
    if(currentSkin==="red") return skinRed.complete ? skinRed : "red";
    if(currentSkin==="blue") return skinBlue.complete ? skinBlue : "blue";
    if(currentSkin==="green") return skinGreen.complete ? skinGreen : "green";
    if(currentSkin==="yellow") return skinYellow.complete ? skinYellow : "yellow";
}

function enemyColor(){
    return currentSkin === "blue" ? "red" : "blue";
}

/* ================== MENUS ================== */
function drawMenu(){
    ctx.fillStyle=BLACK;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawText("SQUARE.IO", canvas.width/2,150,60);
    drawButton("JOUER", canvas.width/2-150,260,300,70);
    drawButton("SKIN", canvas.width/2-150,360,300,70);
    drawButton("PARAMÈTRES", canvas.width/2-150,460,300,70);
}

function drawSkinMenu(){
    ctx.fillStyle=BLACK;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawText("CHOISIS TON SKIN", canvas.width/2,120,50);

    ctx.drawImage(skinRed, canvas.width/5-60, canvas.height/2-60,120,120);
    ctx.drawImage(skinBlue, 2*canvas.width/5-60, canvas.height/2-60,120,120);
    ctx.drawImage(skinGreen, 3*canvas.width/5-60, canvas.height/2-60,120,120);
    ctx.drawImage(skinYellow, 4*canvas.width/5-60, canvas.height/2-60,120,120);

    if(showSkinText){
        drawText("Skin sélectionné ✔", canvas.width/2, canvas.height/2+160,30,"lime");
    }

    drawButton("RETOUR",20,20,140,50);
}

function drawSettings(){
    ctx.fillStyle=BLACK;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawText("PARAMÈTRES", canvas.width/2,120,50);

    drawText("Musique", canvas.width/2,240,30);
    drawButton(musicOn?"ON":"OFF", canvas.width/2-60,270,120,45);

    drawText("Dead Sound", canvas.width/2,340,30);
    drawButton(deadOn?"ON":"OFF", canvas.width/2-60,370,120,45);

    drawButton("RETOUR",20,20,140,50);
}

function drawPause(){
    drawText("PAUSE", canvas.width/2, canvas.height/2-50,60);
    drawButton("Reprendre", canvas.width/2-120, canvas.height/2+40,240,50);
    drawButton("Menu", canvas.width/2-120, canvas.height/2+110,240,50);
}

/* ================== GAME ================== */
function resetGame(){
    player.x = canvas.width/2-player.size/2;
    player.y = canvas.height-100;
    enemies = [];
    spawnTimer = 0;
    score = 0;
    gameOverLock = false;
}

function spawnEnemy(){
    enemies.push({
        x: Math.random()*(canvas.width-enemySize),
        y: -enemySize
    });
}

function gameOver(){
    if(gameOverLock) return;
    gameOverLock = true;
    gameState = "menu";
    enemies = [];
    music.pause();
    if(deadOn){
        deadSound.currentTime = 0;
        deadSound.play();
    }
}

function updateGame(){
    if(keys["ArrowLeft"]||keys["a"]||keys["q"]) player.x -= player.speed;
    if(keys["ArrowRight"]||keys["d"]) player.x += player.speed;
    if(keys["ArrowUp"]||keys["w"]||keys["z"]) player.y -= player.speed;
    if(keys["ArrowDown"]||keys["s"]) player.y += player.speed;

    player.x = Math.max(0, Math.min(player.x, canvas.width-player.size));
    player.y = Math.max(0, Math.min(player.y, canvas.height-player.size));

    spawnTimer++;
    if(spawnTimer>60){ spawnEnemy(); spawnTimer=0; }

    ctx.fillStyle=BLACK;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for(let i=enemies.length-1;i>=0;i--){
        let e = enemies[i];
        e.y += enemySpeed;

        ctx.fillStyle = enemyColor();
        ctx.fillRect(e.x,e.y,enemySize,enemySize);

        if(
            player.x < e.x+enemySize &&
            player.x+player.size > e.x &&
            player.y < e.y+enemySize &&
            player.y+player.size > e.y
        ){
            gameOver();
            return;
        }

        if(e.y > canvas.height){
            enemies.splice(i,1);
            score++;
        }
    }

    const skin = getPlayerSkin();
    if(skin instanceof Image){
        ctx.drawImage(skin, player.x,player.y,player.size,player.size);
    }else{
        ctx.fillStyle = skin;
        ctx.fillRect(player.x,player.y,player.size,player.size);
    }

    drawButton("⏸ Pause", canvas.width-160,20,140,50);

    ctx.fillStyle=WHITE;
    ctx.font="26px Arial";
    ctx.textAlign="left";
    ctx.fillText("Score : "+score,20,40);
}

/* ================== CLICK ================== */
canvas.addEventListener("click", e=>{
    const x=e.clientX, y=e.clientY;

    if(gameState==="menu"){
        if(isInside(x,y,canvas.width/2-150,260,300,70)){
            resetGame();
            gameState="game";
            if(musicOn) music.play();
        }
        if(isInside(x,y,canvas.width/2-150,360,300,70)) gameState="skin";
        if(isInside(x,y,canvas.width/2-150,460,300,70)) gameState="settings";
    }
    else if(gameState==="skin"){
        if(isInside(x,y,20,20,140,50)) gameState="menu";
        if(y>canvas.height/2-60 && y<canvas.height/2+60){
            if(x<canvas.width/5+60) currentSkin="red";
            else if(x<2*canvas.width/5+60) currentSkin="blue";
            else if(x<3*canvas.width/5+60) currentSkin="green";
            else currentSkin="yellow";
            showSkinText=true;
            setTimeout(()=>showSkinText=false,2000);
        }
    }
    else if(gameState==="settings"){
        if(isInside(x,y,20,20,140,50)) gameState="menu";
        if(isInside(x,y,canvas.width/2-60,270,120,45)){
            musicOn=!musicOn;
            musicOn?music.play():music.pause();
        }
        if(isInside(x,y,canvas.width/2-60,370,120,45)){
            deadOn=!deadOn;
        }
    }
    else if(gameState==="game"){
        if(isInside(x,y,canvas.width-160,20,140,50)) gameState="pause";
    }
    else if(gameState==="pause"){
        if(isInside(x,y,canvas.width/2-120,canvas.height/2+40,240,50)) gameState="game";
        if(isInside(x,y,canvas.width/2-120,canvas.height/2+110,240,50)){
            gameState="menu";
            music.pause();
        }
    }
});

/* ================== LOOP ================== */
function loop(){
    if(gameState==="menu") drawMenu();
    else if(gameState==="skin") drawSkinMenu();
    else if(gameState==="settings") drawSettings();
    else if(gameState==="game") updateGame();
    else if(gameState==="pause") drawPause();
    requestAnimationFrame(loop);
}

resetGame();
loop();
