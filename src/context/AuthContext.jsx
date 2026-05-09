import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  const [activeLicense, setActiveLicense] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const userLicense = localStorage.getItem('userLicenseKey');
      
      let systemLicense = { key: "AGRO-2026-VAL", expiry: "2026-12-31" };
      try {
        const remoteLicense = await api.get('/license');
        if (remoteLicense && remoteLicense.key) {
          systemLicense = remoteLicense;
          localStorage.setItem('systemActiveLicense', JSON.stringify(systemLicense));
        }
      } catch (err) {
        console.warn('Failed to fetch remote license, using local fallback', err);
        const localLicense = localStorage.getItem('systemActiveLicense');
        if (localLicense) systemLicense = JSON.parse(localLicense);
      }
      
      setActiveLicense(systemLicense);

      if (token) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) {
            // Force update role for specific testing email
            if (storedUser.email?.toLowerCase() === 'shashankrp2@gmail.com') {
              storedUser.role = 'SUPER_ADMIN';
            }
            
            // Check license validity for non-super admins
            const isSuper = storedUser.role === 'SUPER_ADMIN';
            const licenseMatches = userLicense === systemLicense.key;
            const expiryDate = new Date(systemLicense.expiry);
            expiryDate.setHours(23, 59, 59, 999);
            const isExpired = expiryDate < new Date();

            if (!isSuper && (!licenseMatches || isExpired)) {
              setIsLicenseValid(false);
              // If license changed/expired, logout user as per requirements
              if (userLicense && (userLicense !== systemLicense.key || isExpired)) {
                logout();
                return;
              }
            } else {
              setIsLicenseValid(true);
            }
            
            setUser(storedUser);
          }
        } catch (error) {
          console.error('Failed to restore user session', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, success } = response;
      
      if (success && userData) {
        // Force update role for specific testing email
        if (userData.email?.toLowerCase() === 'shashankrp2@gmail.com') {
          userData.role = 'SUPER_ADMIN';
        }

        setUser(userData);
        localStorage.setItem('accessToken', 'real-token-placeholder');
        localStorage.setItem('user', JSON.stringify(userData));

        // Check license
        handleLicenseCheck(userData);
        return true;
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { user: userData, success } = response;
      
      if (success && userData) {
        setUser(userData);
        localStorage.setItem('accessToken', 'real-token-placeholder');
        localStorage.setItem('user', JSON.stringify(userData));

        // Check license
        handleLicenseCheck(userData);
        return true;
      }
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const handleLicenseCheck = (userData) => {
    if (userData.role === 'SUPER_ADMIN') {
      setIsLicenseValid(true);
    } else {
      const userLicense = localStorage.getItem('userLicenseKey');
      const systemLicense = activeLicense || JSON.parse(localStorage.getItem('systemActiveLicense') || '{"key": "AGRO-2026-VAL", "expiry": "2026-12-31"}');
      const expiryDate = new Date(systemLicense.expiry);
      expiryDate.setHours(23, 59, 59, 999);
      if (userLicense === systemLicense.key && expiryDate > new Date()) {
        setIsLicenseValid(true);
      } else {
        setIsLicenseValid(false);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingEmail');
    window.location.href = '/login';
  };

  const verifyOTP = async (otp) => {
    const email = localStorage.getItem('pendingEmail');
    const name = localStorage.getItem('pendingName');
    if (!email) throw new Error('No pending authentication found');

    try {
      const response = await api.post('/auth/verify-otp', { email, otp, name });
      const data = response;
      
      if (data.success) {
        const userData = data.user;
        
        // Force update role for specific testing email
        if (userData.email?.toLowerCase() === 'shashankrp2@gmail.com') {
          userData.role = 'SUPER_ADMIN';
        }

        setUser(userData);
        localStorage.setItem('accessToken', 'real-token-placeholder');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingName');
        localStorage.removeItem('lastDevOtp');

        // Check license
        if (userData.role === 'SUPER_ADMIN') {
          setIsLicenseValid(true);
        } else {
          const userLicense = localStorage.getItem('userLicenseKey');
          const systemLicense = activeLicense || JSON.parse(localStorage.getItem('systemActiveLicense') || '{"key": "AGRO-2026-VAL", "expiry": "2026-12-31"}');
          const expiryDate = new Date(systemLicense.expiry);
          expiryDate.setHours(23, 59, 59, 999);
          if (userLicense === systemLicense.key && expiryDate > new Date()) {
            setIsLicenseValid(true);
          } else {
            setIsLicenseValid(false);
          }
        }
        return true;
      }
      throw new Error('Verification failed');
    } catch (error) {
      console.error('OTP verification error:', error.response?.data || error.message);
      throw error;
    }
  };

  const validateLicense = (key) => {
    const systemLicense = activeLicense || JSON.parse(localStorage.getItem('systemActiveLicense') || '{"key": "AGRO-2026-VAL", "expiry": "2026-12-31"}');
    const expiryDate = new Date(systemLicense.expiry);
    expiryDate.setHours(23, 59, 59, 999);
    
    console.log('Validating license key:', key);
    console.log('System license key:', systemLicense.key);
    console.log('System license expiry:', systemLicense.expiry);
    console.log('Current date:', new Date());
    if (key === systemLicense.key && expiryDate > new Date()) {
      setIsLicenseValid(true);
      localStorage.setItem('userLicenseKey', key);
      return true;
    }
    return false;
  };

  const generateLicense = async (days) => {
    const newKey = `AGRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));
    
    const newLicense = {
      key: newKey,
      expiry: expiryDate.toISOString().split('T')[0]
    };

    try {
      await api.post('/license', newLicense);
      localStorage.setItem('systemActiveLicense', JSON.stringify(newLicense));
      setActiveLicense(newLicense);
      return newLicense;
    } catch (error) {
      console.error('Failed to update system license on server', error);
      throw error;
    }
  };

  const updateProfile = async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      if (response && response.id) {
        const updatedUser = { ...user, ...response };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      return true;
    } catch (error) {
      console.error('Failed to change password', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyOTP,
    isLicenseValid,
    validateLicense,
    generateLicense,
    updateProfile,
    changePassword,
    activeLicense,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
