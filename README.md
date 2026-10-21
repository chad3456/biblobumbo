# 🪔 Utsav Bricks

Celebrate India's festivals in a LEGO-style 3D world. The home page has a card for each experience:

- **🪔 Diwali in Ayodhya** (`/#/diwali`): light diyas with wishes and promises on the Saryu ghats.
- **💃 Garba Night** (`/#/studio`, `/#/garba`): build a garba figurine and dance around Maa Ambe.

## 🪔 Diwali in Ayodhya
- **Deepotsav on the Saryu.** A LEGO-brick ghat descends to the river, lined with about 1,800 diyas.
- **Ram Mandir–style temple.** Nagara shikharas with saffron dhwajas, a pillared mandapa and a glowing sanctum, outlined in lights.
- **Around the ghat:** lit havelis, chhatris, a rangoli, devotees doing the Saryu aarti (your garba figurines appear here if you've made any), floating diyas drifting downstream, sky lanterns and fireworks on a new-moon night.
- **Light a diya.** Write a 🌟 wish, 🤝 promise, 💌 message, 🌸 gratitude or 🙏 prayer, and pick a rim colour. Your diya lights up on the steps with a temple-bell chime and fireworks.
- **Deepotsav meter.** Every diya you light kindles 25 more along the riverfront, until the whole ghat glows.
- **Wall of light.** Read everyone's diyas, filter by type, react with 🙏 ❤️ 🪔 ✨, and tap any diya to fly the camera to it.
- **Share.** Each diya has a share link (native share sheet or copy). The whole message is inside the link, so when a friend opens it the diya lights up in their Ayodhya with a "lit a diya for you" card and a button to light one back. No server is needed. Links are validated and sanitised on arrival.


## 💃 Garba Night

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
npm test        # step/music sync, formations, diya links, stores
npm run build   # static site in dist/
```

## Deploy (Vercel)
`vercel.json` is included: import the repo at <https://vercel.com/new> and click **Deploy**, or run `vercel --prod`.

## Tech
React 19, TypeScript, Vite, Three.js via `@react-three/fiber` and `drei`, Zustand, and WebAudio. Everything is built from code: there are no 3D models, images or audio files. Figurines and diyas are saved in your browser (localStorage); diyas travel between people through share links.
