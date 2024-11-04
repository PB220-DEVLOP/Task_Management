// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import TaskTable from '../components/TaskTable';
import Footer from '../components/Footer';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="p-4 flex-grow">
        <h1 className="text-2xl font-bold mb-4">Task List</h1>
        {user ? (
          <TaskTable user={user} />
        ) : (
          <p className="text-lg font-bold text-center">Please log in to see your tasks.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
