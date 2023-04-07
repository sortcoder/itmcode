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
    public function index()
    {  

        $getAllTodayLounch = Lauchpaid::where("end_date", date("Y-m-d"))->where("remaining_qty", "!=", 0)->get();
        
        foreach ($getAllTodayLounch as $key => $val) {
            $getApp = IcoBuyApplication::where("launch_id", $val->id)->where('is_processed', '0')->get();
            foreach ($getApp as $val1) {
                $st_row = new StockExchange();
                $st_row->user_id = $val1->user_id;
                $st_row->lauch_id = $val1->launch_id;
                $st_row->price = $val1->per_image_price;
                $st_row->type = "buy";
                $st_row->quantity = $val1->quantity;
                $st_row->remaining_qty = 0;
                $st_row->status = "successful";

                $st_row->save();

                $st_port_row = new TradingPortfolio();
                $st_port_row->user_id = $val1->user_id;
                $st_port_row->image_id = $val1->launch_id;
                $st_port_row->quantity = $val1->quantity;
                $st_port_row->price = $val1->per_image_price;
                $st_port_row->is_remaining_buy = 0;
                $st_port_row->total_price = $val1->per_image_price * $val1->quantity;
                $st_port_row->save();
                $remain = $val->remaining_qty - $val1->quantity;

                Lauchpaid::where("id", $val->id)->update(["remaining_qty" => $remain]);
                IcoBuyApplication::where("id", $val1->id)->update(["is_processed" => 1]);
            }
            $checkRemain = Lauchpaid::find($val->id);

            if ($checkRemain->remaining_qty > 0) {

                $st_row = new StockExchange();
                $st_row->user_id = $checkRemain->user_id;
                $st_row->lauch_id = $checkRemain->id;
                $st_row->price = $checkRemain->total_img_sell;
                $st_row->type = "buy";
                $st_row->quantity = $checkRemain->remaining_qty;
                $st_row->remaining_qty = 0;
                $st_row->status = "successful";
                $st_row->save();

                $st_port_row = new TradingPortfolio();
                $st_port_row->user_id = $checkRemain->user_id;
                $st_port_row->image_id = $checkRemain->id;
                $st_port_row->quantity = $checkRemain->remaining_qty;
                $st_port_row->price = $checkRemain->total_img_sell;
                $st_port_row->is_remaining_buy = 1;
                $st_port_row->total_price = $checkRemain->total_img_sell * $checkRemain->remaining_qty;
                
                // $st_port_row->total_price = $checkRemain->total_img_sell * $checkRemain->total_img_offered;
                
                $st_port_row->save();
                $remain = 0;

                Lauchpaid::where("id", $val->id)->update(["remaining_qty" => $remain]);
            }

            IcoBuyApplication::where(['id' => $val->id])->update(['is_processed' => '1']);
        }
    }
    public function indexOld(Request $request)
    {
        $data = [];
        $dt = Carbon::now();
        $getApp = IcoBuyApplication::orderBy('id', 'desc')->whereDate('start_date', '>=', $dt)->whereDate('end_date', '<=', $dt)->where('is_processed', '0')->get();

        // dd($getApp);
        // ex = DB::table('gallery')->inRandomOrder()->get();
        // $getApp = IcoBuyApplication::orderBy('id','desc')->where('is_processed','0')->get();

        foreach ($getApp as $ico_val) {
            $user_id = $ico_val->user_id;
            $lauch_id = $ico_val->launch_id;
            $quantity = $ico_val->quantity;
            $price = $ico_val->total_price;
            $type = 'buy';

            $getAccount = User::where('id', $user_id)->first(['account_type']);
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


            if ($type == "buy") {

                $getBuyRec = TradingPortfolio::where(['user_id' => $user_id, 'image_id' => $lauch_id])->first();
                if (isset($getBuyRec->id)) {

                    $req_up_qty = $getBuyRec->quantity + $quantity;


                    $tot_up_price = ($price * $quantity) + $getBuyRec->total_price;
                    $req_up_price = $tot_up_price / $req_up_qty;
                    $rec_upd = [
                        'quantity' => $req_up_qty,
                        'price' => $req_up_price,
                        'total_price' => $tot_up_price,
                    ];
                    TradingPortfolio::where(['id' => $getBuyRec->id])->update($rec_upd);
                } else {
                    $st_port_row = new TradingPortfolio;
                    $st_port_row->user_id = $user_id;
                    $st_port_row->image_id = $lauch_id;
                    $st_port_row->quantity = $quantity;
                    $st_port_row->price = $price;
                    $st_port_row->total_price = $price * $quantity;
                    $st_port_row->save();
                }
            }
            $req_qty = $quantity;
            $traded_qty = '0';

            $check_BuySell_type_in_record = ($type == "buy") ? "sell" : 'buy';

            $checkStExQuery = StockExchange::orderBy('id', 'asc')->where(['lauch_id' => $lauch_id, 'type' => $check_BuySell_type_in_record, 'status' => "pending"])->where('user_id', '!=', $user_id);

            if ($type == "buy")
                $checkStExQuery->where('price', '<=', $price);


            $stock_tbl = $checkStExQuery->where('remaining_qty', '>', '0')->get();

            foreach ($stock_tbl as $st_val) {

                if (isset($st_val->id) && $st_val->price <= $price) {
                    if ($req_qty >= $st_val->remaining_qty) {
                        StockExchange::where(['id' => $st_val->id])->update(['remaining_qty' => '0', 'status' => "successful"]);
                        $req_qty = $req_qty - $st_val->remaining_qty;

                        $traded_qty = $st_val->remaining_qty;
                        $is_record_need_to_update = '1';
                    } else if ($st_val->remaining_qty > $req_qty) {
                        $crr = $st_val->remaining_qty - $req_qty;
                        StockExchange::where(['id' => $st_val->id])->update(['remaining_qty' => $crr]);

                        $traded_qty = $req_qty;
                        $is_record_need_to_update = '1';
                    }

                    if ($is_record_need_to_update == '1' && $traded_qty > 0) {

                        $from_stock_exch_id = $st_val->id;
                        $to_stock_exch_id = $inserted_stock_ex_id;

                        $live_price_for_launchpad = $st_val->price;

                        $get_from_stock_dt = StockExchange::where(['id' => $from_stock_exch_id])->first(['user_id']);
                        $first_buy_userID = $get_from_stock_dt->user_id;

                        $first_buyer_stockDt = StockExchange::where(['lauch_id' => $lauch_id, 'user_id' => $first_buy_userID, 'type' => 'buy'])->first(['id', 'user_id', 'price']);

                        $first_buy_user_id = $first_buyer_stockDt->user_id;
                        $first_buying_price = $first_buyer_stockDt->price;
                        $selling_price = $st_val->price;

                        $is_profit = '0';  // for loss
                        $profit_amt = '0';
                        $profit_in_percent = '0';

                        $profit_amt = ($selling_price - $first_buying_price) * $traded_qty;

                        if ($selling_price > $first_buying_price) { // for Profit
                            $profit_in_percent = ($profit_amt) * 100 / ($live_price_for_launchpad * $traded_qty);
                            $is_profit = '1';
                        } else if ($selling_price < $first_buying_price) { // for Loss 

                            $profit_in_percent = (($selling_price / $first_buying_price) * 100) - 100;
                            $is_profit = '2';
                        }

                        $live_tot_price = $live_price_for_launchpad * $traded_qty;

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
                        $row2->status = "successful";

                        $row2->is_profit_or_loss = $is_profit;
                        $row2->profit_in_amount = $profit_amt;
                        $row2->profit_in_percent = $profit_in_percent;

                        $row2->save();

                        // Updating wallet & Portfolio
                        $this->_update_wallet_and_portfolio_sell($user_id, $live_tot_price, $first_buy_user_id, $st_val->lauch_id, $traded_qty);

                        $this->_manage_stock_exch_history($from_stock_exch_id, $to_stock_exch_id);
                    }
                }
            }

            $this->_launchpad_live_price_update_on_sell($lauch_id);
            if ($type == "buy") {
                $this->_trade_sell_status_update($user_id, $lauch_id, $quantity);
            }

            IcoBuyApplication::where(['id' => $ico_val->id])->update(['is_processed' => '1']);
        }

        // Reverse Process for our remain qty holdings 
        $this->_reverse_process_on_remain_qty_holding();

        return $this->success("Order placed successfully ", $data);
    }



    public function _reverse_process_on_remain_qty_holding()
    {

        $dt = Carbon::now();

        $stock_tbl_2 = Lauchpaid::leftjoin('stock_exchange', 'stock_exchange.lauch_id', '=', 'launchpaid.id')->where(['launchpaid.approve_status' => 2, 'stock_exchange.type' => "buy", 'stock_exchange.status' => "pending"])->whereDate('launchpaid.end_date', '<=', $dt)->where('stock_exchange.remaining_qty', '>', '0')->get(['stock_exchange.*']);


        foreach ($stock_tbl_2 as $st_val_2) {
            $user_id = $st_val_2->user_id;
            $st_lauch_id = $st_val_2->lauch_id;
            $st_price = $st_val_2->price;
            $st_type = "sell";
            $st_quantity = $st_val_2->remaining_qty;

            $st_row_2 = new StockExchange;
            $st_row_2->user_id = $user_id;
            $st_row_2->lauch_id = $st_lauch_id;
            $st_row_2->price = $st_price;
            $st_row_2->type = $st_type;
            $st_row_2->quantity = $st_quantity;
            $st_row_2->remaining_qty = $st_quantity;
            $st_row_2->save();
            $inserted_stock_ex_id_2 = $st_row_2->id;

            $req_qty = $st_quantity;

            $stock_tbl_2 = StockExchange::orderBy('id', 'asc')->where(['lauch_id' => $st_lauch_id, 'type' => 'buy', 'status' => "pending"])->where('user_id', $user_id)->where('price', '>=', $st_price)->where('remaining_qty', '>', '0')->get();

            foreach ($stock_tbl_2 as $st_val_2) {


                $getBuyRec = TradingPortfolio::where(['user_id' => $user_id, 'image_id' => $st_lauch_id])->first();
                if (isset($getBuyRec->id)) { //for sale order

                    $req_up_qty = $getBuyRec->quantity + $st_quantity;
                    $req_up_price = $getBuyRec->price + $st_price;

                    $tot_up_price = ($price * $st_quantity) + $getBuyRec->total_price;

                    $rec_upd = [
                        'quantity' => $req_up_qty,
                        'price' => $req_up_price,
                        'total_price' => $tot_up_price,
                    ];
                    TradingPortfolio::where(['id' => $getBuyRec->id])->update($rec_upd);
                }


                if (isset($st_val_2->id) && $st_val_2->price <= $request->price) {

                    if ($req_qty >= $st_val_2->remaining_qty) {

                        StockExchange::where(['id' => $st_val_2->id])->update(['remaining_qty' => '0', 'status' => "successful"]);
                        $req_qty = $req_qty - $st_val_2->remaining_qty;

                        $traded_qty = $st_val_2->remaining_qty;
                        $is_record_need_to_update = '1';

                        $buy_more_from_launchpad_qty = $req_qty - $st_val_2->remaining_qty;

                        $getCheckRemainAvailLaunchQty = Lauchpaid::where('id', $st_lauch_id)->where('remaining_qty', '>', '0')->count();
                        if ($getCheckRemainAvailLaunchQty > 0) {
                            Lauchpaid::where('id', $request->lauch_id)->decrement('remaining_qty', $buy_more_from_launchpad_qty);
                        }
                    } else if ($st_val_2->remaining_qty > $req_qty) {
                        $crr = $st_val_2->remaining_qty - $req_qty;
                        StockExchange::where(['id' => $st_val_2->id])->update(['remaining_qty' => $crr]);

                        $traded_qty = $req_qty;
                        $is_record_need_to_update = '1';
                    }

                    if ($is_record_need_to_update == '1' && $traded_qty > 0) {
                        $from_stock_exch_id = $st_val_2->id;
                        $to_stock_exch_id = $inserted_stock_ex_id;

                        $live_price_for_launchpad = $st_val_2->price;

                        $get_from_stock_dt = StockExchange::where(['id' => $from_stock_exch_id])->first(['user_id']);
                        $first_buy_userID = $get_from_stock_dt->user_id;

                        $first_buyer_stockDt = StockExchange::where(['lauch_id' => $request->lauch_id, 'user_id' => $user_id, 'type' => 'buy'])->first(['id', 'user_id', 'price']);

                        $first_buy_user_id = $first_buyer_stockDt->user_id;
                        $first_buying_price = $first_buyer_stockDt->price;
                        $selling_price = $st_val_2->price;

                        $is_profit = '0';  // for loss
                        $profit_amt = '0';
                        $profit_in_percent = '0';

                        $profit_amt = ($selling_price - $first_buying_price) * $traded_qty;

                        if ($selling_price > $first_buying_price) { // for Profit
                            $profit_in_percent = ($profit_amt) * 100 / ($live_price_for_launchpad * $traded_qty);
                            $is_profit = '1';
                        } else if ($selling_price < $first_buying_price) { // for Loss 

                            $profit_in_percent = (($selling_price / $first_buying_price) * 100) - 100;
                            $is_profit = '2';
                        }

                        $live_tot_price = $live_price_for_launchpad * $traded_qty;

                        $row2 = new TradeTransaction;
                        $row2->first_buy_stock_exchange_id = $first_buyer_stockDt->id;
                        $row2->stock_exchange_id = $from_stock_exch_id;
                        $row2->first_buy_user_id = $first_buy_user_id;
                        $row2->user_id = $user_id;
                        $row2->image_id  = $st_val_2->lauch_id;
                        $row2->first_buy_price = $first_buying_price;
                        $row2->price = $selling_price;
                        $row2->quantity = $traded_qty;
                        $row2->type = $st_val_2->type;
                        $row2->live_price = $live_tot_price;
                        $row2->status = "successful";

                        $row2->is_profit_or_loss = $is_profit;
                        $row2->profit_in_amount = $profit_amt;
                        $row2->profit_in_percent = $profit_in_percent;

                        $row2->save();

                        // Updating wallet & Portfolio
                        $this->_update_wallet_and_portfolio_sell($user_id, $live_tot_price, $first_buy_user_id, $st_val_2->lauch_id, $traded_qty);

                        $this->_manage_stock_exch_history($from_stock_exch_id, $to_stock_exch_id);
                    }
                }
            }
        }

        return $this->success("Holdings processed successfully");
    }




    // Common functions //////////////////////////

    public function _update_wallet_and_portfolio_sell($user_id = "", $live_tot_price = "", $first_buy_user_id = "", $lauch_id = "", $traded_qty = "")
    {

        $getAccount = User::where('id', $user_id)->first(['account_type']);
        $user_account_type = $getAccount->account_type ?? '1';

        /*if($user_account_type=='1')  // this is already done in Buy ICO order 
            User::where('id',$user_id)->decrement('tradding_demo_wallet', $live_tot_price);
        else
            User::where('id',$user_id)->decrement('tradding_live_wallet', $live_tot_price);*/

        $getPorfolioRec = TradingPortfolio::where(['user_id' => $first_buy_user_id, 'image_id' => $lauch_id])->first();
        if (isset($getPorfolioRec->id)) {
            $req_up_qty = $getPorfolioRec->quantity - $traded_qty;
            $port_price = $getPorfolioRec->price;

            $req_up_price = $port_price * $req_up_qty;

            $rec_upd = [
                'quantity' => $req_up_qty,
                'price' => $port_price,
                'total_price' => $req_up_price * $req_up_qty,
            ];
            TradingPortfolio::where(['id' => $getPorfolioRec->id])->update($rec_upd);

            $checkAllSold = TradingPortfolio::where(['id' => $getPorfolioRec->id])->first(['quantity']);
            if ($checkAllSold->quantity == 0) {
                TradingPortfolio::where(['id' => $getPorfolioRec->id])->delete();
            }
        }
    }

    public function _manage_stock_exch_history($from_stock_exch_id = "", $to_stock_exch_id = "")
    {

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

    public function _launchpad_live_price_update_on_sell($lauch_id = "")
    {
        if ($lauch_id != "") {
            $updatefor_livePrice = StockExchange::orderBy('price', 'desc')->where(['lauch_id' => $lauch_id, 'status' => "successful"])->first(['price']);

            if (isset($updatefor_livePrice->price)) {
                Lauchpaid::where('id', $lauch_id)->update(['live_image_price' => $updatefor_livePrice->price]);
            }
        }
        return '1';
    }

    public function _trade_sell_status_update($user_id = "", $lauch_id = "", $req_qty = "")
    {

        $getTradeTblDt = TradeTransaction::select(DB::raw('sum(quantity) as total_sell_quantity'), 'stock_exchange_id')->orderBy('id', 'asc')->where(['user_id' => $user_id, 'image_id' => $lauch_id])->groupBy('image_id')->get(['stock_exchange_id,total_sell_quantity']);

        $new_ad_remain_qty = $req_qty;
        $remainnn_qty = 0;

        foreach ($getTradeTblDt as $trad_avail) {
            $getCheckStockDt2  = StockExchange::where(['id' => $trad_avail->stock_exchange_id])->first(['id', 'quantity', 'remaining_qty']);
            if ($getCheckStockDt2->quantity == $trad_avail->total_sell_quantity) {
                StockExchange::where(['id' => $trad_avail->stock_exchange_id])->update(['status' => "successful"]);
            }
        }
    }



    protected function success($message, $data = [], $status = 200)
    {
        return response([
            'status' => 'success',
            'code' => $status,
            'message' => $message,
            'data' => $data
        ]);
    }


    protected function failure($message, $data = [], $status = 422)
    {
        $status = 201;
        /*return response([
            'status'=>'error',
            'code'=>$status,
            'message'=>$message,
            'data'=>$data
        ]);*/

        return response([
            'status' => 'error',
            'code' => $status,
            'message' => $message
        ]);
    }
}
