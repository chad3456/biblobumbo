# 🪔 Garba Night

Build your own LEGO-style **3D garba figurine** in traditional Gujarati attire, then join the circle around **Ambe Maa / Durga** as a live orchestra plays.

## Features

### 🧵 Figurine Studio
- **Female:** chaniya choli. Flared chaniya with an embroidered hem, choli, odhni, and choti (braid with parandi), ambodo with gajra, or open hair. Optional bindi, maang tikka, jhumka, nath, haar and bangles.
- **Male:** kediyu with a frilled flare, chorno trousers, kamarbandh, and a pagdi (with turra), safo or topi. Tilak and moustache.
- **Fabric work:** 🪞 mirror work, 🔴 bandhani, 〰️ leheriya or plain, with your choice of border colour.
- Colour pickers for every garment, plus skin, hair, face and dandiya sticks.
- **Name** each figurine and keep up to 12. Preview them dancing (be taali, dodhiyu, hinch, dandiya, spin, namaste) before you join.

### 💃 Garba Ground
- A rangoli dance floor with a **decorated mandap** in the centre: Maa's murti with eight arms (trishul, chakra, sword, lotus, shankh, gada, bow, abhaya mudra), mukut, prabhavali, her lion, marigold garlands and flickering diyas.
- String lights, lanterns and a starry night sky.
- **Orchestra stage:** dholi, tabla, singer, harmonium and shehnai. The musicians play along in time with the music.
- **7 original songs**, synthesised live in the browser with WebAudio (no audio files):
  - Ambe Maa no Garbo: be taali
  - Tran Taali Thumko: tran taali
  - Dodhiyu Dhamaka: dodhiyu
  - Hinch ni Hilor: 6/8 hinch
  - Popat no Pankh: popatiyu
  - Dandiya Dhoom: dandiya raas
  - Maa ni Aarti: everyone stops, faces Maa and joins hands
- **6 garba steps:** Be Taali, Tran Taali, Dodhiyu, Hinch, Popatiyu and Dandiya Raas. Steps follow the song, or you can pick one. Hand claps and dandiya strikes land exactly on the music's claps. In dandiya raas, the dancers form two counter-rotating rings and switch partners every 8 beats.
- **Interactions:** tap any dancer, then choose Namaste, Jai Mata Di, Wave, Clap, Spin or "Kem cho!" (a neighbour replies). You can also **pair up for fudadi**, where two figurines spin together, or greet each other. Neighbourhood dancers chat now and then.
- **Camera:** orbit, top-down, or follow your figurine.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # step/music sync, formations, store
npm run build   # static site in dist/
```

## Deploy (Vercel)
`vercel.json` is included: import the repo at <https://vercel.com/new> and click **Deploy**, or run `vercel --prod`.

## Tech
React 19, TypeScript, Vite, Three.js via `@react-three/fiber` and `drei`, Zustand, and WebAudio. Everything is built from code: there are no 3D models, images or audio files. Figurines are saved in your browser (localStorage).
