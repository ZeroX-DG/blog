---
title: Basic hand recognition
tags: [computer vision, basic]
description: One of my first projects with computer vision was a hand recognition system. This article explains how I developed a hand recognition system without any pior knowledge about computer vision.
---

One of my first projects with computer vision was a hand recognition system. The funny thing is I've just finished it last week and about to give a presentation about it next Tuesday. My mark for HCI (Human computer interaction) class is depending on it.

So, how did I confident enough to develop a hand recognition system without any pior knowledge about computer vision?

Well...I'm just being stupid, I guess.

## What did I used for this project?
Well, I started with an empty head, which means I have no idea what project to do for HCI and one of my friend Eden suggested that we should make a hand recognition system with Kinect.

The most "cutting edge" technology device that we get to work on during our HCI class was a temperature sensor so I was pretty surprised when he mentioned the Microsoft Kinect.

Anyway, turns out my school has a XBox One Kinect in the cupboard at the corner of the class room. For a kid who love interactive stuff like me, this is like a heaven. I never get to use a Kinect before, let alone working with it.

I started to do some reasearch about hand recognition stuff and it's seem that most people used OpenCV. However, OpenCV was developed for C++, I combined Kinect with Unity so a C# solution is something that I was looking for. Luckly, by the 2nd day I found out about EmguCV which is basically OpenCV but for C#.

So, by 3rd day, I collected enough information to start the project:

- **Kinect** for taking image from the user
- **Unity** for rendering the image from Kinect and result of hand recognition
- **EmguCV** for performing hand recognition

## Getting user input
We can't recognize a hand without seeing. So the first step is to get the image of the user hand from the camera, in this case, it's the Kinect color camera.

However, after playing with Kinect color camera, I learned that Kinect also provide something called "depth map" which basically means a list of numbers represent the distance between the Kinect and objects located in front of it. By using the "depth map" we can easily extract the hand of the user from everything else in the background. This step is usually called *background extraction*.

### But how?
The answer is, instead of looking the depth map as a list of distance, look at it as a list of black and white pixel.

Let's say when the user use the app, their hands will certainly be the closest things to the Kinect. That means we can translate the closest distance point into white color and everything else into black color. And this is what we got:

<!-- INSERT IMAGE HERE -->

## Perform hand recognition
After we obtained the hand image, the next step is to perform hand recognition to detect and get information about the hand in the image.

The process for performing hand recognition include these steps:

1. Find contours
2. Find convex hulls
3. Find convexity defects
4. Extract information about finger tips

### 1. Find contours
So what's a contour?

Grab a piece of paper, put you hand on top and start drawing your hand on the paper by having a pencil moving around your hand and fingers. Take your hand away and we have a contour.

Simply, a contour is the outline of your hand.

<!-- INSERT IMAGE HERE -->

To find the contours, all we have to do is to call the function `CvInvoke.FindContours` from EmguCV and a `VectorOfVectorOfPoint` will be returned to you.

> `VectorOfVectorOfPoint` basically means a list of list of points or a 2D list of points

So, how did emguCV/OpenCV do this? Too late, there's already a guy asking that on stackoverflow :rolling_on_the_floor_laughing:

Summary for lazy people, the question is [here](rolling_on_the_floor_laughing) and it said EmguCV/OpenCV implements the algorithm of:

> Suzuki, S. and Abe, K., Topological Structural Analysis of Digitized Binary Images by Border Following. CVGIP 30 1, pp 32-46 (1985)

However, the paper is bebind a pay wall now so instead of reading about that, there's a [website](http://www.imageprocessingplace.com/downloads_V3/root_downloads/tutorials/contour_tracing_Abeer_George_Ghuneim/alg.html) dedicated for contour finding algorithms that you can read.

Anyway, after getting a 2D list of points represent the contours, we can loop through that list and take out the contour that we need. The current 2D list that we get in the previous step contains a list of contours that it found but we only interested in the contour of the user hand which is the biggest one so a simple filter is good enough.

```csharp
public VectorOfVectorOfPoint filterHandContour(VectorOfVectorOfPoint contours) {
  int contCount = contours.Size;
  int minContourSize = 3000;
  int maxContourSize = 9000;
  for (int i = 0; i < contCount; i++) {
    using(VectorOfPoint contour = contours[i]) {
      double contourSize = CvInvoke.ContourArea(contour);
      if (contourSize >= minContourSize && contourSize <= maxContourSize) {
        result.Push(contour);
      }
    }
  }
  return result;
}
```

In the code above, we filtered all the contours with the size less than `3000` or bigger than `9000` which can be the body of the user instead of their hands.

### 2. Find the convex hulls
Imagine there's a sets of points, let's call it set `A`, the convex hull is the set of points created by selecting points from set `A` in a way that when you draw lines to connect all the selected points, it will create a fence to surround all the other points in set `A`.

![](/assets/imgs/ConvexHull.png)
