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
use \App\Models\Districts;
class DistrictController extends Controller
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
            $data = Districts::with(['state'])->latest();

            return Datatables::of($data)
            ->addIndexColumn()

                    ->addColumn('name', function($row){
                           return $row->name;
                    })
                    ->addColumn('state', function($row){
                        return $row->state->name ?? '';
                    })->addColumn('country', function($row){

                        return @$row->state->country->name;

                    })
                   ->addColumn('action', function($row){
                       $html = '';

                        return $html;
                    })
                    ->rawColumns(['action','status'])
                    ->make(true);
         }else{
            $title = 'District List';
            return view('admin.district.index',compact('title'));
         }



    }

}
