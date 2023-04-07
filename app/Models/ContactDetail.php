<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactDetail extends Model
{
    use HasFactory;

    protected  $table = 'contact_us';

    protected $fillable = [
         'user_name','user_id', 'mobile', 'email','enquiry','description','support_reply','created_at','updated_at'
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
}
