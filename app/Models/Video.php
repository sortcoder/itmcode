<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;



    /*** Check User KYC Verification is pending or not */
    public static function stepOfForm($userRow){
        $data = ['stepNo'=>0,'stepName'=>'','is_email_verified'=>0];
        $userRow->refresh();
        $laucher = ($userRow->user_type == 3)?true:false;

                if(empty($userRow->pan_card_no) || !is_file($userRow->pan_card_img))
                {
                    $data['stepNo'] = 2;
                    $data['stepName'] = 'Pan Card Kyc Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }else if(empty($userRow->aadhar_card_no) || !is_file($userRow->aadhar_front_img) || !is_file($userRow->aadhar_back_img)){

                    $data['stepNo'] = 3;
                    $data['stepName'] = 'Aadhar Card KYC Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }else if(!is_file($userRow->profile) || !is_file($userRow->signature)){

                    $data['stepNo'] = 4;
                    $data['stepName'] = 'Additiona Information KYC Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }


                else if(empty($userRow->dob)
                        || empty($userRow->gender)
                        || empty($userRow->marital_status)
                        || empty($userRow->profession)
                        || empty($userRow->mother_name)
                        || empty($userRow->father_name)
                        || empty($userRow->state)
                        || empty($userRow->district)
                        || empty($userRow->pincode)
                        || empty($userRow->city)
                ){

                    $data['stepNo'] = 5;
                    $data['stepName'] = 'Account Registration Is Pending';
                    $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                    return $data;
                }else{
                    if($userRow->kyc_status == 2)
                    {
                        $data['stepNo'] = 6;
                        $data['stepName'] = 'KYC Completed';
                        $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                        return $data;
                    }else{
                        $data['stepNo'] = 1;
                        $data['stepName'] = 'Kyc is pending';
                        $data['is_email_verified'] = !empty($userRow->is_email_verified)?1:0;
                        return $data;
                    }

                }


    }





}
