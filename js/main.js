var myAPI_key="d30c30f2e4eddeb7eac9ca3f90272243";
var myshared_secret="02a7d0b8401ee3cc436bf49f70ca2147";

var url = window.location.href; // or window.location.href for current url
var captured = /token=([^&]+)/.exec(url)[1]; // Value is in [1] ('384' in our case)
var result = captured ? captured : 'myDefaultValue';
console.log(captured);

/*
Metode: https://www.last.fm/api/show/auth.getSession
Objective: Fetch a session key for a user. The third step in the authentication process. See the authentication how-to for more information.
          ( as we are making a web application...https://www.last.fm/api/webauth)
Params:
token (Required) : A 32-character ASCII hexadecimal MD5 hash returned by step 1 of the authentication process (following the granting of
                  permissions to the application by the user)
api_key (Required) : A Last.fm API key.
api_sig (Required) : A Last.fm method signature. See authentication for more information
Api_sig requereix uns quants canvis ( calculs complicats que he anant fent)...
Result JSON expected:
exit ->
{
  "session": {
    "subscriber": 0,
    "name": "edufissure",
    "key": "fem3L_nnsWNwD_yGL4mtVRPOlblLynx5"
  }
}
error ->
{
  "error": 4,
  "message": "Unauthorized Token - This token has not been issued"
}
*/
function calculateApiSignatureStack()
{

          // Set elsewhere but hacked into this example:
        var last_fm_data = {
            'last_token':captured,
            'user': 'supermariano1',
            'secret': '02a7d0b8401ee3cc436bf49f70ca2147'
        };

        // Kick it off.
        last_fm_call('auth.getSession', {'token': last_fm_data['last_token']});


        // Low level API call, purely builds a POSTable object and calls it.
        function last_fm_call(method, data){

          //data seria {'token': last_fm_data['last_token']} que seria captured o sessionStoragemyToken
            // param data - dictionary.Populate Values on the Object s you'll see below the Key values can be any object and are not limited to Strings.
            last_fm_data[method] = false;
            // Somewhere to put the result after callback.

            // Append some static variables
            data.api_key = "d30c30f2e4eddeb7eac9ca3f90272243";
            //data['format'] = 'json';
            data['method'] = method;

            post_data = last_fm_calculate_apisig(data);
        /*
        .*/
            console.log("Post data: Last token " + post_data.token + "\nApiKey: "+ post_data.api_key + "\nApiSig: " + post_data.api_sig);
            sessionStorage.setItem("\nmyApiSig",post_data.api_sig );

            var last_url="http://ws.audioscrobbler.com/2.0/?";
            $.ajax({
              type: "GET",
              url: last_url,
              data : 'method=auth.getSession' +
                     '&token='+
                     captured+
                     '&api_key=d30c30f2e4eddeb7eac9ca3f90272243' +
                     '&api_sig='+
                      post_data.api_sig+
                     '&format=json',
              //data: post_data,
              dataType: 'json',
              //"success" gets called when the returned code is a "200" (successfull request). "error" gets called whenever another code is returned (e.g. 404, 500).
              success: function(res){
                  //No caldria aquesta instrucció perque ja guaredem els que ens convé en sessionStorage
                  last_fm_data[method] = res;
                  //var	myresposta = JSON.parse(res);
                  console.log("Resposta: Name " + res.session.name);// Should return session key.
                  console.log("Resposta: Key " + res.session.key);

                  //store session key for further authenticate operations...
                  sessionStorage.setItem("mySessionUser", res.session.name);
                  sessionStorage.setItem("mySessionKey", res.session.key);
              },
              error : function(xhr, status, error){
                    var errorMessage = xhr.status + ': ' + xhr.statusText
                    console.log('Error - ' + errorMessage);
              }
             });
        }

        function last_fm_calculate_apisig(params){

          //Crec que només necessitem apikey, token i secret i no necessitem params, els podem treure de sessionStorage
          //Calcula l'apiSig a partir dels valors d'abans...
            ss = "";
            st = [];
            so = {};
            so['api_key'] = params['api_key'];
            so['token'] = params['token'];
            Object.keys(params).forEach(function(key){
                st.push(key); // Get list of object keys
            });
            st.sort(); // Alphabetise it
            st.forEach(function(std){
                ss = ss + std + params[std]; // build string
            });
            ss += last_fm_data['secret'];
                // console.log(ss + last_fm_data['secret']);
                //Segons documentacio : https://www.last.fm/api/webauth
                //api signature = md5("api_keyxxxxxxxxmethodauth.getSessiontokenxxxxxxxmysecret")
                //OBJECTIU NOSTRE SERA ACONSEGUIR UNA LINEA COM AQUESTA
                // api_keyAPIKEY1323454formatjsonmethodauth.getSessiontokenTOKEN876234876SECRET348264386
            //hashed_sec = $.md5(unescape(encodeURIComponent(ss)));
            var hashed_sec = md5(unescape(encodeURIComponent(ss))); // "2063c1608d6e0baf80249c42e2be5804"
            console.log("La apiSig es: " + hashed_sec);
            so['api_sig'] = hashed_sec; // Correct when calculated elsewhere.
            return so; // Returns signed POSTable object
        }
}

