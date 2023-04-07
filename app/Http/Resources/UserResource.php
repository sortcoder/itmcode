<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\TradingPortfolio;   
use App\Models\Professional;   
use App\Models\Districts;   
use App\Models\State;   

use App\Models\Wallet;    // trading wallet
use App\Models\CreditBalance;   
use App\Models\CreditBalanceHistory;  
use App\Models\LauncherWallet;  
use App\Models\BuyPackages; 
use App\Models\UserInvestment; 

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {  
        $account_type = $this->account_type;
        $user_id = $this->id;
        
        // For Trading Wallet
         
        if($account_type==1){ // Only for demo account


            /*
                $trader_available_cash = $this->tradding_demo_wallet;

                $trader_fund_used = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->orderBy('user_trading_portfolio.id','desc')->where(['launchpaid.launc_paid_type'=>'1','user_trading_portfolio.user_id'=>$user_id])->sum('total_price');

                $trader_available_balance = $trader_available_cash+$trader_fund_used;
            */

            $trader_trade_amount = UserInvestment::where(['user_id'=>$user_id,'type'=>'demo'])->sum('amount');
            $trader_fund_used = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->orderBy('user_trading_portfolio.id','desc')->where(['launchpaid.launc_paid_type'=>'1','user_trading_portfolio.user_id'=>$user_id])->sum('total_price');
           
            if($trader_trade_amount > $trader_fund_used)
                $trader_available_balance = $trader_trade_amount - $trader_fund_used;
            else
                $trader_available_balance = '0';

            

        }else{
            /*$trader_available_cash = $this->tradding_live_wallet;

            $trader_fund_used = Wallet::where(['user_id'=>$user_id,'is_transfer'=>0,'payment_type'=>'debit','type'=>'live'])->sum('amount');*/
            
            $trader_trade_amount = UserInvestment::where(['user_id'=>$user_id,'type'=>'live'])->sum('amount');
            
            $trader_fund_used_for_buy_package = BuyPackages::where(['user_id'=>$user_id,'is_purchased'=>'2','payment_wallet_type'=>'1','is_launchpad_approve'=>'1'])->sum('price');
 
            $trader_fund_used_for_trading = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->orderBy('user_trading_portfolio.id','desc')->where(['launchpaid.launc_paid_type'=>'2','user_trading_portfolio.user_id'=>$user_id,'user_trading_portfolio.is_remaining_buy'=>'0'])->sum('total_price'); 
            
            $trader_fund_used = $trader_fund_used_for_buy_package + $trader_fund_used_for_trading;
            if($trader_trade_amount>$trader_fund_used)
                $trader_available_balance = $trader_trade_amount - $trader_fund_used;
            else
                $trader_available_balance = '0';
        } 
        


        // For Launcher Wallet
        $getLauncherWalletUsed = LauncherWallet::where(['user_id'=>$user_id,'is_transfer'=>0,'type'=>'debit'])->sum('amount');

        $launcher_available_cash = $this->launcher_live_wallet;        
        $launcher_fund_used = $getLauncherWalletUsed;
        $launcher_available_balance = $launcher_available_cash+$launcher_fund_used;


        // $launcher_credit_balance = CreditBalance::where(['user_id'=>$user_id,'status'=>'1'])->sum('amount'); 

        $launcher_credit_balance = CreditBalance::where(['user_id'=>$user_id,'status'=>'1'])->sum('amount'); 
        $launcher_credit_history_remaining_balance = CreditBalanceHistory::where(['user_id'=>$user_id,'payment_type'=>'debit'])->sum('amount'); 
        
        $credit_wallet_balance = $launcher_credit_balance - $launcher_credit_history_remaining_balance;

        $gender="";
        if($this->gender=='1'){
            $gender = "Male";
        }else if($this->gender=='2'){
            $gender = "Female";
        }  

        $marital_status="";
        if($this->marital_status=='1'){
            $marital_status = "Single";
        }else if($this->marital_status=='2'){
            $marital_status = "Married";
        }

        $user_type_name = "";
        if($this->user_type==3){ // for launcher 
            $user_type_name = "Launcher";
        }else if($this->user_type==2){ // for Trader 
            $user_type_name = "Trader";
        }
        if($this->user_type==3){ // for launcher
            $user_account_type = 2;  // for Live 
        }else{
            $user_account_type = $getAccount->account_type ?? '1';
            $account_type_name = "";
            $account_type_name = "Launcher";
        } 

        $account_type_name = "";
        if($this->account_type==1){  
            $account_type_name = "Demo";
        }else if($this->account_type==2){  
            $account_type_name = "Live";
        }

        $getProfession = Professional::find($this->profession);
        $profession = $getProfession->name ?? "";

        $getState = State::find($this->state);
        $state_name = $getState->name ?? "";
        
        $getDistrict = Districts::find($this->district);
        $district_name = $getDistrict->name ?? "";

        $city = $this->city;
        $state = $this->state;
        $district = $this->district; 
        $user_type = $this->user_type; 
        $kyc_status = $this->kyc_status;
        $launcher_status = $this->launcher_status;
        $is_adhaar_pancard_kyc_approved = $this->is_adhaar_pancard_kyc_approved;
        

        return [
            'user_id' => $this->id,
            'name' => $this->name ?? '', 
            'mobile' => $this->mobile ?? '',
            'email' => $this->email ?? '',
            'username' => $this->username ?? '', 
            'father_name' => $this->father_name ?? '',
            'mother_name' => $this->mother_name ?? '',
            'dob' => $this->dob ?? '',
            'address_one' => $this->address_one ?? '',
            'address_two' => $this->address_two ?? '',
            'gender' => $gender,
            'marital_status' => $marital_status,
            'profession_id' => $this->profession ?? '',
            'profession' => $profession,
            'state_id' => $state,
            'state_name' => $state_name,
            'district' => $district,
            'district_name' => $district_name,
            'pincode' => $this->pincode ?? '',
            'city' => $city,  
            'pan_card_no' => $this->pan_card_no ?? '',
            'pan_card_img' => $this->pan_card_img ?? '', 
            'aadhar_card_no' => $this->aadhar_card_no ?? '', 
            'aadhar_front_img' => $this->aadhar_front_img ?? '',
            'aadhar_back_img' => $this->aadhar_back_img ?? '',
            'signature' => $this->signature ?? '',
            'profile' => $this->profile ?? '',
            'user_type_name' => $user_type_name,
            'account_type' => $account_type,
            'account_type_name' => $account_type_name,
            'kyc_status' => $kyc_status, 
            'is_adhaar_pancard_kyc_approved' => $is_adhaar_pancard_kyc_approved, 
            'notification_on_off' => $this->notification_on_off ?? '',
            'is_fingerprint' => $this->is_fingerprint ?? '',
            'created_by' => $this->created_by ?? '', 
            'trader_available_cash' => $trader_available_balance,
            'trader_fund_used' => $trader_fund_used,
            'trader_available_balance' => $trader_trade_amount,
            'launcher_available_cash' => $launcher_available_cash,
            'launcher_fund_used' => $launcher_fund_used,
            'launcher_available_balance' => $launcher_available_balance, 
            'launcher_credit_balance' => $credit_wallet_balance,
        ]; 
    }

}
