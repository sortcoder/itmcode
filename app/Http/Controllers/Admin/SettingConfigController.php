<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\SettingConfig;
use Illuminate\Support\Str;
class SettingConfigController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:Setting-Management');
    }
    public function index(Request $request)
    {
        $records = SettingConfig::latest()->get();
        $title = 'Setting Basic Configuration';
        return view('admin.setting_config.index',compact('title','records'));

    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $title = 'New Variable Create';
        return view('admin.setting_config.create',compact('title'));
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
             'var_key'=>'required|unique:setting_configs,var_key',
             'var_name'=>'required',
             'var_input'=>'required'
            ]) ;
            if($validator->fails())
            {
                 return $this->failure($validator->errors()->first());
            }
            $input = '';
            if($request->var_input == 'text')
            {
                if(empty($request->text))
                {
                    return $this->failure('text field is required');
                }
                $input = $request->text;
            }
            if($request->var_input == 'time')
            {
                if(empty($request->time))
                {
                    return $this->failure('time field is required');
                }
                $input = $request->time;
            }
            if($request->var_input == 'number')
            {
                if(empty($request->number))
                {
                    return $this->failure('text field is required');
                }
                $input = $request->number;
            }
            if($request->var_input == 'email')
            {
                if(empty($request->email))
                {
                    return $this->failure('email field is required');
                }
                $input = $request->email;
            }
            if($request->var_input == 'textarea')
            {
                if(empty($request->textarea))
                {
                    return $this->failure('Description is required');
                }
                $input = $request->textarea;
            }
            if($request->var_input == 'editor')
            {
                if(empty($request->editor))
                {
                    return $this->failure('Description is required');
                }
                $input = $request->editor;
            }


            $row = new SettingConfig;
            $row->var_key = $request->var_key;
            $row->var_name = $request->var_name;
            $row->var_input = $request->var_input;
            $row->var_data = $input;
            $row->save();
           $request->session()->flash('success','New Configuration Added Successfully');
           return $this->success('New Package Added Successfully',['nextUrl'=>route('setting_config.index')]);

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
        return view('admin.setting_config.show',compact('title','row'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $title = 'Edit Config';
        $id = decodeId($id);
        $row = SettingConfig::find($id);
        return view('admin.setting_config.edit',compact('title','row'));
    }

    public function update(Request $request, $id)
    {
        try{
             $id = decodeId($id);
             $row = SettingConfig::find($id);

             if(empty($row))
             {
                return $this->failure('Wrong Setting!');
             }

            $validator = Validator::make($request->all(),[
             'var_name'=>'required',
             'var_input'=>'required'
            ]) ;
            if($validator->fails())
            {
                 return $this->failure($validator->errors()->first());
            }
            $input = '';
            if($request->var_input == 'text')
            {
                if(empty($request->text))
                {
                    return $this->failure('text field is required');
                }
                $input = $request->text;
            }
            if($request->var_input == 'time')
            {
                if(empty($request->time))
                {
                    return $this->failure('Time field is required');
                }
                $input = $request->time;
            }
            if($request->var_input == 'number')
            {
                if(empty($request->number))
                {
                    return $this->failure('text field is required');
                }
                $input = $request->number;
            }
            if($request->var_input == 'email')
            {
                if(empty($request->email))
                {
                    return $this->failure('email field is required');
                }
                $input = $request->email;
            }
            if($request->var_input == 'textarea')
            {
                if(empty($request->textarea))
                {
                    return $this->failure('Description is required');
                }
                $input = $request->textarea;
            }
            if($request->var_input == 'editor')
            {
                if(empty($request->sm_editor))
                {
                    return $this->failure('Description is required');
                }
                $input = $request->sm_editor;
                
            } 

            $row->var_name = $request->var_name;
            $row->var_input = $request->var_input;
            $row->var_data = $input;
            $row->save();
           $request->session()->flash('success','Configuration Updated Successfully');
           return $this->success('Configuration Updated Successfully',['nextUrl'=>route('setting_config.index')]);

         }catch(Exception $e){
             return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
         }
    }

}
