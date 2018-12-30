export const isAuthenticated = () => {
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const token = localStorage.getItem("authToken");
  return !!(user && token) ? user : false;
};

export const unAuthenticate = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};