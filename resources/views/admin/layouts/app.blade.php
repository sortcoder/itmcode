
<!doctype html>
<html lang="en" class="dark-theme">

<head>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="{{ URL::to('/') }}">
    <meta name="csrf-token" content="{{  csrf_token() }}">
	<!--favicon-->
	<link rel="icon" href="{{ asset('assets/admin/images/favicon-32x32.png') }}" type="image/png" />
	<!--plugins-->
	<link href="{{ asset('assets/admin/css/jquery-jvectormap-2.0.2.css') }}" rel="stylesheet"/>
	<link href="{{ asset('assets/admin/css/simplebar.css') }}" rel="stylesheet" />
	<link href="{{ asset('assets/admin/css/perfect-scrollbar.css') }}" rel="stylesheet" />
	<link href="{{ asset('assets/admin/css/metisMenu.min.css') }}" rel="stylesheet" />
	<!-- loader-->
	<link href="{{ asset('assets/admin/css/pace.min.css') }}" rel="stylesheet" />
	<script src="{{ asset('assets/admin/js/pace.min.js') }}"></script>
	<!-- Bootstrap CSS -->
	<link href="{{ asset('assets/admin/css/bootstrap.min.css') }}" rel="stylesheet">
	<link href="{{ asset('assets/admin/css/bootstrap-extended.css') }}" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">

	<link href="{{ asset('assets/admin/css/app.css') }}" rel="stylesheet">
	<link href="{{ asset('assets/admin/css/icons.css') }}" rel="stylesheet">
	<!-- Theme Style CSS -->
	<link rel="stylesheet" href="{{ asset('assets/admin/css/dark-theme.css') }}" />
	<link rel="stylesheet" href="{{ asset('assets/admin/css/semi-dark.css') }}" />
	<link rel="stylesheet" href="{{ asset('assets/admin/css/header-colors.css') }}" />
	<title>{{ $title ?? 'Home' }} | {{ getenv('APP_NAME') }}</title>
    <script>

    var className = localStorage.getItem('ThemeColors') ;
    document.querySelector('html').setAttribute('class',className)





    </script>
    <style>
 .error{
            color:red;
        }
        .sidebar-wrapper .metismenu a .menu-title {
            font-size: smaller;
        }
        /* #users-table_processing{
            background: #333222;
            color: white;
            box-shadow: 1px -1px 3px #2b30;
        } */
        /* table th{
            text-align: center;
            line-height: 42px;
        } */
        /* table td{
            text-align: center;
            line-height: 42px;
        } */
        /* .form-switch{
            justify-content: center !important;
             display: flex !important;
        } */

    </style>
    @yield('style')
</head>

<body>
	<!--wrapper-->
	<div class="wrapper">
		<!--sidebar wrapper -->
		@include('admin.layouts.sidebar')
		<!--end sidebar wrapper -->
		<!--start header -->
        @include('admin.layouts.header')
		<!--end header -->
		<!--start page wrapper -->
		<div class="page-wrapper">
            <div class="page-content">


                @if ($message = Session::get('success'))
                    <div class="alert alert-success border-0 bg-success alert-dismissible fade show">
                        <div class="text-white">{{ $message }}</div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>

                 @endif

                 @if ($message = Session::get('error'))
                 <div class="alert alert-danger border-0 bg-danger alert-dismissible fade show">
                     <div class="text-white">{{ $message }} kghjgyhj</div>
                     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                 </div>

              @endif
                @yield('content')
            </div>
		</div>
		<!--end page wrapper -->
		<!--start overlay-->
		<div class="overlay toggle-icon"></div>
		<!--end overlay-->
		<!--Start Back To Top Button-->
		  <a href="javaScript:;" class="back-to-top"><i class='bx bxs-up-arrow-alt'></i></a>
		<!--End Back To Top Button-->
		@include('admin.layouts.footer')
	</div>
	<!--end wrapper-->
	<!--start switcher-->
   @include('admin.layouts.theme')
	<!--end switcher-->
	<!-- Bootstrap JS -->
	<script src="{{ asset('assets/admin/js/bootstrap.bundle.min.js') }}"></script>
	<!--plugins-->
	<script src="{{ asset('assets/admin/js/jquery.min.js') }}"></script>
	<script src="{{ asset('assets/admin/js/simplebar.min.js') }}"></script>
	<script src="{{ asset('assets/admin/js/metisMenu.min.js') }}"></script>
	<script src="{{ asset('assets/admin/js/perfect-scrollbar.js') }}"></script>
	<script src="{{ asset('assets/admin/js/index.js') }}"></script>
	<!--app JS-->
    <script src="https://unpkg.com/feather-icons@4.29.0/dist/feather.min.js"></script>
    <script>
		feather.replace()
	</script>
	<script src="{{ asset('assets/admin/js/app.js') }}"></script>

    @yield('script')
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>


     $(document).on('click','[data-logout-click]',function(){
        var Url = $(this).attr('data-logout-click');

        Swal.fire({
            title: 'Are you sure?',
            text: "You want exit from this app",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Logout'
            }).then((result) => {
            if (result.isConfirmed) {

                $.ajax({
                                url:Url,
                                type: 'post',
                                data:{status:2},
                                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
                                success: function (data) { 

                                               Swal.fire(
                                                'Success!',
                                                'Logout Success',
                                                'success'
                                                )
                                                window.location.href = Url; 

                                },
                                error:function(err){

                                        /*Swal.fire({
                                                icon: 'error',
                                                title: 'Error!',
                                                text:'Something Went Wrong!',
                                                })*/
                                        location.reload();
                                }
                            });




            }
            })

    });
</script>
</body>

</html>
