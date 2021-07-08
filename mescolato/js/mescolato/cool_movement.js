class CoolMovement {
    constructor(objectToMove) {
        this._myObjectToMove = objectToMove;

        this._myRetargetTimer = 0;
        this._myTargetPosition = [];

        this._myCurrentDelayToRetarget = 0;
        this._myCurrentDistanceToRetarget = 0;

        this._myNewMainRotationAxis = [];
        this._myCurrentMainRotationAxis = null;
        this._myCurrentMainRotationTargetSpeed = 0;
        this._myCurrentDelayToRecomputeRotation = 0;
        this._myCurrentMainRotationSpeed = 0;
        this._myRecomputeRotationTimer = 0;

        this._myOldForward = [];

        this._myCurrentSpeed = 0;

        //Setup
        this._myMinDistance = 8;
        this._myMaxDistance = 16;

        this._myMinDelayToRetarget = 25;
        this._myMaxDelayToRetarget = 50;

        this._myMinDistanceToRetarget = 1;
        this._myMaxDistanceToRetarget = 2;

        this._myMinTargetPositionDistance = 30;

        this._myTargetSpeed = 0.55;

        this._myMinRotationSpeed = PP.MathUtils.toRadians(5);
        this._myMaxRotationSpeed = PP.MathUtils.toRadians(25);

        this._myMinThresholdAngle = PP.MathUtils.toRadians(20);
        this._myMaxThresholdAngle = PP.MathUtils.toRadians(40);

        this._myMinDelayToRecomputeRotation = 6;
        this._myMaxDelayToRecomputeRotation = 12;

        this._myRotationLerpFactor = 0.05;
        this._mySpeedLerpFactor = 0.2;

        PP.EasyTuneVariables.addVariable(new PP.EasyTuneNumber("Speed", 0.55, 0.01, 3));
    }

    start() {
        this._myObjectToMove.setTranslationWorld([0, 0, -7]);

        this._lookAt([0, 1, 0]);

        this._myRetargetTimer = 0;

        let randomX = (Math.random() < 0.5 ? 1 : -1) * Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance;
        let randomY = (Math.random() < 0.5 ? 1 : -1) * Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance;
        let randomZ = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);

        this._myTargetPosition = [randomX, randomY, randomZ];

        //console.log(this._myTargetPosition);

        this._myCurrentDelayToRetarget = Math.random() * (this._myMaxDelayToRetarget - this._myMinDelayToRetarget) + this._myMinDelayToRetarget;
        this._myCurrentDistanceToRetarget = Math.random() * (this._myMaxDistanceToRetarget - this._myMinDistanceToRetarget) + this._myMinDistanceToRetarget;

        this._computeRotationAxesData(true);

        this._myObjectToMove.getForward(this._myOldForward);
    }

    update(dt) {
        this._myTargetSpeed = PP.EasyTuneVariables.get("Speed").myValue;

        this._myCurrentSpeed = this._myCurrentSpeed + (this._myTargetSpeed - this._myCurrentSpeed) * this._mySpeedLerpFactor * dt;

        if (this._myNewMainRotationAxis == null) {
            this._myCurrentMainRotationSpeed = this._myCurrentMainRotationSpeed + (this._myCurrentMainRotationTargetSpeed - this._myCurrentMainRotationSpeed) * this._myRotationLerpFactor;
        } else {
            this._myCurrentMainRotationSpeed = this._myCurrentMainRotationSpeed + (0 - this._myCurrentMainRotationSpeed) * this._myRotationLerpFactor;
            //console.log(this._myCurrentMainRotationSpeed.toFixed(4));
            if (this._myCurrentMainRotationSpeed < 0.01) {
                this._myCurrentMainRotationAxis = this._myNewMainRotationAxis;
                this._myNewMainRotationAxis = null;
                this._myCurrentMainRotationSpeed = 0;
            }
        }

        let rotation = [];
        glMatrix.quat.setAxisAngle(rotation, this._myCurrentMainRotationAxis, this._myCurrentMainRotationSpeed * dt);
        //console.log(this._myCurrentMainRotationAxis, " ", this._myCurrentMainRotationSpeed * dt);
        glMatrix.quat.mul(rotation, rotation, this._myObjectToMove.transformWorld);
        glMatrix.quat.normalize(rotation, rotation);
        this._myObjectToMove.resetRotation();
        this._myObjectToMove.rotateObject(rotation);

        let forward = [];
        this._myObjectToMove.getForward(forward);
        glMatrix.vec3.scale(forward, forward, this._myCurrentSpeed * dt);
        this._myObjectToMove.translate(forward);

        if (!this._checkRetarget(dt)) {
            this._checkRecomputeRotation(dt);
        }

        this._myObjectToMove.getForward(this._myOldForward);
    }

    _computeRotationAxesData(hardRecompute) {
        let currentPosition = [];
        this._myObjectToMove.getTranslationWorld(currentPosition);
        let targetDirection = [];
        glMatrix.vec3.sub(targetDirection, this._myTargetPosition, currentPosition);
        let forward = [];
        this._myObjectToMove.getForward(forward);

        if (glMatrix.vec3.angle(forward, targetDirection) > 0.001) {
            this._myNewMainRotationAxis = [];
            glMatrix.vec3.cross(this._myNewMainRotationAxis, forward, targetDirection);
            glMatrix.vec3.normalize(this._myNewMainRotationAxis, this._myNewMainRotationAxis);
        } else {
            this._myNewMainRotationAxis = [];
            this._myObjectToMove.getUp(this._myNewMainRotationAxis);
        }

        if (this._myCurrentMainRotationAxis == null) {
            this._myCurrentMainRotationAxis = this._myNewMainRotationAxis;
            this._myNewMainRotationAxis = null;
        }

        this._myCurrentDelayToRecomputeRotation = Math.random() * (this._myMaxDelayToRecomputeRotation - this._myMinDelayToRecomputeRotation) + this._myMinDelayToRecomputeRotation;
        this._myCurrentAngleToRecomputeRotation = Math.random() * (this._myMaxThresholdAngle - this._myMinThresholdAngle) + this._myMinThresholdAngle;
        this._myCurrentMainRotationTargetSpeed = Math.random() * (this._myMaxRotationSpeed - this._myMinRotationSpeed) + this._myMinRotationSpeed;

        this._myRecomputeRotationTimer = 0;
    }

    _lookAt(newForward) {
        let forward = [];
        this._myObjectToMove.getForward(forward);
        let angleBetween = glMatrix.vec3.angle(forward, newForward);
        if (angleBetween > 0.0001) {
            //console.log(angleBetween);
            //console.log(glMatrix.vec3.dist(forward, newForward));
            //console.log("");
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

    _checkRetarget(dt) {
        this._myRetargetTimer += dt;

        let retarget = false;

        if (this._myRetargetTimer > this._myCurrentDelayToRetarget) {
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

            this._myRetargetTimer = 0;

            let distance = 0;
            let currentPosition = [];
            this._myObjectToMove.getTranslationWorld(currentPosition);
            let count = 0;
            do {
                let randomX = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);
                let randomY = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);
                let randomZ = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * (this._myMaxDistance - this._myMinDistance) + this._myMinDistance);

                this._myTargetPosition = [randomX, randomY, randomZ];

                distance = glMatrix.vec3.dist(currentPosition, this._myTargetPosition);

                count++;

            } while (distance < this._myMinTargetPositionDistance && count < 10);

            this._myCurrentDelayToRetarget = Math.random() * (this._myMaxDelayToRetarget - this._myMinDelayToRetarget) + this._myMinDelayToRetarget;
            this._myCurrentDistanceToRetarget = Math.random() * (this._myMaxDistanceToRetarget - this._myMinDistanceToRetarget) + this._myMinDistanceToRetarget;

            this._computeRotationAxesData(true);
        }

        return retarget;
    }

    _checkRecomputeRotation(dt) {
        this._myRecomputeRotationTimer += dt;

        let recompute = false;

        if (this._myRecomputeRotationTimer > this._myCurrentDelayToRecomputeRotation) {
            recompute = true;
        } else if (false) {
            let forward = [];
            this._myObjectToMove.getForward(forward);
            if (glMatrix.vec3.angle(forward, this._myOldForward) > 0.001 && this._myRecomputeRotationTimer > 8) {
                let flatForward = PP.MathUtils.removeComponentAlongAxis(forward, this._myCurrentMainRotationAxis);
                let flatOldForward = PP.MathUtils.removeComponentAlongAxis(this._myOldForward, this._myCurrentMainRotationAxis);

                let currentPosition = [];
                this._myObjectToMove.getTranslationWorld(currentPosition);
                let targetDirection = [];
                glMatrix.vec3.sub(targetDirection, this._myTargetPosition, currentPosition);

                if (glMatrix.vec3.angle(flatForward, targetDirection) < glMatrix.vec3.angle(flatOldForward, targetDirection) &&
                    glMatrix.vec3.length(flatForward) > 0.001 && glMatrix.vec3.length(flatOldForward) > 0.001) {
                    if (glMatrix.vec3.angle(flatForward, targetDirection) > this._myCurrentAngleToRecomputeRotation) {
                        recompute = true;
                        console.log("recomputed for angle");
                    }
                }
            }
        }

        if (recompute) {
            this._computeRotationAxesData(true);
        }
    }
}