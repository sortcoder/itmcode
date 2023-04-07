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
class BannerController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:Banner-Management');
    }
    public function index(Request $request)
    {

         if($request->ajax())
         {
            $data = Banner::latest();
            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('image', function($row){
                          //  return '<img src="'.imageAsset($row->image,'uploads/banner/').'" width="50">';

                        if(isset($row->image)){
                            return '<a href="'.asset($row->image).'" target="_blank">
                                        <img src="'.asset($row->image).'" style="width: 70px;" />
                                    </a>';
                        }else{
                            return '<a href="'.asset("admin/images/noimage.png").'" target="_blank">
                                        <img src="'.asset("admin/images/noimage.png").'" style="width: 70px;" />
                                    </a>';
                        }
                    })
                   ->addColumn('status', function($row){
                            $checked = '';
                            if($row->status == 1)
                            {
                                $checked = 'checked';
                            }
                            $html ='<div class="form-check-danger form-check form-switch" >
                                <input class="form-check-input" type="checkbox" data-checkbox-status="'.route('banner.destroy',[encodeId($row->id)]).'?change_status=true"  id="flexSwitchCheckCheckedDanger'.$row->status.'" '.$checked.'>
                                <label class="form-check-label" for="flexSwitchCheckCheckedDanger'.$row->status.'"></label>

                        </div>';
                        return $html;
                    })
                   ->addColumn('action', function($row){

                       $html = '';
                       $html .= '<a href="'.route('banner.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm ">Edit</a>';
                       $html .= '<a href="javascript:;" data-delete-alert="'.route('banner.destroy',[encodeId($row->id)]).'" class="btn btn-outline-danger ml-2 btn-sm ml-2 ">Delete</a>';
                        return $html;
                    })
                    ->rawColumns(['action','status','image'])
                    ->make(true);
         }else{
            $title = 'Banners List';
            return view('admin.banner.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'New Banner';
        return view('admin.banner.create',compact('title'));
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
             'image'=>'required',
            ]) ;
            if($validator->fails())
            {
                 return $this->failure($validator->errors()->first());
            }
            $row = new Banner;
            $row->image = $request->image;
            $row->status = 1;
            $row->save();
           $request->session()->flash('success','Banner Uploaded Successfully');
           return $this->success('New Banner Added Successfully',['nextUrl'=>route('banner.index')]);

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
        $title = 'Edit Banner';
        $id = decodeId($id);
        $row = Banner::find($id);
        return view('admin.banner.show',compact('title','row'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit Banner';
        $id = decodeId($id);
        $row = Banner::find($id);
        return view('admin.banner.edit',compact('title','row'));
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
            $row = Banner::find($id);

            if(empty($row))
            {
               return $this->failure('Wrong User!');
            }

          $validator = Validator::make($request->all(),[
            'image'=>'required'
          ]) ;

          if($validator->fails())
          {
               return $this->failure($validator->errors());
          }

         $row->image = $request->image;
         $row->save();
         $request->session()->flash('success','Banner Details Updated');
         return $this->success('Banner Details Updated',['nextUrl'=>route('banner.index')]);

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
            $row = Banner::find($id);
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
                    unlink($row->image);
                    return $this->success('Deleted Successfully');
                }
            }
        }catch(Exception $e)
        {
            return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
        }

    }

}
