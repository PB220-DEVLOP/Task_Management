// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowModal(false);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleEmailPasswordLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowModal(false);
    } catch (error) {
      console.error("Email login error:", error);
      setErrorMessage("Login failed. Please check your email and password.");
    }
  };

  const handleEmailPasswordSignup = async () => {
    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage("Password must be at least 8 characters long, include an uppercase letter, and a number.");
      return;
    }

    // Confirm password check
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowModal(false);
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("Signup failed. Please check your email and password.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white text-lg font-bold">Task Manager</div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 rounded-lg border border-gray-300 mr-4"
          />
          {!user ? (
            <>
              <button onClick={() => { setIsLogin(true); setShowModal(true); }} className="text-white mr-4">Login</button>
              <button onClick={() => { setIsLogin(false); setShowModal(true); }} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Signup</button>
            </>
          ) : (
            <button onClick={handleLogout} className="text-white bg-red-500 px-4 py-2 rounded-lg">Logout</button>
          )}
        </div>
      </nav>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">{isLogin ? 'Login' : 'Signup'}</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 mb-4 w-full"
            />
            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 p-2 mb-4 w-full"
              />
            )}
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="flex justify-between">
              <button onClick={isLogin ? handleEmailPasswordLogin : handleEmailPasswordSignup} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                {isLogin ? 'Login' : 'Signup'}
              </button>
              <button onClick={handleLoginWithGoogle} className="bg-red-500 text-white px-4 py-2 rounded-lg">Login with Google</button>
            </div>
            <button onClick={() => setShowModal(false)} className="mt-4 text-red-500">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
