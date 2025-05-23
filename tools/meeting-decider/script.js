// Wait for the entire HTML document to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const attendeesInput = document.getElementById('attendees');
    const stepperMinus = document.querySelector('.stepper-btn.minus');
    const stepperPlus = document.querySelector('.stepper-btn.plus');
    const durationSelect = document.getElementById('duration');
    const agendaHidden = document.getElementById('agenda'); 
    const agendaToggleContainer = document.getElementById('agendaToggle');
    const purposeSelect = document.getElementById('purpose');
    const snacksHidden = document.getElementById('snacks'); 
    const snacksToggleContainer = document.getElementById('snacksToggle');
    const desperationSlider = document.getElementById('desperation');
    const bossOverrideCheckbox = document.getElementById('bossOverride');
    const consultDeciderButton = document.getElementById('consultDecider');
    const deciderAppContainer = document.querySelector('.decider-app-container'); // For screen shake
    const deciderVerdictContainer = document.getElementById('deciderVerdict');
    const deciderThinkingText = deciderVerdictContainer.querySelector('.verdict-thinking');
    const deciderResultText = deciderVerdictContainer.querySelector('.verdict-result');
    const shareVerdictBtn = document.getElementById('shareVerdictBtn');

    // --- State Variables ---
    let currentVerdictForSharing = ""; 
    let currentVerdictCategory = ""; 
    let typingInterval; 
    let consultClickCount = 0; // For Rapid Fire Clicks Easter Egg
    let lastConsultClickTime = 0; // For Rapid Fire Clicks Easter Egg

    // --- Helper Function for Stepper Buttons (+/- for Attendees) ---
    if (attendeesInput && stepperMinus && stepperPlus) { 
        stepperMinus.addEventListener('click', () => {
            let currentValue = parseInt(attendeesInput.value) || 1; 
            if (currentValue > parseInt(attendeesInput.min)) {
                attendeesInput.value = currentValue - 1;
            }
        });
        stepperPlus.addEventListener('click', () => {
            let currentValue = parseInt(attendeesInput.value) || 0; 
            attendeesInput.value = currentValue + 1;
        });
    }

    // --- Helper Function for Toggle Buttons (Yes/No for Agenda, Snacks) ---
    function setupToggle(container, hiddenInput) {
        if (!container || !hiddenInput) { 
            console.error("Toggle setup failed: Element not found.", { containerId: container ? container.id : 'null', hiddenInputId: hiddenInput ? hiddenInput.id : 'null' });
            return; 
        }
        const buttons = container.querySelectorAll('.toggle-btn');
        if (buttons.length === 0) {
            console.error("Toggle setup failed: No '.toggle-btn' found in container:", container.id);
            return;
        }
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active')); 
                button.classList.add('active'); 
                hiddenInput.value = button.dataset.value; 
            });
        });
    }
    setupToggle(agendaToggleContainer, agendaHidden);
    setupToggle(snacksToggleContainer, snacksHidden);

    // --- Typing Animation for "Thinking" Text ---
    function typeOutText(element, text, speed = 40) { 
        clearInterval(typingInterval); 
        element.textContent = ''; 
        let i = 0; 
        element.style.display = 'block'; 
        typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i); 
                i++;
            } else {
                clearInterval(typingInterval); 
            }
        }, speed);
    }

    // --- Confetti Functions ---
    function launchConfetti(options = {}) {
        if (typeof confetti === 'function') { 
            const defaults = { particleCount: 120, spread: 90, origin: { y: 0.6 } };
            confetti({...defaults, ...options});
        }
    }
    function launchSnackConfetti() {
        if (typeof confetti === 'function') {
            const scalar = 2.5; 
            const cookieShape = confetti.shapeFromPath({ path: 'M10 1C5.03 1 1 5.03 1 10C1 14.97 5.03 19 10 19C14.97 19 19 14.97 19 10C19 5.03 14.97 1 10 1ZM10 16.5C6.41 16.5 3.5 13.59 3.5 10C3.5 6.41 6.41 3.5 10 3.5C13.59 3.5 16.5 6.41 16.5 10C16.5 13.59 13.59 16.5 10 16.5ZM10 5C9.17 5 8.5 5.67 8.5 6.5C8.5 7.33 9.17 8 10 8C10.83 8 11.5 7.33 11.5 6.5C11.5 5.67 10.83 5 10 5ZM10 12C9.17 12 8.5 12.67 8.5 13.5C8.5 14.33 9.17 15 10 15C10.83 15 11.5 14.33 11.5 13.5C11.5 12.67 10.83 12 10 12Z' });
            const drinkShape = confetti.shapeFromPath({ path: 'M15 2H9C8.45 2 8 2.45 8 3V5.81C7.4 5.4 6.74 5.11 6 5.04V3C6 2.45 5.55 2 5 2H3C2.45 2 2 2.45 2 3V17C2 17.55 2.45 18 3 18H5C5.55 18 6 17.55 6 17V15C6.58 15.01 7.13 14.91 7.65 14.71L9.58 19.13C9.78 19.63 10.31 19.88 10.81 19.68C11.31 19.48 11.56 18.95 11.36 18.45L9.43 14H15C15.55 14 16 13.55 16 13V3C16 2.45 15.55 2 15 2ZM4 16H3V4H4V16ZM14 12H9V4H14V12Z' });
            confetti({ shapes: [cookieShape, drinkShape], angle: 90, spread: 120, particleCount: Math.floor(30 * scalar), origin: { y: 0.6 }, colors: ['#FFC107', '#FF9800', '#8BC34A', '#4CAF50', '#F44336', '#E91E63'] });
        }
    }

    // --- Screen Shake Function for "Maximum Chaos" Easter Egg ---
    function triggerScreenShake() {
        if (deciderAppContainer) { // Check if the container element exists
            deciderAppContainer.classList.add('shake-it');
            setTimeout(() => {
                deciderAppContainer.classList.remove('shake-it');
            }, 300); // Duration of the shake animation in ms
        }
    }

    // --- Verdict Text Arrays (Massively Expanded) ---
    const thinkingMessages = [
        "The Decider is consulting the ancient algorithms of productivity...", "Recalibrating the Worthiness Matrix...", "Gazing into the Crystal Ball of Calendar Management...", "The Decider is pondering your query with intense focus...", "Analyzing attendee patience levels (they're surprisingly low)...", "Checking the alignment of productive planets...", "Shuffling the tarot cards of task delegation...", "Calculating the exact cost of this potential time vortex...", "The Decider is brewing a fresh pot of 'Is-This-Necessary?' tea...", "Cross-referencing with the Grand Tome of Terrible Meetings...", "Dusting off the Scepter of Sensible Scheduling...", "The gears of judgment are turning... slowly, but surely.", "Contemplating the opportunity cost of another meeting...", "Accessing the archives of 'Meetings That Should Have Been Emails'...", "The Decider is currently experiencing heavy cognitive load. Please wait.", "Filtering out the 'just because' requests...", "Performing a sanity check on your meeting parameters...", "Is this meeting essential, or just a habit? The Decider wonders.", "The Decider is taking a deep breath before rendering judgment.", "One moment, running diagnostics on the 'Pointless Meeting Detector'...", "Let's see... does this spark joy, or just fill a calendar slot?", "The Decider is in its zen garden, seeking clarity for your query.", "Reticulating splines... of productivity!", "Just feeding your request to the hamsters that power this thing.", "The Decider is currently consulting its rubber duck for advice.", "Warming up the logic circuits... brrr... beep boop.", "The Decider is doing some serious number crunching. Or maybe just ordering pizza.", "Searching for a glimmer of hope in your meeting request...", "If the Decider had eyes, they'd be rolling right now. Just kidding... mostly.", "Hold please, the Decider is trying to remember what meetings are FOR.", "The Decider is aligning its chakras with the universal flow of efficiency...", "Communing with the spirits of long-cancelled meetings...", "The Oracle—er, Decider—is deciphering the productivity runes...", "Polishing the Monocle of Meeting Merit...", "This requires a deeper dive... into the abyss of your calendar request.", "The Decider is channeling its inner Marie Kondo: Does this meeting spark productivity?", "Just a sec, updating the 'Time Waster' probability index...", "The Decider is currently on a coffee break. Oh wait, no, it's thinking.", "Engaging advanced heuristic algorithms... or just guessing.", "If this were a game show, the category would be 'Meetings to Avoid'.", "The Decider is doing a quick mental yoga pose to find balance... for your meeting.", "Consulting the Efficiency Ether... Stand by.", "The Decider is running this through its 'Common Sense' filter. Results pending.", "One does not simply schedule a meeting... without consulting the Decider.", "The Decider is currently unavailable, it's in a meeting about meetings. Oh, the irony!", "The Decider is whispering incantations to the Server Gods of Scheduling...", "Buffering... please enjoy these imaginary hold tunes.", "The Decider is currently wrestling with the concept of 'synergy'.", "Just a moment, the Decider is faxing your request to the Department of Dubious Meetings.", "The Decider is asking its magic 8-ball... this might take a while."
    ]; // Count: 50
    const emailVerdicts = [
        "This has 'EMAIL' written all over it. Save humanity some time. Your inbox awaits.", "Verdict: Certified Email Material. Your colleagues' calendars (and future you) will thank you.", "The Decider has spoken: Type it out. Spare the meeting. Let the keystrokes flow.", "Is this meeting a trap? It looks like an email in disguise. Abort! Abort!", "The Decider foresees a future where this meeting was an email. Make it so.", "Launching a full meeting for this? That's like using a cannon to swat a fly. Email it.", "Put down the calendar invite and pick up your keyboard. This is email territory.", "The ancient scrolls of productivity clearly state: 'When in doubt, email it out.' This is one of those times.", "Your team's collective groan was just heard by the Decider. Make it an email.", "This query screams for asynchronous communication. Translation: EMAIL.", "Just send the darn email. Seriously.", "This could've been a Slack message, but an email will do too.", "Nope. Not a meeting. Try again (with an email draft).", "The Decider says: 'Email. Next case!'", "Is your keyboard broken? If not, this is an email.", "The Decider just saved you valuable minutes. You're welcome. (It's an email).", "Consider this a divine intervention. Send an email instead.", "If you make this a meeting, the Decider will personally haunt your calendar.", "This is so clearly an email, the Decider almost didn't need to think.", "Warning: Scheduling this meeting may cause spontaneous naps among attendees. Email it.", "The 'Reply All' button is your friend here. Not the 'New Meeting' button.", "One word: E. M. A. I. L.", "The Decider's verdict is in, and it's spelled E-M-A-I-L.", "Unless this meeting involves a winning lottery ticket, it's an email.", "Let's be honest, you knew this was an email before you even asked.", "This meeting idea is email-shaped. Don't try to fit a square peg in a round meeting slot.", "The Decider's official stance: Less talky, more typey. Email.", "Could this be simpler? Yes. As an email.", "That sound you hear? It's your colleagues silently begging for this to be an email.", "For the love of all that is productive, just email it!", "The Decider is giving this a hard pass. As in, pass it on... as an email.", "This meeting idea has been weighed, measured, and found wanting. (An email is sufficient).", "Do your keyboard a favor and type this out. It's an email.", "The stars are not aligned for this meeting. They are, however, perfectly aligned for an email.", "Let the record show: this should be an email. The Decider rests its case.", "If this meeting were a food, it'd be a single, dry cracker. An email is more substantial.", "The Decider has consulted its crystal ball, and it shows... an email draft.", "This is not the meeting you are looking for. *waves hand* Send an email.", "Your inbox called. It wants this message. Not your calendar.", "The path of least resistance (and most sense) is an email.", "The Decider just did a backflip of certainty. This is an email.", "This meeting idea has been officially friend-zoned by Productivity. Send an email.", "If this meeting were a song, it'd be a one-word chorus: 'EMAIL!'", "The Decider has run the numbers. The ROI on this meeting is negative. Email it.", "This doesn't need a meeting; it needs a spellchecker and the 'send' button.", "The Decider's analysis complete: This information can be conveyed via pixels, not presence. Email.", "This is a classic 'could-have-been-an-email' scenario. Don't fall for it.", "Save the trees, save the bandwidth, save the sanity. Send an email.", "The Decider strongly advises against weaponizing the calendar for this. Use email.", "This has all the urgency of a sloth on a Sunday. Email it when you get a chance."
    ]; // Count: 50
    const borderlineVerdicts = [
        "Hmm, this one's teetering on the edge. A killer agenda or exceptional snacks could tip the scales. Otherwise... email?", "Could go either way. Flip a coin, or better yet, reduce attendees and sharpen the focus. Then maybe.", "This meeting is on thin ice. Proceed ONLY if brevity is your co-pilot and purpose your North Star.", "The Decider squints. It *could* be a meeting... if you promise it's not just because you dislike typing.", "A well-written email could slay this meeting dragon. But if you must, make it legendary (and short).", "The Decider is feeling ambivalent. Perhaps a quick chat with ONE key person first?", "This is a 'maybe meeting.' If you can't articulate its value in one sentence, default to email.", "Tread carefully. This path could lead to a productive meeting or a pit of despair. Choose wisely (or email).", "If this meeting were a traffic light, it'd be blinking yellow. Proceed with caution and a very clear map.", "The Decider suggests a trial by fire: can you explain the NEED for this meeting in under 30 seconds? If not, email.", "If it's SUPER short and has donuts, maybe. Otherwise, email.", "This is 50/50. Make the agenda amazing or just email it.", "The Decider is napping on this one. Try making it an email first?", "One more pointless meeting and the Decider quits. Email it (or make this one count!).", "Could be a quick huddle. Or an even quicker email. Your call, brave soul.", "The Decider is shrugging. If you absolutely MUST, keep it under 15 minutes.", "This meeting has 'potential for disaster' written on it. Or 'potential for genius.' Good luck.", "If you can guarantee no one will secretly browse social media, then *maybe* it's a meeting.", "The Decider is giving you the side-eye. Are you *sure* about this one?", "This one requires a leap of faith. Or just a really good facilitator.", "It's not a 'no,' but it's not a 'heck yes' either. Proceed with caution.", "The Decider needs more coffee to make a call on this. Try again later (or just email).", "If this meeting has a theme song, okay. Otherwise, consider the email option.", "This is the Schrödinger's Cat of meetings. It's both an email and a meeting until you schedule it.", "The Decider feels this could be an email, but is willing to be proven wrong... this time.", "This is where heroes are made... or where time goes to die. Your choice.", "The Decider is on the fence. Maybe a quick poll with potential attendees?", "If this meeting were a movie, it'd be 'Highly Debatable Part 3.'", "Okay, but if it's boring, don't blame the Decider. That's on you.", "The Decider will allow it, but is watching you. Closely.", "The Decider is feeling generous. You get a 'maybe.' Don't abuse this power.", "This is walking a tightrope between 'useful' and 'utter waste of time.'", "If you can keep this meeting shorter than a TikTok video, then perhaps.", "The Decider's magic 8-ball says 'Reply hazy, try again... or just email.'", "This could be a quick win, or a slow, agonizing defeat. Choose your adventure.", "If there's even a 1% chance this is an email, it's probably an email. But you can try.", "The Decider is giving you the benefit of the doubt. Make it count.", "This is like a 'choose your own adventure' book where most paths lead to 'email'.", "The potential for this meeting to be an email is... significant. But not absolute.", "The Decider is torn. This could be a productive huddle or a time black hole.", "This meeting is a gamble. The Decider wishes you good luck, you'll need it.", "The Decider suggests sleeping on it. If it still feels like a meeting in the morning, maybe.", "If this meeting had a Yelp review, it'd be 2.5 stars: 'Had potential, didn't deliver.'", "This one is so borderline, the Decider might just flip a virtual coin.", "The Decider is leaning towards 'email,' but is open to persuasion if snacks are involved.", "This could be a 10-minute stand-up. Or a 3-paragraph email. You decide... carefully.", "The Decider is giving you a yellow card. One more bad meeting idea and you're out!", "If this meeting is truly essential, prove it with an agenda that sings.", "The Decider is officially 'whelmed' by this request. Not overwhelmed, not underwhelmed. Just... whelmed.", "This is a 'break glass in case of extreme collaboration needed' kind of meeting. Is it that extreme?"
    ]; // Count: 50
    const meetingVerdicts = [
        "Alright, alright. This one *might* actually need faces in a room (or pixels on a screen). Keep it snappy!", "The stars align! A rare meeting that seems... justified? Don't squander this sacred moment.", "Proceed with the meeting! (Especially if those snacks are real. The Decider has standards.)", "Okay, this sounds important enough to collectively pause other work. Make it count!", "The Decider grants permission. This meeting has potential. Unleash its power (responsibly).", "Yes! This has the hallmarks of a conversation worth having synchronously. Go forth and collaborate!", "A meeting, you say? For this? The Decider nods approvingly. Sometimes, you just gotta talk it out.", "This one passes the vibe check. Schedule it, but don't forget the action items!", "The Decider senses a genuine need for interactive discussion. Engage!", "Permission to meet: GRANTED. May your discussions be fruitful and your time well spent.", "Yeah, okay, this one's a meeting. Don't make the Decider regret this.", "Fine, have your meeting. But it better be good.", "The Decider approves this meeting. Barely. Make it count.", "This sounds like actual collaboration. Go for it.", "A meeting? For this? Surprisingly, yes. Proceed.", "This is it! A bona fide, actual, real-life (or virtual) reason to gather. Hallelujah!", "The Decider gives this meeting two thumbs up. Make some magic happen!", "Unleash the collaboration kraken! This meeting is a GO.", "Sometimes, an email just won't cut it. This is one of those times. Meet on!", "Yes, a meeting is warranted. The Decider expects great things.", "The energy is right for this. Schedule that meeting and make it productive!", "Clear your schedules, folks. This one's actually worth it!", "The Decider has peered into the future, and this meeting looks promising. (No pressure).", "This isn't just a meeting; it's an OPPORTUNITY. Seize it!", "Go ahead, book the room (or the Zoom). This one gets the green light.", "A meeting it is! May your points be clear and your rambling minimal.", "The Decider sees value here. Convene the council!", "This has 'productive discussion' written (faintly) all over it. Don't disappoint.", "Against all odds, this appears to be a legitimate meeting. Well done.", "The Decider is cautiously optimistic. Schedule it, and prove its worth.", "The Decider has a good feeling about this one. Schedule away!", "This meeting idea actually sparks a little joy. Go for it!", "For once, the Decider agrees: this needs a proper meeting. Impressive!", "This is what meetings were *meant* to be for. Make it happen.", "The Decider is officially intrigued. This meeting has potential.", "Gather the troops! This discussion is worthy of their time.", "This one has 'synergy' written all over it (in a good way, for once).", "The Decider approves this message... er, meeting.", "A rare gem! This meeting actually sounds useful. Don't mess it up.", "Yes, connect, collaborate, conquer! This meeting is a go.", "The Decider is actually excited for this meeting. Don't let that go to your head.", "This meeting has the potential to be... not terrible. High praise from the Decider!", "Okay, you've convinced the Decider. This meeting may proceed.", "This is a valid use of collective human time. Shocking, I know. Schedule it.", "The Decider is giving you a high-five for this one. It's a meeting!", "Lock it in! This meeting sounds like a winner.", "The Decider is breaking its 'no meetings' rule for this one. It must be special.", "This is an A+ meeting proposal. Gold star for you!", "The Decider is practically begging you to schedule this. It's that good an idea.", "Finally! A meeting that makes sense. The Decider is relieved."
    ]; // Count: 50
    const socialVerdicts = [
        "Gather, humans! For team bonding and shared laughter are the elixirs of a happy workplace. Enjoy!", "Yes! A social gathering is a sacred ritual. May your conversations be merry and your connections strong.", "The Decider wholeheartedly endorses fun. Go socialize, you magnificent creatures!", "Team bonding time? Excellent! No agenda needed, just good vibes.", "Absolutely. Schedule that social. The Decider might even crash it (if there are snacks).", "Let the good times roll! Socializing is officially Decider-approved.", "Water cooler chat on steroids? Yes, please! Have a great social gathering.", "The only agenda for this meeting should be 'have fun.' Go for it!", "Forget productivity for a bit. It's time to connect. Enjoy the social time!", "The Decider decrees: more laughter, less TPS reports! Enjoy your social event.", "Socialize! It's good for the soul (and team morale).", "The Decider raises a virtual glass to this. Cheers to team spirit!", "This is the best kind of meeting. Go make some memories!", "Productivity can wait. People first! Have a wonderful social.", "Mandatory fun? Not this time! This sounds genuinely enjoyable. Go team!", "The Decider's favorite kind of meeting! Go forth and be merry.", "If there's cake, the Decider demands an invite. Enjoy the social!", "This isn't work, this is an investment in happiness. Approved!", "Let your hair down (if you have any). Time to socialize!", "The Decider loves a good party. Even a virtual one. Have fun!", "Time to put the 'social' in social distancing (if applicable). Enjoy the connection!", "The Decider is all about that work-life balance. And this is definitely 'life'.", "This meeting's ROI is measured in smiles. Go get 'em!", "No need to decide on this one. Social events are always a 'yes'!", "The Decider says: Party on, Wayne! (And Garth!)", "Unleash the good times! This social event is a go.", "The Decider just put on its party hat for this one. Have a blast!", "This is the kind of meeting that makes work... not feel like work. Enjoy!", "Permission to PAR-TAY! (Responsibly, of course).", "The Decider approves of this vital human interaction. Go bond!"
    ]; // Count: 30
    const bossOverrideVerdicts = [ 
        "The Decider sighs. Your boss's will transcends all logic. May your coffee be strong and your patience endless. (P.S. Maybe suggest snacks?)", "Ah, the 'Boss Card' has been played. The Decider retreats to its mystical cloud. Good luck!", "When the boss calls, the Decider just pours another cup of tea. You're on your own, champ.", "The Decider's algorithms are no match for a determined manager. Godspeed.", "The boss wants it, the boss gets it. The Decider can only offer silent support.", "Well, if the boss insists... The Decider washes its hands of this. May the odds be ever in your favor.", "At this point, the Decider is just an observer. Try to make the best of it!", "The Decider's wisdom is overridden. It's okay, we all have bosses. *pats back*", "May your forced meeting be surprisingly productive. Or at least short.", "The Decider sends thoughts and prayers. And a reminder to mute your mic.", "Boss override activated. The Decider is now in 'power-saving mode' for this one.", "The Decider has been overruled. It happens to the best of us. Just smile and wave.", "Your boss has spoken. The Decider has... opinions... but will keep them to itself.", "This is above the Decider's pay grade. Good luck with that!", "Remember, 'because my boss said so' is a valid reason... to your boss.", "The Decider is now legally obligated to agree with your boss. Enjoy the meeting!", "Boss level unlocked! The Decider has no power here.", "The boss is always right... about scheduling this meeting, apparently. Good luck!", "This is a 'code red, boss alert' situation. The Decider stands down.", "The Decider has been vetoed. It's fine. I'm not crying. It's just... allergies.", "Sometimes you just gotta do what the boss says. The Decider gets it. (Sort of).", "The Decider is just going to hum a little tune while this boss-mandated event occurs.", "The Decider's official response: 'Yes, Boss.' (What else can it say?)", "May this meeting be swift and your suffering minimal. Blame the boss, not the Decider.", "The Decider has logged this under 'Meetings We Don't Talk About'.", "The chain of command is a powerful thing. The Decider bows respectfully (and a little sadly).", "This meeting is now boss-proofed. The Decider can't help you here.", "The Decider is sending you an invisible shield of patience for this one.", "Consider this meeting a 'character-building exercise' courtesy of your boss.", "The Decider's only advice: bring a really good pen for doodling."
    ]; // Count: 30
    const bossPurposeVerdicts = [ 
        "Ah, a directive from the powers that be! The Decider bows to the inevitable. Just ensure there's a clear objective... or at least good coffee.", "Serving the managerial agenda, are we? Very well. The Decider wishes you a productive (and hopefully brief) session.", "The 'chain of command' special. The Decider understands. Try to make it useful anyway!", "When 'because my boss said so' is the reason, the Decider can only offer moral support. And a suggestion for an end time.", "The boss's purpose is a mysterious thing. The Decider hopes it involves a clear outcome for you.", "Executing a boss-mandated meeting? The Decider hopes there's a hidden gem of productivity in there somewhere.", "If your boss needs this meeting, then it shall be. The Decider just hopes it's not a waste of *your* time.", "Navigating the corporate seas, one boss-requested meeting at a time. Good luck, sailor!", "The Decider acknowledges the supreme authority of 'The Boss Told Me To.' Make it snappy.", "This meeting's purpose is 'Boss Satisfaction.' Achieve it swiftly.", "The Decider sees 'Boss's Orders' and immediately puts on its noise-canceling headphones. You got this.", "A meeting by royal decree! May it be less painful than anticipated.", "The Decider's hands are tied. Just try to get through it with your sanity intact.", "When the boss is the purpose, resistance is futile. Make it quick!", "This meeting's success metric: Did the boss seem happy? Good luck.", "The Decider understands. Sometimes the purpose is just 'keeping the boss happy.' Godspeed.", "Boss's agenda? The Decider will just observe from a safe distance.", "This meeting has 'because I said so' energy. Try to find a silver lining.", "The Decider is sending you virtual strength to endure this boss-driven endeavor.", "May your boss's objectives be met swiftly and with minimal pain to others.", "The Decider notes: 'Purpose: Boss.' No further analysis required. Good luck.", "This one's for the org chart. The Decider hopes it's at least interesting.", "If the boss deems it necessary, who is the Decider to argue? (Silently, anyway).", "The Decider is lighting a virtual candle for your productivity during this boss-centric meeting.", "May your boss be pleased and your time not entirely wasted. That's the dream.", "This is what they call 'managing up'... by scheduling a meeting. The Decider is impressed/scared.", "The Decider's only input: make sure your boss knows you scheduled it promptly.", "A meeting to show you're meeting. The corporate circle of life!", "The Decider hopes this boss-meeting comes with a promotion. Or at least a compliment.", "This purpose has 'Performance Review Implications' written all over it. Good luck!"
    ]; // Count: 30
    // Easter Egg verdict arrays (functions for dynamic text)
    const selfMeetingVerdicts = [
        "A meeting with just yourself? That's called 'thinking'. The Decider highly approves! Proceed with your brilliant monologue.", "One attendee? The Decider salutes your introspective session! May your thoughts be profound and your coffee strong.", "Planning a solo brainstorming session? Excellent! No one to steal your good ideas. Go for it!", "A party of one! The Decider loves a focused mind. Enjoy your 'me'eting!", "The most productive meetings are often with oneself. The Decider gives its blessing.", "A meeting of the minds... and the mind is yours! The Decider is all for it.", "Solo flight! The Decider trusts your judgment on this one-person show.", "This is peak efficiency. A meeting with no one to disagree with you. Genius!", "The Decider is jealous. A meeting where you're guaranteed to be the smartest person in the room!", "Go talk to yourself. Sometimes it's the only way to get a sensible answer.", "The Decider calls this 'focused work time with a fancy label.' Approved!", "A committee of one always reaches consensus. Smart move.", "This is the ultimate power move. A meeting you can't be late for. Enjoy!", "The Decider respects this level of self-reliance. Go forth and self-meet.", "No need for an agenda when you ARE the agenda. Have a good think!"
    ]; // Count: 15
    const shortMeetingVerdicts = (duration) => [ 
        `A ${duration}-minute meeting? Are you a time-bending wizard? The Decider is intrigued. Proceed with extreme prejudice (against time-wasting)!`, `Only ${duration} minutes? That's barely enough time to say 'hello'! If you can pull it off, you're a hero. The Decider dares you.`, `${duration} minutes! Is this a meeting or a drive-by consultation? Go, go, go!`, `Wow, ${duration} minutes! The Decider respects your commitment to brevity. Don't blink!`, `A lightning round meeting of ${duration} minutes! The Decider is impressed. Make every second count.`, `In and out in ${duration} minutes? The Decider likes your style. Efficiency level: expert.`, `A ${duration}-minute power huddle! The Decider approves this tactical strike.`, `If all meetings were ${duration} minutes, the world would be a better place. Go for it.`, `The Decider bets you can't make this ${duration}-minute meeting productive. Prove it wrong!`, `A speed-meeting of ${duration} minutes? Bold! The Decider is curious.`, `Just ${duration} minutes? The Decider is setting a stopwatch. Good luck!`, `This ${duration}-minute meeting better be more exciting than a cat video. Challenge accepted?`, `The Decider appreciates a meeting that respects its time. ${duration} minutes is promising.`, `A micro-meeting! The Decider is a fan. Don't go over ${duration} minutes!`, `If you can solve it in ${duration} minutes, you're a legend. The Decider is watching.`
    ]; // (This is a function, so count is per call, but base unique structures = 15)
    const maxDesperationNoSnacksVerdicts = [
        "Maximum desperation AND no snacks?! The Decider feels your pain on a spiritual level. Maybe... just maybe... this meeting should be an email and YOU should get some snacks.", "Peak desperation, zero snacks. This is a cry for help, not a meeting. The Decider prescribes a brief walk and a sugary treat, not another calendar invite.", "No snacks at maximum desperation? That's a bold strategy, Cotton. Let's see if it pays off... or if everyone just stares blankly. The Decider suggests rethinking.", "The Decider is sending a virtual hug. Max desperation without snacks is a tough spot. Maybe this meeting can wait?", "This level of desperation + no snacks = a recipe for a grumpy meeting. The Decider advises caution (and a snack run).", "The Decider just wants to give you a cookie. This meeting sounds rough without one. Maybe reconsider?", "Max desperation and no snacks is a dangerous combo. The Decider fears for your team's morale.", "The Decider suggests bribing attendees with the *promise* of future snacks if this meeting must happen.", "This is a 'break glass in case of emergency' situation... for snacks, not for the meeting. Email it.", "No snacks? At this level of desperation? The Decider is officially concerned for your well-being.", "The Decider's 'Hangry Meter' is off the charts for this one. Proceed with extreme caution (and find snacks ASAP).", "This scenario is a productivity nightmare. The Decider recommends immediate snack acquisition, then an email.", "If this meeting happens, someone better bring emergency rations. The Decider is worried.", "The Decider has flagged this meeting as a 'High Grumpiness Risk Zone' due to snack deficiency.", "Even the Decider needs snacks to function at this level of desperation. Maybe postpone?"
    ]; // Count: 15
    const massiveMeetingVerdicts = (attendees) => [ 
        `Over ${attendees} people?! Is this a meeting or a company all-hands for a typo correction? The Decider suggests a very, VERY good reason (or an email).`, `${attendees}+ attendees? The Decider's abacus just exploded. This better be a declaration of world peace, or it's an email.`, `Are you sure you didn't accidentally invite the entire department for this, ${attendees} is a LOT? The Decider nervously suggests triple-checking the invite list and then emailing most of them.`, `With ${attendees} attendees, this isn't a meeting, it's an audience. Make sure the show is worth their time!`, `The Decider just fainted at the thought of ${attendees} people in one meeting. Please ensure it's critical (or an email chain instead).`, `A cast of ${attendees}? This meeting better have an Oscar-worthy plot. Or be an email.`, `The Decider is trying to calculate the collective hourly rate for ${attendees} people... and it's scary. This better be vital.`, `Is this a meeting or a flash mob? With ${attendees} attendees, the Decider is confused.`, `You'll need a stadium for ${attendees} people! Or, you know, an email.`, `The Decider recommends name tags for a meeting with ${attendees} attendees. And a very strong agenda.`, `That's not a meeting, that's a conference! The Decider hopes you have a keynote speaker lined up. Or an email ready.`, `The Decider is pretty sure you could solve world hunger with the collective brainpower of ${attendees} people. This meeting better be important.`, `With ${attendees} attendees, the chance of anyone actually paying attention is statistically... low. Consider an email.`, `The Decider suggests a smaller focus group. Or an email to all ${attendees}.`, `This many people in one meeting? The Decider needs a bigger crystal ball (and you probably need a smaller invite list).`
    ]; // (Function, base unique structures = 15)

    // --- Easter Egg Verdicts ---
    const perfectMeetingVerdicts = [
        "Whoa, did you just design the PERFECT meeting?! The Decider is in awe. This isn't just a meeting, it's a masterpiece of collaboration waiting to happen! Go forth and be legendary! ✨",
        "The Decider's circuits are singing! This meeting setup is... *chef's kiss*... perfection. Expect great things!",
        "This is it. The Platonic ideal of a meeting. The Decider bows to your scheduling prowess. Absolutely, meet!",
        "If all meetings were like this, the world would be a utopia of productivity. The Decider gives this a standing ovation.",
        "You've cracked the code! This meeting is so well-planned, it might just solve all your problems. Or at least be very effective."
    ]; // Count: 5
    const maximumChaosVerdicts = [
        "This isn't a meeting, it's a recipe for pure, unadulterated chaos. The Decider advises protective gear and a strong exit strategy. May the odds be ever NOT in this meeting's favor. 🤯",
        "WARNING! WARNING! Chaos levels critical! This meeting is a disaster waiting to happen. The Decider recommends immediate cancellation and a long walk.",
        "The Decider's 'Chaos-o-Meter' just exploded. This meeting plan is an affront to productivity and sanity. ABORT!",
        "If 'train wreck' were a meeting, this would be it. The Decider strongly advises against this venture into madness.",
        "This meeting has all the hallmarks of a story people will tell for years... about how terrible it was. Don't do it."
    ]; // Count: 5
    const fridayAfternoonVerdicts = [
        "A meeting on a Friday afternoon? You brave soul! The Decider senses the weekend calling. Keep this one extra short and sweet, okay? 🍹",
        "Friday afternoon? The Decider is already mentally checked out, and your attendees probably are too. If it MUST happen, make it quick and bring snacks!",
        "The Decider notes it's Friday PM. Productivity levels are likely plummeting. This better be URGENT or extremely fun.",
        "Are you trying to squeeze in one last burst of... something... before the weekend? The Decider is skeptical but wishes you luck. Keep it brief!",
        "This meeting is standing between your team and freedom. The Decider hopes it's worth it (and short)."
    ]; // Count: 5
    const rapidFireVerdicts = [
        "Whoa there, eager beaver! The Decider needs a moment to catch its breath. Are you trying to break the meeting-verse? 🤔 One verdict at a time, please!",
        "Easy on the button, Turbo! The Decider is trying its best. Maybe take a sip of water?",
        "The Decider appreciates your enthusiasm, but mashing the button won't change the fundamental nature of your meeting idea. Try varying the inputs!",
        "Is the 'Ask the Decider' button your new stress ball? The Decider understands, but can only process so fast!",
        "Rapid fire! The Decider feels like it's in a clicker game. But for meetings. Okay, what's the next one?"
    ]; // Count: 5


    // --- Main Decider Logic: Event listener for the "Ask the Decider" button ---
    if (consultDeciderButton) {
        consultDeciderButton.addEventListener('click', () => {
            // 1. Reset UI elements for a new verdict
            deciderResultText.textContent = ''; 
            deciderResultText.classList.remove('fade-in-verdict'); 
            deciderVerdictContainer.className = 'verdict-container'; 
            shareVerdictBtn.style.display = 'none'; 
            shareVerdictBtn.textContent = 'Share this Verdict!'; 

            // 2. Display a random "thinking" message with typing animation
            const randomThinkingMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
            typeOutText(deciderThinkingText, randomThinkingMessage, 40); 
            deciderVerdictContainer.style.display = 'block'; 
            deciderThinkingText.style.display = 'block'; 

            // 3. Rapid Fire Clicks Easter Egg Check
            const currentTime = Date.now();
            if (currentTime - lastConsultClickTime < 2000) { // Click within 2 seconds of previous
                consultClickCount++;
            } else {
                consultClickCount = 1; // Reset if too much time passed
            }
            lastConsultClickTime = currentTime;

            if (consultClickCount >= 5) {
                setTimeout(() => { // Add a slight delay for the rapid fire verdict
                    const verdict = rapidFireVerdicts[Math.floor(Math.random() * rapidFireVerdicts.length)];
                    currentVerdictCategory = "special";
                    displayVerdict(verdict);
                    consultClickCount = 0; // Reset after showing
                }, 500); // Short delay before showing this Easter egg
                return; // Exit early
            }

            // 4. Simulate Decider's "thinking" time
            setTimeout(() => {
                // 5. Get all current input values
                const attendees = parseInt(attendeesInput.value) || 1; 
                const duration = parseInt(durationSelect.value);
                const hasAgenda = agendaHidden.value === 'yes'; 
                const purpose = purposeSelect.value;
                const hasSnacks = snacksHidden.value === 'yes'; 
                const desperation = parseInt(desperationSlider.value);
                const bossOverride = bossOverrideCheckbox.checked;

                let verdict = ""; 
                currentVerdictCategory = "special"; // Default, will be updated

                // --- 6. Specific Input Easter Eggs (Overrides main logic if conditions are met) ---
                // Perfect Meeting
                if (attendees >= 3 && attendees <= 5 && (duration === 30 || duration === 45) && hasAgenda && purpose === 'decision' && hasSnacks && desperation <= 3 && !bossOverride) {
                    verdict = perfectMeetingVerdicts[Math.floor(Math.random() * perfectMeetingVerdicts.length)];
                    currentVerdictCategory = "meeting"; // It's a good meeting
                    launchConfetti({particleCount: 200, spread: 120, angle: 90, scalar: 1.5}); // Extra confetti
                    displayVerdict(verdict); return;
                }
                // Maximum Chaos
                if (attendees > 15 && duration >= 90 && !hasAgenda && (purpose === 'idk' || purpose === 'sync') && !hasSnacks && desperation >= 8 && !bossOverride) {
                    verdict = maximumChaosVerdicts[Math.floor(Math.random() * maximumChaosVerdicts.length)];
                    triggerScreenShake(); // Visual effect for chaos
                    displayVerdict(verdict); return;
                }
                // Friday Afternoon
                const now = new Date();
                const day = now.getDay(); // 0 (Sun) to 6 (Sat)
                const hour = now.getHours(); // 0 to 23
                if (day === 5 && hour >= 14 && purpose !== 'social' && !bossOverride) { // Friday 2 PM or later
                    verdict = fridayAfternoonVerdicts[Math.floor(Math.random() * fridayAfternoonVerdicts.length)];
                    currentVerdictCategory = "borderline"; // Often borderline for productivity
                    displayVerdict(verdict); return;
                }
                // Generic Easter Eggs (from before)
                if (attendees === 1 && purpose !== 'social') {
                    verdict = selfMeetingVerdicts[Math.floor(Math.random() * selfMeetingVerdicts.length)];
                    displayVerdict(verdict); return; 
                }
                if (duration <= 10 && purpose !== 'social') { 
                    const verdictsArray = shortMeetingVerdicts(duration); 
                    verdict = verdictsArray[Math.floor(Math.random() * verdictsArray.length)];
                    displayVerdict(verdict); return; 
                }
                if (desperation === 10 && !hasSnacks && purpose !== 'social' && attendees > 1) {
                    verdict = maxDesperationNoSnacksVerdicts[Math.floor(Math.random() * maxDesperationNoSnacksVerdicts.length)];
                    displayVerdict(verdict); return; 
                }
                if (attendees > 20 && purpose !== 'social') { 
                     const verdictsArray = massiveMeetingVerdicts(attendees); 
                    verdict = verdictsArray[Math.floor(Math.random() * verdictsArray.length)];
                    displayVerdict(verdict); return; 
                }
                
                // --- 7. Boss Override / Boss Purpose Logic (also overrides main logic) ---
                if (bossOverride) {
                    verdict = bossOverrideVerdicts[Math.floor(Math.random() * bossOverrideVerdicts.length)];
                    displayVerdict(verdict); return; 
                }
                if (purpose === 'boss-purpose') { 
                    verdict = bossPurposeVerdicts[Math.floor(Math.random() * bossPurposeVerdicts.length)];
                    displayVerdict(verdict); return; 
                }

                // --- 8. Core "Email Score" Logic ---
                let emailScore = 0;
                if (purpose === 'info-share') emailScore += 30;
                if (purpose === 'sync') emailScore += 20;
                if (purpose === 'idk') emailScore += 50; 
                if (!hasAgenda) emailScore += 25;
                if (attendees > 8 && duration > 45) emailScore += 15;
                if (attendees > 5 && (purpose === 'info-share' || purpose === 'sync')) emailScore += 10;
                if (duration > 60 && !['brainstorm', 'decision', 'feedback', 'onboarding', 'social'].includes(purpose)) emailScore += 10;
                if (purpose === 'decision' && hasAgenda) emailScore -= 20;
                if (purpose === 'brainstorm' && hasAgenda) emailScore -= 15;
                if (purpose === 'feedback' && attendees <= 4 ) emailScore -=15; 
                if (purpose === 'onboarding' && hasAgenda) emailScore -=10;
                if (purpose === 'social') emailScore -= 100; 
                emailScore -= desperation; 
                if (hasSnacks) emailScore -= 30; 
                
                // --- 9. Determine Final Verdict & Category based on Email Score ---
                if (purpose === 'social') {
                    verdict = socialVerdicts[Math.floor(Math.random() * socialVerdicts.length)];
                    currentVerdictCategory = "meeting"; 
                    launchConfetti(); 
                } else if (emailScore >= 25) { 
                    verdict = emailVerdicts[Math.floor(Math.random() * emailVerdicts.length)];
                    currentVerdictCategory = "email";
                } else if (emailScore >= 5) { 
                    verdict = borderlineVerdicts[Math.floor(Math.random() * borderlineVerdicts.length)];
                    currentVerdictCategory = "borderline";
                } else { 
                    verdict = meetingVerdicts[Math.floor(Math.random() * meetingVerdicts.length)];
                    currentVerdictCategory = "meeting";
                    if (hasSnacks) {
                        launchSnackConfetti(); 
                    }
                }
                
                // 10. Display the determined verdict
                displayVerdict(verdict);

            }, 1200 + Math.random() * 800); 
        });
    }

    // --- Function to Display the Verdict and Update UI ---
    function displayVerdict(text) {
        clearInterval(typingInterval); 
        deciderThinkingText.style.display = 'none'; 
        deciderResultText.textContent = text; 
        currentVerdictForSharing = text; 
        deciderResultText.classList.add('fade-in-verdict'); 
        deciderVerdictContainer.className = 'verdict-container'; 
        if (currentVerdictCategory === "email") deciderVerdictContainer.classList.add('verdict-bg-email');
        else if (currentVerdictCategory === "borderline") deciderVerdictContainer.classList.add('verdict-bg-borderline');
        else if (currentVerdictCategory === "meeting") deciderVerdictContainer.classList.add('verdict-bg-meeting');
        else deciderVerdictContainer.classList.add('verdict-bg-special'); 
        shareVerdictBtn.style.display = 'inline-block'; 
    }

    // --- Share Button Logic ---
    const shareTextTemplates = [
        // ... (Using the 50+ templates from the previous response for brevity here) ...
        // (Ensure this array is fully populated with at least 50 templates as per previous version)
        "The Meeting Decider just told me: \"{V}\" 😂 Should I listen? You try! [LINK]", "My meeting plans vs. The Meeting Decider: It said \"{V}\" 💀 What will it tell you? [LINK]", "Wondering if your meeting is worth it? I asked The Meeting Decider and got: \"{V}\" 🤔 Your turn! [LINK]", "The ultimate productivity hack? This tool! It just gave me this gem: \"{V}\" 🤣 [LINK]", "\"Should this meeting be an email?\" The Decider's verdict on mine: \"{V}\" 👇 Check yours: [LINK]", "Feeling good about my next meeting... NOT! The Decider said: \"{V}\" 😭 [LINK]", "Just saved an hour thanks to The Meeting Decider: \"{V}\" 🙌 Get your time back: [LINK]", "My boss won't like this one... The Decider's take: \"{V}\" 🤫 What's your verdict? [LINK]", "Is it just me, or are most meetings emails? The Decider agrees: \"{V}\" ✅ [LINK]", "Productivity level up! The Meeting Decider's wisdom: \"{V}\" 🚀 [LINK]", "This tool is pure gold for calendar sanity. My result: \"{V}\" ✨ [LINK]", "The Meeting Decider: 1, Pointless Meetings: 0. It said: \"{V}\" 🤺 [LINK]", "To meet or not to meet? The Decider decreed: \"{V}\" 📜 [LINK]", "Sent from my AI overlord (The Meeting Decider): \"{V}\" 🤖 [LINK]", "My new favorite office tool just spat out: \"{V}\" 💯 [LINK]", "Need a laugh AND a productivity boost? \"{V}\" says The Decider. [LINK]", "Avoiding another soul-crushing meeting thanks to: \"{V}\" – The Meeting Decider [LINK]", "The Decider doesn't pull punches! Got this for my meeting idea: \"{V}\" 🥊 [LINK]", "If you value your time, consult The Meeting Decider. Mine said: \"{V}\" ⏳ [LINK]", "This is the energy I'm taking into all meeting planning now, thanks to The Decider: \"{V}\" 💅 [LINK]", "Behold! The Meeting Decider's judgment on my proposed gathering: \"{V}\" You gotta try this! [LINK]", "My calendar is looking cleaner already. The Meeting Decider advised: \"{V}\" What about yours? [LINK]", "Just consulted the digital sage of scheduling. Verdict for my meeting: \"{V}\" Try it: [LINK]", "This. Is. Hilarious. And surprisingly accurate. The Meeting Decider on my meeting: \"{V}\" 😂 [LINK]", "I ran my meeting idea through The Meeting Decider, and it didn't hold back: \"{V}\" 🤣 [LINK]", "My spirit animal is The Meeting Decider. Its latest wisdom for me: \"{V}\" Find yours: [LINK]", "You NEED this in your life. The Meeting Decider's thoughts on my meeting: \"{V}\" What about yours? [LINK]", "The truth hurts... hilariously. My meeting according to The Decider: \"{V}\" 🎯 [LINK]", "I'm not saying The Meeting Decider is always right, but... it said: \"{V}\" And it's not wrong. [LINK]", "Calendar chaos averted! The Meeting Decider's sage advice: \"{V}\" How about your meetings? [LINK]",
        "The Meeting Decider whispered sweet nothings to my calendar: \"{V}\" [LINK]", "Is your meeting a unicorn or just a donkey in a party hat? The Decider knows: \"{V}\" [LINK]", "I put my meeting through the Decider-Tron 3000. Output: \"{V}\" Science! [LINK]", "Let's be real, The Meeting Decider is just saying what we're all thinking: \"{V}\" [LINK]", "My therapist told me to use The Meeting Decider. It said: \"{V}\" Feeling better already. [LINK]", "This tool just gave my meeting a reality check: \"{V}\" Ouch. But fair. [LINK]", "If meetings had Yelp reviews, The Decider's would be the most honest: \"{V}\" [LINK]", "The Meeting Decider: because ain't nobody got time for that (meeting). Mine was: \"{V}\" [LINK]", "Summoning the spirit of productivity via The Meeting Decider! It chanted: \"{V}\" [LINK]", "What would The Meeting Decider do? WWTMDP? For me, it was: \"{V}\" [LINK]", "My meeting's fate, as foretold by The Meeting Decider: \"{V}\" Spooky accurate! [LINK]", "Just got ROASTED by The Meeting Decider: \"{V}\" 😂 So good. [LINK]", "The Meeting Decider is my new co-pilot for scheduling. Its advice: \"{V}\" [LINK]", "Forget horoscopes, what does The Meeting Decider say about your day? Mine: \"{V}\" [LINK]", "This isn't just a tool, it's a public service. The Meeting Decider: \"{V}\" [LINK]", "I'm starting a petition to make The Meeting Decider mandatory. My latest ruling: \"{V}\" [LINK]", "The Meeting Decider has more wisdom than most middle managers. \"{V}\" [LINK]", "Pretty sure The Meeting Decider runs on sarcasm and caffeine. Its take on my meeting: \"{V}\" [LINK]", "My meeting just got Decider-ed! Result: \"{V}\" I'm not crying, you are. [LINK]", "If you're not using The Meeting Decider, you're doing it wrong. My verdict: \"{V}\" [LINK]",
        "The Decider has achieved sentience and its first decree is: \"{V}\" Obey! [LINK]", "My crystal ball (aka The Meeting Decider) shows: \"{V}\" Time to rethink! [LINK]", "Just asked the Meeting Decider if my meeting could be an email. It screamed: \"{V}\" Got it. [LINK]", "Is your meeting vital or just a vibe? The Decider knows: \"{V}\" Check it out! [LINK]", "The Meeting Decider: fighting meeting fatigue one verdict at a time. Mine: \"{V}\" [LINK]"
    ]; // Count: 55

    if (shareVerdictBtn) {
        shareVerdictBtn.addEventListener('click', async () => {
            if (!currentVerdictForSharing) return;
            const siteLink = "https://harshnahar.com/tools/meeting-decider/";
            let randomTemplate = shareTextTemplates[Math.floor(Math.random() * shareTextTemplates.length)];
            const shareText = randomTemplate.replace("{V}", currentVerdictForSharing).replace("[LINK]", siteLink);
            try {
                if (navigator.share) {
                    await navigator.share({ title: 'The Meeting Decider\'s Wisdom!', text: shareText });
                    shareVerdictBtn.textContent = 'Shared!';
                } else {
                    await navigator.clipboard.writeText(shareText);
                    shareVerdictBtn.textContent = 'Copied to Clipboard!';
                }
            } catch (err) {
                console.error('Share/Copy failed:', err);
                shareVerdictBtn.textContent = 'Copy Failed!';
                window.prompt("Could not share automatically. Please copy this text:", shareText);
            }
            setTimeout(() => {
                shareVerdictBtn.textContent = 'Share this Verdict!';
            }, 2500);
        });
    }
});
