---
title: "Building a writerdeck"
tags: ["electronics", "random", "technical"]
date: 2026/09/27
description: A few months ago, I randomly bumped into this post about someone setting up a "writerdeck" to focus on their writing. The idea really intrigued me because at the time, I was, and still am, suffering from constant distraction, and my writing frequency was dropping harder than the stock market.
---

A few months ago, I randomly bumped into [this post][4] about someone setting up
a "writerdeck" to focus on their writing. The idea really intrigued me because
at the time, I was, and still am, suffering from constant distraction, and my
writing frequency was dropping harder than the stock market.

If you haven't heard of [writerdecks][5] before, they are essentially single
purpose devices dedicated to writing. Often this mean very limited hardware and
software to keep the device minimal and distraction-free. People have been using
old laptops, Kindles, or anything that can put characters on a blank screen,
except for pen and paper. There's a whole community for this kind of device, and
they gather around a subreddit called [/r/writerdeck][1]. Their solution to the
age of distraction was to lock themselves into an environment where there's
nothing else to do but write. Whether this actually works or not, there was only
one way for me to find out.

## Why build?

I first looked into commercially available devices advertised on
[/r/writerdeck][1] just in case I could just throw money at the problem & get
something cheap. But they usually cost around ~$250 - $900+ (USD). And they all
came with their own keyboard. Only [BYOK][2] is a reasonable device at $199. But
they use LCD rather than E-ink. Not a big deal, although I quite like to reduce
my blue-light exposure so I decided to make something simple for myself.

![](demo2.jpg)

## Screen size

Screen size of a writer deck can vary a lot for different purposes. Some prefer
a small horizontal screen to keep the content short and easy to follow, others
prefer a taller screen for screenplays. There's really no size fit all.

![](writerdecks.jpg) _Source: [writerdeck.org][5]_

