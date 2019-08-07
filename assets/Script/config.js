var config = {
    "game": {},
    get signTime() {
        if(!this._signTime){
            this._signTime=JSON.parse(localStorage.getItem("signTime")||"[]");
        }
        return this._signTime;
    },
    set signTime(value) {
        this._signTime=value;
        localStorage.setItem("signTime",JSON.stringify(value));
    },

    get toolNum() {
        if(!this._toolNum){
            this._toolNum=JSON.parse(localStorage.getItem("toolNum")||"[0,0,0,0]");
        }
        return this._toolNum;
    },
    set toolNum(value) {
        this._toolNum=value;
        localStorage.setItem("toolNum",JSON.stringify(value));
    },
    get consumeTip(){
        if(!this._consumeTip){
            this._consumeTip=JSON.parse(localStorage.getItem("consumeTip")||"true");
        }
        return this._consumeTip;
    },
    set consumeTip(value){
        this._consumeTip=value;
        localStorage.setItem("consumeTip",JSON.stringify(value));
    },
    fortune:0,
    version:"1.0.0"
};

module.exports = config;