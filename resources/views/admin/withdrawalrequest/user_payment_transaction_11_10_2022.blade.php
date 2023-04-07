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
                <label for="type">User Type</label>
                {!! Form::select('type',[''=>'Select User Type',2=>'Trader',3=>'Launcher'],null,['class'=>'form-control form-control-sm type','id'=>'type']) !!}
            </div>

            <div class="col-3">
                <label for="status">Status</label>
                {!! Form::select('status',[''=>'Select Status']+\Config::get('constants.paymentStatus'),null,['class'=>'form-control form-control-sm status','id'=>'status']) !!}
            </div>
            <div class="col-3">
                <label for="name">Txn ID</label>
                <input type="text" class="form-control form-control-sm txn_id" name="txn_id" id="txn_id" placeholder="Enter Transactio ID">
            </div>
            <div class="col-12">

                <button type="submit" class="btn btn-primary btn-sm mt-3"><i class="fadeIn animated bx bx-search"></i> Search</button>
                <button type="button" class="btn btn-danger btn-sm mt-3" onclick="return resetInputs()">Reset</button>
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
			{{-- <a href="{{ route('appuser.create') }}" class="btn btn-primary btn-sm">+ Add New User </a> --}}
		</div>
	</div>
	<div class="card-body">
		<table class="table table-bordered table-sm" id="users-table">
				<thead>
				<tr>
					 <th width="5%">#</th>
					 <th width="10%">User</th>
                     <th width="10%">Type</th>
                     <th width="15%">Amount</th>
                     <th width="15%">Status</th>
                     <th width="10%">Txn ID</th>
                     <th width="10%">Date/Time</th>
                     <th width="10%">Method</th>
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
        ajax: {
            url:'{!! route("user_payment_transaction") !!}',
            data: function (d) {
                d.name = $('.name').val(),
                d.type = $('.type').val(),
                d.status = $('.status').val(),
                d.txn_id = $('.txn_id').val()
            },
        },
        columns: [
            { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            { data: 'name', name: 'name' },
            { data: 'type', name: 'type' },
            { data: 'amount', name: 'amount' },
            { data: 'status', name: 'status' },
            { data: 'txn_id', name: 'txn_id' },
            { data: 'txn_date', name: 'txn_date' },
			{ data: 'txn_method', name: 'txn_method' }
        ]
    });
    function resetInputs(){
     $('.name').val('');
     $('.type').val('');
     $('.status').val('');
     $('.txn_id').val('');
     userDataTable.draw();
     return true;
}

    $(document).on('click','[data-click-accept]',function(){
        var Url = $(this).attr('data-click-accept');

        Swal.fire({
            title: 'Are you sure?',
            text: "You want to accept this withdraw request",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Accept it!'
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
                                                'Withdraw Successful!',
                                                'Withdraw Request Accepted Successfully',
                                                'success'
                                                )
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


    $(document).on('submit','[data-filter-action]',function(e){
        e.preventDefault();
        userDataTable.draw();
    });
    $(document).on('click','[data-click-reject]',function(){
        var Url = $(this).attr('data-click-reject');

        Swal.fire({
            title: 'Are you sure?',
            text: "You want to reject withdraw request",
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
                                                'Withdraw Rejected!',
                                                'Withdraw Request Rejected Successfully',
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
