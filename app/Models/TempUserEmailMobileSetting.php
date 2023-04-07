<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempUserEmailMobileSetting extends Model
{
    use HasFactory;
    protected $table = 'temp_user_email_mobile_setting';

    protected $fillable = [
        'user_id','record_type','record_name'
    ];
}
