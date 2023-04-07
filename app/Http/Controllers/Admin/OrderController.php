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
use App\Models\Wallet;
class OrderController extends Controller
{
    use ResponseWithHttpRequest;

    public function __construct(){
      $this->middleware('permission:Order-Management');
    }
    public function index(Request $request,$id="")
    {

        if($request->ajax())
        {
             
           $dataQue = StockExchange::leftjoin('launchpaid','launchpaid.id','=','stock_exchange.lauch_id');

           if(!empty($request->launch_sketch)){
               $dataQue->where('launch_sketch ','like','%'.$request->launch_sketch.'%');
           }

           if($request->user_id!=""){
                $dataQue->where('stock_exchange.user_id',$request->user_id);
           } 
           if($request->type!=""){
                $dataQue->where('stock_exchange.type',$request->type);
           } 
           if($request->status!=""){
                $dataQue->where('stock_exchange.status',$request->status);
           } 
           $data = $dataQue->where('launchpaid.launc_paid_type',2)->orderBy('stock_exchange.id','desc')->get(['stock_exchange.*','launchpaid.launch_image','launchpaid.launch_sketch']);

           return Datatables::of($data)
                   ->addIndexColumn()
                   ->addColumn('name', function($row){
                           return @$row->user->name;;
                   })
                   ->addColumn('launch', function($row){
                        return $row->launcher->launch_sketch;
                    })
                    ->addColumn('launch_image', function($row){ 
                       if(isset($row->launcher->launch_image)){
                            return '<a href="'.asset($row->launcher->launch_image).'" target="_blank">
                                        <img src="'.asset($row->launcher->launch_image).'" style="width: 50px;" />
                                    </a>';
                        }else{
                            return '<a href="'.url('assets/admin/images/noimage.png').'" target="_blank">
                                        <img src="'.url('assets/admin/images/noimage.png').'" style="width: 50px;" />
                                    </a>';
                        }

                    })
                    ->addColumn('price', function($row){
                            return config('app.currency').$row->price;
                    })->addColumn('quantity', function($row){
                        return $row->quantity;
                })->addColumn('type', function($row){
                    return $row->type;
                })
                ->addColumn('status', function($row){
                    return $row->status;
                })
                ->editColumn("created_at",function($row){
                    return date("Y-m-d h:i A", strtotime($row->created_at));
                })
                ->rawColumns(['name','launch_image'])->make(true);
        }else{ 
           $title = 'Exchange Sell & Buy';
           return view('admin.order.index',compact('title','id'));
        }
    }
    /*** Buy Stock When not in trading view ICO Launch  */
    public function buyImageInPeriod(Request $request){
        try{

            $imageId = $request->image_id ?? 14;
            $userId = $request->user_id ?? 18; // 16 , 18
            $qty = $request->qty ?? 100 ;
            $price = $request->price ?? 5 ;



            $findImage = Lauchpaid::find($imageId);
            if(empty($findImage))
            {
                return $this->failure('Invalid Asset!');
            }
            $user = User::find($userId);
            if(empty($user))
            {
                return $this->failure('Unauthorized buyer!');
            }
           $resposne = StockExchange::buyStockBetweenPeriod($userId,$findImage,$qty,$price,'live');
           if(empty($resposne['status']))
           {
            return $this->failure($resposne['message']);
           }
           return $this->success($resposne['message']);

        }catch(Exception $e)
        {
            return $this->failure('Something Went Wrong!');
        }
    }


     /*** Buy Stock after time over from seller and admin */
     public function buyImageAfterPeriodOver(Request $request){
        try{

            $imageId = $request->image_id ?? 10;
            $userId = $request->user_id ?? 16;
            $qty = $request->qty ?? 100 ;
            $price = $request->price ?? 6 ;

            $findImage = Lauchpaid::find($imageId);
            if(empty($findImage))
            {
                return $this->failure('Invalid Asset!');
            }
            $user = User::find($userId);
            if(empty($user))
            {
                return $this->failure('Unauthorized User!');
            }

            $resposne = StockExchange::buyStockInTradding($userId,$findImage,$qty,$price,'live');
            if(empty($resposne['status']))
            {
                return $this->failure($resposne['message']);
            }
            return $this->success($resposne['message']);

        }catch(Exception $e)
        {
            return $this->failure('Something Went Wrong!');
        }
    }


     /*** Sell Stock after time over from Buyer and admin */
     public function sellImageAfterPeriodOver(Request $request){

        try{

            $imageId = $request->image_id ?? 14;
            $userId = $request->user_id ?? 18;
            $qty = $request->qty ?? 100 ;
            $price = $request->price ?? 6 ;

            $findImage = Lauchpaid::find($imageId);
            if(empty($findImage))
            {
                return $this->failure('Invalid Asset!');
            }
            $user = User::find($userId);
            if(empty($user))
            {
                return $this->failure('Unauthorized User!');
            }

            $resposne = StockExchange::sellerStockInTradding($userId,$findImage,$qty,$price,'live');
            if(empty($resposne['status']))
            {
                return $this->failure($resposne['message']);
            }
            return $this->success($resposne['message']);

        }catch(Exception $e)
        {
            return $this->failure('Something Went Wrong!');
        }
    }
}
