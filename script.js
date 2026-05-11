// Injecting a classic 8-bit pixel font directly so you don't have to download anything
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// --- MANUALLY CHANGE THESE NUMBERS TO FIND THE SWEET SPOT ---
const gameSettings = {
    gravity: 900,         
    jumpStrength: -360,   
    pipeSpeed: -200,      
    pipeSpawnDelay: 2500, 
    pipeGap: 220,         
    pipeOpacity: 0.6      
};

// --- EDIT YOUR CHARACTER AND MESSAGES HERE ---
const dialogueSettings = {
    characterColor: 0xffaa00, 
    messages: {
        7: "Okay he's not here obviously, this is the college",
        14: "OKay there's nobody here...next place!",
        21: "This is surprising... not at KFC",
        29: "I really thought he'd be here..",
        37: "I guess he's not a big fan of the heat",
        45: "Wtf does he even like, not the cold too!!!!",
        53: "He's not home too, maybe Kerala?"
    }
};

const retroFont = '"Press Start 2P", Courier, monospace';
const premiumText = { fontFamily: retroFont, fontSize: '20px', fill: '#fff', stroke: '#000', strokeThickness: 6, align: 'center' };
const scoreStyle = { fontFamily: retroFont, fontSize: '40px', fill: '#fff', stroke: '#000', strokeThickness: 8, align: 'center' };

// Dummy audio object to prevent crashes if files are missing
const dummyAudio = { stop: () => {}, play: () => {}, volume: 0 };

function createPlayer(scene, x, y) {
    let wingBack = scene.add.image(-10, 5, 'wing_back').setOrigin(0.1, 0.5).setScale(-1, 1).setAngle(15);       
    let wingFront = scene.add.image(10, 5, 'wing').setOrigin(0.1, 0.5).setAngle(-15);
    let head = scene.add.image(0, 0, 'gf_head');
    head.displayHeight = 220; 
    head.scaleX = head.scaleY; 
    let playerContainer = scene.add.container(x, y, [wingBack, head, wingFront]);
    return playerContainer;
}

// --- NEW GLOBAL PRELOAD SCENE ---
class PreloadScene extends Phaser.Scene {
    constructor() { super('PreloadScene'); }
    
    preload() {
        const W = this.cameras.main.width; 
        const H = this.cameras.main.height;

        // Visual Loading Bar
        let loadingText = this.add.text(W/2, H/2 - 20, "LOADING...", { fontFamily: retroFont, fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        let progressBox = this.add.graphics();
        let progressBar = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(W/2 - 110, H/2 + 10, 220, 24);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xff0055, 1);
            progressBar.fillRect(W/2 - 105, H/2 + 14, 210 * value, 16);
        });

        // --- GENERATE WINGS EARLY FOR THE LOADING SCREEN ---
        if (!this.textures.exists('wing')) {
            let g = this.make.graphics({ x: 0, y: 0, add: false });
            const drawWing = (fillColor) => {
                g.fillStyle(0x000000, 1);
                g.fillEllipse(35, 12, 40, 14); g.fillEllipse(28, 22, 32, 12); g.fillEllipse(22, 32, 24, 10); 
                g.fillStyle(fillColor, 1);
                g.fillEllipse(35, 12, 34, 8); g.fillEllipse(28, 22, 26, 6); g.fillEllipse(22, 32, 18, 4); 
            };
            g.clear(); drawWing(0xffffff); g.generateTexture('wing', 60, 45);
            g.clear(); drawWing(0xdddddd); g.generateTexture('wing_back', 60, 45);
            g.destroy();
        }

        // --- LOAD HEAD FIRST & SHOW IMMEDIATELY ---
        this.load.image('gf_head', 'gf_head.png');
        this.load.once('filecomplete-image-gf_head', () => {
            let player = createPlayer(this, W/2, H/2 - 130);
            player.setScale(1.4); // Big image
            this.tweens.add({ targets: player, y: H/2 - 150, duration: 1500, ease: 'Sine.easeInOut', yoyo: true, loop: -1 });
        });

        // 1. Load Start Scene & Cutscene Images
        this.load.image('start_bg', 'start_bg.png'); 
        this.load.image('buddy', 'image-removebg-preview (3).png'); 
        this.load.image('turf_left', 'turf_left.png');
        this.load.image('turf_right', 'turf_right.png');
        this.load.image('final_bg', 'final_bg.png');
        this.load.image('umang_confused', 'umang_confused.png');
        this.load.image('umang_happy', 'umang_happy.png');
        this.load.image('umang_phone', 'umang_phone.png');
        this.load.image('umang_arms', 'umang_arms.png');
        this.load.image('sarang_sleep', 'sarang_sleep.png');
        this.load.image('sarang_phone', 'sarang_phone.png');
        this.load.image('sarang_happy_talk', 'sarang_happy_talk.png');
        this.load.image('sarang_annoyed', 'sarang_annoyed.png');
        this.load.image('sarang_walking', 'sarang_walking.png');
        this.load.image('sarang_closer', 'sarang_closer.png');
        this.load.image('sarang_arms', 'sarang_arms.png');
        this.load.image('sarang_confused', 'sarang_confused.png');
        this.load.image('sarang_look', 'sarang_look.png');

