---
title: "Musical Sensors"
date: 2018-10-25
publishDate: 2018-10-25
archives: "2018"
tags: ["python", "science"]
---
Vibrating cantilevers has a long history of being used as sensors, but almost always in the micro-domain. The cantilever is frequently etched into silicon or other substrate. The weight of even single molecules can be measured or detected.

The idea is fairly simple. Change the distribution of weight on the cantilever, and the frequency of vibration will change.

It can even be used as a motion detector since acceleration in the same plane as the natural vibration will either start the cantilever vibrating or will change the frequency of the vibration.

A research group at the University of California, Riverside was attempting to find a cheap, easy way to detect counterfeit or adulterated medicines.

Adulterated medicines will almost always have a difference density to the "real" product. So, if a fixed volume is tested, then the weight will be different. Cantilevers based sensors can be very sensitive to such changes.

But what could be used to create the cantilevers?

The mbira is musical instrument that uses cantilevers to produce tones (similar to a music box). This became the inspiration for the paper [Musical Instruments as Sensors](https://pubs.acs.org/doi/10.1021/acsomega.8b01673)

Of course, there is also the need to capture the frequency and compare to a standard. Since the mbira produces tones in the audible range, why not use the recording capabilities of a smartphone?

The researchers [created a site](http://mbira.groverlab.org/) which allows a user to upload recordings and have them analyzed. According to the paper, the analysis software is written (at least in part) in python.

#### Bibilography.

[Another writeup](https://www.sciencedaily.com/releases/2018/09/180912111833.htm)

[Github for the Grover Lab](https://github.com/groverlab)

