export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "No image" });

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a nutrition AI. Analyze the food in this image. Reply ONLY in this exact format: 'Score: X/10. Ingredients: [list]. Tip: [one improvement].' If there is no food in the image, reply: 'No food detected.'" },
                    { role: "user", content: [{ type: "text", text: "Analyze this food." }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }] }
                ],
                max_tokens: 100
            })
        });
        const data = await response.json();
        const result = data.choices[0].message.content.trim();
        res.status(200).json({ status: result });
    } catch (error) {
        res.status(500).json({ error: "AI failed" });
    }
}
