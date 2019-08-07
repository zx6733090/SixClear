// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var over = require('over');
var config = require('config');
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
        gameScene:gameScene,
        over: over,
        combo:{
            default:null,
            type:cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    //对齐坐标到单元格中心,返回对齐后的坐标，如果 无法对齐返回null
    alignPosition(pos) {
        var mindis = cc.v2().sub(pos).mag(), tp = cc.v2();
        for (var k in this.cells) {
            var arr = k.split(',');
            var curp = cc.v2(+arr[0], +arr[1]);
            var dis = curp.sub(pos).mag();
            if (dis < mindis) {
                mindis = dis;
                tp = curp;
            }
        }
        return mindis < 100 ? tp : null;
    },
    useTool(type, usePos, toChs) {
        var ap = usePos ? this.alignPosition(usePos) : this.toChsPos;
        if (!ap) return false;
        var key = ap.x + ',' + ap.y;
        if (type == 1) {
            this.cells[key].isBroken = true;
            this.clearCell(key);
        } else if (type == 3) {
            this.clearCell(key);
            this.getLinearPoints(key).forEach(v => {
                this.cells[v] && (this.cells[v].isBroken = true);
                this.clearCell(v);
            })
        } else if (type == 2) {
            if (!toChs) {
                if (!this.cells[key]) return;
                this.game.showPromotion(this.cells[key].name);
                this.toChsPos = ap;
            } else {
                var ins = cc.instantiate(this.game.chess[toChs - 1]);
                ins.parent = this.board;
                ins.setPosition(ap);
                ins.opacity = 0;
                ins.runAction(cc.fadeIn(1));
                this.cells[key].isFade = true;
                this.clearCell(key);

                this.cells[key] = ins;
                this.game.hidePromotion();
            }
        }
        return true;
    },
    clearCell(key) {
        if (this.cells[key]) {
            this.cells[key].getComponent('cell').died();
            this.cells[key] = 0;
        }
    },
    clearAll() {
        for (var k in this.cells) {
            this.clearCell(k);
        }
    },
    getLinearPoints(key) {
        var parr = key.split(',');
        var centerpt = cc.v2(+parr[0], +parr[1]);
        var startpt = cc.v2(centerpt.x + this.cellspacing, centerpt.y);
        var rs = [];
        for (var i = 0; i < 6; i++) {
            //var pos = cc.pRotateByAngle(startpt, centerpt, Math.PI / 3 * i);
            var pos=startpt.add(centerpt.neg()).rotate(Math.PI / 3 * i).add(centerpt);
            rs.push(Math.round(pos.x) + ',' + Math.round(pos.y));
        }
        return rs;
    },
    generateChess(count, rotate) {
        if (!count) {
            count = parseInt(Math.random() * 2) + 1, rotate = parseInt(Math.random() * 6) * 60;
        }
        this.node.removeAllChildren(true);
        var poss = [], onlyOne = true;
        for (var k in this.cells) {
            if (!this.cells[k]) {
                this.getLinearPoints(k).forEach(v => {
                    if (this.cells[v] == 0) {
                        onlyOne = false;
                    }
                });
                if (!onlyOne) break;
            }
        }
        onlyOne && (count = 1);
        var tipNode = this.game.node.getChildByName('xzdk3');
        tipNode.active = count == 1 ? false : true;
        var offset = 30;
        if (count == 1) {
            poss.push(cc.v2());
            tipNode.angle = offset;
        } else {
            tipNode.angle = offset + rotate - 90;
            var startp = cc.v2(this.cellspacing / 2, 0);
            rotate = rotate * Math.PI / 180;
            //poss.push(cc.pRotateByAngle(startp, cc.v2(), rotate));
            //poss.push(cc.pRotateByAngle(startp, cc.v2(), rotate - Math.PI));
            poss.push(startp.rotate(rotate));
            poss.push(startp.rotate(rotate - Math.PI));
        }
        var idxarr = [0,1,2,3,4,5];
        poss.forEach(v => {
            var idx = parseInt(Math.random() * idxarr.length);
            var ins = cc.instantiate(this.game.chess[idxarr[idx]]);
            idxarr.splice(idx, 1);

            ins.setPosition(Math.round(v.x), Math.round(v.y));
            ins.parent = this.node;
        });
        this.node.getComponent(cc.Animation).play();
    },
    testPoint(point) {
        var arr = [point], center;
        while (center = arr.find(v => !v.checked)) {
            center.checked = true;
            var k = Object.keys(center)[0];
            if (!this.cells[k]) continue;

            this.getLinearPoints(k).forEach(nk => {
                if (!arr.find(v => v[nk]) && this.cells[nk] && this.cells[nk].name == center[k].name) {
                    var obj = {};
                    obj[nk] = { name: center[k].name };
                    arr.push(obj);
                }
            });
        }
        if (arr.length >= 3) {
            cc.audioEngine.playEffect(this.gameScene.effects[7]);

            point.checked = false;
            point.combo = point.combo ? point.combo + 1 : 1;

            if(point.combo>1){
                cc.audioEngine.playEffect(this.gameScene.effects[3]);
                var ins=cc.instantiate(this.combo);
                ins.parent=this.game.node.getChildByName('combos');
                ins.getChildByName('combo').getComponent('combo').comboNum=point.combo;
                var childs=ins.parent.getChildren();
                if(childs.length>1){
                    childs[childs.length-2].runAction(cc.moveBy(.2,cc.v2(0,50)));
                }
            }

            var rate = [1, 1.5, 2, 2.5, 3, 3.5, 4];
            var endk = Object.keys(point)[0];

            var gp = this.game.node.convertToNodeSpaceAR(this.board.convertToWorldSpaceAR(this.cells[endk].position))
            
            this.game.addFortune(parseInt(5 * Math.pow(2, (arr.length - 3)) * (rate[point.combo - 1] || 2)), gp);
            
            point[endk].name = +arr[0][endk].name + 1;
            arr.forEach((v1, i) => {
                var nk = Object.keys(v1)[0];
                if (!this.cells[nk]) return;
                var name = this.cells[nk].name, pos = this.cells[nk].position;
                this.cells[nk].endPos = this.cells[endk].position;
                this.clearCell(nk);

                if (i == 0) {
                    if (name == 7) {
                        this.game.node.getChildByName('tq').getComponent('gift').luckyCount += 1;
                        this.scheduleOnce(() => {
                            this.game.addFortune(30, gp);
                             cc.audioEngine.playEffect(this.gameScene.effects[6]);
                            //消除 一圈范围内 棋子
                            this.getLinearPoints(nk).forEach(dispos => {
                                this.cells[dispos] && (this.cells[dispos].isBroken = true);
                                this.clearCell(dispos);
                            });
                            this.game.lightAni(nk);
                        }, .1);
                    } else {
                        var ins = cc.instantiate(this.game.chess[name]);
                        ins.setPosition(pos);
                        ins.parent = this.board;
                        this.cells[nk] = ins;
                    }
                }
            });
            return true;
        }
        return false;
    },
    testLink(points) {
        while(points.length>0){
            var cur=points.shift();
            if(this.testPoint(cur)){
                points.unshift(cur);
                this.scheduleOnce(() => {
                    this.testLink(points);
                }, .2);
                break;
            }
        }
    },
    rotateChess() {
        var tipNode = this.game.node.getChildByName('xzdk3');
        if (tipNode.getNumberOfRunningActions() != 0)return;
            
        tipNode.runAction(cc.rotateTo(.2, tipNode.rotation + 60));
        cc.audioEngine.playEffect(this.gameScene.effects[8]);
        var childs = this.node.getChildren();
        childs.length > 1 && childs.forEach(v => {
            var p1 = v.position.mul(2);
            //var tp = cc.pRotateByAngle(v.position, cc.v2(), -60 * Math.PI / 180);
            var tp = cc.v2(v.position).rotate(-60 * Math.PI / 180);
            var p2 = tp.mul(2);
            v.runAction(cc.bezierTo(.2, [p1, p2, tp]));
        });
    },
    generateCells(turns) {
        if (turns == 0) {
            for (var k in this.cells) {
                this.cells[k] = 0;
            }
            return;
        }
        for (var k in this.cells) {
            if (this.cells[k] == 0) {
                this.cells[k] = 1;
                this.getLinearPoints(k).forEach(nk => {
                    if (this.cells[nk] == undefined) {
                        this.cells[nk] = 0;
                        var ins = cc.instantiate(this.game.cell);
                        var arr = nk.split(',');
                        ins.setPosition(+arr[0], +arr[1]);
                        ins.parent = this.board;
                    }
                });
            }
        }
        this.generateCells(turns - 1);
    },
    gameOver() {
        if (window.wx) {
            wx.postMessage({ type: 'set_key', key: "score", value: config.fortune, maximize: true });
        }
        this.scheduleOnce(this.over.show.bind(this.over), .4);
    },
    start() {
        this.cells = { "0,0": 0 };
        this.cellspacing = 186;
        this.game = this.node.parent.getComponent('game');
        this.board = this.game.node.getChildByName('board');
        this.generateCells(2);

        this.node.on(cc.Node.EventType.TOUCH_START, ev => {
            this.srcPos = this.node.getPosition();
            this.node.getChildren().forEach(v => {
                v.shadow = cc.instantiate(this.game.shadow);
                v.shadow.parent = this.board;
                v.shadow.active = false;
            });
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, ev => {
            var delta = ev.touch.getDelta();
            var dis=ev.touch._point.sub(ev.touch._startPoint).mag();
            var offset =dis < 10 ? { x: 0, y: 0 } : { x: 0, y: 200 };

            this.node.setPosition(this.node.x + delta.x, this.node.y + delta.y);
            this.node.getChildren().forEach(v => {
                if (dis > 10) {
                    if (!v.offsetY) {
                        v.offsetY = 200;
                        v.setPosition(v.x, v.y + v.offsetY);
                    }
                }

                var bpos = this.board.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(v.getPosition()));
                var fallpos = this.alignPosition(bpos);
                if (fallpos && this.cells[fallpos.x + ',' + fallpos.y] == 0) {
                    v.shadow.active = true;
                    v.shadow.setPosition(fallpos);
                } else {
                    v.shadow.active = false;
                }
            });
        }, this);
        var endFunc = (ev) => {
            var arr = this.node.getChildren();
            var offset=arr[0].offsetY||0;
            var isFall=  !arr.find(v => !v.shadow.active)
            arr.forEach(v => {
                v.offsetY && v.setPosition(v.x, v.y - v.offsetY);
                v.offsetY = 0;
                v.shadow.destroy();
            });
            if (isFall) {
                 cc.audioEngine.playEffect(this.gameScene.effects[5]);
                var testarr = [];
                this.game.addFortune(arr.length, this.game.node.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0,offset))));
                while (arr[0]) {
                    var p = arr[0].shadow.position;
                    var nk = p.x + ',' + p.y;
                    this.cells[nk] = arr[0];
                    var obj = {};
                    obj[nk] = { name: arr[0].name };
                    testarr.push(obj);
                    arr[0].setPosition(p);
                    arr[0].parent = this.board;
                }
                testarr.sort((a, b) => a[Object.keys(a)[0]].name - b[Object.keys(b)[0]].name);
                this.testLink(testarr);

                var haveEmpty = false;
                for (var k in this.cells) {
                    if (!this.cells[k]) {
                        haveEmpty = true;
                        break;
                    }
                }

                if (haveEmpty) {
                    this.generateChess(parseInt(Math.random() * 2) + 1, parseInt(Math.random() * 6) * 60);
                } else {
                    this.gameOver();
                }
            }
            if (ev.touch._point.sub(ev.touch._startPoint).mag() < 10 && arr.length>1) {
                this.rotateChess();
            }
            this.node.setPosition(this.srcPos);
        };
        this.node.on(cc.Node.EventType.TOUCH_END, endFunc);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, endFunc);
    },

    // update (dt) {},
});
