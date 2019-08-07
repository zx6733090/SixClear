// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        _canUseNum: 0,
        canUseNum: {
            get() {
                return this._canUseNum;
            },
            set(value) {
                this.node.getComponent(cc.Button).interactable = value > 0 ? true : false;
                this.node.getChildByName('canNum').getComponent(cc.Label).string = value > 0 ? value : '';
                this.node.getChildByName('tqdbgy').active=value > 0 ? true : false;
                this._canUseNum = value;
            }
        },
        _luckyCount: 0,
        luckyCount: {
            get() {
                return this._luckyCount;
            },
            set(value) {
                if (value == this.needCount) {
                    this._luckyCount = 0;
                    this.needCount += 1;
                    this.canUseNum += 1;
                } else {
                    this._luckyCount = value;
                }
                this.node.getChildByName('progress').getComponent(cc.Label).string=this._luckyCount+'/'+this.needCount;
            }
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    generateGift() {
        this.canUseNum -= 1;
        this.usedCount += 1;
        this.giftRate = [Math.min(0.35, 0.2 + 0.04 * this.usedCount), Math.min(0.3, 0.1 + 0.04 * this.usedCount), Math.min(0.3, 0.1 + 0.04 * this.usedCount)];
        this.giftRate.unshift(1 - this.giftRate.reduce((pre, cur) => pre + cur, 0));
        var acc = 0;
        for (var i = 0; i < this.giftRate.length; i++) {
            acc += this.giftRate[i];
            this.giftRate[i] = acc;
        }
        return this.giftRate.findIndex(v=>v>Math.random());
    },
    start() {
        this.usedCount = 0;
        this.needCount = 2;
        this.luckyCount = 0;
    },

    // update (dt) {},
});
