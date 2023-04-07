<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\UtilitiesController;
use App\Http\Controllers\Api\LauncherController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

 

Route::get('razor_add_money',[UsersController::class,'razor_add_money']);
Route::post('test_razorpay_order_check',[UsersController::class,'test_razorpay_order_check']);

Route::get('unauthorized', function () {
    return response()->json(['status'=>false,'code' => 401, 'message' => 'Unauthorized user.']);
})->name('api.unauthorized');

Route::post('forget_password',[UsersController::class,'forget_password']);

Route::get('test_otp_api',[UsersController::class,'test_otp_api']);

Route::post('register',[UsersController::class,'register']);
Route::post('login',[UsersController::class,'login']);
Route::post('otp-verification',[UsersController::class,'otpVerification']);
Route::post('pin-verification',[UsersController::class,'pinVerification']);
Route::post('otp-resend',[UsersController::class,'otpResend']);
Route::post('update_password',[UsersController::class,'update_password']);

Route::get('support_detail',[UsersController::class,'support_detail']);

Route::post('setting_otp_verification',[UsersController::class,'setting_otp_verification']);
Route::post('setting_otp_resend',[UsersController::class,'setting_otp_resend']);

Route::controller(DashboardController::class)->group(function () {
    Route::post('cron_trading_txn_update','cron_trading_txn_update');
});

/** Utilities Routes  */
    Route::controller(UtilitiesController::class)->group(function () {
        Route::get('all_assets','_all_assets_array');
        Route::get('district_list/{id}','_fetch_districts');
    });


    Route::controller(KycController::class)->group(function () {  
        Route::post('pan-card-update','pan_card_update');
        Route::post('aadhar-card-update','aadhaar_card_update');
        Route::post('additional-details-update','additional_details_update'); 
 
        Route::post('account_registration','account_registration');

        Route::post('aadhaar_pan_kyc_update','aadhaar_pan_kyc_update');
    });

Route::controller(ReportController::class)->group(function () {
    Route::get('get_profit_loss_statement','get_profit_loss_statement');
});

Route::middleware('auth:api')->group(function(){
    
    Route::controller(UsersController::class)->group(function () {
        Route::post('change_password','change_password'); 
        Route::post('contact_us', [UsersController::class, 'contact_us']);
        Route::get('account_detail_check',[UsersController::class,'account_detail_check']);
    });

    Route::controller(ReportController::class)->group(function () {
        Route::post('get_profit_loss_statement','get_profit_loss_statement');
    });
    
    Route::controller(DashboardController::class)->group(function () {
         
        Route::post('add_money','add_money');
        Route::post('razorpay_order_check','razorpay_order_check');
        
        Route::post('withdraw_money','withdraw_money');
        Route::post('fund_transaction_list','fund_transaction_list');
         
        Route::post('wallet_transaction_history','wallet_transaction_history');
        Route::get('credit_balance_history','credit_balance_history');
        
        Route::post('update_pin','update_pin');
        Route::post('update_fingerprint','update_fingerprint');
        
        Route::post('home_dashboard','home_dashboard');
        Route::post('portfolio_dashboard','portfolio_dashboard');
        Route::post('portfolio_list','portfolio_list');
        Route::post('add_to_watchlist','add_to_watchlist');
        Route::post('account_type_update','account_type_update');
        Route::post('view_all_launchpad_list','view_all_launchpad_list');
        Route::get('my_watchlist','my_watchlist');
        Route::post('notification_status_update','notification_status_update');

        Route::post('bank_status_update','bank_status_update');
 
        Route::post('get_page_detail','get_page_detail');
        Route::post('add_update_bank_detail','add_update_bank_detail');
        Route::get('get_bank_detail','get_bank_detail');
        Route::get('get_notification_list','get_notification_list');
        Route::post('launchpad_detail','launchpad_detail');
        
        Route::post('buy_more_image','buy_more_image');
        Route::post('buy_ico_image','buy_ico_image');
        Route::post('buy_sell_launchpaid','buy_sell_launchpaid');
        Route::post('my_order','my_order');
        Route::get('launchpad_dashboard','launchpad_dashboard');

        Route::post('buy_buy_more_image_request','buy_buy_more_image_request');
        
        Route::post('click_to_launch','click_to_launch');
        Route::get('launchpad_ico_images','launchpad_ico_images');
        Route::get('manage_launchpad_images','manage_launchpad_images');

        Route::post('order_update','order_update');

    });

    /** KYC Routes  */
    Route::controller(KycController::class)->group(function () {
        Route::get('get_user_profile','get_user_profile');
        Route::post('setting_update','setting_update'); 
        Route::post('send-verification-email-otp','sendEmailOtp');
        Route::post('verify-email-otp','verifyEmailOtp');
 
        Route::post('account-details-update','account_details_update'); 
    });
 
    /** Launch Paid Routes  */
    Route::controller(LauncherController::class)->group(function () {
        Route::post('new-launch-paid','register_new_launch_paid');
        Route::get('package-list','_package_list');
        Route::post('buy-package','buy_package');
    });


});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
