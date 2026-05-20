# SLA Breach Monitoring & Analysis Dashboard

A comprehensive React-based dashboard for monitoring, analyzing, and managing Service Level Agreement (SLA) performance with AI-powered insights and reporting capabilities.

## Features

- Data Source Management: Upload and process CSV/Excel files for analysis
- AI-Powered Self Monitoring: Interactive chatbot for SLA monitoring and insights
- BI Reports: Comprehensive business intelligence reports with multiple views
- Knowledge Base (KEDB): Search and find solutions to similar incidents
- Incident Management: Track and manage incidents effectively
- SLA Monitoring: Real-time SLA resolution and response time tracking
- Resource Effectiveness: Monitor consultant performance and resource utilization
- Interactive Charts: Visualize data with Chart.js and Plotly charts

## Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher) or yarn
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Setup

1. Navigate to the project directory:
   ```bash
   cd sla-breach
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API endpoint (optional):
   
   The default API endpoint is configured in `src/const.js`:
   ```javascript
   export const baseURL='http://54.169.213.200:3005/api'
   ```
   
   If you need to change the backend API URL, edit this file.

## Start the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser:
   
   The application will automatically open at http://localhost:3000
   
   If it doesn't open automatically, navigate to the URL manually.

3. The application is now running. You should see the dashboard with navigation options in the sidebar.

## Functionality

### 1. Data Source (`/data-source`)

Purpose: Upload your data files to begin analysis

Features:
- Drag and drop file upload
- Support for CSV, Excel (.xlsx, .xls) files
- Automatic file compression for large files
- File processing status indicators

Usage:
1. Navigate to Data Source page
2. Drag and drop your CSV/Excel file or click to browse
3. Wait for file processing to complete
4. Once processed, you can access other features

### 2. Self Monitoring (`/self-monitoring`)

Purpose: Monitor SLA performance with AI assistance

Features:
- Interactive AI chatbot
- Real-time SLA data analysis
- Visual charts and reports
- Floating chat assistant

Usage:
1. Ensure you've uploaded data in Data Source
2. Navigate to Self Monitoring
3. View your SLA metrics and charts
4. Use the floating chat bot to ask questions about your data

### 3. BI Reports (`/bi-report`)

Purpose: Comprehensive business intelligence reporting

Features:
- Multiple report views: Tickets SLAs Table, Tickets SLAs Chart, Consultant Wise reports, Suspended Statistics, Ticket Details, Open Tickets, Aging L2 reports, SLA Monitor
- Tab-based navigation
- Interactive data visualization

Usage:
1. Navigate to BI Report
2. Select a report tab from the top navigation
3. View and analyze the data in the selected report

### 4. Knowledge Base - KEDB (`/kedb`)

Purpose: Search for solutions to similar incidents

Features:
- AI-powered knowledge base search
- Natural language queries
- Historical incident matching
- Solution recommendations

Usage:
1. Navigate to KEDB
2. Type your question or describe the issue
3. Get relevant solutions from historical data

### 5. Incident Management (`/incident-management`)

Purpose: Manage and track incidents

Features:
- Incident tracking
- Status monitoring
- Assignment management

### 6. SLA Resolution & Response Time (`/sla-resolution-response-time`)

Purpose: Monitor SLA compliance metrics

Features:
- Response time tracking
- Resolution time analysis
- SLA breach monitoring

### 7. Resource Effectiveness (`/resource-incidents-resolved`)

Purpose: Track consultant performance

Features:
- Consultant-wise incident resolution
- Performance metrics
- Resource utilization analysis

## Project Structure

```
sla-breach/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── ChatBot/    # AI chatbot component
│   │   ├── Card/       # Card components
│   │   ├── Navbar/     # Navigation bar
│   │   └── Sidebar/    # Sidebar navigation
│   ├── pages/          # Page components
│   │   ├── data-source/        # Data upload page
│   │   ├── self-monitoring/    # Self monitoring page
│   │   ├── bi-report/          # BI reports page
│   │   ├── kedb/               # Knowledge base page
│   │   ├── incident-management/# Incident management page
│   │   └── sla-combined/      # SLA monitoring page
│   ├── utils/          # Utility functions
│   ├── layout/         # Layout components
│   ├── App.js          # Main app component with routing
│   └── index.js        # Entry point
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Available Scripts

