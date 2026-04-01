// Changed for local and production
const baseURL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/"
    : window.location.origin + "/api/";

// ^ Get Data form json file
async function getData(endpoint, query = "") {
  const response = await fetch(`${baseURL}${endpoint}${query}`);
  if (!response.ok) throw new Error(`Failed to get ${endpoint}`);
  const data = await response.json();
  return {
    data,
    totalCount: Number(response.headers.get("X-Total-Count")) || 0,
  };
}

// ^ Post data to json file
async function postData(endpoint, newData) {
  const response = await fetch(`${baseURL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newData),
  });

  if (!response.ok) throw new Error(`Failed to post to ${endpoint}`);
  return await response.json();
}

// ^ Update existing data in json file
async function putData(endpoint, id, updatedData) {
  const response = await fetch(`${baseURL}${endpoint}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) throw new Error(`Failed to update ${endpoint}/${id}`);
  return await response.json();
}

// ^ Delete data from jsom file
async function deleteData(endpoint, id) {
  const response = await fetch(`${baseURL}${endpoint}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error(`Failed to delete ${endpoint}/${id}`);
  return true;
}