        // 2. Load Main Game Level Backgrounds
        const levelImages = [
            { name: "College", img: "delhi_college.png" },      
            { name: "Hostel", img: "delhi_hostel.png" },  
            { name: "K F C", img: "delhi_town.png" },   
            { name: "LJPT NGR", img: "delhi_house.png" },  
            { name: "Jaipur", img: "jaipur.png" },
            { name: "McLeod Ganj", img: "mcleodganj.png" },
            { name: "Sharjah", img: "dubai.png" },
            { name: "Thiruvalla", img: "kerala.png" }
        ];
        levelImages.forEach(l => this.load.image(l.name, l.img));
        
        // 3. Load All Audio
        this.load.audio('phone_ring', 'phone_ring.mp3');
        this.load.audio('happy_bday', 'happy_bday.mp3'); 
        this.load.audio('scary_transition', 'scary_transition.mp3');
        this.load.audio('intro_bgm', 'intro.mp3');
        this.load.audio('delhi_bgm', 'delhi_theme.mp3');
        this.load.audio('jaipur_bgm', 'jaipur_theme.mp3');
        this.load.audio('mcleod_bgm', 'mcleod_theme.mp3');
        this.load.audio('dubai_bgm', 'dubai_theme.mp3');
        this.load.audio('kerala_bgm', 'kerala_theme.mp3');
        this.load.audio('jump_sfx', 'jump.mp3');
        this.load.audio('score_sfx', 'score.mp3');
        this.load.audio('dead_sfx', 'dead.mp3');
        this.load.audio('popup_sfx', 'bloop.mp3');

        // 4. Generate remaining graphics exactly once
// --- REPLACE THE ENTIRE this.load.on('complete') BLOCK WITH THIS ---
        this.load.on('complete', () => {
            // 1. Generate remaining textures (keeping your existing logic)
            if (!this.textures.exists('halo')) {
                let g = this.make.graphics({ x: 0, y: 0, add: false });
                g.clear(); g.lineStyle(6, 0xffd700, 1); g.strokeEllipse(30, 15, 50, 15);
                g.lineStyle(2, 0xffff00, 0.5); g.strokeEllipse(30, 15, 46, 12);
                g.generateTexture('halo', 60, 30);
                
                g.clear(); g.fillStyle(0x000000, 0.2).fillRoundedRect(24, 4, 180, 70, 16).fillTriangle(24, 29, 4, 39, 24, 49); 
                g.fillStyle(0xffffff, 1).fillRoundedRect(20, 0, 180, 70, 16).fillTriangle(20, 25, 0, 35, 20, 45); 
                g.generateTexture('bubble', 210, 80);

                const drawPixelHeart = (isBroken) => {
                    g.clear(); const color = isBroken ? 0x555555 : 0xff0000; const outline = 0x111111; const p = 4;
                    const map = [[0,0,1,1,0,1,1,0,0],[0,1,2,2,1,2,2,1,0],[1,2,2,2,2,2,2,2,1],[1,2,2,2,2,2,2,2,1],[0,1,2,2,2,2,2,1,0],[0,0,1,2,2,2,1,0,0],[0,0,0,1,2,1,0,0,0],[0,0,0,0,1,0,0,0,0]];
                    map.forEach((row, y) => { row.forEach((dot, x) => { if (dot === 1) { g.fillStyle(outline, 1); g.fillRect(x*p, y*p, p, p); } if (dot === 2) { let finalColor = color; if (isBroken && x === y) finalColor = 0x222222; g.fillStyle(finalColor, 1); g.fillRect(x*p, y*p, p, p); } }); });
                    if(!isBroken) { g.fillStyle(0xffffff, 0.8); g.fillRect(2*p, 1*p, p, p); }
                };
                drawPixelHeart(false); g.generateTexture('pixel_heart', 40, 40);
                drawPixelHeart(true); g.generateTexture('broken_heart', 40, 40);

                g.clear(); for (let i = 15; i > 0; i--) { g.fillStyle(i % 2 === 0 ? 0xff00ff : 0x00ffff, 1); g.fillCircle(60, 60, i * 4); }
                g.generateTexture('portal', 120, 120);

                g.clear(); const alpha = gameSettings.pipeOpacity;
                g.fillStyle(0x00001a, alpha).fillRect(0, 0, 60, 1000); g.fillStyle(0x001a4d, alpha).fillRect(4, 0, 52, 1000); g.fillStyle(0x004080, alpha).fillRect(8, 0, 15, 1000); g.fillStyle(0xffffff, alpha * 0.5).fillRect(12, 0, 5, 1000); 
                g.fillStyle(0x00001a, alpha).fillRect(-5, 0, 70, 40); g.fillStyle(0x001a4d, alpha).fillRect(-1, 4, 62, 32); g.fillStyle(0x004080, alpha).fillRect(3, 4, 15, 32); g.fillStyle(0xffffff, alpha * 0.5).fillRect(7, 4, 5, 32);
                g.generateTexture('pipe', 70, 1000);
                g.clear(); g.fillStyle(0xffffff, 1); g.fillCircle(25, 40, 18); g.fillCircle(50, 30, 22); g.fillCircle(75, 40, 18); g.fillCircle(35, 20, 16); g.fillCircle(65, 20, 16); g.generateTexture('cloud', 100, 70);
                g.destroy();
            }

            // 2. Hide loading bar and show "TAP TO START"
            progressBar.destroy();
            progressBox.destroy();
            loadingText.setText("READY!");
            
            let continueText = this.add.text(W/2, H/2 + 40, "► TAP TO CONTINUE ◄", { 
                fontFamily: retroFont, fontSize: '14px', fill: '#00e676', stroke: '#000', strokeThickness: 4 
            }).setOrigin(0.5);
            this.tweens.add({ targets: continueText, alpha: 0.2, duration: 500, yoyo: true, loop: -1 });

            // 3. Wait for tap to unlock audio and start game
            this.input.once('pointerdown', () => {
                if (this.sound.context.state === 'suspended') {
                    this.sound.context.resume();
                }
                this.scene.start('StartScene');
            });
        });
    }
}

