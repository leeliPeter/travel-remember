import {auth} from "@/auth";

//get user for server compoenents
export const currentUser = async()=>{
    const session = await auth();
    return session?.user;
}

