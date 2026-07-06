# Project Prompt for Antigravity: Virtual Live Photobooth for Long-Distance Connections

Paste this whole document as your first task/plan prompt in Antigravity. It's written so the agent can generate a task list and implementation plan from it directly. Review the plan artifact before letting it execute.

---

## Project Overview

Build a web application that lets two users in different locations join a shared live session, see each other via webcam in a split-screen view, and capture a synchronized "photobooth" style photo together using a shared countdown. Captured photos should be styled with photobooth-style templates (photo strip, polaroid frame) and be downloadable. The emotional goal: simulate the feeling of being physically together, for long-distance couples/friends.

This is a portfolio/resume project. Prioritize a small number of features working reliably over many features working poorly. Build and verify one milestone at a time — do not skip ahead to later milestones until the current one is verified working in the browser.

## Tech Stack

- **Frontend**: React (Vite), plain CSS or Tailwind
- **Real-time signaling**: Node.js + Socket.io
- **Peer-to-peer media**: WebRTC (use a lightweight wrapper like PeerJS if it simplifies offer/answer/ICE handling; otherwise raw RTCPeerConnection is fine)
- **Pose/segmentation AI**: MediaPipe (Pose Landmarker for pose guidance, Selfie Segmentation for background removal) running client-side via WASM/TF.js — no custom ML training
- **Image compositing**: HTML5 Canvas API
- **No database needed for MVP** — sessions are ephemeral, room-based, no login/accounts

## Architecture Summary

1. A **signaling server** (Node + Socket.io) brokers room joining and relays WebRTC offer/answer/ICE candidates between two clients. It is NOT in the media path — once the WebRTC connection is established, video flows directly peer-to-peer between browsers.
2. The same Socket.io connection is reused as a **sync channel** for non-media events: room join/leave, countdown start, capture trigger, pose-ready status.
3. Each client captures **its own local video frame** to canvas at the synced capture moment — no video frames are sent through the signaling server.
4. AI processing (pose guidance, background segmentation) happens **client-side**, per-user, on the local stream/captured frame — it does not require the other user's data.
5. Final compositing (merging both cutouts onto a shared template/background) can happen client-side using Canvas.

## Build Order — Milestones (build and verify each before moving to the next)

### Milestone 1: Room connection + live split-screen video
- Node + Socket.io signaling server: handle room creation/joining via a shareable room code (e.g. 5-character alphanumeric)
- React client: enter/create a room by code, request camera/mic permission, establish WebRTC peer connection with the other participant in the same room
- Display both video streams side by side (split screen), responsive layout
- Verify: two browser tabs/windows can join the same room code and see each other's live camera feed

### Milestone 2: Synchronized countdown + simultaneous capture
- Add a "Start Countdown" button, visible to both users once both are connected
- When either user clicks it, emit an event through Socket.io so **both clients start an identical 3-2-1 countdown at the same moment** (use a server-relayed start timestamp, not just a local timer, to reduce drift)
- At the end of the countdown, each client independently captures a frame from its own local video element onto a canvas (`ctx.drawImage`)
- Store both captured frames as image data (client-side state is fine for MVP)
- Verify: both users see the same countdown animation in sync, and a frame is captured from each side at the same moment

### Milestone 3: Pose guidance (client-side, independent feature — can be built in parallel with Milestone 2)
- Integrate MediaPipe Pose Landmarker running on the local video stream, client-side only
- Start simple: show a translucent overlay/silhouette guide on the live preview so the user can align themselves (no live detection needed for this part)
- Then add live feedback: compare detected pose keypoints (shoulders, head) against a target pose and visually indicate when the user is well-positioned (e.g. border color change)
- Optional stretch: gate the countdown so it only auto-starts once both users are marked "in position"
- Verify: overlay displays correctly on local video; live pose feedback responds to the user moving in frame

### Milestone 4: AI background removal + template compositing
- On the two captured still frames (not live video), run MediaPipe Selfie Segmentation client-side to extract each person as a cutout with alpha transparency
- Composite both cutouts onto a single chosen background image (start with one fixed theme, e.g. "café") using Canvas — position side by side, roughly scale-matched
- Apply a simple template frame around the result: start with one style (photo strip) with the app's branding/border
- Verify: final composited image shows both people over the shared background, with a template border, viewable in-browser

### Milestone 5: Polish and export
- Add a download button that exports the final composited image (canvas.toDataURL or toBlob) as PNG/JPEG
- Add basic shutter sound effect and countdown tick sound
- Clean up UI/UX: loading states for camera permission, connection status indicator, error handling for camera denial or room-not-found

### Milestone 6 (stretch, only after 1–5 are solid)
- Additional templates (polaroid frame) and background themes (beach, cityscape)
- Stickers/overlays on the final image
- Session history / memory timeline of past captures (would require adding persistence, e.g. localStorage or a simple backend store)

## Non-goals for this build (explicitly out of scope for MVP)

- User accounts / authentication — rooms are anonymous and ephemeral
- Real-time compositing of live video streams — compositing only happens on the captured still frame
- Photorealistic merging of two different real backgrounds into one 3D-consistent scene — use a single fixed background theme per session instead
- Mobile native app — web only, but should be responsive/usable on mobile browsers

## Immediate first task

Start with Milestone 1 only. Generate a task list and implementation plan for:
1. Scaffolding the Node + Socket.io signaling server
2. Scaffolding the React (Vite) client
3. Implementing room code creation/joining
4. Implementing the WebRTC peer connection and split-screen video display

Do not proceed to Milestone 2 until Milestone 1 is verified working with two simultaneous browser sessions.
