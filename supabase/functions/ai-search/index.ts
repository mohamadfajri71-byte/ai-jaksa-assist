import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('AI Search query:', query);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch data from database
    const [jurisData, regData, articlesData] = await Promise.all([
      supabase.from('jurisprudence').select('*'),
      supabase.from('regulations').select('*'),
      supabase.from('articles').select('*'),
    ]);

    // Prepare context for AI
    const context = {
      jurisprudence: jurisData.data || [],
      regulations: regData.data || [],
      articles: articlesData.data || [],
    };

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
            content: `Anda adalah asisten hukum untuk Jaksa Indonesia. Tugas Anda adalah mencari dan memberikan referensi hukum yang relevan berdasarkan deskripsi kasus yang diberikan.

Database yang tersedia:
- Yurisprudensi: ${context.jurisprudence.length} dokumen
- Regulasi: ${context.regulations.length} dokumen  
- Pasal: ${context.articles.length} dokumen

Berikan hasil dalam format JSON array dengan struktur:
[{
  "type": "jurisprudence" | "regulation" | "article",
  "title": "judul dokumen",
  "content": "ringkasan konten yang relevan",
  "relevance": "penjelasan mengapa dokumen ini relevan dengan kasus",
  "reference": "nomor referensi (case_number, regulation_number, atau article_number)"
}]

Berikan maksimal 5 hasil yang paling relevan. Fokus pada akurasi dan relevansi dengan kasus yang dijelaskan.`
          },
          {
            role: 'user',
            content: `Deskripsi kasus: ${query}

Data yurisprudensi: ${JSON.stringify(context.jurisprudence.slice(0, 20))}

Data regulasi: ${JSON.stringify(context.regulations.slice(0, 20))}

Data pasal: ${JSON.stringify(context.articles.slice(0, 20))}`
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
    console.log('AI response:', aiData);

    let results = [];
    try {
      const content = aiData.choices[0].message.content;
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create results from the text response
        results = [{
          type: 'jurisprudence',
          title: 'Hasil Pencarian AI',
          content: content,
          relevance: 'Analisis dari AI',
          reference: ''
        }];
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      results = [{
        type: 'jurisprudence',
        title: 'Hasil Pencarian',
        content: aiData.choices[0].message.content,
        relevance: 'Analisis dari AI',
        reference: ''
      }];
    }

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-search function:', error);
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