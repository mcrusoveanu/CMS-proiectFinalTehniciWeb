window.addEventListener("DOMContentLoaded", function(){
    // produse.ejs 226
    var accordionItems = document.getElementsByClassName("accordion-item");
    // toate elem care au clasa  accordion-item

    Array.from(accordionItems).forEach(function(item, idx) {
        // folosim un array iar pentru fiecare elem din array folosim onclick sa vedem daca am apasat pe el 
        item.onclick = function() {
            // daca am apasat pe el imi ia  fiecare btn acc-btn si seteaza aria expended to true 
            if(document.getElementsByClassName("acc-btn")[idx].getAttribute("aria-expanded") == "true"){
                // document.getElementsByClassName("acc-btn")[idx].setAttribute("aria-expanded", "true");
                localStorage.setItem(`aria-expanded_${idx + 1}`, "true");
                // aici
                // document.getElementsByClassName("acc-btn")[idx].innerHTML="Ascunde Descriere";
            }
            else if(document.getElementsByClassName("acc-btn")[idx].getAttribute("aria-expanded") == "false"){
                // document.getElementsByClassName("acc-btn")[idx].setAttribute("aria-expanded", "false");
                localStorage.setItem(`aria-expanded_${idx + 1}`, "false");
                // document.getElementsByClassName("acc-btn")[idx].innerHTML="Afiseaza Descriere";
            }
        };
    });

    for(let idx in Array.from(accordionItems))
    {
        let i = parseInt(idx);
        isOpen = document.getElementById(`collapse${i + 1}`);
        if(localStorage.getItem(`aria-expanded_${i + 1}`)=='false' && isOpen.classList.contains("show")){
            // This retrieves the value associated with the key aria-expanded_{i + 1} from the browser's localStorage.
            
            // This checks if the element referred to by isOpen has the class show applied to it.
            isOpen.classList.remove("show");
            // document.getElementsByClassName("acc-btn")[idx].innerHTML="Afiseaza Descriere";
            // daca in meme  e stocat ca nu ar trebuie sa se vada si el e dechis il inchid 
        }
    }
});
