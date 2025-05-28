document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const body = document.body;
    const palette = document.getElementById('palette');
    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const combineButton = document.getElementById('combine-button');
    const resultMessage = document.getElementById('result-message');
    const resultDetailsDiv = document.getElementById('result-details');
    const newEmojiDisplay = document.getElementById('new-emoji-display');
    const newEmojiNameText = document.getElementById('new-emoji-name');
    const newEmojiFlavorText = document.getElementById('new-emoji-flavor');
    const discoveredList = document.getElementById('discovered-list');
    const progressCounter = document.getElementById('progress-counter');
    const instructionsButton = document.getElementById('instructions-button');
    const soundToggleButton = document.getElementById('sound-toggle-button');
    const hintButton = document.getElementById('hint-button');
    const darkModeToggleButton = document.getElementById('dark-mode-toggle');
    const resetButton = document.getElementById('reset-button');
    const exportButton = document.getElementById('export-button');
    const importFileInput = document.getElementById('import-file');
    const dynamicTooltip = document.getElementById('dynamic-tooltip');
    const tooltipEmoji = document.getElementById('tooltip-emoji');
    const tooltipName = document.getElementById('tooltip-name');
    const tooltipFlavor = document.getElementById('tooltip-flavor');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeInstructionsButton = document.getElementById('close-instructions-button');

    // --- Audio Context & Sound State ---
    let audioCtx = null;
    let soundsEnabled = true;
    function playSound(type = 'ui_tap', volume = 0.05) { if (!soundsEnabled || !audioCtx) return; if (audioCtx.state === 'suspended') audioCtx.resume().catch(e => console.warn("Audio resume error:", e)); const oscillator = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); oscillator.connect(gainNode); gainNode.connect(audioCtx.destination); gainNode.gain.setValueAtTime(volume, audioCtx.currentTime); let freq = 440; let duration = 0.1; oscillator.type = 'sine'; switch (type) { case 'discover': freq = 880; oscillator.type = 'triangle'; duration = 0.25; gainNode.gain.setValueAtTime(Math.min(0.1, volume * 1.8), audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration); const osc2 = audioCtx.createOscillator(); const gain2 = audioCtx.createGain(); osc2.connect(gain2); gain2.connect(audioCtx.destination); osc2.type = 'sine'; osc2.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime); gain2.gain.setValueAtTime(Math.min(0.07, volume * 1.2), audioCtx.currentTime); gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration * 0.8); osc2.start(audioCtx.currentTime); osc2.stop(audioCtx.currentTime + duration * 0.8); break; case 'combine_success_old': freq = 600; duration = 0.08; oscillator.type = 'triangle'; gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration); break; case 'combine_fail': freq = 150; oscillator.type = 'sawtooth'; duration = 0.2; gainNode.gain.setValueAtTime(volume * 1.2, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration); break; case 'ui_tap': default: freq = 1200; duration = 0.03; oscillator.type = 'triangle'; gainNode.gain.setValueAtTime(volume * 0.8, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration); break; } oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); oscillator.start(audioCtx.currentTime); oscillator.stop(audioCtx.currentTime + duration); }
    function initAudioContext() { if (audioCtx) return; if (window.AudioContext || window.webkitAudioContext) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.error("Web Audio API could not be initialized.", e); soundsEnabled = false; soundToggleButton.textContent = '🔇'; soundToggleButton.disabled = true; } } else { console.warn("Web Audio API is not supported in this browser."); soundsEnabled = false; soundToggleButton.textContent = '🔇'; soundToggleButton.disabled = true; } }
    soundToggleButton.addEventListener('click', () => { soundsEnabled = !soundsEnabled; soundToggleButton.textContent = soundsEnabled ? '🔊' : '🔇'; localStorage.setItem('emojiAlchemySounds', soundsEnabled ? 'on' : 'off'); if (soundsEnabled && !audioCtx) { initAudioContext(); } playSound('ui_tap', 0.04); });
    function loadSoundPreference() { const savedSoundPref = localStorage.getItem('emojiAlchemySounds'); if (savedSoundPref === 'off') { soundsEnabled = false; soundToggleButton.textContent = '🔇'; } else { soundsEnabled = true; soundToggleButton.textContent = '🔊'; } }

    // --- Game State & Data ---
    let baseElements = [
        { emoji: '💧', name: 'Water', flavor: "H₂O: The universal solvent, cool, clear, and life-sustaining." },
        { emoji: '🔥', name: 'Fire', flavor: "Rapid oxidation! A primal force of warmth, light, and transformation." },
        { emoji: '🌍', name: 'Earth', flavor: "Our home planet, a sphere of rock, soil, and vibrant ecosystems." },
        { emoji: '💨', name: 'Air', flavor: "The invisible gaseous blanket, vital for breath and carrying whispers on the wind." },
        { emoji: '🪨', name: 'Stone', flavor: "Ancient, solid, and foundational. From pebbles to mountains, it endures." },
        { emoji: '🌱', name: 'Plant', flavor: "Nature's quiet alchemist, turning sunlight into sustenance and oxygen." },
        { emoji: '⚡', name: 'Energy', flavor: "The fundamental force of action and change. Pure, raw power!" }
    ];

    let recipes = [ // Same 150 discoverable recipes as V13_RefinedSave
        // Tier 1 (Base Element Combos) - 26 items
        { inputs: ['💧', '🔥'], output: { emoji: '🌫️', name: 'Steam', flavor: "Water getting all hot and bothered. Powers engines, clears sinuses." } },
        { inputs: ['💧', '🌍'], output: { emoji: '🟤', name: 'Mud', flavor: "Earth mixed with water. Squishy, messy, and the start of pottery!" } },
        { inputs: ['💧', '💨'], output: { emoji: '☁️', name: 'Cloud', flavor: "Water vapor chilling in the sky. Shape-shifter, rain-bringer." } },
        { inputs: ['💧', '🪨'], output: { emoji: '🌊', name: 'Ocean', flavor: "A LOT of water meets stone. Salty, deep, home to many a mystery." } },
        { inputs: ['💧', '🌱'], output: { emoji: '🌿', name: 'Herb', flavor: "Simple plant life nourished by water. For seasoning or potions." } }, 
        { inputs: ['🔥', '🌍'], output: { emoji: '🌋', name: 'Volcano', flavor: "Earth's fiery heart exposed! A spectacular, dangerous display of molten rock." } },
        { inputs: ['🔥', '💨'], output: { emoji: '☀️', name: 'Sun', flavor: "Fire in the sky! Our local star, bringing light, warmth, and sunburns." } },
        { inputs: ['🔥', '🪨'], output: { emoji: '☄️', name: 'Magma', flavor: "Stone so hot it flows. The fiery blood of the planet." } },
        { inputs: ['🔥', '🌱'], output: { emoji: '⚫', name: 'Ash', flavor: "A plant's fiery end, leaving behind a carbon remnant. Dust to dust." } },
        { inputs: ['🌍', '💨'], output: { emoji: '⏳', name: 'Sand', flavor: "Earth and air, grinding away over eons. Tiny grains that make up beaches and deserts." } },
        { inputs: ['🌍', '🪨'], output: { emoji: '⛰️', name: 'Mountain', flavor: "Earth and stone piled high by tectonic forces. Majestic, imposing, and often snowy." } },
        { inputs: ['🌍', '🌱'], output: { emoji: '🌾', name: 'Grass', flavor: "Life takes root in the earth. For lawns, fields, and happy grazers." } },
        { inputs: ['💨', '🪨'], output: { emoji: '🌬️', name: 'Wind', flavor: "Air on the move, sculpting landscapes and carrying whispers. Nature's invisible hand." } },
        { inputs: ['💨', '🌱'], output: { emoji: '🍃', name: 'Leaf', flavor: "A plant's solar panel, fluttering in the air. Simple, green, essential." } },
        { inputs: ['🪨', '🌱'], output: { emoji: '🍄', name: 'Fungus', flavor: "Life finds a way, even on stone. Nature's decomposers and sometimes, delicacies." } },
        { inputs: ['⚡', '🔥'], output: { emoji: '💥', name: 'Explosion', flavor: "Energy + Fire = A sudden, violent release of power! Boom!" } },
        { inputs: ['⚡', '💧'], output: { emoji: '🌩️', name: 'Storm Cloud', flavor: "Energy + Water (Clouds) = A dark, charged cloud, ready to unleash its fury." } }, 
        { inputs: ['⚡', '🌍'], output: { emoji: '〰️', name: 'Earthquake', flavor: "Energy + Earth = The ground trembles and shakes! A terrifying force." } }, 
        { inputs: ['⚡', '💨'], output: { emoji: '⛈️', name: 'Thunderstorm', flavor: "Energy + Air (Storm) = A dramatic weather event with lightning and thunder." } },
        { inputs: ['⚡', '🌱'], output: { emoji: '🍎', name: 'Fruit', flavor: "Energy + Plant = The sweet, energized bounty of nature. An apple a day!" } },
        { inputs: ['🌱', '🌱'], output: { emoji: '🌳', name: 'Tree', flavor: "Plant + Plant = A larger, sturdier form of plant life. Reaching for the sun." } }, 
        { inputs: ['💧', '💧'], output: { emoji: '🌧️', name: 'Rain', flavor: "Water + Water (from Clouds) = Precipitation. Essential for life." } },
        { inputs: ['🪨', '🪨'], output: { emoji: '🧱', name: 'Wall', flavor: "Stone + Stone = A solid barrier. For protection, division, or climbing." } },
        { inputs: ['🔥', '🔥'], output: { emoji: '♨️', name: 'Intense Heat', flavor: "Fire + Fire = An overwhelming inferno. Dangerously hot!" } },
        { inputs: ['💨', '💨'], output: { emoji: '🌀', name: 'Cyclone', flavor: "Air + Air = A swirling vortex of wind. Nature's powerful spiral." } },
        { inputs: ['🌍', '🌍'], output: { emoji: '🏔️', name: 'Plateau', flavor: "Earth + Earth = Vast uplands or a series of mountains. A grand vista." } },

        // Tier 2 (Building on Tier 1) - 30 items.
        { inputs: ['🌫️', '🌍'], output: { emoji: '♨️', name: 'Geyser', flavor: "Steam + Earth = A dramatic eruption of hot water!" } }, 
        { inputs: ['🟤', '🔥'], output: { emoji: '🧱', name: 'Brick', flavor: "Mud baked hard by fire. The sturdy, reliable building blocks." } }, 
        { inputs: ['☁️', '☁️'], output: { emoji: '🌌', name: 'Sky', flavor: "An endless expanse of clouds. A canvas for sunsets and stars." } },
        { inputs: ['🌩️', '🌍'], output: { emoji: '⚡', name: 'Lightning Bolt', flavor: "Storm Cloud + Earth = Electricity hits the ground!" } }, 
        { inputs: ['🌋', '💧'], output: { emoji: '🏝️', name: 'Island', flavor: "A volcano emerging from the water. New land forged in fire and sea." } },
        { inputs: ['☀️', '💧'], output: { emoji: '🌈', name: 'Rainbow', flavor: "Sunlight refracted through water droplets. A fleeting bridge of color." } },
        { inputs: ['☀️', '🌍'], output: { emoji: '🏜️', name: 'Desert', flavor: "Earth baked relentlessly by the sun. A vast, arid landscape." } },
        { inputs: ['☀️', '🌱'], output: { emoji: '🌻', name: 'Sunflower', flavor: "A plant that worships the sun, always turning its face to the light." } },
        { inputs: ['☀️', '☁️'], output: { emoji: '🌤️', name: 'Partly Cloudy', flavor: "The sun peeking through clouds. A day of mixed blessings." } },
        { inputs: ['☄️', '💨'], output: { emoji: '⭐', name: 'Star', flavor: "Magma flung into the cold air of space, a distant, twinkling light." } },
        { inputs: ['⚫', '💧'], output: { emoji: '✒️', name: 'Ink', flavor: "Ash/Charcoal mixed with water. A dark fluid for writing or art." } },
        { inputs: ['⏳', '🔥'], output: { emoji: '💎', name: 'Glass', flavor: "Sand melted by intense fire. Transparent, versatile, and breakable." } }, 
        { inputs: ['⏳', '🌱'], output: { emoji: '🌵', name: 'Cactus', flavor: "A plant adapted to sandy, arid life. Spiky on the outside, resilient within." } },
        { inputs: ['🌊', '☀️'], output: { emoji: '🧂', name: 'Salt', flavor: "The ocean's essence, left by the sun. Flavors food, preserves history." } },
        { inputs: ['🌳', '🔥'], output: { emoji: '🪵', name: 'Log', flavor: "A tree meets fire, or an axe. Processed wood, ready for use." } },
        { inputs: ['⛰️', '☁️'], output: { emoji: '🏔️', name: 'Snowy Mountain', flavor: "A mountain tall enough to pierce the cold clouds." } }, 
        { inputs: ['🌊', '🌬️'], output: { emoji: '⛵', name: 'Sailboat', flavor: "The ocean's expanse met with the wind's power. Adventure on the waves!" } },
        { inputs: ['🧱', '🧱'], output: { emoji: '🏠', name: 'House', flavor: "Wall (Brick) + Wall (Brick) = A simple dwelling. Home sweet home." } },
        { inputs: ['🌫️', '🪨'], output: { emoji: '🗿', name: 'Warm Stone', flavor: "Steam enveloping a stone. A naturally heated rock for a primitive spa." } },
        { inputs: ['🌧️', '🌍'], output: { emoji: '🌿', name: 'Sprout', flavor: "Rain upon the earth coaxes forth a tiny new plant." } }, 
        { inputs: ['☀️', '🪨'], output: { emoji: '🦎', name: 'Lizard', flavor: "Sun + Stone = A warm rock for a reptile to bask upon." } },
        { inputs: ['🌬️', '🌱'], output: { emoji: '🌾', name: 'Wild Grass', flavor: "Wind scattering plant seeds, leading to fields of untamed grasses." } }, 
        { inputs: ['🧊', '🌍'], output: { emoji: '🥶', name: 'Permafrost', flavor: "Ice meets earth, creating permafrost. A land locked in a chilly embrace." } },
        { inputs: ['💧', '⭐'], output: { emoji: '🧊', name: 'Ice', flavor: "Water exposed to the cold of distant stars (space). Solid, crystalline, and cool." } },
        { inputs: ['🟤', '🌱'], output: { emoji: '🏺', name: 'Pottery', flavor: "Mud + Plant (for shaping/binding before fire). Moldable earth, ready for the kiln." } },
        { inputs: ['🌳', '🌬️'], output: { emoji: '🍃', name: 'Falling Leaf', flavor: "A tree's foliage, caught by the wind. A whisper of autumn." } }, 
        { inputs: ['☄️', '🧊'], output: { emoji: '🖤', name: 'Obsidian', flavor: "Magma + Ice (Rapid Cooling). Sharp, black volcanic glass." } },
        { inputs: ['🌍', '⭐'], output: { emoji: '🌙', name: 'Moon', flavor: "Earth's celestial companion, reflecting starlight and pulling tides." } },
        { inputs: ['🌊', '🌙'], output: { emoji: '🌊', name: 'Tide', flavor: "The ocean's rhythmic breathing, pulled by the moon's gentle sway." } }, 
        { inputs: ['⏳', '🌬️'], output: { emoji: '🏜️', name: 'Dune', flavor: "Sand sculpted by the wind into majestic, shifting hills." } }, 

        // Tier 3: Life, Tools, Early Human Concepts (34 items)
        { inputs: ['🌊', '🧬'], output: { emoji: '🦠', name: 'Microbe', flavor: "Ocean (Primordial Soup) + Life (DNA). The earliest, simplest forms of life." } }, 
        { inputs: ['🦠', '🌍'], output: { emoji: '🍄', name: 'Fungus', flavor: "Microbe + Earth = Nature's decomposers and culinary curiosities." } }, 
        { inputs: ['🦠', '💧'], output: { emoji: '🐠', name: 'Fish', flavor: "Microbe + Water = Aquatic beings, perfectly adapted to their watery world." } },
        { inputs: ['🦠', '💨'], output: { emoji: '🐦', name: 'Bird', flavor: "Microbe + Air = Feathered masters of flight. Their songs fill the morning sky." } },
        { inputs: ['🦠', '☀️'], output: { emoji: '🦖', name: 'Dinosaur', flavor: "Microbe + Sun (Ancient Times/Energy). Giant reptiles that once roamed the Earth." } },
        { inputs: ['🦠', '🌱'], output: { emoji: '🐛', name: 'Insect', flavor: "Microbe + Plant = Small, six-legged creatures. Pollinators, pests, and protein." } },
        { inputs: ['🧬', '🪨'], output: { emoji: '🦴', name: 'Bone', flavor: "Life (DNA) + Stone = The hard internal structure. What remains when all else fades." } },
        { inputs: ['🪨', '🔥'], output: { emoji: '⚙️', name: 'Metal', flavor: "Stone + Fire = Extracted from ore, the backbone of industry." } },
        { inputs: ['⚙️', '🌳'], output: { emoji: '🪓', name: 'Axe', flavor: "Metal + Tree (Wood). For felling timber or a very aggressive game of croquet." } },
        { inputs: ['⚙️', '🪨'], output: { emoji: '⛏️', name: 'Pickaxe', flavor: "Metal + Stone. The tool for miners and dwarves. Diggy diggy hole!" } },
        { inputs: ['⚙️', '⚡'], output: { emoji: '💡', name: 'Light Bulb', flavor: "Metal + Energy (Lightning). A bright idea that banished the darkness." } },
        { inputs: ['🧬', '🟤'], output: { emoji: '🧍', name: 'Human', flavor: "Life (DNA) + Mud (Clay). Molded from the earth, endowed with curiosity and an opposable thumb." } },
        { inputs: ['🧍', '🔥'], output: { emoji: '🧑‍🍳', name: 'Cook', flavor: "Human + Fire. The alchemist of the kitchen, turning sustenance into art." } },
        { inputs: ['🧍', '🌱'], output: { emoji: '🧑‍🌾', name: 'Farmer', flavor: "Human + Plant. Cultivating the land, feeding nations, and hoping for good weather." } },
        { inputs: ['🧍', '🌳'], output: { emoji: '🏹', name: 'Bow', flavor: "Human + Tree (Wood). Precision projectile launching for hunting or sport." } },
        { inputs: ['🧍', '⚙️'], output: { emoji: '🛠️', name: 'Tools', flavor: "Human + Metal. Ingenuity forged into useful implements. If you can dream it, you can build it." } },
        { inputs: ['🧍', '🧍'], output: { emoji: '👨‍👩‍👧‍👦', name: 'Community', flavor: "Human + Human = A gathering of people. Society begins here." } },
        { inputs: ['💎', '⌛'], output: { emoji: '🔍', name: 'Lens', flavor: "Glass + Hourglass (Precision). Focusing light to see the small or the distant." } },
        { inputs: ['✒️', '🌿'], output: { emoji: '📜', name: 'Scroll', flavor: "Ink + Herb (Papyrus like). Ancient writings, holding wisdom or just a to-do list." } },
        { inputs: ['🦴', '🧍'], output: { emoji: '💀', name: 'Skeleton', flavor: "Bone + Human = The spooky, bony framework inside us all. Waiting for its Halloween debut." } },
        { inputs: ['🌸', '🌸'], output: { emoji: '💐', name: 'Bouquet', flavor: "A beautiful arrangement of flowers. For romance, apology, or just because." } },
        { inputs: ['💎', '💧'], output: { emoji: '❄️', name: 'Crystal', flavor: "Glass (Shiny) + Water (Ice structure). A perfectly formed, glittering jewel of nature." } },
        { inputs: ['🌸', '🌫️'], output: { emoji: '🧴', name: 'Scented Oil', flavor: "Flower + Steam (Distillation). Capturing the essence of blooms in a fragrant concoction." } },
        { inputs: ['🍄', '🔥'], output: { emoji: '🍄', name: 'Grilled Fungus', flavor: "Fungus + Fire. Earthy, savory, and surprisingly meaty. A forest delicacy." } }, 
        { inputs: ['💎', '⚙️'], output: { emoji: '💍', name: 'Ring', flavor: "Glass (Gem) + Metal. A band of precious material, often symbolizing a promise or just good taste." } },
        { inputs: ['☀️', '🌻'], output: { emoji: '🍯', name: 'Nectar', flavor: "Sun + Sunflower. The sweet, sugary liquid that flowers produce to attract pollinators." } },
        { inputs: ['⚫', '🪨'], output: { emoji: '✏️', name: 'Pencil', flavor: "Ash (Carbon) + Stone (Graphite). For sketching ideas or writing notes." } },
        { inputs: ['🌳', '🍎'], output: { emoji: '🧺', name: 'Basket', flavor: "Tree (Wood/Weaving) + Fruit. A container for gathering nature's bounty." } },
        { inputs: ['🌱', '🍎'], output: { emoji: '🍓', name: 'Berry', flavor: "Plant + Fruit. Small, sweet, and often found in pies or on bushes." } },
        { inputs: ['🧬', '🐑'], output: { emoji: '🧶', name: 'Wool', flavor: "Life (DNA) + Sheep = Soft, fluffy fibers, for warm sweaters." } }, 
        { inputs: ['🌿', '🧬'], output: { emoji: '🐑', name: 'Sheep', flavor: "Grass + Life (DNA). A gentle, grazing animal, provider of wool." } },
        { inputs: ['🪵', '🌊'], output: { emoji: '🛶', name: 'Canoe', flavor: "Log + Ocean. A simple, hollowed-out boat for quiet journeys." } },
        { inputs: ['🧱', '☀️'], output: { emoji: '🏺', name: 'Adobe', flavor: "Brick (Mud) + Sun. Sun-dried earth, a building material for arid climates." } }, 
        { inputs: ['🧬', '🌸'], output: { emoji: '🐝', name: 'Bee', flavor: "Life (DNA) + Flower. Nature's tiny, busy pollinator, making honey." } },

        // Tier 4: Advancing Society, Food, Technology (30 items)
        { inputs: ['🧑‍🌾', '🌾'], output: { emoji: '🍚', name: 'Grain', flavor: "Farmer + Wild Grass (Wheat) = Harvested seeds, the staple of many diets." } },
        { inputs: ['🍚', '🪨'], output: { emoji: '🥡', name: 'Flour', flavor: "Grain + Stone (Grindstone). Milled into fine powder, the soul of baking." } },
        { inputs: ['🥡', '💧'], output: { emoji: '🥟', name: 'Dough', flavor: "Flour + Water. The pliable, promising start of many delicious carbs." } },
        { inputs: ['🥟', '🔥'], output: { emoji: '🍞', name: 'Bread', flavor: "Dough + Fire. A warm, crusty loaf. The cornerstone of many a meal." } },
        { inputs: ['🏠', '🏠'], output: { emoji: '🏘️', name: 'Village', flavor: "House + House = A small community. Where neighbors know your name." } },
        { inputs: ['🪵', '🛠️'], output: { emoji: '🪑', name: 'Chair', flavor: "Log (Wood) + Tools. A simple, yet profound, invention for resting." } },
        { inputs: ['📜', '🧍'], output: { emoji: '📖', name: 'Book', flavor: "Scroll + Human (Author/Reader). A gateway to knowledge and adventure." } },
        { inputs: ['📖', '🧍'], output: { emoji: '🧑‍🏫', name: 'Scholar', flavor: "Book + Human. A seeker of knowledge, often found buried in books." } },
        { inputs: ['⚙️', '🌫️'], output: { emoji: '🚂', name: 'Engine', flavor: "Metal + Steam. The chugging, puffing heart of the Industrial Age." } },
        { inputs: ['💡', '⌛'], output: { emoji: '🕰️', name: 'Clock', flavor: "Light Bulb (Electricity) + Hourglass (Time). A mechanical marvel that ticks." } },
        { inputs: ['🍃', '🔥'], output: { emoji: '🍂', name: 'Autumn', flavor: "Leaf + Fire (Warm colors/Change). Nature's brilliant display before winter." } },
        { inputs: ['🧬', '⛰️'], output: { emoji: '🐐', name: 'Goat', flavor: "Life (DNA) + Mountain. An agile master of treacherous peaks." } },
        { inputs: ['⚙️', '⚙️'], output: { emoji: '🔗', name: 'Chain', flavor: "Metal + Metal. Interlocking links of formidable strength or style." } },
        { inputs: ['🦴', '🛠️'], output: { emoji: '🗿', name: 'Carving', flavor: "Bone (or Stone) + Tools. Shaping raw material into art or idol." } }, 
        { inputs: ['🧱', '🧱'], output: { emoji: '🏰', name: 'Castle', flavor: "Wall + Wall. A majestic stronghold of power, history, and drafts." } }, 
        { inputs: ['🌊', '🐠'], output: { emoji: '🎣', name: 'Fishing Rod', flavor: "Ocean + Fish. A simple tool for a timeless pastime. Patience is key." } },
        { inputs: ['⭐', '🌙'], output: { emoji: '🌃', name: 'Night', flavor: "Star + Moon. The velvet canvas above, adorned with celestial jewels." } }, 
        { inputs: ['🌳', '🐦'], output: { emoji: '🪺', name: 'Nest', flavor: "Tree + Bird. A carefully woven sanctuary for tiny, chirping future flyers." } },
        { inputs: ['☁️', '🧊'], output: { emoji: '❄️', name: 'Snowflake', flavor: "Cloud + Ice. A delicate, six-sided marvel of frozen geometry." } },
        { inputs: ['💧', '❄️'], output: { emoji: '☃️', name: 'Snowman', flavor: "Water (as Snow) + Cold (Snowflake). A cheerful, frosty friend." } },
        { inputs: ['💡', '🧍'], output: { emoji: '🤔', name: 'Idea', flavor: "Light Bulb + Human. A spark of insight! The beginning of all great things." } }, 
        { inputs: ['🌍', '🧬'], output: { emoji: '🐜', name: 'Ant', flavor: "Earth + Life (DNA). Tiny, tireless architects of complex societies." } },
        { inputs: ['🧬', '🌳'], output: { emoji: '🐒', name: 'Monkey', flavor: "Life (DNA) + Tree. An agile, intelligent primate, master of the canopy." } },
        { inputs: ['🌳', '🐒'], output: { emoji: '🍌', name: 'Banana', flavor: "Tree + Monkey = A monkey's favorite curved yellow fruit. A-peel-ing!" } },
        { inputs: ['⚙️', '🌊'], output: { emoji: '⚓', name: 'Anchor', flavor: "Metal + Ocean. A heavy weight holding ships steady against the sea." } },
        { inputs: ['🏠', '🔥'], output: { emoji: '♨️', name: 'Fireplace', flavor: "House + Fire. A cozy hearth for warmth and storytelling." } }, 
        { inputs: ['🧱', '🌊'], output: { emoji: '🌉', name: 'Bridge', flavor: "Wall (Brick) + Ocean (Water). Spanning obstacles, connecting lands." } },
        { inputs: ['⚙️', '🕰️'], output: { emoji: '🧭', name: 'Compass', flavor: "Metal + Clock (Time/Direction). A magnetized needle always pointing north." } },
        { inputs: ['🚂', '⚙️'], output: { emoji: '🚗', name: 'Car', flavor: "Engine + Metal (Chassis). Four wheels and a dream of the open road." } },
        { inputs: ['🚗', '💨'], output: { emoji: '✈️', name: 'Airplane', flavor: "Car + Air. Trading traffic for turbulence, and seeing the world from above." } },

        // Tier 5: Higher Technology, Culture, Abstract (30 items to reach 150 total discoverable)
        { inputs: ['✈️', '⭐'], output: { emoji: '🚀', name: 'Spaceship', flavor: "Airplane + Star (Space). Boldly going where no emoji has gone before." } },
        { inputs: ['🧍', '🚀'], output: { emoji: '🧑‍🚀', name: 'Astronaut', flavor: "Human + Spaceship. A brave explorer of the final frontier." } },
        { inputs: ['⚙️', '💡'], output: { emoji: '💻', name: 'Computer', flavor: "Metal + Light Bulb (Logic/Electricity). A powerful thinking machine." } },
        { inputs: ['💻', '🧍'], output: { emoji: '🧑‍💻', name: 'Developer', flavor: "Computer + Human. The digital architect, crafting worlds from code." } },
        { inputs: ['💻', '🧬'], output: { emoji: '🤖', name: 'Robot', flavor: "Computer + Life (DNA/Blueprint). An artificial being of logic and gears." } },
        { inputs: ['💨', '🧍'], output: { emoji: '🎶', name: 'Music', flavor: "Air (Sound Waves) + Human (Voice/Instrument). The universal language." } },
        { inputs: ['📖', '🎶'], output: { emoji: '🎼', name: 'Musical Note', flavor: "Book (Notation) + Music. The symbols that bring melodies to life." } },
        { inputs: ['🌸', '🏺'], output: { emoji: '🎨', name: 'Paint Palette', flavor: "Flower (Pigment) + Pottery (Mixing Bowl). An artist's array of colors." } },
        { inputs: ['🎨', '📜'], output: { emoji: '🖼️', name: 'Painting', flavor: "Paint Palette + Scroll (Canvas). A visual creation, telling a story." } },
        { inputs: ['🕰️', '🧍'], output: { emoji: '🧐', name: 'Historian', flavor: "Clock (Time) + Human. A seeker of past truths, piecing together history." } },
        { inputs: ['💡', '📖'], output: { emoji: '📚', name: 'Library', flavor: "Idea (Light Bulb) + Book. A sanctuary of knowledge and imagination." } },
        { inputs: ['☁️', '🛌'], output: { emoji: '💭', name: 'Dream', flavor: "Cloud (Imagination) + Bed (Sleep). Your brain's nightly surrealist film." } }, 
        { inputs: ['🪵', '🧶'], output: { emoji: '🛌', name: 'Bed', flavor: "Wood + Wool (Yarn). A comfortable haven for rest, dreams, and snooze." } },
        { inputs: ['🧍', '🧍'], output: { emoji: '❤️', name: 'Love', flavor: "Human + Human. A profound connection of affection and shared pizza." } }, 
        { inputs: ['🧍', '❤️'], output: { emoji: '🥰', name: 'Couple', flavor: "Human + Love. Two hearts beating in sync, a beautiful dance." } },
        { inputs: ['⚙️', '⛏️'], output: { emoji: '🔪', name: 'Dagger', flavor: "Metal + Pickaxe (Sharpened). A small, blade for swift action or peeling." } },
        { inputs: ['❤️', '🔪'], output: { emoji: '💔', name: 'Heartbreak', flavor: "Love + Knife (Pain). The sharp sorrow of affection lost. It mends." } }, 
        { inputs: ['☀️', '🌙'], output: { emoji: '🌗', name: 'Eclipse', flavor: "Sun + Moon. A cosmic alignment of celestial bodies. A shadowy dance." } },
        { inputs: ['🤖', '❤️'], output: { emoji: '🥺', name: 'Emotional AI', flavor: "Robot + Love. It has processed feelings and desires cuddles. Beep boop." } },
        { inputs: ['💀', '💨'], output: { emoji: '👻', name: 'Ghost', flavor: "Skeleton + Air. An ethereal echo of a past life. Likes to say 'Boo!'" } },
        { inputs: ['👻', '🏠'], output: { emoji: '🏚️', name: 'Haunted House', flavor: "Ghost + House. Where spirits linger and floorboards creak with stories." } },
        { inputs: ['🤖', '🎶'], output: { emoji: '🕺', name: 'Dancing Robot', flavor: "Robot + Music. Proof that even circuits can get down and boogie. Beep boop shuffle!" } },
        { inputs: ['💡', '🤔'], output: { emoji: '🤯', name: 'Epiphany', flavor: "Idea (Light Bulb) + Thinker. A sudden, brilliant realization! Mind blown." } },
        { inputs: ['🌊', '♨️'], output: { emoji: '🐙', name: 'Deep Sea Creature', flavor: "Ocean + Geyser (Vent). Strange creatures thriving in extreme deep-sea conditions." } },
        { inputs: ['🏝️', '🌴'], output: { emoji: '🏖️', name: 'Beach', flavor: "Island + Palm Tree. Sun, sand, and surf. The ultimate relaxation spot." } }, 
        { inputs: ['🌱', '☀️'], output: { emoji: '🌴', name: 'Palm Tree', flavor: "Plant + Sun (Tropical Climate). A symbol of paradise, swaying gently." } },
        { inputs: ['💻', '📖'], output: { emoji: '📱', name: 'E-Reader', flavor: "Computer + Book. An entire library in your pocket. Don't get sand in it." } },
        { inputs: ['⚡', '🚗'], output: { emoji: '🏎️', name: 'Electric Car', flavor: "Energy (Lightning) + Automobile. Zippy, silent, and eco-friendlier." } },
        { inputs: ['🧬', '⏳'], output: { emoji: '➡️', name: 'Evolution', flavor: "Life (DNA) + Time (Hourglass). The slow, grand arrow of change over eons." } },
        { inputs: ['🧱', '💎'], output: { emoji: '🏛️', name: 'Grand Building', flavor: "Brick (Building) + Glass (Precious). A magnificent structure of importance." } },
        { inputs: ['🌳', '🍎'], output: { emoji: '🥧', name: 'Pie', flavor: "Tree (Apple) + Dough (Pie Crust). A classic, comforting dessert." } },
        { inputs: ['⚙️', '🔗'], output: { emoji: '⛓️', name: 'Heavy Chains', flavor: "Metal + Chain. Even stronger links, for serious anchoring." } },
        { inputs: ['🧬', '🐦'], output: { emoji: '🥚', name: 'Egg', flavor: "Life (DNA) + Bird. The beginning of a new feathered life." } },
        { inputs: ['🥚', '🔥'], output: { emoji: '🍳', name: 'Cooked Egg', flavor: "Egg + Fire. Fried, scrambled, or poached – a versatile staple." } },
        { inputs: ['🌿', '🧬'], output: { emoji: '🐄', name: 'Cow', flavor: "Grass + Life (DNA). A gentle, cud-chewing provider of milk." } },
        { inputs: ['🐄', '💧'], output: { emoji: '🥛', name: 'Milk', flavor: "Cow + Water (Hydration). Nature's perfect white beverage." } }, 
        { inputs: ['🌻', '🐝'], output: { emoji: '🍯', name: 'Honey', flavor: "Sunflower + Bee. Nature's sweet golden nectar, by busy bees." } }, 
        { inputs: ['🌃', '🐺'], output: { emoji: '🌕', name: 'Full Moon', flavor: "Night + Wolf. The moon at its brightest, stirring wild transformations." } }, 
        { inputs: ['🏞️', '🧬'], output: { emoji: '🐺', name: 'Wolf', flavor: "Forest + Life (DNA). A cunning pack hunter, its howl echoes." } },
        { inputs: ['🤖', '✈️'], output: { emoji: '🛸', name: 'Drone', flavor: "Robot + Airplane. An unmanned aerial vehicle, for surveillance or delivery." } },
        { inputs: ['⚙️', '💎'], output: { emoji: '💰', name: 'Gold Coin', flavor: "Metal + Gem (Precious). Shiny currency for alchemical transactions." } }, 
        { inputs: ['🏝️', '💰'], output: { emoji: '🏴‍☠️', name: 'Pirate Treasure', flavor: "Island + Gold Coin. X marks the spot for buried riches!" } },
        { inputs: ['🦠', '🥶'], output: { emoji: '🤧', name: 'Sickness', flavor: "Microbe + Permafrost (Cold). That sniffly, sneezy feeling. Not fun." } },
        { inputs: ['🗿', '⏳'], output: { emoji: '🏛️', name: 'Ancient Ruins', flavor: "Carved Figure (Statue) + Sand (Time). Crumbling remains of a once-great past." } }, 
        { inputs: ['📖', '✨'], output: { emoji: '🪄', name: 'Spellbook', flavor: "Book + Star (Magic). A tome of enchantments, filled with arcane lore." } },
        { inputs: ['🪄', '🧍'], output: { emoji: '🧙', name: 'Wizard', flavor: "Spellbook (Wand) + Human. A practitioner of the mystical arts. Abracadabra!" } }, 
        { inputs: ['🧙', '🔥'], output: { emoji: '💥', name: 'Fireball Spell', flavor: "Wizard + Fire. A classic offensive incantation. Whoosh!" } }, 
        { inputs: ['🧙', '🧊'], output: { emoji: '🥶', name: 'Freeze Spell', flavor: "Wizard + Ice. A magical blast of cold. Don't get hit!" } }, 
        { inputs: ['🌿', '🧍'], output: { emoji: '🐎', name: 'Horse', flavor: "Grass (Food) + Human (Domestication). A noble steed for riding." } },
        { inputs: ['🐎', '✨'], output: { emoji: '🦄', name: 'Unicorn', flavor: "Horse + Star (Magic). A legendary horned equine, pure and elusive." } }, 
        { inputs: ['🤖', '🛠️'], output: { emoji: '🦾', name: 'Cyborg Arm', flavor: "Robot + Tools (Enhancement). A mechanical limb of great power." } },
        { inputs: ['📜', '🌍'], output: { emoji: '🗺️', name: 'Map', flavor: "Scroll (Paper) + Earth. A representation of the world, guiding travelers." } },
        { inputs: ['🏝️', '🗺️'], output: { emoji: '🧭', name: 'Treasure Hunt', flavor: "Island + Map. A guide to buried riches and forgotten secrets." } }, 
        { inputs: ['🦎', '🔥'], output: { emoji: '🐲', name: 'Dragon', flavor: "Reptile + Fire. A mythical, fire-breathing beast of legend. Fear its roar!" } },
    ];
    
    function countAndLogRecipes() { /* ... (same) ... */ const uniqueOutputObjects = new Set(); recipes.forEach(r => { if (typeof r.output.emoji === 'string' && r.output.emoji.length > 0 && /\p{Emoji}/u.test(r.output.emoji)) { uniqueOutputObjects.add(JSON.stringify(r.output)); } else { console.warn("CRITICAL: Invalid or placeholder emoji found in recipe output. THIS MUST BE FIXED:", r); } }); const baseElementJSONs = new Set(baseElements.map(el => JSON.stringify(el))); const discoverableCount = uniqueOutputObjects.size; const allPresentEmojis = new Set(); baseElements.forEach(el => allPresentEmojis.add(el.emoji)); recipes.forEach(r => { if (typeof r.output.emoji === 'string' && r.output.emoji.length > 0 && /\p{Emoji}/u.test(r.output.emoji)) { allPresentEmojis.add(r.output.emoji); } }); console.log(`Base Elements: ${baseElements.length}`); console.log(`Unique Discoverable Elements (name+emoji+flavor combos) from Recipes: ${discoverableCount}`); console.log(`TOTAL Unique Element Emojis in Game (for progress display): ${allPresentEmojis.size}`); progressCounter.dataset.total = allPresentEmojis.size; }

    let discoveredEmojis = new Set(); 
    let selectedSlots = [null, null]; 
    let draggedItem = null;          
    let lastViewedElement = null;    
    let tooltipTimeout = null;
    let consecutiveFailedAttempts = 0;
    const FAILED_ATTEMPT_THRESHOLD_FOR_PROACTIVE_HINT = 5;
    let currentUserName = localStorage.getItem('emojiAlchemyUserName') || null;

    // --- Dark Mode, Tooltip, Game Init, Save/Load, DOM Creation, Event Handlers (all same as previous robust version) ---
    function setDarkMode(isDark) { body.setAttribute('data-theme', isDark ? 'dark' : 'light'); darkModeToggleButton.textContent = isDark ? '☀️' : '🌙'; localStorage.setItem('emojiAlchemyTheme', isDark ? 'dark' : 'light'); }
    darkModeToggleButton.addEventListener('click', () => { const isCurrentlyDark = body.getAttribute('data-theme') === 'dark'; setDarkMode(!isCurrentlyDark); playSound('ui_tap'); });
    function loadTheme() { const savedTheme = localStorage.getItem('emojiAlchemyTheme'); setDarkMode(savedTheme === 'dark'); }

    function showTooltip(element, event) { clearTimeout(tooltipTimeout); tooltipEmoji.textContent = element.emoji; tooltipName.textContent = element.name; tooltipFlavor.textContent = element.flavor || "A mysterious element..."; let x = 0; let y = 0; if (event instanceof MouseEvent) { x = event.clientX; y = event.clientY; } else if (event instanceof TouchEvent && event.touches.length > 0) { x = event.touches[0].clientX; y = event.touches[0].clientY; } else if (event && event.target) { const rect = event.target.getBoundingClientRect(); x = rect.left + rect.width / 2; y = rect.top; } dynamicTooltip.style.left = `${x + 15}px`; dynamicTooltip.style.top = `${y + 15}px`; const tooltipRect = dynamicTooltip.getBoundingClientRect(); if (tooltipRect.right > window.innerWidth - 10) { dynamicTooltip.style.left = `${x - tooltipRect.width - 15}px`; } if (tooltipRect.bottom > window.innerHeight - 10) { dynamicTooltip.style.top = `${y - tooltipRect.height - 15}px`; } dynamicTooltip.classList.add('visible'); }
    function hideTooltip(immediate = false) { if (immediate) { dynamicTooltip.classList.remove('visible'); } else { tooltipTimeout = setTimeout(() => { dynamicTooltip.classList.remove('visible'); }, 300); } }
    dynamicTooltip.addEventListener('mouseenter', () => clearTimeout(tooltipTimeout));
    dynamicTooltip.addEventListener('mouseleave', () => hideTooltip());

    function initGame() {
        countAndLogRecipes(); 
        loadTheme(); loadSoundPreference(); loadProgress();
        currentUserName = localStorage.getItem('emojiAlchemyUserName') || null; 
        if (discoveredEmojis.size === 0) {
            baseElements.forEach(el => discoveredEmojis.add(JSON.stringify(el)));
        }
        renderPalette(); renderDiscoveredList(); updateProgressCounter();
        clearSlotsAndResult();
        resultMessage.textContent = "Drag or tap elements to combine!";
        hideTooltip(true);
        const interactionEvents = ['click', 'touchstart', 'keydown'];
        const initAudioOnce = () => { initAudioContext(); interactionEvents.forEach(event => document.body.removeEventListener(event, initAudioOnce)); };
        interactionEvents.forEach(event => document.body.addEventListener(event, initAudioOnce, { once: true }));
    }

    function saveProgress() { localStorage.setItem('emojiAlchemy_V14_RefinedFinal', JSON.stringify(Array.from(discoveredEmojis))); } 
    function loadProgress() { const saved = localStorage.getItem('emojiAlchemy_V14_RefinedFinal'); if (saved) { try { JSON.parse(saved).forEach(itemStr => discoveredEmojis.add(itemStr)); } catch (e) { console.error("Error loading progress:", e); localStorage.removeItem('emojiAlchemy_V14_RefinedFinal'); } } }

    function createEmojiItemDOM(element, isPaletteItem = false) {
        const item = document.createElement('div'); item.classList.add('emoji-item');
        item.textContent = element.emoji; item.setAttribute('aria-label', element.name);
        item.setAttribute('role', 'button'); item.tabIndex = 0;
        const handleInteraction = (e) => { e.stopPropagation(); lastViewedElement = element; showTooltip(element, e); playSound('ui_tap', 0.03); };
        item.addEventListener('click', handleInteraction);
        item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInteraction(e); } });
        item.addEventListener('mouseenter', (e) => showTooltip(element, e));
        item.addEventListener('mouseleave', () => hideTooltip());
        if (isPaletteItem) {
            item.draggable = true;
            item.addEventListener('dragstart', (e) => { draggedItem = element; try { e.dataTransfer.setData('application/json', JSON.stringify(element)); } catch (err) {} e.dataTransfer.effectAllowed = "copy"; item.classList.add('dragging'); hideTooltip(true); });
            item.addEventListener('dragend', () => { draggedItem = null; item.classList.remove('dragging'); });
        }
        return item;
    }

    function renderPalette() { palette.innerHTML = ''; getSortedDiscoveredArray().forEach(element => { palette.appendChild(createEmojiItemDOM(element, true)); }); }
    function renderDiscoveredList() { discoveredList.innerHTML = ''; getSortedDiscoveredArray().forEach(element => { discoveredList.appendChild(createEmojiItemDOM(element, false)); }); }
    function getSortedDiscoveredArray() { return Array.from(discoveredEmojis).map(itemStr => JSON.parse(itemStr)).sort((a, b) => a.name.localeCompare(b.name)); }

    function fillSlot(slotIndex, element) { selectedSlots[slotIndex] = element; const slotElement = slotIndex === 0 ? slot1 : slot2; slotElement.textContent = element.emoji; slotElement.classList.add('filled'); showTooltip(element, { target: slotElement }); playSound('ui_tap', 0.04); }
    function clearSlotDOM(slotIndex) { const slotElement = slotIndex === 0 ? slot1 : slot2; slotElement.textContent = ''; slotElement.classList.remove('filled'); }
    function clearSlotsAndResult(specificSlot = -1) { if (specificSlot === 0 || specificSlot === -1) { selectedSlots[0] = null; clearSlotDOM(0); } if (specificSlot === 1 || specificSlot === -1) { selectedSlots[1] = null; clearSlotDOM(1); } if (specificSlot === -1) { resultMessage.textContent = ""; newEmojiDisplay.textContent = ""; newEmojiNameText.textContent = ""; newEmojiFlavorText.textContent = ""; } }
    
    body.addEventListener('click', (e) => { const target = e.target; if (!target.closest('.emoji-item') && !target.closest('.combo-slot') && !target.closest('.tooltip') && !target.closest('.control-button') && !target.closest('.modal-content')) { hideTooltip(true); lastViewedElement = null; } });

    [slot1, slot2].forEach((slot, index) => {
        const handleSlotClick = (e) => { e.stopPropagation(); if (selectedSlots[index]) { selectedSlots[index] = null; clearSlotDOM(index); hideTooltip(true); lastViewedElement = null; playSound('ui_tap', 0.04); } else if (lastViewedElement) { fillSlot(index, lastViewedElement); } };
        slot.addEventListener('click', handleSlotClick);
        slot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSlotClick(e); } });
        slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.classList.add('drag-over'); if (draggedItem) showTooltip(draggedItem, e); });
        slot.addEventListener('dragleave', () => { slot.classList.remove('drag-over'); if (!selectedSlots[index]) hideTooltip(); });
        slot.addEventListener('drop', (e) => { e.preventDefault(); slot.classList.remove('drag-over'); let droppedElementData = draggedItem; if (!droppedElementData) { try { droppedElementData = JSON.parse(e.dataTransfer.getData('application/json')); } catch (err) {} } if (droppedElementData) { fillSlot(index, droppedElementData); } draggedItem = null; });
    });

    combineButton.addEventListener('click', () => {
        playSound('ui_tap', 0.05); hideTooltip(true);
        if (!selectedSlots[0] || !selectedSlots[1]) { resultMessage.textContent = "Select two elements to combine."; newEmojiDisplay.textContent = ""; newEmojiNameText.textContent = ""; newEmojiFlavorText.textContent = ""; resultDetailsDiv.classList.remove('visible'); return; }
        const input1 = selectedSlots[0]; const input2 = selectedSlots[1];
        const inputEmojisSorted = [input1.emoji, input2.emoji].sort();
        const foundRecipe = recipes.find(recipe => { const sortedRecipeInputs = [...recipe.inputs].sort(); return sortedRecipeInputs[0] === inputEmojisSorted[0] && sortedRecipeInputs[1] === inputEmojisSorted[1]; });
        resultMessage.textContent = `Combining ${input1.name} + ${input2.name}...`;
        newEmojiDisplay.textContent = ""; newEmojiNameText.textContent = ""; newEmojiFlavorText.textContent = "";
        resultDetailsDiv.classList.remove('visible'); 

        if (foundRecipe) {
            consecutiveFailedAttempts = 0; 
            const outputElementObject = foundRecipe.output; const outputElementString = JSON.stringify(outputElementObject);
            newEmojiDisplay.textContent = outputElementObject.emoji; newEmojiNameText.textContent = outputElementObject.name; newEmojiFlavorText.textContent = outputElementObject.flavor || "";
            if (!discoveredEmojis.has(outputElementString)) {
                discoveredEmojis.add(outputElementString); saveProgress(); renderPalette(); renderDiscoveredList(); updateProgressCounter();
                resultMessage.textContent = `✨ New Discovery! ✨`; playSound('discover', 0.07);
            } else {
                resultMessage.textContent = `Already Discovered:`; playSound('combine_success_old', 0.05);
            }
        } else {
            consecutiveFailedAttempts++;
            resultMessage.textContent = "Nothing new happened..."; newEmojiDisplay.textContent = "❓"; newEmojiNameText.textContent = "Hmm..."; newEmojiFlavorText.textContent = "These elements don't seem to react. Try another combination!"; playSound('combine_fail', 0.06);
            if (consecutiveFailedAttempts >= FAILED_ATTEMPT_THRESHOLD_FOR_PROACTIVE_HINT) {
                provideHint(true); 
                consecutiveFailedAttempts = 0; 
            }
        }
        setTimeout(() => resultDetailsDiv.classList.add('visible'), 10); 
    });

    function updateProgressCounter() {
        const total = parseInt(progressCounter.dataset.total || '0');
        progressCounter.textContent = `${getSortedDiscoveredArray().length} / ${total}`;
    }
    
    function provideHint(isProactive = false) { playSound('ui_tap'); const discoveredArray = getSortedDiscoveredArray(); newEmojiDisplay.textContent = ""; newEmojiNameText.textContent = ""; newEmojiFlavorText.textContent = ""; resultDetailsDiv.classList.remove('visible'); if (discoveredArray.length === 0 && !isProactive) { resultMessage.textContent = "Hint: Start by combining the base elements like 💧 and 🔥!"; return; } const undiscoveredRecipes = recipes.filter(recipe => !discoveredEmojis.has(JSON.stringify(recipe.output))); if (undiscoveredRecipes.length === 0) { resultMessage.textContent = "🎉 You've discovered everything! Amazing!"; return; } let hintText = ""; let hintGiven = false; if (isProactive && undiscoveredRecipes.length < 10 && Math.random() < 0.2) { const recipeToReveal = undiscoveredRecipes[Math.floor(Math.random() * undiscoveredRecipes.length)]; const input1Obj = baseElements.find(el => el.emoji === recipeToReveal.inputs[0]) || discoveredArray.find(el => el.emoji === recipeToReveal.inputs[0]); const input2Obj = baseElements.find(el => el.emoji === recipeToReveal.inputs[1]) || discoveredArray.find(el => el.emoji === recipeToReveal.inputs[1]); if (input1Obj && input2Obj) { hintText = `Try combining ${input1Obj.name} (${input1Obj.emoji}) + ${input2Obj.name} (${input2Obj.emoji}) to discover ${recipeToReveal.output.name} (${recipeToReveal.output.emoji})!`; hintGiven = true; } } if (!hintGiven) { for (const recipe of undiscoveredRecipes) { const [rInput1, rInput2] = recipe.inputs; const pHasInput1 = discoveredArray.some(el => el.emoji === rInput1); const pHasInput2 = discoveredArray.some(el => el.emoji === rInput2); if (pHasInput1 && pHasInput2) { const el1 = discoveredArray.find(el => el.emoji === rInput1); const el2 = discoveredArray.find(el => el.emoji === rInput2); hintText = `Hint: You have the ingredients! What happens if you combine ${el1.name} (${el1.emoji}) with ${el2.name} (${el2.emoji})?`; hintGiven = true; break; } } } if (!hintGiven) { for (const recipe of undiscoveredRecipes) { const [rInput1, rInput2] = recipe.inputs; const pHasInput1 = discoveredArray.some(el => el.emoji === rInput1); const pHasInput2 = discoveredArray.some(el => el.emoji === rInput2); if (pHasInput1 && !pHasInput2) { const el1 = discoveredArray.find(el => el.emoji === rInput1); hintText = `Hint: ${el1.name} (${el1.emoji}) can be combined with an element you haven't discovered or used in this way...`; hintGiven = true; break; } if (pHasInput2 && !pHasInput1) { const el2 = discoveredArray.find(el => el.emoji === rInput2); hintText = `Hint: ${el2.name} (${el2.emoji}) can be combined with an element you haven't discovered or used in this way...`; hintGiven = true; break; } } } if (!hintGiven || (isProactive && !hintText)) { if (discoveredArray.length > 0) { const lastDiscovered = discoveredArray[discoveredArray.length -1]; hintText = `Hint: Keep experimenting! Perhaps your newest discovery, ${lastDiscovered.name} (${lastDiscovered.emoji}), holds a key?`; } else { hintText = "Hint: Try combining your starting elements in different ways!" } } resultMessage.textContent = hintText || "Hint: Explore combinations with your newest discoveries!"; }
    hintButton.addEventListener('click', () => provideHint(false));
    
    exportButton.addEventListener('click', () => { playSound('ui_tap'); if (!currentUserName) { const name = window.prompt("Enter your name for the save file (e.g., 'Alex'):", currentUserName || ""); if (name && name.trim() !== "") { currentUserName = name.trim().replace(/[^a-zA-Z0-9_ \-]/g, ''); localStorage.setItem('emojiAlchemyUserName', currentUserName); } else if (name === null) { resultMessage.textContent = "Save cancelled."; return; } else { currentUserName = "Player"; localStorage.setItem('emojiAlchemyUserName', currentUserName); /* Default if empty */ } } const progressData = JSON.stringify(Array.from(discoveredEmojis)); const blob = new Blob([progressData], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; const date = new Date(); const dateString = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`; a.download = `${currentUserName}_alchemy_${dateString}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); resultMessage.textContent = `Progress saved as ${a.download}!`; });
    importFileInput.addEventListener('change', (event) => { playSound('ui_tap'); const file = event.target.files[0]; if (file) { const filenameParts = file.name.toLowerCase().split('_alchemy_'); if (filenameParts.length === 2 && filenameParts[0]) { const potentialName = filenameParts[0]; currentUserName = potentialName.replace(/[^a-zA-Z0-9_ \-]/g, ''); localStorage.setItem('emojiAlchemyUserName', currentUserName); console.log("Loaded username from file:", currentUserName); } else { console.log("Could not parse username from filename. It will prompt on next manual save if no name is set."); } const reader = new FileReader(); reader.onload = (e) => { try { const importedDataString = e.target.result; const importedDataArray = JSON.parse(importedDataString); if (Array.isArray(importedDataArray)) { if (importedDataArray.every(itemStr => { try { const obj = JSON.parse(itemStr); return obj && obj.emoji && obj.name; } catch { return false; } })) { discoveredEmojis.clear(); importedDataArray.forEach(itemStr => discoveredEmojis.add(itemStr)); saveProgress(); renderPalette(); renderDiscoveredList(); updateProgressCounter(); clearSlotsAndResult(); resultMessage.textContent = "Progress loaded successfully" + (currentUserName ? ` for ${currentUserName}!` : "!"); consecutiveFailedAttempts = 0; } else { throw new Error("Invalid data structure in file."); } } else { throw new Error("File does not contain a valid array."); } } catch (error) { console.error("Error loading progress:", error); resultMessage.textContent = "Failed to load progress. File may be invalid."; } finally { importFileInput.value = ''; } }; reader.readAsText(file); } });

    instructionsButton.addEventListener('click', () => { playSound('ui_tap'); instructionsModal.style.display = "flex"; setTimeout(() => instructionsModal.classList.add('visible'), 10); });
    closeInstructionsButton.addEventListener('click', () => { playSound('ui_tap'); instructionsModal.classList.remove('visible'); setTimeout(() => instructionsModal.style.display = "none", 250); });
    window.addEventListener('click', (event) => { if (event.target === instructionsModal) { playSound('ui_tap'); instructionsModal.classList.remove('visible'); setTimeout(() => instructionsModal.style.display = "none", 250); } });
    
    resetButton.addEventListener('click', () => {
        playSound('ui_tap');
        if (confirm("Are you sure you want to reset all your alchemical progress? This cannot be undone!")) {
            localStorage.removeItem('emojiAlchemy_V14_FinalRefined'); 
            localStorage.removeItem('emojiAlchemyTheme'); 
            localStorage.removeItem('emojiAlchemySounds');
            localStorage.removeItem('emojiAlchemyUserName'); 
            currentUserName = null; 
            discoveredEmojis.clear(); selectedSlots = [null, null]; lastViewedElement = null;
            consecutiveFailedAttempts = 0; 
            initGame();
        }
    });

    initGame();
});
