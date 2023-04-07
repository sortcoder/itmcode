@extends('admin.layouts.app')

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
        <div class="card-header"><h6>Personal Details</h6></div>
        <div class="card-body">

            <div class="alertError" style="display: none;">

            </div>

            <div class="row">
                <div class="col-4 mt-2">
                    <label for="name">Full Name</label>
                    <input type="text" class="form-control" name="name" id="name" value="{{  $user->name }}" placeholder="Enter your full name">
                </div>
                <div class="col-4 mt-2">
                    <label for="username">Username</label>
                    <input type="text" class="form-control" name="username" value="{{  $user->username }}" readonly  id="username" placeholder="Enter your username">
                </div>
                <div class="col-4 mt-2">
                    <label for="father_name">Father's Name</label>
                    <input type="text" class="form-control" name="father_name" value="{{  $user->father_name }}"  id="father_name" placeholder="Enter Father Name">
                </div>
                <div class="col-4 mt-2">
                    <label for="mother_name">Mother's Name</label>
                    <input type="text" class="form-control" name="mother_name" value="{{  $user->mother_name }}"  id="mother_name" placeholder="Enter Mother Name">
                </div>
                <div class="col-4 mt-2">
                    <label for="email">Email</label>
                    <input type="email" class="form-control" name="email" value="{{  $user->email }}" readonly  id="email" placeholder="Enter Email Address">
                </div>
                <div class="col-4 mt-2">
                    <label for="mobile">Mobile No.</label>
                    <input type="text" class="form-control" name="mobile" value="{{  $user->mobile }}" readonly  id="mobile" placeholder="Enter Mobile no.">
                </div>

                <div class="col-4 mt-2">
                    <label for="dob">Date of Birth(DOB)</label>
                    <input type="text" class="form-control datepicker" value="{{  $user->dob }}"  name="dob" id="dob" placeholder="Enter your dob">
                </div>
                <div class="col-4 mt-2">
                    <label for="gender">Gender</label>
                    {!! Form::select('gender',[''=>'SelectGender']+Config::get('constants.genderStatus'),$user->gender,['class'=>'form-control','id'=>'gender']) !!}
                </div>
                <div class="col-4 mt-2">
                    <label for="marital_status">Martial Status</label>
                    {!! Form::select('marital_status',[''=>'Select Martial Status']+Config::get('constants.maritalStatus'),$user->marital_status,['class'=>'form-control','id'=>'marital_status']) !!}
                </div>
                <div class="col-4 mt-2">
                    <label for="profession">Professional</label>
                    {!! Form::select('profession',\App\Models\Professional::makeToArray(),$user->profession,['class'=>'form-control','id'=>'profession']) !!}
                </div>

            </div>

            <div class="row mt-3">
                <hr/>
                <div class="col-12"><h6>Address Details</h6></div>
                <div class="col-6">
                    <label for="address_one">Address line1</label>
                    <textarea name="address_one" id="address_one" class="form-control" cols="30" rows="3">{{ $user->address_one }}</textarea>
                </div>
                <div class="col-6">
                    <label for="address_two">Address line2</label>
                    <textarea name="address_two" id="address_two" class="form-control" cols="30" rows="3">{{ $user->address_two }}</textarea>
                </div>
                <div class="col-6 mt-2">
                    <label for="state">State</label>
                    {!! Form::select('state',[''=>'Select State']+\App\Models\State::fetchStates(),$user->state,['class'=>'form-control','id'=>'state']) !!}
                </div>
                <div class="col-6 mt-2">
                    <label for="district">District</label>

                    <select name="district" id="district" class="form-control">
                        <option value="">Select District</option>
                    </select>
                </div>
                <div class="col-6 mt-2">
                    <label for="pincode">Pincode</label>
                    <input type="text" class="form-control datepicker" maxlength="6" value="{{ $user->pincode }}" name="pincode" id="pincode" placeholder="Pincode">
                </div>
                <div class="col-6 mt-2">
                    <label for="city">City</label>
                    <input type="text" class="form-control datepicker" name="city" id="city" value="{{ $user->city }}" placeholder="City">
                </div>

            </div>
            <div class="row mt-3">
                <hr/>
                <div class="col-12"><h6>PAN CARD DETAILS</h6></div>
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="pan_card_no">Enter PAN Card Number</label>
                            <input type="text" class="form-control" name="pan_card_no" id="pan_card_no" value="{{ $user->pan_card_no }}">
                        </div>
                        <div class="form-group mt-3">
                            <label for="re_pan_card_no">Re-Enter PAN Card Number</label>
                            <input type="text" class="form-control" name="re_pan_card_no" id="re_pan_card_no" value="{{ $user->pan_card_no }}">
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-group ">
                            <label>Upload PAN Card  </label>
                            <?php
                            $pancardOption = [
                                'width'=>1000,
                                'height'=>1000,
                                'maxFiles'=>1,
                                'filetype'=>'Image',
                                'filetype'=>'uploadPath',
                                'filepath'=>'uploads/pancard/'
                            ];
                             ?>
                            <?=_dropzoneCreateUpdate('pan_card_img',$user->pan_card_img,$pancardOption)?>


                        </div>
                    </div>
                </div>


            </div>
            <div class="row mt-3">
                <hr/>
                <div class="col-12"><h6>AADHAR CARD DETAILS</h6></div>
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label for="aadhar_card_no">Enter Aadhar Card Number</label>
                            <input type="text" class="form-control" id="aadhar_card_no" value="{{ $user->aadhar_card_no }}" name="aadhar_card_no">
                        </div>
                        <div class="form-group mt-3">
                            <label for="re_aadhar_card_no">Re-Enter Aadhar Card Number</label>
                            <input type="text" class="form-control" id="re_aadhar_card_no" value="{{ $user->aadhar_card_no }}" name="re_aadhar_card_no">
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group ">
                                    <label>Upload Aadhar Front Photo </label>
                                    <?php
                                    $aadharFrontOption = [
                                        'width'=>1000,
                                        'height'=>1000,
                                        'maxFiles'=>1,
                                        'filetype'=>'Image',
                                        'filetype'=>'uploadPath',
                                        'filepath'=>'uploads/aadhar_front/'
                                    ];
                                     ?>
                                    <?=_dropzoneCreateUpdate('aadhar_front_img',$user->aadhar_front_img,$aadharFrontOption)?>


                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group ">
                                    <label>Upload Aadhar Back Photo </label>
                                    <?php
                                    $aadharBackOption = [
                                        'width'=>1000,
                                        'height'=>1000,
                                        'maxFiles'=>1,
                                        'filetype'=>'Image',
                                        'filetype'=>'uploadPath',
                                        'filepath'=>'uploads/aadhar_back/'
                                    ];
                                     ?>
                                    <?=_dropzoneCreateUpdate('aadhar_back_img',$user->aadhar_back_img,$aadharBackOption)?>


                                </div>
                            </div>
                        </div>


                    </div>
                </div>


            </div>

            <div class="row mt-3">
                <hr/>
                <div class="col-12"><h6>UPLOAD PHOTO & SIGNATURE</h6></div>
                <div class="row">

                    <div class="col-6">
                        <div class="form-group ">
                            <label>Upload Signature</label>
                                    <?php
                                    $signatureOption = [
                                        'width'=>1000,
                                        'height'=>1000,
                                        'maxFiles'=>1,
                                        'filetype'=>'Image',
                                        'filetype'=>'uploadPath',
                                        'filepath'=>'uploads/signature/'
                                    ];
                                     ?>
                                    <?=_dropzoneCreateUpdate('signature',$user->signature,$signatureOption)?>

                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-group ">
                            <label>Upload Profile </label>
                                    <?php
                                    $profileOption = [
                                        'width'=>1000,
                                        'height'=>1000,
                                        'maxFiles'=>1,
                                        'filetype'=>'Image',
                                        'filetype'=>'uploadPath',
                                        'filepath'=>'uploads/photo/'
                                    ];
                                     ?>
                                    <?=_dropzoneCreateUpdate('profile',$user->profile,$profileOption)?>

                        </div>
                    </div>
                </div>


            </div>
            <div class="row mt-3">
                <hr/>
                <div class="col-12"><h6>LAUNCH PAD REGISTRATION</h6></div><hr/>
                <div class="row">

                    <div class="col-4">
                        <div class="form-group ">
                            <label>Launch Pad Image</label>
                                    <?php
                                    $signatureOption = [
                                        'width'=>1000,
                                        'height'=>1000,
                                        'maxFiles'=>1,
                                        'filetype'=>'Image',
                                        'filetype'=>'uploadPath',
                                        'filepath'=>'uploads/launchpad/'
                                    ];
                                     ?>
                                    <?=_dropzoneCreateUpdate('launch_image',$user->launch_image,$signatureOption)?>

                        </div>
                    </div>
                    <div class="col-8">
                        <div class="form-group ">
                          <label for="username">Sketch Name</label>
                          <input type="text" class="form-control" name="launch_sketch" placeholder="Sketch Name" value="{{ $user->launch_sketch }}" readonly>
                        </div>
                        <div class="form-group ">
                            <label for="username">User Name</label>
                            <input type="text" class="form-control" name="launch_username" placeholder="Sketch Name" value="{{ $user->launch_username }}">
                          </div>
                          <div class="form-group ">
                            <label for="username">Designation</label>
                            <input type="text" class="form-control" name="launch_designation" placeholder="Sketch Name" value="{{ $user->launch_designation }}">
                          </div>
                          <div class="form-group ">
                            <label for="username">About us</label>
                            <textarea name="about_us" id="about_us"  class="form-control" rows="3">{{ $user->about_us }}</textarea>
                          </div>
                          <div class="form-group ">
                            <label for="username">Website </label>
                            <input type="url" class="form-control" name="launch_website" placeholder="Website Link (optional)" value="{{ $user->launch_website }}">
                          </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <h6>Social Links</h6>

                    </div>
                    <div class="col-12">
                        <div class="form-group mt-2">
                          <input type="text" name="youtube_link" id="youtube_link" class="form-control" value="{{ $user->youtube_link }}" placeholder="Youtube Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" name="twitter_link" id="twitter_link" class="form-control" value="{{ $user->twitter_link }}" placeholder="Twitter Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" name="instra_link" id="instra_link" class="form-control" value="{{ $user->instra_link }}" placeholder="Instragram Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" name="facebook_link" id="facebook_link" class="form-control" value="{{ $user->facebook_link }}" placeholder="Facebook Link (optional)" >
                        </div>
                        <div class="form-group mt-2">
                            <input type="text" name="linked_link" id="linked_link" class="form-control" value="{{ $user->linked_link }}" placeholder="Linkedin Link (optional)" >
                          </div>


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

         // name
        // username
        // father_name
        // mother_name
        // email
        // mobile
        // gender
        // dob
        // marital_status
        // profession
        // address_one
        // address_two
        // state
        // district
        // pincode
        // city
		rules:{
			name:{
				required:true,
				maxlength:255,

			},
            username:{
				required:true,
			},
			email:{
				required:true,
				email:true
			},
			mobile:{
				required:true,
				maxlength:255,
				minlength:10
			},
			gender:{
				required:true,
			},
            dob:{
				required:true,
			},
            marital_status:{
				required:true,
			},
			profession:{
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

					url: '{{  route("appuser.update",[encodeId($user->id)]) }}',
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
                            $("html, body").animate({ scrollTop: 0 }, "slow");
							if(typeof data.message === 'object')
							{
								$.each(data.message,function(index,value){
									$('.'+index).show().text(value[0]);
								})
							}else if(typeof data.message === 'string')
							{
								var html = `<div class="alert alert-warning background-warning">
											<button type="button" class="close" data-dismiss="alert" aria-label="Close">
											<i class="icofont icofont-close-line-circled text-white"></i>
											</button>
											<strong>Error!</strong> ${data.message}

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