/*
Metode: https://www.last.fm/api/show/user.getInfo
Objective: Get information about a user profile.
Params:
user (Optional) : The user to fetch info for. Defaults to the authenticated user.
                  NOTE NOW IS REQUIRED, WITHOUT THIS IT DOESNT WORK
api_key (Required) : A Last.fm API key.
Result JSon :
{
  "user": {
    "playlists": "0",
    "playcount": "1718",
    "gender": "n",
    "name": "edufissure",
    "subscriber": "0",
    "url": "https:\/\/www.last.fm\/user\/edufissure",
    "country": "Spain",
    "image": [
      {
        "size": "small",
        "#text": "https:\/\/lastfm-img2.akamaized.net\/i\/u\/34s\/cc637716959b4acecaa1a307e300f61f.png"
      },
      {
        "size": "medium",
        "#text": "https:\/\/lastfm-img2.akamaized.net\/i\/u\/64s\/cc637716959b4acecaa1a307e300f61f.png"
      },
      {
        "size": "large",
        "#text": "https:\/\/lastfm-img2.akamaized.net\/i\/u\/174s\/cc637716959b4acecaa1a307e300f61f.png"
      },
      {
        "size": "extralarge",
        "#text": "https:\/\/lastfm-img2.akamaized.net\/i\/u\/300x300\/cc637716959b4acecaa1a307e300f61f.png"
      }
    ],
    "registered": {
      "unixtime": "1172080539",
      "#text": 1172080539
    },
    "type": "user",
    "age": "0",
    "bootstrap": "0",
    "realname": ""
  }
}
*/
$.ajax({
    type : 'GET',
    url : 'http://ws.audioscrobbler.com/2.0/?',
    data : 'method=user.getinfo&' +
           'user=supermariano1&'+
           'api_key=d30c30f2e4eddeb7eac9ca3f90272243&' +
           'format=json',
    dataType : 'json',
    success : function(data) {
            $('#success #artistName').html(data.user.name);
           $('#success #artistImage').html('<img src="' + data.user.image[1]['#text'] + '" />');
           $('#success #artistBio').html(data.user.playcount);
       },
    error : function(code, message){
         $('#error').html('Error Code: ' + code + ', Error Message: ' + message);
    }
});
/*
Metode: https://www.last.fm/api/show/user.getInfo
Objective: Get information about a user profile.
Params:
user (Optional) : The user to fetch info for. Defaults to the authenticated user.
                  NOTE NOW IS REQUIRED, WITHOUT THIS IT DOESNT WORK
api_key (Required) : A Last.fm API key.
Result XML :
<user>
    <id>1000002</id>
    <name>RJ</name>
    <realname>Richard Jones </realname>
    <url>http://www.last.fm/user/RJ</url>
    <image>http://userserve-ak.last.fm/serve/126/8270359.jpg</image>
    <country>UK</country>
    <age>27</age>
    <gender>m</gender>
    <subscriber>1</subscriber>
    <playcount>54189</playcount>
    <playlists>4</playlists>
    <bootstrap>0</bootstrap>
    <registered unixtime="1037793040">2002-11-20 11:50</registered>
</user>
*/
function loadUserInfoXMLDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      myFunction(this);
    }
  };
  xhttp.open("GET", "http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=supermariano1&api_key=d30c30f2e4eddeb7eac9ca3f90272243", true);
  xhttp.send();
}
function myFunction(xml) {
  var i;
  var xmlDoc = xml.responseXML;
  var table="<tr><th>Data</th><th>Value</th><th>Altre</th></tr>";
  var x = xmlDoc.getElementsByTagName("user");
  for (i = 0; i <x.length; i++) {
    table += "<tr><td>" +
    x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue +
    "</td><td>" +
    x[i].getElementsByTagName("playcount")[0].childNodes[0].nodeValue +
    "</td><td><img src="+
    x[i].getElementsByTagName("image")[2].childNodes[0].nodeValue +
   "></img></td></tr>";
   console.log(x[i]);
  }
  document.getElementById("demo").innerHTML = table;
}
/*
Metode: https://www.last.fm/api/show/chart.getTopArtists
Objective: Get the top artists chart
Params:
page (Optional) : The page number to fetch. Defaults to first page.
limit (Optional) : The number of results to fetch per page. Defaults to 50.
api_key (Required) : A Last.fm API key.:
Params
page (Optional) : The page number to fetch. Defaults to first page.
limit (Optional) : The number of results to fetch per page. Defaults to 50.
api_key (Required) : A Last.fm API key.
Exmaple response in json:
{
  "artists": {
    "artist": [
      {
        "name": "Ariana Grande",
        "playcount": "103662311",
        "listeners": "1089358",
        "mbid": "f4fdbb4c-e4b7-47a0-b83b-d91bbfcfa387",
        "url": "https://www.last.fm/music/Ariana+Grande",
        "streamable": "0",
        "image": [
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/34s/32b841c78d0982a13d616b756a197d5c.png",
            "size": "small"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/64s/32b841c78d0982a13d616b756a197d5c.png",
            "size": "medium"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/174s/32b841c78d0982a13d616b756a197d5c.png",
            "size": "large"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/300x300/32b841c78d0982a13d616b756a197d5c.png",
            "size": "extralarge"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/300x300/32b841c78d0982a13d616b756a197d5c.png",
            "size": "mega"
          }
        ]
      },
      {
        "name": "Queen",
        "playcount": "190713412",
        "listeners": "4015802",
        "mbid": "420ca290-76c5-41af-999e-564d7c71f1a7",
        "url": "https://www.last.fm/music/Queen",
        "streamable": "0",
        "image": [
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/34s/39be92dbb8013de8cd1dafc3430ff3d8.png",
            "size": "small"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/64s/39be92dbb8013de8cd1dafc3430ff3d8.png",
            "size": "medium"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/174s/39be92dbb8013de8cd1dafc3430ff3d8.png",
            "size": "large"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/300x300/39be92dbb8013de8cd1dafc3430ff3d8.png",
            "size": "extralarge"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/300x300/39be92dbb8013de8cd1dafc3430ff3d8.png",
            "size": "mega"
          }
        ]
      },
      {
        "name": "Lady Gaga",
        "playcount": "284529030",
        "listeners": "3813553",
        "mbid": "650e7db6-b795-4eb5-a702-5ea2fc46c848",
        "url": "https://www.last.fm/music/Lady+Gaga",
        "streamable": "0",
        "image": [
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/34s/91b8e5009f78f05dfd18cfda78f9c2de.png",
            "size": "small"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/64s/91b8e5009f78f05dfd18cfda78f9c2de.png",
            "size": "medium"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/174s/91b8e5009f78f05dfd18cfda78f9c2de.png",
            "size": "large"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/300x300/91b8e5009f78f05dfd18cfda78f9c2de.png",
            "size": "extralarge"
          },
          {
            "#text": "https://lastfm-img2.akamaized.net/i/u/300x300/91b8e5009f78f05dfd18cfda78f9c2de.png",
            "size": "mega"
          }
        ]
      }......
    ],
    "@attr": {
      "page": "1",
      "perPage": "50",
      "totalPages": "56122",
      "total": "2806089"
    }
  }
}
*/
function loadChartTopArtistsJSONDoc()
{
  if (window.XMLHttpRequest) {
					// Mozilla, Safari, IE7+
					httpRequest = new XMLHttpRequest();
					console.log("Creat l'objecte a partir de XMLHttpRequest.");
				}
				else if (window.ActiveXObject) {
					// IE 6 i anteriors
					httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
					console.log("Creat l'objecte a partir de ActiveXObject.");
				}
				else {
					console.error("Error: Aquest navegador no suporta AJAX.");
				}

			//	httpRequest.onload = processarResposta;
				httpRequest.onprogress = mostrarProgres;
        var urlquery ="http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=d30c30f2e4eddeb7eac9ca3f90272243&format=json";
        httpRequest.onreadystatechange = processarCanviEstat;



        httpRequest.open('GET', urlquery, true);
				httpRequest.overrideMimeType('text/plain');
				httpRequest.send(null);

        function processarCanviEstat() {
          if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            console.log("Exit transmissio.");
            processarResposta(httpRequest.responseText);
          }
        }
				function processarResposta(dades) {
				  var	myObj = JSON.parse(dades);
          var llista = document.createElement('ul');
          var txt,x="";
          txt +="<h4> Top cançons <small>Lastfm</small></h4>";
          txt += "<table border='1'>";
          txt += "<tr><th>Nom</th><th>URL</th><th>Imatge</th></tr>";
          console.log("Cantidad de artistas:" + myObj.artists.artist.length);
          for (var i=0; i< 10;i++) {
              txt += "<tr><td>" + myObj.artists.artist[i].name + "</td><td>"+ myObj.artists.artist[i].url + "</td><td><img src="+ myObj.artists.artist[i].image[2]["#text"] +"/></td></tr>";
              }
/*
          for (x in myObj) {
              txt += "<tr><td>" + myObj[x].artists.artist.name + "</td></tr>";
            }*/
          txt += "</table>";
          document.getElementById("artist").innerHTML = txt;
        }

}

