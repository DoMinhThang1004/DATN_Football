import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// LƯU Ý: Không bọc BrowserRouter ở đây nữa vì đã dùng createBrowserRouter trong router/index.jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)