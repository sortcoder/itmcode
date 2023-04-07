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
			<a href="javascript:;" data-send-user-ids="{{ route('credit-balance-to-launcher') }}" class="btn btn-outline-primary btn-sm">Credit Balance</a>
		</div>
	</div>
	<div class="card-body"> 
		<table class="table table-bordered table-sm" id="users-table">
				<thead>
				<tr>
					 <th width="5%">
					 	<div class="form-check form-check-inline">
                            <input class="form-check-input select_all" name="select_all" type="checkbox" id="select_all">
                            <label class="form-check-label" for="select_all"></label>
                        </div>
					 </th>
					 <th>Image</th>
					 <th>Name</th>
					 <th>Email</th>
					 <th>Mobile  </th>
					 <th>Credit Balance</th>
                     <th>User Type</th> 
					 <th>Action</th>
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

var URL = '{{url('/')}}'; 

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

    });
  
var userDataTable = $('#users-table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url:'{{ url("admin/launcher_list") }}',
            data: function (d) {
                d.name = $('.name').val(),
                d.email = $('.email').val(),
                d.mobile = $('.mobile').val(),
                d.status = $('.status').val(),
                d.user_type = $('.user_type').val()

            },
        },
        columns: [
            { data: 'id', name: 'id', orderable: false, searchable: false },
            { data: 'profile', name: 'profile' },
            { data: 'name', name: 'name' },
            { data: 'email', name: 'email' },
			{ data: 'mobile', name: 'mobile' },
			{ data: 'credit_wallet_balance', name: 'credit_wallet_balance' },
            { data: 'user_type', name: 'user_type' }, 
            { data: 'action', name: 'action' },
        ]
    });

function resetInputs(){
     $('.name').val('');
     $('.email').val('');
     $('.mobile').val('');
     $('.approve_status').val('');
     $('.launcher_status').val('');
     userDataTable.draw();
}



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
