<?php

namespace App\Http\Controllers;
   
use Illuminate\Http\Request;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Reader\Exception;
use PhpOffice\PhpSpreadsheet\Writer\Xls;
use PhpOffice\PhpSpreadsheet\IOFactory;
// use PHPExcel_IOFactory;
use DB;
use App\Models\StockExchange;
use App\Models\TradeTransaction;
use App\Models\TradingPortfolio;
use App\Models\User;
use Mail; 

class CsvController extends Controller
{ 
    public function index(Request $request)
    {  
        $data = [];

            $from_date = '2021-08-01'; // $request->from_date;
            $to_date = '2022-08-01'; // $request->to_date;

             $user_id = '46'; // Auth::id();
            // $user_email = Auth::user()->email;
            // $user_email = "manvendrajploft@gmail.com";
             
            $getUnrealizedTxnBuyDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->where(['user_trading_portfolio.user_id'=>$user_id])->whereBetween('user_trading_portfolio.created_at', [$from_date, $to_date])->get(['launchpaid.launch_sketch as launchpad_name','user_trading_portfolio.quantity','user_trading_portfolio.price','user_trading_portfolio.total_price','launchpaid.live_image_price']);

            $data["getUnrealizedTxnBuyDt"] = $getUnrealizedTxnBuyDt;


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
          
            $data["getRealizedTxnSoldDt"] = $getRealizedTxnSoldDt;

    }

    

    //********************************************


    public function writeExcel(Request $request){

        $from_date = '2021-08-01'; // $request->from_date;  2022-09-07
        $to_date = '2022-12-01'; // $request->to_date;

        $user_id = '46'; // Auth::id();
        $finalArray = [];
     
        /*    
            $finalArray[] = [
                "sheetName" => "Summary P&L",
                "data" =>[
                    ["Script Name","ISIN","Quantity","Buy Average","Buy Value","Closing Price","Present Value","Unrealized P&L","P&L%"],
                    ["Adani Ltd","INE699H01024","425","692.37","294256.87","769.65","327101.25","32844.38","11.16%"],
                    ["PNB","INE859A01011","285","70.87","20198.14","63.45","18083.25","-2114.89","-10.47%"],
                    ["Total","","","","12125","22125","4522","23424","0.72%"]
                ]
            ];

        
            $finalArray[] = [
                "sheetName" => "Realized P&L Detail",
                "data" =>[
                    ["Script Name","ISIN","Quantity","Buy Date","Buy Price","Buy Value","Sell Date","Sell Price","Sell Value","P&L Value"],
                    ["Adani Ltd","INE699H01024","65","07-Feb-2022","230","14950","11-Feb-2022","386.67","25133.67","10183.67"],
                    ["Vedant","INE825V01034","30","16-Feb-2022","939.7","28191.11","21-Feb-2022","889.03","26670.9","-1520.21"],
                    ["Total","","","","","12125","","","4522","32252"]
                ]
            ];
            $finalArray[] = [
                "sheetName" => "Unrealized Transactions",
                "data" =>[
                    ["Scrip Name","ISIN","Type","Quantity","Date","Price","Value"],
                    ["Adani Ltd","INE699H01024","BUY","50","23-Jun-2022","561.66","28083.18"],
                    ["PNB","INE699H01024","BUY","60","23-Jun-2022","451.66","18083.18"],
                    ["Yes Bank","INE699H01024","BUY","30","23-Jun-2022","453.66","38083.18"],
                    ["Total","","","","","","32252"]
                ]
            ];
        */
        //***************************************************************************************

        // Summary UnRealized Data
         
        $summ_un_realSheetDt = self::summary_unrealized_data($user_id,$from_date,$to_date); 
 
        // Summary Realized Data
        
        $summ_realSheetDt = self::summary_realized_data($user_id,$from_date,$to_date); 
        
        $merge_summ_arr = array_merge($summ_un_realSheetDt,$summ_realSheetDt);  
       

        $finalArray[] = [
            "sheetName" => "Summary P&L",
            "data" =>$merge_summ_arr
        ];
 
        // for RealizedData / Buy Sell Data
                
            $realSheetDt = self::realized_data($user_id,$from_date,$to_date); 
            
            $finalArray[] = [
                "sheetName" => "Realized Transactions",
                "data" =>$realSheetDt
            ];          

        // For UnRealizedData / Buy data

            $unRealSheetDt = self::unrealized_data($user_id,$from_date,$to_date); 
           
            $finalArray[] = [
                "sheetName" => "UnRealized Transactions",
                "data" =>$unRealSheetDt
            ];          
         
        $finalArray = array_values($finalArray);
        $fileName = str_ireplace(" ","-","ITM_Equity_P&L_Report_".rand());

         

        $this->ExportExcel($finalArray,$fileName,$from_date,$to_date);
            
    }

