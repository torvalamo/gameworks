;(function(){
  function createModule(source) {
    return function(module) {
      eval(source)
    }
  }
  
  var module = {exports: {}};
  module['module'] = module;
})();