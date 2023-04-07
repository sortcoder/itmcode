<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ModulePermission;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use DB as DB;
use Yajra\Datatables\Datatables;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
class ModuleController extends Controller
{
     use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {


         if($request->ajax())
         {
            $data = ModulePermission::latest()->get();
            return Datatables::of($data)
            ->addIndexColumn()
                    ->addColumn('name', function($row){
                           return $row->name;
                    })
                   ->addColumn('action', function($row){
                       $html = '';
                    $html .= '<a href="'.route('module.edit',[encodeId($row->id)]).'" class="btn btn-primary ml-2 btn-sm mr-2"><i class="fadeIn animated bx bx-edit-alt"></i></a>';
                    $html .= '<a href="'.route('module.show',[encodeId($row->id)]).'" class="btn btn-primary m-2 btn-sm ml-2"><i class="fadeIn animated bx bx-notification"></i></a>';

                            return $html;
                    })
                    ->rawColumns(['action'])
                    ->make(true);
         }else{
            $title = 'Module List';
            return view('admin.module.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'Add New Module';
        $permission = Permission::get();
        return view('admin.module.create',compact('title','permission'));
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
            'name' => 'required|unique:module,name',
            'permission_ids' => 'required',
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }

        $role = ModulePermission::create([
            'name' => $request->input('name'),
            'permission_ids'=> !empty($request->permission_ids)?implode(',',$request->permission_ids):''
        ]);

        $request->session()->flash('success','New Module Added Successfully');
        return $this->success('New Module Added Successfully',['nextUrl'=>route('module.index')]);

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
         $title = 'View Module';
         $id = decodeId($id);
         $user = ModulePermission::findorFail($id);
        return view('admin.module.show',compact('title','user'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit Module';
        $id = decodeId($id);
        $permission = Permission::get();

        $user = ModulePermission::find($id);
        return view('admin.module.edit',compact('title','user','permission'));
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
             $user = ModulePermission::find($id);

             if(empty($user))
             {
                return $this->failure('Wrong User!');
             }

           $validator = Validator::make($request->all(),[
            'name' => [
                'required',Rule::unique('users')->ignore($user->id)
            ],
            'permission_ids' => 'required',
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors());
           }



            $role = ModulePermission::find($id);
            $role->name = $request->input('name');
            $role->permission_ids = !empty($request->permission_ids)?implode(',',$request->permission_ids):$user->permission_ids;
            $role->save();
            $request->session()->flash('success','Module Details Updated');
            return $this->success('Module Details Updated',['nextUrl'=>route('module.index')]);

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
        if(empty($id))
        {
            return $this->failure('Invalid Details');
        }
        $id = decodeId($id);
        $row = ModulePermission::find($id);
         if(empty($row))
        {
         return $this->failure('Invalid Details');
        }
        if($row->delete()){
            session()->flash('success','Module Deleted');
            return $this->success('Deleted Successfully');
        }

        return $this->failure('Something Went Wrong!');

    }
}
