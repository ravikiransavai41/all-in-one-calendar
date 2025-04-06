

## How can I edit this code?

There are several ways of editing your application.

Changes made via Pooras will be committed automatically to this repo.

**Use your preferred IDE**

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?
Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

A modern calendar application that integrates with Microsoft Teams and Outlook, featuring multiple calendar views and Microsoft authentication.

## Features

- Integration with Microsoft Teams and Outlook
- Multiple calendar views (Day, Week, Month, Agenda)
- Microsoft authentication
- Rate limiting handling with exponential backoff
- Fallback to mock events when needed

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- Docker (optional)
- Kubernetes cluster (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/horizon-calendar.git
cd horizon-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_MS_CLIENT_ID=your-client-id
VITE_MS_TENANT_ID=your-tenant-id
VITE_MS_REDIRECT_URI=http://localhost:5173/auth/callback
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Docker

1. Build the Docker image:
```bash
docker build -t horizon-calendar .
```

2. Run the container:
```bash
docker run -p 8080:80 horizon-calendar
```

### Docker Compose

1. Start the application:
```bash
docker-compose up -d
```

2. Access the application at `http://localhost:8080`

### Kubernetes

1. Create a namespace:
```bash
kubectl create namespace horizon-calendar
```

2. Create secrets (replace values with your actual base64 encoded secrets):
```bash
kubectl apply -f k8s/secrets.yaml
```

3. Deploy the application:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

4. Verify the deployment:
```bash
kubectl get pods -n horizon-calendar
kubectl get services -n horizon-calendar
kubectl get ingress -n horizon-calendar
```

## Accessing Organization-Wide Events

To access organization-wide events, follow these steps:

1. Register your application in the Azure Portal with the following permissions:
   - Calendars.Read.Shared
   - Calendars.ReadWrite.Shared
   - User.Read.All

2. Request admin consent for these permissions in the Azure Portal.

3. Update the application code to fetch events from all users:
   - Modify the `fetchMsCalendarEvents` function in `src/utils/msGraphUtils.ts`
   - Add a user selection interface in the UI
   - Implement proper error handling for permission issues

## Rate Limiting

The application implements an exponential backoff strategy for handling API request limits:

- Initial retry delay: 1 second
- Maximum retry delay: 30 seconds
- Maximum retries: 5
- Jitter factor: 0.1

After 3 retry attempts, the application will fall back to displaying mock events to ensure a smooth user experience.

## License

This project is licensed under the MIT License.
