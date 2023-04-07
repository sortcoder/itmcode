<?php 
namespace App\Traits;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

trait Media{


	public function uploads($file,$path,$s3=false){

		 	if($file) {


	            $fileName   = time() . $file->getClientOriginalName();

	            if(!empty($s3))
	            {
	            	Storage::disk('public')->put($path.'/' . $fileName, File::get($file));	
	            }else{
	            	Storage::disk('public')->put($path.'/' . $fileName, File::get($file));
	            }
	            


	         //    $path = Storage::disk('s3')->put('images', $request->image);
     		   // $path = Storage::disk('s3')->url($path);



	            $file_name  = $file->getClientOriginalName();
	            $file_type  = $file->getClientOriginalExtension();
	            $filePath   = 'storage/'.$path.'/' . $fileName;

	            return $file = [
	                'fileName' => $file_name,
	                'fileType' => $file_type,
	                'filePath' => $filePath,
	                'fileSize' => $this->fileSize($file)
	            ];
        	}
	}

	public function fileSize($file,$precision=2)
	{
		   $size = $file->getSize();

	        if ( $size > 0 ) {
	            $size = (int) $size;
	            $base = log($size) / log(1024);
	            $suffixes = array(' bytes', ' KB', ' MB', ' GB', ' TB');
	            return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
	        }

        	return $size;
	}

}