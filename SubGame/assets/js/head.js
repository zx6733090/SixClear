// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var util=require('util');
cc.Class({
    extends: cc.Component,

    properties: {
        _avatar:'',
        avatar: {
            get() {
                return this._avatar;
            },
            set(value) {
                util.loadImg(value,(sf)=>{
                    var spr = this.node.getChildByName('best').getChildByName('avatar');
                    spr=spr.getComponent(cc.Sprite);
                    spr.spriteFrame=sf;
                })
                this._avatar = value;
            }
        },
        _score:'',
        score: {
            get() {
                return this._score;
            },
            set(value) {
                var label = this.node.getChildByName('score').getComponent(cc.Label);
                label.string=value;
                this._score = value;
            }
        },
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
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},
});
