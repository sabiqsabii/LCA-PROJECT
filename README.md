# LCA-PROJECT
EcoLCA — Life Cycle Assessment Calculation System
--------------------------------------------------
A modern, responsive frontend for a college Life Cycle Assessment (LCA) project.

  FEAUTURES
 ___________
- Dashboard with assessment statistics
- New LCA assessment form
- Material, manufacturing, transportation, use and end-of-life stages
- Illustrative CO₂e calculation engine
- Eco score
- Interactive Chart.js visualizations
- Assessment history using browser localStorage
- Search and delete assessments
- Detailed result page
- Sustainability suggestions
- Print-friendly report
- Light/dark theme
- Responsive mobile layout
- No backend required

PROJECT STRUCTURE
_________________
LCA-Life-Cycle-Assessment/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/

HOW TO RUN
__________
Option 1 — Open directly
Open index.html in a browser.
Option 2 — VS Code Live Server
- Open this folder in VS Code.
- Install the Live Server extension.
- Right-click index.html.
- Select Open with Live Server.

CALCULATION MODEL 
_________________
The demo estimates:
Total CO₂e =
Material impact
+ Manufacturing energy impact
+ Transportation impact
+ Use-phase electricity impact
+ End-of-life impact
The emission factors in js/script.js are illustrative educational factors, not a certified LCA database.
For an academic/real LCA implementation, document:
- emission-factor source and version
- geography
- functional unit
- system boundary
- allocation method
- data quality assumptions
- uncertainty
- units and conversions

SUGGESTED GITHUB  DESCRIPTION
____________________________
EcoLCA is a responsive web-based Life Cycle Assessment system that estimates environmental impact across material, manufacturing, transportation, use and end-of-life stages. Built with HTML, CSS and JavaScript.

 FUTURE  BACKEND  VERSION
________________________
A full-stack version can add:
- PHP/Flask/Node.js API
- MySQL/SQLite database
- user authentication
- admin factor database
- downloadable PDF reports
- verified LCA datasets
- multi-user projects
- comparison of products
- uncertainty analysis
+
