<?php

namespace App\Http\Controllers;
   
use Illuminate\Http\Request;
use DB;
use Mail; 
use Carbon\Carbon; 
use App\Models\User;

class TestApiController extends Controller
{  
    public function test_calculation(Request $request){
        $getData = DB::select("SELECT p.price,p.total_price,lp.live_image_price,p.quantity 
            FROM user_trading_portfolio as p left join launchpaid as lp on lp.id =p.image_id");
        
        dd($getData);


        /*const [totalImages, fields] = await connection.execute('SELECT p.price,p.total_price,lp.live_image_price,p.quantity 
            FROM `user_trading_portfolio` as p left join launchpaid as lp on lp.id =p.image_id  where p.user_id="'+userId+'" ');
        let currentValue=0;
        let totalPrice=0;
        for (const iterator of totalImages) {
            let liveTotalPrice=iterator.live_image_price*iterator.quantity;
            currentValue=parseFloat(currentValue)+parseFloat(liveTotalPrice);
            totalPrice=parseFloat(totalPrice)+parseFloat(iterator.total_price);

        }
        let overallReturn=0;
        if(totalPrice>0)
        {
            let profitLoss=currentValue-totalPrice;
            overallReturn=(profitLoss/totalPrice)*100;
        }

        let result={
            investment:totalPrice.toString(),
            currentValue:currentValue.toString(),
            overallReturn:overallReturn.toString(),
            trand:overallReturn>0?"up":"down",
        }
        return result;*/

    }
}
