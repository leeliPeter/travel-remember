import { currentUser } from "@/lib/auth";
import Nav from "./nav";
export default async function NavWrapper() {
  const user = await currentUser();
  return <Nav user={user || null} />;
}
