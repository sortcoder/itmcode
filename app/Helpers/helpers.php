<?php
use Hashids\Hashids;



	function hashIdInstance(){
		return  new Hashids(url('/'),25);

	}


	 function encodeId($id){
		return $id;
	 	$hashIdObject = hashIdInstance();
	 	return $hashIdObject->encode($id);
		//return urlencode(base64_encode($id));
	}



	function decodeId($slug){
		return $slug;
		$hashIdObject = hashIdInstance();
		return !empty($hashIdObject->decode($slug)[0])?$hashIdObject->decode($slug)[0]:0;;
		//return base64_decode(urldecode($slug));
	}
	/*
	 * Get K , M , 1.4k user  , 43.4M user etc by using number
	 */
	function thousandNumberformats($num=0){
		if($num > 1000)
		{

			    $x = round($num);
		        $x_number_format = number_format($x);
		        $x_array = explode(',', $x_number_format);
		        $x_parts = array('k', 'm', 'b', 't');
		        $x_count_parts = count($x_array) - 1;
		        $x_display = $x;
		        $x_display = $x_array[0] . ((int) $x_array[1][0] !== 0 ? '.' . $x_array[1][0] : '');
		        $x_display .= $x_parts[$x_count_parts - 1];
		        return $x_display;

		}
		return $num;
	}

	/*
	 * Get Time Ago format time by using timestamp
	 */

	function time_Ago($time) {

  				$time = strtotime($time);
  				$diff = time() - $time;

			    if( $diff < 1 ) {
			        return 'now';
			    }

			    $time_rules = array (
			                12 * 30 * 24 * 60 * 60 => 'year',
			                30 * 24 * 60 * 60       => 'month',
			                24 * 60 * 60           => 'day',
			                60 * 60                   => 'hour',
			                60                       => 'min',
			                1                       => 'sec'
			    );

			    foreach( $time_rules as $secs => $str ) {

			        $div = $diff / $secs;

			        if( $div >= 1 ) {

			            $t = round( $div );

			            return $t . ' ' . $str .
			                ( $t > 1 ? 's' : '' ) . ' ago';
			        }
			    }
	}

   function ratingCalculate($totalRating=0,$numberOfUSers=0){

	   	$totalRating = count($totalRating);
	   	$numberOfUSers = (Int) $numberOfUSers;

		return round(($totalRating/$numberOfUSers)*5,1);
	}

	function fileExist($path,$public=true)
	{
		if($public)
		{
			if(is_file('public/'.$path))
			{
				return asset($path);
			}else{
				return $path;
			}
		}else{
			return '';
		}

	}

    function imageAsset($path,$filePath=NULL){
        if(is_file($path))
			{
				return asset($path);
			}else{
				return asset('assets/admin/images/noimage.png');
			}
    }

	function uploadImageAssets($uploadPath,$keyName,$s3=false){
		 try{

		 	if($s3 === false)
		 	{

		 			 $fileName   = time() . $file->getClientOriginalName();
			            Storage::disk('public')->put($path . $fileName, File::get($file));
			            $file_name  = $file->getClientOriginalName();
			            $file_type  = $file->getClientOriginalExtension();
			            $filePath   = 'storage/'.$path . $fileName;




		 		    $originalImage= $request->file($keyName);
		            $thumbnailImage = Image::make($originalImage);
		            $thumbnailPath = public_path().'/uploads/'.$folder.'/thumbnail/';
		            $originalPath  = public_path().'/uploads/'.$folder.'/images/';
		            $thumbnailImage->save($originalPath.time().$originalImage->getClientOriginalName());
		            $thumbnailImage->resize(400,400);
		            $thumbnailImage->save($thumbnailPath.time().$originalImage->getClientOriginalName());
                     return time().$originalImage->getClientOriginalName();
		 	}else{

		 	}


        }catch(Exception $e)
        {
            return $this->failure($e->getMessage());
        }
	}

	function displayStorageFolderFile($path){

		$file = public_path($path);

	    if(File::exists($file))
	    {
	    	return asset($path);
	    }else{
	    	return asset('assets/images/noimage.png');
	    }
	}


