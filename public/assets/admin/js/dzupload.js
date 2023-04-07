// JavaScript Document

function DzDeleteRunTimeCount(Mxelm) {
    Mxelm.find('.dz-filelimitbox').hide();
    Mxelm.find('.needsclick').show();
    var AvailabelLength = Mxelm.attr('data-upload-maxfiles');
    var ElmLength = Mxelm.find('.dz-preview').length;
    if (ElmLength >= AvailabelLength) {
        Mxelm.find('.dz-filelimitbox').show();
        Mxelm.find('.needsclick').hide();
    }
    console.log('ElmLength' + ElmLength);
    console.log('AvailabelLength' + AvailabelLength);

}

function crbar(cr) {

    /*    cr = document.getElementById(cr)
        var bar = new ProgressBar.Circle(cr, {
            color: '#66afef',
            fill: 'rgba(255, 255, 255, 0.9)',
            strokeWidth: 10,
            step: function(state, circle) {
                var value = Math.round(circle.value() * 100);
                circle.setText(value+'%');
                if(value > 99){
                    $(cr).fadeOut(500);
                }
            }
        });
        bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
        bar.text.style.fontSize = '.8rem';

        bar.animate(0.1);  // Number from 0.0 to 1.0
        return bar;*/
}


Dropzone.autoDiscover = false;

function DZ_DeleteFile(k) {

    var Msg = ' Delete ' + k.find('.dz-filename').text();
    if (!Msg) {
        Msg = $.find('.dz-serveruploadfile').val();
    }



    Swal.fire({
        title: 'Alert!',
        text: Msg,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            var t = k.closest('.dropzone');
            var DelteFile = k.find('.dz-serveruploadfile').val();
            var FileFolder = t.attr('data-upload-folder');
            var Url = t.attr('data-delete-url');
            $.ajax({
                type: "POST",
                data: "file=" + DelteFile + "&&path=" + FileFolder+'&_token='+$('meta[name="csrf-token"]').attr('content'),
                url: Url,
                success: $.proxy(function (msg) {
                    console.log(msg);
                    $(window).resize();
                }, this)
            });


            var Elm = k.closest('[data-upload-maxfiles]');
            k.remove(); // remove from html

            DzDeleteRunTimeCount(Elm);
        }
    })



}

function DZ_AddHtml(k) {
    var t = k.closest('.dropzone');
    var SHtml = '<div class="dropzone-ajaxdata">';

    SHtml += '<div class="dz-remove dz-deletefile" style="display:none" title="Delete"><i class="fa fa-times"></i></div>'; // Delete Icon

    SHtml += '<input type="hidden" value="" class="dz-serveruploadfile"  name="' + t.attr('data-inputname') + '">';

    for (var i = 0; i <= 5; i++) {
        if (t.attr('data-caption' + i)) {
            var capt = "";
            if (t.attr('data-caption' + i + '-placeholder')) {
                capt = t.attr('data-caption' + i + '-placeholder');
            };
            SHtml += '<input type="text" class="form-control form-control-sm dz-ajax-caption" placeholder="' + capt + '" value="" name="' + t.attr('data-caption' + i) + '">';
        }
    }

    for (var i = 0; i <= 5; i++) {
        if (t.attr('data-textarea' + i)) {
            var capt = "";
            if (t.attr('data-textarea' + i + '-placeholder')) {
                capt = t.attr('data-textarea' + i + '-placeholder');
            };
            SHtml += '<textarea class="form-control form-control-sm dz-ajax-caption" placeholder="' + capt + '" name="' + t.attr('data-textarea' + i) + '"></textarea>';
        }
    }

    SHtml += '</div>';
    k.append(SHtml);
}

