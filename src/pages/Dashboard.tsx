import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import ServerList from "../components/ServerList"
// import RequestBuilder from "../components/RequestBuilder"

interface Request {
  id?: number
  collectionId?: number
  name: string
  method: string
  url: string
  headers: Record<string, string>
  body: string
  params: Record<string, string>
  auth: Record<string, any>
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"requests" | "servers">("servers")
  // const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  const handleSelectRequest = (request: Request) => {
    setSelectedRequest(request)
    setActiveTab("requests")
  }

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar onSelectRequest={handleSelectRequest} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex border-b border-border bg-card">
          {/* <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-3 font-medium transition ${
              activeTab === "requests"
                ? "text-primary-500 border-b-2 border-primary-500"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            API Requests
          </button> */}
          <button
            onClick={() => setActiveTab("servers")}
            className={`px-4 py-3 font-medium transition ${
              activeTab === "servers"
                ? "text-primary-500 border-b-2 border-primary-500"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Servers
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
           <ServerList />
          {/* {activeTab === "requests" && (
            <RequestBuilder request={selectedRequest} />
          )} */}
          {/* {activeTab === "servers" && <ServerList />} */}
        </div>
      </div>
    </div>
  )
}
