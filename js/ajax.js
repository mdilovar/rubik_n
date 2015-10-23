"use strict";
function Ajax(url,data,callback){
    this.aj = new XMLHttpRequest();
    this.aj.callback = callback;
    this.data = data;
    this.url=url;
    this.post = function post(){
        var aj = this.aj;
        aj.onreadystatechange = function (){
            if (aj.readyState == 4 && aj.status == 200){
                    aj.callback(aj.response);
                }
        };
        var body = [];
        for (var k in this.data) {
            body.push(encodeURIComponent(k) + '=' + encodeURIComponent(this.data[k]));
        }
        body = body.join('&');
        this.aj.open("POST", this.url, true);
        this.aj.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        this.aj.send(body);
    };
    this.get = function post(){
        var aj = this.aj;
        aj.onreadystatechange = function(){
            if (aj.readyState == 4 && aj.status == 200){
                    aj.callback(aj.response);
                }
        };
        var query = [];
        for (var k in this.data) {
            query.push(encodeURIComponent(k) + '=' + encodeURIComponent(this.data[k]));
        }
        query = '?' + query.join('&');
        this.aj.open("GET", this.url + query, true);
        this.aj.send();
    };
}