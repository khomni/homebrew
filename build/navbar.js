var Navbar = {
  init: function(){
    this.dom = document.getElementById('nav');
    this.setListeners();
  },
  setListeners: function(){
    var menus = document.getElementsByClassName('dropdown-menu');
    for(var i=0;i < menus.length; i++){
      var thisMenu = menus[i];
      (function(){
        thisMenu.addEventListener('click',function(e){
          e.stopImmediatePropagation();
        })
      })(thisMenu)
    };

    var dropdowns = document.getElementsByClassName('dropdown');
    for(var i=0;i < dropdowns.length;i++) {
      var thisDrop = i;
      (function(){
        var target = document.getElementById(dropdowns[thisDrop].dataset.target);
        dropdowns[thisDrop].addEventListener('click',function(e){
          e.preventDefault();
          this.classList.toggle('active')
          // for(i=0;i< menus.length; i++) {
          //   if(menus[i] !== target) {
          //     menus[i].classList.remove('active');
          //   }
          //   else {
          //     target.classList.toggle('active');
          //   }
          // }
        },false);
      })(thisDrop)
    };

    if(!this.dom) return false;

    this.dom.addEventListener('click',function(e){
      // prevent menus from closing if navbar is clicked
      e.stopPropagation();
    });
    document.addEventListener('click',function(e){
      for(var i=0;i< dropdowns.length; i++) {
        dropdowns[i].classList.remove('active');
      }
    },false);
  }

};

module.exports = Navbar;