class StartScene extends Phaser.Scene {
    constructor() { super('StartScene'); }
    
    create() {
        const W = this.cameras.main.width; const H = this.cameras.main.height;
        
        this.bg = this.add.tileSprite(W/2, H/2, W, H, 'start_bg');
        const textureScale = H / this.textures.get('start_bg').getSourceImage().height;
        this.bg.setTileScale(textureScale);

        this.introMusic = dummyAudio;
        if (this.cache.audio.exists('intro_bgm')) {
            this.introMusic = this.sound.add('intro_bgm', { loop: true, volume: 0.4 });
            
            // 1. Try to play immediately (might be blocked)
            this.introMusic.play();

            // 2. CHROME/IOS FIX: Unlock audio on the very first touch
            const unlockAudio = () => {
                if (this.sound.context.state === 'suspended') {
                    this.sound.context.resume();
                }
                if (this.introMusic && !this.introMusic.isPlaying) {
                    this.introMusic.play();
                }
            };

            this.input.once('pointerdown', unlockAudio);
            this.input.keyboard.once('keydown', unlockAudio);
        }

        let player = createPlayer(this, W/2, H/2 - 220);
        this.tweens.add({ targets: player, y: H/2 - 250, duration: 1500, ease: 'Sine.easeInOut', yoyo: true, loop: -1 });
        
        let titleText = this.add.text(W/2, H/2 - 110, "UMANG'S\nBIRTHDAY\nQUEST", { 
            fontFamily: retroFont, fontSize: '26px', fill: '#ff0055', stroke: '#ffffff', strokeThickness: 6, align: 'center', shadow: { offsetX: 4, offsetY: 4, color: '#00ffff', blur: 0, fill: true }, lineSpacing: 5 
        }).setOrigin(0.5);
        this.tweens.add({ targets: titleText, scale: 1.05, duration: 800, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });

        this.add.text(W/2, H/2 + 100, "Sarang is missing.\nOnly you can find him.\n\nMaybe he's somewhere \nyou guys visited?...\nor maybe not...?", { 
            fontFamily: retroFont, fontSize: '12px', fill: '#e0f7fa', stroke: '#000', strokeThickness: 4, align: 'center', lineSpacing: 5
        }).setOrigin(0.5);
        
        let prompt = this.add.text(W/2, H/2 + 240, "► TAP TO START ◄", { 
            ...premiumText, fontSize: '16px', fill: '#00e676', strokeThickness: 6 
        }).setOrigin(0.5);
        this.tweens.add({ targets: prompt, alpha: 0.1, duration: 600, yoyo: true, loop: -1 });
        
        this.canStart = false;
        this.time.delayedCall(500, () => { this.canStart = true; });
        
        const startGame = () => { 
            if (this.canStart) {
                this.canStart = false; 
                this.introMusic.stop(); 
                
                this.cameras.main.fade(300, 255, 255, 255);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MainGame', { lives: 3, score: 0, levelIdx: 0 }); 
                });
            }
        };
        this.input.on('pointerdown', startGame);
        this.input.keyboard.on('keydown-SPACE', startGame);
    }

    update() {
        if (this.bg) {
            this.bg.tilePositionX += 0.5; 
        }
    }
}

class MainGame extends Phaser.Scene {
    constructor() { super('MainGame'); }

