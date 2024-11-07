//$(document).ready(function () {
$(function () { 
    var siteRoot = $("#siteRoot").html();
    if (siteRoot === "/") siteRoot = "";
    var url0 = siteRoot + "/Customer/RemoveRequest";
    var uri;
    $("#deleteDlg").dialog({
        dialogClass: "no-close",
        autoOpen: false,
        width: 300,
        height:150,
        modal: true,
        show: {
            effect: "blind",
            duration: 500
        },
        hide: { effect: "blind", duration: 500 },
        buttons: {
            "Да": function () {
                $.ajax({
                    url: uri,
                    success: function () {
                        location.reload(true);  
                    }
                });
                $(this).dialog("close");
             },
            "Нет": function () { $(this).dialog("close"); }
        }
    });
    $("#deleteDlg").dialog("option", "closeText", "");
    $('a.del-button').on('click', function (event) {
        uri = url0 + "?request=" + $(event.target).parent().prop('id');
        $("#deleteDlg").dialog('open');
    });
});