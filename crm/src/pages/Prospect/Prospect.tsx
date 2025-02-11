import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ConfigProvider, Menu, MenuProps } from "antd"
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export const Prospect = () => {

    const [searchParams] = useSearchParams();
    const [activePage, setActivePage] = useState(searchParams.get("tab") || "contact");

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
        if (activePage === e.key) return;
        updateURL("tab", e.key);
        setActivePage(e.key);
      };


    return (
        <div className="w-full flex flex-col gap-4">
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  horizontalItemSelectedColor: "#D03B45",
                  itemSelectedBg: "#FFD3CC",
                  itemSelectedColor: "#D03B45",
                },
              },
            }}
          >
            <Menu
              selectedKeys={[activePage]}
              onClick={onClick}
              mode="horizontal"
              items={items}
              style={{ marginTop: "-1.5rem"}}
            />
          </ConfigProvider>

          <div className="flex flex-col gap-8 h-full relative">
            <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
            {activePage === "contact" ? (
               <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
               {Array.from({ length: 20 }, (_, i) => (
                 <>
                   <div key={i} className="h-12 px-4 flex items-start justify-between">
                    <div className="flex flex-col">
                        <strong className="text-black">Neelesh Kumar</strong>
                        <span>Incuspaze</span>
                    </div>
                     <ChevronRight />
                   </div>
                   {i !== 19 && <Separator />}
                 </>
               ))}
             </div>
            ) : (
              <div>Hello Customer</div>
            )}
          </div>
        </div>
    )
}