// first request will be send from the server to the database token with cookie and get user data
// then put this data in the context and send it to the client and the initial client request will load the user data and render it on header page. accordingly all pages will render. 

import { UserType } from "@/app/model/User";
import { createContext } from "react";

const UserContext = createContext<UserType | null>(null);

