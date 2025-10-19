# Animation Placeholders

This folder contains minimal placeholder Lottie JSON files for the pet care application.

## Files Included

- `loader.json` - Loading spinner animation
- `radar.json` - Radar sweep animation for pet tracking
- `pawMarker.json` - Animated paw print marker
- `aiScan.json` - AI scanning line animation
- `typingDots.json` - Typing indicator dots
- `pawConfetti.json` - Celebration confetti with paw prints

## Replacing Placeholders

To replace these minimal placeholders with professional Lottie animations:

1. Visit sites like [LottieFiles](https://lottiefiles.com/) or create custom animations
2. Search for animations using these recommended keywords:
   - **"paw"** - for paw-related animations
   - **"animal radar"** - for pet tracking/location features
   - **"loading paw"** - for loading animations with pet themes
   - **"typing dots"** - for chat/messaging indicators
   - **"checkmark success"** - for success states
   - **"confetti"** - for celebration animations

3. Download the JSON file and replace the corresponding placeholder
4. Ensure the filename matches exactly for seamless integration

## Performance Notes

- **Prefer smaller/simpler JSONs** - Complex animations can impact performance
- **Fallback strategy**: If Lottie files are too large (>50KB), consider using SVG animations or CSS keyframes instead
- **Test on mobile devices** - Ensure smooth playback on lower-end devices
- **Consider lazy loading** - Load animations only when needed to improve initial page load

## Usage in Code

Import animations using the `lottie-react` library:

```javascript
import Lottie from 'lottie-react';
import loaderAnimation from '/public/animations/loader.json';

<Lottie animationData={loaderAnimation} loop={true} />
```

