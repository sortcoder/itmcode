<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModulePermission extends Model
{
    use HasFactory;
    protected $table = 'module';
    protected $fillable = ['name','permission_ids','created_at','deleted_at','updated_at'];
}
