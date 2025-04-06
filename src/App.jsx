import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import SlideOutButton from './components/SlideOutButton'
import './App.css'



function App() {

  return (
   <div className='relative w-full'>
      <SlideOutButton />

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
              Helping Arc'teryx partners build communities orbiting around seeking support,
              answering questions, and planning meetups.
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
    </div>
  )
}

export default App
