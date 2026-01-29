# Quick Setup Guide

Follow these steps to get your DeepSeek Chat application up and running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure API Key

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your DeepSeek API key:
   - Visit: https://platform.deepseek.com/api_keys
   - Sign up or log in
   - Create a new API key

3. Edit `.env.local` and replace `your_api_key_here` with your actual API key:
   ```env
   DEEPSEEK_API_KEY=sk-your-actual-api-key-here
   ```

## Step 3: Run the Development Server

```bash
npm run dev
```

The application will start at http://localhost:3000

## Step 4: Test the Application

1. Open your browser and go to http://localhost:3000
2. You should see the chat interface
3. Type a message in the input box
4. Click "Send" or press Enter
5. Watch the AI response stream in real-time

## Troubleshooting

### Port 3000 is already in use

If port 3000 is occupied, you can specify a different port:

```bash
PORT=3001 npm run dev
```

### API Key Error

If you see "API key not configured":
1. Verify `.env.local` exists in the project root
2. Check that the API key is correctly set
3. Restart the development server

### Build Issues

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Production Deployment

To build for production:

```bash
npm run build
npm start
```

The production server will run on http://localhost:3000

## Next Steps

- Read the main [README.md](README.md) for detailed documentation
- Explore the code in `app/` directory
- Customize the UI in `app/page.tsx`
- Add new features or API routes
