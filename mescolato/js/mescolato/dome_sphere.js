class DomeSphere {
    constructor(position, scale, color) {
        this._myPosition = position.slice(0);
        this._myScale = scale.slice(0);
        this._myColor = color.slice(0);

        this._myPhase = null;
    }

    start() {
        this._mySphereObject = WL.scene.addObject(GlobalData.RootObject);

        this._myMesh = this._mySphereObject.addComponent('mesh');
        this._myMesh.mesh = GlobalData.mySphereMesh;
        this._myMesh.material = GlobalData.myDomeSphereMaterial.clone();

        this._myMesh.material.diffuseColor = this._myColor;
        let ambientColor = this._myColor.slice(0);
        glMatrix.vec3.scale(ambientColor, ambientColor, 0.5);
        this._myMesh.material.ambientColor = ambientColor;

        this._mySphereObject.resetScaling();
        this._mySphereObject.scale([0, 0, 0]);
        this._mySphereObject.setTranslationWorld([0, 0, 0]);

        this._myPhase = DomeSpherePhase.MOVING;
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
        this._mySphereObject.resetScaling();
        this._mySphereObject.scale(this._myScale);
        this._mySphereObject.setTranslationWorld(this._myPosition);
        this._myPhase = DomeSpherePhase.DONE;
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