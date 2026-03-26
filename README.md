# E = mc² — Mass-Energy Conversion Engine

An interactive mass-energy conversion simulator built with **Next.js 15**, **TypeScript**, and **Three.js**. Visualize Einstein's famous equation through a real-time 3D particle engine.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r172-black?logo=three.js)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

## Features

- **3D Particle Simulation** — 8,000 neon particles rendered with custom GLSL shaders and additive blending
- **Periodic Table** — Select from 40 elements with real atomic data (mass, density, nucleon count)
- **Three Conversion Methods** — Antimatter annihilation (100%), nuclear fusion (~0.7%), and nuclear fission (~0.08%)
- **Real-Time Physics** — Calculates energy output, photon count, and real-world equivalents (TNT megatons, Hiroshima bombs, homes powered)
- **Interactive Effects** — Mouse repulsion on matter particles, gravity lensing on photons, camera shake, shockwaves, and fullscreen flash
- **Dark/Light Theme** — Toggle between themes with smooth CSS transitions
- **Responsive** — Full HUD on desktop, streamlined view on mobile

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## How It Works

1. **Pick an element** from the periodic table (e.g., Iron, Gold, Uranium)
2. **Adjust the mass** using the slider (0.001 kg to 10 kg)
3. **Choose a conversion method** — annihilation, fusion, or fission
4. **Click Convert** (or click the particle sphere) to watch mass transform into energy
5. View real-time energy output and real-world comparisons

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| 3D Engine | Three.js with custom GLSL shaders |
| Styling | CSS custom properties (dark/light themes) |
| Fonts | JetBrains Mono + Outfit (Google Fonts) |
| Deployment | Vercel |

## Deploy to Vercel

This project is Vercel-ready. Import the repo and deploy with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amaancoderx/Mass-Energy-Engine)

## Project Structure

```
src/
├── app/
│   ├── globals.css          # All CSS with dark/light theme variables
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Home page
└── components/
    └── MassEnergyEngine.tsx # Client component — Three.js engine + React UI
```

## License

MIT
