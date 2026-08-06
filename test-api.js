async function test() {
  const url = "http://localhost:3000/api/v1/verify";
  const token = "tl_live_xmd-550FROnMYETfHnTUNGR0C6dk4tl-"; // Ensure this is the correct token

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        input: "What is the capital of France?",
        response: "Paris is the capital of France.",
        mode: "standard"
      })
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to fetch:", err);
  }
}

test();
