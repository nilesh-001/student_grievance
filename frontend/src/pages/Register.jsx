import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API = "https://student-grievance-2.onrender.com/api";

export default function Register() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const register = async () => {
    try {
      await axios.post(API + "/register", data);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        <input placeholder="Name" onChange={e => setData({...data, name: e.target.value})}/>
        <input placeholder="Email" onChange={e => setData({...data, email: e.target.value})}/>
        <input type="password" placeholder="Password" onChange={e => setData({...data, password: e.target.value})}/>

        <button onClick={register}>Register</button>

        <p onClick={() => navigate("/login")} className="link">
          Already have account? Login
        </p>
      </div>
    </div>
  );
}