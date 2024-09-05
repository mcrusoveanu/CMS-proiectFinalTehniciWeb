const express = require("express");
const fs = require('fs');
const path = require('path');

// 2 prop obErori si imagini
obGlobal={
    obErori:null,
    imagini:null
}

app = express();
// setez view engine = ejs
// ejs = extensie a unui fisier care iti da flexibilitatea de a include fragmente in pagini sau js direct in html
app.set("view engine","ejs");

// folder de resurse static
app.use("/resurse", express.static(__dirname+"/resurse"));

// folderul proiectului __dirname - nu se schimba, este un macro/o constanta
// __filename - fisierul curent
// process.cwd - se poate modifica daca schimbam directorul
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

var foldere = ["temp", "temp1"];
creareFoldere(foldere);

// cerinta17
app.use(/^\/resurse(\/(\w)*)*$/, function(req,res){
    afisareEroare(res, 403);
});

// cerere de tip get catre server pentru url-ul localhost:8087/index si localhost:8087/ si localhost:8087/home, unde se va randa(res.render) pentru toate pagina index.ejs
app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index" , {ip: req.ip});
});


// cerinta 18
// sendFile This method is used to send a file as an HTTP response. 
app.get("/favicon.ico", function(req, res){
    res.sendFile(__dirname+"/resurse/ico/favicon.ico");
});


// cerinta 19
app.get("/*.ejs",function(req, res){
    console.log("url:", req.url);
    afisareEroare(res, 400);
});

app.get("/*",function(req, res){
    res.render("pagini"+req.url, function(err, rezRandare){// callback care are ca parametri o eroare si rezultatul randarii:
                                                           // daca se intra pe cazul de eroare se afiseaza eroarea corespunzatoare; altfel, se randeaza pagina
        if(err){
            if(err.message.startsWith("Failed to lookup view")){
                afisareEroare(res, 404);
            }
            else
                afisareEroare(res);//err generica
        }
        else{
            res.send(rezRandare);
        }
    });
});


function initErori(){
    var continut = fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori=JSON.parse(continut);
    // e unn string imens si il pasez
    let vErori=obGlobal.obErori.info_erori;
    for (let eroare of vErori) {
        eroare.imagine=obGlobal.obErori.cale_baza+"/"+eroare.imagine;
        // fiecare img va fi concatenarea dintre calea de baza si img err 
    }
}

initErori();

// identificator nr err , imi ia titlu din fisierul json la fel si la text si imagine
function afisareEroare(res, _identificator, _titlu="Eroare", _text, _imagine){
    let vErori=obGlobal.obErori.info_erori;
    // itereaza prin vectorul de erori cu find() si atunci cand un element din vErori are identificatorul = _identificator, il returneaza (returneaza elem)
    let eroare=vErori.find(function(elem) {return elem.identificator==_identificator;})
    if(eroare) {
        let titlu1 = _titlu=="Eroare" ? (eroare.titlu || _titlu) : _titlu;
        // daca _text != null -> text1 = _text, altfel o sa fie aleasa valoarea eroare.text
        let text1 = _text || eroare.text;
        let imagine1 = _imagine || eroare.imagine;
        if(eroare.status)
        // se seteaa statusul = identificatorul erorii si se randeaza pagina cu param: titlu1, text1, imagine1
        // This sets the HTTP status code of the response to the value of eroare.identificator
            res.status(eroare.identificator).render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
            // paseaza parametri
        else
            res.render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
    }
    else{
        let errDef=obGlobal.obErori.eroare_default;
        // titlu: errDef.titlu -> se seteaza locals.titlu = errDef.titlu si se foloseste valoarea in ejs (la client) - cand se randeaza pagina
        res.render("pagini/eroare", {titlu:errDef.titlu, text:errDef.text, imagine:obGlobal.obErori.cale_baza+"/"+errDef.imagine});
    }
}
// http://localhost:8087/eroare.ejs 400
// http://localhost:8087/cvea 404
// http://localhost:8087/resurse/css/ 403


//cerinta 20 create the full path for the current folder to be created
function creareFoldere(vector_foldere){
    for(let folder of vector_foldere){
        let curr_path = path.join(__dirname, folder);
        if(fs.existsSync(curr_path) === false) {
            fs.mkdir(curr_path, function(err){
                if(err){
                    console.log(err);
                    return;
                }
            });
        }
    }
}

// i am dat portul pe care sa asculte aplicatia
app.listen(8087);
console.log("Serverul a pornit");