import { Input } from "@/components/ui/input";
import { ConfigProvider, Menu, MenuProps } from "antd"
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Contacts } from "./Contacts/Contacts";
import { Companies } from "./Companies/Companies";
import { useTheme } from "@/components/ui/ThemeProvider";
import { Plus } from "lucide-react";

export const Prospect = () => {

    const {theme} = useTheme()
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "contact");
    const navigate = useNavigate()

    type MenuItem = Required<MenuProps>["items"][number];

    const updateURL = (key, value) => {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, "", url);
    };

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

    const onClick: MenuProps["onClick"] = (e) => {
        if (activeTab === e.key) return;
        updateURL("tab", e.key);
        setActiveTab(e.key);
    };

    const handleNewFormNav = () => {
      if(activeTab === "contact") {
        navigate("new-contact")
      } else {
        navigate("new-company")
      }
    }


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