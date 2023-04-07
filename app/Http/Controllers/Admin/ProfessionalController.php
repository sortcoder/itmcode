<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use DB as DB;
use Yajra\Datatables\Datatables;
use \App\Models\Professional;
class ProfessionalController extends Controller
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
            $data = Professional::latest();
            return Datatables::of($data)
            ->addIndexColumn()
                    ->addColumn('name', function($row){
                           return $row->name;
                    })
                    ->addColumn('status', function($row){
                        $checked = '';
                        if($row->status == 1)
                        {
                            $checked = 'checked';
                        }
                        $html ='<div class="form-check-danger form-check form-switch">
                            <input class="form-check-input" type="checkbox" data-checkbox-status="'.route('professional.destroy',[encodeId($row->id)]).'?change_status=true"  id="flexSwitchCheckCheckedDanger'.$row->status.'" '.$checked.'>
                            <label class="form-check-label" for="flexSwitchCheckCheckedDanger'.$row->status.'"></label>

                     </div>';
                    return $html;
                 })
                   ->addColumn('action', function($row){
                       $html = '';
                       $html .= '<a href="'.route('professional.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">Edit</a>';
                       $html .= '<a href="'.route('professional.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';


                        return $html;
                    })
                    ->rawColumns(['action','status'])
                    ->make(true);
         }else{
            $title = 'Profession List';
            return view('admin.professional.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'Add New Profession';
        return view('admin.professional.create',compact('title'));
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
            'name'=>'required|string|max:255|unique:professionals',
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors());
           }

          $user =  Professional::create([
                'name'=>$request->name,

           ]);

          $request->session()->flash('success','New Profession Added Successfully');
          return $this->success('New User Added Successfully',['nextUrl'=>route('professional.index')]);

        }catch(Exception $e){
            return $this->failure($e->getMessage());
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
         $title = 'View Profession';
         $id = decodeId($id);
         $user = Professional::findorFail($id);
        return view('admin.professional.show',compact('title','user'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit Profession';
        $id = decodeId($id);
        $user = Professional::find($id);
        return view('admin.professional.edit',compact('title','user'));
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
             $user = Professional::find($id);

             if(empty($user))
             {
                return $this->failure('Wrong User!');
             }

           $validator = Validator::make($request->all(),[
            'name'=>'required|string|max:255',
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors());
           }

          $user->name = $request->name;

          $user->save();
          $request->session()->flash('success','Profession Details Updated');
          return $this->success('Profession Details Updated',['nextUrl'=>route('professional.index')]);

        }catch(Exception $e){
            return $this->failure($e->getMessage());
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
        $row = Professional::find($id);
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

        return $this->failure('Something Went Wrong!');

    }
}
