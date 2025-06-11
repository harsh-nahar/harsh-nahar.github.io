document.addEventListener('DOMContentLoaded', () => {

    // IMPORTANT: This value MUST match the property key for state names in your in.json file.
    const stateNameProperty = 'name';

    const stateData = {
        'Andaman and Nicobar Islands': { capital: 'Port Blair', emoji: '🏝️', link: 'https://en.wikipedia.org/wiki/Andaman_and_Nicobar_Islands', area: '8,249' },
        'Andhra Pradesh': { capital: 'Amaravati', emoji: '🌶️', link: 'https://en.wikipedia.org/wiki/Andhra_Pradesh', area: '162,975' },
        'Arunachal Pradesh': { capital: 'Itanagar', emoji: '☀️', link: 'https://en.wikipedia.org/wiki/Arunachal_Pradesh', area: '83,743' },
        'Assam': { capital: 'Dispur', emoji: '🦏', link: 'https://en.wikipedia.org/wiki/Assam', area: '78,438' },
        'Bihar': { capital: 'Patna', emoji: '📚', link: 'https://en.wikipedia.org/wiki/Bihar', area: '94,163' },
        'Chandigarh': { capital: 'Chandigarh', emoji: '🏛️', link: 'https://en.wikipedia.org/wiki/Chandigarh', area: '114' },
        'Chhattisgarh': { capital: 'Raipur', emoji: '🏞️', link: 'https://en.wikipedia.org/wiki/Chhattisgarh', area: '135,192' },
        'Dadra and Nagar Haveli and Daman and Diu': { capital: 'Daman', emoji: '🇵🇹', link: 'https://en.wikipedia.org/wiki/Dadra_and_Nagar_Haveli_and_Daman_and_Diu', area: '603' },
        'Delhi': { capital: 'New Delhi', emoji: '🏛️', link: 'https://en.wikipedia.org/wiki/Delhi', area: '1,484' },
        'Goa': { capital: 'Panaji', emoji: '🏖️', link: 'https://en.wikipedia.org/wiki/Goa', area: '3,702' },
        'Gujarat': { capital: 'Gandhinagar', emoji: '🦁', link: 'https://en.wikipedia.org/wiki/Gujarat', area: '196,024' },
        'Haryana': { capital: 'Chandigarh', emoji: '🚜', link: 'https://en.wikipedia.org/wiki/Haryana', area: '44,212' },
        'Himachal Pradesh': { capital: 'Shimla', emoji: '🏔️', link: 'https://en.wikipedia.org/wiki/Himachal_Pradesh', area: '55,673' },
        'Jammu and Kashmir': { capital: 'Srinagar / Jammu', emoji: ' houseboat ', link: 'https://en.wikipedia.org/wiki/Jammu_and_Kashmir_(union_territory)', area: '42,241' },
        'Jharkhand': { capital: 'Ranchi', emoji: '💧', link: 'https://en.wikipedia.org/wiki/Jharkhand', area: '79,716' },
        'Karnataka': { capital: 'Bengaluru', emoji: '🐘', link: 'https://en.wikipedia.org/wiki/Karnataka', area: '191,791' },
        'Kerala': { capital: 'Thiruvananthapuram', emoji: '🌴', link: 'https://en.wikipedia.org/wiki/Kerala', area: '38,863' },
        'Ladakh': { capital: 'Leh', emoji: '🧘', link: 'https://en.wikipedia.org/wiki/Ladakh', area: '59,146' },
        'Lakshadweep': { capital: 'Kavaratti', emoji: '🐠', link: 'https://en.wikipedia.org/wiki/Lakshadweep', area: '32' },
        'Madhya Pradesh': { capital: 'Bhopal', emoji: '🐅', link: 'https://en.wikipedia.org/wiki/Madhya_Pradesh', area: '308,252' },
        'Maharashtra': { capital: 'Mumbai', emoji: '🎬', link: 'https://en.wikipedia.org/wiki/Maharashtra', area: '307,713' },
        'Manipur': { capital: 'Imphal', emoji: '💃', link: 'https://en.wikipedia.org/wiki/Manipur', area: '22,327' },
        'Meghalaya': { capital: 'Shillong', emoji: '☁️', link: 'https://en.wikipedia.org/wiki/Meghalaya', area: '22,429' },
        'Mizoram': { capital: 'Aizawl', emoji: '🎋', link: 'https://en.wikipedia.org/wiki/Mizoram', area: '21,081' },
        'Nagaland': { capital: 'Kohima', emoji: '🦅', link: 'https://en.wikipedia.org/wiki/Nagaland', area: '16,579' },
        'Odisha': { capital: 'Bhubaneswar', emoji: '🛕', link: 'https://en.wikipedia.org/wiki/Odisha', area: '155,707' },
        'Puducherry': { capital: 'Puducherry', emoji: '🇫🇷', link: 'https://en.wikipedia.org/wiki/Puducherry', area: '483' },
        'Punjab': { capital: 'Chandigarh', emoji: '🌾', link: 'https://en.wikipedia.org/wiki/Punjab,_India', area: '50,362' },
        'Rajasthan': { capital: 'Jaipur', emoji: '🐪', link: 'https://en.wikipedia.org/wiki/Rajasthan', area: '342,239' },
        'Sikkim': { capital: 'Gangtok', emoji: '🌸', link: 'https://en.wikipedia.org/wiki/Sikkim', area: '7,096' },
        'Tamil Nadu': { capital: 'Chennai', emoji: 'ക്ഷേത്രം', link: 'https://en.wikipedia.org/wiki/Tamil_Nadu', area: '130,058' },
        'Telangana': { capital: 'Hyderabad', emoji: '💎', link: 'https://en.wikipedia.org/wiki/Telangana', area: '112,077' },
        'Tripura': { capital: 'Agartala', emoji: '🍍', link: 'https://en.wikipedia.org/wiki/Tripura', area: '10,491' },
        'Uttar Pradesh': { capital: 'Lucknow', emoji: '🕌', link: 'https://en.wikipedia.org/wiki/Uttar_Pradesh', area: '240,928' },
        'Uttarakhand': { capital: 'Dehradun', emoji: '🏔️', link: 'https://en.wikipedia.org/wiki/Uttarakhand', area: '53,483' },
        'West Bengal': { capital: 'Kolkata', emoji: '🐯', link: 'https://en.wikipedia.org/wiki/West_Bengal', area: '88,752' }
    };

    const root = document.documentElement;
    const loader = document.querySelector('.loader');
    const visitedCountEl = document.getElementById('visited-count');
    const totalCountEl = document.getElementById('total-count');
    const infoCard = document.getElementById('info-card');
    const infoStateName = document.getElementById('info-state-name');
    const infoCapitalName = document.getElementById('info-capital-name');
    const infoArea = document.getElementById('info-area');
    const infoLearnMore = document.getElementById('info-learn-more');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    const achievementsContainer = document.getElementById('achievements-container');
    const achievementsList = document.getElementById('achievements-list');
    const labelToggles = document.querySelectorAll('input[name="label-toggle"]');
    const opacitySlider = document.getElementById('opacity-slider');
    let infoCardTimer;

    const svg = d3.select("#map-container").append("svg").attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g");
    let pathGenerator;
    
    let totalPlaces = 0;
    function updateCounter() {
        const visitedCount = d3.selectAll('.state.visited').size();
        visitedCountEl.textContent = visitedCount;
        totalCountEl.textContent = totalPlaces;
        checkAchievements();
        updateLabelVisibility();
        saveSelections();
    }

    const zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', (event) => { g.attr('transform', event.transform); });
    svg.call(zoom);

    function toggleVisited(event, d) {
        d3.select(this).classed('visited', !d3.select(this).classed('visited'));
        updateCounter();
        event.stopPropagation();
    }
    
    function focusOnState(event, d) {
        clearTimeout(infoCardTimer);
        const bounds = pathGenerator.bounds(d);
        const dx = bounds[1][0] - bounds[0][0], dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2, y = (bounds[0][1] + bounds[1][1]) / 2;
        
        const { width, height } = svg.node().getBoundingClientRect();
        
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        svg.transition().ease(d3.easeCubicOut).duration(750).call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
        
        const sName = d.properties[stateNameProperty];
        const sData = stateData[sName] || { capital: 'N/A', emoji: '', link: '#', area: 'N/A' };
        
        infoStateName.textContent = `${sData.emoji || ''} ${sName}`;
        infoCapitalName.textContent = sData.capital;
        infoArea.textContent = sData.area;
        infoLearnMore.href = sData.link;
        
        infoCard.classList.remove('hidden');
        infoCard.classList.add('visible');
        
        infoCardTimer = setTimeout(() => {
            infoCard.classList.remove('visible');
        }, 3000);
    }

    function resetView() {
        svg.transition().ease(d3.easeCubicOut).duration(750).call(zoom.transform, d3.zoomIdentity);
        infoCard.classList.remove('visible');
        infoCard.classList.add('hidden');
    }
    
    function updateLabelVisibility() {
        const mode = document.querySelector('input[name="label-toggle"]:checked').value;
        const labels = g.selectAll('.state-label');
        labels.classed('visible', false); 
        if (mode === 'all') {
            labels.classed('visible', true);
        } else if (mode === 'visited') {
            g.selectAll('.state.visited').each(d => {
                g.select(`.state-label[data-name="${d.properties[stateNameProperty]}"]`).classed('visible', true);
            });
        }
    }
    labelToggles.forEach(toggle => toggle.addEventListener('change', updateLabelVisibility));
    opacitySlider.addEventListener('input', (e) => root.style.setProperty('--fill-opacity', e.target.value));
    opacitySlider.addEventListener('change', (e) => localStorage.setItem('fillOpacity', e.target.value));

    function saveSelections() {
        const visitedStates = [];
        d3.selectAll('.state.visited').each(d => visitedStates.push(d.properties[stateNameProperty]));
        localStorage.setItem('visitedIndianStates', JSON.stringify(visitedStates));
    }

    function loadSelections() {
        const urlHash = window.location.hash.substring(1);
        if (urlHash) {
            const statesToLoad = urlHash.split(',').map(name => decodeURIComponent(name));
            d3.selectAll('.state').filter(d => statesToLoad.includes(d.properties[stateNameProperty])).classed('visited', true);
        } else {
            const savedVisited = JSON.parse(localStorage.getItem('visitedIndianStates'));
            if (savedVisited) d3.selectAll('.state').filter(d => savedVisited.includes(d.properties[stateNameProperty])).classed('visited', true);
        }
        
        const savedOpacity = localStorage.getItem('fillOpacity') || '1';
        opacitySlider.value = savedOpacity;
        root.style.setProperty('--fill-opacity', savedOpacity);
    }

    const mapDb = {
        db: null,
        init: function() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('MapCache', 1);
                request.onupgradeneeded = (event) => {
                    this.db = event.target.result;
                    if (!this.db.objectStoreNames.contains('maps')) {
                        this.db.createObjectStore('maps');
                    }
                };
                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve();
                };
                request.onerror = (event) => {
                    console.error('IndexedDB error:', event.target.errorCode);
                    reject(event.target.errorCode);
                };
            });
        },
        getMap: function(key) {
            return new Promise((resolve) => {
                if (!this.db) { resolve(null); return; }
                const transaction = this.db.transaction(['maps'], 'readonly');
                const store = transaction.objectStore('maps');
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });
        },
        setMap: function(key, data) {
            if (!this.db) return;
            const transaction = this.db.transaction(['maps'], 'readwrite');
            const store = transaction.objectStore('maps');
            store.put(data, key);
        }
    };

    async function loadMapData() {
        await mapDb.init();
        let geojsonData = await mapDb.getMap('india-map');

        if (geojsonData) {
            console.log('Map loaded from IndexedDB cache.');
            renderMap(geojsonData);
        } else {
            console.log('Map not in cache. Fetching from network...');
            loader.classList.remove('hidden');
            try {
                geojsonData = await d3.json('in.json');
                mapDb.setMap('india-map', geojsonData);
                renderMap(geojsonData);
            } catch (error) {
                console.error("Error loading or processing map data (in.json):", error);
                loader.textContent = 'Error loading map.';
            }
        }
    }

    function renderMap(geojsonData) {
        const geoJsonFeatures = geojsonData.features;
        totalPlaces = geoJsonFeatures.length;
        
        // Use a fixed aspect ratio for the viewBox, CSS will handle the container size
        const width = 800;
        const height = 800;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const projection = d3.geoMercator().fitSize([width, height], geojsonData);
        pathGenerator = d3.geoPath().projection(projection);

        g.selectAll('path.state')
            .data(geoJsonFeatures)
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('d', pathGenerator)
            .attr('data-name', d => d.properties[stateNameProperty])
            .on('click', toggleVisited)
            .on('dblclick', focusOnState)
            .append('title')
            .text(d => d.properties[stateNameProperty]);

        g.selectAll('text.state-label')
            .data(geoJsonFeatures)
            .enter()
            .filter(d => pathGenerator.area(d) > 70) 
            .append('text')
            .attr('class', 'state-label')
            .attr('data-name', d => d.properties[stateNameProperty])
            .attr('transform', d => `translate(${pathGenerator.centroid(d)})`)
            .attr('dy', '0.35em')
            .text(d => d.properties[stateNameProperty]);

        loader.classList.add('hidden');
        loadSelections();
        updateCounter();
        renderAchievements();
        updateLabelVisibility();
    }

    loadMapData();

    zoomInBtn.addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 1.5));
    zoomOutBtn.addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 0.75));
    zoomResetBtn.addEventListener('click', resetView);
    svg.on('click', resetView);
    g.on('click', event => event.stopPropagation());

    clearBtn.addEventListener('click', () => {
        d3.selectAll('.state.visited').classed('visited', false);
        achievements.forEach(ach => ach.unlocked = false);
        achievementsContainer.classList.remove('visible');
        updateCounter();
    });

    shareBtn.addEventListener('click', () => {
        const visitedStates = [];
        d3.selectAll('.state.visited').each(d => visitedStates.push(encodeURIComponent(d.properties[stateNameProperty])));
        if (visitedStates.length > 0) {
            const shareableLink = `${window.location.origin}${window.location.pathname}#${visitedStates.join(',')}`;
            navigator.clipboard.writeText(shareableLink).then(() => {
                shareBtn.textContent = 'Link Copied!';
                setTimeout(() => { shareBtn.textContent = 'Share Map'; }, 2000);
            });
        } else {
            alert('Select some "Visited" states to share!');
        }
    });

    downloadBtn.addEventListener('click', () => {
        const userName = prompt("Please enter your name for the map title:", "");
        if (userName === null) return;

        resetView();
        
        setTimeout(() => {
            const mapContainer = document.getElementById('map-container');
            html2canvas(mapContainer, {
                scale: 3, useCORS: true,
                onclone: (doc) => {
                    const clonedContainer = doc.getElementById('map-container');
                    clonedContainer.style.backgroundImage = 'none';
                    clonedContainer.style.backgroundColor = getComputedStyle(doc.body).getPropertyValue('background-color');

                    doc.querySelector('.zoom-controls').style.display = 'none';
                    doc.querySelector('#info-card').style.display = 'none';
                    if (userName.trim() !== "") {
                        const titleDiv = doc.createElement('div');
                        titleDiv.className = 'download-title';
                        let possessiveName = userName.trim();
                        possessiveName += possessiveName.slice(-1).toLowerCase() === 's' ? "'" : "'s";
                        titleDiv.textContent = `${possessiveName} Travels`;
                        clonedContainer.appendChild(titleDiv);
                    }
                }
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'india-travel-tracker.jpg';
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            });
        }, 800);
    });

    const body = document.body;
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : '');
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        switch(e.key) {
            case '+': case '=': zoomInBtn.click(); break;
            case '-': zoomOutBtn.click(); break;
            case 'r': case 'R': zoomResetBtn.click(); break;
            case 'l': case 'L':
                const currentLabelMode = document.querySelector('input[name="label-toggle"]:checked').value;
                if (currentLabelMode === 'off') document.getElementById('labels-visited').click();
                else if (currentLabelMode === 'visited') document.getElementById('labels-all').click();
                else document.getElementById('labels-off').click();
                updateLabelVisibility();
                break;
        }
    });
    
    const achievements = [
        { id: 'coastal', name: 'Coastal Cruiser', states: ['Gujarat', 'Maharashtra', 'Goa', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal', 'Puducherry', 'Andaman and Nicobar Islands'], unlocked: false },
        { id: 'sisters', name: 'Seven Sisters', states: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura'], unlocked: false },
        { id: 'big_five', name: 'The Big Five', states: ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Gujarat'], unlocked: false },
        { id: 'union_master', name: 'Union Master', states: ['Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'], unlocked: false }
    ];

    function checkAchievements() {
        const visitedStates = new Set();
        d3.selectAll('.state.visited').each(d => visitedStates.add(d.properties[stateNameProperty]));
        let anyUnlocked = false;
        achievements.forEach(ach => {
            ach.unlocked = ach.states.every(state => visitedStates.has(state));
            if (ach.unlocked) anyUnlocked = true;
        });
        renderAchievements();
        achievementsContainer.classList.toggle('visible', anyUnlocked);
        achievementsContainer.classList.toggle('hidden', !anyUnlocked);
    }
    function renderAchievements() {
        achievementsList.innerHTML = '';
        achievements.forEach(ach => {
            const li = document.createElement('li');
            li.textContent = ach.name;
            li.className = `achievement ${ach.unlocked ? 'unlocked' : ''}`;
            achievementsList.appendChild(li);
        });
    }
});