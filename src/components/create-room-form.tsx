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
import { generateRandomId } from "@/lib/utils";
import { Video, User } from "lucide-react";

const formSchema = z.object({
  videoUrl: z.string().url({ message: "Please enter a valid video URL." }),
  username: z.string().optional(),
});

export function CreateRoomForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const roomId = generateRandomId();
    const params = new URLSearchParams();
    params.set("videoUrl", values.videoUrl);
    if (values.username) {
      params.set("username", values.username);
    }
    router.push(`/watch/${roomId}?${params.toString()}`);
  }

  return (
    <Card className="mt-8 w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-headline">Create a Room</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="https://example.com/video.mp4" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname (Optional)</FormLabel>
                   <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Enter your nickname" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">
              Create Room
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
