import { useTheme } from "@/components/ui/ThemeProvider";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { ConfigProvider, Menu, MenuProps } from "antd";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Companies } from "./Companies/Companies";
import { Contacts } from "./Contacts/Contacts";

export const DesktopProspects = () => {

    const {theme} = useTheme()
    const [activeTab, setActiveTab] = useStateSyncedWithParams<"contact" | "company">(
        "tab", 
        "contact"
      );
    const navigate = useNavigate()

    type MenuItem = Required<MenuProps>["items"][number];

    const items: MenuItem[] = [
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
    ];

    // useEffect(() => {
    //   if(!searchParams.get("tab")) {
    //     setSearchParams({tab: "contact"})
    //   }
    // }, [])

    const onClick: MenuProps["onClick"] = useCallback((e) => {
      if (activeTab === e.key) return;
      setActiveTab(e.key, ["id", "innerTab"]);
    }, [activeTab, setActiveTab]);

    const handleNewFormNav = useCallback(() => {
      navigate(activeTab === "contact" ? "/prospects/new-contact?tab=contact" : "/prospects/new-company?tab=company");
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

          <div className="flex flex-col gap-8 h-full relative px-4">
            <button onClick={handleNewFormNav} className="flex items-center justify-center border border-primary rounded-lg p-6 text-primary">
              <Plus className="w-4 h-4" />
              <span className="">{activeTab=== "contact" ? "New Contact" : "New Company"}</span>
            </button>
            {activeTab === "contact" ? (
              <Contacts />
            ) : (
              <Companies />
            )}
          </div>
        </div>
    )
}