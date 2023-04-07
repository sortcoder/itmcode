<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TradingPortfolio extends Model
{
    use HasFactory;
    protected $table = 'user_trading_portfolio';

    protected $fillable = [
        'user_id','image_id','quantity','price','total_price'
    ];
}
