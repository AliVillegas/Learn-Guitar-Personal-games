# Guitar Sight Reading - First Position

A web application for practicing guitar sight reading in the first position. Learn to identify notes on the staff and improve your musical reading skills.

## Features

- Interactive staff notation with VexFlow
- Multiple instrument sounds (MIDI, Guitar Synth, Classical Guitar)
- Configurable string notes and measures
- Real-time feedback on note identification
- Score tracking
- Bilingual support (English/Spanish)

## Audio Samples

Thanks a lot to [nbrosowsky](https://github.com/nbrosowsky/tonejs-instruments/commits?author=nbrosowsky) for creating the amazing [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) library! The classical guitar sound samples used in this project come from their excellent collection of instrument samples. These samples are used under their license and are included locally in this project for improved performance and reliability.

## Tech Stack

- React + TypeScript
- Vite
- Tone.js for audio synthesis and playback
- VexFlow for music notation rendering
- Zustand for state management
- Tailwind CSS for styling
- i18next for internationalization

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

This project uses audio samples from [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments), which are provided under their respective license.
