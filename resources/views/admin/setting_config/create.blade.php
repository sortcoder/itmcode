@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2.min.css') }}">
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2-bootstrap4.css') }}">
<link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<link rel="stylesheet" href="https://unpkg.com/dropzone@5/dist/min/dropzone.min.css" type="text/css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"  />
<style>
    .tox-notifications-container{
        display:none;
    }

.dropzone .dz-preview:hover .dz-image img {
    filter: blur(0);
    -webkit-filter: blur(0);
}
.dz-progress{
width: 90% !important;
text-align: center;
margin:0 0 0 5% !important;
height: 2px !important;
left: 0 !important;
top: 0 !important;
border-radius: 2px !important;
padding: 0;
z-index: 600;

background: rgba(0,0,0,.1);
border: 0 !important;
}
.dz-progress .dz-upload {
  background: #66afef !important;
}

.dz-remove {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-block;
  background: #FFF;
  z-index: 500;
  font-size: 22px;
  padding: 2px 10px;
  cursor: pointer;
}

.dz-remove i {
  font-size: 13px;
  cursor: pointer !important;
  color: rgba(0, 0, 0, 0.5);
  background: black;
}

.dz-ajax-caption {
  margin-top: 4px;
  cursor: text !important;
}

.dropzone .dz-filename {
  word-break: break-all;
}

.dropzone .dz-message {
  margin: 5px 0 !important;
}

.dropzone-single {
  width: 245px !important;
}

.dropzone {
  padding: 5px !important;
  border: 0 !important;
  -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 5px;
  position: relative;
  display: table;
  height: 100px;
}

.dropzone .needsclick:before {
  content: ' ';
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.4;
  background: #FFF url("../assets/admin/images/upload-to-cloud.jpg") no-repeat center center;
  background-size: 51px;
}

.dropzone .needsclick {
  display: inline-block;
  position: relative;
  height: 170px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin: 17px 0 !important;
}

.dropzone .dz-preview .dz-image img {
  width: 100%;
}
.dropzone .dz-preview .dz-remove  {
      font-size: 19px;
    text-align: center;
    display: block;
    cursor: pointer;
    /* border: 1px solid; */
    height: 25px !important;
    /* color: black; */
    /* content: 'X'; */
    width: 31px;
    font-weight: 700;
}
</style>
@endsection

<form action="" method="post" id="createUser">
    <div class="card">
        <div class="card-header"><h5>Add New Config </h5></div>
        <div class="card-body">

            <div class="alertError" style="display: none;">

            </div>

            <div class="row">

                <div class="col-6 mt-2">
                    <label for="username">Key Name <small>(Unique,without space,using underscore)</small></label>
                    <input type="text"  class="form-control" name="var_key" id="var_key" placeholder="Enter Key Name">
                </div>
                <div class="col-6 mt-2">
                    <label for="price">Name</label>
                    <input type="text"  class="form-control" name="var_name" id="var_name" placeholder="Enter Name">
                </div>
                <div class="col-6 mt-2">
                    <label for="email">Type</label>
                    {!! Form::select('var_input', [''=>'Select Type','text'=>'text','textarea'=>'textarea','number'=>'number','email'=>'email','image'=>'image','editor'=>'editor'], '',['class'=>'form-control var_input','id'=>'var_input']) !!}
                </div>

                <div class="col-6 mt-2">
                    <div class="inputType" style="display: none">
                        <label for="var_data">Value</label>
                        {!! Form::text('text','',['class'=>'form-control ']) !!}
                    </div>
                    <div class="numberType" style="display: none">
                        <label for="number">Value</label>
                        {!! Form::number('number','',['class'=>'form-control ','step'=>'any','min'=>0]) !!}
                    </div>
                    <div class="emailType" style="display: none">
                        <label for="email">Value</label>
                        {!! Form::email('email','',['class'=>'form-control ']) !!}
                    </div>

                    <div class="imageType" style="display: none">
                        <label for="image">Image</label>
                        <?php
                            $pancardOption = [
                                'width'=>1000,
                                'height'=>1000,
                                'maxFiles'=>1,
                                'filetype'=>'Image',
                                'filetype'=>'uploadPath',
                                'filepath'=>'uploads/setting/'
                            ];
                             ?>
                            <?=_dropzoneCreateUpdate('image','',$pancardOption)?>

                    </div>
                </div>
                <div class="col-12">
                    <div class="textareaType" style="display: none">
                        <label for="textarea">Description</label>
                        {!! Form::textarea('textarea','',['class'=>'form-control ','rows'=>5]) !!}
                    </div>
                    <div class="editorType" style="display: none">
                        <label for="editor">Description</label>
                        {!! Form::textarea('editor','',['class'=>'form-control editor']) !!}
                    </div>
                </div>
            </div>

            <div class="col-12 mt-3">
                <hr>
                <input type="submit" name="submit" class="btn btn-primary btn-sm submitbutton">
                <button class="btn btn-danger btn-sm disabledBtn" disabled style="display: none;">Progressing...</button>
             </div>
        </div>
        <div class="row">

        </div>
    </div>
