class SnakeSphere {
    constructor(material, scale, objectToFollow, distanceFrames, spawnTime) {
        this._myMaterial = material;
        this._myScale = scale;
        this._myObjectToFollow = objectToFollow;
        this._myDistanceFrames = distanceFrames;

        this._myFollowTransformList = [];
        for (let i = 0; i <= distanceFrames; i++) {
            this._myFollowTransformList[i] = glMatrix.quat2.create();
        }

        this._myPhase = null;
        this._myTimer = 0;

        this._mySpawnTime = spawnTime;
    }

    getObject() {
        return this._mySphereObject;
    }

    spawn() {
        this._myPhase = SnakeSpherePhase.SPAWN;
        this._myAudio.play();
    }

    start() {
        this._mySphereObject = WL.scene.addObject(GlobalData.RootObject);

        this._myMesh = this._mySphereObject.addComponent('mesh');
        this._myMesh.mesh = GlobalData.mySnakeSphereMesh;
        this._myMesh.material = this._myMaterial.clone();

        this._myAudio = this._mySphereObject.addComponent("custom-howler-audio-source", { "src": "assets/audio/snake_sphere.mp3" });
        let pitch = Math.random() * (1.1 - 0.9) + 0.9;
        this._myAudio.pitch(pitch);

        this._myAudio.audio.on('end', function () {
            this._myAudio.active = false;
        }.bind(this));

        this._mySphereObject.resetScaling();
        this._mySphereObject.scale([0, 0, 0]);
        this._mySphereObject.setTranslationWorld([0, 0, 0]);

        this._myTimer = 0;

        this._myPhase = SnakeSpherePhase.IDLE;
    }

    update(dt) {
        switch (this._myPhase) {
            case SnakeSpherePhase.IDLE:
                this._idle(dt);
                break;
            case SnakeSpherePhase.SPAWN:
                this._spawn(dt);
                break;
            case SnakeSpherePhase.FOLLOW:
                this._follow(dt);
                break;
        }
    }

    _idle(dt) {
        this._follow(dt);
    }

    _spawn(dt) {
        this._myTimer += dt;

        this._mySphereObject.resetScaling();

        if (this._myTimer > this._mySpawnTime) {
            this._mySphereObject.scale(this._myScale);
            this._myPhase = SnakeSpherePhase.FOLLOW;
        } else {
            let percentage = (Math.sin(this._myTimer / this._mySpawnTime * Math.PI / 6 + Math.PI / 3) - Math.sin(Math.PI / 3)) / (1 - Math.sin(Math.PI / 3));
            let currentScale = this._myScale.slice(0);
            glMatrix.vec3.scale(currentScale, currentScale, percentage);
            //console.log(currentScale);
            this._mySphereObject.scale(currentScale);
        }

        this._follow(dt);
    }

    _follow(dt) {
        this._myFollowTransformList.unshift(this._myObjectToFollow.transformWorld.slice(0));
        this._myFollowTransformList.pop();

        this._mySphereObject.transformWorld = this._myFollowTransformList[this._myFollowTransformList.length - 1];
    }

    isDone() {
        return this._myPhase == DomeSpherePhase.DONE;
    }
}

var SnakeSpherePhase = {
    IDLE: 0,
    SPAWN: 1,
    FOLLOW: 2,
};