I write short stories & blog, so vertical space doesn't give me that much
benefit. It actually makes writing harder because I kept coming back to edit
what I just wrote. So in end, I went with a [5.79" e-ink display][6] that was
intended for price tags in supermarkets. It's a simple board with ESP32 S3,
black & white (no grayscale) e-ink. It've got bluetooth & wifi built in;
powerful enough to handle my sporadic writing sessions.

![](simple.jpg)

## The case

Part of the reason why I decided on that board was because everything is already
soldered on one board. The display is hooked to the ESP32 S3 chip and battery
charging is handled via USB-C so I could just write my own firmware for it and
don't have to worry about soldering a bunch of electronic parts just to get the
screen going.

But in the end, I still had to get a LiPo battery from Aliexpress which costed
me around $7. The battery has an SH1.25 connector, which was different from the
SH1 connector on the board, so I ended up buying a whole bag SH1.25 connectors
too.

The structure of the board is quite simple. There are 3 main layers:

- The board on top with the display.
- The middle plate with cut out holes for the protruding components.
- The backplate which is a plain flat piece of plastic screwed onto the board.

Luckily, the board came with a detailed 3D design file. All I had to do was open
up the design in FreeCAD, watch a few youtube videos to learn how to extract the
backplate as an .obj file, and import it in KiCAD (since it's simpler to learn).

![](3d_shell.png)

I decided to swap out the backplate for a custom 3D-printed case that can be
used to also hold the battery. The rest of the work is to convince a friend with
a 3D printer to print out my case (shoutout to Alan if he's reading).

![](shell.jpg)

## Display driver

This is the hardest part of the whole building process.

The board came with some sample code written in C using Arduino IDE. But I don't
know C and I also hated how slow Arduino IDE takes to compile my program. So I
had no choice but to write the firmware in Rust.

Except there was no driver for this display in Rust. There was one library, but
it's for a different hardware and initially didn't work on my display at all. So
I forked it, and threw Claude into the deep end.

After a few nights burning tokens, we came out with working code, and even
comments explaining how the driver works....in Mandarin. I used to think vibe
coding is not really a problem if I can read the code and understand but this
time I truly have no idea. I cannot claim any credit for this work. I was in
fact, burning credit for this work:) How I wonder what the world would look like
when what I was doing get normalised one day.

Anyway, with the code all compiling, I flashed it on the board and oh my god it
worked!??!?!

![](first_rendering.jpg)

I tried rendering all kind of things for a few nights, but there was always this
weird missing column at the middle of the screen. Claude was thinking in circles
and couldn't figure it out why.

![](missing_column.jpg)

So I ventured out to the Internet and found this [blog post][3], which pointed
out that there are two smaller e-ink screens underneath. There is a master
screen and a slave screen, and they share the same pixel column in the middle so
all I needed to do was to send the same byte for 2 chips. Everything then worked
perfectly.

## Bluetooth

There are two kind of bluetooth: Bluetooth Classic and Bluetooth Low Energy
(BLE). The difference between them is that Bluetooth Classic maintain the
connection at all time, draining battery quicker, whereas BLE alternate between
sleep & wake, therefore is more energy efficient.

To connect to bluetooth keyboards, I went with the BLE implementation. Typing
isn't a continuous thing so most of the time the bluetooth connection can stay
asleep until a burst of keystrokes arrived. And also ESP32 only support BLE :P

But the main pain is really from the pairing method. With BLE, you've got the
legacy pairing and secure connection pairing, which come after legacy pairing. I
still don't know if my HHKB actually do secure connection pairing or not, but
right now, only legacy pairing seemed to work for me.

The problem is `esp-radio`, which is the library for interfacing with Bluetooth
& Wifi on ESP32, only support modern secure connection pairing so I had to
combine that with `trouble-host` which have some dependency conflicts with
`esp-radio` and in the end, I had to fork the entire esp-hal repo to customise
it for my firmware. I won't bore you with the details but just a warning that if
you going down the same road, you'll get the same pothole.

## Battery

A few days later, the writerdeck worked great. It got bluetooth talking to my
HHKB. It also show my writings on the display, and used a microSD card to store
them. I was pretty happy with how things turned out. However, I didn't want to
have my writerdeck always connected to my laptop for power. I had to connect the
battery to the board! So I soldered a new battery connector to the board, and
accidentally recreated the Chernobyl elephant foot.

![](bad_soldering.jpg)

The idea was pretty simple: I was going to monkey patch the new SH1.25 connector
to the back of the existing SH1 connector on the board. But the tiny joints were
a massive pain to work with, plus I burnt off a big chunk of the SH1 connector
so I ended up just removing it completely for easier soldering.

Things looked pretty good after that:

![](good_soldering.jpg)

However, while the board does support charging, it had no component that can
measure the current battery level. After a bit of research I found out that you
can just measure the voltage that the battery gives off to estimate how much
power it still has.

The trick is that electricity flows from positive, through to ground. But before
it does that, we put it through a GPIO port so it can read the voltage from the
battery.

```
┌───────┐              
│  BAT  │              
└───┬───┘              
    │       ┌───────┐  
    ├───────┤ GPIO  │  
    │       └───────┘  
┌───┴───┐              
│  GND  │              
└───────┘
```

Because there's no resistance from ground, electricity just flows straight to
ground, skipping GPIO, so we have to add a resistor between GPIO and ground.

```
┌───────┐              
│  BAT  │              
└───┬───┘              
    │                  
    │       ┌───────┐  
    ├───────┤ GPIO  │  
┌───┴────┐  └───────┘  
│ 100 kΩ │             
└───┬────┘             
    │                  
┌───┴───┐              
│  GND  │              
└───────┘
```

And because the GPIO can't take high voltage from the battery (ESP32 ADC have an
input range from 0 - 3.3V), we have to put another resistor between the battery
and GPIO.

```
┌───────┐              
│  BAT  │              
└───┬───┘              
    │                  
┌───┴────┐             
│ 100 kΩ │             
└───┬────┘  ┌───────┐  
    ├───────┤ GPIO  │  
┌───┴────┐  └───────┘  
│ 100 kΩ │             
└───┬────┘             
    │                  
┌───┴───┐              
│  GND  │              
└───────┘
```

Knowing the value of these two resistors, we can calculate the voltage level
using the formula:

```
V(out) = V(in) * (R2 / (R1 + R2))
```

where:

- `V(in)` is the battery voltage
- `V(out)` is what GPIO received
- `R1` & `R2` are the resistors

or simplify that when we know R1 = R2:

```
V(out) = V(in) / 2
```

Using the voltage values that LiPo batteries typically give out, we can map
V(in) to the % of the battery. But of course, since this is not a linear graph,
we can only proximate the percentage.

![](lipo_voltage.jpg) _Source: [appbattery.com][7]_

Overall, this is a simple voltage divider circuit. After a few minutes of
soldering, I got myself some battery percentage showing on the screen!

<p>

![](battery_circuit.jpg)

</p>

![](battery.jpg)

## That's it

That's pretty much what it takes to build a writerdeck. As a weekend project,
I'd give it a 9/10; not too difficult and I still learnt plenty of things. What
mattered more is that I can actually see this device being a part of my life. It
wasn't some side-project that get finished & tossed away. I'd definitely bring
this along when I'm out writing at cafes or travel to other countries (hopefully
TSA doesn't have a problem with my
DIY-writerdeck-that-is-not-a-bomb-but-can-potentially-be).

![](savescreen.jpg) _It show a save screen while sleeping to save power_

Overall, I'm really pleased with how out things worked out. The device works
great (this post was drafted on it) despite the display taking ~400ms to update
on each keystroke. But I don't really consider that a problem. It somehow feels
a bit like writing by hand. When I'm writing with a pen, my hand often can't
keep up with my thoughts, so I ended up thinking the same thought two or three
times. Sometimes that's frustrating, but sometimes it also reveals little things
that I'd missed if I hadn't slowed down.

[1]: https://www.reddit.com/r/writerDeck/
[2]: https://byok.io/
[3]: https://bukys.eu/blog/250105_my_love-hate_relationship_with_the_elecrow_crowpanel_5.79_e-paper_display
[4]: https://veronicaexplains.net/my-first-writerdeck/
[5]: https://www.writerdeck.org/
[6]: https://www.elecrow.com/crowpanel-esp32-5-79-e-paper-hmi-display-with-272-792-resolution-black-white-color-driven-by-spi-interface.html
[7]: https://appbattery.com/faq/ultimate-guide-to-lifepo4-voltage-chart/