- `npm start`: Starts the development server on port 3000
- `npm test`: Launches the test runner
- `npm run build`: Creates a production build in the `build` folder
- `npm run eject`: Ejects from Create React App (one-way operation)

## Technologies Used

- React 18 - UI library
- React Router - Navigation and routing
- Ant Design - UI component library
- Material-UI - Additional UI components
- Chart.js - Chart visualization
- Plotly.js - Advanced interactive charts
- React Query - Data fetching and caching
- Axios - HTTP client
- Tailwind CSS - Utility-first CSS framework
- SASS - CSS preprocessor

## Backend API

The application connects to a backend API for data processing and AI services. The default endpoint is configured in `src/const.js`.

Note: Ensure the backend API is running and accessible for full functionality.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port 3000 already in use
If port 3000 is already in use, the app will prompt you to use a different port. Press `Y` to confirm.

### API connection errors
- Verify the backend API is running
- Check the API URL in `src/const.js`
- Ensure CORS is properly configured on the backend

### File upload issues
- Ensure file format is CSV or Excel (.xlsx, .xls)
- Check file size (very large files may take time to process)
- Verify backend API is accessible

## Deployment on GCP

This section covers deploying the application on Google Cloud Platform (GCP) with nginx, SSL certificates, and PM2.

### Prerequisites

- GCP VM instance (Ubuntu recommended)
- Domain name pointing to your GCP instance IP
- SSH access to the GCP instance
- Node.js and npm installed on the server

### Step 1: Clone the Project

```bash
git clone <your-repository-url>
cd sla-breach
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Production Version

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Step 4: Install and Setup PM2

1. Install PM2 and serve globally:
   ```bash
   npm install -g pm2 serve
   ```

2. Create a PM2 ecosystem file (optional) or start the app directly:
   ```bash
   pm2 serve build 3000 --spa --name sla-breach
   ```

   Or create a `ecosystem.config.js` file:
   ```javascript
   module.exports = {
     apps: [{
       name: 'sla-breach',
       script: 'serve',
       args: '-s build -l 3000',
       env: {
         NODE_ENV: 'production'
       }
     }]
   }
   ```

   Then start with:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. Save PM2 configuration:
   ```bash
   pm2 save
   pm2 startup
   ```

### Step 5: Install and Configure Nginx

1. Install nginx:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. Create nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/sla-breach
   ```

3. Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Replace `your-domain.com` with your actual domain name.

4. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sla-breach /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 6: Setup SSL with Certbot

1. Install certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

   Follow the prompts to complete the SSL setup.

3. Certbot will automatically update your nginx configuration to use HTTPS.

4. Test automatic renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

### Step 7: Verify Deployment

1. Check PM2 status:
   ```bash
   pm2 status
   ```

2. Check nginx status:
   ```bash
   sudo systemctl status nginx
   ```

3. Visit your domain in a browser to verify the application is accessible via HTTPS.

### Useful Commands

- **PM2 Commands:**
  - `pm2 list` - List all processes
  - `pm2 logs sla-breach` - View logs
  - `pm2 restart sla-breach` - Restart the app
  - `pm2 stop sla-breach` - Stop the app
  - `pm2 delete sla-breach` - Delete the app from PM2

- **Nginx Commands:**
  - `sudo systemctl restart nginx` - Restart nginx
  - `sudo systemctl status nginx` - Check nginx status
  - `sudo nginx -t` - Test nginx configuration

- **SSL Renewal:**
  - Certbot automatically renews certificates. Manual renewal: `sudo certbot renew`

## License

This project is private and proprietary.
