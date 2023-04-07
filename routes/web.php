<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PDFController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\CsvController;
use App\Http\Controllers\AutoTradeController;

use App\Http\Controllers\RazorpayPaymentController;
use App\Http\Controllers\TestApiController;


Route::get('/', function () {  
    return view('auth.login');

});
//****** route start for testing 
    Route::get('test_calculation', [TestApiController::class, 'test_calculation']); 
//****** route end for testing 


Route::get('razorpay_payment', [RazorpayPaymentController::class, 'index']);
Route::post('razorpay_payment', [RazorpayPaymentController::class, 'store'])->name('razorpay.payment.store');

Route::get('generate_csv_data', [CsvController::class, 'writeExcel']); 

Route::get('cron_job_for_ico_autobuy', [AutoTradeController::class, 'index']); 

Route::get('/page_data/{page_id}', [UsersController::class, 'page_data']);  // 2=privacy, 9=terms
Route::get('create_pdf', [PDFController::class, 'index']);
Route::get('send_pdf_email', [PDFController::class, 'send_pdf_email']); 


Route::get('/admin', function () {  
    return view('auth.login');

});
require __DIR__.'/admin.php'; /// Admin Routes

Route::get('/', function () {  
    return view('auth.login');

});