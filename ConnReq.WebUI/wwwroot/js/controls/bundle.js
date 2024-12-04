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
/*
 * jQuery sgrid Plugin 1.4.1
 * @требует jQuery v1.8.2 и старше
 * требует Bootstrap v4 fontavesom 4.7  и старше
 */
(function ($) {
    "use strict";
    var idForm = '';
    var startForm = null;
    var max_recursive_calls = 10000;
    var headerNames = [];
    var filterColumn = '';
    var browserIE = false;
    var varRowForm = false;
    var requestParamStr = '';
    const CellType = Object.freeze({
        Empty: 0,
        Number: 1,
        Text: 2,
        Date: 3,
        DateTime: 4,
        Integer: 5,
        IntRange: 6,
        Boolean: 7,
        CLob: 8,
        BLob: 9,
        SelectList: 10,
        Button: 11,
        Tree: 12
    });
    const CellMode = Object.freeze({
        Disable: 0,
        Input: 1,
        Calculate: 2,
        History: 3,
        InputRO: 4,
        HistoryRO: 5,
        Header: 6,
        Error: 7,
        OutRef: 8,
        Cumulative: 9
    });

    var methods = {
        initGrid: function (options) {
            var settings = $.extend({}, {
                geturl: null,
                posturl: null,
                getImgUrl: null,
                cellsDataUrl: null,
                saveBlobUrl: null,
                getBlobUrl: null,
                showAlert: false,
                decimalDelimiter: ',',
                dateDelimiter: '.',
                formMode: 'Input',
                readOnly: false,
                root: '',
                hasTreeColumn: false,
                expanderTemplate: '<span class="sgrid-expander"></span>',
                indentTemplate: '<span class="sgrid-indent"></span>',
                expanderExpandedClass: 'fa fa-minus-circle',
                expanderCollapsedClass: 'fa fa-plus-circle',
                modalRowEdit: false,
                nameRow4Modal: null,
                nameCol4Modal: null,
                filterColumns: null,
                formId: 0
            }, options);
            return this.each(function () {
                var $this = $(this);
                $this.sgrid('setGridContainer', $(this));
                $this.sgrid('setSettings', settings);
                startForm = settings.formId;
                $this.sgrid('setForm', 0,0,0);
                $this.sgrid('createProgressBar', $(this));
                if (settings.modalRowEdit === "true")
                    $this.sgrid('createModalEdit', $(this));
                if (settings.filterColumns !== null && settings.filterColumns.length > 0)
                    $this.sgrid('createFilterDialog', $(this));
                browserIE = $this.sgrid('detectIE');
            });
        },
        detectIE: function () {
            var ua = window.navigator.userAgent;

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                //return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                return true;
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                //var rv = ua.indexOf('rv:');
                //return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                return true;
            }
            return false;
        },
        /* Set sgrid container @param {HtmlElement} container */
        setGridContainer: function (container) {
            return $(this).data('sgrid', container);
        },
        /* Return sgrid container @returns {HtmlElement}  */
        getGridContainer: function () {
            return $(this).data('sgrid');
        },
        /* Method return setting by name*/
        getSettings: function (name) {
            if (!$(this).sgrid('getGridContainer')) {
                return null;
            }
            return $(this).sgrid('getGridContainer').data('settings')[name];
        },
        /* Add new settings @param {Object} settings */
        setSettings: function (settings) {
            $(this).sgrid('getGridContainer').data('settings', settings);
        },
        /*set option "name" to value */
        changeSetting: function (name, value) {
            $(this).sgrid('getGridContainer').data('settings')[name] = value;
        },
        /*Method create bootstrap progressBar dialog @param {HtmlElement} container */
        createProgressBar: function (container) {
            var dlg = $('<div class="modal fade in" id="mod-progress" role="dialog">').appendTo($(container));
            var obj = $('<div>').addClass('modal-dialog').appendTo(dlg);//.css('height','120px');
            var cont = $('<div>').addClass('modal-content').appendTo(obj).css('height', '180px');
            var body = $('<div>').addClass('modal-body').appendTo(cont).css('max-height','180px');
            obj = $('<div>').addClass('text-center').appendTo(body);
            obj = $('<div id="result" style="font-size: 1.1em; padding-bottom: 5px">').appendTo(obj);
            $('<p id="progressBarParagraph">').appendTo(obj);
            obj = $('<div id="ProgressStripe" class="progress progress-striped active" style="position:relative; top:10px; width:100%;">').insertAfter(obj);
            $('<div id="ProgressMessage" class="progress-bar progress-bar-info" style="width: 100%; border:none;"></div>').appendTo(obj);
            var ft = $('<div class="modal-footer">').html('Остановить процесс - Esc').appendTo(cont);
            $('<button id="progress-close" type="button" class="btn btn-secondary" data-dismiss="modal" hidden="hidden">').appendTo(ft).html("Закрыть");
         },
        /* Method create modal row editor @param {HtmlElement} container */
        createModalEdit: function (container) {
            var dlg = $('<div class="modal fade" id="ModalEdit" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true">')
                .appendTo(container);
            var obj = $('<div class="modal-dialog" max-height:100%;  margin-top: 50px; margin-bottom:50px;">')
                .appendTo(dlg);
            var cont = $('<div class="modal-content">').appendTo(obj);
            var header = $('<div class="modal-header">').appendTo(cont);
            var closeBtn = $('<button type="button" class="close" data-dismiss="modal">').appendTo(header);
            $('<span aria-hidden="true">&times;</span>').appendTo(closeBtn);
            $('<span class="sr-only">Close</span>').appendTo(closeBtn);
            $('<h4 class="modal-title" id="ModalLabel">Modal title</h4>').appendTo(header);
            var body = $('<div class="modal-body">').appendTo(cont);
            var form = $('<form class="form-horizontal" role="form">').appendTo(body);
            var footer = $('<div class="modal-footer">').appendTo(cont);
            //$('<button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button >').appendTo(footer);
            $('<button type="button" class="btn btn-primary" id="dlgBtnSave">Закрыть</button>').appendTo(footer);

        },
        /* Method create labels and fields @param {row} of grid    */
        initModalRowEdit: function (row,label) {
            var dlg = $('#ModalEdit');
            //var obj = dlg.find('div.form-horizontal');
            var mbody = dlg.find('div.modal-body');
            mbody.children().remove();
            $('#ModalLabel').text(label);
            row.children().each(function (indx, elem) {
                if ($(elem).hasClass('cell_input')===true) {
                    var f = $('<form class="form-horizontal" role="form">').appendTo(mbody);
                    var fg = $('<div class="form-group">').appendTo(f);
                    $('<label  class="col-md-6 control-label">' + headerNames[indx] + '</label>').appendTo(fg);
                    var dv = $('<div class="col-md-6">').appendTo(fg);
                    $(elem).find('input:enabled , select:enabled , textarea:enabled').clone(true).appendTo(dv);
                }
            });
            dlg.modal('show');
        },
        /*Method create modal filter dialog @param {HtmlElement} container */
        createFilterDialog: function (container) {
            var dlg = $('<div class="modal fade" id="FilterDlg" tabindex="-1" role="dialog" aria-labelledby="FilterDlgLabel" aria-hidden="true">')
                .appendTo(container);
            var obj = $('<div class="modal-dialog" max-height:100%;  margin-top: 50px; margin-bottom:50px;">')
                .appendTo(dlg);
            var cont = $('<div class="modal-content">').appendTo(obj);
            var header = $('<div class="modal-header">').appendTo(cont);
            var closeBtn = $('<button type="button" class="close" data-dismiss="modal">').appendTo(header);
            $('<span aria-hidden="true">&times;</span>').appendTo(closeBtn);
            $('<span class="sr-only">Close</span>').appendTo(closeBtn);
            $('<h4 class="modal-title" id="FilterDlgLabel"></h4>').appendTo(header);
            var body = $('<div class="modal-body">').appendTo(cont);
            var form = $('<form class="form-horizontal" role="form">').appendTo(body);
            var fg = $('<div class="form-group">', '#FilterDlg').appendTo(form);
            $('<label  class="col-md-6 control-label">Выберите из списка</label>').appendTo(fg);
            var dv = $('<div class="col-md-6">', '#FilterDlg').appendTo(fg);
            var sel = $('<select id="filterSelect"></select>').appendTo(dv);
            var footer = $('<div class="modal-footer">').appendTo(cont);
            $('<button type="button" class="btn btn-primary" id="dlgBtnFilter" data-dismiss="modal">Фильтровать</button>').appendTo(footer);
        },
        initFilterDialog: function (column, title) {
            var arr = [];
            filterColumn = column;
            $('td[id*=_' + column + ']').each(function (val) {
                arr.push(this.innerText);
            });
            var unq = unique(arr);
            $('#FilterDlgLabel').text(title);
            var sel = $('#filterSelect', '#FilterDlg');
            sel.children().remove();
            $('<option>').attr('value', '').text('').appendTo(sel);
            for (var i = 0; i < unq.length; i++) {
                $('<option>').attr('value', unq[i]).text(unq[i]).appendTo(sel);
            }
            $('#FilterDlg').modal('show');
        },
        /*show all hidden row */
        showAll: function () {
            $('tr:hidden', this).show();
        },
        /*показывать только строки содержащие val в колонке filterColumn  */
        showOnly: function (val) {
            $('td[id*=_' + filterColumn + ']').each(function () {
                if (this.innerText === val) $(this).parent('tr').show();
                else $(this).parent('tr').hide();
            });
        },
        /* Save form ID */
        setIdForm: function (id) { idForm = id; },
        /* get ID current form  */
        getIdForm: function () { return idForm; },
        setParams: function (paramStr) {
            requestParamStr = paramStr;
        },
        /* Get started form ID */
        getStartFormId: function () { return startForm; },
        /* Create form */
        setForm: function (id,row,col) {
             var $this = $(this);
            $this.sgrid('clearForm');
            $this.sgrid('setIdForm', id);
            let geturl = $this.sgrid('getSettings', 'root') + $this.sgrid('getSettings', 'geturl');
            if (requestParamStr.length > 0)
                geturl += requestParamStr;
             return $.ajax({
                async: true,
                type: "GET",
                //data: 'id=' + id + '&r=' + row + '&c=' + col,
                cache: false,
                url: geturl,
                success: function (formData) {
                    var readOnly = $this.sgrid('getSettings', 'readOnly');
                    if (formData.VarRowCount) varRowForm = true;
                    else varRowForm = false;
                    makeHeader(formData, $this);
                    if (readOnly === true) {
                        createRoGrid(formData, $this);
                    }
                    else {
                        createGrid(formData, $this);
                        makeTail($this);
                    }

                    initHistoryEvent($this);
                    $this.trigger('formReady.sgrid');
                    $this.sgrid('setPencil');
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $this.trigger('formReady.sgrid');
                    alert("Ошибка чтения данных setForm. Статус -  " + XMLHttpRequest.status );
                }
            });
        },
        getCurrentFormData: function () {
            return fData;
        },
        /* Clear form container */
        clearForm: function () {
            var container = $(this).sgrid('getGridContainer');
            $(container).find('div.sgrid_container').remove();
            $(container).find('div.sgrid_caption').remove();
        },
        /* Method update cell data @param {key} строка вида 15_6 - row-column. Отсчет с 0. 
         * @param {val} - string Value
         * @param {type} - see emum CellType
         * @param {mode} - see enum CellMode
        */
        updateCell: function (cell) {
            var key = cell.Row + '_' + cell.Column,
                val = cell.Value,
                type = cell.Type,
                mode = cell.Mode,
                tooltip = cell.Tooltip;
            var h = null;
            if (mode === CellMode.Header) {
                key = key + '_th';
                h = $("[id='" + key + "']");
                if (val !== undefined && h[0] !== undefined) h[0].innerText = val;
                return;
            }
            var container = $(this).sgrid('getGridContainer');
            var isInput = (mode === CellMode.Input || mode === CellMode.History) && $(container).sgrid('getSettings', 'readOnly') === 'false';
            h = $("[id='td" + key + "']");
            if (h === null || h === undefined) return;
            if (h.length === 0) {
                $(this).sgrid('newCell', cell);
            }
            if (mode === CellMode.Error) {
                key = 'td' + key;
                h = $("[id='" + key + "']");
                h.removeClass().addClass('cell_error').attr('title', val);
                h.children().val('');
                return;
            }

            var td = $('td#td' + key).attr('title', tooltip);

            $(this).sgrid('setCellMode', td, cell);
            if (h.length > 0) {
                var inp = $('input', h[0]);
                let needAddInp = false;
                if (inp.length === 0) { 
                    inp = $('<input>').attr('name', key + "_" + cell.Type).attr('id', key);
                    needAddInp = true;
                }
                switch (type) {
                    case CellType.Number: case CellType.DateTime: case CellType.Integer: case CellType.IntRange:
                        if (isInput === true) {
                            inp.removeAttr('disabled').removeAttr('readonly');
                            inp.val(val);
                            td.html('');
                            if (needAddInp) inp.appendTo(td);
                        }
                        else {
                            //inp.val(val).attr('readonly', 'readonly').attr('disabled', 'disabled').appendTo(td);
                            td.html(val).attr('datatype',cell.Type);
                        }
                        
                        break;
                    case CellType.Date:
                        if (!browserIE && isInput === true) {
                            val = $(this).sgrid('toJsDate', val);
                        }
                        if (isInput === true) {
                            inp.removeAttr('disabled').removeAttr('readonly', '');
                        }
                        else inp.val(val).attr('disabled', '').attr('readonly', '');
                        inp.val(val);
                        if (needAddInp || val.length>0) inp.appendTo(td);
                        break;
                    case CellType.Text:
                        if (isInput === true) {
                            if (needAddInp) inp.appendTo(td);
                            inp.removeAttr('disabled').removeAttr('readonly', '');
                            inp.val(val);
                            td.html('');
                        }
                        else {
                            td.html(val);
                        }
                        break;
                    case CellType.Boolean:
                        inp = $('input', h[0]);
                        if (isInput === true) inp.removeAttr('disabled'); 
                        else inp.attr('disabled', 'disabled');
                        var b = $(h[0]);
                        b.prop('checked', val);
                        break;
                    case CellType.CLob:
                        inp = $('textarea', h[0]);
                        if (isInput === true) inp.removeAttr('disabled').removeAttr('readonly', '');
                        else inp.attr('disabled', 'disabled').attr('readonly');
                        inp.val(val);
                        break;
                    case CellType.BLob:
                        if (isInput && cell.Value.length === 0) {
                            $('<input type="file" accept=".pdf,.doc,.docx,.jpeg,.png"/>').attr('id', key).appendTo(td);
                        }
                        else {
                            if (cell.Value.length > 0) {
                                inp.attr("type", "text").attr("value", cell.Value)
                                    .addClass("sform-right-align")
                                    .attr('disabled', 'disabled')
                                    .appendTo(td);
                                td.prepend('<i class="fa fa-times" aria-hidden="true" title="Удалить"></i>');
                            }
                        }
                        break;
                    case CellType.SelectList:
                        var select = $('select#' + key);
                        if (select === undefined) select = $('<select>').attr("name", key + "_" + cell.Type).attr('id', key).appendTo(td);
                        if (!isInput) select.attr("disabled", "disabled");
                        for (var p in cell.options) {
                            if (p === cell.Value) {
                                var opt = $('<option>').attr('value', p).html(cell.options[p]).appendTo(select);
                                opt.attr("selected", "selected");
                            }
                        }
                        break;
                    case CellType.Button:
                        $(h[0]).attr('href', val);
                        break;
                    default: break;
                }
            }
        },
        /*
         *Create new cell
         * @param {key} row_column 
         * @param {val} value
         * @param {type} 
         */
        newCell: function (cell) {
            var key = cell.Row + '_' + cell.Column;
            var body = $('tbody#stbody', this);
            var row = $('#row_' + cell.Row, body);
            if (row.length === 0) {
                row = $('<tr>').attr('id', 'row_' + cell.Row).appendTo(body);
            }
            var td = $('<td>').attr('id', 'td' + key).attr('dataType', cell.Type).appendTo(row);
            this.sgrid('setCellMode', td, cell);
            if (cell.Type === CellType.Number || cell.Type === CellType.Integer || cell.Type === CellType.IntRange)
                td.addClass('sform-right-align');
            if (this.sgrid('getSettings', 'readOnly') === 'true' && cell.Mode !== CellMode.InputRO) {
                td.addClass('cell_disabled').html(cell.Value);
            }
            else {
                this.sgrid('createCell',td,cell,key);
            }
        },
        /*
         *Method change mode
         *@param  mode = Input or History
        */
        changeMode: function (mode) {
            if (settings.formMode === mode) return;
            switch (mode) {
                case 'Input':
                    $('td.cell_input',this).children().removeAttr('disabled');
                    $('td.cell_fromhistory',this).children().attr('disabled', 'disabled');
                    break;
                case 'History':
                    $('td.cell_input',this).children().attr('disabled', 'disabled');
                    $('td.cell_fromhistory',this).children().removeAttr('disabled');
                    break;
                default:
                    alert('mode может принимать значения: Input , History !');
                    break;
            }
            settings.formMode = mode;
        },
        /*
         *Method get cells data from server
         *@param initial 0
        */
        getCellsData: function (i, lv ) {
            lv = lv || 0;//для IE не поддерживает function( i, lv = 0)
            var can_break = false;
            var $this = $(this);
            $(document).on('keydown',function (evnt) {
                if (evnt.which === 27) {
                    //evnt.preventDefault();//IE specific
                    can_break = true;
                }
            });
            return $.ajax({
                url: $this.sgrid('getSettings', 'root') + $this.sgrid('getSettings', 'cellsDataUrl') + "?i=" + i.toString() + "&lv=" + lv.toString(),
                async: true,
                cache: false,
                success: function (data) {
                    $this.trigger('stopSpinner.sgrid');
                    if (data.cells !== undefined) {
                        for (var j = 0; j < data.cells.length; j++) {
                            $this.sgrid('updateCell', data.cells[j]);
                        }
                        //ProgressBarModal("show", "Выполнено " + data.Percent + "%");
                        //$('#ProgressMessage').width(data.Percent + "%");

                        if (data.Percent >= "100" || can_break || lv >= max_recursive_calls) {
                            ProgressBarModal('hide');
                            $this.trigger('dataReady.sgrid');
                            return;
                        }
                        else {
                            var s = lv + 1;
                            $this.sgrid('getCellsData', 1, s);//1 - next step, 0 - first 
                        }
                    }
                    else {
                        $this.trigger('dataReady.sgrid');
                        if (data.indexOf("<!DOCTYPE") === 0) {
                             document.write(data);
                        }
                    }
                },
                error: function (XMLHttpRequest, _textStatus, _errorThrown) {
                    alert("Ошибка чтения данных getCellsData. Статус -  " + XMLHttpRequest.status);
                    $this.trigger('stopSpinner.sgrid');
                    ProgressBarModal();
                }
            });
        },
        /*Method push rows number to array 
        *@param parentRow - row number
         */
        getChildRows: function (parentRow) {
            var $this = $(this);
            var ret = new Array();
            $this.find('tbody').find('tr').each(function (i, el) {
                if ($(el).attr('parentrow') === parentRow) {
                    ret.push($(el).attr('row'));
                }
            });
            return ret;
        },
        /*только для treeGrid */
        hideRow: function (row) {
            $('tr[row=' + row + ']').hide();
        },
        /*только для treeGrid */
        showRow: function (row) {
            $('tr[row=' + row + ']').show();
        },
        /*
        */
        setPencil: function () {
            var $this = $(this);
            var col = $this.sgrid('getSettings', 'nameCol4Modal');
            if ($this.sgrid('getSettings', 'modalRowEdit') === "true") {
                $('tr td').each(function (indx, val) {
                    var arr = val.id.split('_', 2);
                    if (arr.length > 1 && arr[1] === col) {
                        $(val).prepend('<i class="fa fa-pen"></i>');
                    }
                });
            }
        },
        addRemoveIcon: function () {
            var $this = $(this);
            $('tbody tr td:first-child', $this).prepend('<i class="fa fa-trash"></i>');
            $('tbody tr:last td i', $this).removeClass('fa-trash').addClass('fa fa-plus-circle');
        },
        onRemoveRowEvnt: function () {
            var $this = $(this);
            $('td > i.fa-trash').on('click',function (evnt) {
                var td = $(evnt.target.parentElement);
                var id = td.attr('id').replace('td', '');
                var arr = id.slice('_');
                $this.sgrid('rowDeleted', arr[0]);
                td.parent().remove();
            });
        },
        onAddRowEvnt: function () {
            var $this = $(this);
            $('td > i.fa-plus-sign').on('click',function (evnt) {
                var td = $(evnt.target.parentElement);
                var id = td.attr('id').replace('td', '');
                var arr = id.slice('_');
                $this.sgrid('addRow', arr[0]);
            });
        },
        offRemoveRowEvnt: function () {
            $('td > i.fa-trash').off('click');
        },
        offAddRowEvnt: function () {
            $('td > i.fa-plus-sign').off('click');
        },
        rowDeleted: function (row) {
            $(this).trigger('rowChanged.sgrid', [row,0]);
        },
        addRow: function (lastId) {
            var $this = $(this);
            $this.sgrid('offRemoveRowEvnt');
            $this.sgrid('offAddRowEvnt');
            var newRow = parseInt(lastId) + 1;
            $('tbody tr:last td:first i', $this).removeClass('fa fa-plus-sign').addClass('fa fa-trash');
            $('tbody tr:last', $this).clone(true).appendTo('tbody');
            $('tbody tr:last td:first i', $this).removeClass('fa fa-trash').addClass('fa fa-plus-sign');
            $('tbody tr:last td', $this).each(function (indx, elem) {
                var oldId = $(elem).prop('id');
                var newId = oldId.replace('td' + lastId, 'td' + newRow);
                $(elem).prop('id', newId);
                $('input , textarea , select', $(elem)).each(function (i, el) {
                    var name = $(el).prop('name');
                    var nn = name.replace(lastId + '_', newRow + '_');
                    $(el).prop('name',nn);
                    var id = $(el).prop('id');
                    var nid = id.replace(lastId + '_', newRow + '_');
                    $(el).prop('id', nid);
                    $(el).prop('value', '');
                });
            });
            $this.sgrid('onRemoveRowEvnt');
            $this.sgrid('onAddRowEvnt');
            $(this).trigger('rowChanged.sgrid', [newRow, 1]);
        },
        getTableHtml: function () {
            var $this = $(this);
            var html = $('.sgrid_container', $this).html();
            return html;
        },
        toJsDate: function (ruDate) {
            if (ruDate.length > 0) {
                var dt = ruDate.split('.', 3);
                return dt[2] + '-' + dt[1] + '-' + dt[0]; 
            }
            return ruDate;
        },
        toRuDate: function (jsDate) {
            if (jsDate.length > 0) {
                var dt = jsDate.split('-', 3);
                return dt[2] + '-' + dt[1] + '-' + dt[0];
            }
            return jsDate;
        },
        deleteRow: function (row) {
            $('#row_' + row, this).remove();
        },
        deleteAllRows: function () {
            if (varRowForm) $('tbody', this).children().remove();
        },
        setCellMode: function (td, cell) {
            td.removeClass();
            switch (cell.Mode) {
                case CellMode.Disable:
                    td.addClass('cell_disabled')
                        .attr('dataType', cell.Type)
                        .html(cell.Value);
                    if (cell.Type === CellType.Number || cell.Type === CellType.Integer || cell.Type === CellType.IntRange)
                        td.addClass('sform-right-align');
                    break;
                case CellMode.Input: case CellMode.InputRO:
                    td.addClass('cell_input');
                    break;
                case CellMode.Calculate:
                    td.addClass('cell_calculated');
                    break;
                case CellMode.History: case CellMode.HistoryRO:
                    td.addClass('cell_fromhistory');
                    break;
                case CellMode.OutRef:
                    td.addClass('cell_outref');
                    break;
                case CellMode.Cumulative:
                    td.addClass('cell_cumulative');
                default: break;
            }
        },
        newRow: function (cells, parent) {
            var $this = $(this); var container = $this;
            var body = $(this).find('table.scroll tbody');
            var row;
            var indentCount = 1;
            if (parent === null || parent === undefined)
                row = $('<tr>').attr('id', 'row_' + cells[0].Row).appendTo(body);
            else {
                var prow = $('tr#row_' + parent);
                $('.sgrid-expander', prow).addClass('fa fa-minus-circle');
                $('span',prow).each(function () {
                    indentCount++;
                });
                row = $('<tr>')
                    .attr('id', 'row_' + cells[0].Row)
                    .insertAfter(prow);
            }
            for (var i = 0; i < cells.length; i++) {
                var key = cells[i].Row + '_' + cells[i].Column;
                var td = $('<td>').attr('id', 'td' + key).appendTo(row);
                if (cells[i].Type === CellType.Tree && (parent !== null || parent !== undefined)) {
                    cells[i].Level = indentCount;
                    cells[i].ParentRow = parent;
                    td.on('click', 'span.sgrid-expander', function () {
                        var $this = $(this),
                            opened = null;
                        toggleTree(container, $this, opened);
                    });
                }
                $this.sgrid('setCellMode', td, cells[i]);
                $this.sgrid('createCell', td, cells[i], key);
            }
        },
        createCell: function (td, cell, key) {
            var $this = $(this);
            var dateplaceholder = 'дд.мм.гггг';
            var isInput = cell.Mode === CellMode.Input || cell.Mode === CellMode.History;
            if (cell.Tooltip !== undefined && cell.Tooltip !== null && cell.Tooltip.length > 0)
                td.attr('title', cell.Tooltip);
            var inp = $('<input>').attr('name', key + "_" + cell.Type).attr('id', key);
            switch (cell.Type) {
                case CellType.Number:
                    inp.attr("type", "text").addClass("sform-right-align").attr("value", cell.Value);
                    if (isInput) {
                        inp.attr('placeholder', '0,0');
                        inp.appendTo(td);
                        td.html('');
                    }
                    else {
                        td.html(cell.Value);
                    }
                    //else inp.attr('disabled', 'disabled').attr('readonly', '');
                    break;
                case CellType.Text:
                    if (isInput)
                        inp.attr("type", "text").attr("value", cell.Value).attr('placeholder', 'введите текст').appendTo(td);
                    else {
                        if ([CellMode.InputRO, CellMode.HistoryRO, CellMode.OutRef, CellMode.Cumulative].includes(cell.Mode)) {
                            //if (cell.Mode === CellMode.InputRO || cell.Mode === CellMode.HistoryRO || cell.Mode === CellMode.OutRef || cell.Mode === CellMode.Cumulative) {
                            inp.attr('type', 'text').addClass("sform-left-align").attr("value", cell.Value).attr('disabled', 'disabled');
                            inp.appendTo(td);
                        } else td.addClass("sform-left-align").html(cell.Value);
                    }
                    break;
                case CellType.Date:
                    if (!browserIE && cell.Value.length > 0) {
                        cell.Value = this.sgrid('toJsDate', cell.Value);
                    }
                    inp.attr("type", "date").attr("value", cell.Value);
                    if (isInput) inp.attr('placeholder', dateplaceholder);
                    else inp.attr('disabled', 'disabled').attr('readonly', '');
                    if (isInput || cell.Value.length > 0) inp.appendTo(td);
                    break;
                case CellType.DateTime:
                    inp.attr("type", "text").attr("value", cell.Value);
                    if (isInput)
                        inp.attr('placeholder', dateplaceholder + ' 00:00:00');
                    else inp.attr('disabled', 'disabled').attr('readonly', '');
                    if (isInput || cell.Value.length > 0) inp.appendTo(td);
                    break;
                case CellType.Integer:
                    inp.attr("type", "text").attr("value", cell.Value).addClass("sform-right-align");
                    if (isInput) {
                        inp.attr("type", "text")
                            .attr('placeholder', 'введите целое');
                    }
                    else inp.attr('disabled', 'disabled').attr('readonly', '');
                    inp.appendTo(td);
                    break;
                case CellType.IntRange:
                    inp.attr("type", "text").attr("value", cell.Value).addClass("sform-right-align");
                    if (isInput) {
                        inp.attr("type", "text")
                            .attr('min', cell.Min)
                            .attr('max', cell.Max)
                            .attr('placeholder', 'целое от ' + cell.Min + ' до ' + cell.Max);
                    }
                    else inp.attr('disabled', 'disabled').attr('readonly', '');
                    inp.appendTo(td);
                    break;
                case CellType.Boolean:
                    inp.attr("type", "checkbox").attr("name", key + "_" + cell.Type).appendTo(td).after(cell.Value);
                    inp.prop('checked', cell.BoolValue);
                    if (!isInput) inp.attr('disabled', 'disabled');
                    break;
                case CellType.CLob:
                    var ta = $('<textarea>')
                        .attr('id', key)
                        .attr("name", key + "_" + cell.Type)
                        .attr('rows', cell.Rows)
                        .attr('cols', cell.Cols)
                        .html(cell.Value)
                        .appendTo(td);
                    if (!isInput) ta.attr("disabled", "disabled");
                    break;
                case CellType.BLob:
                    if (isInput && cell.Value.length === 0) {
                        $this.sgrid('addBlobForm', td, key);
                    }
                    if (cell.Value.length > 0) {
                        var url = $this.sgrid('getSettings', 'root') + $this.sgrid('getSettings', 'getBlobUrl') + "?row=" + cell.Row + "&col=" + cell.Column;
                        $('<a>')
                            .attr('id', key)
                            .attr("name", key + "_" + cell.Type)
                            //.attr("class", "btn btn-primary")
                            .attr("href", url)
                            .html(cell.Value)
                            .appendTo(td);
                    }
                    if (isInput && cell.Value.length > 0) {
                        td.prepend('<i class="fa fa-trash" aria-hidden="true" title="Удалить"></i>');
                        $('td#td'+key+'>i.fa-trash').on('click', function (evnt) {
                            $this.sgrid('deleteBlob', cell.Row, cell.Column);
                        });
                    }
                    break;
                case CellType.SelectList:
                    var select = $('<select>').attr("name", key + "_" + cell.Type).attr('id', key).appendTo(td);
                    if (!isInput) select.attr("disabled", "disabled");
                    for (var p in cell.options) {
                        var opt = $('<option>').attr('value', p).html(cell.options[p]).appendTo(select);
                        //if (cell.options[p] === cell.Value) opt.attr("selected", "selected");
                        if (p === cell.Value) opt.attr("selected", "selected");
                    }
                    break;
                case CellType.Button:
                    $('<a>')
                        .attr('id', key)
                        .attr("name", key + "_" + cell.Type)
                        .attr("class", "btn btn-primary")
                        .attr("href", cell.Url)
                        .html(cell.Value)
                        .appendTo(td);
                    break;
                case CellType.Tree:
                    if (isInput)
                        inp.attr("type", "text").attr("value", cell.Value).attr('placeholder', 'введите текст').appendTo(td);
                    else {
                        if (cell.Mode === CellMode.InputRO || cell.Mode === CellMode.HistoryRO || cell.Mode === CellMode.OutRef || cell.Mode === CellMode.Cumulative) {
                            inp.attr('type', 'text').addClass("sform-left-align").attr("value", cell.Value).attr('disabled', 'disabled');
                            inp.appendTo(td);
                        } else td.addClass("sform-left-align").html(cell.Value);
                    }
                    var exp = $this.sgrid('getSettings', 'expanderTemplate'), indent = $this.sgrid('getSettings', 'indentTemplate');
                     //expandedClass = $this.sgrid('getSettings', 'expanderExpandedClass');
                    //collapsedClass = $(selector).sgrid('getSettings', 'expanderCollapsedClass');
                    exp = $(exp).prependTo(td);
                    td.parent().attr('row', cell.Row).attr('parentRow', cell.ParentRow);
                    for (var lv = 0; lv <= cell.Level; lv++) {
                        if (cell.HasChildren) exp.addClass('fa fa-minus-circle');
                        if (lv !== 0) $(indent).insertBefore(exp);
                    }
                    break;
            }
        },
        setCellBottomBorderColor: function (td,color) {
            td.css('border-bottom', color);//'solid 3px red'
        },
        addBlobForm: function (td, key) {
            var $this = $(this);

            var newForm = jQuery('<form>', {
                'id': 'form_' + key,
                //'action': $this.sgrid('getSettings', 'root') + '/Form/SaveBlobCell',
                'method': 'POST',
                'enctype': 'multipart/form-data'
            }).append(jQuery('<input>', {
                'name': 'blobData',
                'accept': ".pdf,.doc,.docx,.jpeg,.png",
                'type': 'file',
                'id': key
            })).append($('<input>', {
                'name': 'blobName',
                'value': "",
                'hidden': "hidden"
            })).append($('<input>', {
                'name': 'type',
                'value': "",
                'hidden': "hidden"
            })).append($('<input>', {
                'name': 'row',
                'value': '',
                'hidden': "hidden"
            })).append($('<input>', {
                'name': 'col',
                'value': '',
                'hidden': "hidden"
            })).append($('<input>', {
                'type': 'submit',
                'value': 'Сохранить',
                'hidden': "hidden"
            })).appendTo(td);
        },
        deleteBlob: function (row, col) {
            var $this = $(this);
            var formdata = new FormData();
            formdata.append("blobData", null);
            formdata.append("row", row);
            formdata.append("col", col);
            $.ajax({
                async: true,
                type: 'POST',
                url: $this.sgrid('getSettings', 'root') + $this.sgrid('getSettings', 'saveBlobUrl'),
                data: formdata,
                cache: false,
                contentType: false,
                processData: false,
                error: function (XMLHttpRequest, _textStatus, _errorThrown) {
                    $.notify("Ошибка deleteBlob. Статус -  " + XMLHttpRequest.status + " Техт: " + XMLHttpRequest.responseText,
                        {
                            clickToHide: false,
                            autoHideDelay: 10000
                        });
                }
            }).then(function () {
                var key = row + '_' + col;
                var td = $('td#td' + key);
                td.children().remove();
                $this.sgrid('addBlobForm', td,key);
                return true;
            });
        },
        hideEmptyRows: function (columns) {
            var $this = $(this);
            var rows = $('tbody tr', $this);
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i]; var hide = true;
                var tds = $('td', $(row));
                for (var j = 0; j < columns.length; j++) {
                    var html = $(tds[columns[j]]).html();
                    if (!(html === '0' || html === '')) { hide = false; break;}
                }
                if (hide) $(rows[i]).attr('hidden', 'hidden');
            }
        },
        showAllRow: function () {
            var $this = $(this);
            $('tbody tr', $this).removeAttr('hidden');
        }
    };
    /* sgrid plugin */
    $.fn.sgrid = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.initGrid.apply(this, arguments);
        } else {
            $.error('Method with name ' + method + ' does not exists for jQuery.sgrid');
        }
    };
    /*
     *private function
    */
    function makeHeader(header, selector) {
        var h = header.toString();
        if (h.indexOf('<!DOCTYPE') >= 0) {
            document.open();
            document.write(h);
            document.close();
            return;
        }
        var obj = $('<div>').addClass('sgrid_caption').html(header.Caption).appendTo(selector);
        obj = $('<div>').addClass('sgrid_container').appendTo(selector);
        var headerRow4Modal = $(selector).sgrid('getSettings','nameRow4Modal');
        headerNames.length = 0;
        obj = $('<table id=sgrid>').addClass('scroll table').appendTo(obj);
        var head = $('<thead>').appendTo(obj);
        for (var i = 0; i < header.HeaderRows.length; i++) {
            var row = $('<tr>').appendTo(head);
            for (var j = 0; j < header.Columns.length; j++) {
                var key = header.HeaderRows[i] + '_' + header.Columns[j];
                if (header.Header[key] === undefined) continue;
                var th = $('<th scope="col">')
                    .attr('colspan', header.Header[key].ColSpan)
                    .attr('rowspan', header.Header[key].RowSpan)
                    .attr('id', key + '_th')
                    //.css('z-index', 1)
                    .appendTo(row);
                if (header.Header[key].ShowVertical === true) {
                    if (!row.hasClass('vertical')) row.addClass('vertical');
                    $('<span>').addClass('vertical')
                        .html(header.Header[key].Value)
                        .appendTo(th);
                }
                else {
                    th.html(header.Header[key].Value);
                    if (header.HeaderRows[i].toString() === headerRow4Modal)
                        headerNames.push(header.Header[key].Value);
                }
                if (i === 0
                    && $(selector).sgrid('getSettings', 'readOnly') === true
                    && $(selector).sgrid('getSettings', 'hasTreeColumn') === false)
                {
                    $('<i>').addClass('bi bi-arrow-down-up').appendTo(th);
                    var fc = $(selector).sgrid('getSettings', 'filterColumns');
                    if (fc!==null&&fc.indexOf(header.Columns[j]) >= 0)
                        $('<i>').addClass('bi bi-filter').prependTo(th);
                }
            }
        }
        var body = $('<tbody>').attr('id', 'stbody').appendTo(obj);
        var header_height = 0;//set header_height if vertical text
        $('table th span.vertical').each(function () {
            if ($(this).outerWidth() > header_height) header_height = $(this).outerWidth();
        });
        $('table tr.vertical th').height(header_height + 10);
    }

    function createGrid(data, selector) {
         var body = $(selector).find('table.scroll tbody');
        for (var i = 0; i < data.Rows.length; i++) {
            var row = $('<tr>').attr('id', 'row_' + data.Rows[i]).appendTo(body);
            for (var j = 0; j < data.Columns.length; j++) {
                var key = data.Rows[i] + '_' + data.Columns[j];
                var td = $('<td>').attr('id', 'td' + key).appendTo(row);
                var cell = data.Cells[key];
                if (cell === undefined) continue;
                $(selector).sgrid('setCellMode', td, cell);
                /*if ($(selector).sgrid('getSettings', 'modalRowEdit') === "true" && j === 0) {
                    td.addClass('glyphicon glyphicon-pencil');
                }*/
                $(selector).sgrid('createCell', td, cell, key);
            }
        }
        if (data.VarRowCount === true) {
            $(selector).sgrid('addRemoveIcon');
            $(selector).sgrid('onAddRowEvnt');
            $(selector).sgrid('onRemoveRowEvnt');
        }
    }
    function createRoGrid(data, selector) {
        var body = $(selector).find('table.scroll tbody');
        for (var i = 0; i < data.Rows.length; i++) {
            var row = $('<tr>').attr('id', 'row_' + data.Rows[i]).appendTo(body);
            for (var j = 0; j < data.Columns.length; j++) {
                var td = $('<td>').appendTo(row);
                var key = data.Rows[i] + '_' + data.Columns[j];
                var cell = data.Cells[key];
                if (cell === undefined) continue;
                td.attr('id', 'td' + key).attr('dataType', cell.Type);
                if (cell.Type === CellType.Number || cell.Type === CellType.Integer || cell.Type === CellType.IntRange)
                    td.addClass('sform-right-align');
                var rotext = cell.Value;
                switch (cell.Type) {
                    case CellType.Boolean: 
                        if (cell.BoolValue) rotext = 'да';
                        else rotext = 'нет';
                        td.addClass('cell_disabled').html(rotext);
                        break;
                    case CellType.SelectList:
                        rotext = cell.options[cell.Value];
                        td.addClass('cell_disabled').html(rotext);
                        break;
                    case CellType.Tree:
                        td.addClass('cell_disabled').html(rotext);
                        var exp = $(selector).sgrid('getSettings','expanderTemplate'),
                        indent = $(selector).sgrid('getSettings','indentTemplate'),
                        expandedClass = $(selector).sgrid('getSettings', 'expanderExpandedClass');
                        //collapsedClass = $(selector).sgrid('getSettings', 'expanderCollapsedClass');
                        exp = $(exp).prependTo(td);
                        td.parent().attr('row',cell.Row).attr('parentRow', cell.ParentRow);
                        for (var lv = 0; lv <= cell.Level; lv++) {
                            if (cell.HasChildren) exp.addClass('fa fa-minus-circle');
                            if(lv !==0) $(indent).insertBefore(exp);
                        }
                        break;
                    default:
                        td.addClass('cell_disabled').html(rotext);
                        break;
                }
                
            }
        }
    }

    function makeTail(container) {
        var popup = $('<div>')
            .addClass("popup")
            .attr("title", "Ошибка ввода")
            .appendTo(container);
        $('<div>')
            .addClass("close_window")
            .html('X')
            .appendTo(popup);
        $('<textarea>')
            .attr('rows', 7)
            .attr('cols', 77)
            .attr('max-width', '580px')
            .attr('wrap','hard')
            .attr("id", "inputerror")
            .appendTo(popup);
       
        $('#stbody').on('change','input', function (event) {
            var $this = $(this);
            var nm = $this.prop('id').split("_", 2);
            if ($this[0].type === 'file') {
                let file = $this[0].files[0];
                let frm = $this.parent();
                $('input[name="blobName"]', frm).val(file.name);
                $('input[name="type"]', frm).val(file.type);
                $('input[name="row"]', frm).val(nm[0]);
                $('input[name="col"]', frm).val(nm[1]);
                let key = nm[0] + "_" + nm[1];
                let elem = document.getElementById("form_" + key);
                let url = container.sgrid('getSettings', 'saveBlobUrl');
                $.ajax({
                        async: true,
                        type: 'POST',
                        url: url,
                        data: new FormData(elem),
                        cache: false,
                        contentType: false,
                        processData: false
                    }).then(function () {
                        var td = frm.parent();
                        $this.remove();
                        $('<a>')
                            .attr('id', key)
                            .attr("name", key + "_" + CellType.BLob)
                            //.attr("class", "btn btn-primary")
                            .attr("href", url)
                            .html(file.name)
                            .appendTo(td);
                        td.prepend('<i class="fa fa-trash" aria-hidden="true" title="Удалить"></i>');
                        $('td>i.fa-trash').on('click', function () {
                            container.sgrid('deleteBlob', nm[0], nm[1]);
                        });
                        return true;
                });
            }
            else checkInput(container, $this);
        }); 
        $('#stbody').on('change', 'textarea', function (event) {
            var $this = $(this);
            checkInput(container, $this);
        });
        $('#stbody').on('change', 'select', function (event) {
            var $this = $(this);
            checkInput(container, $this);
        });
    }

    function checkInput(container, $this) {
        var dateDelimiter = container.sgrid('getSettings', 'dateDelimiter');
        var decimalDelimiter = container.sgrid('getSettings', 'decimalDelimiter');
        var nm = $this.prop('name').split("_", 3);
        var val = $this.prop('value').toString();
        if (nm.length === 3) {
            var x = $this.offset().left;
            var y = $this.offset().top;
            if (validate(nm[2], val, $this.prop('min'), $this.prop('max'), dateDelimiter, decimalDelimiter)) {
                if (nm[2] === "7") {//boolean cell type
                    val = $this.prop('checked').toString();
                }
                if (nm[2] === "3" && browserIE === false) {
                    val = container.sgrid('toRuDate', val);
                }
                $.ajax({
                    async: true,
                    type: "POST",
                    url: container.sgrid('getSettings', 'root') + container.sgrid('getSettings', 'posturl'),
                    data: 'r=' + nm[0] + "&c=" + nm[1] + "&val=" + val,
                    success: function (msg) {
                        if (msg.error !== undefined && msg.error !== null)
                            callPopup(x, y, msg.error);
                        else {
                            for (var i = 0; i < msg.calculated.length; i++) {
                                $('input#' + msg.calculated[i].Row + '_' + msg.calculated[i].Column).val(msg.calculated[i].Value);
                            }
                            try {
                                if (browserIE)
                                    $('input#' + msg.changed.Row + '_' + msg.changed.Column).val(msg.changed.Value);
                                else {
                                    var value = msg.changed.Value;
                                    if (nm[2] === "3") {
                                        value = container.sgrid('toJsDate', value);
                                    }
                                    $('input#' + msg.changed.Row + '_' + msg.changed.Column).val(value);
                                }
                            }
                            catch (e) {
                                alert('Не заполнена структура ответа PostBackData: ' + e.toString());
                            }
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert(XMLHttpRequest.responseText);
                    }
                });
            }
            else {
                var message = getTitle(nm[2], $this.prop('min'), $this.prop('max'),
                    container.sgrid('getSettings', 'decimalDelimiter'),
                    container.sgrid('getSettings', 'dateDelimiter'));
                callPopup(x, y, message);
            }
        }
    }

    function initHistoryEvent(container) {
        $("#stbody a").on('click', function (event) {
            event.preventDefault();
            var rc = $(this).attr('id').split('_', 2);
            container.sgrid('setForm', 0, rc[0], rc[1]);
            window.history.pushState({ idForm: $(this).attr('href') }, null, null);
           });
        window.onpopstate = function (event) {
            if (event.state === null) {
                //container.sgrid('setForm', container.sgrid('getStartFormId'),0,0);
                return;
            }
            if (container.sgrid('getIdForm') !== event.state.idForm)
                container.sgrid('setForm', event.state.idForm,0,0);
        };
        $(container).on('formReady.sgrid', function (event) {
            event.preventDefault();
            $(this).off('formReady.sgrid');
        });
        if ($(container).sgrid('getSettings', 'readOnly') === true && $(container).sgrid('getSettings', 'hasTreeColumn') === false) {
            $('th i.bi').filter('.bi-arrow-down-up', 'bi-sort-down','.bi-sort-down-alt')
                .on('click',function (e) {
                sortByColumn(e.currentTarget.parentNode.cellIndex, container);
            });
            $('th i.bi-filter').on('click',function (e) {
                $(container).sgrid('initFilterDialog', e.currentTarget.parentElement.cellIndex, e.currentTarget.parentElement.innerText);
            });
        }
        $('td').on('click', 'span.sgrid-expander', function () {
            var $this = $(this),
                opened = null;
            toggleTree(container,$this, opened);
        });
      
        //row modal edit event
        $('td').on('click',function (evnt) {
            if (evnt.target.className === 'fa fa-pen')
                container.sgrid('initModalRowEdit', $(evnt.target).parent().parent(), $(evnt.target).parent().text());
            else
                if($(evnt.target.children).hasClass('fa-pen')) 
                    container.sgrid('initModalRowEdit', $(evnt.target).parent(), $(evnt.target).text());
            //evnt.preventDefault();
            
        });
        $('#dlgBtnSave').on('click',function (evnt) {
            var cells = [];
            var cell = { Row: 0, Column: 0, Value: '', Type: 0 };
            var dlg = $('#ModalEdit');
            var dateDelimiter = container.sgrid('getSettings', 'dateDelimiter');
            var decimalDelimiter = container.sgrid('getSettings', 'decimalDelimiter');
            dlg.find('input , select').each(function (indx, elem) {
                var nm = $(elem).prop('name').split("_", 3);
                var val = $(elem).prop('value');
                cell = { Row: nm[0], Column: nm[1], Value: val, Type: nm[2] };
                cells.push(cell);
            });
            $('#ModalEdit').modal('hide');
            for (var i = 0; i < cells.length; i++) {
                var key = cells[i].Row + '_' + cells[i].Column;
                $('#' + key,'div.sgrid_container').prop('value', cells[i].Value);
            }
        });
        $('#dlgBtnFilter').on('click',function (evnt) {
            var dlg = $('#FilterDlg');
            var selVal = "";
            $('#filterSelect',dlg).find(':selected').each(function (indx, elem) {
                selVal = $(elem).val();
            });
            if (selVal === "") container.sgrid('showAll');
            else container.sgrid('showOnly', selVal);
        });
    }
    function toggleTree(container,$this,opened) {
        var currentRow = $($this.closest('tr')).attr('row');
        if ($this.hasClass('fa-minus-circle')) {
            $this.removeClass('fa-minus-circle').addClass('fa-plus-circle');
            opened = true;
        }
        else {
            if ($this.hasClass('fa-plus-circle')) {
                $this.removeClass('fa-plus-circle').addClass('fa-minus-circle');
                opened = false;
            }
        }
        if (opened !== null) {
            var childrenArr = new Array();
            var retChildren = container.sgrid('getChildRows', currentRow);
            childrenArr = retChildren.slice();
            for (var indx = 0; indx < childrenArr.length; indx++) {
                retChildren = container.sgrid('getChildRows', childrenArr[indx]);
                for (var k = 0; k < retChildren.length; k++) {
                    childrenArr.push(retChildren[k]);
                }
            }
            childrenArr.forEach(function (val, index, childrenArr) {
                if (opened === true)
                    container.sgrid('hideRow', val);
                else
                    container.sgrid('showRow', val);
            });
        }
    }

    function validate(type, val, min, max, dateDelimiter, decimalDelimiter) {
        var pattern;
        if (val === '') return true;
        var datePattern = '^(0[1-9]|[12][0-9]|3[01])\\' + dateDelimiter + '(0[1-9]|1[012])\\' + dateDelimiter + '\\d{1,4}';
        switch (type) {
            case '1':
                val = val.replace(/\s+/g, '');
                pattern = new RegExp('^[-+]?[0-9]*\\' + decimalDelimiter + '?[0-9]+$'); 
                //pattern = new RegExp('^[-+]?[0-9]*[.,]?[0-9]+$');
                break;
            case '5':
                val = val.replace(/\s+/g, '');
                pattern = new RegExp(/^[-+]?\d+$/); break;
            case '3':
                if (browserIE) pattern = new RegExp(datePattern + '$');
                else return true;//pattern = new RegExp('^\d{4}\\-(0?[1-9]|1[012])\\-(0?[1-9]|[12][0-9]|3[01])$');
                break;
            case '4': pattern = new RegExp(datePattern + '[ \\u00A0]+(\\d{2}[:]){1,2}\\d{2}$'); break;
            case '6': pattern = new RegExp(/^[-+]?\d+$/);
                if (pattern.test(val)) {
                    if (Number(val) >= Number(min) && Number(val) <= Number(max)) return true;
                    else return false;
                }
                else return false;
            default: return true;
        }
        return pattern.test(val);
    }

    function callPopup(x, y, message) {
        $('.popup').css('left', 20 + $('.popup').css('width').replace('px', '') / 2);
        $('.popup').css('top', 20 + $('.popup').css('height').replace('px', '') / 2);
        $('#inputerror').html(message);
        $('.popup, .close_order, .overlay').on('click',function () {    //click(function () {
            $('.popup, .overlay').css({ 'opacity': '0', 'visibility': 'hidden' });
        });
        $('.popup, .overlay').css({ 'opacity': '1', 'visibility': 'visible' });
    }
    function getTitle(type, min, max, decimalDelimiter, dateDelimiter) {
        switch (type) {
            case '1': return "Введите вещественное число. Разделитель - " + decimalDelimiter + ' (Например 10' + decimalDelimiter + '33 или 999)';
            case '2': return "Введите текст";
            case '3': return "Требуется дата в формате дд" + dateDelimiter + "мм" + dateDelimiter + "гггг";
            case '4': return "Дата и время в формате дд" + dateDelimiter + "мм" + dateDelimiter + "гггг чч:мин:сек ";
            case '5': return "Требуется целое число";
            case '6': return "Требуется целое число от " + min + " до " + max;
            case '8': return "Введите текст";
            case '9': return "";
            case '10': return "Выберите из списка";
            default: return "";
        }
    }
    function ProgressBarModal(showHide) {

        if (showHide === 'show') {
            $('#mod-progress').modal('show');
            if (arguments.length >= 2) {
                $('#progressBarParagraph').text(arguments[1]);
            } else {
                $('#progressBarParagraph').text('??...');
            }
            if (window.progressBarActive !== true)
                $('body').css("pointer-events", "none");
            window.progressBarActive = true;
        } else {
            setTimeout(function () {
                $('#progress-close').trigger('click');
            }, 1000);
            window.progressBarActive = false;
            $('body').css("pointer-events", "auto");
        }
    }
    function measureScrollBar() {
        var css = {
            "border": "none",
            "height": "200px",
            "margin": "0",
            "padding": "0",
            "width": "200px"
        };

        var inner = $("<div>").css($.extend({}, css));
        var outer = $("<div>").css($.extend({
            "left": "-1000px",
            "overflow": "scroll",
            "position": "absolute",
            "top": "-1000px"
        }, css)).append(inner).appendTo("body")
        .scrollLeft(1000)
        .scrollTop(1000);

        var scrollSize = {
            "height": outer.offset().top - inner.offset().top || 0,
            "width": outer.offset().left - inner.offset().left || 0
        };

        outer.remove();
        return scrollSize;
    }
    function sortByColumn(colIndex, container) {
        var selector = container;
        var tableData = new Array();
        var sortAsc = true;
        $('i.bi')
            .each(function (i) {
                if (i === colIndex) {
                    var oldClass = 'h';
                    if ($(this).hasClass('bi-sort-down-alt')) 
                        oldClass = 'a';
                    if ($(this).hasClass('bi-sort-down')) 
                        oldClass = 'd';
                    $(this).removeClass('bi-sort-down bi-sort-down-alt');
                    if (oldClass === 'h' || oldClass === 'd') { 
                        $(this).addClass('bi bi-sort-down-alt active'); sortAsc = true; 
                    }
                    if (oldClass === 'a') { 
                        $(this).addClass('bi bi-sort-down active'); sortAsc = false; 
                    }
                } 
                else {
                    $(this)
                    .removeClass()
                    .addClass('bi bi-arrow-down-up');
                 }
            });

        var RowData = function () {
            this.Key = '';
            this.KeyType = 0;
            this.Cells = new Array();
        };
        var tblBody = $(selector).find('tbody tr').each(function () {
            var rowData = new RowData();
            $(this).children().each(function (index, value) {
                var cellValue = $(this).text().replace(/(\r\n|\n|\r)/gm, " ");
                if (index === colIndex) {
                    rowData.Key = cellValue;
                    rowData.KeyType = $(this).attr('dataType');
                }
                rowData.Cells.push(cellValue);
            });
            tableData.push(rowData);
        });
        tableData.sort(function (a, b) {
            var decimalDelimiter = $(container).sgrid('getSettings', 'decimalDelimiter');
            switch (a.KeyType) {
                case '2': // text
                case '8': //CLob
                case '7': //Boolean
                    if (a.Key === b.Key) return 0;
                    if (a.Key > b.Key) {
                        return sortAsc ? 1 : -1;
                    }
                    if (a.Key < b.Key) {
                        return sortAsc ? -1 : 1;
                    }
                    break;
                case '1': // Number
                    var av = a.Key.replace(decimalDelimiter, '.');
                    var bv = b.Key.replace(decimalDelimiter, '.');
                    if (sortAsc) return parseFloat(av) - parseFloat(bv);
                    else return parseFloat(bv) - parseFloat(av);
                case '5'://integer
                case '6':
                    if (sortAsc) return a.Key - b.Key;
                    else return b.Key - a.Key;
                case '3'://Date
                    return DateCompare(a.Key, b.Key, sortAsc);
                case '4'://DateTime
                    return DateTimeCompare(a.Key, b.Key, sortAsc);
                default: break;
            }
        });
        tblBody.each(function (i) {
            var rowData = tableData[i];
            $(this).children().each(function (j) {
                $(this).text(rowData.Cells[j]);
            });
        });
        function DateCompare(dateA, dateB, sortAsc) {
            var yearPos = 2;
            var monthPos = 1;
            var dayPos = 0;
            var res = 0;
            var dateDelimiter = $(container).sgrid('getSettings', 'dateDelimiter');
            if (!browserIE) {
                dateDelimiter = '-';
                yearPos = 0; dayPos = 2;
            }
            var partsA = dateA.split(dateDelimiter);
            var partsB = dateB.split(dateDelimiter);
            if (sortAsc) {
                res = parseInt(partsA[yearPos]) - parseInt(partsB[yearPos]);
            }
            else {
                res = parseInt(partsB[yearPos]) - parseInt(partsA[yearPos]);
            }
            if (res === 0) {
                if (sortAsc) {
                    res = parseInt(partsA[monthPos]) - parseInt(partsB[monthPos]);
                }
                else {
                    res = parseInt(partsB[monthPos]) - parseInt(partsA[monthPos]);
                }
                if (res === 0) {
                    if (sortAsc) {
                        res = parseInt(partsA[dayPos]) - parseInt(partsB[dayPos]);
                    }
                    else {
                        res = parseInt(partsB[dayPos]) - parseInt(partsA[dayPos]);
                    }
                    return res;
                }
                else return res;
            }
            else return res;
        }
        function DateTimeCompare(dateA, dateB, sortAsc) {
            var res = DateCompare(dateA, dateB, sortAsc);
            if (res === 0) {
                dateA = dateA.split(" ")[1];
                dateB = dateB.split(" ")[1];
                var hPos = 0, mPos = 1, sPos = 2;
                var partsA = dateA.split(":");
                var partsB = dateB.split(":");
                if (sortAsc) {
                    res = parseInt(partsA[hPos]) - parseInt(partsB[hPos]);
                }
                else {
                    res = parseInt(partsB[hPos]) - parseInt(partsA[hPos]);
                }
                if (res === 0) {
                    if (sortAsc) {
                        res = parseInt(partsA[mPos]) - parseInt(partsB[mPos]);
                    }
                    else {
                        res = parseInt(partsB[mPos]) - parseInt(partsA[mPos]);
                    }
                    if (res === 0) {
                        if (sortAsc) {
                            res = parseInt(partsA[sPos]) - parseInt(partsB[sPos]);
                        }
                        else {
                            res = parseInt(partsB[sPos]) - parseInt(partsA[sPos]);
                        }
                    }
                    return res;
                }
                else return res;
            }
            else return res;
        }
    }
    /*
     * Возвращает массив без повторений
     * @param {Array} arr
     */
    function unique(arr) {
        var obj = {};
        for (var i = 0; i < arr.length; i++) {
            var str = arr[i];
            obj[str] = true; 
        }
        return Object.keys(obj); 
    }
})(jQuery);

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
        var sel = $('<select>', $(inst)).appendTo(inst).addClass("form-select");
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

