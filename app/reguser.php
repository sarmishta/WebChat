<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Encryptable;
use Illuminate\Support\Facades\Crypt;
class reguser extends Model
{
     protected $fillable=[
         'username',
         'password',
         'email'
     ];
     //echo $fillable->username;
//     protected $encryptable=['username',
//         'password',
//         'email'
//     ];
//     protected $encrypt=['username',
//         'password',
//         'email'];
    // echo username;
//     public function doEncrypt($value)
//     {
//          if (in_array($key,$this->encrypt)) {
//               $value = Crypt::encrypt($value);
//          }
//     }
     public function getname($request)
     {
          $salt="DhLp456Fhrt";

          $value1=$request['username'];
          $enc1=$value1 ^ $salt;
          $value2=$request['password'];
          $enc2=$value2 ^ $salt;
          $value3=$request['email'];
          $enc3=$value3 ^ $salt;
          //echo $enc1;
          $list=array("_token"=>"","username"=>$enc1,"password"=>$enc2,"email"=>$enc3,"Register"=>"register");
          return $list;
          //echo $enc1;
          //$decry1=$enc1 ^ $salt;
          //echo $decry;

          //return $request['username'];
     }

     public function decrypt($request)
     {
          $salt="DhLp456Fhrt";
          $value1=$request['username'];

     }

}