function loadSearchTrackJSONDoc()
{
  if (window.XMLHttpRequest) {
					// Mozilla, Safari, IE7+
					httpRequest = new XMLHttpRequest();
					console.log("Creat l'objecte a partir de XMLHttpRequest.");
				}
				else if (window.ActiveXObject) {
					// IE 6 i anteriors
					httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
					console.log("Creat l'objecte a partir de ActiveXObject.");
				}
				else {
					console.error("Error: Aquest navegador no suporta AJAX.");
				}

			//	httpRequest.onload = processarResposta;
				httpRequest.onprogress = mostrarProgres;
        var urlquery ="http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=d30c30f2e4eddeb7eac9ca3f90272243&artist=cher&track=believe&format=json";
        httpRequest.onreadystatechange = processarCanviEstat;



        httpRequest.open('GET', urlquery, true);
				httpRequest.overrideMimeType('text/plain');
				httpRequest.send(null);

        function processarCanviEstat() {
          if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            console.log("Exit transmissio.");
            processarResposta(httpRequest.responseText);
          }
        }
				function processarResposta(dades) {
				  var	myObj = JSON.parse(dades);
          var llista = document.createElement('ul');
          var txt,x="";
          txt +="<h4> Top tags <small>Lastfm</small></h4>";
          txt += "<table border='1'>";
          txt += "<tr><th>Nom</th><th>URL</th><th>Imatge</th></tr>";
          console.log("Cantidad de artistas:" + myObj.artists.artist.length);
          for (var i=0; i< 10;i++) {
              txt += "<tr><td>" + myObj.artists.artist[i].name + "</td><td>"+ myObj.artists.artist[i].url + "</td><td><img src="+ myObj.artists.artist[i].image[2]["#text"] +"/></td></tr>";
              }
/*
          for (x in myObj) {
              txt += "<tr><td>" + myObj[x].artists.artist.name + "</td></tr>";
            }*/
          txt += "</table>";
          document.getElementById("artist").innerHTML = txt;
        }

}


	function mostrarProgres(event) {
		  if (event.lengthComputable) {
		    var progres = 100 * event.loaded / event.total;
		    console.log("Completat: " + progres + "%");
		  } else {
		    console.log("No es pot calcular el progrés");
		  }
}

