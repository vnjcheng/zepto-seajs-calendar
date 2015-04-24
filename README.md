# zepto-seajs-calendar
seajs模块的日历控件

主要实现：
<pre>
    _getTds: function(y, m) {
        // 日历主体部分
        var date = new Date(y, m, 1);
        // 获取当月第一天星期几
        var fday = date.getDay();
        date = new Date(y, m + 1, 0);
        // 获取当月的天数
        var aday = date.getDate(),
            ayear = date.getFullYear(),
            amonth = date.getMonth();

        var tds = ['<tr>'],
            trs = [];
        // 计算当前多少日
        var iday, curday;
        // 最多6行42个单元格
        for(var i = 1; i <= 42; i++) {
            iday = i - fday;
            // 当月日期内展示数据
            if(i > fday && i <= (aday + fday)) {
                tds.push('<td data-date="'+curday+'">'+ iday +'</td>');
            // 否则输出空的单元格
            } else if(!stop){
                tds.push('<td></td>');
            }

            if( i % 7 === 0 && !stop) {
                tds.push('</tr>');
                trs = trs.concat(tds);

                tds = ['<tr>'];
            }
        }
    }
</pre>
