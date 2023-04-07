<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CreditBalance;
use Auth;
class Lauchpaid extends Model
{
    use HasFactory;
    protected $table = 'launchpaid';

    public function credit_balance()
    {
        return $this->hasMany(CreditBalance::class);
    }


    /**
     * Get the user associated with the Lauchpaid
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }


    /*** Credit Balance  ***/

    public function credit_balance_launcher_wise(){
        return $this->hasMany(CreditBalance::class, 'launcher_id', 'id');
    }

      /**
         * Get all of the stock_exchanges for the User
         *
         * @return \Illuminate\Database\Eloquent\Relations\HasMany
         */
    public function stock_exchanges(): HasMany
    {
        return $this->hasMany(StockExchange::class);
    }

      /**
     *  Append All Necessaory Attributes
     */

    protected $appends = ['current_price'];

    public function getCurrentPriceAttribute($value){
        $user_id = \Auth::id();
        $launchpaidId = $this->id;
        
    }

}
