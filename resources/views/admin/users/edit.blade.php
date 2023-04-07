@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2.min.css') }}">
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2-bootstrap4.css') }}">
@endsection
<div class="card">

	<div class="card-body">
		<h5>{{  $title  }}</h5>

		<hr>
			<form action="" method="post" id="createUser">
				@csrf
				@method('PUT')
				<div class="alertError" style="display: none;">

				</div>
				<div class="row">
					<div class="col-6">
						<label>Name</label>
						<input type="text" name="name" class="form-control" id="name" value="{{  $user->name }}">
						<span class="text-danger errordisplay name"></span>
					</div>
					<div class="col-6">
						<label>Email</label>
						<input type="text" name="email" class="form-control" id="email" value="{{  $user->email }}" readonly>
						<span class="text-danger errordisplay email"></span>
					</div>



					<div class="col-6">

						<label>Status</label>
						{!! Form::select('status',[''=>'Select Status',1=>'Inactive',2=>'Active'],$user->status,['class'=>'form-control']) !!}
						<span class="text-danger errordisplay status"></span>
					</div>

                    <div class="col-6">
                        <div class="form-group">
                            <strong>Role:</strong>
                            {!! Form::select('roles[]', $roles,$userRole, array('class' => 'form-control multiple-select','multiple')) !!}
                        </div>
                    </div>


					<div class="col-12 mt-3">
						<input type="submit" name="submit" class="btn btn-primary btn-sm submitbutton">
						<button class="btn btn-danger btn-sm disabledBtn" disabled style="display: none;">Progressing...</button>
				</div>

			</form>
	</div>
</div>
@section('script')
 <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/additional-methods.min.js" type="text/javascript"></script>

<script src="{{  asset('assets/admin/js/select2.min.js') }}"></script>

<script type="text/javascript">
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
			name:{
				required:true,
				maxlength:255,

			},
			email:{
				required:true,
				email:true
			},mobile:{
				required:true,
				maxlength:255,
				minlength:10
			},

			password:{
				required:true,
				maxlength:255,
				minlength:5

			},
			cpassword:{
				required:true,
				maxlength:255,
				minlength:5,
				equalTo:"#password"

			},
			roles:{
				required:true
			}
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
			password:{
				required:"Password is required",
				minlength:"Please Enter Minimum Five Character "
			},
			cpassword:{
				required:"Password is required",
				minlength:"Please Enter Minimum Five Character "
			},
			roles:{
				required:"Please Select Role",
			},
		},
		submitHandler:function(form,event){
			event.preventDefault();
			var data = new FormData(document.getElementById("createUser"));

			$.ajax({

					url: '{{ route("users.update",[encodeId($user->id)]) }}',
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
