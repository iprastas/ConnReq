/*
*slistbox - Client-side control
*Version 1.3.2
*@требует jQuery v1.8.2 и старше
* bootstrap v3.*
*/
(function ($) {
    "use strict";
    var settings = {};
    $.ajaxSetup({ cache: false });

    var methods = {
        init: function (options) {
            settings = $.extend(true, {}, {
                url: null,
                async: true,
                multiple: false,
                size: 5
            }, options);
            $(this).data("slistbox", settings);
            var $this = this;
            readData(this.data("slistbox").url, this.data("slistbox").async).then(function (data) {
                makeList($this,data);
            });
        },
        refresh: function () {
            var $this = this;
            readData(this.data("slistbox").url).then(function (data) {
                refreshList($this,data);
            });
        },
        getSelected: function () {
            var arr = new Array();
            $('option:selected', $(this)).each(function () {
                arr.push($(this).val());
            });
            return arr;
        },
        setSelect: function (vl) {
            $('option:selected', $(this)).removeAttr('selected');
            $('option', $(this)).each(function (indx,elm) {
                if ($(elm).val() === vl)
                    $(elm).attr('selected', 'selected');
            });
        },
        getSelectedText: function () {
            var sel = $('option:selected', $(this));
            if (sel === null || sel === undefined) return "";
            else return sel.html();
        },
        hide: function (duration) {
            $(this).hide(duration);
            if (this.data("slistbox").multiple === true) {
                $("i", $(this)).hide(duration);
            }
        },
        show: function (duration) {
            $(this).show(duration);
            if (this.data("slistbox").multiple === true) {
                $("i", $(this)).show(duration);
            }
        }
    };
    $.fn.slistbox = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод ' + method + ' не существует в jQuery.slistbox');
        }
    };
    function makeList(inst,dt) {
        var sett = $(inst).data("slistbox");
        if (sett === null || sett === undefined) return;
        var sel = $('<select>', $(inst)).appendTo(inst);
        if (dt.length === 0) {
            $(inst).hide();
            return;
        }
        for (var i = 0; i < dt.length; i++) {
            var opt = $('<option>').attr('value', dt[i].Value).html(dt[i].Text).appendTo(sel);
            if (dt[i].Selected === true) opt.prop('selected', 'selected');
            if (dt[i].Enabled === false) opt.prop('disabled', "disabled");
        }
        if (sett.autofocus === true) {
            sel.prop('autofocus', 'autofocus');
        }
        $(inst).show();
        if (sett.multiple === true) {
            var position = sel.position().top + sel.height() - 8;
            sel.prop('multiple', true).prop('size', sett.size);
            var div = $('<div style="display: block;">').appendTo(inst);
            $('<i>').appendTo(div).addClass("fa fa-check-circle")
                .prop('title', 'Выбрать все')
                .css("top", -position)
                .on('click', function () {
                    $("select > option", $(inst)).prop("selected", "selected")
                        .parent()
                        .trigger('focus');
                });
            $('<i style="padding-left: 10px;">').appendTo(div).addClass("fa fa-times-circle")
                .prop('title', 'Сбросить все')
                .css("top", -position)
                .on('click', function () {
                    $("select > option", $(inst)).prop('selected', '')
                        .parent()
                        .trigger('focus');//.focus();
                });
        }
    }
    function refreshList(inst, data) {
        if (data.length === 0) {
            $(inst).slistbox("hide", "fast");
            return;
        }
        var m = $(inst).data('slistbox')["multiple"];
        $(inst).slistbox("show", "fast");
        if ($('option', $(inst)).length >= data.length) {
            $('option', $(inst)).each(function (indx, elem) {
                if (indx >= data.length)
                    $(elem).hide();
                else {
                    $(elem).attr('value', data[indx].Value).html(data[indx].Text);
                    if ($(elem).is(':hidden')) $(elem).show();
                    setOptionProp($(elem), data[indx]);
                }
            });
        }
        else {
            $('option', $(inst)).each(function (indx, elem) {
                if (indx < data.length) {
                    $(elem).attr('value', data[indx].Value).html(data[indx].Text);
                    if ($(elem).is(':hidden')) $(elem).show();
                    setOptionProp($(elem), data[indx]);
                }
            });
            var sel = $('select', $(inst));
            if(m) sel.attr('multiple','multiple');
            for (var i = $('option', $(inst)).length; i < data.length; i++) {
                var opt = $('<option>').attr('value', data[i].Value).html(data[i].Text).appendTo(sel);
                if (data[i].Selected === true) opt.prop('selected', "selected");
                if (data[i].Enabled === false) opt.prop('disabled', "disabled");
            }
        }
     }
    function setOptionProp(elem,data) {
        if (data.Selected === true) elem.prop('selected', "selected");
        else elem.prop('selected', '');
        if (data.Enabled === false) elem.prop('disabled', "disabled");
        else elem.prop('disabled', '');
    }
    function readData(url,async) {
        return $.ajax({
            async: async,
            type: "GET",
            headers: {
                'Cache-Control': 'no-cache no-store'
            },
            url: url,
            cashe: false,
            error: function (XMLHttpRequest) {
                alert("Ошибка чтения. url:" + url + " Статус -  " + XMLHttpRequest.statusText);
            }
        });
    }
})(jQuery);
