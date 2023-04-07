@extends('admin.layouts.app')

@section('content')
@section('style')
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
label{
    font-weight: 600 !important;
}
</style>
@endsection


    <div class="card">
        <div class="card-header"><h6>Personal Details</h6></div>
        <div class="card-body">

            <div class="alertError" style="display: none;">

            </div>

            <div class="row">
                <div class="col-4 mt-2">
                    <label for="name">Full Name</label>
                    <p>  {{  $user->name }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="username">Username</label>
                    <p>  {{  $user->username }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="father_name">Father's Name</label>
                    <p>  {{  $user->father_name }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="mother_name">Mother's Name</label>
                    <p>  {{  $user->mother_name }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="email">Email</label>
                    <p>  {{  $user->email }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="mobile">Mobile No.</label>
                    <p> {{  $user->mobile }}</p>
                </div>

                <div class="col-4 mt-2">
                    <label for="dob">Date of Birth(DOB)</label>
                    <p> {{  $user->dob }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="gender">Gender</label>
                   <p>{{ !empty($user->gender)?Config::get('constants.genderStatus')[$user->gender]:'' }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="marital_status">Martial Status</label>
                    <p>{{ !empty($user->marital_status)?Config::get('constants.maritalStatus')[$user->marital_status]:'' }}</p>

                </div>
                <div class="col-4 mt-2">
                    <label for="profession">Professional</label>
                    <p>  {{ !empty($user->profession)?\App\Models\Professional::makeToArray()[$user->profession]:'' }}</p>
                </div>
                <div class="col-4 mt-2">
                    <label for="profession">User Type</label><br>
                    <p class="badge bg-primary ">  {{ !empty($user->user_type)?Config::get('constants.userLoginType')[$user->user_type]:'' }}</p>
                </div>
            </div>

            <div class="row mt-3">
                <hr/>
                <div class="col-12"><h6>Address Details</h6></div>
                <div class="col-6">
                    <label for="address_one">Address line1</label>
                    <p>{{ $user->address_one }}</p>
                </div>
                <div class="col-6">
                    <label for="address_two">Address line2</label>
                    <p >{{ $user->address_two }}</p>
                </div>
                <div class="col-6 mt-2">
                    <label for="state">State</label>

                    <p>  <?=!empty($user->state)?\App\Models\State::fetchStates()[$user->state]:''?></p>
                </div>
                <div class="col-6 mt-2">
                    <label for="district">District</label>
                    <p>  <?php
                    $ros = \App\Models\Districts::find($user->district);
                    echo !empty($ros->name)?$ros->name:'';
                    ?></p>
                </div>
                <div class="col-6 mt-2">
                    <label for="pincode">Pincode</label>
                    <p>{{ $user->pincode }}</p>
                </div>
                <div class="col-6 mt-2">
                    <label for="city">City</label>
                    <p>{{ $user->city }}</p>
                </div>

            </div>
            <?php if(!empty($user->pan_card_no)){ ?>
                <div class="row mt-3">
                    <hr/>
                    <div class="col-12"><h6>PAN CARD DETAILS</h6></div>
                    <div class="row">
                        <div class="col-6">
                            <div class="form-group">
                                <label for="pan_card_no">Enter PAN Card Number</label>
                               <p>{{ $user->pan_card_no }}</p>
                            </div>

                        </div>
                        <div class="col-6">
                            <div class="form-group ">
                                <label>PAN Card  </label><br> 
                                @if(!empty($user->pan_card_img))
                                    <a href="{{ asset($user->pan_card_img) }}" target="_blank">
                                        <img src="{{ asset($user->pan_card_img) }}" style="width: 100px;" />
                                    </a>
                                @endif
                            </div>
                        </div>
                    </div> 
                </div>
            <?php } ?>
            <?php if(!empty($user->aadhar_card_no) || !empty($user->aadhar_front_img)){ ?>
                <div class="row mt-3">
                    <hr/>
                    <div class="col-12"><h6>AADHAR CARD DETAILS</h6></div>
                    <div class="row">
                        <div class="col-6">
                            <div class="form-group">
                                <label for="aadhar_card_no">Enter Aadhar Card Number</label>
                              <p>{{ $user->aadhar_card_no }}</p>
                            </div>

                        </div>
                        @if(!empty($user->aadhar_front_img))
                            <div class="col-6">
                                <div class="row">
                                    <div class="col-6">
                                        <div class="form-group ">
                                            <label>Aadhar Front Photo </label><br>  
                                                <a href="{{ asset($user->aadhar_front_img) }}" target="_blank">
                                                    <img src="{{ asset($user->aadhar_front_img) }}" style="width: 100px;" />
                                                </a> 
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group ">
                                            <label>Aadhar Back Photo </label><br> 
                                            @if(!empty($user->aadhar_back_img))
                                                <a href="{{ asset($user->aadhar_back_img) }}" target="_blank">
                                                    <img src="{{ asset($user->aadhar_back_img) }}" style="width: 100px;" />
                                                </a>
                                            @endif
                                        </div>
                                    </div>
                                </div> 
                            </div>
                        @endif
                    </div> 
                </div> 
            <?php } ?>
            @if(!empty($user->signature) || !empty($user->profile))
                <div class="row mt-3">
                    <hr/>
                    <div class="col-12"><h6>UPLOAD PHOTO {{ ($user->kyc_status==2) ? "& SIGNATURE" : "" }}</h6></div>
                    <div class="row">
                        @if(!empty($user->signature))
                            <div class="col-6">
                                <div class="form-group ">
                                    <label>Signature</label><br>  
                                    <a href="{{ asset($user->signature) }}" target="_blank">
                                        <img src="{{ asset($user->signature) }}" style="width: 100px;" />
                                    </a> 
                                </div>
                            </div>
                        @endif
                        @if(!empty($user->profile))
                            <div class="col-6">
                                <div class="form-group ">
                                    <label>Profile </label><br> 
                                    <a href="{{ asset($user->profile) }}" target="_blank">
                                        <img src="{{ asset($user->profile) }}" style="width: 100px;" />
                                    </a> 
                                </div>
                            </div>
                        @endif
                    </div> 
                </div>
            @endif    
        </div>
        <div class="row">

        </div>
    </div>


</div>
@section('script')

@endsection
@endsection
