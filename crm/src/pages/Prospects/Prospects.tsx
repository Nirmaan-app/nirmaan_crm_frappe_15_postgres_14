import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { ConfigProvider, Menu, MenuProps } from "antd";
import { Plus } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Companies } from "./Companies/Companies";
import { Contacts } from "./Contacts/Contacts";

export const Prospects = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Sync state with URL parameter
  const [activeTab, setActiveTab] = useStateSyncedWithParams<"contact" | "company">(
    "tab", 
    "contact"
  );

  type MenuItem = Required<MenuProps>["items"][number];

  const items: MenuItem[] = useMemo(() => [
    {
      label: "Contact",
      key: "contact",
      style: { flex: 1, textAlign: "center" },
    },
    {
      label: "Company",
      key: "company",
      style: { flex: 1, textAlign: "center" },
    }
  ], []);

  const onClick: MenuProps["onClick"] = useCallback((e) => {
    if (activeTab === e.key) return;
    setActiveTab(e.key, ["id"]);
  }, [activeTab, setActiveTab]);

  const handleNewFormNav = useCallback(() => {
    navigate(activeTab === "contact" ? "new-contact" : "new-company");
  }, [activeTab, navigate]);

      return (
        <div className="w-full flex flex-col gap-4">
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  horizontalItemSelectedColor: "#D03B45",
                  itemSelectedColor: "#D03B45",
                  itemColor: theme === "dark" ? "white" : "black"
                },
              },
            }}
          >
            <Menu
              selectedKeys={[activeTab]}
              onClick={onClick}
              mode="horizontal"
              items={items}
              style={{ backgroundColor: "transparent", marginTop: "-1rem" }}
            />
          </ConfigProvider>

          <div className="flex flex-col gap-8 h-full relative">
            <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
            {activeTab === "contact" ? (
              <Contacts />
            ) : (
              <Companies />
            )}
          </div>

          <div className="fixed bottom-24 right-6">
            <button
              onClick={handleNewFormNav}
              className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center`}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
    )
}