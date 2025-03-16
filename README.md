# Compute UI

A modern web application for GPU compute management and AI model deployment.

## Technologies Used
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Supabase for Authentication
- Radix UI Components

## Getting Started

First, install dependencies:
```bash
pnpm install
```

Then, run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

This project is configured for deployment on Netlify.

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/contexts` - React Context providers
- `/types` - TypeScript type definitions
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
