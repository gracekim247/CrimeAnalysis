# CRIMECAST

An application that predicts a user's risk level (Low, Medium, High) of becoming a victim of crime in New York City based on their location and demographics (age, sex, ethnicity).


## Features

- Train a Decision Tree and Random Forest model using historical crime data
- **Risk Assessment**: Collects age, sex, race, borough, time of day, and latitude/longitude and predicts your crime risk based on collected information.
   - Risk classified into Low, Medium, or High
- **Bonus**: Dynamic heatmap showing crime incident locations filtered by user borough

## Programming Enviornment

- **Backend**  
  - Java 
  - SparkJava

- **Random Forest**
   - SMILE library

- **Frontend**  
  - Node.js + static server  
  - Leaflet/OpenStreetMap map  
  - HTML/CSS/JS

## Prerequisites/Installations

- **Java JDK 11+**  
- **Apache Maven**  
- **Node.js & npm**


## Getting Started 

Follow these steps to run CRIMECAST locally.

### 1. Run backend API
1. Open a terminal and navigate to project root
   ```bash
   cd CrimeAnalysis
2. Compile Java code:
   ```bash
   mvn clean compile
3. Start RiskApi server:
   ```bash
   mvn exec:java -Dexec.mainClass="com.crimeAnalysis.api.RiskApi" 
4. You should see
   ```nginx
   RiskApi listening on port 8080

### 2. Run frontend server
1. Open a new terminal tab, then from project root run:
   ```bash 
   cd crimecast-app 
   node server.js 
2. You should see 
   ```csharp 
   Proxy + static file server listening on http://localhost:3000

### Open CRIMECAST
- In your browser, go to:
   ```arduino
   http://localhost:3000
- Enjoy!!


## Contributors
- Grace Kim
- Jessica Wong
- Daniel Kim

