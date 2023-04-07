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
class PermissionsController extends Controller
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
            $data = Permission::latest();
            return Datatables::of($data)
            ->addIndexColumn()
                    ->addColumn('name', function($row){
                           return $row->name;
                    })

                    ->make(true);
         }else{
            $title = 'Permission List';
            return view('admin.permissions.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'Add New Permission';
        return view('admin.permissions.create',compact('title'));
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
            'name'=>'required|string|max:255|unique:permissions',
           ]) ;

           if($validator->fails())
           {
                return $this->failure($validator->errors());
           }

          $user =  Permission::create([
                'name'=>$request->name,
                'guard_name'=>'web'
           ]);

          $request->session()->flash('success','New Permission Added Successfully');
          return $this->success('New User Added Successfully',['nextUrl'=>route('permissions.index')]);

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
         $title = 'View User';
         $id = decodeId($id);
         $user = Permission::findorFail($id);
        return view('admin.permissions.show',compact('title','user'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit  User';
        $id = decodeId($id);
        $user = Permission::find($id);
        return view('admin.permissions.edit',compact('title','user'));
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
             $user = Permission::find($id);

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
          $request->session()->flash('success','Permission Details Updated');
          return $this->success('User Details Updated',['nextUrl'=>route('permissions.index')]);

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
        $row = Permission::find($id);
         if(empty($row))
        {
         return $this->failure('Invalid Details');
        }
        if($row->delete()){
            return $this->success('Deleted Successfully');
        }
        return $this->failure('Something Went Wrong!');

    }
}
