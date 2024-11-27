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
                    $('<i>').addClass('bi bi-sort-down').appendTo(th);
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
            $('th i.bi').filter('.bi-sort-down', '.bi-sort-down-alt')
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
            .filter('.bi-sort-down', '.bi-sort-down-alt','.bi-sort-up')
            .each(function (i) {
                if (i === colIndex) {
                    var oldClass = 'h';
                    if ($(this).hasClass('bi-sort-up')) oldClass = 'a';
                    if ($(this).hasClass('bi-sort-down-alt')) oldClass = 'd';
                    $(this).removeClass('bi-sort-down bi-sort-down-alt bi-sort-up');
                    if (oldClass === 'h' || oldClass === 'd') { $(this).addClass('bi-sort-up active'); sortAsc = true; }
                    if (oldClass === 'a') { $(this).addClass('bi-sort-down-alt active'); sortAsc = false; }
                } 
                else {
                    $(this).removeClass().addClass('bi bi-sort-down');
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
