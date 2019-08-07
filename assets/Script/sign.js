// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var config=require('config');
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
        sbg:{
            default:[],
            type:cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    normalTime(stamp) {
        var g = new Date(stamp);
        return stamp - (g.getHours() * 60 * 60 * 1000 + g.getMinutes() * 60 * 1000 + g.getSeconds() * 1000 + g.getMilliseconds());
    },
    getState(signArr) {
        var state = [-1, -1, -1, -1, -1, -1, -1];
        var cur = this.normalTime(Date.now()),signed=false;
        for (var i = Math.min(6,signArr.length - 1), j = 0; i >= 0; i--) {
            var v = this.normalTime(signArr[i]);
            if (cur - v <= 86400000) {
                if(cur==v){
                    signed=true;
                }
                state[j++] = 1;
                cur = v;
            }else{
                break;
            }
        }
        if(!signed){
            state[j]=0;
            if(j==7){
                state=[0, -1, -1, -1, -1, -1, -1];
            }
        }
        return state;
    },
    hide() {
        this.node.active = false;
    },
    show() {
        this.node.active = true;
    },
    updateState(state){
        var enIndex=state.findIndex(v=>v==0);
        var tg=this.node.getChildByName('getgift').getComponent(cc.Toggle);
        tg.interactable=enIndex!=-1?true:false;
        tg.isChecked=enIndex!=-1?false:true;

        for(var i=0;i<7;i++){
            var nd=this.node.getChildByName('day'+(i+1));
            var spr=nd.getComponent(cc.Sprite);
            var signed=nd.getChildByName('signed');
            var sbt=nd.getComponent(cc.Button);
            if(state[i]==-1){
                var idx=i<6?0:2;
                spr.spriteFrame=this.sbg[idx];
                signed.active=false;
                sbt.interactable=false;
            }else if(state[i]==0){
                var idx=i<6?4:5;
                spr.spriteFrame=this.sbg[idx];
                signed.active=false;
                sbt.interactable=true;
            }else if(state[i]==1){
                var idx=i<6?1:3;
                spr.spriteFrame=this.sbg[idx];
                signed.active=true;
                sbt.interactable=false;
            }
        }
    },
    sign(ev){
      var nums=[{0:2},{1:2},{0:1,2:1},{1:1,2:1},{0:2,3:1},{1:2,3:1},{0:1,1:1,2:1,3:1}];
      var addtool=nums[this.sta.findIndex(v=>v==0)];
      for(var k in addtool){
        config.toolNum[k]+=addtool[k];
      }
      config.toolNum=config.toolNum.slice();
      
      config.signTime.push(Date.now());
      config.signTime=config.signTime.slice();
      
      this.updateState(this.getState(config.signTime));
    },
    onLoad() {
        this.sta=this.getState(config.signTime);
        var enIndex=this.sta.findIndex(v=>v==0);
        this.node.active=enIndex!=-1?true:false;
        this.updateState(this.sta);
    }
    // update (dt) {},
});
