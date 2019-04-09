var myAPI_key="d30c30f2e4eddeb7eac9ca3f90272243";
var myshared_secret="02a7d0b8401ee3cc436bf49f70ca2147";

var url = window.location.href; // or window.location.href for current url
var captured = /token=([^&]+)/.exec(url)[1]; // Value is in [1] ('384' in our case)
var result = captured ? captured : 'myDefaultValue';
console.log(captured);

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
  txt +="<h1> Resultat per album</h1>";
  txt += "<table border='1'>";
  txt += "<tr><th>Nom</th><th>Artista</th></tr>";
  //for (var i=0; i< 10;i++) {
    txt += "<tr><td>" + myObj.album.name + "</td><td>"+ myObj.album.artist + "</td></tr>";
      //}
      /*
  for (x in myObj) {
      txt += "<tr><td>" + myObj[x].artists.artist.name + "</td></tr>";
    }*/
  txt += "</table>";
  document.getElementById("artist").innerHTML = txt;
}



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
        .*/
            console.log("Post data: Last token " + post_data.token + "\nApiKey: "+ post_data.api_key + "\nApiSig: " + post_data.api_sig);
            sessionStorage.setItem("myApiSig",post_data.api_sig );

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

                 $('#success #token').html(res.session.post_data.token);
                 $('#success #apisig').html(res.session.post_data.api_sig);
                 $('#success #apikey').html(res.session.post_data.key);

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


function loadUserInfoXMLDoc() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          processarResposta(this);
        }
      };
      xhttp.open("GET", "http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=supermariano1&api_key=d30c30f2e4eddeb7eac9ca3f90272243", true);
      xhttp.send();
    }
    function processarResposta(xml) {
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
      processarResposta(this.responseText);
    }
  };
  //Has to change sanz to whatever, and limit opcional, also the page to get ( dont necessary)...
  var url =  "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=eminem&api_key=d30c30f2e4eddeb7eac9ca3f90272243&limit=10&format=json";
  xhttp.open("GET", url, true);
  xhttp.overrideMimeType('text/plain');
  xhttp.send();
}

function processarResposta(dades) {
  var	myObj = JSON.parse(dades);
  var llista = document.createElement('ul');
  var txt,x="";
  txt +="<h1> Search result for artist:" + myObj.results["@attr"].for; // Com no pot ser fico myObj.results.@attr.for
  txt +="<h1> Search result for artist</h1>";
  txt += "<table>";
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

function addTrackTag()
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
          tags : [tag1, tag2],
          api_key : myAPI_key,
          api_sig : sessionStorage.getItem("myApiSig"),
          sk : sessionStorage.getItem("mySessionKey"),
          format:"json"
          };
        /*
        httpRequest.open("POST", url,true);
        httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var params=concertirEnParametres(dades);
        httpRequest.send(params);
        */
        var last_url="http://ws.audioscrobbler.com/2.0/";
        var xhr = new XMLHttpRequest();

        xhr.open("POST", last_url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
              processarRespostaAddTag(xhr);
            }
        }
        var data = JSON.stringify(dades);
        xhr.send(data);
        /*
            $.ajax({
              type: "POST", //both are same, in new version of jQuery type renamed to method
              url: last_url,
              data: JSON.stringify(dades),
              dataType: 'xml', //datatype especifica el tipus de dada que s'espera rebre del servidor
              success: function(res){
                  processarRespostaAddTag(res);
              },
              error : function(){
                  console.log("Error en addTag to track" + dades.track + "de l'artista" + dades.artist);
                  document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
              }
             });
*/
             function processarRespostaAddTag(xml) {
               var i;
               var xmlDoc = xml.responseXML;
               x = xmlDoc.getElementsByTagName('lfm');
               txt = x.getAttribute("status");
               if( txt == "ok")
               {
                 document.getElementById("demo2").innerHTML = "<h2>Added Tag Correct</h2>";
               }
               else document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
             }
        }
    }

    function trackLove()
    {
      if (sessionStorage.getItem("mySessionKey") == null)
      {
        console.log("Error no estas authenticat");
      }
      else {
        //Estas loguejat i autenticat de forma correcta--
          //O be aixi i despres utilitzem una funcio per convertir-lo en string ( convertirenParametresDades del ioc)
            var dades = {
              method: "track.love",
              artist : "Muse",
              track : "Take a Bow",
              api_key : myAPI_key,
              api_sig : sessionStorage.getItem("myApiSig"),
              sk : sessionStorage.getItem("mySessionKey"),
              format:"json"
              };
            /*
            httpRequest.open("POST", url,true);
            httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            var params=concertirEnParametres(dades);
            httpRequest.send(params);
            */
            var last_url="http://ws.audioscrobbler.com/2.0/";
            var xhr = new XMLHttpRequest();

            xhr.open("POST", last_url, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                  processarRespostaLoveTrack(xhr);
                  //processarRespostaLoveTrack(this); //seria equivalent, faltaria gestionar errors
                }
            }
            var data = JSON.stringify(dades);
            xhr.send(data);
            /*
                $.ajax({
                  type: "POST", //both are same, in new version of jQuery type renamed to method
                  url: last_url,
                  data: JSON.stringify(dades),
                  dataType: 'xml', //datatype especifica el tipus de dada que s'espera rebre del servidor
                  success: function(res){
                      processarRespostaAddTag(res);
                  },
                  error : function(){
                      console.log("Error en addTag to track" + dades.track + "de l'artista" + dades.artist);
                      document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
                  }
                 });
    */
                 function processarRespostaLoveTrack(xml) {
                   var i;
                   var xmlDoc = xml.responseXML;
                   x = xmlDoc.getElementsByTagName('lfm');
                   txt = x.getAttribute("status");
                   if( txt == "ok")
                   {
                     document.getElementById("demo2").innerHTML = "<h2>Added Tag Correct</h2>";
                   }
                   else document.getElementById("demo2").innerHTML = "<h2>Failure</h2>";
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
  document.getElementById("demo2").innerHTML = table;
}
