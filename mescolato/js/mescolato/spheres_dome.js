class SpheresDome {
    constructor() {
        this._myColors = [];
        this._myColors.push([6 / 255, 214 / 255, 160 / 255, 255 / 255]);
        this._myColors.push([17 / 255, 138 / 255, 178 / 255, 255 / 255]);
        this._myColors.push([239 / 255, 71 / 255, 111 / 255, 255 / 255]);
        this._myColors.push([255 / 255, 199 / 255, 102 / 255, 255 / 255]);

        this._mySpheres = null;
        this._mySpheresToSpawn = null;

        this._myPhase = null;

        this._myCurrentTimer = 0;
        this._myCurrentTimeBetweenSphere = 0;
        this._mySpawnCounter = 0;

        this._myUseAudioTimer = 0;

        //Setup

        this._myUseAudioDelay = 0.12;
    }

    start() {
        this._prepareSpheres();

        this._myUseAudioTimer = this._myUseAudioDelay;

        this._myPhase = SpheresDomePhase.SPAWN;
    }

    update(dt) {
        switch (this._myPhase) {
            case SpheresDomePhase.SPAWN:
                this._spawn(dt);
                break;
            case SpheresDomePhase.DONE:
                this._done(dt);
                break;
        }
    }

    _spawn(dt) {
        let spheresToSpawnAtTimeout = 6;

        this._myCurrentTimer += dt;
        this._myUseAudioTimer += dt;
        if (this._myCurrentTimer > this._myCurrentTimeBetweenSphere) {
            this._myCurrentTimer = 0;

            let useAudio = false;
            if (this._myUseAudioTimer > this._myUseAudioDelay) {
                this._myUseAudioTimer = 0;
                useAudio = true;
            }

            for (let i = 0; i < spheresToSpawnAtTimeout && this._mySpheresToSpawn.length > 0; i++) {
                let randomIndex = Math.floor(Math.random() * this._mySpheresToSpawn.length);
                let sphereToSpawn = this._mySpheresToSpawn[randomIndex];
                this._mySpheresToSpawn.splice(randomIndex, 1);

                this._mySpheres.push(sphereToSpawn);
                sphereToSpawn.spawn(useAudio && i == 0);
            }

            if (this._mySpheresToSpawn.length == 0) {
                this._myPhase = SpheresDomePhase.DONE;
            }

            this._mySpawnCounter++;

            let minTimeBetweenSphere = 0.03;
            let maxTimeBetweenSphere = 1;
            let spawnToReachMinTime = 15;

            this._mySpawnCounter = Math.min(this._mySpawnCounter, spawnToReachMinTime);

            this._myCurrentTimeBetweenSphere = Math.cos((Math.PI / 6) * (this._mySpawnCounter / spawnToReachMinTime));
            this._myCurrentTimeBetweenSphere = PP.MathUtils.mapToInterval(this._myCurrentTimeBetweenSphere, 1, Math.cos(Math.PI / 6), 1, 0);
            this._myCurrentTimeBetweenSphere = (this._myCurrentTimeBetweenSphere * (maxTimeBetweenSphere - minTimeBetweenSphere)) + minTimeBetweenSphere;

            //console.log(this._myCurrentTimeBetweenSphere);
        }

        for (let sphere of this._mySpheres) {
            sphere.update(dt);
        }
    }

    _done(dt) {
        for (let sphere of this._mySpheres) {
            sphere.update(dt);
        }
    }

    isDone() {
        return this._myPhase == SpheresDomePhase.DONE;
    }

    _prepareSpheres() {
        this._mySpheres = [];
        this._mySpheresToSpawn = [];

        let cloves = 58;
        let angleForClove = Math.PI * 2 / cloves;

        let minDistance = 25;
        let maxDistance = 55;

        let minExtraRotation = 0;
        let maxExtraRotation = PP.MathUtils.toRadians(10);

        let minScale = 0.5;
        let maxScale = 2.5;

        let minTimeToComplete = 0.5;
        let maxTimeToComplete = 1;

        let upDirection = [0, 1, 0];
        let horizontalDirection = [0, 0, -1];
        for (let i = 0; i <= cloves / 2 - 1; i++) {
            let verticalDirection = [0, 1, 0];

            let rotationAxis = [];
            glMatrix.vec3.cross(rotationAxis, horizontalDirection, verticalDirection);
            glMatrix.vec3.normalize(rotationAxis, rotationAxis);

            for (let j = 0; j <= cloves - 1; j++) {
                let skipThreshold = 4;
                let skip = (j <= skipThreshold || (j >= cloves / 2 - skipThreshold && j <= cloves / 2 + skipThreshold) || j >= cloves - skipThreshold) && i % 5 != 0;
                if (!skip && ((j != 0 && j != cloves / 2) || i == 0)) {
                    let distance = Math.random() * (maxDistance - minDistance) + minDistance;
                    let extraAxisRotation = (Math.random() * 2 - 1) * (maxExtraRotation - minExtraRotation) + minExtraRotation;
                    let extraUpRotation = (Math.random() * 2 - 1) * (maxExtraRotation - minExtraRotation) + minExtraRotation;
                    let sphereDirection = verticalDirection.slice(0);

                    sphereDirection = PP.MathUtils.rotateVectorAroundAxis(sphereDirection, rotationAxis, extraAxisRotation);
                    sphereDirection = PP.MathUtils.rotateVectorAroundAxis(sphereDirection, upDirection, extraUpRotation);

                    glMatrix.vec3.scale(sphereDirection, sphereDirection, distance);

                    let sphereScale = Math.random() * (maxScale - minScale) + minScale;
                    let sphereColorIndex = Math.floor(Math.random() * this._myColors.length);

                    let timeToComplete = Math.random() * (maxTimeToComplete - minTimeToComplete) + minTimeToComplete;

                    let sphere = new DomeSphere(sphereDirection, [sphereScale, sphereScale, sphereScale], this._myColors[sphereColorIndex], timeToComplete);
                    sphere.start();
                    this._mySpheresToSpawn.push(sphere);
                }

                verticalDirection = PP.MathUtils.rotateVectorAroundAxis(verticalDirection, rotationAxis, angleForClove);

            }

            horizontalDirection = PP.MathUtils.rotateVectorAroundAxis(horizontalDirection, upDirection, angleForClove);
        }
    }
}

var SpheresDomePhase = {
    SPAWN: 0,
    DONE: 1
};