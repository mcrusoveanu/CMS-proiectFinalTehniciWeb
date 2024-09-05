function setCookie(nume, val, timpExpirare){
    d=new Date();
    d.setTime(d.getTime()+timpExpirare);
    pathCookie = '/';
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}; path=${pathCookie};`;
    // ${d.toUTCString()} converts the Date object d to a UTC string format, which is required for the expires attribute of the cookie.
    // ${pathCookie} will be replaced with the value of the variable pathCookie (which represents the path where the cookie is accessible).
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";");
    // in memmorie aceste cookiuri sunt salvate cu ; au la final ; linia5 
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            // val de dupa egal 
            return param.split("=")[1];
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`);
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
    // document.cookie is used to set the cookie value to 0 and the expiration date to the current date and time.
    //By setting the expiration date to the current date and time, the cookie immediately expires and is effectively deleted from the browser. 
}

function deleteAllCookies(){
    var cookies=document.cookie.split(";");
    // The document.cookie property returns a string containing all cookies for the current document, separated by semicolons (;).
    for(let cookie of cookies){
        var cookieName = cookie.split("=")[0];
        // cookie.split("=") splits the cookie string into an array using = as the delimiter.
        // For example, if cookie is "username=JohnDoe", then cookie.split("=") results in the array ["username", "JohnDoe"].
        // [0] accesses the first element of this array, which is the cookie name.
        document.cookie=`${cookieName}=0; expires=${(new Date()).toUTCString()}`;
    }
}

function setProductCookie(){
    if((window.location.href).includes("/produs/")){
        // verifica daca sunt pe pagina produs
        var produsCurent = window.location.href;
        // daca sunt pe pagina produs atribuie href la produsCurent
        var idProdus = produsCurent.split("/produs/")[1]; 
        // face split iar id este dupa /
        var valoare = idProdus+"-"+document.getElementsByClassName("prod-nume")[0].innerHTML;
        // setam val produsului id+nume
        var nume = "prod_accesat";
        setCookie(nume, valoare, 6000);
        // 6000 exp aprox 1 min
    }
}

window.addEventListener("DOMContentLoaded", function(){
    document.getElementById("banner").style.display = "none";
    if (!getCookie("acceptat_banner")) {
        // daca nu am apasat pe ok
        //  nu am cum sa am access la prod_accesat daca nu am apasat pe acceptat_banner -> deleteCookie("prod_accesat")
        if(getCookie("prod_accesat")){
            // dac e cookie-ul de produs accesat setat 
            deleteCookie("prod_accesat");
            // sterge cookie-ul
        }
        document.getElementById("banner").style.display = "block";
        // afiseaza dinnou banner-ul 
    }
    else{
        setProductCookie();
    }

    if(getCookie("prod_accesat")){
        var a = document.getElementById("ultimul-produs");
        // index.ejs
        if(a){
            var valoare = getCookie("prod_accesat").split("-");
            var idProdus = valoare[0];
            var nume = valoare[1];
            a.href = "/produs/"+idProdus;
            // ce text sa apara si unde sa ma duca
            a.innerHTML = nume;
        }
    }
    else if(!getCookie("prod_accesat")){
        if(document.getElementById("p-ult-prod")){
            document.getElementById("p-ult-prod").style.display="none";
            // dau display none la paragraful de ultimul produs
            // case where the prod_accesat cookie does not exist. 
        }
    }

    document.getElementById("ok_cookies").onclick=function(){
        // setCookie("acceptat_banner", true, 43200000); //--jumatate de zi
        // header.ejs
        setCookie("acceptat_banner", true, 6000);
        setProductCookie();
        document.getElementById("banner").style.display = "none";
    }
})