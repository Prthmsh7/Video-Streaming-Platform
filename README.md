# Video-Streaming-Platform
This is a video streaming platform component for another project.

## Deployment on Vercel

To deploy this project on Vercel, you need to configure the following Environment Variables in your Vercel project settings:

| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your Firebase Measurement ID (Optional) |

### Troubleshooting "Missing App configuration value: projectId"

If you see this error, it means the environment variables above are not correctly set in Vercel. Make sure they are prefixed with `VITE_` as specified.
