class CoolMovement {
    constructor(objectToMove) {
        this._myObjectToMove = objectToMove;

        this._myTimer = 0;
        this._myTargetPosition = [];

        this._myCurrentDelayToRetarget = 0;
        this._myCurrentDistanceToRetarget = 0;

        //Setup
        this._myMinDistance = 8;
        this._myMaxDistance = 16;

        this._myMinDelayToRetarget = 20;
        this._myMaxDelayToRetarget = 30;

        this._myMinDistanceToRetarget = 1;
        this._myMaxDistanceToRetarget = 2;

        this._myMinTargetPositionDistance = 12;

        this._mySpeed = 0.2;
    }

    start() {
        this._myObjectToMove.setTranslationWorld([0, 0, -7]);

        this._lookAt([0, 1, 0]);

        this._myTimer = 0;

        let randomX = (Math.random() < 0.5 ? 1 : -1) * Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance;
        let randomY = Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance;
        let randomZ = - (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);

        this._myTargetPosition = [randomX, randomY, randomZ];

        console.log(this._myTargetPosition);

        this._myCurrentDelayToRetarget = Math.random() * (this._myMaxDelayToRetarget - this._myMinDelayToRetarget) + this._myMinDelayToRetarget;
        this._myCurrentDistanceToRetarget = Math.random() * (this._myMaxDistanceToRetarget - this._myMinDistanceToRetarget) + this._myMinDistanceToRetarget;
    }

    update(dt) {
        this._myTimer += dt;

        let currentPosition = [];
        this._myObjectToMove.getTranslationWorld(currentPosition);
        let direction = [];
        glMatrix.vec3.sub(direction, this._myTargetPosition, currentPosition);
        this._lookAt(direction);

        let forward = [];
        this._myObjectToMove.getForward(forward);
        glMatrix.vec3.scale(forward, forward, this._mySpeed * dt);
        this._myObjectToMove.translate(forward);

        this._checkRetarget();

        let newPosition = [];
        this._myObjectToMove.getTranslationWorld(newPosition);

        glMatrix.vec3.sub(newPosition, newPosition, currentPosition);
        //console.log(newPosition);
        console.log(" ");
    }

    _lookAt(newForward) {
        let forward = [];
        this._myObjectToMove.getForward(forward);
        let angleBetween = glMatrix.vec3.angle(forward, newForward);
        if (angleBetween > 0.0001) {
            console.log(angleBetween);
            console.log(glMatrix.vec3.dist(forward, newForward));
            console.log("");
            //console.log(forward, newForward);
            let axis = [];
            glMatrix.vec3.cross(axis, forward, newForward);
            glMatrix.vec3.normalize(axis, axis);
            let rotation = [];
            glMatrix.quat.setAxisAngle(rotation, axis, angleBetween);

            glMatrix.quat.mul(rotation, rotation, this._myObjectToMove.transformWorld);
            glMatrix.quat.normalize(rotation, rotation);

            this._myObjectToMove.resetRotation();
            this._myObjectToMove.rotateObject(rotation);
        }
    }

    _checkRetarget() {
        let retarget = false;

        if (this._myTimer > this._myCurrentDelayToRetarget) {
            retarget = true;
        } else {
            let currentPosition = [];
            this._myObjectToMove.getTranslationWorld(currentPosition);
            let difference = glMatrix.vec3.dist(currentPosition, this._myTargetPosition);

            if (difference < this._myCurrentDistanceToRetarget) {
                retarget = true;
            }
        }

        if (retarget) {

            this._myTimer = 0;

            let distance = 0;
            let currentPosition = [];
            this._myObjectToMove.getTranslationWorld(currentPosition);

            do {
                let randomX = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);
                let randomY = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);
                let randomZ = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);

                this._myTargetPosition = [randomX, randomY, randomZ];

                distance = glMatrix.vec3.dist(currentPosition, this._myTargetPosition);

            } while (distance < this._myMinTargetPositionDistance);

            this._myCurrentDelayToRetarget = Math.random() * (this._myMaxDelayToRetarget - this._myMinDelayToRetarget) + this._myMinDelayToRetarget;
            this._myCurrentDistanceToRetarget = Math.random() * (this._myMaxDistanceToRetarget - this._myMinDistanceToRetarget) + this._myMinDistanceToRetarget;

            console.log(this._myTargetPosition);
        }
    }
}