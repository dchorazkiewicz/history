(() => {
  const els = {
    peopleSearch: document.querySelector('#peopleSearch'),
    clearSearch: document.querySelector('#clearSearch'),
    selectedPeople: document.querySelector('#selectedPeople'),
    peopleResults: document.querySelector('#peopleResults'),
    selectedMiniCount: document.querySelector('#selectedMiniCount'),
    resultsLabel: document.querySelector('#resultsLabel'),
    resultsCount: document.querySelector('#resultsCount'),
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
    clearBtn: document.querySelector('#clearBtn'),
    detailPanel: document.querySelector('#detailPanel'),
    detailType: document.querySelector('#detailType'),
    detailTitle: document.querySelector('#detailTitle'),
    detailDates: document.querySelector('#detailDates'),
    detailLinks: document.querySelector('#detailLinks'),
    detailSummary: document.querySelector('#detailSummary'),
    detailTags: document.querySelector('#detailTags'),
    detailWorks: document.querySelector('#detailWorks'),
    detailIdeas: document.querySelector('#detailIdeas'),
    detailSources: document.querySelector('#detailSources'),
    closeDetails: document.querySelector('#closeDetails')
  };

  let people = [];
  let periods = [];
  let selected = new Set();
  let baseDomain = [-500, 1800];
  let currentDomain = [...baseDomain];
  let initialized = false;
  let domainAnimationFrame = null;

  const margin = { top: 54, right: 28, bottom: 190, left: 138 };
  const rowHeight = 86;

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  const fmtYear = y => {
    if (y < 0) return Math.abs(Math.round(y)) + ' p.n.e.';
    return Math.round(y) + ' n.e.';
  };

  const currentYear = new Date().getFullYear();
  const lifeEndYear = p => Number(p?.died?.year ?? currentYear);
  const fmtLife = p => p.died?.year
    ? `${fmtYear(p.born.year)} – ${fmtYear(p.died.year)}`
    : `${fmtYear(p.born.year)} – żyje`;

  const fieldLabels = {
    philosophy: 'filozofia',
    ethics: 'etyka',
    epistemology: 'epistemologia',
    metaphysics: 'metafizyka',
    political_philosophy: 'filozofia polityki',
    logic: 'logika',
    natural_philosophy: 'filozofia przyrody',
    biology: 'biologia',
    politics: 'polityka',
    rhetoric: 'retoryka',
    astronomy: 'astronomia',
    mathematics: 'matematyka',
    arithmetic: 'arytmetyka',
    algebra: 'algebra',
    number_theory: 'teoria liczb',
    trigonometry: 'trygonometria',
    surveying: 'miernictwo',
    calendar_science: 'nauka o kalendarzu',
    education: 'nauczanie',
    translation: 'przekład',
    statics: 'statyka',
    geodesy: 'geodezja',
    chronology: 'chronologia',
    anthropology: 'badania kultur',
    mineralogy: 'mineralogia',
    poetry: 'poezja',
    commercial_mathematics: 'matematyka handlowa',
    analysis: 'analiza matematyczna',
    accounting: 'rachunkowość',
    art: 'sztuka',
    perspective: 'perspektywa',
    probability: 'rachunek prawdopodobieństwa',
    cryptanalysis: 'kryptoanaliza',
    complex_numbers: 'liczby zespolone',
    hydraulics: 'hydraulika',
    logarithms: 'logarytmy',
    computational_tools: 'narzędzia obliczeniowe',
    hydrostatics: 'hydrostatyka',
    infinitesimal_calculus: 'rachunek nieskończenie małych',
    cryptography: 'kryptografia',
    horology: 'zegarmistrzostwo',
    differential_equations: 'równania różniczkowe',
    statistics: 'statystyka',
    actuarial_science: 'matematyka ubezpieczeniowa',
    finite_differences: 'różnice skończone',
    music: 'muzyka',
    graph_theory: 'teoria grafów',
    fluid_dynamics: 'mechanika płynów',
    music_theory: 'teoria muzyki',
    encyclopedia: 'encyklopedia',
    calculus_of_variations: 'rachunek wariacyjny',
    celestial_mechanics: 'mechanika nieba',
    metric_system: 'system metryczny',
    thermodynamics: 'termodynamika',
    political_administration: 'administracja państwowa',
    magnetism: 'magnetyzm',
    complex_analysis: 'analiza zespolona',
    group_theory: 'teoria grup',
    field_theory: 'teoria ciał',
    elasticity: 'sprężystość',
    elliptic_functions: 'funkcje eliptyczne',
    potential_theory: 'teoria potencjału',
    university_administration: 'zarządzanie uniwersytetem',
    military_engineering: 'inżynieria wojskowa',
    logic: 'logika',
    philosophy_of_logic: 'filozofia logiki',
    matrix_theory: 'teoria macierzy',
    invariant_theory: 'teoria niezmienników',
    algebraic_geometry: 'geometria algebraiczna',
    publishing: 'działalność wydawnicza',
    differential_geometry: 'geometria różniczkowa',
    mathematical_physics: 'fizyka matematyczna',
    real_analysis: 'analiza rzeczywista',
    foundations_of_mathematics: 'podstawy matematyki',
    set_theory: 'teoria mnogości',
    philosophy_of_mathematics: 'filozofia matematyki',
    university_reform: 'reforma uniwersytetu',
    symmetry: 'symetria',
    dynamical_systems: 'układy dynamiczne',
    relativity: 'teoria względności',
    electromagnetism: 'elektromagnetyzm',
    philosophy_of_science: 'filozofia nauki',
    convex_geometry: 'geometria wypukła',
    spacetime: 'czasoprzestrzeń',
    transcendental_number_theory: 'teoria liczb przestępnych',
    special_functions: 'funkcje specjalne',
    linguistics: 'językoznawstwo',
    constructed_languages: 'języki sztuczne',
    philosophy_of_language: 'filozofia języka',
    measure_theory: 'teoria miary',
    integration: 'całkowanie',
    abstract_algebra: 'algebra abstrakcyjna',
    ring_theory: 'teoria pierścieni',
    theoretical_physics: 'fizyka teoretyczna',
    quantum_mechanics: 'mechanika kwantowa',
    gauge_theory: 'teoria cechowania',
    q_series: 'q-szeregi',
    modular_forms: 'formy modularne',
    continued_fractions: 'ułamki łańcuchowe',
    scientific_organization: 'organizacja nauki',
    model_theory: 'teoria modeli',
    turbulence: 'turbulencja',
    information_theory: 'teoria informacji',
    algorithmic_complexity: 'złożoność algorytmiczna',
    operator_algebras: 'algebry operatorów',
    computer_science: 'informatyka',
    numerical_analysis: 'analiza numeryczna',
    nuclear_physics: 'fizyka jądrowa',
    lambda_calculus: 'rachunek lambda',
    theoretical_computer_science: 'informatyka teoretyczna',
    cryptanalysis: 'kryptoanaliza',
    artificial_intelligence: 'sztuczna inteligencja',
    computer_engineering: 'inżynieria komputerowa',
    mathematical_biology: 'biologia matematyczna',
    stochastic_processes: 'procesy stochastyczne',
    harmonic_analysis: 'analiza harmoniczna',
    cybernetics: 'cybernetyka',
    control_theory: 'teoria sterowania',
    communication_theory: 'teoria komunikacji',
    philosophy_of_technology: 'filozofia techniki',
    electrical_engineering: 'elektrotechnika',
    cellular_automata: 'automaty komórkowe',
    category_theory: 'teoria kategorii',
    sheaf_theory: 'teoria snopów',
    homological_algebra: 'algebra homologiczna',
    distributions: 'dystrybucje',
    partial_differential_equations: 'równania różniczkowe cząstkowe',
    combinatorics: 'kombinatoryka',
    representation_theory: 'teoria reprezentacji',
    algebraic_topology: 'topologia algebraiczna',
    global_analysis: 'analiza globalna',
    differential_topology: 'topologia różniczkowa',
    k_theory: 'K-teoria',
    symplectic_geometry: 'geometria symplektyczna',
    singularity_theory: 'teoria osobliwości',
    analytic_geometry: 'geometria analityczna',
    public_administration: 'administracja publiczna',
    descriptive_geometry: 'geometria wykreślna',
    optimal_transport: 'transport optymalny',
    arithmetic_geometry: 'geometria arytmetyczna',
    p_adic_geometry: 'geometria p-adyczna',
    cohomology: 'kohomologia',
    hodge_theory: 'teoria Hodge’a',
    etale_cohomology: 'kohomologia étale',
    elliptic_curves: 'krzywe eliptyczne',
    galois_representations: 'reprezentacje Galois',
    iwasawa_theory: 'teoria Iwasawy',
    geometric_analysis: 'analiza geometryczna',
    ricci_flow: 'przepływ Ricciego',
    deformation_quantization: 'kwantyzacja deformacyjna',
    mirror_symmetry: 'symetria lustrzana',
    knot_theory: 'teoria węzłów',
    moduli_spaces: 'przestrzenie moduli',
    hyperbolic_geometry: 'geometria hiperboliczna',
    dynamics: 'dynamika',
    teichmuller_theory: 'teoria Teichmüllera',
    compressed_sensing: 'próbkowanie skompresowane',
    homotopy_theory: 'teoria homotopii',
    motivic_cohomology: 'kohomologia motywiczna',
    type_theory: 'teoria typów',
    ramsey_theory: 'teoria Ramseya',
    scientific_collaboration: 'współpraca naukowa',
    automorphic_forms: 'formy automorficzne',
    langlands_program: 'program Langlandsa',
    arithmetic_statistics: 'statystyka arytmetyczna',
    geometry_of_numbers: 'geometria liczb',
    matroid_theory: 'teoria matroidów',
    chemistry: 'chemia',
    pneumatics: 'pneumatyka',
    experimental_science: 'nauka eksperymentalna',
    microscopy: 'mikroskopia',
    architecture: 'architektura',
    geology: 'geologia',
    friction: 'tarcie',
    anatomy: 'anatomia',
    physiology: 'fizjologia',
    electricity: 'elektryczność',
    gravitation: 'grawitacja',
    wave_optics: 'optyka falowa',
    color_science: 'nauka o barwie',
    fluorescence: 'fluorescencja',
    physical_chemistry: 'chemia fizyczna',
    vector_analysis: 'analiza wektorowa',
    wave_theory: 'teoria fal',
    interferometry: 'interferometria',
    metrology: 'metrologia',
    spectroscopy: 'spektroskopia',
    electron_theory: 'teoria elektronu',
    x_rays: 'promieniowanie X',
    radioactivity: 'promieniotwórczość',
    crystallography: 'krystalografia',
    piezoelectricity: 'piezoelektryczność',
    atomic_physics: 'fizyka atomowa',
    mass_spectrometry: 'spektrometria mas',
    quantum_theory: 'teoria kwantowa',
    radiation_theory: 'teoria promieniowania',
    cosmology: 'kosmologia',
    photoelectric_effect: 'efekt fotoelektryczny',
    low_temperature_physics: 'fizyka niskich temperatur',
    superconductivity: 'nadprzewodnictwo',
    wave_mechanics: 'mechanika falowa',
    quantum_field_theory: 'kwantowa teoria pola',
    particle_physics: 'fizyka cząstek',
    experimental_physics: 'fizyka eksperymentalna',
    condensed_matter_physics: 'fizyka materii skondensowanej',
    molecular_beams: 'wiązki molekularne',
    astrophysics: 'astrofizyka',
    quantum_electrodynamics: 'elektrodynamika kwantowa',
    scientific_administration: 'zarządzanie nauką',
    stellar_structure: 'struktura gwiazd',
    string_theory: 'teoria strun',
    electrodynamics: 'elektrodynamika',
    electrochemistry: 'elektrochemia',
    telegraphy: 'telegrafia',
    geophysics: 'geofizyka',
    kinetic_theory: 'teoria kinetyczna',
    acoustics: 'akustyka',
    public_administration: 'administracja publiczna',
    geography: 'geografia',
    optics: 'optyka',
    astrology: 'astrologia',
    physics: 'fizyka',
    mechanics: 'mechanika',
    engineering: 'inżynieria',
    economics: 'ekonomia',
    canon_law: 'prawo kanoniczne',
    medicine: 'medycyna',
    history: 'historia',
    geometry: 'geometria',
    theology: 'teologia',
    law: 'prawo',
    diplomacy: 'dyplomacja',
    literature: 'literatura',
    public_intellectual: 'działalność publiczna'
  };

  const typeLabels = {
    dialogue: 'dialog filozoficzny',
    treatise: 'traktat',
    mathematical_treatise: 'traktat matematyczny',
    scientific_treatise: 'traktat naukowy',
    astronomical_treatise: 'traktat astronomiczny',
    geography: 'dzieło geograficzne',
    manuscript: 'rękopis',
    economic_treatise: 'traktat ekonomiczny',
    book: 'książka',
    mathematical_essay: 'esej matematyczny',
    essay: 'esej',
    philosophical_tale: 'powiastka filozoficzna',
    reference_work: 'dzieło encyklopedyczne',
    poetry: 'poezja',
    literature: 'literatura',
    philosophy: 'filozofia',
    theology: 'teologia',
    autobiography: 'autobiografia',
    collected_works: 'dzieła zebrane',
    technical_report: 'raport techniczny',
    preprint: 'preprint'
  };

  const fieldLabel = x => fieldLabels[x] || String(x).replaceAll('_',' ');
  const typeLabel = x => typeLabels[x] || x || 'dzieło';

  async function loadPeopleData() {
    // Production path: one generated catalog, regardless of whether there are
    // 20 or 2000 YAML files. The deploy workflow rebuilds it automatically.
    try {
      const response = await fetch('./people/catalog.json', { cache: 'no-store' });
      if (response.ok) {
        const catalog = await response.json();
        if (Array.isArray(catalog.people)) return catalog.people;
      }
    } catch (err) {
      console.warn('catalog.json unavailable, using YAML fallback', err);
    }

    // Local/development fallback.
    const manifest = await fetch('./people/index.json', { cache: 'no-store' }).then(r => r.json());
    return Promise.all(manifest.people.map(async filename => {
      const text = await fetch('./people/' + filename, { cache: 'no-store' }).then(r => r.text());
      return jsyaml.load(text);
    }));
  }

  async function loadPeriodsData() {
    try {
      const response = await fetch('./periods/epochs.yaml', { cache: 'no-store' });
      if (!response.ok) return [];
      const text = await response.text();
      const data = jsyaml.load(text);
      return Array.isArray(data?.periods) ? data.periods : [];
    } catch (err) {
      console.warn('Nie udało się wczytać epok', err);
      return [];
    }
  }

  async function loadPeople() {
    const [loadedPeople, loadedPeriods] = await Promise.all([
      loadPeopleData(),
      loadPeriodsData()
    ]);
    people = loadedPeople;
    periods = loadedPeriods;
    people = people.filter(p => p && p.id && p.born);
    people.sort((a,b) => a.born.year - b.born.year);
    els.peopleCount.textContent = `${people.length} osób`;
    const periodStarts = periods.map(p => Number(p.start_year)).filter(Number.isFinite);
    const periodEnds = periods.map(p => Number(p.end_year)).filter(Number.isFinite);
    baseDomain = [
      Math.min(...people.map(p => p.born.year), ...periodStarts) - 40,
      Math.max(...people.map(lifeEndYear), ...periodEnds, currentYear) + 20
    ];
    currentDomain = [...baseDomain];

    // Start with a compact cross-section of the Scientific Revolution and Enlightenment.
    ['copernicus','galileo','descartes','newton','leibniz','voltaire'].forEach(id => {
      if (people.some(p => p.id === id)) selected.add(id);
    });

    setupPeopleSelector();
    renderPeopleSelector();
    fitSelected(false);
    initialized = true;
    render();
  }

  const normalizeText = value => String(value || '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLocaleLowerCase('pl');

  function searchableText(p) {
    return normalizeText([
      p.display_name,
      p.name,
      p.place_association,
      ...(p.fields || []).map(fieldLabel),
      ...(p.works || []).flatMap(w => [w.title, w.original_title]),
      ...(p.ideas || []).flatMap(i => [i.name, i.original_name])
    ].filter(Boolean).join(' '));
  }

  function workWord(n) {
    return n === 1 ? 'dzieło' : (n >= 2 && n <= 4 ? 'dzieła' : 'dzieł');
  }

  function ideaWord(n) {
    return n === 1 ? 'idea' : (n >= 2 && n <= 4 ? 'idee' : 'idei');
  }

  function addPerson(id) {
    const person = people.find(p => p.id === id);
    if (!person || selected.has(id)) return;
    selected.add(id);
    renderPeopleSelector();

    if (person.born.year < currentDomain[0] || lifeEndYear(person) > currentDomain[1]) {
      expandDomainToInclude(person, true);
    } else {
      render();
    }
  }

  function removePerson(id) {
    if (!selected.has(id)) return;
    selected.delete(id);
    renderPeopleSelector();
    render();
  }

  function renderPeopleSelector() {
    const chosen = people
      .filter(p => selected.has(p.id))
      .sort((a,b) => a.display_name.localeCompare(b.display_name, 'pl'));

    els.selectedMiniCount.textContent = chosen.length;
    els.selectedCount.textContent = chosen.length;

    els.selectedPeople.innerHTML = chosen.length ? chosen.map(p => `
      <button class="selected-person" data-remove-person="${p.id}" title="Usuń z porównania">
        <span>
          <strong>${p.display_name}</strong>
          <small>${fmtLife(p)}</small>
        </span>
        <span class="selected-remove" aria-hidden="true">×</span>
      </button>
    `).join('') : `
      <div class="selector-empty">Nie wybrano jeszcze żadnej osoby.</div>
    `;

    const query = normalizeText(els.peopleSearch.value.trim());
    const available = people
      .filter(p => !selected.has(p.id))
      .filter(p => !query || searchableText(p).includes(query))
      .sort((a,b) => a.display_name.localeCompare(b.display_name, 'pl'));

    const visible = available.slice(0, 24);
    els.resultsLabel.textContent = query ? 'Wyniki wyszukiwania' : 'Dodaj kolejną osobę';
    els.resultsCount.textContent = available.length > visible.length
      ? `${visible.length} z ${available.length}`
      : String(available.length);

    els.peopleResults.innerHTML = visible.length ? visible.map(p => {
      const works = (p.works || []).length;
      const ideas = (p.ideas || []).length;
      return `
        <button class="person-result" data-add-person="${p.id}">
          <span class="result-main">
            <strong>${p.display_name}</strong>
            <small>${fmtLife(p)}</small>
            <small class="person-stats">${works} ${workWord(works)} · ${ideas} ${ideaWord(ideas)}</small>
          </span>
          <span class="result-add" aria-hidden="true">+</span>
        </button>
      `;
    }).join('') : `
      <div class="selector-empty">${query ? 'Brak pasujących osób.' : 'Wszystkie osoby są już wybrane.'}</div>
    `;
  }

  function setupPeopleSelector() {
    els.peopleSearch.addEventListener('input', renderPeopleSelector);
    els.clearSearch.addEventListener('click', () => {
      els.peopleSearch.value = '';
      els.peopleSearch.focus();
      renderPeopleSelector();
    });

    els.peopleResults.addEventListener('click', e => {
      const button = e.target.closest('[data-add-person]');
      if (button) addPerson(button.dataset.addPerson);
    });

    els.selectedPeople.addEventListener('click', e => {
      const button = e.target.closest('[data-remove-person]');
      if (button) removePerson(button.dataset.removePerson);
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
    const max = Math.max(currentDomain[1], lifeEndYear(person));
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
      const max = Math.max(...chosen.map(lifeEndYear));
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
    // On touch devices a tap opens the details panel; don't leave a synthetic
    // hover card covering the timeline.
    if (evt.pointerType === 'touch') return;

    tooltip.innerHTML = `<b>${title}</b>${body}`;
    tooltip.classList.add('show');

    const pad = 12;
    const maxWidth = Math.min(320, window.innerWidth - pad * 2);
    tooltip.style.maxWidth = maxWidth + 'px';

    const box = tooltip.getBoundingClientRect();
    const left = Math.max(
      pad,
      Math.min(window.innerWidth - box.width - pad, evt.clientX + 14)
    );
    const top = Math.max(
      pad,
      Math.min(window.innerHeight - box.height - pad, evt.clientY + 14)
    );

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }
  const hideTooltip = () => tooltip.classList.remove('show');

  const wikiCache = new Map();

  function wikipediaSearchUrl(lang, query) {
    return `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
  }

  async function resolveWikipedia(plQuery, enQuery, explicitUrl = null) {
    if (explicitUrl) {
      const lang = explicitUrl.includes('pl.wikipedia.org') ? 'PL'
        : explicitUrl.includes('en.wikipedia.org') ? 'EN' : '';
      return { url: explicitUrl, lang };
    }

    const key = `${plQuery}||${enQuery}`;
    if (wikiCache.has(key)) return wikiCache.get(key);

    const promise = (async () => {
      for (const [lang, query] of [['pl', plQuery], ['en', enQuery || plQuery]]) {
        if (!query) continue;
        try {
          const api = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`;
          const response = await fetch(api);
          if (!response.ok) continue;
          const data = await response.json();
          const hit = data?.query?.search?.[0];
          if (hit?.title) {
            return {
              url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(hit.title.replaceAll(' ', '_'))}`,
              lang: lang.toUpperCase()
            };
          }
        } catch (err) {
          console.warn('Wikipedia lookup failed', lang, query, err);
        }
      }
      return {
        url: wikipediaSearchUrl('pl', plQuery || enQuery || ''),
        lang: 'PL'
      };
    })();

    wikiCache.set(key, promise);
    return promise;
  }

  function wikiAnchor(plQuery, enQuery, explicitUrl = null, label = 'Wikipedia') {
    const attrs = [
      `data-wiki-pl="${encodeURIComponent(plQuery || '')}"`,
      `data-wiki-en="${encodeURIComponent(enQuery || plQuery || '')}"`
    ];
    if (explicitUrl) attrs.push(`data-wiki-url="${encodeURIComponent(explicitUrl)}"`);

    return `<a class="resource-link wiki-resolve" href="${wikipediaSearchUrl('pl', plQuery || enQuery || '')}" target="_blank" rel="noopener" ${attrs.join(' ')}>${label}…</a>`;
  }

  async function hydrateWikiLinks(root) {
    const scope = root || document;
    const links = [...scope.querySelectorAll('.wiki-resolve')];
    await Promise.all(links.map(async link => {
      const plQuery = decodeURIComponent(link.dataset.wikiPl || '');
      const enQuery = decodeURIComponent(link.dataset.wikiEn || plQuery);
      const explicitUrl = link.dataset.wikiUrl ? decodeURIComponent(link.dataset.wikiUrl) : null;
      const resolved = await resolveWikipedia(plQuery, enQuery, explicitUrl);
      link.href = resolved.url;
      link.textContent = `Wikipedia ${resolved.lang || ''} ↗`.trim();
      link.classList.remove('wiki-resolve');
    }));
  }

  function explicitWiki(item) {
    return item?.wikipedia || item?.wikipedia_url || null;
  }

  function explicitResourceLinks(item) {
    const links = [];
    const wiki = explicitWiki(item);
    if (wiki) {
      const lang = wiki.includes('pl.wikipedia.org') ? 'PL'
        : wiki.includes('en.wikipedia.org') ? 'EN' : '';
      links.push(`<a class="resource-link" href="${wiki}" target="_blank" rel="noopener">Wikipedia ${lang} ↗</a>`);
    }
    for (const link of (item?.links || [])) {
      links.push(`<a class="resource-link" href="${link.url}" target="_blank" rel="noopener">${link.title || 'Źródło'} ↗</a>`);
    }
    return links.join('');
  }

  function openPerson(p) {
    els.detailType.textContent = 'OSOBA';
    els.detailTitle.textContent = p.display_name;
    els.detailDates.textContent = fmtLife(p);
    els.detailSummary.textContent = p.summary || '';

    // The general Wikipedia link belongs to the person and is shown exactly once.
    els.detailLinks.innerHTML = wikiAnchor(
      p.display_name,
      p.name || p.display_name,
      explicitWiki(p),
      'Wikipedia'
    );

    els.detailTags.innerHTML = (p.fields || [])
      .map(x => `<span class="tag">${fieldLabel(x)}</span>`)
      .join('');

    els.detailWorks.innerHTML = (p.works || []).length ? p.works.map(w => {
      const links = explicitResourceLinks(w);
      return `
        <div class="detail-item">
          <strong>${w.title}</strong>
          ${w.original_title && w.original_title !== w.title ? `<span class="original-title">oryg. ${w.original_title}</span>` : ''}
          <span>${fmtYear(w.year)} · ${typeLabel(w.type)}${w.posthumous ? ' · wydane pośmiertnie' : ''}</span>
          ${w.dating_note ? `<p>${w.dating_note}</p>` : ''}
          ${w.publication_note ? `<p>${w.publication_note}</p>` : ''}
          ${links ? `<div class="resource-row">${links}</div>` : ''}
        </div>
      `;
    }).join('') : '<div class="detail-item"><span>Brak zachowanych dzieł własnych w tym rekordzie.</span></div>';

    els.detailIdeas.innerHTML = (p.ideas || []).map(i => {
      const links = explicitResourceLinks(i);
      return `
        <div class="detail-item">
          <strong>${i.name}</strong>
          ${i.original_name && i.original_name !== i.name ? `<span class="original-title">oryg. ${i.original_name}</span>` : ''}
          <p>${i.summary || ''}</p>
          ${links ? `<div class="resource-row">${links}</div>` : ''}
        </div>
      `;
    }).join('');

    els.detailSources.innerHTML = (p.sources || []).map(source =>
      `<a class="source-link" href="${source.url}" target="_blank" rel="noopener">${source.title} ↗</a>`
    ).join('');

    els.detailPanel.classList.remove('hidden');
    hydrateWikiLinks(els.detailLinks);
    els.detailPanel.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  function openMarker(p, item, type) {
    openPerson(p);
    els.detailType.textContent = type === 'work' ? 'DZIEŁO' : 'WYDARZENIE';
    els.detailTitle.textContent = item.title;
    els.detailDates.textContent = fmtYear(item.year);
    els.detailSummary.textContent = item.summary || item.dating_note || item.publication_note || `Związane z: ${p.display_name}`;

    const itemLinks = explicitResourceLinks(item);
    els.detailLinks.innerHTML = itemLinks || '';

    if (item.original_title && item.original_title !== item.title) {
      els.detailTags.innerHTML = `<span class="tag">oryg. ${item.original_title}</span>` + els.detailTags.innerHTML;
    }
  }

  function renderPeriods(root, x, height) {
    const bandTop = height - margin.bottom + 14;
    const laneY = lane => bandTop + 24 + (Number(lane || 0) * 23);
    const trackLabels = [
      { lane:0, label:'RAMY HISTORYCZNE' },
      { lane:1, label:'KULTURA / SZTUKA / LITERATURA' },
      { lane:4, label:'IDEE / FILOZOFIA' },
      { lane:5, label:'NAUKA' }
    ];

    const visible = periods.filter(period => {
      const start = Number(period.start_year);
      const end = Number(period.end_year);
      return Number.isFinite(start) && Number.isFinite(end)
        && end >= currentDomain[0]
        && start <= currentDomain[1];
    });

    const band = root.selectAll('g.period-band')
      .data([null])
      .join('g')
      .attr('class','period-band');

    band.selectAll('text.period-band-title')
      .data([null])
      .join('text')
      .attr('class','period-band-title')
      .attr('x',16)
      .attr('y',bandTop + 7)
      .text('EPOKI I NURTY · DATY ORIENTACYJNE · NURTY MOGĄ SIĘ NAKŁADAĆ');

    band.selectAll('text.period-track-label')
      .data(trackLabels, d => d.lane)
      .join('text')
      .attr('class','period-track-label')
      .attr('x',16)
      .attr('y',d => laneY(d.lane) + 11)
      .text(d => d.label);

    const entries = band.selectAll('g.period-entry')
      .data(visible, d => d.id);

    entries.exit().remove();

    const enter = entries.enter()
      .append('g')
      .attr('class', d => `period-entry period-${d.kind || 'movement'} track-${d.track || 'other'}`)
      .style('cursor','pointer');

    enter.append('rect')
      .attr('class','period-rect')
      .attr('rx',5)
      .attr('ry',5);

    enter.append('text')
      .attr('class','period-label');

    const merged = enter.merge(entries)
      .attr('class', d => `period-entry period-${d.kind || 'movement'} track-${d.track || 'other'}`);

    merged.each(function(d) {
      const start = Math.max(Number(d.start_year), currentDomain[0]);
      const end = Math.min(Number(d.end_year), currentDomain[1]);
      const left = x(start);
      const right = x(end);
      const width = Math.max(1, right-left);
      const y = laneY(d.lane);

      const g = d3.select(this);
      g.select('.period-rect')
        .attr('x',left)
        .attr('y',y)
        .attr('width',width)
        .attr('height',17);

      g.select('.period-label')
        .attr('x',left + width/2)
        .attr('y',y + 12)
        .attr('text-anchor','middle')
        .text(width >= 58 ? (d.short_label || d.label) : '');
    });

    merged
      .on('pointermove', (e,d) => showTooltip(
        e,
        d.label,
        `${fmtYear(d.start_year)} – ${fmtYear(d.end_year)}${d.scope ? `<br>${d.scope}` : ''}${d.note ? `<br>${d.note}` : ''}`
      ))
      .on('pointerleave', hideTooltip)
      .on('click', (e,d) => {
        e.stopPropagation();
        hideTooltip();
        const span = Math.max(20, Number(d.end_year)-Number(d.start_year));
        const pad = Math.max(5, span*.04);
        setDomain([Number(d.start_year)-pad, Number(d.end_year)+pad], true, 520);
      });
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
      .attr('width', d => Math.max(3, x(lifeEndYear(d))-x(d.born.year)))
      .attr('height', 34)
      .on('mousemove', (e,d) => showTooltip(e, d.display_name, `${fmtLife(d)}<br>${d.summary || ''}`))
      .on('mouseleave', hideTooltip)
      .on('click', (e,d) => openPerson(d));

    merged.select('.start').attr('cx',d => x(d.born.year)).attr('cy',25);
    merged.select('.end')
      .attr('cx',d => x(lifeEndYear(d)))
      .attr('cy',25)
      .classed('living', d => !d.died?.year);

    merged.each(function(p) {
      const items = [
        ...(p.works || []).map(w => ({...w, markerType:'work'})),
        ...(p.events || []).map(e => ({...e, markerType:'event'}))
      ].filter(d => Number.isFinite(+d.year));

      const g = d3.select(this).select('.markers');
      const marks = g.selectAll('g.marker').data(items, d => d.markerType + ':' + d.title + ':' + d.year);
      marks.exit().remove();

      const enter = marks.enter().append('g')
        .attr('class', d => `marker marker-${d.markerType}`)
        .style('cursor','pointer');

      // Generous invisible hit area: easy to hover with a mouse and easy to tap
      // on a phone, while the visible symbol stays compact.
      enter.append('circle')
        .attr('class','marker-hit')
        .attr('cy',50)
        .attr('r',14);

      enter.append('path')
        .attr('class','marker-symbol')
        .attr('transform','translate(0,50)');

      const mm = enter.merge(marks)
        .attr('class', d => `marker marker-${d.markerType}`)
        .attr('transform', d => `translate(${x(d.year)},0)`);

      mm.select('.marker-symbol')
        .attr('d', d => d3.symbol()
          .type(d.markerType === 'work' ? d3.symbolDiamond : d3.symbolCircle)
          .size(d.markerType === 'work' ? 92 : 78)());

      mm.on('pointermove', (e,d) => showTooltip(
          e,
          d.title,
          `${fmtYear(d.year)} · ${d.markerType === 'work' ? 'dzieło / publikacja' : 'wydarzenie'}<br>${d.summary || d.dating_note || d.publication_note || 'Kliknij, aby zobaczyć szczegóły.'}`
        ))
        .on('pointerleave', hideTooltip)
        .on('click', (e,d) => {
          hideTooltip();
          openMarker(p,d,d.markerType);
        });
    });

    renderPeriods(root, x, height);

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
      if (e.target.closest?.('.marker, .period-entry') || e.target.classList?.contains('life-bar') || e.target.classList?.contains('life-row-label')) return;
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
  els.clearBtn.addEventListener('click', () => {
    selected.clear();
    renderPeopleSelector();
    render();
  });
  els.closeDetails.addEventListener('click', () => els.detailPanel.classList.add('hidden'));
  window.addEventListener('resize', () => initialized && render());

  loadPeople().catch(err => {
    console.error(err);
    els.empty.innerHTML = '<strong>Nie udało się wczytać danych.</strong><span>Sprawdź pliki w katalogu people.</span>';
  });
})();
