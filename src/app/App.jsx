import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/global.css'
import Chat from '../pages/gpt/gpt.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Chat/>
  </StrictMode>,
)