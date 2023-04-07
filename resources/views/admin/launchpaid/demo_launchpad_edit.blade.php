ṇ@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2.min.css') }}">
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2-bootstrap4.css') }}">
<link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<link rel="stylesheet" href="https://unpkg.com/dropzone@5/dist/min/dropzone.min.css" type="text/css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"  />
<style>

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
    @csrf
    @method('PUT')
    <div class="card">
        <div class="card-header"><h6>Edit Demo Launch Paid</h6></div>

            <div class="card-body">
                <div class="alertError" style="display: none;"></div>

                <input type="hidden" name="launc_paid_type" id="launc_paid_type" class="form-control" value="1" />
               
                <div class="row mt-2">
                    <div class="col-4 ">
                        <div class="form-group ">
                            <label>Launch Pad launch_image</label>
                            <div style="margin:6px !important" >
	                            <?php   
			                        if(isset($row->launch_image)){
			                            echo  '<a href="'.asset($row->launch_image).'" target="_blank">
			                                        <img src="'.asset($row->launch_image).'" style="width: 100%;" />
			                                    </a>';
			                        }else{
			                            echo  '<a href="'.asset("admin/images/noimage.png").'" target="_blank">
			                                        <img src="'.asset("admin/images/noimage.png").'" style="width: 100%;" />
			                                    </a>';
			                        } ?> 

	                                <?php
	                                    /*$signatureOption = [
	                                        'width'=>1000,
	                                        'height'=>1000,
	                                        'maxFiles'=>1,
	                                        'filetype'=>'Image',
	                                        'filetype'=>'uploadPath',
	                                        'filepath'=>'uploads/launchpad/'
	                                    ];
	                                    _dropzoneCreateUpdate('launch_image',$row->launch_image,$signatureOption)
	                                    */
	                                ?>
	                        </div>        
                        </div>
                    </div>
                    <div class="col-8">
                        <div class="form-group ">
                          <label for="username">Is Recommended</label>
                          <select name="is_recommended" id="is_recommended" class="form-control">
                                <option value="">Select Recommended</option>
                                <option {{ ($row->is_recommended=='0') ? "selected" : "" }} value="0">No</option>
                                <option {{ ($row->is_recommended=='1') ? "selected" : "" }} value="1" selected>Yes</option>
                            </select>
                        </div> 
                        <div class="form-group ">
                          <label for="username">User Name</label>
                          <input type="text" placeholder="User Name" required name="demo_user_name" value="{{ $row->demo_user_name }}" class="form-control" />
                        </div>
                        <div class="form-group ">
                          <label for="username">Sketch Name</label>
                          <input type="text" class="form-control" required name="launch_sketch" value="{{ $row->launch_sketch }}" placeholder="Sketch Name">
                        </div>

                          <div class="form-group ">
                            <label for="username">Designation</label> 
                            <select name="launch_designation" id="launch_designation" class="form-control">
                                <option value="">Select Designation</option>
                                @foreach($get_designation as $getDes_val)
                                    <option {{ ($getDes_val->name == $row->launch_designation) ? 'selected' : ''; }} value="{{ $getDes_val->name }}">{{ $getDes_val->name }}</option>
                                @endforeach
                            </select>

                          </div>
                          <div class="form-group ">
                            <label for="username">About us</label>
                            <textarea name="about_us" id="about_us"  class="form-control" rows="3">{{ $row->about_us }}</textarea>
                          </div>
                          <div class="form-group ">
                            <label for="username">Image Quantity </label>
                            <input type="number" required placeholder="Image Quantity" class="form-control image_quantity" name="image_quantity" id="image_quantity" value="{{ $row_launchpad_data->img_quanity }}" >
                          </div>
                          <div class="form-group ">
                            <label for="username">Selling Price </label>
                            <input type="number" required placeholder="Selling Price" class="form-control image_selling_price" name="image_selling_price" id="image_selling_price" value="{{ $row_launchpad_data->img_sell }}" >
                          </div>
                          <div class="form-group ">
                            <label for="username">Website </label>
                            <input type="url" class="form-control"  value="{{ $row->launch_website }}" name="launch_website" placeholder="Website Link (optional)">
                          </div>
                    </div>
                </div> 
                <div class="row">
                    <div class="col-12">
                        <h6>Social Links</h6>

                    </div>
                    <div class="col-12">
                        <div class="form-group mt-2">
                          <input type="text" value="{{ $row->youtube_link }}" name="youtube_link" id="youtube_link" class="form-control" placeholder="Youtube Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" value="{{ $row->twitter_link }}" name="twitter_link" id="twitter_link" class="form-control" placeholder="Twitter Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" value="{{ $row->instra_link }}" name="instra_link" id="instra_link" class="form-control" placeholder="Instragram Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" value="{{ $row->facebook_link }}" name="facebook_link" id="facebook_link" class="form-control" placeholder="Facebook Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" value="{{ $row->linked_link }}" name="linked_link" id="linked_link" class="form-control" placeholder="Linkedin Link (optional)" >
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

  <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>
<script type="text/javascript">
$('#launc_paid_type').on('change',function(){
    var id = $(this).val();
    if(id == 2)
    {
        $('.userTypeShow').show();
    }else{
        $('.userTypeShow').hide();
    }
})

 $( function() {
    $( ".datepicker" ).datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat:'dd-MM-yy'
    });
  } );
    $('#state').on('change',function(){
        var stateId = $(this).val();
        if(stateId)
        {
            changeDistrict(stateId);
        }
    });

    function changeDistrict(id,selected='')
    {
        $.ajax({
            type: "get",
            url: "{{ route('fetchDistricts') }}",
            data: {
                id:id,
                selected:selected
            },
            dataType: "html",
            success: function (response) {
                $('#district').html(response)
            },
            error:function(err)
            {
                Swal.fire(
                    'Error',
                    'Something Went Wrong!',
                    'question'
                    )
            }
        });
    }

		$('.multiple-select').select2({
			theme: 'bootstrap4',
			width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
			placeholder: $(this).data('placeholder'),
			allowClear: Boolean($(this).data('allow-clear')),
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

            launc_paid_type:{
                required:true,
            },
            launch_sketch:{
                required:true,
            },
            launch_username:{
                required:true,
            },
            launch_designation:{
                required:true,
            }, about_us:{
                required:true,
            },

		},


		messages:{
			name:{
				required:"Name is required",
				maxlength:"Maximum Character limit is 255",

			},
			email:{
				required:"Email is required",
				email:"Please Enter Valid Email"
			},
		},
		submitHandler:function(form,event){
			event.preventDefault();
			var data = new FormData(document.getElementById("createUser"));

			$.ajax({ 
					url: '{{  route("launchpaid.update",[encodeId($row->id)]) }}',
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

											$('.alertError').show().html(html);

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
