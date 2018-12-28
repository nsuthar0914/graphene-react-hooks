export const isAuthenticated = () => {
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const token = localStorage.getItem("id_token");
  return !!(user && user.is_superuser && token);
};

export const unAuthenticate = () => {
  localStorage.removeItem("id_token");
  localStorage.removeItem("user");
};