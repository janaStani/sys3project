## Information System: Car Care

### Project Overview
CarCare is a vehicle maintenance management platform designed to help car owners stay in control of their vehicle's condition. The system addresses all aspects of personal vehicle upkeep with scheduled services and estimating repair costs, rating mechanics and discovering  vehicles specefications, offering interface built for everyday drivers.

### Purpose and Goals
CarCare aims to replace the guesswork and forgotten service intervals of car ownership with a smart, organized digital dashboard. By providing automated maintenance schedules, cost estimates, and a service calendar, it empowers users to proactively care for their vehicles. The platform also surfaces nearby mechanics and a community-driven rating system, making it easier to find trusted service providers

### Key Features
- **Accounts** — Register and log in to a personal account; each user's garage, schedule, history, and reviews are private and tied to their login.
- **My Garage** — Add and manage multiple vehicles, each with a full maintenance checklist (engine oil, cabin air filter, brakes, and more), health scores, service statuses, and cost estimates.
- **Service Calendar** — A monthly calendar view of all upcoming and scheduled maintenance events across every vehicle in your garage. Tap a scheduled service to find nearby mechanics based on your location.
- **Car Browser** — Browse a catalogue of supported makes and models (BMW, Audi, Mercedes, Volkswagen, Toyota, Ford, and more), filterable by brand, with photos, year, and body type.
- **Rate a Mechanic** — Search for mechanics or garages by name, leave star ratings, specify the type of job performed, and write detailed reviews to help the community. Each user can review a given mechanic once.
- **History** — A log of completed maintenance across all your vehicles. When a service is marked as done in My Garage, it's automatically recorded here with its date, mileage, mechanic, cost, and notes — and entries can be filtered, expanded for detail, or deleted.

### Technologies Used
CarCare is built with a clear separation between frontend and backend. The frontend is developed in **React**, delivering a fast, responsive single-page experience on desktop. The backend is a **Node.js** and **Express** REST API that manages vehicle data, maintenance schedules, service history, and mechanic reviews. Data is stored in a **MySQL** database on the deployed server, while **SQLite** is used locally as a development convenience on an identical schema. Authentication is handled with session-based login (express-session), JWT tokens, and bcrypt password hashing. The app also integrates the OpenStreetMap **Overpass** and **Nominatim** APIs to locate nearby mechanics and convert a user's zipcode into map coordinates.

### Impact
By implementing CarCare, vehicle owners gain a centralized hub for all their car maintenance needs, reducing the risk of missed services, unexpected breakdowns, and costly repairs. The mechanic rating system builds community trust, while the structured maintenance schedules and cost previews help users budget and plan ahead with confidence.