//$(document).ready(function () {
$(function () { 
    $('input#showAll').on('change', function (event) {
        var ch = $(event.target);
        showAll($(event.target).prop('checked'));
    });
    function showAll(val) {
        var row = $("#fixTable tr");
        if (val === true) {
            row.has($('td.contract-date')).show('slow');
        }
        else {
            row.has($('td.contract-date')).hide('slow');
            
        }
    }
});