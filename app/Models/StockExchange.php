<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CreditBalance;
use App\Models\Wallet;
use App\Models\Livestock;
class StockExchange extends Model
{
    use HasFactory;
    protected $table = 'stock_exchange';


    /**
     * Get the user associated with the StockExchange
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }


    /**
     * Get the user that owns the StockExchange
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function launcher()
    {
        return $this->belongsTo(Lauchpaid::class, 'lauch_id', 'id');
    }
    /*** This step is running when after launch start date and  end date today date is in it 25-oct-2022 - 30-oct-2022 and today is 28-oct-2022  */
    public static function buyStockBetweenPeriod($userID,$imageObj,$qty,$type='live'){

        Wallet::totalLiveWalletBal($userID);
        $response = ['status'=>false,'message'=>'','data'=>[]];

        $marketValue = $imageObj->total_img_sell;
        $totalQuantity = $imageObj->total_img_quanity;
       /// $remainingQty = $imageObj->remaining_qty;
        $remainingQty = (Int) $imageObj->remaining_qty ;

        /** Check User Available Quantity is available or not  */
        $price = $marketValue;
        if($qty > $remainingQty)
        {
            $response['message'] = 'No. of '.$remainingQty.' images available';
            return $response;
        }
       /// print_r([$imageObj->total_img_quanity-((Int) $imageObj->remaining_qty+$qty),$remainingQty,$qty]);die;
        /** Check Amount is not lessthen or equal to  is available or not  */
        $totalQtyPrice = $qty*$marketValue;

        if($totalQtyPrice <= 0)
        {
            $response['message'] = 'Something Went Wrong ! Error code : #555';
            return $response;
        }
        /** Check Wallet Balance is available to processed this order or not */

        $wallbal = self::calculateAvailableTradingBalance($userID,'live');
        if($wallbal < $totalQtyPrice)
        {
            $response['message'] = 'Insufficient Fund!';
            return $response;
        }

        /** After All Check Processed the Order */

        $stock_exchange = new self;
        $stock_exchange->user_id = $userID;
        $stock_exchange->lauch_id = $imageObj->id;
        $stock_exchange->price = $marketValue;
        $stock_exchange->quantity = $qty;
        $stock_exchange->type =1; /// 1 for buy , 2 => for sell
        $stock_exchange->status = 3; // pending , 2= > pending patch ,  3 => successed , 4 => failed ,5 => cancelled
        if($stock_exchange->save()){

                /**
                 *  Wallet Amount Deduct Logic
                 *  Direct Success Wallet Amount Because in start date and end date intervel only buy not sell
                 * so after check wallet fund available or not then processed final order
                 */
                    $row = new Wallet;
                    $row->user_id = $userID;
                    $row->amount = $marketValue*$qty;
                    $row->payment_type = 'debit';
                    $row->status = 'Successful';
                    $row->type = 'live';
                    $row->remark = 'Buy Image ';
                    $row->stock_id = $stock_exchange->id;
                    $row->save();


                    /*** Refresh Launched Data */
                    $imageObj->refresh();
                    /** Adjusted Remaing Qty */
                    $remainingQtyFinal = (Int) $imageObj->remaining_qty-$qty ;
                    $imageObj->remaining_qty =$remainingQtyFinal;
                    $imageObj->save();

                    /** Managed Live Stock */
                    $liveStockFind = Livestock::where('launch_id',$imageObj->id)->first();
                    if(empty($liveStockFind))
                    {


                        $live = new Livestock;
                        $live->launch_id = $imageObj->id;
                        $live->quanity = $qty;
                        $live->price = $qty*$price;
                        $live->profile_loss = @(($qty/($price*$qty))*100); // prevent for division by zero
                        $live->save();
                    }else{
                        $liveFind =  Livestock::find($liveStockFind->id);
                        $newQty = $liveFind->quanity+$qty;
                        $newPrice = $liveFind->price+($qty*$price);
                        $liveFind->quanity = $newQty;
                        $liveFind->price = $newPrice;
                        $liveFind->profile_loss = @(($newQty/($newPrice*$newQty))*100);// prevent for division by zero
                        $liveFind->save();
                    }

                    //*** Update Live Tradding Wallet Balance **/
                    Wallet::totalLiveWalletBal($userID);

                    $response['status'] = true;
                    $response['message'] = 'Images Buy Successfully';
                    return $response;
        }

        $response['message'] = 'Something Went Wrong!';
        return $response;

    }

