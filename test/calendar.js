/**
 * 日历插件，可正常按月显示日历，可设置可选择日期范围
 * @author vnj
 * @editor 2015-04-20
 */
define(function(require, exports, module){
    var $ = require('zepto');

    function Calendar(options) {
        this._init(options);
    }

    var fn = {
        /**
         * 页面初始化
         * @return {[type]} [description]
         */
        _init: function(options) {
            this.settings = extend(config, options);

            // 可选择日期范围
            this.canBeSelected =  this._canBeSelected();
            // 生成日历
            this._showCalendar();
            // 绑定事件
            this._bindEvent();
        },

        /**
         * 生成日历
         * @return {[type]} [description]
         */
        _showCalendar: function() {
            var render = [];
            // 计算当前年月日
            var curDate = this.curDate = new Date();
            // 循环生成日历
            for(var i = 0; i < this.settings.display; i ++) {
                render.push(this._render(curDate.getFullYear(), curDate.getMonth() + i));
            }

            $(this.settings.el).append('<div class="tn-container">'+render.join('')+'</div>');
        },

        /**
         * 日历的主体函数
         * @param  {[type]} y [description]
         * @param  {[type]} m [description]
         * @return {[type]}   [description]
         */
        _render: function(y, m) {
            // 日历头部
            var thead = ['<div class="tn-item-container"><div class="tn-c-header"><span class="tn-c-title">', '', '</span></div>'];
            var ths = ['<div class="tn-c-body"><table>', '<tr class="tn-c-week">', '<th>日</th>', '<th>一</th>', '<th>二</th>', '<th>三</th>', '<th>四</th>', '<th>五</th>', '<th>六</th>', '</tr>'];

            // 日历头部
            var cbody = this._getTds(y ,m);
            thead[1] = cbody.thead;
            ths = ths.concat(cbody.trs);

            // 闭合标签
            ths.push('</table></div></div>');

            return thead.concat(ths).join('');
        },

        /**
         * 日历主体函数
         * @param  {[type]} y [description]
         * @param  {[type]} m [description]
         * @return {[type]}   [description]
         */
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
            var iday, curday,
                curDate = this.curDate,
                dateArea = this.canBeSelected,
                stop = false;
            for(var i = 1; i <= 42; i++) {
                iday = i - fday;
                curday = ayear + '-' + (amonth < 9 ? '0' : '') + ( amonth + 1 ) + '-' + (iday <= 9 ? '0' : '') + iday;
                if(i > fday && i <= (aday + fday)) {
                    // 当前日期
                    if(iday === curDate.getDate() && ayear === curDate.getFullYear() && amonth == curDate.getMonth()) {
                        // 是否在可选择范围内
                        if(dateArea.length && dateArea.indexOf(curday) == -1) {
                            tds.push('<td class="today disabled" data-date="'+curday +'">今天</td>');
                        } else {
                            tds.push('<td class="today" data-date="'+curday +'">今天</td>');
                        }
                        // 过去的日期
                    } else if(dateExtend.compare(curDate, curday) > 0 || (dateArea.length && dateArea.indexOf(curday) == -1)) {
                        tds.push('<td class="disabled" data-date="'+curday +'">'+ iday +'</td>');
                    } else {
                        // 是否设置了可选日期
                        tds.push('<td data-date="'+curday+'">'+ iday +'</td>');
                    }
                } else if(!stop){
                    tds.push('<td></td>');
                }

                if( i % 7 === 0 && !stop) {
                    tds.push('</tr>');
                    trs = trs.concat(tds);

                    // 大于的日期不再换行
                    if(i >= (aday + fday)) {
                        stop = true;
                    }
                    !stop && (tds = ['<tr>']);
                }
            }

            // 设置头部
            var months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
            var thead = months[amonth] + '月&nbsp;&nbsp;&nbsp;&nbsp;' + ayear;

            return {
                trs: trs,
                thead: thead
            };
        },

        /**
         * 获取可选择日期，‘，’分割表示单个日期，‘~’分割表示日期段
         * @return {[type]} [description]
         */
        _canBeSelected: function() {
            var canSelsArr = [],
                canBeSels = this.settings.canBeSelected;

            if(!canBeSels) {
                return canSelsArr;
            }

            canSelsArr = canBeSels.split(',');
            // 分割符
            var splitStr = this.settings.splitStr;
            canSelsArr.forEach(function(item, i) {
                var area = item.split(splitStr);
                if(area.length == 1) {
                    return;
                }
                var min = area[0],
                    max = area[1];

                // 交换最大日期和最小日期
                if(dateExtend.compare(min, max) > 0) {
                    min = area[1];
                    max = area[0];
                }

                var tem = new Date(min);
                while(dateExtend.compare(tem, max) <= 0) {
                    var fmtDate = dateExtend.format(tem, 'YYYY-MM-DD');
                    canSelsArr.indexOf(fmtDate) === -1 && canSelsArr.push(fmtDate);
                    tem = dateExtend.add(tem, 1);
                }

                // 删除当前值
                canSelsArr.splice(i, 1);
            });

            return canSelsArr;
        },

        /**
         * 绑定选择事件
         * @return {[type]} [description]
         */
        _bindEvent: function() {
            var _this = this;
            var el = $(this.settings.el),
                type = this.settings.type,
                dateArea = parseInt(this.settings.dateArea, 10);

            var tds = el.find('td');
            tds.off('click').on('click', function(e) {
                var node = $(e.target),
                    date = node.attr('data-date');

                if(node.hasClass('disabled')) {
                    return;
                }

                // 去除selected属性
                // 单个日历选择
                if(type == 'single') {
                    el.find('.selected').removeClass('selected');
                    // 选择往返日历
                } else if(type == 'multiple') {
                    // 比较两个选中的日期
                    var selected = _this._getSelectedDate();
                    var days = dateExtend.compare(date, selected)/24/60/60/1000;

                    // 最多可选择多少天
                    if(selected.length >= 2 || (selected.length == 1 && (days > dateArea || days < 0))) {
                        // 去掉提示语
                        el.find('.selected').find('p').remove();

                        el.find('.selected').removeClass('selected');
                    }

                    el.find('.beselected').removeClass('beselected');
                }

                // 增加selected属性
                $(this).addClass('selected');

                // 特殊滴，往返日历的中间日期样式
                var beSelected = _this._getSelectedDate();
                if(type == 'multiple' && beSelected.length == 2) {
                    var arr = [];
                    var min = beSelected[0],
                        max = beSelected[1];

                    var tem = new Date(min);
                    while(dateExtend.compare(tem, max) < 0) {
                        tem = dateExtend.add(tem, 1);
                        var fmtDate = dateExtend.format(tem, 'YYYY-MM-DD');
                        arr.push(fmtDate);
                    }

                    arr.forEach(function(item) {
                        el.find('[data-date="'+item+'"]').not('.disabled').not('.selected').addClass('beselected');
                    });
                }

                // 选择后对该节点的底部居中显示内容
                var bc = _this.settings.bottom_center;
                if(bc && typeof bc == 'function') {
                    bc = bc.call(_this, e);
                }
                $(node).append(bc ? '<p>'+bc+'</p>' : '');

                // 回调函数
                var callback = _this.settings.callback;
                if(callback && typeof callback == 'function') {
                    callback.call(_this, e);
                }
            });
        },
        /**
         * 获取被选中的日期
         * @return {[type]} [description]
         */
        _getSelectedDate: function() {
            // 获取被选中的节点
            var el = $(this.settings.el),
                selNodes = el.find('.selected');

            var arr = [];
            selNodes.each(function(i, item) {
                arr.push($(item).attr('data-date'));
            });

            return arr;
        },
        /**
         * 外部方法，获取已选中的日期
         * @return {[type]} [description]
         */
        getSelectedDate: function() {
            var type = this.settings.type,
                dates = this._getSelectedDate();

            if(type == 'single') {
                return dates[0];
            } else {
                return dates;
            }
        },
        /**
         * 外部方法，设置已选中日期，以','分割
         */
        setSelectedDate: function(dates) {
            var type = this.settings.type,
                el = $(this.settings.el);

            var datesArr = dates.split(',');
            datesArr.forEach(function(item, i) {
                el.find('[data-date="'+item+'"]').click();
            });

            return this;
        },
        /**
         * 价格日历
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        load: function(data) {
            var el = $(this.settings.el);
            if(!data) {
                return;
            }

            data.forEach(function(item, i) {
                if(!$('td[data-date="'+item.date+'"]', el).hasClass('disabled')) {
                    $('td[data-date="'+item.date+'"]', el).append('<p class="price">'+item.price+'</p>');
                }
            });
        }
    };

    /**
     * 合并方法
     * @return {[type]} [description]
     */
    var extend = function(dest, src) {
        if(dest && typeof dest == 'object' &&  src && typeof src == 'object') {
            for(var i in src) {
                if(src[i]) {
                    dest[i] = src[i];
                }
            }
        }

        return dest;
    };
    // 放在函数外，只需初始化执行即可
    extend(Calendar.prototype, fn);

    /**
     * 默认配置
     * @type {Object}
     */
    var config = {
        display: 1, // 展示多少个月的日历
        canBeSelected: '', // 设置可选择日期范围
        type: 'single', // 日历类型
        callback: function() {}, // 选择日期后的回调函数
        el: document.body, // 渲染节点
        splitStr: '~', // 日历分割符
        bottom_center: function() {
            if(this.settings.type == 'multiple') {
                if(this._getSelectedDate().length == 1) {
                    return '出发';
                } else {
                    return '离开';
                }
            } else {
                return '';
            }
        }, // 往返日历时的特殊处理
        dateArea: 29 // 往返日历最多可选天数
    };

    var dateExtend = {};
    /**
     * 增加或减少多少天
     * @param int day 负数表示－多少天，正数表示＋多少天
     */
    dateExtend.add = function(date, day) {
        return new Date(+new Date(date) + (parseInt(day, 10) || 0)*24*60*60*1000);
    };

    /**
     * 格式化日期
     * @param  {[type]} format  YYYY-MM-DD hh:mm:ss
     * @return {[type]}        [description]
     */
    dateExtend.format = function(date, fmt) {
        date = new Date(date);
        var o = {
            "M+": date.getMonth() + 1, //月份
            "D+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(Y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }

        return fmt;
    };

    /**
     * 比较两个日期的大小
     * @param  {[type]} odate 被比较的日期
     * @return {[type]}       相差的豪秒数
     */
    dateExtend.compare = function(date, odate) {
        return +new Date(date) - (+new Date(odate) || 0);
    };

    module.exports = Calendar;
});