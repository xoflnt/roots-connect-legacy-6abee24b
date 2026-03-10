import { AppHeader } from "@/components/AppHeader";
import { FamilyTree } from "@/components/FamilyTree";

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-hidden">
        <FamilyTree />
      </main>
    </div>
  );
};

export default Index;
