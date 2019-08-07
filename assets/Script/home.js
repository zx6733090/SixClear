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
var game_scene=require('game_scene');
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
        game_scene:game_scene
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    getShareInfo(data) {
        data=data||"";
        return {
            title: config.game.shareTitle[0],
            imageUrl: config.game.shareImg[0],
            query:data
        };
    },
    toggleSound(ev) {
        var v = ev.isChecked ? 0 : 1;
        cc.audioEngine.setEffectsVolume(v);
        cc.audioEngine.setMusicVolume(v);
    },
    hide() {
        this.node.active = false;

        this.unschedule(this.updateSubGame);
    },
    updateSubGame() {
        this.node.getChildByName('sub_canvas').getComponent(cc.WXSubContextView).update();
        /* if (window.sharedCanvas) {
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            var sub_canvas = this.node.getChildByName('sub_canvas').getComponent(cc.Sprite);
            sub_canvas.spriteFrame = new cc.SpriteFrame(this.tex);
        } */
    },
    show() {
        this.node.active = true;
        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.playMusic(this.game_scene.effects[9], true);
        }
        
        if (window.wx) {
            /* var node=this.node.getChildByName('sub_canvas');
            var sub_canvas = node.getComponent(cc.Sprite);
            sub_canvas.spriteFrame = null;

            var size = cc.view.getVisibleSize();
            window.sharedCanvas.width = 850;
            window.sharedCanvas.height = 500;
            node.setScale(size.width/850); 
            */
           window.sharedCanvas.width = 850;
            window.sharedCanvas.height = 500;
           this.schedule(this.updateSubGame, .2, 20);
            wx.postMessage({ type: 'show_userinfo', size: { width: 850, height: 500 } });
        }
    },
    share(ev, data) {
        window.wx && window.wx.shareAppMessage(this.getShareInfo(data));
    },
    handleOptions(options){
        //options.query.time
        //options.query.type
    },
    loadAni() {
        if (config.game.recommend) {
            config.game.recommend.forEach(v => {
                var ins = { appId: v.appId, frames: [], host: this };
                var reg = v.images.match(/(.+\/)([^/]+)\..+(\d+)-(\d+)/);
                var path = reg[1], name = reg[2], low = reg[3], up = reg[4];
                ins.frameLength = up - low + 1;
                for (var i = low; i <= up; i++) {
                    cc.loader.load(`${path}${name}${i}.png`, function (err, img) {
                        this.frames.push(new cc.SpriteFrame(img));
                        if (this.frames.length == this.frameLength) {
                            var clip = new cc.AnimationClip();
                            clip.name = this.appId;
                            var arr = [], framegap = config.game.frameInterval || 0.2;
                            for (var m = 0; m < this.frameLength; m++) {
                                arr.push({ "frame": m * framegap, "value": this.frames[m] });
                            }
                            clip.curveData = { comps: { "cc.Sprite": { spriteFrame: arr } } };
                            clip.wrapMode = 2;
                            clip._duration = this.frameLength * framegap;
                            this.host.aniCom.addClip(clip);
                            if (this.host.aniCom._clips.length == 1) {
                                this.host.nextGame();
                            }
                        }
                    }.bind(ins));
                }
            });
        }
    },
    nextGame() {
        if (this.aniCom._clips.length == 0 || !this.node.active) return;
        this.curPlayIndex = (this.curPlayIndex + 1) % this.aniCom._clips.length;
        this.recommendName = this.aniCom._clips[this.curPlayIndex].name;
        this.aniCom.play(this.recommendName);
        this.timer = setTimeout(this.nextGame.bind(this), config.game.recommend.find(v => v.appId == this.recommendName).time * 1000);
    },
    start () {
        this.curPlayIndex = 0;
        this.aniCom = this.node.getChildByName('recommend').getComponent(cc.Animation);
        cc.loader.loadRes('config', (err, data) => {
            console.log("load config err:", err);
            if (!err || err.status == 0 || err.status == 200) {
                config.game = JSON.parse(data);
            }

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange =  ()=> {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
                    console.log('config change to server!');
                    config.game = JSON.parse(xhr.responseText);
                    if ( config.version < config.game.version) {
                        config.game.lure = config.game.oldVersion_lure;
                        console.log('user old version lure!');
                    } else {
                        console.log('user new version lure!');
                    }

                    if (config.game.lure) {
                        this.loadAni();
                    }
                }
            };
            xhr.open("GET", "https://config.023mama.com/static/config/lucky666/config.txt", true);
            xhr.send();
        });

        //this.tex = new cc.Texture2D();
        if(window.wx){
            //var options=wx.getLaunchOptionsSync();
            wx.onShow(this.handleOptions);
        }
        this.scheduleOnce(this.show, 1.5);
    },
    // update (dt) {},
});
