let Auth = {
  signup: (username, password) => {
    const url = `signup`;
    const payload = JSON.stringify({ username: username, password: password });
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }).then((response) => response.json());
  },
  login: (username, password) => {
    const url = `login`;
    const payload = JSON.stringify({ username: username, password: password });
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  },
  validate: (token) => {
    const url = `validate`;
    return fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        return !data.error;
      });
  },
  getInfo: (token) => {
    const url = `info`;
    return fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => response.json());
  },
  setDisplayName: (token, newName) => {
    const url = `displayName`;
    const payload = JSON.stringify({ newName });
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    }).then((response) => response.json());
  },
};
export default Auth;
