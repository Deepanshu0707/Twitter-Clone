import {Navigate, Route, Routes} from "react-router-dom"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import LoginPage from "./pages/auth/login/LoginPage"
import HomePage from "./pages/home/HomePage"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner"

function App() {
  
  const {data:authUser, isLoading} = useQuery({
    
    queryKey : ["authUser"],
    queryFn: async()=>{
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(data.error) return null;
        if(!res.ok) throw new Error(data.error || "Something went wrong");  //Status Code 200-299
      
      console.log("Auth user is here", data);
      return data;
      } catch (error) {
        throw new Error(error);        
      }
    },
    retry: false,
  })

  if(isLoading){
    return(
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lb" />
      </div>
    )
  }

 

  return (
    <>
     <div className="flex max-w-6xl mx-auto">
      {authUser ? <Sidebar/> : ""}
      <Routes>
        <Route path="/home" element={authUser ? <HomePage /> : <Navigate to="/login" /> } />
        <Route path="/login" element={!authUser ? <LoginPage /> :<Navigate to="/home" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/home" />} />
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        
      </Routes>
      {authUser ? <RightPanel/> : ""}
      <Toaster/>
     </div> 
    </>
  )
}

export default App;
