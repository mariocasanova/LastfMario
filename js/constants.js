
		var myapplication_name="Lastfmario";
		var myAPI_key="d30c30f2e4eddeb7eac9ca3f90272243";
		var myshared_secret="02a7d0b8401ee3cc436bf49f70ca2147";

function myLoginFunction(){
			/*
			params api_key ( my api key)
			cb the web that goes when user is authenticated relative path ( depends on the server is launched): http://localhost:3000/mainpage.ht*/
			var url= 'http://www.last.fm/api/auth/?api_key=d30c30f2e4eddeb7eac9ca3f90272243&cb=http://localhost:3000/mainpage.html';
			window.location.replace(url);+
		  document.onload();
}
