(function ($) {
    "use strict";
    var settings = {};
    $.ajaxSetup({ cache: false });
    var tbl = null;
    var rowCount = 0;
    var methods = {
        init: function (options) {
            settings = $.extend({
                url: null,
                selector: null
            }, options);
            this.data("docsTable", settings);
            makeTable(this);
        },
        refresh: function () {
            makeTable(this);
            
        },
        show: function () {
            $(this).show('slow');
        },
        hide: function () {
            $(this).hide('slow');
        },
        makeBody: function() {
            createBody(this);
        }

    };
    $.fn.docsTable = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод ' + method + ' не существует в jQuery.docsTable');
        }
    };

    function makeTable(inst) {
        var sett = inst.data("docsTable");
        tbl = $('<table>').addClass('table-bordered').attr('id','fixTable').appendTo(inst);
        $('<caption>Прилагаемые документы(размером не более 10МБ каждый)</caption>').appendTo(tbl);
        var thead = $('<thead>').appendTo(tbl);
        var tr = $('<tr>').appendTo(thead);
        $('<th>№</th>').appendTo(tr);
        $('<th>Наименование документа</th>').appendTo(tr);
        $('<th>Файл</th>').appendTo(tr);
        $('<th>Действие</th>').appendTo(tr);
        $(inst).hide();
    }
    function createBody(inst) {
        var tbody = $('<tbody>').appendTo(tbl);
        $.ajax({
            type: "GET",
            headers: {
                'Cache-Control': 'no-cache no-store'
            },
            url: settings.url + "?t=" + (new Date()).getTime(),
            cashe: false,
            success: function (data) {
                rowCount = data.length;
                for(var i = 0; i < data.length; i++){
                    var tr = $('<tr>').appendTo(tbody);
                    $('<td>' + data[i].OrderNmb + '</td>').appendTo(tr);
                    $('<td>' + data[i].Text + '</td>').appendTo(tr);
                    $('<td></td>').appendTo(tr);
                    var td = $('<td>').appendTo(tr);
                    $('<input type="file" name="fileUpload[' + i + ']" id="fileinput_' + data[i].OrderNmb + '" accept=".pdf,.doc,.docx"/>').appendTo(td);
                }
                $(settings.selector).show();
                initEvent($(inst));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Ошибка чтения списка документов. url:" + sett.url + " Статус -  " + XMLHttpRequest.status + " Техт: " + XMLHttpRequest.responseText);
            }
        });
    }
    function initEvent(container) {
        $('input[type=file]').on('change', function (event) {
            var fileName = this.files[0].name;
            $(this).parent().prev().html(fileName);
            var count = 0;
            $('table tbody tr').each(function (indx, elem) {
                var t = $.trim($(this).find('td:eq(2)').html());
                if(t.length>0){
                    count++;

                }
            });
            if (count === rowCount)
                $('#SubmitMultiply').removeAttr('hidden');//show('slow');
        });
    }
})(jQuery);