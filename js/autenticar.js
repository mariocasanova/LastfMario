var data = {
    'token':sessionStorage.getItem('token'),
    'api_key': myAPI_key
};

function last_fm_calculate_apisig(params){

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
  return md5(unescape(encodeURIComponent(ss)));
}

function processarRespostaUserInfo(xml) {
  var table="<tr><th>Nom d'usuari</th><th>Country</th><th>Url</th><th>Edat</th></tr>";
    table += "<tr><td>" +
    xml.getElementsByTagName("name")[0].innerHTML +
    "</td><td>"
    xml.getElementsByTagName("country")[0].innerHTML +
    "</td><td>"
    xml.getElementsByTagName("url")[0].innerHTML +
    "</td><td>"
    xml.getElementsByTagName("age")[0].innerHTML +
    "</td></tr>";

  document.getElementById("dadesUsuari").innerHTML = table;
}

function getUserinfo(){
  var last_url="http://ws.audioscrobbler.com/2.0/?";
  $.ajax({
    type: "GET",
    url: last_url,
    data : 'method=user.getinfo'+
            '&user='+sessionStorage.getItem('mySessionUser')+
            '&api_key='+myAPI_key,

    //data: post_data,
    dataType: 'xml',
    //"success" gets called when the returned code is a "200" (successfull request). "error" gets called whenever another code is returned (e.g. 404, 500).
    success: function(res){
        processarRespostaUserInfo(res);
      },
    error : function(xhr, status, error){
          var errorMessage = xhr.status + ': ' + xhr.statusText
          console.log('Error - ' + errorMessage);
    }
   });
}

function calcularApiStack(){

            data['method']='auth.getSession';
            data['api_sig']=last_fm_calculate_apisig(data);
            sessionStorage.setItem('API_SIG', data['api_sig']);
            console.log("Post data: Token " + sessionStorage.getItem('token') + "ApiKey: "+ myAPI_key + "ApiSig: " + data['api_sig']);

            var last_url="http://ws.audioscrobbler.com/2.0/?";
            $.ajax({
              type: "GET",
              url: last_url,
              data : 'method=auth.getSession'+
                      '&api_key='+myAPI_key+
                     '&token='+sessionStorage.getItem('token')+
                     '&api_sig='+data['api_sig'],
              //data: post_data,
              dataType: 'xml',
              //"success" gets called when the returned code is a "200" (successfull request). "error" gets called whenever another code is returned (e.g. 404, 500).
              success: function(res){
                  console.log("Resposta: Name " + res.getElementsByTagName("name")[0].innerHTML);// Should return session key.
                  console.log("Resposta: Key " + res.getElementsByTagName("key")[0].innerHTML);
                  //store session key for further authenticate operations...
                  sessionStorage.setItem("mySessionUser", res.getElementsByTagName("name")[0].innerHTML);
                  sessionStorage.setItem("sk", res.getElementsByTagName("key")[0].innerHTML);
              },
              error : function(xhr, status, error){
                    var errorMessage = xhr.status + ': ' + xhr.statusText
                    console.log('Error - ' + errorMessage);
              }
             });
             getUserinfo();

}
