import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";

const API = "/api";

export default function Dashboard() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Academic"
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: token };

  const load = async () => {
    const res = await axios.get(API + "/grievances", { headers });
    setList(res.data);
  };

  const add = async () => {
    if (!form.title || !form.description) return alert("Fill all fields");

    await axios.post(API + "/grievances", form, { headers });
    setForm({ title: "", description: "", category: "Academic" });
    load();
  };

  const del = async (id) => {
    await axios.delete(API + "/grievances/" + id, { headers });
    load();
  };

  const updateStatus = async (id) => {
    await axios.put(
      API + "/grievances/" + id,
      { status: "Resolved" },
      { headers }
    );
    load();
  };

  const search = async (value) => {
    const res = await axios.get(
      API + "/grievances/search?title=" + value,
      { headers }
    );
    setList(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>🎓 Grievance</h2>

        <button
          className="primary-btn"
          onClick={() =>
            document.getElementById("form").scrollIntoView({ behavior: "smooth" })
          }
        >
          + New
        </button>

        <nav>
          <p className="active">Dashboard</p>
        </nav>

        <button onClick={logout} className="logout">Logout</button>
      </aside>

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <div className="topbar">
          <h1>Dashboard</h1>

          <input
            placeholder="Search grievances..."
            onChange={(e) => search(e.target.value)}
          />
        </div>

        {/* FORM */}
        <div className="form-section" id="form">
          <h3>Submit Grievance</h3>

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option>Academic</option>
            <option>Hostel</option>
            <option>Transport</option>
            <option>Other</option>
          </select>

          <button onClick={add}>Submit</button>
        </div>

        {/* TABLE */}
        <div className="table-section">
          <h3>All Grievances</h3>

          <table className="grievance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.map((g) => (
                <tr key={g._id}>
                  <td>{g._id.slice(-5)}</td>
                  <td>{g.title}</td>
                  <td>{g.category}</td>
                  <td>
                    <span className={`status ${g.status.toLowerCase()}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      disabled={g.status === "Resolved"}
                      onClick={() => updateStatus(g._id)}
                      className="resolve-btn"
                    >
                      Resolve
                    </button>

                    <button
                      onClick={() => del(g._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}