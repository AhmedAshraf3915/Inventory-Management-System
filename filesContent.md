inventory-management-system/
│
├── index.html                → Sign In page
├── dashboard.html            → Dashboard
├── products.html             → Products management
├── categories.html           → Categories management
├── suppliers.html            → Suppliers management
├── orders.html               → Purchase Orders
├── reports.html              → Reports & insights
│
├── css/
│   ├── bootstrap.min.css     → Bootstrap (optional local copy)
│   └── style.css             → Custom styles
│
├── js/
│   ├── auth.js               → Login, logout, route protection
│   ├── api.js                → Generic API helper functions
│   ├── utils.js              → Validation & reusable helpers
│   │
│   ├── dashboard.js          → Dashboard logic
│   ├── products.js           → Products CRUD logic
│   ├── categories.js         → Categories CRUD logic
│   ├── suppliers.js          → Suppliers CRUD logic
│   ├── orders.js             → Purchase orders logic
│   └── reports.js            → Reports calculations & rendering
│
│
├── data/
│   └── db.json               → Fake database for json-server
│
├── package.json              → npm configuration (json-server)
└── README.md                 → Project documentation
 