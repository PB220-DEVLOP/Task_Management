// src/components/TaskTable.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore';

const TaskTable = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [status, setStatus] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTasks = () => {
      if (auth.currentUser) {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where("userId", "==", auth.currentUser.uid)
        );

        const unsubscribeFromTasks = onSnapshot(tasksQuery, (snapshot) => {
          const tasksData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(tasksData);
        }, (error) => {
          console.error("Error fetching tasks:", error);
        });

        return () => unsubscribeFromTasks();
      } else {
        setTasks([]);
      }
    };

    fetchTasks();
  }, [auth.currentUser]);

  const handleAddTask = async () => {
    if (!auth.currentUser) {
      alert("Please login to add tasks.");
      return;
    }

    if (!taskName) return;

    const newTask = {
      name: taskName,
      status,
      createdAt: new Date(),
      completedAt: null,
      userId: auth.currentUser.uid
    };

    try {
      await addDoc(collection(db, 'tasks'), newTask);
      setTaskName('');
      setStatus('Pending');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleChangeStatus = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };
    if (newStatus === 'Completed') {
      updatedTask.completedAt = new Date();
    } else {
      updatedTask.completedAt = null;
    }

    try {
      await updateDoc(doc(db, 'tasks', task.id), updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const filteredTasks = tasks.filter(task => 
    (task.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    task.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-200';
      case 'Pending':
        return 'bg-yellow-200';
      case 'Incomplete':
        return 'bg-red-200';
      default:
        return '';
    }
  };

  return (
    <div>
      {auth.currentUser ? (
        <>
          <div className="mb-4 flex">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Task Name"
              className="p-2 border border-gray-300 rounded mr-2"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded mr-2"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Incomplete">Incomplete</option>
            </select>
            <button
              onClick={handleAddTask}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Task
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by task name or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 mb-4 border border-gray-300 rounded w-full"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Task Name</th>
                  <th className="border border-gray-300 p-2">Status</th>
                  <th className="border border-gray-300 p-2">Created At</th>
                  <th className="border border-gray-300 p-2">Completed At</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <tr key={task.id} className={getStatusStyle(task.status)}>
                      <td className="border border-gray-300 p-2">{task.name}</td>
                      <td className="border border-gray-300 p-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleChangeStatus(task, e.target.value)}
                          className={`p-1 rounded ${getStatusStyle(task.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Incomplete">Incomplete</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 p-2">{task.createdAt?.toDate().toLocaleString()}</td>
                      <td className="border border-gray-300 p-2">
                        {task.completedAt ? task.completedAt.toDate().toLocaleString() : 'N/A'}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="border border-gray-300 p-2 text-center">
                      No tasks available. Please add a task.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center p-4">
          <p className="text-lg font-bold">To add tasks, please log in or sign up.</p>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
