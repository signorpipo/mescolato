class DomeSphere {
    constructor(position, scale, color, timeToComplete) {
        this._myPosition = position;
        this._myScale = scale;
        this._myColor = color;
        this._myTimeToComplete = timeToComplete;

        this._myPhase = null;

        this._myTimer = 0;
    }

    start() {
        this._mySphereObject = WL.scene.addObject(GlobalData.RootObject);

        this._myMesh = this._mySphereObject.addComponent('mesh');
        this._myMesh.mesh = GlobalData.myDomeSphereMesh;
        this._myMesh.material = GlobalData.myDomeSphereMaterial.clone();

        this._myMesh.material.diffuseColor = this._myColor;
        let ambientColor = this._myColor.slice(0);
        glMatrix.vec3.scale(ambientColor, ambientColor, 0.5);
        this._myMesh.material.ambientColor = ambientColor;

        this._mySphereObject.resetScaling();
        this._mySphereObject.scale([0, 0, 0]);
        this._mySphereObject.setTranslationWorld([0, 0, 0]);

        this._mySphereObject.active = false;

        this._myTimer = 0;

        this._myPhase = DomeSpherePhase.MOVING;
    }

    spawn(useAudio) {
        this._mySphereObject.active = true;

        if (useAudio) {
            this._myAudio = this._mySphereObject.addComponent("custom-howler-audio-source", { "src": "assets/audio/sphere.mp3" });
            let pitch = Math.random() * (1.5 - 0.75) + 0.75;
            this._myAudio.pitch(pitch);
            this._myAudio.audio.on('end', function () {
                this._myAudio.active = false;
            }.bind(this));

            this._myAudio.play();
        }
    }

    update(dt) {
        switch (this._myPhase) {
            case DomeSpherePhase.MOVING:
                this._moving(dt);
                break;
            case DomeSpherePhase.DONE:
                this._done(dt);
                break;
        }
    }

    _moving(dt) {
        let percentageComplete = this._myTimer / this._myTimeToComplete;

        let percentagePosition = (Math.sin(percentageComplete * Math.PI / 6 + Math.PI / 3) - Math.sin(Math.PI / 3)) / (1 - Math.sin(Math.PI / 3));
        let percentageScale = (Math.sin(percentageComplete * Math.PI / 6 + Math.PI / 3) - Math.sin(Math.PI / 3)) / (1 - Math.sin(Math.PI / 3));

        let currentPosition = glMatrix.vec3.create();
        glMatrix.vec3.copy(currentPosition, this._myPosition);
        glMatrix.vec3.scale(currentPosition, currentPosition, percentagePosition);

        //console.log(percentagePosition, currentPosition);

        let currentScale = glMatrix.vec3.create();
        glMatrix.vec3.copy(currentScale, this._myScale);
        glMatrix.vec3.scale(currentScale, currentScale, percentageScale);

        this._mySphereObject.resetScaling();
        this._mySphereObject.scale(currentScale);
        this._mySphereObject.setTranslationWorld(currentPosition);

        this._myTimer += dt;

        if (this._myTimer >= this._myTimeToComplete) {
            this._mySphereObject.resetScaling();
            this._mySphereObject.scale(this._myScale);
            this._mySphereObject.setTranslationWorld(this._myPosition);
            this._myPhase = DomeSpherePhase.DONE;
        }
    }

    _done(dt) {
    }

    isDone() {
        return this._myPhase == DomeSpherePhase.DONE;
    }
}

var DomeSpherePhase = {
    MOVING: 0,
    DONE: 1
};