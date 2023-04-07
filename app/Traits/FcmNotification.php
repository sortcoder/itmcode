<?php
namespace App\Traits;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
trait FcmNotification{


	public function sendNotification($firebaseToken=NULL,$title,$body=''){
	
            
        $SERVER_API_KEY = '104555933995350682995';
        $fcmTokens = User::whereNotNull('fcm_key')->pluck('fcm_key')->toArray();
        $data = [
            "registration_ids" => ["f6r-RSm7XObrVCHmSy8hwN:APA91bHhyL4Jjc_UgEAtglRoh_TiM0BTFQHGvLcpYMqifSajqRG9ZnJwxB8eeHOhcfuze7v3t-BOzRF-w-jCPLoeEQKv-311_B5WhHtBoRzUtvSb-WllaBoLV9VEt4yNOBeZyJdgxehP"],
            "notification" => [
                "title" => $title,
                "body" => $body,  
            ]
        ];

       
        $dataString = json_encode($data);
      
        $headers = [
            'Authorization: key=' . $SERVER_API_KEY,
            'Content-Type: application/json',
        ];


      
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataString);
                 
        $response = curl_exec($ch);
        print_r($response);die;
        return true;
	}



	public function collectDeviceIds($userId,$title,$message){
        $deviceIds = [];
        $this->sendNotification($userId,$title,$message);
	}

    public function likeNotification($data){

            $findPostUploadUser = \App\Models\Posts::with('user')->find($data->post_id);
            $liker = \App\Models\Postlikes::with('likedPostUser')->find($data->id);
            if(!empty($findPostUploadUser->user->fcm_key))
            {
                $title = !empty($liker->likedPostUser->name)?$liker->likedPostUser->name:'Someone '.' are liked your post';

                $body = '';
                $this->sendNotification([$findPostUploadUser->user->fcm_key],$title,$body);
            }

    }
    public function commentFcm(){
          $findPostUploadUser = \App\Models\Posts::with('user')->find($data->post_id);
            $liker = \App\Models\PostComments::with('user')->find($data->id);
            if(!empty($findPostUploadUser->user->fcm_key))
            {
                $title = !empty($liker->user->name)?$liker->user->name:'Someone '.' are comment on your post';
                $body = '';
                $this->sendNotification([$findPostUploadUser->user->fcm_key],$title,$body);
            }

    }

 

}