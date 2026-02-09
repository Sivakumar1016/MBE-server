import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import * as cheerio from "cheerio";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

const SEL = ".Username-displayName";

async function fastFetch(username) {
  const URL = `https://www.freelancer.com/u/${username}`;
  const { data: html } = await axios.get(URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const text = $(SEL).first().text().trim();
  return text || null;
}

async function fallbackBrowser(username) {
  const URL = `https://www.freelancer.com/u/${username}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  });

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(SEL, { timeout: 15000 });

  const text = await page.$eval(SEL, (el) => (el.textContent || "").trim());
  await browser.close();
  return text;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));


// Health check endpoint
app.get('/', async(req, res) => {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyBUtD8uklIi0Y2t970xQBguhJyIx9WXQ0s" });

const r = await ai.models.generateContent({
  model: "gemini-2.5-flash",
//   contents: `I wanna to start new conversation.`,
// });

  contents: `High-Detail Residential Exterior Renderings

I need photorealistic exterior visuals of a residential building, produced strictly in 3ds Max 2020.
I have sketchup 3d model.
The final images must reflect full detail—accurate materials, realistic lighting, and complete landscaping so the scene feels lived-in and ready for marketing.

Deliverables
• At least two high-resolution still renders (4K minimum) from different camera angles
• The clean, well-organised .max file with all linked textures and proxies

Please base your workflow entirely in 3ds Max 2020; V-Ray. Timing and revision availability are important to me,
It need to be done in 10 hours.

==============


I am writing a freelancer bid message for the above project description.
Write bid message with project described languages such as English or French or Spanish or Dutch or other languages with short and clear sentences.

Formatting rules:
Use line breaks.
Do not use any symbols like -, •, (, ', and etc.
Only if project contains requirement to apply bid, it must be emphasized using asterisks about only requirements, not use asterisks for answer such as **{requirements for apply bid}** {\n answer about requirement}.
Every sentence must end with a period or a colon.
maximum is not over 6 sentences, but especially if project description contains requirement for apply bid, maximum is not over 9 sentences without requirement part.

Content rules:
when use first person in subject pronouns, it must be used 'I', not 'We'.
if project description contains clearly requirement to apply bid, first part must be answer about requirement for apply bid by 1 or 2 sentence each requirements.
answer about requirement for apply bid is included must be relate by requirement for apply bid sentence in project description, just not specail words or parts.
if project description does NOT contain requirement for apply bid, first part must be start my summary by one sentence like "I have been working with" + {main stack for the project} + "for over five years.".
Add only 4 to 6 solutions sentences about project that do NOT repeat the summary content or if the requirement for apply bid, do Not repeat the first part content.
Do not describe anything about result or status outcomes of project.

Tiimeline rules:
If project description contains timeline or deadline, mention about timeline or deadline in bid message by one sentence such as "I will finish within 7 days and can start right now".
if project description does NOT contain espacially timeline or deadline, do NOT mention about timeline or deadline in bid message.
Timeline sentence may be placed before last sentence.

Close rules:
Include the last sentence exactly:
Looking forward to solving this.

Do not include code.
Do not mention repository access.
Output only the bid message.
`});
console.log(r.text);
  res.json({ status: r.text, message: r.text });
});

// Get client name endpoint
app.get('/api/clientName', async (req, res) => {
  try {
    const { clientName } = req.query;
    if (!clientName) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    let name = await fastFetch(clientName);
    if (!name) name = await fallbackBrowser(clientName);

    if (!name) {
      return res.status(404).json({ error: 'Client name not found' });
    }

    const firstName = name.split(' ')[0];
    res.json({ clientName: firstName });
  } catch (error) {
    console.error('Error fetching client name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate bid endpoint
app.post('/api/generate-bid', async (req, res) => {
  try {
    let { prompt } = req.body;

    console.log('11111111111111', prompt)
    // Validate input
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }


    prompt = '"' + prompt + `"I am writing a freelancer bid message for the above project description.
      Write bid message with project described languages such as English or French or Spanish or Dutch or other languages with short and clear sentences.

      totally bid message roles:
      {if requirement to apply bid, answer for requirement to apply bid in mentiond project description} + "I have been working with" + {main stack for the project} + "for over five years. I have solved similar " + {problem or challenge on the project} + "I understand " + {main logic on the project}. + {the solution to solve project problem and challenge with 2 or 3 sentences.} + "I am available for screen-share consultation. I will explain everything clearly so your programmer can implement it. " + "Looking forward to solving this."

      Formatting rules:
      Use line breaks.
      Do not use any symbols like -, •, (, ', and etc.
      Only if project contains requirement to apply bid, it must be emphasized using asterisks about only requirements, not use asterisks for answer such as **{requirements for apply bid}** {answer about requirement}.
      Every sentence must end with a period or a colon.
      maximum is not over 6 sentences, but especially if project description contains requirement for apply bid, maximum is not over 9 sentences without requirement part.

      Content rules:
      when use first person in subject pronouns, it must be used 'I', not 'We'.
      if project description contains clearly requirement to apply bid, first part must be answer about requirement for apply bid by 1 or 2 sentence each requirements.
      answer about requirement for apply bid is included must be relate by requirement for apply bid sentence in project description, just not specail words or parts.
      if project description does NOT contain requirement for apply bid, first part must be start my summary by one sentence like "I have been working with" + {main stack for the project} + "for over five years.".
      Add only 4 to 6 solutions sentences about project that do NOT repeat the summary content or if the requirement for apply bid, do Not repeat the first part content.
      Do not describe anything about result or status outcomes of project.

      Tiimeline rules:
      If project description contains timeline or deadline, mention about timeline or deadline in bid message by one sentence such as "I will finish within 7 days and can start right now".
      if project description does NOT contain espacially timeline or deadline, do NOT mention about timeline or deadline in bid message.
      Timeline sentence may be placed before last sentence.

      Close rules:
      Include the last sentence exactly:
      Looking forward to solving this.

      Do not include code.
      Do not mention repository access.
      Output only the bid message."`;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const r = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });

    // Check for placeholders
    let bidError = null;
    if ( r.text.includes('[') ) {
      bidError = 'Bid includes placeholder - may need review';
    }

    res.json({
      success: true,
      bid: r.text,
      error: bidError,
      // bid: prompt.substring(1000),
      // error: null,
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate bid',
    });
  }
});

// Send Slack notification endpoint
app.post('/api/send-notification', async (req, res) => {
  try {
    const { message } = req.body;

    console.log(message)
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!slackWebhookUrl) {
      console.error('SLACK_WEBHOOK_URL is not set');
      return res.status(500).json({ error: 'Slack webhook not configured' });
    }

    console.log('Sending Slack notification...');

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    });

    const responseText = await response.text();

    if (response.ok && responseText === 'ok') {
      console.log('Slack notification sent successfully');
      res.json({ success: true, message: 'Notification sent' });
    } else {
      console.error('Slack API error:', responseText);
      res.status(response.status || 500).json({ error: responseText });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: error.message || 'Failed to send notification',
    });
  }
});
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Bid generation: POST http://localhost:${PORT}/api/generate-bid`);
  console.log(`📍 Client name lookup: GET http://localhost:${PORT}/api/clientName`);
  console.log(`📍 Slack notification: POST http://localhost:${PORT}/api/send-notification`);
});


export default app;



