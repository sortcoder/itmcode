<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lauchpaid;

use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\Wallet; // for trading wallet
use App\Models\CreditBalance;
use App\Models\LauncherWallet; 
use App\Models\BuyPackages;
use App\Models\LaunchpaidData;
use App\Models\Package;
use App\Models\Designation;
use App\Models\CreditBalanceHistory;
use App\Models\TradingPortfolio; 
use App\Helpers\ApiHelper;
use Auth;
use DB;
class LaunchpaidController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:Launch-Paid-Management');
    }



    public function live_launcher(Request $request){
        if($request->ajax())
         {
            $data = Lauchpaid::with('credit_balance_launcher_wise')->whereHas('user', function($q) use ($request)
            {
                if(!empty($request->name)){
                    $q = $q->where('name','like','%'.$request->name.'%');
                }
                if(!empty($request->email)){
                    $q = $q->where('email','like','%'.$request->email.'%');
                }
                if(!empty($request->mobile)){
                    $q = $q->where('mobile','like','%'.$request->mobile.'%');
                }

            })
            ->latest()->where('launc_paid_type',2);

            // if(!empty($_GET['created_by']))
            // {
            //  $data = $data->where('created_by',Auth::user()->id) ;
            // }


            if(!empty($request->approve_status)){
                $data = $data->where('approve_status',$request->approve_status);
            }
            if(!empty($request->launch_sketch)){
                $data = $data->where('launch_sketch',$request->launch_sketch);
            }
            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('user_id', function($row){
                        return !empty($row->user_id)?User::find($row->user_id)->name:'';
                    })
                    ->addColumn('mobile', function($row){
                        return !empty($row->user_id)?User::find($row->user_id)->mobile:'';
                     })

                   ->addColumn('email', function($row){
                         return !empty($row->user_id)?User::find($row->user_id)->email:'';
                    })

                    ->addColumn('launch_sketch', function($row){
                        return $row->launch_sketch;
                    })
                    ->addColumn('launch_image', function($row){
                        if(isset($row->launch_image)){
                            return '<a href="'.asset($row->launch_image).'" target="_blank">
                                        <img src="'.asset($row->launch_image).'" style="width: 50px;" />
                                    </a>';
                        }else{
                            return '<a href="'.url('assets/admin/images/noimage.png').'" target="_blank">
                                        <img src="'.url('assets/admin/images/noimage.png').'" style="width: 50px;" />
                                    </a>';
                        }
                    })
                    ->addColumn('launch_designation', function($row){
                        return $row->launch_designation;
                    })
                    ->addColumn('package_name', function($row){
                        $findAlreadyPurchase = BuyPackages::where('is_purchased',2)->where([
                            'lauch_id'=>$row->id, 
                            'user_id'=>$row->user_id,
                        ])->first();

                        $package_id = $findAlreadyPurchase->package_id ?? "";
                        $getPack = Package::where(['id'=>$package_id])->first();
                        return $getPack->description ?? "";
                    })
                    ->addColumn('package_quantity', function($row){
                        $findAlreadyPurchase = BuyPackages::where('is_purchased',2)->where([
                            'lauch_id'=>$row->id, 
                            'user_id'=>$row->user_id,
                        ])->first(); 
                        return @$findAlreadyPurchase->quanity ?? '0';
                    })
                    ->addColumn('package_purchase_status', function($row){
                        $findAlreadyPurchase = BuyPackages::where('is_purchased',2)->where([
                            'lauch_id'=>$row->id, 
                            'user_id'=>$row->user_id,
                        ])->first();
                        return (!empty($findAlreadyPurchase)) ? 'Paid' : 'Unpaid';
                    })
                    ->addColumn('approve_status', function($row){
                        if($row->approve_status == 2)
                        {
                            return '<span class="badge bg-success">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';
                        }else if($row->approve_status == 3)
                        {
                            return '<span class="badge bg-danger">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';

                        }else{
                            return '<span class="badge bg-info">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';
                        }
                      return \Config::get('constants.launcherStatus')[$row->approve_status];
                })

                   ->addColumn('action', function($row){

                       $html = '';
                       $html .= '<a href="'.route('launchpaid.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ">View</a>';
                       if($row->approve_status == 1){
                          $html .= '<a href="javascript:;" data-click-accept="'.route('launcher_status',[encodeId($row->id),'accept']).'" class="btn btn-outline-success m-2 btn-sm ">Approve</a>';
                          $html .= '<a href="javascript:;" data-click-reject="'.route('launcher_status',[encodeId($row->id),'reject']).'" class="btn btn-outline-danger m-2 btn-sm ">Reject</a>';
                       }
                        return $html;
                    })
                    ->rawColumns(['action','id','approve_status','package_purchase_status','launch_image'])
                    ->make(true);
         }else{

            $title = 'User launcher Image';
            $createdby = !empty($_GET['created_by'])?'?created_by='.$_GET['created_by']:'';
            return view('admin.launchpaid.live',compact('title','createdby'));
         }
    }


    public function user_live_launcher(Request $request,$user_id=""){
        if($request->ajax())
         {
            $data = Lauchpaid::with('credit_balance_launcher_wise')->whereHas('user', function($q) use ($request)
            {
                /*if(!empty($request->user_id)){
                    $q = $q->where('name','like','%'.$request->name.'%');
                } */

            })
            ->where('launc_paid_type',2)->where('launchpaid.user_id',$request->user_id)->latest();
 
            return Datatables::of($data)
                    ->addColumn('id', function($row){
                        if($row->approve_status == 2)
                        {
                            return '<div class="form-check form-check-inline">
                        <input class="form-check-input user_id" name="user_id[]" type="checkbox" id="inlineCheckbox'.$row->id.'" value="'.$row->id.'">
                        <label class="form-check-label" for="inlineCheckbox'.$row->id.'"></label></div>';
                        }else{
                            return '';
                        }

                    })
                    ->addColumn('user_id', function($row){
                        return !empty($row->user_id)?User::find($row->user_id)->name:'';
                    })
                    ->addColumn('mobile', function($row){
                        return !empty($row->user_id)?User::find($row->user_id)->mobile:'';
                     })

                   ->addColumn('email', function($row){
                         return !empty($row->user_id)?User::find($row->user_id)->email:'';
                    })

                    ->addColumn('launch_sketch', function($row){
                        return $row->launch_sketch;
                    })

                    ->addColumn('launch_designation', function($row){
                        return $row->launch_designation." ".$row->user_id;
                    })
                    ->addColumn('credit_balance', function($row){
                        // return ($row->approve_status == 2)?$row->credit_balance_launcher_wise->sum('amount'):0;

                        return $row->credit_balance_launcher_wise->sum('amount') ?? '0';
                    })
                    ->addColumn('approve_status', function($row){
                        if($row->approve_status == 2)
                        {
                            return '<span class="badge bg-success">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';
                        }else if($row->approve_status == 3)
                        {
                             return '<span class="badge bg-danger">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';

                        }else{
                            return '<span class="badge bg-info">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';
                        }
                      return \Config::get('constants.launcherStatus')[$row->approve_status];
                })

                   ->addColumn('action', function($row){

                       $html = '';
                       $html .= '<a href="'.route('launchpaid.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ">View</a>';
                       if($row->approve_status == 1){
                          $html .= '<a href="javascript:;" data-click-accept="'.route('launcher_status',[encodeId($row->id),'accept']).'" class="btn btn-outline-success m-2 btn-sm ">Approve</a>';
                          $html .= '<a href="javascript:;" data-click-reject="'.route('launcher_status',[encodeId($row->id),'reject']).'" class="btn btn-outline-danger m-2 btn-sm ">Reject</a>';
                       }
                        return $html;
                    })
                    ->rawColumns(['action','id','approve_status'])
                    ->make(true);
         }else{

            $title = 'User launcher Image';

            $createdby = !empty($_GET['created_by'])?'?created_by='.$_GET['created_by']:'';
            return view('admin.launchpaid.user_launchpad_live',compact('title','createdby','user_id'));
         }
    }

    public function demo_launcher(Request $request){
        if($request->ajax())
         {
            $data = Lauchpaid::with('credit_balance_launcher_wise')->latest();

            if(!empty($_GET['created_by']))
            {
             $data = $data->where('created_by',Auth::user()->id) ;
            }
            $data = $data->where('launc_paid_type',1) ; /// demo launcer

            return Datatables::of($data)
                ->addIndexColumn()
                ->addColumn('launch_image', function($row){
                    if(isset($row->launch_image)){
                        return '<img src="'.url($row->launch_image).'" width="50">';
                    }else{
                        return '<img src="'.url('assets/admin/images/noimage.png').'" width="50">';    
                    } 
                })
                ->addColumn('demo_user_name', function($row){
                            return $row->demo_user_name;
                })
                ->addColumn('launch_sketch', function($row){
                        return $row->launch_sketch;
                })
                ->addColumn('launch_designation', function($row){
                      return $row->launch_designation;
                })
                ->addColumn('approve_status', function($row){
                        if($row->approve_status == 2)
                        {
                            return '<span class="badge bg-success">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';
                        }else if($row->approve_status == 3)
                        {
                            return '<span class="badge bg-danger">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';
                        }else{
                            return '<span class="badge bg-info">'.\Config::get('constants.launcherStatus')[$row->approve_status].'</span>';
                        }
                    return \Config::get('constants.launcherStatus')[$row->approve_status];
                })
                ->addColumn('action', function($row){

                   $html = '';
                   $html .= '<a href="'.route('launchpaid.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ">View</a>';
                   if($row->approve_status == 1){
                    $html .= '<a href="javascript:;" data-click-accept="'.route('launcher_status',[encodeId($row->id),'accept']).'" class="btn btn-outline-success m-2 btn-sm ">Approve</a>';
                    $html .= '<a href="javascript:;" data-click-reject="'.route('launcher_status',[encodeId($row->id),'reject']).'" class="btn btn-outline-danger m-2 btn-sm ">Reject</a>';
                 }
                 $html .= '<a href="'.route('launchpaid.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ">Edit</a>';
                    return $html;
                })
                ->rawColumns(['action','id','approve_status','launch_image'])
                ->make(true);
         }else{

            $title = 'Demo Launcer Image';
            $createdby = !empty($_GET['created_by'])?'?created_by='.$_GET['created_by']:'';
            return view('admin.launchpaid.demo',compact('title','createdby'));
         }
    }


    public function launcher_status($encodeId,$type)
    {
        try{
            $id = decodeId($encodeId);
            $findLauncher = Lauchpaid::find($id);

            $getUser = User::find($findLauncher->user_id);
            
            if(empty($findLauncher))
            {
                return $this->failure('Launcher Not Found');
            }
            $msg = 'Done!';

            $launc_paid_type = $findLauncher->launc_paid_type;
 
            if($type == 'accept')
            {
                $findLauncher->approve_status = 2;

                if($launc_paid_type==2){    
                    $findAlreadyPurchase = BuyPackages::where('is_purchased',2)->where([
                        'lauch_id'=>$findLauncher->id, 
                        'user_id'=>$findLauncher->user_id,
                        'is_launchpad_approve'=>'0'
                    ])->first();

                    $payment_wallet_type = $findAlreadyPurchase->payment_wallet_type ?? "";
                    $price = $findAlreadyPurchase->price ?? "";
                    if($payment_wallet_type=='1'){    // For trading wallet  
                        
                        $findAlreadyPurchase->is_launchpad_approve = 1;
                        $findAlreadyPurchase->save();
                         
                        $creditRow = new Wallet;
                        $creditRow->user_id = $findLauncher->user_id;
                        $creditRow->amount = $price;
                        $creditRow->payment_type = 'debit';
                        $creditRow->status = 'Successful'; 
                        $creditRow->type = 'live';  // live,demo
                        $creditRow->remark = 'payment debited for '.$findLauncher->launch_sketch;
                        $creditRow->save();

                        User::where('id',$findLauncher->user_id)->decrement('tradding_live_wallet',$price);

                    }else if($payment_wallet_type=='2'){   // For credit wallet   

                        $findAlreadyPurchase->is_launchpad_approve = 1;
                        $findAlreadyPurchase->save();

                        CreditBalance::where('user_id',$findLauncher->user_id)->decrement('remaining_balance',$price);

                        $creditHistory = new CreditBalanceHistory;
                        $creditHistory->user_id = $findLauncher->user_id;
                        $creditHistory->payment_type = 'debit';
                        $creditHistory->amount = $price; // package
                        $creditHistory->remark = 'payment debited for '.$findLauncher->launch_sketch;
                        $creditHistory->save();

                    }else if($payment_wallet_type=='3'){  // For launcher wallet  
                        
                        $findAlreadyPurchase->is_launchpad_approve = 1;
                        $findAlreadyPurchase->save();

                        $creditRow = new LauncherWallet;
                        $creditRow->user_id = $findLauncher->user_id;
                        $creditRow->amount = $price;
                        $creditRow->type = 'debit';   
                        $creditRow->save(); 

                        User::where('id',$findLauncher->user_id)->decrement('launcher_live_wallet',$price);

                    }


                    $user_id = $getUser->id;
                    $title = "Your launcher approved by ".config('app.name');
                    $message = "Hello ".$getUser->name.", Your launcher is approved by ".config('app.name');

                    $send = ApiHelper::sendNotification($user_id,$title,$message); 
                }    
                $msg = 'Launcher approved successfully';
            }else if($type == 'reject'){
                $findLauncher->approve_status = 3;
                $msg = 'Launcher rejected successfully';
                
                if($launc_paid_type==2){  
                    $user_id = $getUser->id;
                    $title = "Your launcher is rejected by ".config('app.name');
                    $message = "Hello ".$getUser->name.", Your launcher is approved by ".config('app.name');

                    $send = ApiHelper::sendNotification($user_id,$title,$message);
                }
            }
            if($findLauncher->launc_paid_type=='1'){
                $findLauncher->launch_status = 1; 
            }
            $findLauncher->save();

            return $this->success($msg);
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'New Launch Paid';
        $get_designation = Designation::where('status',1)->get();

        $get_user = User::orderBy('name','asc')->get();
        return view('admin.launchpaid.create',compact('title','get_designation','get_user'));
    }

    public function edit($id)
    {
        $title = 'Edit Demo Launch Paid';
        $id = decodeId($id);
        $row = Lauchpaid::find($id);

        $get_user = User::orderBy('name','asc')->get();

        $row_launchpad_data = LaunchpaidData::where('launch_id',$id)->first();
        $get_designation = Designation::where('status',1)->get();
        return view('admin.launchpaid.demo_launchpad_edit',compact('title','row','row_launchpad_data','get_designation','get_user'));
    }

    public function update(Request $request, $id)
    {

        try{
            $id = decodeId($id);
            $row = Lauchpaid::find($id);

            if(empty($row))
            {
               return $this->failure('Wrong Launchpaid !');
            }

          $validator = Validator::make($request->all(),[
            'launc_paid_type'=>'required',
            'launch_sketch'=>'required|string|max:255|unique:launchpaid', 
            'launch_designation' => 'required',
            'image_quantity' => 'required',
            'image_selling_price' => 'required',
          ]) ;

          if($validator->fails())
          {
               return $this->failure($validator->errors());
          }

         $row->user_id = $request->launc_paid_type_user;
            $row->demo_user_name = $request->demo_user_name;
            $row->launc_paid_type = $request->launc_paid_type;
            if($request->launch_image)
                $row->launch_image = $request->launch_image;
            
            $row->launch_sketch = $request->launch_sketch;
            $row->launch_designation = $request->launch_designation;
            $row->about_us = $request->about_us;
            $row->is_recommended = $request->is_recommended ?? '0';
            $row->launch_website = $request->launch_website;
            $row->youtube_link = $request->youtube_link;
            $row->twitter_link = $request->twitter_link;
            $row->instra_link = $request->instra_link;
            $row->facebook_link = $request->facebook_link;
            $row->linked_link = $request->linked_link;
            $row->created_by = Auth::user()->id;

            if($row->save())
            {

                $launch_paid_data = new LaunchpaidData;
                $launch_paid_data->launch_id = $row->id;
                $launch_paid_data->img_quanity = $request->image_quantity;
                $launch_paid_data->remaining_ico_qty = $request->image_quantity;
                $launch_paid_data->img_offered = '0';
                $launch_paid_data->img_sell = $request->image_selling_price;
                $launch_paid_data->participant = '0';
                if($launch_paid_data->save())
                
                $launchDataArr = [
                    'img_quanity'=>$request->image_quantity,                            
                    'img_offered' => "0", 
                    'img_sell'=>$request->image_selling_price,
                    'participant'=>"0",
                ];
                LaunchpaidData::where(['launch_id'=>$row->id])->update($launchDataArr);
 
                $url = '';
                if($row->launc_paid_type == 1)
                {
                    $url = route('demo_launcher').'?created_by=true&live=false';
                }else{
                    $url = route('live_launcher').'?created_by=true&live=true';
                }

                $request->session()->flash('success','Launchpaid Updated Successfully');
                return $this->success('Launchpaid Updated Successfully',['nextUrl'=>$url]);
            }

            return $this->failure('Something Went Wrong!');  

       }catch(Exception $e){
          return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
       }
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
                    'launc_paid_type'=>'required',
                    'launch_sketch'=>'required|string|max:255|unique:launchpaid',
                    'launch_image' => 'required',
                    'launch_designation' => 'required',
                    'image_quantity' => 'required',
                    'image_selling_price' => 'required',
                   ]) ;

                   if($validator->fails())
                   {
                        return $this->failure($validator->errors()->first());
                   }

                   if($request->launc_paid_type === 'live')
                   {
                        if(empty($request->launc_paid_type_user))
                        {
                            return $this->failure('Please Select Launcher');
                        }
                   }


            if(isset($request->demo_user_name)){
                $getUser = User::find($request->demo_user_name);
                $cr_user_id = $getUser->id;
                $cr_user_name = $getUser->name;
            }else{
                $cr_user_id = Auth::user()->id;
                $cr_user_name = Auth::user()->name;
            }       
            $row = new Lauchpaid;
            $row->user_id = $cr_user_id; // $request->launc_paid_type_user;
            $row->demo_user_name = $cr_user_name;
            $row->launc_paid_type = $request->launc_paid_type;
            $row->launch_image = $request->launch_image;
            $row->launch_sketch = $request->launch_sketch;
            $row->launch_designation = $request->launch_designation;
            $row->about_us = $request->about_us;
            $row->is_recommended = $request->is_recommended ?? '0';
            $row->launch_website = $request->launch_website;
            $row->youtube_link = $request->youtube_link;
            $row->twitter_link = $request->twitter_link;
            $row->instra_link = $request->instra_link;
            $row->facebook_link = $request->facebook_link;
            $row->linked_link = $request->linked_link;
            $row->created_by = Auth::user()->id;
 

            if($row->save())
            {

                $launch_paid_data = new LaunchpaidData;
                $launch_paid_data->launch_id = $row->id;
                $launch_paid_data->img_quanity = $request->image_quantity;
                $launch_paid_data->remaining_ico_qty = $request->image_quantity;
                $launch_paid_data->img_offered = '1';
                $launch_paid_data->img_sell = $request->image_selling_price;
                $launch_paid_data->participant = '0';
                if($launch_paid_data->save())

                        $launchpad_id = $row->id;

                        $totalQuantity = LaunchpaidData::where('launch_id',$launchpad_id)->sum('img_quanity');
                        $totalOffered = LaunchpaidData::where('launch_id',$launchpad_id)->sum('img_offered');
                        $totalSell = LaunchpaidData::where('launch_id',$launchpad_id)->sum('img_sell');

                        $findLauncher = Lauchpaid::find($launchpad_id);
                        $findLauncher->total_img_quanity = $totalQuantity;
                        $findLauncher->total_img_offered = $totalOffered;
                        $findLauncher->total_img_sell = $totalSell; 
                        $findLauncher->remaining_qty = $totalQuantity;
                        $findLauncher->live_image_price = $totalSell;
                        $findLauncher->launch_status = 2; /// launch paid status
                        $findLauncher->save();
                         
                      //// Start Save Registration Point to Launcher at the time of registration
                        /*$creditRow = new CreditBalance;
                        $creditRow->user_id = $row->user_id ?? NULL;
                        $creditRow->launcher_id = $row->id;
                        $creditRow->amount = settingConfig('ADD_CREDIT_BALANCE');;
                        $creditRow->status = 1; // credit to credit balance;
                        $creditRow->save();*/
                      //// End of Credit Balance Save Data ///
                $url = '';
                if($row->launc_paid_type == 1)
                {
                    $url = route('demo_launcher').'?created_by=true&live=false';
                }else{
                    $url = route('live_launcher').'?created_by=true&live=true';
                }

                $request->session()->flash('success','New Launchpaid Added Successfully');
                return $this->success('New Launchpaid Added Successfully',['nextUrl'=>$url]);
            }

            return $this->failure('Something Went Wrong!');

         }catch(Exception $e){
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
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
        $title = 'View Launcher';
        $id = decodeId($id);
        $user = Lauchpaid::with('user')->find($id);
        return view('admin.launchpaid.show',compact('title','user'));
    }



    // * Out Side Of CRUD Operation ///


    /** credit-balance-to-launcher */
    public function credit_balance_to_launcer(Request $request)
    {

        try{
            $userid = !empty($_POST['user_id'])?$_POST['user_id']:[];
            $amount = !empty($_POST['amount'])?$_POST['amount']:[];
            if(empty($userid))
            {
                return $this->failure('No records found');
            }
            if(empty($amount))
            {
                return $this->failure('Amount is required');
            }
            $userid = array_unique($userid);

            $userCount = 0; 
            foreach($userid as $uid){ 

                $findWalletAmount = CreditBalance::orderBy('id','asc')->where(['user_id'=>$uid,'status'=>1])->first('id');
                if(isset($findWalletAmount->id)){
                    CreditBalance::where(['id' => $findWalletAmount->id])->increment('amount', $amount);
 
                }else{
                    $row = new CreditBalance;
                    $row->user_id = $uid ?? NULL; // admin id 14 
                    $row->amount = $amount;
                    $row->status = 1; // credit to credit balance;
                    $row->save();
                } 

                $creditHistory = new CreditBalanceHistory;
                $creditHistory->user_id = $uid;
                $creditHistory->payment_type = 'credit';
                $creditHistory->amount = $amount; // package
                $creditHistory->remark = "Amount Credited by Admin";
                $creditHistory->save();
                
                $userCount++;
            }
            /*dd($userid);
            $findRows = Lauchpaid::whereIn('id',$userid)->get();
            if(empty($findRows)){
                return $this->failure('No records found');
            }
             
            foreach($findRows as $k =>$v)
            {
                    $row = new CreditBalance;
                    $row->user_id = $v->user_id ?? NULL; 
                    $row->launcher_id = $v->id;
                    $row->amount = $amount;
                    $row->status = 1;  
                    $row->save();
                    
            }*/
            return $this->success($userCount.' Launcher balance credited successfully');
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    /** Credit Balance history user wise **/
    
    public function credit_balance_history(Request $request,$slug){
        $title = 'Credit History';
        $slug = decodeId($slug);
        $user = User::with('credit_balance')->findOrFail($slug);

        return view('admin.launchpaid.credit_history',compact('title','user'));
    }
 
    /*** launch_image  ***/

    public function launch_image(Request $request){
        if($request->ajax())
        {
           $data = Lauchpaid::whereHas('user', function($q) use ($request)
           {
               if(!empty($request->name)){
                   $q = $q->where('name','like','%'.$request->name.'%');
               }
               if(!empty($request->email)){
                   $q = $q->where('email','like','%'.$request->email.'%');
               }
               if(!empty($request->mobile)){
                   $q = $q->where('mobile','like','%'.$request->mobile.'%');
               }

           })
           ->latest()->where('launc_paid_type',2)->where('approve_status',2);
           if(!empty($request->launch_sketch)){
               $data = $data->where('launch_sketch',$request->launch_sketch);
           }
           return Datatables::of($data)
                   ->addIndexColumn()
                   ->addColumn('user_id', function($row){
                           return !empty($row->user_id)?User::find($row->user_id)->name:'';
                  })
                   ->addColumn('mobile', function($row){
                   return !empty($row->user_id)?User::find($row->user_id)->mobile:'';
                    })

                  ->addColumn('email', function($row){
                           return !empty($row->user_id)?User::find($row->user_id)->email:'';
                   })

                   ->addColumn('launch_sketch', function($row){
                       return $row->launch_sketch;
               })

               ->addColumn('launch_designation', function($row){
                     return $row->launch_designation;
               })
                   ->addColumn('launch_status', function($row){
                       if($row->launch_status == 2)
                       {
                           return '<span class="badge bg-success">'.\Config::get('constants.launcherIcoStatus')[$row->launch_status].'</span>';
                       }else{
                           return '<span class="badge bg-info">'.\Config::get('constants.launcherIcoStatus')[$row->launch_status].'</span>';
                       }
                     return \Config::get('constants.launcherIcoStatus')[$row->launch_status];
               })

                  ->addColumn('action', function($row){

                      $html = '';
                      $html .= '<a href="'.route('launchpaid.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ">View</a>';


                      if($row->launch_status == 1){
                           $html .= '<a data-options=`{"touch" : false}` data-fancybox data-type="ajax" class="btn btn-outline-success btn-sm" href="'.route('loadLaunchForm',[encodeId($row->id)]).'">
                              Click to Launch
                            </a>';
                      }else{
                        $html .= '<a href="'.route('live-graph',[encodeId($row->id)]).'" class="btn btn-outline-danger m-2 btn-sm ">Live Graph</a>';
                      }
                       return $html;
                   })
                   ->rawColumns(['action','roles','launch_status'])
                   ->make(true);
        }else{

           $title = 'Launch Images';
           return view('admin.launchpaid.launcher_image',compact('title'));
        }
    }
   /** Launch Image Save */
    public function loadLaunchForm($encodeId){
        $id = decodeId($encodeId);
        $row  = Lauchpaid::findorFail($id);
        return view('admin.launchpaid.launcher_launch',compact('row'));
    }

     /** Launch Image Save */
    public function launch_image_save(Request $request)
    {
        try{
            $validator = Validator::make($request->all(),[
                'id'=>'required',
                'package'=>'required',
                'start_date' => 'required',
                'end_date' => 'required',
                'image_quantity' => 'required',
                'image_offered' => 'required',
                'image_selling_price' => 'required'
               ]) ;

            if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }

            $id = $request->id;
            $findLauncher = Lauchpaid::find($id);
            if(empty($findLauncher))
            {
                return $this->failure('Wrong Launch Paid');
            }

            $findPackage = \App\Models\Package::find($request->package);

            if(empty($findPackage))
            {
                return $this->failure('Wrong Package');
            }

            $findAlreadyPurchase = BuyPackages::where('is_purchased',2)->where([
                'lauch_id'=>$id,
                'package_id'=>$request->package,
                'user_id'=>$findLauncher->user_id,
            ])->first();
            if(!empty($findAlreadyPurchase))
            {
                return $this->failure('Already Purchased this Package');
            }

            $buyPack = new BuyPackages;
            $buyPack->user_id = $findLauncher->user_id;
            $buyPack->lauch_id = $findLauncher->id; // launcher
            $buyPack->package_id = $findPackage->id; // package
            $buyPack->quanity = $findPackage->quantity;
            $buyPack->price = $findPackage->price;
            $buyPack->is_purchased = 2;
            if($buyPack->save())
            {
                 // Add new Addon LaunchPaid
                $launch_paid_data = new LaunchpaidData;
                $launch_paid_data->launch_id = $id;
                $launch_paid_data->img_quanity = $request->image_quantity;
                $launch_paid_data->remaining_ico_qty = $request->image_quantity;
                $launch_paid_data->img_offered = $request->image_offered;
                $launch_paid_data->img_sell = $request->image_selling_price;
                $launch_paid_data->participant = $request->participant ?? '0';
                $launch_paid_data->start_date = $request->start_date;;
                $launch_paid_data->end_date = $request->end_date;
                if($launch_paid_data->save())
                {
                    $totalQuantity = LaunchpaidData::where('launch_id',$id)->sum('img_quanity');
                    $totalOffered = LaunchpaidData::where('launch_id',$id)->sum('img_offered');
                    $totalSell = LaunchpaidData::where('launch_id',$id)->sum('img_sell');

                    /// update on parent table total
                    $findLauncher->total_img_quanity = $totalQuantity;
                    $findLauncher->total_img_offered = $totalOffered;
                    $findLauncher->total_img_sell = $totalSell;
                    $findLauncher->package_id = $findPackage->id;
                    $findLauncher->start_date = $launch_paid_data->start_date;
                    $findLauncher->end_date = $launch_paid_data->end_date;
                    $findLauncher->remaining_qty = $totalQuantity;
                    $findLauncher->live_image_price = $totalSell;
                    $findLauncher->launch_status = 2; /// launch paid status
                    $findLauncher->save();
                    return $this->success('Launch Paid Successfully Launched');
                }
            }
            return $this->failure('Something Went Wrong!');

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    /** Launch Image ICO List  */
    public function launch_image_icon(Request $request){
        if($request->ajax())
        {
           $data = Lauchpaid::whereHas('user', function($q) use ($request)
           {
               if(!empty($request->name)){
                   $q = $q->where('name','like','%'.$request->name.'%');
               }

               if(!empty($request->mobile)){
                   $q = $q->where('mobile','like','%'.$request->mobile.'%');
               }

           })->latest()->where('launc_paid_type',2)->where('approve_status',2)->where('launch_status',2);
           if(!empty($request->launch_sketch)){
               $data = $data->where('launch_sketch',$request->launch_sketch);
           }
           if(!empty($request->start_date)){
            $data = $data->whereDate('start_date','>=',$request->start_date);
        }
           $data = $data->whereDate('end_date','>=',date('Y-m-d'));

           return Datatables::of($data)
                   ->addIndexColumn()
                   ->addColumn('user_id', function($row){
                           return !empty($row->user_id)?User::find($row->user_id)->name:'';
                   })
                   ->addColumn('mobile', function($row){
                        return !empty($row->user_id)?User::find($row->user_id)->mobile:'';
                    })
                    ->addColumn('launch_image', function($row){
                        if(isset($row->launch_image)){
                            return '<a href="'.asset($row->launch_image).'" target="_blank">
                                        <img src="'.asset($row->launch_image).'" style="width: 50px;" />
                                    </a>';
                        }else{
                            return '<a href="'.url('assets/admin/images/noimage.png').'" target="_blank">
                                        <img src="'.url('assets/admin/images/noimage.png').'" style="width: 50px;" />
                                    </a>';
                        }
                    })
                   ->addColumn('launch_sketch', function($row){
                       return $row->launch_sketch;
                    })

               ->addColumn('start_date', function($row){
                     return $row->start_date ? date('d M Y',strtotime($row->start_date)) : '';
               })
               ->addColumn('end_date', function($row){
                    return $row->end_date ? date('d M Y',strtotime($row->end_date))  : '';
                })
               ->addColumn('total_img_quanity', function($row){
                    return $row->total_img_quanity;
                })
               ->addColumn('total_img_offered', function($row){
                    return $row->total_img_offered;
                })
               ->addColumn('total_img_sell', function($row){
                    return config('app.currency').$row->total_img_sell;
                })
               ->addColumn('participant', function($row){
                    return $row->participant ?? '0';
                })
                ->rawColumns(['launch_status','launch_image'])->make(true);
        }else{

           $title = 'Upcomming ICO List';
           return view('admin.launchpaid.launcher_image_ico',compact('title'));
        }
    }

    /** Launch Image Tradding  */
    public function launch_image_tradding(Request $request,$account_type=""){
        if($request->ajax())
        { 
           $account_type = $request->account_type ?? '2'; 
           $data = Lauchpaid::whereHas('user', function($q) use ($request)
           {
               if(!empty($request->name)){
                   $q = $q->where('name','like','%'.$request->name.'%');
               }

               if(!empty($request->mobile)){
                   $q = $q->where('mobile','like','%'.$request->mobile.'%');
               }

           })->latest();

           $data->where('approve_status',2)->where('launch_status',$account_type);

           if(!empty($request->launch_sketch)){
               $data = $data->where('launch_sketch',$request->launch_sketch);
           }

           $data->where('launc_paid_type',$account_type);

           if($account_type==2){
                $data = $data->whereDate('end_date','<',date('Y-m-d')); 
           }

           return Datatables::of($data)
                ->addIndexColumn()
                ->addColumn('user_id', function($row){
                           return !empty($row->user_id)?User::find($row->user_id)->name:'';
                })
                   ->addColumn('mobile', function($row){
                        return !empty($row->user_id)?User::find($row->user_id)->mobile:'';
                })
                    ->addColumn('launch_image', function($row){ 
                        if(isset($row->launch_image)){
                            return '<a href="'.asset($row->launch_image).'" target="_blank">
                                        <img src="'.asset($row->launch_image).'" style="width: 50px;" />
                                    </a>';
                        }else{
                            return '<a href="'.url('assets/admin/images/noimage.png').'" target="_blank">
                                        <img src="'.url('assets/admin/images/noimage.png').'" style="width: 50px;" />
                                    </a>';
                        }
                })
                   ->addColumn('launch_sketch', function($row) use($account_type){
                       return $row->launch_sketch;
                })->addColumn('total_img_quanity', function($row){
                            return $row->total_img_quanity;
                })->addColumn('total_img_offered', function($row){
                        return $row->total_img_offered;
                })->addColumn('total_img_sell', function($row){
                    return config('app.currency').$row->total_img_sell;
                })
                ->addColumn('live_image_price', function($row)  use($account_type){
                    // return config('app.currency').$row->live_image_price;

                    if($account_type==2){
                        $getTradeDt = TradingPortfolio::leftjoin('launchpaid','launchpaid.id','=','user_trading_portfolio.image_id')->
                            select(DB::raw('sum(user_trading_portfolio.quantity*user_trading_portfolio.price) as total_investment, sum(launchpaid.live_image_price*user_trading_portfolio.quantity) as total_live_price,user_trading_portfolio.quantity,user_trading_portfolio.price,launchpaid.live_image_price'))->
                            where(['user_trading_portfolio.user_id'=>$row->user_id,'image_id'=>$row->id])->first();

                        $total_investment = $getTradeDt->price ?? '0'; //$getTradeDt->total_investment ?? '0';
                        $current_trade_price = $row->live_image_price ?? '0'; // $getTradeDt->total_live_price ?? '0';

                        $today_difference = $current_trade_price - $total_investment;
                         
                        if($today_difference>0 && $total_investment>0)
                            $profit_stock_in_percent = ($today_difference*100)/$total_investment;
                        else
                            $profit_stock_in_percent = 0;
                        
                        $overall_return = $today_difference + $total_investment;
     
                        if($profit_stock_in_percent==0){
                            $is_up_down = "neutral";
                        }else if($profit_stock_in_percent>0){
                            $is_up_down = "up";
                        }else{
                            $is_up_down = "down";
                        } 

                        if($is_up_down=="up"){
                            return '<div class="cls_div" >
                                   <p>'.config('app.currency').@$row->live_image_price.'  <i class="fa fa-arrow-up"></i><br/>
                                   '.config('app.currency').@$today_difference .' ('.round($profit_stock_in_percent,2).'%)</p> 
                            </div>';
                        }else if($is_up_down=="down"){
                            return '<div class="cls_div"  style="background:red">
                                       <p>'.config('app.currency').@$row->live_image_price.'  <i class="fa fa-arrow-down"></i><br/>
                                       '.config('app.currency').@$today_difference .' ('.round($profit_stock_in_percent,2).'%)</p> 
                                </div>';
                        }else{
                            return '<div class="cls_div"  style="background:grey">
                                       <p>'.config('app.currency').@$row->live_image_price.'<br/>
                                       '.config('app.currency').@$today_difference .' ('.round($profit_stock_in_percent,2).'%)</p> 
                                </div>';
                        }
                    }else{
                        return config('app.currency').$row->live_image_price;
                    }
                    
                })
                ->addColumn('live_image_per', function($row){
                     return config('app.currency').number_format(((($row->live_image_price/$row->total_img_sell)*100)-100),2);
 
                })
                ->addColumn('buy_status', function($row){
                        // return \Config::get('constants.userLoginStatus')[$row->status];
                        $act_status="";
                        if($row->buy_status=='2'){
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" checked value="1" class="common_buy_status_update ch_input"
                                 title="Active" data-id="'.$row->id.'" data-action="user_stock_buy"  />
                                <span></span>
                            </label>';
                            $act_status="Active";
                        }else{
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" value="2" class="common_buy_status_update ch_input"
                                 title="Inactive" data-id="'.$row->id.'" data-action="user_stock_buy"  />
                                <span></span>
                            </label>';
                            $act_status="InActive";
                        }
                        return $crr.' '.'<span id="user_stock_buy_act_txt_'.$row->id.'">'.$act_status.'</span>';
                   })
                ->addColumn('sell_status', function($row){ 
                        $act_status2="";
                        if($row->sell_status=='2'){
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" checked value="1" class="common_sell_status_update ch_input"
                                 title="Active" data-id="'.$row->id.'" data-action="user_stock_sell"  />
                                <span></span>
                            </label>';
                            $act_status2="Active";
                        }else{
                            $crr = '<label class="switch switch-small">
                                <input type="checkbox" value="2" class="common_sell_status_update ch_input"
                                 title="Inactive" data-id="'.$row->id.'" data-action="user_stock_sell"  />
                                <span></span>
                            </label>';
                            $act_status2="InActive";
                        }
                        return $crr.' '.'<span id="user_stock_sell_act_txt_'.$row->id.'">'.$act_status2.'</span>';
                   })
                ->addColumn('action',function($row){
                    $html ='';
                    $html .= '<a href="'.route('live-graph',[encodeId($row->id)]).'" class="btn btn-outline-danger m-2 btn-sm ">Live Graph</a>';
                    return $html;
                })
                ->rawColumns(['launch_status','launch_image','action','buy_status','sell_status','live_image_price'])->make(true);
        }else{

           $title = 'Tradding List';
           return view('admin.launchpaid.launch_image_trade',compact('title','account_type'));
        }
    }

    public function user_stock_buy_status_update(Request $request)
    {   
        request()->validate([
            'record_id' => 'required|integer',  
            'status' => 'required|integer', 
        ]);
         
        $up_sta = $request->status;  
        Lauchpaid::where('id',$request->record_id)->update(array('buy_status'=>$up_sta));
         
        return response()->json(['status'=>1,'message'=>'Buy status updated.','user_status'=>$up_sta]); 
    } 

    public function user_stock_sell_status_update(Request $request)
    {   
        request()->validate([
            'record_id' => 'required|integer',  
            'status' => 'required|integer', 
        ]);
         
        $up_sta = $request->status;  
        Lauchpaid::where('id',$request->record_id)->update(array('sell_status'=>$up_sta));
         
        return response()->json(['status'=>1,'message'=>'Sell status updated.','user_status'=>$up_sta]); 
    } 

    public function live_graph($encodeId,$type=""){
        $id = decodeId($encodeId);
        $row = Lauchpaid::with('user')->find($id);

        $title = 'Live Graph';

        

        if($type=="1W"){ // 1 Week record
            $start_date = date('Y-m-d', strtotime('-7 days'));
            $end_date = date('Y-m-d');
        }else if($type=="1M"){ // 1 Month record
            $start_date = date('Y-m-d', strtotime('-1 Months'));
            $end_date = date('Y-m-d');
        }else if($type=="1Y"){ // 1 Year record
            $start_date = date('Y-m-d', strtotime('-1 year'));
            $end_date = date('Y-m-d');
        }else if($type=="3Y"){ // 3 Year record
            $start_date = date('Y-m-d', strtotime('-3 year'));
            $end_date = date('Y-m-d');
        }else{ // Today record
            $type = "1D";
            $start_date = date('Y-m-d');
            $end_date = date('Y-m-d');
        }
         
        // return view('admin.launchpaid.live_graph',compact('title','row'));

        return view('admin.launchpaid.live_graph_new',compact('title','row','start_date','end_date','type','encodeId'));
    }

    public function live_graph_new($encodeId){
        $id = decodeId($encodeId);
        $row = Lauchpaid::with('user')->find($id);
        $title = 'Live Graph';
        return view('admin.launchpaid.live_graph_new',compact('title','row'));
    }
}


