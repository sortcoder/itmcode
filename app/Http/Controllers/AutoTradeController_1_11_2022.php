<?php

namespace App\Http\Controllers;
   
use Illuminate\Http\Request;
use DB;
use Mail; 
use Carbon\Carbon;
 
use App\Models\IcoBuyApplication;
use App\Models\StockExchange;
use App\Models\User;
use App\Models\TradingPortfolio;
use App\Models\TradeTransaction;
use App\Models\Lauchpaid;

class AutoTradeController extends Controller
{ 
    public function index(Request $request)
    {  
        $dt = Carbon::now();
        $getApp = IcoBuyApplication::orderBy('id','desc')->whereDate('start_date', '>=', $dt)->whereDate('end_date', '<=', $dt)->where('is_processed','0')->get(); 
        
        // ex = DB::table('gallery')->inRandomOrder()->get();
        // $getApp = IcoBuyApplication::orderBy('id','desc')->where('is_processed','0')->get();
  
        foreach($getApp as $ico_val){
            $user_id = $ico_val->user_id;
            $lauch_id = $ico_val->launch_id;
            $quantity = $ico_val->quantity; 
            $price = $ico_val->total_price; 
            $type = 'buy';

            $getAccount = User::where('id',$user_id)->first(['account_type']);
            $user_account_type = $getAccount->account_type ?? '1'; 
 

            $st_row = new StockExchange;
            $st_row->user_id = $user_id;
            $st_row->lauch_id = $lauch_id;
            $st_row->price = $price;
            $st_row->type = $type;              
            $st_row->quantity = $quantity; 
            $st_row->remaining_qty = $quantity;
            $st_row->save();       
            $inserted_stock_ex_id = $st_row->id;
 
            
            if($type=="buy"){

                $getBuyRec = TradingPortfolio::where(['user_id'=>$user_id,'image_id'=>$lauch_id])->first();
                if(isset($getBuyRec->id)){
 
                    $req_up_qty = $getBuyRec->quantity+$quantity;
                    $req_up_price = $getBuyRec->price+$price;

                    $tot_up_price = ($price*$quantity)+$getBuyRec->total_price;

                    $rec_upd = [
                        'quantity' => $req_up_qty,
                        'price'=>$req_up_price,
                        'total_price'=>$tot_up_price,
                    ];
                    TradingPortfolio::where(['id' => $getBuyRec->id])->update($rec_upd);

                }else{
                    $st_port_row = new TradingPortfolio;
                    $st_port_row->user_id = $user_id;
                    $st_port_row->image_id = $lauch_id;
                    $st_port_row->quantity = $quantity;  
                    $st_port_row->price = $price;  
                    $st_port_row->total_price = $price*$quantity;  
                    $st_port_row->save();     
                }
            } 
            $req_qty = $quantity;
            $traded_qty = '0';

            $check_BuySell_type_in_record = ($type=="buy") ? "sell" : 'buy';

            $checkStExQuery = StockExchange::orderBy('id','asc')->where(['lauch_id'=>$lauch_id,'type'=>$check_BuySell_type_in_record,'status'=>"pending"])->where('user_id', '!=', $user_id);  

            if($type=="buy")
                $checkStExQuery->where('price', '<=', $price);
            else if($type=="sell"){
               $checkStExQuery->where('price', '>=', $price);
            }

            $stock_tbl = $checkStExQuery->where('remaining_qty', '>', '0')->get();

            foreach($stock_tbl as $st_val)
            {    

                if(isset($st_val->id) && $st_val->price<=$price){
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

                        $first_buyer_stockDt = StockExchange::where(['lauch_id' =>$lauch_id,'user_id'=>$first_buy_userID,'type'=>'buy'])->first(['id','user_id','price']);

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
  
            $this->_launchpad_live_price_update_on_sell($lauch_id); 
            if($type=="buy"){                
                $this->_trade_sell_status_update($user_id,$lauch_id,$quantity); 
            }

            IcoBuyApplication::where(['id' => $ico_val->id])->update(['is_processed' => '1']);
        } 

        return $this->success(ucfirst($request->type)." request send successfully ",$data);
    } 

    public function _update_wallet_and_portfolio_sell($user_id="",$live_tot_price="",$first_buy_user_id="",$lauch_id="",$traded_qty=""){
    
        $getAccount = User::where('id',$user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1'; 

        /*if($user_account_type=='1')  // this is already done in Buy ICO order 
            User::where('id',$user_id)->decrement('tradding_demo_wallet', $live_tot_price);
        else
            User::where('id',$user_id)->decrement('tradding_live_wallet', $live_tot_price);*/

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

    public function _launchpad_live_price_update_on_sell($lauch_id=""){
        if($lauch_id!=""){
            $updatefor_livePrice = StockExchange::orderBy('price','desc')->where(['lauch_id'=>$lauch_id,'status'=>"successful"])->first(['price']);

            if(isset($updatefor_livePrice->price)){ 
                Lauchpaid::where('id',$lauch_id)->update(['live_image_price'=>$updatefor_livePrice->price]);        
            }
        }
        return '1';
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
}
