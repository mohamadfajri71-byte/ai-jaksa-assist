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

Format output HARUS berupa JSON dengan struktur:
{
  "results": [
    {
      "type": "jurisprudence" | "regulation" | "article",
      "title": "judul dokumen",
      "content": "ringkasan konten yang relevan",
      "relevance": "penjelasan mengapa dokumen ini relevan dengan kasus",
      "reference": "nomor referensi (case_number, regulation_number, atau article_number)",
      "follow_up_hint": "opsional, saran singkat mengapa dokumen ini penting"
    }
  ],
  "suggested_questions": [
    "Pertanyaan lanjutan 1",
    "Pertanyaan lanjutan 2",
    "Pertanyaan lanjutan 3"
  ]
}

Pastikan hanya mengembalikan JSON tanpa teks lain. Berikan maksimal 5 hasil yang paling relevan dan 3 pertanyaan lanjutan yang logis.`
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
    let suggestedQuestions: string[] = [];
    try {
      let content = aiData.choices[0].message.content?.trim() || "";
      content = content.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        results = parsed;
      } else {
        results = Array.isArray(parsed.results) ? parsed.results : [];
        suggestedQuestions = Array.isArray(parsed.suggested_questions) ? parsed.suggested_questions : [];
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
      suggestedQuestions = [];
    }

    const enrichedResults = results.map((result: any) => {
      let metadata = null;
      if (result.reference) {
        if (result.type === "jurisprudence") {
          metadata = context.jurisprudence.find((item) => item.case_number === result.reference) || null;
        } else if (result.type === "regulation") {
          metadata = context.regulations.find((item) => item.regulation_number === result.reference) || null;
        } else if (result.type === "article") {
          metadata = context.articles.find((item) => item.article_number === result.reference) || null;
        }
      }

      return {
        ...result,
        file_path: metadata?.file_path || null,
        metadata,
      };
    });

    return new Response(
      JSON.stringify({ results: enrichedResults, suggested_questions: suggestedQuestions }),
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