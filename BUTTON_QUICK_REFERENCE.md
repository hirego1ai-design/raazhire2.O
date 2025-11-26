# Quick Button Reference Card

## Import
```tsx
import Button from '../../components/Button';
import { Icon } from 'lucide-react'; // Your preferred icon
```

## Basic Syntax
```tsx
<Button variant="VARIANT" size="SIZE" icon={<Icon size={18} />}>
    Button Text
</Button>
```

## Quick Variant Selector

| Need a button for... | Use Variant | Example |
|---------------------|-------------|---------|
| ✅ Confirm, Add, Post, Create | `success` | Post Job |
| ⚠️ Payment, Alert, Warning | `warning` | Pay Due |
| ℹ️ Info, Learn, Post (Sub) | `info` | Post Job |
| 🟣 Agreement, Contract, Premium | `purple` | New Agreement |
| ⚫ Default, Neutral | `primary` | Submit |
| 🌟 Premium, Highlight | `secondary` | Upgrade |
| 👻 Subtle, View, Status | `ghost` | Status |
| 🔴 Delete, Remove, Reject | `danger` | Delete |

## Size Guide
- `xs` - Very compact (tags, inline)
- `sm` - Small (table actions)
- `md` - **Default** (most buttons)
- `lg` - Large (hero CTAs)

## Common Patterns

### Employer Dashboard
```tsx
// Post Job (Subscription)
<Button variant="info" size="md" icon={<Plus />}>Post Job</Button>

// Post Job (PPH)
<Button variant="success" size="md" icon={<Plus />}>Post PPH Job</Button>

// New Agreement
<Button variant="purple" size="md" icon={<FileText />}>New Agreement</Button>

// Pay Due
<Button variant="warning" size="md" icon={<CreditCard />}>Pay Due</Button>

// View Status
<Button variant="ghost" size="md" icon={<Eye />}>Status</Button>
```

### Candidate Dashboard
```tsx
// Apply
<Button variant="success" size="md">Apply Now</Button>

// Save
<Button variant="ghost" size="sm">Save</Button>

// Start Assessment
<Button variant="primary" size="lg">Start Assessment</Button>
```

### Admin Panel
```tsx
// Add User
<Button variant="success" size="md" icon={<Plus />}>Add User</Button>

// Edit
<Button variant="info" size="sm" icon={<Edit />}>Edit</Button>

// Delete
<Button variant="danger" size="sm" icon={<Trash />}>Delete</Button>

// Configure
<Button variant="purple" size="md" icon={<Settings />}>Configure</Button>
```

## Optional Props
```tsx
<Button 
    variant="primary"
    size="md"
    icon={<Icon />}
    fullWidth={true}        // Full width button
    disabled={true}         // Disabled state
    className="ml-auto"     // Additional classes
    onClick={handleClick}   // Click handler
>
    Text
</Button>
```

---

**Pro Tip**: Use semantic variants that match the action's intent for better UX!
