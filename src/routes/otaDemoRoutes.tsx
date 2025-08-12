import OtaDemoLayout from "../pages/admin/ota-demo/OtaDemoLayout";
import OtaUpdateManager from "../pages/admin/ota-demo/OtaUpdateManager";
import OtaReports from "../pages/admin/ota-demo/OtaReports";

export const otaDemoRoute = {
  path: "/admin/ota-demo",
  element: <OtaDemoLayout />,
  children: [
    { index: true, element: <OtaUpdateManager /> },
    { path: "reports", element: <OtaReports /> }
  ]
};
