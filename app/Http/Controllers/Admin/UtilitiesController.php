<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Districts;
class UtilitiesController extends Controller
{
    public function fetchDistricts(Request $request)
    {
        $id = $request->id;
        $selected = $request->selected;

        $data = Districts::where('state_id',$id)->get();
        $string = '';
        $string .='<option value="">Select Option</option>';

        if(!empty($data)){
            foreach($data as $k =>$v)
            {
                $sel = ($selected == $v->id)?'selected':'';
                $string .= '<option value="'.$v->id.'" '.$sel.'>'.$v->name.'</option>';
            }
        }

        echo $string;die;

    }
}
