/*
*slistbox - Client-side control
*Version 1.1
*@требует jQuery v1.8.2 и старше
*/
(function ($) {
    "use strict";
    var settings = {};
    $.ajaxSetup({ cache: false });
    var methods = {
        init: function (options) {
            settings = $.extend({
                url: null,
                multiple: false,
                selector: null,
                size: 3
            }, options);
            settings.selector = this.selector;
            this.data("slistbox", settings);
            makeList(this);
        },
        refresh: function () {
            $(this.data("slistbox").selector + " > select").children().remove();
            makeList(this);
            if (detectIE()>0)
                location.reload();
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
    function detectIE() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
        // other browser
        return false;
    }
    function makeList(inst) {
        var sett = inst.data("slistbox");
        $.ajax({
            type: "GET",
            headers: {
                'Cache-Control': 'no-cache no-store' 
            },
            url: sett.url + "?t=" + (new Date()).getTime(),
            cashe: false,
            success: function (dt) {
               if(dt.indexOf('<!DOCTYPE ') >=0){
                   document.open();
                   document.write(dt);
                   document.close();
                   return;
               }
               var sel = $(sett.selector + " > select");
               $(inst).show("slow");
               if (sel.length == 0)
                   sel = $('<select>').appendTo(inst);//sett.selector);
               if (sett.multiple === true)
                   sel.attr('size', sett.size).attr('multiple', null);
               if (dt.length > 0 ) {
                    for (var i = 0; i < dt.length; i++) {
                       var opt = $('<option>').attr('value', dt[i].Value).html(dt[i].Text).appendTo(sel);
                       if (dt[i].Selected === true) opt.attr('selected', "");
                       if (dt[i].Enabled === false) opt.attr('disabled', "");
                   }
               }
               else {
                    //var opt = $('<option>').attr('value', 0).html('нет данных').appendTo(sel);
                   $(inst).hide("slow");
               }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Ошибка чтения. url:" + sett.url + " Статус -  " + XMLHttpRequest.status + " Техт: " + XMLHttpRequest.responseText);
            }
        });
    };
})(jQuery);

/*
 * stree - Client-side tree control
 * Version 1.1
 * @требует jQuery v1.8.2 и старше
 * режимы(mode) - [singleSelect,multiSelect,comboTree]
 */

(function ($) {
	"use strict";
	$.stree = $.stree || {};
	$.fn.stree = function (options) {
		var settings = $.extend({
			url: null,
			mode: 'singleSelect', 
			defText: 'Выберите элемент дерева',
			imgPath: null,
			containerId: null,
			maxLevel: 20,
			CustomIcon: null
		}, options || {});
		$.fn.getSelIds = function () {
			var arrId = [];
			$('#' + settings.containerId + ' ul.tree li a.jqtree-selected').each(function () {
				arrId.push($(this).attr('id'));
			});
			return arrId;
		};
		$.fn.getFirstSelText = function () { return $('#' + settings.containerId + ' ul.tree li a.jqtree-selected').html(); };
		$.ajax({
			type: "GET",
			url: settings.url,
			success: function (data) {
				//if (data.length > 0 && data.indexOf('<!DOCTYPE ') === -1)
			    createTree(data);
				/*else {
					document.open();
					document.write(data);
					document.close();
				}*/
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			    alert("Ошибка. url: " + settings.url + " responseText " + XMLHttpRequest.responseText);
			}
		});
		$.extend($.stree, {
			refreshTree: function (data, sel, mode) {
				settings.containerId = sel;
				settings.mode = mode;
				$('#' + settings.containerId).children('*').remove();
				createTree(data);
/*				$('.TreeContainer ul.tree,	ul.tree ul').css('background: ' + settings.imgPath + '/vline.png repeat-y;');
				$('.TreeContainer ul.tree li').css('background: ' + settings.imgPath + '/node.png no-repeat;');
				$('.TreeContainer ul.tree li.last').css('background: ' + settings.imgPath + '/lastnode.png no-repeat;');
				$('.TreeContainer ul.tree li:last-child').css('background: #fff ' + settings.imgPath  + '/lastnode.png no-repeat;');*/
			}
		});
		var curLevel = 0;
		return this.each(function () {
		});
		function createTree(data) {
		    if (data.length === 0) {
		        $('#' + settings.containerId + ' ').addClass('alert-danger').html('Нет данных').hide('slow');
		        return;
		    }
		    else {
		        $('#' + settings.containerId + ' ').removeClass('alert-danger').html('').show('slow');
		    }
			if (data[0].ID === undefined) {
				alert("ID undefined!");
				return;
			}
			var selector = '#' + settings.containerId + ' ';
			if (settings.mode === 'multiSelect') {
				$('<input type="checkbox" id="ch-setsel" >').addClass('chck-set').appendTo('#' + settings.containerId);
				$('<label for="ch-setsel">').appendTo('#' + settings.containerId).html(settings.defText);
			}
			if (settings.mode === 'comboTree') {
			    var p = $('<div>').addClass('TreeCombo').appendTo('#' + settings.containerId);
				$('<input type="text">').addClass('TextItem')
                    .attr('disabled', '')
                    .attr('value', settings.defText)
                    .appendTo(p);
				$('<img>').attr('src', settings.imgPath + '/arrow-down.png').addClass('CtrlItem').appendTo(p).click(function (e) {
					if ($(selector + 'div.TreeContainer').is(':visible')) $(selector + 'div.TreeContainer').hide();
					else $(selector + 'div.TreeContainer').show();
				});
				p = $('<div>').addClass('TreeContainer').css('position','absolute').css('z-index','2').appendTo('#' + settings.containerId);
			}
            else p = $('<div>').addClass('TreeContainer').appendTo('#' + settings.containerId);
			p = $('<ul>').addClass('tree').appendTo(p);
			makeTree(p, data);

			$(selector + 'ul.tree li a').click(function (e) {
			}).mousedown(function (e) {
				if (e.which === 1) //1: left, 2: middle, 3: right
				{
					$(selector + 'ul.tree li').find('a').each(function () {
						if (settings.mode !== 'multiSelect') $(this).removeClass();
					});
					if (settings.mode === 'comboTree' || settings.mode === 'singleSelect') {
						if ($(this).hasClass("jqtree-selected")) $(this).removeClass();
						else $(this).addClass("jqtree-selected");
						if (settings.mode === 'comboTree') {
							$(selector + 'div.TreeCombo input.TextItem').val($(this).html());
							$(selector + 'div.TreeContainer').hide();
						}
					}
					if (settings.mode === 'multiSelect') {
						$(this).addClass("jqtree-selected");
					}
					$('#' + settings.containerId).trigger('selchange.stree', $(this).attr('id'));
				}
			});
			$(selector + ' input.chck-set').click(function (e) {
				if ($(this).prop('checked'))
					$(selector + 'ul.tree li').find('a').each(function () {
						$(this).addClass('jqtree-selected');
					});
				else $(selector + 'ul.tree li').find('a').each(function () {
					$(this).removeClass();
				});
			});
			var pos = $(selector + 'div.TreeContainer').offset().top;
			$(selector + 'div.TreeContainer li').find('a').each(function (index, element) {
				if (element.className === 'jqtree-selected') {
					$(selector + 'div.TreeContainer').scrollTop($(this).offset().top - pos);
				}
			});
			$(selector + 'ul.tree li').each(function () {
				$(this).children('img.parentNode').click(function () {
					ShowChildren(this);
				});
			});
			//if ($(selector + 'ul.tree li a.jqtree-selected').trigger('click'));
		}

		function makeTree(p, tree) {
			if (curLevel < settings.maxLevel) {
				curLevel++;
				for (var i = 0; i < tree.length; i++) {
				    var obj = $('<li></li>').appendTo(p);
				    if (tree[i].ToolTip)
				        obj.attr('title', tree[i].ToolTip);
					if (tree[i].Children.length > 0) {
						var imgctrl = $('<img></img>').addClass('parentNode').appendTo(obj);
						if (tree[i].CustomIcon.length > 0)
						    $('<img></img>').attr('src', tree[i].CustomIcon).appendTo(obj);
						if (tree[i].Selected) {
							if (settings.mode === 'comboTree') $('input.TextItem').attr('value', tree[i].Text);
							if (tree[i].Enabled === true)
							    $('<a id=' + tree[i].ID + '>' + tree[i].Text + '</a>').addClass('jqtree-selected')
                                    .appendTo(obj)
                                    .trigger('click');
							else
								$('<label id=' + tree[i].ID + '>' + tree[i].Text + '</label>').appendTo(obj);
							if (settings.mode === 'comboTree') $('#' + settings.containerId + ' ' + 'div.TreeContainer').hide();
						}
						else if (tree[i].Enabled === true)
							$('<a id=' + tree[i].ID + '>' + tree[i].Text + '</a>').appendTo(obj).trigger('click');
						else
						    $('<label id=' + tree[i].ID + '>' + tree[i].Text + '</label>').appendTo(obj);
						if (tree[i].Opened === false) {
							imgctrl.attr('src', settings.imgPath + '/plus.gif');
							obj = $('<ul></ul>').attr('hidden', 'hidden').appendTo(obj);
						}
						else {
							imgctrl.attr('src', settings.imgPath + '/minus.gif');
							obj = $('<ul></ul>').appendTo(obj);
						}
						makeTree(obj, tree[i].Children);
					}
					else {
						if (tree[i].CustomIcon > 0) $('<img></img>').attr('src', tree[i].CustomIcon).appendTo(obj);
						if (tree[i].Selected) {
							if (settings.mode === 'comboTree') $('input.TextItem').attr('value', tree[i].Text);
							if (tree[i].Enabled === true)
								$('<a id=' + tree[i].ID + '>' + tree[i].Text + '</a>').addClass('jqtree-selected').appendTo(obj).trigger('click');
							else
								$('<label id=' + tree[i].ID + '>' + tree[i].Text + '</label>').appendTo(obj);
							if (settings.mode === 'comboTree') $('#' + settings.containerId + ' ' + 'div.TreeContainer').hide();
						}
						else if (tree[i].Enabled === true)
							$('<a id=' + tree[i].ID + '>' + tree[i].Text + '</a>').appendTo(obj).trigger('click');
						else
							$('<label id=' + tree[i].ID + '>' + tree[i].Text + '</label>').appendTo(obj);
					}
				}
				curLevel--;
			}
		}

		function ShowChildren(ctrl) {
			if ($(ctrl).attr('src') === settings.imgPath + '/plus.gif') $(ctrl).attr('src', settings.imgPath + '/minus.gif');
			else $(ctrl).attr('src', settings.imgPath + '/plus.gif');
			if ($(ctrl).next('a').next('ul').is(':visible')) $(ctrl).next('a').next('ul').hide('slow');
			else $(ctrl).next('a').next('ul').show('slow');
			if ($(ctrl).next('img').next('a').next('ul').is(':visible')) $(ctrl).next('img').next('a').next('ul').hide('slow');
			else $(ctrl).next('img').next('a').next('ul').show('slow');

			if ($(ctrl).next('label').next('ul').is(':visible')) $(ctrl).next('label').next('ul').hide('slow');
			else $(ctrl).next('label').next('ul').show('slow');
		}
	};
	$.fn.refreshData = function (url, sel, mode) {
		$.ajax({
			type: "GET",
			url: url,
			success: function (tree_data) {
				$.stree.refreshTree(tree_data, sel, mode);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			    alert("Ошибка запроса refreshData. url: " + settings.url + " Статус -  " + XMLHttpRequest.status + " responseText: " + XMLHttpRequest.responseText);
			}
		});
	};
})(jQuery);

/*
 * sddMenu - Client-side dropdown Menu control for bootstrap menu
 * Version 1.1
 * @требует jQuery v1.10.2 и старше
 * @требует bootstrap v3.0.0 и старше
*/
(function ($) {
    "use strict";
    var settings = {};
    var methods = {
        init: function (options) {
            settings = $.extend({
                menu: [{ id: 0, href: '/', text: '', title: '', show: true }],
                ddmenu: {
                    id: 0, beforeId: 0, separPos: null, ddName: 'Действия',
                    actions: [{ id: 0, href: '/', text: '', title: '', show: true }
                    ]
                }
            }, options);
            this.data("sMenu", settings);
            makeMenu(this);
            $(this).sMenu('changeMenu');
        },
        hide: function (id) {
            $('ul.dropdown-menu li a').each(function (i, obj) {
                if ($(obj).attr('id').toString() === id.toString()) {
                    $(obj).parent().attr('hidden', 'hidden');
                }
            });
            $('li#' + id).addClass('hidden-sm hidden-md hidden-lg');
        },
        show: function (id) {
            $('ul.dropdown-menu li a').each(function (i, obj) {
                if ($(obj).attr('id').toString() === id.toString()) {
                    $(obj).parent().removeAttr('hidden');
                }
            });
            $('li#' + id).removeClass('hidden-sm hidden-md hidden-lg');
        },
        changeMenu: function () {
            var $this = $(this);
            $.ajax({
                url: settings.ddmenu.url,
                type: "GET",
                cache: false,
                success: function (data) {
                    //console.log(data);
                    for (var i = 0; i < data.ddList.length; i++){
                        switch (data.ddList[i].Show) {
                            case true:
                                $this.sMenu('show', data.ddList[i].Item);
                                break;
                            case false:
                                $this.sMenu('hide', data.ddList[i].Item);
                                break;
                            default: break;
                        }
                    };
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Ошибка чтения сатуса пунктов меню. Статус -  " + XMLHttpRequest.status + " Техт: " + XMLHttpRequest.responseText);
                }
            });
        }
    };
    $.fn.sMenu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод ' + method + ' не существует в jQuery.sddMenu');
        }

    };

    function makeMenu(inst) {
        var li = $(inst).find('li').first();
        if (settings.menu !== null && settings.menu !== undefined) {
            for (var i = 0 ; i < settings.menu.length; i++) {
                var content = '<li id="' + settings.menu[i].id;
                content += '"><a href="' + settings.menu[i].href + '"';
                content += ' title="';
                content += settings.menu[i].title;
                content += '">' + settings.menu[i].text + '</a></li>';
                li.before(content);
            }
        }
        if (settings.ddmenu !== null && settings.ddmenu !== undefined) {
            $('ul.nav.navbar-nav').find('li').each(function (indx, v) {
                if (v.id === settings.ddmenu.beforeId.toString()) {
                    var ddli = $('<li></li>').insertBefore(v).addClass('dropdown').attr('id', settings.ddmenu.id);
                    var a = $('<a href="#" class="dropdown-toggle" id="drop1" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"></a>')
                        .appendTo(ddli)
                    .html(settings.ddmenu.ddName)
                    .append('<span class="caret"></span>');
                    var ul = $('<ul class="dropdown-menu" aria-labelledby="drop1"></ul>').insertAfter(a);
                    var li;
                    $.each(settings.ddmenu.actions, function (i, obj) {
                        if (i === settings.ddmenu.separPos) $('<li role="separator" class="divider"></li>').insertAfter(li);
                        li = $('<li></li>').appendTo(ul);
                        if (obj.title !== null) li.attr('title', obj.title);
                        if (obj.show === false || obj.show === undefined) li.attr('hidden', 'hidden');
                        var anc = $('<a></a>').appendTo(li)
                            .attr('id', obj.id)
                            .html(obj.text);
                        if (obj.href !== null && obj.href !== undefined)
                            anc.attr('href', obj.href);
                    });
                }
                if (settings.ddmenu.show !== true)
                    $('li.dropdown').addClass('disabled');
            });
        }
        $('ul.dropdown-menu li a').click(function (e) { }).mousedown(function (e) {
            if (e.which === 1) {
                var id = $(this).attr('id');
                $('div.navbar').trigger('selchange.sddMenu', id);
            }
        });
    };
})(jQuery);

