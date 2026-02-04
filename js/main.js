function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");

    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    
    evt.currentTarget.className += " active";
}

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('open');
    });

    const tablinks = document.querySelectorAll('.tablinks');
    tablinks.forEach(button => {
        button.addEventListener('click', function(event) {
            const tabName = this.getAttribute('data-tab');
            openTab(event, tabName);
        });
    });

    document.getElementById("defaultOpen").click();
});