function loadSearchArtistJSONDoc() {
  var stringquery="eminem";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      processarResposta1(this.responseText);
    }
  };
  //Has to change sanz to whatever, and limit opcional, also the page to get ( dont necessary)...
  var url =  "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=eminem&api_key=d30c30f2e4eddeb7eac9ca3f90272243&limit=10&format=json";
  xhttp.open("GET", url, true);
  xhttp.overrideMimeType('text/plain');
  xhttp.send();
}

function processarResposta1(dades) {
  var	myObj = JSON.parse(dades);
  var llista = document.createElement('ul');
  var txt,x="";
  txt +="<h4> Buscar resultat artistes: <small>" + myObj.results["@attr"].for + "</small></h4>"; // Com no pot ser fico myObj.results.@attr.for
  txt += "<table border='1'>";
  txt += "<tr><th>Nom</th><th>URL</th><th>Imatge</th></tr>";
  console.log("Cantidad de artistas:" + myObj.results.artistmatches.artist.length);
  for (var i=0; i< 5;i++) {
      txt += "<tr><td>" + myObj.results.artistmatches.artist[i].name + "</td><td>"+ myObj.results.artistmatches.artist[i].url + "</td><td><img src="+ myObj.results.artistmatches.artist[i].image[2]["#text"] +"/></td></tr>";
      }
/*
  for (x in myObj) {
      txt += "<tr><td>" + myObj[x].artists.artist.name + "</td></tr>";
    }*/
  txt += "</table>";
  document.getElementById("artist").innerHTML = txt;
}




function loadSearchAlbumJSONDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      processarResposta(this.responseText);
    }
  };
  //Has to change sanz to whatever, and limit opcional, also the page to get ( dont necessary)...
  var url =  "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=d30c30f2e4eddeb7eac9ca3f90272243&artist=Cher&album=Believe&format=json";
  xhttp.open("GET", url, true);
  xhttp.overrideMimeType('text/plain');
  xhttp.send();
}

function processarResposta(dades) {
  var	myObj = JSON.parse(dades);
  var llista = document.createElement('ul');
  var txt,x=""; // Com no pot ser fico myObj.results.@attr.for
  txt +="<h4> Artista de l'album:<h5>" + myObj.album.artist + "&nbsp;<img src="+ myObj.album.image[0]["#text"] +"/></h5></h4>";
  txt += "<table border='1'>";
  txt += "<tr><th>Nom cançó</th><th>Url</th><th>Artista</th></tr>";
  for (var i=0; i< 5;i++) {
    txt += "<tr><td>" + myObj.album.tracks.track[i].name + "</td><td>" + myObj.album.tracks.track[i].url + "</td><td>"+ myObj.album.tracks.track[i].duration +"</td></tr>";

    }
      /*
  for (x in myObj) {
      txt += "<tr><td>" + myObj[x].artists.artist.name + "</td></tr>";
    }*/
  txt += "</table>";
  document.getElementById("artist").innerHTML = txt;
}


function myFunction(xml) {
  var i;
  var xmlDoc = xml.responseXML;
  var table="<tr><th>Data</th><th>Value</th><th>Altre</th></tr>";
  var x = xmlDoc.getElementsByTagName("user");
  for (i = 0; i <x.length; i++) {
    table += "<tr><td>" +
    x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue +
    "</td><td>" +
    x[i].getElementsByTagName("playcount")[0].childNodes[0].nodeValue +
    "</td><td><img src="+
    x[i].getElementsByTagName("image")[2].childNodes[0].nodeValue +
   "></img></td></tr>";
   console.log(x[i]);
  }
  document.getElementById("demo2").innerHTML = table;
}

/*
The only illegal characters are &, < and > (as well as " or ' in attributes).
They're escaped using XML entities, in this case you want &amp; for &.
Metode: https://www.last.fm/api/show/track.addTags
Objective:  Tag an album using a list of user supplied tags.
Params
artist (Required) : The artist name
track (Required) : The track name
tags (Required) : A comma delimited list of user supplied tags to apply to this track. Accepts a maximum of 10 tags.
api_key (Required) : A Last.fm API key.
api_sig (Required) : A Last.fm method signature. See authentication for more information.
sk (Required) : A session key generated by authenticating a user via the authentication protocol.
Auth
This service requires authentication. Please see our authentication how-to.
This is a write service and must be accessed with an HTTP POST request.
All parameters should be sent in the POST body, including the 'method' parameter. See rest requests for more information.
Sample Response
<lfm status="ok">
</lfm>
Error in json:
{
  "error": 10,
  "message": "Invalid API key - You must be granted a valid key by last.fm"
}
Error in xml
<lfm status="failed">
    <error code="10">Invalid API key - You must be granted a valid key by last.fm</error>
</lfm>
*/

