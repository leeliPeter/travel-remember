import {useSession} from "next-auth/react";

export const clientCurrentUser = () => {
    const session = useSession();
    return session.data?.user;
    }