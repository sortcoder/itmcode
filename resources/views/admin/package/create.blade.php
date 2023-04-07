@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2.min.css') }}">
<link rel="stylesheet" href="{{  asset('assets/admin/js/select2-bootstrap4.css') }}">
<link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<link rel="stylesheet" href="https://unpkg.com/dropzone@5/dist/min/dropzone.min.css" type="text/css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"  />

@endsection

<form action="" method="post" id="createUser">
    <div class="card">
        <div class="card-header"><h5>Add New Launch Paid Package </h5></div>
        <div class="card-body">

            <div class="alertError" style="display: none;">

            </div>

            <div class="row">

                <div class="col-4 mt-2">
                    <label for="username">Quanity</label>
                    <input type="number" step="any" class="form-control" name="quantity" id="quantity" placeholder="Enter Quantity">
                </div>
                <div class="col-4 mt-2">
                    <label for="price">One Image Price</label>
                    <input type="number" min="0" step="any" class="form-control" name="one_image_price" id="one_image_price" placeholder="Enter One Image Price">
                </div>
                <div class="col-4 mt-2">
                    <label for="price">Package Price</label>
                    <input type="number" min="0" step="any" class="form-control" name="price" id="price" placeholder="Enter Package Price">
                </div>

                <div class="col-12 mt-2">
                    <label for="email">Description</label>
                    {!! Form::textarea('description','',['class'=>'form-control ']) !!}
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

            quantity:{
				required:true,
			},
			price:{
				required:true,
			},
			// user_type:{
			// 	required:true,
			// },
            description:{
				required:true,
			}
		},
		messages:{
			quantity:{
				required:"Quantity is required",
			},
            price:{
				required:"Price is required",
			}
		},
		submitHandler:function(form,event){
			event.preventDefault();
			var data = new FormData(document.getElementById("createUser"));

			$.ajax({

					url: '{{  route("package.store") }}',
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
