$(document).ready(function () {
    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").removeClass("filter");
        $("#wrapper").toggleClass("toggled");
    });
   

    //rowExpension(PF('tablePartner'));
});

function handleSubmit(args, dialog) {
    var jqDialog = jQuery('#' + dialog);
    if (args.validationFailed) {
        jqDialog.effect('shake', {times: 3}, 100);
    } else {
        PF(dialog).hide();
    }
}

function toggleUpperFilter(){
      $("#upperFilter").slideToggle("slow");
      return false;
}












//function rowExpension(dataTable) {
//    //dataTable should be the widgetVar object
//    var $this = dataTable;
//    console.log("Called");
//    var togglerSelector = '> tr > td > div.ui-row-toggler';
//    $this.tbody.off('click.datatable-expansion', togglerSelector);
//    $this.tbody.off('keydown.datatable-expansion', togglerSelector);
//    //add the 'hand' when hovering on row
//    $this.tbody.children('tr').css('cursor', 'pointer');
//    $this.tbody
//            .on('click.datatable-expansion', '.ui-datatable-odd,.ui-datatable-even', null, function () {
//                //before expanding collapse all rows
//                //toggle the current row the old toggler
//                $this.toggleExpansion($(this).find('div.ui-row-toggler'));
//            });
//
//
//
//}

function tableContactSelect(ele) {
    PF('tableContactW').unselectAllRows();
    console.log(PF('tableContactW'));
    var tdEle = jQuery(ele).parent();
    var trEle = jQuery(tdEle).parent();
    PF('tableContactW').selectRow($(trEle), true);
}