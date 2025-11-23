# Portfolio Website Documentation

## Overview
This is a personal portfolio website built with HTML, CSS, and JavaScript. It features a modern, responsive design with a 3D rotating globe background powered by Three.js.

## Features
- **3D Globe Background**: A dynamic, rotating globe using Three.js.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices.
- **Gallery**: A grid layout gallery displaying selected images.
- **Glassmorphism UI**: Modern, translucent card designs.
- **Contact Form**: A styled contact form (client-side only).

## Project Structure
- `index.html`: The main HTML file containing the page structure.
- `style.css`: The CSS file containing all styles, variables, and responsive rules.
- `script.js`: The JavaScript file handling the Three.js scene, animations, and interactions.
- `img/`: Directory containing gallery images.

## Customization
- **Images**: Replace images in the `img/` folder. Ensure filenames match or update `index.html`.
- **Colors**: Edit the CSS variables in `:root` within `style.css` to change the color scheme.
- **Content**: Update the text content in `index.html`.

## Dependencies
- **Three.js**: Loaded via CDN (cdnjs).
- **RemixIcon**: Loaded via CDN (jsdelivr).
- **Google Fonts**: Outfit and Space Grotesk.
- **GSAP**: Loaded via CDN (cdnjs) for animations.

## How to Run
Simply open `index.html` in any modern web browser. For the best experience, use a local server (e.g., Live Server in VS Code) to avoid CORS issues with some assets, although this setup is designed to work without one for basic features.
