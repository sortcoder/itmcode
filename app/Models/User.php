<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Laravel\Passport\HasApiTokens;
use App\Models\CreditBalance;
use App\Models\Wallet;
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable , HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'mobile',
        'status','account_type','user_type','otp','is_email_verified','pin_no','is_fingerprint','profile'
    ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];



    /*** Check User KYC Verification is pending or not */
    public static function stepOfForm($userRow){
        $data = ['stepNo'=>0,'stepName'=>'','is_email_verified'=>0];
        $userRow->refresh();
        $laucher = ($userRow->user_type == 3)?true:false;
        
                if(empty($userRow->pan_card_no) || !is_file('public/'.$userRow->pan_card_img))
                {
                    $data['stepNo'] = 2;
                    $data['stepName'] = 'Pan Card Kyc Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }else if(empty($userRow->aadhar_card_no) || !is_file('public/'.$userRow->aadhar_front_img) || !is_file('public/'.$userRow->aadhar_back_img)){
                
                    $data['stepNo'] = 3;
                    $data['stepName'] = 'Aadhar Card KYC Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }else if(!is_file('public/'.$userRow->profile) || !is_file('public/'.$userRow->signature)){
                
                    $data['stepNo'] = 4;
                    $data['stepName'] = 'Additiona Information KYC Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }
                
                
                else if(empty($userRow->dob) 
                        || empty($userRow->gender) 
                        || empty($userRow->marital_status)
                        || empty($userRow->profession)
                        || empty($userRow->mother_name) 
                        || empty($userRow->father_name) 
                        || empty($userRow->state)
                        || empty($userRow->district)
                        || empty($userRow->pincode)
                        || empty($userRow->city)
                ){
                
                    $data['stepNo'] = 5;
                    $data['stepName'] = 'Account Registration Is Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }else{
                    if($userRow->kyc_status == 2)
                    {
                        $data['stepNo'] = 6;
                        $data['stepName'] = 'KYC Completed';
                        $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                        return $data;
                    }else{
                        $data['stepNo'] = 1;
                        $data['stepName'] = 'Kyc is pending';
                        $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                        return $data;
                    }
                    
                }
        

    }

















    public function scopeActive($query){
        return $query->where('status',2);
    }
    /**  Launcher */
    public function scopeLuncher($query){
        return $query->where('user_type',3);
    }

    /**  Trader */
    public function scopeTrader($query){
        return $query->where('user_type',2);
    }
     /**  Admin */
    public function scopeAdmin($query){
        return $query->where('user_type',1);
    }
    /**  Launcer & Trader both data */
    public function scopeLt($query){
        return $query->whereIn('user_type',[2,3]);
    }

    /**  Launcher */
    public function scopeLuncherApproved($query){
        return $query->where('launcher_status',2);
    }

    /**
     * Get the user that owns the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function profession()
    {
        return $this->hasOne(Professional::class,'id','profession');
    }

    /**
     * Get all of the comments for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function credit_balance()
    {
        return $this->hasMany(CreditBalance::class);
    }

    public function lauchpaid()
    {
        return $this->hasOne(\App\Models\Lauchpaid::class,'id','user_id');
    }

    /**
     * Get all of the comments for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tradding_wallet()
    {
        return $this->hasMany(Wallet::class)->where('type','live');
    }

    /** Live Trading Data Fetch (not demo account) */
    public function withdrawal_request()
    {
        return $this->hasMany(WithdrawalRequest::class);
    }



        /**
         * Get the user that owns the User
         *
         * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
         */
        public function transactions()
        {
            return $this->belongsTo(\App\Models\Transactions::class);
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


}
