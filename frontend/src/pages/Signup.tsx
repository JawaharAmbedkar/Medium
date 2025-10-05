import { Quote } from "../components/Quote"
import { Auth } from "../components/Auth"

export const Signup = () =>{

  return <div className="lg:grid grid-cols-2">
    <div>
    <Auth type = "signup"/>
    </div>
    <div className="hidden lg:block">
    <Quote/>
  </div>
  </div>
}