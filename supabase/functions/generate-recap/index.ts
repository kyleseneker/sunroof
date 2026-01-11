// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

/* eslint-disable no-console */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MemoryWeather {
  condition: string;
  temp?: number;
  icon?: string;
}

interface Memory {
  type: 'photo' | 'audio' | 'text';
  note?: string;
  created_at: string;
  location_name?: string;
  weather?: MemoryWeather;
}

interface RecapRequest {
  journeyId: string;
  journeyName: string;
  journeyCreatedAt: string;
  journeyUnlockDate: string;
  memories: Memory[];
}

function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 14) return '1 week';
  if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks`;
  return `${Math.round(diffDays / 30)} month${Math.round(diffDays / 30) > 1 ? 's' : ''}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('[generate-recap] Starting recap generation...');

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('[generate-recap] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI features not configured', recap: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as RecapRequest;
    const { journeyName, journeyCreatedAt, journeyUnlockDate, memories } = body;
    
    console.log('[generate-recap] Request received:', {
      journeyName,
      journeyCreatedAt,
      journeyUnlockDate,
      memoryCount: memories?.length || 0,
    });

    if (!memories || memories.length === 0) {
      console.log('[generate-recap] No memories found, returning default message');
      return new Response(
        JSON.stringify({ 
          recap: "This journey doesn't have any memories captured yet. Every adventure starts somewhere!",
          highlights: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare context for AI
    const journeyDuration = calculateDuration(journeyCreatedAt, journeyUnlockDate);
    const photoCount = memories.filter((m) => m.type === 'photo').length;
    const audioCount = memories.filter((m) => m.type === 'audio').length;
    const noteCount = memories.filter((m) => m.type === 'text').length;
    
    // Summarize weather across the journey
    const weatherConditions: Record<string, number> = {};
    const temps: number[] = [];
    memories.forEach((m) => {
      if (m.weather?.condition) {
        weatherConditions[m.weather.condition] = (weatherConditions[m.weather.condition] || 0) + 1;
      }
      if (m.weather?.temp !== undefined) {
        temps.push(m.weather.temp);
      }
    });
    
    const sortedConditions = Object.entries(weatherConditions).sort((a, b) => b[1] - a[1]);
    const primaryCondition = sortedConditions[0]?.[0];
    const minTemp = temps.length > 0 ? Math.min(...temps) : null;
    const maxTemp = temps.length > 0 ? Math.max(...temps) : null;
    
    let weatherSummary = '';
    if (primaryCondition) {
      weatherSummary = `Weather: Mostly ${primaryCondition.toLowerCase()}`;
      if (minTemp !== null && maxTemp !== null) {
        weatherSummary += minTemp === maxTemp 
          ? ` at ${minTemp}°F`
          : `, temperatures ranging from ${minTemp}°F to ${maxTemp}°F`;
      }
      if (sortedConditions.length > 1) {
        const otherConditions = sortedConditions.slice(1, 3).map(([c]) => c.toLowerCase()).join(', ');
        weatherSummary += `. Also experienced: ${otherConditions}`;
      }
    }
    
    const notes = memories
      .filter((m) => m.type === 'text' && m.note)
      .map((m) => ({
        text: m.note,
        date: new Date(m.created_at).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }),
        location: m.location_name,
        weather: m.weather ? `${m.weather.icon || ''} ${m.weather.temp}°`.trim() : null
      }));

    console.log('[generate-recap] Context prepared:', {
      photoCount,
      audioCount,
      noteCount,
      notesWithContent: notes.length,
      weatherConditions: Object.keys(weatherConditions).length,
      tempRange: temps.length > 0 ? `${minTemp}° - ${maxTemp}°` : 'none',
      weatherSummary: weatherSummary || 'none',
    });

    // Create prompt for OpenAI
    const prompt = `You are a warm, thoughtful travel companion helping someone relive their journey memories. 

Journey Details:
- Destination: ${journeyName}
- Duration: ${journeyDuration}
- Photos captured: ${photoCount}
- Audio recordings: ${audioCount}
- Notes written: ${noteCount}
${weatherSummary ? `- ${weatherSummary}` : ''}

${notes.length > 0 ? `Notes from the journey:
${notes.map((n) => `[${n.date}${n.location ? ` at ${n.location}` : ''}${n.weather ? ` ${n.weather}` : ''}] "${n.text}"`).join('\n')}` : 'No written notes were captured.'}

Write a warm, personal recap of this journey (2-3 paragraphs). Be evocative and help them feel the memories again. Don't be generic - reference specific details from their notes if available. Naturally weave in weather details where they enhance the narrative (e.g., "under sunny skies" or "despite the rain"). Keep it under 200 words.

Also identify 1-3 "highlight" moments from the notes that seem most meaningful or memorable. Return these as a simple list.

Respond in JSON format:
{
  "recap": "Your narrative recap here...",
  "highlights": ["Highlight 1", "Highlight 2"]
}`;

    // Call OpenAI API
    console.log('[generate-recap] Calling OpenAI API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a warm, thoughtful travel memory assistant. Always respond in valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('[generate-recap] OpenAI API error:', openaiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable', recap: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-recap] OpenAI response received, status:', openaiResponse.status);
    
    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    console.log('[generate-recap] OpenAI content length:', content?.length || 0);

    if (!content) {
      console.error('[generate-recap] No content in OpenAI response:', JSON.stringify(openaiData));
      return new Response(
        JSON.stringify({ error: 'Failed to generate recap', recap: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    try {
      const parsed = JSON.parse(content);
      console.log('[generate-recap] Successfully parsed response, recap length:', parsed.recap?.length || 0, 'highlights:', parsed.highlights?.length || 0);
      return new Response(
        JSON.stringify({
          recap: parsed.recap || null,
          highlights: parsed.highlights || [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      // If JSON parsing fails, use the raw content as recap
      console.warn('[generate-recap] Failed to parse JSON response, using raw content:', parseError);
      return new Response(
        JSON.stringify({
          recap: content,
          highlights: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[generate-recap] Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', recap: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

