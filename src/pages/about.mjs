import { html } from '../lib/html.mjs';
import { picture } from '../components/media.mjs';
import { breadcrumbs } from '../components/ui.mjs';

export default function about({ site, products, media }) {
  const lead = products[0];
  const body = html`
<section class="page-hero">
  <div class="container">
    ${breadcrumbs([{ href: '/', label: 'Home' }, { label: 'About' }])}
    <h1>About ${site.name}</h1>
    <p class="lead">${site.name} stands for ${site.expandedName}. We create assets for Unity with a simple goal: helping developers turn their ideas into playable experiences.</p>
  </div>
</section>

<section class="section" aria-labelledby="what-heading">
  <div class="container prose-grid">
    <div class="prose">
      <h2 id="what-heading">What we create</h2>
      <p>${site.name} is an ${site.type.toLowerCase()} focused on game-ready 3D characters and creatures. Our first release, <a href="/assets/${lead.slug}/">${lead.name}</a>, is a rigged and animated rock golem boss for fantasy games.</p>

      <h2>Game-ready 3D assets</h2>
      <p>Game-ready means the asset works the moment it lands in your project: real-world scale, a pivot at the feet, a consistent facing direction, PBR textures and a material already assigned. We publish exact triangle counts, texture sizes and known limitations so you can judge the fit before you buy.</p>

      <h2>Characters and monsters</h2>
      <p>We focus on characters and creatures with a strong silhouette that read well as bosses and heavy enemies, and we show each one from every side, including the back, in real-time renders.</p>

      <h2>Rigging and animation</h2>
      <p>Every character gets a custom skeleton and skin weighting, then hand-keyed animation clips. We check ground contact and deformation frame by frame, and we state plainly what a rig supports, for example whether it is Generic or Humanoid.</p>

      <h2>Built for Unity projects</h2>
      <p>Each package includes a prefab, an Animator Controller, a Universal Render Pipeline material and a demo scene. We import every package into a clean Unity project and test it in Play Mode before release, and we list the exact Unity and URP versions we tested with.</p>
    </div>
    <figure class="about-figure">
      ${picture(media[lead.mediaKey], '06-rig-wireframe', { alt: `${lead.name} wireframe with its 20-bone Generic rig`, sizes: '(min-width: 900px) 40vw, 100vw' })}
      <figcaption>The real mesh wireframe and 20-bone rig of ${lead.name}.</figcaption>
    </figure>
  </div>
</section>`;

  return {
    file: 'about.html',
    page: {
      path: '/about.html',
      active: 'about',
      title: 'About',
      description: `${site.name} (${site.expandedName}) creates game-ready 3D characters and monsters for Unity, with custom rigs, hand-keyed animations, URP materials and demo scenes.`,
      body,
    },
  };
}
