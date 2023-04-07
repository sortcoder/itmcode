<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditBalanceHistory extends Model
{
    use HasFactory;
    protected $table = 'credit_balance_txn_history';

    protected $fillable = [
        'user_id','payment_type','amount','remark','created_at','updated_at'
    ];
}
