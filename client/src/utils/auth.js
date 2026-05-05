import { jwtDecode } from 'jwt-decode';

class AuthService {
  getProfile() {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token) {
    try {
      const decoded = jwtDecode(token);
      if (!decoded || typeof decoded.exp !== 'number') {
        return true;
      }
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  }

  getToken() {
    return sessionStorage.getItem('id_token') || localStorage.getItem('id_token');
  }

  login(idToken) {
    sessionStorage.setItem('id_token', idToken);
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }

  logout() {
    sessionStorage.removeItem('id_token');
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();
