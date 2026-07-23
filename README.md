---

## ✨ Features

### Mobile App (Citizens)
-  Camera with pinch-to-zoom and tap-to-focus
-  Image picker from gallery
-  Submit violation reports with image, number plate, violation type, description and location
-  Interactive map with OpenStreetMap (no API key required)
-  Location search using Nominatim (free, no API key)
-  Nepal-restricted map with snap-back boundary logic
-  Push notifications via Expo + Firebase FCM
-  In-app notification center with unread badge
-  Personal dashboard with report stats and doughnut chart
-  Violation hotspot map with DBSCAN clustering
-  View, edit, and delete submitted reports
-  JWT authentication with persistent login via Redux Persist
-  Infinite scroll pagination on reports list
-  Pull to refresh

### Admin Dashboard (Authorities)
-  Dashboard with report statistics
-  Reports table with filtering by status, violation type and radius
-  Distance filter using Haversine algorithm (20km / 40km / 60km / All)
-  Violation hotspot map with Leaflet + MarkerClusterGroup
-  Flagged plates — vehicles reported 3+ times
-  Update report status (Pending / Approved / Rejected)
-  Export individual reports as PDF
-  Sort reports by date
-  Persistent login via localStorage + Redux

### Backend API
-  JWT authentication with bcrypt password hashing
-  Image upload via Multer
-  Push notifications via Expo Push API + Firebase
-  In-app notifications on status change
-  Duplicate plate detection with MongoDB aggregation
-  Nearby reports via Haversine distance filtering
-  Paginated reports endpoint

### OCR Service (Python)
-  Nepali number plate character recognition
-  TensorFlow CNN model trained on Kaggle dataset (34 character classes)
-  OpenCV image preprocessing and character segmentation
-  Flask REST API

---

## 🛠️ Tech Stack

### Mobile
| Technology | Purpose |
|---|---|
| Expo / React Native | Mobile framework |
| Expo Router | File-based navigation |
| Redux Toolkit + Redux Persist | State management + persistent login |
| React Native Maps + OpenStreetMap | Interactive maps |
| Expo Camera | Camera with zoom and focus |
| Expo Notifications + Firebase FCM | Push notifications |
| Nominatim API | Free location search |

### Admin Dashboard
| Technology | Purpose |
|---|---|
| React + Vite + TypeScript | Frontend framework |
| Redux Toolkit | State management |
| TanStack React Query | Server state and caching |
| React Leaflet + MarkerClusterGroup | Interactive hotspot map |
| Shadcn/ui + Tailwind CSS | UI components |
| React Router DOM | Client-side routing |
| @react-pdf/renderer | PDF report export |

### Backend
| Technology | Purpose |
|---|---|
| Express + TypeScript | REST API |
| MongoDB + Mongoose | Database |
| JWT + bcrypt-ts | Authentication |
| Multer | Image upload |
| Docker + Docker Compose | Containerization |

### OCR Service
| Technology | Purpose |
|---|---|
| Python + Flask | REST API |
| TensorFlow / Keras | CNN model |
| OpenCV | Image preprocessing |
| EasyOCR | Fallback OCR |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB
- Python 3.10+
- Expo CLI
- Docker (optional)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/traffic-violation-reporting.git
cd traffic-violation-reporting
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

**.env:**
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/traffic-violation
JWT_SECRET=your_secret_key
```

### 3. Admin Dashboard Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

**.env:**
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 4. Mobile App Setup
```bash
cd mobile
npm install
cp .env.example .env
npx expo start --clear
```

**.env:**
```env
API_BASE_URL=http://localhost:3000
```

### 5. OCR Service Setup
```bash
cd ocr-service
pip install tensorflow opencv-python flask easyocr numpy
python ocr_server.py
```


## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/signin` | Login user |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports` | Get user reports (paginated) |
| POST | `/api/reports` | Create report |
| GET | `/api/reports/flagged` | Get flagged plates |
| GET | `/api/reports/nearby` | Get nearby reports |
| GET | `/api/reports/:id` | Get single report |
| PUT | `/api/reports/:id` | Update report |
| PATCH | `/api/reports/:id/status` | Update report status |
| DELETE | `/api/reports/:id` | Delete report |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |

---

## Algorithms Used

| Algorithm | Purpose |
|---|---|
| **Haversine Formula** | Calculate distance between two GPS coordinates |
| **DBSCAN Clustering** | Group nearby violations into hotspot clusters |
| **Priority Scoring** | Rank reports by severity and recency for admin review |
| **MongoDB Aggregation** | Detect duplicate plate reports |

---


---

## 👤 Author

**Binit Maharjan**
- GitHub: [@88bones](https://github.com/88bones)

---

## 📄 License

This project is licensed under the MIT License.
