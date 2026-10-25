export async function completion(
  system: string,
  payload: unknown,
): Promise<string> {
  const key = process.env.AI_API_KEY,
    model = process.env.AI_MODEL,
    base = process.env.AI_BASE_URL;
  if (!key || !model || !base)
    throw Error(
      "Hosted AI is not configured. Switch to Demo for local templates; your inputs are preserved.",
    );
  const url = new URL(base.replace(/\/$/, "") + "/chat/completions");
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  )
    throw Error("AI provider must use HTTPS.");
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(payload) },
      ],
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok)
    throw Error(
      `AI provider returned ${r.status}. Check service access or use Demo templates.`,
    );
  const data = (await r.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw Error("AI returned an empty response.");
  return text;
}
