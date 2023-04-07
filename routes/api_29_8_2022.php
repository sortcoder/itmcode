<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\UtilitiesController;
use App\Http\Controllers\Api\LauncherController;

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



Route::post('register',[UsersController::class,'register']);
Route::post('login',[UsersController::class,'login']);
Route::post('otp-verification',[UsersController::class,'otpVerification']);
Route::post('otp-resend',[UsersController::class,'otpResend']);


Route::controller(DashboardController::class)->group(function () {
    Route::post('cron_trading_txn_update','cron_trading_txn_update');
});

Route::middleware('auth:api')->group(function(){
   
    Route::controller(DashboardController::class)->group(function () {
        //Route::get('dashboard','home_dashboard');

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
        Route::post('get_page_detail','get_page_detail');
        Route::post('add_update_bank_detail','add_update_bank_detail');
        Route::get('get_bank_detail','get_bank_detail');
        Route::post('launchpad_detail','launchpad_detail');
        
        Route::post('buy_sell_launchpaid','buy_sell_launchpaid');
        Route::post('my_order','my_order');
        Route::get('launchpad_dashboard','launchpad_dashboard');

        Route::post('click_to_launch','click_to_launch');
        Route::get('launchpad_ico_images','launchpad_ico_images');
        Route::get('manage_launchpad_images','manage_launchpad_images');

        Route::post('order_update','order_update');

    });

    /** KYC Routes  */
    Route::controller(KycController::class)->group(function () {
        Route::post('pan-card-update','pan_card_update');
        Route::post('aadhar-card-update','aadhaar_card_update');
        Route::post('additional-details-update','additional_details_update');
        Route::post('account-details-update','account_details_update');
        Route::post('send-verification-email-otp','sendEmailOtp');
        Route::post('verify-email-otp','verifyEmailOtp');
    });

    /** Utilities Routes  */
    Route::controller(UtilitiesController::class)->group(function () {
        Route::get('all_assets','_all_assets_array');
        Route::get('district_list/{id}','_fetch_districts');
    });



    /** Launch Paid Routes  */
    Route::prefix('launchpaid')->controller(LauncherController::class)->group(function () {
        Route::post('new-launch-paid','register_new_launch_paid');
        Route::get('package-list','_package_list');
        Route::post('buy-package','buy_package');
    });


});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
