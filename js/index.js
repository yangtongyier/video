//->String.prototype
~function (pro) {
    //->queryURLParameter:获取URL地址中的参数值以及HASH值
    function queryURLParameter() {
        //->PARAMETER
        var obj = {},
            reg = /([^?=&#]+)=([^?=&#]+)/g;
        this.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });

        //->HASH
        reg = /#([^?=&#]+)/;
        if (reg.test(this)) {
            obj['hash'] = reg.exec(this)[1];
        }
        return obj;
    }

    //->formatTime:按照指定的模板把时间字符串格式化
    function formatTime(template) {
        template = template || '{0}年{1}月{2}日 {3}时{4}分{5}秒'
        var ary = this.match(/\d+/g);
        return template.replace(/\{(\d)\}/g, function () {
            var index = arguments[1],
                content = ary[index];
            content = content || '00';
            return content;
        });
    }

    pro.queryURLParameter = queryURLParameter;
    pro.formatTime = formatTime;
}(String.prototype);

//->REM
~function () {
    var desW = 640,
        winW = document.documentElement.clientWidth || document.body.clientWidth;
    if (winW > desW) {
        document.getElementById('main').style.width = desW + 'px';
        return;
    }
    document.documentElement.style.fontSize = winW / desW * 100 + 'px';
}();

//->HEADER
~function () {
    var $header = $('.header'),
        $menu = $header.find('.menu'),
        $nav = $header.children('.nav');
    $menu.tap(function () {
        if ($(this).attr('isBlock') === 'true') {
            var timer = window.setTimeout(function () {
                $nav.css({
                    padding: 0
                });
                window.clearTimeout(timer);
            }, 300);
            $nav.css({
                height: 0
            });
            $(this).attr('isBlock', false);
            return;
        }
        $nav.css({
            padding: '.1rem 0',
            height: '2.22rem'
        });
        $(this).attr('isBlock', true);
    });
}();

//->MATCH INFO
var matchRender = (function () {
    var $matchInfo = $('.matchInfo'),
        $matchInfoTemplate = $('#matchInfoTemplate');

    //->BIND EVENT
    function bindEvent() {
        var $bottom = $matchInfo.children('.bottom'),
            $bottomLeft = $bottom.children('.home'),
            $bottomRight = $bottom.children('.away');

        //->获取本地存储的信息,判断是否有支持
        var support = localStorage.getItem('support');
        if (support) {
            support = JSON.parse(support);
            if (support.isTap) {
                $bottom.attr('isTap', true);
                support.type == 1 ? $bottomLeft.addClass('bg') : $bottomRight.addClass('bg');
            }
        }

        $matchInfo.tap(function (ev) {
            var tar = ev.target,
                tarTag = tar.tagName,
                tarP = tar.parentNode,
                $tar = $(tar),
                $tarP = $tar.parent(),
                tarInn = $tar.html();

            //->支持操作
            if (tarTag === 'SPAN' && tarP.className === 'bottom' && tar.className !== 'type') {
                if ($bottom.attr('isTap') === 'true') return;

                //->增加背景和数字
                $tar.html(parseFloat(tarInn) + 1).addClass('bg');

                //->重新的计算进度条
                $matchInfo.children('.middle').children('span').css('width', (parseFloat($bottomLeft.html()) / (parseFloat($bottomLeft.html()) + parseFloat($bottomRight.html()))) * 100 + '%');

                //->告诉服务器支持的是谁
                $.ajax({
                    url: 'http://matchweb.sports.qq.com/kbs/teamSupport?mid=100000:1468531&type=' + $tar.attr('type'),
                    dataType: 'jsonp'
                });

                //->只能点击一次
                $bottom.attr('isTap', true);
                localStorage.setItem('support', JSON.stringify({"isTap": true, "type": $tar.attr('type')}));
            }
        });
    }

    //->BIND HTML
    function bindHTML(matchInfo) {
        $matchInfo.html(ejs.render($matchInfoTemplate.html(), {matchInfo: matchInfo}));

        //->控制进度条：定时器是给HTML一定的渲染时间
        window.setTimeout(function () {
            var leftNum = parseFloat(matchInfo.leftSupport),
                rightNum = parseFloat(matchInfo.rightSupport);
            $matchInfo.children('.middle').children('span').css('width', (leftNum / (leftNum + rightNum)) * 100 + '%');
        }, 500);

        //->BIND EVENT
        bindEvent();
    }

    return {
        init: function () {
            //->GET DATA
            $.ajax({
                url: 'http://matchweb.sports.qq.com/html/matchDetail?mid=100000:1468531',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result[0] == 0) {
                        result = result[1];
                        var matchInfo = result['matchInfo'];
                        matchInfo['leftSupport'] = result['leftSupport'];
                        matchInfo['rightSupport'] = result['rightSupport'];

                        //->BIND HTML
                        bindHTML(matchInfo);
                    }
                }
            });
        }
    }
})();
matchRender.init();

//->MATCH LIST
var matchListRender = (function () {
    var $matchList = $('.matchList'),
        $matchListUL = $matchList.children('ul'),
        $matchListTemplate = $('#matchListTemplate');

    function bindHTML(matchList) {
        $matchListUL.html(ejs.render($matchListTemplate.html(), {matchList: matchList})).css('width', parseFloat(document.documentElement.style.fontSize) * 2.4 * matchList.length + 20 + 'px');

        //->实现局部滚动
        new IScroll('.matchList', {
            scrollX: true,
            scrollY: false,
            click: true
        });
    }
    return {
        init: function () {
            $.ajax({
                url: 'http://matchweb.sports.qq.com/html/matchStatV37?mid=100002:2365',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result[0] == 0) {
                        result = result[1]['stats'];
                        var matchList = null;
                        $.each(result, function (index, item) {
                            if (item['type'] == 9) {
                                matchList = item['list'];
                                return false;
                            }
                        });
                        //->BIND HTML
                        bindHTML(matchList);
                    }
                }
            });
        }
    }
})();
matchListRender.init();

//newList
var newList=(function(){
    var $newList=$('.newList'),
        $ulList=$newList.children('ul'),
        $newListTemplate = $('#newListTemplate');
    function bindHTML (newList){
        $ulList.html(ejs.render($newListTemplate.html(),{newList:newList}))
    }
    return{
        init:function(){
            $.ajax({
                url:'http://matchweb.sports.qq.com/html/matchNews?mid=100000%3A1469941',
                dataType:'jsonp',
                success:function(result){
                    if(result&&result.code===0){
                        result=result.data.slice(0,2)
                    }
                    bindHTML(result);
                }
            })
        }
    }
})();
newList.init();