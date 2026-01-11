# Sunroof Roadmap

> A "delayed camera" time capsule app for capturing memories during journeys.

## 📱 Current Features (v1.0.0)

### Core Functionality

- ✅ **Journeys** — Create journeys with name, destination, emoji, cover image, and unlock date
- ✅ **Photo Capture** — Take photos with native camera or import from gallery
- ✅ **Video Recording** — Record short video clips
- ✅ **Audio Memos** — Record voice memos up to 5 minutes
- ✅ **Text Notes** — Write notes with contextual prompts
- ✅ **Time Capsule Lock** — Memories stay locked until the journey unlock date
- ✅ **Memory Vault** — Browse and relive unlocked journey memories

### Context & Metadata

- ✅ **Location Capture** — Automatically capture location with memories (optional)
- ✅ **Weather Data** — Save weather conditions with each memory (optional)
- ✅ **Memory Tags** — Add tags to organize memories
- ✅ **Cover Images** — Unsplash integration for journey covers

### Collaboration

- ✅ **Invite Collaborators** — Invite others via email to contribute to shared journeys
- ✅ **Email Notifications** — Resend integration for invite emails

### AI Features

- ✅ **AI Recap** — Generate AI-powered journey summaries using OpenAI
- ✅ **Highlights Extraction** — AI identifies key moments from your notes

### Security & Settings

- ✅ **Google OAuth** — Sign in with Google
- ✅ **Magic Links** — Email-based passwordless auth
- ✅ **Biometric Lock** — Face ID / Touch ID for vault access
- ✅ **Push Notifications** — Journey unlock reminders and daily capture prompts
- ✅ **Data Export** — Export all your data as JSON
- ✅ **Account Deletion** — Full GDPR-compliant account deletion
- ✅ **Temperature Units** — Fahrenheit/Celsius preference
- ✅ **Privacy Controls** — Toggle location and weather capture

### Technical

- ✅ **Offline Support** — Capture memories offline, auto-sync when back online
- ✅ **Local Caching** — Journey data cached for instant loading
- ✅ **Background Sync** — Pending uploads sync automatically

---

## 🚀 Milestones

### v1.0.1 — Polish & Stability

_Target: 1-2 weeks_

- [ ] Commit current lint fixes and cleanup
- [ ] Test full journey lifecycle on device (create → capture → unlock → view)
- [ ] Verify collaborator invite flow end-to-end
- [ ] Test AI recap generation with real data
- [ ] Test offline capture → online sync flow
- [ ] 7 days crash-free on TestFlight
- [ ] Deploy `sunroof-app` marketing site (Privacy/Terms URLs for App Store)

### v1.1.0 — App Store Launch

_Target: 2-4 weeks after v1.0.1_

- [ ] App Store Connect metadata (description, keywords, screenshots)
- [ ] App Store screenshots for 6.7" and 6.5" iPhones
- [ ] App icon (1024x1024) uploaded
- [ ] Privacy labels filled out
- [ ] Review Guidelines compliance check
- [ ] Submit for App Store review
- [ ] Respond to any review feedback

---

## 💡 Future Feature Ideas

### v1.2 — Enhanced Viewing Experience

| Feature             | Description                                           | Priority |
| ------------------- | ----------------------------------------------------- | -------- |
| **Slideshow Mode**  | Auto-play through memories with transitions and music | Medium   |
| **Memory Filters**  | Filter by type (photo/video/audio/note) in gallery    | Medium   |
| **Search Memories** | Search notes and tags within a journey                | Low      |
| **Map View**        | View memories on a map by location                    | Medium   |

### v1.3 — Social & Sharing

| Feature                       | Description                                              | Priority |
| ----------------------------- | -------------------------------------------------------- | -------- |
| **Share to Social**           | Export individual memories or recap to Instagram/Stories | Medium   |
| **Journey Sharing Link**      | Generate shareable link for collaborators                | High     |
| **Viewer-Only Collaborators** | Invite people who can view but not add memories          | Low      |

### v1.4 — Content Enhancements

| Feature              | Description                              | Priority |
| -------------------- | ---------------------------------------- | -------- |
| **Photo Editing**    | Basic filters and cropping before saving | Low      |
| **Video Trimming**   | Trim videos after recording              | Low      |
| **Rich Text Notes**  | Bold, italic, headers in notes           | Low      |
| **Memory Reactions** | React to memories with emoji             | Low      |

### v1.5 — Advanced AI

| Feature                   | Description                                             | Priority |
| ------------------------- | ------------------------------------------------------- | -------- |
| **Auto-Generated Titles** | AI suggests journey name from first few memories        | Low      |
| **Memory Grouping**       | AI groups related memories (same location, time of day) | Low      |
| **Mood Analysis**         | AI detects overall mood/sentiment of journey            | Low      |
| **Photo Descriptions**    | AI generates alt-text/descriptions for photos           | Medium   |

### v2.0 — Premium Features (Future)

| Feature                    | Description                                 | Priority |
| -------------------------- | ------------------------------------------- | -------- |
| **Longer Audio Memos**     | 15+ minute recordings                       | Low      |
| **Video Length Extension** | Longer video clips                          | Low      |
| **Unlimited Journeys**     | Remove 3 active journey limit               | Low      |
| **Cloud Backup**           | Full backup/restore across devices          | Medium   |
| **Widget**                 | iOS widget showing countdown to next unlock | Medium   |

---

## 🐛 Known Issues & Tech Debt

| Issue                                                        | Status              |
| ------------------------------------------------------------ | ------------------- |
| Module-level cache prevents test isolation in location tests | Skipped test        |
| Sound type from react-native-nitro-sound needs manual typing | Workaround in place |

---

## 📊 Metrics to Track

- Daily Active Users (DAU)
- Journeys created per user
- Memories per journey (avg)
- Journey completion rate (% that reach unlock date)
- AI recap generation rate
- Collaborator invites sent vs accepted
- Crash-free rate

---

## 🔧 Development Workflow

1. **Local Development** → `npm start` + `npm run ios`
2. **Device Testing** → `npx react-native run-ios --device`
3. **Quality Checks** → `npm run typecheck && npm run lint && npm run test`
4. **Push to GitHub** → `git push origin main`
5. **TestFlight Build** → Xcode Archive → Distribute → App Store Connect
6. **App Store** → Submit for review when stable

---

## 📝 Version History

| Version | Build | Date | Notes                      |
| ------- | ----- | ---- | -------------------------- |
| 1.0.0   | 1     | -    | Initial TestFlight release |
| 1.0.0   | 2     | -    | Current TestFlight build   |
| 1.0.0   | 3     | TBD  | Lint fixes + stability     |
