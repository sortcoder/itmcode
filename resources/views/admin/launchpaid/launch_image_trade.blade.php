@extends('admin.layouts.app')

@section('content')
@section('style')
    <link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
@endsection
<style type="text/css">
    
    .cls_div{
        width: 95px;
        height: 51px;
        background: #00803f91;
        padding: 5px;
        border-radius: 11px;
        color: white;
        font-weight: 500;
    }
</style>

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

            <div class="col-4">

                <button type="submit" class="btn btn-primary btn-sm mt-4"><i class="fadeIn animated bx bx-search"></i> Search</button>
                <button class="btn btn-danger btn-sm mt-4" onclick="return resetInputs()">Reset</button>
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
        <!-- <form action="" class="form-horizontal comm_form" method="POST" role="form" enctype="multipart/form-data"> 
            <input type="text" placeholder="buy_record_id" required name="buy_record_id" id="buy_record_id" value="" />
            <input type="text" placeholder="sell_record_id" required name="sell_record_id" id="sell_record_id" value="" />
            @csrf
            <button type="submit" class="btn btn-primary btn-sm mt-3 float-right" id="assign_btn" >Submit</button>
        </form> -->
	</div>
	<div class="card-body">

        <div class="table-responsive mt-2">

            <table id="users-table" class="table table-sm table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th width="5%">#</th>
                            <th width="10%">Launcher</th>
                            <th width="10%">Mobile No</th>
                            <th width="10%">Image</th>
                            <th width="10%">Sketch</th>
                            <th width="10%">Image Quantity</th>
                            <th width="10%">Image Offered</th>
                            <th width="10%">Image Sell Price</th>
                            <th width="10%">Live price</th> 
                            <th width="10%"><input type="checkbox" value="1" id="select_all_buy" > Buy Status</th>
                            <th width="10%"><input type="checkbox" value="1" id="select_all_sell" > Sell Status</th>
                            <th>Action</th>
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
<script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js"></script>

<script type="text/javascript">

    var URL = '{{url('/')}}'; 
 
    $(document).on("click", '#select_all_buy', function(e){  

        setTimeout(function(){   
            if($('#select_all_buy').is(':checked')){  
                $('.common_buy_status_update').each(function(){
                    $(".common_buy_status_update").prop('checked', true); 

                    data_id = $(this).data('id'); 
                    updated_status = '2';   
                    data_action = $(this).data('action');

                    buy_stat_update(data_id,updated_status,data_action);
                })
            }else{  
                $('.common_buy_status_update').each(function(){
                    $(".common_buy_status_update").prop('checked', false);

                    data_id = $(this).data('id'); 
                    updated_status = '1';   
                    data_action = $(this).data('action');

                    buy_stat_update(data_id,updated_status,data_action);
                })
            }
        }, 1000);
    });

    $(document).on("click", '#select_all_sell', function(e){ 
        setTimeout(function(){ 
            if($('#select_all_sell').is(':checked')){
                $('.common_sell_status_update').each(function(){
                    $(".common_sell_status_update").prop('checked', true);

                    data_id = $(this).data('id'); 
                    updated_status = '2';   
                    data_action = $(this).data('action');

                    sell_stat_update(data_id,updated_status,data_action);
                })
            }else{
                $('.common_sell_status_update').each(function(){
                    $(".common_sell_status_update").prop('checked', false);

                    data_id = $(this).data('id'); 
                    updated_status = '1';   
                    data_action = $(this).data('action');

                    sell_stat_update(data_id,updated_status,data_action);
                })
            }
        }, 1000);
    });

    function sell_stat_update(data_id,updated_status,data_action){

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        }); 
         
        var form_data = new FormData();
        form_data.append("record_id",data_id);
        form_data.append("status",updated_status);
       
        form_action = data_action+'_status_update';    
          
        $.ajax({
            type:"POST", 
            url: URL+"/admin/"+form_action,
            data:form_data, 
            enctype: 'multipart/form-data',
            processData: false,  // Important!
            contentType: false,
            cache: false,
            dataType: "json",
             
            success: function(response){  
          
                $('#message_box').html(''); 

                $('#users-table').DataTable().ajax.reload();  
            }
        }); 
    }

    function buy_stat_update(data_id,updated_status,data_action){

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        }); 
         
        var form_data = new FormData();
        form_data.append("record_id",data_id);
        form_data.append("status",updated_status);
       
        form_action = data_action+'_status_update';    
          
        $.ajax({
            type:"POST", 
            url: URL+"/admin/"+form_action,
            data:form_data, 
            enctype: 'multipart/form-data',
            processData: false,  // Important!
            contentType: false,
            cache: false,
            dataType: "json",
             
            success: function(response){  
          
                $('#message_box').html(''); 
                $('#users-table').DataTable().ajax.reload();  
            }
        }); 
    }

    $(document).on("click", '.common_sell_status_update', function(e){

        data_id = $(this).data('id'); 
        updated_status = $(this).val();  
        data_action = $(this).data('action'); 

        sell_stat_update(data_id,updated_status,data_action); 
    });

    $(document).on("click", '.common_buy_status_update', function(e){

        data_id = $(this).data('id');        
        var updated_status = $(this).val();  
        data_action = $(this).data('action'); 

        buy_stat_update(data_id,updated_status,data_action); 
 
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
            url:'{!! route("launch_image_tradding") !!}',
            data: function (d) {
                d.name = $('.name').val(),
                d.mobile = $('.mobile').val(),
                d.launch_sketch = $('.launch_sketch').val(),
                d.account_type = '{{ $account_type }}'
            },
        },
        columns:[
            {data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            {data:"user_id",name:"user_id"},
            {data:"mobile",name:"mobile"},
            {data:"launch_image",name:"launch_image"},
            {data:"launch_sketch",name:"launch_sketch"},
            {data:"total_img_quanity",name:"total_img_quanity"},
            {data:"total_img_offered",name:"total_img_offered"},
            {data:"total_img_sell",name:"total_img_sell"},
            {data:"live_image_price",name:"live_image_price"}, 
            {data:"buy_status",name:"buy_status"},
            {data:"sell_status",name:"sell_status"},
            {data:"action",name:"action"}
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

</script>
@endsection
@endsection

