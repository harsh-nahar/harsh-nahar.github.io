The source code for my personal blog.

**Live URL:** [harshnahar.com](https://harshnahar.com)

---

## Tech

*   **Core:** [Jekyll](https://jekyllrb.com/) (Ruby Static Site Generator).
*   **Styling:** [Tailwind CSS v3](https://tailwindcss.com/) (Standalone CLI). **Zero Runtime JS.**
*   **Hosting:** Cloudflare Pages.
*   **Icons:** [Lucide](https://lucide.dev/).
*   **Fonts:** Self-hosted `Inter` (UI) and `JetBrains Mono` (Data).
*   **Analytics:** None.

---

## Infrastructure & Deployment

This site is hosted on **Cloudflare Pages** for performance at the edge, connected directly to this GitHub repository.

**DNS Setup (Namecheap to Cloudflare):**
1.  **Cloudflare:** The domain is added to the main Cloudflare Dashboard (Free Plan) to manage DNS.
2.  **Namecheap:** In the *Domain List* -> *Manage* -> *Nameservers*, **Custom DNS** is selected.
3.  **Link:** The two Cloudflare Nameservers (e.g., `bob.ns.cloudflare.com`) are pasted into Namecheap.
4.  **Cloudflare Pages:** In *Workers & Pages* -> *[Project]* -> *Custom Domains*, `harshnahar.com` is linked. Cloudflare automatically handles SSL and internal routing.

**Build Settings:**
*   **Build Command:** `jekyll build`
*   **Output Directory:** `_site`
*   **Environment:** Ruby (latest stable).

---

## Design

1.  **The Small Web:** Prioritizes speed, readability, and raw HTML/CSS over heavy frameworks.
2.  **Monochromatic:** Strict Black (`#1d1d1f` / `#000000`) and White palette. Colors (Blue/Orange) are used *only* for interactive functional elements.
3.  **Typography:** 
    *   Extensive use of **lowercase** for headers/nav to maintain a relaxed tone.
    *   **JetBrains Mono** for all numbers, dates, and financial data.
4.  **Dark Mode First:** System-preference aware, with instant switching (No FOUC) via a render-blocking script in `<head>`.

---

## The "Golden Rule" (Development Workflow)

**Crucial:** This project does **not** use Node.js/npm. It uses the [Tailwind Standalone CLI](https://tailwindcss.com/blog/standalone-cli).

The file `styles.css` is **not** generated automatically by Jekyll. If you change any HTML class (e.g., adding `text-red-500`), you **must** rebuild the CSS manually before committing.

### How to Build CSS
Run this command in the root directory:

```bash
./tailwindcss -i input.css -o styles.css --minify
```

*Tip: While developing, run watch mode to update styles instantly:*
```bash
./tailwindcss -i input.css -o styles.css --watch
```

---

## Project Structure

```text
├── _config.yml          # Jekyll settings (Permalinks, Collections)
├── _data/               # Database files
│   ├── books.yml        # Reading log data
│   └── articles.yml     # Essay links
├── _gallery/            # Photography portfolios (Markdown files)
├── _layouts/            # HTML Templates (Default, Post, Blog, Tools)
├── _posts/              # Blog essays (Markdown)
├── assets/
│   └── fonts/           # WOFF2 files (Inter/JetBrains)
├── tools/               # Standalone HTML/JS Utilities
├── input.css            # Tailwind Source (Directives + Font Imports)
├── styles.css           # GENERATED Output (Do not edit directly)
└── tailwind.config.js   # Design system tokens
```

---

## Content Management

### 1. Adding a Blog Post
Create a file in `_posts/` named `YYYY-MM-DD-slug.md`:
```yaml
---
layout: post
title: "your title"
date: 2025-12-25
tags: ["life", "tech"]
---
```

### 2. Updating the Reading Log
Open `_data/books.yml` and append:
```yaml
- title: "Book Name"
  author: "Author Name"
  rating: 4  # 1-5
  date_read: "2025-12-25" # Leave empty if not finished
  tags: ["fiction", "scifi"]
  id: "12345" # Goodreads ID (for links)
```

### 3. Adding a Photo Gallery
Create a file in `_gallery/` (e.g., `japan2025.md`):
```yaml
---
title: "Japan"
thumbnail: "url_to_image.webp"
date: 2025-05-10
description: "Brief caption"
---
![Alt Text](image_url.webp)
```

---

## The Tools Suite

A collection of utility tools. These run **100% Client-Side** (Vanilla JS). No data is ever sent to a server.

| Tool | URL | Description | Logic |
| :--- | :--- | :--- | :--- |
| **Salary Decoder** | `/tools/salary-decoder/` | Converts Indian CTC to In-Hand. | Accounts for PF, Gratuity, and New/Old Tax Regimes (FY25-26). |
| **Tax Calculator** | `/tools/taxcalc2526/` | Detailed Income Tax estimation. | Includes 87A Rebate, Marginal Relief, and Surcharge capping. |
| **CV Builder** | `/tools/cvbuilder/` | ATS-Friendly. Private. 1-Page Focused. | Build a professional CV. |
| **Freedom Calc** | `/tools/freedom-calculator/` | FIRE & Runway planning. | Calculates "Financial Immunity" based on burn rate. |

---

## Local Development

1.  **Prerequisites:** Ruby, Bundler, and the `tailwindcss` binary.
2.  **Install Gems:**
    ```bash
    bundle install
    ```
3.  **Run the Site:**
    ```bash
    bundle exec jekyll serve
    ```
4.  **Run CSS Watcher (in a separate terminal):**
    ```bash
    ./tailwindcss -i input.css -o styles.css --watch
    ```
5.  Open `http://localhost:4000`.

---

## License & Credits

*   **Code:** MIT License. Feel free to fork and adapt the layout/tools.
*   **Content:** All blog posts and photography © Harsh Nahar.