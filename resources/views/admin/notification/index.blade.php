@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
@endsection
<div class="card">
	<div class="card-header d-flex justify-content-between">
		<div class="title">
			<h5>{{  $title  }}</h5>
		</div>
		<div class="addbutton">
			<a href="{{ route('notification.create') }}" class="btn btn-primary btn-sm">+ Send Notification </a>
		</div>
	</div>
	<div class="card-body">

		<table class="table table-bordered" id="users-table">
				<thead>
				<tr>
					 <th> #</th>
					 <th>Title</th>
					 <th>Description  </th>
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
        ajax: '{!! route("notification.index") !!}',
        columns: [
            { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            { data: 'title', name: 'title' },
			{ data: 'desc', name: 'desc' },
        ]
    });
    $(document).on('change','[data-checkbox-status]',function(){
        var elm = $(this);
		var mainUrl = elm.attr('data-checkbox-status');
                 $.ajax({
				  		url:mainUrl,
				  		type: 'DELETE',
				  		data: {},
				  		headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
				  		success: function (data) {
				  				if(data.status === 'success')
				  				{
										// Swal.fire({
										//   icon: 'success',
										//   title: 'Success!',
										//   text:data.message,
										// });
										userDataTable.draw();
				  				}else{
					  					Swal.fire({
										  icon: 'error',
										  title: 'Error!',
										  text:data.message,
										});
                                        userDataTable.draw();
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

    });
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
										userDataTable.draw();
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
