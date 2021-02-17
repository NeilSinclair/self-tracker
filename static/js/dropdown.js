// show the button by toggling the .show to "block" in the css; activated in the html
function showDD(){
    document.getElementById("sleep_dd").classList.toggle("show")
}

// if the user clicks anywhere after clicking on the dropdown, remove it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }