function define(id, )

(function(){
  const loaded = {};
  window.require = function(...modules) {
    return modules.map((module) => {
      if (module in loaded) return loaded[module];
      throw new Error('Module not found: ${module}');
    });
  }
  window.define = function(name, dependencies, module) {
    const missing = dependencies.filter((dep) => !(dep in loaded););
    if (!missing.length) throw new Error('Module dependencies not found: ${missing}');
    if (name in loaded) throw new Error('Duplicate module name: ${name}');
    loaded[name] = module(window.require(...dependencies));
  }
})();