function processarRespostaAddTagXmlHttpRequest(xml) {
  var i;
  var xmlDoc = xml.responseXML;
  var x = xmlDoc.getElementsByTagName("lfm");
  txt = x.getAttribute("status");
  if( txt == "ok")
  {
    document.getElementById("demo2").innerHTML = "<h2>Added Tag Correct</h2>";
  }
  else document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
}

function processarRespostaAddTagJquery(xml) {

  txt = $(xml).find('lfm').attr('status');
  if( txt == "ok")
  {
    document.getElementById("demo2").innerHTML = "<h2>Added Tag Correct</h2>";
  }
  else document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
}

function calculate_apisig(params){

  //Crec que només necessitem apikey, token i secret i no necessitem params, els podem treure de sessionStorage
  //Calcula l'apiSig a partir dels valors d'abans...
    ss = "";
    st = [];
    so = {};
    so['api_key'] = params['api_key'];
    so['token'] = params['token'];
    Object.keys(params).forEach(function(key){
        st.push(key); // Get list of object keys
    });
    st.sort(); // Alphabetise it
    st.forEach(function(std){
        ss = ss + std + params[std]; // build string
    });
    ss += myshared_secret;
        // console.log(ss + last_fm_data['secret']);
        //Segons documentacio : https://www.last.fm/api/webauth
        //api signature = md5("api_keyxxxxxxxxmethodauth.getSessiontokenxxxxxxxmysecret")
        //OBJECTIU NOSTRE SERA ACONSEGUIR UNA LINEA COM AQUESTA
        // api_keyAPIKEY1323454formatjsonmethodauth.getSessiontokenTOKEN876234876SECRET348264386
    //hashed_sec = $.md5(unescape(encodeURIComponent(ss)));
    var hashed_sec = md5(unescape(encodeURIComponent(ss))); // "2063c1608d6e0baf80249c42e2be5804"
    console.log("La apiSig es: " + hashed_sec);
    so['api_sig'] = hashed_sec; // Correct when calculated elsewhere.
    return so; // Returns signed POSTable object
}


function addTrackTagJquery()
{
  if (sessionStorage.getItem("mySessionKey") == null)
  {
    console.log("Error no estas authenticat");
  }
  else {
    //Estas loguejat i autenticat de forma correcta--
          var tag1="Relax";
          var tag2="Intense";
        //O be aixi i despres utilitzem una funcio per convertir-lo en string ( convertirenParametresDades del ioc)
        var dades = {
          method: "track.addTags",
          artist : "Muse",
          track : "Take a Bow",
          //A comma delimited list of user supplied tags to apply to this track. Accepts a maximum of 10 tags.
        //  tags : [tag1,tag2],
        //Tags as other parameters should be utf8-encoded two or more parameters seems doesnt work
          tags : "criminal4",
          api_key : myAPI_key,
          token : captured,
          sk : sessionStorage.getItem("mySessionKey")
          };

        var last_url="http://ws.audioscrobbler.com/2.0/";

        var myapisigtag = calculate_apisig(dades);
        console.log("La apiSig de Add TAg es: " + myapisigtag['api_sig']);
        //Hauria de poder esborrar token perque no ho necessita en teoria pero si no no funciona
        //delete dades["token"];
        dades['api_sig']= myapisigtag['api_sig'];

            $.ajax({
              type: "POST", //both are same, in new version of jQuery type renamed to method
              url: last_url,
              data: dades,
              dataType: "xml", //datatype especifica el tipus de dada que s'espera rebre del servidor
              success: function(res){
                  processarRespostaAddTagJquery(res);
              },
              error : function(){
                  console.log("Error en addTag to track" + dades.track + "de l'artista" + dades.artist);
                  document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
              }
             });


    }
}

