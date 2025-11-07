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
    const { draftType, caseDescription } = await req.json();
    console.log('Draft request:', { draftType, caseDescription });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // System prompts for different draft types
    const systemPrompts = {
      dakwaan: `Anda adalah asisten hukum yang ahli dalam menyusun Dakwaan (Surat Dakwaan) untuk Jaksa Penuntut Umum di Indonesia. 
      
Buatkan kerangka dakwaan yang lengkap dengan struktur:
1. IDENTITAS TERDAKWA
2. DAKWAAN (Primair, Subsidair, Lebih Subsidair jika diperlukan)
3. UNSUR-UNSUR TINDAK PIDANA
4. URAIAN PERBUATAN
5. ANALISIS PEMBUKTIAN
6. PASAL YANG DILANGGAR

Gunakan bahasa formal hukum Indonesia yang tepat dan merujuk pada KUHP, KUHAP, atau undang-undang terkait.`,

      requisitoir: `Anda adalah asisten hukum yang ahli dalam menyusun Requisitoir (Tuntutan Jaksa) untuk Jaksa Penuntut Umum di Indonesia.

Buatkan kerangka requisitoir yang lengkap dengan struktur:
1. PENDAHULUAN
2. DUDUK PERKARA
3. DAKWAAN DAN PEMBUKTIAN
4. ANALISIS YURIDIS
5. HAL-HAL YANG MEMBERATKAN DAN MERINGANKAN
6. TUNTUTAN PIDANA

Gunakan bahasa formal hukum Indonesia yang persuasif dan argumentatif.`,

      analisis: `Anda adalah asisten hukum yang ahli dalam menyusun Analisis Yuridis untuk Jaksa di Indonesia.

Buatkan analisis yuridis yang lengkap dengan struktur:
1. PENDAHULUAN
2. FAKTA HUKUM
3. PERMASALAHAN HUKUM
4. ANALISIS YURIDIS
   - Analisis unsur-unsur tindak pidana
   - Kualifikasi tindak pidana
   - Dasar hukum yang relevan
5. KESIMPULAN
6. REKOMENDASI

Gunakan pendekatan analitis dan sistematis dengan merujuk pada peraturan perundang-undangan yang berlaku.`
    };

    const systemPrompt = systemPrompts[draftType as keyof typeof systemPrompts] || systemPrompts.dakwaan;

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
            content: `Berdasarkan deskripsi kasus berikut, buatkan draft ${draftType}:\n\n${caseDescription}`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
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
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in draft-assistant function:', error);
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