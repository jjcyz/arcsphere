import { useState } from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"

export default function SlideOutButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      <button
        className="h-12 w-12 rounded-l-lg rounded-r-none shadow-lg bg-gray-800 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close panel" : "Open panel"}
      >
        {isOpen ? <p> {'>'} </p> : <p> {'<'} </p> }
      </button>

      <div
        className={`w-80 shadow-lg transition-transform duration-300 ease-in-out bg-white border border-gray-200 rounded-r-lg ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-gray-500">Access your most used features</p>
        </div>
        <div className="p-4">
          <p>This is your sliding card content. You can add any components or information here.</p>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
          <button className="px-4 py-2 bg-gray-800 rounded-md text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
            Action
          </button>
        </div>
      </div>
    </div>
  )
}

