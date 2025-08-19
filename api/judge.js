import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prevWord, newPhrase } = req.body;
        
        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 150,
            messages: [{
                role: 'user',
                content: `Judge this word association: "${prevWord}" → "${newPhrase}". 

Rate 1-8 points based on:
- 1-2: Obvious connections (food → eat)
- 3-4: Creative connections (food → sustenance) 
- 5-6: Cultural/literary references (spice → Dune)
- 7-8: Genius obscure connections

Return only JSON: {"points": X, "reason": "brief explanation"}`
            }]
        });
        
        const result = JSON.parse(message.content[0].text);
        res.json(result);
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'AI judgment failed' });
    }
}
