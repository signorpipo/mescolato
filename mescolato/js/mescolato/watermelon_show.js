WL.registerComponent('watermelon-show', {
    _myWatermelon: { type: WL.Type.Object }
}, {
    start: function () {
    },
    update: function (dt) {
        this._myWatermelon.active = WatermelonActive;
    },
});

WatermelonActive = false;