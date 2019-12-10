$(document).ready(function() {
  var url = "http://localhost:8080/request/";

  const request = param => {
    console.log("requesting");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var res = JSON.parse(xhttp.responseText);
        console.log(res);
      }
    };
    xhttp.open("GET", `${url}${param}`, true);
    xhttp.setRequestHeader("Access-Control-Allow-Headers", "*");
    xhttp.send();
  };
});
