<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Districts extends Model
{
    use HasFactory;
    protected $table  = 'districts';
    public $timestamps = false;
    public static function fetchDistricts($id=1){
        return self::where('state_id',$id)->pluck('name','id')->toArray();
    }

    /**
     * Get the user that owns the State
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function country()
    {
        return $this->belongsTo(Countries::class,'country_id','id');
    }

    public function state()
    {
        return $this->belongsTo(State::class,'state_id','id')->with('country');
    }

    public static function districtListArray($slug){
        $data = self::where('state_id',$slug)->pluck('name','id')->toArray();
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
