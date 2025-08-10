import { CreateRoomForm } from '@/components/create-room-form';
import { Film } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <Film />
          <h1>SynchWatch</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
              Watch videos together.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Create a private room, share the link, and enjoy any video in perfect sync with your friends.
            </p>
        </div>
        <CreateRoomForm />
      </main>
    </div>
  );
}
