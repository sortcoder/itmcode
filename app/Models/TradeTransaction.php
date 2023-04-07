<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Lauchpaid;
use App\Models\User;
use App\Models\Wallet;
class TradeTransaction extends Model
{
    use HasFactory;
    protected $table  = 'trading_transaction';


    public static function findMarketDeapth($imageRow){
        /** Calculate market Deapth of this assets **/
        $totalBuyer = self::where('image_id',$imageRow->id)->get();
    }


    public static function buyImage($userid,$imageRow,$price,$type='live'){

        $statusRes = ['status'=>false,'message'=>'','data'=>[]];
        $avl = self::calculateAvailableTradingBalance($userid,'live');


        if($price > $avl){

            $statusRes['message'] = 'Insufficient Funds Please add more ';
            return $statusRes;
        }

        $imageRow->refresh();
        $livePrice = $imageRow->live_image_price;
        $buyPriceTax = settingConfig('BUY_TRADING_PERCENTAGE');
        $livePriceTax = $livePrice*$buyPriceTax/100;
        /** Check buy price not greather then to percentage cont */

        if($price > $livePriceTax)
        {
            $statusRes['message'] = 'Please add max and min 10% of live price ';
            return $statusRes;
        }
        // Add Entry in Stock for Buy
        $newMarketPrice = $livePrice+$price;
        $row = new self;
        $row->user_id  = $userid;
        $row->image_id = $imageRow->id;
        $row->quantity = $imageRow->total_img_quanity;
        $row->price = $price;
        $row->type = 'buy';
        $row->live_price  = $newMarketPrice;
        $row->status  = 'pending';
        $row->save();

        /// Update in stock table
        $imageRow->live_image_price = $newMarketPrice;
        $imageRow->save();


        //// deduct amount form wallet

        $row = new Wallet;
        $row->user_id = $userid;
        $row->amount = $price;
        $row->payment_type = 'debit';
        $row->status = 'Successful';
        $row->type = $type;
        $row->remark = 'Buy Image ';
        $row->save();


        $statusRes['status'] = true;
        $statusRes['message'] = 'Buy Successfully';
        return $statusRes;

    }

    public static function sellImage($userid,$imageRow,$price,$type='live'){

        $statusRes = ['status'=>false,'message'=>'','data'=>[]];


        $imageRow->refresh();
        $livePrice = $imageRow->live_image_price;
        $buyPriceTax = settingConfig('SELL_TRADING_PERCENTAGE');
        $livePriceTax = $livePrice*$buyPriceTax/100;
        /** Check buy price not greather then to percentage cont */

        if($price > $livePriceTax)
        {
            $statusRes['message'] = 'Please add max and min 10% of live price ';
            return $statusRes;
        }
        // Add Entry in Stock for Buy
        $newMarketPrice = $livePrice+$price;
        $row = new self;
        $row->user_id  = $userid;
        $row->image_id = $imageRow->id;
        $row->quantity = $imageRow->total_img_quanity;
        $row->price = $price;
        $row->type = 'buy';
        $row->live_price  = $newMarketPrice;
        $row->status  = 'pending';
        $row->save();

        /// Update in stock table
        $imageRow->live_image_price = $newMarketPrice;
        $imageRow->save();


        //// deduct amount form wallet

        $row = new Wallet;
        $row->user_id = $userid;
        $row->amount = $price;
        $row->payment_type = 'debit';
        $row->status = 'Successful';
        $row->type = $type;
        $row->remark = 'Buy Image ';
        $row->save();


        $statusRes['status'] = true;
        $statusRes['message'] = 'Buy Successfully';
        return $statusRes;

    }



    public static function calculateAvailableTradingBalance($userid,$type='live'){
        $totalAdd = Wallet::where('user_id',$userid)->where('status','Successful')->where('payment_type','credit')->sum('amount');
        $totalMinus = Wallet::where('user_id',$userid)->where('status','Successful')->where('payment_type','debit')->sum('amount');
        $totalBalance = $totalAdd-$totalMinus;

        return $totalBalance;
    }

}