    public static function calculateAvailableTradingBalance($userid,$type='live'){
        $totalAdd = Wallet::where('user_id',$userid)->whereIn('status',['Successful','In Progress'])->where('payment_type','credit')->sum('amount');
        $totalMinus = Wallet::where('user_id',$userid)->whereIn('status',['Successful','In Progress'])->where('payment_type','debit')->sum('amount');
        $totalBalance = $totalAdd-$totalMinus;
        return $totalBalance;
    }



    /**
    *
    *  Get Currenct Stock Value
    */
    public static function getCurrentStockValue($imageObj)
    {
       $lastStockValue = self::where('lauch_id',$imageObj->id)->where('status',3)->orderBy('id','desc')->first();
       if(empty($lastStockValue))
       {
            return $imageObj->total_img_sell;
       }
       return $lastStockValue->price;
    }

    /***
     * Deduct and add sell and buy percentage
     */
    public static function sellBuyStockPercentage($imageObj){
        $data = [
            'currentPrice'=>0.00,
            'buyPer'=>settingConfig('BUY_TRADING_PERCENTAGE'),
            'sellPer'=>settingConfig('SELL_TRADING_PERCENTAGE'),
            'afterApplyBuyPer'=>'',
            'afterApplySellPer'=>''
         ];
        $price = self::getCurrentStockValue($imageObj);

        $buyPer = 0;
        $sellPer = 0;
        if($price != 0){
            $buyPer = $price*settingConfig('BUY_TRADING_PERCENTAGE')/100;
            $buyPer = $price+$buyPer;
        }
        if($price != 0){
            $sellPer = $price*settingConfig('BUY_TRADING_PERCENTAGE')/100;
            $sellPer = $price-$sellPer;
        }

        return ['currentPrice'=>$price,'from'=>$sellPer,'to'=>$buyPer];


    }

    /** Fetch Seller Available Stock for Sell */



    /** Buy Stock In Tradding */

