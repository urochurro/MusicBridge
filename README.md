<div align="center">
<h1 align="center">
<img src="https://github.com/urochurro/MusicBridge/blob/ed30d0856c03f1b9c7349b0676fa8bad5620f5b4/public/images/logo.png?raw=true" width="100" />
<br>MUSICBRIDGE</h1>
<h3>◦ Harmony in Code, Symphony in Collaboration!</h3>
<h3>◦ Developed with the software and tools below.</h3>


<p align="center">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat-square&logo=JavaScript&logoColor=black" alt="JavaScript" />
<img src="https://img.shields.io/badge/Nodemon-76D04B.svg?style=flat-square&logo=Nodemon&logoColor=white" alt="Nodemon" />
<img src="https://img.shields.io/badge/Passport-34E27A.svg?style=flat-square&logo=Passport&logoColor=white" alt="Passport" />
<img src="https://img.shields.io/badge/Express-000000.svg?style=flat-square&logo=Express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat-square&logo=JSON&logoColor=white" alt="JSON" />
</p>
<img src="https://img.shields.io/github/license/urochurro/MusicBridge?style=flat-square&color=5D6D7E" alt="GitHub license" />
<img src="https://img.shields.io/github/last-commit/urochurro/MusicBridge?style=flat-square&color=5D6D7E" alt="git-last-commit" />
<img src="https://img.shields.io/github/commit-activity/m/urochurro/MusicBridge?style=flat-square&color=5D6D7E" alt="GitHub commit activity" />
<img src="https://img.shields.io/github/languages/top/urochurro/MusicBridge?style=flat-square&color=5D6D7E" alt="GitHub top language" />
</div>


---

