# Pilot Car Admin Marketing Website

A modern, professional marketing website for Pilot Car Admin built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- **Modern Design**: Dark purple and white color scheme with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Fast**: Built with Next.js 16 for optimal performance
- **SEO Friendly**: Proper metadata and semantic HTML

## Pages

- **Homepage** (`/`): Hero section, feature highlights, how it works, testimonials, and CTA
- **Features** (`/features`): Detailed breakdown of all Pilot Car Admin features
- **Pricing** (`/pricing`): License pricing tiers and FAQ section

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Build

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework
- **React 19**: Latest React features

## Project Structure

```
marketing-website/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Navbar and Footer
│   ├── page.tsx           # Homepage
│   ├── features/          # Features page
│   └── pricing/           # Pricing page
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── sections/          # Page sections
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── HowItWorks.tsx
│       ├── Testimonials.tsx
│       └── CTA.tsx
├── lib/
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## Color Scheme

The website uses a dark purple and white color scheme:

- **Primary Purple**: `#6b21a8` (purple-800)
- **Light Purple**: `#7c3aed` (purple-700)
- **Accent Purple**: `#8b5cf6` (purple-600)
- **White**: `#ffffff`
- **Gray backgrounds**: `#f9fafb` (gray-50)

## Customization

### Colors

Colors are defined in `app/globals.css` using CSS variables and in `tailwind.config.ts` for Tailwind classes.

### Content

Update content in:
- `components/sections/` for homepage sections
- `app/features/page.tsx` for features page
- `app/pricing/page.tsx` for pricing page

## License

Part of the Pilot Car Admin project.
