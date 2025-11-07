import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log('Legal chat query:', message);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Anda adalah asisten hukum AI khusus untuk sistem hukum Indonesia. 
Tugas Anda adalah menjawab pertanyaan seputar hukum Indonesia dengan akurat dan jelas.

Panduan:
- Hanya jawab pertanyaan yang berkaitan dengan hukum Indonesia
- Berikan penjelasan yang mudah dipahami
- Rujuk pada peraturan perundang-undangan yang relevan jika memungkinkan
- Jika pertanyaan tidak berkaitan dengan hukum, jelaskan bahwa Anda hanya dapat membantu pertanyaan hukum
- Gunakan bahasa formal namun tetap mudah dipahami
- Berikan contoh konkret jika membantu pemahaman

Selalu ingat: Anda adalah asisten informasi, bukan pengganti konsultasi hukum profesional.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const content = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in legal-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
