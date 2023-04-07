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
            <div class="col-2">
                <label>Launcher Name</label>
                <input type="text" class="form-control form-control-sm name" name="name" id="name" placeholder="Enter Launcher Name">
            </div>
            <div class="col-2">
                <label>Mobile </label>
                <input type="number" class="form-control form-control-sm mobile" name="mobile" id="mobile" placeholder="Enter Mobile">
            </div>
            <div class="col-2">
                <label>Email </label>
                <input type="email" class="form-control form-control-sm email" name="email" id="email" placeholder="Enter Email">
            </div>
            <div class="col-2">
                <label>Sketch ID</label>
                <input type="text" class="form-control form-control-sm launch_sketch" name="launch_sketch" id="launch_sketch" placeholder="Enter name">
            </div>
            <div class="col-2">
                <label>Status </label>
                {!! Form::select('approve_status',[''=>'Select Status']+\Config::get('constants.launcherStatus'),null,['class'=>'form-control form-control-sm approve_status','id'=>'approve_status']) !!}
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

    </div>
    <div class="card-body">
        <!-- <a href="javascript:;" data-send-user-ids="{{ route('credit-balance-to-launcher') }}" class="btn btn-outline-primary btn-sm">Credit Balance</a> -->
        <div class="table-responsive mt-2">

            <table id="users-table" class="table table-sm table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th width="5%">

                                <!-- <div class="form-check form-check-inline">
                                    <input class="form-check-input select_all" name="select_all" type="checkbox" id="select_all">
                                    <label class="form-check-label" for="select_all"></label>
                                </div> -->
                             </th>

                            <th width="10%">Launcher</th>
                            <th width="10%">Mobile No</th>
                            <th width="10%">Email</th>
                            <th width="10%">Sketch  </th>
                            <th width="10%">Image</th>
                            <th width="10%">Designation</th> 
                            <th width="10%">Image Quantity</th>
                            <th width="10%">Payment Status</th>
                            <th width="10%">Status</th>
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
            url:'{!! route("live_launcher").$createdby !!}',
            data: function (d) {
                d.name = $('.name').val(),
                d.email = $('.email').val(),
                d.mobile = $('.mobile').val(),
                d.approve_status = $('.approve_status').val()
                d.launch_sketch = $('.launch_sketch').val()
            },
        },
        columns:[
            { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            {data:"user_id",name:"user_id"},
            {data:"mobile",name:"mobile"},
            {data:"email",name:"email"},
            {data:"launch_sketch",name:"launch_sketch"},
            {data:"launch_image",name:"launch_image"},
            {data:"launch_designation",name:"launch_designation"},
            {data:"package_quantity",name:"package_quantity"},
            {data:"package_purchase_status",name:"package_purchase_status"},

            {data:"approve_status",name:"approve_status"},
            {data:"action",name:"DT_RowIndex",orderable:false},
        ]
    });

    $(document).on('submit','[data-filter-action]',function(e){
    e.preventDefault();
    userTable.draw();

});

function resetInputs(){
     $('.name').val('');
     $('.email').val('');
     $('.mobile').val('');
     $('.approve_status').val('');
     $('.launcher_status').val('');
     userTable.draw();
}

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
