<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Traits\ResponseWithHttpRequest as ResponseWithHttpRequest;
use Validator;
use Yajra\Datatables\Datatables;
use Illuminate\Support\Facades\Hash;
use App\Models\Notification;
use App\Helpers\ApiHelper; 

use Illuminate\Support\Str;

class NotificationController extends Controller
{
    use ResponseWithHttpRequest;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function __construct(){
        $this->middleware('permission:Notification');
    }


    public function new_firebase_check(Request $request)
    {
        /********** Code for send notification on APP using Firebase Server Key
            dd("new_firebase_check");
            $user_id = "40";
            $title = "hello ";
            $message = "dfnklgdgfdbnhds mgfbsg das"; 
            return $send = ApiHelper::sendNotification($user_id,$title,$message); 
            die; 
        */

        /******* Code for sending Notification on Web using Firebase (Web Config=>Web Push Certification "Key Pair" key)   
            $fcmUrl = 'https://fcm.googleapis.com/v1/projects/test-project-bcfcb/messages:send';
            $token = 'cTZ9J1asQ4uJaJZU8pLSdL:APA91bGjOcNJ_rq-GLznZlM-6eeIK_15USjkAXUJvhyRnoVyvJ2_maxKnWdNvWA5dAvggpjXcZlOCzdrr3KtSkjzNAd1VbLzZ1_djsO_1ZznopTpZbcZRDadJEKnftPe54aRFZUYSLWU'; 
            $title = "test messaggeeee"; 
            $extramessage = "nsdmfsdfnsd dnf"; 
            $type = "sdfdsdf"; 
            $sound = true; 
            $alert = true;
             
            $notification = [
                'title' => $title,
                'body' => $extramessage,
            ];
            
            $android = [
                'notification' => [
                    'click_action' => 'android.intent.action.MAIN'
                ]
            ];
            $apns = [
                'headers' => [
                    'apns-priority' => '10'
                ],
                'payload' => [
                    'aps' => [
                        'badge' => 1
                    ],
                    'mutable_content' => 1,
                    'content_available' => 1,
                    'data' => [
                        'title' => '',
                        'body' => '',
                        'image' => ''
                    ]
                ]
            ];
            $messageBody = [
                'token'=> $token,  
                'notification' => $notification,
                'android' => $android,
                'apns' => $apns,
            ];
            $fcmNotification = [
                'message'        => $messageBody
            ];
             
            $headers = array();
            $headers[] = 'Content-Type: application/json';
            $headers[] = 'Authorization: Bearer BKjbBvVI0IQ6xzji0pczk14m5JHroIgkTuI8C-w7wAGWK1bu6dHNrKQFjf6snMR1bl8hy8QuKMfRBU44qKpuUGA';
            $data = json_encode($fcmNotification);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $fcmUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fcmNotification));

            $result = curl_exec($ch);

            dd($result);
            if ($result === FALSE) {
                //Failed
                die('Curl failed: ' . curl_error($ch));
            }

            curl_close($ch);
        */
    }

    private function getGoogleAccessToken(){

        require "./vendor/autoload.php";
        $credentialsFilePath = public_path('download/itm-money-893e6-firebase-adminsdk-nkzvr-abafe8aafc.json'); //replace this with your actual path and file name
        $client = new \Google_Client();
        $client->setAuthConfig($credentialsFilePath);
        $client->addScope('https://www.googleapis.com/auth/firebase.messaging');
        $client->refreshTokenWithAssertion();
        $token = $client->getAccessToken();
       //  echo "getGoogleAccessToken =";dd($token);
        return $token['access_token'];

    }






