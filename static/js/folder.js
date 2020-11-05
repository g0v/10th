// Generated by LiveScript 1.3.1
(function(){
  ldui.Folder = function(opt){
    var root, toggler, this$ = this;
    root = opt.root;
    this.root = root = typeof root === 'string'
      ? document.querySelector(root)
      : root ? root : null;
    console.log(root);
    toggler = root.querySelector('.folder-toggle');
    this.menu = root.querySelector('.folder-menu');
    toggler.addEventListener('click', function(){
      return this$.toggle();
    });
    return this;
  };
  return ldui.Folder.prototype = import$(Object.create(Object.prototype), {
    fit: function(){
      return this.toggle(this.root.classList.contains('show'), true);
    },
    toggle: function(v, force){
      var ison, ch, sh;
      ison = this.root.classList.contains('show');
      if ((v = v != null
        ? v
        : !ison) === ison && !force) {
        return;
      }
      ch = getComputedStyle(this.menu).height || 0;
      this.menu.style.height = "";
      this.menu.offsetHeight;
      sh = this.menu.scrollHeight;
      this.menu.style.height = ch;
      this.menu.offsetHeight;
      this.menu.style.height = (!v ? 0 : sh) + "px";
      this.root.classList.toggle('show', v);
      return v;
    }
  });
})();
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}