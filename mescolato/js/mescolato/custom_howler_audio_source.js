WL.registerComponent("custom-howler-audio-source", {
    /** Volume */
    volume: { type: WL.Type.Float, default: 1.0 },
    /** Whether audio should be spatialized/positional */
    spatial: { type: WL.Type.Bool, default: true },
    /** Whether to loop the sound */
    loop: { type: WL.Type.Bool, default: false },
    /** Whether to start playing automatically */
    autoplay: { type: WL.Type.Bool, default: false },
    /** URL to a sound file to play */
    src: { type: WL.Type.String, default: "" }
}, {
    start: function () {
        this.audio = new Howl({
            src: [this.src],
            loop: this.loop,
            volume: this.volume,
            autoplay: this.autoplay
        });

        this.origin = [0, 0, 0];
    },

    update: function () {
        if (!this.spatial) return;
        this.object.getTranslationWorld(this.origin);
        this.audio.pos(this.origin[0], this.origin[1], this.origin[2]);
    },

    play: function (stopBeforePlay) {
        if ((typeof stopBeforePlay) == 'undefined' || stopBeforePlay) {
            this.audio.stop();
        }

        this.audio.play();
        if (this.spatial) {
            this.object.getTranslationWorld(this.origin);
            this.audio.pos(this.origin[0], this.origin[1], this.origin[2]);
        }
    },

    stop: function () {
        this.audio.stop();
    },

    pitch(pitch) {
        this.audio.rate(pitch);
    }
});
