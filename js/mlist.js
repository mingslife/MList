(function() {
    "use strict";

    function MList(params) {
        return new MListObject(params);
    }
    function MListObject(params) {
        this.params = {
            elementId: params.elementId || null, // 列表元素ID
            itemId: params.itemId || null, // 列表项ID，用于唯一标识列表项
            // listId: params.listId || null, // 列表ID，用于指定列表创建的位置
            // pageId: params.pageId || null, // 分页ID，用于指定分页创建的位置
            // searchId: params.searchId || null, // 搜索ID，用于指定对应的搜索位置
            query: params.query || null, // 后台查询数据的请求URL
            queryType: params.queryType || "GET", // 后台查询数据的请求类型
            // count: params.count || null, // 后台查询数据条数的方法
            // summarize: params.summarize || null, // 后台数据汇总的方法
            condition: params.condition || null, // 查询条件
            items: params.items || null, // 列表项概要
            details: params.details || null, // 列表项详情
            action: params.action || null, // 点击列表项调用的函数名
            showNumber: params.showNumber || false, // 是否展示序号
            showArrow: params.showArrow || false, // 是否展示箭头
            longClick: params.longClick || false, // 是否响应长按事件
            longClickMenu: params.longClickMenu || null, // 长按事件菜单
            buttons: params.buttons || null, // 详情中附加的操作按钮
            imgSrc: params.imgSrc || null, // 列表图片
            icon: params.icon || null, // 列表图标
            className: params.className || null // 列表class
        };
        this.element = $("#" + this.params.elementId);
        this.element.addClass("list-group mlist-list");
    }
    MListObject.prototype.query = function() {
        var params = this.params;
        var elementId = params.elementId;
        var element = this.element;
        $.ajax({
            url: params.query,
            type: params.queryType,
            data: params.condition,
            dataType: "json",
            success: function(datas) {
                mlistsDatas[elementId] = datas;
                console.info(datas);
                var datasHtml = '';
                for (var indexOfDatas = 0, lengthOfDatas = datas.length; indexOfDatas < lengthOfDatas; indexOfDatas++) {
                    var data = datas[indexOfDatas];
                    var toggleJs = "$('#" + elementId + "').MList('toggle'," + indexOfDatas + ")";
                    var dataHtml = '<a class="list-group-item ';
                    if (params["className"]) dataHtml += params.className + " ";
                    dataHtml += 'mlist-item" href="javascript:' + toggleJs + ';"';
                    if (params["itemId"]) dataHtml += ' item-id="' + data[params["itemId"]] + '"';
                    if (params["action"] && typeof params.action === "function") {
                        var actionJs = "$('#" + elementId + "').MList('click'," + indexOfDatas + ")";
                        dataHtml += ' onclick="' + actionJs + '"';
                    }
                    dataHtml += '>';
                    if (params["showNumber"]) dataHtml += '<span>' + (indexOfDatas + 1) + '</span> ';
                    if (params["imgSrc"]) dataHtml += '<img src="' + params.imgSrc + '" /> ';
                    if (params["icon"]) dataHtml += '<span class="' + params.icon + '"></span> ';
                    dataHtml += getItemHtml(params["items"], data);
                    if (params["showArrow"]) dataHtml += '<span class="pull-right">&gt;</span>';
                    dataHtml += '</a>';

                    dataHtml += '<div class="list-group mlist-details" style="display:none;">';
                    dataHtml += getDetailHtml(params["details"], data);
                    dataHtml += getButtonHtml(params["buttons"], elementId, indexOfDatas);
                    dataHtml += '</div>';

                    datasHtml += dataHtml;
                }
                console.info(datasHtml);

                element.html(datasHtml);
            }
        });
        console.info(this.params.query);
    };
    MListObject.prototype.toggle = function(index) {
        var element = this.element;
        element.find(".mlist-details").eq(index).slideToggle();
    };
    MListObject.prototype.click = function(index) {
        var params = this.params;
        var element = this.element;
        var item = element.find(".mlist-item").eq(index);
        var elementId = params.elementId;
        var datas = mlistsDatas[elementId];
        var data = datas[index];
        var itemId = params["itemId"] ? data[params.itemId] : null;
        params.action(itemId, data, item);
    };
    MListObject.prototype.operate = function(param) {
        var index = param[0];
        var indexOfButtons = param[1];
        var params = this.params;
        var element = this.element;
        var item = element.find(".mlist-item").eq(index);
        var elementId = params.elementId;
        var datas = mlistsDatas[elementId];
        var data = datas[index];
        var itemId = params["itemId"] ? data[params.itemId] : null;
        params.buttons[indexOfButtons].action(itemId, data, item);
    };
    function getItemHtml(items, data) {
        var html = '<span>';
        for (var indexOfItems = 0, lengthOfItems = items.length; indexOfItems < lengthOfItems; indexOfItems++) {
            var item = items[indexOfItems];
            var itemKey = item["index"];
            var itemHtml = '<span>';
            itemHtml += format(item["formatter"], data[itemKey], data);
            itemHtml += '</span> ';
            html += itemHtml;
        }
        html += '</span>';
        return html;
    }
    function getDetailHtml(details, data) {
        var html = '';
        for (var indexOfDetails = 0, lengthOfDetails = details.length; indexOfDetails < lengthOfDetails; indexOfDetails++) {
            var detail = details[indexOfDetails];
            var detailKey = detail["index"];
            var detailHtml = '<a class="list-group-item">';

            var detailData = format(detail["formatter"], data[detailKey], data);

            var detailName = detail["name"];
            if (!detailName) detailName = detailKey;
            detailHtml += detailName + ': ' + detailData;
            detailHtml += '</a>';
            html += detailHtml;
        }
        html += '';
        return html;
    }
    function getButtonHtml(buttons, elementId, index) {
        var html = '';
        for (var indexOfButtons = 0, lengthOfButtons = buttons.length; indexOfButtons < lengthOfButtons; indexOfButtons++) {
            var button = buttons[indexOfButtons];
            var buttonJs = "$('#" + elementId + "').MList('operate',[" + index + "," + indexOfButtons + "])";
            var buttonClass = "btn btn-default btn-block" + (button["className"] ? " " + button["className"] : "");
            html += '<a class="list-group-item"><button class="' + buttonClass + '" onclick="' + buttonJs + '">' + button["name"] + '</button></a>';
        }
        return html;
    }
    function format(formatter, item, row) {
        if (formatter && typeof formatter === "function")
            return formatter(item, row);
        else
            return item;
    }
    MList.version = "1.0";
    window.MList = MList;
    var mlists = {};
    var mlistsDatas = {};
    $.fn.MList = function(params, extra) {
        var id = $(this).attr("id");
        if (params) {
            var typeOfParams = typeof params;
            if (typeOfParams === "object") {
                params.elementId = id;
                var mlist = new MList(params);
                mlists[id] = mlist;
                return mlist;
            } else if (typeOfParams === "string") {
                var mlist = mlists[id];
                mlist[params](extra);
                return mlist;
            } else {
                return mlists[id];
            }
        } else {
            return mlists[id];
        }
    };
})(window.jQuery);

var mlist = $("#list").MList({
    query: "data.json",
    // imgSrc: "imgSrc",
    itemId: "id",
    items: [{
        index: "name"
    }, {
        index: "sex",
        formatter: function(value, row) {
            return value === 0 ? "male" : "female";
        }
    }],
    details: [{
        index: "name",
        name: "Name"
    }, {
        index: "sex",
        name: "Sex",
        formatter: function(value, row) {
            return value === 1 ? "male" : "female";
        }
    }, {
        index: "intro",
        name: "Introduce"
    }],
    icon: "glyphicon glyphicon-user",
    className: "list-group-item-info",
    showNumber: true,
    showArrow: true,
    action: function(id, row, element) {
        console.info("You click the button whose id is " + id);
        element.hasClass("active") ? element.removeClass("active") : element.addClass("active");
    },
    buttons: [{
        name: "test1",
        action: function(id, row, element) {
            alert("You click the button whose id is " + id);
        }
    }, {
        name: "test2",
        action: function(id, row, element) {},
        className: "btn-danger"
    }]
});
mlist.query();