@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
<link
rel="stylesheet"
href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.css"
/>
@endsection

<div class="card">
    <div class="card-body">
        <div class="row">
            <div class="col-12"><h6><i class="fadeIn animated bx bx-filter-alt"></i> Filter</h6></div>
        </div>
        <form data-filter-action="" method="post">
            <div class="row">
            <div class="col-2">
                <label>Launcher Name</label>
                <input type="text" class="form-control form-control-sm name" name="name" id="name" placeholder="Enter Launcher Name">
            </div>
            <div class="col-2">
                <label>Mobile </label>
                <input type="number" class="form-control form-control-sm mobile" name="mobile" id="mobile" placeholder="Enter Mobile">
            </div>

            <div class="col-2">
                <label>Sketch ID</label>
                <input type="text" class="form-control form-control-sm launch_sketch" name="launch_sketch" id="launch_sketch" placeholder="Enter name">
            </div>
            <div class="col-2">
                <label>Start Date </label>
                <input type="date" class="form-control form-control-sm start_date" name="start_date" id="start_date" >
            </div>
            <div class="col-2">
                <label>End Date </label>
                <input type="date" class="form-control form-control-sm end_date" name="end_date" id="end_date" >
            </div>
            <div class="col-12">

                <button type="submit" class="btn btn-primary btn-sm mt-3"><i class="fadeIn animated bx bx-search"></i> Search</button>
                <button class="btn btn-danger btn-sm mt-3" onclick="return resetInputs()">Reset</button>
            </div>
        </div>
        </form>
    </div>
</div>
<div class="card">
	<div class="card-header d-flex justify-content-between">
		<div class="title">
			<h5>{{  $title  }}</h5>
		</div>

	</div>
	<div class="card-body">
        {{-- <a href="javascript:;" data-send-user-ids="{{ route('credit-balance-to-launcher') }}" class="btn btn-outline-primary btn-sm">Credit Balance</a> --}}
        <div class="table-responsive mt-2">

            <table id="users-table" class="table table-sm table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th width="5%">#</th>
                            <th width="10%">Launcher</th>
                            <th width="10%">Mobile No</th>
                            <th width="10%">Image</th>
                            <th width="10%">Sketch</th>
                            <th width="10%">Start Date</th>
                            <th width="10%">End Date</th>
                            <th width="10%">Image Quantity</th>
                            <th width="10%">Image Offered</th>
                            <th width="10%">Image Sell Price</th>
                            <th width="10%">Participant</th>
                        </tr>
                    </thead>
                    <tbody>
				    </tbody>
		</table>
        </div>

	</div>
</div>
<!-- Modal -->
<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ...
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Understood</button>
        </div>
      </div>
    </div>
  </div>
@section('script')
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script src="{{ asset('assets/admin/js/dataTables.bootstrap5.min.js') }}"></script>
<script src="{{ asset('assets/admin/js/jquery.dataTables.min.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js"></script>

<script type="text/javascript">

   var userTable =  $('#users-table').DataTable({
        aLengthMenu: [
            [50,100,200,500,800,-1],
            [50,100,200,500,800,"All"]
        ],
        iDisplayLength: -1,
        processing:true,
        serverSide:true,
        pageLength: 50,
        ajax: {
            url:'{!! route("launch_image_icon") !!}',
            data: function (d) {
                d.name = $('.name').val(),
                d.mobile = $('.mobile').val(),
                d.launch_sketch = $('.launch_sketch').val(),
                d.start_date = $('.start_date').val()
                d.end_date = $('.end_date').val()
            },
        },
        columns:[
            {data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            {data:"user_id",name:"user_id"},
            {data:"mobile",name:"mobile"},
            {data:"launch_image",name:"launch_image"},
            {data:"launch_sketch",name:"launch_sketch"},
            {data:"start_date",name:"start_date"},
            {data:"end_date",name:"end_date"},
            {data:"total_img_quanity",name:"total_img_quanity"},
            {data:"total_img_offered",name:"total_img_offered"},
            {data:"total_img_sell",name:"total_img_sell"},
            {data:"participant",name:"participant"}
        ]
    });

    $(document).on('submit','[data-filter-action]',function(e){
    e.preventDefault();
    userTable.draw();

});

function resetInputs(){
     $('.name').val('');
     $('.launch_sketch').val('');
     $('.mobile').val('');
     $('.end_date').val('');
     $('.start_date').val('');
     userTable.draw();
}
    $(document).on('click','[data-click-accept]',function(){
        var Url = $(this).attr('data-click-accept');

        Swal.fire({
            title: 'Are you sure?',
            text: "You want to accept this launcher request",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Approved it!'
            }).then((result) => {
            if (result.isConfirmed) {

                $.ajax({
                                url:Url,
                                type: 'post',
                                data:{status:2},
                                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                                success: function (data) {

                                        if(data.status === 'success')
                                        {
                                               Swal.fire(
                                                'Approved!',
                                                'Launcher Request Approved Successfully',
                                                'success'
                                                )
                                                userTable.draw();
                                        }else{
                                                Swal.fire({
                                                icon: 'error',
                                                title: 'Error!',
                                                text:data.message,
                                                })
                                        }
                                },
                                error:function(err){

                                        Swal.fire({
                                                icon: 'error',
                                                title: 'Error!',
                                                text:'Something Went Wrong!',
                                                })
                                }
                            });




            }
            })

    });



    $(document).on('click','[data-click-reject]',function(){
        var Url = $(this).attr('data-click-reject');

        Swal.fire({
            title: 'Are you sure?',
            text: "You want to reject this launcher request",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Reject it!'
            }).then((result) => {
            if (result.isConfirmed) {

                $.ajax({
                                url:Url,
                                type: 'post',
                                data:{status:2},
                                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                                success: function (data) {

                                        if(data.status === 'success')
                                        {
                                               Swal.fire(
                                                'Rejected!',
                                                'Launcher Request Rejected Successfully',
                                                'success'
                                                )
                                                userTable.draw();
                                        }else{
                                                Swal.fire({
                                                icon: 'error',
                                                title: 'Error!',
                                                text:data.message,
                                                })
                                        }
                                },
                                error:function(err){

                                        Swal.fire({
                                                icon: 'error',
                                                title: 'Error!',
                                                text:'Something Went Wrong!',
                                                })
                                }
                            });




            }
            })

    });
</script>
@endsection
@endsection
