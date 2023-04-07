@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
@endsection
<div class="card">
    <div class="card-body">
        <div class="row">
            <div class="col-12"><h6><i class="fadeIn animated bx bx-filter-alt"></i> Filter</h6></div>
        </div>
        <form data-filter-action="" method="post">
            <div class="row">
            <div class="col-3">
                <label for="name">Name</label>
                <input type="text" class="form-control form-control-sm name" name="name" id="name" placeholder="Enter name">
            </div>
            <div class="col-3">
                <label for="email">Email</label>
                <input type="text" class="form-control form-control-sm email" name="email" id="email" placeholder="Enter email">
            </div>
            <div class="col-3">
                <label for="mobile">Mobile No.</label>
                <input type="text" class="form-control form-control-sm mobile" name="mobile" id="mobile" placeholder="Enter mobile">
            </div>

            <div class="col-3">
                <label for="status">Status</label>
                {!! Form::select('status',[''=>'Select Status',1=>'Inactive',2=>'Active'],null,['class'=>'form-control form-control-sm status','id'=>'status']) !!}
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
		<div class="addbutton">
			<a href="{{  route('users.create') }}" class="btn btn-primary btn-sm">+ Add New User </a>
		</div>
	</div>
	<div class="card-body">

		<table class="table table-bordered table-sm mt-4" id="users-table">
				<thead>
				<tr>
					 <th width="5%">#</th>
					 <th>Name</th>
					 <th>Email</th>
					 <th>Mobile  </th>
                     <th>Roles</th>
					 <th>Status</th>
					 <th width="20%">Action</th>
				</tr>
				</thead>
				<tbody>
				</tbody>
		</table>


	</div>
</div>
@section('script')
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="{{ asset('assets/admin/js/dataTables.bootstrap5.min.js') }}"></script>
<script src="{{ asset('assets/admin/js/jquery.dataTables.min.js') }}"></script>
<script type="text/javascript">

var userDataTable = $('#users-table').DataTable({
        processing: true,
        serverSide: true,
        "bSort": false,
        ajax: {
            url:'{!! route("users.index") !!}',
            data: function (d) {

                d.name = $('.name').val(),
                d.email = $('.email').val(),
                d.mobile = $('.mobile').val(),
                d.status = $('.status').val()
            },
        },
        columns: [
            { data: 'DT_RowIndex', name: 'id', orderable: false, searchable: false },
            { data: 'name', name: 'name' },
            { data: 'email', name: 'email' },
			{ data: 'mobile', name: 'mobile' },
            { data: 'roles', name: 'roles' },
			{ data: 'status', name: 'status' },
            { data: 'action', name: 'action' },
        ]
    });
    $(document).on('submit','[data-filter-action]',function(e){
    e.preventDefault();
    userDataTable.draw();

});

function resetInputs(){
     $('.name').val('');
     $('.email').val('');
     $('.mobile').val('');
     $('.user_type').val('');
     $('.status').val('');
     userDataTable.draw();
}

	$(document).on('click','[data-delete-alert]',function(){
		var elm = $(this);
		var deleteUrl = elm.attr('data-delete-alert');

		Swal.fire({
		  title: 'Are you sure?',
		  text: "You won't be able to revert this!",
		  icon: 'warning',
		  showCancelButton: true,
		  confirmButtonColor: '#3085d6',
		  cancelButtonColor: '#d33',
		  confirmButtonText: 'Yes, delete it!'
		}).then((result) => {
		  if (result.isConfirmed) {
				  $.ajax({
				  		url:deleteUrl,
				  		type: 'DELETE',
				  		data: {},
				  		headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				  		success: function (data) {
				  				if(data.status === 'success')
				  				{
										Swal.fire({
										  icon: 'success',
										  title: 'Success!',
										  text:data.message,
										});
										window.location.reload();
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
