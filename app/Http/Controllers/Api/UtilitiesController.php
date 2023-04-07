<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use App\Models\User;
use Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\State;
use App\Models\Professional;
use App\Models\Districts;
use App\Models\Designation;
use Auth;
class UtilitiesController extends Controller
{
    use ResponseWithHttpRequest ;

    public function _all_assets_array(){
        $stateList =  State::stateListArray();
        $professionalList =  Professional::professionListArray();
        $designationList =  Designation::designationListArray();
        $data = [];
        $data['state_list'] = $stateList;
        $data['profession_list'] = $professionalList;
        $data['designation_list'] = $designationList;
        return $this->success('common array list',$data);
    }

    public function _fetch_districts($slug){
        if(empty($slug))
        {
            return $this->failure('district not found');
        }
        $list =  Districts::districtListArray($slug);
        return $this->success('district list',$list);
    }

    
    
}

