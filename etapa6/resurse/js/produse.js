//b inputul de tip range va fi pentru a doua caracteristică numerică, nu pentru preț. 
//Va avea atributul step setat Si va afișa toate produsele cu valoare numerică mai mare decât cea din inputul range

function updateDisplay() {
    var descriere = document.getElementById("inp-descriere");
    var gramaj = document.getElementById("inp-gramaj");
    var nume = document.getElementById("inp-nume");
    var checkedRadio = document.querySelector('input[name="gr_rad"]:checked');
    var contine_cofeina = document.getElementById("inp-contine_cofeina");
    var selectedVal=[];
    for (let option of document.getElementById('inp-luna_adaugare').options){
        if (option.selected) {
            selectedVal.push(option.value);
        }
    }
    var ingrediente = document.getElementById("inp-ingrediente");
    var pret = document.getElementById("inp-pret");

    var produse = Array.from(document.getElementsByClassName("produs"));
    for (let idx = 0; idx < produse.length; idx++) {
        let val_descriere = document.getElementsByClassName("val-descriere")[idx].innerHTML.toLowerCase();
        let val_gramaj = parseInt(document.getElementsByClassName("val-gramaj")[idx].innerHTML);
        let val_nume = document.getElementsByClassName("val-nume")[idx].innerHTML.toLowerCase();
        let val_recomandare_servire = document.getElementsByClassName("val-recomandare_servire")[idx].innerHTML;
        let val_contine_cofeina = document.getElementsByClassName("val-contine_cofeina")[idx].innerHTML;
        let val_luna_adaugare = document.getElementsByClassName("val-data_adaugare")[idx].innerHTML.split("-")[1].trim();
        let val_ingrediente = document.getElementsByClassName("val-ingrediente")[idx].innerHTML;
        let val_pret = parseFloat(document.getElementsByClassName("val-pret")[idx].innerHTML);

        let replacements = {
            "ă": "a",
            "î": "i",
            "â": "a",
            "ș": "s",
            "ț": "t"
        };
        
        val_nume = val_nume.replace(/[ăîâșț]/g, (match) => replacements[match]);
        val_descriere = val_descriere.replace(/[ăîâșț]/g, (match) => replacements[match]);

        let inp_descriere = descriere.value.toLowerCase().trim();
        let range = parseInt(gramaj.value);
        let inp_nume = nume.value;
        let inp_recomandare_servire = checkedRadio.value;
        let inp_contine_cofeina = contine_cofeina.value;
        let inp_ingrediente = ingrediente.value;

        var inp_pret = parseFloat(pret.value);
        var pret_cmp = Number.MAX_SAFE_INTEGER;
        if(pret.checked){
            pret_cmp = inp_pret;
        }

        let meetsDescriere = (inp_descriere === "" || (inp_descriere.match(/^[ăîâșțĂÎÂȘȚA-Za-z_ ]+$/) && val_descriere.includes(inp_descriere)));
        let meetsGramaj = (val_gramaj >= range);
        let meetsNume = ((val_nume.startsWith(inp_nume) && nume.value.match(/^[ăîâșțĂÎÂȘȚA-Za-z_ ]+$/)) || inp_nume === "");
        let meetsRecomandareServire = (val_recomandare_servire == inp_recomandare_servire) || (inp_recomandare_servire == "oricare")
        let meetsContineCofeina = ((val_contine_cofeina == inp_contine_cofeina) || inp_contine_cofeina == "oricare");
        let meetsLunaAdaugare = false;
        
        for(let selected of selectedVal) {
            if(val_luna_adaugare == selected || selected == "toate") {
                meetsLunaAdaugare = true;
            }
        }
        
        let meetsIngrediente = (val_ingrediente.includes(inp_ingrediente) || inp_ingrediente == "");
        let meetsPret = (val_pret < pret_cmp);
        
        if (meetsDescriere && meetsGramaj && meetsNume && meetsRecomandareServire &&
            meetsContineCofeina && meetsLunaAdaugare && meetsIngrediente && meetsPret) {
            produse[idx].style.display = "block";
        } else {
            produse[idx].style.display = "none";
        }
    }
}

