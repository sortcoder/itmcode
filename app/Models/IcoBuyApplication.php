<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IcoBuyApplication extends Model
{
    use HasFactory;
    protected $table = 'ico_buy_application';

    protected $fillable = [
        'user_id','launch_id','quantity','per_image_price','total_price','start_date','end_date'
    ];
}
