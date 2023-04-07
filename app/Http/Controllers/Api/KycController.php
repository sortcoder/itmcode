<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use App\Traits\SmsNotification as SmsNotification;
use App\Models\User;
use Validator;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;
use App\Models\TempUserEmailMobileSetting;
use Auth;
use Mail;
class KycController extends Controller
{
    use ResponseWithHttpRequest , SmsNotification;
 
    /*** PAN CARD KYC UDPATE */
    public function pan_card_update(Request $request){
         
        try{
            /** Validation  **/
            $rules = array( 
                'user_id'=>'required',
                'pan_no'=>'required',
                'repan_no'=>'required|same:pan_no',
                'pan_card_file'=>'required|mimes:jpeg,jpg,png|max:10000',
            );
            $messages = array(
                    'pan_no.required' => 'Enter Your PAN Number', 
                    'repan_no.required' => 'Re-Enter Your PAN Number',
                    'repan_no.same' => 'PAN Number not match',
                    'pan_card_file.required' => 'Upload PAN Card Photo',
                    'pan_card_file.mimes' => 'Accept only jpg,png,jpeg',
                    'pan_card_file.max' => 'File Size must be 5mb',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }

           $user_id = $request->user_id;

           $find = User::find($user_id);
           $upload_pancard_file_name = $request->file('pan_card_file')->store('uploads/pancard/', 'local');
           $find->pan_card_no = $request->pan_no;
           $find->pan_card_img = $upload_pancard_file_name;
           $find->save();

           $stepOfForm = \App\Models\Video::stepOfForm($find);

           return $this->success('PAN Card Details Updated',[
                'mobile'=>$find->mobile,
                'user_type'=>$find->user_type,
                'login_status'=>$find->status,
                'form_step_no'=>$stepOfForm['stepNo'],
                'form_step_name'=>$stepOfForm['stepName']
           ]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function aadhaar_pan_kyc_update(Request $request){
         
        try{
            /** Validation  **/
            $rules = array( 
                'user_id'=>'required',
                'status'=>'required', 
            );
            $messages = array(
                    'user_id.required' => 'Enter User Id', 
                    'status.required' => 'Status is required',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }

           $user_id = $request->user_id;

           $find = User::find($user_id); 
           $find->kyc_status = $request->status;
           $find->save();
 
           return $this->success('Adhaar Pan KYC status updated',[]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }
    public function aadhaar_card_update(Request $request){
        // $user = Auth::user();
        try{
            /** Validation  **/
            $rules = array(
                'user_id'=>'required',
                'aadhar_card_no'=>'required|digits:12|numeric',
                're_aadhar_card_no'=>'required|same:aadhar_card_no',
                'aadhar_front_img'=>'required|mimes:jpeg,jpg,png|max:10000',
                'aadhar_back_img'=>'required|mimes:jpeg,jpg,png|max:10000',
            );
            $messages = array(
                    'aadhar_card_no.required' => 'Enter Your Aadhar Number',
                    'aadhar_card_no.digits' => 'Aadhar no. min length 12 digits',
                    'aadhar_card_no.numeric' => 'Aadhar no. must be numeric',
                    're_aadhar_card_no.required' => 'Re-Enter Your Aadhar Number',
                    're_aadhar_card_no.same' => 'Aadhar Number not match',
                    'aadhar_front_img.required' => 'Upload Aadhar Card Front Image',
                    'aadhar_front_img.mimes' => 'Accept only jpg,png,jpeg',
                    'aadhar_front_img.max' => 'File Size must be 5mb',
                    'aadhar_back_img.required' => 'Upload Aadhar Card Back Image',
                    'aadhar_back_img.mimes' => 'Accept only jpg,png,jpeg',
                    'aadhar_back_img.max' => 'File Size must be 5mb',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }

           $user_id = $request->user_id;

           $find = User::find($user_id);
           $aadhar_front_img = $request->file('aadhar_front_img')->store('uploads/aadhar_front/', 'local');
           $aadhar_back_img = $request->file('aadhar_back_img')->store('uploads/aadhar_back/', 'local');
           $find->aadhar_card_no = $request->aadhar_card_no;
           $find->aadhar_front_img = $aadhar_front_img;
           $find->aadhar_back_img = $aadhar_back_img;
           $find->save();
           $stepOfForm = \App\Models\Video::stepOfForm($find);
           return $this->success('Aadhar Card Details Updated',[
                'mobile'=>$find->mobile,
                'user_type'=>$find->user_type,
                'login_status'=>$find->status,
                'form_step_no'=>$stepOfForm['stepNo'],
                'form_step_name'=>$stepOfForm['stepName']
           ]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }
  
    public function account_registration(Request $request){
        try{
                $rules = array(   
                    'name'=>'required',
                    'username'=>'required',
                    'dob'=>'required|date',
                    'gender'=>'required',
                    'marital'=>'required',
                    'profession'=>'required',
                    'father_name'=>'required',
                    'mother_name'=>'required',
                    'address_one'=>'required',
                    'pincode'=>'required',
                    'state'=>'required',
                    'district'=>'required',
                    'city'=>'required', 
                );
                $messages = array( 
                        'name.required' => 'Enter Your Full Name',
                        'username.required' => 'Enter User Name',
                        'dob.required' => 'Date of birth is required',
                        'dob.date' => 'DOB incorrect format',
                        'gender.required' => 'Select your gender',
                        'marital.required' => 'Select marital status',
                        'profession.required' => 'Select your profession',
                        'father_name.required' => 'Father name is required',
                        'mother_name.required' => 'Mother name is required',
                        'address_one.required' => 'Enter your address',
                        'pincode.required' => 'Enter pincode',
                        'state.required' => 'Select state',
                        'district.required' => 'Select district',
                        'city.required' => 'City is required',
                );

                /*
                    if(!isset($request->user_id)){
                        $rules = array(
                            'mobile' => 'required|digits:10|numeric|unique:users,mobile',
                            'password'=>'required|min:5',
                            'user_type'=>'required', 
                        );

                        $messages = array(
                                'mobile.required' => 'Enter your mobile no.',
                                'mobile.digits' => 'Mobile no. min length 10 digits',
                                'mobile.numeric' => 'Mobile no. must be numeric',
                                'mobile.unique' => 'Mobile no. is already exist',
                                'password.required'=>'Create new password',
                                'password.min'=>'Password minimum 5 character',
                                'user_type.required'=>'Trader or Launcer type required', // 2 = trader , 3 = launcer 
                        );
                   }
               */
               $validator = Validator::make($request->all(),$rules,$messages) ;
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }

               if($request->user_type == 1)
               {
                return $this->failure('Invalid User Type');
               }
 
               if(isset($request->user_id)){
                   $user_id = $request->user_id; 
                   $objUser = User::find($user_id);
               }else{
                    $objUser = new User;
               }

               $objUser->name = $request->name;
               $objUser->username = $request->username;
               $objUser->email = $request->email;
               $objUser->dob = !empty($request->dob)?date("Y-m-d",strtotime($request->dob)):'';
               $objUser->gender = $request->gender;
               $objUser->marital_status = $request->marital;
               $objUser->profession = $request->profession;
               $objUser->father_name = $request->father_name;
               $objUser->mother_name = $request->mother_name;
               $objUser->address_one = $request->address_one;
               $objUser->address_two = $request->address_two;
               $objUser->pincode = $request->pincode;
               $objUser->state = $request->state;
               $objUser->district = $request->district;
               $objUser->city = $request->city; 
               // $objUser->kyc_status = 2; // kyc completed

               if($objUser->save())
               { 
                    $token = $objUser->createToken(env('APP_KEY'))->accessToken;

                    $otp = rand(1111,9999);
                     $this->sendNewUserOtpVerification($request->mobile,$otp,$objUser); // Send Otp to new register user
                     return $this->success('Register successfully ! ',[
                        'user_id'=>$objUser->id,
                        'token'=>$token,
                       
                     ]);
               }else{
                    return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Register Failed due to technical issue!');
               }

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    
    public function additional_details_update(Request $request){
         
        try{
            /** Validation  **/
            $rules = array(
                 'user_id'=>'required',
                'profile'=>'required|mimes:jpeg,jpg,png|max:10000',
                'signature'=>'required|mimes:jpeg,jpg,png|max:10000',
            );
            $messages = array(
                    'profile.required' => 'Upload Your Profile Photo',
                    'profile.mimes' => 'Accept only jpg,png,jpeg',
                    'profile.max' => 'File Size must be 5mb',
                    'signature.required' => 'Upload Your Signature',
                    'signature.mimes' => 'Accept only jpg,png,jpeg',
                    'signature.max' => 'File Size must be 5mb',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }

           $user_id = $request->user_id;

           $find = User::find($user_id);
           $profile = $request->file('profile')->store('uploads/profile/', 'local');
           $signature = $request->file('signature')->store('uploads/signature/', 'local');
           $find->profile = $profile;
           $find->signature = $signature;
           $find->save();
           $stepOfForm = \App\Models\Video::stepOfForm($find);
           return $this->success('Additional Details Updated',[
                'mobile'=>$find->mobile,
                'user_type'=>$find->user_type,
                'login_status'=>$find->status,
                'form_step_no'=>$stepOfForm['stepNo'],
                'form_step_name'=>$stepOfForm['stepName']
           ]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function get_user_profile(Request $request) {
      
        $user_id = auth()->user()->id;

        $userResDt = User::find($user_id);  
        $userDt = new UserResource($userResDt); 
         
        $data = [];        
        $data["user_detail"] = $userDt;

        return $this->success("User Information",$data);

    }

    public function setting_update(Request $request){

        $user = Auth::user();

        try{

           $rules = array( 
                'record_type'=>'required', 
            );

            $messages = array( 
                    'record_type.required'=>'Record type required', 
                    'record_type_name.required'=>'Record type name required', 
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }

           $user_id = $user->id;
           $find = User::find($user->id);

           if(isset($request->record_type_name)){ 

                $otp = rand(1111,9999);

                if($request->record_type=="email"){
                    $checkUserDtCount = User::where('email', $request->record_type_name)->where('id', '!=' , $user_id)->count();

                    if($checkUserDtCount==0){ 

                        $emailTo = $request->record_type_name;
                        $subject = "Verification OTP EMail";
                        $getUserDt = User::where('email', $request->record_type_name)->first();
                        $details = [
                            'name' => ucwords($find->name),
                            'otp' => $otp,
                        ];  
                        $find->otp = $otp;                  
                        // $find->email = $request->record_type_name; 
                        $find->status = 1;
                        $find->save(); 
                        
                        $getTempUserDt = TempUserEmailMobileSetting::where(['user_id'=>$user_id])->first();
                        if(isset($getTempUserDt->id)){ 
                            TempUserEmailMobileSetting::where(['user_id' => $user_id])->update([
                                'record_type' => $request->record_type,
                                'record_name' => $request->record_type_name
                            ]); 
                        }else{
                            $RecTempUserDt = new TempUserEmailMobileSetting;
                            $RecTempUserDt->user_id = $user_id; 
                            $RecTempUserDt->record_type = $request->record_type; 
                            $RecTempUserDt->record_name = $request->record_type_name; 
                            $RecTempUserDt->save();
                        }

                        \Mail::to($emailTo)->send(new \App\Mail\VerificationOtpMail($subject,$details));

                        $dataArr = [
                            'id'=>$find->id, 
                            'otp'=>$otp,                           
                         ];

                        return $this->success('OTP sended to your email,Please verify with OTP',$dataArr); 
                    }else{
                         return $this->failure("Email Already Exist !");
                    }  
                }else if($request->record_type=="mobile"){
                    $checkUserDtCount = User::where('mobile', $request->record_type_name)->where('id', '!=' , $user_id)->count();
                    if($checkUserDtCount==0){ 
                        $find->otp = $otp; 
                        // $find->mobile = $request->record_type_name; 
                        $find->status = 1;
                        $find->save(); 

                        $getTempUserDt = TempUserEmailMobileSetting::where(['user_id'=>$user_id])->first();
                        if(isset($getTempUserDt->id)){ 
                            TempUserEmailMobileSetting::where(['user_id' => $user_id])->update([
                                'record_type' => $request->record_type,
                                'record_name' => $request->record_type_name
                            ]); 
                        }else{
                            $RecTempUserDt = new TempUserEmailMobileSetting;
                            $RecTempUserDt->user_id = $user_id; 
                            $RecTempUserDt->record_type = $request->record_type; 
                            $RecTempUserDt->record_name = $request->record_type_name; 
                            $RecTempUserDt->save();
                        }
                        $details = [
                            'name' => ucwords($find->name),
                            'otp' => $otp,
                        ];  
                        $find->otp = $otp;                  
                        // $find->email = $request->record_type_name; 
                        $find->status = 1;
                        $find->save();

                        $this->sendNewUserOtpVerification($find->mobile,$otp,$find);

                        $dataArr = [
                            'id'=>$find->id, 
                            'otp'=>$otp,                           
                         ];
                        return $this->success('OTP sended to your mobile,Please verify with OTP',$dataArr);
                    }else{
                        return $this->failure("Mobile No. Already Exist !"); 
                    }
                }  

            }else{
                return $this->failure("Invalid request !");
            } 

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }
    
    public function account_details_update(Request $request){
        
        try{
            /** Validation  **/
            $rules = array( 
                'name'=>'required',
                'username'=>'required',
                'dob'=>'required|date',
                'gender'=>'required',
                'marital'=>'required',
                'profession'=>'required',
                'father_name'=>'required',
                'mother_name'=>'required',
                'address_one'=>'required',
                'pincode'=>'required',
                'state'=>'required',
                'district'=>'required',
                'city'=>'required',
            );
            $messages = array( 
                    'name.required' => 'Enter Your Full Name',
                    'username.required' => 'User Name is required',
                    'dob.required' => 'Date of birth is required',
                    'dob.date' => 'DOB incorrect format',
                    'gender.required' => 'Select your gender',
                    'marital.required' => 'Select marital status',
                    'profession.required' => 'Select your profession',
                    'father_name.required' => 'Father name is required',
                    'mother_name.required' => 'Mother name is required',
                    'address_one.required' => 'Enter your address',
                    'pincode.required' => 'Enter pincode',
                    'state.required' => 'Select state',
                    'district.required' => 'Select district',
                    'city.required' => 'City is required',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }

           $user_id = \Auth::id();

           $find = User::find($user_id);
 
           $find->name = $request->name;
           $find->username = $request->username;
           $find->dob = !empty($request->dob)?date("Y-m-d",strtotime($request->dob)):'';
           $find->gender = $request->gender;
           $find->marital_status = $request->marital;
           $find->profession = $request->profession;
           $find->father_name = $request->father_name;
           $find->mother_name = $request->mother_name;
           $find->address_one = $request->address_one;
           $find->address_two = $request->address_two;
           $find->pincode = $request->pincode;
           $find->state = $request->state;
           $find->district = $request->district;
           $find->city = $request->city;
            
            if($request->hasFile('profile')){
               $profile = $request->file('profile')->store('uploads/profile/', 'local');
               $find->profile = $profile;
            }
           // $find->kyc_status = 2; // kyc completed

           $find->save();
           $stepOfForm = \App\Models\Video::stepOfForm($find);
           return $this->success('Your KYC  is completed, Please wait for approval 24hrs, We will confirm you on your email and mobile',[
                'mobile'=>$find->mobile,
                'user_type'=>$find->user_type,
                'login_status'=>$find->status,
                'form_step_no'=>$stepOfForm['stepNo'],
                'form_step_name'=>$stepOfForm['stepName']
           ]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    
    // public function verifyEmailOtp($emailTo,$subject){
    //     $user = User::find(Auth::user()->id);
    //     $details = [
    //         'name' => $user->name,
    //         'otp' => $user->otp,
    //     ];

    //     \Mail::to($emailTo)->send(new \App\Mail\VerificationOtpMail($subject,$details));
    // }

    /** Email Otp Send to Enter Email */
    public function sendEmailOtp(Request $request)
    {
        try{
            /** Validation  */
                $rules = array(
                    'email' => 'required|email|unique:users,email'
                );

                $messages = array(
                        'email.required' => 'Enter Email Address' ,
                        'email.unique' => 'Email address is already exist',
                        'email.email' => 'please entry valid email address',
                );

               $validator = Validator::make($request->all(),$rules,$messages) ;
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }
               $findExit = User::where('email',$request->email)->first();
               if(!empty($findExit))
               {
                  return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Email Address is already exists! Please try another');
               }
               $findRow = User::find(Auth::user()->id);
               if(empty($findRow))
               {
                  return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Invalid User');
               }
               if($findRow->is_email_verified == 1)
               {
                    return $this->failure('Email is already verified');
               }

               $otp = rand(1111,9999);
               $findRow->otp = $otp;
               $findRow->save();

            $this->sendNewUserOtpVerification($findRow->mobile,$otp,$findRow); // Send Otp to new register user

            return $this->success('Otp Send to email id ',[
                        'id'=>encodeId($findRow->id),
                        'mobile'=>$findRow->mobile,
                        'login_status'=>$findRow->status,
                        'user_type'=>$findRow->user_type,
                        'otp'=>$findRow->otp,
                     ]);


        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }
    /** Email Verification After Otp received */
    public function verifyEmailOtp(Request $request){
        try{
            /** Validation  */
                $rules = array(
                    'otp' => 'required|digits:4',
                    'email' => 'required|email|unique:users,email'
                );
                $messages = array(
                        'otp.required' => 'Enter Otp' ,
                        'otp.digits' => 'Please enter only 4 digit otp',
                        'email.required' => 'Email Address is required' ,
                        'email.unique' => 'Email is already exist',
                        'email.email' => 'please entry valid email address',
                );

               $validator = Validator::make($request->all(),$rules,$messages) ;
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }

               $email = $request->email;
               $findRow = User::find(Auth::user()->id);

               if($findRow->otp != $request->otp)
               {
                    return $this->failure('Invalid Otp');
               }

               $findRow->email = $email;
               $findRow->is_email_verified = 1;
               $findRow->email_verified_at = date('Y-m-d H:i:s');
               $findRow->save();
               return $this->success('Email Otp Verified Successfully ',[
                        'id'=>encodeId($findRow->id),
                        'mobile'=>$findRow->mobile,
                        'login_status'=>$findRow->status,
                        'user_type'=>$findRow->user_type,
                        'otp'=>$findRow->otp,
                ]);

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

}
