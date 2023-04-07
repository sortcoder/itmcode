<?php

namespace App\Http\Controllers;
   
use Illuminate\Http\Request;
 
use PDF;
use Mail; 

class PDFController extends Controller
{ 
    public function index()
    {
        $data = [
            'title' => 'Welcome to Tutsmake.com',
            'date' => date('m/d/Y')
        ];
           
        $pdf = PDF::loadView('testPDF', $data);
     
        return $pdf->download('tutsmake.pdf');
    }

    public function send_pdf_email()
    {
        $data["email"] = "manvendrajploft@gmail.com";
        $data["title"] = "From ITM Money.com";
        $data["body"] = "This is Demo PDF";
  
        //$pdf = PDF::loadView('emails.myTestMail', $data);
        
        return view('emails.myTestMail',$data);

        Mail::send('emails.myTestMail', $data, function($message)use($data, $pdf) {
            $message->to($data["email"], $data["email"])
                    ->subject($data["title"])
                    ->attachData($pdf->output(), "text.pdf");
        });
  
        dd('Mail sent successfully');
    }
 
}
