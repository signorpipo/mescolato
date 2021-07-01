class SpheresDome {
    constructor() {
        this._myColors = [];
        this._myColors.push([6 / 255, 214 / 255, 160 / 255, 255 / 255]);
        this._myColors.push([17 / 255, 138 / 255, 178 / 255, 255 / 255]);
        this._myColors.push([239 / 255, 71 / 255, 111 / 255, 255 / 255]);
        this._myColors.push([255 / 255, 199 / 255, 102 / 255, 255 / 255]);

        this._mySpheres = null;
        this._myPhase = null;

        this._myCurrentTimer = 0;

        //Setup
        this._myTimeBetweenSphere = 0.5;
    }

    start() {
        this._mySpheres = [];
        this._mySpheresToSpawn = [];

        let tempSphere = new DomeSphere([0, 0, -5], [1, 1, 1], this._myColors[0]);

        this._mySpheresToSpawn.push(tempSphere);

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
        this._myCurrentTimer += dt;
        if (this._myCurrentTimer > this._myTimeBetweenSphere) {
            this._myCurrentTimer += 0;

            let randomIndex = Math.floor(Math.random() * this._mySpheresToSpawn.length);
            let sphereToSpawn = this._mySpheresToSpawn[randomIndex];
            this._mySpheresToSpawn.splice(randomIndex, 1);

            this._mySpheres.push(sphereToSpawn);
            sphereToSpawn.start();

            if (this._mySpheresToSpawn.length == 0) {
                this._myPhase = SpheresDomePhase.DONE;
            }
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
}

var SpheresDomePhase = {
    SPAWN: 0,
    DONE: 1
};