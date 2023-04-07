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
use App\Models\Transactions;
class WithdrawalRequestController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){

    }
    public function index(Request $request)
    { 
         if($request->ajax())
         {
            $data = WithdrawalRequest::with('user')->latest();


            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('created_at', function($row){
                           return $row->created_at;
                     })
                    ->addColumn('name', function($row){
                        return $row->user->name;
                   }) ->addColumn('user_type', function($row){
                    return $row->user->user_type;
               })
                   ->addColumn('amount', function($row){
                    return $row->amount;
                   }) ->addColumn('wallet', function($row){
                    return $row->amount;
                   })
                   ->addColumn('amount', function($row){
                    return $row->amount;
                   })
                   ->addColumn('status', function($row){
                    return \Config::get('constants.withdrawalRequest')[$row->status];
                     })

                   ->addColumn('action', function($row){
                       $html = '';
                       if($row->status == 1){
                           /* $html .= '<a href="javascript:;" data-click-accept="'.route('withdrawal_status',[encodeId($row->id),'accept']).'" class="btn btn-outline-success m-2 btn-sm ">Approved</a>';*/

                            $html .= '<button type="button" class="btn btn-outline-primary m-2 btn-sm ml-2 add_bank_detail_in_modal" data-bs-toggle="modal" data-bs-target="#myAddBankDetailModal" data-id="'.$row->id.'" >
                                        Approved
                                    </button>';   

                            $html .= '<a href="javascript:;" data-click-reject="'.route('withdrawal_status',[encodeId($row->id),'reject']).'" class="btn btn-outline-danger m-2 btn-sm ">Reject</a>';
                        }
                        return $html;
                    })
                    ->rawColumns(['action','roles','user_type'])
                    ->make(true);
         }else{

            $title = 'Withdraw Request List';
            return view('admin.withdrawalrequest.index',compact('title'));
         }



    }


    public function withdrawal_status($encodeId,$type)
    {
        try{
            $id = decodeId($encodeId);
            $withRequest = WithdrawalRequest::find($id);
            if(empty($withRequest))
            {
                return $this->failure('Request Not Found');
            }

            if($withRequest->status == 2)
            {
                return $this->failure('Withdraw Request Already Processed');
            }
            // Refresh Wallet Balance ///
            // Wallet::totalLiveWalletBal($withRequest->user_id);
            $findUser = User::find($withRequest->user_id);
            if(empty($findUser))
            {
                return $this->failure('Invalid Request User ');
            }



            $msg = 'Done!';
            if($type == 'accept')
            {
                 /*** Check Request Wallet Balance is available or not  **/

                if($withRequest->amount > $findUser->tradding_live_wallet)
                {
                    return $this->failure('Insufficient Fund in Wallet '.$withRequest->tradding_live_wallet);
                }

                $withRequest->status = 2;
                if($withRequest->save()){
                    $wallet = new Wallet;
                    $wallet->user_id = $withRequest->user_id;
                    $wallet->amount = $withRequest->amount;
                    $wallet->payment_type = 'credit';
                    $wallet->type = 'live';
                    $wallet->status = 'Successful';
                    $wallet->remark = 'Withdraw Request Accepted';
                    $wallet->save();

                    
                    User::where(['id' => $withRequest->user_id])->increment('tradding_live_wallet', $withRequest->amount);

                    $msg = 'Withdraw Request Accepted Successfully';
                    return $this->success($msg);
                }else{
                    $msg = 'Something Went Wrong!';
                    return $this->failure($msg);
                } 

            }else if($type == 'reject'){
                $withRequest->status = 3;
                $msg = 'Withdraw Request Rejected Successfully';
                $withRequest->save();
                return $this->success($msg);
            } 

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function withdraw_request_approve(Request $request)
    { 
        if($request->record_id){ 

            $payment_status = $request->input('process_status');

            $res_data = WithdrawalRequest::find($request->record_id);
            $res_data->bank_name = $request->input('bank_name');
            $res_data->account_no = $request->input('account_no');
            $res_data->txn_id = $request->input('txn_id');
            $res_data->txn_date = $request->input('txn_date');
            $res_data->process_status = $request->input('process_status');
            $res_data->payment_method = $request->input('payment_method');
            if($payment_status=="Successfull"){
                $res_data->status = '2';  // means Approve
            }
            $res_data->txn_status = $payment_status;  
            $res_data->save();
            if($payment_status == "Successfull"){
                return response()->json(['status'=>1,'message'=>'Withdraw request approved successfully.' ]);
            }else{
                return response()->json(['status'=>1,'message'=>'Withdraw request is '.strtolower($payment_status) ]);
            }
        } 
        return response()->json(['status'=>0,'message'=>'Record submission failed.' ]);

    }

    /*** Payment Transactions  */
    
    public function user_transaction(Request $request)
    {    
         if($request->ajax())
         {
            $user_ids1 = Transactions::groupBy('user_id')->pluck('user_id')->toArray();
            $user_ids2 = WithdrawalRequest::groupBy('user_id')->pluck('user_id')->toArray(); 
            $user_ids = array_merge($user_ids1,$user_ids2);

            $buyUserIdArr = (count($user_ids)>0) ? array_unique($user_ids) : [];

            $data = User::whereIn('id',$buyUserIdArr)->latest();

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
                       $html .= '<a href="'.route('user_payment_transaction',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';
                        
                        return $html; 
                    })
                    ->rawColumns(['profile','action','roles','status','user_type','id'])
                    ->make(true); 
         }else{

            $title = 'User Payment Transaction';
            return view('admin.withdrawalrequest.user_transaction',compact('title'));
         }
 
    }

    public function user_payment_transaction(Request $request,$user_id="")
    { 
        if($request->ajax())
        {
            if($request->type=='2'){ // Withdraw Money
                // $data = WithdrawalRequest::where('process_status','In Progress');
                 $data = WithdrawalRequest::where('status','2'); // Approve by Admin
                // $data = new WithdrawalRequest;
            }else{  // Add Money
                $data = Transactions::where('transaction_type',$request->type);  
            }
            if(!empty($request->txn_id)){
                $data = $data->where('txn_id','like','%'.$request->txn_id.'%');
            } 
            $data = $data->where('user_id',$request->user_id)->latest();

            return Datatables::of($data)
                   ->addIndexColumn()
                  ->addColumn('txn_id', function($row){
                        return $row->txn_id;
                   }) 
                   ->addColumn('amount', function($row){
                       return $row->amount;
                   })->addColumn('txn_date', function($row){
                        return $row->txn_date;
                   }) 
                   ->addColumn('payment_method', function($row){
                        return $row->payment_method;
                   })
                   ->addColumn('created_at', function($row){
                           return date('d F Y,h:m A',strtotime($row->created_at));
                     })
                   ->addColumn('action', function($row){ 
 
                        return '<button type="button" class="btn btn-outline-primary m-2 btn-sm ml-2 view_in_modal" data-bs-toggle="modal" data-bs-target="#myModal" data-id="'.$row->id.'" >
                                    View
                                </button>';    

                   })
                   ->rawColumns(['action'])
                   ->make(true);
         }else{
 
            $title = 'User Payment Transactions'; 
            return view('admin.withdrawalrequest.user_payment_transaction',compact('title','user_id'));
         }
 
    }

    public function get_txn_data(Request $request)
    {   
        if($request->record_id){
            if($request->txn_type==2){ // For Withdraw Money Txn 
                $get_data = WithdrawalRequest::where('id',$request->record_id)->get()->toArray();
                if($get_data[0]['txn_date']!="")
                    $get_data[0]['created_at'] = date('d F Y,h:m A',strtotime($get_data[0]['txn_date']));
                else
                    $get_data[0]['created_at'] = "";
            }else{ 
                $get_data = Transactions::where('id',$request->record_id)->get()->toArray(); 
                $get_data[0]['created_at'] = date('d F Y,h:m A',strtotime($get_data[0]['created_at']));
            }
            return response()->json(['status'=>1,'message'=>'Record Found.','result'=>$get_data]);
        }else{
            return response()->json(['status'=>0,'message'=>'No Record Found.','result'=>array() ]);
        }  
    } 

    public function transfer_money_transaction(Request $request)
    {
        if($request->ajax())
        {
           $data = Transactions::with('user')->whereHas('user',function($query) use ($request)  {
            if(!empty($request->name))
            {
                $query = $query->where('name','like','%'.$request->name.'%');
            }

        })->where('transaction_type','2')->latest();

            if(!empty($request->txn_id)){
                $data = $data->where('txn_id',$request->txn_id);
            }

            if(!empty($request->status)){
                  $data = $data->where('status',$request->status);
            }
      
           return Datatables::of($data)
                  ->addIndexColumn()
                 ->addColumn('name', function($row){
                       return $row->user->name;
                  })->addColumn('amount', function($row){
                      return $row->amount;
                  })->addColumn('status', function($row){
                    return $row->status;
                })->addColumn('txn_id', function($row){
                   return $row->txn_id;
                  })->addColumn('txn_date', function($row){
                   return $row->txn_date;
                  })
                  ->addColumn('txn_method', function($row){
                   return $row->txn_method;
                  })

                  ->rawColumns(['action','roles','user_type'])
                   ->make(true);
        }else{

           $title = 'Transfer Money Transaction';
           return view('admin.withdrawalrequest.transfer_money_transaction',compact('title'));
        }

    }
}
