import WatchRoom from '@/components/watch-room';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JoinRoomForm } from '@/components/join-room-form';

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
  const isAdmin = searchParams.admin === 'true';
  const adminName = searchParams.adminName as string;

  if (!videoUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-destructive">
                    <AlertTriangle />
                    Video URL Missing
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">A video URL is required to start a watch party.</p>
                <Button asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Create a New Room
                </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  // If the user is not the admin and hasn't provided a username, show the join form.
  if (!isAdmin && !username) {
    return <JoinRoomForm roomId={roomId} videoUrl={videoUrl} adminName={adminName} />;
  }

  return <WatchRoom roomId={roomId} initialVideoUrl={videoUrl} initialUsername={username} isAdmin={isAdmin} adminUsername={adminName || (isAdmin ? username : undefined)} />;
}
