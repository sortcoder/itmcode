<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <link href="{{ asset('assets/admin/css/bootstrap.min.css') }}" rel="stylesheet">
    <link href="{{ asset('assets/admin/css/bootstrap-extended.css') }}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
    <h1></h1>
    <div class="container" style="background: #1211110d; padding: 54px;" >
        <div style="background: white; margin: 15px; padding: 55px;" >
            <div class="row">
                <div class="col-md-6 mt-2">
                    <img src="{{ asset('assets/admin/images/mainlogo.png') }}" width="180" alt="" />
                </div> 
            </div>
            <div class="row">
                <div class="col-md-12 mt-2">
                    <h3>{{ $title }}</h3>
                    <br/><br/> 
                    <p>Hello {{ ucwords($user_name) }},</p>
                    <p>{{ $body }}</p>
                </div> 
            </div> 
            <br/><br/>     
        </div>
    </div> 
  
</body>
</html>