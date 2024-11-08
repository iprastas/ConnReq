﻿var siteRoot = $("#siteRoot").html();
if (siteRoot === "/") siteRoot = "";
$(function () {
    //$.datepicker.setDefaults($.datepicker.regional['ru']);
    //var since = $('#sincedp').val();
    //$("#sincedp").datepicker();
    //var upto = $('#uptodp').val();
    //$("#uptodp").datepicker();
    var resKind = 0;
    var terr = 3;

    var resourceKind = $("#resourceKind").slistbox({ url: siteRoot + '/Admin/GetResourceKind' });
    var territory = $("#territory").slistbox({ url: siteRoot + '/Admin/GetTerritory' });
    var grid = $("#grid").sgrid({
        geturl: siteRoot + '/Admin/GetForm',
        cellsDataUrl: siteRoot + '/Admin/GetCellsData',
        clearInputIfError: true,
        showAlert: true,
        dateDelimiter: '.',
        readOnly: true
    });
    grid.on('formReady.sgrid', function () {
        //spinner.stop();
        $('table.scroll').tableHeadFixer({ 'left': 2 });
        //spinner.stop();
        //postData();
    });
    $("#sincedp").on('change', function (event) {
        since = $(event.target).val();
        postData();
    });
    $("#uptodp").on('change', function (event) {
        upto = $(event.target).val();
        postData()
    });
    
    $('#resourceKind').on('change', function (event) {
        resKind = $(event.target).val();
        postData();
    });
    $('#territory').on('change', function (event) {
        terr = $(event.target).val();
        postData();
    });
    function postData() {
        grid.sgrid('setParams', '?t=' + terr + '&kind=' + resKind + '&snc=' + since + '&upt=' + upto);
        grid.sgrid('setForm', 0).then(function () {
            if ($('#showEmpty').is(':checked')) {
                grid.sgrid('hideEmptyRows', [2, 3, 4, 5, 6]);
                $('th span.glyphicon.glyphicon-sort', grid).removeClass('glyphicon-sort glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
            } else {
                grid.sgrid('showAllRow');
                $('th span.glyphicon', grid).addClass('glyphicon-sort');
            }
        });
    }
    $('#showEmpty').on('change', function (event) {
        if (this.checked) {
            grid.sgrid('hideEmptyRows', [2, 3, 4, 5, 6]);
            $('th span.glyphicon.glyphicon-sort', grid).removeClass('glyphicon-sort glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
        }
        else {
            grid.sgrid('showAllRow');
            $('th span.glyphicon', grid).addClass('glyphicon-sort');
        }
    });
});