import { useViewport } from "@/hooks/useViewPort";
import React, { Suspense } from "react";
import { NewTaskForm } from "../Tasks/NewTaskForm";

export const AppLayout = () => {

	const {isMobile} = useViewport()

	const MobileLayout = React.lazy(() => import("./MobileLayout"));
	const DesktopLayout = React.lazy(() => import("./DesktopLayout"));

	// const isMobile = () => {
	// 	const userAgent = navigator.userAgent || navigator.vendor || window.opera;
	// 	return /Mobi|Android|BlackBerry|iPhone|iPad|iPod|Opera Mini/i.test(userAgent);
	// }

	// console.log("isMobile", isMobile())

	console.log("IssMobile",isMobile)
	console.log("IssMobile",isMobile)


	return (
		<>
			<Suspense fallback={<div>Loading...</div>}>
      	{isMobile ? <MobileLayout /> : <DesktopLayout />}
    	</Suspense>
			<NewTaskForm />
		</>
	);
};
