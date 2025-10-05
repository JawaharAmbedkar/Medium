import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Publish } from './pages/Publish'
import { Profile} from './pages/Profile'
import {EditBlog} from './pages/EditBlog'
import { FullBlog } from './pages/FullBlog'
import { AllBlogs } from './pages/AllBlogs'
import { MyBlogs } from './pages/MyBlogs'



function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/myblogs" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={<FullBlog />} />
          <Route path='/myblogs' element={<MyBlogs/>} />
          <Route path='/publish' element={<Publish/>} />
          <Route path='/profile' element={<Profile/>} />
          <Route path="/edit/:id" element={<EditBlog/>} />
          <Route path="/blog/all" element={<AllBlogs />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App