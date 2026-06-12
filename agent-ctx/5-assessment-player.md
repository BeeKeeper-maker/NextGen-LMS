# Task 5 - Assessment/Quiz Player UI

## Work Record

### Summary
Built a complete Assessment/Quiz Player UI for learners, integrated into the learner course view with an "Assessments" tab.

### Files Created
1. **`src/components/learner/assessment-player.tsx`** - Full-featured quiz-taking component with:
   - **Quiz Start Screen**: Shows assessment title, description, time limit, total questions, total points, question types, attempt info, and warnings. "Start Quiz" button.
   - **Quiz Taking Screen**: 
     - Question navigation sidebar (desktop) with numbered buttons: green=answered, violet=current, default=unanswered, amber dot=marked for review
     - Mobile question navigation grid
     - Answer input based on question type: RadioGroup for multiple_choice, True/False radio buttons, text Input for short_answer, Checkboxes for multiple_select
     - Mark for review toggle
     - Previous/Next navigation with slide animations
     - Timer countdown with color changes (normal → amber at 5min → red pulsing at 1min)
     - Auto-submit when timer expires
     - Progress bar and answered count
   - **Quiz Review/Submit Screen**: Summary stats (answered/unanswered/marked for review), question list with status, confirmation dialog before submission, warning for unanswered questions
   - **Results Screen**: Pass/fail banner with spring animation, score cards (points, percentage, time, status), question-by-question review with color coding (green=correct, red=incorrect), explanation display, "Retake Quiz" and "Back to Course" buttons

2. **`src/app/api/quiz-submissions/route.ts`** - API endpoint for fetching user quiz submissions (GET /api/quiz-submissions?userId=xxx&assessmentId=yyy)

### Files Modified
1. **`src/hooks/use-data.ts`** - Added `useQuizSubmissions(userId?, assessmentId?)` hook; also updated `useSubmitQuiz` to invalidate quiz-submissions cache on success
2. **`src/components/learner/learner-course.tsx`** - Surgical edits:
   - Added imports: `useAssessments`, `useQuizSubmissions`, `AssessmentPlayer`, `FileCheck`, `ClipboardCheck`, `RotateCcw`
   - Added state: `activeAssessmentId`
   - Added data hooks: `useAssessments(courseId)`, `useQuizSubmissions(userId)`
   - Added "Assessments" tab trigger with ClipboardCheck icon
   - Added Assessments tab content with:
     - Assessment list view showing published assessments as cards with title, description, question count, points, time limit, pass score, best score, attempt tracking
     - AssessmentPlayer embedded when an assessment is selected
     - Loading skeletons, empty state

### Verified Existing
- **`src/app/api/assessments/[assessmentId]/submit/route.ts`** - Already properly implemented: accepts answers, calculates score, creates QuizSubmission, updates user points if passed, returns grading breakdown
- **`src/app/api/assessments/route.ts`** - Already properly lists assessments with questions and counts
- **`src/app/api/assessments/[assessmentId]/route.ts`** - Already properly gets single assessment with questions

### Design Patterns Used
- Glassmorphism style (`glassCard` constant) matching existing app
- Framer Motion animations (slide for question transitions, fade for phase changes, spring for results icon)
- Responsive design: sidebar navigation on desktop, inline grid on mobile
- shadcn/ui components: Card, Button, Badge, RadioGroup, Checkbox, Input, Progress, Dialog, ScrollArea, Label
- Same color scheme: violet/purple gradients for primary actions, emerald for success, amber for warnings, red for errors

### Lint
All code passes `bun run lint` with zero errors. No TypeScript errors in modified/created files.