    init(data) {
        this.lives = data.lives; this.score = data.score;
        this.currentLevelIndex = data.levelIdx;
        this.isTransitioning = false;
        this.queueHeartSpawn = false; 
        
        this.portalDialogueTriggered = false;
        this.portalSpawned = false;

        this.levels = [
            { name: "College", img: "delhi_college.png", speed: 0.8, bgm: 'delhi_bgm' },      
            { name: "Hostel", img: "delhi_hostel.png",   speed: 0.8, bg: 'delhi_bgm' },  
            { name: "K F C", img: "delhi_town.png",     speed: 0.8,bgm: 'delhi_bgm' },   
            { name: "LJPT NGR", img: "delhi_house.png",  speed: 0.8, bgm: 'delhi_bgm' },  
            { name: "Jaipur", img: "jaipur.png",           speed: 0.8, bgm: 'jaipur_bgm' },
            { name: "McLeod Ganj", img: "mcleodganj.png",   speed: 0.8, bgm: 'mcleod_bgm' },
            { name: "Sharjah", img: "dubai.png",         speed: 0.8, bgm: 'dubai_bgm' },
            { name: "Thiruvalla", img: "kerala.png",        speed: 0.8, bgm: 'kerala_bgm' }
        ];
        this.milestones = [0, 7, 14, 21, 29, 37, 45, 53];
        this.dialogueTriggered = false;
    }

    create() {
        const W = this.cameras.main.width; const H = this.cameras.main.height;
        
        this.cameras.main.fadeIn(300, 255, 255, 255);

        this.background = this.add.tileSprite(W/2, H/2, W, H, this.levels[this.currentLevelIndex].name);
        this.updateBgScale(this.background, this.currentLevelIndex);
        this.fadeBg = this.add.tileSprite(W/2, H/2, W, H, this.levels[this.currentLevelIndex].name).setAlpha(0);
        this.clouds = this.add.group();
        this.time.addEvent({ delay: 3000, callback: this.addCloud, callbackScope: this, loop: true });
        this.addCloud(true); this.addCloud(true);

        // --- PASTE THIS RIGHT BELOW this.addCloud(true); ---
        let skipBtn = this.add.text(W - 10, 10, "SKIP TO KERALA", { 
            fontFamily: retroFont, fontSize: '10px', fill: '#0f0', backgroundColor: '#000', padding: { x: 5, y: 5 } 
        }).setOrigin(1, 0).setDepth(2000).setInteractive();
        
        skipBtn.on('pointerdown', () => {
            this.score = 53; 
            this.scoreText.setText(this.score);
            this.updateLevel();
        });

        this.currentMusic = dummyAudio;
        let bgmKey = this.levels[0].bgm; 
        if (this.cache.audio.exists(bgmKey)) {
            this.currentMusic = this.sound.add(bgmKey, { loop: true, volume: 0.4 });
            this.currentMusic.play();
        }

        this.lifeImages = [];
        for (let i = 0; i < 3; i++) {
            let texture = (i < this.lives) ? 'pixel_heart' : 'broken_heart';
            let img = this.add.image(45, 45 + (i * 45), texture).setDepth(50);
            this.lifeImages.push(img);
        }

        this.player = createPlayer(this, W * 0.25, H / 2);
        this.physics.add.existing(this.player);
        this.player.body.setSize(60, 60); this.player.body.setOffset(-30, -30); 
        this.player.body.collideWorldBounds = true;
        this.player.setDepth(10);
        
        this.pipes = this.physics.add.group();
        this.collectibles = this.physics.add.group();
        this.physics.add.overlap(this.player, this.collectibles, this.collectHeart, null, this);

        this.cityText = this.add.text(W/2, 50, this.levels[this.currentLevelIndex].name, premiumText).setOrigin(0.5).setDepth(20);
        this.scoreText = this.add.text(W/2, 110, this.score, scoreStyle).setOrigin(0.5).setDepth(20);
        
        this.diagContainer = this.add.container(-450, H + 30).setDepth(100);
        this.charSprite = this.add.image(0, 35, 'buddy').setOrigin(0, 1);
        this.charSprite.displayHeight = 250; 
        this.charSprite.scaleX = this.charSprite.scaleY; 
        this.charSprite.setFlipX(true); 
        this.haloSprite = this.add.image(60, -130, 'halo').setOrigin(0.5, 0.5);
        this.bubbleSprite = this.add.image(105, -55, 'bubble').setOrigin(0, 1);
        this.diagText = this.add.text(215, -100, "", { 
            fontFamily: retroFont, fontSize: '10px', fill: '#000', align: 'center', wordWrap: { width: 160 } 
        }).setOrigin(0.5, 0.5); 
        this.diagContainer.add([this.bubbleSprite, this.charSprite, this.haloSprite, this.diagText]);
        
        this.input.on('pointerdown', () => this.jump());
        this.input.keyboard.on('keydown-SPACE', () => this.jump());
        
        this.pipeTimer = this.time.addEvent({ delay: gameSettings.pipeSpawnDelay, callback: this.addPipe, callbackScope: this, loop: true, paused: true });
        
        this.physics.add.collider(this.player, this.pipes, this.handleDeath, null, this);

        this.gameStarted = false;
        this.player.body.allowGravity = false;
        
        let floatTween = this.tweens.add({ targets: this.player, y: this.player.y - 15, duration: 800, yoyo: true, loop: -1, ease: 'Sine.easeInOut' });

        let startLabel = this.add.text(W/2, H/2 - 100, "STARTING IN", { ...premiumText, fontSize: '16px' }).setOrigin(0.5).setDepth(200);
        let countText = this.add.text(W/2, H/2 - 30, "3", scoreStyle).setOrigin(0.5).setDepth(200);

        let count = 3;
        this.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                count--;
                if (count > 0) {
                    countText.setText(count);
                } else {
                    countText.setText("GO!");
                    startLabel.destroy();
                    this.tweens.add({ targets: countText, alpha: 0, duration: 500, onComplete: () => countText.destroy() });
                    
                    floatTween.stop();
                    this.player.body.allowGravity = true;
                    this.gameStarted = true;
                    this.pipeTimer.paused = false;
                }
            }
        });
    }

    update() {
        const H = this.cameras.main.height; const W = this.cameras.main.width;
        const currentSpeed = this.levels[this.currentLevelIndex].speed;
        const texture = this.textures.get(this.levels[this.currentLevelIndex].name);
        const scale = H / texture.getSourceImage().height;
        const maxScrollX = Math.max(0, texture.getSourceImage().width - (W / scale));
        if (this.background.tilePositionX < maxScrollX) {
            this.background.tilePositionX += currentSpeed; this.fadeBg.tilePositionX += currentSpeed;
        }
        this.player.setAngle(this.player.body.velocity.y * 0.05);
        if (this.player.y > H - 40 || this.player.y < 40) this.handleDeath(); 
        this.clouds.getChildren().forEach(c => { c.x -= c.speed; if (c.x < -150) c.destroy(); });
        
        this.collectibles.getChildren().forEach(heart => {
            if (heart.x < -50) heart.destroy();
        });

        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getBounds().right < this.player.x && !pipe.passed) {
                pipe.passed = true; this.score += 0.5; 
                if (this.score % 1 === 0) {
                    this.scoreText.setText(this.score);
                    this.checkDialogue(); 
                    this.updateLevel();
                    
                    if (this.score === 61 && !this.portalDialogueTriggered) {
                        this.portalDialogueTriggered = true;
                        this.showDialogue("He's not here too..\nWTFF IS THAT!!");
                    }

                    if (this.score === 62 && !this.portalSpawned) {
                        this.portalSpawned = true;
                        this.spawnPortal();
                    }
                }
            }
            if (pipe.x < -100) pipe.destroy();
        });
    }

    checkDialogue() {
        const nextMilestone = this.milestones[this.currentLevelIndex + 1];
        if (nextMilestone && this.score === (nextMilestone - 4) && !this.dialogueTriggered) {
            this.dialogueTriggered = true;
            this.showDialogue(dialogueSettings.messages[nextMilestone]);
        }
    }

    showDialogue(msg) {
        if (this.cache.audio.exists('popup_sfx')) this.sound.play('popup_sfx', { volume: 0.5 });
        this.diagText.setText(msg);
        this.tweens.add({ targets: this.diagContainer, x: 20, duration: 600, ease: 'Back.easeOut' });
        this.bobTween = this.tweens.add({ targets: [this.charSprite, this.haloSprite], y: '-=10', duration: 300, yoyo: true, loop: -1 });
        
        this.time.delayedCall(6000, () => {
            this.tweens.add({ targets: this.diagContainer, x: -450, duration: 600, ease: 'Back.easeIn' });
            if (this.bobTween) this.bobTween.stop();
        });
    }

