# India Travel Tracker 🌍

Live URL: [India Travel Tracker](https://harshnahar.com/tools/map/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/tech-HTML%2C%20CSS%2C%20JS-brightgreen)](https://developer.mozilla.org/)
[![Built with D3.js](https://img.shields.io/badge/built%20with-D3.js-orange.svg)](https://d3js.org/)

An interactive, client-side web application designed to help you visualize and track your travels across the states and union territories of India. Built with a focus on performance, modern design, and a great user experience on any device.

---

## ✨ Core Features

*   **Interactive Map:**
    *   **Click** a state or union territory to mark it as "Visited".
    *   **Double-click** a state to zoom in and view more details.
    *   Click the background or the reset button to zoom out.

*   **Intelligent Caching:**
    *   The 3MB map data is downloaded only once.
    *   On subsequent visits, the map loads instantly from a local **IndexedDB** cache, saving bandwidth and dramatically reducing load times.

*   **Personalization & Sharing:**
    *   **Download Map:** Generate a high-resolution, personalized image of your map. A popup will ask for your name to create a custom title like "Maria's Travels".
    *   **Shareable Links:** Create a unique URL that you can share with friends, which will display your specific map progress when they open it.

*   **Modern UI & UX:**
    *   **Fully Responsive Design:** Adapts beautifully from large desktop monitors to tablets and mobile phones.
    *   **Dark & Light Mode:** Automatically detects your system's theme and includes a manual toggle to switch modes. Your preference is saved locally.
    *   **Glassmorphism UI:** A modern, frosted-glass effect is used for the pop-up info card.
    *   **Subtle Dot Grid Background:** A faint, layered dot pattern adds visual depth and texture to the interface.

*   **Customization & Gamification:**
    *   **Fill Intensity Slider:** Adjust the opacity of the "Visited" color to your liking.
    *   **Dynamic Labels:** Choose to display labels for all places, only visited places, or none at all.
    *   **Travel Achievements:** Unlock achievements like "Coastal Cruiser" or "Seven Sisters" as you complete specific sets of states.

*   **Accessibility:**
    *   Includes keyboard shortcuts for zooming (`+`/`-`), resetting (`R`), and toggling labels (`L`).
    *   Map paths include `<title>` elements for better screen reader support.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (with Custom Properties), JavaScript (ES6+)
*   **Core Library:** [**D3.js**](https://d3js.org/) for rendering the interactive SVG map.
*   **Image Generation:** [**html2canvas**](https://html2canvas.hertzen.com/) for capturing the map container as a downloadable image.
*   **Data Format:** GeoJSON for the map data.
*   **Caching:** Browser **IndexedDB** for efficient client-side storage of map data.

## 🚀 Getting Started

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/india-travel-tracker.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd india-travel-tracker
    ```

3.  **Run a local server.**
    Because the application uses `fetch` to load the `in.json` map file, you cannot simply open `index.html` from the filesystem due to browser security policies (CORS). You need a simple local server.

    If you have Node.js installed, you can use `http-server`:
    ```bash
    # Install if you don't have it
    npm install -g http-server
    
    # Run the server
    http-server
    ```

    Alternatively, if you have Python installed, you can use its built-in server:
    ```bash
    # For Python 3
    python -m http.server
    
    # For Python 2
    python -m SimpleHTTPServer
    ```

4.  **Open the app in your browser:**
    Navigate to [http://localhost:8080](http://localhost:8080) (or the address provided by your server).

## 📁 Project Structure

```
/
├── index.html        # The main page structure
├── style.css         # All styling, including responsive design and themes
├── script.js         # Core application logic, interactivity, and caching
└── in.json           # The GeoJSON map data for India
```

## 🙏 Attribution & Credits

*   This project was coded with assistance from **Googls AI Studio**.
*   The map data (`in.json`) is sourced from the excellent **maps-geojson** repository by [Simple Maps](https://simplemaps.com/gis/country/in).
*   Icons are from the open-source [Heroicons](https://heroicons.com/) library.
