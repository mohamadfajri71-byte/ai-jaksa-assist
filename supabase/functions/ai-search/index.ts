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
    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
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

    // Call Grok AI
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
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

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('Grok API error:', grokResponse.status, errorText);
      throw new Error(`Grok API error: ${grokResponse.status}`);
    }

    const grokData = await grokResponse.json();
    console.log('Grok response:', grokData);

    let results = [];
    try {
      const content = grokData.choices[0].message.content;
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
      console.error('Error parsing Grok response:', parseError);
      results = [{
        type: 'jurisprudence',
        title: 'Hasil Pencarian',
        content: grokData.choices[0].message.content,
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