#!/bin/bash

sudo killall omxplayer
sudo killall mplayer

echo $*
url="http://translate.google.com/translate_tts?tl=fr&client=tw-ob&q=$*"

sudo amixer cset numid=3 1
#sudo mplayer -volume 400 -really-quiet -noconsolecontrols "$url"
sudo mplayer -softvol -softvol-max 300 -really-quiet -noconsolecontrols "$url"