<div class="row">
    <style>
        .fancybox__content{
            width: 50%;
        }
    </style>
    <?php
    $response = \App\Models\Package::
    select("*", DB::raw("CONCAT('Quantity : ',quantity,', Price :  ',price) as full_package_name"))->where('status',1)->pluck('full_package_name','id')->toArray();

     ?>
    <div class="col-12 font-weight-bold"><h6>Launch Image</h6><hr></div>
    <div class="co-12">
        <form action="" id="createUserLauncher" method="post">
            @csrf
            <div class="alertError" style="display: none;">

            </div>
            <input type="hidden" name="id" value="{{ $row->id }}">
            <div class="row">
                <div class="col-12">
                    <label for="package">Select Package</label>
                    {!! Form::select('package',[''=>'Select Package']+$response,null,['class'=>'form-control package','id'=>'package']) !!}
                </div>
                <div class="col-6">
                    <label for="start_date">Start Date</label>
                    {!! Form::date('start_date',null,['class'=>'form-control start_date','id'=>'start_date']) !!}
                </div>
                <div class="col-6">
                    <label for="end_date">End Date</label>
                    {!! Form::date('end_date',null,['class'=>'form-control end_date','id'=>'end_date']) !!}
                </div>
                <div class="col-12 mt-1">
                    <label for="image_quantity">Enter Image Quantity</label>
                    <input type="number" class="form-control image_quantity" name="image_quantity" id="image_quantity">
                </div>
                <div class="col-12 mt-1">
                    <label for="image_offered">Enter Min. Image Offered</label>
                    <input type="number" class="form-control image_offered" name="image_offered" id="image_offered">
                </div>
                <div class="col-12 mt-1">
                    <label for="image_selling_price">Enter Selling Price</label>
                    <input type="number" class="form-control image_selling_price" name="image_selling_price" id="image_selling_price">
                </div>

                <div class="col-12">
                    <input type="submit" class="btn btn-primary btn-sm mt-3 submitBtn" value="Launch Now">
                </div>
            </div>
        </form>
    </div>
</div>
<script>

    var alertError = $('.alertError');
	var errordisplay = $('.errordisplay');
	alertError.html('');
	errordisplay.hide();

    $('#createUserLauncher').on('submit',function(e){
        e.preventDefault();
        var formdata = new FormData(this);
        var btn = $('.submitBtn');
        btn.attr('disabled','disabled');
        $.ajax({
            url: "{{ route('launch_image_save') }}",
            type: 'post',
            data: formdata,
            cache:false,
            contentType:false,
            processData:false,
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            success: function (data) {
                    if(data.status === 'success')
                    {
                        var html = `<div class="alert alert-succsss background-success">
                                        <strong>Error!  </strong> ${data.message}
                                        </div>`;
                                        $('.alertError').show().html(html);
                        if(typeof data.data.nextUrl != 'undefined' )
                        {
                            window.location.href = data.data.nextUrl;
                        }else{
                            window.location.reload();
                        }

                    }else{
                        btn.removeAttr('disabled');
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
                btn.removeAttr('disabled');
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

    });

</script>
