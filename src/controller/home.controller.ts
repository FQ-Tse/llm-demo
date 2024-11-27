import { Controller, Get } from '@midwayjs/core';
import OpenAI from 'openai';
import axios from 'axios';
@Controller('/')
export class HomeController {
  @Get('/')
  async home(){
    const openai = new OpenAI({
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: 'xxx'
    });

    const ttsUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=xxx`;
    const ttsHeaders = this.buildTtsStreamHeaders();
    const ttsBody = this.buildTtsStreamBody('As the population of the Internet grows rapidly the development of web technologies becomes extremely important', 'cartoon-boy-07', 1.0, '');

    const stream = await openai.chat.completions.create({
      model: 'xxx',
      messages: [
        { role: 'system', content: 'prompt' },
        { role: 'user', content: '你能做什么？' },
      ],
      stream: true,
    });
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
      console.log('start------', Date.now());

      await axios
        .post(ttsUrl, ttsBody, {
          headers: ttsHeaders,
          responseType: 'stream',
        }).then(response => {
          response.data.on('data', async (chunk: Buffer) => {
          });
          response.data.on('end', () => {
            console.log('start2------', Date.now());
          })
        }).catch(error => {
          console.log(error);
        })
    }
  }



  buildTtsStreamHeaders() {
    return {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      authorization: `Bearer xxx`,
    };
  }

  buildTtsStreamBody(text: string, voice_id: string, speed: number, language_boost: string) {
    return JSON.stringify({
      model: voice_id ===  'speech-01-turbo',
      text,
      stream: true,
      voice_setting: {
        voice_id,
        speed: +speed ?? 1.0,
        vol: 1.0,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 256000,
        format: 'pcm',
        channel: 1,
      },
      language_boost: language_boost || null,
    });
  }
}
