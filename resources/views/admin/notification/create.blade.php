@extends('admin.layouts.app')

@section('content')
@section('style')
<link rel="stylesheet" href="{{  asset('assets/admin/css/dataTables.bootstrap5.min.css') }}">
@endsection
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
        <a href="javascript:;" data-send-user-ids="{{ route('send-notification-from-admin') }}" class="btn btn-outline-primary btn-sm">Send Notification</a>
        <div class="table-responsive mt-2">

            <table id="users-table" class="table table-sm table-striped table-bordered" style="width:100%">
                    <thead>
                        <tr>
                            <th width="5%"> <input type="checkbox" name="select_all" id="select_all"></th>
                            <th width="10%">Name</th>
                            <th width="10%">Email</th>
                            <th width="10%">Mobile</th>
                            <th width="10%">Type</th>
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
            "url": '{!! route("notification.create") !!}',
            "type": "GET",
            // "data": function(d) {
            //     d.course_id = $("#course_id").val(),
            //     d.page_type = $("#page_type").val()
            // }
        },
        columns:[
            {data:"id",name:"id",orderable:false},
            {data:"name",name:"name"},
            {data:"email",name:"email"},
            {data:"mobile",name:"mobile"},
            {data:"user_type",name:"user_type"},
        ]
    });


    $(document).on('click','[data-send-user-ids]',function(){
        var Url = $(this).attr('data-send-user-ids');
        var userIds = syncCheckBtn();
        var allstatus = $('#select_all').is(':checked');
        if(userIds.length > 0)
        {
            Swal.fire({
                text: `You want to credit balance to (${userIds.length}) launcher`,
                icon: 'warning',

                html:
                    '<h4 class="text-center">Send Notification </h4><input id="swal-input1" class=" form-control" required placeholder="Enter Notification Title">' +
                    '<textarea class="form-control mt-2" id="swal2-input2" required placeholder="Enter Description"></textarea>',
                showCancelButton: true,
                preConfirm: (value) => {

                        var title = $('#swal-input1').val();
                        var desc = $('#swal2-input2').val();
                        if(title ==='' || desc ==='')
                        {
                                    Swal.showValidationMessage(
                                        '<i class="fa fa-info-circle"></i>Title & Description both are required'
                                    )
                        }else{
                            $.ajax({
                                url:Url,
                                type: 'post',
                                data:{user_id:userIds,title:title,description:desc,all:allstatus},
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
                                                window.location.href = '{{ route("notification.index") }}';
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