</form>

</div>
@section('script')

 <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/additional-methods.min.js" type="text/javascript"></script>

<script src="{{  asset('assets/admin/js/select2.min.js') }}"></script>
<script src="{{ asset('assets/admin/js/dropzone.min.js') }}"></script>

<script src="{{  asset('assets/admin/js/dzupload.js') }}"></script>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdn.jsdelivr.net/npm/@tinymce/tinymce-jquery@2/dist/tinymce-jquery.min.js"></script>
  <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>
<script type="text/javascript">
$('.editor').tinymce({ height: 200,branding:false,menubar:false });
    $('#var_input').on('change',function(){
        var elm = $(this);
             $('.inputType').hide();
            $('.numberType').hide();
            $('.emailType').hide();
            $('.imageType').hide();
            $('.textareaType').hide();
            $('.editorType').hide();
        if(elm.val() === 'text')
        {
            $('.inputType').show();
        }else if(elm.val() === 'number'){
            $('.numberType').show();
        }else if(elm.val() === 'email'){
            $('.emailType').show();
        }else if(elm.val() === 'image'){
            $('.imageType').show();
        }else if(elm.val() === 'textarea'){
            $('.textareaType').show();
        }else if(elm.val() === 'editor'){
            $('.editorType').show();
        }else{

        }

    });
	var alertError = $('.alertError');
	var errordisplay = $('.errordisplay');
	alertError.html('');
	errordisplay.hide();

	$('#createUser').validate({
		highlight: function (element, errorClass, validClass) {
       		 $(element).parents('.form-control').removeClass('has-success').addClass('has-error');
		},
		unhighlight: function (element, errorClass, validClass) {
			$(element).parents('.form-control').removeClass('has-error').addClass('has-success');
		},
		errorPlacement: function (error, element) {
				if(element.hasClass('select2') && element.next('.select2-container').length) {
				error.insertAfter(element.next('.select2-container'));
			} else if (element.parent('.input-group').length) {
				error.insertAfter(element.parent());
			}
			else if (element.prop('type') === 'radio' && element.parent('.radio-inline').length) {
				error.insertAfter(element.parent().parent());
			}
			else if (element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
				error.appendTo(element.parent().parent());
			}
			else {
				error.insertAfter(element);
			}
		},
		ignore:[],
		rules:{
            var_key:{
				required:true,
			},
            var_name:{
				required:true,
			},
            var_input:{
				required:true,
			}
		},
		messages:{
			var_key:{
				required:"Key is required",
			},
            var_name:{
				required:"Key is required",
			},
            var_input:{
				required:"Key is required",
			}

		},

		submitHandler:function(form,event){
			event.preventDefault();
			var data = new FormData(document.getElementById("createUser"));

			$.ajax({

					url: '{{  route("setting_config.store") }}',
					type: 'post',
					data: data,
					cache:false,
					contentType:false,
					processData:false,
					headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
					success: function (data) {
							if(data.status === 'success')
						{

							if(typeof data.data.nextUrl != 'undefined' )
							{
								window.location.href = data.data.nextUrl;
							}else{
								window.location.reload();
							}


						}else{
                            $("html, body").animate({ scrollTop: 0 }, "fast");
							if(typeof data.message === 'object')
							{
								$.each(data.message,function(index,value){
									$('.'+index).show().text(value[0]);
								})
							}else if(typeof data.message === 'string')
							{
								var html = `<div class="alert alert-danger background-danger">

											<strong>Error!  </strong> ${data.message}

											</div>`;

											alertError.show().html(html);


							}

						}

						errordisplay.fadeOut(3000);
					},
					error:function(err){
							var html = `<div class="alert alert-warning background-warning">
											<button type="button" class="close" data-dismiss="alert" aria-label="Close">
											<i class="icofont icofont-close-line-circled text-white"></i>
											</button>
											<strong>Error!</strong> Internal Server Error ! Please Try Again

											</div>`;

											alertError.show().html(html);
						errordisplay.fadeOut(3000);
					}

				});


		}
	});


</script>
@endsection
@endsection
