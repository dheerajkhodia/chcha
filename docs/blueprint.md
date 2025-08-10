# **App Name**: SynchWatch

## Core Features:

- Room Link Generation: Generate a unique room link when the host clicks 'Create Room'.
- Video URL Input: Accept direct video URLs for playback.
- Mobile Video Player: Render HTML5 video player with mobile-friendly controls.
- Playback Synchronization: Use Socket.io to synchronize video playback across all viewers in a room based on the host's actions.
- Real-Time Chat: Implement a real-time chat panel to facilitate user conversations during video playback. The panel should appear beside the video on desktop and below on mobile. Optional: Toggle to enable chat overlay inside video.
- Anonymous Username: Users are assigned a random name if they leave the username field blank.
- Content Recommendation: AI tool generates personalized suggestions for what to watch, displayed only after everyone has opted-in to see recommendations.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to provide a calm and focused viewing experience.
- Background color: Light gray (#F5F5F5) for a clean and unobtrusive backdrop.
- Accent color: Electric purple (#BF5FFF) for highlights, buttons, and interactive elements.
- Body and headline font: 'PT Sans' (sans-serif) for clear readability and modern look.
- Mobile-first design: Video on top, chat below; desktop: video on left, chat on right.
- Use clean, minimalist icons for video controls and chat functions.
- Subtle animations and transitions for play/pause actions and chat messages.