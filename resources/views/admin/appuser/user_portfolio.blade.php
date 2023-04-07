@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
<link
rel="stylesheet"
href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.css"
/>
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
<input type="hidden" id="user_id" value="{{$id}}" />
<div class="card">
    <div class="card-body"> 
        <div class="row">
            <div class="col-4">
                <b>Total Investment : </b>
                {{ config('app.currency').@$total_investment }}
            </div>

            <div class="col-4">
                <b>Current Value : </b>
                {{ config('app.currency').@$current_trade_price }}
            </div> 
            <div class="col-4">
                <b>Overall Return : </b> 
                @if($is_up_down=="up")
                    <span style="color:green; padding: 4px; background: #faebd778; "><b>{{ config('app.currency').@$today_difference }}</b> ({{ round(@$profit_stock_in_percent,2) }}%)
                @elseif($is_up_down=="down")
                    <span style="color:red; padding: 4px; background: #faebd778; "><b>{{ config('app.currency').@$today_difference }}</b> ({{ round(@$profit_stock_in_percent,2) }}%)
                @else
                    <span style="color:black; padding: 4px; background: #faebd778; "> <b>{{ config('app.currency').@$today_difference }}</b> ({{ round(@$profit_stock_in_percent,2) }}%)</span>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header d-flex justify-content-between">
        <div class="title">
            <h5 style="padding-top: 14px;" >User Portfolio Detail</h5>
        </div> 
        
    </div>
    <div class="card-body">

        <div class="table-responsive mt-2">

            <table id="users-table" class="table table-sm table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th width="5%">#</th> 
                            <th width="10%">Sketch Name</th>
                            <th width="10%">Image</th>
                            <th width="10%">Closed Price</th>
                            <th width="10%">Price</th>
                            <th width="10%">Quantity</th>
                            <th width="10%">Total Price</th> 
                            <th width="10%">Created By</th>
                            <th width="10%">Created Date</th>
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
            url:'{!! route("portfolio-list") !!}',
            data: function (d) {
                d.user_id = $('#user_id').val(),
                d.launch_sketch = $('#launch_sketch').val(),
                d.type = $('#type').val(),
                d.status = $('#status').val()
            },
        },
        columns:[
            {data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false }, 
            {data:"launch_sketch",name:"launch_sketch"},
            {data:"launch_image",name:"launch_image"}, 
            {data:"prev_day_closed_price",name:"prev_day_closed_price"},
            {data:"buy_stock_price",name:"buy_stock_price"},
            {data:"buy_stock_qty",name:"buy_stock_qty"},
            {data:"total_purchased_price",name:"total_purchased_price"},  
            {data:"created_by",name:"created_by"},
            {data:"created_at",name:"created_at"}
        ]
    }); 
</script>
@endsection
@endsection
