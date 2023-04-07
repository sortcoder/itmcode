<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lauchpaid;
use App\Models\TradeTransaction;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\StockExchange; 
use App\Models\IcoBuyApplication; 

class UpcommingOrderController extends Controller
{
    use ResponseWithHttpRequest;

    public function __construct(){
      $this->middleware('permission:Order-Management');
    }

    public function index(Request $request,$id="")
    {
        $todayDate = date('Y-m-d');
   

        if($request->ajax())
        { 

        $dataQue = IcoBuyApplication::leftjoin('launchpaid','launchpaid.id','=','ico_buy_application.launch_id')->leftjoin('users','users.id','=','ico_buy_application.user_id');

           if(!empty($request->name)){
               $dataQue->where('users.name','like','%'.$request->launch_sketch.'%');
           }
           if(!empty($request->launch_sketch)){
               $dataQue->where('launch_sketch ','like','%'.$request->launch_sketch.'%');
           }   
           $data = $dataQue->
           // where('ico_buy_application.start_date','<=',$todayDate)->
           where('ico_buy_application.end_date','>=',$todayDate)->
           orderBy('ico_buy_application.id','desc')->get(['ico_buy_application.*','launchpaid.launch_image','launchpaid.launch_sketch','users.name','launchpaid.total_img_offered','launchpaid.total_img_sell','launchpaid.start_date','launchpaid.end_date']);

           return Datatables::of($data)
                   ->addIndexColumn()
                   ->addColumn('name', function($row){
                           return @$row->name;;
                   })
                   ->addColumn('launch', function($row){
                        return @$row->launch_sketch ;
                    })
                    ->addColumn('launch_image', function($row){ 
                        if(isset($row->launch_image)){
                            return '<img src="'.url($row->launch_image).'" width="50">';
                        }else{
                            return '<img src="'.url('assets/admin/images/noimage.png').'" width="50">';    
                        } 
                    })
                    ->addColumn('total_img_offered', function($row){
                            return config('app.currency').$row->total_img_offered;
                    })->addColumn('total_img_sell', function($row){
                            return config('app.currency').$row->total_img_sell.'/image';
                    })->addColumn('start_date', function($row){
                        return $row->start_date;
                    })->addColumn('end_date', function($row){
                        return $row->end_date;
                    })->editColumn("created_at",function($row){
                        return date("Y-m-d h:i A", strtotime($row->created_at));
                    })
                    ->rawColumns(['name','launch_image'])->make(true);
        }else{ 
           $title = 'Upcomming Order';
           return view('admin.upcomming_order.index',compact('title','id'));
        }
    } 
}
