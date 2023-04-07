<?php
namespace App\Traits;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
trait SmsNotification{

    public function sendSms($mobileno,$text){
        // not sms library get
    }
    // New User User Otp Verification Template
    public function sendNewUserOtpVerification($mobile,$otp,$data){
         
        $opt_url = "https://2factor.in/API/V1/".config('app.2factor_api_key')."/SMS/".$mobile."/".$otp."/OTP_Template";
       
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $opt_url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($curl, CURLOPT_PROXYPORT, "80");
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        /*if ($err) { 
          echo "cURL Error #:" . $err;
        } else {
          echo $response; 
        }*/
    }

}
