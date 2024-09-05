window.addEventListener("DOMContentLoaded",  function(){
    // The DOMContentLoaded event is fired when the initial HTML document has been completely loaded and parsed, 
    // without waiting for stylesheets, images, and subframes to finish loading.
    // The function inside this event listener will be executed as soon as the DOM is ready.
    currTheme=localStorage.getItem("theme");
    // The code retrieves the current theme
    if(currTheme)
        document.body.classList.add(currTheme);
    // If a theme is stored in localStorage, the code applies it by adding the theme as a class to the <body> element. 

    // facem toggle pentru iconite sun/moon
    // document.getElementsByClassName("fa-solid")[1] selects the second element in the document with the class fa-solid
    if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-sun") && !document.body.classList.contains("dark")){
        document.getElementsByClassName("fa-solid")[1].classList.remove("fa-sun");
        document.getElementsByClassName("fa-solid")[1].classList.add("fa-moon");
        // If the current theme is light (!document.body.classList.contains("dark")), the icon is changed to a moon icon (fa-moon).
    }

    // facem toggle pentru iconite sun/moon
    if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-moon") && document.body.classList.contains("dark")){
        document.getElementsByClassName("fa-solid")[1].classList.remove("fa-moon");
        document.getElementsByClassName("fa-solid")[1].classList.add("fa-sun");
    }

    document.getElementById("theme").onclick=function(){
        if (document.body.classList.contains("dark")){
            // checks if the <body> element has the class "dark".
            document.body.classList.remove("dark");
            localStorage.removeItem("theme");
            // If the "dark" class is present, it removes this class from the <body>. This action typically switches the theme to light.
            //  It also removes any stored theme information from localStorage, which is used to persist the theme selection across page reloads.
            if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-sun")){
                document.getElementsByClassName("fa-solid")[1].classList.remove("fa-sun");
                document.getElementsByClassName("fa-solid")[1].classList.add("fa-moon");
            }
        }
        else{
            document.body.classList.add("dark");
            //  apply dark theme styles to the page.
            localStorage.setItem("theme","dark");
            // This line saves the theme preference ("dark") in the browser’s localStorage. This allows the theme choice to persist across page reloads or browser sessions.
            if(document.getElementsByClassName("fa-solid")[1].classList.contains("fa-moon")){
                document.getElementsByClassName("fa-solid")[1].classList.remove("fa-moon");
                document.getElementsByClassName("fa-solid")[1].classList.add("fa-sun");
            }
        }
    }
});
