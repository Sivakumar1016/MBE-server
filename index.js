import { GoogleGenAI } from "@google/genai";
import express from 'express';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {

const ai = new GoogleGenAI({ apiKey: "AIzaSyBUtD8uklIi0Y2t970xQBguhJyIx9WXQ0s" });

const r = ai.models.generateContent({
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

  res.json({ status: 'ok', message: r.text });
});


// Error handling middleware
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
});

export default app;
