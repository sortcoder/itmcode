<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\StockExchange;
use App\Models\CreditBalance;
use App\Models\CreditBalanceHistory;
use App\Models\Notification;
use DB;
use Mail; 
use App\Helpers\ApiHelper; 

class AppUserController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:User-Management');
    }
    
    public function index(Request $request)
    { 
         if($request->ajax())
         {
            $data = User::whereIn('user_type',[2,3])->latest();

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
            if(!empty($request->user_type)){
                $data = $data->where('user_type',$request->user_type);
            }
            return Datatables::of($data)
                // ->addColumn('id', function($row){
                //     //   return '<div class="form-check form-check-inline">
                //     //              <input class="form-check-input user_id" name="user_id[]" type="checkbox" id="inlineCheckbox'.$row->id.'" value="'.$row->id.'">
                //     //            <label class="form-check-label" for="inlineCheckbox'.$row->id.'"></label></div>';

                //  })

                    
                    ->addIndexColumn()->addColumn('profile', function($row){
                        
                           if(isset($row->profile)){
                                return '<a href="'.asset($row->profile).'" target="_blank">
                                            <img src="'.asset($row->profile).'" style="width: 70px;height: 70px; border-radius: 41px;" />
                                        </a>';
                            }else{
                                return '<a href="'.asset("uploads/blank_user.png").'" target="_blank">
                                            <img src="'.asset("uploads/blank_user.png").'" style="width: 70px; height: 70px; border-radius: 41px;" />
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
                    ->addColumn('kyc_status', function($row){
                        $checked = '';
                        /*if($row->kyc_status == 2)
                        {
                            $html = '<span class="badge bg-success">Approved</span>';

                        }else{
                            $html ='<div class="form-check-danger form-check form-switch">
                                        <input class="form-check-input" type="checkbox" data-checkbox-status="'.route('appuser.destroy',[encodeId($row->id)]).'?change_kyc_status=true"  id="flexSwitchCheckCheckedDanger'.$row->kyc_status.'" '.$checked.'>
                                        <label class="form-check-label" for="flexSwitchCheckCheckedDanger'.$row->kyc_status.'"></label>
                                    </div>';
                        }
                        return $html;*/

                        $pending_st = ($row->kyc_status=="1") ? 'selected' : "";
                        $approve_st = ($row->kyc_status=="2") ? 'selected' : "";
                        $reject_st = ($row->kyc_status=="3") ? 'selected' : "";

                        $is_disabled = ($row->kyc_status=="2") ? 'disabled' : '';

                        /*if($row->kyc_status == 2){
                            return $html = '<span class="badge bg-success">Approved</span>';
                        }else{*/
                            return $crr = '<select '.$is_disabled.' class="form-control form-control-sm status common_status_update"  name="common_status_update" data-id="'.$row->id.'" data-action="user_kyc"  > 
                                        <option '.$pending_st.' value="1">Pending</option>
                                        <option '.$approve_st.' value="2">Approve</option>
                                        <option '.$reject_st.' value="3">Reject</option>
                                    </select>';
                        // } 

                    })
                   ->addColumn('status', function($row){
                        // return \Config::get('constants.userLoginStatus')[$row->status];
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
                      // $html .= '<a href="'.route('appuser.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">Edit</a>';
                       $html .= '<a href="'.route('appuser.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';
                       /*$html .= '<a href="'.route('appuser_tradding_wallet',[encodeId($row->id)]).'" class="btn btn-outline-info ml-2 btn-sm ">Trading wallet</a>';*/
                       $html .= '<a href="'.route('portfolio-list',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">Portfolio</a>';
                       $html .= '<a href="'.route('user_wallet_balance',[encodeId($row->id)]).'" class="btn btn-outline-info m-2 btn-sm ml-2">Wallet Balance</a>';
                     //  $html .= '<a href="javascript:;" data-active-alert="'.route('appuser.destroy',[encodeId($row->id)]).'?usertype=1" class="btn btn-outline-secondary ml-2 btn-sm ">Change Status</a>';
                        return $html;
                    })
                    ->rawColumns(['profile','action','roles','status','user_type','id','kyc_status'])
                    ->make(true);
         }else{
            $title = 'App Users List';
            return view('admin.appuser.index',compact('title'));
         } 
    }


    public function launcher_list(Request $request)
    {    
        if($request->ajax())
         {
            $data = User::where('user_type',3)->orWhere('kyc_status',2)->latest();

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
            if(!empty($request->user_type)){
                $data = $data->where('user_type',$request->user_type);
            }
            return Datatables::of($data) 
                    ->addColumn('id', function($row){
                        /*if($row->approve_status == 2)
                        {*/
                            return '<div class="form-check form-check-inline">
                        <input class="form-check-input user_id" name="user_id[]" type="checkbox" id="inlineCheckbox'.$row->id.'" value="'.$row->id.'">
                        <label class="form-check-label" for="inlineCheckbox'.$row->id.'"></label></div>';
                        // }else{
                        //     return '';
                        // }

                    })
                    ->addColumn('profile', function($row){
                        
                           if(isset($row->profile)){
                                return '<a href="'.asset($row->profile).'" target="_blank">
                                            <img src="'.asset($row->profile).'" style="width: 70px;height: 70px; border-radius: 41px;" />
                                        </a>';
                            }else{
                                return '<a href="'.asset("uploads/blank_user.png").'" target="_blank">
                                            <img src="'.asset("uploads/blank_user.png").'" style="width: 70px; height: 70px; border-radius: 41px;" />
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
                   ->addColumn('credit_wallet_balance', function($row){
                        $credit_wallet_balance = CreditBalance::where('user_id',$row->id)->sum('amount');
                        return @$credit_wallet_balance;
                   })
                   
                   ->addColumn('user_type', function($row){ 
                        return \Config::get('constants.userLoginType')[$row->user_type]; 
                    })
                   ->addColumn('action', function($row){ 
                       $html = ''; 
                       $html .= '<a href="'.route('user_credit_balance_history',$row->id).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>'; 
                        return $html;
                    })
                    ->rawColumns(['mobile','profile','action','roles','user_type','id','kyc_status','credit_wallet_balance'])
                    ->make(true);
         
            // dsf
         }else{
            $title = 'Credit Balance';
            return view('admin.appuser.launcher_list',compact('title'));
         }



    }

    public function status_update(Request $request)
    {   
        request()->validate([
            'record_id' => 'required|integer',  
            'status' => 'required|integer', 
        ]);
        
        $getChek = User::where('id',$request->record_id)->first(['status']);
        $up_sta = ($getChek->status=='2') ? '1' : '2';
        User::where('id',$request->record_id)->update(array('status'=>$up_sta));
         
        return response()->json(['status'=>1,'message'=>'User status updated.','user_status'=>$up_sta]); 
    } 


    public function kyc_status_update(Request $request)
    {   
        request()->validate([
            'record_id' => 'required|integer',  
            'status' => 'required|integer', 
        ]);
            
            $id = $request->record_id;
            $row = User::find($id);

            $status = $request->status;
            $row->kyc_status = $status; 
            
            if($status==2){  // for kyc approve
        
                $row->user_type = 3; 
                

            }else if($status==3){

                $row->pan_card_no = "";
                $row->pan_card_img = "";
                $row->aadhar_back_img = "";
                $row->aadhar_front_img = "";
                $row->aadhar_card_no = "";
                $row->profile = "uploads/blank_user.png";
                $row->signature = "";

            }  
            if($row->save()){
                if($status==3){  
                    $user_id = $id;
                    $title = "KYC rejeted by ".config('app.name');
                    $message = "Hello ".$row->name.", Your KYC is rejected by ".config('app.name');

                    $row = new Notification;
                    $row->title = $title;
                    $row->desc = $message;
                    $row->save();

                    $send = ApiHelper::sendNotification($user_id,$message,$message); 

                    return response()->json(['status'=>1,'message'=>'KYC rejected.','user_status'=>$status]); 
                
                }else if($status==2){

                    // if($row->user_type=='3'){ // for Launcher Account
                    $creditRow = new CreditBalance;
                    $creditRow->user_id = $id;
                    $creditRow->amount = settingConfig('ADD_CREDIT_BALANCE');
                    $creditRow->remaining_balance = settingConfig('ADD_CREDIT_BALANCE'); 
                    $creditRow->status = 1; // credit to credit balance;
                    $creditRow->save();

                    $creditHistory = new CreditBalanceHistory;
                    $creditHistory->user_id = $id;
                    $creditHistory->payment_type = 'credit';
                    $creditHistory->amount = settingConfig('ADD_CREDIT_BALANCE'); // package                
                    $creditHistory->remark = "Amount credited by Admin";
                    $creditHistory->save();
                // }

                if($row->mobile != ""){
                    $user_id = $row->id;
                    $title = "KYC Approved by ".config('app.name');
                    $message = "Hello ".$row->name.", Your KYC is approved by ".config('app.name');

                    $row = new Notification;
                    $row->title = $title;
                    $row->desc = $message;
                    $row->save();

                    $send = ApiHelper::sendNotification($user_id,$message,$message);  
                }
                if($row->email != ""){
                    
                    $data["user_name"] = $row->name;  
                    $data["email"] = $row->email;  
                    $data["title"] = "KYC approved Mail By ".config('app.name'); 
                    $data["body"] = "Your KYC is approved by ".config('app.name'); 

                    Mail::send('emails.commonMail', $data, function($message)use($data) {
                        $message->to($data["email"], $data["email"])
                            ->subject($data["title"]);
                    });

                }

                   return response()->json(['status'=>1,'message'=>'KYC approved.','user_status'=>$status]);
                }else{
                   return response()->json(['status'=>1,'message'=>'KYC pending.','user_status'=>$status]);
                }
            } 
        
    } 
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        echo 'not available this page';die;
        $title = 'New User';
        return view('admin.appuser.create',compact('title'));
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
             'username'=>'required|string|max:255',
             'email'=>'required|string|email|max:255|unique:users',
             'mobile'=>'required|string|max:255|unique:users',
             'father_name'=>'required',
             'mother_name'=>'required',
             'gender'=>'required',
             'dob'=>'required',
             'marital_status'=>'required',
             'profession'=>'required',
            'user_type'=>'required'
            ]) ;

            if($validator->fails())
            {
                 return $this->failure($validator->errors()->first());
            }

            if(!empty($request->pan_card_no))
            {
                $validator = Validator::make($request->all(),[
                    'pan_card_no'=>'required|string|max:255',
                    're_pan_card_no' => 'required|same:pan_card_no',
                    'pan_card_img'=>'required',
                   ]) ;

                   if($validator->fails())
                   {
                        return $this->failure($validator->errors()->first());
                   }
            }

            if(!empty($request->aadhar_card_no))
            {
                $validator = Validator::make($request->all(),[
                    'aadhar_card_no'=>'required|string|max:255',
                    're_aadhar_card_no' => 'required|same:aadhar_card_no',
                    'aadhar_back_img'=>'required',
                    'aadhar_front_img'=>'required',
                   ]) ;

                   if($validator->fails())
                   {
                        return $this->failure($validator->errors()->first());
                   }
            }





            $row = new User;
            $row->name = $request->name;
            $row->username = $request->username;
            $row->father_name = $request->father_name;
            $row->mother_name = $request->mother_name;
            $row->email = $request->email;
            $row->mobile = $request->mobile;
            $row->password = Hash::make('password');
            $row->gender = $request->gender;
            $row->dob = !empty($request->dob)?date('Y-m-d',strtotime($request->dob)):'';
            $row->marital_status = $request->marital_status;
            $row->profession = $request->profession;
            $row->address_one = $request->address_one;
            $row->address_two = $request->address_two;
            $row->state = $request->state;
            $row->pincode = $request->pincode;
            $row->district = $request->district;
            $row->city = $request->city;
            $row->status = 2; // active
            $row->user_type = $request->user_type;
            $row->otp = rand(0000,9999);
            // pancard
            $row->pan_card_no = $request->pan_card_no;
            $row->pan_card_img = $request->pan_card_img;

            // aadhar
            $row->aadhar_back_img = $request->aadhar_back_img;
            $row->aadhar_front_img = $request->aadhar_front_img;
            $row->aadhar_card_no = $request->aadhar_card_no;


            // profile / signature
            $row->profile = $request->profile;
            $row->signature = $request->signature;

            /// launcher data

            $row->save();
           $request->session()->flash('success','New User Added Successfully');
           return $this->success('New User Added Successfully',['nextUrl'=>route('appuser.index')]);

         }catch(Exception $e){
             Log::info($e->getMessage());
             return $this->failure('Something Went Wrong!');
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
        $title = 'Edit  User';
        $id = decodeId($id);
        $user = User::find($id);
        return view('admin.appuser.show',compact('title','user'));
    }
 


    public function edit($id)
    {
        $title = 'Edit  User';
        $id = decodeId($id);
        $user = User::find($id);
        return view('admin.appuser.edit',compact('title','user'));
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    { 
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

        if(!empty($_GET['usertype']))
        {
            $status = ($row->status == 2)?3:2;
            $row->status = $status;
            if($row->save()){
                return $this->success('User Status Updated Successfully');
            }
        }else{
            if($row->delete()){
                return $this->success('User Deleted Successfully');
            }
        }

        return $this->failure('Something Went Wrong!');

    }


    public function appuser_tradding_wallet($slug){
        $encodeId = decodeId($slug);
        $findUser = User::with('tradding_wallet')->findOrFail($encodeId);
        return view('admin.appuser.wallet',compact('findUser'));
    }
}
