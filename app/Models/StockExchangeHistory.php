<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockExchangeHistory extends Model
{
    use HasFactory;
    protected $table = 'stock_exchange_history';

    protected $fillable = [
        'from_stock_exchange_id','to_stock_exchange_id','from_user_id','to_user_id','from_type','to_type','from_quantity','to_quantity','from_remaining_qty','to_remaining_qty'
    ];
}
