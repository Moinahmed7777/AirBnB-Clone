import axios from "axios";
import { useState } from "react";
import { useContext } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AccountNav from "../AccountNav";
import { UserContext } from "../UserContext";
import PlacesPage from "./PlacesPage";

export default function ProfilePage(){
    //check UserContext, to use cetain components to use in other pages
    const {ready,user,setUser} = useContext(UserContext);
    // for redirection to index page after logout
    const [redirect,setRedirect] = useState(null)

    //subpage to hold strings of nest acount links
    let {subpage} = useParams();
    //if subpage is undefined means it is in /account
    if (subpage === undefined){
        subpage = 'profile';
    }

    //axios logout function which resets cookie/token to empty using post, 
    //and redirects to index page and then setUser to null
    async function logout(){
        await axios.post('/logout')
        setRedirect('/');
        setUser(null);
        
    }
    //it takes sometime to setReady in UserContext to get the profile(30ms), till it is ready show loading
    if (!ready){
        return 'loading...'

    }
    //if the profile info is ready, and there is no user(user reset) and redirect is not empty 
    if(ready && !user && !redirect){
        return <Navigate to={'/login'}/>
    }
    // if redirect is not null navigate to redirect
    if (redirect){
        return <Navigate to={redirect} />
    }
    
    

    return (
        <div>
            <AccountNav />
            {subpage === 'profile' && (
                <div className="text-center max-w-lg mx-auto">
                    Logged in as {user.name} ({user.email}) <br />
                    <button onClick={logout} className="primary max-w-sm mt-2">Logout</button>
                </div>
            )}
            {subpage === 'places' && (
                <PlacesPage/>
            )}
        </div>
    );
}