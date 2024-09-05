window.addEventListener("DOMContentLoaded", function(){
    var days=["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];
    var months=["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    var originalDate = document.getElementsByClassName("data_adaugare")[0].innerHTML;
    var date = new Date(originalDate);
    var newDate = date.getDate() + "-" + months[date.getMonth()] + "-" + date.getFullYear() + " (" + days[date.getDay()] + ")";
    document.getElementsByClassName("data_adaugare")[0].innerHTML = newDate;
})