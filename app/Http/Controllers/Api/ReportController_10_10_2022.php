<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use App\Models\User;
use Validator;
use Illuminate\Support\Facades\Hash;

use App\Models\TradeTransaction;
use App\Models\TradingPortfolio; 
use DB;
use PDF;
use Mail;
use Auth;

class ReportController extends Controller
{
    use ResponseWithHttpRequest;
    
    public function get_profit_loss_statement(Request $request) {
  
        $validator = Validator::make($request->all(),[
            'from_date' => 'required', 
            'to_date' => 'required', 
        ]);

       if($validator->fails())
        {
            return $this->failure($validator->errors()->first());
        }else    
        {     
            $data = [];

            $from_date = date('Y-m-d',strtotime($request->from_date));
            $to_date = date('Y-m-d',strtotime($request->to_date));

            $user_id = Auth::id();
            // $user_email = Auth::user()->email;
            $user_email = "manvendrajploft@gmail.com";

            $getUnrealizedTxnBuyDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->where(['user_trading_portfolio.user_id'=>$user_id])->whereBetween('user_trading_portfolio.created_at', [$from_date, $to_date])->get(['launchpaid.launch_sketch as launchpad_name','user_trading_portfolio.quantity','user_trading_portfolio.price','user_trading_portfolio.total_price','launchpaid.live_image_price']);

             
            $getRealizedTxnSoldDt = TradeTransaction::select(DB::raw(
                'launchpaid.launch_sketch as launchpad_name,
                sum(trading_transaction.first_buy_price) as total_buy_price,
                sum(trading_transaction.quantity) as sell_quantity,
                sum(trading_transaction.price) as sell_price,
                sum(trading_transaction.live_price) as total_sell_price,
                launchpaid.live_image_price
                '))
            ->leftjoin('launchpaid','launchpaid.id','=','trading_transaction.image_id')
            ->orderBy('trading_transaction.id','asc')->where(['trading_transaction.first_buy_user_id'=>$user_id])
            ->whereBetween('trading_transaction.created_at', [$from_date, $to_date])
            ->groupBy('image_id')->get();
          
            //$data["getRealizedTxnSoldDt"] = $getRealizedTxnSoldDt;

            $data["user_name"] = Auth::user()->name;
            $data["pancard_no"] = Auth::user()->pan_card_no;
            $data["period"] = $request->from_date." to ".$request->to_date;

            // $pdf = PDF::loadView('emails.myProfitLossPDF', $data); // generateing PDF

            $data["email"] = $user_email;
            $data["title"] = "ITM Money Profit And Loss Statement from ".$request->from_date." to ".$request->to_date; 

                /*$pdf = PDF::loadView('emails.myProfitLossPDF', $data);
         
                return $pdf->download('testt.pdf');*/

            /*Mail::send('emails.myProfitLossMail', $data, function($message)use($data, $pdf) {
                $message->to($data["email"], $data["email"])
                        ->subject($data["title"])
                        ->attachData($pdf->output(), "ProfitLossStatement".rand().".pdf");
            });*/

            return $this->success("P&L report send successfully,Please check your email ");

        }

    }

    
    
}

