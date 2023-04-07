<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lauchpaid;
use App\Models\TradeTransaction;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\StockExchange;
use App\Models\Wallet;
use App\Models\LikeLaunchpad;
use App\Models\TradingPortfolio;
use DB;

class PortfolioController extends Controller
{
    use ResponseWithHttpRequest;

    public function __construct(){
      
    }
    public function index(Request $request,$id="")
    {       
        if($request->ajax())
        {   
            $id = $request->user_id; 

            $getAccount = User::where('id',$id)->first(['account_type']);
            $user_account_type = $getAccount->account_type ?? '1'; 

            $getTradeDtArr = TradingPortfolio::where(['user_id'=>$id])->pluck('image_id');
            
            $listQuery = StockExchange::leftjoin('launchpaid','launchpaid.id','=','stock_exchange.lauch_id')->leftjoin('launch_paid_data','launch_paid_data.launch_id','=','launchpaid.id')->orderBy('launchpaid.live_image_price','asc'); 
            
            $data_list = $listQuery->whereIn('launchpaid.id',$getTradeDtArr)->where(['launchpaid.launc_paid_type'=>2,'stock_exchange.user_id'=>$id,'launchpaid.launc_paid_type'=>$user_account_type,'stock_exchange.type'=>'sell','stock_exchange.status'=>'successful'])->groupBy('stock_exchange.lauch_id')->get(['launchpaid.*','stock_exchange.type','stock_exchange.id as stock_id']);

         
            return Datatables::of($data_list)
               ->addIndexColumn()
               ->addColumn('stock_id', function($row){
                       return $row->stock_id;
               }) 
                ->addColumn('launch_sketch', function($row){
                    return $row->launch_sketch;
                }) 
                ->addColumn('launch_image', function($row){ 
                    if(isset($row->launch_image)){
                        return '<a href="'.asset($row->launch_image).'" target="_blank">
                                    <img src="'.asset($row->launch_image).'" style="width: 50px;" />
                                </a>';
                    }else{
                        return '<a href="'.url('assets/admin/images/noimage.png').'" target="_blank">
                                    <img src="'.url('assets/admin/images/noimage.png').'" style="width: 50px;" />
                                </a>';
                    }
                }) 
               ->addColumn('prev_day_closed_price', function($row) use($id){ 
                    $getTradeDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->
                        select(DB::raw('sum(user_trading_portfolio.quantity*user_trading_portfolio.price) as total_investment, sum(launchpaid.live_image_price*user_trading_portfolio.quantity) as total_live_price,user_trading_portfolio.quantity,user_trading_portfolio.price,launchpaid.live_image_price'))->
                        where(['user_trading_portfolio.user_id'=>$id,'image_id'=>$row->id])->first();

                    return  config('app.currency').$getTradeDt->live_image_price;
                })
                ->addColumn('buy_stock_qty', function($row) use($id){

                    $getTradeDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->
                        select(DB::raw('sum(user_trading_portfolio.quantity*user_trading_portfolio.price) as total_investment, sum(launchpaid.live_image_price*user_trading_portfolio.quantity) as total_live_price,user_trading_portfolio.quantity,user_trading_portfolio.price'))->
                        where(['user_trading_portfolio.user_id'=>$id,'image_id'=>$row->id])->first();
 
                    return config('app.currency').$getTradeDt->quantity;
                })
                ->addColumn('buy_stock_price', function($row) use($id){
                    
                    $getTradeDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->
                        select(DB::raw('sum(user_trading_portfolio.quantity*user_trading_portfolio.price) as total_investment, sum(launchpaid.live_image_price*user_trading_portfolio.quantity) as total_live_price,user_trading_portfolio.quantity,user_trading_portfolio.price'))->
                        where(['user_trading_portfolio.user_id'=>$id,'image_id'=>$row->id])->first();

                    return config('app.currency').$getTradeDt->price;
                }) 
                ->addColumn('total_purchased_price', function($row) use($id){

                    $getTradeDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->
                        select(DB::raw('sum(user_trading_portfolio.quantity*user_trading_portfolio.price) as total_investment, sum(launchpaid.live_image_price*user_trading_portfolio.quantity) as total_live_price,user_trading_portfolio.quantity,user_trading_portfolio.price,launchpaid.live_image_price'))->
                        where(['user_trading_portfolio.user_id'=>$id,'image_id'=>$row->id])->first();

                    $total_investment = $getTradeDt->price ?? '0'; //$getTradeDt->total_investment ?? '0';
                    $current_trade_price = $row->live_image_price ?? '0'; // $getTradeDt->total_live_price ?? '0';

                    $today_difference = $current_trade_price - $total_investment;
                     
                    if($total_investment>0)
                        $profit_stock_in_percent = ($today_difference*100)/$total_investment;
                    else
                        $profit_stock_in_percent = 0;
                    
                    $overall_return = $today_difference + $total_investment;
 
                    if($today_difference==0){
                        $is_up_down = "neutral";
                    }else if($today_difference>0){
                        $is_up_down = "up";
                    }else{
                        $is_up_down = "down";
                    } 

                    if($is_up_down=="up"){
                        // return $current_trade_price.', '.$total_investment;
                        return '<div class="cls_div" >
                               <p>'.config('app.currency').@$row->live_image_price.'  <i class="fa fa-arrow-up"></i><br/>
                               '.config('app.currency').@$today_difference .' ('.round($profit_stock_in_percent,2).'%)</p> 
                        </div>';
                    }else if($is_up_down=="down"){
                        return '<div class="cls_div"  style="background:red">
                                   <p>'.config('app.currency').@$row->live_image_price.'  <i class="fa fa-arrow-down"></i><br/>
                                   '.config('app.currency').@$today_difference .' ('.round($profit_stock_in_percent,2).'%)</p> 
                            </div>';
                    }else{
                        return '<div class="cls_div"  style="background:grey">
                                   <p>'.config('app.currency').@$row->live_image_price.'<br/>
                                   '.config('app.currency').@$today_difference .' ('.round($profit_stock_in_percent,2).'%)</p> 
                            </div>';
                    }

                    /*if($is_up_down=="up"){
                        return config('app.currency').'<span style="color: green; padding: 7px; text-align: center; font-weight: bold;" >'.$total_investment.' ('.round($profit_stock_in_percent,2).'% )</span>';
                    }else if($is_up_down=="down"){
                        return config('app.currency').'<span style="color: red; padding: 7px; text-align: center; font-weight: bold;" >'.$total_investment.' ('.round($profit_stock_in_percent,2).'% )</span>';
                    }else{
                        return config('app.currency').'<span style="padding: 7px; text-align: center; font-weight: bold;" >'.$total_investment.' ('.round($profit_stock_in_percent,2).'% )</span>';
                    }*/
                })  
                ->addColumn('created_by', function($row){
                    $getUser = User::find($row->created_by);
                    $user_name = (isset($getUser->name)) ? $getUser->name : "";
                    return $user_name;
                })
                ->editColumn("created_at",function($row){
                    return date("Y-m-d h:i A", strtotime($row->created_at));
                })
                ->rawColumns(['total_purchased_price','launch_image'])->make(true);

        }else{ 
           
            $id = decodeId($id); 
            $user = User::find($id);
             
            $getTradeDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->
            select(DB::raw('sum(user_trading_portfolio.quantity*user_trading_portfolio.price) as total_investment, sum(launchpaid.live_image_price*user_trading_portfolio.quantity) as total_live_price, sum(user_trading_portfolio.total_price) as my_total_price'))->
            where(['user_trading_portfolio.user_id'=>$id])->first();
 
            $total_investment = $getTradeDt->total_investment ?? '0';
            $current_trade_price = $getTradeDt->total_live_price ?? '0';
            $my_total_price = $getTradeDt->my_total_price ?? '0';

            $today_difference = $current_trade_price - $total_investment;

            if($today_difference>0)
                $profit_stock_in_percent = ($today_difference*100)/$total_investment;
            else
                $profit_stock_in_percent = 0;
            
            $overall_return=0;
            if($total_investment>0)
            {
                $profitLoss=$current_trade_price-$total_investment;
                $overall_return=($profitLoss/$my_total_price)*100;
            }
            $overall_return = number_format($overall_return,2);
             

            if($today_difference==0){
                $is_up_down = "neutral";
            }else if($today_difference>0){
                $is_up_down = "up";
            }else{
                $is_up_down = "down";
            }

            $title = 'User Portfolio';

            return view('admin.appuser.user_portfolio',compact('title','id','user','total_investment','current_trade_price','overall_return','profit_stock_in_percent','is_up_down','today_difference'));
 
        }
    } 
    
    


