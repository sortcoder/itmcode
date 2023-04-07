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
use Spatie\Permission\Models\Permission;
use \App\Models\ModulePermission;

use Spatie\Permission\Models\Role;
class RolesController extends Controller
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
            $data = Role::where('id','!=',4)->latest();
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
                        $html ='<div class="form-check-danger form-check form-switch" >
                            <input class="form-check-input" type="checkbox" data-checkbox-status="'.route('roles.destroy',[encodeId($row->id)]).'?change_status=true"  id="flexSwitchCheckCheckedDanger'.$row->status.'" '.$checked.'>
                            <label class="form-check-label" for="flexSwitchCheckCheckedDanger'.$row->status.'"></label>

                    </div>';
                    return $html;
                })
                   ->addColumn('action', function($row){
                       $html = '';
                    $html .= '<a href="'.route('roles.edit',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">Edit</a>';
                    $html .= '<a href="'.route('roles.show',[encodeId($row->id)]).'" class="btn btn-outline-primary m-2 btn-sm ml-2">View</a>';
                   /* $html .= '<a href="javascript:;" data-delete-alert="'.route('roles.destroy',[encodeId($row->id)]).'" class="btn btn-outline-danger ml-2 btn-sm ">Delete</a>';*/

                            return $html;
                    })
                    ->rawColumns(['action','status'])
                    ->make(true);
         }else{


            $title = 'Roles List';
            return view('admin.roles.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'Add New Role';
        $permission = Permission::get();
        return view('admin.roles.create',compact('title','permission'));
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
            'name' => 'required|unique:roles,name',
            'permission' => 'required',
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors()->first());
           }
            //    if(empty($request->module_ids))
            //    {
            //       return $this->failure('Select Minimun One Module');
            //    }
            //    $moduleIds = $request->module_ids;
            //    $modulesList = ModulePermission::whereIn('id',$request->module_ids)->get(['permission_ids']);
            //    $permissionIds =[];
            //    if(!empty($modulesList))
            //    {
            //         foreach($modulesList as $k =>$v)
            //         {
            //             if(!empty($v->permission_ids))
            //             {
            //                 $rowdata = Permission::whereIn('id',explode(',',$v->permission_ids))->pluck('id')->toArray();
            //                 if(!empty($rowdata))
            //                 {
            //                     foreach($rowdata as $Ek =>$vl)
            //                     {
            //                         $permissionIds[] = $vl;
            //                     }
            //                 }
            //             }

            //         }
            //    }

            //    if(empty($permissionIds)){
            //     return $this->failure('This Module is no one any permissions');
            //    }
        $role = Role::create(['name' => $request->input('name')]);
        $role->syncPermissions($request->input('permission'));
        $request->session()->flash('success','New Role Added Successfully');
        return $this->success('New User Added Successfully',['nextUrl'=>route('roles.index')]);
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
         $title = 'View Role';
         $id = decodeId($id);
         $role = Role::findOrFail($id);
         $rolePermissions = Permission::join("role_has_permissions","role_has_permissions.permission_id","=","permissions.id")
             ->where("role_has_permissions.role_id",$id)
             ->get();

         return view('admin.roles.show',compact('role','rolePermissions','title'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit Role';
        $id = decodeId($id);
        $role = Role::find($id);
        $permission = Permission::get();
        $rolePermissions = DB::table("role_has_permissions")->where("role_has_permissions.role_id",$id)
            ->pluck('role_has_permissions.permission_id','role_has_permissions.permission_id')
            ->all();

        return view('admin.roles.edit',compact('role','permission','rolePermissions','title'));
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
             $user = Role::find($id);

             if(empty($user))
             {
                return $this->failure('Wrong User!');
             }

           $validator = Validator::make($request->all(),[
            'name' => 'required',
            'permission' => 'required',
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors());
           }

           $role = Role::find($id);
           $role->name = $request->input('name');
           $role->save();

           $role->syncPermissions($request->input('permission'));

           $request->session()->flash('success','New Role Added Successfully');
           return $this->success('New User Added Successfully',['nextUrl'=>route('roles.index')]);

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
        $row = Role::find($id);
         if(empty($row))
        {
         return $this->failure('Invalid Details');
        }

        if(!empty($_GET['usertype']))
        {
            $status = ($row->status == 2)?1:2;
            $row->status = $status;
            if($row->save()){
                return $this->success('Role Status Updated Successfully');
            }
        }else{
            if($row->delete()){
                return $this->success('Role Deleted Successfully');
            }
        }

        return $this->failure('Something Went Wrong!');

    }
}
