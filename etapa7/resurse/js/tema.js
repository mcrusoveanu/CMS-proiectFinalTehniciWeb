window.addEventListener("DOMContentLoaded",  function(){
    currTheme=localStorage.getItem("theme");
    if(currTheme)
        document.body.classList.add(currTheme);
    if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-sun") && !document.body.classList.contains("dark")){
        document.getElementsByClassName("fa-solid")[1].classList.remove("fa-sun");
        document.getElementsByClassName("fa-solid")[1].classList.add("fa-moon");
    }
 
    if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-moon") && document.body.classList.contains("dark")){
        document.getElementsByClassName("fa-solid")[1].classList.remove("fa-moon");
        document.getElementsByClassName("fa-solid")[1].classList.add("fa-sun");
    }
    document.getElementById("theme").onclick=function(){
        if (document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            localStorage.removeItem("theme");
            if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-sun")){
                document.getElementsByClassName("fa-solid")[1].classList.remove("fa-sun");
                document.getElementsByClassName("fa-solid")[1].classList.add("fa-moon");
            }
        }
        else{
            document.body.classList.add("dark");
            localStorage.setItem("theme","dark");
            if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-moon")){
                document.getElementsByClassName("fa-solid")[1].classList.remove("fa-moon");
                document.getElementsByClassName("fa-solid")[1].classList.add("fa-sun");
            }
        }
    }
});
