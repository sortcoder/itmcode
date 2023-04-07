<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use \DB;
class DashboardController extends Controller
{
    public $title = 'Dashboard';
    public $viewData = [];
    public function __construct(){
        $this->viewData['title'] = $this->title;
    }
    public function index(){ 
        return view('admin.dashboard.index')->with($this->viewData);
    }

    public function charts(){


    }
}
