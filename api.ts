export async function request(body: any) {
  return fetch("/api/game", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json())
}
