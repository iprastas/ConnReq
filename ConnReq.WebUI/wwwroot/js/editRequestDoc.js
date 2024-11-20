(function ($) {
    $('input[type=file]').on('change', function (event) {
        var fileName = this.files[0].name;
        $('div#fname').html(fileName);
        $(event.target).parent('div').children().each(function (indx, elem) {
            if (elem.id === 'fileinput') $(elem).hide('slow');
            if (elem.id === 'SubmitOne') $(elem).removeAttr('hidden');//.show('slow');
        });
    });
})(jQuery);