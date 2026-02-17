# Week 3 Screenshot & Evidence Collection Guide

**Purpose**: Provide step-by-step instructions for capturing all required screenshots for Week 3 submission.

---

## 📸 Screenshot Requirements Summary

| Item | Type | File Name | Resolution | Key Elements |
|------|------|-----------|-----------|--------------|
| **1. ClickUp Board** | PNG | `week3-clickup-board-[Name].png` | 1920×1080+ | All columns, assignments, tasks, URL, timestamp |
| **2. GitHub Network** | PNG | `week3-github-network-[Name].png` | 1920×1080+ | Timeline Week 1-3, commit dots, URL bar |
| **3. Commit List** | PNG | `week3-github-commits-[Name].png` | 1920×1080+ | Filtered "ai:" commits, full messages visible |
| **4. Pull Request** | PNG | `week3-github-pr-[Name].png` | 1920×1080+ | PR title, description, review/approval visible |
| **5. Repository Structure** | PNG | `week3-repo-structure-[Name].png` | 1920×1080+ | File tree, src/mcp-server/, .vscode/ visible |
| **6. agents.md Content** | PNG | `week3-agents-md-[Name].png` | 1920×1080+ | Full agents.md file content, MCP section visible |
| **7. Vercel Deployment** | PNG | `week3-vercel-deployment-[Name].png` | 1920×1080+ | Working chatbot, message sent, URL in address bar |
| **8. Combined PDF** | PDF | `week3-github-commits-[Name].pdf` | 3 pages | Pages 1-3: Network, Commits, PR |

---

## 🎯 Step-by-Step Screenshot Instructions

### Screenshot 1: ClickUp Board

**Location**: https://app.clickup.com/[your-workspace]

**Steps**:
1. Log into ClickUp
2. Navigate to board: `DigitalTwin-Team2-Fall2025`
3. Ensure you're in LIST or BOARD view showing all columns
4. Required columns visible:
   - Backlog
   - To Do
   - In Progress
   - In Review
   - Complete
5. Expand all task cards to show assignments
6. **IMPORTANT**: 
   - Maximize browser window (F11 for full-screen)
   - Ensure URL bar is visible (not in full-screen mode)
   - Open browser Developer Tools → set device to match your monitor
   - Show system clock or timestamp widget

**Capture Instructions**:
- Press: `PrtScn` (Full screenshot)
- OR use: Windows Snip tool (Win + Shift + S)
- Paste into image editor (Paint, Photoshop, etc.)
- Crop to show full board
- Save as: `week3-clickup-board-[YourName].png`

**Verification**:
- [ ] Full-screen board visible
- [ ] All columns visible and readable
- [ ] Tasks distributed across columns
- [ ] Majority of tasks marked "Complete"
- [ ] Week 3 tasks visible (MCP, chatbot, testing)
- [ ] Assignee names/pictures visible
- [ ] URL bar visible at top
- [ ] Timestamp visible (corner or system time)

---

### Screenshot 2: GitHub Network Graph

**Location**: https://github.com/[YourOrg]/digital-twin-[Team]/network

**Steps**:
1. Go to GitHub repository
2. Click "Insights" tab
3. Click "Network" from left sidebar
4. Wait for network graph to fully load
5. Scroll to show timeline from Week 1 → Present
6. Show multiple commits across timeline
7. Maximize browser window

**Capture Instructions**:
- Press: `PrtScn` or use Snip tool
- Ensure URL bar visible with full GitHub URL
- Ensure graph shows clear commit timeline
- Save as: `week3-github-network-[YourName].png`

**What to Show**:
- Commit dots in chronological order
- Week 1, Week 2, Week 3 commits visible
- Any branches branching from main (if applicable)
- Timeline dates visible

**Verification**:
- [ ] Network graph fully visible
- [ ] Commits from Week 1-3 shown
- [ ] URL bar shows full path
- [ ] Timeline is readable
- [ ] Timestamp visible on screen

