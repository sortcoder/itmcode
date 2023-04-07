<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CreditBalance;
use App\Models\Wallet;
use App\Models\StockExchange;
class Livestock extends Model
{
    use HasFactory;
    protected $table = 'live_stock';



}
