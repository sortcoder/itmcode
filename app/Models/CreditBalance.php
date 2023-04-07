<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditBalance extends Model
{
    use HasFactory;

    /**
     * Get the user that owns the CreditBalance
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function launchpaid()
    {
        return $this->belongsTo(Lauchpaid::class);
    }


}
