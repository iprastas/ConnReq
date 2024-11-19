var siteRoot = $("#siteRoot").html();
if (siteRoot === "/") siteRoot = "";
$(function () {
    var resourceKind = $("#resourceKind").slistbox({ url: siteRoot + '/NewRequest/GetResourceKind' });
    var territory = $("#territory").slistbox({url: siteRoot + '/NewRequest/GetTerritory' });
    var providers = $("#providers").slistbox({ url: siteRoot + '/NewRequest/GetProviders' });

    var docTable = $('#docsTable').docsTable({ url: siteRoot + '/NewRequest/GetDocuments', selector: "#docsTable"});

    $('#resourceKind').on('change', function (event) {
        postData('resourceKind', $(event.target).val());
    });
    $('#territory').on('change', function (event) {
        postData('territory', $(event.target).val());
    });
    $('#providers').on('change', function (event) {
        postData('providers', $(event.target).val());
    });
    $('#CreateRequest').on('click', function (event) {
        $('docTable').docsTable('makeBody');
        $('#CreateRequest').hide('slow');
        $("#providers").hide('slow');
        $("#territory").hide('slow');
        $("#resourceKind").hide('slow');
        $('h3#title').html('Прикрепление документов к заявке');
    });

    function postData(ctrl, val) {
        var selector = null;
        $.ajax({
            type: 'POST',
            url: siteRoot + '/NewRequest/PostCtrlChanged',
            data: 'ctrl=' + ctrl + '&value=' + val,
            success: function (msg) {
                switch (msg) {
                    case 'resource': case 'territory':
                        $("#providers").slistbox('refresh');
                        break;
                    case 'provider':
                        $('#CreateRequest').removeAttr("disabled");
                        break;
                    default: break;
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.responseText);
            }
        });
    }
});