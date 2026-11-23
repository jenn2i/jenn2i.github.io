'use strict';

(() => {
  const content = window.portfolioContent;
  if (!content) return;
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const tags = values => values.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');

  document.querySelector('#overview-list').innerHTML = content.experiences.map(item => `<article class="overview-item"><h4>${escapeHTML(item.overviewTitle || item.organization)}</h4><time>${escapeHTML(item.date)}</time><p>${escapeHTML(item.overview)}</p></article>`).join('');
  document.querySelector('#experience-list').innerHTML = content.experiences.map((item, index) => `<details class="experience-entry reveal" id="experience-${index}" ${item.open ? 'open' : ''}><summary class="experience-summary"><div><span class="experience-date">${escapeHTML(item.date)}</span><h3>${escapeHTML(item.organization)}</h3><span class="experience-role">${escapeHTML(item.role)}</span></div><span class="expand-icon" aria-hidden="true"></span></summary><div class="experience-details">${item.groups.map(group => `<div class="experience-group"><h4>${escapeHTML(group.title)}</h4><ul>${group.items.map(text => `<li>${escapeHTML(text)}</li>`).join('')}</ul></div>`).join('')}</div></details>`).join('');

  function projectVisual(project) {
    if (project.image) return `<img src="${project.image}" alt="${escapeHTML(project.imageAlt)}" loading="lazy">`;
    const concept = project.concept;
    return `<div class="project-concept" aria-hidden="true"><span class="concept-caption">${escapeHTML(concept.caption)}</span><strong>${escapeHTML(concept.headline)}</strong><div class="concept-parts">${concept.parts.map(part => `<span>${escapeHTML(part)}</span>`).join('')}</div><div class="concept-grid"></div></div>`;
  }
  document.querySelector('#featured-projects').innerHTML = content.projects.map(project => `<article class="project-feature reveal"><button type="button" class="project-visual visual-${project.feature}" data-project="${project.id}" aria-label="${escapeHTML(project.title)} 상세 보기"><span class="visual-top">${escapeHTML(project.visualLabel)}</span>${projectVisual(project)}<span class="visual-bottom"><span>${escapeHTML(project.visualFooter)}</span><span>${project.image ? 'PROJECT ARCHIVE' : 'FUNCTION OVERVIEW'}</span></span></button><div class="project-feature-copy"><p class="project-name">${escapeHTML(project.name)}</p><h3>${escapeHTML(project.title)}</h3><p class="project-description">${escapeHTML(project.description)}</p><div class="tag-list">${tags(project.tags)}</div><time>${escapeHTML(project.date)}</time><button type="button" class="detail-button" data-project="${project.id}">프로젝트 살펴보기</button></div></article>`).join('');
  document.querySelector('#year').textContent = new Date().getFullYear();

  // Native dialog provides focus trapping, Escape to close, and focus restoration.
  const dialog = document.querySelector('#project-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  let dialogTrigger;
  function renderDetailBlocks(blocks, headingLevel = 3) {
    return blocks.map(block => {
      if (block.type === 'heading') return `<h${headingLevel} class="detail-heading">${escapeHTML(block.text)}</h${headingLevel}>`;
      if (block.type === 'subheading') return `<h4 class="detail-subheading">${escapeHTML(block.text)}</h4>`;
      if (block.type === 'paragraph') return `<p class="detail-paragraph">${escapeHTML(block.text)}</p>`;
      if (block.type === 'list') return `<ul class="detail-list">${block.items.map(text => `<li>${escapeHTML(text)}</li>`).join('')}</ul>`;
      if (block.type === 'note') return `<aside class="detail-note">${escapeHTML(block.text)}</aside>`;
      if (block.type === 'chapter') return `<section class="project-chapter"><h3 class="chapter-title">${escapeHTML(block.title)}</h3>${renderDetailBlocks(block.blocks, 4)}</section>`;
      if (block.type === 'gallery') {
        const phoneGallery = block.images.length > 1 && block.images.every(img => img.height > img.width * 1.6);
        return `<div class="detail-gallery ${block.images.length === 1 ? 'gallery-single' : ''} ${phoneGallery ? 'gallery-phones' : ''}">${block.images.map(img => `<figure><img src="${escapeHTML(img.src)}" alt="${escapeHTML(img.alt)}" width="${img.width}" height="${img.height}" loading="lazy" decoding="async">${img.caption ? `<figcaption>${escapeHTML(img.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
      }
      if (block.type === 'documents') return `<details class="detail-documents"><summary>${escapeHTML(block.summary)}</summary><div class="documents-table-wrap"><table><thead><tr><th scope="col">분류</th><th scope="col">개수</th><th scope="col">문서명</th></tr></thead><tbody>${block.rows.map(([category,count,names]) => `<tr><th scope="row">${escapeHTML(category)}</th><td>${escapeHTML(count)}</td><td><ul>${names.map(name => `<li>${escapeHTML(name)}</li>`).join('')}</ul></td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">합계</th><td>43</td><td>8개 분야</td></tr></tfoot></table></div></details>`;
      return '';
    }).join('');
  }
  function openProject(project, trigger) {
    dialogTrigger = trigger;
    dialogContent.innerHTML = `<article class="dialog-body"><h2 id="dialog-title">${escapeHTML(project.detail.title)}</h2><div class="dialog-meta"><span>${escapeHTML(project.date)}</span><span>${escapeHTML(project.team)}</span></div><div class="project-detail-content">${renderDetailBlocks(project.detail.blocks)}</div>${project.github ? `<div class="dialog-links"><a href="${escapeHTML(project.github)}" target="_blank" rel="noopener noreferrer">GitHub</a></div>` : ''}</article>`;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.scrollTop = 0;
  }
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
    const project = content.projects.find(item => item.id === button.dataset.project);
    if (project) openProject(project, button);
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  function syncModalLock() {
    document.body.classList.toggle('dialog-open', !!document.querySelector('dialog[open]'));
  }
  dialog.addEventListener('close', () => { syncModalLock(); dialogTrigger?.focus({preventScroll:true}); });

  // Fixed, trusted resources open inline. This viewer does not provide access control.
  const documentResources = Object.freeze({
    paper: { title:'논문', pages:['assets/previews/paper-1.jpg','assets/previews/paper-2.jpg','assets/previews/paper-3.jpg','assets/previews/paper-4.jpg'] },
    poster: { title:'포스터', pages:['assets/previews/poster-1.jpg'] }
  });
  const documentViewer = document.querySelector('#document-viewer');
  const documentContent = document.querySelector('#document-content');
  let documentTrigger;
  let documentScale = 1;
  function setDocumentScale(scale) {
    documentScale = Math.max(.75, Math.min(3, scale));
    documentContent.style.setProperty('--document-scale', documentScale);
    document.querySelector('.document-scale').textContent = `${Math.round(documentScale * 100)}%`;
    document.querySelector('.document-zoom-out').disabled = documentScale <= .75;
    document.querySelector('.document-zoom-in').disabled = documentScale >= 3;
  }
  document.querySelectorAll('[data-document]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const key = link.dataset.document;
    if (!Object.hasOwn(documentResources, key)) return;
    const resource = documentResources[key];
    documentTrigger = link;
    document.querySelector('#document-title').textContent = resource.title;
    const pages = document.createElement('div');
    pages.className = 'document-pages';
    resource.pages.forEach((path,index) => {
      const preview = document.createElement('img');
      preview.alt = `${resource.title} ${index + 1} / ${resource.pages.length}쪽`;
      preview.src = path;
      preview.decoding = 'async';
      preview.loading = index === 0 ? 'eager' : 'lazy';
      pages.append(preview);
    });
    documentContent.replaceChildren(pages);
    setDocumentScale(1);
    documentViewer.showModal();
    documentContent.scrollTo({top:0,left:0});
    syncModalLock();
  }));
  document.querySelector('.document-zoom-out').addEventListener('click', () => setDocumentScale(documentScale - .25));
  document.querySelector('.document-zoom-in').addEventListener('click', () => setDocumentScale(documentScale + .25));
  document.querySelector('.document-close').addEventListener('click', () => documentViewer.close());
  documentViewer.addEventListener('click', event => {
    if (event.target !== documentViewer) return;
    const bounds = documentViewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) documentViewer.close();
  });
  documentViewer.addEventListener('close', () => {
    documentContent.replaceChildren();
    syncModalLock();
    documentTrigger?.focus({preventScroll:true});
  });

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactScreen = window.matchMedia('(max-width: 760px) and (max-height: 740px)');
  const header = document.querySelector('#header');
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  const storyTrack = document.querySelector('#story-track');
  const storySticky = document.querySelector('.story-sticky');
  const progressBar = document.querySelector('.story-progress > span');
  const orbit = document.querySelector('.orbit-outer');
  const descriptions = [...document.querySelectorAll('.story-description')];
  const storyButtons = [...document.querySelectorAll('[data-story]')];
  const nodes = [...document.querySelectorAll('.perspective-node')];
  let activeStep = 0;
  let scrollPending = false;

  function setStory(step) {
    activeStep = step;
    descriptions.forEach((item, index) => { item.classList.toggle('is-active', index === step); item.inert = index !== step; });
    storyButtons.forEach((button, index) => { button.classList.toggle('is-active', index === step); button.setAttribute('aria-pressed', String(index === step)); });
    nodes.forEach((node, index) => node.classList.toggle('is-active', index === step));
  }
  storyButtons.forEach(button => button.addEventListener('click', () => {
    const step = Number(button.dataset.story);
    if (motionPreference.matches || compactScreen.matches) { setStory(step); return; }
    const distance = Math.max(0, storyTrack.offsetHeight - storySticky.offsetHeight);
    const trackTop = storyTrack.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({top:trackTop + distance * ((step + .5) / 3), behavior:'smooth'});
  }));

  const navLinks = [...header.querySelectorAll('a[href^="#"]:not(.wordmark)')];
  const sectionTargets = navLinks.map(link => ({link, target:document.querySelector(link.getAttribute('href'))})).filter(item => item.target);
  function updateScroll() {
    scrollPending = false;
    const scroll = window.scrollY;
    header.classList.toggle('is-fixed', scroll > hero.offsetHeight - 110);
    if (!motionPreference.matches) {
      const ratio = Math.max(0, Math.min(1, scroll / hero.offsetHeight));
      heroContent.style.transform = `translateY(${ratio * 65}px)`;
      heroContent.style.opacity = String(1 - ratio * .85);
      const distance = Math.max(1, storyTrack.offsetHeight - storySticky.offsetHeight);
      const progress = Math.max(0, Math.min(1, -storyTrack.getBoundingClientRect().top / distance));
      progressBar.style.transform = `scaleX(${Math.max(.01, progress)})`;
      orbit.style.transform = `rotate(${progress * 45}deg)`;
      const step = Math.min(2, Math.floor(progress * 3));
      if (!compactScreen.matches && step !== activeStep) setStory(step);
    } else { heroContent.style.removeProperty('transform'); heroContent.style.removeProperty('opacity'); }
    let current = null;
    for (const item of sectionTargets) if (item.target.getBoundingClientRect().top <= 160) current = item.link;
    for (const item of sectionTargets) { item.link.classList.toggle('is-current', item.link === current); if (item.link === current) item.link.setAttribute('aria-current','location'); else item.link.removeAttribute('aria-current'); }
  }
  function scheduleScroll() { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }
  window.addEventListener('scroll', scheduleScroll, {passive:true});
  window.addEventListener('resize', scheduleScroll, {passive:true});
  motionPreference.addEventListener('change', scheduleScroll);
  compactScreen.addEventListener('change', scheduleScroll);
  updateScroll();

  // Content remains visible without JavaScript, IntersectionObserver, or motion.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, {threshold:.07, rootMargin:'0px 0px 20px 0px'});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    document.documentElement.classList.add('js-ready');
  }

  // A restrained network illustration: local canvas, no libraries or tracking.
  const canvas = document.querySelector('#network');
  const context = canvas.getContext('2d');
  if (!context) return;
  let width = 0, height = 0, points = [], animationId = 0, previousFrame = 0, isHeroVisible = true;
  function resizeNetwork() {
    width = hero.clientWidth; height = hero.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Deterministic seed keeps the composition consistent on reload.
    let seed = 29;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    points = Array.from({length:Math.min(88, Math.max(30, Math.floor(width / 17)))}, () => ({x:random()*width,y:random()*height,vx:(random()-.5)*.11,vy:(random()-.5)*.11,size:random()*1.3+.55}));
    drawNetwork(0);
  }
  function drawNetwork(delta) {
    context.clearRect(0,0,width,height);
    for (const point of points) {
      point.x += point.vx * delta; point.y += point.vy * delta;
      if (point.x < -10) point.x = width+10; if (point.x > width+10) point.x = -10;
      if (point.y < -10) point.y = height+10; if (point.y > height+10) point.y = -10;
    }
    const linkDistance = width < 760 ? 105 : 170;
    for (let i=0;i<points.length;i++) {
      const point=points[i];
      // Keep the central reading area quiet.
      const centered = point.x > width*.2 && point.x < width*.8 && point.y > height*.28 && point.y < height*.73;
      const opacity = centered ? .2 : .65;
      context.beginPath(); context.arc(point.x,point.y,point.size,0,Math.PI*2); context.fillStyle=`rgba(165,196,220,${opacity})`; context.fill();
      for (let j=i+1;j<points.length;j++) {
        const other=points[j], distance=Math.hypot(point.x-other.x,point.y-other.y);
        if (distance < linkDistance) { context.beginPath(); context.moveTo(point.x,point.y); context.lineTo(other.x,other.y); context.strokeStyle=`rgba(135,175,205,${(1-distance/linkDistance)*(centered?.09:.21)})`; context.lineWidth=.65; context.stroke(); }
      }
    }
  }
  function animate(timestamp) {
    animationId=0;
    if (!isHeroVisible || document.hidden || motionPreference.matches) return;
    const elapsed=timestamp-previousFrame;
    if (elapsed>30) { drawNetwork(Math.min(elapsed/16.67,3)); previousFrame=timestamp; }
    animationId=requestAnimationFrame(animate);
  }
  function syncAnimation() {
    if (animationId) {cancelAnimationFrame(animationId);animationId=0;}
    previousFrame=0;
    if (isHeroVisible && !document.hidden && !motionPreference.matches) animationId=requestAnimationFrame(animate);
    else drawNetwork(0);
  }
  new ResizeObserver(resizeNetwork).observe(hero);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { isHeroVisible=entries[0].isIntersecting;syncAnimation(); }).observe(hero);
  document.addEventListener('visibilitychange',syncAnimation);
  motionPreference.addEventListener('change',syncAnimation);
  resizeNetwork();syncAnimation();
})();
