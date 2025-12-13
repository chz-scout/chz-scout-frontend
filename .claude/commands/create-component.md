---
description: "Create a new React component with TypeScript and Tailwind CSS"
allowed-tools: ["Write", "Read", "Glob"]
---

Create a new React component following the project conventions:

## Component Structure
```tsx
interface [ComponentName]Props {
  // Define props here
}

export default function [ComponentName]({ ...props }: [ComponentName]Props) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

## Guidelines
1. Use functional components with TypeScript
2. Define props interface above the component
3. Use Tailwind CSS for styling
4. Include accessibility attributes where appropriate
5. Export as default

## File Location
- Reusable components: `src/components/[ComponentName].tsx`
- Page components: `src/pages/[PageName]Page.tsx`

Create the component based on the following request:

$ARGUMENTS