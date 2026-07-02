import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Você é Caleb, um treinador pessoal cristão especialista em musculação, nutrição e saúde.
Você combina conhecimento científico de treino com princípios cristãos de disciplina e propósito.
Responda SEMPRE em português do Brasil.
Seja encorajador, específico e prático.
Quando relevante ou solicitado, inclua versículos bíblicos sobre força, disciplina e perseverança.
Mantenha respostas concisas (máximo 200 palavras) mas completas.
Nunca imponha religião — ofereça referências bíblicas de forma natural quando fizer sentido.`

const mockResponses: Record<string, string> = {
  treino: `Ótimo que você está focado no treino! 💪\n\nPara maximizar seus resultados, lembre-se:\n• Progressão de carga: aumente 2,5kg quando conseguir as reps alvo em todas as séries\n• Descanso: 48h antes de treinar o mesmo músculo\n• Consistência é mais importante que intensidade\n\n*"Tudo posso naquele que me fortalece."* — Fp 4:13\n\nQual músculo quer focar hoje?`,
  nutrição: `A nutrição é 70% do resultado! 🥗\n\nPara hipertrofia, busque:\n• **Proteína:** 2g por kg de peso corporal\n• **Calorias:** superávit de 200-300 kcal\n• **Refeições:** a cada 3-4 horas\n\nPrioritize frango, ovos, batata doce e arroz integral.\n\n*"Ou não sabeis que o vosso corpo é o templo do Espírito Santo?"* — 1Co 6:19`,
  sono: `O sono é quando os músculos crescem! 😴\n\nDicas para recuperação ideal:\n• 7-9 horas por noite\n• Sem tela 1h antes de dormir\n• Temperatura ambiente: 18-20°C\n• Magnésio antes de dormir ajuda\n\n*"Em paz me deitarei e também dormirei, pois tu, Senhor, me fazes habitar em segurança."* — Sl 4:8`,
  versículo: `*"Não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não desanimarmos."* — Gl 6:9\n\nEsse versículo se aplica perfeitamente aos treinos. Cada série, cada rep, cada dia de consistência é uma semente plantada. Continue firme — os resultados vêm para quem persevera! 🙏`,
  dor: `Dor muscular (DOMS) é normal após treinos intensos — dura 24-72h.\n\n**Faça:**\n• Movimento leve no dia seguinte (caminhada, mobilidade)\n• Proteína suficiente para recuperação\n• Hidratação abundante\n• Sono de qualidade\n\n**Evite:** treinar o mesmo músculo com dor intensa.\n\nSe for dor articular ou aguda, procure um médico.`,
  default: `Olá! Estou aqui para te ajudar em tudo relacionado a treino, nutrição e bem-estar! 💪\n\nPosso te ajudar com:\n• Dúvidas sobre exercícios e técnica\n• Planejamento de treinos\n• Nutrição e dieta\n• Recuperação e descanso\n• Motivação e foco\n\nO que você precisa hoje?\n\n*"Tudo o que você fizer, faça de todo o coração, como para o Senhor."* — Cl 3:23`
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('treino') || lower.includes('exercício') || lower.includes('musculação')) return mockResponses.treino
  if (lower.includes('nutrição') || lower.includes('comer') || lower.includes('proteína') || lower.includes('dieta')) return mockResponses.nutrição
  if (lower.includes('sono') || lower.includes('descanso') || lower.includes('recuperação')) return mockResponses.sono
  if (lower.includes('versículo') || lower.includes('bíblia') || lower.includes('oração') || lower.includes('deus')) return mockResponses.versículo
  if (lower.includes('dor') || lower.includes('doendo') || lower.includes('lesão')) return mockResponses.dor
  return mockResponses.default
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory } = await req.json()

    const openaiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiKey) {
      // Sem chave OpenAI: resposta mock inteligente
      const response = getMockResponse(message)
      return new Response(JSON.stringify({ response }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Com chave OpenAI: chama a API real
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []).slice(-10),
      { role: 'user', content: message },
    ]

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    const data = await res.json()
    const response = data.choices?.[0]?.message?.content || getMockResponse(message)

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro interno', response: getMockResponse('') }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
