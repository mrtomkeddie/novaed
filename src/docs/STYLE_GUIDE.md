# NovaEd Style Guide

This document outlines the core visual design system for the NovaEd application. It covers the color palette, typography, and component styling to ensure a consistent and professional user interface.

## 1. Color Palette

The application uses a modern dark theme with a specific set of colors defined as CSS variables. These colors are used throughout the app via Tailwind CSS.

### Core Colors (Dark Theme)

| Role                 | HSL Value          | Hex Value | Description                                                    |
| -------------------- | ------------------ | --------- | -------------------------------------------------------------- |
| **Background**       | `0 0% 11%`         | `#1C1C1C` | The main background color for pages.                           |
| **Foreground**       | `210 40% 98%`      | `#F8F9FC` | The primary text color.                                        |
| **Card Background**  | `0 0% 13%`         | `#212121` | Background color for UI cards and containers.                  |
| **Primary**          | `217 89% 61%`      | `#4285F4` | Used for primary buttons, links, and key interactive elements. |
| **Primary Foreground**| `210 40% 98%`     | `#F8F9FC` | Text color used on top of primary-colored elements.            |
| **Accent**           | `266 91% 65%`      | `#8A3FFC` | Used for highlights, active states, and special UI elements.   |
| **Secondary**        | `0 0% 20%`         | `#333333` | Used for secondary buttons and less prominent elements.        |
| **Muted Foreground** | `215 20% 65%`      | `#98A1B3` | Used for placeholder text and descriptive subtitles.           |
| **Border**           | `0 0% 20%`         | `#333333` | The color for borders on cards, inputs, and separators.        |

### Button Gradient

A special gradient is used for prominent call-to-action buttons:
- **From**: `hsl(var(--gradient-from))` which is the Accent color (`#8A3FFC`)
- **To**: `hsl(var(--gradient-to))` which is the Primary color (`#4285F4`)

## 2. Typography

- **Font Family**: **PT Sans** is used for all text, including body copy and headlines.
- **Weights**: The app uses `400` (Regular) for body text and `700` (Bold) for titles and important text.

## 3. Component Styling

- **Framework**: Components are built using **ShadCN/UI**.
- **General Feel**: The UI is clean and modern, with rounded corners (`0.5rem` radius) and subtle shadows on cards.
- **Icons**: Icons are from the **Lucide React** library, providing a consistent and clean look.
