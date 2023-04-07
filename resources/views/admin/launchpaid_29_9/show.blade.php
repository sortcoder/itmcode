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
        <div class="card-body">

            <div class="row mt-3">
                <hr/>
                <div class="col-12"><h6>LAUNCH PAD REGISTRATION</h6></div><hr/>

                <div class="row">
                    <?php
                    if($user->launc_paid_type == 2)
                    {
                         ?>
                    <div class="col-4">
                        <label for="">Launcher Name</label>
                         <p>
                             <?=$user->user->name ?? ''?></p>
                     </div>
                     <div class="col-4">
                        <label for="">Launcher Email</label>
                         <p>
                             <?=$user->user->email ?? ''?></p>
                     </div>
                     <div class="col-4">
                        <label for="">Launcher Mobile</label>
                         <p>
                             <?=$user->user->mobile ?? ''?></p>
                     </div>
                     <?php
                    }
                    ?>
                    <div class="col-4">
                       <label for="">Launch Paid Type</label>
                        <p>
                            <?=\Config::get('constants.launcherTypes')[$user->launc_paid_type]?></p>
                    </div>
                    <div class="col-4 userTypeShow" >
                        <label for="">Is Recommended</label>
                        <p>
                            <?= ($user->is_recommended=='1') ? "Yes" : "No"; ?>
                        </p>
                    </div>
                    <div class="col-4">
                        <label for="Status">Status</label><br>
                        <?php
                         if($user->approve_status == 2)
                        {
                            echo  '<span class="badge bg-success">'.\Config::get('constants.launcherStatus')[$user->approve_status].'</span>';
                        }else if($user->approve_status == 3)
                        {
                            echo '<span class="badge bg-danger">'.\Config::get('constants.launcherStatus')[$user->approve_status].'</span>';

                        }else{
                            echo '<span class="badge bg-info">'.\Config::get('constants.launcherStatus')[$user->approve_status].'</span>';
                        }
                        ?>
                    </div>
                    <div class="col-4">
                        <div class="form-group ">
                            <label>Launcher</label><br>
                                    <?php
                                    $signatureOption = [
                                        'width'=>1000,
                                        'height'=>1000,
                                        'maxFiles'=>1,
                                        'filetype'=>'Image',
                                        'filetype'=>'uploadPath',
                                        'filepath'=>'uploads/launchpad/'
                                    ];
                                     ?>
                                    <?=_dropzoneCreateUpdate('launch_image',$user->launch_image,$signatureOption,true)?>

                        </div>
                    </div>
                    <div class="col-8">
                        <div class="form-group ">
                          <label for="username">Sketch Name</label>
                       <p>{{ $user->launch_sketch }}</p>
                        </div>

                          <div class="form-group ">
                            <label for="username">Designation</label>
                           <p>{{ $user->launch_designation }}</p>
                          </div>
                          <div class="form-group ">
                            <label for="username">About us</label>
                            <p>{{ $user->about_us }}</p>
                          </div>
                          <div class="form-group ">
                            <label for="username">Website </label>
                            <p>{{ $user->launch_website }}</p>
                          </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <h6>Social Links</h6>

                    </div>
                    <div class="col-12">
                        <div class="form-group mt-2">
                            <label for="username">Website </label>
                          <p>{{ $user->youtube_link }}</p>
                        </div>
                        <div class="form-group mt-2"> <label for="username">Twitter </label>
                            <p> {{ $user->twitter_link }}</p>
                        </div>
                        <div class="form-group mt-2"> <label for="username">Instragram </label>
                            <p>  {{ $user->instra_link }}</p>
                        </div>
                        <div class="form-group mt-2"> <label for="username">Facebook </label>
                            <p>  {{ $user->facebook_link }}</p>
                        </div>
                        <div class="form-group mt-2"> <label for="username">Linked In </label>
                            <p>     {{ $user->linked_link }}</p>
                          </div>


                    </div>
                </div>
            </div>

        </div>
        <div class="row">

        </div>
    </div>


</div>
@section('script')

@endsection
@endsection
