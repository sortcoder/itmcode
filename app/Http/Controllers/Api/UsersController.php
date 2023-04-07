<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use App\Traits\SmsNotification as SmsNotification;
use App\Models\User;
use Validator;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\TokenRepository;
use Laravel\Passport\RefreshTokenRepository;
use App\Models\SettingConfig;
use App\Models\ContactDetail;
use App\Models\TempUserEmailMobileSetting;
use App\Models\Transactions;
use App\Models\Wallet;
use App\Models\UserInvestment;
use Auth;
use App\Helpers\ApiHelper;
use Razorpay\Api\Api;


class UsersController extends Controller
{
    use ResponseWithHttpRequest , SmsNotification;
 
    public function razor_add_money(Request $request){
       $api = new Api(env('RAZORPAY_KEY'), env('RAZORPAY_SECRET'));

       $total_amounts = 20;
        $orderData = [
            'receipt'         => 'rcptid_11',
            'amount'          => ($total_amounts) * 100, // 39900 rupees in paise
            'currency'        => 'INR'
        ];
        $razorpayOrder = $api->order->create($orderData);
        dd($razorpayOrder);
        // $orders->razorpay_id        = $razorpayOrder->id;
    }


    public function test_razorpay_order_check(Request $request){
        try{ 
             $rules = array(
                'order_id'=>'required'
            );

            $messages = array( 
                    'order_id.required' => 'Order id is required',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           } 
           $orderId = $request->order_id;
           $api = new Api(env('RAZORPAY_KEY'), env('RAZORPAY_SECRET'));

           $payments = $api->order->fetch($orderId)->payments();  
            echo "mn= <pre>"; print_r($payments); die;
            $txn_id = '';
            if(!empty($payments)) {
                $paymentStatus = isset($payments['items'][0]['status']) ? $payments['items'][0]['status'] : 'failed';

                $txn_id = isset($payments['items'][0]['id']) ? $payments['items'][0]['id'] : '';
                $amount = isset($payments['items'][0]['amount']) ? $payments['items'][0]['amount'] : ''; 

                if ($txn_id != '' && $amount != '') {
                    $subPrice = $amount / 100;

                    if($paymentStatus=='success'){

                    }
                }
            }
           return $this->success('Pin Verified !');
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function test_otp_api(Request $request){
        $otp = rand(100000,999999); 
 
        $mobile_no = '9784558923';
        return ApiHelper::sendOTPSMS($otp,$mobile_no);
    }

    public function register(Request $request){
        try{
            /** Validation  */
                $rules = array(
                    'mobile' => 'required|digits:10|numeric|unique:users,mobile',
                    'password'=>'required|min:5',
                    'user_type'=>'required',
                 //   'device_id'=>'required',
                  //  'fcm_key'=>'required',
                );

                $messages = array(
                        'mobile.required' => 'Enter your mobile no.',
                        'mobile.digits' => 'Mobile no. min length 10 digits',
                        'mobile.numeric' => 'Mobile no. must be numeric',
                        'mobile.unique' => 'Mobile no. is already exist',
                        'password.required'=>'Create new password',
                        'password.min'=>'Password minimum 5 character',
                        'user_type.required'=>'Trader or Launcer type required', // 2 = trader , 3 = launcer
                      //  'device_id.required'=>'Device id not found',
                      //  'fcm_key.required'=>'Firebase id not found',
                );

               $validator = Validator::make($request->all(),$rules,$messages) ;
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }

               if($request->user_type == 1)
               {
                return $this->failure('Invalid User Type');
               }
               // find Already Mobile no exist or not if validtion failed
               $find = User::where('mobile',$request->mobile)->first();
               if(!empty($find))
               {
                return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Mobile no. is already exist! try to login');
               }
               $otp = rand(1111,9999);
               $objUser = new User;
               $objUser->name = 'Investor';
               $objUser->mobile = $request->mobile;
               $objUser->password = Hash::make($request->password); /// hashed password
               $objUser->otp = $otp;
               $objUser->status = 1; /// Pending for Otp Verification
               $objUser->launcher_status = 1; /// Launcher Status By Default Pending 1 , 2 = approved , 3 => rejected
               $objUser->user_type = $request->user_type;///User Type is Launcer or Trader
               $objUser->device_id = $request->device_id;
               if(isset($request->fcm_key)){
                    $objUser->fcm_key = $request->fcm_key;
                    $objUser->device_token = $request->fcm_key;
               }
               $objUser->kyc_status = 0; // Kyc status  1 = pending (uncomplete) , 2 => completed
               
               if($objUser->save())
               { 
                     $this->sendNewUserOtpVerification($request->mobile,$otp,$objUser); // Send Otp to new register user
                     return $this->success('Register successfully ! ',[
                        'id'=>encodeId($objUser->id),
                        'mobile'=>$objUser->mobile,
                        'login_status'=>$objUser->status,
                        'user_type'=>$objUser->user_type,
                        'otp'=>$objUser->otp,
                       
                     ]);
               }else{
                return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Register Failed due to technical issue!');
               }

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function pinVerification(Request $request){
        try{
             /** Validation  */
             $rules = array(
                'pin_no'=>'required|min:4',
                'id'=>'required'
            );

            $messages = array(
                    'pin_no.required' => 'Pin No is required', 
                    'id.required' => 'id is required',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }
           $id = decodeId($request->id);
           if(empty($id))
           {
            return $this->failure('Wrong user!');
           }
           $user = User::find($id);
           if(empty($user))
           {
            return $this->failure('Wrong user!');
           }

           if($user->pin_no != $request->pin_no)
           {
            return $this->failure('Wrong Pin No!');
           }
           $user->status = 2; // active user if otp matched 
           $user->save();

           return $this->success('Pin Verified !');
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function otpVerification(Request $request){
        try{
             /** Validation  */
             $rules = array(
                'otp'=>'required|min:4',
                'id'=>'required'
            );

            $messages = array(
                    'otp.required' => 'Otp is required',
                    'otp.min' => 'Otp is minimum 4 digits',
                    'id.required' => 'id is required',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }
           $id = decodeId($request->id);
           if(empty($id))
           {
            return $this->failure('Wrong user!');
           }
           $user = User::find($id);
           if(empty($user))
           {
            return $this->failure('Wrong user!');
           }
           if($user->otp != $request->otp)
           {
            return $this->failure('Wrong otp!');
           }else{ 
               $user->status = 2; // active user if otp matched
               $user->otp = rand(1111,9999); // otp matched reset otp
               
               if(isset($request->fcm_key)){
                    $user->fcm_key = $request->fcm_key;
                    $user->device_token = $request->fcm_key;
                }

                /* Demo Wallet Amount Add */

                    $user->tradding_demo_wallet = settingConfig('ADD_CREDIT_BALANCE');
                    $user->save();

                    $st_row = new Wallet;
                    $st_row->user_id = $id;
                    $st_row->amount = settingConfig('ADD_CREDIT_BALANCE');
                    $st_row->payment_type = 'credit';
                    $st_row->status = 'Successful'; 
                    $st_row->type = 'demo';  // live,demo
                    $st_row->remark = settingConfig('ADD_CREDIT_BALANCE').' added for demo account'; 
                    $st_row->is_transfer = '0'; 
                    $st_row->save();
 
                    $st_row = new UserInvestment;
                    $st_row->user_id = $id;
                    $st_row->amount = settingConfig('ADD_CREDIT_BALANCE');
                    $st_row->payment_type = 'credit';
                    $st_row->status = 'Successful'; 
                    $st_row->type = 'demo';  // live,demo
                    $st_row->remark = settingConfig('ADD_CREDIT_BALANCE').' added for demo account';  
                    $st_row->save(); 
 
                    $token = $user->createToken(env('APP_KEY'))->accessToken;
                    $stepOfForm = User::stepOfForm($user);

                    return $this->success('Account Verified ! ',[
                        'token'=>$token,
                        'form_step_no'=>$stepOfForm['stepNo'],
                        'form_step_name'=>$stepOfForm['stepName']
                    ]
                );
            } 
            
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }


    public function setting_otp_verification(Request $request){
        try{
             /** Validation  */
             $rules = array(
                'otp'=>'required|min:4',
                'id'=>'required'
            );

            $messages = array(
                    'otp.required' => 'Otp is required',
                    'otp.min' => 'Otp is minimum 4 digits',
                    'id.required' => 'id is required',
            );

           $validator = Validator::make($request->all(),$rules,$messages) ;
           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }
           $id = decodeId($request->id);
           if(empty($id))
           {
            return $this->failure('Wrong user!');
           }
           $user = User::find($id);
           if(empty($user))
           {
            return $this->failure('Wrong user!');
           }
           if($user->otp != $request->otp)
           {
            return $this->failure('Wrong otp!');
           }

            $user_id = $id;

            $getTempSetting_sm = TempUserEmailMobileSetting::where('user_id',$user_id)->first();
            if(isset($getTempSetting_sm->id)){
                $getTempSetting = TempUserEmailMobileSetting::find($getTempSetting_sm->id);
                
                $user->status = 2; // active user if otp matched
                $user->otp = rand(1111,9999); // otp matched reset otp 

                if($getTempSetting_sm->record_type=="email"){
                    $user->email = $getTempSetting->record_name;
                    $user->save();
                    return $this->success('Email updated successfully ! ');
                }else{
                    $user->mobile = $getTempSetting->record_name;
                    $user->save();
                    return $this->success('Mobile updated successfully ! ');
                } 
                TempUserEmailMobileSetting::where('user_id',$user_id)->delete();
            } 

           return $this->success('Account Verified ! ');
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function setting_otp_resend(Request $request){
        try{
                   /** Validation  */
                $rules = array(
                    'id'=>'required'
                );
                $messages = array(
                        'id.required' => 'id is required',
                );
               $validator = Validator::make($request->all(),$rules,$messages) ;
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }
               $id = !empty($request->id)?decodeId($request->id):0;
               if(empty($id))
               {
                return $this->failure('Wrong user!');
               }
               $user = User::find($id);
               if(empty($user))
               {
                return $this->failure('Wrong user!');
               }else{
                    $user->status = 1;
                    $user->save(); 
               }
               $this->sendNewUserOtpVerification($user->mobile,$user->otp,$user); // Send Otp to new register user
               
               return $this->success('Otp Send Successfully ',['id'=>$user->id,
               'otp'=>$user->otp]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

     public function account_detail_check(){ 
 
        $user_id = Auth::id();
        $userRow = User::where('id',$user_id)->first(); 

            $data = [];
            $is_pan_card_exist = '0';  $is_aadhar_card_exist = '0'; $is_additional_info_exist='0';

        if(empty($userRow))
        {
            return $this->failure('User not found!');
        }else{

            if(!empty($userRow->pan_card_no) || is_file('public/'.$userRow->pan_card_img)){
                $is_pan_card_exist = '1';
            }
            if(!empty($userRow->aadhar_card_no) || is_file('public/'.$userRow->aadhar_front_img) || is_file('public/'.$userRow->aadhar_back_img)){
                $is_aadhar_card_exist = '1';
            }

            if(is_file('public/'.$userRow->profile) || is_file('public/'.$userRow->signature)){
                 $is_additional_info_exist = '1';
            }

            $data['is_pan_card_exist'] = $is_pan_card_exist;
            $data['aadhar_card_no'] = $is_aadhar_card_exist;
            $data['is_additional_info_exist'] = $is_additional_info_exist;

            return $this->success("User Information",$data);
        }
    }

    /*** Resend OTP on Sms */
    public function otpResend(Request $request){
        try{
                   /** Validation  */
                $rules = array(
                    'id'=>'required'
                );
                $messages = array(
                        'id.required' => 'id is required',
                );
               $validator = Validator::make($request->all(),$rules,$messages) ;
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }
               $id = !empty($request->id)?decodeId($request->id):0;
               if(empty($id))
               {
                return $this->failure('Wrong user!');
               }
               $user = User::find($id);
               if(empty($user))
               {
                return $this->failure('Wrong user!');
               }
               $this->sendNewUserOtpVerification($user->mobile,$user->otp,$user); // Send Otp to new register user
               $stepOfForm = User::stepOfForm($user);
               return $this->success('Otp Send Successfully ',['id'=>encodeId($user->id),
               'otp'=>$user->otp,
               'form_step_no'=>$stepOfForm['stepNo'],
               'form_step_name'=>$stepOfForm['stepName']
            ]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }


    public function forget_password(Request $request){
        try{
                   /** Validation  */
                $rules = array(
                    'mobile'=>'required'
                );
                $messages = array(
                        'mobile.required' => 'Mobile or Email is required',
                );
               $validator = Validator::make($request->all(),$rules,$messages) ;
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               } 

               $user = User::where('mobile',$request->mobile)->Orwhere('email',$request->mobile)->first();
               
               if(empty($user))
               {
                    return $this->failure('Wrong user!');
               }
               $this->sendNewUserOtpVerification($user->mobile,$user->otp,$user); // Send Otp to new register user
               $stepOfForm = User::stepOfForm($user);
               return $this->success('Otp Send Successfully ',['id'=>encodeId($user->id),
               'otp'=>$user->otp,
               'form_step_no'=>$stepOfForm['stepNo'],
               'form_step_name'=>$stepOfForm['stepName']
            ]);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    } 

    public function update_password(Request $request)
    {
        $error_message =    [
            'user_id' => 'required',
            'password.required' => 'Password should be required',
        ];
        $rules = [
            'user_id' => 'required',
            'password' => 'required',

        ];
        $validator = Validator::make($request->all(), $rules, $error_message);
        if ($validator->fails()) { 
             return $this->failure($validator->errors()->first());
        }
        try {
            // echo auth()->user()->id;die;
            \DB::beginTransaction();
            $user_id = $request->user_id;
            $password = $request->password;

            $user =  User::find($user_id);
             
            if($user->status==1){
                return $this->failure('Please verify your account !');
            }else{ 
                $user->password = Hash::make($request->password);
                $user->save();
            }
            \DB::commit(); 
            return $this->success('Password update successfully ',['id'=>encodeId($user->id)]);
        } catch (\Throwable $e) {
            \DB::rollback(); 
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function change_password(Request $request)
    {

        $error_message =    [
            'current_password.required'    => 'Current Password should be required',
            'new_password.required'        => 'New Password should be required',
            'confirm_password.required'        => 'New Password should be required',
        ];
        $rules = [
            'current_password'     => ['required'], 
            'new_password' => 'required|same:confirm_password',
        ];
        $validator = Validator::make($request->all(), $rules, $error_message);

        if ($validator->fails()) {
            return $this->failure($validator->errors()->first());
        }

        $userDt = User::find(auth()->user()->id);

        if($userDt->status==1){
            return $this->failure('Please verify your account !');
        }else if (!password_verify($request->current_password, auth()->user()->password)) {            
            return $this->failure('Your current password is not match');
        }
        try {
            \DB::beginTransaction();

            auth()->user()->update(['password' => Hash::make($request->new_password)]);

            \DB::commit();
            return $this->success('Password update successfully ',['id'=>encodeId(auth()->user()->id)]);
        } catch (\Throwable $e) {
            \DB::rollback(); 
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function contact_us(Request $request) {
            
        $validator = Validator::make($request->all(),[  
            'message' => 'required',  
        ]);

        $user_id = Auth::id();

        $data = $request->all();

        $req_data = [];
        if($validator->fails()){
            $error = '';
            if (!empty($validator->errors())) {
                $error = $validator->errors()->first();
            } 
            $message = $error;
            return $this->failure($message);
        }else    
        {   

            $user_details = User::find($user_id);

            $newBooking = ContactDetail::create([ 
                'user_id' => @$user_id, 
                'user_name' => @$user_details->name,
                'email' => @$user_details->email,
                'mobile' => @$user_details->phone,
                'description' => $request->message,   
            ]); 
            $req_message = "Contact request send successfully";
        }            
        return $this->success($req_message);
    }

    public function page_data($page_id)
    {   
        $get_page_data = SettingConfig::where('id',$page_id)->first();
        $page_title=$get_page_data->var_name;
        $page_content = $get_page_data->var_data ?? '';
        return view('common_page',compact('page_title','page_content'));  
    }

    public function support_detail(Request $request)
    {   
        $get_page_data = SettingConfig::whereIn('id',[10,11])->pluck('var_data','var_key');
        
        return $this->success('Support Details  ',[
                'support_data'=>$get_page_data,
            ]
        );  
    }

    public function login(Request $request){
        try{
            /** Validation  */
                $rules = array(
                    'mobile' => 'required',
                    'password'=>'required'
                );

                $messages = array(
                        'mobile.required' => 'Enter your Email or Mobile.', 
                        'password.required'=>'Enter your password'
                );

               $validator = Validator::make($request->all(),$rules,$messages);
               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }
               // find Already Mobile no exist or not if validtion failed
               $find = User::where('mobile',$request->mobile)->Orwhere('email',$request->mobile)->first();
               if(empty($find))
               {
                return $this->failure('No record found !');
               }

               if(!Hash::check($request->password, $find->password)){
                return $this->failure('Invalid password');
               }

               $otp = rand(1111,9999);
               $objUser =  User::find($find->id);

               if(isset($request->fcm_key)){  // for update fcm_key
                    $objUser->fcm_key = $request->fcm_key;
                    $objUser->device_token = $request->fcm_key;
                    $objUser->save();
               }

               if($objUser->status === 3)
               {
                    return $this->failure('Your account has been blocked !');
               }else if($objUser->status === 1)
               {
                    $this->sendNewUserOtpVerification($request->mobile,$otp,$objUser); // Send Otp to new register user
                   
                    return $this->failure('Your Account Deactivate From Admin. Please Contact to Support. ',[
                            'id'=>encodeId($objUser->id),
                            'mobile'=>$objUser->mobile,
                            'login_status'=>$objUser->status,
                            'user_type'=>$objUser->user_type,
                            'otp'=>$objUser->otp,
                            'token'=>''
                        ]);
               }else if($objUser->status === 2)
               {
                    $objUser->otp = rand(1111,9999); // every login otp changed for security reasons
                    $objUser->save();
                    $token = $objUser->createToken(env('APP_KEY'))->accessToken;
                    // $stepOfForm = User::stepOfForm($objUser);


                    if(empty($objUser->dob) 
                            || empty($objUser->gender) 
                            || empty($objUser->marital_status)
                            || empty($objUser->profession)
                            || empty($objUser->mother_name) 
                            || empty($objUser->father_name) 
                            || empty($objUser->state)
                            || empty($objUser->district)
                            || empty($objUser->pincode)
                            || empty($objUser->city)
                    ){  
                        $stepNo = "5";
                        $form_step_name = "Account Registration Is Pending";
                    }else{
                        $stepNo = "";
                        $form_step_name = "Account Registred";
                    }

                    return $this->success('Login Success ! ',[
                            'user_id'=>$objUser->id,
                            'token'=>$token,
                            'mobile'=>$objUser->mobile,
                            'user_type'=>$objUser->user_type,
                            'login_status'=>$objUser->status,
                            'otp'=>'',
                            'form_step_no'=>$stepNo,
                            'form_step_name'=>$form_step_name,
                            'pin_no'=>$objUser->pin_no ?? "",
                            'is_fingerprint'=>$objUser->is_fingerprint,
                        ]
                    );
               }else{
                    return $this->failure('Wrong User!');
               }

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }



}
