import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'
import "./styles.css";
import Chat from './pages/Agent.tsx'


// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App /> 
//    
//   </StrictMode>,
// )

createRoot(document.getElementById("root")!).render(<Chat />);

