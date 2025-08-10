import WatchRoom from '@/components/watch-room';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Watch Room | SynchWatch',
};

type WatchPageProps = {
  params: { roomId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function WatchPage({ params, searchParams }: WatchPageProps) {
  const { roomId } = params;
  const videoUrl = searchParams.videoUrl as string;
  const username = searchParams.username as string;

  if (!videoUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center p-4">
        <h2 className="text-2xl font-bold text-destructive mb-4">Video URL Missing</h2>
        <p className="text-muted-foreground mb-6">A video URL is required to start a watch party.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create a New Room
          </Link>
        </Button>
      </div>
    );
  }

  return <WatchRoom roomId={roomId} initialVideoUrl={videoUrl} initialUsername={username} />;
}
