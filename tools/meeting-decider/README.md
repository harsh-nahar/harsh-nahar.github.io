# The Meeting Decider

A fun, witty, and lightweight web tool to help users determine if their planned meeting is truly necessary or if it could (and probably should) have been an email. Built with vanilla HTML, CSS, and JavaScript.

**Live URL:** [https://harshnahar.com/tools/meeting-decider/](https://harshnahar.com/tools/meeting-decider/)

## Features

*   **Interactive Form:** Users input parameters about their potential meeting:
    *   Number of Attendees
    *   Meeting Duration
    *   Clarity of Agenda (Yes/No)
    *   Primary Purpose (Dropdown with various options)
    *   Availability of Free Snacks (Yes/No)
    *   User's Desperation Level for the meeting (Slider)
    *   Boss Override Checkbox
*   **Humorous Verdicts:** Based on the inputs, the "Decider" provides a witty verdict suggesting whether the meeting is a good idea, borderline, or definitely an email.
*   **Massive Variety:** Hundreds of unique sentence combinations for "thinking" messages and verdicts to keep the experience fresh.
*   **Easter Eggs:** Several hidden conditions that trigger special, often funnier, verdicts.
*   **Typing Animation:** For the "Decider is thinking..." messages.
*   **Confetti Celebration:** For genuinely good meeting ideas (social events, or meetings with snacks!).
*   **Subtle Visual Cues:** Background color of the verdict box changes subtly based on the verdict category.
*   **Share Functionality:** Allows users to easily share the hilarious verdict they received (uses Web Share API with a clipboard fallback).
*   **Responsive Design:** Works well on desktop and mobile devices.
*   **Lightweight & Fast:** Built with vanilla technologies for quick loading.
*   **Link Previews:** Includes Open Graph and Twitter Card meta tags for rich link sharing.
*   **AI Assisted:** Creatively sculpted with AI assistance.

## Technologies Used

*   **HTML5**
*   **CSS3** (including Flexbox, Grid, and animations)
*   **Vanilla JavaScript (ES6+)**
*   **`canvas-confetti` library** (via CDN) for celebratory confetti.

## File Structure
/tools/meeting-decider/
├── index.html # The main HTML structure
├── styles.css # All CSS styling for the tool
├── script.js # All JavaScript logic and interactivity
├── README.md # This file
└── assets/
└── market-decider-preview.webp # Preview image for social sharing

## How to Invoke Easter Eggs

Here are the conditions to trigger the special Easter Egg verdicts:

1.  **"Self Meeting" / Meeting with Yourself:**
    *   **Trigger:**
        *   `Number of Attendees` = **1**
        *   `Primary Purpose` is **NOT** "Team Bonding / Social Gathering"
    *   **Example Verdict:** "A meeting with just yourself? That's called 'thinking'. The Decider highly approves! Proceed with your brilliant monologue."

2.  **"Very Short Meeting":**
    *   **Trigger:**
        *   `Meeting Duration` <= **10 minutes** (e.g., the "15 minutes" option from dropdown, if it were possible to input 10 or less)
        *   `Primary Purpose` is **NOT** "Team Bonding / Social Gathering"
    *   **Example Verdict:** "A [duration]-minute meeting? Are you a time-bending wizard? The Decider is intrigued. Proceed with extreme prejudice (against time-wasting)!"

3.  **"Maximum Desperation, No Snacks":**
    *   **Trigger:**
        *   `Your Desperation Level` = **10** (slider to "MAXIMUM OVERDRIVE")
        *   `Will there be FREE SNACKS?` = **"Sadly, No"**
        *   `Primary Purpose` is **NOT** "Team Bonding / Social Gathering"
        *   `Number of Attendees` > **1**
    *   **Example Verdict:** "Maximum desperation AND no snacks?! The Decider feels your pain on a spiritual level. Maybe... this meeting should be an email and YOU should get some snacks."

4.  **"Massive Meeting":**
    *   **Trigger:**
        *   `Number of Attendees` > **20**
        *   `Primary Purpose` is **NOT** "Team Bonding / Social Gathering"
    *   **Example Verdict:** "Over [attendees] people?! Is this a meeting or a company all-hands for a typo correction? The Decider suggests a very, VERY good reason (or an email)."

5.  **"The Perfect Meeting":**
    *   **Trigger (all conditions must be met):**
        *   `Number of Attendees` = **3, 4, or 5**
        *   `Meeting Duration` = **30 minutes OR 45 minutes**
        *   `Is there a CLEAR Agenda?` = **"Yes, Crystal Clear!"**
        *   `Primary Purpose` = **"Critical Decision (Needs Discussion)"**
        *   `Will there be FREE SNACKS?` = **"Oh Yes! (The Good Kind)"**
        *   `Your Desperation Level` <= **3** (slider towards "Zen")
        *   `Boss Override` checkbox is **NOT checked**
    *   **Example Verdict:** "Whoa, did you just design the PERFECT meeting?! The Decider is in awe. This isn't just a meeting, it's a masterpiece of collaboration waiting to happen! Go forth and be legendary! ✨"
    *   **Visual:** Extra celebratory confetti.

6.  **"Maximum Chaos Meeting":**
    *   **Trigger (all conditions must be met):**
        *   `Number of Attendees` > **15**
        *   `Meeting Duration` >= **90 minutes**
        *   `Is there a CLEAR Agenda?` = **"No, We'll Wing It"**
        *   `Primary Purpose` = **"Honestly, I Don't Know" OR ""Quick Sync" / Status Update"**
        *   `Will there be FREE SNACKS?` = **"Sadly, No"**
        *   `Your Desperation Level` >= **8** (slider towards "MAXIMUM OVERDRIVE")
        *   `Boss Override` checkbox is **NOT checked**
    *   **Example Verdict:** "This isn't a meeting, it's a recipe for pure, unadulterated chaos. The Decider advises protective gear and a strong exit strategy. May the odds be ever NOT in this meeting's favor. 🤯"
    *   **Visual:** Subtle screen shake effect on the app container.

7.  **"Friday Afternoon Meeting":**
    *   **Trigger:**
        *   Current day (on the user's computer) is **Friday**.
        *   Current hour (on the user's computer) is **2 PM (14:00) or later**.
        *   `Primary Purpose` is **NOT** "Team Bonding / Social Gathering"
        *   `Boss Override` checkbox is **NOT checked**
    *   **Example Verdict:** "A meeting on a Friday afternoon? You brave soul! The Decider senses the weekend calling. Keep this one extra short and sweet, okay? 🍹"

8.  **"Rapid Fire Clicks":**
    *   **Trigger:**
        *   Click the "Ask the Decider" button **5 or more times consecutively**.
        *   Each click must be within **2 seconds** of the previous click.
    *   **Example Verdict:** "Whoa there, eager beaver! The Decider needs a moment to catch its breath. Are you trying to break the meeting-verse? 🤔 One verdict at a time, please!"

This Project was fully coded by Gemini Pro

---
