import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API = "https://student-grievance-2.onrender.com/api";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post(API + "/login", data);

      // store token
      localStorage.setItem("token", res.data.token);

      // navigate to dashboard (NO page reload)
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.msg || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Login</h2>

        <input
          placeholder="Email"
          onChange={(e) =>
            setData({ ...data, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setData({ ...data, password: e.target.value })
          }
        />

        <button onClick={login}>Login</button>

        {/* FIXED NAVIGATION */}
        <p
          onClick={() => navigate("/register")}
          className="link"
        >
          Create new account
        </p>

      </div>
    </div>
  );
}