## 📖 Table of Contents
- [📖 Table of Contents](#-table-of-contents)
- [📍 Overview](#-overview)
- [📦 Features](#-features)
- [📂 repository Structure](#-repository-structure)
- [⚙️ Modules](#modules)
- [🚀 Getting Started](#-getting-started)
    - [🔧 Installation](#-installation)
    - [🤖 Running MusicBridge](#-running-MusicBridge)
- [📄 License](#-license)
- [👏 Acknowledgments](#-acknowledgments)

---


## 📍 Overview

MusicBridge is a versatile web app designed to enhance user experience on music platforms, Spotify and Apple Music. It facilitates seamless playlist conversion between these platforms, offers a practical recommendations system based on user listening profiles, and showcases newly released music. Users can also submit their own playlists, tailoring them with their preferred mood and genre. MusicBridge's unique value-add stems from its capability to bridge the gap between leading music platforms, enhancing song discovery, and playlist customization.

---

## 📦 Features

|    | Feature            | Description                                                                                                        |
|----|--------------------|--------------------------------------------------------------------------------------------------------------------|
| ⚙️ | **Architecture**   | The system uses a server-side rendering and a monolithic architecture, leveraging Express.js and EJS. The backend and frontend code are kept distinct, but part of a single codebase. |
| 🔗 | **Dependencies**   | Utilizes key dependencies such as Express.js for server operations, Passport.js for user authentication, MongoDB for data storage, and EJS for templating.  |
| 🧩 | **Modularity**     | The system demonstrates good use of modularity, with distinct EJS files responsible for different aspects of user interface. |
| ⚡️  | **Performance**    | As the application interacts with Spotify and Apple Music APIs and runs MongoDB operations, performance could be influenced by these services' response times. |
| 🔌 | **Integrations**   | MusicBridge interacts with external services like Spotify and Apple Music through their APIs, displaying a good level of system integration. |


---


## 📂 Repository Structure


```sh
└── MusicBridge/
    ├── app.js
    ├── package-lock.json
    ├── package.json
    ├── public/
    │   ├── css/
    │   │   ├── landingPage.css
    │   │   ├── recommended.css
    │   │   ├── styles.css
    │   │   └── submit.css
    │   └── images/
    └── views/
        ├── converter.ejs
        ├── footer.ejs
        ├── home.ejs
        ├── home1.ejs
        ├── landingPage.ejs
        ├── navBar.ejs
        ├── newMusic.ejs
        ├── playlist.ejs
        ├── playlistSubmit.ejs
        └── recommendations.ejs

```

---


## ⚙️ Modules

<details closed><summary>Root</summary>

| File                          | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---                           | ---                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| [app.js]({file})              | The code is for a music application, MusicBridge, that allows users to convert playlists between Spotify and Apple Music. It incorporates user authentication using Passport.js and Spotify strategy, enables interaction with the Spotify music API for playlist creation and new releases, and uses MongoDB for storing playlist data. It also provides functionality for two-way playlist conversion and music recommendation based on user listening profiles. The code incorporates key server-side operations, leveraging Express.js framework and EJS as the templating engine. |
| [converter.ejs]({file})       | The code constitutes the'converter' view in the MusicBridge application. It provides a user interface for playlist conversion between Apple Music and Spotify. Users input a playlist link and hit'Convert', triggering a loading display. If an error occurs during this process, an alert is shown. It includes reusable navigation bar and footer components for consistency across the application. Styling is achieved with Bootstrap and custom CSS, with Google Fonts for typography.                                |
| [footer.ejs]({file})          | The'footer.ejs' file in the'MusicBridge' application is responsible for rendering the website's footer. It includes functions such as a link for returning to the top of the page, encouraging users to share the website, and displaying the current year and website copyright details. It also incorporates scripts for Apple MusicKit, jQuery, Popper.js, and Bootstrap to aid functionalities like responsiveness and UI components.                                                                                   |
| [home.ejs]({file})            | The code constitutes the "home.ejs" view of the "MusicBridge" app and is dedicated to creating a homepage where users can log in via Spotify or Apple Music. The page includes a navigational bar, bootstrap carousel element, and a footer. The page loads stylesheets, Google Fonts, and scripts for Music Kit, jQuery, Popper.js, and Bootstrap. Interactivity includes event listeners for MusicKit and buttons that authorize user logins for Apple Music, then retrieve and submit the music user token.              |
| [home1.ejs]({file})           | The provided code represents a homepage for a web application named'Music Bridge'. The app primarily facilitates navigation between different pages, such as playlist conversion, finding or submitting playlists, and discovering new music recommendations. The page is designed responsively, incorporating Bootstrap stylesheets, Google Fonts, and Font Awesome icons. The'home1.ejs' file uses a navigation bar component and has a section describing the core features of the site.                                 |
| [landingPage.ejs]({file})     | The code presented is a'landingPage.ejs' webpage for the web application'MusicBridge'. The main features are logging in with both Apple and Spotify for data privacy and site accessibility. Its key functions include playlist conversion between Apple Music and Spotify, finding or submitting playlists, and accessing personalized music recommendations or new releases. Utilizing MusicKit, it provides the process for authorizing Apple Music users, retrieving the user token, and posting it on form submission. |
| [navBar.ejs]({file})          | The code provides the design for a Navigation Bar in the MusicBridge app. It includes links to the home page, Recommendation, New Music, Playlist, Playlist Converter and Playlist Submit pages. It supports the navbar's responsive behavior on small screens through a collapsible list of links visible after clicking the hamburger button.                                                                                                                                                                             |
| [newMusic.ejs]({file})        | The'newMusic.ejs' file is a part of the MusicBridge app which displays new music releases. It includes a navbar and a footer, has a responsive layout with a Bootstrap carousel component and supports switching between displaying songs from Spotify or Apple. Each displayed song includes a clickable image, name, and artist names. This is enabled by iterating through the'ssongs' and'asongs' arrays containing song information.                                                                                   |
| [playlist.ejs]({file})        | The code provided is for the'playlist' page of a music web application called'Music Bridge'. It utilizes embedded JavaScript (ejs) to dynamically generate the page, including playlists shared by users. Each playlist displays a playlist name, owner, and image that links to the playlist URL. The page also includes a navbar and a footer. Styling is achieved through Bootstrap and custom CSS, along with Google fonts.                                                                                             |
| [playlistSubmit.ejs]({file})  | The'playlistSubmit.ejs' file is a part of the MusicBridge application that houses the HTML structure for the Playlist Submission page. It includes forms for users to input a music playlist link, select a mood, and genre. Once details are filled, users can submit the form. The page includes Bootstrap and custom CSS for styling, Google Fonts for typography, and also includes elements like a navigation bar and footer from other files.                                                                         |
| [recommendations.ejs]({file}) | The'recommendations.ejs' file is a part of the'MusicBridge' web application. It is a view file that displays recommended music from Spotify and Apple Music to users. It contains two sets of music recommendations, each within their own div, toggled using a switch control. The music recommendations are looped over and displayed with song details including name, artist, and album cover. It also includes sections for a navigation bar and a footer.                                                             |

</details>

---

## 🚀 Getting Started

***Dependencies***

Please ensure you have the following dependencies installed on your system:

`- spotify-web-api-node`

`- passport-spotify`

### 🔧 Installation

1. Clone the MusicBridge repository:
```sh
git clone https://github.com/urochurro/MusicBridge
```

2. Change to the project directory:
```sh
cd MusicBridge
```

3. Install the dependencies:
```sh
npm install
```

### 🤖 Running MusicBridge

```sh
node app.js
```

---


## 📄 License


This project is protected under the [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) License. For more details, refer to the [LICENSE](LICENSE) file.


[**Return**](#Top)

---

