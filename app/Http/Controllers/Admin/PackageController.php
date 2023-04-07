<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\Package;
use Illuminate\Support\Str;
class PackageController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:Package-Management');
    }
    public function index(Request $request)
    {

         if($request->ajax())
         {
            $data = Package::latest();
            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('quantity', function($row){
                           return $row->quantity;
                    })
                    ->addColumn('one_image_price', function($row){
                        return config('app.currency').$row->one_image_price;
                   })
                    ->addColumn('price', function($row){
                        return config('app.currency').$row->price;
                   })
                   ->addColumn('description', function($row){
                    return Str::limit($row->description,100);
                   })

                   ->addColumn('status', function($row){
                            $checked = '';
                            if($row->status == 1)
                            {
                                $checked = 'checked';
                            }
                            $html ='<div class="form-check-danger form-check form-switch">
                                <input class="form-check-input" type="checkbox" data-checkbox-status="'.route('package.destroy',[encodeId($row->id)]).'?change_status=true"  id="flexSwitchCheckCheckedDanger'.$row->status.'" '.$checked.'>
                                <label class="form-check-label" for="flexSwitchCheckCheckedDanger'.$row->status.'"></label>

                        </div>';
                        return $html;
                    })
                   ->addColumn('action', function($row){

                       $html = '';
                       $html .= '<a href="'.route('package.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">Edit</a>';
                       $html .= '<a href="'.route('package.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';

                       //   $html .= '<a href="javascript:;" data-delete-alert="'.route('appuser.destroy',[encodeId($row->id)]).'" class="btn btn-outline-danger ml-2 btn-sm ">Delete</a>';
                        return $html;
                    })
                    ->rawColumns(['action','description','status'])
                    ->make(true);
         }else{
            $title = 'Package List';
            return view('admin.package.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'New Launch Paid Package';
        return view('admin.package.create',compact('title'));
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
             'quantity'=>'required',
             'one_image_price'=>'required',
             'price'=>'required',
            ]) ;
            if($validator->fails())
            {
                 return $this->failure($validator->errors()->first());
            }
            $row = new Package;
            $row->quantity = $request->quantity;
            $row->one_image_price = $request->one_image_price;
            $row->price = $request->price;
            $row->description = $request->description;
            $row->status = 1; // default active
            $row->save();
           $request->session()->flash('success','New Package Added Successfully');
           return $this->success('New Package Added Successfully',['nextUrl'=>route('package.index')]);

         }catch(Exception $e){
             return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
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
        $title = 'Edit Package';
        $id = decodeId($id);
        $user = Package::find($id);
        return view('admin.package.show',compact('title','user'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit Package';
        $id = decodeId($id);
        $row = Package::find($id);
        return view('admin.package.edit',compact('title','row'));
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
            $row = Package::find($id);

            if(empty($row))
            {
               return $this->failure('Wrong User!');
            }

          $validator = Validator::make($request->all(),[
            'quantity'=>'required',
            'one_image_price'=>'required',
            'price'=>'required',
          ]) ;

          if($validator->fails())
          {
               return $this->failure($validator->errors());
          }

         $row->quantity = $request->quantity;
         $row->one_image_price = $request->one_image_price;
         $row->price = $request->price;
         $row->description = $request->description;

         $row->save();
         $request->session()->flash('success','Package Details Updated');
         return $this->success('Package Details Updated',['nextUrl'=>route('package.index')]);

       }catch(Exception $e){
          return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
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

        try{
            $deleteStatus = true;
            if(!empty($_GET['change_status']))
            {
                $deleteStatus = false;
            }

            if(empty($id))
            {
                return $this->failure('Invalid Details');
            }
            $id = decodeId($id);
            $row = Package::find($id);
             if(empty($row))
            {
                 return $this->failure('Invalid Details');
            }
            if(empty($deleteStatus))
            {
                $row->status = ($row->status == 1)?2:1;
                if($row->save()){
                    return $this->success('Status Updated Successfully');
                }
            }else{
                if($row->delete()){
                    return $this->success('Deleted Successfully');
                }
            }
        }catch(Exception $e)
        {
            return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
        }

    }


    /** Credit Balance Code ( Route : package-credit-balance)*/

    public function packageCreditBalance(Request $request,$id)
    {

            $data = User::where('user_type',3)->orderBy('id','desc')->paginate();

            $id = decodeId($id);
            $row = Package::find($id);
            $title = 'Credit Balance';

            return view('admin.package.creditbalance',compact('title','row','data'));
    }


}
