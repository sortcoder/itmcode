<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use \App\Models\User;

class UserInvestment extends Model
{
    use HasFactory;
    protected $table = 'user_investment';
    
    protected $fillable = [
        'user_id','payment_type','type','amount','status','remark'
    ];
}
