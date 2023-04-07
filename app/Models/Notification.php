<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected  $table = 'notifications';
    
    protected $fillable = [
        'id','title','desc','image','created_at','updated_at'
    ];

    protected $hidden = [ 
        'updated_at',
        'deleted_at', 
    ];
}
