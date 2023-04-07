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
                    <option value="1">Add Money</option>
                    <option value="2">Withdraw Money</option>
                </select>

            </div> 
            <div class="col-3">
                <label for="name">Txn ID</label>
                <input type="text" class="form-control form-control-sm txn_id" name="txn_id" id="txn_id" placeholder="Enter Transactio ID">
            </div>
            <div class="col-6"> 
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
					 <th width="10%">Txn Id</th> 
                     <th width="15%">Amount</th> 
                     <th width="10%">Txn Status</th>
                     <th width="10%">Payment Method</th>
                     <th width="10%">Date/Time</th>
                     <th width="10%">Action</th>
				</tr>
				</thead>
				<tbody>
				</tbody>
		</table>


	</div>
</div>

<div class="modal" id="myModal">
  <div class="modal-dialog">
    <div class="modal-content">

      <!-- Modal Header -->
      <div class="modal-header">
        <h4 class="modal-title">Transaction Details</h4>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <!-- Modal body -->
      <div class="modal-body" style="padding: 2px 30px;" > 
            <!-- <div class="row txcls">
                <div class="col-sm-4">Txn. Id</div>
                <div class="col-sm-8" id="show_txn_id" ></div>
            </div>
            <div class="row txcls">
                <div class="col-sm-4">Razorpay Order Id :</div>
                <div class="col-sm-8" id="show_razorpay_order_id" ></div>
            </div>
            <div class="row txcls">
                <div class="col-sm-4">Payment Method :</div>
                <div class="col-sm-8" id="show_payment_method" ></div>
            </div>
            <div class="row txcls">
                <div class="col-sm-4">Txn. Date :</div>
                <div class="col-sm-8" id="show_txn_date" ></div>
            </div> -->
            <div class="row txcls" id="razor_div">
                <div class="col-sm-4">Razorpay Order Id :</div>
                <div class="col-sm-8" id="show_razorpay_order_id" ></div>
            </div> 
            <div class="row txcls">
                <div class="col-sm-4">Bank Name :</div>
                <div class="col-sm-8" id="show_bank_name" ></div>
            </div>
            <div class="row txcls">
                <div class="col-sm-4">Account No. :</div>
                <div class="col-sm-8" id="show_account_no" ></div>
            </div>
            <div class="row txcls">
                <div class="col-sm-4">Wallet Type. :</div>
                <div class="col-sm-8" id="show_wallet_type" ></div>
            </div> 
      </div>

      <!-- Modal footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>

@section('script')
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="{{ asset('assets/admin/js/dataTables.bootstrap5.min.js') }}"></script>
<script src="{{ asset('assets/admin/js/jquery.dataTables.min.js') }}"></script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.bundle.min.js"></script>
<script type="text/javascript">

    var URL = '{{url('/')}}';  

    $(document).on("click", '.view_in_modal', function(e){   
            
            $.ajaxSetup({
                headers: { 
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            }); 

            form_data_id = $(this).data('id');    
            txn_type = $('#type').val();
            var form_data = new FormData();
            form_data.append("record_id",form_data_id); 
            form_data.append("txn_type",txn_type); 

            $.ajax({
                type:"POST", 
                url: '{!! route("get_txn_data") !!}',
                data:form_data, 
                enctype: 'multipart/form-data',
                processData: false,  // Important!
                contentType: false,
                cache: false,
                dataType: "JSON", 
                success: function(response){   
                    if(response.result.length>0){ 
                        console.log(response.result);
                        txn_id = response.result[0].txn_id;
                        razorpay_order_id = response.result[0].order_id;  
                        payment_method = response.result[0].payment_method;  
                        created_at = response.result[0].created_at;  
                        bank_name = response.result[0].bank_name;  
                        account_no = response.result[0].account_no;  
                        card_no = response.result[0].card_no;     
                        user_wallet_type = response.result[0].user_wallet_type;

                        if(txn_type=='2'){
                            $('#razor_div').hide();
                        }else{
                             $('#razor_div').show();
                             $('#show_razorpay_order_id').text(razorpay_order_id);
                        }

                        wallet_type_name = "";
                        if(user_wallet_type==1){
                            wallet_type_name = "Launcher";
                        }else if(user_wallet_type==2){
                            wallet_type_name = "Trader";
                        }

                        $('#show_bank_name').text(bank_name);
                        $('#show_account_no').text(account_no); 
                        $('#show_wallet_type').text(wallet_type_name); 
                    }  
                    
                }
            });
        });

var userDataTable = $('#users-table').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url:'{!! route("user_payment_transaction") !!}',
            data: function (d) { 
                d.type = $('.type').val(), 
                d.txn_id = $('.txn_id').val(),
                d.user_id = '{{ $user_id }}'
            },
        },
        columns: [
            { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            { data: 'txn_id', name: 'txn_id' }, 
            { data: 'amount', name: 'amount' }, 
            { data: 'txn_status', name: 'txn_status' },
            { data: 'payment_method', name: 'payment_method' },
            { data: 'created_at', name: 'created_at' }, 
			{ data: 'action', name: 'action' }
        ]
    });
    function resetInputs(){  
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