/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 * http://spin.js.org/
 *
 * Example:
    var opts = {
      lines: 12             // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#000'         // #rgb or #rrggbb
    , opacity: 1/4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1              // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }
    var target = document.getElementById('foo')
    var spinner = new Spinner(opts).spin(target)
 */
; (function (root, factory) {

    /* CommonJS */
    if (typeof module == 'object' && module.exports) module.exports = factory()

        /* AMD module */
    else if (typeof define == 'function' && define.amd) define(factory)

        /* Browser global */
    else root.Spinner = factory()
}(this, function () {
    "use strict"

    var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
      , animations = {} /* Animation rules keyed by their name */
      , useCssAnimations /* Whether to use CSS animations or setTimeout */
      , sheet /* A stylesheet to hold the @keyframe or VML rules. */

    /**
     * Utility function to create elements. If no tag name is given,
     * a DIV is created. Optionally properties can be passed.
     */
    function createEl(tag, prop) {
        var el = document.createElement(tag || 'div')
          , n

        for (n in prop) el[n] = prop[n]
        return el
    }

    /**
     * Appends children and returns the parent.
     */
    function ins(parent /* child1, child2, ...*/) {
        for (var i = 1, n = arguments.length; i < n; i++) {
            parent.appendChild(arguments[i])
        }

        return parent
    }

    /**
     * Creates an opacity keyframe animation rule and returns its name.
     * Since most mobile Webkits have timing issues with animation-delay,
     * we create separate rules for each line/segment.
     */
    function addAnimation(alpha, trail, i, lines) {
        var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
          , start = 0.01 + i / lines * 100
          , z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha)
          , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
          , pre = prefix && '-' + prefix + '-' || ''

        if (!animations[name]) {
            sheet.insertRule(
              '@' + pre + 'keyframes ' + name + '{' +
              '0%{opacity:' + z + '}' +
              start + '%{opacity:' + alpha + '}' +
              (start + 0.01) + '%{opacity:1}' +
              (start + trail) % 100 + '%{opacity:' + alpha + '}' +
              '100%{opacity:' + z + '}' +
              '}', sheet.cssRules.length)

            animations[name] = 1
        }

        return name
    }

    /**
     * Tries various vendor prefixes and returns the first supported property.
     */
    function vendor(el, prop) {
        var s = el.style
          , pp
          , i

        prop = prop.charAt(0).toUpperCase() + prop.slice(1)
        if (s[prop] !== undefined) return prop
        for (i = 0; i < prefixes.length; i++) {
            pp = prefixes[i] + prop
            if (s[pp] !== undefined) return pp
        }
    }

    /**
     * Sets multiple style properties at once.
     */
    function css(el, prop) {
        for (var n in prop) {
            el.style[vendor(el, n) || n] = prop[n]
        }

        return el
    }

    /**
     * Fills in default values.
     */
    function merge(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var def = arguments[i]
            for (var n in def) {
                if (obj[n] === undefined) obj[n] = def[n]
            }
        }
        return obj
    }

    /**
     * Returns the line color from the given string or array.
     */
    function getColor(color, idx) {
        return typeof color == 'string' ? color : color[idx % color.length]
    }

    // Built-in defaults

    var defaults = {
        lines: 12             // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#000'         // #rgb or #rrggbb
    , opacity: 1 / 4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1              // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }

    /** The constructor */
    function Spinner(o) {
        this.opts = merge(o || {}, Spinner.defaults, defaults)
    }

    // Global defaults that override the built-ins:
    Spinner.defaults = {}

    merge(Spinner.prototype, {
        /**
         * Adds the spinner to the given target element. If this instance is already
         * spinning, it is automatically removed from its previous target b calling
         * stop() internally.
         */
        spin: function (target) {
            this.stop()

            var self = this
              , o = self.opts
              , el = self.el = createEl(null, { className: o.className })

            css(el, {
                position: o.position
            , width: 0
            , zIndex: o.zIndex
            , left: o.left
            , top: o.top
            })

            if (target) {
                target.insertBefore(el, target.firstChild || null)
            }

            el.setAttribute('role', 'progressbar')
            self.lines(el, self.opts)

            if (!useCssAnimations) {
                // No CSS animation support, use setTimeout() instead
                var i = 0
                  , start = (o.lines - 1) * (1 - o.direction) / 2
                  , alpha
                  , fps = o.fps
                  , f = fps / o.speed
                  , ostep = (1 - o.opacity) / (f * o.trail / 100)
                  , astep = f / o.lines

                ; (function anim() {
                    i++
                    for (var j = 0; j < o.lines; j++) {
                        alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

                        self.opacity(el, j * o.direction + start, alpha, o)
                    }
                    self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
                })()
            }
            return self
        }

        /**
         * Stops and removes the Spinner.
         */
    , stop: function () {
        var el = this.el
        if (el) {
            clearTimeout(this.timeout)
            if (el.parentNode) el.parentNode.removeChild(el)
            this.el = undefined
        }
        return this
    }

        /**
         * Internal method that draws the individual lines. Will be overwritten
         * in VML fallback mode below.
         */
    , lines: function (el, o) {
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , seg

        function fill(color, shadow) {
            return css(createEl(), {
                position: 'absolute'
            , width: o.scale * (o.length + o.width) + 'px'
            , height: o.scale * o.width + 'px'
            , background: color
            , boxShadow: shadow
            , transformOrigin: 'left'
            , transform: 'rotate(' + ~~(360 / o.lines * i + o.rotate) + 'deg) translate(' + o.scale * o.radius + 'px' + ',0)'
            , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
            })
        }

        for (; i < o.lines; i++) {
            seg = css(createEl(), {
                position: 'absolute'
            , top: 1 + ~(o.scale * o.width / 2) + 'px'
            , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
            , opacity: o.opacity
            , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
            })

            if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), { top: '2px' }))
            ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
        }
        return el
    }

        /**
         * Internal method that adjusts the opacity of a single line.
         * Will be overwritten in VML fallback mode below.
         */
    , opacity: function (el, i, val) {
        if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

    })


    function initVML() {

        /* Utility function to create a VML tag */
        function vml(tag, attr) {
            return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
        }

        // No CSS transforms but VML support, add a CSS rule for VML elements:
        sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

        Spinner.prototype.lines = function (el, o) {
            var r = o.scale * (o.length + o.width)
              , s = o.scale * 2 * r

            function grp() {
                return css(
                  vml('group', {
                      coordsize: s + ' ' + s
                  , coordorigin: -r + ' ' + -r
                  })
                , { width: s, height: s }
                )
            }

            var margin = -(o.width + o.length) * o.scale * 2 + 'px'
              , g = css(grp(), { position: 'absolute', top: margin, left: margin })
              , i

            function seg(i, dx, filter) {
                ins(
                  g
                , ins(
                    css(grp(), { rotation: 360 / o.lines * i + 'deg', left: ~~dx })
                  , ins(
                      css(
                        vml('roundrect', { arcsize: o.corners })
                      , {
                          width: r
                        , height: o.scale * o.width
                        , left: o.scale * o.radius
                        , top: -o.scale * o.width >> 1
                        , filter: filter
                      }
                      )
                    , vml('fill', { color: getColor(o.color, i), opacity: o.opacity })
                    , vml('stroke', { opacity: 0 }) // transparent stroke to fix color bleeding upon opacity change
                    )
                  )
                )
            }

            if (o.shadow)
                for (i = 1; i <= o.lines; i++) {
                    seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
                }

            for (i = 1; i <= o.lines; i++) seg(i)
            return ins(el, g)
        }

        Spinner.prototype.opacity = function (el, i, val, o) {
            var c = el.firstChild
            o = o.shadow && o.lines || 0
            if (c && i + o < c.childNodes.length) {
                c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
                if (c) c.opacity = val
            }
        }
    }

    if (typeof document !== 'undefined') {
        sheet = (function () {
            var el = createEl('style', { type: 'text/css' })
            ins(document.getElementsByTagName('head')[0], el)
            return el.sheet || el.styleSheet
        }())

        var probe = css(createEl('group'), { behavior: 'url(#default#VML)' })

        if (!vendor(probe, 'transform') && probe.adj) initVML()
        else useCssAnimations = vendor(probe, 'animation')
    }

    return Spinner

}));
(function ($) {

    $.fn.tableHeadFixer = function (param) {

        return this.each(function () {
            table.call(this);
        });

        function table() {
            var settings = $.extend( 
                {
                    head: true,
                    foot: false,
                    left: 0,
                    right: 0,
                    'z-index': 0
                }, param || {}
            );

            settings.table = this;
            $(this).css('border-collapse', 'inherit');
            settings.parent = $(settings.table).parent();
            setParent();

            if (settings.head === true)           fixHead();
            if (settings.foot === true)           fixFoot();
            if (settings.left > 0)                fixLeft();
            if (settings.right > 0)               fixRight();

            setCorner();
            $(settings.parent).trigger("scroll");

            $(window).on("resize",function () {
                $(settings.parent).trigger("scroll");
            });

/*This function solver z-index problem in corner cell where fix row and column at the same time,
set corner cells z-index 1 more then other fixed cells
*/
            function setCorner() {
                var table = $(settings.table);

                if (settings.head) {
                    if (settings.left > 0) {
                        var tr = table.find("thead tr");
                        tr.each(function (k, row) {
                            solverLeftColspan(row, function (cell) {
                                $(cell).css("z-index", settings['z-index'] + 1);
                            });
                        });
                    }

                    if (settings.right > 0) {
                        tr = table.find("thead tr");
                        tr.each(function (k, row) {
                            solveRightColspan(row, function (cell) {
                                $(cell).css("z-index", settings['z-index'] + 1);
                            });
                        });
                    }
                }

                if (settings.foot) {
                    if (settings.left > 0) {
                        tr = table.find("tfoot tr");
                        tr.each(function (k, row) {
                            solverLeftColspan(row, function (cell) {
                                $(cell).css("z-index", settings['z-index']);
                            });
                        });
                    }

                    if (settings.right > 0) {
                        tr = table.find("tfoot tr");
                        tr.each(function (k, row) {
                            solveRightColspan(row, function (cell) {
                                $(cell).css("z-index", settings['z-index']);
                            });
                        });
                    }
                }
            }

            // Set style of table parent
            function setParent() {
                var parent = $(settings.parent);
                var table  = $(settings.table);

                parent.append(table);
                parent
                    .css({
                        'overflow-x': 'auto',
                        'overflow-y': 'auto'
                    });
                parent.on('scroll',function () {
                    var scrollWidth  = parent[0].scrollWidth;
                    var clientWidth  = parent[0].clientWidth;
                    var scrollHeight = parent[0].scrollHeight;
                    var clientHeight = parent[0].clientHeight;
                    var top          = parent.scrollTop();
                    var left         = parent.scrollLeft();

                    if (settings.head)      this.find("thead tr > *").css("top", top);
                    if (settings.foot)      this.find("tfoot tr > *").css("bottom", scrollHeight - clientHeight - top);
                    if (settings.left > 0)  settings.leftColumns.css("left", left);
                    if (settings.right > 0) settings.rightColumns.css("right", scrollWidth - clientWidth - left);
                }.bind(table));
            }

            // Set table head fixed
            function fixHead() {
                var thead = $(settings.table).find("thead");
                var tr    = thead.find("tr");
                var cells = thead.find("tr > *");

                setBackground(cells);
                cells.css({
                    'position': 'relative',
                    'background-clip': 'padding-box'
                });
            }

            // Set table foot fixed
            function fixFoot() {
                var tfoot = $(settings.table).find("tfoot");
                //var tr    = tfoot.find("tr");
                var cells = tfoot.find("tr > *");

                setBackground(cells);
                cells.css({
                    'position': 'relative',
                    'background-clip': 'padding-box'
                });
            }

            // Set table left column fixed
            function fixLeft() {
                var table = $(settings.table);
                settings.leftColumns = $();

                var tr = table.find("tr");
                tr.each(function (k, row) {
                    solverLeftColspan(row, function (cell) {
                        settings.leftColumns = settings.leftColumns.add(cell);
                    });
                });

                var column = settings.leftColumns;
                column.each(function (k, cell) {
                    cell = $(cell);

                    setBackground(cell);
                    cell.css({
                        'position': 'relative',
                        'background-clip': 'padding-box'
                    });
                });
            }

            // Set table right column fixed
            function fixRight() {
                var table = $(settings.table);
                var fixColumn = settings.right;
                settings.rightColumns = $();

                var tr = table.find("tr");
                tr.each(function (k, row) {
                    solveRightColspan(row, function (cell) {
                        settings.rightColumns = settings.rightColumns.add(cell);
                    });
                });

                var column = settings.rightColumns;
                column.each(function (k, cell) {
                    cell = $(cell);
                    setBackground(cell);
                    cell.css({
                        'position': 'relative',
                        'background-clip': 'padding-box'
                    });
                });
            }

            // Set fixed cells backgrounds
            function setBackground(elements) {
                elements.each(function (k, element) {
                    element = $(element);
                    var parent  = $(element).parent();

                    var elementBackground = element.css("background-color");
                    elementBackground     = elementBackground === "transparent" || elementBackground === "rgba(0, 0, 0, 0)" ? null : elementBackground;

                    var parentBackground = parent.css("background-color");
                    parentBackground     = parentBackground === "transparent" || parentBackground === "rgba(0, 0, 0, 0)" ? null : parentBackground;

                    var background = parentBackground ? parentBackground : "white";
                    background     = elementBackground ? elementBackground : background;

                    element.css("background-color", background);
                });
            }

            function solverLeftColspan(row, action) {
                var fixColumn = settings.left;
                var inc       = 1;
                for (var i = 1; i <= fixColumn; i = i + inc) {
                    var nth = inc > 1 ? i - 1 : i;
                    var cell    = $(row).find("> *:nth-child(" + nth + ")");
                    var colspan = cell.prop("colspan");

                    if (cell.cellPos().left < fixColumn) {
                        action(cell);
                    }
                    inc = colspan;
                }
            }

            function solveRightColspan(row, action) {
                var fixColumn = settings.right;
                var inc       = 1;

                for (var i = 1; i <= fixColumn; i = i + inc) {
                    var nth = inc > 1 ? i - 1 : i;
                    var cell    = $(row).find("> *:nth-last-child(" + nth + ")");
                    var colspan = cell.prop("colspan");

                    action(cell);
                    inc = colspan;
                }
            }

        }
    };
})(jQuery);
(function ($) {
    /* scan individual table and set "cellPos" data in the form { left: x-coord, top: y-coord } */
    function scanTable($table) {
        var m = [];
        $table.children("tr").each(function (y, row) {
            $(row).children("td, th").each(function (x, cell) {
                var $cell = $(cell),
                    cspan = $cell.attr("colspan") | 0,
                    rspan = $cell.attr("rowspan") | 0,
                    tx, ty;
                cspan = cspan ? cspan : 1;
                rspan = rspan ? rspan : 1;
                for (; m[y] && m[y][x]; ++x);  //skip already occupied cells in current row
                for (tx = x; tx < x + cspan; ++tx) {  //mark matrix elements occupied by current cell with true
                    for (ty = y; ty < y + rspan; ++ty) {
                        if (!m[ty]) {  //fill missing rows
                            m[ty] = [];
                        }
                        m[ty][tx] = true;
                    }
                }
                var pos = { top: y, left: x };
                $cell.data("cellPos", pos);
            });
        });
    };

    /* plugin */
    $.fn.cellPos = function (rescan) {
        var $cell = this.first(),
            pos = $cell.data("cellPos");
        if (!pos || rescan) {
            var $table = $cell.closest("table, thead, tbody, tfoot");
            scanTable($table);
        }
        pos = $cell.data("cellPos");
        return pos;
    };
})(jQuery);