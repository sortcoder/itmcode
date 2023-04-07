<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Designation extends Model
{
    use HasFactory , SoftDeletes;
    protected $fillable = ['name'];

    public static function makeToArray(){
        return [''=>'Select Option']+self::pluck('name','id')->toArray();
    }

    /**
     * Get the user that owns the Designation
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function designationListArray(){
        $data = self::where('status','1')->pluck('name','id')->toArray();
        $res = [];
        foreach($data as $key =>$val){
            $row = [];
            $row['key']=$key;
            $row['val']=$val;
            $res[] = $row;
        }
        return $res;
    }
}
