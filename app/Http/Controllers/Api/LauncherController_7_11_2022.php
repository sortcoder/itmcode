<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use App\Traits\SmsNotification as SmsNotification;
use App\Models\User;
use App\Models\Lauchpaid as Launchpaid;
use App\Models\Package;
use App\Models\CreditBalance;
use App\Models\CreditBalanceHistory;
use App\Models\LauncherWallet;
use App\Models\Wallet;
use App\Models\BuyPackages;
use Validator;
use Illuminate\Support\Facades\Hash;
use Auth;
use Mail;

use App\Models\UserInvestment;
use App\Models\TradingPortfolio; 

class LauncherController extends Controller
{
    use ResponseWithHttpRequest , SmsNotification;

    public function __construct(){
        $this->middleware('auth:api');
    }
    #Lauchpaid Models are parent model of lauchpaid
    public function register_new_launch_paid(Request $request){
        try{

                $user = Auth::user();
                /** Validation  */
                $rules = array(
                    'sketch' => 'required|unique:launchpaid,launch_sketch',
                    'image'=>'required|mimes:jpeg,jpg,png|max:10000',
                    'designation'=>'required',
                    'aboutus'=>'required',
                );

                $messages = array(
                        'sketch.required' => 'Enter Sketch ID',
                        'sketch.unique' => 'Sketch ID already exists',
                        'image.required' => 'Image is required',
                        'image.mimes' => 'Accept only jpg,png,jpeg',
                        'image.max' => 'File Size must be 5mb',
                        'designation.required'=>'Designation is required',
                        'aboutus.required'=>'About Us is required',
                );
                $validator = Validator::make($request->all(),$rules,$messages) ;
                if($validator->fails())
                {
                     return $this->failure($validator->errors()->first());
                }
                $launch_paid_img = $request->file('image')->store('uploads/launchpad/', 'local');

                $verifyKyc = \App\Models\Video::stepOfForm(User::find($user->id));
                if($verifyKyc['stepNo'] != 6 && !empty($verifyKyc['is_email_verified']))
                {
                    return $this->failure('Your Kyc is incomplete , Please Complete your kyc');
                } 

                $obj = new Launchpaid;
                $obj->user_id = Auth::user()->id;
                $obj->launc_paid_type = 2; // live mode
                $obj->launch_designation =$request->designation;
                $obj->about_us =$request->aboutus;
                $obj->launch_sketch = $request->sketch;
                $obj->launch_image = $launch_paid_img;
                $obj->launch_website = $request->website  ?? '';
                $obj->twitter_link = $request->twitter_link  ?? '';
                $obj->instra_link = $request->instra_link  ?? '';
                $obj->facebook_link = $request->facebook_link  ?? '';
                $obj->linked_link = $request->linked_link ?? '';
                $obj->approve_status = 1;
                $obj->launch_status = 1;
                $obj->ico_status = 1;
                $obj->created_by = $user->id;
                if($obj->save()){
                      //// Start Save Registration Point to Launcher at the time of registration
                      /*$creditRow = new CreditBalance;
                      $creditRow->user_id = $obj->user_id ?? NULL;
                      $creditRow->launcher_id = $obj->id;
                      $creditRow->amount = settingConfig('ADD_CREDIT_BALANCE');;
                      $creditRow->status = 1; // credit to credit balance;
                      $creditRow->save();*/
                    //// End of Credit Balance Save Data ///

                    $data = [];
                    $data['launchpad_id'] = $obj->id;  

                    return $this->success('Launch Paid Created Successfully',$data);
                }else{
                    return $this->failure('Something went wrong !');
                }




        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function _package_list(Request $request){

        $user_id = Auth::user()->id;
        $getUser = User::find($user_id);

        $trading_wallet = $getUser->tradding_live_wallet;
        // $launcher_wallet_balance = $getUser->launcher_live_wallet; 
        $credit_wallet_balance = CreditBalance::where(['user_id'=>$user_id,'status'=>'1'])->sum('remaining_balance');  

            $launcher_trade_amount_cr = LauncherWallet::where(['user_id'=>$user_id,'type'=>'credit'])->sum('amount');
            $launcher_trade_amount_dr = LauncherWallet::where(['user_id'=>$user_id,'type'=>'debit','is_transfer'=>'1'])->sum('amount');
            $launcher_trade_amount = $launcher_trade_amount_cr - $launcher_trade_amount_dr;
             
            $launcher_fund_used = LauncherWallet::where(['user_id'=>$user_id,'type'=>'debit','is_transfer'=>'0'])->sum('amount');


            if($launcher_trade_amount>$launcher_fund_used)
                $launcher_available_balance = $launcher_trade_amount_cr - $launcher_fund_used;
            else
                $launcher_available_balance = '0';
 
             // $launcher_available_balance = $launcher_trade_amount-$launcher_available_balance_1;

            $launcher_wallet_balance = $launcher_trade_amount - $launcher_fund_used;
      
        $data = [];
        $data['trading_wallet'] = $trading_wallet;
        $data['credit_wallet_balance'] = $credit_wallet_balance;
        $data['launcher_wallet_balance'] = $launcher_wallet_balance;
        
        $list = Package::where('status',1)->get();
        if(!empty($list))
        {
            foreach($list as $key =>$val)
            {
                $row = [];
                $row['pack_id'] = $val->id;
                $row['quantity'] = $val->quantity;
                $row['one_image_price'] = $val->one_image_price;
                $row['price'] = $val->price;
                $row['details'] = $val->description;
                $data['package_list'][] = $row;
            }
        }

        return $this->success('package list',$data);
    }

    public function buy_package(Request $request)
    {
        $user_id = Auth::user()->id;

        $getUser = User::find($user_id);

        $account_type = ($getUser->account_type=='2') ? 'live' : 'demo';
        try{

            $validator = Validator::make($request->all(),[
                'launch_paid_id'=>'required',
                'package_id'=>'required',
                'payment_wallet_type'=>'required',
            ]) ;

            if($validator->fails())
            {
                    return $this->failure($validator->errors()->first());
            }

            $id = $request->launch_paid_id;
            $findLauncher = Launchpaid::find($id);
            if(empty($findLauncher))
            {
                return $this->failure('Wrong Launch Paid');
            }

            $findPackage = \App\Models\Package::find($request->package_id);

            if(empty($findPackage))
            {
                return $this->failure('Wrong Package');
            }

            $package_price = $findPackage->price ?? '0';
            $one_image_price = $findPackage->one_image_price ?? '0';
            
            $findAlreadyPurchase = BuyPackages::where('is_purchased',2)->where([
                'lauch_id'=>$id,
                'package_id'=>$request->package_id, 
                'user_id'=>$user_id,
            ])->first();

            if(!empty($findAlreadyPurchase))
            {
                return $this->failure('Already Purchased this Package');
            }


            $credit_wallet_balance = CreditBalance::where(['user_id'=>$user_id,'status'=>'1'])->sum('remaining_balance'); 
            // $trading_wallet = Auth::user()->tradding_live_wallet; // 
            // $launcher_wallet_balance = LauncherWallet::where('user_id',$user_id)->sum('amount');
            

            // For Trading Wallet
                $trader_trade_amount = UserInvestment::where(['user_id'=>$user_id,'type'=>'live'])->sum('amount');
                
                $trader_fund_used_for_buy_package = BuyPackages::where(['user_id'=>$user_id,'is_purchased'=>'2','payment_wallet_type'=>'1'])->sum('price');
     
                $trader_fund_used_for_trading = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->orderBy('user_trading_portfolio.id','desc')->where(['launchpaid.launc_paid_type'=>'2','user_trading_portfolio.user_id'=>$user_id])->sum('total_price');
     
                $trader_fund_used = $trader_fund_used_for_buy_package + $trader_fund_used_for_trading;
                if($trader_trade_amount>$trader_fund_used)
                    $trading_wallet = $trader_trade_amount - $trader_fund_used;
                else
                    $trading_wallet = '0';


            // For Launcher Wallet
                $launcher_trade_amount_cr = LauncherWallet::where(['user_id'=>$user_id,'type'=>'credit'])->sum('amount');
                $launcher_trade_amount_dr = LauncherWallet::where(['user_id'=>$user_id,'type'=>'debit','is_transfer'=>'1'])->sum('amount');
                $launcher_trade_amount = $launcher_trade_amount_cr - $launcher_trade_amount_dr;
                 
                $launcher_fund_used = LauncherWallet::where(['user_id'=>$user_id,'type'=>'debit','is_transfer'=>'0'])->sum('amount');


                if($launcher_trade_amount>$launcher_fund_used)
                    $launcher_wallet_balance = $launcher_trade_amount_cr - $launcher_fund_used;
                else
                    $launcher_wallet_balance = '0';
     
                 // $launcher_available_balance = $launcher_trade_amount-$launcher_available_balance_1;


                $launcher_wallet_balance = $launcher_trade_amount - $launcher_fund_used;

            if($request->payment_wallet_type==1 && $trading_wallet<=$package_price){
                return $this->failure('You have insufficient balance in your trading wallet');
            }else if($request->payment_wallet_type==2 && $credit_wallet_balance<=$package_price){
                return $this->failure('You have insufficient balance in your credit wallet');
            }else if($request->payment_wallet_type==3 && $launcher_wallet_balance<=$package_price){
                return $this->failure('You have insufficient balance in your launcher wallet');
            }else{  
 
                $launcher_id = $findLauncher->id;

                $buyPack = new BuyPackages;
                $buyPack->user_id = $user_id;
                $buyPack->lauch_id = $launcher_id; // launcher
                $buyPack->package_id = $findPackage->id; // package
                $buyPack->quanity = $findPackage->quantity;
                $buyPack->one_image_price = $one_image_price;
                $buyPack->price = $findPackage->price;
                $buyPack->is_purchased = 2;
                $buyPack->payment_wallet_type = $request->payment_wallet_type; 
                if($buyPack->save())
                {   

                    if($request->payment_wallet_type==1){ // for tradding wallet
                        
                        $walletExistingBalance =  User::where(['id' => $user_id])->sum('tradding_live_wallet');
                        
                        if($walletExistingBalance > $findPackage->price){
                        
                            User::where(['id' => $user_id])->decrement('tradding_live_wallet', $findPackage->price);
                            
                            $creditHistory = new Wallet;  // trading wallet
                            $creditHistory->user_id = $user_id;
                            $creditHistory->is_transfer = '2';
                            $creditHistory->amount = $findPackage->price; 
                            $creditHistory->payment_type = 'debit';
                            $creditHistory->status = 'status';
                            $creditHistory->type = $account_type; // demo/live
                            $creditHistory->remark = "Debit for package buy";
                            $creditHistory->save();
                        }else{
                            return $this->failure('You have insufficient balance !');
                        }

                    }else if($request->payment_wallet_type==2){ // for Credit Wallet
                        

                        $findWalletAmount = CreditBalance::where('remaining_balance','!=',0)->where(['user_id'=>$user_id])->first(['id','remaining_balance']);
                        if(isset($findWalletAmount->id)){

                            $walletExistingBalance = $findWalletAmount->remaining_balance;

                            if($walletExistingBalance > $findPackage->price){
                                CreditBalance::where(['id' => $findWalletAmount->id])->decrement('remaining_balance', $findPackage->price);

                                $creditHistory = new CreditBalanceHistory;
                                $creditHistory->user_id = $user_id;
                                $creditHistory->payment_type = 'debit';
                                $creditHistory->amount = $findPackage->price; // package
                                $creditHistory->remark = "Debit for package buy";
                                $creditHistory->save();
                            }else{
                                return $this->failure('You have insufficient balance !');
                            }
                        } 
                    }else if($request->payment_wallet_type==3){ // for Launcher Wallet
                        

                        User::where(['id' => $user_id])->decrement('launcher_live_wallet', $findPackage->price);

                        $creditHistory = new LauncherWallet;  // trading wallet
                        $creditHistory->user_id = $user_id; 
                        $creditHistory->amount = $findPackage->price; 
                        $creditHistory->type = 'debit';
                        $creditHistory->status = '1'; 
                        $creditHistory->remark = "Debit for package buy";
                        $creditHistory->save(); 
                    }

                    return $this->success('Package Buy Successfully',$buyPack);
                }
            }
            return $this->failure('Something Went Wrong!');
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }

    }
}
