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
                        $html .= '<a href="javascript:;" data-click-accept="'.route('withdrawal_status',[encodeId($row->id),'accept']).'" class="btn btn-outline-success m-2 btn-sm ">Approved</a>';
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
                    $wallet->payment_type = 'debit';
                    $wallet->type = 'live';
                    $wallet->status = 'Successful';
                    $wallet->remark = 'Withdraw Request Accepted';
                    $wallet->save();

                    
                    User::where(['id' => $user_id])->decrement('tradding_live_wallet', $withRequest->amount);

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
    /*** Payment Transactions  */
    public function user_payment_transaction(Request $request)
    {

         if($request->ajax())
         {
            $data = Transactions::where('transaction_type','1')->with('user')->whereHas('user', function($q) use ($request)
            {
                if(!empty($request->name)){
                    $q = $q->where('user','like','%'.$request->name.'%');
                }
                if(!empty($request->type)){
                    $q = $q->where('user_type','=',$request->type);
                }

            });

            if(!empty($request->txn_id)){
                $data = $data->where('txn_id','like','%'.$request->txn_id.'%');
            }
            if(!empty($request->status)){
                $data = $data->where('status',$request->status);
            }

            $data = $data->latest();
            return Datatables::of($data)
                   ->addIndexColumn()
                  ->addColumn('name', function($row){
                        return $row->user->name;
                   })
                   ->addColumn('type', function($row){
                    return \Config::get('constants.userLoginType')[$row->user->user_type];
                    })
                   ->addColumn('amount', function($row){
                       return $row->amount;
                   })->addColumn('txn_id', function($row){
                    return $row->txn_id;
                   })->addColumn('txn_date', function($row){
                    return $row->txn_date;
                   })
                   ->addColumn('txn_method', function($row){
                    return $row->txn_method;
                   })
                   ->addColumn('txn_status', function($row){
                    return $row->txn_status;
                   })
                   ->rawColumns(['action','roles','user_type'])
                    ->make(true);
         }else{

            $title = 'User Payment Transactions';
            return view('admin.withdrawalrequest.user_payment_transaction',compact('title'));
         }



    }


    public function transfer_money_transaction(Request $request)
    {
        if($request->ajax())
        {
           $data = Transactions::whereHas('userMessages',function($query) use ($request)  {
            if(!empty($request->name))
            {
                $query = $query->where('name','like','%'.$request->name.'%');
            }

        })->where('transaction_type','2')->with('user')->latest();

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
