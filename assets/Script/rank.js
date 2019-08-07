// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
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
        home: home
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    hide() {
        this.node.active = false;
        this.unschedule(this.updateSubGame);
    },
    prePage() {
        if (window.wx) {
            wx.postMessage({ type: 'pre_page' });
            this.schedule(this.updateSubGame, .1, 4);
        }
    },
    nextPage() {
        if (window.wx) {
            wx.postMessage({ type: 'next_page' });
            this.schedule(this.updateSubGame, .1, 4);
        }
    },
    updateSubGame() {
        this.node.getChildByName('sub_canvas').getComponent(cc.WXSubContextView).update();
        /* if (window.sharedCanvas) {
            this.home.tex.initWithElement(window.sharedCanvas);
            this.home.tex.handleLoadedTexture();
            var sub_canvas = this.node.getChildByName('sub_canvas').getComponent(cc.Sprite);
            sub_canvas.spriteFrame = new cc.SpriteFrame(this.home.tex);
        } */
    },
    show() {
        this.node.active = true;

        if (window.wx) {
            /* var sub_canvas = this.node.getChildByName('sub_canvas').getComponent(cc.Sprite);
            sub_canvas.spriteFrame = null;*/

            window.sharedCanvas.width = 1080;
            window.sharedCanvas.height = 1570; 
            wx.postMessage({ type: 'show_rank', size: { width: 1080, height: 1570 } });
            this.schedule(this.updateSubGame, .1, 10);
        }
    },
    start() {

    },

    // update (dt) {},
});
