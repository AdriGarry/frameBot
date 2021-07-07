const Logger = require('./Logger');
const log = new Logger(__filename);

module.exports = class Module {
   constructor(arg) {
      log.test('new Module instanciation', arg);
   }
}