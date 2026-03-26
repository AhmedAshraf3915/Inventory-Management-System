const baseURL = "http://localhost:3000/"

// ^ Get Data form json file
async function getData(endpoint) {
	const response = await fetch(`${baseURL}${endpoint}`);
	if (!response.ok) throw new Error(`Failed to get ${endpoint}`);
	return await response.json();
}

// ^ Post data to json file
async function postData(endpoint, newData) {
	const response = await fetch(`${baseURL}${endpoint}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(newData)
	});

	if (!response.ok) throw new Error(`Failed to post to ${endpoint}`);
	return await response.json();
}

// ^ Update existing data in json file
async function putData(endpoint, id, updatedData) {
	const response = await fetch(`${baseURL}${endpoint}/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(updatedData)
	});

	if (!response.ok) throw new Error(`Failed to update ${endpoint}/${id}`);
	return await response.json();
}

// ^ Delete data from jsom file
async function deleteData(endpoint, id) {
	const response = await fetch(`${baseURL}${endpoint}/${id}`, {
		method: "DELETE"
	});

	if (!response.ok) throw new Error(`Failed to delete ${endpoint}/${id}`);
	return true;
}