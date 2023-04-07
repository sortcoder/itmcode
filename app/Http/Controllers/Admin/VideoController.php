<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\Video;
use Illuminate\Support\Str;
class VideoController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:Roles-Permission-Management');
    }

    public function index(Request $request)
    {

         if($request->ajax())
         {
            $data = Video::latest();
            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('title', function($row){
                           return $row->title;
                    })
                    ->addColumn('image', function($row){
                        // return '<img src="'.imageAsset($row->image,'uploads/video/').'" width="90" height="70">';

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
                   ->addColumn('youtube_link', function($row){
                    return '<a class="btn btn-outline-info btn-sm" href="'.$row->youtube_link.'" target="_blank"><i class="fa fa-youtube-play" aria-hidden="true"></i> Watch Video</a>';
                  })


                   ->addColumn('status', function($row){
                            $checked = '';
                            if($row->status == 1)
                            {
                                $checked = 'checked';
                            }
                            $html ='<div class="form-check-danger form-check form-switch">
                                <input class="form-check-input" type="checkbox" data-checkbox-status="'.route('video.destroy',[encodeId($row->id)]).'?change_status=true"  id="flexSwitchCheckCheckedDanger'.$row->status.'" '.$checked.'>
                                <label class="form-check-label" for="flexSwitchCheckCheckedDanger'.$row->status.'"></label>

                        </div>';
                        return $html;
                    })
                   ->addColumn('action', function($row){

                       $html = '';
                       $html .= '<a href="'.route('video.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">Edit</a>';
                       $html .= '<a href="'.route('video.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';

                        $html .= '<a href="javascript:;" data-delete-alert="'.route('video.destroy',[encodeId($row->id)]).'" class="btn btn-outline-danger ml-2 btn-sm ">Delete</a>';
                        return $html;
                    })
                    ->rawColumns(['action','status','youtube_link','image'])
                    ->make(true);
         }else{
            $title = 'Video List';
            return view('admin.video.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'New Video';
        return view('admin.video.create',compact('title'));
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
             'title'=>'required',
             'youtube_link'=>'required',
             'image'=>'required'
            ]) ;

            if($validator->fails())
            {
                 return $this->failure($validator->errors()->first());
            }
            $row = new Video;
            $row->title = $request->title;
            $row->youtube_link = $request->youtube_link;
            $row->image = $request->image;
            $row->description = $request->description;
            $row->status = 1; // default active
            $row->save();
           $request->session()->flash('success','New Video Added Successfully');
           return $this->success('New Video Added Successfully',['nextUrl'=>route('video.index')]);

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
        $title = 'Edit Video';
        $id = decodeId($id);
        $row = Video::find($id);
        return view('admin.video.show',compact('title','row'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit Video';
        $id = decodeId($id);
        $row = Video::find($id);
        return view('admin.video.edit',compact('title','row'));
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
            $row = Video::find($id);

            if(empty($row))
            {
               return $this->failure('Wrong User!');
            }

            $validator = Validator::make($request->all(),[
                'title'=>'required',
                'youtube_link'=>'required', 
               ]) ;

               if($validator->fails())
               {
                    return $this->failure($validator->errors()->first());
               }

               $row->title = $request->title;
               $row->youtube_link = $request->youtube_link;
               if(isset($request->image)){
                    $row->image = $request->image; 
               }
               $row->description = $request->description;
               $row->save();

         $request->session()->flash('success','Video Details Updated');
         return $this->success('Video Details Updated',['nextUrl'=>route('video.index')]);

       }catch(Exception $e){
         return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
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
            $id = decodeId($id);
            $row = Video::find($id);
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
                    unlink('public/'.$row->image);
                    return $this->success('Deleted Successfully');
                }
            }
        }catch(Exception $e)
        {
           return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }

    }
}