    public function index(Request $request)
    { 
         if($request->ajax())
         {
            $data = Notification::latest();
            return Datatables::of($data)
                    ->addIndexColumn()
                    ->addColumn('title', function($row){
                           return $row->title;
                    })
                    ->addColumn('description', function($row){
                        return $row->desc;
                   })


                    ->rawColumns(['action','description','title'])
                    ->make(true);
         }else{
            $title = 'Notification List';
            return view('admin.notification.index',compact('title'));
         }



    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        if($request->ajax())
        {
            $data = User::lt()->latest()->get();
                 return Datatables::of($data)
                    ->addColumn('id', function($row){
                        return '<div class="form-check form-check-inline">
                        <input class="form-check-input user_id" name="user_id[]" type="checkbox" id="inlineCheckbox'.$row->id.'" value="'.$row->id.'">
                        <label class="form-check-label" for="inlineCheckbox'.$row->id.'"></label></div>';
                    })
                    ->addColumn('name', function($row){
                        return $row->name;
                    })
                    ->addColumn('email', function($row){
                        return $row->email;
                    })
                    ->addColumn('mobile', function($row){
                    return $row->mobile;
                     })
                     ->addColumn('user_type', function($row){
                        return \Config::get('constants.userLoginType')[$row->user_type];
                    })
                     ->rawColumns(['id'])->make(true);
        }else{
            $title = 'Send Notification';
            return view('admin.notification.create',compact('title'));
        }


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
             'title'=>'required',
             'desc'=>'required',
            ]) ;
            if($validator->fails())
            {
                 return $this->failure($validator->errors()->first());
            }
            $row = new Notification;
            $row->title = $request->title;
            $row->desc = $request->desc;
            $row->save();
           $request->session()->flash('success','New Notification Added Successfully');
           return $this->success('New Notification Added Successfully',['nextUrl'=>route('notification.index')]);

         }catch(Exception $e){
             return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
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

        try{
            $deleteStatus = true;
            if(!empty($_GET['change_status']))
            {
                $deleteStatus = false;
            }

            if(empty($id))
            {
                return $this->failure('Invalid Details');
            }
            $id = decodeId($id);
            $row = Notification::find($id);
             if(empty($row))
            {
                 return $this->failure('Invalid Details');
            }
            if(empty($deleteStatus))
            {
                if($row->save()){
                    return $this->success('Status Updated Successfully');
                }
            }else{
                if($row->delete()){
                    return $this->success('Deleted Successfully');
                }
            }
        }catch(Exception $e)
        {
            return $this->failure(!empty(env('APP_DEBUG'))?$e->getMessage():'Something Went Wrong!');
        }

    }

    public function send_notification_from_admin(Request $request)
    {
        try{
            $userid = !empty($_POST['user_id'])?$_POST['user_id']:[];
            $title = !empty($_POST['title'])?$_POST['title']:'';
            $description = !empty($_POST['description'])?$_POST['description']:'';
            $all = !empty($_POST['all'])?$_POST['all']:'';
            if(empty($userid))
            {
                return $this->failure('No records found');
            }
            if(empty($title))
            {
                return $this->failure('title is required');
            }
            $userid = array_unique($userid);
            $findRows = User::whereIn('id',$userid)->get();
            if(empty($findRows)){
                return $this->failure('No records found');
            }
            $userCount = 0; // for check how many user credit balance
            foreach($findRows as $k =>$v)
            {
                    // $row = new CreditBalance;
                    // $row->user_id = $v->id;
                    // $row->amount = $amount;
                    // $row->status = 1; // credit to credit balance;
                    // $row->save();
                    //

                $user_id = $v->id;
                $title = $description; // $title;
                $message = $description; 
                $send = ApiHelper::sendNotification($user_id,$title,$message); 

                $userCount++;
            }
            
            $row = new Notification;
            $row->title = $title;
            $row->desc = $description;
            $row->save();
 
            return $this->success($userCount.' Notification Sended successfully');
        }catch(Exception $e)
        {
            return $this->failure(!empty(\Config::get('app.debug'))?$e->getMessage():'Something Went Wrong!');
        }
    }

     /**
     * Write code on Method
     *
     * @return response()
     */
    public function saveToken(Request $request)
    {
        auth()->user()->update(['device_id'=>$request->token]);
        return response()->json(['token saved successfully.']);
    }

    /**
     * Write code on Method
     *
     * @return response()
     */
    public function sendNotification()
    {
        $firebaseToken = User::whereNotNull('device_id')->pluck('device_id')->all();

        $SERVER_API_KEY = 'BIAVozQAKG7zxWoURvteJj4ONL4yJfheLIi1xNLS8VP4b8oXpE1TCBNlF50FPym-XUMiImd__qd7tHPslElxrIQ';

        $data = [
            "registration_ids" => $firebaseToken,
            "notification" => [
                "title" =>'dummy title',
                "body" => 'testing message body',
            ]
        ];
        $dataString = json_encode($data);

        $headers = [
            'Authorization: key=' . $SERVER_API_KEY,
            'Content-Type: application/json',
        ];

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataString);

        $response = curl_exec($ch);

        dd($response);
    }
}
