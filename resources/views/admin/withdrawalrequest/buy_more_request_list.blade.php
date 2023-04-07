@extends('admin.layouts.app')

@section('content')
@section('style')
    <link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
    <style>
        .txcls{ margin-top: 7px; }
    </style>
@endsection
<div class="card">
	<div class="card-header d-flex justify-content-between">
		<div class="title">
			<h5>{{  $title  }}</h5>
		</div>
		<div class="addbutton"> 
		</div>
	</div>
	<div class="card-body">
		<table class="table table-bordered table-sm" id="users-table">
				<thead>
				<tr>
					 <th width="5%">#</th>
					 <th width="10%">Date/Time</th>
					 <th width="10%">User</th>
                     <th width="10%">Launchpad Name</th>
                     <th width="10%">Image</th>
					 <th width="15%">Quantity  </th> 
                     <th width="10%">Status</th>
					 <th width="20%">Action</th>
				</tr>
				</thead>
				<tbody>
				</tbody>
		</table>


	</div>
</div>

<div class="modal" id="myRequestDetailUpdateModal">
  <div class="modal-dialog">
    <div class="modal-content"> 
      <!-- Modal Header -->
      <div class="modal-header">
        <h4 class="modal-title">Set Price Details</h4>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div> 
      <!-- Modal body -->
      <form id="validate" action="{{ route('buy_more_request_update') }}"  class="form-horizontal comm_form reset_form" method="POST" role="form" >
        @csrf
        <input type="hidden" name="record_id" id="record_id" />
          <div class="modal-body" style="padding: 2px 30px;" >   
                <div id="message_box" class="row col-md-12" ></div>
                <div class="row txcls">
                    <div class="col-sm-4">Quantity :</div>
                    <div class="col-sm-8">
                        <input type="text" disabled name="quantity" id="frm_quantity" class="form-control validate[required] ">
                    </div>
                </div>
                <div class="row txcls">
                    <div class="col-sm-4">Price. :</div>
                    <div class="col-sm-8">
                        <input type="text" name="price" id="frm_price" class="form-control validate[required] "> 
                    </div>
                </div>  
          </div> 
          <!-- Modal footer -->
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary" d="common_form_submit">Submit</button>
          </div> 
      </form>
    </div>
  </div>
</div>

@section('script')
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="{{ asset('assets/admin/js/dataTables.bootstrap5.min.js') }}"></script>
<script src="{{ asset('assets/admin/js/jquery.dataTables.min.js') }}"></script>
<script type="text/javascript">

    var URL = '{{url('/')}}';  

    $(document).on("click", '.update_buy_request_in_modal', function(e){     

        $('#frm_quantity').val("");
        $('#frm_price').val(""); 

        form_data_id = $(this).data('id');    
        $('#record_id').val(form_data_id);

        form_data_quantity = $(this).data('quantity');    
        $('#frm_quantity').val(form_data_quantity);

        form_data_price = $(this).data('price');    
        $('#frm_price').val(form_data_price);
        
    });


    $(document).ready(function() { 
            
        $(".comm_form").submit(function(e) {
            
            e.preventDefault(); 

            $.ajaxSetup({
                headers: { 
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            }); 

            var form = $(this);
            var url = form.attr('action');
            
            errorFlag = true;
            $(this).find("input, select, textarea").each(function () {

                if ($(this).hasClass("validate[required]") && $(this).val() == "") {

                    $(this).addClass("is-invalid"); 
                    errorFlag = false;
                }
            });

            $('#message_box').html('');

            if(errorFlag){  
                $.ajax({ 
                    type:"POST", 
                    url: url,
                    data:new FormData(this), 
                    enctype: 'multipart/form-data',
                    processData: false,  // Important!
                    contentType: false,
                    cache: false,
                    dataType: "JSON",  
                    success: function(response)
                    {    
                         if(response.status=='2' || response.status=='1' || response.status=='0'){    

                            if(response.status=='2')
                                alert_type = 'alert-warning';
                            else if(response.status=='1')
                                alert_type = 'alert-success';
                            else
                                 alert_type = 'alert-danger';

                            var htt_box = '<div class="alert '+alert_type+' " role="alert">'+ response.message+'</div>';

                            $('#message_box').html(htt_box);

                            $('#users-table').DataTable().ajax.reload(); 
                            $('.reset_form').click();
                        }
                         
                    }
                 }); 
            }    
            
        }); 
    });     


var userDataTable = $('#users-table').DataTable({
        processing: true,
        serverSide: true,
        ajax: '{!! route("buy_more_request.index") !!}',
        columns: [
            { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            { data: 'created_at', name: 'created_at' },
            { data: 'name', name: 'name' },
            { data: 'launch_sketch', name: 'launch_sketch' },
            { data: 'launch_image', name: 'launch_image' },
            { data: 'quantity', name: 'quantity' }, 
			{ data: 'status', name: 'status' },
            { data: 'action', name: 'action' },
        ]
    });

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
                                               //  userTable.draw();
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
