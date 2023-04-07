<!doctype html>
<html lang="en">

<head>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="{{  URL::to('/') }}">
	<!--favicon-->
	<link rel="icon" href="{{ asset('assets/images/favicon-32x32.png') }}" type="image/png" />
	<!--plugins-->
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
	<title>Login | {{ getenv('APP_NAME') }}</title>
</head>

<body class="bg-login">
	<!--wrapper-->
	<div class="wrapper">
		<div class="section-authentication-signin d-flex align-items-center justify-content-center my-5 my-lg-0">
			<div class="container-fluid">
				<div class="row row-cols-1 row-cols-lg-2 row-cols-xl-3">
					<div class="col mx-auto">

						<div class="card">
							<div class="card-body">
                                <div class="mb-4 text-center">
                                    <img src="{{ asset('assets/admin/images/mainlogo.png') }}" width="180" alt="" />
                                </div>
								<div class="border p-4 rounded">
									<div class="text-center">
										<h3 class="">Sign in</h3>
										{{-- <p>Don't have an account yet? <a href="{{  route('register') }}">Sign up here</a> --}}
										</p>
									</div>
									{{-- <div class="d-grid">
										<a class="btn my-4 shadow-sm btn-white" href="javascript:;"> <span class="d-flex justify-content-center align-items-center">
                                            <img class="me-2" src="{{ asset('assets/admin/images/search.svg') }}" width="16" alt="Image Description">
                                                <span>Sign in with Google</span>
											</span>
										</a> <a href="javascript:;" class="btn btn-facebook"><i class="bx bxl-facebook"></i>Sign in with Facebook</a>
									</div>
									<div class="login-separater text-center mb-4"> <span>OR SIGN IN WITH EMAIL</span>
										<hr/>
									</div> --}}



									<div class="form-body">
                                        <form method="POST" class="row g-3" action="{{ route('login') }}">
                                            @csrf
                                            @if ($errors->any())
                                            <div style="background: #ffe9e9;
    font-weight: initial;
    font-size: smaller;
    border-radius: 6px;
    box-shadow: 1px 1px 1px #cabdbd;">
                                                
                                                <ul class="mt-3 list-disc list-inside text-sm text-red-600">
                                                    @foreach ($errors->all() as $error)
                                                        <li>{{ $error }}</li>
                                                    @endforeach
                                                </ul>
                                            </div>
                                        @endif
											<div class="col-12">
												<label for="inputEmailAddress" class="form-label">Email Address</label>
												<input type="email" name="email" class="form-control" id="inputEmailAddress" value="{{ old('email') }}" placeholder="Email Address">
											</div>
											<div class="col-12">
												<label for="inputChoosePassword" class="form-label">Enter Password</label>
												<div class="input-group" id="show_hide_password">
													<input type="password" name="password" class="form-control border-end-0" id="inputChoosePassword" value="" placeholder="Enter Password"> <a href="javascript:;" class="input-group-text bg-transparent"><i class='bx bx-hide'></i></a>
												</div>
											</div>

											<div class="col-md-6">
												<div class="form-check form-switch">
													<input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" name="remember" >
													<label class="form-check-label" for="flexSwitchCheckChecked">{{ __('Remember me') }}</label>
												</div>
											</div>

											<!-- <div class="col-md-6 text-end">	<a href="{{ route('password.request') }}"> {{ __('Forgot password ?') }}</a>
											</div> -->
											<div class="col-12">
												<div class="d-grid">
													<button type="submit" class="btn btn-primary"><i class="bx bxs-lock-open"></i> {{ __('Sign in') }}</button>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!--end row-->
			</div>
		</div>
	</div>
	<!--end wrapper-->
	<!-- Bootstrap JS -->
	<script src="{{ asset('assets/admin/js/bootstrap.bundle.min.js') }}"></script>
	<!--plugins-->
	<script src="{{ asset('assets/admin/js/jquery.min.js') }}"></script>
	<script src="{{ asset('assets/admin/js/simplebar.min.js') }}"></script>
	<script src="{{ asset('assets/admin/js/metisMenu.min.js') }}"></script>
	<script src="{{ asset('assets/admin/js/perfect-scrollbar.js') }}"></script>
	<!--Password show & hide js -->
	<script>
		$(document).ready(function () {
			$("#show_hide_password a").on('click', function (event) {
				event.preventDefault();
				if ($('#show_hide_password input').attr("type") == "text") {
					$('#show_hide_password input').attr('type', 'password');
					$('#show_hide_password i').addClass("bx-hide");
					$('#show_hide_password i').removeClass("bx-show");
				} else if ($('#show_hide_password input').attr("type") == "password") {
					$('#show_hide_password input').attr('type', 'text');
					$('#show_hide_password i').removeClass("bx-hide");
					$('#show_hide_password i').addClass("bx-show");
				}
			});
		});
	</script>
	<!--app JS-->
	<script src="{{ asset('assets/admin/js/app.js') }}"></script>
</body>

</html>
