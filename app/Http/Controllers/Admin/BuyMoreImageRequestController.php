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
// use App\Models\WithdrawalRequest;
use App\Models\BuyMoreImage;
use App\Models\Wallet;
use App\Models\Transactions;
use App\Models\Lauchpaid;

class BuyMoreImageRequestController extends Controller
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
        
            $data = BuyMoreImage::leftjoin('launchpaid','launchpaid.id','=','request_buy_more_image_tbl.image_id')->get(['request_buy_more_image_tbl.*','launchpaid.launch_sketch','launchpaid.launch_image']);
             
            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('created_at', function($row){
                           return $row->created_at;
                    })
                    ->addColumn('name', function($row){
                        $getUser = User::find($row->user_id);
                        return $getUser->name ?? "";
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
                    ->addColumn('quantity', function($row){
                           return $row->quantity;
                     })
                    ->addColumn('status', function($row){
                        return ucwords(str_replace("_"," ",$row->status));
                    })
                    ->addColumn('action', function($row){
                       $html = '';
                        
                        if($row->status != 'reject'){
                            $html .= '<button type="button" class="btn btn-outline-primary m-2 btn-sm ml-2 update_buy_request_in_modal" data-bs-toggle="modal" data-bs-target="#myRequestDetailUpdateModal" data-id="'.$row->id.'" data-quantity="'.$row->quantity.'" data-price="'.$row->price.'">
                                    Set Price
                                </button>';   
                            $html .= '<a href="javascript:;" data-click-reject="'.route('buy_more_request_status',[encodeId($row->id),'reject']).'" class="btn btn-outline-danger m-2 btn-sm ">Reject</a>';
                        }
                         
                            /*$html .= '<a href="javascript:;" data-click-accept="'.route('buy_more_request_status',[encodeId($row->id),'approve']).'" class="btn btn-outline-primary m-2 btn-sm ">Approve</a>'; */

                        // }
                        return $html;
                    })
                    ->rawColumns(['action','launch_image'])
                    ->make(true);
 
        }else{ 
            $title = 'Request List';
            return view('admin.withdrawalrequest.buy_more_request_list',compact('title'));
        }



    }


    public function buy_more_request_status($encodeId,$type)
    {
        try{
            $id = decodeId($encodeId);

            $withRequest = BuyMoreImage::find($id);            
            $withRequest->status = $type;

            if($type == 'approve')
            { 
                $msg = 'Request approved successfully';
            }
            if($type == 'reject')
            { 
                $msg = 'Request rejected successfully';
            }
            $withRequest->save();
            return $this->success($msg);

        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

    public function buy_more_request_update(Request $request)
    { 
        if($request->record_id){ 
 
            $payment_status = $request->input('process_status');

            $res_data = BuyMoreImage::find($request->record_id);
            $res_data->quantity = $request->input('quantity');
            $res_data->price = $request->input('price'); 
            $res_data->status = 'set_price';  // means Approve  
            $res_data->save();
            
            return response()->json(['status'=>1,'message'=>'Price set successfully.' ]);

        } 
        return response()->json(['status'=>0,'message'=>'Record submission failed.' ]);

    }
 
}
