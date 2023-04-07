<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    use HasFactory;
    protected $table = 'trading_transaction';

    /**
     * Get the images associated with the Orders
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function images()
    {
        return $this->hasOne(\App\Models\Lauchpaid::class,'image_id','id');
    }
}