---

### Screenshot 3: Commit List with AI References

**Location**: https://github.com/[YourOrg]/digital-twin-[Team]/commits

**Steps**:
1. Go to GitHub repository
2. Click "Code" tab
3. Click commit history (usually shows last commit hash)
4. OR navigate directly to `/commits` page
5. You'll see list of all commits
6. **Filter for AI commits**:
   - Use GitHub search: `ai:` (in commit message)
   - OR manually scroll to find commits with "ai:", "Copilot", "Claude"
7. Ensure filtered results show your AI-assisted commits
8. Make sure commit messages are fully visible

**Capture Instructions**:
- Navigate to commits page
- Use browser Find (Ctrl+F) to search: "ai:"
- Take screenshot showing filtered results
- OR take multiple screenshots of commit list
- Ensure commit messages fully visible
- Save as: `week3-github-commits-[YourName].png`

**Commits to Show**:
```
✅ feat: add MCP server scaffold
✅ ai: implement get_candidate_info tool
✅ ai: add analyze_job_match tool
✅ feat: integrate MCP with chat handler
✅ docs: update agents.md with MCP documentation
✅ test: validate MCP tool routing
✅ feat: add voice interaction
✅ feat: persist conversations to Neon Postgres
```

**Verification**:
- [ ] Minimum 6-8 commits visible
- [ ] Commits have clear, descriptive messages
- [ ] AI references visible ("ai:", "Copilot", "Claude")
- [ ] MCP-related commits highlighted
- [ ] Full commit messages readable
- [ ] URL bar visible
- [ ] Timestamp visible

---

### Screenshot 4: Pull Request (MCP Implementation)

**Location**: https://github.com/[YourOrg]/digital-twin-[Team]/pull/[PR-Number]

**Steps**:
1. Go to GitHub repository
2. Click "Pull requests" tab
3. Find PR titled something like:
   - "MCP Server Implementation & Integration"
   - "Feature: Add MCP Tools"
4. Click to open PR details
5. Scroll to show:
   - PR title
   - PR description with details
   - Conversation/review comments
   - Approval checkbox
6. Expand all comments if collapsed

**Capture Instructions**:
- Screenshot PR overview section showing title and description
- Screenshot conversation section showing reviews
- Screenshot approval/merge button
- Can take 2-3 screenshots and combine into PDF
- Save as: `week3-github-pr-[YourName].png`

**PR Details Should Show**:
- Clear title referencing MCP
- Description explaining changes
- Review comments (even if self-reviewed)
- Approval indicator
- Merge status

**Verification**:
- [ ] PR title visible and relevant to MCP
- [ ] Description explains MCP implementation
- [ ] Review activity visible
- [ ] Approval shown (checkmarks)
- [ ] URL shows PR number
- [ ] Timestamp visible
- [ ] Conversation thread visible

---

### Screenshot 5: Repository File Structure

**Location**: https://github.com/[YourOrg]/digital-twin-[Team]

**Steps**:
1. Go to GitHub repository main page
2. Show file tree on left (auto-visible when visiting repo)
3. OR use GitHub's file browser view
4. Expand especially:
   - `src/` → show `mcp-server/` subfolder
   - `.vscode/` → show `mcp.json`
   - `digital-twin/` → show structure
   - `jobs/` folder (if used)
5. Want to show clear folder hierarchy

**Capture Instructions**:
- Take screenshot of main repository page
- File tree should be visible on left side
- Ensure `src/mcp-server/` folder expanded and highlighted
- Ensure `agents.md` visible in root
- Save as: `week3-repo-structure-[YourName].png`

**Required Visible Elements**:
```
✅ src/
   └── mcp-server/
       ├── index.ts
       ├── tools.ts
       ├── package.json
       └── tsconfig.json
✅ agents.md (in root)
✅ .vscode/mcp.json
✅ digital-twin/
```