window.addEventListener("DOMContentLoaded", function(){
    // inputul de tip textarea va avea un floating label (bootstrap). In cazul validarii esuate a valorii din textarea (vezi cerinta cu validarea
    // din etapa 5), floating label-ul va fi de tip is-invalid (se va seta prin javascript) si se va corecta automat daca valoarea din textarea
    // devine valida.
    var descriere = document.getElementById("inp-descriere");
    var gramaj = document.getElementById("inp-gramaj");
    var nume = document.getElementById("inp-nume");
    var radioGroup = document.querySelectorAll('input[name="gr_rad"]');
    var contine_cofeina = document.getElementById("inp-contine_cofeina");
    var luna_adaugare = document.getElementById('inp-luna_adaugare');
    var ingrediente = document.getElementById("inp-ingrediente");
    var pret = document.getElementById("inp-pret");

    descriere.onchange = function() {
        var invalid_message_d = document.getElementById("message-invalid-desc");
        if((!descriere.value.match(/^[ăîâșțĂÎÂȘȚA-Za-z_ ]+$/)) && descriere.value != ""){
            descriere.classList.add("is-invalid");
            invalid_message_d.style.display = "block";

        }
        else{
            descriere.classList.remove("is-invalid");
            invalid_message_d.style.display = "none";
        }
        updateDisplay();
    }
    
    gramaj.onchange = function() {
        document.getElementById("infoRange").innerHTML = ` (${this.value})`;
        updateDisplay();
    }

    nume.onchange=function(){    
        var invalid_message_n = document.getElementById("message-invalid-nume");
        if((!nume.value.match(/^[ăîâșțĂÎÂȘȚA-Za-z_ ]+$/)) && nume.value != ""){
            nume.classList.add("is-invalid");
            invalid_message_n.style.display = "block";
        }
        else{
            nume.classList.remove("is-invalid");
            invalid_message_n.style.display = "none";
        }
        updateDisplay();
    }

    radioGroup.forEach(radio => {
        radio.addEventListener('change', updateDisplay);
    });

    contine_cofeina.onchange = function() {
        updateDisplay();
    }

    luna_adaugare.onchange = function() {
        updateDisplay();
    }

    ingrediente.onchange = function() {
        updateDisplay();
    }

    pret.onchange = function() {
        updateDisplay();
    }

    document.getElementById("filtrare").onclick=function(){
        // a)filtru nume
        var inp_nume = document.getElementById("inp-nume").value;
        inp_nume = inp_nume.toLowerCase();
        // //  <!-- 7 Cerințe specifice filtre. radio-->
        var checkedRadio = document.querySelector('input[name="gr_rad"]:checked').value;
        // :checked is a pseudo-class that further filters the selection to only the radio button that is currently selected (checked).

        var range = parseInt(document.getElementById("inp-gramaj").value);

        var inp_contine_cofeina = document.getElementById("inp-contine_cofeina").value;



        // Cerințe specifice filtre - selectul de tip multiplu va fi pentru data. 
        var selectedVal=[];
        for (let option of document.getElementById('inp-luna_adaugare').options){
            if (option.selected) {
                selectedVal.push(option.value);
                // If the option is selected, its value is added to the selectedVal array.
            }
        }

        var inp_descriere = document.getElementById("inp-descriere").value;
        inp_descriere = inp_descriere.toLowerCase();

        var inp_ingrediente = document.getElementById("inp-ingrediente").value;

        var inp_pret = document.getElementById("inp-pret");
        var pret = Number.MAX_SAFE_INTEGER;
        
        // 10.11 lei
        if(inp_pret.checked){
            pret = inp_pret.value;
        }
 
        var count = 0;
 
        var produse=document.getElementsByClassName("produs");
        produse = Array.from(produse);
        for (let idx in produse){
            let cond1 = false, cond2 = false, cond3 = false, cond4 = false, cond5 = false, cond6 = false, cond7 = false, cond8 = false;
            produse[idx].style.display="none";
             //la 68 ne folosim de idx ca sa parcurgem for-ul, cu ajutorul liniei de mai jos luam numele de la fiecare idx al produseului  
            let val_nume = document.getElementsByClassName("val-nume")[idx].innerHTML;
            val_nume = val_nume.toLowerCase();
 
            if(val_nume.startsWith(inp_nume) || inp_nume == ""){
                cond1 = true;
            }

            //  <!-- 7 Cerințe specifice filtre. radio-->
            let val_recomandare_servire = document.getElementsByClassName("val-recomandare_servire")[idx].innerHTML;
            
            if((val_recomandare_servire == checkedRadio) || (checkedRadio == "oricare")){
                cond2 = true;
            }

            let val_gramaj = parseInt(document.getElementsByClassName("val-gramaj")[idx].innerHTML);

            if(val_gramaj >= range){
                cond3 = true;
            }

            let val_contine_cofeina = document.getElementsByClassName("val-contine_cofeina")[idx].innerHTML;

            if((val_contine_cofeina == inp_contine_cofeina) || inp_contine_cofeina == "oricare"){
                cond4 = true;
            }

            //Cerințe specifice filtre - selectul de tip multiplu va fi pentru data. 
            let val_data_adaugare = document.getElementsByClassName("val-data_adaugare")[idx].innerHTML;

            let val_luna_adaugare = val_data_adaugare.split("-")[1];
            // 1 = luna

            for(let selected of selectedVal){
                if(val_luna_adaugare.trim() == selected || selected == "toate"){
                  //daca luna selectata este egala cu val_luna_adaugare.trim() == selected sau cdt default
                    cond5 = true;
                }
            }

            let val_descriere = document.getElementsByClassName("val-descriere")[idx].innerHTML;
            val_descriere = val_descriere.toLowerCase();

            if(val_descriere.includes(inp_descriere) || inp_descriere == ""){
                cond6 = true;
            }

            let val_ingrediente = document.getElementsByClassName("val-ingrediente")[idx].innerHTML;
            
            if(val_ingrediente.includes(inp_ingrediente) || inp_ingrediente == ""){
                cond7 = true;
            }

            let val_pret = parseFloat(document.getElementsByClassName("val-pret")[idx].innerHTML);

            if(val_pret < pret){
                cond8 = true;
            }
            

            //afisare produse
            if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8){
                count++;
                produse[idx].style.display="block";
            }
        }
    }
    
    function compareGramaj(a, b, semn) {
        var gramaj_a = parseFloat(a.getElementsByClassName("val-gramaj")[0].innerHTML);
        var gramaj_b = parseFloat(b.getElementsByClassName("val-gramaj")[0].innerHTML);
        return semn * (gramaj_a - gramaj_b);
    }

    function compareNrIngrediente(a, b, semn) {
        var ingrediente_a = a.getElementsByClassName("val-ingrediente")[0].innerHTML.split(",").length;
        var ingrediente_b = b.getElementsByClassName("val-ingrediente")[0].innerHTML.split(",").length;
        return semn * (ingrediente_a - ingrediente_b);
    }

    function comparePret(a, b, semn) {
        var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
        var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
        return semn * (pret_a - pret_b);
    }

    function sortProducts(comparisonFunction, semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);

        v_produse.sort(function(a, b) {
            return comparisonFunction(a, b, semn);
        });

        // If it returns a negative number, a is placed before b.
        // If it returns a positive number, b is placed before a.
        // If it returns 0, a and b are considered equal.

        for (let produs of v_produse) {
            produs.parentNode.appendChild(produs);
        }
        // After sorting, this loop iterates through the sorted array and reorders the elements in the DOM by appending them to their parent node in the new order.
    }

    function sorteaza_nr_ingrediente_gramaj(semn) {
        sortProducts(function(a, b, semn) {
            var result = compareNrIngrediente(a, b, semn);
            if (result === 0) {
                result = compareGramaj(a, b, semn);
            }
            return result;
        }, semn);
    }

    function sorteaza_gramaj_pret(semn) {
        sortProducts(function(a, b, semn) {
            var result = compareGramaj(a, b, semn);
            if (result === 0) {
                result = comparePret(a, b, semn);
            }
            return result;
        }, semn);
    }

    function sorteaza_nr_ingrediente_pret(semn) {
        sortProducts(function(a, b, semn) {
            var result = compareNrIngrediente(a, b, semn);
            if (result === 0) {
                result = comparePret(a, b, semn);
            }
            return result;
        }, semn);
    }

    function sorteaza_pret_gramaj(semn) {
        sortProducts(function(a, b, semn) {
            var result = comparePret(a, b, semn);
            if (result === 0) {
                // daca sunt egale e 0 si dupa compar dupa gramaj
                result = compareGramaj(a, b, semn);
            }
            return result;
        }, semn);
    }

    function sorteaza_gramaj_nr_ingrediente(semn) {
        sortProducts(function(a, b, semn) {
            var result = compareGramaj(a, b, semn);
            if (result === 0) {
                result = compareNrIngrediente(a, b, semn);
            }
            return result;
        }, semn);
    }

    function sorteaza_pret_nr_ingrediente(semn) {
        sortProducts(function(a, b, semn) {
            var result = comparePret(a, b, semn);
            if (result === 0) {
                result = compareNrIngrediente(a, b, semn);
            }
            return result;
        }, semn);
    }

    // Event listener for sorting
    document.getElementById("sort").onclick = function() {
        let inp_criteriu_sortare = document.getElementById("inp-crit_sortare").value;
        let inp_tip_sortare = document.getElementById("inp-tip_sortare").value;

        if (inp_criteriu_sortare == "pret_gramaj" && inp_tip_sortare == "crescator")
            sorteaza_pret_gramaj(1);
        else if (inp_criteriu_sortare == "pret_gramaj" && inp_tip_sortare == "descrescator")
            sorteaza_pret_gramaj(-1);
        else if (inp_criteriu_sortare == "pret_nr_ingrediente" && inp_tip_sortare == "crescator")
            sorteaza_pret_nr_ingrediente(1);
        else if (inp_criteriu_sortare == "pret_nr_ingrediente" && inp_tip_sortare == "descrescator")
            sorteaza_pret_nr_ingrediente(-1);
        else if (inp_criteriu_sortare == "gramaj_nr_ingrediente" && inp_tip_sortare == "crescator")
            sorteaza_gramaj_nr_ingrediente(1);
        else if (inp_criteriu_sortare == "gramaj_nr_ingrediente" && inp_tip_sortare == "descrescator")
            sorteaza_gramaj_nr_ingrediente(-1);
        else if (inp_criteriu_sortare == "gramaj_pret" && inp_tip_sortare == "crescator")
            sorteaza_gramaj_pret(1);
        else if (inp_criteriu_sortare == "gramaj_pret" && inp_tip_sortare == "descrescator")
            sorteaza_gramaj_pret(-1);
        else if (inp_criteriu_sortare == "nr_ingrediente_pret" && inp_tip_sortare == "crescator")
            sorteaza_nr_ingrediente_pret(1);
        else if (inp_criteriu_sortare == "nr_ingrediente_pret" && inp_tip_sortare == "descrescator")
            sorteaza_nr_ingrediente_pret(-1);
        else if (inp_criteriu_sortare == "nr_ingrediente_gramaj" && inp_tip_sortare == "crescator")
            sorteaza_nr_ingrediente_gramaj(1);
        else if (inp_criteriu_sortare == "nr_ingrediente_gramaj" && inp_tip_sortare == "descrescator")
            sorteaza_nr_ingrediente_gramaj(-1);
    }

 
    document.getElementById("calculare").onclick=function(){
        var produse=document.getElementsByClassName("produs");
        var v_produse=Array.from(produse);
        var suma = 0;
        for(let idx in v_produse){
            if(window.getComputedStyle(v_produse[idx]).display == "block"){
                suma += parseFloat(document.getElementsByClassName("val-pret")[idx].innerHTML);
            }
        }
 
        if(!document.getElementById("rezultat")){
            var rezultat_calcul = document.createElement("DIV");
            rezultat_calcul.id = "rezultat";
            rezultat_calcul.innerHTML = "Suma preturlor produselor: " + suma;
            rezultat_calcul.style.color = "var(--maro)";
            rezultat_calcul.style.width = "max-content";
            rezultat_calcul.style.borderRadius = "6px";
            rezultat_calcul.style.padding = "5px";
            rezultat_calcul.style.backgroundColor = "var(--portocaliu-alb)";
            var ps=document.getElementById("p-suma");
            // insertBefore - insereaza un nod nou (rezultat_calcul) inaintea unui nod existent (ps.nextSibling - urmatorul frate al lui p-suma = interiorul lui p-suma) si se apeleaza folosind <nume nod parinte>.insertBefore(nodNou, nodExistent)
            // ps.nextsibling primulfrate textul din interior 
            ps.parentNode.insertBefore(rezultat_calcul, ps.nextSibling);
            // insereaza noua val in p suma 

            rezultat_calcul.onclick=function(){
                this.remove();
            }
            
            setTimeout(function (){
                rezultat_calcul.remove();
            }, 2000);
        }
    }
 
    document.getElementById("resetare").onclick=function(){
        if(confirm("Sunteti siguri ca doriti sa resetati filtrele?") == true){
            document.getElementById("inp-nume").value = "";
            document.getElementById("i_rad4").checked = true;
            // radio button default care e oricare si care e checked 
            document.getElementById("inp-descriere").value = "";
            document.getElementById("inp-pret").checked = false;
            // sa nu fie checked by default pret mai mic de 10 ron 
            document.getElementById("inp-gramaj").value = document.getElementById("inp-gramaj").getAttribute("min");
            document.getElementById("sel-toate").selected = true;
            // select simplu val toate by default 
            document.getElementById("inp-ingrediente").value = "";
            for (let option of document.getElementById("inp-luna_adaugare").options){
                if (option.selected){
                    option.selected=false;
                    // deselects the option if it was selected.

                }
            }
            document.getElementById("sel-toate-multiplu").selected = true;
            // sa imi seecteze val default toate 
            document.getElementById("infoRange").innerHTML=` (${document.getElementById("inp-gramaj").value})`;

            var inputs = [
                "inp-nume", "i_rad4", "inp-descriere", "inp-pret", "inp-gramaj",
                "inp-ingrediente", "inp-luna_adaugare", "inp-contine_cofeina"
            ];
    
            inputs.forEach(function(id) {
                var element = document.getElementById(id);
                if (element) {
                    var event = new Event('change');
                    //f the element exists, this line creates a new change event using the Event constructor.
                    // The 'change' event type is commonly used to signify that the value of an input field or select box has been altered.
                    element.dispatchEvent(event);
                    // dispatchEvent method is called on the element, triggering the change event programmatically.
                }
            });
        }
    }
 
    var products=document.getElementsByClassName("produs");
    var v_products=Array.from(products);
    var days=["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];
    var months=["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    for(let prod of v_products){
        //data originala a fiecarui produs in parte 
        var originalDate = prod.getElementsByClassName("val-data_adaugare")[0].innerHTML;
        //initial e string dupa care il transform in data
        var date = new Date(originalDate);
        var newDate = date.getDate() + "-" + months[date.getMonth()] + "-" + date.getFullYear() + " (" + days[date.getDay()] + ")";
        prod.getElementsByClassName("val-data_adaugare")[0].innerHTML = newDate;
        prod.getElementsByClassName("data_adaugare")[0].innerHTML = newDate;
    }
});