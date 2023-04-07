<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use App\Traits\SmsNotification as SmsNotification;
use App\Models\User;
use App\Models\Package;
use App\Models\Video;
use Validator;
use Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Lauchpaid;
use App\Models\LaunchpaidData;
use App\Models\StockExchange;
use App\Models\StockExchangeHistory;
use App\Models\TradeTransaction;
use App\Models\LikeLaunchpad; 
use App\Models\Page; 
use App\Models\BankDetail; 
use App\Models\BuyPackages;
use App\Models\Professional;
use App\Models\TradingPortfolio;
use App\Models\LauncherWallet;
use App\Models\WithdrawalRequest;
use App\Models\Notification;
use DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    use ResponseWithHttpRequest , SmsNotification;

    public function dashboard(Request $request){

        $auth_dt = Auth::user();

        $data = [];
        $data['banners'] = $this->banners();
        $data['packageList'] = $this->_package_list();
        $data['videoList'] = $this->_video_list();
        $data['kycStatusData'] = $this->kycCheck(User::find(auth::user()->id));
 
        $data['launchPadList'] = $this->_launchpad_list(5,"","");
        $data['userinfo'] = $this->userInfo();
        return $this->success("Dashboard List",$data);
    }

    public function my_watchlist(Request $request){
 
        $user_id = Auth::id();
        $watchedLaunchpadIdss = LikeLaunchpad::where(['user_id' => $user_id])->pluck('launchpad_id')->join(','); 
        $data = []; 
        if(!empty($watchedLaunchpadIdss)){ // return "maan";  
            $data['launchPadList'] = $this->_launchpad_list("",$watchedLaunchpadIdss,"1"); 
        }else{  
            $data['launchPadList'] = [];
        }
        return $this->success("My Watchlist",$data);
    }

    public function add_to_watchlist(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'launchpad_id' => 'required|integer',   
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
            $is_fav = LikeLaunchpad::where(['user_id' => $user_id,'launchpad_id' => $request->launchpad_id])->count(); 

            if($is_fav==0){ 

                $newUser = LikeLaunchpad::create([
                    'user_id' => $user_id,
                    'launchpad_id' => $request->launchpad_id, 
                ]); 
                return $this->success("Trading image added to watchlist",$data);

            }else{

                LikeLaunchpad::where(['user_id' => $user_id,'launchpad_id' => $request->launchpad_id])->forceDelete(); 
                return $this->success("Trading image removed from watchlist",$data);

            }    
        }           
        
    }

    public function add_money(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'amount' => 'required',   
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];
            $user_id = Auth::id();
            User::where(['id' => $user_id])->increment('tradding_live_wallet', $request->amount);
 
            $st_row = new LauncherWallet;
            $st_row->user_id = $user_id;
            $st_row->amount = $request->amount; 
            $st_row->type = 'credit';
            $st_row->save(); 

            return $this->success("Balance addeed to wallet",$data);    
        }    
    }

    public function withdraw_money(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'amount' => 'required',   
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];
            $user_id = Auth::id();
            
            $st_row = new WithdrawalRequest;
            $st_row->user_id = $user_id;
            $st_row->amount = $request->amount;  
            $st_row->save(); 

            return $this->success("Withdraw request send to admin for approval",$data);    
        }    
    }
    public function get_page_detail(Request $request) {
          

        $validator = Validator::make($request->all(),[
            'page_id' => 'required|integer',  
        ]);

        $data = $request->all();

        $req_data = [];
        if($validator->fails()){
            $error = '';
            if (!empty($validator->errors())) {
                $error = $validator->errors()->first();
            } 
            $message = $error;
            return $this->json_view(false,$req_data,$message);
        }else    
        {   
            $page_id = $request->page_id;
            
            $page_details = Page::find($page_id);
            if(isset($page_details->page_name)){
                $req_data = [
                    'page_name' => $page_details->page_name,
                    'page_content' => $page_details->page_content   
                ];

                $req_message = "Page Details Found";
              
                return $this->success($req_message,$req_data);
            }else{
                $req_message = "No Page Found";
                    
                return $this->success($req_message,$req_data);
            }
        }    
    }

    public function account_type_update(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'account_type' => 'required|integer',   
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
            
            User::where(['id' => $user_id])->update(['account_type' => $request->account_type]); 

            return $this->success("Account type updated",$data);    
        } 
    }

    public function notification_status_update(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'notification_status' => 'required|integer',   
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
            
            User::where(['id' => $user_id])->update(['notification_on_off' => $request->notification_status]); 

            return $this->success("Notification status updated",$data);    
        } 
    }

    public function add_update_bank_detail(Request $request) {
        
        $validator = Validator::make($request->all(),[
            'bank_name' => 'required',   
            'ifsc' => 'required',   
            'account_no' => 'required',   
            'branch_name' => 'required',    
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
            
            $crr = [
                'user_id' => $user_id,
                'bank_name' => $request->bank_name,
                'ifsc' => $request->ifsc,
                'account_no' => $request->account_no,
                'branch_name' => $request->branch_name, 
            ];

            if($request->record_id){
                BankDetail::where(['id' => $user_id])->update($crr);
                return $this->success("Bank Details Updated",$data);    
            }else{
                BankDetail::create($crr); 
                return $this->success("Bank Details Added",$data); 
            }

        } 
    }

    public function update_pin(Request $request) {
        
        $validator = Validator::make($request->all(),[
            'pin_no' => 'required',     
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
            
            User::where(['id' => $user_id])->update(['pin_no' => $request->pin_no]);
            return $this->success("Pin added successfully",$data); 

        } 
    }

    public function update_fingerprint(Request $request) {
        
        $validator = Validator::make($request->all(),[
            'fingerprint_status' => 'required',     
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
         
            User::where(['id' => $user_id])->update(['is_fingerprint' => $request->fingerprint_status]);
            return $this->success("Figure lock status updated",$data); 

        } 
    }

    public function get_bank_detail(Request $request) {
          
        $req_data = [];

        $getBankDetail = BankDetail::orderBy('id','desc')->get()->toArray();


        $validator = Validator::make($request->all(),[
            'page_id' => 'required|integer',  
        ]);

        if(count($getBankDetail)>0){
            $req_data['bank_detail'] = $getBankDetail;
            $req_message = "Bank Details Found";
        }else{
            $req_message = "No Bank Detail Found"; 
        }
        return $this->success($req_message,$req_data);  
    }
 
    public function get_notification_list(Request $request) {
          
        $req_data = [];

        $get_noti_list = Notification::orderBy('id','desc')->get()->toArray();
 
        $req_data['notification_list'] = $get_noti_list;
        $req_message = "Notification List";
        return $this->success($req_message,$req_data);  
    }

    public function buy_sell_launchpaid(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'lauch_id' => 'required|integer', 
            'price' => 'required',
            'quantity' => 'required', 
            'type' => 'required',  
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
            
            $getAccount = User::where('id',$user_id)->first(['account_type']);
            $user_account_type = $getAccount->account_type ?? '1'; 

            $st_row = new StockExchange;
            $st_row->user_id = $user_id;
            $st_row->lauch_id = $request->lauch_id;
            $st_row->price = $request->price;
            $st_row->type = $request->type;              
            $st_row->quantity = $request->quantity; 
            $st_row->remaining_qty = $request->quantity;
            $st_row->save();       
            $inserted_stock_ex_id = $st_row->id;
 
            
            if($request->type=="buy"){

                $getBuyRec = TradingPortfolio::where(['user_id'=>$user_id,'image_id'=>$request->lauch_id])->first();
                if(isset($getBuyRec->id)){
 
                    $req_up_qty = $getBuyRec->quantity+$request->quantity;
                    $req_up_price = $getBuyRec->price+$request->price;

                    $tot_up_price = ($request->price*$request->quantity)+$getBuyRec->total_price;

                    $rec_upd = [
                        'quantity' => $req_up_qty,
                        'price'=>$req_up_price,
                        'total_price'=>$tot_up_price,
                    ];
                    TradingPortfolio::where(['id' => $getBuyRec->id])->update($rec_upd);

                }else{
                    $st_port_row = new TradingPortfolio;
                    $st_port_row->user_id = $user_id;
                    $st_port_row->image_id = $request->lauch_id;
                    $st_port_row->quantity = $request->quantity;  
                    $st_port_row->price = $request->price;  
                    $st_port_row->total_price = $request->price*$request->quantity;  
                    $st_port_row->save();     
                }
            } 
            $req_qty = $request->quantity;
            $traded_qty = '0';

            $check_BuySell_type_in_record = ($request->type=="buy") ? "sell" : 'buy';

            $checkStExQuery = StockExchange::orderBy('id','asc')->where(['lauch_id'=>$request->lauch_id,'type'=>$check_BuySell_type_in_record,'status'=>"pending"])->where('user_id', '!=', $user_id);  

            if($request->type=="buy")
                $checkStExQuery->where('price', '<=', $request->price);
            else if($request->type=="sell"){
               $checkStExQuery->where('price', '>=', $request->price);
            }

            $stock_tbl = $checkStExQuery->where('remaining_qty', '>', '0')->get();

            foreach($stock_tbl as $st_val)
            {    

                if(isset($st_val->id) && $st_val->price<=$request->price){
                    if($req_qty>=$st_val->remaining_qty){ 
                        StockExchange::where(['id' => $st_val->id])->update(['remaining_qty' => '0','status'=>"successful"]);
                        $req_qty = $req_qty - $st_val->remaining_qty;

                        $traded_qty = $st_val->remaining_qty;
                        $is_record_need_to_update = '1';

                    }else if($st_val->remaining_qty>$req_qty){ 
                        $crr = $st_val->remaining_qty - $req_qty; 
                        StockExchange::where(['id' => $st_val->id])->update(['remaining_qty' => $crr]);  

                        $traded_qty = $req_qty; 
                        $is_record_need_to_update = '1';
                    }

                    if($is_record_need_to_update=='1' && $traded_qty>0){

                        $from_stock_exch_id = $st_val->id;
                        $to_stock_exch_id = $inserted_stock_ex_id;

                        $live_price_for_launchpad = $st_val->price;

                        $get_from_stock_dt = StockExchange::where(['id' => $from_stock_exch_id])->first(['user_id']);
                        $first_buy_userID = $get_from_stock_dt->user_id;

                        $first_buyer_stockDt = StockExchange::where(['lauch_id' =>$request->lauch_id,'user_id'=>$first_buy_userID,'type'=>'buy'])->first(['id','user_id','price']);

                        $first_buy_user_id = $first_buyer_stockDt->user_id;
                        $first_buying_price = $first_buyer_stockDt->price;
                        $selling_price = $st_val->price;
                        
                        $is_profit = '0';  // for loss
                        $profit_amt = '0'; $profit_in_percent = '0';
                        
                        $profit_amt = ($selling_price-$first_buying_price)*$traded_qty;

                        if($selling_price > $first_buying_price){ // for Profit
                            $profit_in_percent = ($profit_amt)*100/($live_price_for_launchpad*$traded_qty); 
                            $is_profit = '1';

                        }else if($selling_price < $first_buying_price){ // for Loss 

                            $profit_in_percent = (($selling_price/$first_buying_price)*100)-100;
                            $is_profit = '2';
                        }

                        $live_tot_price = $live_price_for_launchpad*$traded_qty;

                        $row2 = new TradeTransaction;
                        $row2->first_buy_stock_exchange_id = $first_buyer_stockDt->id;
                        $row2->stock_exchange_id = $from_stock_exch_id;
                        $row2->first_buy_user_id = $first_buy_user_id;
                        $row2->user_id = $user_id;
                        $row2->image_id  = $st_val->lauch_id;
                        $row2->first_buy_price = $first_buying_price;
                        $row2->price = $selling_price;
                        $row2->quantity = $traded_qty;
                        $row2->type = $st_val->type;  
                        $row2->live_price = $live_tot_price;
                        $row2->status="successful";
 
                        $row2->is_profit_or_loss = $is_profit;     
                        $row2->profit_in_amount = $profit_amt; 
                        $row2->profit_in_percent = $profit_in_percent; 

                        $row2->save(); 
                        
                        // Updating wallet & Portfolio
                            $this->_update_wallet_and_portfolio_sell($user_id,$live_tot_price,$first_buy_user_id,$st_val->lauch_id,$traded_qty); 

                            $this->_manage_stock_exch_history($from_stock_exch_id,$to_stock_exch_id); 
                    }
                }
            }
  
            $this->_launchpad_live_price_update_on_sell($request->lauch_id); 
            if($request->type=="buy"){                
                $this->_trade_sell_status_update($user_id,$request->lauch_id,$request->quantity); 
            }

            return $this->success(ucfirst($request->type)." request send successfully ",$data);
        } 
    }

    public function _trade_sell_status_update($user_id="",$lauch_id="",$req_qty=""){

        $getTradeTblDt = TradeTransaction::select(DB::raw('sum(quantity) as total_sell_quantity'),'stock_exchange_id')->orderBy('id','asc')->where(['user_id'=>$user_id,'image_id'=>$lauch_id])->groupBy('image_id')->get(['stock_exchange_id,total_sell_quantity']);  
        
        $new_ad_remain_qty = $req_qty;
        $remainnn_qty = 0;

        foreach($getTradeTblDt as $trad_avail){
            $getCheckStockDt2  = StockExchange::where(['id' => $trad_avail->stock_exchange_id])->first(['id','quantity','remaining_qty']);
            if($getCheckStockDt2->quantity==$trad_avail->total_sell_quantity){
                StockExchange::where(['id' => $trad_avail->stock_exchange_id])->update(['status' => "successful"]);

            }  
        }
    }

    public function _update_wallet_and_portfolio_sell($user_id="",$live_tot_price="",$first_buy_user_id="",$lauch_id="",$traded_qty=""){
    
        $getAccount = User::where('id',$user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1'; 

        if($user_account_type=='1') // for demo account
            User::where('id',$user_id)->decrement('tradding_demo_wallet', $live_tot_price);
        else
            User::where('id',$user_id)->decrement('tradding_live_wallet', $live_tot_price);

        $getPorfolioRec = TradingPortfolio::where(['user_id'=>$first_buy_user_id,'image_id'=>$lauch_id])->first();
        if(isset($getPorfolioRec->id)){
            $req_up_qty = $getPorfolioRec->quantity-$traded_qty;
            $port_price = $getPorfolioRec->price;

            $req_up_price = $port_price*$req_up_qty;

            $rec_upd = [
                'quantity' => $req_up_qty,
                'price'=>$port_price,
                'total_price'=>$req_up_price*$req_up_qty,
            ];
            TradingPortfolio::where(['id' => $getPorfolioRec->id])->update($rec_upd);

            $checkAllSold = TradingPortfolio::where(['id' => $getPorfolioRec->id])->first(['quantity']);
            if($checkAllSold->quantity==0){
                TradingPortfolio::where(['id' => $getPorfolioRec->id])->delete();
            }
        }
    } 

    public function _launchpad_live_price_update_on_sell($lauch_id=""){
        if($lauch_id!=""){
            $updatefor_livePrice = StockExchange::orderBy('price','desc')->where(['lauch_id'=>$lauch_id,'status'=>"successful"])->first(['price']);

            if(isset($updatefor_livePrice->price)){ 
                Lauchpaid::where('id',$lauch_id)->update(['live_image_price'=>$updatefor_livePrice->price]);        
            }
        }
        return '1';
    }

    public function _manage_stock_exch_history($from_stock_exch_id="",$to_stock_exch_id=""){
       
        $get_from_stock_dt = StockExchange::where(['id' => $from_stock_exch_id])->first();
        $get_to_stock_dt = StockExchange::where(['id' => $to_stock_exch_id])->first();

        $st_row_history = new StockExchangeHistory;
        $st_row_history->from_stock_exchange_id = $get_from_stock_dt->id;
        $st_row_history->to_stock_exchange_id = $get_to_stock_dt->id;
        $st_row_history->from_user_id = $get_from_stock_dt->user_id;
        $st_row_history->to_user_id = $get_to_stock_dt->user_id; 
        $st_row_history->from_type = $get_from_stock_dt->type; 
        $st_row_history->to_type = $get_to_stock_dt->type;              
        $st_row_history->from_quantity = $get_from_stock_dt->quantity;
        $st_row_history->to_quantity = $get_to_stock_dt->quantity;  
        $st_row_history->from_remaining_qty = $get_from_stock_dt->remaining_qty; // $qty_after_update;
        $st_row_history->to_remaining_qty = $get_to_stock_dt->remaining_qty;

            $buying_price = $get_to_stock_dt->price;
            $selling_price = $get_from_stock_dt->price;

            $st_row_history->buying_price = $selling_price; // $buying_price;              
            $st_row_history->selling_price = $selling_price;
         
        $st_row_history->save();
        return '1';
    }


    public function order_update(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'order_id' => 'required|integer',   
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {    
            $data = [];

            $user_id = Auth::id();
        
            $input_arr = [];
            if(isset($request->order_status)){
                $input_arr['status'] = $request->order_status;
            }
            if(isset($request->quantity) && isset($request->price)){
                $input_arr['quantity'] = $request->quantity;
                $input_arr['price'] = $request->price;
                
                $getAgain = StockExchange::where('id',$request->order_id)->first(['quantity','remaining_qty']);
                if($getAgain->remaining_qty!=0){
                    if($request->quantity > $getAgain->quantity){
                        $up_remainig_qty = $request->quantity-$getAgain->quantity;
                        StockExchange::where('id',$request->order_id)->increment('remaining_qty', $up_remainig_qty);
                    }else if($getAgain->quantity > $request->quantity){
                        $up_remainig_qty = $getAgain->quantity - $request->quantity;
                        StockExchange::where('id',$request->order_id)->decrement('remaining_qty', $up_remainig_qty);
                    }
                }
            }

            StockExchange::where('id',$request->order_id)->update($input_arr);

            return $this->success("Order Updated",$data);
        } 
    }
    public function cron_trading_txn_update(Request $request) {    
        $data = [];
        
        $data["sell_cron_status"] = $this->_common_fun_for_stock_exchange_for_cron("sell");
        $data["sell_cron_status"] = $this->_common_fun_for_stock_exchange_for_cron("buy");

        return $this->success("Record Processed",$data);  
    }


    public function _common_fun_for_stock_exchange_for_cron($record_type=""){

        $getStockDt = StockExchange::orderBy('id','desc')->where(['type'=>$record_type,'status'=>'pending'])->where('remaining_qty', '!=', '0')->get();

        foreach($getStockDt as $st_row){
             
            if(isset($st_row->id)){
                
                $user_id = $st_row->user_id;

                $check_BuySell_type_in_record = ($st_row->type=="Buy") ? "Sell" : 'Buy';

                $checkStExQuery = StockExchange::orderBy('id','asc')->where(['lauch_id'=>$st_row->lauch_id,'type'=>$check_BuySell_type_in_record,'status'=>"pending"])->where('user_id', '!=', $user_id);  

              

                if($st_row->type=="Buy")
                    $checkStExQuery->where('price', '<=', $st_row->price);
                else if($st_row->type=="Sell")
                    $checkStExQuery->where('price', '>=', $st_row->price);

                $checkStockExRecord = $checkStExQuery->where('remaining_qty', '!=', '0')->get();

                foreach($checkStockExRecord as $st_avail)
                {
                    if(isset($st_avail->id)){

                        $avail_qty = $st_avail->remaining_qty;
                    
                        $is_record_need_to_update = '0';
                        if($avail_qty<=$next_remain_qty){ 
                            $next_remain_qty = $next_remain_qty-$avail_qty; 
                            $qty_after_update = '0';
                            $is_record_need_to_update = '1';
                        }else if($next_remain_qty <= $avail_qty){
                            $qty_after_update = $avail_qty-$next_remain_qty;
                            $is_record_need_to_update = '1';
                        }

                        if($is_record_need_to_update=='1'){

                            StockExchange::where(['id' => $st_avail->id])->update(['remaining_qty' => $qty_after_update,'status' => "successful"]); 

                            $live_price_for_launchpad = $st_avail->price;

                            $row2 = new TradeTransaction;
                            $row2->user_id = $user_id;
                            $row2->image_id  = $st_avail->lauch_id;
                            $row2->price = $st_avail->price;
                            $row2->quantity = $st_avail->quantity; 
                            $row2->type = $st_avail->type;  
                            $row2->live_price = $live_price_for_launchpad*$st_avail->quantity;
                            $row2->status="successful"; 
                            $row2->save(); 

                            $getToStockExDt = StockExchange::where(['id' => $st_row->id])->first();

                            $st_row_history = new StockExchangeHistory;
                            $st_row_history->from_stock_exchange_id = $st_avail->id;
                            $st_row_history->to_stock_exchange_id = $getToStockExDt->id;
                            $st_row_history->from_user_id = $st_avail->user_id;
                            $st_row_history->to_user_id = $getToStockExDt->user_id; 
                            $st_row_history->from_type = $st_avail->type; 
                            $st_row_history->to_type = $getToStockExDt->type;              
                            $st_row_history->from_quantity = $st_avail->quantity;
                            $st_row_history->to_quantity = $getToStockExDt->quantity;  

                            $st_row_history->from_remaining_qty = $qty_after_update;
                            $st_row_history->to_remaining_qty = $getToStockExDt->remaining_qty;

                            $st_row_history->save(); 
                        }

                    } 
                    $updatefor_livePrice = StockExchange::orderBy('id','desc')->where(['lauch_id'=>$st_avail->lauch_id,'status'=>"successful"])->first(['price']);
                    
                    if(isset($updatefor_livePrice->price)){
                        Lauchpaid::where('id',$request->lauch_id)->update(['live_image_price'=>$updatefor_livePrice->price]);
                    }
                }
            }
        } 

        return "success";
    }

    public function home_dashboard(Request $request){
        
        $auth_dt = Auth::user();
        $is_pin_no = Auth::user()->pin_no;

        $data = [];
            
        $launchArr = $this->_launchpad_list(5,"","");
        
        $stock_prc_1 = array(); $stock_prc_2 = array();

        foreach ($launchArr as $key1 => $row1)
        {
            $stock_percent = $row1['calculated_stock_exchange_price']['stock_in_percent'];
            $stock_prc_1[$key1] = $stock_percent;

            $buy_count = $row1['launch_buy_count'];
            $stock_prc_2[$key1] = $buy_count;
        }

        array_multisort($stock_prc_2, SORT_DESC, $launchArr);
        $data['hot_launch_pad_list'] = $launchArr;
        array_multisort($stock_prc_1, SORT_DESC, $launchArr);
        $data['gainer_launch_pad_list'] = $launchArr;
        
        array_multisort($stock_prc_1, SORT_ASC, $launchArr);
        $data['looser_launch_pad_list'] = $launchArr;
        
        $data['banners'] = $this->banners();
        $data['package_list'] = $this->_package_list();
        $data['my_overall_trading'] = $this->_my_over_all_calculate_stock_exchange_price();
        $data['video_list'] = $this->_video_list();     
        
        $recommendedLaunchpadIdss = Lauchpaid::where(['is_recommended' => '1'])->pluck('id')->join(','); 
         
        if(!empty($recommendedLaunchpadIdss)){ 
            $data['recommended_launchpad_list'] = $this->_launchpad_list("",$recommendedLaunchpadIdss,""); 
        }else{  
            $data['recommended_launchpad_list'] = [];
        }
        $data['is_kyc_added'] = ($auth_dt->kyc_status==2) ? '1' : '0';
        $data['is_pin_no'] = ($is_pin_no!="") ? '1' : '0';
        return $this->success("home_dashboard",$data);
    }

     
    public function portfolio_dashboard(Request $request){

        $auth_dt = Auth::user();
        $auth_user_id = Auth::id();

        $data = [];
  
        $getOrdDtQuery = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->orderBy('user_trading_portfolio.id','desc')->where(['user_trading_portfolio.user_id'=>$auth_user_id])->get(['launchpaid.*']);

        $launchArr = [];

        if(!empty($getOrdDtQuery))
        {
            foreach($getOrdDtQuery as $key =>$val)
            {   

                $calculated_price = $this->_calculate_portfolio_stock_exchange_price($val->id,1); 
                
                $GetlanchStockBuy = StockExchange::select(DB::raw('count("lauch_id") as launch_buy_count'))
                ->groupBy('lauch_id')
                ->orderBy('launch_buy_count', 'desc')
                ->where(['type'=>1,'lauch_id'=>$val->id])->first(['launch_buy_count']);

                
                $checkLikedCount = LikeLaunchpad::where(['user_id' => $auth_user_id,'launchpad_id' => $val->id])->count();
                $is_liked = ($checkLikedCount>0) ? '1' : '0';

                $getUser = User::find($val->user_id);
                $user_name = (isset($getUser->name)) ? $getUser->name : "";

                $row = [];
                $row['launchpad_id'] = $val->id;
                $row['launc_paid_type'] = $val->launc_paid_type;
                $row['quantity'] = $val->quantity;
                $row['launch_image'] = $val->launch_image;
                $row['launch_sketch'] = $val->launch_sketch;
                $row['launch_designation'] = $val->launch_designation;
                $row['calculated_stock_exchange_price'] = $calculated_price;
                $row['launch_buy_count'] = $GetlanchStockBuy->launch_buy_count ?? '0';
                $row['is_liked'] = $is_liked;
                $row['created_by'] = $user_name;

                $launchArr[] = $row;
            }
        } 
        $data['launchpad_list'] = $launchArr;

        $stock_prc = array();
         
        if($request->filter_type==3){ // top loser

            foreach ($launchArr as $key1 => $row1)
            {
                $stock_percent = $row1['calculated_stock_exchange_price']['stock_in_percent'];
                $stock_prc[$key1] = $stock_percent;
            }
            array_multisort($stock_prc, SORT_ASC, $launchArr);

        }else if($request->filter_type==2){ // top gainer

            foreach ($launchArr as $key1 => $row1)
            {
                $stock_percent = $row1['calculated_stock_exchange_price']['stock_in_percent'];
                $stock_prc[$key1] = $stock_percent;
            }
            array_multisort($stock_prc, SORT_DESC, $launchArr);  

        }else{ 

            foreach ($launchArr as $key1 => $row1)
            {
                $buy_count = $row1['launch_buy_count'];
                $stock_prc[$key1] = $buy_count;
            }
            array_multisort($stock_prc, SORT_DESC, $launchArr);  
        }
        
        $data['portfolio_summary'] = $this->_my_over_all_calculate_stock_exchange_price();
        $data['upcomming_launchpad_list'] = $this->_upcomming_launchpad_list();
        $data['hot_launch_pad_list'] = $launchArr;
          
 
        return $this->success("portfolio_dashboard",$data);
    }


    public function launchpad_detail(Request $request){

        $validator = Validator::make($request->all(),[
            'lauch_id' => 'required|integer', 
            'market_depth_filter' => 'required',  
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {   
            $data = [];
            
            $endDate = date("Y-m-d");
            $startDate = date("Y-m-d");

            if($request->market_depth_filter=="one_week"){

                $endDate = date("Y-m-d");
                $startDate = date("Y-m-d",strtotime("-1 week")); 

            }else if($request->market_depth_filter=="one_month"){

                $endDate = date("Y-m-d");
                $startDate = date("Y-m-d",strtotime("-1 month")); 

            }else if($request->market_depth_filter=="one_year"){

                $endDate = date("Y-m-d");
                $startDate = date("Y-m-d",strtotime("-1 years")); 

            }else if($request->market_depth_filter=="three_year"){

                $endDate = date("Y-m-d");
                $startDate = date("Y-m-d",strtotime("-3 years")); 

            } 
              
            $data['launchpad_list'] = $this->_launchpad_list("",$request->lauch_id,"");  
            
            $getLaunchDt = Lauchpaid::where('id',$request->launch_id)->first();

            $data['about_us'] = $getLaunchDt->about_us ?? "";
            $data['launch_designation'] = $getLaunchDt->launch_designation ?? "";
            $data['launch_website'] = $getLaunchDt->launch_website ?? "";
            $data['youtube_link'] = $getLaunchDt->youtube_link ?? "";
            $data['twitter_link'] = $getLaunchDt->twitter_link ?? "";
            $data['instra_link'] = $getLaunchDt->instra_link ?? "";
            $data['facebook_link'] = $getLaunchDt->facebook_link ?? "";
            $data['linked_link'] = $getLaunchDt->linked_link ?? "";
 
           
            $getSellDataArr = StockExchange::select(DB::raw('sum(quantity) as total_quantity'),'price')->orderBy('total_quantity','desc')->where(['status'=>'pending','type'=>"sell"])->where('quantity', '!=', '0')->whereBetween('created_at', [$startDate, $endDate])->groupBy('price')->get(['price,total_quantity'])->toArray();  

            $getBuyDataArr = StockExchange::select(DB::raw('sum(quantity) as total_quantity'),'price')->orderBy('total_quantity','desc')->where(['status'=>'pending','type'=>"buy"])->where('quantity', '!=', '0')->whereBetween('created_at', [$startDate, $endDate])->groupBy('price')->get(['price,total_quantity'])->toArray();

            $getChartBuyDataArr = StockExchange::select('created_at','price')->orderBy('created_at','asc')->where(['status'=>'pending','type'=>"buy"])->whereBetween('created_at', [$startDate, $endDate])->groupBy('created_at')->get(['created_at,price'])->toArray();

            $crr = [];

             
            foreach($getChartBuyDataArr as $key_arr => $keyval){    
                $crr[] = [
                    date("Y-m-d h:i A",strtotime($keyval['created_at'])),
                    $keyval['price']
                ]; 
            }
            $data['market_depth_chart_data'] = $chart_json_data = json_encode($crr);
            $data['market_depth_sell_data'] = $getSellDataArr;
            $data['market_depth_buy_data'] = $getBuyDataArr;

            return $this->success("launchpad details",$data);
        }
    }

    public function my_order(Request $request){

        $validator = Validator::make($request->all(),[
            'order_on' => 'required', 
            'order_status' => 'required',  
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {   
            $data = [];
            
            $auth_user_id = Auth::id();
            $getAccount = User::where('id',$auth_user_id)->first(['account_type']);
            $user_account_type = $getAccount->account_type ?? '1';

            $todayDate = date("Y-m-d"); 
 
            $getOrdDtQuery = StockExchange::leftjoin('launchpaid','launchpaid.id','=','stock_exchange.lauch_id')->orderBy('stock_exchange.id','desc')->where(['stock_exchange.user_id'=>$auth_user_id,'stock_exchange.status'=>$request->order_status]);

            if($request->order_on=="past"){
                $getOrdDtQuery->whereDate('stock_exchange.created_at','<',$todayDate);
            }else{
                $getOrdDtQuery->whereDate('stock_exchange.created_at',$todayDate);
            } 

            $getOrdDtQuery->where(['launc_paid_type'=>$user_account_type]);

            $getOrderDataArr = $getOrdDtQuery->get(['stock_exchange.id as order_id','stock_exchange.lauch_id','launchpaid.launch_image','launchpaid.launch_sketch','launchpaid.launch_designation','launchpaid.live_image_price','stock_exchange.price','stock_exchange.quantity','stock_exchange.type','stock_exchange.status','stock_exchange.created_at'])->toArray();

            $data['order_data'] = $getOrderDataArr;
            return $this->success("launchpad details",$data);
        }
    }
    public function portfolio_list(Request $request){

        $auth_dt = Auth::user();
        $user_id = Auth::id();

        $getAccount = User::where('id',$user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1'; 

        $data = [];
            
        $data['portfolio_summary'] = $this->_my_over_all_calculate_stock_exchange_price();
         
            $getTradCountQue = TradeTransaction::leftjoin('launchpaid','launchpaid.id','=','trading_transaction.image_id');
            
            /*if($request->search_term){
                $search_txt = $request->search_term;
                $getTradCountQue->where('launchpaid.launch_sketch', 'like', $search_txt.'%');
            }*/

            $getTradCount = $getTradCountQue->where(['trading_transaction.user_id' => $user_id,'trading_transaction.type' => "buy",'launchpaid.launc_paid_type'=>$user_account_type])->count();


            if($getTradCount>0){
               
                $tradedLaunchpadIdssQue = TradeTransaction::leftjoin('launchpaid','launchpaid.id','=','trading_transaction.image_id')->where(['trading_transaction.user_id' => $user_id,'trading_transaction.type' => "buy",'launchpaid.launc_paid_type'=>$user_account_type]);

                if($request->search_term){ 
                    $tradedLaunchpadIdssQue->where('launchpaid.launch_sketch', 'like', $search_txt.'%');
                }

                $tradedLaunchpadIdss = $tradedLaunchpadIdssQue->pluck('image_id')->join(','); 

                $launchArr = $this->_launchpad_list(5,$tradedLaunchpadIdss,"1");
                $stock_prc = array();
                 
                foreach ($launchArr as $key1 => $row1)
                {
                    $stock_percent = $row1['calculated_stock_exchange_price']['stock_in_percent'];
                    $stock_prc[$key1] = $stock_percent;
                }
                array_multisort($stock_prc, SORT_DESC, $launchArr);
            }else{
                $launchArr = [];
            }
             
        $data['my_holdings_list'] = $launchArr; 
        return $this->success("portfolio_dashboard",$data);
    }
 

    public function view_all_launchpad_list(Request $request){

        $auth_dt = Auth::user();
        $user_id = Auth::id();

        $getAccount = User::where('id',$user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1';

        $data = []; 

        if($request->filter_by=="search" && isset($request->search_text)){
            $search_txt = $request->search_text;

            $LaunchpadIdss = Lauchpaid::where('launch_sketch', 'like', $search_txt.'%')->where('launc_paid_type',$user_account_type)->pluck('id')->join(',');

            $data['launchpad_list'] = $this->_launchpad_list("",$LaunchpadIdss,"");
        }else{
            $data['launchpad_list'] = $this->_launchpad_list("","","");  
        }    
        return $this->success("View All Images",$data);
    }

    public function launchpad_dashboard(Request $request){

        $auth_user_id = Auth::id();

        $getAccount = User::where('id',$auth_user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1'; 

        $data = []; 

        $getMyLaunchPadData = Lauchpaid::
        leftjoin('users','users.id','=','launchpaid.created_by')->
        where(['launc_paid_type'=>$user_account_type])->
        where('user_id',$auth_user_id)->get(['launchpaid.id','launch_image','launch_sketch','launch_designation','total_img_quanity','total_img_sell as price','approve_status','users.name as created_user'])->toArray();
        // approve_status (1==pending , 2 => approved , 3 => rejected   )

        $data['launchpad_list'] = $getMyLaunchPadData;    

        return $this->success("Launchpad Dashboard",$data);
    }

    public function launchpad_ico_images(Request $request){

        $auth_user_id = Auth::id();
        $getAccount = User::where('id',$auth_user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1';

        $data = []; 
 
        $getMyLaunchPadData = Lauchpaid::
        leftjoin('launch_paid_data','launch_paid_data.launch_id','=','launchpaid.id')->
        orderBy('launchpaid.id','desc')->where('launchpaid.approve_status',2)->
        where('launchpaid.launch_status',2)->
        where(['launchpaid.launc_paid_type'=>$user_account_type])->
        get(['launchpaid.id','launchpaid.launch_image','launchpaid.launch_sketch','launchpaid.launch_designation','launch_paid_data.img_quanity','launch_paid_data.img_offered','launch_paid_data.img_sell as price','launch_paid_data.start_date','launch_paid_data.end_date','launch_paid_data.participant']);
         

        $data['launchpad_list'] = $getMyLaunchPadData;    

        return $this->success("Launchpad Dashboard",$data);
    }

    public function manage_launchpad_images(){ 
 
        $user_id = Auth::id();
        $getAccount = User::where('id',$user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1'; 

        $data = [];
   
        $LaunchpadIdss = Lauchpaid::where('user_id',$user_id)->where(['launc_paid_type'=>$user_account_type])->pluck('id')->join(',');

        $data['launchpad_list'] = $this->_launchpad_list("",$LaunchpadIdss,"");
   
        return $this->success("Manage Launchpad Images",$data);
    }
 

    public function click_to_launch(Request $request)
    {   
        $data = [];
        try{
            $validator = Validator::make($request->all(),[
                'launchpad_id'=>'required',
                'package_id'=>'required',
                'start_date' => 'required',
                'end_date' => 'required',
                'image_quantity' => 'required',
                'image_offered' => 'required',
                'image_selling_price' => 'required'
               ]) ;

            if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }

            $id = $request->launchpad_id;
            $findLauncher = Lauchpaid::find($id);
            if(empty($findLauncher))
            {
                return $this->failure('Wrong Launch Paid');
            }

            $findPackage = \App\Models\Package::find($request->package_id);

            if(empty($findPackage))
            {
                return $this->failure('Wrong Package');
            }

            $findAlreadyPurchase = BuyPackages::where('is_purchased',2)->where([
                'lauch_id'=>$id,
                'package_id'=>$request->package_id,
                'user_id'=>$findLauncher->user_id,
            ])->first();
            if(!empty($findAlreadyPurchase))
            {
                return $this->failure('Already Purchased this Package');
            }

            $buyPack = new BuyPackages;
            $buyPack->user_id = $findLauncher->user_id;
            $buyPack->lauch_id = $findLauncher->id; // launcher
            $buyPack->package_id = $findPackage->id; // package
            $buyPack->quanity = $findPackage->quantity;
            $buyPack->price = $findPackage->price;
            $buyPack->is_purchased = 2;
            if($buyPack->save())
            {
                 // Add new Addon LaunchPaid
                $launch_paid_data = new LaunchpaidData;
                $launch_paid_data->launch_id = $id;
                $launch_paid_data->img_quanity = $request->image_quantity;
                $launch_paid_data->img_offered = $request->image_offered;
                $launch_paid_data->img_sell = $request->image_selling_price;
                $launch_paid_data->start_date = $request->start_date;;
                $launch_paid_data->end_date = $request->end_date;
                if($launch_paid_data->save())
                {
                    $totalQuantity = LaunchpaidData::where('launch_id',$id)->sum('img_quanity');
                    $totalOffered = LaunchpaidData::where('launch_id',$id)->sum('img_offered');
                    $totalSell = LaunchpaidData::where('launch_id',$id)->sum('img_sell');

                    /// update on parent table total
                    $findLauncher->total_img_quanity = $totalQuantity;
                    $findLauncher->total_img_offered = $totalOffered;
                    $findLauncher->total_img_sell = $totalSell;
                    $findLauncher->package_id = $findPackage->id;
                    $findLauncher->start_date = $launch_paid_data->start_date;
                    $findLauncher->end_date = $launch_paid_data->end_date;
                    $findLauncher->remaining_qty = $totalQuantity;
                    $findLauncher->live_image_price = $totalSell;
                    $findLauncher->launch_status = 2; /// launch paid status
                    $findLauncher->save();
                     
                    return $this->success("Launch Paid Successfully Launched",$data);
                }
            }
            return $this->failure('Something Went Wrong!');

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function _upcomming_launchpad_list(){
 
        $auth_user_id = Auth::id();
        $todayDate = date('Y-m-d');

        $getAccount = User::where('id',$auth_user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1';

        $listQuery = Lauchpaid::where(['approve_status'=>2]); 
        
        $listQuery->where('launc_paid_type',$user_account_type);

        $list = $listQuery->whereDate('start_date','>',$todayDate)->orderBy('live_image_price','asc')->get();

        $data = [];
        if(!empty($list))
        {
            foreach($list as $key =>$val)
            {   
                $calculated_price = $this->_calculate_stock_exchange_price($val->id,""); 
                
                $GetlanchStockBuy = StockExchange::select(DB::raw('count("lauch_id") as launch_buy_count'))
                ->groupBy('lauch_id')
                ->orderBy('launch_buy_count', 'desc')
                ->where(['type'=>1,'lauch_id'=>$val->id])->first(['launch_buy_count']);

                $row = [];
                $row['launchpad_id'] = $val->id;
                $row['launch_image'] = $val->launch_image;
                $row['launch_sketch'] = $val->launch_sketch;
                $row['launch_designation'] = $val->launch_designation; 
                $row['launc_paid_type'] = $val->launc_paid_type;
                $row['image_offered'] = $val->total_img_quanity;
                $row['sale_price'] = $val->total_img_sell;

                $row['start_date'] = $val->start_date;
                $row['end_date'] = $val->end_date;

                $data[] = $row;
            }
        }
        return $data;
    }

    public function _launchpad_list($limit="",$where_innn="",$is_auth=""){

        $auth_user_id = Auth::id();
        $todayDate = date('Y-m-d');

        $getAccount = User::where('id',$auth_user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1';
        
        $listQuery = Lauchpaid::leftjoin('launch_paid_data','launch_paid_data.launch_id','=','launchpaid.id')->
        where(['launchpaid.approve_status'=>2]);

        $listQuery->where('launchpaid.launc_paid_type',$user_account_type);


        if($where_innn !=""){
            $launchPad_idsArr = explode(',',$where_innn);

            $listQuery->whereIn('launchpaid.id',$launchPad_idsArr); 
        }
        
        if($limit!=""){
            $listQuery->limit(5);
        }
        $list = $listQuery->orderBy('launchpaid.live_image_price','asc')->get(['launchpaid.*']);
         
        $data = [];
        if(!empty($list))
        {
            foreach($list as $key =>$val)
            {   
                $calculated_price = $this->_calculate_stock_exchange_price($val->id,$is_auth); 
                
                $GetlanchStockBuy = StockExchange::select(DB::raw('count("lauch_id") as launch_buy_count'))
                ->groupBy('lauch_id')
                ->orderBy('launch_buy_count', 'desc')
                ->where(['type'=>1,'lauch_id'=>$val->id])->first(['launch_buy_count']);

                
                $checkLikedCount = LikeLaunchpad::where(['user_id' => $auth_user_id,'launchpad_id' => $val->id])->count();
                $is_liked = ($checkLikedCount>0) ? '1' : '0';

                $getUser = User::find($val->user_id);
                $user_name = (isset($getUser->name)) ? $getUser->name : "";

                $row = [];
                $row['launchpad_id'] = $val->id;
                $row['launc_paid_type'] = $val->launc_paid_type;
                $row['quantity'] = $val->quantity;
                $row['launch_image'] = $val->launch_image;
                $row['launch_sketch'] = $val->launch_sketch;
                $row['launch_designation'] = $val->launch_designation;
                $row['calculated_stock_exchange_price'] = $calculated_price;
                $row['launch_buy_count'] = $GetlanchStockBuy->launch_buy_count ?? '0';
                $row['is_liked'] = $is_liked;
                $row['created_by'] = $user_name;
                $data[] = $row;
            }
        }
        return $data;
    }


    public function _calculate_stock_exchange_price($launchpad_id,$is_auth){

        $getLaunch_pad = Lauchpaid::where('id',$launchpad_id)->first(['live_image_price']);

        $todayDate = date('Y-m-d');
        // status = 1 success check on issue faces
        $getLastDayClosedPrice = StockExchange::where(['status'=>'1','type'=>'1','lauch_id'=>$getLaunch_pad->id])->whereDate('created_at','<',$todayDate)->orderBy('id','desc')->first(['price']);
                
        if(isset($getLastDayClosedPrice->price) )
            $prev_day_closed_price = $getLastDayClosedPrice->price;
        else
            $prev_day_closed_price = $getLaunch_pad->live_image_price;

        $getLaunchPadCUrrentPrice = StockExchange::where(['type'=>'1','lauch_id'=>$getLaunch_pad->id])->whereDate('created_at',$todayDate)->orderBy('id','desc')->first(['price','quantity']);
        
        if(isset($getLaunchPadCUrrentPrice->price))
            $buy_stock_price = $getLaunchPadCUrrentPrice->price;
        else
            $buy_stock_price = $getLaunch_pad->live_image_price;

        $buy_stock_qty = $getLaunch_pad->quantity ?? '1';
        $total_purchased_price = $buy_stock_qty*$buy_stock_price;

        $today_difference = $buy_stock_price - $prev_day_closed_price;

        if($today_difference>0)
            $today_stock_in_percent = ($today_difference*100)/$prev_day_closed_price;
        else
            $today_stock_in_percent = 0;


        $row = [];

        $row['up_down_status']=($today_difference>=0) ? "up" : "down";

        $row['prev_day_closed_price'] = $prev_day_closed_price;
        $row['current_price'] = $buy_stock_price;
        $row['stock_in_percent'] = $today_stock_in_percent; 

        $row['buy_stock_qty'] = $buy_stock_qty; 
        $row['buy_stock_price'] = $buy_stock_price; 
        $row['total_purchased_price'] = $total_purchased_price; 

        return $row;
 
    }

    public function _calculate_portfolio_stock_exchange_price($launchpad_id,$is_auth){

        $getLaunch_pad = Lauchpaid::where('id',$launchpad_id)->first(['live_image_price']);

        $todayDate = date('Y-m-d');
        $auth_user_id = Auth::id();
 
        $current_price = $getLaunch_pad->live_image_price;

        $getLaunchPadCUrrentPrice = TradingPortfolio::orderBy('id','desc')->where(['user_id'=>$auth_user_id,'image_id'=>$launchpad_id])->first(['price','quantity']);
 
        $buy_stock_price = $getLaunchPadCUrrentPrice->price;
        $buy_stock_qty = $getLaunchPadCUrrentPrice->quantity ?? '1';
        $total_purchased_price = $buy_stock_qty*$buy_stock_price;

        $today_difference = $buy_stock_price - $current_price;

        if($today_difference>0)
            $today_stock_in_percent = ($today_difference*100)/$current_price;
        else
            $today_stock_in_percent = 0;


        $row = [];

        $row['up_down_status']=($today_difference>=0) ? "up" : "down";

        $row['prev_day_closed_price'] = $current_price;
        $row['current_price'] = $buy_stock_price;
        $row['stock_in_percent'] = $today_stock_in_percent; 

        $row['buy_stock_qty'] = $buy_stock_qty; 
        $row['buy_stock_price'] = $buy_stock_price; 
        $row['total_purchased_price'] = $total_purchased_price; 

        return $row;
 
    }

    public function _my_over_all_calculate_stock_exchange_price(){

        $userid = Auth::id(); 
            
        $getAccount = User::where('id',$userid)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1'; 

        $todayDate = date('Y-m-d');
        // status = 1 success check on issue faces
  
        $getTradeDt = StockExchange::leftjoin('launchpaid','launchpaid.id','=','stock_exchange.lauch_id')->select(DB::raw('sum("stock_exchange.quantity*stock_exchange.price") as total_investment, sum("stock_exchange.live_price") as total_live_price'))->where(['stock_exchange.status'=>'successful','stock_exchange.user_id'=>$userid])->where(['launchpaid.launc_paid_type'=>$user_account_type])->groupBy('stock_exchange.user_id')->first(['total_investment,total_live_price']);
        
        $total_investment = $getTradeDt->total_investment ?? '0';
        $current_trade_price = $getTradeDt->total_live_price ?? '0';

        $today_difference = $current_trade_price - $total_investment;

        if($today_difference>0)
            $today_stock_in_percent = ($today_difference*100)/$total_investment;
        else
            $today_stock_in_percent = 0;
 
        $row = [];
        $row['up_down_status']=($today_difference>=0) ? "up" : "down";
        $row['investment_amount'] = $total_investment;
        $row['current_value'] = $current_trade_price;
        $row['our_profit_in_price'] = $today_difference; 
        $row['our_profit_in_percent'] = $today_stock_in_percent; 
        $row['balance_used'] = $total_investment;

        return $row; 
    }

    public function _package_list(){
        $list = Package::where('status',1)->latest()->get();
        $data = [];
        if(!empty($list))
        {
            foreach($list as $key =>$val)
            {
                $row = [];
                $row['pack_id'] = $val->id;
                $row['quantity'] = $val->quantity;
                $row['price'] = $val->price;
                $row['details'] = $val->description;
                $data[] = $row;
            }
        }
        return $data;
    }

    public function userInfo(){
        $userid = auth::user()->id;
        $info = User::find($userid);
        return $info;
    }

    public function kycCheck($user){

        $stepOfForm = \App\Models\Video::stepOfForm($user);;
        if($stepOfForm['stepNo'] == 6)
        {
            $data['kycStatus'] = 1;
            $data['emailVerified'] = $stepOfForm['is_email_verified'];
            $data['kycStatusName'] = $stepOfForm['stepName'];

        }else{
            $data['kycStatus'] = 0;
            $data['emailVerified'] = $stepOfForm['is_email_verified'];
            $data['kycStatusName'] = $stepOfForm['stepName'];
        }

        return $data;

    }

    public function _video_list(){
        $list = Video::where('status',1)->latest()->get();
        $data = [];
        if(!empty($list))
        {
            foreach($list as $key =>$val)
            {
                $row = [];
                $row['id'] = $val->id;
                $row['title'] = $val->title;
                $row['image'] = $val->image ?? '';
                $row['youtube_link'] = $val->youtube_link ?? '';
                $row['description'] = $val->description ?? '';
                $data[] = $row;
            }
        }
        return $data;
    }

    public function banners(){
        $list = \App\Models\Banner::where('status',1)->latest()->get();
        $data = [];
        if(!empty($list))
        {
            foreach($list as $key =>$val)
            {
                $row = [];
                $row['image'] = $val->image;
                $row['id'] = $val->id;
                $data[] = $row;
            }
        }
        return $data;
    }

}
