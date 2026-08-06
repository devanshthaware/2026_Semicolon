async function testIngest() {
  const url = "http://localhost:8000/v1/ingest";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: "doc_" + Math.random().toString(36).substring(7),
        text: "The Eiffel Tower is located in Paris, France. It is 330 meters tall.",
        source_name: "Test Knowledge"
      })
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to fetch:", err);
  }
}

testIngest();
