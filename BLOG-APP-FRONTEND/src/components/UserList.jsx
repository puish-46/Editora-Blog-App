import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./ui/Loader";
import Card from "./ui/Card";
import {
  tableContainer,
  tableHeaderClass,
  tableRowClass,
  tableCellClass,
  errorClass,
} from "../styles/common.js";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        let res = await axios.get(`${import.meta.env.VITE_API_URL}/admin-api/users`, { withCredentials: true });
        setUsers(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  if (loading) return <Loader message="Retrieving readers directory..." />;
  if (error) return <p className={errorClass}>{error}</p>;

  return (
    <Card hoverEffect={false} className="overflow-hidden p-0 border border-border-light dark:border-border-dark rounded-2xl shadow-sm">
      <div className={tableContainer}>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className={`${tableHeaderClass} border-b border-border-light dark:border-border-dark`}>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">First Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Last Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark bg-card-light/10 dark:bg-card-dark/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-sm text-text-light-secondary/50 dark:text-text-dark-secondary/50">
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((userObj) => (
                <tr key={userObj.email} className={`${tableRowClass} hover:bg-card-light dark:hover:bg-card-dark transition-colors`}>
                  <td className={`${tableCellClass} px-6 py-4 text-sm font-semibold`}>{userObj.firstName}</td>
                  <td className={`${tableCellClass} px-6 py-4 text-sm text-text-light-secondary dark:text-text-dark-secondary`}>{userObj.lastName || "—"}</td>
                  <td className={`${tableCellClass} px-6 py-4 text-sm font-mono text-text-light-secondary dark:text-text-dark-secondary`}>{userObj.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default UserList;