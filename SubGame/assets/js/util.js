module.exports = {
    loadImg: function (url, cb) {
        var image = new Image();
        image.onload = function () {
            try {
                let texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                cb && cb(new cc.SpriteFrame(texture));
            } catch (e) {
                cc.log(e);
                cb && cb(null);
            }
        };
        image.src = url;
    },
    toWeekKey: function (time) {
        var g = new Date(time);
        
         //每周日更新一次
        var day = g.getDay();

        //每周一更新一次
        day = day == 0 ? 7 : day;
        return '' + g.getYear() + g.getMonth() + (g.getDate() - day + 1);
    }
}