function addTrackTagXMLHttpRequest()
{
  if (sessionStorage.getItem("mySessionKey") == null)
  {
    console.log("Error no estas authenticat");
  }
  else {
    //Estas loguejat i autenticat de forma correcta--
          var tag1="Relax";
          var tag2="Intense";
        //O be aixi i despres utilitzem una funcio per convertir-lo en string ( convertirenParametresDades del ioc)
        var dades = {
          method: "track.addTags",
          artist : "Muse",
          track : "Take a Bow",
          //A comma delimited list of user supplied tags to apply to this track. Accepts a maximum of 10 tags.
        //  tags : [tag1,tag2],
        //Tags as other parameters should be utf8-encoded two or more parameters seems doesnt work
          tags : "criminal4",
          api_key : myAPI_key,
          token : captured,
          sk : sessionStorage.getItem("mySessionKey")
          };

        var last_url="http://ws.audioscrobbler.com/2.0/";

        var myapisigtag = calculate_apisig(dades);
        console.log("La apiSig de Add TAg es: " + myapisigtag['api_sig']);
        //delete dades["token"];
        dades['api_sig']= myapisigtag['api_sig'];

        var xhr = new XMLHttpRequest();

        xhr.open("POST", last_url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
              processarRespostaAddTagXmlHttpRequest(xhr);
            }
        }
        var data = JSON.stringify(dades);
        xhr.send(data);

    }
}

    /*
    The only illegal characters are &, < and > (as well as " or ' in attributes).
    They're escaped using XML entities, in this case you want &amp; for &.
    Metode: https://www.last.fm/api/show/track.love
    Objective:  Love a track for a user profile.
    Params
    track (Required) : A track name (utf8 encoded)
    artist (Required) : An artist name (utf8 encoded)
    api_key (Required) : A Last.fm API key.
    api_sig (Required) : A Last.fm method signature. See authentication for more information.
    sk (Required) : A session key generated by authenticating a user via the authentication protocol.
    Auth
    This service requires authentication. Please see our authentication how-to.
    This is a write service and must be accessed with an HTTP POST request.
    All parameters should be sent in the POST body, including the 'method' parameter. See rest requests for more information.
    Sample Response
    <lfm status="ok">
    </lfm>
    Error in json:
    {
      "error": 10,
      "message": "Invalid API key - You must be granted a valid key by last.fm"
    }
    Error in xml
    <lfm status="failed">
        <error code="10">Invalid API key - You must be granted a valid key by last.fm</error>
    </lfm>
    */

    function trackLoveXMlHttpRequestSendQuery()
    {
      if (sessionStorage.getItem("mySessionKey") == null)
      {
        console.log("Error no estas authenticat");
      }
      else {
        //Estas loguejat i autenticat de forma correcta--
          //O be aixi i despres utilitzem una funcio per convertir-lo en string ( convertirenParametresDades del ioc)



            var dadestl = {
              method: 'track.Love',
              artist : Utf8.encode('Muse'),
              track : Utf8.encode('Take a Bow'),
              api_key : myAPI_key,
              token : captured,
              sk : sessionStorage.getItem("mySessionKey")
              };

            var last_url="http://ws.audioscrobbler.com/2.0/";
            var myapisiglove = calculate_apisig(dadestl);
            console.log("La apiSig de Track love es: " + myapisiglove['api_sig']);
            //delete dadestl["token"];
            dadestl['api_sig']= myapisiglove['api_sig'];
           var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                  processarRespostaLoveTrackXmlHtttpRequestSend(xhr);
                  //processarRespostaLoveTrack(this); //seria equivalent, faltaria gestionar errors
                }
            }

            var urlquery ="http://ws.audioscrobbler.com/2.0/?method=track.Love"
                          + "&artist=" + dadestl.artist
                          + "&track=" + dadestl.track
                          + "&api_key=" + dadestl.api_key
                          + "&token=" + dadestl.token
                          + "&sk=" + dadestl.sk
                          + "&api_sig=" + dadestl.api_sig;
            xhr.open('POST', urlquery, true);
    				xhr.overrideMimeType('text/xml'); // Crec que sense aquesta linea funcionaria igual
            //xhr.responseType = 'document';
    				xhr.send(null);


                 function processarRespostaLoveTrackXmlHtttpRequestSend(xml) {

                   var xmlDoc = xml.responseXML.documentElement; //Element root of the xml document
                  // var x = xmlDoc.getElementsByTagName("lfm"); //If there were some childs ( ex; books in a bookstore)
                   var txt = xmlDoc.getAttribute("status");
                   if( txt == "ok")
                   {
                     document.getElementById("demo2").innerHTML = "<h2>Added Love Correct to track</h2>";
                   }
                   else document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
                 }
            }
        }

        function trackLoveXMlHttpRequest()
        {
          if (sessionStorage.getItem("mySessionKey") == null)
          {
            console.log("Error no estas authenticat");
          }
          else {
            //Estas loguejat i autenticat de forma correcta--
              //O be aixi i despres utilitzem una funcio per convertir-lo en string ( convertirenParametresDades del ioc)



                var dadestl = {
                  method: 'track.Love',
                  artist : Utf8.encode('Muse'),
                  track : Utf8.encode('Take a Bow'),
                  api_key : myAPI_key,
                  token : captured,
                  sk : sessionStorage.getItem("mySessionKey")
                  };

                var last_url="http://ws.audioscrobbler.com/2.0/";
               var xhr = new XMLHttpRequest();

                xhr.open('POST', last_url, true);
                xhr.setRequestHeader('Content-type', 'application/json');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                      processarRespostaLoveTrackXmlHtttpRequest(xhr);
                      //processarRespostaLoveTrack(this); //seria equivalent, faltaria gestionar errors
                    }
                }

                var myapisiglove = calculate_apisig(dadestl);
                console.log("La apiSig de Track love es: " + myapisiglove['api_sig']);
                //delete dadestl["token"];
                dadestl['api_sig']= myapisiglove['api_sig'];
                var data = JSON.stringify(dadestl);

                xhr.send(data);

                     function processarRespostaLoveTrackXmlHtttpRequest(xml) {
                       var i;
                       var xmlDoc = xml.responseXML;
                       x = xmlDoc.getElementsByTagName("lfm");
                       txt = x.getAttribute("status");
                       if( txt == "ok")
                       {
                         document.getElementById("demo2").innerHTML = "<h2>Added Love Correct to track</h2>";
                       }
                       else document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
                     }
                }
            }

        function trackLoveJquery()
        {
          if (sessionStorage.getItem("mySessionKey") == null)
          {
            console.log("Error no estas authenticat");
          }
          else {
            //Estas loguejat i autenticat de forma correcta--
              //O be aixi i despres utilitzem una funcio per convertir-lo en string ( convertirenParametresDades del ioc)
              var last_url="http://ws.audioscrobbler.com/2.0/";

                var dadestl = {
                  method: 'track.Love',
                  artist : Utf8.encode('Muse'),
                  track : Utf8.encode('Take a Bow'),
                  api_key : myAPI_key,
                  token : captured,
                  sk : sessionStorage.getItem("mySessionKey")
                  };

                var myapisiglove = calculate_apisig(dadestl);
                console.log("La apiSig de Track love es: " + myapisiglove['api_sig']);
                //delete dadestl["token"];
                dadestl['api_sig']= myapisiglove['api_sig'];

                    $.ajax({
                      type: "POST", //both are same, in new version of jQuery type renamed to method
                      url: last_url,
                      data: dadestl,
                      dataType: "xml", //datatype especifica el tipus de dada que s'espera rebre del servidor
                      success: function(res){
                          processarRespostaLoveTrackJquery(res);
                      },
                      error : function(xhr, ajaxOptions, thrownError){
                          console.log("Error en Love Track to track" + dades.track + "de l'artista" + dades.artist);
                          document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
                      }
                     });

                     function processarRespostaLoveTrackJquery(xml) {
                       txt = $(xml).find('lfm').attr('status');
                       if( txt == "ok")
                       {
                         document.getElementById("demo2").innerHTML = "<h2>Added Track Love Correct</h2>";
                       }
                       else document.getElementById("demo2").innerHTML = "<h2>Failure Track Love</h2>";
                }
            }
}
/*
Trying to find user default.it doesnt work
*/
function loadDefaultUserInfoXMLDoc() {
  var stringquery="sanz";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      myFunction(this);
    }
  };
  xhttp.open("GET", "http://ws.audioscrobbler.com/2.0/?method=user.getinfo&api_key=d30c30f2e4eddeb7eac9ca3f90272243", true);
  xhttp.send();
}

function myFunction(xml) {
  var i;
  var xmlDoc = xml.responseXML;
  var table="<tr><th>Data</th><th>Value</th><th>Altre</th></tr>";
  var x = xmlDoc.getElementsByTagName("user");
  for (i = 0; i <x.length; i++) {
    table += "<tr><td>" +
    x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue +
    "</td><td>" +
    x[i].getElementsByTagName("playcount")[0].childNodes[0].nodeValue +
    "</td><td><img src="+
    x[i].getElementsByTagName("image")[2].childNodes[0].nodeValue +
   "></img></td></tr>";
   console.log(x[i]);
  }
  document.getElementById("demo2").innerHTML = table;
}
