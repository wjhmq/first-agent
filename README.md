# DeepSeek Chat Application

A modern, real-time chat application built with Next.js, React, and DeepSeek AI. This application provides a clean, responsive interface for chatting with DeepSeek's AI models using Server-Sent Events (SSE) for streaming responses.

## Features

- **Real-time Streaming**: Messages are streamed in real-time using SSE for a smooth chat experience
- **Modern UI**: Clean, responsive design with dark mode support using Tailwind CSS
- **Type-Safe**: Built with TypeScript for enhanced development experience
- **Edge Runtime**: Optimized API routes using Next.js Edge Runtime for better performance
- **Extensible Architecture**: Easy to add new routes, pages, and features

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Provider**: [DeepSeek API](https://platform.deepseek.com/)

## Project Structure

```
first-agent/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint with SSE support
│   ├── globals.css               # Global styles with Tailwind directives
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main chat interface
├── .env.local                    # Environment variables (not in git)
├── .env.example                  # Environment variables template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies and scripts
```

## Architecture Overview

### Frontend (app/page.tsx)
- **Component Type**: Client-side React component
- **State Management**: Uses React hooks (`useState`, `useRef`, `useEffect`)
- **Key Features**:
  - Message history management
  - Real-time message updates via SSE
  - Auto-scroll to latest message
  - Loading states and error handling
  - Responsive design for mobile and desktop

### API Layer (app/api/chat/route.ts)
- **Runtime**: Edge Runtime for optimal performance
- **Protocol**: Server-Sent Events (SSE) for streaming
- **Flow**:
  1. Receives user message via POST request
  2. Validates API key from environment variables
  3. Forwards request to DeepSeek API with streaming enabled
  4. Parses streaming response chunks
  5. Reformats and streams data back to client in SSE format

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Responsive**: Mobile-first design with responsive breakpoints

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- DeepSeek API key (get one at [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys))

### Installation

1. **Clone the repository** (or you're already here!)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your DeepSeek API key:
   ```env
   DEEPSEEK_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

You should see the chat interface. Type a message and press Send to start chatting with DeepSeek AI!

## Available Scripts

- `npm run dev` - Start the development server on port 3000
- `npm run build` - Build the application for production
- `npm start` - Start the production server (requires build first)
- `npm run lint` - Run ESLint to check code quality

## How It Works

### Message Flow

1. **User Input**: User types a message and clicks Send
2. **Client Request**: Frontend sends POST request to `/api/chat`
3. **API Processing**: API route receives message and forwards to DeepSeek
4. **Streaming Response**: DeepSeek streams response chunks back
5. **SSE Parsing**: API route parses chunks and formats as SSE events
6. **Client Update**: Frontend receives SSE events and updates UI in real-time
7. **Display**: User sees the response appear character by character

### SSE (Server-Sent Events) Implementation

The application uses SSE for efficient, one-way streaming from server to client:

**Server Side** (`app/api/chat/route.ts`):
```typescript
// Creates a ReadableStream that:
// 1. Reads chunks from DeepSeek API
// 2. Parses JSON responses
// 3. Extracts content deltas
// 4. Formats as SSE events: "data: {content}\n\n"
// 5. Sends to client
```

**Client Side** (`app/page.tsx`):
```typescript
// Reads the stream using:
// 1. response.body.getReader()
// 2. TextDecoder to convert bytes to text
// 3. Parses "data: " prefixed lines
// 4. Updates React state with new content
```

## Extending the Application

### Adding New Pages

Create a new file in the `app/` directory:

```typescript
// app/about/page.tsx
export default function About() {
  return <div>About Page</div>;
}
```

Access at: `http://localhost:3000/about`

### Adding New API Routes

Create a new route handler:

```typescript
// app/api/custom/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return Response.json({ message: 'Hello' });
}
```

Access at: `http://localhost:3000/api/custom`

### Customizing the UI

Edit `app/page.tsx` to modify the chat interface or `app/globals.css` for global styles.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key | Yes |

## Troubleshooting

### "API key not configured" error
- Make sure `.env.local` exists and contains your API key
- Restart the development server after adding environment variables

### Messages not streaming
- Check browser console for errors
- Verify your API key is valid
- Check network tab to see if SSE connection is established

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18.x or higher
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`

## API Reference

### POST /api/chat

Send a message to the DeepSeek AI model.

**Request Body**:
```json
{
  "message": "Your question here"
}
```

**Response**: Server-Sent Events stream

**SSE Event Format**:
```
data: {"content": "chunk of text"}

data: {"content": "another chunk"}

data: [DONE]
```

## Performance Considerations

- **Edge Runtime**: API routes use Edge Runtime for low latency
- **Streaming**: SSE provides immediate feedback without waiting for full response
- **Client-side Rendering**: Main page is client-side for interactive features
- **Code Splitting**: Next.js automatically splits code for optimal loading

## Security Notes

- API keys are stored in environment variables (never committed to git)
- `.env.local` is excluded from version control via `.gitignore`
- API routes validate requests before forwarding to DeepSeek
- Edge Runtime provides additional security isolation

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available for educational purposes.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)

## Support

For issues related to:
- **This application**: Open an issue in this repository
- **DeepSeek API**: Contact DeepSeek support
- **Next.js**: Check the [Next.js documentation](https://nextjs.org/docs)
