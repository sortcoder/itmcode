<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LikeLaunchpad extends Model
{
    use HasFactory;
    protected $table = 'like_launchpad';

    protected $fillable = [
        'user_id','launchpad_id'
    ];
}
