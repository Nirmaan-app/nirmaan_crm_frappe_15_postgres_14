import { useApplicationContext } from "@/contexts/ApplicationContext"
import { useViewport } from "@/hooks/useViewPort"
import { Plus, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Separator } from "./separator"

export const AddNewButton = ({options}) => {

  const { setOverlayOpen, overlayOpen } = useApplicationContext()

  const navigate = useNavigate()

  const {isMobile} = useViewport()

  return (
    <>
        {isMobile && overlayOpen && (
          <div
            className="p-4 bg-primary text-white shadow-lg rounded-lg flex flex-col gap-2"
            style={{ transition: "opacity 0.3s ease-in-out" }}
          >
            {options.map((option, index, arr) => (
              <>
                <button onClick={() => {
                  navigate(option.path)
                  setOverlayOpen(false)
                }}>{option.label}</button>
                {index !== arr.length - 1 && <Separator />}
              </>
            ))}
          </div>
        )}
        <button
          onClick={() => setOverlayOpen(!overlayOpen)}
          className={`bg-primary text-white ${isMobile ? "rounded-full p-3" : "rounded-md p-2"} shadow-lg flex items-center justify-center transition-transform duration-300 ${isMobile ? (overlayOpen ? "rotate-90" : "rotate-0") : ""
          }`}
        >
          {isMobile ? (
            overlayOpen ? <X size={24} /> : <Plus size={24} />
          ) : (
            <>
            <Plus size={24} />
            Add New
            </>
            
          )}
        </button>
        {!isMobile && overlayOpen && (
          <div
            className="p-4 bg-primary text-white shadow-lg rounded-lg flex flex-col gap-2 mr-12"
            style={{ transition: "opacity 0.3s ease-in-out" }}
          >
            {options.map((option, index, arr) => (
              <>
                <button onClick={() => {
                  navigate(option.path)
                  setOverlayOpen(false)
                }}>{option.label}</button>
                {index !== arr.length - 1 && <Separator />}
              </>
            ))}
          </div>
        )}
     </>
  )
}