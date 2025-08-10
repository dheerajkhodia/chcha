"use client";

import { useState } from 'react';
import { generateContentRecommendations } from '@/ai/flows/content-recommendation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Wand2 } from 'lucide-react';

type ContentRecommendationProps = {
  currentVideoTitle: string;
};

export default function ContentRecommendation({ currentVideoTitle }: ContentRecommendationProps) {
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setRecommendations([]);
    try {
      const result = await generateContentRecommendations({
        viewingHistory: [currentVideoTitle],
        userPreferences: preferences,
      });
      if (result.recommendations && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
      } else {
        toast({
            title: "No recommendations found",
            description: "The AI couldn't find any recommendations. Try different preferences.",
        });
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch recommendations. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enjoyed this? Tell us what you like and we'll suggest something new.
      </p>
      <Textarea
        placeholder="e.g., 'sci-fi movies from the 90s', 'comedy series', 'documentaries about nature'"
        value={preferences}
        onChange={(e) => setPreferences(e.target.value)}
        className="min-h-[60px]"
      />
      <Button onClick={handleGetRecommendations} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
        {isLoading ? (
          <Wand2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generate Suggestions
      </Button>

      {recommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Here are some ideas:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