    public function _calculate_stock_exchange_price($stock_exch_id,$is_auth){

        $getStockDt = StockExchange::where('id',$stock_exch_id)->first('lauch_id');
        $launchpad_id = $getStockDt->lauch_id;
 
        $getLaunch_pad = Lauchpaid::where('id',$launchpad_id)->first(['id','live_image_price']);
 
        $todayDate = date('Y-m-d'); 
        $getLastDayClosedPrice = StockExchange::where(['status'=>'successful','type'=>'sell','lauch_id'=>$getLaunch_pad->id])->whereDate('created_at','<',$todayDate)->orderBy('id','desc')->first(['price']);
  
        $prev_day_closed_price = $getLaunch_pad->live_image_price;

        $getLaunchPadCUrrentPrice = StockExchange::where(['id'=>$stock_exch_id])->orderBy('id','desc')->first(['price','quantity']); 
 
        $buy_stock_price = $getLaunchPadCUrrentPrice->price ?? '0';
        $buy_stock_qty = $getLaunchPadCUrrentPrice->quantity ?? '0';
        $total_purchased_price = $buy_stock_qty*$buy_stock_price;

        $today_difference = $prev_day_closed_price - $buy_stock_price;

        if($today_difference>0)
            $today_stock_in_percent = ($today_difference*100)/$prev_day_closed_price;
        else
            $today_stock_in_percent = 0;
 
        $row = [];

        $row['current_price'] = $getLaunch_pad->live_image_price;
        $row['up_down_status']=($today_difference>=0) ? "up" : "down"; 
        $row['prev_day_closed_price'] = $prev_day_closed_price;
        $row['stock_in_percent'] = $today_stock_in_percent;  
        $row['buy_stock_qty'] = $buy_stock_qty;  
        $row['buy_stock_price'] = $buy_stock_price; 
        $row['total_purchased_price'] = $total_purchased_price; 

        return $row;
 
    }
}
