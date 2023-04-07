<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Upload;
use Storage;
use Intervention\Image\ImageManagerStatic as Image;

class ImageUploadController extends Controller
{
    public function uploadImage(Request $request){
        $type = array(
            "jpg"=>"image",
            "jpeg"=>"image",
            "png"=>"image",
            "svg"=>"image",
            "webp"=>"image",
            "gif"=>"image",
            "mp4"=>"video",
            "mpg"=>"video",
            "mpeg"=>"video",
            "webm"=>"video",
            "ogg"=>"video",
            "avi"=>"video",
            "mov"=>"video",
            "flv"=>"video",
            "swf"=>"video",
            "mkv"=>"video",
            "wmv"=>"video",
            "wma"=>"audio",
            "aac"=>"audio",
            "wav"=>"audio",
            "mp3"=>"audio",
            "zip"=>"archive",
            "rar"=>"archive",
            "7z"=>"archive",
            "doc"=>"document",
            "txt"=>"document",
            "docx"=>"document",
            "pdf"=>"document",
            "csv"=>"document",
            "xml"=>"document",
            "ods"=>"document",
            "xlr"=>"document",
            "xls"=>"document",
            "xlsx"=>"document"
        );
        $filepath = $request->path;
        if($request->hasFile('userfile')){
            $extension = strtolower($request->file('userfile')->getClientOriginalExtension());
            if(isset($type[$extension])){
                $fileName = $request->file('userfile')->store($filepath, 'local');

                $data = ['Status'=>'Success','FileName'=>$fileName];
                return $this->responseJson($data);
            }else{
                $data = ['Status'=>'Error','Error'=>'Invalid File Format'];
                return $this->responseJson($data);
            }
        }else{
            $data = ['Status'=>'Error','Error'=>'No File Found...'];
            return $this->responseJson($data);
        }
    }
    public function deleteImage(Request $request){
        if(is_file($request->file))
        {
            unlink($request->file);
        }
    }
    public function responseJson($data){
        $json_string = json_encode($data, JSON_PRETTY_PRINT);
        echo $json_string;die;
    }
}
