// Wait for the entire HTML document to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    // Gather all necessary HTML elements by their IDs to interact with them
    const attendeesInput = document.getElementById('attendees');
    const stepperMinus = document.querySelector('.stepper-btn.minus');
    const stepperPlus = document.querySelector('.stepper-btn.plus');
    const durationSelect = document.getElementById('duration');
    const agendaHidden = document.getElementById('agenda'); 
    const agendaToggleContainer = document.getElementById('agendaToggle'); // Container for agenda toggle buttons
    const purposeSelect = document.getElementById('purpose');
    const snacksHidden = document.getElementById('snacks'); 
    const snacksToggleContainer = document.getElementById('snacksToggle'); // Container for snacks toggle buttons
    const desperationSlider = document.getElementById('desperation');
    const bossOverrideCheckbox = document.getElementById('bossOverride');
    const consultDeciderButton = document.getElementById('consultDecider');
    const deciderVerdictContainer = document.getElementById('deciderVerdict');
    const deciderThinkingText = deciderVerdictContainer.querySelector('.verdict-thinking');
    const deciderResultText = deciderVerdictContainer.querySelector('.verdict-result');
    const shareVerdictBtn = document.getElementById('shareVerdictBtn');

    // --- State Variables ---
    let currentVerdictForSharing = ""; // Stores the current verdict text for the share button
    let currentVerdictCategory = ""; // Stores the category of the verdict for styling (e.g., 'email', 'meeting')
    let typingInterval; // Holds the interval ID for the "thinking" text animation

    // --- Helper Function for Stepper Buttons (+/- for Attendees) ---
    if (attendeesInput && stepperMinus && stepperPlus) { // Ensure all elements exist
        stepperMinus.addEventListener('click', () => {
            let currentValue = parseInt(attendeesInput.value) || 1; // Default to 1 if current value is not a number
            if (currentValue > parseInt(attendeesInput.min)) { // Respect the min attribute
                attendeesInput.value = currentValue - 1;
            }
        });
        stepperPlus.addEventListener('click', () => {
            let currentValue = parseInt(attendeesInput.value) || 0; // Default to 0 if current value is not a number
            attendeesInput.value = currentValue + 1;
            // No max needed here, but could be added if desired: e.g. if (currentValue < parseInt(attendeesInput.max))
        });
    }

    // --- Helper Function for Toggle Buttons (Yes/No for Agenda, Snacks) ---
    function setupToggle(container, hiddenInput) {
        if (!container || !hiddenInput) { // Guard clause: if elements aren't found, log error and exit
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
                buttons.forEach(btn => btn.classList.remove('active')); // Deactivate all buttons in the group
                button.classList.add('active'); // Activate the clicked button
                hiddenInput.value = button.dataset.value; // Update the associated hidden input's value
            });
        });
    }
    // Initialize the toggle button groups
    setupToggle(agendaToggleContainer, agendaHidden);
    setupToggle(snacksToggleContainer, snacksHidden);

    // --- Typing Animation for "Thinking" Text ---
    function typeOutText(element, text, speed = 40) { // Speed in milliseconds per character
        clearInterval(typingInterval); // Clear any ongoing typing animation
        element.textContent = ''; // Clear previous text from the element
        let i = 0; // Character index
        element.style.display = 'block'; // Ensure the thinking text element is visible

        typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i); // Add next character
                i++;
            } else {
                clearInterval(typingInterval); // Stop when all characters are typed
            }
        }, speed);
    }

    // --- Confetti Functions ---
    function launchConfetti() {
        if (typeof confetti === 'function') { // Check if the confetti library is loaded
            confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
        }
    }
    function launchSnackConfetti() {
        if (typeof confetti === 'function') {
            const scalar = 2.5; 
            // Simple SVG paths for cookie and drink shapes for themed confetti
            const cookieShape = confetti.shapeFromPath({ path: 'M10 1C5.03 1 1 5.03 1 10C1 14.97 5.03 19 10 19C14.97 19 19 14.97 19 10C19 5.03 14.97 1 10 1ZM10 16.5C6.41 16.5 3.5 13.59 3.5 10C3.5 6.41 6.41 3.5 10 3.5C13.59 3.5 16.5 6.41 16.5 10C16.5 13.59 13.59 16.5 10 16.5ZM10 5C9.17 5 8.5 5.67 8.5 6.5C8.5 7.33 9.17 8 10 8C10.83 8 11.5 7.33 11.5 6.5C11.5 5.67 10.83 5 10 5ZM10 12C9.17 12 8.5 12.67 8.5 13.5C8.5 14.33 9.17 15 10 15C10.83 15 11.5 14.33 11.5 13.5C11.5 12.67 10.83 12 10 12Z' });
            const drinkShape = confetti.shapeFromPath({ path: 'M15 2H9C8.45 2 8 2.45 8 3V5.81C7.4 5.4 6.74 5.11 6 5.04V3C6 2.45 5.55 2 5 2H3C2.45 2 2 2.45 2 3V17C2 17.55 2.45 18 3 18H5C5.55 18 6 17.55 6 17V15C6.58 15.01 7.13 14.91 7.65 14.71L9.58 19.13C9.78 19.63 10.31 19.88 10.81 19.68C11.31 19.48 11.56 18.95 11.36 18.45L9.43 14H15C15.55 14 16 13.55 16 13V3C16 2.45 15.55 2 15 2ZM4 16H3V4H4V16ZM14 12H9V4H14V12Z' });
            confetti({ shapes: [cookieShape, drinkShape], angle: 90, spread: 120, particleCount: Math.floor(30 * scalar), origin: { y: 0.6 }, colors: ['#FFC107', '#FF9800', '#8BC34A', '#4CAF50', '#F44336', '#E91E63'] });
        }
    }

    // --- Verdict Text Arrays (Significantly Expanded for Variety) ---
    const thinkingMessages = [
        "The Decider is consulting the ancient algorithms of productivity...", "Recalibrating the Worthiness Matrix...", "Gazing into the Crystal Ball of Calendar Management...", "The Decider is pondering your query with intense focus...", "Analyzing attendee patience levels (they're surprisingly low)...", "Checking the alignment of productive planets...", "Shuffling the tarot cards of task delegation...", "Calculating the exact cost of this potential time vortex...", "The Decider is brewing a fresh pot of 'Is-This-Necessary?' tea...", "Cross-referencing with the Grand Tome of Terrible Meetings...", "Dusting off the Scepter of Sensible Scheduling...", "The gears of judgment are turning... slowly, but surely.", "Contemplating the opportunity cost of another meeting...", "Accessing the archives of 'Meetings That Should Have Been Emails'...", "The Decider is currently experiencing heavy cognitive load. Please wait.", "Filtering out the 'just because' requests...", "Performing a sanity check on your meeting parameters...", "Is this meeting essential, or just a habit? The Decider wonders.", "The Decider is taking a deep breath before rendering judgment.", "One moment, running diagnostics on the 'Pointless Meeting Detector'...", "Let's see... does this spark joy, or just fill a calendar slot?", "The Decider is in its zen garden, seeking clarity for your query.", "Reticulating splines... of productivity!", "Just feeding your request to the hamsters that power this thing.", "The Decider is currently consulting its rubber duck for advice.", "Warming up the logic circuits... brrr... beep boop.", "The Decider is doing some serious number crunching. Or maybe just ordering pizza.", "Searching for a glimmer of hope in your meeting request...", "If the Decider had eyes, they'd be rolling right now. Just kidding... mostly.", "Hold please, the Decider is trying to remember what meetings are FOR."
    ];
    const emailVerdicts = [
        "This has 'EMAIL' written all over it. Save humanity some time. Your inbox awaits.", "Verdict: Certified Email Material. Your colleagues' calendars (and future you) will thank you.", "The Decider has spoken: Type it out. Spare the meeting. Let the keystrokes flow.", "Is this meeting a trap? It looks like an email in disguise. Abort! Abort!", "The Decider foresees a future where this meeting was an email. Make it so.", "Launching a full meeting for this? That's like using a cannon to swat a fly. Email it.", "Put down the calendar invite and pick up your keyboard. This is email territory.", "The ancient scrolls of productivity clearly state: 'When in doubt, email it out.' This is one of those times.", "Your team's collective groan was just heard by the Decider. Make it an email.", "This query screams for asynchronous communication. Translation: EMAIL.", "Just send the darn email. Seriously.", "This could've been a Slack message, but an email will do too.", "Nope. Not a meeting. Try again (with an email draft).", "The Decider says: 'Email. Next case!'", "Is your keyboard broken? If not, this is an email.", "The Decider just saved you valuable minutes. You're welcome. (It's an email).", "Consider this a divine intervention. Send an email instead.", "If you make this a meeting, the Decider will personally haunt your calendar.", "This is so clearly an email, the Decider almost didn't need to think.", "Warning: Scheduling this meeting may cause spontaneous naps among attendees. Email it.", "The 'Reply All' button is your friend here. Not the 'New Meeting' button.", "One word: E. M. A. I. L.", "The Decider's verdict is in, and it's spelled E-M-A-I-L.", "Unless this meeting involves a winning lottery ticket, it's an email.", "Let's be honest, you knew this was an email before you even asked.", "This meeting idea is email-shaped. Don't try to fit a square peg in a round meeting slot.", "The Decider's official stance: Less talky, more typey. Email.", "Could this be simpler? Yes. As an email.", "That sound you hear? It's your colleagues silently begging for this to be an email.", "For the love of all that is productive, just email it!"
    ];
    const borderlineVerdicts = [
        "Hmm, this one's teetering on the edge. A killer agenda or exceptional snacks could tip the scales. Otherwise... email?", "Could go either way. Flip a coin, or better yet, reduce attendees and sharpen the focus. Then maybe.", "This meeting is on thin ice. Proceed ONLY if brevity is your co-pilot and purpose your North Star.", "The Decider squints. It *could* be a meeting... if you promise it's not just because you dislike typing.", "A well-written email could slay this meeting dragon. But if you must, make it legendary (and short).", "The Decider is feeling ambivalent. Perhaps a quick chat with ONE key person first?", "This is a 'maybe meeting.' If you can't articulate its value in one sentence, default to email.", "Tread carefully. This path could lead to a productive meeting or a pit of despair. Choose wisely (or email).", "If this meeting were a traffic light, it'd be blinking yellow. Proceed with caution and a very clear map.", "The Decider suggests a trial by fire: can you explain the NEED for this meeting in under 30 seconds? If not, email.", "If it's SUPER short and has donuts, maybe. Otherwise, email.", "This is 50/50. Make the agenda amazing or just email it.", "The Decider is napping on this one. Try making it an email first?", "One more pointless meeting and the Decider quits. Email it (or make this one count!).", "Could be a quick huddle. Or an even quicker email. Your call, brave soul.", "The Decider is shrugging. If you absolutely MUST, keep it under 15 minutes.", "This meeting has 'potential for disaster' written on it. Or 'potential for genius.' Good luck.", "If you can guarantee no one will secretly browse social media, then *maybe* it's a meeting.", "The Decider is giving you the side-eye. Are you *sure* about this one?", "This one requires a leap of faith. Or just a really good facilitator.", "It's not a 'no,' but it's not a 'heck yes' either. Proceed with caution.", "The Decider needs more coffee to make a call on this. Try again later (or just email).", "If this meeting has a theme song, okay. Otherwise, consider the email option.", "This is the Schrödinger's Cat of meetings. It's both an email and a meeting until you schedule it.", "The Decider feels this could be an email, but is willing to be proven wrong... this time.", "This is where heroes are made... or where time goes to die. Your choice.", "The Decider is on the fence. Maybe a quick poll with potential attendees?", "If this meeting were a movie, it'd be 'Highly Debatable Part 3.'", "Okay, but if it's boring, don't blame the Decider. That's on you.", "The Decider will allow it, but is watching you. Closely."
    ];
    const meetingVerdicts = [
        "Alright, alright. This one *might* actually need faces in a room (or pixels on a screen). Keep it snappy!", "The stars align! A rare meeting that seems... justified? Don't squander this sacred moment.", "Proceed with the meeting! (Especially if those snacks are real. The Decider has standards.)", "Okay, this sounds important enough to collectively pause other work. Make it count!", "The Decider grants permission. This meeting has potential. Unleash its power (responsibly).", "Yes! This has the hallmarks of a conversation worth having synchronously. Go forth and collaborate!", "A meeting, you say? For this? The Decider nods approvingly. Sometimes, you just gotta talk it out.", "This one passes the vibe check. Schedule it, but don't forget the action items!", "The Decider senses a genuine need for interactive discussion. Engage!", "Permission to meet: GRANTED. May your discussions be fruitful and your time well spent.", "Yeah, okay, this one's a meeting. Don't make the Decider regret this.", "Fine, have your meeting. But it better be good.", "The Decider approves this meeting. Barely. Make it count.", "This sounds like actual collaboration. Go for it.", "A meeting? For this? Surprisingly, yes. Proceed.", "This is it! A bona fide, actual, real-life (or virtual) reason to gather. Hallelujah!", "The Decider gives this meeting two thumbs up. Make some magic happen!", "Unleash the collaboration kraken! This meeting is a GO.", "Sometimes, an email just won't cut it. This is one of those times. Meet on!", "Yes, a meeting is warranted. The Decider expects great things.", "The energy is right for this. Schedule that meeting and make it productive!", "Clear your schedules, folks. This one's actually worth it!", "The Decider has peered into the future, and this meeting looks promising. (No pressure).", "This isn't just a meeting; it's an OPPORTUNITY. Seize it!", "Go ahead, book the room (or the Zoom). This one gets the green light.", "A meeting it is! May your points be clear and your rambling minimal.", "The Decider sees value here. Convene the council!", "This has 'productive discussion' written (faintly) all over it. Don't disappoint.", "Against all odds, this appears to be a legitimate meeting. Well done.", "The Decider is cautiously optimistic. Schedule it, and prove its worth."
    ];
    const socialVerdicts = [
        "Gather, humans! For team bonding and shared laughter are the elixirs of a happy workplace. Enjoy!", "Yes! A social gathering is a sacred ritual. May your conversations be merry and your connections strong.", "The Decider wholeheartedly endorses fun. Go socialize, you magnificent creatures!", "Team bonding time? Excellent! No agenda needed, just good vibes.", "Absolutely. Schedule that social. The Decider might even crash it (if there are snacks).", "Let the good times roll! Socializing is officially Decider-approved.", "Water cooler chat on steroids? Yes, please! Have a great social gathering.", "The only agenda for this meeting should be 'have fun.' Go for it!", "Forget productivity for a bit. It's time to connect. Enjoy the social time!", "The Decider decrees: more laughter, less TPS reports! Enjoy your social event.", "Socialize! It's good for the soul (and team morale).", "The Decider raises a virtual glass to this. Cheers to team spirit!", "This is the best kind of meeting. Go make some memories!", "Productivity can wait. People first! Have a wonderful social.", "Mandatory fun? Not this time! This sounds genuinely enjoyable. Go team!"
    ];
    const bossOverrideVerdicts = [ 
        "The Decider sighs. Your boss's will transcends all logic. May your coffee be strong and your patience endless. (P.S. Maybe suggest snacks?)", "Ah, the 'Boss Card' has been played. The Decider retreats to its mystical cloud. Good luck!", "When the boss calls, the Decider just pours another cup of tea. You're on your own, champ.", "The Decider's algorithms are no match for a determined manager. Godspeed.", "The boss wants it, the boss gets it. The Decider can only offer silent support.", "Well, if the boss insists... The Decider washes its hands of this. May the odds be ever in your favor.", "At this point, the Decider is just an observer. Try to make the best of it!", "The Decider's wisdom is overridden. It's okay, we all have bosses. *pats back*", "May your forced meeting be surprisingly productive. Or at least short.", "The Decider sends thoughts and prayers. And a reminder to mute your mic.", "Boss override activated. The Decider is now in 'power-saving mode' for this one.", "The Decider has been overruled. It happens to the best of us. Just smile and wave.", "Your boss has spoken. The Decider has... opinions... but will keep them to itself.", "This is above the Decider's pay grade. Good luck with that!", "Remember, 'because my boss said so' is a valid reason... to your boss."
    ];
    const bossPurposeVerdicts = [ 
        "Ah, a directive from the powers that be! The Decider bows to the inevitable. Just ensure there's a clear objective... or at least good coffee.", "Serving the managerial agenda, are we? Very well. The Decider wishes you a productive (and hopefully brief) session.", "The 'chain of command' special. The Decider understands. Try to make it useful anyway!", "When 'because my boss said so' is the reason, the Decider can only offer moral support. And a suggestion for an end time.", "The boss's purpose is a mysterious thing. The Decider hopes it involves a clear outcome for you.", "Executing a boss-mandated meeting? The Decider hopes there's a hidden gem of productivity in there somewhere.", "If your boss needs this meeting, then it shall be. The Decider just hopes it's not a waste of *your* time.", "Navigating the corporate seas, one boss-requested meeting at a time. Good luck, sailor!", "The Decider acknowledges the supreme authority of 'The Boss Told Me To.' Make it snappy.", "This meeting's purpose is 'Boss Satisfaction.' Achieve it swiftly.", "The Decider sees 'Boss's Orders' and immediately puts on its noise-canceling headphones. You got this.", "A meeting by royal decree! May it be less painful than anticipated.", "The Decider's hands are tied. Just try to get through it with your sanity intact.", "When the boss is the purpose, resistance is futile. Make it quick!", "This meeting's success metric: Did the boss seem happy? Good luck."
    ];
    const selfMeetingVerdicts = [
        "A meeting with just yourself? That's called 'thinking'. The Decider highly approves! Proceed with your brilliant monologue.", "One attendee? The Decider salutes your introspective session! May your thoughts be profound and your coffee strong.", "Planning a solo brainstorming session? Excellent! No one to steal your good ideas. Go for it!", "A party of one! The Decider loves a focused mind. Enjoy your 'me'eting!", "The most productive meetings are often with oneself. The Decider gives its blessing."
    ];
    const shortMeetingVerdicts = (duration) => [ // Function to incorporate dynamic duration
        `A ${duration}-minute meeting? Are you a time-bending wizard? The Decider is intrigued. Proceed with extreme prejudice (against time-wasting)!`, `Only ${duration} minutes? That's barely enough time to say 'hello'! If you can pull it off, you're a hero. The Decider dares you.`, `${duration} minutes! Is this a meeting or a drive-by consultation? Go, go, go!`, `Wow, ${duration} minutes! The Decider respects your commitment to brevity. Don't blink!`, `A lightning round meeting of ${duration} minutes! The Decider is impressed. Make every second count.`
    ];
    const maxDesperationNoSnacksVerdicts = [
        "Maximum desperation AND no snacks?! The Decider feels your pain on a spiritual level. Maybe... just maybe... this meeting should be an email and YOU should get some snacks.", "Peak desperation, zero snacks. This is a cry for help, not a meeting. The Decider prescribes a brief walk and a sugary treat, not another calendar invite.", "No snacks at maximum desperation? That's a bold strategy, Cotton. Let's see if it pays off... or if everyone just stares blankly. The Decider suggests rethinking.", "The Decider is sending a virtual hug. Max desperation without snacks is a tough spot. Maybe this meeting can wait?", "This level of desperation + no snacks = a recipe for a grumpy meeting. The Decider advises caution (and a snack run)."
    ];
    const massiveMeetingVerdicts = (attendees) => [ // Function to incorporate dynamic attendee count
        `Over ${attendees} people?! Is this a meeting or a company all-hands for a typo correction? The Decider suggests a very, VERY good reason (or an email).`, `${attendees}+ attendees? The Decider's abacus just exploded. This better be a declaration of world peace, or it's an email.`, `Are you sure you didn't accidentally invite the entire department for this, ${attendees} is a LOT? The Decider nervously suggests triple-checking the invite list and then emailing most of them.`, `With ${attendees} attendees, this isn't a meeting, it's an audience. Make sure the show is worth their time!`, `The Decider just fainted at the thought of ${attendees} people in one meeting. Please ensure it's critical (or an email chain instead).`
    ];

    // --- Main Decider Logic: Event listener for the "Ask the Decider" button ---
    if (consultDeciderButton) {
        consultDeciderButton.addEventListener('click', () => {
            // 1. Reset UI elements for a new verdict
            deciderResultText.textContent = ''; 
            deciderResultText.classList.remove('fade-in-verdict'); // Remove fade-in class for next result
            deciderVerdictContainer.className = 'verdict-container'; // Reset background color class
            shareVerdictBtn.style.display = 'none'; // Hide share button initially
            shareVerdictBtn.textContent = 'Share this Verdict!'; // Reset share button text

            // 2. Display a random "thinking" message with typing animation
            const randomThinkingMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
            typeOutText(deciderThinkingText, randomThinkingMessage, 40); 
            deciderVerdictContainer.style.display = 'block'; // Show the verdict area
            deciderThinkingText.style.display = 'block'; // Show the "thinking" text

            // 3. Simulate Decider's "thinking" time before revealing the verdict
            setTimeout(() => {
                // 4. Get all current input values from the form
                const attendees = parseInt(attendeesInput.value) || 1; 
                const duration = parseInt(durationSelect.value);
                const hasAgenda = agendaHidden.value === 'yes'; // Value from hidden input, updated by toggle
                const purpose = purposeSelect.value;
                const hasSnacks = snacksHidden.value === 'yes'; // Value from hidden input, updated by toggle
                const desperation = parseInt(desperationSlider.value);
                const bossOverride = bossOverrideCheckbox.checked;

                let verdict = ""; // Variable to hold the final verdict text
                currentVerdictCategory = "special"; // Default category, updated by logic below

                // --- 5. Easter Egg Logic (these override main logic if conditions are met) ---
                if (attendees === 1 && purpose !== 'social') {
                    verdict = selfMeetingVerdicts[Math.floor(Math.random() * selfMeetingVerdicts.length)];
                    displayVerdict(verdict); return; 
                }
                if (duration <= 10 && purpose !== 'social') { 
                    const verdictsArray = shortMeetingVerdicts(duration); // Call function to get relevant array
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
                
                // --- 6. Boss Override / Boss Purpose Logic (also overrides main logic) ---
                if (bossOverride) {
                    verdict = bossOverrideVerdicts[Math.floor(Math.random() * bossOverrideVerdicts.length)];
                    displayVerdict(verdict); return; 
                }
                if (purpose === 'boss-purpose') { 
                    verdict = bossPurposeVerdicts[Math.floor(Math.random() * bossPurposeVerdicts.length)];
                    displayVerdict(verdict); return; 
                }

                // --- 7. Core "Email Score" Logic ---
                // Higher score means more likely it should be an email
                let emailScore = 0;

                // Penalties (increase score towards "email" verdict)
                if (purpose === 'info-share') emailScore += 30;
                if (purpose === 'sync') emailScore += 20;
                if (purpose === 'idk') emailScore += 50; 
                if (!hasAgenda) emailScore += 25;
                if (attendees > 8 && duration > 45) emailScore += 15;
                if (attendees > 5 && (purpose === 'info-share' || purpose === 'sync')) emailScore += 10;
                if (duration > 60 && !['brainstorm', 'decision', 'feedback', 'onboarding', 'social'].includes(purpose)) emailScore += 10;

                // Bonuses (decrease score towards "meeting" verdict)
                if (purpose === 'decision' && hasAgenda) emailScore -= 20;
                if (purpose === 'brainstorm' && hasAgenda) emailScore -= 15;
                if (purpose === 'feedback' && attendees <= 4 ) emailScore -=15; 
                if (purpose === 'onboarding' && hasAgenda) emailScore -=10;
                if (purpose === 'social') emailScore -= 100; // Social events are almost always meetings
                
                emailScore -= desperation; // Higher desperation makes meeting more likely (lower score)
                if (hasSnacks) emailScore -= 30; // Snacks are a BIG bonus for meetings
                
                // --- 8. Determine Final Verdict & Category based on Email Score ---
                if (purpose === 'social') {
                    verdict = socialVerdicts[Math.floor(Math.random() * socialVerdicts.length)];
                    currentVerdictCategory = "meeting"; 
                    launchConfetti(); // General celebration for social events
                } else if (emailScore >= 25) { // High score = definitely should be an email
                    verdict = emailVerdicts[Math.floor(Math.random() * emailVerdicts.length)];
                    currentVerdictCategory = "email";
                } else if (emailScore >= 5) { // Mid score = borderline, could go either way
                    verdict = borderlineVerdicts[Math.floor(Math.random() * borderlineVerdicts.length)];
                    currentVerdictCategory = "borderline";
                } else { // Low score = good candidate for a meeting
                    verdict = meetingVerdicts[Math.floor(Math.random() * meetingVerdicts.length)];
                    currentVerdictCategory = "meeting";
                    if (hasSnacks) { // If it's a meeting AND has snacks, launch snack-themed confetti
                        launchSnackConfetti(); 
                    }
                }
                
                // 9. Display the determined verdict
                displayVerdict(verdict);

            }, 1200 + Math.random() * 800); // Variable thinking time (1.2s to 2s)
        });
    }

    // --- Function to Display the Verdict and Update Related UI ---
    function displayVerdict(text) {
        clearInterval(typingInterval); // Stop "thinking" animation if it's still running
        deciderThinkingText.style.display = 'none'; // Hide the "thinking" text
        
        deciderResultText.textContent = text; // Set the final verdict text
        currentVerdictForSharing = text; // Store the verdict for the share button
        deciderResultText.classList.add('fade-in-verdict'); // Trigger fade-in animation for verdict text
        
        // Apply appropriate background color to the verdict box based on the category
        deciderVerdictContainer.className = 'verdict-container'; // Reset classes first
        if (currentVerdictCategory === "email") deciderVerdictContainer.classList.add('verdict-bg-email');
        else if (currentVerdictCategory === "borderline") deciderVerdictContainer.classList.add('verdict-bg-borderline');
        else if (currentVerdictCategory === "meeting") deciderVerdictContainer.classList.add('verdict-bg-meeting');
        else deciderVerdictContainer.classList.add('verdict-bg-special'); // For boss overrides, easter eggs

        shareVerdictBtn.style.display = 'inline-block'; // Show the share button now that there's a verdict
    }

    // --- Share Button Logic ---
    const shareTextTemplates = [ // Array of templates for sharing
        "The Meeting Decider just told me: \"{V}\" 😂 Should I listen? You try! [LINK]", "My meeting plans vs. The Meeting Decider: It said \"{V}\" 💀 What will it tell you? [LINK]", "Wondering if your meeting is worth it? I asked The Meeting Decider and got: \"{V}\" 🤔 Your turn! [LINK]", "The ultimate productivity hack? This tool! It just gave me this gem: \"{V}\" 🤣 [LINK]", "\"Should this meeting be an email?\" The Decider's verdict on mine: \"{V}\" 👇 Check yours: [LINK]", "Feeling good about my next meeting... NOT! The Decider said: \"{V}\" 😭 [LINK]", "Just saved an hour thanks to The Meeting Decider: \"{V}\" 🙌 Get your time back: [LINK]", "My boss won't like this one... The Decider's take: \"{V}\" 🤫 What's your verdict? [LINK]", "Is it just me, or are most meetings emails? The Decider agrees: \"{V}\" ✅ [LINK]", "Productivity level up! The Meeting Decider's wisdom: \"{V}\" 🚀 [LINK]", "This tool is pure gold for calendar sanity. My result: \"{V}\" ✨ [LINK]", "The Meeting Decider: 1, Pointless Meetings: 0. It said: \"{V}\" 🤺 [LINK]", "To meet or not to meet? The Decider decreed: \"{V}\" 📜 [LINK]", "Sent from my AI overlord (The Meeting Decider): \"{V}\" 🤖 [LINK]", "My new favorite office tool just spat out: \"{V}\" 💯 [LINK]", "Need a laugh AND a productivity boost? \"{V}\" says The Decider. [LINK]", "Avoiding another soul-crushing meeting thanks to: \"{V}\" – The Meeting Decider [LINK]", "The Decider doesn't pull punches! Got this for my meeting idea: \"{V}\" 🥊 [LINK]", "If you value your time, consult The Meeting Decider. Mine said: \"{V}\" ⏳ [LINK]", "This is the energy I'm taking into all meeting planning now, thanks to The Decider: \"{V}\" 💅 [LINK]", "Behold! The Meeting Decider's judgment on my proposed gathering: \"{V}\" You gotta try this! [LINK]", "My calendar is looking cleaner already. The Meeting Decider advised: \"{V}\" What about yours? [LINK]", "Just consulted the digital sage of scheduling. Verdict for my meeting: \"{V}\" Try it: [LINK]", "This. Is. Hilarious. And surprisingly accurate. The Meeting Decider on my meeting: \"{V}\" 😂 [LINK]", "I ran my meeting idea through The Meeting Decider, and it didn't hold back: \"{V}\" 🤣 [LINK]", "My spirit animal is The Meeting Decider. Its latest wisdom for me: \"{V}\" Find yours: [LINK]", "You NEED this in your life. The Meeting Decider's thoughts on my meeting: \"{V}\" What about yours? [LINK]", "The truth hurts... hilariously. My meeting according to The Decider: \"{V}\" 🎯 [LINK]", "I'm not saying The Meeting Decider is always right, but... it said: \"{V}\" And it's not wrong. [LINK]", "Calendar chaos averted! The Meeting Decider's sage advice: \"{V}\" How about your meetings? [LINK]",
        // Add ~20 more unique and funny templates here to reach 50+
        "The Meeting Decider whispered sweet nothings to my calendar: \"{V}\" [LINK]",
        "Is your meeting a unicorn or just a donkey in a party hat? The Decider knows: \"{V}\" [LINK]",
        "I put my meeting through the Decider-Tron 3000. Output: \"{V}\" Science! [LINK]",
        "Let's be real, The Meeting Decider is just saying what we're all thinking: \"{V}\" [LINK]",
        "My therapist told me to use The Meeting Decider. It said: \"{V}\" Feeling better already. [LINK]",
        "This tool just gave my meeting a reality check: \"{V}\" Ouch. But fair. [LINK]",
        "If meetings had Yelp reviews, The Decider's would be the most honest: \"{V}\" [LINK]",
        "The Meeting Decider: because ain't nobody got time for that (meeting). Mine was: \"{V}\" [LINK]",
        "Summoning the spirit of productivity via The Meeting Decider! It chanted: \"{V}\" [LINK]",
        "What would The Meeting Decider do? WWTMDP? For me, it was: \"{V}\" [LINK]",
        "My meeting's fate, as foretold by The Meeting Decider: \"{V}\" Spooky accurate! [LINK]",
        "Just got ROASTED by The Meeting Decider: \"{V}\" 😂 So good. [LINK]",
        "The Meeting Decider is my new co-pilot for scheduling. Its advice: \"{V}\" [LINK]",
        "Forget horoscopes, what does The Meeting Decider say about your day? Mine: \"{V}\" [LINK]",
        "This isn't just a tool, it's a public service. The Meeting Decider: \"{V}\" [LINK]",
        "I'm starting a petition to make The Meeting Decider mandatory. My latest ruling: \"{V}\" [LINK]",
        "The Meeting Decider has more wisdom than most middle managers. \"{V}\" [LINK]",
        "Pretty sure The Meeting Decider runs on sarcasm and caffeine. Its take on my meeting: \"{V}\" [LINK]",
        "My meeting just got Decider-ed! Result: \"{V}\" I'm not crying, you are. [LINK]",
        "If you're not using The Meeting Decider, you're doing it wrong. My verdict: \"{V}\" [LINK]"
    ];

    if (shareVerdictBtn) { // Ensure share button exists before adding listener
        shareVerdictBtn.addEventListener('click', async () => {
            if (!currentVerdictForSharing) return; // Do nothing if there's no verdict yet

            const siteLink = "https://harshnahar.com/tools/meeting-decider/"; // Your actual tool URL
            let randomTemplate = shareTextTemplates[Math.floor(Math.random() * shareTextTemplates.length)];
            // Replace placeholders in the chosen template
            const shareText = randomTemplate.replace("{V}", currentVerdictForSharing).replace("[LINK]", siteLink);

            try {
                if (navigator.share) { // Use Web Share API if available (mostly on mobile)
                    await navigator.share({
                        title: 'The Meeting Decider\'s Wisdom!', // Optional title for sharing dialog
                        text: shareText,
                        // url: siteLink // URL is often better appended by the platform or part of text
                    });
                    shareVerdictBtn.textContent = 'Shared!'; // Feedback to user
                } else { // Fallback to clipboard for desktop/unsupported browsers
                    await navigator.clipboard.writeText(shareText);
                    shareVerdictBtn.textContent = 'Copied to Clipboard!'; // Feedback
                }
            } catch (err) { // Handle errors during share/copy
                console.error('Share/Copy failed:', err);
                shareVerdictBtn.textContent = 'Copy Failed!';
                 // Ultimate fallback: prompt user to copy manually if all else fails
                window.prompt("Could not share automatically. Please copy this text:", shareText);
            }

            // Reset button text after a short delay
            setTimeout(() => {
                shareVerdictBtn.textContent = 'Share this Verdict!';
            }, 2500);
        });
    }
});
