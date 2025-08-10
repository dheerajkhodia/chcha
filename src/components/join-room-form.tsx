"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, PartyPopper, Film } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(2, { message: "Nickname must be at least 2 characters." }).optional().or(z.literal("")),
});

type JoinRoomFormProps = {
    roomId: string;
    videoUrl: string;
}

export function JoinRoomForm({ roomId, videoUrl }: JoinRoomFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams();
    params.set("videoUrl", videoUrl);
    if (values.username) {
      params.set("username", values.username);
    }
    router.push(`/watch/${roomId}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <Film />
            <h1>SynchWatch</h1>
            </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Join Watch Party</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Choose Your Nickname</FormLabel>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <FormControl>
                                <Input placeholder="Enter your nickname (optional)" {...field} className="pl-10" />
                                </FormControl>
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">
                        <PartyPopper className="mr-2"/>
                        Join Room
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
