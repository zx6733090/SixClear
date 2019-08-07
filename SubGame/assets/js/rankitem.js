// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var util = require('util');
cc.Class({
    extends: cc.Component,

    properties: {
        secondSpr: {
            default: null,
            type: cc.SpriteFrame
        },
        thirdSpr: {
            default: null,
            type: cc.SpriteFrame
        },
        _number: 0,
        _avatar: '',
        _nickName: '',
        _score: 0,
        number: {
            get() {
                return this._number;
            },
            set(value) {
                var spr = this.node.getChildByName('art');
                var order = this.node.getChildByName('num');
                if (value > 3) {
                    spr.active = false;
                    order.active = true;
                    var label = order.getComponent(cc.Label);
                    label.string = value;
                } else {
                    spr.active = true;
                    order.active = false;
                    var spr1 = spr.getComponent(cc.Sprite);
                    if (value == 2) {
                        spr1.spriteFrame = this.secondSpr;
                    } else if (value == 3) {
                        spr1.spriteFrame = this.thirdSpr;
                    }
                }
                this._number = value;
            }
        },
        avatar: {
            get() {
                return this._avatar;
            },
            set(value) {
                util.loadImg(value, (sf) => {
                    var spr = this.node.getChildByName('avatar').getComponent(cc.Sprite);
                    spr.spriteFrame = sf;
                });
                this._avatar = value;
            }
        },
        nickName: {
            get() {
                return this._nickName;
            },
            set(value) {
                var nick = this.node.getChildByName('nick');
                if (nick) {
                    var label = nick.getComponent(cc.Label);
                    label.string = value;
                }
                this._nickName = value;
            }
        },
        score: {
            get() {
                return this._score;
            },
            set(value) {
                var label = this.node.getChildByName('score').getComponent(cc.Label);
                label.string = value;
                this._score = value;
            }
        }
        // }
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
    start() {

    }

    // update (dt) {},
});
