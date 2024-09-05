const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const {Client} = require("pg");
const fs_promises = require('fs/promises');

obGlobal={
    obErori:null,
    imagini:null,
    folderScss:path.join(__dirname,"resurse/sass"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup:path.join(__dirname,"backup"),
    categorieMare: null
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

// user bd 
var client = new Client({
    database: "bestTea",
    user: "mihai",
    password: "parola",
    host: "localhost",
    port:5432
});
client.connect();

//create the full path for the current folder to be created
vect_foldere=["temp", "temp1", "backup"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

//  Meniu impartirea pe categorii mari 
//  tip_produs = ceai, cafea, patiserie
client.query("select * from unnest(enum_range(null::tip_produs))", function(err, rez){
    if(err)
        console.log(err);
    else{
        console.log(rez);
        obGlobal.categorieMare = rez.rows;
    }
});

//next-call the next middleware or route handler
//ce obtin din rez.rows pun in  obGlobal.categorieMare pe care il pun in res.locals.categoriemare pe care il folosesc in header.ejs linia 29 produse
//obgloobal ca sa poata sa fie vazut peste tot var globala 
app.use("/*", function(req, res, next){
    res.locals.categorieMare = obGlobal.categorieMare;
    next();
})

app.use(/^\/resurse(\/(\w)*)*$/, function(req,res){
    afisareEroare(res, 403);
});

// cerere de tip get catre server pentru url-ul localhost:8087/index si localhost:8087/ si localhost:8087/home, unde se va randa(res.render) pentru toate pagina index.ejs
// app.get(["/index","/","/home"], function(req, res){
//     res.render("pagini/index" , {ip: req.ip, imagini:obGlobal.imagini});
// });

// app.get(["/index", "/", "/home"], function(req, res) {
//     client.query(`
//         SELECT *, (CURRENT_DATE - data_adaugare <= INTERVAL '2 months') AS is_new
//         FROM produse
//     `, function(err, result) {
//         if (err) {
//             console.log(err);
//             afisareEroare(res, 2);
//             return;
//         }
        
//         const produse = result.rows;
//         const newProducts = produse
//             .filter(produs => produs.is_new)
//             .sort((a, b) => new Date(b.data_adaugare) - new Date(a.data_adaugare));

            

//         res.render("pagini/index", { ip: req.ip, imagini: obGlobal.imagini, newProducts: newProducts });
//     });
// });

app.get(["/index", "/", "/home"], async function(req, res) {
    try {
        const result = await client.query(`
            SELECT *, (CURRENT_DATE - data_adaugare <= INTERVAL '2 months') AS is_new
            FROM produse
        `);
        
        const produse = result.rows;
        const newProducts = produse
            .filter(produs => produs.is_new)
            .sort((a, b) => new Date(b.data_adaugare) - new Date(a.data_adaugare));

        var imagini_produse = []
        for (let prod of newProducts) {
            try {
                const files = await fs_promises.readdir(path.join(__dirname, "/resurse/imagini/produse", prod.imagine));
                if (files.length > 0) {
                    imagini_produse.push(path.join(files[0]));
                }
            } catch (error) {
                console.error("Failed to read directory for product image:", error);
            }
        }

        res.render("pagini/index", {
            ip: req.ip,
            imagini: obGlobal.imagini,
            newProducts: newProducts,
            imaginiProduse: imagini_produse,
        });
    } catch (err) {
        console.error(err);
        afisareEroare(res, 2);
    }
});

app.get("/galerie", function(req, res){
    res.render("pagini/galerie" , {imagini:obGlobal.imagini});
});

// app.get("/produse", function(req, res){
//     //The UNNEST function takes an ARRAY and returns a table with a row for each element in the ARRAY.
//     // enum_range ( anyenum ) → anyarray(ceai,cafea,patiserie) tabela_produse.sql
//     // Returns all values of the input enum type in an ordered array.
//     // enum_range(null::rainbow) → {red,orange,yellow,​green,blue,purple}
//     client.query("select * from unnest(enum_range(null::tip_produs))", function(err, rezCateg){
//         continuareQuery="";
//         if(req.query.tip){
//             // req.query.tip typically refers to a query parameter named "tip" that is part of an HTTP request.
//             // When a client makes an HTTP request to a server, it can include query parameters as part of the URL.
//             // These query parameters are usually used to pass additional data to the server for processing.
//             continuareQuery += ` and categorie_mare='${req.query.tip}'`;
//             //toate produsele care fac parte dintr-o categorie cu un anumit tip 
//             //daca puneam where sus nu mai era nevoie de where 1=1 jos iar 1=1 conditie adevarata
//         }
//         client.query("select * from produse where 1=1 " + continuareQuery, function(err, rez){
//             if(err){
//                 console.log(err);
//             }
//             else{
//                 res.render("pagini/produse", {produse:rez.rows, optiuni:rezCateg.rows});
//                 //fiecare produs in parte
//             }
//         })
//     })
// })

// app.get("/produse", async function(req, res) {
//     // Retrieve all possible values for recomandare_servire
//     client.query("SELECT unnest(enum_range(null::recomandari_servire)) AS recomandare_servire", async function(err, recomandareServire) {
//         if (err) {
//             console.log(err);
//             afisareEroare(res, 2);
//             return;
//         }
        
//         res.locals.optiuni = recomandareServire.rows;  // Store options for service recommendations in locals

//         // Retrieve the mean of all prices, minimum and maximum gramaj, and list of all ingredients
//         client.query(`
//             WITH ingredient_list AS (
//                 SELECT DISTINCT unnest(ingrediente) AS ingredient FROM produse
//             )
//             SELECT AVG(pret) AS mean_price, MIN(gramaj) AS min_gramaj, MAX(gramaj) AS max_gramaj, ARRAY(SELECT ingredient FROM ingredient_list) AS ingredients
//             FROM produse
//         `, async function(err, additionalInfo) {
//             if (err) {
//                 console.log(err);
//                 afisareEroare(res, 2);
//                 return;
//             }

//             // Store additional info in locals
//             res.locals.meanPrice = additionalInfo.rows[0].mean_price;
//             res.locals.minGramaj = additionalInfo.rows[0].min_gramaj;
//             res.locals.maxGramaj = additionalInfo.rows[0].max_gramaj;
//             res.locals.ingredients = additionalInfo.rows[0].ingredients;

//             let productsQuery = `
//                 SELECT *, (CURRENT_DATE - data_adaugare <= INTERVAL '2 months') AS is_new
//                 FROM produse
//             `;
//             let params = [];

//             if (req.query.tip) {
//                 productsQuery += " WHERE categorie_mare = $1";
//                 params.push(req.query.tip);
//             }

//             // Retrieve all products or all products from a specific category
//             client.query(productsQuery, params, async function(err, allProducts) {
//                 if (err) {
//                     console.log(err);
//                     afisareEroare(res, 2);
//                     return;
//                 }
//                 res.locals.produse = allProducts.rows;

//                 var imagini_prod = [];
//                 for (let prod of allProducts.rows) {
//                     try {
//                         const files = await fs_promises.readdir(path.join(__dirname, "/resurse/imagini/produse", prod.imagine));
//                         imagini_prod.push(files);

//                     } catch (error) {
//                         console.error("Failed to read directory:", error);
//                     }
//                 }

//                 console.log("imagini_prod", imagini_prod);
               
//                 // Fetch the products with the lowest price from each category or from the specified category
//                 let minPricePerCategoryQuery = `
//                     SELECT DISTINCT ON (categorie_mare) *
//                     FROM produse
//                     WHERE pret IN (
//                         SELECT MIN(pret)
//                         FROM produse
//                         GROUP BY categorie_mare
//                     )
//                     ORDER BY categorie_mare, pret;
//                 `;

//                 if (req.query.tip) {
//                     minPricePerCategoryQuery = `
//                         SELECT *
//                         FROM produse
//                         WHERE categorie_mare = $1 AND pret = (
//                             SELECT MIN(pret)
//                             FROM produse
//                             WHERE categorie_mare = $1
//                         );
//                     `;
//                 }

//                 client.query(minPricePerCategoryQuery, req.query.tip ? [req.query.tip] : [], function(err, minPriceProducts) {
//                     if (err) {
//                         console.log(err);
//                         afisareEroare(res, 2);
//                         return;
//                     }
                    
//                     res.locals.minPretProduse = minPriceProducts.rows;
//                     res.render("pagini/produse", { imagini_produse: imagini_prod });
//                 });
//             });
//         });
//     });
// });

app.get("/produse", async function(req, res) {
    try {
        // Retrieve all possible values for recomandare_servire
        const recomandareServire = await client.query("SELECT unnest(enum_range(null::recomandari_servire)) AS recomandare_servire");

        // Retrieve the mean of all prices, minimum and maximum gramaj, and list of all ingredients
        const additionalInfo = await client.query(`
            WITH ingredient_list AS (
                SELECT DISTINCT unnest(ingrediente) AS ingredient FROM produse
            )
            SELECT AVG(pret) AS mean_price, MIN(gramaj) AS min_gramaj, MAX(gramaj) AS max_gramaj, ARRAY(SELECT ingredient FROM ingredient_list) AS ingredients
            FROM produse
        `);

        let productsQuery = `
            SELECT *, (CURRENT_DATE - data_adaugare <= INTERVAL '2 months') AS is_new
            FROM produse
        `;
        let params = [];

        if (req.query.tip) {
            productsQuery += " WHERE categorie_mare = $1";
            params.push(req.query.tip);
        }

        const allProducts = await client.query(productsQuery, params);

        var imagini_prod = [];
        for (let prod of allProducts.rows) {
            try {
                const files = await fs_promises.readdir(path.join(__dirname, "/resurse/imagini/produse", prod.imagine));
                imagini_prod.push(files);
            } catch (error) {
                console.error("Failed to read directory:", error);
            }
        }

        // Fetch the products with the lowest price from each category or from the specified category
        let minPricePerCategoryQuery = `
            SELECT DISTINCT ON (categorie_mare) *
            FROM produse
            WHERE pret IN (
                SELECT MIN(pret)
                FROM produse
                GROUP BY categorie_mare
            )
            ORDER BY categorie_mare, pret;
        `;

        if (req.query.tip) {
            minPricePerCategoryQuery = `
                SELECT *
                FROM produse
                WHERE categorie_mare = $1 AND pret = (
                    SELECT MIN(pret)
                    FROM produse
                    WHERE categorie_mare = $1
                );
            `;
            params = [req.query.tip];
        }

        const minPriceProducts = await client.query(minPricePerCategoryQuery, params);

        res.render("pagini/produse", {
            optiuni: recomandareServire.rows,
            meanPrice: additionalInfo.rows[0].mean_price,
            minGramaj: additionalInfo.rows[0].min_gramaj,
            maxGramaj: additionalInfo.rows[0].max_gramaj,
            ingredients: additionalInfo.rows[0].ingredients,
            produse: allProducts.rows,
            imagini_produse: imagini_prod,
            minPretProduse: minPriceProducts.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


// subpunctul 2 de la 6 are legatura cu produs.ejs din pagini
app.get("/produs/:id", async function(req, res) {
    try {
        const prodResult = await client.query("SELECT *, (CURRENT_DATE - data_adaugare <= INTERVAL '2 months') AS is_new FROM produse WHERE id = $1", [req.params.id]);
        let prod = prodResult.rows[0];
        if (!prod) {
            afisareEroare(res, 2);
            return;
        }

        let imagineProdCurent = null;
        try {
            const files = await fs_promises.readdir(path.join(__dirname, "/Resurse/imagini/produse", prod.imagine));
            if (files.length > 0) {
                imagineProdCurent = files[0];
            }
        } catch (error) {
            console.error("Failed to read directory:", error);
        }

        const prodSimilareResult = await client.query("SELECT * FROM produse WHERE recomandare_servire = $1 AND id != $2", [prod.recomandare_servire, prod.id]);
        const prodSimilare = prodSimilareResult.rows;

        const imagineProdRelevante = [];
        for (let simProd of prodSimilare) {
            try {
                const simFiles = await fs_promises.readdir(path.join(__dirname, "/Resurse/imagini/produse", simProd.imagine));
                if (simFiles.length > 0) {
                    imagineProdRelevante.push(simFiles[0]);
                }
            } catch (error) {
                console.error("Failed to read directory for similar products:", error);
            }
        }

        res.render("pagini/produs", {
            prod: prod,
            prodSimilare: prodSimilare,
            imagineProdCurent: imagineProdCurent,
            imaginiProdRelevante: imagineProdRelevante
        });
    } catch (err) {
        console.log(err);
        afisareEroare(res, 2);
    }
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
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

// i am dat portul pe care sa asculte aplicatia
app.listen(8087);
console.log("Serverul a pornit");