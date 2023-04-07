<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\Banner;
use Illuminate\Support\Str;
use App\Models\WithdrawalRequest;
use App\Models\Wallet;
use App\Models\LauncherWallet;
use App\Models\Transactions;
use App\Models\CreditBalanceHistory;

class UserTransactionController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){

    }  

    public function history_user_transaction(Request $request)
    {      

         if($request->ajax())
         {
            $user_ids1 = Wallet::groupBy('user_id')->pluck('user_id')->toArray();
            $user_ids2 = LauncherWallet::groupBy('user_id')->pluck('user_id')->toArray(); 
            $user_ids = array_merge($user_ids1,$user_ids2);

            $buyUserIdArr = (count($user_ids)>0) ? array_unique($user_ids) : [];

            $data = User::orderBy('id','desc')->whereIn('id',$buyUserIdArr)->get();

            if(!empty($request->type)){ 
                $data = $data->where('user_type',$request->type);
            }
            if(!empty($request->name)){
                $data = $data->where('name','like','%'.$request->name.'%');
            }
            if(!empty($request->email)){
                $data = $data->where('email','like','%'.$request->email.'%');
            }
            if(!empty($request->mobile)){
                $data = $data->where('mobile','like','%'.$request->mobile.'%');
            } 

            return Datatables::of($data)                     
                    ->addIndexColumn()->addColumn('profile', function($row){
                        
                            if(isset($row->profile)){
                                return '<a href="'.asset($row->profile).'" target="_blank">
                                            <img src="'.asset($row->profile).'" style="width: 35px;" />
                                        </a>';
                            }else{
                                return '<a href="'.asset("uploads/blank_user.png").'" target="_blank">
                                            <img src="'.asset("uploads/blank_user.png").'" style="width: 35px;" />
                                        </a>';
                            }
                    })            
                    ->addIndexColumn()->addColumn('name', function($row){
                           return $row->name;
                    })
                    ->addColumn('email', function($row){
                        return $row->email;
                   })
                   ->addColumn('mobile', function($row){
                    return $row->mobile;
                   })
                   ->addColumn('user_type', function($row){
                        // return \Config::get('constants.userLoginType')[$row->user_type];

                        if($row->user_type==1){
                            return "Admin";
                        }else if($row->user_type==2){
                            return "Trader";
                        }else if($row->user_type==3){
                            return "Launcher";
                        }else{ return ""; }
                    })
                   ->addColumn('status', function($row){ 
                        $act_status="";
                        if($row->status=='2'){
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" checked value="2" class="common_status_update ch_input"
                                 title="Active" data-id="'.$row->id.'" data-action="user"  />
                                <span></span>
                            </label>';
                            $act_status="Active";
                        }else{
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" value="1" class="common_status_update ch_input"
                                 title="Inactive" data-id="'.$row->id.'" data-action="user"  />
                                <span></span>
                            </label>';
                            $act_status="InActive";
                        }
                        return $crr.' '.'<span id="act_txt_'.$row->id.'">'.$act_status.'</span>';
                   })
                   ->addColumn('action', function($row){

                       $html = ''; 
                       $html .= '<a href="'.route('history_user_payment_transaction',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';
                        
                        return $html; 
                    })
                    ->rawColumns(['profile','action','roles','status','user_type','id'])
                    ->make(true); 
         }else{

            $title = 'User Transaction History';
            return view('admin.transaction_history.user_transaction',compact('title'));
         }
 
    }

    public function history_user_payment_transaction(Request $request,$user_id="")
    {  
        if($request->ajax())
        {   
            if($request->type=='1'){ // Tradding Wallet Txn 
                 $data = Wallet::where('type','live')->where('user_id',$request->user_id);   
            }else{  // Launcher Wallet Txn 
                $data = LauncherWallet::where('user_id',$request->user_id);  
            } 
            if($request->type=='1'){
                 $data->select(['id','is_transfer','amount','payment_type as type','status','remark','created_at']);
            }else{
                $data->select(['id','is_transfer','amount','type','status','remark','created_at']);
            }
            $data = $data->latest();

            return Datatables::of($data)
                   ->addIndexColumn() 
                   ->addColumn('amount', function($row){
                       return config('app.currency').$row->amount;
                   })->addColumn('type', function($row){
                        if($row->type=='credit'){
                            return '(+)credit';
                        }else{
                            return '(-)debit';
                        } 
                   }) 
                   ->addColumn('is_transfer', function($row){
                        return ($row->is_transfer=='1') ? 'Yes' : 'No';
                   })
                   ->addColumn('status', function($row){
                        if($row->status=='1'){
                            return "Successfull";
                        }else if($row->status=='0'){
                            return "Pending";
                        }else{
                            return  $row->status;
                        } 
                   })
                   ->addColumn('created_at', function($row){
                           return date('d F Y,h:m A',strtotime($row->created_at));
                    }) 
                   ->rawColumns(['is_transfer','status'])
                   ->make(true);
         }else{
 
            $title = 'Wallet Transactions History'; 
            return view('admin.transaction_history.user_payment_transaction',compact('title','user_id'));
         }
 
    } 
    


    public function credited_users(Request $request)
    {  
         if($request->ajax())
         {
            $buyUserIdArr = CreditBalanceHistory::groupBy('user_id')->pluck('user_id')->toArray(); 

            $data = User::orderBy('id','desc')->whereIn('id',$buyUserIdArr)->get();

            if(!empty($request->type)){ 
                $data = $data->where('user_type',$request->type);
            }
            if(!empty($request->name)){
                $data = $data->where('name','like','%'.$request->name.'%');
            }
            if(!empty($request->email)){
                $data = $data->where('email','like','%'.$request->email.'%');
            }
            if(!empty($request->mobile)){
                $data = $data->where('mobile','like','%'.$request->mobile.'%');
            } 

            return Datatables::of($data)                     
                    ->addIndexColumn()->addColumn('profile', function($row){
                        
                            if(isset($row->profile)){
                                return '<a href="'.asset($row->profile).'" target="_blank">
                                            <img src="'.asset($row->profile).'" style="width: 35px;" />
                                        </a>';
                            }else{
                                return '<a href="'.asset("uploads/blank_user.png").'" target="_blank">
                                            <img src="'.asset("uploads/blank_user.png").'" style="width: 35px;" />
                                        </a>';
                            }
                    })            
                    ->addIndexColumn()->addColumn('name', function($row){
                           return $row->name;
                    })
                    ->addColumn('email', function($row){
                        return $row->email;
                   })
                   ->addColumn('mobile', function($row){
                    return $row->mobile;
                   })
                   ->addColumn('user_type', function($row){
                        return \Config::get('constants.userLoginType')[$row->user_type];
                    })
                   ->addColumn('status', function($row){ 
                        $act_status="";
                        if($row->status=='2'){
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" checked value="2" class="common_status_update ch_input"
                                 title="Active" data-id="'.$row->id.'" data-action="user"  />
                                <span></span>
                            </label>';
                            $act_status="Active";
                        }else{
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" value="1" class="common_status_update ch_input"
                                 title="Inactive" data-id="'.$row->id.'" data-action="user"  />
                                <span></span>
                            </label>';
                            $act_status="InActive";
                        }
                        return $crr.' '.'<span id="act_txt_'.$row->id.'">'.$act_status.'</span>';
                   })
                   ->addColumn('action', function($row){

                       $html = ''; 
                       $html .= '<a href="'.route('user_credit_balance_history',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';
                        
                        return $html; 
                    })
                    ->rawColumns(['profile','action','roles','status','user_type','id'])
                    ->make(true); 
         }else{

            $title = 'User Credit History';
            return view('admin.transaction_history.user_credit',compact('title'));
         }
 
    }

    public function user_credit_balance_history(Request $request,$user_id="")
    {  
        if($request->ajax())
        {   
            $data = CreditBalanceHistory::where('user_id',$request->user_id)->select(['id','amount','payment_type','remark','created_at']);
            
            $data = $data->latest();

            return Datatables::of($data)
                   ->addIndexColumn() 
                   ->addColumn('amount', function($row){
                       return config('app.currency').$row->amount;
                   })->addColumn('payment_type', function($row){
                        if($row->payment_type=='credit'){
                            return '(+)credit';
                        }else{
                            return '(-)debit';
                        } 
                   })  
                   ->addColumn('created_at', function($row){
                           return date('d F Y,h:m A',strtotime($row->created_at));
                    }) 
                   ->rawColumns(['payment_type'])
                   ->make(true);
         }else{
 
            $title = 'Credit History'; 
            $page_type="cr_history";
            return view('admin.transaction_history.user_credit_balance_history',compact('title','user_id','page_type'));
         } 
    } 

}