updateLevel() {
        let idx = 0;
        for (let i = 0; i < this.milestones.length; i++) { if (this.score >= this.milestones[i]) idx = i; }
        if (idx !== this.currentLevelIndex && !this.isTransitioning) {
            
            if (idx > 0 && idx % 2 === 0) {
                this.queueHeartSpawn = true;
            }

            this.isTransitioning = true; 
            this.dialogueTriggered = false;
            let next = this.levels[idx];
            
            // 1. Prepare the incoming background at the start (0)
            this.fadeBg.setTexture(next.name).setAlpha(0);
            this.fadeBg.tilePositionX = 0; 
            this.updateBgScale(this.fadeBg, idx);

            this.tweens.add({
                targets: this.fadeBg,
                alpha: 1,
                duration: 1500,
                onComplete: () => {
                    // 2. Once faded in, swap the main background texture
                    this.background.setTexture(next.name);
                    
                    // 3. Sync the main background to exactly where the fade layer reached
                    this.background.tilePositionX = this.fadeBg.tilePositionX;
                    
                    this.updateBgScale(this.background, idx);
                    this.fadeBg.setAlpha(0);
                    this.currentLevelIndex = idx; 
                    this.isTransitioning = false;
                }
            });
            this.cityText.setText(next.name);
        }
    }

    updateBgScale(t, i) { t.setTileScale(this.cameras.main.height / this.textures.get(this.levels[i].name).getSourceImage().height); }
    
    jump() { 
        if (!this.gameStarted) return; 
        
        if (this.cache.audio.exists('jump_sfx')) this.sound.play('jump_sfx', { volume: 0.3 });
        this.player.body.setVelocityY(gameSettings.jumpStrength); 
    }
    
    addPipe() {
        const W = this.cameras.main.width; const H = this.cameras.main.height;
        const pipeY = Phaser.Math.Between(H * 0.25, H * 0.75);
        const top = this.pipes.create(W + 100, pipeY - (gameSettings.pipeGap / 2) - 500, 'pipe').setFlipY(true);
        const bottom = this.pipes.create(W + 100, pipeY + (gameSettings.pipeGap / 2) + 500, 'pipe');
        this.pipes.getChildren().forEach(p => { p.body.allowGravity = false; p.setVelocityX(gameSettings.pipeSpeed); });

        if (this.queueHeartSpawn) {
            let heartY = Phaser.Math.Between(H * 0.3, H * 0.7);
            let heart = this.collectibles.create(W + 100 + 250, heartY, 'pixel_heart');
            heart.body.allowGravity = false;
            heart.setVelocityX(gameSettings.pipeSpeed);
            this.queueHeartSpawn = false;
        }
    }

    spawnPortal() {
        const W = this.cameras.main.width; const H = this.cameras.main.height;
        this.portal = this.physics.add.sprite(W + 100, H / 2, 'portal').setDepth(15);
        this.portal.body.allowGravity = false;
        this.portal.setVelocityX(gameSettings.pipeSpeed);
        
        this.tweens.add({ targets: this.portal, angle: 360, duration: 2000, repeat: -1 });
        this.tweens.add({ targets: this.portal, scaleX: 1.2, scaleY: 1.2, duration: 600, yoyo: true, repeat: -1 });

        this.pipeTimer.paused = true; 
        
        this.physics.add.overlap(this.player, this.portal, this.enterPortal, null, this);
    }

    enterPortal(player, portal) {
        this.physics.pause();
        this.currentMusic.stop();
        
        if (this.cache.audio.exists('scary_transition')) {
            this.sound.play('scary_transition', { volume: 1.0 });
        } else if (this.cache.audio.exists('score_sfx')) {
            this.sound.play('score_sfx', { volume: 0.8 }); 
        }

        this.cameras.main.shake(3000, 0.05);
        this.cameras.main.flash(1500, 255, 0, 0);
        
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.2,
            rotation: 0.05,
            yoyo: true,
            repeat: 7,
            duration: 100
        });

        this.tweens.add({
            targets: player,
            angle: 720,
            scaleX: 0,
            scaleY: 0,
            x: portal.x,
            y: portal.y,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                this.cameras.main.fade(1000, 255, 255, 255); 
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.cameras.main.setZoom(1);
                    this.cameras.main.setRotation(0);
                    this.scene.start('Cutscene');
                });
            }
        });
    }

    addCloud(randomX = false) {
        const W = this.cameras.main.width; const x = randomX ? Phaser.Math.Between(0, W) : W + 100;
        let c = this.add.sprite(x, Phaser.Math.Between(50, 300), 'cloud').setAlpha(0.15).setDepth(2);
        let s = Phaser.Math.FloatBetween(0.5, 1.4); c.setScale(s); c.speed = s * Phaser.Math.FloatBetween(0.5, 1.0);
        this.clouds.add(c);
    }

    collectHeart(player, heart) {
        heart.destroy(); 
        if (this.cache.audio.exists('score_sfx')) this.sound.play('score_sfx', { volume: 0.5 }); 
        
        if (this.lives < 3) {
            this.lives++;
            for (let i = 0; i < 3; i++) {
                let texture = (i < this.lives) ? 'pixel_heart' : 'broken_heart';
                this.lifeImages[i].setTexture(texture);
            }
        }
    }

    handleDeath() {
        if (!this.gameStarted) return; 
        
        if (this.cache.audio.exists('dead_sfx')) this.sound.play('dead_sfx', { volume: 0.5 });
        this.currentMusic.stop(); 
        this.physics.pause(); this.pipeTimer.paused = true; 
        this.player.list.forEach(child => { if (child.setTint) child.setTint(0xff0000); });
        this.scene.launch('UIOverlay', { lives: this.lives - 1, score: this.score, levelIdx: this.currentLevelIndex });
        this.scene.pause();
    }
}

