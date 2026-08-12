const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "API did not return JSON. Is the backend running on port 3000?"
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export { BASE_URL };
