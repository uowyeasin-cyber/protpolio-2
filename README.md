# Portfolio Studio

A premium one-page-app portfolio for a developer-designer, with a built-in **owner-only visual editor**. Static HTML/CSS/JS plus four small serverless functions. No framework and no build step.

## What's inside
- **Pages:** Home, Work (by category: Apps, Websites, Games, Systems, Brands, Logos, Menus & print, Social, Video, plus a filterable archive), Code, Awards, Services (packages, process, FAQ), About, one-page Résumé (ATS-friendly, printable), Contact (brief form to WhatsApp or email).
- **Case studies:** each design project gets its own page with a lightbox gallery.
- **Live demos:** browser games and UI demos play inline.
- **Customise mode** for the owner:
  - Click anything to edit its text, links, photos and videos.
  - Change its colour, font, size, corners, border, shape, position and animation.
  - Duplicate, move or delete it, and add new blocks.
  - Change the site theme, fonts and buttons, and add, rename or hide pages.
  - Publish so every visitor sees the change, and roll back from version history.
- **Motion:** smooth page transitions, word-by-word headlines, image reveals, scroll progress, magnetic buttons and cursor glow. It all switches off when the device asks for reduced motion.
- **SEO:** Open Graph tags, Person schema, a skip link, keyboard focus states and a mobile-first layout.

## Folder structure
```
index.html          page markup, styles and site engine
data/content.js     ALL content: your details, projects, gallery, services, credentials, chatbot
img/  vid/  demo/   images (name.webp + name-t.webp thumbnail), videos, playable demos
cms.js              applies published edits for every visitor (public)
cms/editor.src.js   the visual editor (sent only to the signed-in owner)
api/                Vercel functions: login, logout, me, content, versions, upload, editor
tools/              dev server, password hasher, editor bundler
```

## Run it locally
```
npm install
OWNER_EMAIL=you@example.com OWNER_PASSWORD=test npm run dev
```
Open http://localhost:3000, then http://localhost:3000/#login to sign in. Edits are stored in `.cms-data/`.
After changing `cms/editor.src.js`, run `npm run build:editor`.

## Put it online (Vercel)
1. Push this folder to a GitHub repo and import it in Vercel. It needs no framework and no build command.
2. In Vercel, go to Storage → Create → **Blob** and connect it to the project. This sets `BLOB_READ_WRITE_TOKEN`.
3. In Settings → Environment Variables, add:
   - `OWNER_EMAIL`: the only email that can sign in
   - `OWNER_PASSWORD`, or `OWNER_PASSWORD_HASH` from `npm run hash -- "your password"`
   - `SESSION_SECRET` (optional): any long random text
4. Redeploy, then sign in at `https://your-site/#login`.

## Updating content
- **Quick changes:** use Customise mode on the live site. Nothing changes for visitors until you press Publish.
- **Structured content:** edit `data/content.js`. It covers projects, gallery pieces, services, packages, education, experience, credentials and chatbot answers. Every list has a comment that explains its shape.
- **Personal details:** the `SITE` block at the top of `data/content.js` holds the name, email, WhatsApp, links and résumé.
- **Hero, About and Contact text:** this lives in `index.html`. You can also change it in Customise mode.

## Rebranding it for someone else
1. Replace `SITE` and every list in `data/content.js`.
2. Replace the images in `img/` (keep the `-t.webp` thumbnails), the videos in `vid/` and the demos in `demo/`.
3. Edit the hero, About, Résumé and Contact text in `index.html`, plus the `<title>`, meta description and Open Graph tags.
4. Pick colours and fonts in Customise → Theme, or edit the `:root` tokens at the top of the `<style>` block.
5. Set your own `OWNER_EMAIL` and password in Vercel.

## Selling this as a template
- **Sell only the code and layout.** Before you sell, swap every personal detail and every client design for neutral demo content. Client artwork (menus, logos, posts and videos made for clients) belongs to those clients and can't be resold.
- **Use licensed demo images.** Use your own photos or images with a commercial licence.
- **Fonts and libraries:** Geist and Geist Mono use the SIL Open Font License, which allows commercial use. `@vercel/blob` is Apache-2.0.
- **Add your own licence.** Include a LICENSE file with the terms you sell under (for example single site or unlimited sites) and a support contact.
- **Ship no secrets.** Leave out `.env`, `.cms-data/` and `node_modules/`. They are already in `.gitignore`.