class Cutscene extends Phaser.Scene {
    constructor() { super('Cutscene'); }
    
    create() {
        this.W = this.cameras.main.width; 
        this.H = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 255, 255, 255);

        // --- REPLACE THE bgTop AND bgBot BLOCKS WITH THIS ---
        this.bgTop = this.add.image(this.W/2, this.H/4, 'turf_left');
        this.bgTop.displayWidth = this.W;
        this.bgTop.displayHeight = this.H / 2;

        this.bgBot = this.add.image(this.W/2, (this.H/4) * 3, 'turf_right');
        this.bgBot.displayWidth = this.W;
        this.bgBot.displayHeight = this.H / 2;

        this.divider1 = this.add.rectangle(this.W/2, this.H/2, this.W, 6, 0x000000).setDepth(2);
        this.divider2 = this.add.rectangle(this.W/2, this.H/2, this.W, 2, 0xffffff).setDepth(3);

        this.bgFinal = this.add.image(this.W/2, this.H/2, 'final_bg').setAlpha(0).setDepth(1);
        this.bgFinal.displayHeight = this.H; this.bgFinal.scaleX = this.bgFinal.scaleY;
        if(this.bgFinal.displayWidth < this.W) { this.bgFinal.displayWidth = this.W; this.bgFinal.scaleY = this.bgFinal.scaleX; }

