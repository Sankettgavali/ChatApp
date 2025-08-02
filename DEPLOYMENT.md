# Deploying ChatApp to Render

## Prerequisites

1. A MongoDB database (you can use MongoDB Atlas for free)
2. A Render account (free tier available)

## Step 1: Set up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/chat-app?retryWrites=true&w=majority`)

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and deploy your app

### Option B: Manual Deployment

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `quick-chat-app` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 3: Environment Variables

✅ **MongoDB is already configured!** Your connection string is set in `render.yaml`.

If you're using manual deployment, in your Render dashboard, go to your service → Environment → Environment Variables and add:

- `NODE_ENV`: `production`
- `MONGODB_URI`: `mongodb+srv://sankettgavali:sanket123@cluster0.isr8wl1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
- `PORT`: `10000` (Render will override this automatically)

## Step 4: Update CORS Settings

After deployment, update the CORS origin in `server.js`:

Replace `"https://your-app-name.onrender.com"` with your actual Render URL.

## Step 5: Test Your Deployment

1. Wait for the build to complete
2. Visit your Render URL
3. Test the chat functionality

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **MongoDB connection fails**: Verify your connection string and network access
3. **CORS errors**: Update the CORS origin to match your Render URL
4. **Socket.io issues**: Make sure the client is connecting to the correct server URL

### Logs

Check the logs in your Render dashboard for any errors during build or runtime.

## Notes

- The free tier of Render will spin down after 15 minutes of inactivity
- Your app will automatically wake up when accessed
- Consider upgrading to a paid plan for production use 