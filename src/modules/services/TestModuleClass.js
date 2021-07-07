const Module = require('../../api/Module');
const Logger = require('../../api/Logger');
const log = new Logger(__filename);

let crons = {
   full: [
      { cron: '5 0 0 * * *', flux: { id: 'service|context|goToSleep' } },
      {
         cron: '13 13 13 * * 1-6',
         flux: [
            { id: 'interface|tts|speak', data: { lg: 'en', msg: 'Auto restart' } },
            { id: 'service|context|restart', conf: { delay: 3 } }
         ]
      },
      {
         cron: '13 13 13 * * 0',
         flux: [
            { id: 'interface|tts|speak', data: { lg: 'en', msg: 'Reset config' } },
            { id: 'service|context|reset', conf: { delay: 3 } }
         ]
      }
   ]
};

module.exports = class TestModuleClass extends Module {
   constructor(arg) { // constructor args ?
      log.test('TestModuleClass constructor')
      super(crons);
      // => flux parser etc here...
      //Observers.attachFluxParser('service', 'context', contextHandler);
   }

   onInit() {
      // Set module as ready now, or after stuff (like rfxcom gateway ready)?
      log.test('new test module as class instanciation');
      privateMethod();
   }

   onDestroy() {
      log.test('onDestroy...')
   }
}

function privateMethod() {
   log.test('inside private method!')
}


// Observers.attachFluxParser('service', 'context', contextHandler);

function contextHandler(flux) {
   if (flux.id == 'restart') {
      restartCore(flux.value);
   } else if (flux.id == 'sleep') {
      restartCore('sleep');
   } else if (flux.id == 'sleepForever') {
      updateConf({ mode: 'sleep', alarms: { weekDay: null, weekEnd: null } }, true);
   } else if (flux.id == 'goToSleep') {
      goToSleep();
   } else if (flux.id == 'update') {
      updateConf(flux.value, false);
   } else if (flux.id == 'updateRestart') {
      updateConf(flux.value, true);
   } else if (flux.id == 'reset') {
      resetCore();
   } else Core.error('unmapped flux in Context service', flux, false);
}