**Verification**:
- [ ] File tree fully visible
- [ ] src/mcp-server/ folder shown
- [ ] agents.md visible in repository root
- [ ] .vscode/ folder visible with mcp.json
- [ ] items.ts and tools.ts visible
- [ ] URL bar shows repository URL
- [ ] Timestamp visible

---

### Screenshot 6: agents.md File Content

**Location**: https://github.com/[YourOrg]/digital-twin-[Team]/blob/main/agents.md

**Steps**:
1. Go to GitHub repository
2. Navigate to: `digital-twin/` folder
3. Click on `agents.md` file
4. GitHub will show file preview
5. Scroll through to show:
   - MCP Integration section heading
   - Available Tools section (get_candidate_info, analyze_job_match)
   - How AI Should Use This System section
   - Development Workflow section
   - Git Commit Guidelines section
6. Can take multiple screenshots and scroll through

**Capture Instructions**:
- Take screenshot(s) showing agents.md open in GitHub
- Highlight that content includes MCP sections
- Show references to PRD, Design, Implementation Plan
- Save as: `week3-agents-md-[YourName].png`

**Required Content Visible**:
- MCP Integration section
- Available Tools documentation
- get_candidate_info tool description
- analyze_job_match tool description
- "How AI Should Use This System" section
- Git Commit Guidelines with "ai:" examples

**Verification**:
- [ ] agents.md fully visible in GitHub editor
- [ ] MCP section clearly visible
- [ ] Tool descriptions visible
- [ ] References to PRD visible
- [ ] URL shows agents.md file path
- [ ] Timestamp visible
- [ ] File is in root directory (not digital-twin/)

---

### Screenshot 7: Vercel Deployment (Working Chatbot)

**Location**: https://[your-deployment].vercel.app

**Steps**:
1. Go to your Vercel deployment URL
2. Wait for chatbot to fully load
3. **Important**: Site must be FUNCTIONAL
   - Not broken/error page
   - Not empty placeholder
   - Chat interface visible
4. Type a test message
5. Send message (click Send button)
6. Verify bot responds
7. Take screenshot showing:
   - Chat interface with message history
   - Your message visible
   - Bot response visible
   - Input field ready for next message
8. Show voice button if implemented

**Capture Instructions**:
- Load deployment in fresh browser window
- Ensure chat is fully visible
- Send test message: "Hello, can you help me?"
- Wait for bot to respond
- Take screenshot showing message exchange
- URL bar must show deployment domain
- Save as: `week3-vercel-deployment-[YourName].png`

**What to Show**:
- Working chatbot interface (not broken)
- At least 2-3 messages in chat history
- Your test message clearly visible
- Bot response clearly visible
- Input field with text visible
- Send button clickable and available
- Voice toggle button (if implemented)
- Professional styling/layout

**Verification**:
- [ ] Site loads without errors
- [ ] Chat interface fully visible
- [ ] Messages visible and formatted properly
- [ ] Bot responded to user input
- [ ] Input field is responsive
- [ ] Vercel deployment URL visible in address bar
- [ ] Site is interactive (not just screenshot)
- [ ] Timestamp visible

---

## 📄 Creating Combined PDF

### Combine Screenshots into One PDF

**Method 1: Using Microsoft Print to PDF**
1. Take all screenshots (Pages 1-3):
   - Screenshot 2: GitHub Network
   - Screenshot 3: Commit List
   - Screenshot 4: Pull Request
2. Open each in image viewer
3. Print Screen 1 → Print to PDF as "Page 1"
4. Repeat for screens 2 and 3
5. Combine PDFs using free tool: ILovePDF.com or PDFtk

**Method 2: Using Chrome's Print to PDF**
1. Take three separate screenshots
2. Open each in Chrome
3. Print to PDF (Ctrl+P → Print to PDF)
4. Use online PDF merger to combine

