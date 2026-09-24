(() => {
  const els = {
    peopleList: document.querySelector('#peopleList'),
    selectedCount: document.querySelector('#selectedCount'),
    peopleCount: document.querySelector('#peopleCount'),
    svg: d3.select('#timelineSvg'),
    viewport: document.querySelector('#timelineViewport'),
    empty: document.querySelector('#emptyState'),
    rangeLabel: document.querySelector('#rangeLabel'),
    zoomReadout: document.querySelector('#zoomReadout'),
    fitBtn: document.querySelector('#fitBtn'),
    zoomInBtn: document.querySelector('#zoomInBtn'),
    zoomOutBtn: document.querySelector('#zoomOutBtn'),
    selectAllBtn: document.querySelector('#selectAllBtn'),
    clearBtn: document.querySelector('#clearBtn'),
    detailPanel: document.querySelector('#detailPanel'),
    detailType: document.querySelector('#detailType'),
    detailTitle: document.querySelector('#detailTitle'),
    detailDates: document.querySelector('#detailDates'),
    detailSummary: document.querySelector('#detailSummary'),
    detailTags: document.querySelector('#detailTags'),
    detailWorks: document.querySelector('#detailWorks'),
    detailIdeas: document.querySelector('#detailIdeas'),
    detailSources: document.querySelector('#detailSources'),
    closeDetails: document.querySelector('#closeDetails')
  };

  let people = [];
  let selected = new Set();
  let baseDomain = [-500, 1800];
  let currentDomain = [...baseDomain];
  let initialized = false;
  let domainAnimationFrame = null;

  const margin = { top: 54, right: 28, bottom: 40, left: 138 };
  const rowHeight = 86;

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  const fmtYear = y => {
    if (y < 0) return Math.abs(Math.round(y)) + ' p.n.e.';
    return Math.round(y) + ' n.e.';
  };

  const fmtLife = p => `${fmtYear(p.born.year)} – ${fmtYear(p.died.year)}`;

  async function loadPeople() {
    const manifest = await fetch('./people/index.json').then(r => r.json());
    people = await Promise.all(manifest.people.map(async filename => {
      const text = await fetch('./people/' + filename).then(r => r.text());
      return jsyaml.load(text);
    }));
    people.sort((a,b) => a.born.year - b.born.year);
    els.peopleCount.textContent = `${people.length} osób`;
    baseDomain = [
      Math.min(...people.map(p => p.born.year)) - 70,
      Math.max(...people.map(p => p.died.year)) + 70
    ];
    currentDomain = [...baseDomain];
    renderPeopleList();

    // A useful first view: Newton, Leibniz, Locke, Voltaire.
    ['newton','leibniz','locke','voltaire'].forEach(id => selected.add(id));
    syncChecks();
    fitSelected(false);
    initialized = true;
    render();
  }

  function renderPeopleList() {
    els.peopleList.innerHTML = people.map(p => `
      <label class="person-option">
        <input type="checkbox" value="${p.id}">
        <span><strong>${p.display_name}</strong><small>${fmtLife(p)}</small></span>
      </label>
    `).join('');
    els.peopleList.addEventListener('change', e => {
      if (!e.target.matches('input[type=checkbox]')) return;
      const id = e.target.value;
      const person = people.find(p => p.id === id);

      if (e.target.checked) {
        selected.add(id);
        // If the newly selected life falls outside the current view,
        // smoothly zoom out just enough to reveal it without destroying context.
        if (person && (person.born.year < currentDomain[0] || person.died.year > currentDomain[1])) {
          expandDomainToInclude(person, true);
        } else {
          render();
        }
      } else {
        selected.delete(id);
        render();
      }
    });
  }

  function syncChecks() {
    els.peopleList.querySelectorAll('input[type=checkbox]').forEach(input => {
      input.checked = selected.has(input.value);
    });
  }

  function getSelected() {
    return people.filter(p => selected.has(p.id)).sort((a,b) => a.born.year - b.born.year);
  }

  function setDomain(target, animate = true, duration = 520) {
    const minSpan = 10;
    const maxSpan = 3200;
    let [a,b] = target;
    const center = (a+b)/2;
    let span = Math.max(minSpan, Math.min(maxSpan, b-a));
    a = center - span/2;
    b = center + span/2;

    if (domainAnimationFrame) {
      cancelAnimationFrame(domainAnimationFrame);
      domainAnimationFrame = null;
    }

    if (!animate) {
      currentDomain = [a,b];
      render();
      return;
    }

    const from = [...currentDomain];
    const started = performance.now();
    const ease = d3.easeCubicInOut;

    const tick = now => {
      const t = Math.min(1, (now-started)/duration);
      const k = ease(t);
      currentDomain = [
        from[0] + (a-from[0])*k,
        from[1] + (b-from[1])*k
      ];
      render();
      if (t < 1) {
        domainAnimationFrame = requestAnimationFrame(tick);
      } else {
        currentDomain = [a,b];
        domainAnimationFrame = null;
        render();
      }
    };
    domainAnimationFrame = requestAnimationFrame(tick);
  }

  function expandDomainToInclude(person, animate = true) {
    const min = Math.min(currentDomain[0], person.born.year);
    const max = Math.max(currentDomain[1], person.died.year);
    const span = Math.max(30, max-min);
    const pad = Math.max(10, span*.055);
    setDomain([min-pad, max+pad], animate, 620);
  }

  function fitSelected(animate = true) {
    const chosen = getSelected();
    let target;
    if (!chosen.length) {
      target = [...baseDomain];
    } else {
      const min = Math.min(...chosen.map(p => p.born.year));
      const max = Math.max(...chosen.map(p => p.died.year));
      const span = Math.max(30, max - min);
      const pad = Math.max(12, span * .08);
      target = [min - pad, max + pad];
    }
    setDomain(target, animate);
  }

  function zoom(factor, anchor = null) {
    const [a,b] = currentDomain;
    const focus = anchor == null ? (a+b)/2 : anchor;
    const nextA = focus - (focus-a)*factor;
    const nextB = focus + (b-focus)*factor;
    setDomain([nextA,nextB], true, 260);
  }

  function showTooltip(evt, title, body='') {
    tooltip.innerHTML = `<b>${title}</b>${body}`;
    tooltip.style.left = Math.min(window.innerWidth-320, evt.clientX+14) + 'px';
    tooltip.style.top = Math.min(window.innerHeight-110, evt.clientY+14) + 'px';
    tooltip.classList.add('show');
  }
  const hideTooltip = () => tooltip.classList.remove('show');

  function openPerson(p) {
    els.detailType.textContent = 'OSOBA';
    els.detailTitle.textContent = p.display_name;
    els.detailDates.textContent = fmtLife(p);
    els.detailSummary.textContent = p.summary || '';
    els.detailTags.innerHTML = (p.fields || []).map(x => `<span class="tag">${String(x).replaceAll('_',' ')}</span>`).join('');
    els.detailWorks.innerHTML = (p.works || []).length ? p.works.map(w => `
      <div class="detail-item">
        <strong>${w.title}</strong>
        <span>${fmtYear(w.year)} · ${w.type || 'dzieło'}${w.posthumous ? ' · pośmiertnie' : ''}</span>
        ${w.dating_note ? `<p>${w.dating_note}</p>` : ''}
        ${w.publication_note ? `<p>${w.publication_note}</p>` : ''}
      </div>
    `).join('') : '<div class="detail-item"><span>Brak zachowanych dzieł własnych w tym rekordzie.</span></div>';
    els.detailIdeas.innerHTML = (p.ideas || []).map(i => `
      <div class="detail-item"><strong>${i.name}</strong><p>${i.summary || ''}</p></div>
    `).join('');
    els.detailSources.innerHTML = (p.sources || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>`).join('');
    els.detailPanel.classList.remove('hidden');
    els.detailPanel.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  function openMarker(p, item, type) {
    openPerson(p);
    els.detailType.textContent = type === 'work' ? 'DZIEŁO' : 'WYDARZENIE';
    els.detailTitle.textContent = item.title;
    els.detailDates.textContent = fmtYear(item.year);
    els.detailSummary.textContent = item.summary || item.dating_note || item.publication_note || `Związane z: ${p.display_name}`;
  }

  function render(animate = false) {
    const chosen = getSelected();
    els.selectedCount.textContent = chosen.length;
    els.empty.style.display = chosen.length ? 'none' : 'flex';

    const width = Math.max(640, els.viewport.clientWidth);
    const height = Math.max(610, margin.top + margin.bottom + chosen.length * rowHeight);
    els.svg.attr('viewBox', `0 0 ${width} ${height}`).attr('height', height);

    const x = d3.scaleLinear().domain(currentDomain).range([margin.left, width-margin.right]);

    els.rangeLabel.textContent = `${fmtYear(currentDomain[0])} — ${fmtYear(currentDomain[1])}`;
    const fullSpan = Math.max(1, baseDomain[1]-baseDomain[0]);
    const currentSpan = Math.max(1, currentDomain[1]-currentDomain[0]);
    els.zoomReadout.textContent = Math.round(fullSpan/currentSpan*100) + '%';

    const ticks = Math.max(4, Math.floor((width-margin.left-margin.right)/100));
    const tickVals = x.ticks(ticks);

    const root = els.svg.selectAll('g.root').data([null]).join('g').attr('class','root');

    root.selectAll('line.cursor-guide').data([null]).join('line')
      .attr('class','cursor-guide')
      .attr('y1', margin.top-18)
      .attr('y2', height-margin.bottom)
      .style('display','none');

    root.selectAll('text.cursor-date').data([null]).join('text')
      .attr('class','cursor-date')
      .attr('y', margin.top-27)
      .style('display','none');

    root.selectAll('g.grid').data([null]).join('g')
      .attr('class','grid')
      .attr('transform', `translate(0,${margin.top-18})`)
      .call(d3.axisBottom(x).tickValues(tickVals).tickSize(height-margin.top-margin.bottom+12).tickFormat(''))
      .call(g => g.select('.domain').remove());

    root.selectAll('g.axis').data([null]).join('g')
      .attr('class','axis')
      .attr('transform', `translate(0,${margin.top-18})`)
      .call(d3.axisTop(x).tickValues(tickVals).tickFormat(fmtYear).tickSizeOuter(0));

    const rows = root.selectAll('g.person-row').data(chosen, d => d.id);
    rows.exit().remove();
    const rowsEnter = rows.enter().append('g').attr('class','person-row');
    rowsEnter.append('text').attr('class','life-row-label');
    rowsEnter.append('text').attr('class','life-row-dates');
    rowsEnter.append('rect').attr('class','life-bar').attr('rx',10).attr('ry',10);
    rowsEnter.append('circle').attr('class','life-cap start').attr('r',3.5);
    rowsEnter.append('circle').attr('class','life-cap end').attr('r',3.5);
    rowsEnter.append('g').attr('class','markers');

    const merged = rowsEnter.merge(rows)
      .attr('transform', (d,i) => `translate(0,${margin.top + i*rowHeight})`);

    merged.select('.life-row-label')
      .attr('x', 16).attr('y', 24).text(d => d.display_name)
      .on('click', (e,d) => openPerson(d))
      .style('cursor','pointer');

    merged.select('.life-row-dates')
      .attr('x',16).attr('y',41).text(d => fmtLife(d));

    merged.select('.life-bar')
      .attr('x', d => x(d.born.year))
      .attr('y', 8)
      .attr('width', d => Math.max(3, x(d.died.year)-x(d.born.year)))
      .attr('height', 34)
      .on('mousemove', (e,d) => showTooltip(e, d.display_name, `${fmtLife(d)}<br>${d.summary || ''}`))
      .on('mouseleave', hideTooltip)
      .on('click', (e,d) => openPerson(d));

    merged.select('.start').attr('cx',d => x(d.born.year)).attr('cy',25);
    merged.select('.end').attr('cx',d => x(d.died.year)).attr('cy',25);

    merged.each(function(p) {
      const items = [
        ...(p.works || []).map(w => ({...w, markerType:'work'})),
        ...(p.events || []).map(e => ({...e, markerType:'event'}))
      ].filter(d => Number.isFinite(+d.year));

      const g = d3.select(this).select('.markers');
      const marks = g.selectAll('g.marker').data(items, d => d.markerType + ':' + d.title + ':' + d.year);
      marks.exit().remove();
      const enter = marks.enter().append('g').attr('class','marker').style('cursor','pointer');
      enter.append('circle').attr('r',5);
      enter.append('text').attr('class','marker-label').attr('y',62);

      const mm = enter.merge(marks).attr('transform', d => `translate(${x(d.year)},0)`);
      mm.select('circle')
        .attr('cy',50)
        .attr('class', d => d.markerType === 'work' ? 'marker-work' : 'marker-event');

      mm.select('text')
        .attr('x', 8)
        .text(d => {
          const visible = d.year >= currentDomain[0] && d.year <= currentDomain[1];
          return visible && currentDomain[1]-currentDomain[0] < 320 ? d.title.slice(0,34) : '';
        });

      mm.on('mousemove', (e,d) => showTooltip(e, d.title, `${fmtYear(d.year)} · ${d.markerType === 'work' ? 'dzieło' : 'wydarzenie'}<br>${d.summary || d.dating_note || ''}`))
        .on('mouseleave', hideTooltip)
        .on('click', (e,d) => openMarker(p,d,d.markerType));
    });

    bindPanAndWheel(width);
  }

  let dragStartX = null;
  let dragStartDomain = null;
  function bindPanAndWheel(width) {
    const node = els.viewport;
    const svgNode = els.svg.node();

    const pointerYear = e => {
      const [px] = d3.pointer(e, svgNode);
      const clampedX = Math.max(margin.left, Math.min(width-margin.right, px));
      const scale = d3.scaleLinear().domain(currentDomain).range([margin.left, width-margin.right]);
      return { year: scale.invert(clampedX), x: clampedX };
    };

    const showCursorGuide = e => {
      if (dragStartX != null) return;
      const {year,x} = pointerYear(e);
      const root = els.svg.select('g.root');
      root.select('.cursor-guide').attr('x1',x).attr('x2',x).style('display',null);
      root.select('.cursor-date')
        .attr('x', Math.min(width-margin.right-56, Math.max(margin.left+4, x+7)))
        .text(fmtYear(year))
        .style('display',null);
    };

    const hideCursorGuide = () => {
      const root = els.svg.select('g.root');
      root.select('.cursor-guide').style('display','none');
      root.select('.cursor-date').style('display','none');
    };

    node.onwheel = e => {
      e.preventDefault();
      if (domainAnimationFrame) {
        cancelAnimationFrame(domainAnimationFrame);
        domainAnimationFrame = null;
      }

      // Zoom is anchored exactly on the date under the mouse cursor.
      const {year: anchor} = pointerYear(e);
      const [a,b] = currentDomain;
      const factor = e.deltaY > 0 ? 1.16 : .86;
      const na = anchor - (anchor-a)*factor;
      const nb = anchor + (b-anchor)*factor;
      const span = nb-na;
      if (span >= 10 && span <= 3200) {
        currentDomain = [na,nb];
        render();
      }
    };

    node.onpointerdown = e => {
      if (e.target.closest?.('.marker') || e.target.classList?.contains('life-bar') || e.target.classList?.contains('life-row-label')) return;
      if (domainAnimationFrame) {
        cancelAnimationFrame(domainAnimationFrame);
        domainAnimationFrame = null;
      }
      dragStartX = e.clientX;
      dragStartDomain = [...currentDomain];
      hideCursorGuide();
      node.setPointerCapture?.(e.pointerId);
    };

    node.onpointermove = e => {
      if (dragStartX == null) {
        showCursorGuide(e);
        return;
      }
      const pxSpan = Math.max(1, node.clientWidth-margin.left-margin.right);
      const yearsPerPx = (dragStartDomain[1]-dragStartDomain[0])/pxSpan;
      const dy = (dragStartX-e.clientX)*yearsPerPx;
      currentDomain = [dragStartDomain[0]+dy, dragStartDomain[1]+dy];
      render();
    };

    node.onpointerleave = () => {
      if (dragStartX == null) hideCursorGuide();
    };

    const stop = () => {
      dragStartX=null;
      dragStartDomain=null;
    };
    node.onpointerup = stop;
    node.onpointercancel = stop;
  }

  els.fitBtn.addEventListener('click', () => fitSelected());
  els.zoomInBtn.addEventListener('click', () => zoom(.72));
  els.zoomOutBtn.addEventListener('click', () => zoom(1.38));
  els.selectAllBtn.addEventListener('click', () => {
    people.forEach(p => selected.add(p.id));
    syncChecks();
    fitSelected();
  });
  els.clearBtn.addEventListener('click', () => {
    selected.clear(); syncChecks(); render();
  });
  els.closeDetails.addEventListener('click', () => els.detailPanel.classList.add('hidden'));
  window.addEventListener('resize', () => initialized && render());

  loadPeople().catch(err => {
    console.error(err);
    els.empty.innerHTML = '<strong>Nie udało się wczytać danych.</strong><span>Sprawdź pliki w katalogu people.</span>';
  });
})();
