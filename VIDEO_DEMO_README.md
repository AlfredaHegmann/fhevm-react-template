# 🎥 Demo Video Reference

**Filename**: `demo.mp4`
**Location**: Root directory of repository
**Duration**: 5-7 minutes
**Purpose**: Demonstrate FHEVM SDK setup, usage, and design choices

---

## 📝 What to Record

### 1. Introduction (30 seconds)
- Show the problem: Complex FHEVM setup
- Display current approach with 50+ lines of code
- Highlight multiple dependencies in package.json

### 2. SDK Solution (45 seconds)
- Show one-line installation: `npm install @fhevm/sdk`
- Demonstrate quick start code (< 5 lines)
- Run code and show encryption happening

### 3. React Integration (60 seconds)
- Open React component with `useFhevm` hook
- Show live hot reload in browser
- Demonstrate encryption in real-time
- Console logs showing encrypted values

### 4. Node.js Backend (45 seconds)
- Terminal showing Node.js script
- Server encrypting data
- API responses with encrypted values

### 5. Real-World Example (90 seconds)
**Private Freight Bidding Platform**
- Visit: https://private-freight-bidding.vercel.app/
- Create a job (Los Angeles → New York)
- Submit encrypted bid ($12,000)
- Show encrypted value on blockchain
- Award job and decrypt via Gateway

### 6. Design Decisions (60 seconds)
- Show architecture diagram
- Explain framework-agnostic core
- Highlight wagmi-like API
- Compare with current approach

### 7. Features (60 seconds)
- Auto-type detection
- Error handling
- Network configuration
- Utilities showcase

### 8. Comparison (45 seconds)
- Split-screen: Before vs. After
- Comparison table
- Metrics visualization

### 9. Judging Criteria (45 seconds)
- Checklist animation
- Show compliance with all criteria
- Green checkmarks appearing

### 10. Call to Action (30 seconds)
- GitHub repo
- npm package
- Live demo link
- Documentation links

---

## 🎬 Recording Tips

### Screen Setup
```
Resolution: 1920x1080
Font Size: 16-18pt (readable)
Terminal: Dark theme with syntax highlighting
Browser: Chrome DevTools open (show Network tab)
```

### Tools
- **Screen Recording**: OBS Studio or Loom
- **Audio**: Clear microphone, no background noise
- **Music**: Subtle background music (low volume)
- **Effects**: Smooth transitions, animated highlights

### Code Examples to Show

**Quick Start**:
```typescript
import { quickStart } from '@fhevm/sdk';

const fhevm = await quickStart(8009);
const encrypted = await fhevm.encrypt64(1000);
```

**React Hook**:
```typescript
const { fhevm, isReady } = useFhevm({ chainId: 8009 });
const { encrypt } = useEncrypt(fhevm);
```

**Node.js**:
```typescript
const fhevm = await quickStart(8009);
app.post('/encrypt', async (req, res) => {
  const encrypted = await fhevm.encrypt64(req.body.value);
  res.json({ encrypted });
});
```

---

## 🗣️ Narration Script

See [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) for complete scene-by-scene narration.

---

## ✅ Checklist Before Recording

- [ ] All code examples tested and working
- [ ] Live demo accessible at URL
- [ ] Screen resolution set to 1920x1080
- [ ] Font size increased for readability
- [ ] Browser DevTools configured
- [ ] Terminal theme set to dark with syntax highlighting
- [ ] Microphone tested (clear audio)
- [ ] Background music selected (optional)
- [ ] Demo script reviewed
- [ ] Timing practiced (5-7 minutes)

---

## 📤 After Recording

### Export Settings
```
Format: MP4 (H.264)
Resolution: 1920x1080
Frame Rate: 30 FPS
Bitrate: 8-10 Mbps
Audio: AAC, 192 kbps
File Size: < 500 MB
```

### Final Steps
1. Export video as `demo.mp4`
2. Place in root directory of repository
3. Test playback (ensure audio/video sync)
4. Upload to GitHub repository
5. Verify file is accessible

---

## 🎯 Key Messages to Convey

1. **Simplicity**: < 5 lines to start
2. **Completeness**: Full FHEVM workflow
3. **Flexibility**: Works in React, Vue, Next.js, Node.js
4. **Familiar**: Wagmi-like API
5. **Production-Ready**: Real-world example deployed

---

## 📊 Visual Assets to Include

- Architecture diagram (layers)
- Comparison table (Before vs. After)
- Feature checklist (animated checkmarks)
- Code snippets (syntax highlighted)
- Terminal output (with colors)
- Browser console (showing encrypted data)
- Network tab (showing blockchain transactions)

---

## ⏱️ Timing Guide

```
0:00 - 0:30   Introduction (The Problem)
0:30 - 1:15   The Solution (< 5 lines)
1:15 - 2:15   React Integration
2:15 - 3:00   Node.js Backend
3:00 - 4:30   Real-World Example (Freight Bidding)
4:30 - 5:30   Design Decisions
5:30 - 6:15   Features & Comparison
6:15 - 7:00   Judging Criteria
7:00 - 7:30   Call to Action
```

Total: 7 minutes 30 seconds (target: 5-7 minutes)

---

## 🔗 Links to Show

- **GitHub**: https://github.com/AlfredaHegmann/fhevm-react-template
- **Live Demo**: https://private-freight-bidding.vercel.app/
- **Contract**: https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
- **Zama Docs**: https://docs.zama.ai/fhevm

---

## 📝 Post-Production

If time permits, add:
- Chapter markers
- Captions/subtitles
- On-screen annotations
- Highlight boxes around code
- Zoom effects for important details

---

**Good luck with the recording!** 🎬✨

The key is to show how the SDK makes FHEVM development as simple as web3 development - from 50+ lines down to < 5 lines.
