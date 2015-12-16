# FSM Tutor

### Installing

To install the FSM tutor, you need to do a couple of things:
1. Download all of the display dependencies using bower. Just run a `bower install` to get started. If you don't have bower installed, install it using `npm -g install bower`. 
2. Have some type of way to host the CTAT files. Because of browser security permissions, opening the files locally does not work correctly. We have been using a MAMP server for easy hosting.

### Running the Example Tracing Tutor

The example tracing tutor is found in the `FSMTutor_Example.html` file. To run this file correctly, you need to host it, and SimpleButton.brd file from a web server (like a simple MAMP server). Due to file URL security permissions, trying to run this directly from a file does not work well, as the example tracer is expecting an HTTP/S URL. 

The example tracers has been ported to Javascript, so it is unnecessary to have a CTAT tutoring service anywhere to run the BRD file provided. 

### Running the Cognitive Tutor

For the cognitive tutor to run, you need to do a similar process as listed above for hosting the tutor files from a web server. The CognitiveModel folder, FinalBRDs folder, and then the appropriate HTML file (Button, Combo, or DragDrop). Once these files are hosted, you must also have the CTAT tutoring service running somewhere that can accept HTTP requests. This can be run locally: 
```
./runTutoringService.sh -h 8081
```

This service is required to perform the model tracing for the cognitive tutor.