/*
 * jQuery sgrid Plugin 1.3.0
 * @требует jQuery v1.8.2 и старше
 * требует Bootstrap v2 и старше
 */
(function ($) {
    "use strict";
    var idForm = '';
    var startForm = null;
    var max_recursive_calls = 100;
    var headerNames = [];
    var filterColumn = '';
    var requestParamStr = '';
    var methods = {
        initGrid: function (options) {
            var settings = $.extend({}, {
                geturl: null,
                posturl: null,
                getImgUrl: null,
                cellsDataUrl: null,
                showAlert: false,
                decimalDelimiter: ',',
                dateDelimiter: '/',
                formMode: 'Input',
                readOnly: false,
                root: '',
                hasTreeColumn: false,
                expanderTemplate: '<span class="sgrid-expander"></span>',
                indentTemplate: '<span class="sgrid-indent"></span>',
                expanderExpandedClass: 'glyphicon glyphicon-minus',
                expanderCollapsedClass: 'glyphicon glyphicon-plus',
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
                $this.sgrid('setForm', 0);//0,0,0);
                $this.sgrid('createProgressBar', $(this));
                if (settings.modalRowEdit === "true")
                    $this.sgrid('createModalEdit', $(this));
                if (settings.filterColumns !== null && settings.filterColumns.length > 0)
                    $this.sgrid('createFilterDialog', $(this));
            });
        },
        /**
        * Set sgrid container
        * @param {HtmlElement} container
        */
        setGridContainer: function (container) {
            return $(this).data('sgrid', container);
        },
        /**
         * Return sgrid container
         * @returns {HtmlElement}
         */
        getGridContainer: function () {
            return $(this).data('sgrid');
        },
        /**
        * Method return setting by name
        * @param {type} name
        * @returns {unresolved}
        */
        getSettings: function (name) {
            if (!$(this).sgrid('getGridContainer')) {
                return null;
            }
            return $(this).sgrid('getGridContainer').data('settings')[name];
        },
        /**
         * Add new settings
         * @param {Object} settings
         */
        setSettings: function (settings) {
            $(this).sgrid('getGridContainer').data('settings', settings);
        },
        /**
        *set option "name" to value
        */
        changeSetting: function (name, value) {
            $(this).sgrid('getGridContainer').data('settings')[name] = value;
        },
        /**
        *Method create bootstrap progressBar dialog 
        *@param {HtmlElement} container
        */
        createProgressBar: function (container) {
            var dlg = $('<div class="modal fade in" id="mod-progress" role="dialog">').appendTo(container);
            var obj = $('<div>').addClass('modal-dialog').appendTo(dlg);
            var cont = $('<div>').addClass('modal-content').appendTo(obj);
            var body = $('<div>').addClass('modal-body').appendTo(cont);
            obj = $('<div>').addClass('text-center').appendTo(body);
            obj = $('<div id="result" style="font-size: 1.1em; padding-bottom: 5px">').appendTo(obj);
            $('<p id="progressBarParagraph">').appendTo(obj);
            obj = $('<div id="ProgressStripe" class="progress progress-striped active" style="position:relative; top:10px; width:100%;">').insertAfter(obj);
            $('<div id="ProgressMessage" class="progress-bar progress-bar-info" style="width: 100%; border:none;"></div>').appendTo(obj);
            $('<div class="modal-footer">').html('Остановить процесс - Esc').appendTo(cont);
        },
        /**Method create modal row editor
        *@param {HtmlElement} container
        */
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
        /**Method create labels and fields 
        *@param grid row
        */
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
        /**Method create modal filter dialog
        *@param {HtmlElement} container
        */
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
        /**show all hidden row
        */
        showAll: function () {
            $('tr:hidden', this).show();
        },
        /**
        *показывать только строки содержащие val в колонке filterColumn  
        */
        showOnly: function (val) {
            $('td[id*=_' + filterColumn + ']').each(function () {
                if (this.innerText == val) $(this).parent('tr').show();
                else $(this).parent('tr').hide();
            });
        },
        /**
        *Save form ID
        */
        setIdForm: function (id) { idForm = id; },
        /**
        *get ID current form
        */
        getIdForm: function () { return idForm; },
        /**
        *Get started form ID
        */
        getStartFormId: function () { return startForm; },
        /**доп. параметры в форме ?a=val&b=v...
        */
        setParams: function (paramStr) {
            requestParamStr = paramStr;
        },
        /**
        *Create form
        */
        setForm: function (id){//id,row,col) {
            if (startForm === null)
                startForm = id;
            var $this = $(this);
            $this.sgrid('clearForm');
            $this.sgrid('setIdForm', id);
            var u = $this.sgrid('getSettings', 'root') + $this.sgrid('getSettings', 'geturl');
            if (requestParamStr.length > 0)
                u += requestParamStr;
            return $.ajax({
                type: "GET",
                //data: dt,//'id=' + id + '&r=' + row + '&c=' + col,
                url: u,
                success: function (formData) {
                    var readOnly = $this.sgrid('getSettings', 'readOnly');
                    makeHeader(formData, $this);
                    if (readOnly === true) {
                        createRoGrid(formData, $this);
                    }
                    else {
                        createGrid(formData, $this, $this.sgrid('getSettings', 'dateDelimiter'));
                    }
                    makeTail($this);
                    initHistoryEvent($this);
                    $this.trigger('formReady.sgrid');
                    $this.sgrid('setPencil');
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Ошибка чтения данных. Статус -  " + XMLHttpRequest.status + " Техт: " + XMLHttpRequest.responseText);
                }
            });
        },
        /**
        *Clear form container
        */
        clearForm: function () {
            var container = $(this).sgrid('getGridContainer');
            $(container).find('div').remove();
        },
        /**
        *Method update cell data
        *@param {key} строка вида 15_6 - row-column. Отсчет с 0. 
        *@param {val} - string Value
        *@param {type} - see emum CellType
        *@param {mode} - see enum CellMode
        */
        updateCell: function (key, val, type, mode,tooltip) {
            var h = null;
            if (mode === 7) {//Error
                key = 'td' + key;
                h = $("[id='" + key + "']");
                h.addClass('cell_error').attr('title', val);
                return;
            }
            if (mode === 6) {//Header
                key = key + '_th';
                h = $("[id='" + key + "']");
                h[0].innerText = val;
                return;
            }
            var container = $(this).sgrid('getGridContainer');
            var isInput = ((mode == 1 || mode == 3) && !$(container).sgrid('getSettings', 'readOnly'));
            h = $("[id='" + key + "']");
            if (h === null || h === undefined) return;
            $('td#td'+key).attr('title', tooltip);
            if (isInput) {
                h.removeAttr('disabled');
            }
            else {
                h.attr('disabled', 'disabled');
            }
            if (h.length > 0) {
                switch (type) {
                    case 1: case 2: case 3: case 4: case 5: case 6: case 8:
                        if (h[0].localName === 'input'){
                            h[0].value = val;
                         }
                        else h[0].innerText = val;
                        break;
                    case 7:
                        var b = $(h[0]);
                        b.prop('checked', val);
                        break;
                    case 9://BLob
                        $(h[0]).attr('src', container.sgrid('getSettings', 'root') + container.sgrid('getSettings', 'posturl') + '?id=' + val);
                        break;
                    case 10:
                        var opt = $(h[0]).children('option').removeAttr('selected');
                        opt.each(function (indx, elem) {
                            if (elem.value === val)
                                $(elem).attr('selected', 'selected');
                        });
                        break;
                    case 11:
                        $(h[0]).attr('href', val);
                        break;
                    default: break;
                }
            }

        },
        /**
        *Method change mode
        *@parm  mode = Input or History
        */
        changeMode: function (mode) {
            if (settings.formMode === mode) return;
            switch (mode) {
                case 'Input':
                    $(selector + ' td.cell_input').children().removeAttr('disabled');
                    $(selector + ' td.cell_fromhistory').children().attr('disabled', 'disabled');
                    break;
                case 'History':
                    $(selector + ' td.cell_input').children().attr('disabled', 'disabled');
                    $(selector + ' td.cell_fromhistory').children().removeAttr('disabled');
                    break;
                default:
                    alert('mode может принимать значения: Input , History !');
                    break;
            }
            settings.formMode = mode;
        },
        /**
        *Method get cells data from server
        *@param initial 0
        */
        getCellsData: function (i) {
            var can_break = false;
            var $this = $(this);
            $(document).keydown(function (evnt) {
                if (evnt.which == 27) {
                    //evnt.preventDefault();//IE specific
                    can_break = true;
                }
            });
            $.ajax({
                url: $this.sgrid('getSettings', 'root') + $this.sgrid('getSettings', 'cellsDataUrl') + "?i=" + i.toString(),
                async: true,
                cache: false,
                success: function (data) {
                    $.each(data.cells, function (indx, val) {
                        $this.sgrid('updateCell', val.Row + '_' + val.Column, val.Value, val.Type, val.Mode, val.Tooltip);
                    });
                    ProgressBarModal("show", "Выполнено " + data.Percent + "%");
                    $('#ProgressMessage').width(data.Percent + "%");

                    if (data.Percent >= "100" || can_break || i >= max_recursive_calls) {
                        ProgressBarModal();
                        $this.trigger('dataReady.sgrid');
                        return;
                    } else $this.sgrid('getCellsData', i++);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Ошибка чтения данных. Статус -  " + XMLHttpRequest.status + " Техт: " + XMLHttpRequest.responseText);
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
        /**только для treeGrid
        */
        hideRow: function (row) {
            $('tr[row=' + row + ']').hide();
        },
        /**только для treeGrid
        */
        showRow: function (row) {
            $('tr[row=' + row + ']').show();
        },
        /*
        */
        setPencil: function () {
            var $this = $(this);
            var col = $this.sgrid('getSettings', 'nameCol4Modal');
            if ($this.sgrid('getSettings', 'modalRowEdit') == "true") {
                $('tr td').each(function (indx, val) {
                    var arr = val.id.split('_', 2);
                    if (arr.length > 1 && arr[1] === col) {
                        $(val).prepend('<span class="glyphicon glyphicon-pencil"></span>');
                    }
                });
            }
        },
        addRemoveIcon: function () {
            var $this = $(this);
            $('tbody tr td:first-child', $this).prepend('<span class="glyphicon glyphicon-remove"></span>');
            $('tbody tr:last td span', $this).removeClass('glyphicon-remove').addClass('glyphicon-plus-sign');
        },
        onRemoveRowEvnt: function () {
            var $this = $(this);
            $('td > span.glyphicon-remove').click(function (evnt) {
                var td = $(evnt.target.parentElement);
                var id = td.attr('id').replace('td', '');
                var arr = id.slice('_');
                $this.sgrid('rowDeleted', arr[0]);
                td.parent().remove();
            });
        },
        onAddRowEvnt: function () {
            var $this = $(this);
            $('td > span.glyphicon-plus-sign').click(function (evnt) {
                var td = $(evnt.target.parentElement);
                var id = td.attr('id').replace('td', '');
                var arr = id.slice('_');
                $this.sgrid('addRow', arr[0]);
            });
        },
        offRemoveRowEvnt: function () {
            $('td > span.glyphicon-remove').off('click');
        },
        offAddRowEvnt: function () {
            $('td > span.glyphicon-plus-sign').off('click');
        },
        rowDeleted: function (row) {
            $(this).trigger('rowChanged.sgrid', [row,0]);
        },
        addRow: function (lastId) {
            var $this = $(this);
            $this.sgrid('offRemoveRowEvnt');
            $this.sgrid('offAddRowEvnt');
            var newRow = parseInt(lastId) + 1;
            $('tbody tr:last td:first span', $this).removeClass('glyphicon-plus-sign').addClass('glyphicon-remove');
            $('tbody tr:last', $this).clone(true).appendTo('tbody');
            $('tbody tr:last td:first span', $this).removeClass('glyphicon-remove').addClass('glyphicon-plus-sign');
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
    /**
    *sgrid plugin
    */
    $.fn.sgrid = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.initGrid.apply(this, arguments);
        } else {
            $.error('Method with name ' + method + ' does not exists for jQuery.sgrid');
        }
    };
    /**
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
        obj.css("overflow","auto");
        var headerRow4Modal = $(selector).sgrid('getSettings','nameRow4Modal');
        headerNames.length = 0;
        obj = $('<table>').addClass('scroll').appendTo(obj);
        var head = $('<thead>').appendTo(obj);
        for (var i = 0; i < header.HeaderRows.length; i++) {
            var row = $('<tr>').appendTo(head);
            for (var j = 0; j < header.Columns.length; j++) {
                var key = header.HeaderRows[i] + '_' + header.Columns[j];
                var th = $('<th scope="col">')
                    .attr('colspan', header.Header[key].ColSpan)
                    .attr('rowspan', header.Header[key].RowSpan)
                    .attr('id', key + '_th')
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
                    $('<span>').addClass('glyphicon glyphicon-sort').appendTo(th);
                    var fc = $(selector).sgrid('getSettings', 'filterColumns');
                    if (fc!=null&&fc.indexOf(header.Columns[j]) >= 0)
                        $('<span>').addClass('glyphicon glyphicon-filter').prependTo(th);
                }
            }
        }
        var body = $('<tbody>').attr('id', 'stbody').appendTo(obj);
        var header_height = 0;//set header_height if vertical text
        $('table th span.vertical').each(function () {
            if ($(this).outerWidth() > header_height) header_height = $(this).outerWidth();
        });
        $('table tr.vertical th').height(header_height + 10);
    };

    function createGrid(data, selector, dateDelimiter) {
        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        var dateplaceholder = day + dateDelimiter + month + dateDelimiter + year;
        var body = $(selector).find('table.scroll tbody');
        for (var i = 0; i < data.Rows.length; i++) {
            var row = $('<tr>').appendTo(body);
            for (var j = 0; j < data.Columns.length; j++) {
                var key = data.Rows[i] + '_' + data.Columns[j];
                var td = $('<td>').attr('id', 'td' + key).appendTo(row);
                var cell = data.Cells[key];
                if (cell === undefined) continue;
                switch (cell.Mode) {
                    case 0:
                        td.addClass('cell_disabled')
                            .attr('dataType', cell.Type)
                            .html(cell.Value);
                        if (cell.Type === 1 || cell.Type === 5 || cell.Type === 6)
                            td.addClass('sform-right-align');
                        break;
                    case 1: case 4:
                        td.addClass('cell_input');
                        break;
                    case 2:
                        td.addClass('cell_calculated');
                        break;
                    case 3: case 5:
                        td.addClass('cell_fromhistory');
                        break;
                    default: break;
                }
/*                if ($(selector).sgrid('getSettings', 'modalRowEdit') == "true" && j === 0) {
                    td.addClass('glyphicon glyphicon-pencil');
                }*/
                var isInput = ((cell.Mode == 1 || cell.Mode == 3) && $(selector).sgrid('getSettings', 'readOnly') === false);
                if (cell.Tooltip !== undefined && cell.Tooltip !== null && cell.Tooltip.length > 0)
                    td.attr('title', cell.Tooltip);
                var inp = $('<input>').attr('name', key + "_" + cell.Type).attr('id', key);
                switch (cell.Type) {
                    case 1://Number
                        inp.attr("type", "text").addClass("sform-right-align").attr("value", cell.Value);
                        if (isInput) inp.attr('placeholder', '00,00');
                        else inp.attr('disabled', 'disabled');
                        inp.appendTo(td);
                        break;
                    case 2://Text
                        if (isInput)
                            inp.attr("type", "text").attr("value", cell.Value).attr('placeholder', 'введите текст').appendTo(td);
                        else {
                            if (cell.Mode === 4 || cell.Mode === 5) {
                                inp.attr('type', 'text').addClass("sform-left-align").attr("value", cell.Value).attr('disabled', 'disabled');
                                inp.appendTo(td);
                            } else td.addClass("sform-left-align").html(cell.Value);
                        }
                        break;
                    case 3://Date
                        inp.attr("type", "text").attr("value", cell.Value);
                        if (isInput) inp.attr('placeholder', dateplaceholder);
                        else inp.attr('disabled', 'disabled');
                        inp.appendTo(td);
                        break;
                    case 4://DateTime
                        inp.attr("type", "text").attr("value", cell.Value);
                        if (isInput)//||cell.Mode===3)
                            inp.attr('placeholder', dateplaceholder + ' 00:00:00');
                        else inp.attr('disabled', 'disabled');
                        inp.appendTo(td);
                        break;
                    case 5://Integer
                        inp.attr("type", "text").addClass("sform-right-align").attr("value", cell.Value)
                        if (isInput) inp.attr('placeholder', 'введите целое');
                        else inp.attr('disabled', 'disabled');
                        inp.appendTo(td);
                        break;
                    case 6://IntRange
                        inp.attr("type", "text").addClass("sform-right-align").attr("value", cell.Value);
                        if (isInput)
                            inp.attr('min', cell.Min).attr('max', cell.Max).attr('placeholder', 'целое от ' + cell.Min + ' до ' + cell.Max);
                        else inp.attr('disabled', 'disabled');
                        inp.appendTo(td);
                        break;
                    case 7://Boolean:
                        inp.attr("type", "checkbox").attr("name", key + "_" + cell.Type).appendTo(td).after(cell.Value);
                        inp.prop('checked', cell.BoolValue);
                        if (!isInput) inp.attr('disabled', 'disabled');
                        break;
                    case 8://CLob:
                        var ta = $('<textarea>')
                            .attr('id', key)
                            .attr("name", key + "_" + cell.Type)
                            .attr('rows', cell.Rows)
                            .attr('cols', cell.Cols)
                            .html(cell.Value)
                            .appendTo(td);
                        if (!isInput) ta.attr("disabled", "disabled");
                        break;
                    case 9://Blob
                        var img = $('<img>').attr('src', cell.Value).attr('id', key).appendTo(td);
                        break;
                    case 10://SelectList
                        var select = $('<select>').attr("name", key + "_" + cell.Type).attr('id', key).appendTo(td);
                        if (!isInput) select.attr("disabled", "disabled");
                        for (var p in cell.options) {
                            var opt = $('<option>').attr('value', p).html(cell.options[p]).appendTo(select);
                            if (p === cell.Value) opt.attr("selected", "selected");
                        }
                        break;
                    case 11://Button
                        $('<a>')
                            .attr('id', key)
                            .attr("name", key + "_" + cell.Type)
                            .attr("class", "btn btn-primary")
                            .attr("href", cell.Url)
                            .html(cell.Value)
                            .appendTo(td);
                        break;
                }
            }
        }
        if (data.VarRowCount === true) {
            $(selector).sgrid('addRemoveIcon');
            $(selector).sgrid('onAddRowEvnt');
            $(selector).sgrid('onRemoveRowEvnt');
        }
    };
    function createRoGrid(data, selector) {
        var body = $(selector).find('table.scroll tbody');
        for (var i = 0; i < data.Rows.length; i++) {
            var row = $('<tr>').appendTo(body);
            for (var j = 0; j < data.Columns.length; j++) {
                var td = $('<td>').appendTo(row);
                var key = data.Rows[i] + '_' + data.Columns[j];
                var cell = data.Cells[key];
                if (cell === undefined) continue;
                td.attr('id', 'td' + key).attr('dataType', cell.Type)
                if (cell.Type === 1 || cell.Type === 5 || cell.Type === 6)
                    td.addClass('sform-right-align');
                var rotext = cell.Value;
                switch (cell.Type) {
                    case 7: //boolean
                        if (cell.BoolValue) rotext = 'да';
                        else rotext = 'нет';
                        td.addClass('cell_disabled').html(rotext);
                        break;
                    case 10://SelectList
                        rotext = cell.options[cell.Value];
                        td.addClass('cell_disabled').html(rotext);
                        break;
                    case 12://tree
                        td.addClass('cell_disabled').html(rotext);
                        var exp = $(selector).sgrid('getSettings','expanderTemplate'),
                        indent = $(selector).sgrid('getSettings','indentTemplate'),
                        expandedClass = $(selector).sgrid('getSettings', 'expanderExpandedClass');
                        //collapsedClass = $(selector).sgrid('getSettings', 'expanderCollapsedClass');
                        exp = $(exp).prependTo(td);
                        td.parent().attr('row',cell.Row).attr('parentRow', cell.ParentRow);
                        for (var lv = 0; lv <= cell.Level; lv++) {
                            if (cell.HasChildren) exp.addClass('glyphicon glyphicon-minus');
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
        $('<div>')
            .addClass("overlay")
            .attr("title", "Ошибка ввода")
            .appendTo(container);
        var popup = $('<div>')
            .addClass("popup")
            .appendTo(container);
        $('<div>')
            .addClass("close_window")
            .html('X')
            .appendTo(popup);
        $('<p>')
            .attr("id", "inputerror")
            .appendTo(popup);
 
        var dateDelimiter = container.sgrid('getSettings', 'dateDelimiter');
        var decimalDelimiter = container.sgrid('getSettings', 'decimalDelimiter');
        $('#stbody input,#stbody textarea,#stbody select').bind('change', function (event) {
            var nm = $(this).prop('name').split("_", 3);
            var val = $(this).prop('value').toString();
            if (nm.length === 3) {
                var x = $(this).offset().left;
                var y = $(this).offset().top;
                if (validate(nm[2], val, $(this).prop('min'), $(this).prop('max'), dateDelimiter, decimalDelimiter)) {
                    if (nm[2] === "7") {//boolean cell type
                        val = $(this).prop('checked').toString();
                    }
                    $.ajax({
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
                                    $('input#' + msg.changed.Row + '_' + msg.changed.Column).val(msg.changed.Value);
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
                    var message = getTitle(nm[2], $(this).prop('min'), $(this).prop('max'),
                        container.sgrid('getSettings', 'decimalDelimiter'),
                        container.sgrid('getSettings', 'dateDelimiter'));
                    callPopup(x, y, message);
                }
            }
        });
    };

    function initHistoryEvent(container) {
        $("#stbody a").on('click', function (event) {
            event.preventDefault();
            var rc = $(this).attr('id').split('_', 2);
            container.sgrid('setForm', 0, rc[0], rc[1]);
            window.history.pushState({ idForm: $(this).attr('href') }, null, null);
           });
        window.onpopstate = function (event) {
            if (event.state == null) {
                container.sgrid('setForm', container.sgrid('getStartFormId'),0,0);
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
            $('th span.glyphicon').filter('.glyphicon-sort', '.glyphicon-sort-by-attributes', '.glyphicon-sort-by-attributes-alt')
                .click(function (e) {
                sortByColumn(e.currentTarget.parentNode.cellIndex, container);
            });
            $('th span.glyphicon-filter').click(function (e) {
                $(container).sgrid('initFilterDialog', e.currentTarget.parentElement.cellIndex, e.currentTarget.parentElement.innerText);
            });
            /*$('tr:first').children().click(function (e) {
                var colIndex = e.currentTarget.cellIndex;
                sortByColumn(colIndex, container);
            });*/
        }
        $('td > span.sgrid-expander').click(function () {
            var $this = $(this),
                opened = null;
            var currentRow = $($(this).closest('tr')).attr('row');
            if($this.hasClass('glyphicon-minus')){
                $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
                opened = true;
            }
            else {
                if ($this.hasClass('glyphicon-plus')){
                    $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
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
                        container.sgrid('hideRow',val);
                    else
                        container.sgrid('showRow',val);
                });

               
            }
        });
        //row modal edit event
        $('td').click(function (evnt) {
            if ($(evnt.target.children).hasClass('glyphicon-pencil'))
                container.sgrid('initModalRowEdit', $(evnt.target).parent(), $(evnt.target).text());
            evnt.preventDefault();
        });
        $('#dlgBtnSave').click(function (evnt) {
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
        $('#dlgBtnFilter').click(function (evnt) {
            var dlg = $('#FilterDlg');
            var selVal = "";
            $('#filterSelect',dlg).find(':selected').each(function (indx, elem) {
                selVal = $(elem).val();
            });
            if (selVal === "") container.sgrid('showAll');
            else container.sgrid('showOnly', selVal);
        });
    };


    function validate(type, val, min, max, dateDelimiter, decimalDelimiter) {
        var pattern;
        var datePattern = '^(0[1-9]|[12][0-9]|3[01])\\' + dateDelimiter + '(0[1-9]|1[012])\\' + dateDelimiter + '\\d{1,4}';
        switch (type) {
            case '1':
                val = val.replace(/\s+/g, '');
                pattern = new RegExp('^[-+]?[0-9]*\\' + decimalDelimiter + '?[0-9]+$'); break;
            case '5':
                val = val.replace(/\s+/g, '');
                pattern = new RegExp(/^[-+]?\d+$/); break;
            case '3': pattern = new RegExp(datePattern + '$'); break;
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
    };

    function callPopup(x, y, message) {
        $('.popup').css('left', x + $('.popup').css('width').replace('px', '') / 2);
        $('.popup').css('top', y + $('.popup').css('height').replace('px', '') / 2);
        $('#inputerror').html(message);
        $('.popup, .close_order, .overlay').click(function () {
            $('.popup, .overlay').css({ 'opacity': '0', 'visibility': 'hidden' });
        });
        $('.popup, .overlay').css({ 'opacity': '1', 'visibility': 'visible' });
    };
    function getTitle(type, min, max, decimalDelimiter, dateDelimiter) {
        switch (type) {
            case '1': return "Введите вещественное число. Разделитель - " + decimalDelimiter;
            case '2': return "Введите текст";
            case '3': return "Требуется дата в формате дд" + dateDelimiter + "мм" + dateDelimiter + "гггг ";
            case '4': return "Дата и время в формате дд" + dateDelimiter + "мм" + dateDelimiter + "гггг чч:мин:сек ";
            case '5': return "Требуется целое число";
            case '6': return "Требуется целое число от " + min + " до " + max;
            case '8': return "Введите текст";
            case '9': return "";
            case '10': return "Выберите из списка";
            default: return "";
        }
    };
    function ProgressBarModal(showHide) {

        if (showHide === 'show') {
            $('#mod-progress').modal('show');
            if (arguments.length >= 2) {
                $('#progressBarParagraph').text(arguments[1]);
            } else {
                $('#progressBarParagraph').text('??...');
            }

            window.progressBarActive = true;

        } else {
            $('#mod-progress').modal('hide');
            window.progressBarActive = false;
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
            "height": (outer.offset().top - inner.offset().top) || 0,
            "width": (outer.offset().left - inner.offset().left) || 0
        };

        outer.remove();
        return scrollSize;
    }
    function sortByColumn(colIndex, container) {
        var selector = container;
        var tableData = new Array();
        var sortAsc = true;
        $('span.glyphicon')
            .filter('.glyphicon-sort', '.glyphicon-sort-by-attributes', '.glyphicon-sort-by-attributes-alt')
            .each(function (i) {
                if (i === colIndex) {
                    var oldClass = 'h';
                    if ($(this).hasClass('glyphicon-sort-by-attributes')) oldClass = 'a';
                    if ($(this).hasClass('glyphicon-sort-by-attributes-alt')) oldClass = 'd';
                    $(this).removeClass('glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
                    if (oldClass === 'h' || oldClass === 'd') { $(this).addClass('glyphicon-sort-by-attributes active'); sortAsc = true; }
                    if (oldClass === 'a') { $(this).addClass('glyphicon-sort-by-attributes-alt active'); sortAsc = false; }
                } else {
                    $(this).removeClass()
                        .addClass('header')
                        .addClass('glyphicon glyphicon-sort');
                 }
            });
        /*$('tr:first').children().each(function (i) {
            if (i === colIndex) {
                var oldClass = 'h';
                var span = $(this).find('span');
                if (span.hasClass('glyphicon-sort-by-attributes')) oldClass = 'a';
                if (span.hasClass('glyphicon-sort-by-attributes-alt')) oldClass = 'd';
                span.removeClass('glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
                $(container).find('th span').removeClass('active');
                if (oldClass === 'h' || oldClass === 'd') { span.addClass('glyphicon-sort-by-attributes active'); sortAsc = true; }
                if (oldClass === 'a') { span.addClass('glyphicon-sort-by-attributes-alt active'); sortAsc = false; }
            }
            else {
                if (!$(this).hasClass('glyphicon-filter')){
                    $(this).removeClass().addClass('header');
                    $(this).find('span').removeClass().addClass('glyphicon glyphicon-sort');
                }
            }
        });*/

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
    /**
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
