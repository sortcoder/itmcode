<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\CreditBalance;
use Auth;
class TradingController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:Trading-Management');
    }
    public function index(Request $request)
    {
        return view('admin.trading.index');
    }
}
