# Harsh Nahar - Personal Blog
This is the source code for my personal website, [harshnahar.com](https://harshnahar.com).
It serves as a digital garden for my writing, photography, and a suite of privacy-focused financial tools tailored for the Indian context.
The website itself was built mostly with the help of ChatGPT/Gemini/Claude.

## Design Philosophy

- **Minimalism:** The site uses a strict monochromatic palette to focus on content and utility.
- **Typography:** You will notice the extensive use of **lowercase text** across headers and UI elements. This is a deliberate design choice to maintain a relaxed, "Small Web" aesthetic.
- **Dark Mode:** First-class support for system-preferred themes.

## Tech Stack

- **Core:** [Jekyll](https://jekyllrb.com/) (Static Site Generator)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (CDN Runtime)
- **Hosting:** Cloudflare Pages (Edge Network)
- **Assets:** Hosted on a separate repository via jsDelivr CDN for performance.
- **Analytics:** Cloudflare Web Analytics (Privacy-first, no cookies).

## The Tools Suite

There is a collection of client-side utilities that run entirely in the browser (No data is sent to any server).

1.  **salary decoder:** Converts Indian CTC to actual In-Hand salary, accounting for hidden components like PF & Gratuity.
2.  **tax calculator:** FY 2025-26 tax estimation with support for Marginal Relief and Surcharge caps.
3.  **rent vs. buy:** A mathematical comparison engine using Opportunity Cost logic.
4.  **freedom calculator:** Financial Runway and FIRE (Financial Independence) planning.
5.  **opportunity cost:** Converts purchase prices into "Life Energy" (hours of work required).

## 🚀 Local Development

1.  **Prerequisites:** Ruby and Bundler.
2.  **Install Dependencies:**
    ```bash
    bundle install
    ```
3.  **Run Locally:**
    ```bash
    bundle exec jekyll serve
    ```
4.  Open `http://localhost:4000` in your browser.

## 📜 Credits & Attribution

- **Consistency Grid:** Concept inspired by [Sara Dietschy](https://www.gridmylife.com/).
- **Development:** Designed & Developed by Harsh Nahar.
- **Icons:** [Lucide](https://lucide.dev/).

## 📄 License

The code for the tools and layout is open source. The content (blog posts, photography) is © Harsh Nahar.