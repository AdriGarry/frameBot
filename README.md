# Odi

Based on NodeJS, running on a Raspberry Pi, this is **Odi**'s program to autorun and interact !

Available modes: ready, sleep, test

### Main functionalities:

- Voice synthesizer (TTS) & Voicemail
- Alarm (weekday & weekend)
- Timer
- Jukebox
- Web radio (FIP)
- Exclamations
- Interactions with an Arduino (Max...)
- Weather

### Additional functionalities:

- Expressive functionalities: birthday song, bad boy...
- Ambiance sounds (cicadas)
- Logger & cleaner
- Hardware monitoring (CPU, diskspace, temperature)

### Input

- Buttons (GPIO)
- Jobs (internal)
- User interface (web)

### Output

- Leds (GPIO)
- Speaker (audio)
- Arduino (USB)
- Screen (HDMI)

### Internal

#### Core.conf

The Core.conf holds cycle informations: _mode, alarms, version_.

This object is isolated, with access methods.

This object is file persisted and has a default version.

#### Core.run

The Core.run holds runtime informations: _etat, volume, max, mood, music, alarms, timer, voicemail, cpu, memory, stats_.

This object is isolated, with access methods.

#### Flux manager

A flux manager, based on RxJS, can send or schedule (delay, repeat) orders.
The _Flux.next()_ function accepts flux object (full or detailled), or list of fluxs.

A flux is an Object with 3 properties:

- id: _type|subject|name_
- data: any type
- conf: `{delay:_number_, loop:_number_, hidden:_boolean_}`
