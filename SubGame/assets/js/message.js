// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var rankItem = require('rankitem');
var headInfo = require('head');
var util = require('util');
var etype = {
    headwrap: 0,
    rankwrap: 1,
    subOver: 2,
    excess: 3,
    beat: 4
}
cc.Class({
    extends: cc.Component,
    properties: {
        subElement: {
            default: [],
            type: cc.Node
        },
        rankWrap: {
            default: null,
            type: cc.Node
        },
        rankItem: {
            default: null,
            type: cc.Prefab
        },
        head: {
            default: null,
            type: headInfo
        },
        myItem: {
            default: null,
            type: rankItem
        },
        prebt: {
            default: null,
            type: cc.Node
        },
        nextbt: {
            default: null,
            type: cc.Node
        }
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
    getFlag() {
        //return 'score' + util.toWeekKey(new Date())
        return 'score'
    },
    // onLoad () {},
    updateUserInfo(avatar, score) {
        if (avatar) {
            this.head.avatar = avatar;
        }
        if (score != null && score != undefined) {
            this.head.score = score;
        }
    },
    updateRank(data, offset) {
        this.rankWrap.removeAllChildren();
        if (offset == 0) {
            this.myItem.node.active = false;
        }
        //data-->Array.<UserGameData{avatarUrl,nickname,openid,Array<KVData{key,value}> KVDataList}> 
        this.prebt.active = this.curpage == 1 ? false : true;
        this.nextbt.active = this.curpage == this.sumpage ? false : true;

        data.forEach((v, i) => {
            var obj = v.KVDataList.find(v1 => v1.key == this.getFlag())||{value:0};
            //if (!obj) return;
            var param = { number: offset + i + 1, avatar: v.avatarUrl, nickName: v.nickname, score: obj.value }
            var item = cc.instantiate(this.rankItem);
            item.parent = this.rankWrap;
            var curitem = item.getComponent('rankitem');
            for (var k in param) {
                curitem[k] = param[k];
                if (v.avatarUrl == this.selfAvatar) {
                    this.myItem.node.active = true;
                    this.myItem[k] = param[k];
                }
            }
        });
    },
    showUserInfo(size) {
        this.subElement.forEach(v => v.active = false);
        var sz = cc.director.getWinSize();
        //this.subElement[etype.headwrap].setPosition((size.width - sz.width) / 2, (size.height - sz.height) / 2);
        this.subElement[etype.headwrap].active = true;
        //获取自己的头像和复活币数量
        if (window.wx) {
            if (!this.selfAvatar) {
                wx.getUserInfo({
                    openIdList: ['selfOpenId'],
                    success: (userRes) => {
                        console.log('getUserInfo success', userRes.data)
                        let userData = userRes.data[0];
                        //userData.avatarUrl  nickName
                        this.selfAvatar = userData.avatarUrl;
                        this.selfNick = userData.nickName;
                        this.updateUserInfo(userData.avatarUrl);
                    },
                    fail: (res) => {
                        //TODO this.loadingLabel.string = "数据加载失败，请检测网络，谢谢。";
                    }
                });
            }
            wx.getUserCloudStorage({
                keyList: [this.getFlag()],
                success: res => {
                    console.log("wx.getUserCloudStorage success", res);
                    var obj = res.KVDataList.find(v1 => v1.key == this.getFlag());
                    if (obj) {
                        var vobj = JSON.parse(obj.value);
                        this.updateUserInfo(null, vobj.wxgame.score);
                    }
                },
                fail: res => {
                    console.log("wx.getUserCloudStorage fail", res);
                },
            });
        }
    },
    updateOver(data) {
        //data-->Array.<UserGameData{avatarUrl,nickname,openid,Array<KVData{key,value}> KVDataList}> 
        var idx = data.findIndex(v => v.avatarUrl == this.selfAvatar);
        if (!data[idx]) return;

        var obj = data[idx].KVDataList.find(v1 => v1.key == this.getFlag());
        var highLabel = this.subElement[etype.subOver].getChildByName('highScore').getComponent(cc.Label);
        highLabel.string = this.maxScore?this.maxScore:obj.value;

        for (var i = 0, j = idx - 1; i < 3; i++ , j++) {
            var item = this.subElement[etype.subOver].getChildByName('overItem' + i);
            var com = item.getComponent('rankitem');
            var v = data[j];
            obj = v && v.KVDataList.find(v1 => v1.key == this.getFlag());
            if (v && obj) {
                item.active = true;
                com.number = j + 1;
                com.avatar = v.avatarUrl;
                com.nickName = v.nickname;
                com.score = obj.value;
            }
        }
    },
    showBeat(score, size) {
        this.subElement.forEach(v => v.active = false);
        this.getRankData(data => {
            var idx = data.findIndex(v => v.avatarUrl == this.selfAvatar);
            if (this.preExcessIdx == undefined) {
                this.preExcessIdx = idx;
            }
            if (this.preExcessIdx >= 0 && idx < this.preExcessIdx) {
                this.subElement[etype.beat].active = true;
                var sz = cc.director.getWinSize();
                //this.subElement[etype.beat].setPosition((size.width - sz.width) / 2, (size.height - sz.height) / 2);
                this.subElement[etype.beat].getChildByName('lb').getComponent(cc.Label).string = "超越";//+ data[idx + 1].nickname
                util.loadImg(data[idx + 1].avatarUrl, (sf) => {
                    var spr = this.subElement[etype.beat].getChildByName('avatar').getComponent(cc.Sprite);
                    spr.spriteFrame = sf;
                })
            }
            //console.log('beat test result:pre-'+this.preExcessIdx+"vs cur-"+idx,data);
            this.preExcessIdx = idx;
        }, score);
    },
    showOver(size) {
        this.subElement.forEach(v => v.active = false);
        this.subElement[etype.subOver].active = true;
        var sz = cc.director.getWinSize();
        //this.subElement[etype.subOver].setPosition((size.width - sz.width) / 2, (size.height - sz.height) / 2);
        for (var i = 0; i < 3; i++ ) {
            var item = this.subElement[etype.subOver].getChildByName('overItem' + i);
            item.active=false;
        }
        this.getRankData(data => this.updateOver(data));
    },
    prePage() {
        this.curpage = Math.max(this.curpage - 1, 1);
        this.getRankData((data, offset) => this.updateRank(data, offset), null, this.curpage);
    },
    nextPage() {
        this.curpage = Math.min(this.curpage + 1, this.sumpage);
        this.getRankData((data, offset) => this.updateRank(data, offset), null, this.curpage);
    },
    getRankData(cb, score, page) {
        //data-->Array.<UserGameData{avatarUrl,nickname,openid,Array<KVData{key,value}> KVDataList}> 
        //return cb([{ nickname: 'test1', avatarUrl: 'ss' }, { nickname: 'test2', avatarUrl: 're' }, { nickname: 'test3', avatarUrl: 'hg' }]);
        //获取排行榜数据
        if (page && page > 1 && this.rankData) {
            var offset = (page - 1) * 6;
            cb(this.rankData.slice(offset, offset + 6), offset);
            return;
        }
        if (window.wx) {
            wx.getFriendCloudStorage({
                keyList: [this.getFlag()],
                success: res => {
                    var data = res.data;
                    /* data = data.filter(v => v.KVDataList.find(v1 => {
                        if (v1.key == this.getFlag()) {
                            var vobj = JSON.parse(v1.value);
                            if (typeof (vobj) == "number") return true;
                            //过滤当前周的数据
                            var a = util.toWeekKey(vobj.wxgame.update_time);
                            var b = util.toWeekKey(Date.now());
                            if (a == b) {
                                return true;
                            }
                        }
                        return false;
                    })); */
                    data.forEach(v2 => {
                        v2.KVDataList = v2.KVDataList.map(v1 => {
                            if (v1.key == this.getFlag()) {
                                var vobj = JSON.parse(v1.value);
                                if (typeof (vobj) != "number") {
                                    v1.value = vobj.wxgame.score;
                                }
                            }
                            return v1;
                        })
                    });
                    if (score) {
                        var selfitem = data.find(v1 => v1.avatarUrl == this.selfAvatar);
                        if (selfitem) {
                            var selfObj = selfitem.KVDataList.find(v1 => v1.key == this.getFlag());
                            selfObj.value = score;
                        } else {
                            data.push({ nickname: this.selfNick, avatarUrl: this.selfAvatar, KVDataList: [{ key: this.getFlag(), value: score }] });
                        }
                    }
                    //console.log("wx.getFriendCloudStorage success", data);
                    data.sort((a, b) => {
                        if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                            return 0;
                        }
                        if (a.KVDataList.length == 0) {
                            return 1;
                        }
                        if (b.KVDataList.length == 0) {
                            return -1;
                        }
                        var obj1 = b.KVDataList.find(v1 => v1.key == this.getFlag());
                        var obj2 = a.KVDataList.find(v1 => v1.key == this.getFlag());
                        return obj1.value - obj2.value;
                    });

                    this.rankData = data;
                    this.sumpage = Math.ceil(data.length / 6);

                    if (page) {
                        var offset = (page - 1) * 6;
                        data = data.slice(offset, offset + 6);
                    }
                    cb(data, offset);
                },
                fail: res => {
                    console.log("wx.getFriendCloudStorage fail", res);
                },
            });
        }
    },
    showRank(size) {
        this.subElement.forEach(v => v.active = false);
        this.subElement[etype.rankwrap].active = true;
        var sz = cc.director.getWinSize();
        //this.subElement[etype.rankwrap].setPosition((size.width - sz.width) / 2, (size.height - sz.height) / 2);
        this.getRankData((data, offset) => this.updateRank(data, offset), null, 1);
    },
    showRelive(score, size) {
        this.subElement.forEach(v => v.active = false);
        this.subElement[etype.excess].active = true;
        var sz = cc.director.getWinSize();
        //this.subElement[etype.excess].setPosition((size.width - sz.width) / 2, (size.height - sz.height) / 2);
        this.getRankData(data => {
            var idx = data.findIndex(v => v.avatarUrl == this.selfAvatar);
            var preidx = idx - 1;
            while (preidx >= 0) {
                var selfv = data[idx].KVDataList.find(v1 => v1.key == this.getFlag()).value;
                var otherv = data[preidx].KVDataList.find(v1 => v1.key == this.getFlag()).value;
                if (selfv == otherv) {
                    preidx -= 1;
                } else {
                    break;
                }
            }
            console.log('excess result:next-' + preidx, data);
            var v = data[preidx];
            var av = this.subElement[etype.excess].getChildByName('have');
            var sc = this.subElement[etype.excess].getChildByName('no');
            if (v) {
                av.active = true;
                sc.active = false;
                util.loadImg(v.avatarUrl, (sf) => {
                    av.getChildByName('nextAvatar').getComponent(cc.Sprite).spriteFrame = sf;
                })
                var obj = v.KVDataList.find(v1 => v1.key == this.getFlag());
                av.getChildByName('score').getComponent(cc.Label).string = obj.value;
            } else {
                av.active = false;
                sc.active = true;
            }
        }, score);
    },
    setKey(key, value, maximize) {
        if (window.wx) {
            window.wx.getUserCloudStorage({
                // 以key/value形式存储
                keyList: [key],
                success: function (getres) {
                    console.log('getUserCloudStorage', 'success', getres);
                    var obj = getres.KVDataList.find(v1 => v1.key == this.getFlag());
                    if (obj && maximize) {
                        var vobj = JSON.parse(obj.value);
                        var curscore = vobj.wxgame.score;
                        /* var a = util.toWeekKey(vobj.wxgame.update_time);
                        var b = util.toWeekKey(Date.now()); */
                        if (/* a == b && */ curscore >= value) {
                            return;
                        }
                    }
                    this.maxScore=value;

                    var str = JSON.stringify({ wxgame: { score: value, update_time: Date.now() } });
                    // 对用户托管数据进行写数据操作
                    window.wx.setUserCloudStorage({
                        KVDataList: [{ key: key, value: str }],
                        success: function (res) {
                            console.log('setUserCloudStorage', 'success');
                        },
                        fail: function (res) {
                            console.log('setUserCloudStorage', 'fail')
                        }
                    });
                }.bind(this),
                fail: function (res) {
                    console.log('getUserCloudStorage', 'fail')
                }
            });
        }
    },
    start() {
        /* this.scheduleOnce(() => {
            cc.view.setDesignResolutionSize = function () { };
            console.log('clear setDesignResolutionSize callback!');
        }, 1.3); */
        console.log('current key:' + this.getFlag());

        this.cdTime = 5000;
        this.sumpage = 1;
        this.curpage = 1;
        this.preTime = new Date().getTime();
        if (window.wx) {
            wx.onMessage(msg => {
                if (msg.type == "show_rank") {
                    console.log('subgame-----show_rank');
                    this.curpage = 1;
                    this.showRank(msg.size);
                } else if (msg.type == "show_userinfo") {
                    console.log('subgame-----show_userinfo')
                    this.showUserInfo(msg.size);
                } else if (msg.type == "show_over") {
                    console.log('subgame-----show_over')
                    this.showOver(msg.size);
                } else if (msg.type == "set_key") {
                    console.log('subgame-----set_key   ' + msg.key + ':' + msg.value)
                    this.setKey(msg.key, msg.value, msg.maximize);
                } else if (msg.type == "show_relive") {
                    console.log('subgame-----show_relive')
                    this.showRelive(msg.score, msg.size);
                } else if (msg.type == "coins_num") {
                    //console.log('subgame-----coins_num-----' + msg.num);
                    //this.updateUserInfo(null, msg.num);
                } else if (msg.type == "test_beat") {
                    console.log('subgame-----test_beat');
                    this.showBeat(msg.score, msg.size)
                }
                else if (msg.type == "pre_page") {
                    console.log('subgame-----pre_page');
                    this.prePage();
                }
                else if (msg.type == "next_page") {
                    console.log('subgame-----next_page');
                    this.nextPage();
                }
            })
        }
    }
    // update (dt) {},
});
