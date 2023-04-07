<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuyMoreImage extends Model
{
    use HasFactory;
    protected $table = 'request_buy_more_image_tbl';

    protected $fillable = [
        'user_id','image_id','quantity','price','status'
    ];
}