if(!function_exists('_dropzoneCreateUpdate'))
    {
     function _dropzoneCreateUpdate($key, $value = NULL, $optiondata="",$vieMode=false)
        {
            $str = '';

            if ($optiondata['maxFiles'] > 1) {
                $filename = $key . '[]';
            } else {
                $filename = $key;
            }

            if(empty($vieMode)){
            $str .= '<div class="dropzone upload-widget"
                data-inputname="' . $filename . '"
                data-max-width="' . $optiondata['width'] . '"
                data-max-height="' . $optiondata['height'] . '"
                data-upload-maxfiles="' . (!empty($optiondata['maxFiles']) ? $optiondata['maxFiles'] : 1) . '"
                data-upload-url="' . route('upload-image') . '"
                data-delete-url="' . route('delete-image') . '"
                data-upload-type="'.$optiondata['filetype'].'"
                data-upload-folder="'.$optiondata['filepath'].'"
                data-upload-filekey="userfile">
                    <div class="dz-message needsclick">
                        Drop files here or click to upload.<br>
                    </div>';
            }
            if (!empty($value)) {

                if ($optiondata['maxFiles'] > 1) {
                    $exp = explode('{+}', $value);

                    foreach ($exp as $userkey => $imgame) {
                        # code...


                            $img = $imgame;


                        if (is_file($img)) {

                            if(empty($vieMode)){
                            $img = $img;
                            $str .= '<div class="dz-preview dz-processing dz-image-preview dz-complete">
                                <div class="dz-image">
                                   ';


                             $str .='<img data-dz-thumbnail="" alt="' . $value . '" src="' . asset($img) . '">';

                                   $str .='
                                </div>';

                                $str .='
                                <div class="dz-details">
                                    <div class="dz-filename"><span data-dz-name="">' . $imgame . '</span></div>
                                </div>

                                <div class="dropzone-ajaxdata"><div class="dz-remove dz-deletefile" style="" title="Delete"> X </div><input type="hidden" value="' . $imgame . '" class="dz-serveruploadfile" name="' . $filename . '"></div>
                                ';

                                $str .='</div>';
                            }else{
                                $str .='<img data-dz-thumbnail=""  src="' . asset($img) . '" width="200">';
                            }

                        }
                    }
                } else {

                            $img = $value;


                    if (is_file($img)) {

                        $img = $img;
                        if(empty($vieMode)){
                        $str .= '<div class="dz-preview dz-processing dz-image-preview dz-complete">
                            <div class="dz-image">';


                            $str .='<img data-dz-thumbnail="" alt="' . $value . '" src="' . asset($img) . '">';
                            $str .= '</div>';



                            $str .='<div class="dz-details">
                                <div class="dz-filename"><span data-dz-name="">' . $value . '</span></div>
                            </div>

                            <div class="dropzone-ajaxdata"><div class="dz-remove dz-deletefile" style="" title="Delete"> X </div><input type="hidden" value="' . $value . '" class="dz-serveruploadfile" name="' . $filename . '"></div>';


                        $str .= '</div>';
                    }else{
                        $str .='<img data-dz-thumbnail="" alt="' . $value . '" src="' . asset($img) . '" width="200">';
                    }
                    }
                }
            }
            if(empty($vieMode)){
            $str .= '<div class="fallback"><input type="file" name="userfile"></div>

                </div>';
            }

            return $str;
        }
    }

    function settingConfig($key){
        $data =  \App\Models\SettingConfig::where('var_key',$key)->first();
        if($data->var_input === 'number')
        {
            return (Int) $data->var_data;
        }else if($data->var_input === 'image'){
            return '<img src="'.imageAsset('uploads/setting/',$data->var_data).'" width="30" width="30">';
        }else{
            return $data->var_data;
        }
    }
