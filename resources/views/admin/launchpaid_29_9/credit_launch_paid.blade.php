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
                <input type="text" class="form-control form-control-sm username" name="username" id="username" placeholder="Enter name">
            </div>
            <div class="col-3">
                <input type="text" class="form-control form-control-sm emailid" name="emailid" id="emailid" placeholder="Enter email">
            </div>
            <div class="col-3">
                <input type="text" class="form-control form-control-sm mobileno" name="mobileno" id="mobileno" placeholder="Enter mobile">
            </div>
        </div>
            <div class="row">
            <div class="col-3">

                <button type="submit" class="btn btn-primary btn-sm mt-3"><i class="fadeIn animated bx bx-search"></i> Search</button>
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
        <a href="javascript:;" data-send-user-ids="{{ route('credit-balance-to-launcher') }}" class="btn btn-outline-primary btn-sm">Credit Balance</a>
        <div class="table-responsive mt-2">

            <table id="users-table" class="table table-sm table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th width="5%"> <input type="checkbox" name="select_all" id="select_all"></th>
                            <th width="10%">Name</th>
                            <th width="10%">Email</th>
                            <th width="10%">Mobile  </th>
                            <th width="10%">Wallet Balance </th>
                            <th width="10%">Credit Balance </th>
                            <th width="10%">Action</th>
                        </tr>
                    </thead>
                    <tbody>
				    </tbody>
		</table>
        </div>

	</div>
</div>
@section('script')
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script src="{{ asset('assets/admin/js/dataTables.bootstrap5.min.js') }}"></script>
<script src="{{ asset('assets/admin/js/jquery.dataTables.min.js') }}"></script>
<script type="text/javascript">

function syncCheckBtn(){
    var atLeastOneIsChecked = $('input[name="user_id[]"]:checked').length > 0;
    var idsArr = [];
    $('input[name="user_id[]"]:checked').each(function(index,value){
        if(this.value)
        {
            idsArr.push(this.value)
        }

    })
    return idsArr;
}

function unCheckAll(){
    $('input[name="user_id[]"]:checked').each(function(index,value){
        this.checked = false;
    });
    $('#select_all').prop('checked', false);
}

    $(document).on('click', '#select_all', function (){
            this.value = this.checked ? 1 : 0;
            if(this.checked){
                $('.user_id').prop('checked', true);
            }else{
                $('.user_id').prop('checked', false);

            }
            syncCheckBtn();
        });
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
            url:'{!! route("launchpaid.index").$createdby !!}',
            data: function (d) {
                d.name = $('.username').val(),
                d.email = $('.emailid').val(),
                d.mobile = $('.mobileno').val(),
                d.status = $('.statusid').val()
            },
        },
        columns:[
            { data: 'id', name: 'id', orderable: false, searchable: false },
            {data:"name",name:"name"},
            {data:"email",name:"email"},
            {data:"mobile",name:"mobile"},
            {data:"wallet_balance",name:"wallet_balance"},
            {data:"credit_balance",name:"credit_balance"},
            {data:"action",name:"DT_RowIndex",orderable:false},
        ]
    });

    $(document).on('submit','[data-filter-action]',function(e){
    e.preventDefault();
    userTable.draw();

});
    $(document).on('click','[data-send-user-ids]',function(){
        var Url = $(this).attr('data-send-user-ids');
        var userIds = syncCheckBtn();
        if(userIds.length > 0)
        {
            Swal.fire({
                text: `You want to credit balance to (${userIds.length}) launcher`,
                icon: 'warning',
                input: 'number',
                inputValue:'{{ settingConfig("ADD_CREDIT_BALANCE") }}',
                inputLabel: 'Enter Credit Amount',
                inputPlaceholder: 'Enter credit Amount',
                showCancelButton: true,
                preConfirm: (value) => {
                    if (!value) {
                        Swal.showValidationMessage(
                            '<i class="fa fa-info-circle"></i> Please enter amount'
                        )
                    }else{
                         $.ajax({
                                url:Url,
                                type: 'post',
                                data:{user_id:userIds,amount:value},
                                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                                success: function (data) {

                                        if(data.status === 'success')
                                        {
                                                Swal.fire({
                                                icon: 'success',
                                                title: 'Success!',
                                                text:data.message,
                                                });
                                                unCheckAll();
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


                }
            });
        }else{
            Swal.fire({
                        icon: 'question',
                        title: 'Oops!',
                        text:'Please select launchers!',
                     });
        }
    });
</script>
@endsection
@endsection
