
export const DesktopLayout = () => {
  return (
    <div className="flex flex-col h-dvh">
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 border-b border-gray-300 bg-white flex items-center justify-center z-10">
        <h1 className="text-2xl font-bold">Navbar</h1>
      </div>

      {/* Main container with padding-top to account for the fixed navbar */}
      <div className="flex flex-1 pt-20">
        {/* Fixed Left Sidebar */}
        <div className="fixed top-20 left-0 bottom-0 w-36 border-r border-gray-300 bg-white p-4">
          <h2 className="text-xl font-semibold">Sidebar</h2>
          {/* Sidebar content */}
        </div>

        {/* Fixed Right Notification Bar */}
        <div className="fixed top-20 right-0 bottom-0 w-48 border-l border-gray-300 bg-white p-4">
          <h2 className="text-xl font-semibold">Notifications</h2>
          {/* Notification content */}
        </div>

        {/* Main Content Area */}
        <div className="ml-36 mr-48 overflow-y-auto p-4 bg-gray-100 flex-1">
          <h2 className="text-xl font-semibold mb-4">Main Content</h2>
          {/* Replace with your main content */}
          <p>Your content goes here...</p>
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
