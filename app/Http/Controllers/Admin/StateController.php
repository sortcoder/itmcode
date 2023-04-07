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
use \App\Models\State;
class StateController extends Controller
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
            $data = State::with('country')->latest();
            return Datatables::of($data)
            ->addIndexColumn()
                    ->addColumn('name', function($row){
                           return $row->name;
                    })
                    ->addColumn('country', function($row){
                        return $row->country->name;
                 })
                   ->addColumn('action', function($row){
                       $html = '';

                        return $html;
                    })
                    ->rawColumns(['action','status'])
                    ->make(true);
         }else{
            $title = 'State List';
            return view('admin.state.index',compact('title'));
         }



    }

}
