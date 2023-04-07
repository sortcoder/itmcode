@extends('admin.layouts.app')

@section('content')
@section('style')
<?php
use Carbon\Carbon;?>
<style>

.dropzone .dz-preview:hover .dz-image img {
    filter: blur(0);
    -webkit-filter: blur(0);
}
.dz-progress{
width: 90% !important;
text-align: center;
margin:0 0 0 5% !important;
height: 2px !important;
left: 0 !important;
top: 0 !important;
border-radius: 2px !important;
padding: 0;
z-index: 600;

background: rgba(0,0,0,.1);
border: 0 !important;
}
.dz-progress .dz-upload {
  background: #66afef !important;
}

.dz-remove {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-block;
  background: #FFF;
  z-index: 500;
  font-size: 22px;
  padding: 2px 10px;
  cursor: pointer;
}

.dz-remove i {
  font-size: 13px;
  cursor: pointer !important;
  color: rgba(0, 0, 0, 0.5);
  background: black;
}

.dz-ajax-caption {
  margin-top: 4px;
  cursor: text !important;
}

.dropzone .dz-filename {
  word-break: break-all;
}

.dropzone .dz-message {
  margin: 5px 0 !important;
}

.dropzone-single {
  width: 245px !important;
}

.dropzone {
  padding: 5px !important;
  border: 0 !important;
  -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 5px;
  position: relative;
  display: table;
  height: 100px;
}

.dropzone .needsclick:before {
  content: ' ';
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.4;
  background: #FFF url("../assets/admin/images/upload-to-cloud.jpg") no-repeat center center;
  background-size: 51px;
}

.dropzone .needsclick {
  display: inline-block;
  position: relative;
  height: 170px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin: 17px 0 !important;
}

.dropzone .dz-preview .dz-image img {
  width: 100%;
}
.dropzone .dz-preview .dz-remove  {
      font-size: 19px;
    text-align: center;
    display: block;
    cursor: pointer;
    /* border: 1px solid; */
    height: 25px !important;
    /* color: black; */
    /* content: 'X'; */
    width: 31px;
    font-weight: 700;
}
</style>
@endsection


    <div class="card">
        <div class="card-header"><h6>Personal Details</h6></div>
        <div class="card-body">
            <table class="table table-bordered table-sm">

                <tbody>
                    <tr>
                        <th>#</th>
                        <th>Date/Time</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                    @isset($user->credit_balance)
                    @php
                        $sr = 1;
                    @endphp
                        @foreach ($user->credit_balance as $obj)
                            <tr>
                                <td>{{ $sr++ }}</td>
                                <td>{{ Carbon::parse($obj->created_at)->format('d-M-Y h:i A')  }}</td>
                                <td>{{ $obj->amount }}</td>
                                <td>{{ \Config::get('constants.creditBalanceStatus')[$obj->status] }}</td>
                            </tr>
                        @endforeach
                    @endisset
                </tbody>
            </table>
        </div>
    </div>


@endsection