    public static function buyStockInTradding($userID,$imageObj,$qty,$price,$type='live'){
        // Refresh Wallet Balance ///
        Wallet::totalLiveWalletBal($userID);

        $response = ['status'=>false,'message'=>'','data'=>[]];
        /// Live Value if exit other wise market value get
        $marketValue   =  self::sellBuyStockPercentage($imageObj)['currentPrice'];;
        $totalQuantity =  $imageObj->total_img_quanity;

        /** Ramaining Quantity  */
        $remainingQty = (Int) $imageObj->remaining_qty ;

        /** Check User Available Quantity is available or not  */

        /** if admin available stock qty lessthen or equal and price is equal to current value then the buy stock automatically */

        if(($qty <= $remainingQty) && ($price == $marketValue))
        {
            return self::buyStockBetweenPeriod($userID,$imageObj,$qty,$price,$type='live');
        }

        /** then find sell to sell same quantity in equal price , type = 2 for seller */
        ///'quantity'=>$qty,
        $sellerStock = self::where('lauch_id',$imageObj->id)->where(['price'=>$price,'type'=>2])->where('quantity','=',$qty)->whereNotIn('user_id',[$userID])->first();


        /*** if Seller avaialbe to sell this stock buy price and quanity then buy now */
        if(!empty($sellerStock))
        {
            $totalQtyPrice = $qty * $price;
            $wallbal = self::calculateAvailableTradingBalance($userID,'live');
            if($wallbal < $totalQtyPrice)
            {
                $response['message'] = 'Insufficient Fund!';
                return $response;
            }


            /** Seller Stock Update Status is Success */
            $sellerStock->status = 3;
            $sellerStock->save();


            /** Buyer Buy This order stock */
            $stock_exchange_buyer = new self;
            $stock_exchange_buyer->user_id = $userID;
            $stock_exchange_buyer->lauch_id = $imageObj->id;
            $stock_exchange_buyer->price = $marketValue;
            $stock_exchange_buyer->quantity = $qty;
            $stock_exchange_buyer->type = 1; /// 1 for buy , 2 => for sell
            $stock_exchange_buyer->status = 3; // pending , 2= > pending patch ,  3 => successed , 4 => failed ,5 => cancelled
            $stock_exchange_buyer->save();

                    /**
                     *  Wallet Amount Deduct Logic
                     *  Direct Success Wallet Amount Because in start date and end date intervel only buy not sell
                     * so after check wallet fund available or not then processed final order
                     */

                    /** Seller Wallet Add Amount */
                        $rowSeller = new Wallet;
                        $rowSeller->user_id = $sellerStock->user_id;
                        $rowSeller->amount = $marketValue*$qty;
                        $rowSeller->payment_type = 'credit';
                        $rowSeller->status = 'Successful';
                        $rowSeller->type = $type;
                        $rowSeller->remark = 'Sell Image ';
                        $rowSeller->stock_id = $sellerStock->id;
                        $rowSeller->save();

                    /** Buyer Wallet Deduct Amount */
                        $rowBuyer = new Wallet;
                        $rowBuyer->user_id = $userID;
                        $rowBuyer->amount = $marketValue*$qty;
                        $rowBuyer->payment_type = 'debit';
                        $rowBuyer->status = 'Successful';
                        $rowBuyer->type = $type;
                        $rowBuyer->remark = 'Buy Image ';
                        $rowBuyer->stock_id = $stock_exchange_buyer->id;
                        $rowBuyer->save();

                        // /*** Refresh Launched Data */
                        $imageObj->refresh();
                        /** Sell Stock  */
                        $remainingQtyFinal = (Int) $imageObj->remaining_qty+$qty ;
                        $imageObj->remaining_qty =$remainingQtyFinal;
                        $imageObj->save();

                        /** Buy Stock */
                        $imageObj->refresh();
                        $remainingQtyFinal = (Int) $imageObj->remaining_qty-$qty ;
                        $imageObj->remaining_qty =$remainingQtyFinal;
                        $imageObj->save();


                        /** Managed Live Stock only in Success  Seller Side */
                        $liveStockFind = Livestock::where('launch_id',$imageObj->id)->first();
                        if(empty($liveStockFind))
                        {

                            $live = new Livestock;
                            $live->launch_id = $imageObj->id;
                            $live->quanity = $qty;
                            $live->price = $qty*$price;
                            $live->profile_loss = @(($qty/($price*$qty))*100); // prevent for division by zero
                            $live->save();
                        }else{
                            $liveFind =  Livestock::find($liveStockFind->id);
                            $newQty = $liveFind->quanity-$qty;
                            $newPrice = $liveFind->price-($qty*$price);

                            $liveFind->quanity = $newQty;
                            $liveFind->price = $newPrice;
                            $liveFind->profile_loss = @(($newQty/($newPrice*$newQty))*100); // prevent for division by zero
                            $liveFind->save();
                        }

                         /** Managed Live Stock only in Buyer side */
                         $liveStockFind = Livestock::where('launch_id',$imageObj->id)->first();
                         if(empty($liveStockFind))
                         {

                             $live = new Livestock;
                             $live->launch_id = $imageObj->id;
                             $live->quanity = $qty;
                             $live->price = $qty*$price;
                             $live->profile_loss = @(($qty/($price*$qty))*100); // prevent for division by zero
                             $live->save();
                         }else{
                             $liveFind =  Livestock::find($liveStockFind->id);
                             $newQty = $liveFind->quanity+$qty;
                             $newPrice = $liveFind->price+($qty*$price);

                             $liveFind->quanity = $newQty;
                             $liveFind->price = $newPrice;
                             $liveFind->profile_loss = @(($newQty/($newPrice*$newQty))*100); // prevent for division by zero
                             $liveFind->save();
                         }

                        //*** Update Live Tradding Wallet Balance **/
                        Wallet::totalLiveWalletBal($userID);
                        Wallet::totalLiveWalletBal($sellerStock->user_id);

                        $response['status'] = true;
                        $response['message'] = 'Images Buy Successfully';
                        return $response;

                        /** End of if condtion */
        }else{

            /* In Pending State buyer find right seller for buy stock */

            $totalQtyPrice = $qty * $price;
            $wallbal = self::calculateAvailableTradingBalance($userID,'live');
            if($wallbal < $totalQtyPrice)
            {
                $response['message'] = 'Insufficient Fund!';
                return $response;
            }

            /** Buyer Buy This order stock in holding (if any seller find then excuate the order ) */
            $stock_exchange_buyer = new self;
            $stock_exchange_buyer->user_id = $userID;
            $stock_exchange_buyer->lauch_id = $imageObj->id;
            $stock_exchange_buyer->price = $price;
            $stock_exchange_buyer->quantity = $qty;
            $stock_exchange_buyer->type = 1; /// 1 for buy , 2 => for sell
            $stock_exchange_buyer->status = 2; // pending , 2= > pending patch ,  3 => successed , 4 => failed ,5 => cancelled
            $stock_exchange_buyer->save();

            $response['status'] = true;
            $response['message'] = 'Find Seller to buy images';
            return $response;
        }
    }



