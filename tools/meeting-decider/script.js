document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    // Input fields
    const attendeesInput = document.getElementById('attendees');
    const durationSelect = document.getElementById('duration');
    const agendaHidden = document.getElementById('agenda'); // Hidden input for agenda toggle
    const purposeSelect = document.getElementById('purpose');
    const snacksHidden = document.getElementById('snacks'); // Hidden input for snacks toggle
    const desperationSlider = document.getElementById('desperation');
    const bossOverrideCheckbox = document.getElementById('bossOverride');

    // Buttons and interactive elements
    const stepperMinus = document.querySelector('.stepper-btn.minus');
    const stepperPlus = document.querySelector('.stepper-btn.plus');
    const agendaToggleContainer = document.getElementById('agendaToggle');
    const snacksToggleContainer = document.getElementById('snacksToggle');
    const consultDeciderButton = document.getElementById('consultDecider');
    
    // Verdict display elements
    const deciderVerdictContainer = document.getElementById('deciderVerdict');
    const deciderThinkingText = deciderVerdictContainer.querySelector('.verdict-thinking');
    const deciderResultText = deciderVerdictContainer.querySelector('.verdict-result');
    const shareVerdictBtn = document.getElementById('shareVerdictBtn');

    // State variables
    let currentVerdictForSharing = ""; // Stores the current verdict text for sharing
    let currentVerdictCategory = ""; // Stores verdict category for BG color and confetti
    let typingInterval; // For the "thinking" text animation

    // --- Helper for Stepper Buttons (Attendees) ---
    if (attendeesInput && stepperMinus && stepperPlus) {
        stepperMinus.addEventListener('click', () => {
            let currentValue = parseInt(attendeesInput.value) || 1; // Default to 1 if parse fails
            if (currentValue > parseInt(attendeesInput.min)) {
                attendeesInput.value = currentValue - 1;
            }
        });
        stepperPlus.addEventListener('click', () => {
            let currentValue = parseInt(attendeesInput.value) || 0; // Default to 0 if parse fails
            attendeesInput.value = currentValue + 1;
        });
    }

    // --- Helper for Toggle Buttons (Agenda, Snacks) ---
    function setupToggle(container, hiddenInput) {
        if (!container || !hiddenInput) return; // Guard against null elements
        const buttons = container.querySelectorAll('.toggle-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active')); // Deactivate all
                button.classList.add('active'); // Activate clicked one
                hiddenInput.value = button.dataset.value; // Update hidden input value
            });
        });
    }
    setupToggle(agendaToggleContainer, agendaHidden);
    setupToggle(snacksToggleContainer, snacksHidden);

    // --- Typing Animation for "Thinking" Text ---
    function typeOutText(element, text, speed = 40) {
        clearInterval(typingInterval); // Clear any existing typing animation
        element.textContent = ''; // Clear previous text
        let i = 0;
        element.style.display = 'block'; // Make sure it's visible

        typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval); // Stop when text is fully typed
            }
        }, speed);
    }

    // --- Confetti Functions ---
    function launchConfetti() {
        // Standard confetti for general positive outcomes (e.g., social meetings)
        if (typeof confetti === 'function') { // Check if confetti library is loaded
            confetti({
                particleCount: 120, // More particles for a good celebration
                spread: 90,         // Wider spread
                origin: { y: 0.6 }  // Launch from slightly above center
            });
        }
    }
    function launchSnackConfetti() {
        // Special confetti with "food" shapes for snack-related celebrations
        if (typeof confetti === 'function') {
            const scalar = 2.5; // Increase size/count of snack confetti
            // Define simple SVG paths for food/drink shapes
            const cookieShape = confetti.shapeFromPath({ path: 'M10 1C5.03 1 1 5.03 1 10C1 14.97 5.03 19 10 19C14.97 19 19 14.97 19 10C19 5.03 14.97 1 10 1ZM10 16.5C6.41 16.5 3.5 13.59 3.5 10C3.5 6.41 6.41 3.5 10 3.5C13.59 3.5 16.5 6.41 16.5 10C16.5 13.59 13.59 16.5 10 16.5ZM10 5C9.17 5 8.5 5.67 8.5 6.5C8.5 7.33 9.17 8 10 8C10.83 8 11.5 7.33 11.5 6.5C11.5 5.67 10.83 5 10 5ZM10 12C9.17 12 8.5 12.67 8.5 13.5C8.5 14.33 9.17 15 10 15C10.83 15 11.5 14.33 11.5 13.5C11.5 12.67 10.83 12 10 12Z' });
            const drinkShape = confetti.shapeFromPath({ path: 'M15 2H9C8.45 2 8 2.45 8 3V5.81C7.4 5.4 6.74 5.11 6 5.04V3C6 2.45 5.55 2 5 2H3C2.45 2 2 2.45 2 3V17C2 17.55 2.45 18 3 18H5C5.55 18 6 17.55 6 17V15C6.58 15.01 7.13 14.91 7.65 14.71L9.58 19.13C9.78 19.63 10.31 19.88 10.81 19.68C11.31 19.48 11.56 18.95 11.36 18.45L9.43 14H15C15.55 14 16 13.55 16 13V3C16 2.45 15.55 2 15 2ZM4 16H3V4H4V16ZM14 12H9V4H14V12Z' });

            confetti({
                shapes: [cookieShape, drinkShape],
                angle: 90,
                spread: 120, // Wider spread for food!
                particleCount: Math.floor(30 * scalar), // More particles
                origin: { y: 0.6 },
                colors: ['#FFC107', '#FF9800', '#8BC34A', '#4CAF50', '#F44336', '#E91E63'] // Foodie colors
            });
        }
    }

    // --- Verdict Text Arrays (Expanded) ---
    const thinkingMessages = [
        "The Decider is consulting the ancient algorithms of productivity...", "Recalibrating the Worthiness Matrix...", "Gazing into the Crystal Ball of Calendar Management...", "The Decider is pondering your query with intense focus...", "Analyzing attendee patience levels (they're surprisingly low)...", "Checking the alignment of productive planets...", "Shuffling the tarot cards of task delegation...", "Calculating the exact cost of this potential time vortex...", "The Decider is brewing a fresh pot of 'Is-This-Necessary?' tea...", "Cross-referencing with the Grand Tome of Terrible Meetings...", "Dusting off the Scepter of Sensible Scheduling...", "The gears of judgment are turning... slowly, but surely.", "Contemplating the opportunity cost of another meeting...", "Accessing the archives of 'Meetings That Should Have Been Emails'...", "The Decider is currently experiencing heavy cognitive load. Please wait.", "Filtering out the 'just because' requests...", "Performing a sanity check on your meeting parameters...", "Is this meeting essential, or just a habit? The Decider wonders.", "The Decider is taking a deep breath before rendering judgment.", "One moment, running diagnostics on the 'Pointless Meeting Detector'...", "Let's see... does this spark joy, or just fill a calendar slot?", "The Decider is in its zen garden, seeking clarity for your query.", "Reticulating splines... of productivity!", "Just feeding your request to the hamsters that power this thing.", "The Decider is currently consulting its rubber duck for advice."
    ];
    const emailVerdicts = [
        "This has 'EMAIL' written all over it. Save humanity some time. Your inbox awaits.", "Verdict: Certified Email Material. Your colleagues' calendars (and future you) will thank you.", "The Decider has spoken: Type it out. Spare the meeting. Let the keystrokes flow.", "Is this meeting a trap? It looks like an email in disguise. Abort! Abort!", "The Decider foresees a future where this meeting was an email. Make it so.", "Launching a full meeting for this? That's like using a cannon to swat a fly. Email it.", "Put down the calendar invite and pick up your keyboard. This is email territory.", "The ancient scrolls of productivity clearly state: 'When in doubt, email it out.' This is one of those times.", "Your team's collective groan was just heard by the Decider. Make it an email.", "This query screams for asynchronous communication. Translation: EMAIL.", "Just send the darn email. Seriously.", "This could've been a Slack message, but an email will do too.", "Nope. Not a meeting. Try again (with an email draft).", "The Decider says: 'Email. Next case!'", "Is your keyboard broken? If not, this is an email.", "The Decider just saved you [duration] minutes. You're welcome. (It's an email).", "Consider this a divine intervention. Send an email instead.", "If you make this a meeting, the Decider will personally haunt your calendar.", "This is so clearly an email, the Decider almost didn't need to think.", "Warning: Scheduling this meeting may cause spontaneous naps among attendees. Email it.", "The 'Reply All' button is your friend here. Not the 'New Meeting' button.", "One word: E. M. A. I. L.", "The Decider's verdict is in, and it's spelled E-M-A-I-L.", "Unless this meeting involves a winning lottery ticket, it's an email.", "Let's be honest, you knew this was an email before you even asked."
    ];
    const borderlineVerdicts = [
        "Hmm, this one's teetering on the edge. A killer agenda or exceptional snacks could tip the scales. Otherwise... email?", "Could go either way. Flip a coin, or better yet, reduce attendees and sharpen the focus. Then maybe.", "This meeting is on thin ice. Proceed ONLY if brevity is your co-pilot and purpose your North Star.", "The Decider squints. It *could* be a meeting... if you promise it's not just because you dislike typing.", "A well-written email could slay this meeting dragon. But if you must, make it legendary (and short).", "The Decider is feeling ambivalent. Perhaps a quick chat with ONE key person first?", "This is a 'maybe meeting.' If you can't articulate its value in one sentence, default to email.", "Tread carefully. This path could lead to a productive meeting or a pit of despair. Choose wisely (or email).", "If this meeting were a traffic light, it'd be blinking yellow. Proceed with caution and a very clear map.", "The Decider suggests a trial by fire: can you explain the NEED for this meeting in under 30 seconds? If not, email.", "If it's SUPER short and has donuts, maybe. Otherwise, email.", "This is 50/50. Make the agenda amazing or just email it.", "The Decider is napping on this one. Try making it an email first?", "One more pointless meeting and the Decider quits. Email it (or make this one count!).", "Could be a quick huddle. Or an even quicker email. Your call, brave soul.", "The Decider is shrugging. If you absolutely MUST, keep it under 15 minutes.", "This meeting has 'potential for disaster' written on it. Or 'potential for genius.' Good luck.", "If you can guarantee no one will secretly browse social media, then *maybe* it's a meeting.", "The Decider is giving you the side-eye. Are you *sure* about this one?", "This one requires a leap of faith. Or just a really good facilitator.", "It's not a 'no,' but it's not a 'heck yes' either. Proceed with caution.", "The Decider needs more coffee to make a call on this. Try again later (or just email).", "If this meeting has a theme song, okay. Otherwise, consider the email option.", "This is the Schrödinger's Cat of meetings. It's both an email and a meeting until you schedule it.", "The Decider feels this could be an email, but is willing to be proven wrong... this time."
    ];
    const meetingVerdicts = [
        "Alright, alright. This one *might* actually need faces in a room (or pixels on a screen). Keep it snappy!", "The stars align! A rare meeting that seems... justified? Don't squander this sacred moment.", "Proceed with the meeting! (Especially if those snacks are real. The Decider has standards.)", "Okay, this sounds important enough to collectively pause other work. Make it count!", "The Decider grants permission. This meeting has potential. Unleash its power (responsibly).", "Yes! This has the hallmarks of a conversation worth having synchronously. Go forth and collaborate!", "A meeting, you say? For this? The Decider nods approvingly. Sometimes, you just gotta talk it out.", "This one passes the vibe check. Schedule it, but don't forget the action items!", "The Decider senses a genuine need for interactive discussion. Engage!", "Permission to meet: GRANTED. May your discussions be fruitful and your time well spent.", "Yeah, okay, this one's a meeting. Don't make the Decider regret this.", "Fine, have your meeting. But it better be good.", "The Decider approves this meeting. Barely. Make it count.", "This sounds like actual collaboration. Go for it.", "A meeting? For this? Surprisingly, yes. Proceed.", "This is it! A bona fide, actual, real-life (or virtual) reason to gather. Hallelujah!", "The Decider gives this meeting two thumbs up. Make some magic happen!", "Unleash the collaboration kraken! This meeting is a GO.", "Sometimes, an email just won't cut it. This is one of those times. Meet on!", "Yes, a meeting is warranted. The Decider expects great things.", "The energy is right for this. Schedule that meeting and make it productive!", "Clear your schedules, folks. This one's actually worth it!", "The Decider has peered into the future, and this meeting looks promising. (No pressure).", "This isn't just a meeting; it's an OPPORTUNITY. Seize it!", "Go ahead, book the room (or the Zoom). This one gets the green light."
    ];
    const socialVerdicts = [
        "Gather, humans! For team bonding and shared laughter are the elixirs of a happy workplace. Enjoy!", "Yes! A social gathering is a sacred ritual. May your conversations be merry and your connections strong.", "The Decider wholeheartedly endorses fun. Go socialize, you magnificent creatures!", "Team bonding time? Excellent! No agenda needed, just good vibes.", "Absolutely. Schedule that social. The Decider might even crash it (if there are snacks).", "Let the good times roll! Socializing is officially Decider-approved.", "Water cooler chat on steroids? Yes, please! Have a great social gathering.", "The only agenda for this meeting should be 'have fun.' Go for it!", "Forget productivity for a bit. It's time to connect. Enjoy the social time!", "The Decider decrees: more laughter, less TPS reports! Enjoy your social event."
    ];
    const bossOverrideVerdicts = [ 
        "The Decider sighs. Your boss's will transcends all logic. May your coffee be strong and your patience endless. (P.S. Maybe suggest snacks?)", "Ah, the 'Boss Card' has been played. The Decider retreats to its mystical cloud. Good luck!", "When the boss calls, the Decider just pours another cup of tea. You're on your own, champ.", "The Decider's algorithms are no match for a determined manager. Godspeed.", "The boss wants it, the boss gets it. The Decider can only offer silent support.", "Well, if the boss insists... The Decider washes its hands of this. May the odds be ever in your favor.", "At this point, the Decider is just an observer. Try to make the best of it!", "The Decider's wisdom is overridden. It's okay, we all have bosses. *pats back*", "May your forced meeting be surprisingly productive. Or at least short.", "The Decider sends thoughts and prayers. And a reminder to mute your mic."
    ];
    const bossPurposeVerdicts = [ 
        "Ah, a directive from the powers that be! The Decider bows to the inevitable. Just ensure there's a clear objective... or at least good coffee.", "Serving the managerial agenda, are we? Very well. The Decider wishes you a productive (and hopefully brief) session.", "The 'chain of command' special. The Decider understands. Try to make it useful anyway!", "When 'because my boss said so' is the reason, the Decider can only offer moral support. And a suggestion for an end time.", "The boss's purpose is a mysterious thing. The Decider hopes it involves a clear outcome for you.", "Executing a boss-mandated meeting? The Decider hopes there's a hidden gem of productivity in there somewhere.", "If your boss needs this meeting, then it shall be. The Decider just hopes it's not a waste of *your* time.", "Navigating the corporate seas, one boss-requested meeting at a time. Good luck, sailor!", "The Decider acknowledges the supreme authority of 'The Boss Told Me To.' Make it snappy.", "This meeting's purpose is 'Boss Satisfaction.' Achieve it swiftly."
    ];
    // Easter Egg verdict arrays (functions for dynamic text)
    const selfMeetingVerdicts = [
        "A meeting with just yourself? That's called 'thinking'. The Decider highly approves! Proceed with your brilliant monologue.", "One attendee? The Decider salutes your introspective session! May your thoughts be profound and your coffee strong.", "Planning a solo brainstorming session? Excellent! No one to steal your good ideas. Go for it!"
    ];
    const shortMeetingVerdicts = (duration) => [
        `A ${duration}-minute meeting? Are you a time-bending wizard? The Decider is intrigued. Proceed with extreme prejudice (against time-wasting)!`, `Only ${duration} minutes? That's barely enough time to say 'hello'! If you can pull it off, you're a hero. The Decider dares you.`, `${duration} minutes! Is this a meeting or a drive-by consultation? Go, go, go!`
    ];
    const maxDesperationNoSnacksVerdicts = [
        "Maximum desperation AND no snacks?! The Decider feels your pain on a spiritual level. Maybe... just maybe... this meeting should be an email and YOU should get some snacks.", "Peak desperation, zero snacks. This is a cry for help, not a meeting. The Decider prescribes a brief walk and a sugary treat, not another calendar invite.", "No snacks at maximum desperation? That's a bold strategy, Cotton. Let's see if it pays off... or if everyone just stares blankly. The Decider suggests rethinking."
    ];
    const massiveMeetingVerdicts = (attendees) => [
        `Over ${attendees} people?! Is this a meeting or a company all-hands for a typo correction? The Decider suggests a very, VERY good reason (or an email).`, `${attendees}+ attendees? The Decider's abacus just exploded. This better be a declaration of world peace, or it's an email.`, `Are you sure you didn't accidentally invite the entire department for this, ${attendees} is a LOT? The Decider nervously suggests triple-checking the invite list and then emailing most of them.`
    ];

    // --- Main Decider Logic ---
    if (consultDeciderButton) {
        consultDeciderButton.addEventListener('click', () => {
            // Reset UI for new verdict
            deciderResultText.textContent = ''; 
            deciderResultText.classList.remove('fade-in-verdict');
            deciderVerdictContainer.className = 'verdict-container'; // Reset BG color class
            shareVerdictBtn.style.display = 'none'; // Hide share button initially
            shareVerdictBtn.textContent = 'Share this Verdict!'; // Reset share button text

            // Start "thinking" animation
            const randomThinkingMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
            typeOutText(deciderThinkingText, randomThinkingMessage, 40); // Speed: 40ms per char
            deciderVerdictContainer.style.display = 'block'; // Show verdict area
            deciderThinkingText.style.display = 'block'; // Show thinking text

            // Simulate Decider's thinking time
            setTimeout(() => {
                // Get all input values
                const attendees = parseInt(attendeesInput.value) || 1; // Default to 1 if NaN
                const duration = parseInt(durationSelect.value);
                const hasAgenda = agendaHidden.value === 'yes';
                const purpose = purposeSelect.value;
                const hasSnacks = snacksHidden.value === 'yes';
                const desperation = parseInt(desperationSlider.value);
                const bossOverride = bossOverrideCheckbox.checked;

                let verdict = "";
                currentVerdictCategory = "special"; // Default category for Easter eggs/boss

                // --- Easter Egg Logic (Overrides main logic if triggered) ---
                if (attendees === 1 && purpose !== 'social') {
                    verdict = selfMeetingVerdicts[Math.floor(Math.random() * selfMeetingVerdicts.length)];
                    displayVerdict(verdict); return; // Exit early
                }
                if (duration <= 10 && purpose !== 'social') { // Assuming 10 min or less is very short
                    const verdicts = shortMeetingVerdicts(duration);
                    verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
                    displayVerdict(verdict); return; // Exit early
                }
                if (desperation === 10 && !hasSnacks && purpose !== 'social' && attendees > 1) {
                    verdict = maxDesperationNoSnacksVerdicts[Math.floor(Math.random() * maxDesperationNoSnacksVerdicts.length)];
                    displayVerdict(verdict); return; // Exit early
                }
                if (attendees > 20 && purpose !== 'social') { // Assuming 20+ is a massive meeting
                     const verdicts = massiveMeetingVerdicts(attendees);
                    verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
                    displayVerdict(verdict); return; // Exit early
                }
                
                // --- Boss Override / Boss Purpose Logic (Overrides main logic) ---
                if (bossOverride) {
                    verdict = bossOverrideVerdicts[Math.floor(Math.random() * bossOverrideVerdicts.length)];
                    displayVerdict(verdict); return; // Exit early
                }
                if (purpose === 'boss-purpose') { 
                    verdict = bossPurposeVerdicts[Math.floor(Math.random() * bossPurposeVerdicts.length)];
                    displayVerdict(verdict); return; // Exit early
                }

                // --- Core "Email Score" Logic ---
                // Higher score means more likely it should be an email
                let emailScore = 0;

                // Penalties (increase score towards "email")
                if (purpose === 'info-share') emailScore += 30;
                if (purpose === 'sync') emailScore += 20;
                if (purpose === 'idk') emailScore += 50; 
                if (!hasAgenda) emailScore += 25;
                if (attendees > 8 && duration > 45) emailScore += 15;
                if (attendees > 5 && (purpose === 'info-share' || purpose === 'sync')) emailScore += 10;
                if (duration > 60 && !['brainstorm', 'decision', 'feedback', 'onboarding', 'social'].includes(purpose)) emailScore += 10;

                // Bonuses (decrease score towards "meeting")
                if (purpose === 'decision' && hasAgenda) emailScore -= 20;
                if (purpose === 'brainstorm' && hasAgenda) emailScore -= 15;
                if (purpose === 'feedback' && attendees <= 4 ) emailScore -=15; // Feedback best in small groups
                if (purpose === 'onboarding' && hasAgenda) emailScore -=10;
                if (purpose === 'social') emailScore -= 100; // Social events are almost always meetings
                
                emailScore -= desperation; // Higher desperation makes meeting more likely (lower score)
                if (hasSnacks) emailScore -= 30; // Snacks are a BIG bonus for meetings
                
                // --- Determine Final Verdict & Category based on Email Score ---
                if (purpose === 'social') {
                    verdict = socialVerdicts[Math.floor(Math.random() * socialVerdicts.length)];
                    currentVerdictCategory = "meeting"; // Social is a type of meeting
                    launchConfetti(); // General celebration for social
                } else if (emailScore >= 25) { 
                    verdict = emailVerdicts[Math.floor(Math.random() * emailVerdicts.length)];
                    currentVerdictCategory = "email";
                } else if (emailScore >= 5) { 
                    verdict = borderlineVerdicts[Math.floor(Math.random() * borderlineVerdicts.length)];
                    currentVerdictCategory = "borderline";
                } else { // Low score = good candidate for a meeting
                    verdict = meetingVerdicts[Math.floor(Math.random() * meetingVerdicts.length)];
                    currentVerdictCategory = "meeting";
                    if (hasSnacks) {
                        launchSnackConfetti(); // Special confetti if it's a meeting AND has snacks
                    }
                }
                
                displayVerdict(verdict);

            }, 1200 + Math.random() * 800); // Variable thinking time (1.2s to 2s)
        });
    }

    // --- Function to Display the Verdict and Update UI ---
    function displayVerdict(text) {
        clearInterval(typingInterval); // Stop "thinking" animation if still running
        deciderThinkingText.style.display = 'none'; // Hide thinking text
        
        deciderResultText.textContent = text; // Set the verdict text
        currentVerdictForSharing = text; // Store for the share button
        deciderResultText.classList.add('fade-in-verdict'); // Trigger fade-in animation
        
        // Apply background color to verdict box based on category
        deciderVerdictContainer.className = 'verdict-container'; // Reset classes first
        if (currentVerdictCategory === "email") deciderVerdictContainer.classList.add('verdict-bg-email');
        else if (currentVerdictCategory === "borderline") deciderVerdictContainer.classList.add('verdict-bg-borderline');
        else if (currentVerdictCategory === "meeting") deciderVerdictContainer.classList.add('verdict-bg-meeting');
        else deciderVerdictContainer.classList.add('verdict-bg-special'); // For boss, easter eggs

        shareVerdictBtn.style.display = 'inline-block'; // Show the share button
    }

    // --- Share Button Logic ---
    const shareTextTemplates = [
        // Ensure you have AT LEAST 20-50 varied templates here
        "The Meeting Decider just told me: \"{V}\" 😂 Should I listen? You try! [LINK]",
        "My meeting plans vs. The Meeting Decider: It said \"{V}\" 빵! What will it tell you? [LINK]",
        "Wondering if your meeting is worth it? I asked The Meeting Decider and got: \"{V}\" 🤔 Your turn! [LINK]",
        "The ultimate productivity hack? This tool! It just gave me this gem: \"{V}\" 🤣 [LINK]",
        "\"Should this meeting be an email?\" The Decider's verdict on mine: \"{V}\" 💀 Check yours: [LINK]",
        "Feeling good about my next meeting... NOT! The Decider said: \"{V}\" 😭 [LINK]",
        "Just saved an hour thanks to The Meeting Decider: \"{V}\" 🙌 Get your time back: [LINK]",
        "My boss won't like this one... The Decider's take: \"{V}\" 🤫 What's your verdict? [LINK]",
        "Is it just me, or are most meetings emails? The Decider agrees: \"{V}\" ✅ [LINK]",
        "Productivity level up! The Meeting Decider's wisdom: \"{V}\" 🚀 [LINK]",
        "This tool is pure gold for calendar sanity. My result: \"{V}\" ✨ [LINK]",
        "The Meeting Decider: 1, Pointless Meetings: 0. It said: \"{V}\" 🤺 [LINK]",
        "To meet or not to meet? The Decider decreed: \"{V}\" 📜 [LINK]",
        "Sent from my AI overlord (The Meeting Decider): \"{V}\" 🤖 [LINK]",
        "My new favorite office tool just spat out: \"{V}\" 💯 [LINK]",
        "Need a laugh AND a productivity boost? \"{V}\" says The Decider. [LINK]",
        "Avoiding another soul-crushing meeting thanks to: \"{V}\" – The Meeting Decider [LINK]",
        "The Decider doesn't pull punches! Got this for my meeting idea: \"{V}\" 🥊 [LINK]",
        "If you value your time, consult The Meeting Decider. Mine said: \"{V}\" ⏳ [LINK]",
        "This is the energy I'm taking into all meeting planning now, thanks to The Decider: \"{V}\" 💅 [LINK]",
        "Behold! The Meeting Decider's judgment on my proposed gathering: \"{V}\" You gotta try this! [LINK]",
        "My calendar is looking cleaner already. The Meeting Decider advised: \"{V}\" What about yours? [LINK]",
        "Just consulted the digital sage of scheduling. Verdict for my meeting: \"{V}\" Try it: [LINK]",
        "This. Is. Hilarious. And surprisingly accurate. The Meeting Decider on my meeting: \"{V}\" [LINK]",
        "I ran my meeting idea through The Meeting Decider, and it didn't hold back: \"{V}\" 😂 [LINK]"
        // ... Add many more templates here to reach 50+ for good variety
    ];

    if (shareVerdictBtn) {
        shareVerdictBtn.addEventListener('click', async () => {
            if (!currentVerdictForSharing) return; // Do nothing if no verdict to share

            const siteLink = "https://harshnahar.com/tools/meeting-decider/"; // Your actual tool URL
            // Select a random share template
            let randomTemplate = shareTextTemplates[Math.floor(Math.random() * shareTextTemplates.length)];
            // Replace placeholders in the template
            const shareText = randomTemplate.replace("{V}", currentVerdictForSharing).replace("[LINK]", siteLink);

            try {
                if (navigator.share) { // Use Web Share API if available (mostly mobile)
                    await navigator.share({
                        title: 'The Meeting Decider\'s Wisdom!', // Optional title for sharing
                        text: shareText,
                        // url: siteLink // URL is often appended by platforms or included in text
                    });
                    shareVerdictBtn.textContent = 'Shared!';
                } else { // Fallback to clipboard for desktop/unsupported browsers
                    await navigator.clipboard.writeText(shareText);
                    shareVerdictBtn.textContent = 'Copied to Clipboard!';
                }
            } catch (err) {
                console.error('Share/Copy failed:', err);
                shareVerdictBtn.textContent = 'Copy Failed!';
                 // Ultimate fallback: prompt user to copy manually
                window.prompt("Could not share automatically. Please copy this text:", shareText);
            }

            // Reset button text after a delay
            setTimeout(() => {
                shareVerdictBtn.textContent = 'Share this Verdict!';
            }, 2500);
        });
    }
});