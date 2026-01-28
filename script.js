const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener("resize", resize);
resize();

const BLACK="black", WHITE="white", RED="red", BLUE="blue", GREEN="green";

const music = new Audio("retro-game-arcade-236133.mp3");
music.loop = true;
music.volume = 0.2;
const gameOverSound = new Audio("dead-song.mp3");
gameOverSound.volume = 0.5;

let gameState="menu"; // menu | skin | game | pause | settings
let showSkinText=false;

let PLAYER_COLOR=RED;
let player={size:50, speed:6, x:canvas.width/2-25, y:canvas.height-100};

let enemies=[], enemySize=50, enemySpeed=4, spawnTimer=0, score=0;
let keys={};

// INPUT
document.addEventListener("keydown", e=>keys[e.key]=true);
document.addEventListener("keyup", e=>keys[e.key]=false);

// UTILS
function enemyColor(){
    if(!PLAYER_COLOR) return BLUE;
    if(PLAYER_COLOR===RED) return BLUE;
    if(PLAYER_COLOR===BLUE) return GREEN;
    if(PLAYER_COLOR===GREEN) return RED;
}
function drawText(text,x,y,size=40,color=WHITE){
    ctx.fillStyle=color;
    ctx.font=`${size}px Arial`;
    ctx.textAlign="center";
    ctx.fillText(text,x,y);
}
function drawButton(text,x,y,w,h){
    ctx.fillStyle="#1e1e1e";
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle=WHITE;
    ctx.lineWidth=2;
    ctx.strokeRect(x,y,w,h);
    ctx.fillStyle=WHITE;
    ctx.font="28px Arial";
    ctx.textAlign="center";
    ctx.fillText(text,x+w/2,y+h/2+10);
}
function isInside(px,py,x,y,w,h){ return px>x && px<x+w && py>y && py<y+h; }

// MENUS
function drawMenu(){
    ctx.fillStyle=BLACK;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawText("Square.io",canvas.width/2,150,60);
    drawButton("JOUER",canvas.width/2-150,260,300,70);
    drawButton("SKIN",canvas.width/2-150,360,300,70);
    drawButton("PARAMÈTRES",canvas.width/2-150,460,300,70);
}
function drawSkinMenu(){
    ctx.fillStyle=BLACK;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawText("CHOISIS TON SKIN",canvas.width/2,120,50);
    ctx.fillStyle=RED; ctx.fillRect(canvas.width/4-60,canvas.height/2-60,120,120);
    ctx.fillStyle=BLUE; ctx.fillRect(canvas.width/2-60,canvas.height/2-60,120,120);
    ctx.fillStyle=GREEN; ctx.fillRect(3*canvas.width/4-60,canvas.height/2-60,120,120);
    if(showSkinText) drawText("Skin sélectionné ✔",canvas.width/2,canvas.height/2+150,30,GREEN);
    drawButton("RETOUR",20,20,140,50);
}
function drawSettingsMenu(){
    ctx.fillStyle=BLACK;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawText("PARAMÈTRES",canvas.width/2,120,50);
    drawButton("RETOUR",20,20,140,50);
}
function drawPauseMenu(){
    drawText("PAUSE",canvas.width/2,canvas.height/2,60,WHITE);
    drawButton("Reprendre",canvas.width/2-100,canvas.height/2+80,200,50);
    drawButton("Menu",canvas.width/2-100,canvas.height/2+150,200,50);
}

// GAME
function resetGame(){
    player.x=canvas.width/2-player.size/2;
    player.y=canvas.height-100;
    enemies=[]; score=0; spawnTimer=0;
}

function spawnEnemy(){ enemies.push({x:Math.random()*(canvas.width-enemySize),y:-enemySize}); }

function updateGame(){
    // mouvements
    if(keys["ArrowLeft"]||keys["a"]||keys["q"]) player.x-=player.speed;
    if(keys["ArrowRight"]||keys["d"]) player.x+=player.speed;
    if(keys["ArrowUp"]||keys["w"]||keys["z"]) player.y-=player.speed;
    if(keys["ArrowDown"]||keys["s"]) player.y+=player.speed;
    // limites
    player.x=Math.max(0,Math.min(player.x,canvas.width-player.size));
    player.y=Math.max(0,Math.min(player.y,canvas.height-player.size));

    spawnTimer++;
    if(spawnTimer>60){ spawnEnemy(); spawnTimer=0; }

    ctx.fillStyle=BLACK; ctx.fillRect(0,0,canvas.width,canvas.height);

    // ennemis + collisions
    enemies.forEach((e,i)=>{
        e.y+=enemySpeed;
        ctx.fillStyle=enemyColor();
        ctx.fillRect(e.x,e.y,enemySize,enemySize);

        if(player.x<e.x+enemySize && player.x+player.size>e.x &&
           player.y<e.y+enemySize && player.y+player.size>e.y){
               gameState="menu"; enemies=[];
               music.pause(); gameOverSound.play();
           }
        if(e.y>canvas.height) enemies.splice(i,1);
    });

    // joueur
    ctx.fillStyle=PLAYER_COLOR;
    ctx.fillRect(player.x,player.y,player.size,player.size);

    drawButton("⏸ Pause",canvas.width-160,20,140,50);
    ctx.fillStyle=WHITE;
    ctx.font="26px Arial";
    ctx.textAlign="left";
    ctx.fillText("Score : "+score,20,40);
}

// CLICK
canvas.addEventListener("click",e=>{
    const x=e.clientX, y=e.clientY;

    if(music.paused && gameState==="menu") music.play();

    if(gameState==="menu"){
        if(isInside(x,y,canvas.width/2-150,260,300,70)){ resetGame(); gameState="game"; music.play(); }
        if(isInside(x,y,canvas.width/2-150,360,300,70)) gameState="skin";
        if(isInside(x,y,canvas.width/2-150,460,300,70)) gameState="settings";
    } 
    else if(gameState==="skin"){
        if(isInside(x,y,20,20,140,50)) gameState="menu";
        if(y>canvas.height/2-60 && y<canvas.height/2+60){
            if(x>canvas.width/4-60 && x<canvas.width/4+60) PLAYER_COLOR=RED;
            if(x>canvas.width/2-60 && x<canvas.width/2+60) PLAYER_COLOR=BLUE;
            if(x>3*canvas.width/4-60 && x<3*canvas.width/4+60) PLAYER_COLOR=GREEN;
            showSkinText=true;
            setTimeout(()=>showSkinText=false,2000);
        }
    }
    else if(gameState==="settings"){
        if(isInside(x,y,20,20,140,50)) gameState="menu";
    }
    else if(gameState==="game"){
        if(isInside(x,y,canvas.width-160,20,140,50)) gameState="pause";
    }
    else if(gameState==="pause"){
        if(isInside(x,y,canvas.width/2-100,canvas.height/2+80,200,50)) gameState="game"; // reprendre
        if(isInside(x,y,canvas.width/2-100,canvas.height/2+150,200,50)){ gameState="menu"; music.pause(); }
    }
});

// LOOP
function loop(){
    if(gameState==="menu") drawMenu();
    else if(gameState==="skin") drawSkinMenu();
    else if(gameState==="settings") drawSettingsMenu();
    else if(gameState==="game") updateGame();
    else if(gameState==="pause") drawPauseMenu();
    requestAnimationFrame(loop);
}

resetGame();
loop();
