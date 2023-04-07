<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \App\Models\User;
class Wallet extends Model
{
    use HasFactory;
    protected $table = 'tradding_wallets';

    /*** Live Tradding Wallet Credit Successfull  */
    public static function TraddingWalletCredit($userId,$type){
        return self::where('user_id',$userId)->where('type',$type)->whereIn('status',['In Progress','Successful'])->where('payment_type','credit')->sum('amount') ?? 0;
    }
    /*** Live Tradding Wallet Debit Successfull */
    public static function TraddingWalletDebit($userId,$type){
        return self::where('user_id',$userId)->where('type',$type)->whereIn('status',['In Progress','Successful'])->where('payment_type','debit')->sum('amount') ?? 0;
    }
    /** Tradding Live Account Total Balance Update to Main Table */
    public static function totalLiveWalletBal($userId){
        $credit = self::TraddingWalletCredit($userId,'live');
        $debit  = self::TraddingWalletDebit($userId,'live');
        $findUser = User::find($userId);
        $total = $credit-$debit;
        if(empty($findUser))
        {
            return false;
        }
        $findUser->tradding_live_wallet = $total;
        $findUser->save();
        return true;
    }
    /** Tradding Demo Account Total Balance Update to Main Table */
    public static function totalDemoWalletBal($userId){
        $credit = self::TraddingWalletCredit($userId,'demo');
        $debit  = self::TraddingWalletDebit($userId,'demo');
        $findUser = User::find($userId);
        $total = $credit-$debit;
        if(empty($findUser))
        {
            return false;
        }
        $findUser->tradding_demo_wallet = $total;
        $findUser->save();
        return true;
    }


}