$(document).ready(function () {

    $(document).off('click', '.dz-deletefile');
    $(document).on('click', '.dz-deletefile', function () {

        DZ_DeleteFile($(this).closest('.dz-preview'));
    })

    // $(".dropzone").sortable({
    //     items: ".dz-preview",
    //     // helper: 'clone',
    //     opacity: 0.7,
    //     scroll: true,
    //     zindex: 200,
    //     placeholder: "dz-preview dz-sortbox",
    //     containment: "parent", // Boundry
    //     //connectWith: ".dz-preview"
    //     beforeStop: function (event, ui) {
    //         ui.item.removeAttr('style');
    //     },
    //     start: function (e, ui) {
    //         ui.placeholder.height(ui.item.height());
    //     }
    // });

    var filescol = new Array();
    var progbar_col = new Array();

    //Dropzone.confirm = function (question, accepted, rejected) { console.log(question); }
    $(".upload-widget").each(function () {
        DzDeleteRunTimeCount($(this));
    })


    $(".upload-widget").dropzone({
        autoDiscover: false,
        url: 'DynamicGet',
        thumbnailWidth: 400,
        thumbnailHeight: 400,
        paramName: "DynamicGet",
        addRemoveLinks: true,
        //maxFiles:'DynamicGet',
        //dictCancelUploadConfirmation:false,
        //image/*
        //acceptedFiles: ".jpg,.jpeg,.png,.gif",
        //dictRemoveFile: 'Delete',
        uploadprogress: function (file, progress, bytesSent) {



            var elm = $(file.previewTemplate).find('.dz-progress');
            if (file.previewElement) {
                var progressElement = file.previewElement.querySelector("[data-dz-uploadprogress]");
                elm.find('.dz-upload').width(progress + '%');
                //progressElement.querySelector(".progress-text").textContent = progress + "%";

                if (elm.find('.dz-progress-text').length == 0) {
                    elm.append('<div class="dz-progress-text"></div>');
                }
                elm.find('.dz-progress-text').text(progress.toFixed(0) + "%");
                // console.log(file.name+' - '+progress);
            }



        },

        init: function (file) {
            var UploadType = $(this.element).attr('data-upload-type');
            if (UploadType == 'Image') {
                this.options.acceptedFiles = '.jpg,.jpeg,.png,.gif';
            }
            if (UploadType == 'Document') {
                this.options.acceptedFiles = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx';
            }
            this.options.maxFilesize = $(this.element).attr('data-maxFilesize');
            this.options.maxFiles = $(this.element).attr('data-upload-maxfiles');
            this.options.url = $(this.element).attr('data-upload-url');
            this.options.paramName = $(this.element).attr('data-upload-filekey');



            this.on("maxfilesexceeded", function (file) {
                DzDeleteRunTimeCount($(file.previewTemplate).closest('[data-upload-maxfiles]'));
                $(file.previewTemplate).remove(); // remove from html
                DzDeleteRunTimeCount($(file.previewTemplate).closest('[data-upload-maxfiles]'));
                if (file.previewTemplate.status == "canceled") { } else {

                    Swal.fire({
                        position: 'top-end',
                        icon: 'error',
                        html: 'No more files please! you can upload ' + this.options.maxFiles + ' Files <br><br>',
                        showConfirmButton: false,
                        timer: 3000
                    })



                    $('.dz-message').css('display', 'block');
                }
            });

            this.on("sending", function (file, xhr, formData) {
                formData.append("path", $(this.element).attr('data-upload-folder'));
                formData.append("w", 2000);
                formData.append("h", 2000);
                formData.append("filekey", $(this.element).attr('data-upload-filekey'));
                formData.append("_token", $('meta[name="csrf-token"]').attr('content'));

                var attr = $(this.element).attr('data-upload-thumb');
                if (typeof attr !== typeof undefined && attr !== false) {
                    formData.append("thumb", $(this.element).attr('data-upload-thumb'));
                }
                attr = $(this.element).attr('data-upload-thumb_w');
                if (typeof attr !== typeof undefined && attr !== false) {
                    formData.append("thumb_w", $(this.element).attr('data-upload-thumb_w'));
                }
                attr = $(this.element).attr('data-upload-thumb_h');
                if (typeof attr !== typeof undefined && attr !== false) {
                    formData.append("thumb_h", $(this.element).attr('data-upload-thumb_h'));
                }


                DZ_AddHtml($(file.previewTemplate));

            });
            var self = this;

            self.on("addedfile", function (file) {
                $(window).resize();
                //console.log('new file added ', file);
            });
            this.on('error', function (file, response) {
                console.log(file.name);
                $(file.previewTemplate).remove(); // remove from html

                DzDeleteRunTimeCount($(file.previewTemplate).closest('[data-upload-maxfiles]'));


                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    html: '<strong>Error While Upload ' + file.name + ' </strong><br>' + response,
                    showConfirmButton: false,
                    timer: 3000
                })

                $('.dz-message').css('display', 'block');
            });
        },

        removedfile: function (file) {

            if (file.previewTemplate.status === "canceled") {
                DZ_DeleteFile($(file.previewTemplate)); // remove from server
                $(file.previewTemplate).remove(); // remove from html
            } else {
                //DZ_DeleteFile($(file.previewTemplate)); // remove from server
            }
            DzDeleteRunTimeCount($(file.previewTemplate).closest('[data-upload-maxfiles]'));

            $('.dz-message').css('display', 'block');


        },

        /*thumbnail:function(){

        },*/

        success: function (file, response) {
            var obj = jQuery.parseJSON(response)

            if (obj.Status == 'Error') {
                $(file.previewTemplate).remove(); // remove from html
                DzDeleteRunTimeCount($(file.previewTemplate).closest('[data-upload-maxfiles]'));
                var ErrorString = file['name'] + " can't upload ";
                if (obj.Error) {
                    ErrorString += '\n' + obj.Error;
                }


                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    html: '<strong> While Upload ' + ErrorString + ' </strong><br>' + ErrorString,
                    showConfirmButton: false,
                    timer: 3000
                })
                $('.dz-message').css('display', 'block');
            } else {
                if (obj.Status == 'Success') {
                    file.serverFileName = obj.FileName;
                    $(file.previewTemplate).find('.dz-serveruploadfile').val(obj.FileName);
                    $(file.previewTemplate).find('.dz-remove').hide();
                    var th = this;
                    $(file.previewTemplate).find('.dz-deletefile').click(function () {
                        th.removeFile(file);
                    }).show();

                    DzDeleteRunTimeCount($(file.previewTemplate).closest('[data-upload-maxfiles]'));

                    //DZ_AddHtml($(file.previewTemplate),obj.FileName);
                } else {
                    DzDeleteRunTimeCount($(file.previewTemplate).closest('[data-upload-maxfiles]'));



                    Swal.fire({
                        position: 'top-end',

                        icon: 'error',
                        html: '<strong> Wrong Status<br><br>',
                        showConfirmButton: false,
                        timer: 3000
                    })

                    $('.dz-message').css('display', 'block');
                }
            }
        },


    });

    DzDeleteRunTimeCount($(".upload-widget"));
});