**Method 3: Using Word/Google Docs**
1. Create new Document
2. Insert → Image → Insert all 3 screenshots
3. One per page
4. File → Download as PDF
5. Save as: `week3-github-commits-[YourName].pdf`

**Final PDF Requirements**:
- Page 1: Network Graph
- Page 2: Commit List
- Page 3: Pull Request
- File Name: `week3-github-commits-[YourName].pdf`
- File Size: < 10 MB
- All pages have visible URLs and timestamps

---

## 🎨 Screenshot Quality Checklist

### Before Saving Each Screenshot

**Resolution**:
- [ ] Minimum 1920×1080 pixels
- [ ] NO blurry or zoomed-out screenshots
- [ ] Text is clearly readable

**Visibility**:
- [ ] URL bar fully visible at top
- [ ] All relevant content visible
- [ ] No text cut off at bottom
- [ ] No system UI elements blocking content

**Timestamp**:
- [ ] Date/time visible on screenshot
- [ ] System clock visible in corner
- [ ] OR use screenshot tool that adds timestamp

**File Format**:
- [ ] PNG format for screenshots (not JPG)
- [ ] PDF format for combined document
- [ ] File size reasonable (< 5MB each)
- [ ] Filename follows pattern: `week3-[item]-[YourName]`

---

## 📊 Summary Checklist

**ClickUp Board**:
- [ ] Captured full-screen board
- [ ] All columns visible
- [ ] All status categories shown
- [ ] URL and timestamp visible

**GitHub Network**:
- [ ] Network graph fully visible
- [ ] Timeline from Week 1-3 shown
- [ ] Commits clearly marked
- [ ] URL bar visible

**Commit List**:
- [ ] Filtered for "ai:" commits
- [ ] 6-8+ commits shown
- [ ] Full messages readable
- [ ] AI references clear

**Pull Request**:
- [ ] PR title visible
- [ ] Description visible
- [ ] Review comments shown
- [ ] Approval/merge status shown

**Repository Structure**:
- [ ] File tree visible
- [ ] src/mcp-server/ highlighted
- [ ] agents.md shown in root
- [ ] .vscode/mcp.json visible

**agents.md Content**:
- [ ] File open in GitHub
- [ ] MCP section visible
- [ ] Tool descriptions shown
- [ ] References visible

**Vercel Deployment**:
- [ ] Site loads without errors
- [ ] Chat interface functional
- [ ] Messages visible
- [ ] Bot response shown

**PDF Combined**:
- [ ] 3 pages included
- [ ] Pages ordered correctly
- [ ] All elements visible
- [ ] File properly named

---

## 🚀 Final Submission

All files ready:
```
week3-submission/
├── week3-clickup-board-[YourName].png
├── week3-github-network-[YourName].png
├── week3-github-commits-[YourName].png
├── week3-github-pr-[YourName].png
├── week3-repo-structure-[YourName].png
├── week3-agents-md-[YourName].png
├── week3-vercel-deployment-[YourName].png
├── week3-github-commits-[YourName].pdf
└── repository-url-[YourName].txt
```

**Total Files**: 9 files  
**Total Size**: ~20-30 MB  
**Time to Collect**: ~30-45 minutes  

---

## ✅ Quality Assurance

Before final submission:

1. **Check All Files Exist**
   ```bash
   ls week3-*.png
   ls week3-*.pdf
   ls repository-url-*.txt
   ```

2. **Verify File Sizes**
   - Each PNG: 2-5 MB
   - PDF: 5-10 MB
   - TXT: < 1 KB

3. **Test All Links**
   - Click each GitHub link
   - Verify Vercel deployment works
   - Confirm all repositories are public

4. **Review All Visuals**
   - All PNGs display clearly
   - PDF pages readable
   - No corrupted images

5. **Organize for Submission**
   - Create `Week3-Submission-[YourName]` folder
   - Move all files into folder
   - ZIP the folder
   - Ready to submit!

