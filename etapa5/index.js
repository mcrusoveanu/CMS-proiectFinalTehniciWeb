const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');

obGlobal={
    obErori:null,
    imagini:null,
    folderScss:path.join(__dirname,"resurse/sass"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup:path.join(__dirname,"backup")
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

//create the full path for the current folder to be created
vect_foldere=["temp", "temp1", "backup"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app.use(/^\/resurse(\/(\w)*)*$/, function(req,res){
    afisareEroare(res, 403);
});

// cerere de tip get catre server pentru url-ul localhost:8087/index si localhost:8087/ si localhost:8087/home, unde se va randa(res.render) pentru toate pagina index.ejs
app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index" , {ip: req.ip, imagini:obGlobal.imagini});
});

app.get("/galerie", function(req, res){
    res.render("pagini/galerie" , {imagini:obGlobal.imagini});
});

app.get("/favicon.ico", function(req, res){
    res.sendFile(__dirname+"/resurse/ico/favicon.ico");
});

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

// cod irina
function initErori(){
    var continut = fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori=JSON.parse(continut);
    let vErori=obGlobal.obErori.info_erori;
    for (let eroare of vErori){
        eroare.imagine=obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initErori();
// identificator nr err , imi ia titlu din fisierul json la fel si la text si imagine
function afisareEroare(res, _identificator, _titlu="Eroare", _text, _imagine){
    let vErori=obGlobal.obErori.info_erori;
    // itereaza prin vectorul de erori cu find() si atunci cand un element din vErori are identificatorul = _identificator, il returneaza (returneaza elem)
    let eroare=vErori.find(function(elem) {return elem.identificator==_identificator;})
    if(eroare){
        let titlu1 = _titlu=="Eroare" ? (eroare.titlu || _titlu) : _titlu;
        // daca _text != null -> text1 = _text, altfel o sa fie aleasa valoarea eroare.text
        let text1 = _text || eroare.text;
        let imagine1 = _imagine || eroare.imagine;
        if(eroare.status)
        // se seteaa statusul = identificatorul erorii si se randeaza pagina cu param: titlu1, text1, imagine1
        // This sets the HTTP status code of the response to the value of eroare.identificator
            res.status(eroare.identificator).render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
        else
            res.render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1});
    }
    else{
        let errDef=obGlobal.obErori.eroare_default;
        // titlu: errDef.titlu -> se seteaza locals.titlu = errDef.titlu si se foloseste valoarea in ejs (la client) - cand se randeaza pagina
        res.render("pagini/eroare", {titlu:errDef.titlu, text:errDef.text, imagine:obGlobal.obErori.cale_baza+"/"+errDef.imagine});
    }
}

function createImages(){
    // citeste continutul galerie.json
    var continutFisier=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");
    // parseaza continutul intr-un obiect
    var obiect=JSON.parse(continutFisier);
    var dim_mare = 250;
    var dim_mediu = 200;
    var dim_mic = 150;
    obGlobal.imagini=obiect.imagini;

    obGlobal.imagini.forEach(function (elem){
        // este o lista care imi ia primul o data galerie1 dar si png care este extensia din galerie json 
        [numeFisier, extensie] = elem.fisier.split(".");
        //adauga cale galerie din galerie.json
        elem.fisier = obiect.cale_galerie + "/" + elem.fisier;
          //daca nu exista folder ul mare il creeaza 
        if(!fs.existsSync(__dirname+"/"+obiect.cale_galerie+"/mare/")){
            fs.mkdirSync(__dirname+"/"+obiect.cale_galerie+"/mare/");
        }
        // mai sus am folosit split ca sa ii dea remove la extensie, la nume fisier ii adauga .webp
        elem.fisier_mare=obiect.cale_galerie+"/mare/"+numeFisier+".webp";
        sharp(__dirname+"/"+elem.fisier).resize(dim_mare).toFile(__dirname+"/"+elem.fisier_mare);
        // daca nu exista documentul "/resurse/imagini/galerie" il creeaza
        if(!fs.existsSync(__dirname+"/"+obiect.cale_galerie+"/mediu/")){
            fs.mkdirSync(__dirname+"/"+obiect.cale_galerie+"/mediu/");
        }
        elem.fisier_mediu=obiect.cale_galerie+"/mediu/"+numeFisier+".webp";
        // am folosit sharp ca sa ii dau resize la fisier sa il fac mediu si dupa cale dirnmae fisier mediu care este "/resurse/imagini/galerie/mediu" 
        sharp(__dirname+"/"+elem.fisier).resize(dim_mediu).toFile(__dirname+"/"+elem.fisier_mediu);
        // daca nu exista elementul il creeaza
        if(!fs.existsSync(__dirname+"/"+obiect.cale_galerie+"/mic/")){
            fs.mkdirSync(__dirname+"/"+obiect.cale_galerie+"/mic/");
        }
        elem.fisier_mic=obiect.cale_galerie+"/mic/"+numeFisier+".webp";
        sharp(__dirname+"/"+elem.fisier).resize(dim_mic).toFile(__dirname+"/"+elem.fisier_mic);
    });
    console.log(obGlobal.imagini);
}
createImages();

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){
        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss)
    

    // creaza folder back up
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // daca exista caleCss, salveaza fisierul .css in backup
    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
        // copiez din caleCss in backup
    }

    // aici compileaza scss
    rez=sass.compile(caleScss, {"sourceMap":true});
    // {"sourceMap": true}: This option enables source maps, which are useful for debugging as they map the compiled CSS back to the original SCSS source.
    // scrie scss compilat in .css
    fs.writeFileSync(caleCss,rez.css)
    // suprascriere
}

//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss);
// his is a synchronous function from the Node.js fs (filesystem) module that reads the contents of a directory. It returns an array of filenames (or directory names) present in the specified directory.
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        // extname extrage extensia
        compileazaScss(numeFis);
        // apelare functie la start server
        // cand porneste
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    // fs.watch function in Node.js is used to monitor changes to files and directories.
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename") {
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
            // apelare in momentul in care se modifica fisierul 
        }
    }
})

// i am dat portul pe care sa asculte aplicatia
app.listen(8087);
console.log("Serverul a pornit");