        this.sarang = this.add.image(this.W * 0.75, (3*this.H)/4 + 20, 'sarang_sleep').setDepth(4);
        this.setSarang('sarang_sleep'); 
        
        this.umang = createPlayer(this, -100, this.H/4);
        this.umang.setScale(0.85); 
        this.umang.setDepth(4);
        this.setUmang('gf_head'); 
        
        this.dialogueBox = this.add.graphics().setAlpha(0).setDepth(10);
        this.textObj = this.add.text(0, 0, "", { 
            fontFamily: retroFont, 
            fontSize: '12px', 
            fill: '#000000', 
            wordWrap: { width: this.W - 100 } 
        }).setAlpha(0).setDepth(11);

        this.step = 0;
        this.canClick = false;

        this.tweens.add({
            targets: this.umang, x: this.W * 0.25, duration: 2000, ease: 'Power2',
            onComplete: () => { 
                this.dialogueBox.setAlpha(1);
                this.textObj.setAlpha(1);
                this.nextStep(); 
                this.input.on('pointerdown', () => { if(this.canClick) this.nextStep(); });
            }
        });
    }

    setSarang(key) {
        this.sarang.setTexture(key);
        this.sarang.displayHeight = 280; 
        this.sarang.scaleX = this.sarang.scaleY; 
    }

    setUmang(key) {
        let head = this.umang.list[1]; 
        head.setTexture(key);
        head.displayHeight = 220; 
        head.scaleX = head.scaleY; 
    }

    setDialogue(speaker, msg) {
        this.textObj.setText(`${speaker}:\n${msg}`);
        
        if (speaker === "Umang") {
            this.textObj.setOrigin(0, 0);
            this.textObj.setPosition(30, 30);
        } else {
            this.textObj.setOrigin(1, 1);
            this.textObj.setPosition(this.W - 30, this.H - 30);
        }
        
        let bounds = this.textObj.getBounds();
        this.dialogueBox.clear();
        this.dialogueBox.fillStyle(0xffffff, 1);
        this.dialogueBox.fillRoundedRect(bounds.x - 20, bounds.y - 20, bounds.width + 40, bounds.height + 40, 25);
    }

    nextStep() {
        this.step++;
        this.canClick = true; 

        switch (this.step) {
            case 1:
                this.setUmang('gf_head');
                this.setDialogue("Umang", "Where TF am I?!");
                break;
            case 2:
                this.setUmang('gf_head');
                this.setDialogue("Umang", "Wait... is that him?!");
                break;
            case 3:
                this.canClick = false; 
                this.setUmang('umang_phone');
                this.setDialogue("Umang", "Ofc... He's sleeping! Let me call him.");
                
                let ring = dummyAudio;
                if (this.cache.audio.exists('phone_ring')) {
                    ring = this.sound.add('phone_ring', { loop: true });
                    ring.play();
                }
                
                this.time.delayedCall(3000, () => {
                    ring.stop();
                    this.canClick = true;
                    this.nextStep();
                });
                break;
            case 4:
                this.setSarang('sarang_phone');
                this.setDialogue("Sarang", "Hello? Yeah?");
                break;
            case 5:
                this.setUmang('umang_phone'); 
                this.setSarang('sarang_happy_talk');
                this.setDialogue("Umang", "Fuck you! I've been searching for you everywhere!");
                break;
            case 6:
                this.setDialogue("Sarang", "Oh hey! Sorry haha");
                break;
            case 7:
                this.setUmang('umang_confused'); 
                this.setDialogue("Umang", "Would you love me if i was a bird?");
                break;
            case 8:
                this.setSarang('sarang_annoyed');
                this.setDialogue("Sarang", "Man I told you to stop asking me these stupid questions ffs!!");
                break;
            case 9:
                this.setDialogue("Umang", "Just answer the question");
                break;
            case 10:
                this.setSarang('sarang_confused');
                this.setDialogue("Sarang", "Umm yeah i guess?");
                break;    
            case 11:
                this.setDialogue("Umang", "FUCK YOU!!! turn right!!");
                break; 
            case 12:
                this.setUmang('gf_head');
                this.setSarang('sarang_look');
                this.setDialogue("Sarang", "What the-.");
                break;                                           
            case 13:
                this.setSarang('sarang_walking');
                this.setDialogue("Sarang", "Wow... you were for real");
                break;
            case 14:
                this.canClick = false; 
                this.dialogueBox.setAlpha(0); 
                this.textObj.setAlpha(0);
                
                this.setSarang('sarang_arms');
                
                this.tweens.add({
                    targets: this.umang, x: this.W * 0.6, duration: 1500, ease: 'Sine.easeInOut',
                    onComplete: () => { 
                        
                        this.tweens.add({ targets: [this.bgTop, this.bgBot, this.divider1, this.divider2], alpha: 0, duration: 200 });
                        
                        this.umang.x = -50; 
                        this.umang.y = this.sarang.y - 50;
                        
                        this.tweens.add({ 
                            targets: this.bgFinal, alpha: 1, duration: 200,
                            onComplete: () => { 
                                
                                this.tweens.add({
                                    targets: this.umang,
                                    x: this.sarang.x - 90, 
                                    duration: 1500,
                                    ease: 'Sine.easeInOut',
                                    onComplete: () => {
                                        this.setUmang('umang_arms');
                                        this.scene.start('FinalScene');
                                    }
                                });
                            } 
                        });
                    }
                });
                break;
        }
    }
}

