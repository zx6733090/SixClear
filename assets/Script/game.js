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
var tooltip = require('tooltip');
var consumetip = require('consumetip');
var manager = require('chess');
var gameScene=require('game_scene');
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
        chess: {
            default: [],
            type: cc.Prefab
        },
        gameScene:gameScene,
        shadow: {
            default: null,
            type: cc.Prefab
        },
        manager: manager,
        cell: {
            default: null,
            type: cc.Prefab
        },
        scoreEffect: {
            default: null,
            type: cc.Prefab
        },
        light:{
            default: null,
            type: cc.Prefab
        },
        fortuneLabel: cc.Label,
        tooltip: tooltip,
        consumetip: consumetip
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    showPromotion(name) {
        this.promotion.active = true;
        this.promotion.getChildByName('wrap').getChildren().forEach(v => v.active = v.name == name ? false : true);
    },
    hidePromotion() {
        this.promotion.active = false;
        this.varyType = 0;
    },
    lightAni(pos){
       var arr= pos.split(',');
       var ins=cc.instantiate(this.light);
       ins.setPosition(+arr[0],+arr[1]);
       ins.parent=this.board;
       ins.runAction(cc.sequence(cc.spawn(cc.scaleTo(.5,.3),cc.moveTo(.5,cc.v2(-425,473))),cc.removeSelf(true)));
    },
    addFortune(num, pos) {
        config.fortune += num;
        //this.fortuneLabel.string = config.fortune;

        var idx = this.useNum.findIndex(v => v > config.fortune);
        for (var i = 0; i < 4; i++) {
            this.node.getChildByName('tool' + i).getComponent(cc.Toggle).interactable = i < idx || config.toolNum[i] ? true : false;
        }

        var ins = cc.instantiate(this.scoreEffect);
        ins.getChildByName('score').getComponent(cc.Label).string = "." + num;
        ins.parent = this.node;
        ins.setPosition(pos);
    },
    startBox() {
        this.node.getChildByName('tq').getChildByName('tqani').getComponent(cc.Animation).play();
        cc.audioEngine.playEffect(this.gameScene.effects[0]);
    },
    confirmGift(ev) {
        this.giftType = this.node.getChildByName('tq').getComponent('gift').generateGift();
        this.tooltip.show(ev, this.getGift.bind(this), this.giftType);
        cc.audioEngine.playEffect(this.gameScene.effects[1]);
    },
    getGift(num) {
        config.toolNum[this.giftType] += +num;
        config.toolNum = config.toolNum.slice();

        this.updateToolState();
    },
    updateToolState() {
        for (var i = 0; i < 4; i++) {
            var tool = this.node.getChildByName('tool' + i);
            tool.getComponent(cc.Toggle).interactable = config.toolNum[i] > 0 || config.fortune >= this.useNum[i] ? true : false;
            var nd = tool.getChildByName('num');
            if (config.toolNum[i] > 0) {
                nd.getComponent(cc.Label).string = config.toolNum[i];
                nd.color = cc.color(235, 100, 180);
            } else {
                nd.getComponent(cc.Label).string = '/' + this.useNum[i];
                nd.color = cc.color(255, 255, 255);
            }
        }
    },
    consumeTool(type) {
        if(type<=1){
            cc.audioEngine.playEffect(this.gameScene.effects[4]);
        } else if(type == 3){
            cc.audioEngine.playEffect(this.gameScene.effects[6]);
        }
        
        if (config.toolNum[type] > 0) {
            config.toolNum[type] -= 1;
            config.toolNum = config.toolNum.slice();
        } else {
            config.fortune -= this.useNum[type];
        }

        this.updateToolState();
    },
    execPromotion(ev, chs) {
        this.manager.useTool(this.varyType, null, chs);
        this.consumeTool(2);
    },
    resetChess() {
        var oper = () => {
            this.consumeTool(0);
            this.manager.generateChess();
        };
        if (config.toolNum[0] <= 0 && config.consumeTip) {
            this.consumetip.show(null, ok => ok != 0 && oper(), this.useNum[0]);
        } else {
            oper();
        }
    },
    hide() {
        this.node.active = false;
    },
    show() {
        this.node.active = true;

        cc.audioEngine.pauseMusic();
        this.varyType = 0;
        this.scheduleOnce(() => {
            this.manager.clearAll();
            this.manager.generateChess();
        }, .01);
        config.fortune = 0;
        this.fortuneLabel.string = 0;
        this.useNum = [300, 500, 800, 1000, Number.MAX_VALUE];
        this.updateToolState();
    },
    start() {
        this.board = this.node.getChildByName('board');
        this.promotion = this.node.getChildByName("promotion");
        this.board.on(cc.Node.EventType.TOUCH_START, (ev) => {
            if (this.varyType > 0) {
                this.manager.useTool(this.varyType, this.board.convertToNodeSpaceAR(ev.touch._point));
                this.node.getChildByName('tool' + this.varyType).getComponent(cc.Toggle).isChecked = false;

                if (this.varyType != 2) {
                    this.consumeTool(this.varyType);
                    this.varyType = 0;
                }
            }
        });
    },
    toggleState(ev, type) {
        var pretp = ev.isChecked ? type : 0;
        if (config.toolNum[type] <= 0 && config.consumeTip) {
            this.consumetip.show(null, ok => {
                if (ok != 0) {
                    this.varyType = pretp;
                } else {
                    ev.isChecked = false;
                }
            }, this.useNum[pretp]);
        } else {
            this.varyType = pretp;
        }
    },
    update(dt) {
        if (this.fortuneLabel.string != config.fortune) {
            var gap = (config.fortune - this.fortuneLabel.string) * dt;
            var sign = gap < 0 ? -1 : 1;
            this.fortuneLabel.string = +this.fortuneLabel.string+sign * Math.ceil(Math.abs(gap));
        }
    },
});
