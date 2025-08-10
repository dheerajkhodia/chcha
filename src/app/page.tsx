import { CreateRoomForm } from '@/components/create-room-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center">
            <h1 className="text-5xl font-bold text-primary font-headline">
              SynchWatch
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Watch videos together. In real time.
            </p>
        </div>

        <CreateRoomForm />
      </div>
    </main>
  );
}
