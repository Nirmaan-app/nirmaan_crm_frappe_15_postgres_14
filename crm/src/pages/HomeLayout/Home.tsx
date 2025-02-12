import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { BottomBar } from "./BottomBar";

export const HomeLayout = () => {

	return (
		<div className="flex flex-col h-screen">
			<NavBar />

			<main className="mt-10 mb-20 flex-1 overflow-y-auto px-3 py-4">
				<Outlet />
			</main>

			<BottomBar />
		</div>
	);
};
