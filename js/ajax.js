function Ajax(url,data,callback){
    this.aj;
    this.callback;
    this.data;
    this.url;
    this.initAjax = function initAjax(url,data,callback){
        this.aj = new XMLHttpRequest();
        this.callback = callback;
        this.data = data;
        this.url=url;
    }(url,data,callback);
    this.post = function post(){
        this.aj.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        this.aj.onreadystatechange = function(){
        if (this.aj.readyState == 4 && this.aj.status == 200){
                this.callback(this.aj.responseText);
            }
        };
        var body = [];
        for (var k in this.data) {
            body.push(encodeURIComponent(k) + '=' + encodeURIComponent(this.data[k]));
        }
        body = body.join('&');
        this.aj.open("POST", this.url, true);
        this.aj.send(body);
    };
    this.get = function post(){
        this.aj.onreadystatechange = function(){
        if (this.aj.readyState == 4 && this.aj.status == 200){
                this.callback(this.aj.responseText);
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