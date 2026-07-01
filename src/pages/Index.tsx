import type { User } from "@supabase/supabase-js";
import { useIndexPageController } from "./useIndexPageController";
import { IndexView } from "./IndexView";

interface IndexProps {
  user: User;
  onSignOut: () => void;
}

const Index = ({ user, onSignOut }: IndexProps) => {
  const controller = useIndexPageController({ user, onSignOut });
  return <IndexView controller={controller} />;
};

export default Index;
