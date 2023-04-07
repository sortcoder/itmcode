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
use DB;

class ManageOrderController extends Controller
{
    use ResponseWithHttpRequest;
 
    public function __construct(){
         
    }
    public function index(Request $request)
    { 
         if($request->ajax())
         {  
            $user_ids = StockExchange::groupBy('user_id')->pluck('user_id')->join(',');
            
            $buyUserIdArr = (!empty($user_ids)) ? explode(',',$user_ids) : [];
            $buyUserIdArr = array_unique($buyUserIdArr); 

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
                        // return \Config::get('constants.userLoginType')[$row->user_type]; 
                        if($row->user_type==1){
                            return "Admin";
                        }else if($row->user_type==2){
                            return "Trader";
                        }else if($row->user_type==3){
                            return "Launcher";
                        }else{
                            return "";
                        }
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
                       $html .= '<a href="'.route('order-list',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';
                        
                        return $html;
                    })
                    ->rawColumns(['profile','action','roles','status','user_type','id'])
                    ->make(true);
         }else{
            $title = 'Ordered User';
            return view('admin.manage_order.index',compact('title'));
         }



    }

    public function create()
    { 
    }

    public function store(Request $request)
    {

    }

    public function show(Request $request,$id)
    {

        $title = 'View Trading';
        $id = decodeId($id);
        
        $title = 'Exchange Sell';
        return view('admin.manage_order.show',compact('title','id'));
  
    }
     
    public function edit($id)
    { 
    }
 
    public function update(Request $request, $id)
    { 
    }
 
    public function destroy($id)
    {  
    } 

}
