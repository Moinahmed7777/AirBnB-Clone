import axios from "axios";
import { useEffect } from "react";
import { useState,createContext } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const [user,setUser]= useState(null);
    const [ready,setReady] = useState(false)

    //use Effect is called when it called when <UserContext.Provider/> is mounted
    //it takes some time to get the user data, to setUser 
    useEffect(()=>{
        if (!user){
            axios.get('/profile').then(({data}) =>{
                setUser(data);
                setReady(true)
            });
        }
      },[]);
    return(
        <UserContext.Provider value={{user,setUser,ready}}>
            {children}
        </UserContext.Provider>
    )
}
