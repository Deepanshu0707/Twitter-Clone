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
        /*
    First thing is that any error object which is sent in response come inside the try block of frontend.
    second that useQuery has inbuilt feature that if it receive a data from queryFn which value is error object
    so it send it inside it error store and will not put new value of authUser and use it previous value which
    is already in cache so to overcome this issue we are seeing data.error as we know any error object come 
    inside the try block and we can check if we get data.error we will return null instead of getting the previous
    data by defualt by useQuery.
        */
        console.log(data);
        if(data.error) return null; 
        if(!res.ok) throw new Error(data.error || "Something went wrong");  //Status Code 200-299
      
      console.log("Auth user is here", data);
      return data; //
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
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" /> } />
        <Route path="/login" element={!authUser ? <LoginPage /> :<Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
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
