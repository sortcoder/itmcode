@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
<!-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet"> -->
<style>
    .txcls{
        border-bottom: 1px solid #d3d3d36e;
        padding: 7px 2px;
    }
</style>
@endsection
@if(!$page_type)
    <div class="card">
        <div class="card-body">
            <div class="row">
                <div class="col-12"><h6><i class="fadeIn animated bx bx-filter-alt"></i> Filter</h6></div>
            </div>
            <form data-filter-action="" method="post">
                <div class="row">  
                <div class="col-3">
                    <label for="type">Transaction Type</label>  
                    <select class="form-control form-control-sm type" id="type" name="type">
                        <option value="1">Tradding Wallet</option>
                        <option value="2">Launcher Wallet</option>
                    </select> 
                </div>  
                <div class="col-6"> 
                    <button type="submit" class="btn btn-primary btn-sm mt-3"><i class="fadeIn animated bx bx-search"></i> Search</button>
                    <button type="button" class="btn btn-danger btn-sm mt-3" onclick="return resetInputs()">Reset</button> 
                </div>
            </div>
            </form>
        </div>
    </div>
@endif
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
                        <th width="10%">Date/Time</th> 
                        <th width="10%">Amount</th> 
                        <th width="5%">Type</th> 
                        <th width="20%">Remark</th> 
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

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.bundle.min.js"></script>
<script type="text/javascript">

    var URL = '{{url('/')}}';  
    
    $(document).on('submit','[data-filter-action]',function(e){
        e.preventDefault();
        userDataTable.draw();
    });
    
    var userDataTable = $('#users-table').DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url:'{!! route("user_credit_balance_history") !!}',
                data: function (d) { 
                    d.type = $('.type').val(),  
                    d.user_id = '{{ $user_id }}'
                },
            },
            columns: [
                { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
                { data: 'created_at', name: 'created_at' }, 
                { data: 'amount', name: 'amount' }, 
                { data: 'payment_type', name: 'payment_type' },  
                { data: 'remark', name: 'remark' } 
            ]
        });
        function resetInputs(){  
         $('.typr').val('');
         userDataTable.draw();
         return true;
    } 
</script>
@endsection
@endsection
