# QA Checklist — Glow Up App

## How to Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome or Firefox. A webcam is required for camera features.

---

## Manual Test Checklist

### 1. App Layout and Theme

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 1.1 | Dark theme renders | Open the app | Dark background (#0f0f0f), white text, purple/pink accents | |
| 1.2 | Header branding | Check header bar | "Glow Up" in gradient text, subtitle "Real-time beauty enhancement" | |
| 1.3 | Sidebar layout | Check right panel | 300px sidebar with dark secondary background, scrollable | |
| 1.4 | Responsive layout | Resize browser below 900px | Camera stacks on top, controls below, sidebar goes full-width | |
| 1.5 | Custom scrollbar | Scroll the sidebar | Thin dark scrollbar matching the theme | |
| 1.6 | Slider styling | Check any range slider | Purple thumb, dark track, thumb scales on hover | |
| 1.7 | Button styling | Check toggle buttons | Gradient background when ON, dark background when OFF | |

### 2. Camera Feed

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 2.1 | Idle state | Load app without starting camera | "Press Start Camera to begin" message in dark box | |
| 2.2 | Start camera | Click "Start Camera" | Camera feed appears, button changes to "Stop Camera" | |
| 2.3 | Stop camera | Click "Stop Camera" | Feed stops, returns to idle state | |
| 2.4 | Camera denied | Deny camera permission | User-friendly error message about permissions | |
| 2.5 | No camera | Test on device without webcam | "No camera was found" error message | |
| 2.6 | Video rounded corners | Start camera | Video has rounded corners matching theme | |

### 3. Face Detection

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 3.1 | Model loading | Start camera, watch status badge | "Loading model..." then "Detecting..." status pill in top-left | |
| 3.2 | FPS counter | Start camera, wait for detection | Green FPS badge in top-right, showing ~15-30 FPS | |
| 3.3 | Show landmarks | Click "Show Landmarks" | Color-coded dots on face (cyan=eyes, magenta=brows, red=lips, etc.) | |
| 3.4 | Hide landmarks | Click "Hide Landmarks" | Dots disappear, other effects remain visible | |
| 3.5 | No face | Point camera away from face | Effects stop rendering, no errors in console | |
| 3.6 | Face returns | Point camera back at face | Effects resume rendering | |

### 4. Makeup Controls

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 4.1 | Eyeshadow toggle | Toggle eyeshadow ON | Colored gradient fill between upper eyelid and brow | |
| 4.2 | Eyeshadow color | Change eyeshadow color picker | Shadow color updates in real time | |
| 4.3 | Eyeshadow opacity | Adjust opacity slider | Effect becomes more/less visible | |
| 4.4 | Eyeliner toggle | Toggle eyeliner ON | Line along upper eyelid with tapered thickness | |
| 4.5 | Eyeliner wing | Increase wing length | Visible wing extension at outer corner | |
| 4.6 | Lashes toggle | Toggle lashes ON | Short strokes extending upward from upper eyelid | |
| 4.7 | Lashes density | Increase density slider | More lash strokes appear | |
| 4.8 | Lashes curl | Increase curl slider | Lash strokes curve more | |
| 4.9 | Eyebrows toggle | Toggle eyebrows ON | Brow fill with soft shadow | |
| 4.10 | Eyebrows thickness | Adjust thickness slider | Brows appear thicker or thinner | |
| 4.11 | All makeup combined | Enable all four effects | All render without conflict or flickering | |

### 5. Skin Controls

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 5.1 | Brightness positive | Toggle brightness ON, slide right | Face area brightens with white overlay | |
| 5.2 | Brightness negative | Slide brightness left | Face area darkens | |
| 5.3 | Warmth positive | Toggle warmth ON, slide right | Warm orange tint on face | |
| 5.4 | Warmth negative | Slide warmth left | Cool blue tint on face | |
| 5.5 | Glow toggle | Toggle glow ON | Soft bloom/radiance on face area | |
| 5.6 | Skin + makeup combined | Enable skin brightness + eyeshadow | Both effects visible simultaneously | |

### 6. Liquify Controls

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 6.1 | Lip fullness toggle | Toggle lip fullness ON | Lips appear slightly fuller | |
| 6.2 | Intensity slider | Increase intensity | Fuller lip effect increases | |
| 6.3 | Radius slider | Adjust radius | Effect area around lips changes | |
| 6.4 | Liquify + makeup | Enable liquify + eyeliner | Both effects render without conflict | |

### 7. Hair Controls

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 7.1 | Hair color toggle | Toggle hair color ON | Color overlay on estimated hair region | |
| 7.2 | Color picker | Change hair color | Overlay color updates | |
| 7.3 | Opacity slider | Adjust opacity | Color intensity changes | |
| 7.4 | Blend modes | Try multiply, screen, hue, color | Different blending effects visible | |
| 7.5 | Texture smooth | Toggle texture ON, select "smooth" | Hair region slightly blurred | |
| 7.6 | Texture wavy | Select "wavy" | Subtle wave displacement pattern | |
| 7.7 | Texture curly | Select "curly" | Tighter displacement pattern | |

### 8. Performance and Stability

| # | Test | Steps | Expected | Pass/Fail |
|---|------|-------|----------|-----------|
| 8.1 | No console errors | Open DevTools console, use all features | No errors or React warnings | |
| 8.2 | FPS stability | Enable multiple effects, watch FPS | FPS stays above 10 with all effects on | |
| 8.3 | Memory stability | Run for 2+ minutes with effects on | No memory growth in DevTools Performance tab | |
| 8.4 | Start/stop cycle | Start camera, stop, start again | Clean restart, no artifacts or stale state | |
| 8.5 | Rapid toggling | Quickly toggle effects on/off | No crashes, glitches, or console errors | |

---

## Common Issues and Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Camera shows black | Browser blocked camera | Check browser URL bar for camera permission icon |
| "Loading model..." stays forever | CDN blocked or slow connection | Check network tab; MediaPipe loads from jsdelivr CDN |
| Low FPS (<10) | Too many effects + weak GPU | Disable some effects; WebGL backend needs decent GPU |
| Effects don't show on face | Face not fully visible | Ensure full face is in frame, well-lit, facing camera |
| Hair color outside hair | Hair region is estimated from forehead | Expected limitation; works best with hair above forehead |
| Skin smoothing not visible | Smoothing reads from overlay canvas | Brightness and warmth are more visible; smoothing is subtle |
| Build warning about FaceMesh | MediaPipe export mismatch | Pre-existing; does not affect functionality |
| Chunk size warning | TensorFlow.js is large | Expected; can code-split in Phase 4 if needed |
