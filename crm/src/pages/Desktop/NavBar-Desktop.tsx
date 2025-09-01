import { Input } from "@/components/ui/input"
// import { Bell, CalendarFold, EllipsisVertical } from "lucide-react"
import { Link } from "react-router-dom"
import { UserNav } from "@/components/common/UserNav"; // <-- IMPORT

export const NavBarDesktop = () => {
  return (
    <div className="h-full w-full flex items-center pl-10">
      <div className="flex items-center justify-between w-full">
        <div
          style={{
            width: 'calc(100% - var(--notifications-width))',
          }}
          className="flex items-center justify-between">
          <h2 className="font-medium text-2xl text-primary">
            <Link to="/">
              Nirmaan CRM
            </Link>
          </h2>
          {/* <Input
            className="w-[50%]"
            placeholder="Search Something..."
          /> */}
        </div>
        <div className="pr-10 flex items-center gap-4">
          <UserNav /> {/* <-- REPLACE THE DIV */}
        </div>
      </div>
    </div>
  )
}