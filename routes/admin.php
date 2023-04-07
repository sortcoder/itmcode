<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\PermissionsController;
use App\Http\Controllers\Admin\RolesController;
use App\Http\Controllers\Admin\AppUserController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\ProfessionalController;
use App\Http\Controllers\Admin\DesignationController;
use App\Http\Controllers\Admin\UtilitiesController;
use App\Http\Controllers\Admin\CountriesController;
use App\Http\Controllers\Admin\StateController;
use App\Http\Controllers\Admin\DistrictController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\VideoController;
use App\Http\Controllers\Admin\LaunchpaidController;
use App\Http\Controllers\Admin\SettingConfigController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\TradingController;
use App\Http\Controllers\Admin\WithdrawalRequestController;
use App\Http\Controllers\Admin\BuyMoreImageRequestController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ImageUploadController as ImageUploadController;
use App\Http\Controllers\Admin\ManageOrderController;  // use App\Http\Controllers\Admin\AppUserController;
use App\Http\Controllers\Admin\UpcommingOrderController;
use App\Http\Controllers\Admin\PortfolioController;
use App\Http\Controllers\Admin\ContactDetailController;
use App\Http\Controllers\Admin\UserTransactionController;



Route::prefix('admin')->group(function () {
   
    require __DIR__.'/auth.php'; /// Login Auth Routes
    // Auth Routes
    // admin access routes
    Route::group(['middleware'=>['auth']],function () {

         Route::get('new_firebase_check', [NotificationController::class, 'new_firebase_check']);
         

         Route::controller(AppUserController::class)->group(function () {
            Route::post('user_status_update', 'status_update'); 
         }); 
         
         Route::controller(AppUserController::class)->group(function () {
            Route::post('user_kyc_status_update', 'kyc_status_update'); 
         });

          /*** Resource Files Routes  **/
          Route::resources([
            'users' => UsersController::class,
            'permissions' => PermissionsController::class,
            'roles' => RolesController::class,
            'appuser' => AppUserController::class, 
            'manage_order' => ManageOrderController::class,
            'upcomming_order' => UpcommingOrderController::class,
            'module' => ModuleController::class,
            'professional' => ProfessionalController::class,
            'designation' => DesignationController::class,
            'countries' => CountriesController::class,
            'state' => StateController::class,
            'district' => DistrictController::class,
            'contact' => ContactDetailController::class,
            'package' => PackageController::class,
            'video' => VideoController::class,
            'launchpaid' => LaunchpaidController::class,
            'setting_config' => SettingConfigController::class,
            'notification' => NotificationController::class,
            'banner' => BannerController::class,
            'trading' => TradingController::class,
            'withdraw' => WithdrawalRequestController::class,
            'buy_more_request' => BuyMoreImageRequestController::class,
        ]);
        /*** Image Upload Routes ***/
        Route::controller(ImageUploadController::class)->group(function () {
            Route::post('upload-image', 'uploadImage')->name('upload-image');
            Route::post('delete-image', 'deleteImage')->name('delete-image');
        });

         /*** Dashboard Routes ***/
         Route::controller(DashboardController::class)->group(function () {
            Route::get('dashboard', 'index')->name('dashboard');
            Route::get('dashboard/charts', 'charts')->name('dashboard.charts');

         });

          /*** Utilities Function Routes ***/
          Route::controller(UtilitiesController::class)->group(function () {
            Route::get('fetch-districts', 'fetchDistricts')->name('fetchDistricts');
         });

         Route::controller(UsersController::class)->group(function () {
            Route::get('user_wallet_balance/{user_id?}', 'user_wallet_balance')->name('user_wallet_balance');
         });
          
         /*** App user wallet links  */
         Route::controller(AppUserController::class)->group(function(){
            Route::get('appuser-tradding-wallet/{id}', 'appuser_tradding_wallet')->name('appuser_tradding_wallet');

            Route::get('launcher_list', 'launcher_list')->name('launcher_list');

         }); 

          /*** App user wallet links  */
         Route::controller(WithdrawalRequestController::class)->group(function(){
            Route::post('withdrawal_status/{id}/{type}', 'withdrawal_status')->name('withdrawal_status');
            Route::get('transfer-money-transaction', 'transfer_money_transaction')->name('transfer_money_transaction');
            Route::get('user_transaction', 'user_transaction')->name('user_transaction');
            Route::get('user-payment-transaction/{id?}', 'user_payment_transaction')->name('user_payment_transaction');
 
            Route::post('get_transaction_data', 'get_txn_data')->name('get_txn_data');
            Route::post('withdraw_approve', 'withdraw_request_approve')->name('withdraw_request_approve');
         });

         Route::controller(BuyMoreImageRequestController::class)->group(function(){
            Route::post('buy_more_request_status/{id}/{type}', 'buy_more_request_status')->name('buy_more_request_status');
            Route::post('buy_more_request_update', 'buy_more_request_update')->name('buy_more_request_update');
         });

         /****** User txn history *********/

         Route::controller(UserTransactionController::class)->group(function(){
            Route::get('history-user-transaction', 'history_user_transaction')->name('history_user_transaction');
            Route::get('history-user-payment-transaction/{id?}', 'history_user_payment_transaction')->name('history_user_payment_transaction'); 


            Route::get('credited-users', 'credited_users')->name('credited_users');
            Route::get('user-credit-balance-history/{id?}', 'user_credit_balance_history')->name('user_credit_balance_history'); 

         });

         /*** Utilities Function Routes ***/
         Route::controller(LaunchpaidController::class)->group(function () {
             /*** Get Routes **/
            Route::get('adminlaunchpaid', 'adminlaunchpaid')->name('adminlaunchpaid');
            Route::get('demo_launcher', 'demo_launcher')->name('demo_launcher');
            Route::get('live_launcher', 'live_launcher')->name('live_launcher');

               Route::get('user_live_launcher/{user_id?}', 'user_live_launcher')->name('user_live_launcher');


            Route::get('launch_image', 'launch_image')->name('launch_image');
            Route::get('launch_image_icon', 'launch_image_icon')->name('launch_image_icon');
            Route::get('launch_image_tradding/{account_type?}', 'launch_image_tradding')->name('launch_image_tradding');
            Route::get('live-graph/{id}/{type?}', 'live_graph')->name('live-graph');

            Route::get('live-graph-new/{id}', 'live_graph_new')->name('live-graph-new');

            Route::get('load_launch_form/{id}', 'loadLaunchForm')->name('loadLaunchForm');
            Route::get('credit-balance-history/{id}','credit_balance_history')->name('credit-balance-history');

            /*** Post Routes **/
            Route::post('credit-balance-to-launcher','credit_balance_to_launcer')->name('credit-balance-to-launcher');
            Route::post('launch_image_save','launch_image_save')->name('launch_image_save');
            Route::post('launcher_status/{id}/{type}', 'launcher_status')->name('launcher_status');

               Route::post('user_stock_buy_status_update', 'user_stock_buy_status_update'); 
               Route::post('user_stock_sell_status_update', 'user_stock_sell_status_update');
         });


         /*** Notification Route  **/
         Route::controller(NotificationController::class)->group(function () {
            Route::post('send-notification-from-admin','send_notification_from_admin')->name('send-notification-from-admin');
            Route::post('/save-token',  'saveToken')->name('save-token');
            Route::post('notification/send-notification','sendNotification')->name('send.notification');
         });

         /*** Package Controller Route  **/
         Route::controller(PackageController::class)->group(function () {
            Route::get('package-credit-balance/{id}','packageCreditBalance')->name('package-credit-balance');
         });


         /*** Order  Controller Route  **/
         Route::controller(OrderController::class)->group(function () {
            Route::get('order-list/{id?}','index')->name('order-list');
            Route::get('buyImage','buyImageInPeriod')->name('buyImage');
            Route::get('buyImageAfter','buyStockAllUserWise')->name('buyImageAfter');
            Route::get('sellImageAfterPeriodOver','sellImageAfterPeriodOver')->name('sellImageAfterPeriodOver');
            Route::get('buyImageAfterPeriodOver','buyImageAfterPeriodOver')->name('buyImageAfterPeriodOver');


         });
 
         Route::controller(PortfolioController::class)->group(function () {
            Route::get('portfolio-list/{id?}','index')->name('portfolio-list');    
         });


    });

});
