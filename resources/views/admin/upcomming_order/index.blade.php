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
                <label>User Name</label>
                <input type="text" class="form-control form-control-sm name" name="name" id="name" placeholder="Enter User Name">
            </div>

            <div class="col-2">
                <label>Sketch Name</label>
                <input type="text" class="form-control form-control-sm launch_sketch" name="launch_sketch" id="launch_sketch" placeholder="Enter Sketch Name">
            </div>

            <div class="col-6"> 
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

        <div class="table-responsive mt-2">

            <table id="users-table" class="table table-sm table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th width="5%">#</th>
                            <th width="10%">User</th>
                            <th width="10%">Sketch Name</th>
                            <th width="10%">Image</th>
                            <!-- <th width="10%">Price</th>
                            <th width="10%">Quantity</th> -->
                            <th width="10%">Image Offered</th>
                            <th width="10%">Sale Price</th>
                            <th width="10%">Start Date</th>
                            <th width="10%">End Date</th>
                            <th width="10%">Payment Date</th> 
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
            url:'{!! route("upcomming_order.index") !!}',
            data: function (d) {
                d.name = $('#name').val(),
                d.launch_sketch = $('#launch_sketch').val()
            },
        },
        columns:[
            {data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            {data:"name",name:"name"},
            {data:"launch",name:"launch"},
            {data:"launch_image",name:"launch_image"},
            {data:"total_img_offered",name:"total_img_offered"},
            {data:"total_img_sell",name:"total_img_sell"}, 
            {data:"start_date",name:"start_date"},
            {data:"end_date",name:"end_date"},
            {data:"created_at",name:"created_at"}
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