    /** Buy Stock In Tradding */

    public static function sellerStockInTradding($userID,$imageObj,$qty,$price,$type='live'){
        // Refresh Wallet Balance ///
        Wallet::totalLiveWalletBal($userID);

        $response = ['status'=>false,'message'=>'','data'=>[]];
        /// Live Value if exit other wise market value get
        $marketValue   =  self::sellBuyStockPercentage($imageObj)['currentPrice'];;
        $totalQuantity =  $imageObj->total_img_quanity;

        /** Ramaining Quantity  */
        $remainingQty = (Int) $imageObj->remaining_qty ;



        /** then find sell to sell same quantity in equal price , type = 2 for seller */
        ///'quantity'=>$qty,
        $buyerStock = self::where('lauch_id',$imageObj->id)->where(['price'=>$price,'type'=>1])->where('quantity','=',$qty)->whereNotIn('user_id',[$userID])->first();


        /*** if Seller avaialbe to sell this stock buy price and quanity then buy now */
        if(!empty($buyerStock))
        {
            $totalQtyPrice = $qty * $price;
            $wallbal = self::calculateAvailableTradingBalance($userID,'live');
            if($wallbal < $totalQtyPrice)
            {
                $response['message'] = 'Insufficient Fund!';
                return $response;
            }


            /** Seller Stock Update Status is Success */
            $buyerStock->status = 3;
            $buyerStock->save();


            /** Buyer Buy This order stock */
            $stock_exchange_seller = new self;
            $stock_exchange_seller->user_id = $userID;
            $stock_exchange_seller->lauch_id = $imageObj->id;
            $stock_exchange_seller->price = $marketValue;
            $stock_exchange_seller->quantity = $qty;
            $stock_exchange_seller->type = 2; /// 1 for buy , 2 => for sell
            $stock_exchange_seller->status = 3; // pending , 2= > pending patch ,  3 => successed , 4 => failed ,5 => cancelled
            $stock_exchange_seller->save();

                    /**
                     *  Wallet Amount Deduct Logic
                     *  Direct Success Wallet Amount Because in start date and end date intervel only buy not sell
                     * so after check wallet fund available or not then processed final order
                     */

                    /** Seller Wallet Add Amount */
                        $rowSeller = new Wallet;
                        $rowSeller->user_id = $buyerStock->user_id;
                        $rowSeller->amount = $marketValue*$qty;
                        $rowSeller->payment_type = 'credit';
                        $rowSeller->status = 'Successful';
                        $rowSeller->type = $type;
                        $rowSeller->remark = 'Sell Image ';
                        $rowSeller->stock_id = $buyerStock->id;
                        $rowSeller->save();

                    /** Buyer Wallet Deduct Amount */
                        $rowBuyer = new Wallet;
                        $rowBuyer->user_id = $userID;
                        $rowBuyer->amount = $marketValue*$qty;
                        $rowBuyer->payment_type = 'debit';
                        $rowBuyer->status = 'Successful';
                        $rowBuyer->type = $type;
                        $rowBuyer->remark = 'Buy Image ';
                        $rowBuyer->stock_id = $stock_exchange_seller->id;
                        $rowBuyer->save();

                        // /*** Refresh Launched Data */
                        $imageObj->refresh();
                        /** Sell Stock  */
                        $remainingQtyFinal = (Int) $imageObj->remaining_qty+$qty ;
                        $imageObj->remaining_qty =$remainingQtyFinal;
                        $imageObj->save();

                        /** Buy Stock */
                        $imageObj->refresh();
                        $remainingQtyFinal = (Int) $imageObj->remaining_qty-$qty ;
                        $imageObj->remaining_qty =$remainingQtyFinal;
                        $imageObj->save();


                        /** Managed Live Stock only in Success  Buyer purchased stock in our Side */
                        $liveStockFind = Livestock::where('launch_id',$imageObj->id)->first();
                        if(empty($liveStockFind))
                        {

                            $live = new Livestock;
                            $live->launch_id = $imageObj->id;
                            $live->quanity = $qty;
                            $live->price = $qty*$price;
                            $live->profile_loss = @(($qty/$price)*100); // prevent for division by zero
                            $live->save();
                        }else{
                            $liveFind =  Livestock::find($liveStockFind->id);
                            $newQty = $liveFind->quanity+$qty;
                            $newPrice = $liveFind->price+($qty*$price);

                            $liveFind->quanity = $newQty;
                            $liveFind->price = $newPrice;
                            $liveFind->profile_loss = @(($newQty/$newPrice)*100); // prevent for division by zero
                            $liveFind->save();
                        }

                         /** Managed Live Stock only in Buyer side */
                         $liveStockFind = Livestock::where('launch_id',$imageObj->id)->first();
                         if(empty($liveStockFind))
                         {

                             $live = new Livestock;
                             $live->launch_id = $imageObj->id;
                             $live->quanity = $qty;
                             $live->price = $qty*$price;
                             $live->profile_loss = @(($qty/$price)*100); // prevent for division by zero
                             $live->save();
                         }else{
                             $liveFind =  Livestock::find($liveStockFind->id);
                             $newQty = $liveFind->quanity-$qty;
                             $newPrice = $liveFind->price-($qty*$price);

                             $liveFind->quanity = $newQty;
                             $liveFind->price = $newPrice;
                             $liveFind->profile_loss = @(($newQty/$newPrice)*100); // prevent for division by zero
                             $liveFind->save();
                         }

                        //*** Update Live Tradding Wallet Balance **/
                        Wallet::totalLiveWalletBal($userID);
                        Wallet::totalLiveWalletBal($buyerStock->user_id);

                        $response['status'] = true;
                        $response['message'] = 'Images Buy Successfully';
                        return $response;

                        /** End of if condtion */
        }else{

            /* In Pending State buyer find right seller for buy stock */

            $totalQtyPrice = $qty * $price;
            $wallbal = self::calculateAvailableTradingBalance($userID,'live');
            if($wallbal < $totalQtyPrice)
            {
                $response['message'] = 'Insufficient Fund!';
                return $response;
            }

            /** Buyer Buy This order stock in holding (if any seller find then excuate the order ) */
            $stock_exchange_buyer = new self;
            $stock_exchange_buyer->user_id = $userID;
            $stock_exchange_buyer->lauch_id = $imageObj->id;
            $stock_exchange_buyer->price = $price;
            $stock_exchange_buyer->quantity = $qty;
            $stock_exchange_buyer->type = 2; /// 1 for buy , 2 => for sell
            $stock_exchange_buyer->status = 2; // pending , 2= > pending patch ,  3 => successed , 4 => failed ,5 => cancelled
            $stock_exchange_buyer->save();

            $response['status'] = true;
            $response['message'] = 'Find Buyer to sell images';
            return $response;
        }
    }


}
