import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, mode = 'normal' } = await req.json() as { message: string; mode: 'normal' | 'deepthink' | 'websearch' };

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response('API key not configured', { status: 500 });
    }

    // 根据模式选择不同的配置
    let model = 'deepseek-chat';
    let systemPrompt = '';

    if (mode === 'deepthink') {
      model = 'deepseek-reasoner';
    } else if (mode === 'websearch') {
      systemPrompt = '你是一个能够联网搜索的AI助手。请尽可能提供最新、准确的信息。';
    }

    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return new Response(`API request failed: ${response.statusText}`, {
        status: response.status,
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);

                  // 处理深度思考模式的推理内容
                  if (mode === 'deepthink') {
                    const reasoningContent = parsed.choices?.[0]?.delta?.reasoning_content;
                    const content = parsed.choices?.[0]?.delta?.content;

                    if (reasoningContent) {
                      const sseData = JSON.stringify({
                        type: 'thinking',
                        content: reasoningContent
                      });
                      controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                    }

                    if (content) {
                      const sseData = JSON.stringify({ content });
                      controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                    }
                  } else {
                    // 普通模式和联网搜索模式
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      const sseData = JSON.stringify({ content });
                      controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                    }
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
