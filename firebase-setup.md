# Firebase setup

1. Open Firebase Console and create/select the project.
2. Go to Firestore Database and create a database in production mode.
3. Go to Project settings > Service accounts.
4. Click Generate new private key.
5. In Vercel > Project > Settings > Environment Variables, add:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=client_email from the JSON file
FIREBASE_PRIVATE_KEY=private_key from the JSON file
ADMIN_TOKEN=wedding
```

Keep the full private key, including `-----BEGIN PRIVATE KEY-----` and
`-----END PRIVATE KEY-----`. Vercel can store it as a multiline value.

After saving the variables, redeploy the Vercel project.
