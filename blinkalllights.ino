// This #include statement was automatically added by the Particle IDE.
#include <InternetButton.h>

InternetButton b = InternetButton();

int red, green, blue;
bool up = true;

void myHandler(const char *event, const char *data)
{
    char* dataToParse = (char*)data;
    int ipos = 0;
    int intArray[3];
    // Get the first token from the string
    char *tok = strtok(dataToParse, ",");
    // Keep going until we run out of tokens
    while (tok) {
        // Don't overflow your target array
        if (ipos < 3) {
            // Convert to integer and store it
            intArray[ipos++] = atoi(tok);
        }
        tok = strtok(NULL, ",");
    }
    
    if (red != intArray[0] || green != intArray[1] || blue != intArray[2]) {
        myRainbowHandler("rainbow", "");
        playSoundHandler("playSound", "");
    }
    
    red = intArray[0];
    green = intArray[1];
    blue = intArray[2];
    b.allLedsOn(red, green, blue);
}

void myRainbowHandler(const char *event, const char *data)
{
  b.allLedsOff();
  delay(500);
  b.ledOn(9, 255, 0, 255); // Magenta
  delay(500);
  b.ledOn(12, 255, 0, 0); // Red
  delay(500);
  b.ledOn(3, 0, 255, 0); // Green
  delay(500);
  b.ledOn(6, 0, 0, 255); // Blue
  delay(500);
  b.rainbow(5);
}

void playSoundHandler(const char *event, const char *data)
{
    b.playNote("C4",2);
}

void myOffHandler(const char *event, const char *data)
{
  b.allLedsOff();
}

void setup() {
    Particle.subscribe("pushcolor", myHandler, MY_DEVICES);
    Particle.subscribe("rainbow", myRainbowHandler, MY_DEVICES);
    Particle.subscribe("alloff", myOffHandler, MY_DEVICES);
    Particle.subscribe("playsound", playSoundHandler, MY_DEVICES);
    Particle.publish("readyforwx", "Initial");
    red = 0; 
    green = 0;
    blue = 0;
    b.begin();
}

void loop() {
    if (!b.allButtonsOff()) {
        Particle.publish("readyforwx", "Refresh");
        delay(1000);
    }
}