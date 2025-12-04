---
title: "setting up this blog"
date: 2025-05-11
excerpt: "how did I(or AI) create this website"
image: "https://raw.githubusercontent.com/harsh-nahar/assets/refs/heads/main/blog-images/Initial%20Design.webp"
---
> UPDATE: On November 22, 2025, I made big design changes to this website that do not adhere to the design choices in this post.

I have had the `harshnahar.com` domain for over five years now. Back in 2020-21, I had purchased the cheapest WIX plan, which was probably 300/- a month for hosting, and they offered a year's worth of domain registration free. This plan also had about 10GB of hosting space and about 100GB of bandwidth per month for a site. I did not know what all that meant and Googled along the way to get the site up and running.

As I am a photographer and I occasionally write, I wanted a simple yet modern blog which could display my gallery and posts. WIX's drag-and-drop functionality, margins, and paddings made it pretty intuitive to build the look of the site, and they also had a CMS so that I could add posts to the blog page. In no time, I set up the site with the minimal design I had in mind, and it looked fine on a phone too!

About 1-2 years later, I felt the design was boring and I probably did not need one for now(the charges seemed high to me). So I took it down.

It has been a couple of years since then. I have tried to learn how to get a simple site running for low/no cost but always dreaded the amount of work required in setting one up.

**And then came ChatGPT**

Well, GPT has been around for a while. What I meant is GPT 4-o and the reasoning model.
This changed the game when it helped me build an iOS, web app for a tax calculator which is hosted on GitHub. It was entirely coded by AI. It did require many iterations and corrections by me, having to prompt a million times, but it worked nonetheless.

-------------------------------------------------------

May 8th, 2025

After using GPT to understand how to build a PDF parsing system that can then use that data to categorize and visualize my expenses, I had enough zeal in me to start with the blog generation process.

The first thing I did was to create a working prototype in Figma for the home, blog, and posts' pages. My initial idea was for it to be extremely simple for load times and to draw attention to the posted content, so a white background and black text were decided. The website should look like a document rather than an app. It should open in milliseconds. Yet, it should feel like there was some thought put into this.

![Initial Design](https://raw.githubusercontent.com/harsh-nahar/assets/refs/heads/main/blog-images/Initial%20Design.webp)

Then I remembered that Kailash Nadh, the CTO of Zerodha, has his own blog, which is very close to what I wanted. He posts his musings and pictures there. One interesting thing is his use of orange (#ff5232) for links and important words. I liked it so much that I decided to include it in my site too.

With that in mind, I came up with some hover effects and transitions, and my vision was almost there.

Now it was time for me to help GPT understand the requirement(sometimes quite difficult).

-----------------------------------------------------------

May 9th, 2025

I exported a PDF of the designs and annotated it at various places along with a long description, thinking GPT would read those and figure things out.

![Initial Prompt](https://raw.githubusercontent.com/harsh-nahar/assets/refs/heads/main/blog-images/Initial%20Prompt.webp)

From here on, it started building the HTML and CSS files required for the page. This process took a very long time. For it to understand the design I wanted, the font, bg-color, hover effects, font switcher, transition times, etc., it felt like an endless effort.

Somehow, in some hours, I had a working local file that resembled the site I wanted.

Off to sleep.

---------------------------------------------------------

May 10th, 2025 (morning to noon)

In retrospect, if I had known how painful this would be, I might not have taken up this project.
Now, I know a web developer would find this hilarious or stupid, but to a commoner - man, why is this so difficult?

My morning started with the usual "hey, now help me get this site up and running from here" prompts. GPT had already decided to suggest using GitHub and something called “Jekyll," which is a static website generator native to GitHub, to develop my site. An unknown word scares me sometimes. I thought I would let GPT handle it, and I would just follow instructions.

During lunch break, I had taken some time to look at the code both in HTML and CSS and tweaked a few things here and there to better fit my vision.

![Project Roadmap](https://raw.githubusercontent.com/harsh-nahar/assets/refs/heads/main/blog-images/Code%20Screenshot.webp)

After this, the following is what I did to get the site on GitHub:
- Create a new GitHub account and a repo for my site.
- Add files and folders in the following structure:
```
# Root of the GitHub Pages site
├── _config.yml               # Jekyll configuration
├── index.md                  # Homepage content (uses home layout)
├── blog/                     # Blog directory
│   └── index.md              # Blog grid page (uses blog layout)
├── styles.css                # Main stylesheet
├── CNAME                     # (auto) contains: harshnahar.com when using custom domain
├── _layouts/                 # Jekyll layouts
│   ├── default.html          # Base wrapper (head, CSS, body)  
│   ├── home.html             # Homepage inner markup  
│   ├── blog.html             # Blog grid markup + search  
│   └── post.html             # Individual post layout (header, content, footer)
└── _posts/                   # Markdown posts
    ├── 2025-01-10-post-1.md
    ├── 2025-02-05-post-2.md
```
- After this was done, GitHub Pages in the repo setting had to be enabled. This basically means that your site is up and running with a github.io extension.

-------------------------------------------------------------------

![Project Roadmap](https://raw.githubusercontent.com/harsh-nahar/assets/refs/heads/main/blog-images/Roadmap.webp)

May 10th, 2025 (evening)

My excitement was short-lived. As I had not yet added my domain to this repo, which was the final goal. I had bought this domain from GoDaddy. GitHub lets you add your domains in the settings-pages-CustomDomain in the repo.

Here is the process - 
- Go to the DNS settings of your domain.
- Add four A records and one CNAME record in the DNS records:

```
|Type|Host|Points to|TTL|
|A|@|185.199.108.153|Default|
|A|@|185.199.109.153|Default|
|A|@|185.199.110.153|Default|
|A|@|185.199.111.153|Default|
|-|
|Type|Host|Points to|TTL|
|CNAME|www|`github repo link`|Default|
```
- Go to the repo settings - Pages - Custom Domain - add your personal domain
- Here, GitHub will do a domain check and after successful completion, your website can be accessed directly by the personal domain. GitHub also adds HTTPS to your website for free this way.

I tried adding the mentioned record in GoDaddy DNS settings but then GitHub could not do a successful DNS check no matter what I tried. When I looked online, it seemed like others had similar issues with GoDaddy as well.

This prompted me to transfer my domain over to NameCheap. By this time it was already getting dark. I initiated the transfer process and paid the fees. Now I just had to wait for that to happen.

To let my mind rest, I turned off the computer and went for a walk. All this time I was restless as I was so close to completion. When I returned, the transfer was complete.

I tried the DNS records step again but it kept throwing random errors at me. GPT kept repeating the same things: "check your root folder for a .nojekyll file, have some patience" etc.;

Not to mention, the frequent "You have reached the limit, wait for 2 hours to continue this chat".

Exactly when I was about to give everything up, the site somehow went live on my domain. I was confused. I kept looking at the URL bar and none of the refreshes threw an error. When the realization hit that it was indeed working, I let out a sigh of relief and thought to myself:

"I might never want to do this again"
