// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var config = require('config');
var home = require('home');
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        scoreLabel: cc.Label,
        home: home
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    updateSubGame() {
        this.node.getChildByName('sub_canvas').getComponent(cc.WXSubContextView).update();
        /* if (window.sharedCanvas) {
            this.home.tex.initWithElement(window.sharedCanvas);
            this.home.tex.handleLoadedTexture();
            var sub_canvas = this.node.getChildByName('sub_canvas').getComponent(cc.Sprite);
            sub_canvas.spriteFrame = new cc.SpriteFrame(this.home.tex);
        } */
    },
    hide() {
        this.node.active = false;
        this.unschedule(this.updateSubGame);
    },
    show() {
        this.node.active = true;

        this.scoreLabel.string = config.fortune;
        if (window.wx) {
            window.sharedCanvas.width = 1000;
            window.sharedCanvas.height = 1200;
            wx.postMessage({ type: 'show_over', size: { width: 1000, height: 1200 } });
            this.schedule(this.updateSubGame, 1, 4, .05);
        }
    },
    start() {

    },

    // update (dt) {},
});
