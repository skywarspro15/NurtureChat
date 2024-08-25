class Auth {
  signup(username, password) {
    const url = `${location.protocol}://${location.host}/signup`;
    const payload = JSON.stringify({ username: username, password: password });
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }).then((response) => response.json());
  }
  login(username, password) {
    const url = `${location.protocol}://${location.host}/login`;
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
  }
  validate(token) {
    const url = `${location.protocol}://${location.host}/validate`;
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
  }
  getInfo(token) {
    const url = `${location.protocol}://${location.host}/info`;
    return fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => response.json());
  }
}
export default Auth;
