---
title: "arrrrrmin.dev"
toc: false
keywords:
  - Learning
  - Datavis
  - Data wrangling
  - Charts
  - D3js
  - DuckDB
  - Observable plot
  - Observable framework
---

<h1>Learning journeys on data projects and visualisations</h1>
<span><i>to educate myself, and maybe others.</i></span>

```js
import { projectOverview } from "./components/landingpreviews.js";
import { getPagesFlat } from "./metadata.js";
```

<div class="wide">
${display(projectOverview(getPagesFlat().filter(
  d => Object.keys(d).includes("preview")
)))}
</div>

<h2>What going on here?</h2>

<div class="wide">

- **Learning from pros** — rebuilding professional work to see how it was made
- **Misleading chart design** — the small ways a chart can lead you us to wrong impressions
- **Experiments** — loose technical play about things that come my way
- **Projects** — pieces that grew into something standalone
- **Dataworks** - data preperations and everything required to produce the visuals available in [this git repo](https://github.com/arrrrrmin/arrrrrmin.dev/tree/main/dataworks)

<div>

<h2>About me</h2>

I'm arrrrrmin a data engineer and visualisation enthusiast based in Tübingen, Germany. I'm also doing freelance work, so if you need a data specialist send me a message. Either send me a mail `hello[at]arrrrrmin.dev` or a message on [Mastodon](https://chaos.social/@arrrrrmin) or [Bluesky](https://bsky.app/profile/arrrrrmin.dev).

<h2>General </h2>

_A note on artificial mechinary_: **I'm explicitly not writing about AI**. There are way to many peope out there writing about it. **But one thing**: We really need to think about the way we treat fellow human beings. Especially our mostly wonderful creatives and artists, that produced so much joyful art for us.

_Privacy note_: I want to know if this site is used, so **this site uses [Umami](https://github.com/umami-software/umami)**, a self-hosted and privacy-friendly analytics tool. It collects anonymized usage data (page views, referrer, country, browser) without cookies or personal identifiers. Data is stored on a German server and is not shared with third parties.
