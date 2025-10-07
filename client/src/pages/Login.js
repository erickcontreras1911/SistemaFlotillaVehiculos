// client/src/pages/Login.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem("auth_ok") === "1";
    if (ok) navigate("/home");
  }, [navigate]);

  const sanitizeUser = (val) => val.replace(/[^a-zA-Z]/g, "").toLowerCase();

  const handleUserChange = (e) => {
    const v = sanitizeUser(e.target.value);
    setUsuario(v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (usuario !== "generico") {
      Swal.fire("Usuario incorrecto", "Verifica el usuario ingresado.", "error");
      return;
    }
    if (password !== "Generico2025") {
      Swal.fire("Contraseña incorrecta", "Inténtalo nuevamente.", "error");
      return;
    }

    sessionStorage.setItem("auth_ok", "1");
    Swal.fire({
      icon: "success",
      title: "Bienvenido",
      showConfirmButton: false,
      timer: 900
    }).then(() => navigate("/home"));
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          {/* Logo desde client/public/logo512.png */}
          <img src="/logo.png" alt="Logo" className="logo" />
          <div className="brand-text">
            <h1>Sistema de Flotillas</h1>
            <p className="subtitle">Acceso</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Usuario</label>
            <input
              type="text"
              inputMode="latin-name"
              value={usuario}
              onChange={handleUserChange}
              placeholder="Ingresa tu usuario"
              autoFocus
              required
            />
            <small className="hint">Solo letras, en minúsculas.</small>
          </div>

          <div className="field">
            <label>Contraseña</label>
            <div className="pwd-wrap">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={!usuario || !password}>
            Ingresar
          </button>
        </form>
      </div>

      {/* CSS interno */}
      <style>{`
        :root {
          --bg1: #0f172a;      /* slate-900 */
          --bg2: #1e293b;      /* slate-800 */
          --card: rgba(255,255,255,0.08);
          --border: rgba(255,255,255,0.12);
          --text: #e2e8f0;     /* slate-200 */
          --muted: #94a3b8;    /* slate-400 */
          --accent: #22c55e;   /* green-500 */
          --accent-600: #16a34a;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .login-wrap {
          min-height: 100vh;
          background: radial-gradient(1200px 600px at 20% 10%, #1d4ed8 0%, transparent 60%),
                      radial-gradient(900px 500px at 90% 90%, #22c55e 0%, transparent 60%),
                      linear-gradient(180deg, var(--bg1), var(--bg2));
          display: grid;
          place-items: center;
          padding: 24px;
          color: var(--text);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        }
        .login-card {
          width: 100%;
          max-width: 480px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          backdrop-filter: blur(8px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          animation: floatIn .5s ease both;
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        /* Logo como imagen */
        .logo {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          box-shadow: 0 6px 16px rgba(34,197,94,.35);
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .brand-text h1 {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.2;
          font-weight: 700;
        }
        .brand-text .subtitle {
          margin: 2px 0 0 0;
          color: var(--muted);
          font-size: .95rem;
        }
        .field { margin: 16px 0; }
        label {
          display: block;
          font-size: .9rem;
          color: var(--muted);
          margin-bottom: 6px;
        }
        input {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(15, 23, 42, .55);
          color: var(--text);
          padding: 0 14px;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, .25);
          background: rgba(15, 23, 42, .7);
        }
        .hint {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: .8rem;
        }
        .pwd-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .pwd-wrap input {
          padding-right: 88px;
        }
        .toggle {
          position: absolute;
          right: 6px;
          height: 32px;
          padding: 0 10px;
          border-radius: 10px;
          background: transparent;
          color: var(--muted);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all .2s;
        }
        .toggle:hover { color: var(--text); border-color: #38bdf8; }
        .btn-primary {
          width: 100%;
          height: 46px;
          margin-top: 12px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--accent-600));
          color: white;
          font-weight: 700;
          letter-spacing: .3px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(22,163,74,.35);
          transition: transform .06s ease, filter .2s ease;
        }
        .btn-primary:disabled {
          filter: grayscale(.35) brightness(.8);
          cursor: not-allowed;
          box-shadow: none;
        }
        .btn-primary:active { transform: translateY(1px); }
      `}</style>
    </div>
  );
}
