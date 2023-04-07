@extends('admin.layouts.app')

@section('content')
@section('style')

<link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<link rel="stylesheet" href="https://unpkg.com/dropzone@5/dist/min/dropzone.min.css" type="text/css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"  />


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

<form action="" method="post" id="createUser">
    @csrf
    @method('PUT')
    <div class="card">
        <div class="card-header"><h5>Video Details </h5></div>
        <div class="card-body">

            <div class="alertError" style="display: none;">

            </div>

            <div class="row">

                <div class="col-6 mt-2">
                    <label for="username">Title</label><br>
                    {{ $row->title }}
                </div>
                <div class="col-6 mt-2">

                    <label for="youtube_link">Youtube Video Link <span></label><br>

                    <a class="btn btn-outline-info btn-sm" href="{{ $row->youtube_link }}" target="_blank"><i class="fa fa-youtube-play" aria-hidden="true"></i> Watch Video</a>
                </div>

                <div class="col-3 mt-2">
                    <label for="email">Image</label><br>   
                    <?php  
                        if(isset($row->image)){
                            echo  '<a href="'.asset($row->image).'" target="_blank">
                                        <img src="'.asset($row->image).'" style="width: 350px;" />
                                    </a>';
                        }else{
                            echo  '<a href="'.asset("admin/images/noimage.png").'" target="_blank">
                                        <img src="'.asset("admin/images/noimage.png").'" style="width: 350px;" />
                                    </a>';
                        }
                    ?>
                </div>


            </div>


        </div>
        <div class="row">

        </div>
    </div>
</div>

@endsection
