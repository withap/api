IDE settings

file - settings - search "nodeJs" - "edit usage scope" clear all, set NodeJs
EDIT CONFIGURE Run\Debug set Node interpreter path, working directory, JavaScript file. Set Environment Variables - NODE_PATH = 1

----

MongoDB

fields
username = email

C:\Winginx\home\witness\db>C:\mongo\bin\mongod.exe --dbpath /mongo/db -v

C:\Winginx\home\witness\db>C:\mongo\bin\mongo.exe withap
//Mongo witness


BUGS
http://stackoverflow.com/questions/28651028/cannot-find-module-build-release-bson-code-module-not-found-js-bson

----

DOCS

https://github.com/expressjs/body-parser
https://github.com/expressjs/serve-favicon
https://github.com/expressjs/method-override
https://www.npmjs.com/package/mongoose-unique-validator

cloudinary
http://dailyjs.com/2013/02/21/cloudinary/
----


�������� ������ 3 �������� ������� API
������ ������ �������
�� ���� ���� �������� ������������ ������ � ���������� ������
��������� ������ ��� ��������� ������ � ��������� ������

��� ��� ����� ����� �� ������ 3 ���� �������:
200 OK
400 Bad Request (������������ ������)
500 Internal server error (���������� ������ �������)

���� 3-� ����� ��� ������������ � �������� ��� 5:
201 Created (������ �������)
304 Not Modified (������ �� ����������)
404 Not Found (������ �� �������)
401 Unauthorized (���������������� ������)
403 Forbidden (������ ��������)



FACEBOOK

<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1626647327578106',
      xfbml      : true,
      version    : 'v2.3'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>

test
<div
  class="fb-like"
  data-share="true"
  data-width="450"
  data-show-faces="true">
</div>

1626647327578106
b9c530303cc7e5fa9cf375e30abcc392


    "access_token": "BuWtopuoV/yusqWhlClcfc6HwyqQ8F0nLmdBuNwgNpQ=",
    "refresh_token": "IZPE63lHtJEwH97w99XY605PCJD+eM9Ny/yt9AP9K38=",
    "expires_in": 3600,
    "token_type": "Bearer"

validator
https://www.npmjs.com/package/validator
https://github.com/ctavan/express-validator