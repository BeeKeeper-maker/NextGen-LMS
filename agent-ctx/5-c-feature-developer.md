# Task 5-c: Course Q&A Discussion Feature

## Summary
Added a comprehensive Q&A Discussion tab to the Learner Course view in the NextGen Global LMS Ecosystem.

## Changes Made

### File Modified
- `/home/z/my-project/src/components/learner/learner-course.tsx`

### New Imports Added
- lucide-react icons: `MessageCircleQuestion`, `Plus`, `Bold`, `Italic`, `Link2`, `Trash2`
- shadcn/ui: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`, `DialogFooter`, `DialogClose`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`

### New Data Types
- `QAAnswer` - Answer with author, content, votes, accepted status, replies
- `QAReply` - Nested reply with author, content, votes
- `QAQuestion` - Question with lesson ref, tags, resolved status, answers

### Mock Data
- 9 Q&A questions with varied states (3 resolved, 6 unresolved)
- Questions reference existing lesson IDs (les-1-1-1, les-1-1-2, les-1-1-3, les-1-2-1, les-1-2-2)
- Instructor and learner authors
- Code blocks, inline code, bold text in content
- Nested replies in answers

### QADiscussionTab Component Features
1. **Two-panel layout**: Lesson selector (left) + Q&A threads (right)
2. **Lesson Selector**: Collapsible module groups, question count badges, orange unresolved dots, emerald active highlight
3. **Search & Sort**: Search bar, Newest/Most Voted/Unresolved/Resolved sort
4. **Filters**: All, My Questions, Unresolved, Resolved
5. **Thread Cards**: Title, preview, author, time ago, answer count, upvote, resolved/unresolved badge, tags
6. **Create Question Dialog**: Title, formatting toolbar, content, lesson dropdown, tag input
7. **Thread Detail**: Full question, upvote toggle, tags, Mark Resolved/Edit/Delete for author
8. **Answers**: Vote/Newest sort, accepted answer first with green glow, role badges, nested replies
9. **Code Rendering**: Dark bg code blocks, inline code with emerald text, bold text support
10. **Styling**: Glassmorphism cards, emerald/orange accents, gradient buttons, animated entrances

### Tab Integration
- Added "Q&A" tab trigger with MessageCircleQuestion icon and unresolved count badge
- Added TabsContent for "qa" rendering QADiscussionTab with mockQAData and modules

## Verification
- ESLint: Passes cleanly with zero errors
- Dev server: Running and responding (HTTP 200)
- All existing tabs preserved intact
