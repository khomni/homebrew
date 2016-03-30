var Navbar = {
  init: function(){
    this.dom = document.getElementById('nav');
    this.setListeners();
  },
  setListeners: function(){
    var menus = document.getElementsByClassName('dropdown-menu');
    for(i=0;i < menus.length; i++){
      var thisMenu = menus[i];
      (function(){
        thisMenu.addEventListener('click',function(e){
          e.stopImmediatePropagation();
        })
      })(thisMenu)
    };

    var dropdowns = document.getElementsByClassName('dropdown');
    for(i=0;i < dropdowns.length;i++) {
      var thisDrop = i;
      (function(){
        var target = document.getElementById(dropdowns[thisDrop].dataset.target);
        dropdowns[thisDrop].addEventListener('click',function(e){
          e.preventDefault();
          for(i=0;i< menus.length; i++) {
            if(menus[i] !== target) {
              menus[i].classList.remove('active');
            }
            else {
              target.classList.toggle('active');
            }
          }
        },false);
      })(thisDrop)
    };

    this.dom.addEventListener('click',function(e){
      // prevent menus from closing if navbar is clicked
      e.stopPropagation();
    });
    document.addEventListener('click',function(e){
      e.preventDefault();
      for(i=0;i< menus.length; i++) {
        menus[i].classList.remove('active');
      }
    },false);
  }

};

module.exports = Navbar;
