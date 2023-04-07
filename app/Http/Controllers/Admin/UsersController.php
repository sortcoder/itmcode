<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use DB as DB;
use Yajra\Datatables\Datatables;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

use App\Models\UserInvestment;
use App\Models\TradingPortfolio;
use App\Models\Wallet;
use App\Models\LauncherWallet;
use App\Models\BuyPackages;
use App\Models\CreditBalance;
use App\Models\CreditBalanceHistory;

class UsersController extends Controller
{
    use ResponseWithHttpRequest;
   
    public function index(Request $request)
    {   /*
        $row = User::where('id','!=',1)->where('user_type',1)->first();
        echo '<br/> yuiy ='.$row->getRoleNames(); 
        foreach($row->getRoleNames() as $v)
        {
            echo '<br/> role ='.$v; 
        }
        die;
*/
         if($request->ajax())
         {
            $data = User::where('id','!=',1)->where('user_type',1)->latest();

            if(!empty($request->name)){
                $data = $data->where('name','like','%'.$request->name.'%');
            }
            if(!empty($request->email)){
                $data = $data->where('email','like','%'.$request->email.'%');
            }
            if(!empty($request->mobile)){
                $data = $data->where('mobile','like','%'.$request->mobile.'%');
            }
            if(!empty($request->status)){
                $data = $data->where('status',$request->status);
            }

            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('name', function($row){
                           return $row->name;
                    })
                    ->addColumn('email', function($row){
                        return $row->email;
                   })
                   ->addColumn('mobile', function($row){
                    return $row->mobile;
                   })
                   ->addColumn('roles', function($row){
                    $str ='';
                        if(!empty($row->getRoleNames()))
                        {
                            foreach($row->getRoleNames() as $v)
                            {
                                $str .= '<label class="badge bg-primary">'.$v.'</label><br>';
                            }
                        }

                        return $str;
                   })
                   ->addColumn('status', function($row){
                        if(!empty($row->status))
                            return \Config::get('constants.userLoginStatus')[$row->status];
                        else
                            return "InActive";
                   })
                   ->addColumn('action', function($row){
                       $html = '';
                    $html .= '<a href="'.route('users.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">Edit</a>';
                    $html .= '<a href="'.route('users.show',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">View</a>';

                            return $html;
                    })
                    ->rawColumns(['action','roles'])
                    ->make(true);
         }else{

            $title = 'Users List';
            return view('admin.users.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'Add New User';
        $roles = Role::where('id','!=',4)->pluck('name','name')->all();
        return view('admin.users.create',compact('title','roles'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try{

           $validator = Validator::make($request->all(),[
            'name'=>'required|string|max:255',
            'email'=>'required|string|email|max:255|unique:users',
            'mobile'=>'required|string|max:255|unique:users',
            'password'=>'required|string|max:20|same:cpassword',
            'cpassword' => 'required|string|max:20',
            'roles'=>'required'
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors());
           }

          $user =  User::create([
                'name'=>$request->name,
                'email'=>$request->email,
                'mobile'=>$request->mobile,
                'password'=>Hash::make($request->password),
                'status'=>2, // active , 1 = pending , 3 => blocked
                'user_type'=>1, /// 1 = >admin
                'otp'=>rand(0000,9999),
           ]);
           $user->assignRole($request->input('roles'));
           $request->session()->flash('success','New User Added Successfully');
           return $this->success('New User Added Successfully',['nextUrl'=>route('users.index')]);

        }catch(Exception $e){
            return $this->failure($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
         $title = 'View User';
         $id = decodeId($id);
         $user = User::with('roles')->findorFail($id);
         $roles = Role::pluck('name','name')->all();

        return view('admin.users.show',compact('title','user','roles'));
    }

    public function user_wallet_balance(Request $request,$user_id)
    {       
        $getuser = User::find($user_id);
        $account_type = $getuser->account_type; 
    
        // For Demo Trading Wallet

            $demo_trade_amount = UserInvestment::where(['user_id'=>$user_id,'type'=>'demo'])->sum('amount');

            // $demo_fund_used = TradingPortfolio::where(['user_id'=>$user_id,'payment_type'=>'debit','type'=>'demo'])->sum('amount');
            
            $demo_fund_used = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->orderBy('user_trading_portfolio.id','desc')->where(['launchpaid.launc_paid_type'=>'1','user_trading_portfolio.user_id'=>$user_id])->sum('total_price');
           
            if($demo_trade_amount > $demo_fund_used)
                $demo_available_balance = $demo_trade_amount - $demo_fund_used;
            else
                $demo_available_balance = '0';

        // For Live Trading Wallet
            /*$trader_trade_amount = Wallet::where(['user_id'=>$user_id,'is_transfer'=>0,'payment_type'=>'credit','type'=>'live'])->sum('amount');

            $trader_fund_used = Wallet::where(['user_id'=>$user_id,'is_transfer'=>0,'payment_type'=>'debit','type'=>'live'])->sum('amount');*/
            
            $trader_trade_amount = UserInvestment::where(['user_id'=>$user_id,'type'=>'live'])->sum('amount');
            
            $trader_fund_used_for_buy_package = BuyPackages::where(['user_id'=>$user_id,'is_purchased'=>'2','is_launchpad_approve'=>'1','payment_wallet_type'=>'1'])->sum('price');


            $trader_fund_used_for_trading = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->orderBy('user_trading_portfolio.id','desc')->where(['launchpaid.launc_paid_type'=>'2','user_trading_portfolio.user_id'=>$user_id,'user_trading_portfolio.is_remaining_buy'=>'0'])->sum('total_price');


            $trader_fund_used = $trader_fund_used_for_buy_package + $trader_fund_used_for_trading;
            if($trader_trade_amount>$trader_fund_used)
                $trader_available_balance = $trader_trade_amount - $trader_fund_used;
            else
                $trader_available_balance = '0';

        // For Launcher Wallet
            $launcher_trade_amount_cr = LauncherWallet::where(['user_id'=>$user_id,'type'=>'credit'])->sum('amount');
            $launcher_trade_amount_dr = LauncherWallet::where(['user_id'=>$user_id,'type'=>'debit','is_transfer'=>'1'])->sum('amount');
            $launcher_trade_amount = $launcher_trade_amount_cr - $launcher_trade_amount_dr;
             
            $launcher_fund_used = LauncherWallet::where(['user_id'=>$user_id,'type'=>'debit','is_transfer'=>'0'])->sum('amount');


            if($launcher_trade_amount>$launcher_fund_used)
                $launcher_available_balance = $launcher_trade_amount_cr - $launcher_fund_used;
            else
                $launcher_available_balance = '0';
 
             // $launcher_available_balance = $launcher_trade_amount-$launcher_available_balance_1;

            $launcher_available_balance = $launcher_trade_amount - $launcher_fund_used;
            
        $launcher_credit_balance = CreditBalance::where(['user_id'=>$user_id,'status'=>'1'])->sum('amount'); 
        $launcher_credit_history_remaining_balance = CreditBalanceHistory::where(['user_id'=>$user_id,'payment_type'=>'debit'])->sum('amount'); 
        
        $launcher_credit_remaining_balance = $launcher_credit_balance - $launcher_credit_history_remaining_balance;
        $title = 'User Wallet Balance';

        return view('admin.users.wallet_balance',compact('title',
            'demo_trade_amount','demo_fund_used','demo_available_balance',
            'trader_trade_amount','trader_fund_used','trader_available_balance',
            'launcher_trade_amount','launcher_fund_used','launcher_available_balance',
            'launcher_credit_balance','launcher_credit_remaining_balance'));  
    }

    public function edit($id)
    {
        $title = 'Edit  User';
        $id = decodeId($id);
        $user = User::find($id);
        $roles = Role::where('id','!=',4)->pluck('name','name')->all(); 
        $userRole = $user->roles->pluck('name','name')->all();
        return view('admin.users.edit',compact('title','user','roles','userRole'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try{
             $id = decodeId($id);
             $user = User::find($id);

             if(empty($user))
             {
                return $this->failure('Wrong User!');
             }

           $validator = Validator::make($request->all(),[
            'name'=>'required|string|max:255',
            'status'=>'required',
            'roles'=>'required'
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors());
           }

          $user->name = $request->name;
          $user->status = $request->status ?? 2;
          $user->save();
          DB::table('model_has_roles')->where('model_id',$id)->delete();
          $user->assignRole($request->input('roles'));
          $request->session()->flash('success','Admin Panel User Details Updated');
          return $this->success('User Details Updated',['nextUrl'=>route('users.index')]);

        }catch(Exception $e){
            return $this->failure($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {

        return $this->failure('This feature is disabled by developer');
        if(empty($id))
        {
            return $this->failure('Invalid Details');
        }
        $id = decodeId($id);
        $row = User::find($id);
         if(empty($row))
        {
         return $this->failure('Invalid Details');
        }
        if($row->delete()){
            return $this->success('Deleted Successfully');
        }
        return $this->failure('Something Went Wrong!');

    }
}
