class Snake {
    constructor() {
        this._myTimer = 0;

        this._myCoolMovement = null;

        this._myPhase = null;

        this._myDT = 0;

        this._myEchoTimer = 0;
        this._myCurrentEchoDelay = 0;

        //Setup
        this._myWaitBeforeSpawnDelay = 5;
        this._mySpawnDelayList = [0, 8, 6, 4];

        this._myFixedDT = 1 / 72;

        this._myMinEchoDelay = 25;
        this._myMaxEchoDelay = 40;
    }

    start() {
        this._myPhase = SnakePhase.ECHO;

        this._mySnakeObject = WL.scene.addObject(GlobalData.RootObject);

        this._mySnakeObjectAudio = this._mySnakeObject.addComponent("custom-howler-audio-source", { "src": "assets/audio/snake_echo.mp3" });

        this._mySnakeSpheresToSpawn = [];
        this._mySnakeSpheres = [];

        let distanceList = [0, 300, 200, 150];
        let spawnTimeList = [4, 3, 2.5, 2];
        let scaleList = [1];
        for (let i = 1; i < 4; i++) {
            scaleList[i] = scaleList[i - 1] * 2 / 3;
        }

        for (let i = 0; i < 4; i++) {
            let object = this._mySnakeObject;
            if (i > 0) {
                object = this._mySnakeSpheresToSpawn[i - 1].getObject();
            }

            let snakeSphere = new SnakeSphere(GlobalData.mySnakeSphereMaterialList[i], [scaleList[i], scaleList[i], scaleList[i]], object, distanceList[i], spawnTimeList[i]);
            snakeSphere.start();
            this._mySnakeSpheresToSpawn.push(snakeSphere);
        }

    }

    update(dt) {
        this._myDT += dt;
        while (this._myDT >= this._myFixedDT) {
            this._myDT -= this._myFixedDT;
            switch (this._myPhase) {
                case SnakePhase.ECHO:
                    this._echo(this._myFixedDT);
                    break;
                case SnakePhase.WAIT_BEFORE_SPAWN:
                    this._waitBeforeSpawn(this._myFixedDT);
                    break;
                case SnakePhase.SPAWN:
                    this._spawn(this._myFixedDT);
                    break;
                case SnakePhase.DONE:
                    this._done(this._myFixedDT);
                    break;
            }
        }
    }

    _echo(dt) {
        let minDistance = 7;
        let maxDistance = 14;

        let x = Math.random() * (maxDistance - minDistance) + minDistance;
        let y = Math.random() * (maxDistance - minDistance) + minDistance;
        let z = Math.random() * (maxDistance - minDistance) + minDistance;

        x *= (Math.random() < 0.5) ? -1 : 1;
        y *= (Math.random() < 0.5) ? -1 : 1;
        z *= (Math.random() < 0.5) ? -1 : 1;

        this._mySnakeObject.setTranslationWorld([x, y, z]);
        let pitch = Math.random() * (1.1 - 0.9) + 0.9;
        this._mySnakeObjectAudio.audio._pannerAttr.refDistance = 3;
        this._mySnakeObjectAudio.audio._pannerAttr.rolloffFactor = 0.5;
        this._mySnakeObjectAudio.pitch(pitch);
        this._mySnakeObjectAudio.play();

        this._myPhase = SnakePhase.WAIT_BEFORE_SPAWN;
        this._myTimer = 0;

        for (let sphere of this._mySnakeSpheresToSpawn) {
            sphere.update(dt);
        }
    }

    _waitBeforeSpawn(dt) {
        this._myTimer += dt;
        if (this._myTimer > this._myWaitBeforeSpawnDelay) {
            this._myPhase = SnakePhase.SPAWN;
            this._myTimer = 0;

            this._myCoolMovement = new CoolMovement(this._mySnakeObject);
            this._myCoolMovement.start();
        }

        for (let sphere of this._mySnakeSpheresToSpawn) {
            sphere.update(dt);
        }
    }

    _spawn(dt) {
        this._myTimer += dt;
        if (this._myTimer > this._mySpawnDelayList[this._mySnakeSpheres.length]) {
            this._myTimer = 0;
            let sphere = this._mySnakeSpheresToSpawn.shift();
            sphere.spawn();
            this._mySnakeSpheres.push(sphere);

            if (this._mySnakeSpheresToSpawn.length == 0) {
                this._myPhase = SnakePhase.DONE;
                this._myCurrentEchoDelay = Math.random() * (this._myMaxEchoDelay - this._myMinEchoDelay) + this._myMinEchoDelay;
                this._myEchoTimer = this._myCurrentEchoDelay * 4 / 5;
            }
        }

        for (let sphere of this._mySnakeSpheresToSpawn) {
            sphere.update(dt);
        }
        for (let sphere of this._mySnakeSpheres) {
            sphere.update(dt);
        }

        this._myCoolMovement.update(dt);
    }

    _done(dt) {
        this._myEchoTimer += dt;
        if (this._myEchoTimer > this._myCurrentEchoDelay) {
            this._myEchoTimer = 0;
            this._myCurrentEchoDelay = Math.random() * (this._myMaxEchoDelay - this._myMinEchoDelay) + this._myMinEchoDelay;

            let pitch = Math.random() * (1.1 - 0.9) + 0.9;
            this._mySnakeObjectAudio.audio._pannerAttr.refDistance = 3;
            this._mySnakeObjectAudio.audio._pannerAttr.rolloffFactor = 0.5;
            this._mySnakeObjectAudio.pitch(pitch);
            this._mySnakeObjectAudio.play();
        }
        for (let sphere of this._mySnakeSpheres) {
            sphere.update(dt);
        }

        this._myCoolMovement.update(dt);
    }

    isDone() {
        return this._myPhase == SnakePhase.DONE;
    }
}

var SnakePhase = {
    ECHO: 0,
    WAIT_BEFORE_SPAWN: 1,
    SPAWN: 2,
    DONE: 3
};