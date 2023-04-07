<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    use HasFactory;
    protected $table  = 'states';
    public $timestamps = false;
    public static function fetchStates($id=101){
        return self::where('country_id',$id)->pluck('name','id')->toArray();
    }

    /**
     * Get the user that owns the State
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function country()
    {
        return $this->belongsTo(Countries::class);
    }

    /**
     * Get all of the comments for the State
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function districts(): HasMany
    {
        return $this->hasMany(Districts::class);
    }

    public static function stateListArray(){
        $data = self::pluck('name','id')->toArray();
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

