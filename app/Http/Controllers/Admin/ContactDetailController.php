<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash; 
use App\Models\ContactDetail;
use DB;
use Auth;

class ContactDetailController extends Controller
{
    use ResponseWithHttpRequest;
 
    public function __construct(){
         
    }
    public function index(Request $request)
    { 
         if($request->ajax())
         {
            $data = ContactDetail::latest();

            return Datatables::of($data)
            ->addIndexColumn() 
            ->addColumn('user_name', function($row){
                   return $row->user_name;
            })
            ->addColumn('email', function($row){
                return $row->email ?? '';
            }) 
            ->addColumn('mobile', function($row){
                return $row->mobile ?? '';
            }) 
            ->addColumn('message', function($row){
                $in = $row->description;
                $out = strlen($in) > 30 ? substr($in,0,30)."..." : $in;
                return $out ?? '';
            })  
            ->addColumn('created_at', function($row){
                return $row->created_at ?? '';
            }) 
            ->addColumn('action', function($row){

               $html = ''; 
               $html .= '<a href="'.route('contact.show',[encodeId($row->id)]).'" class="btn btn-outline-primary ml-2 btn-sm mr-2">View</a>';
               $html .= '<a href="javascript:;" data-delete-alert="'.route('contact.destroy',[encodeId($row->id)]).'" class="btn btn-outline-danger ml-2 btn-sm ml-2 ">Delete</a>';
                return $html;
            })
            ->rawColumns(['message','action'])
            ->make(true);
         }else{
            $title = 'Customer Support List';
            return view('admin.contact.index',compact('title'));
         }



    }

    public function create()
    { 
    }

    public function store(Request $request)
    {

    }

    public function show(Request $request,$id)
    { 
        $title = 'View Customer Support Information';
        $id = decodeId($id);
        $contact_dt = ContactDetail::find($id);

        return view('admin.contact.show',compact('title','contact_dt'));
    }
     
    public function edit($id)
    { 
    }
 
    public function update(Request $request, $id)
    { 
    }
 
    public function destroy($id)
    {
        $id = decodeId($id);
        $row = ContactDetail::find($id)->delete();
        return $this->success('Deleted Successfully');  
    } 

}