    public function summary_unrealized_data($user_id,$from_date,$to_date){

        $userData = User::find($user_id);

        $getUnrealizedTxnBuyDtSumm = StockExchange::select(DB::raw(' 
            sum(stock_exchange.quantity) as buy_quantity,
            sum(stock_exchange.price) as total_price,launchpaid.launch_sketch as launchpad_name,launchpaid.live_image_price,launchpaid.isin_no,stock_exchange.lauch_id'))->
            leftjoin('launchpaid','launchpaid.id','=','stock_exchange.lauch_id')->
            groupBy('stock_exchange.lauch_id')->
            where(['stock_exchange.type'=>'buy','stock_exchange.status'=>'pending'])->
            whereBetween('stock_exchange.created_at', [$from_date, $to_date])->
            where(['stock_exchange.user_id'=>$user_id])->get();


        $total_buy_value_summ =0; $total_present_value_summ=0; $total_unRealize_PnL_summ=0; $pprofit_dt = 0;
        $tot_profit_summ = 0;
        $summ_unRealArr = array();

        $summ_unRealArr[] = ["For Image"]; 
        $summ_unRealArr[] = ["Name",@$userData->name];
        $summ_unRealArr[] = ["PAN number",@$userData->pan_card_no];
        $summ_unRealArr[] = ["Period",$from_date." to ".$to_date];
        $summ_unRealArr[] = [];
        $summ_unRealArr[] = [];
        $summ_unRealArr[] = [];
        $summ_unRealArr[] = ["Unrealized P/L Summary (".$from_date." to ".$to_date.")"];
        $summ_unRealArr[] = [];

        $summ_unRealArr[] = ["Script Name","ISIN","Quantity","Buy Average","Buy Value","Closing Price","Present Value","Unrealized P&L","P&L%"];
        foreach($getUnrealizedTxnBuyDtSumm as $buy_txn_rec_summ){ 
             
            $getLstCosedData = TradeTransaction::orderBy('id','desc')->where(['image_id'=>$buy_txn_rec_summ->lauch_id,'type'=>"sell",'status'=>"successful"])->skip(1)->first('price');
             
            $closing_price = $getLstCosedData->price ?? '0';
            $buy_avg_value_summ = $buy_txn_rec_summ->total_price/$buy_txn_rec_summ->buy_quantity;  
            $unrealized_P_n_L_summ = ($buy_avg_value_summ*$buy_txn_rec_summ->buy_quantity) - ($buy_txn_rec_summ->live_image_price*$buy_txn_rec_summ->buy_quantity);  
            $rec_buy_value_summ = $buy_avg_value_summ*$buy_txn_rec_summ->buy_quantity;
            $total_buy_value_summ = $total_buy_value_summ +$rec_buy_value_summ; 

            $tot_profit_summ = ($unrealized_P_n_L_summ*100)/$rec_buy_value_summ;

            $summ_unRealArr[] = [
                $buy_txn_rec_summ->launchpad_name,
                $buy_txn_rec_summ->isin_no,
                $buy_txn_rec_summ->buy_quantity, 
                round($buy_avg_value_summ,2),
                round($rec_buy_value_summ,2),
                $closing_price,
                round($buy_txn_rec_summ->live_image_price,2),
                $unrealized_P_n_L_summ,
                $tot_profit_summ
            ];

            $total_present_value_summ = $total_present_value_summ + $buy_txn_rec_summ->live_image_price; 
            $total_unRealize_PnL_summ = $total_unRealize_PnL_summ + $unrealized_P_n_L_summ;  
         
        } 
        $all_unreal_prodit = "0";
        if($total_unRealize_PnL_summ>0)
            $all_unreal_prodit = ($total_unRealize_PnL_summ*100)/$total_buy_value_summ;

        $summ_unRealArr[] = ["Total","","","",$total_buy_value_summ,"",$total_present_value_summ,$total_unRealize_PnL_summ,$all_unreal_prodit];

        return $summ_unRealArr;

    }

    public function summary_realized_data($user_id,$from_date,$to_date){

        $summ_realArr[] = [];$summ_realArr[] = [];$summ_realArr[] = [];$summ_realArr[] = [];
        $summ_realArr[] = ["Realized P/L Summary (".$from_date." to ".$to_date.")"];
        $summ_realArr[] = [];

        $getRealizedTxnSoldDtSumm = StockExchange::
            select(DB::raw('
                sum((stock_exchange.quantity*stock_exchange.price)) as total_buy_price,
                sum(stock_exchange.quantity) as buy_quantity,
                (sum((stock_exchange.quantity*stock_exchange.price))/sum(stock_exchange.quantity)) as avg_buy_price,
                launchpaid.launch_sketch as launchpad_name,
                launchpaid.live_image_price,
                launchpaid.isin_no,launchpaid.id as launchpad_id'
            ))->
            leftjoin('launchpaid','launchpaid.id','=','stock_exchange.lauch_id')->where(['stock_exchange.type'=>'buy','stock_exchange.status'=>'pending'])->groupby('stock_exchange.lauch_id')->whereBetween('stock_exchange.created_at', [$from_date, $to_date])->where(['stock_exchange.user_id'=>$user_id])->get();

        $total_buy_value=0; $total_sell_value =0; $total_Realize_PnL=0; 
 
            $summ_realArr[] = ["Script Name","ISIN","Quantity","Buy Average","Buy Value","Sell Average","Sell Value","Realize P&L"];

               
            foreach($getRealizedTxnSoldDtSumm as $buy_txn_rec){  

                $buy_avg_value_summ = $buy_txn_rec->total_price/$buy_txn_rec->buy_quantity;

                $getSellData = TradeTransaction::select(DB::raw(' 
                    sum(trading_transaction.quantity) as sell_quantity,
                    sum((trading_transaction.quantity*trading_transaction.price)) as total_sell_price,
                    (sum((trading_transaction.quantity*trading_transaction.price))/sum(trading_transaction.quantity)) as avg_sell_price'))->groupBy('image_id')->where('image_id',$buy_txn_rec->launchpad_id)->first();
                 
                $buy_value = $buy_txn_rec->total_buy_price; 
                $sell_value = $getSellData->total_sell_price;      
               
                if($sell_value>0)            
                    $Realized_P_n_L = $sell_value - $buy_value;
                else{
                    $sell_value = '0';
                    $Realized_P_n_L = '0';
                }

                $sell_date = (!empty(@$getSellData->created_at)) ? date('d-M-Y',strtotime(@$getSellData->created_at)) : '';
                $summ_realArr[] = [
                    $buy_txn_rec->launchpad_name,
                    $buy_txn_rec->isin_no,
                    $buy_txn_rec->buy_quantity,
                    round($buy_txn_rec->avg_buy_price,2),
                    round($buy_txn_rec->total_buy_price,2),
                    round($getSellData->avg_sell_price,2),
                    $getSellData->total_sell_price,
                    $Realized_P_n_L
                ];
                $total_buy_value = $total_buy_value + $buy_value;
                $total_sell_value = $total_sell_value + $sell_value;  
                $total_Realize_PnL = $total_Realize_PnL + $Realized_P_n_L; 
            }
            $summ_realArr[] = ["Total","","","",$total_buy_value,"",$total_sell_value,$total_Realize_PnL];
            
            return $summ_realArr;
    }
    public function realized_data($user_id,$from_date,$to_date){

        $userData = User::find($user_id);

        $realArr = array();

        $realArr[] = ["For Image"]; 
        $realArr[] = ["Name",@$userData->name];
        $realArr[] = ["PAN number",@$userData->pan_card_no];
        $realArr[] = ["Period",$from_date." to ".$to_date]; 
        $realArr[] = [];

        $getRealizedTxnSoldDt = StockExchange::leftjoin('launchpaid','launchpaid.id','=','stock_exchange.lauch_id')->where(['stock_exchange.type'=>'buy','stock_exchange.status'=>'pending'])->whereBetween('stock_exchange.created_at', [$from_date, $to_date])->where(['stock_exchange.user_id'=>$user_id])->get(['stock_exchange.*','launchpaid.launch_sketch as launchpad_name','launchpaid.live_image_price','launchpaid.isin_no']);
            
        $total_buy_value=0; $total_sell_value =0; $total_Realize_PnL=0; 

        
        $realArr[] = ["Script Name","ISIN","Quantity","Buy Date","Buy Price","Buy Value","Sell Date","Sell Price","Sell Value","P&L Value"];

        foreach($getRealizedTxnSoldDt as $buy_txn_rec){  

            $getSellData = TradeTransaction::select(DB::raw(' 
            sum(trading_transaction.quantity) as sell_quantity,
            sum(trading_transaction.price) as sell_price,
            sum(trading_transaction.live_price) as total_sell_price,created_at'))->where('first_buy_stock_exchange_id',$buy_txn_rec->id)->groupBy('first_buy_stock_exchange_id')->first();
             
            $sell_price = $getSellData->sell_price ?? '0';
            $sell_qty = $getSellData->sell_quantity ?? '0'; 

            $buy_price = $buy_txn_rec->price;
            $buy_value = $buy_price*$buy_txn_rec->quantity;
            $sell_value = $sell_price*$sell_qty;      
           
            if($sell_value>0)            
                $Realized_P_n_L = $sell_value - $buy_value;
            else{
                $sell_value = '0';
                $Realized_P_n_L = '0';
            }

            $buy_date = (!empty(@$buy_txn_rec->created_at)) ? date('d-M-Y',strtotime(@$buy_txn_rec->created_at)) : '';
            $sell_date = (!empty(@$getSellData->created_at)) ? date('d-M-Y',strtotime(@$getSellData->created_at)) : '';
            $realArr[] = [
                $buy_txn_rec->launchpad_name,
                $buy_txn_rec->isin_no,
                $buy_txn_rec->quantity,
                $buy_date,
                $buy_txn_rec->price,
                $buy_value,
                $sell_date,
                $sell_price,
                $sell_value,
                $Realized_P_n_L
            ];
            $total_buy_value = $total_buy_value + $buy_value;
            $total_sell_value = $total_sell_value + $sell_value;  
            $total_Realize_PnL = $total_Realize_PnL + $Realized_P_n_L; 
        }
        $realArr[] = ["Total","","","","",$total_buy_value,"","",$total_sell_value,$total_Realize_PnL];
         
        return $realArr;
    }
    public function unrealized_data($user_id,$from_date,$to_date){

        $userData = User::find($user_id);

        $unRealArr = array();

        $unRealArr[] = ["For Image"]; 
        $unRealArr[] = ["Name",@$userData->name];
        $unRealArr[] = ["PAN number",@$userData->pan_card_no];
        $unRealArr[] = ["Period",$from_date." to ".$to_date]; 
        $unRealArr[] = [];

        $getUnrealizedTxnBuyDtQue = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id');
        $getUnrealizedTxnBuyDtQue->where(['user_trading_portfolio.user_id'=>$user_id]);

        $getUnrealizedTxnBuyDt = $getUnrealizedTxnBuyDtQue->whereBetween('user_trading_portfolio.created_at', [$from_date, $to_date])->get(['launchpaid.launch_sketch as launchpad_name','launchpaid.isin_no','user_trading_portfolio.quantity','user_trading_portfolio.price','user_trading_portfolio.total_price','launchpaid.live_image_price','user_trading_portfolio.created_at']);

        $total_buy_value =0; $total_present_value=0; $total_unRealize_PnL=0; $pprofit_dt = 0;
 
        $unRealArr[] = ["Script Name","ISIN","Type","Quantity","Date","Price","Value"];
        foreach($getUnrealizedTxnBuyDt as $buy_txn_rec){ 

            $buy_avg_value = $buy_txn_rec->total_price/$buy_txn_rec->quantity;  
            $unrealized_P_n_L = $buy_txn_rec->total_price - ($buy_txn_rec->live_image_price*$buy_txn_rec->quantity); 
            $current_profit = ($unrealized_P_n_L*100)/$buy_txn_rec->total_price;

            $unRealArr[] = [
                $buy_txn_rec->launchpad_name,
                $buy_txn_rec->isin_no,
                "Buy",
                $buy_txn_rec->quantity,
                $buy_txn_rec->created_at,
                round($buy_txn_rec->total_price,2),
                round($buy_txn_rec->live_image_price,2) 
            ];

            $total_buy_value = $total_buy_value + $buy_txn_rec->total_price; 
            $total_present_value = $total_present_value + $buy_txn_rec->live_image_price; 
            $total_unRealize_PnL = $total_unRealize_PnL + $unrealized_P_n_L;  

            if($total_unRealize_PnL>0)
                $pprofit_dt = round(($total_unRealize_PnL*100)/$total_buy_value,2); 
        } 
        $unRealArr[] = ["Total","","","","","",$total_present_value];
        
        return $unRealArr;
    }

    public function ExportExcel($exportData,$fileName,$from_date,$to_date){
   
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '4000M');
        try { 
            
            $spreadSheet = new Spreadsheet();

            foreach($exportData as $key=>$val)
            { 
                $spreadSheet->createSheet();
                $spreadSheet->setActiveSheetIndex($key)->getDefaultColumnDimension()->setWidth(30);
                $spreadSheet->setActiveSheetIndex($key)->fromArray($val['data']);
                $spreadSheet->setActiveSheetIndex($key)->setTitle($val['sheetName']);
 
                $bold_index='0';
                for($i=0;$i<=30;$i++)
                {
                    $styleArray = array(
                        'font'  => array(
                           'name'  => 'arial'
                        ));
                    $spreadSheet->getActiveSheet()->getStyle('A'.$i.':AZ'.$i)->applyFromArray($styleArray);
                    $spreadSheet->getActiveSheet()->getStyle('A'.$i.':AZ'.$i)
                    ->getAlignment()->setWrapText(true);

                } 
                $start_tbl_row=0; 
                $end_tbl_row=0;

                foreach($val['data'] as $sket =>$s_val){ 

                    $row_id = $sket+1;
                    if(count($s_val)>0){ 

                        if($s_val[0]=="Script Name" || $s_val[0]=="Total"){

                            if($s_val[0]=="Script Name"){
                                $start_tbl_row = $row_id; 
                            }
                            
                            if($s_val[0]=="Total"){
                                $end_tbl_row = $row_id;
                            }   
                            $spreadSheet->getActiveSheet()->getStyle('A'.$row_id.':J'.$row_id)->getFont()->setBold(true);
                        }

                        while($start_tbl_row<=$end_tbl_row){
                            if($start_tbl_row>0){ 
                                $spreadSheet->getActiveSheet()->getStyle('A'.$start_tbl_row.':J'.$start_tbl_row)->getBorders()->getLeft()->setBorderStyle(\PHPExcel_Style_Border::BORDER_THIN);
                                $spreadSheet->getActiveSheet()->getStyle('A'.$start_tbl_row.':J'.$start_tbl_row)->getBorders()->getRight()->setBorderStyle(\PHPExcel_Style_Border::BORDER_THIN);
                                $spreadSheet->getActiveSheet()->getStyle('A'.$start_tbl_row.':J'.$start_tbl_row)->getBorders()->getTop()->setBorderStyle(\PHPExcel_Style_Border::BORDER_THIN);
                                $spreadSheet->getActiveSheet()->getStyle('A'.$start_tbl_row.':J'.$start_tbl_row)->getBorders()->getBottom()->setBorderStyle(\PHPExcel_Style_Border::BORDER_THIN);
                            }    
                            $start_tbl_row++;
                        }
                    }   
                }
                $spreadSheet->getActiveSheet()->getColumnDimension('A')->setWidth(12);
          
            } 

                // Code for excel download
                    $Excel_writer = new Xls($spreadSheet);
                    header('Content-Type: application/vnd.ms-excel');
                    header('Content-Disposition: attachment;filename="'.$fileName.'.xls"');
                    header('Cache-Control: max-age=0');
                    ob_end_clean();
                    
                    //***** Code for download excel file
                        $Excel_writer->save('php://output');
                        exit();


            ///////////////// For save excel file on Server //////////////////////////////

            $file = '/public/excel/';
            $Excel_writer = new Xls($spreadSheet);

            $Excel_writer->setPreCalculateFormulas(false);
            $file_dir = dirname(__DIR__, 3).$file;
            if (!file_exists($file_dir)) {
                if (!mkdir($file_dir, 0777, true) && !is_dir($file)) {
                    throw new \RuntimeException(sprintf('Directory "%s" was not created', $file));
                }
            }
            $file = $file_dir.$fileName.'.xls';
            $Excel_writer->save($file);

            $data["user_name"] = ''; // Auth::user()->name;
            $data["pancard_no"] = ''; // Auth::user()->pan_card_no;
            $data["period"] = $from_date." to ".$to_date;

            $data["email"] = "manvendrajploft@gmail.com";
            $data["title"] = "From ITM Money.com";
            $data["body"] = "This is Demo PDF";

            Mail::send('emails.myProfitLossMail', $data, function($message)use($data, $file,$file_dir,$fileName) {
                $message->to($data["email"], $data["email"])
                    ->subject($data["title"])
                    ->attach($file);
            });

            return $file;
                     

            // dd("sExportExcel");
            // $Excel_writer->store('xls', storage_path('excel/exports'));
            exit();
        } catch (Exception $e) {
            return;
        }
    } 
}
