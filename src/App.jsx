import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import SlideOutButton from './components/SlideOutButton'
import './App.css'



function App() {

  return (
   <div className='relative w-full'>
      <SlideOutButton />

    <div className="min-h-screen bg-gray-900">

      {/* Simple Black Header */}
      <div className="w-full bg-black">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <h1 className="text-3xl text-white">Arc'Sphere</h1>
          </div>
        </div>
      </div>

      {/* Landing Page */}
      <div className="container mx-auto">
        <div className="px-4 pt-12">
          <main className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">Welcome to the 'Sphere!</h1>
            <p className="text-2xl text-gray-400 mb-12 leading-relaxed">
              Helping Arc'teryx partners build communities orbiting around seeking support,
              answering questions, and planning meetups.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <img
                src="/images/image.png"
                alt="Mountain Climbers"
                className="w-screen h-auto object-cover rounded-lg shadow-xl"
                style={{ maxHeight: '1200px' }}
              />
            </div>
          </main>

          <footer className="mt-16 text-center text-gray-500 text-xl">
            ©2025 All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
    </div>
  )
}

export default App
