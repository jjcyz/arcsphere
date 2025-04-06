import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import SlideOutButton from './components/SlideOutButton'
import ChatbotWindow from './components/ChatbotWindow'
import EventPlannerAgent from './components/EventPlannerAgent'
import GrantProgramAgent from './components/GrantProgramAgent'
import CommunityConnectorAgent from './components/CommunityConnectorAgent'
import './App.css'

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isEventPlannerOpen, setIsEventPlannerOpen] = useState(false);
  const [isGrantProgramOpen, setIsGrantProgramOpen] = useState(false);
  const [isCommunityConnectorOpen, setIsCommunityConnectorOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
    if (!isChatbotOpen) {
      setIsEventPlannerOpen(false);
      setIsGrantProgramOpen(false);
      setIsCommunityConnectorOpen(false);
    }
  };

  const toggleEventPlanner = () => {
    setIsEventPlannerOpen(!isEventPlannerOpen);
    if (!isEventPlannerOpen) {
      setIsChatbotOpen(false);
      setIsGrantProgramOpen(false);
      setIsCommunityConnectorOpen(false);
    }
  };

  const toggleGrantProgram = () => {
    setIsGrantProgramOpen(!isGrantProgramOpen);
    if (!isGrantProgramOpen) {
      setIsChatbotOpen(false);
      setIsEventPlannerOpen(false);
      setIsCommunityConnectorOpen(false);
    }
  };

  const toggleCommunityConnector = () => {
    setIsCommunityConnectorOpen(!isCommunityConnectorOpen);
    if (!isCommunityConnectorOpen) {
      setIsChatbotOpen(false);
      setIsEventPlannerOpen(false);
      setIsGrantProgramOpen(false);
    }
  };

  return (
   <div className='relative w-full'>
      <SlideOutButton onClick={toggleChatbot} />
      <button
        className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors text-sm"
        onClick={toggleEventPlanner}
      >
        Event Planner
      </button>
      <button
        className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-600 transition-colors text-sm mt-16"
        onClick={toggleGrantProgram}
      >
        Grant Program
      </button>
      <button
        className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-500 transition-colors text-sm mt-32"
        onClick={toggleCommunityConnector}
      >
        Community Connector
      </button>

    <div className="main-container">

      {/* Black Header */}
      <div className="header">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <h1 className="header-title">Arc'Sphere</h1>
          </div>
        </div>
      </div>

      {/* Landing Page */}
      <div className="landing-container">
        <div className="px-4 pt-12">
          <main className="max-w-4xl mx-auto">
            <h1 className="heading">Welcome to the 'Sphere!</h1>
            <p className="paragraph">
              Helping Arc'teryx long-standing strategic partner or ambassadors to build communities orbiting
              around seeking support, answering questions, and planning meetups.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <img
                src="/images/image.png"
                alt="Mountain Climbers"
                className="responsive-image"
              />
            </div>
          </main>

          <footer className="footer">
            ©2025 All Rights Reserved
          </footer>
        </div>
      </div>
    </div>

    <ChatbotWindow isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    <EventPlannerAgent isOpen={isEventPlannerOpen} onClose={() => setIsEventPlannerOpen(false)} />
    <GrantProgramAgent isOpen={isGrantProgramOpen} onClose={() => setIsGrantProgramOpen(false)} />
    <CommunityConnectorAgent isOpen={isCommunityConnectorOpen} onClose={() => setIsCommunityConnectorOpen(false)} />
    </div>
  )
}

export default App
