WL.registerComponent('fixed-foveation', {
    fixedFoveation: { type: WL.Type.Float, default: 0.5 },
}, {
    start: function () {
        if (WL.xrSession) {
            this.setFixedFoveation();
        } else {
            WL.onXRSessionStart.push(this.setFixedFoveation.bind(this));
        }
    },
    setFixedFoveation: function () {
        if ('webxr_baseLayer' in Module) {
            Module.webxr_baseLayer.fixedFoveation = this.fixedFoveation;
        }
    },
});