class FinalScene extends Phaser.Scene {
    constructor() { super('FinalScene'); }
    
    create() {
        const W = this.cameras.main.width; 
        const H = this.cameras.main.height;
        this.cameras.main.fadeIn(1000, 255, 255, 255);

        if (this.cache.audio.exists('happy_bday')) {
            this.sound.add('happy_bday', { loop: false }).play();
        }

        this.add.rectangle(W/2, H/2, W, H, 0x111111);

        let bdayText = this.add.text(W/2, H/2 - 40, "HAPPY\n\nBIRTHDAY\n\nUMANG !", { 
            fontFamily: retroFont, fontSize: '32px', fill: '#ffeb3b', stroke: '#ff5722', strokeThickness: 10, align: 'center', shadow: { offsetX: 5, offsetY: 5, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5).setScale(0);

        this.tweens.add({ targets: bdayText, scale: 1, duration: 1000, ease: 'Back.easeOut' });
        
        this.tweens.add({ targets: bdayText, y: H/2 - 50, duration: 1500, yoyo: true, loop: -1, ease: 'Sine.easeInOut', delay: 1000 });

        this.time.addEvent({
            delay: 300, 
            loop: true,
            callback: () => {
                let heart = this.add.image(Phaser.Math.Between(0, W), -50, 'pixel_heart').setScale(Phaser.Math.FloatBetween(0.5, 1.5));
                this.tweens.add({
                    targets: heart,
                    y: H + 100,
                    x: heart.x + Phaser.Math.Between(-50, 50),
                    duration: Phaser.Math.Between(2500, 4500),
                    onComplete: () => heart.destroy()
                });
            }
        });
    }
}

class UIOverlay extends Phaser.Scene {
    constructor() { super('UIOverlay'); }
    create(data) {
        const W = this.cameras.main.width; const H = this.cameras.main.height;
        this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.75);
        
        this.canContinue = false;
        this.time.delayedCall(4000, () => { this.canContinue = true; });

        const handleInteraction = () => {
            if (!this.canContinue) return; 

            if (data.lives > 0) { 
                this.scene.stop(); this.scene.start('MainGame', { lives: data.lives, score: data.score, levelIdx: data.levelIdx });
            } else { 
                this.scene.stop('MainGame'); this.scene.stop(); this.scene.start('StartScene'); 
            }
        };

        if (data.lives > 0) { 
            this.add.text(W/2, H/2 - 50, " AMAZE! \n ", scoreStyle).setOrigin(0.5); 
            this.add.text(W/2, H/2 + 20, "YOU'RE DEAD\n\nCONTINUE?", premiumText).setOrigin(0.5);
        } else { 
            this.add.text(W/2, H/2 - 50, " GAME \nOVER \n \nplay \nagain?", { ...scoreStyle, fill: '#ff4444' }).setOrigin(0.5); 
        }
        
        this.input.on('pointerdown', handleInteraction); 
        this.input.keyboard.on('keydown-SPACE', handleInteraction);
    }
}

const config = {
    type: Phaser.AUTO, width: 400, height: 700, backgroundColor: '#000',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: gameSettings.gravity } } }, 
    scene: [PreloadScene, StartScene, MainGame, Cutscene, FinalScene, UIOverlay] 
};

// --- BULLETPROOF WEBFONT LOADER ---
const webFontScript = document.createElement('script');
webFontScript.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
webFontScript.onload = () => {
    WebFont.load({
        google: {
            families: ['Press Start 2P']
        },
        active: () => {
            new Phaser.Game(config);
        },
        inactive: () => {
            // Fallback just in case of network block
            new Phaser.Game(config);
        }
    });
};
document.head.appendChild(webFontScript);