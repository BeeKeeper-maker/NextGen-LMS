# Task 10 — Form Validation Developer

## Task: Add proper form validations to ALL forms across the application

## Work Summary

Created a reusable validation utility and applied comprehensive form validation to 10 form components across the application, covering both admin and learner interfaces.

## Changes Made

### 1. New File: `src/lib/validations.ts`
- Created reusable validation utility with primitive validators: `required`, `minLength`, `maxLength`, `validEmail`, `numeric`, `min`, `max`, `positiveNumber`, `futureDate`, `dateAfter`
- Created composite `validateFields` function that runs arrays of validators per field and returns first error per field

### 2. HIGH PRIORITY Forms

#### `admin-courses.tsx`
- **NewCourseDialog**: Added validation for title (required, 3-200 chars), description (required, min 10), category (required), level (required), price (numeric, >= 0)
- **CourseSettingsDialog**: Same validation rules applied to edit form
- Added `errors` and `touched` state for blur-time and submit-time validation
- Error styling: `border-destructive` class on inputs, red error text below fields

#### `admin-assessments.tsx`
- **AssessmentBuilder**: Title (required, min 3 chars), time limit (> 0 if set), at least 1 question to publish, points > 0 per question
- Save Draft and Publish buttons both validate (Publish requires questions)
- Question count error displayed in header

#### `admin-community.tsx`
- **Create Post Dialog**: Title (required, min 3 chars), content (required, min 10 chars), category (required)
- Category select shows error styling
- Content textarea wrapper shows error border

#### `admin-learning-paths.tsx`
- **PathBuilderPanel**: Path name (required, min 3 chars), at least 1 course to publish
- Course sequence section shows validation error

#### `admin-live-cohorts.tsx`
- **Enhanced existing validation**: Added min 3 chars for title, future date check for start date, capacity must be at least 1 (not just > 1 for existing)
- Already had error display; enhanced validation rules

### 3. MEDIUM PRIORITY Forms

#### `learner-course.tsx`
- **DiscussionTab**: Ask content (required, min 5 chars), reply content (required, min 5 chars)
- **QADiscussionTab**: Question content (required, min 5 chars), lesson selection (required), answer content (required, min 5 chars)
- Error messages shown below inputs/textareas

#### `learner-community.tsx`
- **Create Post Dialog**: Title (required, min 3 chars), content (required, min 10 chars)
- Error shown in character count area and below title input

#### `course-reviews.tsx`
- **ReviewFormDialog**: Rating (1-5 required), title (required), content (required, min 20 chars)
- Added explicit error messages (previously only had disabled button + char count)

#### `checkout-page.tsx`
- **Card Payment**: Email (required, valid format), cardholder name (required), card number (min 15 digits), expiry (required), CVV (min 3 digits)
- **PayPal**: PayPal email (required, valid format)
- Errors shown on Pay Now click, cleared on field change

## Validation Pattern Used
```tsx
const [errors, setErrors] = useState<Record<string, string>>({});
const [touched, setTouched] = useState<Record<string, boolean>>({});

const validate = (): boolean => {
  const errs = validateFields({ field: [required(val, 'Field'), minLength(val, 3, 'Field')] });
  setErrors(errs);
  setTouched({ field: true });
  return Object.keys(errs).length === 0;
};

// Error display:
className={errors.field ? 'border-destructive focus-visible:ring-destructive' : ''}
{errors.field && <p className="text-sm text-destructive mt-1">{errors.field}</p>}
```

## Lint Result
All files pass ESLint with no errors.
